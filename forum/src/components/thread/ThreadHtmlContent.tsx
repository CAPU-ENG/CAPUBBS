import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchSignatureReferencedFloorHtml } from '../../api/thread';
import { renderForumMarkup, requiresIsolatedForumHtml } from '../../utils/forumMarkup';
import { findSignatureFloorMarkers } from '../../utils/signatureFloorLink';
import { ForumMarkup, type ForumMarkupImage } from './ForumMarkup';

const MIN_SIGNATURE_FRAME_HEIGHT = 28;
const MIN_FLOOR_FRAME_HEIGHT = 64;
const MAX_FRAME_HEIGHT = 50_000;
const HTML_FRAME_MESSAGE_SOURCE = 'capubbs-thread-html-frame';

type ThreadHtmlVariant = 'floor' | 'signature';

type HtmlFrameMessage = {
  frameId: string;
  height: number;
  source: typeof HTML_FRAME_MESSAGE_SOURCE;
  type: 'resize';
};

export function ThreadHtmlContent({
  className = '',
  floor,
  html,
  onImageOpen,
  variant,
}: {
  className?: string;
  floor: number;
  html: string;
  onImageOpen?: (image: ForumMarkupImage, trigger: HTMLImageElement) => void;
  variant: ThreadHtmlVariant;
}) {
  const resolvedHtml = useSignaturePostReferences(html, variant === 'signature');
  const directHtml = useMemo(
    () => renderForumMarkup(resolvedHtml, { normalizeLegacyLineBreaks: variant === 'signature' }),
    [resolvedHtml, variant],
  );

  if (!requiresIsolatedForumHtml(resolvedHtml)) {
    return (
      <ForumMarkup
        className={className}
        html={directHtml}
        onImageOpen={onImageOpen}
        variant={variant}
      />
    );
  }

  return (
    <ThreadSandboxedHtmlFrame
      className={className}
      floor={floor}
      html={resolvedHtml}
      variant={variant}
    />
  );
}

function ThreadSandboxedHtmlFrame({
  className,
  floor,
  html,
  variant,
}: {
  className: string;
  floor: number;
  html: string;
  variant: ThreadHtmlVariant;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameIdRef = useRef(`${variant}-${floor}-${Math.random().toString(36).slice(2)}`);
  const minHeight = variant === 'signature' ? MIN_SIGNATURE_FRAME_HEIGHT : MIN_FLOOR_FRAME_HEIGHT;
  const [frameHeight, setFrameHeight] = useState(minHeight);
  const isDarkTheme = useDarkTheme();
  const frameDocument = useMemo(() => buildHtmlFrameDocument({
    frameId: frameIdRef.current,
    html,
    isDarkTheme,
    variant,
  }), [html, isDarkTheme, variant]);
  const frameSource = useMemo(
    () => `data:text/html;charset=utf-8,${encodeURIComponent(frameDocument)}`,
    [frameDocument],
  );

  useEffect(() => {
    setFrameHeight(minHeight);
  }, [frameSource, minHeight]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow || !isHtmlFrameMessage(event.data)) return;
      if (event.data.frameId !== frameIdRef.current) return;

      setFrameHeight(Math.min(
        MAX_FRAME_HEIGHT,
        Math.max(minHeight, Math.ceil(event.data.height)),
      ));
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [minHeight]);

  return (
    <iframe
      ref={iframeRef}
      className={`thread-html-frame thread-html-frame-${variant} ${className}`.trim()}
      referrerPolicy="no-referrer"
      sandbox="allow-scripts allow-same-origin"
      src={frameSource}
      style={{ height: frameHeight }}
      title={variant === 'signature' ? `第 ${floor} 楼签名档` : `第 ${floor} 楼正文`}
    />
  );
}

function useSignaturePostReferences(html: string, enabled: boolean) {
  const [resolvedHtml, setResolvedHtml] = useState(html);

  useEffect(() => {
    const controller = new AbortController();
    const markers = enabled ? findSignatureFloorMarkers(html) : [];

    setResolvedHtml(html);
    if (markers.length === 0) return () => controller.abort();

    const uniqueReferences = Array.from(new Map(markers.map((marker) => [
      `${marker.bid}:${marker.tid}:${marker.pid}`,
      marker,
    ])).values());

    void Promise.all(uniqueReferences.map(async (reference) => {
      try {
        const content = await fetchSignatureReferencedFloorHtml(reference, controller.signal);
        return [`${reference.bid}:${reference.tid}:${reference.pid}`, content] as const;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') throw error;
        return [`${reference.bid}:${reference.tid}:${reference.pid}`, ''] as const;
      }
    })).then((entries) => {
      if (controller.signal.aborted) return;
      const contentByReference = new Map(entries);
      let nextHtml = html;

      markers.forEach((marker) => {
        const content = contentByReference.get(`${marker.bid}:${marker.tid}:${marker.pid}`);
        if (content) nextHtml = nextHtml.replace(marker.marker, content);
      });
      setResolvedHtml(nextHtml);
    }).catch(() => undefined);

    return () => controller.abort();
  }, [enabled, html]);

  return resolvedHtml;
}

function buildHtmlFrameDocument({
  frameId,
  html,
  isDarkTheme,
  variant,
}: {
  frameId: string;
  html: string;
  isDarkTheme: boolean;
  variant: ThreadHtmlVariant;
}) {
  const isSignature = variant === 'signature';
  const color = isDarkTheme
    ? (isSignature ? 'rgb(161 161 170)' : 'rgb(228 228 231)')
    : (isSignature ? 'rgb(113 113 122)' : 'rgb(63 63 70)');
  const linkColor = isDarkTheme ? 'rgb(125 211 252)' : 'rgb(3 105 161)';
  const fontSize = isSignature ? '13.76px' : '14.72px';

  return `<!doctype html>
<html style="background:transparent;color-scheme:${isDarkTheme ? 'dark' : 'light'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${escapeHtmlAttribute(getLegacyContentBaseUrl())}">
  <meta http-equiv="Content-Security-Policy" content="${buildContentSecurityPolicy()}">
  <style>
    html,body{margin:0;padding:0;min-height:0;background:transparent!important;color:${color};font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:${fontSize};line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    body{display:flow-root}a{color:${linkColor}}img,video,canvas,svg,iframe{max-width:100%;height:auto}pre{max-width:100%;overflow:auto;white-space:pre-wrap}table{max-width:100%}
  </style>
  <script>${buildFrameBridgeScript(frameId)}</script>
  <script src="/bbs/lib/jquery.min.js"></script>
</head>
<body>${deferUserScripts(html)}</body>
</html>`;
}

function buildFrameBridgeScript(frameId: string) {
  return `(function(){
    var frameId=${JSON.stringify(frameId)};
    var queued=false;
    function sendHeight(){
      queued=false;
      var body=document.body;
      var root=document.documentElement;
      var height=Math.max(body?body.scrollHeight:0,root?root.scrollHeight:0);
      window.parent.postMessage({source:'${HTML_FRAME_MESSAGE_SOURCE}',type:'resize',frameId:frameId,height:height},'*');
    }
    function queueHeight(){
      if(queued)return;
      queued=true;
      window.requestAnimationFrame(sendHeight);
    }
    function executeUserScripts(){
      Array.prototype.slice.call(document.querySelectorAll('script[type="text/capubbs-user-script"]')).forEach(function(script){
        var executable=document.createElement('script');
        Array.prototype.forEach.call(script.attributes,function(attribute){
          if(attribute.name!=='type')executable.setAttribute(attribute.name,attribute.value);
        });
        executable.text=script.text||script.textContent||'';
        script.parentNode.replaceChild(executable,script);
      });
    }
    function init(){
      if(window.ResizeObserver)new ResizeObserver(queueHeight).observe(document.body);
      if(window.MutationObserver)new MutationObserver(queueHeight).observe(document.body,{attributes:true,characterData:true,childList:true,subtree:true});
      Array.prototype.forEach.call(document.images,function(image){image.addEventListener('load',queueHeight);image.addEventListener('error',queueHeight);});
      window.addEventListener('load',queueHeight);
      document.addEventListener('transitionend',queueHeight);
      document.addEventListener('animationend',queueHeight);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(queueHeight);
      executeUserScripts();
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`;
}

function deferUserScripts(html: string) {
  return html.replace(/<script\b([^>]*)>/gi, (_match, rawAttributes: string) => {
    const attributes = rawAttributes.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    return `<script${attributes} type="text/capubbs-user-script">`;
  });
}

function buildContentSecurityPolicy() {
  return [
    "default-src 'none'",
    "script-src 'unsafe-inline' http: https: data: blob:",
    "style-src 'unsafe-inline' http: https:",
    'img-src http: https: data: blob:',
    'media-src http: https: data: blob:',
    'font-src http: https: data: blob:',
    'frame-src http: https: data: blob:',
    'child-src http: https: data: blob:',
    "connect-src 'none'",
    "object-src 'none'",
    "form-action 'none'",
  ].join('; ');
}

function getLegacyContentBaseUrl() {
  return new URL('/bbs/content/', window.location.origin).href;
}

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function isHtmlFrameMessage(value: unknown): value is HtmlFrameMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<HtmlFrameMessage>;
  return message.source === HTML_FRAME_MESSAGE_SOURCE
    && message.type === 'resize'
    && typeof message.frameId === 'string'
    && typeof message.height === 'number'
    && Number.isFinite(message.height);
}

function useDarkTheme() {
  const [isDarkTheme, setIsDarkTheme] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDarkTheme(root.classList.contains('dark'));
    const observer = new MutationObserver(update);
    observer.observe(root, { attributeFilter: ['class'], attributes: true });
    return () => observer.disconnect();
  }, []);

  return isDarkTheme;
}
