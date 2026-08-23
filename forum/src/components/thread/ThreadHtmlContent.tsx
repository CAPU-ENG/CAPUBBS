import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { fetchSignatureReferencedFloorHtml } from '../../api/thread';
import {
  renderForumMarkup,
  requiresIsolatedForumHtml,
  translateLegacyForumMarkup,
  type SafeForumHtml,
} from '../../utils/forumMarkup';
import { FORUM_DEFAULT_FONT_SIZE } from '../../utils/forumFontSize';
import { FORUM_LOCATION_CHANGE_EVENT } from '../../utils/authRoutes';
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
  type: 'navigate';
  url: string;
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
  variant,
}: {
  className?: string;
  floor: number;
  html: string;
  isActivitySignupCanceled?: boolean;
  onImageOpen?: ForumMarkupImageOpenHandler;
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
  variant,
}: {
  className: string;
  floor: number;
  html: string;
  isActivitySignupCanceled: boolean;
  onImageOpen?: ForumMarkupImageOpenHandler;
  variant: ThreadHtmlVariant;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameIdRef = useRef(`${variant}-${floor}-${Math.random().toString(36).slice(2)}`);
  const onImageOpenRef = useRef(onImageOpen);
  onImageOpenRef.current = onImageOpen;
  const minHeight = variant === 'signature' ? MIN_SIGNATURE_FRAME_HEIGHT : MIN_FLOOR_FRAME_HEIGHT;
  const canOpenImages = Boolean(onImageOpen);
  const [frameHeight, setFrameHeight] = useState<number | null>(null);
  const isDarkTheme = useDarkTheme();
  const parentStyleText = useParentStyleText();
  const frameDocument = useMemo(() => buildHtmlFrameDocument({
    canOpenImages,
    frameId: frameIdRef.current,
    html,
    isActivitySignupCanceled,
    isDarkTheme,
    parentStyleText,
    variant,
  }), [canOpenImages, html, isActivitySignupCanceled, isDarkTheme, parentStyleText, variant]);
  const frameSource = useMemo(
    () => `data:text/html;charset=utf-8,${encodeURIComponent(frameDocument)}`,
    [frameDocument],
  );

  useEffect(() => {
    setFrameHeight(null);
  }, [frameSource]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow || !isHtmlFrameMessage(event.data)) return;
      if (event.data.frameId !== frameIdRef.current) return;

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
      scrolling="no"
      src={frameSource}
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
  html,
  isActivitySignupCanceled,
  isDarkTheme,
  parentStyleText,
  variant,
}: {
  canOpenImages: boolean;
  frameId: string;
  html: string;
  isActivitySignupCanceled: boolean;
  isDarkTheme: boolean;
  parentStyleText: string;
  variant: ThreadHtmlVariant;
}) {
  const isSignature = variant === 'signature';
  const color = isSignature
    ? '#999999'
    : (isDarkTheme ? 'rgb(228 228 231)' : 'rgb(63 63 70)');
  const linkColor = isDarkTheme ? 'rgb(125 211 252)' : 'rgb(3 105 161)';
  const fontFamily = isSignature
    ? 'monospace'
    : "ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
  const fontSize = isSignature ? '14px' : FORUM_DEFAULT_FONT_SIZE;
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
  <style data-capubbs-parent-styles>${escapeStyleText(parentStyleText)}</style>
  <style>
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:${color};font-family:${fontFamily};font-size:${fontSize};line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${FRAME_WIDTH_ALLOWANCE}px);${signatureRootStyle}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}a{color:${linkColor}}img,video,canvas,svg{max-width:100%;height:auto}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]{background:linear-gradient(105deg,transparent 20%,rgba(255,255,255,.42) 45%,transparent 70%);background-color:rgba(128,128,128,.16);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}@keyframes capubbs-image-loading{from{background-position:120% 0}to{background-position:-80% 0}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]{animation:none}}pre{max-width:100%;overflow:auto;white-space:pre-wrap}table{max-width:100%}
  </style>
  <script>${buildFrameBridgeScript(frameId, canOpenImages)}</script>
  <script src="/bbs/lib/jquery.min.js"></script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${variant}${canceledClassName}">${deferUserScripts(html)}</main></body>
</html>`;
}

function buildFrameBridgeScript(frameId: string, canOpenImages: boolean) {
  return `(function(){
    var frameId=${JSON.stringify(frameId)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var canOpenImages=${JSON.stringify(canOpenImages)};
    var forumAppExactPaths=${JSON.stringify(FORUM_APP_EXACT_PATHS)};
    var forumAppPathPrefixes=${JSON.stringify(FORUM_APP_PATH_PREFIXES)};
    var legacyForumExactPaths=${JSON.stringify(LEGACY_FORUM_EXACT_PATHS)};
    var legacyForumPathPatterns=${JSON.stringify(LEGACY_FORUM_PATH_PATTERNS)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${FRAME_BOTTOM_GUARD};
    var queued=false;
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
        var appPath=path.replace(/^\\/(?:bbs-new|capubbs-new)(?=\\/)/,'');
        var appRoute=forumAppExactPaths.indexOf(appPath)>=0||forumAppPathPrefixes.some(function(prefix){return appPath.indexOf(prefix)===0;});
        var legacyRoute=legacyForumExactPaths.indexOf(appPath)>=0||legacyForumPathPatterns.some(function(pattern){return pattern.test(appPath);});
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
    function handleGallerySelection(event){
      var data=event.data;
      if(event.source!==window.parent||!data||data.source!=='${HTML_FRAME_MESSAGE_SOURCE}'||data.type!=='gallery-select'||data.frameId!==frameId)return;
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
      if(window.MutationObserver&&contentRoot)new MutationObserver(function(){queueHeight();prepareImages();}).observe(contentRoot,{attributes:true,characterData:true,childList:true,subtree:true});
      window.addEventListener('load',queueHeight);
      document.addEventListener('transitionend',queueHeight);
      document.addEventListener('animationend',queueHeight);
      document.addEventListener('click',handleGalleryClick);
      document.addEventListener('keydown',handleGalleryKeyDown);
      window.addEventListener('message',handleGallerySelection);
      document.addEventListener('click',handleImageClick);
      document.addEventListener('keydown',handleImageKeyDown);
      document.addEventListener('click',handleForumNavigationClick);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(queueHeight);
      executeUserScripts();
      prepareImages();
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

function getParentStyleText() {
  return Array.from(document.styleSheets)
    .map((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n');
      } catch {
        const ownerNode = styleSheet.ownerNode;
        return ownerNode instanceof HTMLStyleElement ? ownerNode.textContent ?? '' : '';
      }
    })
    .filter(Boolean)
    .join('\n');
}

function useParentStyleText() {
  const [styleText, setStyleText] = useState(getParentStyleText);

  useEffect(() => {
    const update = () => {
      const nextStyleText = getParentStyleText();
      setStyleText((currentStyleText) => currentStyleText === nextStyleText ? currentStyleText : nextStyleText);
    };
    const observer = new MutationObserver(update);

    observer.observe(document.head, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });
    update();

    return () => observer.disconnect();
  }, []);

  return styleText;
}

function escapeStyleText(value: string) {
  return value.replace(/<\/style/gi, '<\\/style');
}

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
