import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { fetchSignatureReferencedFloorHtml } from '../../api/thread';
import {
  renderForumMarkup,
  requiresIsolatedForumHtml,
  translateLegacyForumMarkup,
  type SafeForumHtml,
} from '../../utils/forumMarkup';
import { useForumContentFontSize } from '../../hooks/useForumContentFontSize';
import { FORUM_LOCATION_CHANGE_EVENT } from '../../utils/authRoutes';
import { FORUM_BASE_PATH } from '../../utils/forumBasePath';
import {
  FORUM_APP_EXACT_PATHS,
  FORUM_APP_PATH_PREFIXES,
  LEGACY_FORUM_EXACT_PATHS,
  LEGACY_FORUM_PATH_PATTERNS,
  resolveForumAppRoute,
} from '../../utils/forumNavigation';
import { getThreadFloorElement, getThreadFloorFromHash } from '../../utils/threadRoutes';
import {
  findSignatureFloorMarkers,
  replaceLegacySignatureFloorScripts,
} from '../../utils/signatureFloorLink';
import frameStylesheet from '../../styles/thread-html-frame.css?inline';
import {
  ForumMarkup,
  type ForumMarkupImageChangeHandler,
  type ForumMarkupImage,
  type ForumMarkupImageOpenHandler,
} from './ForumMarkup';

const MIN_SIGNATURE_FRAME_HEIGHT = 28;
const MIN_FLOOR_FRAME_HEIGHT = 64;
const MAX_FRAME_HEIGHT = 50_000;
const FRAME_BOTTOM_GUARD = 30;
const FRAME_WIDTH_ALLOWANCE = 30;
const HTML_FRAME_MESSAGE_SOURCE = 'capubbs-thread-html-frame';
const JQUERY_SOURCE_URL = new URL('/bbs/lib/jquery.min.js', window.location.origin).href;
const HTML_FRAME_STYLES = escapeInlineStyleText(frameStylesheet);

let jquerySourcePromise: Promise<string | null> | null = null;

type ThreadHtmlVariant = 'floor' | 'signature';

type HtmlFrameMessage = {
  frameId: string;
  height: number;
  source: typeof HTML_FRAME_MESSAGE_SOURCE;
  type: 'resize';
} | {
  frameId: string;
  offsetTop: number;
  source: typeof HTML_FRAME_MESSAGE_SOURCE;
  type: 'anchor';
} | {
  frameId: string;
  source: typeof HTML_FRAME_MESSAGE_SOURCE;
  text: string;
  type: 'selection';
} | {
  frameId: string;
  source: typeof HTML_FRAME_MESSAGE_SOURCE;
  type: 'navigate';
  url: string;
} | {
  frameId: string;
  source: typeof HTML_FRAME_MESSAGE_SOURCE;
  type: 'jquery-request';
} | {
  frameId: string;
  imageIndex: number;
  images: ForumMarkupImage[];
  source: typeof HTML_FRAME_MESSAGE_SOURCE;
  type: 'image-open';
};

export function ThreadHtmlContent({
  className = '',
  floor,
  html,
  isActivitySignupCanceled = false,
  onImageOpen,
  onIsolatedTextSelection,
  variant,
}: {
  className?: string;
  floor: number;
  html: string;
  isActivitySignupCanceled?: boolean;
  onImageOpen?: ForumMarkupImageOpenHandler;
  onIsolatedTextSelection?: (text: string) => void;
  variant: ThreadHtmlVariant;
}) {
  const signatureHtml = useMemo(
    () => variant === 'signature' ? replaceLegacySignatureFloorScripts(html) : html,
    [html, variant],
  );
  const resolvedHtml = useSignaturePostReferences(signatureHtml, variant === 'signature');
  const shouldIsolate = requiresIsolatedForumHtml(resolvedHtml);
  const directHtml = useMemo<SafeForumHtml | null>(
    () => shouldIsolate ? null : renderForumMarkup(resolvedHtml, { normalizeLegacyLineBreaks: variant === 'signature' }),
    [resolvedHtml, shouldIsolate, variant],
  );
  const isolatedHtml = useMemo(
    () => translateLegacyForumMarkup(resolvedHtml),
    [resolvedHtml],
  );

  if (!shouldIsolate && directHtml !== null) {
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
      html={isolatedHtml}
      isActivitySignupCanceled={isActivitySignupCanceled}
      onImageOpen={onImageOpen}
      onTextSelection={onIsolatedTextSelection}
      variant={variant}
    />
  );
}

function ThreadSandboxedHtmlFrame({
  className,
  floor,
  html,
  isActivitySignupCanceled,
  onImageOpen,
  onTextSelection,
  variant,
}: {
  className: string;
  floor: number;
  html: string;
  isActivitySignupCanceled: boolean;
  onImageOpen?: ForumMarkupImageOpenHandler;
  onTextSelection?: (text: string) => void;
  variant: ThreadHtmlVariant;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameIdRef = useRef(`${variant}-${floor}-${Math.random().toString(36).slice(2)}`);
  const onImageOpenRef = useRef(onImageOpen);
  onImageOpenRef.current = onImageOpen;
  const onTextSelectionRef = useRef(onTextSelection);
  onTextSelectionRef.current = onTextSelection;
  const minHeight = variant === 'signature' ? MIN_SIGNATURE_FRAME_HEIGHT : MIN_FLOOR_FRAME_HEIGHT;
  const canOpenImages = Boolean(onImageOpen);
  const [frameHeight, setFrameHeight] = useState<number | null>(null);
  const isDarkTheme = useDarkTheme();
  const initialDarkThemeRef = useRef(isDarkTheme);
  const forumContentFontSize = useForumContentFontSize();
  const frameFontSize = variant === 'signature' ? 14 : forumContentFontSize;
  const deferredHtml = useMemo(() => deferUserScripts(html), [html]);
  const hasUserScripts = deferredHtml.includes('type="text/capubbs-user-script"');
  const frameDocument = useMemo(() => buildHtmlFrameDocument({
    canOpenImages,
    frameId: frameIdRef.current,
    hasUserScripts,
    html: deferredHtml,
    isActivitySignupCanceled,
    isDarkTheme: initialDarkThemeRef.current,
    fontSize: frameFontSize,
    variant,
  }), [canOpenImages, deferredHtml, frameFontSize, hasUserScripts, isActivitySignupCanceled, variant]);
  const frameSource = useMemo(
    () => `data:text/html;charset=utf-8,${encodeURIComponent(frameDocument)}`,
    [frameDocument],
  );
  const syncFrameTheme = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({
      frameId: frameIdRef.current,
      source: HTML_FRAME_MESSAGE_SOURCE,
      theme: isDarkTheme ? 'dark' : 'light',
      type: 'theme',
    }, '*');
  }, [isDarkTheme]);
  const sendJquerySource = useCallback((frameWindow = iframeRef.current?.contentWindow) => {
    if (!hasUserScripts || !frameWindow) return;
    void loadJquerySource().then((jquerySource) => {
      if (iframeRef.current?.contentWindow !== frameWindow) return;
      frameWindow.postMessage({
        frameId: frameIdRef.current,
        jquerySource,
        source: HTML_FRAME_MESSAGE_SOURCE,
        type: 'jquery-response',
      }, '*');
    });
  }, [hasUserScripts]);
  const handleFrameLoad = useCallback(() => {
    syncFrameTheme();
    sendJquerySource();
  }, [sendJquerySource, syncFrameTheme]);

  useEffect(() => {
    setFrameHeight(null);
  }, [frameSource]);

  useEffect(() => {
    syncFrameTheme();
  }, [syncFrameTheme]);

  useEffect(() => {
    if (hasUserScripts) void loadJquerySource();
  }, [hasUserScripts]);

  useLayoutEffect(() => {
    function handleMessage(event: MessageEvent) {
      const frameWindow = iframeRef.current?.contentWindow;
      if (!frameWindow || event.source !== frameWindow || !isHtmlFrameMessage(event.data)) return;
      if (event.data.frameId !== frameIdRef.current) return;

      if (event.data.type === 'jquery-request') {
        sendJquerySource(frameWindow);
        return;
      }

      if (event.data.type === 'anchor') {
        const frame = iframeRef.current;
        if (!frame) return;
        const rootStyle = window.getComputedStyle(document.documentElement);
        const topbarHeight = Number.parseFloat(rootStyle.getPropertyValue('--topbar-height')) || 0;
        const frameTop = window.scrollY + frame.getBoundingClientRect().top;
        window.scrollTo({
          left: 0,
          top: Math.max(0, frameTop + event.data.offsetTop - topbarHeight - 16),
        });
        return;
      }

      if (event.data.type === 'navigate') {
        const route = resolveForumAppRoute(event.data.url, getLegacyContentBaseUrl());
        if (!route) return;

        window.history.pushState(null, '', route);
        window.dispatchEvent(new Event(FORUM_LOCATION_CHANGE_EVENT));
        const targetUrl = new URL(route, window.location.origin);
        if (!targetUrl.hash) window.scrollTo({ left: 0, top: 0 });
        else {
          window.requestAnimationFrame(() => {
            const hashTarget = decodeURIComponent(targetUrl.hash.slice(1));
            const floor = getThreadFloorFromHash(`#${hashTarget}`);
            (floor ? getThreadFloorElement(floor) : document.getElementById(hashTarget))
              ?.scrollIntoView({ block: 'start' });
          });
        }
        return;
      }

      if (event.data.type === 'image-open') {
        const frame = iframeRef.current;
        if (!frame) return;
        const syncImage: ForumMarkupImageChangeHandler = (imageIndex) => {
          const image = event.data.images[imageIndex];
          if (
            !image
            || typeof image.galleryId !== 'number'
            || !Number.isSafeInteger(image.galleryIndex)
          ) return;
          frame.contentWindow?.postMessage({
            frameId: frameIdRef.current,
            galleryId: image.galleryId,
            galleryIndex: image.galleryIndex,
            source: HTML_FRAME_MESSAGE_SOURCE,
            type: 'gallery-select',
          }, '*');
        };
        onImageOpenRef.current?.(
          event.data.images,
          event.data.imageIndex,
          frame,
          syncImage,
        );
        return;
      }

      if (event.data.type === 'selection') {
        if (event.data.text) window.getSelection()?.removeAllRanges();
        onTextSelectionRef.current?.(event.data.text);
        return;
      }

      setFrameHeight(Math.min(
        MAX_FRAME_HEIGHT,
        Math.max(minHeight, Math.ceil(event.data.height)),
      ));
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [minHeight, sendJquerySource]);

  return (
    <iframe
      ref={iframeRef}
      className={`thread-html-frame thread-html-frame-${variant} ${className}`.trim()}
      referrerPolicy="no-referrer"
      sandbox="allow-scripts allow-same-origin allow-downloads"
      scrolling="no"
      src={frameSource}
      onLoad={handleFrameLoad}
      style={{
        '--thread-html-frame-width-allowance': `${FRAME_WIDTH_ALLOWANCE}px`,
        ...(frameHeight === null ? {} : { '--thread-html-frame-height': `${frameHeight}px` }),
      } as CSSProperties}
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
  canOpenImages,
  frameId,
  fontSize,
  hasUserScripts,
  html,
  isActivitySignupCanceled,
  isDarkTheme,
  variant,
}: {
  canOpenImages: boolean;
  frameId: string;
  fontSize: number;
  hasUserScripts: boolean;
  html: string;
  isActivitySignupCanceled: boolean;
  isDarkTheme: boolean;
  variant: ThreadHtmlVariant;
}) {
  const isSignature = variant === 'signature';
  const lightColor = isSignature ? '#999999' : 'rgb(63 63 70)';
  const darkColor = isSignature ? '#666666' : 'rgb(228 228 231)';
  const fontFamily = isSignature
    ? 'monospace'
    : "'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif";
  const signatureRootStyle = isSignature
    ? 'padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;'
    : '';
  const canceledClassName = isActivitySignupCanceled ? ' capubbs-activity-signup-canceled' : '';

  return `<!doctype html>
<html class="${isDarkTheme ? 'dark' : 'light'}" style="background:transparent;color-scheme:${isDarkTheme ? 'dark' : 'light'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${escapeHtmlAttribute(getLegacyContentBaseUrl())}">
  <meta http-equiv="Content-Security-Policy" content="${buildContentSecurityPolicy()}">
  <style>${HTML_FRAME_STYLES}</style>
  <style>
    html{--capubbs-frame-text-color:${lightColor}}html.dark{--capubbs-frame-text-color:${darkColor}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${fontFamily};font-size:${fontSize}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${FRAME_WIDTH_ALLOWANCE}px);${signatureRootStyle}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${buildFrameBridgeScript(frameId, canOpenImages, hasUserScripts)}</script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${variant}${canceledClassName}">${html}</main></body>
</html>`;
}

function buildFrameBridgeScript(frameId: string, canOpenImages: boolean, hasUserScripts: boolean) {
  return `(function(){
    var frameId=${JSON.stringify(frameId)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(FORUM_BASE_PATH)};
    var canOpenImages=${JSON.stringify(canOpenImages)};
    var hasUserScripts=${JSON.stringify(hasUserScripts)};
    var jquerySourceUrl=${JSON.stringify(JQUERY_SOURCE_URL)};
    var forumAppExactPaths=${JSON.stringify(FORUM_APP_EXACT_PATHS)};
    var forumAppPathPrefixes=${JSON.stringify(FORUM_APP_PATH_PREFIXES)};
    var legacyForumExactPaths=${JSON.stringify(LEGACY_FORUM_EXACT_PATHS)};
    var legacyForumPathPatterns=${JSON.stringify(LEGACY_FORUM_PATH_PATTERNS)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${FRAME_BOTTOM_GUARD};
    var queued=false;
    var selectionQueued=false;
    var lastSelectionText='';
    var userScriptsExecuted=false;
    var grayscaleNamedColors={black:0,darkgray:169,darkgrey:169,dimgray:105,dimgrey:105,gainsboro:220,gray:128,grey:128,lightgray:211,lightgrey:211,silver:192,white:255,whitesmoke:245};
    var originalColorAttribute='data-capubbs-original-grayscale-color-attr';
    var originalStyleColorAttribute='data-capubbs-original-grayscale-style-color';
    var syncingGrayscaleTextColors=false;
    function parseGrayscaleTextColor(value){
      var colorText=String(value==null?'':value).trim().toLowerCase().replace(/^['"]|['"]$/g,'');
      var compactColorText=colorText.replace(/\\s+/g,'');
      var namedChannel=grayscaleNamedColors[compactColorText];
      if(typeof namedChannel==='number')return {alpha:1,channel:namedChannel};
      var hexMatch=compactColorText.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
      if(hexMatch){
        var rawHex=hexMatch[1];
        var hex=rawHex.length<=4?rawHex.split('').map(function(character){return character+character;}).join(''):rawHex;
        var red=parseInt(hex.slice(0,2),16);
        var green=parseInt(hex.slice(2,4),16);
        var blue=parseInt(hex.slice(4,6),16);
        var hexAlpha=hex.length===8?parseInt(hex.slice(6,8),16)/255:1;
        return red===green&&green===blue?{alpha:hexAlpha,channel:red}:null;
      }
      var rgbMatch=colorText.match(/^rgba?\\(\\s*(\\d{1,3}(?:\\.\\d+)?%?)(?:\\s*,\\s*|\\s+)(\\d{1,3}(?:\\.\\d+)?%?)(?:\\s*,\\s*|\\s+)(\\d{1,3}(?:\\.\\d+)?%?)(?:\\s*(?:,|\\/)\\s*([01](?:\\.\\d+)?|\\.\\d+|100%|\\d{1,3}(?:\\.\\d+)?%))?\\s*\\)$/);
      if(!rgbMatch)return null;
      function parseRgbChannel(channelValue){
        var isPercent=channelValue.endsWith('%');
        var channel=Number(isPercent?channelValue.slice(0,-1):channelValue);
        if(!Number.isFinite(channel))return null;
        if(isPercent)return channel>=0&&channel<=100?Math.round(channel*2.55):null;
        return channel>=0&&channel<=255?Math.round(channel):null;
      }
      function parseAlphaChannel(alphaValue){
        if(alphaValue===undefined)return 1;
        var isPercent=alphaValue.endsWith('%');
        var alpha=Number(isPercent?alphaValue.slice(0,-1):alphaValue);
        if(!Number.isFinite(alpha))return null;
        if(isPercent)return alpha>=0&&alpha<=100?alpha/100:null;
        return alpha>=0&&alpha<=1?alpha:null;
      }
      var redChannel=parseRgbChannel(rgbMatch[1]);
      var greenChannel=parseRgbChannel(rgbMatch[2]);
      var blueChannel=parseRgbChannel(rgbMatch[3]);
      var alpha=parseAlphaChannel(rgbMatch[4]);
      if(redChannel===null||greenChannel===null||blueChannel===null||alpha===null)return null;
      return redChannel===greenChannel&&greenChannel===blueChannel?{alpha:alpha,channel:redChannel}:null;
    }
    function invertGrayscaleTextColor(value,allowAlpha){
      var grayscaleColor=parseGrayscaleTextColor(value);
      if(!grayscaleColor)return '';
      var invertedChannel=255-grayscaleColor.channel;
      if(allowAlpha&&grayscaleColor.alpha<1)return 'rgba('+invertedChannel+', '+invertedChannel+', '+invertedChannel+', '+Number(grayscaleColor.alpha.toFixed(3))+')';
      var hex=invertedChannel.toString(16).padStart(2,'0');
      return '#'+hex+hex+hex;
    }
    function syncGrayscaleTextColors(root){
      if(syncingGrayscaleTextColors)return;
      syncingGrayscaleTextColors=true;
      try{
        var dark=document.documentElement.classList.contains('dark');
        var scope=root&&root.querySelectorAll?root:document;
        var elements=Array.prototype.slice.call(scope.querySelectorAll('[color], [style], ['+originalColorAttribute+'], ['+originalStyleColorAttribute+']'));
        if(scope.nodeType===1&&(scope.matches('[color], [style], ['+originalColorAttribute+'], ['+originalStyleColorAttribute+']')))elements.unshift(scope);
        elements.forEach(function(element){
          var originalAttributeColor=element.getAttribute(originalColorAttribute);
          if(!dark&&originalAttributeColor!==null){
            element.setAttribute('color',originalAttributeColor);
            element.removeAttribute(originalColorAttribute);
          }else if(dark){
            var attributeSource=originalAttributeColor!==null?originalAttributeColor:element.getAttribute('color');
            var invertedAttributeColor=invertGrayscaleTextColor(attributeSource,false);
            if(invertedAttributeColor&&attributeSource!==null){
              if(originalAttributeColor===null)element.setAttribute(originalColorAttribute,attributeSource);
              if(element.getAttribute('color')!==invertedAttributeColor)element.setAttribute('color',invertedAttributeColor);
            }
          }
          if(!element.style||!element.style.getPropertyValue)return;
          var originalStyleColor=element.getAttribute(originalStyleColorAttribute);
          if(!dark&&originalStyleColor!==null){
            element.style.setProperty('color',originalStyleColor,element.style.getPropertyPriority('color'));
            element.removeAttribute(originalStyleColorAttribute);
          }else if(dark){
            var styleSource=originalStyleColor!==null?originalStyleColor:element.style.getPropertyValue('color');
            var invertedStyleColor=invertGrayscaleTextColor(styleSource,true);
            if(invertedStyleColor&&styleSource){
              if(originalStyleColor===null)element.setAttribute(originalStyleColorAttribute,styleSource);
              if(element.style.getPropertyValue('color')!==invertedStyleColor)element.style.setProperty('color',invertedStyleColor,element.style.getPropertyPriority('color'));
            }
          }
        });
      }finally{syncingGrayscaleTextColors=false;}
    }
    function getContentHeight(){
      var contentRoot=document.querySelector('.capubbs-html-frame-root');
      if(!contentRoot)return 0;
      var rect=contentRoot.getBoundingClientRect?contentRoot.getBoundingClientRect():null;
      var measured=Math.max(contentRoot.scrollHeight||0,contentRoot.offsetHeight||0,rect?Math.ceil(rect.height):0);
      if(!measured)return 0;
      var style=window.getComputedStyle?window.getComputedStyle(contentRoot):null;
      var fontSize=parseFloat(style&&style.fontSize?style.fontSize:'');
      var guard=Math.max(minBottomGuard,Number.isFinite(fontSize)?Math.ceil(fontSize*0.5):0);
      return measured+guard;
    }
    function sendHeight(){
      queued=false;
      var height=getContentHeight();
      window.parent.postMessage({source:'${HTML_FRAME_MESSAGE_SOURCE}',type:'resize',frameId:frameId,height:height},'*');
    }
    function queueHeight(){
      if(queued)return;
      queued=true;
      window.setTimeout(sendHeight,0);
    }
    function sendSelection(){
      selectionQueued=false;
      var selection=window.getSelection?window.getSelection():null;
      var text=selection?selection.toString().trim():'';
      if(text===lastSelectionText)return;
      lastSelectionText=text;
      window.parent.postMessage({source:'${HTML_FRAME_MESSAGE_SOURCE}',type:'selection',frameId:frameId,text:text},'*');
    }
    function queueSelection(){
      if(selectionQueued)return;
      selectionQueued=true;
      window.requestAnimationFrame(sendSelection);
    }
    function executeUserScripts(){
      if(userScriptsExecuted)return;
      userScriptsExecuted=true;
      Array.prototype.slice.call(document.querySelectorAll('script[type="text/capubbs-user-script"]')).forEach(function(script){
        var executable=document.createElement('script');
        Array.prototype.forEach.call(script.attributes,function(attribute){
          if(attribute.name!=='type')executable.setAttribute(attribute.name,attribute.value);
        });
        executable.text=script.text||script.textContent||'';
        script.parentNode.replaceChild(executable,script);
      });
    }
    function loadJqueryAndExecuteUserScripts(jquerySource){
      if(userScriptsExecuted)return;
      var jquery=document.createElement('script');
      if(typeof jquerySource==='string'&&jquerySource){
        jquery.text=jquerySource;
        document.head.appendChild(jquery);
        executeUserScripts();
        return;
      }
      jquery.src=jquerySourceUrl;
      jquery.addEventListener('load',executeUserScripts,{once:true});
      jquery.addEventListener('error',executeUserScripts,{once:true});
      document.head.appendChild(jquery);
    }
    function getForumNavigationUrl(target){
      var anchor=target&&target.closest?target.closest('a'):null;
      if(!anchor)return '';
      var href=anchor.getAttribute('href');
      if(!href||href.charAt(0)==='#'||anchor.hasAttribute('download'))return '';
      try{
        var url=new URL(href,document.baseURI);
        var host=url.hostname.toLowerCase();
        var trusted=url.origin===forumOrigin||host==='chexie.net'||host.endsWith('.chexie.net');
        var path=url.pathname.replace(/\\/{2,}/g,'/').replace(/\\/+$/,'')||'/';
        var appPath=path===forumBasePath?'/':path.indexOf(forumBasePath+'/')===0?path.slice(forumBasePath.length):path;
        appPath=appPath.replace(/^\\/(?:bbs-new|capubbs-new)(?=\\/)/,'');
        var appRoute=forumAppExactPaths.indexOf(appPath)>=0||forumAppPathPrefixes.some(function(prefix){return appPath.indexOf(prefix)===0;});
        var legacyRoute=legacyForumExactPaths.indexOf(path)>=0||legacyForumExactPaths.indexOf(appPath)>=0||legacyForumPathPatterns.some(function(pattern){return pattern.test(path)||pattern.test(appPath);});
        return trusted&&(appRoute||legacyRoute)?url.href:'';
      }catch(error){return '';}
    }
    function handleForumNavigationClick(event){
      if(event.defaultPrevented||event.button!==0)return;
      var anchor=event.target&&event.target.closest?event.target.closest('a'):null;
      var href=anchor&&anchor.getAttribute('href');
      if(href&&href.charAt(0)==='#'){
        event.preventDefault();
        var rawId=href.slice(1);
        if(!rawId)return;
        var id=rawId;
        try{id=decodeURIComponent(rawId);}catch(error){}
        var target=document.getElementById(id);
        if(!target){
          var namedTargets=document.getElementsByName(id);
          target=namedTargets&&namedTargets.length?namedTargets[0]:null;
        }
        if(!target)return;
        var targetRect=target.getBoundingClientRect();
        var offsetTop=Math.max(0,Math.round((window.scrollY||0)+targetRect.top));
        window.parent.postMessage({source:'${HTML_FRAME_MESSAGE_SOURCE}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${HTML_FRAME_MESSAGE_SOURCE}',type:'navigate',frameId:frameId,url:url},'*');
    }
    function getTargetImage(target){
      var image=target&&target.closest?target.closest('img'):null;
      return image&&image.tagName==='IMG'?image:null;
    }
    function openImage(image){
      if(!canOpenImages||!image)return;
      var imageElements=Array.prototype.slice.call(document.querySelectorAll('.capubbs-html-frame-root img'));
      var imageIndex=imageElements.indexOf(image);
      if(imageIndex<0)return;
      var images=imageElements.map(function(candidate){
        var item={alt:(candidate.alt||'').trim(),src:candidate.currentSrc||candidate.src||''};
        var gallery=candidate.closest?candidate.closest('.capubbs-gallery'):null;
        if(gallery){
          var galleries=Array.prototype.slice.call(document.querySelectorAll('.capubbs-html-frame-root .capubbs-gallery'));
          var galleryId=galleries.indexOf(gallery);
          var galleryImages=Array.prototype.slice.call(gallery.querySelectorAll('[data-capubbs-gallery-slide="true"] img'));
          var galleryIndex=galleryImages.indexOf(candidate);
          if(galleryId>=0&&galleryIndex>=0){
            item.galleryId=galleryId;
            item.galleryIndex=galleryIndex;
          }
        }
        return item;
      });
      window.parent.postMessage({source:'${HTML_FRAME_MESSAGE_SOURCE}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
    }
    function handleImageClick(event){
      if(event.defaultPrevented||event.button!==0||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var image=getTargetImage(event.target);
      if(!image||!canOpenImages)return;
      event.preventDefault();
      openImage(image);
    }
    function handleImageKeyDown(event){
      if(event.defaultPrevented||(event.key!=='Enter'&&event.key!==' '))return;
      var image=getTargetImage(event.target);
      if(!image||!canOpenImages)return;
      event.preventDefault();
      openImage(image);
    }
    function markImageLoaded(image){
      if(image.getAttribute('data-capubbs-image-loaded')!=='true')image.setAttribute('data-capubbs-image-loaded','true');
      queueHeight();
    }
    function observeImageLoad(image){
      if(image.complete){
        markImageLoaded(image);
        return;
      }
      if(image.getAttribute('data-capubbs-image-load-observed')==='true')return;
      image.setAttribute('data-capubbs-image-load-observed','true');
      image.addEventListener('load',function(){markImageLoaded(image)},{once:true});
      image.addEventListener('error',function(){markImageLoaded(image)},{once:true});
    }
    function prepareImages(){
      Array.prototype.forEach.call(document.images,function(image){
        observeImageLoad(image);
        var width=parseFloat(image.getAttribute('width')||'');
        var height=parseFloat(image.getAttribute('height')||'');
        if(Number.isFinite(width)&&width>0&&Number.isFinite(height)&&height>0){
          width=Math.round(width);
          height=Math.round(height);
          if(image.getAttribute('data-capubbs-image-width')!==String(width))image.setAttribute('data-capubbs-image-width',String(width));
          if(image.getAttribute('data-capubbs-image-height')!==String(height))image.setAttribute('data-capubbs-image-height',String(height));
          var boundedWidth='min('+width+'px, 100%)';
          var aspectRatio=width+' / '+height;
          if(image.style.width!==boundedWidth)image.style.width=boundedWidth;
          if(image.style.height!=='auto')image.style.height='auto';
          if(image.style.aspectRatio!==aspectRatio)image.style.aspectRatio=aspectRatio;
        }
        if(!canOpenImages)return;
        var ariaLabel=image.alt&&image.alt.trim()?'查看大图：'+image.alt.trim():'查看大图';
        if(image.getAttribute('role')!=='button')image.setAttribute('role','button');
        if(image.getAttribute('tabindex')!=='0')image.setAttribute('tabindex','0');
        if(image.getAttribute('aria-label')!==ariaLabel)image.setAttribute('aria-label',ariaLabel);
        if(!image.title)image.title='点击查看大图';
      });
    }
    function isNeteaseOutchainPlayer(frame){
      var source=frame&&frame.getAttribute?frame.getAttribute('src')||'':'';
      if(!source)return false;
      try{
        var url=new URL(source,document.baseURI);
        return url.hostname.toLowerCase()==='music.163.com'&&url.pathname.replace(/\\/+$/,'')==='/outchain/player';
      }catch(error){return false;}
    }
    function prepareEmbeddedPlayers(){
      var contentRoot=document.querySelector('.capubbs-html-frame-root');
      if(!contentRoot)return;
      Array.prototype.forEach.call(contentRoot.querySelectorAll('iframe'),function(frame){
        if(!isNeteaseOutchainPlayer(frame))return;
        var parent=frame.parentElement;
        if(parent&&parent.classList.contains('capubbs-netease-player-surface'))return;
        var surface=document.createElement('span');
        surface.className='capubbs-netease-player-surface';
        surface.setAttribute('data-capubbs-embedded-player','netease');
        frame.parentNode.insertBefore(surface,frame);
        surface.appendChild(frame);
      });
    }
    function setGalleryIndex(gallery,nextIndex){
      if(!gallery||!Number.isSafeInteger(nextIndex))return false;
      var slides=Array.prototype.slice.call(gallery.querySelectorAll('[data-capubbs-gallery-slide="true"]'));
      if(slides.length<2||nextIndex<0||nextIndex>=slides.length)return false;
      gallery.setAttribute('data-capubbs-gallery-index',String(nextIndex));
      slides.forEach(function(slide,index){
        var active=index===nextIndex;
        slide.setAttribute('data-capubbs-gallery-active',active?'true':'false');
        slide.setAttribute('aria-hidden',active?'false':'true');
      });
      Array.prototype.forEach.call(gallery.querySelectorAll('[data-capubbs-gallery-caption="true"]'),function(caption,index){
        var active=index===nextIndex;
        caption.setAttribute('data-capubbs-gallery-active',active?'true':'false');
        caption.setAttribute('aria-hidden',active?'false':'true');
      });
      var count=gallery.querySelector('.capubbs-gallery-count');
      if(count){
        count.setAttribute('data-capubbs-gallery-current',String(nextIndex+1));
        count.setAttribute('aria-label','第 '+(nextIndex+1)+' 张，共 '+slides.length+' 张图片');
      }
      queueHeight();
      return true;
    }
    function moveGallery(target,direction){
      var gallery=target&&target.closest?target.closest('.capubbs-gallery'):null;
      if(!gallery)return false;
      var slides=Array.prototype.slice.call(gallery.querySelectorAll('[data-capubbs-gallery-slide="true"]'));
      if(slides.length<2)return false;
      var activeIndex=slides.findIndex(function(slide){return slide.getAttribute('data-capubbs-gallery-active')==='true';});
      var storedIndex=parseInt(gallery.getAttribute('data-capubbs-gallery-index')||'0',10);
      var currentIndex=activeIndex>=0?activeIndex:(Number.isFinite(storedIndex)&&storedIndex>=0&&storedIndex<slides.length?storedIndex:0);
      var nextIndex=(currentIndex+(direction==='next'?1:-1)+slides.length)%slides.length;
      return setGalleryIndex(gallery,nextIndex);
    }
    function syncGalleryIndex(gallery){
      if(!gallery)return false;
      var slides=Array.prototype.slice.call(gallery.querySelectorAll('[data-capubbs-gallery-slide="true"]'));
      var activeIndex=slides.findIndex(function(slide){return slide.getAttribute('data-capubbs-gallery-active')==='true';});
      return activeIndex>=0?setGalleryIndex(gallery,activeIndex):false;
    }
    function handleParentMessage(event){
      var data=event.data;
      if(event.source!==window.parent||!data||data.source!=='${HTML_FRAME_MESSAGE_SOURCE}'||data.frameId!==frameId)return;
      if(data.type==='jquery-response'){
        loadJqueryAndExecuteUserScripts(data.jquerySource);
        return;
      }
      if(data.type==='theme'){
        if(data.theme!=='dark'&&data.theme!=='light')return;
        var dark=data.theme==='dark';
        document.documentElement.classList.toggle('dark',dark);
        document.documentElement.classList.toggle('light',!dark);
        document.documentElement.style.colorScheme=data.theme;
        syncGrayscaleTextColors(document.body);
        queueHeight();
        return;
      }
      if(data.type!=='gallery-select')return;
      if(!Number.isSafeInteger(data.galleryId)||!Number.isSafeInteger(data.galleryIndex)||data.galleryId<0||data.galleryIndex<0)return;
      var galleries=Array.prototype.slice.call(document.querySelectorAll('.capubbs-html-frame-root .capubbs-gallery'));
      var gallery=galleries[data.galleryId];
      setGalleryIndex(gallery,data.galleryIndex);
    }
    function handleGalleryClick(event){
      if(event.button!==0)return;
      var actionTarget=event.target&&event.target.closest?event.target.closest('[data-capubbs-gallery-action]'):null;
      var action=actionTarget?actionTarget.getAttribute('data-capubbs-gallery-action'):'';
      if(action!=='prev'&&action!=='next')return;
      if(event.defaultPrevented){
        syncGalleryIndex(actionTarget.closest('.capubbs-gallery'));
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      moveGallery(actionTarget,action);
    }
    function handleGalleryKeyDown(event){
      var actionTarget=event.target&&event.target.closest?event.target.closest('[data-capubbs-gallery-action]'):null;
      var action=actionTarget?actionTarget.getAttribute('data-capubbs-gallery-action'):'';
      if((event.key==='Enter'||event.key===' ')&&(action==='prev'||action==='next')){
        event.preventDefault();
        moveGallery(actionTarget,action);
        return;
      }
      if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
      var gallery=event.target&&event.target.closest?event.target.closest('.capubbs-gallery'):null;
      if(!gallery)return;
      if(event.defaultPrevented){
        syncGalleryIndex(gallery);
        return;
      }
      event.preventDefault();
      moveGallery(gallery,event.key==='ArrowLeft'?'prev':'next');
    }
    function init(){
      var contentRoot=document.querySelector('.capubbs-html-frame-root');
      if(window.ResizeObserver&&contentRoot)new ResizeObserver(queueHeight).observe(contentRoot);
      if(window.MutationObserver&&contentRoot)new MutationObserver(function(){queueHeight();prepareImages();prepareEmbeddedPlayers();syncGrayscaleTextColors(contentRoot);}).observe(contentRoot,{attributes:true,characterData:true,childList:true,subtree:true});
      window.addEventListener('load',queueHeight);
      document.addEventListener('transitionend',queueHeight);
      document.addEventListener('animationend',queueHeight);
      document.addEventListener('selectionchange',queueSelection);
      document.addEventListener('click',handleGalleryClick);
      document.addEventListener('keydown',handleGalleryKeyDown);
      window.addEventListener('message',handleParentMessage);
      document.addEventListener('click',handleImageClick);
      document.addEventListener('keydown',handleImageKeyDown);
      document.addEventListener('click',handleForumNavigationClick);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(queueHeight);
      if(hasUserScripts)window.parent.postMessage({source:'${HTML_FRAME_MESSAGE_SOURCE}',type:'jquery-request',frameId:frameId},'*');
      else executeUserScripts();
      prepareImages();
      prepareEmbeddedPlayers();
      syncGrayscaleTextColors(contentRoot);
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

function loadJquerySource() {
  if (jquerySourcePromise) return jquerySourcePromise;

  jquerySourcePromise = fetch(JQUERY_SOURCE_URL, { credentials: 'same-origin' })
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to load jQuery: ${response.status}`);
      return response.text();
    })
    .catch(() => null);
  return jquerySourcePromise;
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
    'upgrade-insecure-requests',
  ].join('; ');
}

function getLegacyContentBaseUrl() {
  return new URL('/bbs/content/', window.location.origin).href;
}

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeInlineStyleText(value: string) {
  return value.replace(/<\/style/gi, '<\\/style');
}

function isHtmlFrameMessage(value: unknown): value is HtmlFrameMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<HtmlFrameMessage>;
  if (message.source !== HTML_FRAME_MESSAGE_SOURCE || typeof message.frameId !== 'string') return false;
  if (message.type === 'anchor') {
    return typeof message.offsetTop === 'number'
      && Number.isFinite(message.offsetTop)
      && message.offsetTop >= 0;
  }
  if (message.type === 'navigate') return typeof message.url === 'string';
  if (message.type === 'jquery-request') return true;
  if (message.type === 'selection') return typeof message.text === 'string';
  if (message.type === 'image-open') {
    return typeof message.imageIndex === 'number'
      && Number.isSafeInteger(message.imageIndex)
      && Array.isArray(message.images)
      && message.images.length > 0
      && message.imageIndex >= 0
      && message.imageIndex < message.images.length
      && message.images.every((image) => (
        Boolean(image)
        && typeof image === 'object'
        && typeof image.alt === 'string'
        && typeof image.src === 'string'
        && image.src.length > 0
        && (
          (image.galleryId === undefined && image.galleryIndex === undefined)
          || (
            typeof image.galleryId === 'number'
            && Number.isSafeInteger(image.galleryId)
            && image.galleryId >= 0
            && typeof image.galleryIndex === 'number'
            && Number.isSafeInteger(image.galleryIndex)
            && image.galleryIndex >= 0
          )
        )
      ));
  }
  return message.type === 'resize'
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
