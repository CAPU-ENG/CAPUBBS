import{c as V,r as f,j as e,Q as X,az as Q,aA as Z,aq as ee,al as te,aB as re,aC as ae,aD as ne,aE as ie,X as M,aj as le}from"./index-DIt3qYsH.js";import{b as q,m as L,s as se,r as oe,f as ce,h as de,R as ue,a as ge,C as G}from"./RichTextEditor-BXc36q_C.js";import{m as me}from"./thread-DVHSWYvd.js";import{r as fe,b as pe,t as he}from"./forumMarkup-DjTqZALL.js";import{T as ye}from"./trash-2-FZeqi8BV.js";const be=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],$=V("paperclip",be),xe="/assets/thread-html-frame-DDSDNjxO.css";function ve({className:a="",html:t,onImageOpen:n,variant:g}){const l=f.useRef(null),s=f.useMemo(()=>({__html:t}),[t]);if(f.useEffect(()=>{const r=l.current;if(!r)return;const d=Array.from(r.querySelectorAll("img")),c=u=>{u.dataset.capubbsImageLoaded="true"},p=d.map(u=>{if(u.complete)return c(u),null;const h=()=>c(u);return u.addEventListener("load",h,{once:!0}),u.addEventListener("error",h,{once:!0}),{handleLoad:h,image:u}});return()=>{p.forEach(u=>{u&&(u.image.removeEventListener("load",u.handleLoad),u.image.removeEventListener("error",u.handleLoad))})}},[t]),!t)return null;function o(r,d){if(!n||!(r instanceof Element))return;const c=r.closest("img");if(!(c instanceof HTMLImageElement))return;const p=Array.from(d.querySelectorAll("img")),u=p.indexOf(c);if(u<0)return;const h=p.map(x=>Ie(x,d)),k=p.map((x,I)=>{const E=h[I];return{alt:x.alt.trim(),src:x.currentSrc||x.src,...E?{galleryId:E.galleryId,galleryIndex:E.galleryIndex}:{}}});n(k,u,c,x=>{const I=h[x];I&&se(I.gallery,I.galleryIndex)})}function i(r){const d=q(r.target);if(d&&r.target instanceof Element){r.preventDefault(),r.stopPropagation(),L(r.target,d);return}!n||!(r.target instanceof HTMLImageElement)||(r.preventDefault(),o(r.target,r.currentTarget))}function m(r){const d=q(r.target);if(d&&["Enter"," "].includes(r.key)&&r.target instanceof Element){r.preventDefault(),L(r.target,d);return}if(["ArrowLeft","ArrowRight"].includes(r.key)&&r.target instanceof Element&&r.target.closest(".capubbs-gallery")){r.preventDefault(),L(r.target,r.key==="ArrowLeft"?"prev":"next");return}!n||!(r.target instanceof HTMLImageElement)||!["Enter"," "].includes(r.key)||(r.preventDefault(),o(r.target,r.currentTarget))}return e.jsx("div",{ref:l,className:`forum-markup forum-markup-${g} ${a}`.trim(),"data-forum-markup":g,dangerouslySetInnerHTML:s,onClick:i,onKeyDown:m})}function Ie(a,t){const n=a.closest(".capubbs-gallery");if(!n||!t.contains(n))return null;const l=Array.from(t.querySelectorAll(".capubbs-gallery")).indexOf(n),o=Array.from(n.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(a);return l>=0&&o>=0?{gallery:n,galleryId:l,galleryIndex:o}:null}const we=28,Ee=64,Ae=5e4,je=30,B=30,S="capubbs-thread-html-frame",Se=new URL(xe,window.location.origin).href;function z({className:a="",floor:t,html:n,isActivitySignupCanceled:g=!1,onImageOpen:l,variant:s}){const o=f.useMemo(()=>s==="signature"?oe(n):n,[n,s]),i=Re(o,s==="signature"),m=fe(i),r=f.useMemo(()=>m?null:pe(i,{normalizeLegacyLineBreaks:s==="signature"}),[i,m,s]),d=f.useMemo(()=>he(i),[i]);return!m&&r!==null?e.jsx(ve,{className:a,html:r,onImageOpen:l,variant:s}):e.jsx(ke,{className:a,floor:t,html:d,isActivitySignupCanceled:g,onImageOpen:l,variant:s})}function ke({className:a,floor:t,html:n,isActivitySignupCanceled:g,onImageOpen:l,variant:s}){const o=f.useRef(null),i=f.useRef(`${s}-${t}-${Math.random().toString(36).slice(2)}`),m=f.useRef(l);m.current=l;const r=s==="signature"?we:Ee,d=!!l,[c,p]=f.useState(null),u=Ce(),h=f.useRef(u),k=X(),R=s==="signature"?14:k,x=f.useMemo(()=>Ne({canOpenImages:d,frameId:i.current,html:n,isActivitySignupCanceled:g,isDarkTheme:h.current,fontSize:R,variant:s}),[d,R,n,g,s]),I=f.useMemo(()=>`data:text/html;charset=utf-8,${encodeURIComponent(x)}`,[x]),E=f.useCallback(()=>{o.current?.contentWindow?.postMessage({frameId:i.current,source:S,theme:u?"dark":"light",type:"theme"},"*")},[u]);return f.useEffect(()=>{p(null)},[I]),f.useEffect(()=>{E()},[E]),f.useLayoutEffect(()=>{function N(y){if(!(y.source!==o.current?.contentWindow||!Me(y.data))&&y.data.frameId===i.current){if(y.data.type==="anchor"){const v=o.current;if(!v)return;const A=window.getComputedStyle(document.documentElement),j=Number.parseFloat(A.getPropertyValue("--topbar-height"))||0,b=window.scrollY+v.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,b+y.data.offsetTop-j-16)});return}if(y.data.type==="navigate"){const v=Q(y.data.url,K());if(!v)return;window.history.pushState(null,"",v),window.dispatchEvent(new Event(Z));const A=new URL(v,window.location.origin);A.hash?window.requestAnimationFrame(()=>{const j=decodeURIComponent(A.hash.slice(1)),b=ee(`#${j}`);(b?te(b):document.getElementById(j))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(y.data.type==="image-open"){const v=o.current;if(!v)return;const A=j=>{const b=y.data.images[j];!b||typeof b.galleryId!="number"||!Number.isSafeInteger(b.galleryIndex)||v.contentWindow?.postMessage({frameId:i.current,galleryId:b.galleryId,galleryIndex:b.galleryIndex,source:S,type:"gallery-select"},"*")};m.current?.(y.data.images,y.data.imageIndex,v,A);return}p(Math.min(Ae,Math.max(r,Math.ceil(y.data.height))))}}return window.addEventListener("message",N),()=>window.removeEventListener("message",N)},[r]),e.jsx("iframe",{ref:o,className:`thread-html-frame thread-html-frame-${s} ${a}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-same-origin",scrolling:"no",src:I,onLoad:E,style:{"--thread-html-frame-width-allowance":`${B}px`,...c===null?{}:{"--thread-html-frame-height":`${c}px`}},title:s==="signature"?`第 ${t} 楼签名档`:`第 ${t} 楼正文`})}function Re(a,t){const[n,g]=f.useState(a);return f.useEffect(()=>{const l=new AbortController,s=t?ce(a):[];if(g(a),s.length===0)return()=>l.abort();const o=Array.from(new Map(s.map(i=>[`${i.bid}:${i.tid}:${i.pid}`,i])).values());return Promise.all(o.map(async i=>{try{const m=await me(i,l.signal);return[`${i.bid}:${i.tid}:${i.pid}`,m]}catch(m){if(m instanceof DOMException&&m.name==="AbortError")throw m;return[`${i.bid}:${i.tid}:${i.pid}`,""]}})).then(i=>{if(l.signal.aborted)return;const m=new Map(i);let r=a;s.forEach(d=>{const c=m.get(`${d.bid}:${d.tid}:${d.pid}`);c&&(r=r.replace(d.marker,c))}),g(r)}).catch(()=>{}),()=>l.abort()},[t,a]),n}function Ne({canOpenImages:a,frameId:t,fontSize:n,html:g,isActivitySignupCanceled:l,isDarkTheme:s,variant:o}){const i=o==="signature",m=i?"#999999":"rgb(63 63 70)",r=i?"#999999":"rgb(228 228 231)",d=i?"monospace":"ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",c=i?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",p=l?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${s?"dark":"light"}" style="background:transparent;color-scheme:${s?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${U(K())}">
  <meta http-equiv="Content-Security-Policy" content="${$e()}">
  <link rel="stylesheet" href="${U(Se)}">
  <style>
    html{--capubbs-frame-text-color:${m}}html.dark{--capubbs-frame-text-color:${r}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${d};font-size:${n}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${B}px);${c}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${Te(t,a)}<\/script>
  <script src="/bbs/lib/jquery.min.js"><\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${o}${p}">${Le(g)}</main></body>
</html>`}function Te(a,t){return`(function(){
    var frameId=${JSON.stringify(a)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var canOpenImages=${JSON.stringify(t)};
    var forumAppExactPaths=${JSON.stringify(re)};
    var forumAppPathPrefixes=${JSON.stringify(ae)};
    var legacyForumExactPaths=${JSON.stringify(ne)};
    var legacyForumPathPatterns=${JSON.stringify(ie)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${je};
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
      window.parent.postMessage({source:'${S}',type:'resize',frameId:frameId,height:height},'*');
    }
    function queueHeight(){
      if(queued)return;
      queued=true;
      window.setTimeout(sendHeight,0);
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
        window.parent.postMessage({source:'${S}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${S}',type:'navigate',frameId:frameId,url:url},'*');
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
      window.parent.postMessage({source:'${S}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
    function handleParentMessage(event){
      var data=event.data;
      if(event.source!==window.parent||!data||data.source!=='${S}'||data.frameId!==frameId)return;
      if(data.type==='theme'){
        if(data.theme!=='dark'&&data.theme!=='light')return;
        var dark=data.theme==='dark';
        document.documentElement.classList.toggle('dark',dark);
        document.documentElement.classList.toggle('light',!dark);
        document.documentElement.style.colorScheme=data.theme;
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
      if(window.MutationObserver&&contentRoot)new MutationObserver(function(){queueHeight();prepareImages();}).observe(contentRoot,{attributes:true,characterData:true,childList:true,subtree:true});
      window.addEventListener('load',queueHeight);
      document.addEventListener('transitionend',queueHeight);
      document.addEventListener('animationend',queueHeight);
      document.addEventListener('click',handleGalleryClick);
      document.addEventListener('keydown',handleGalleryKeyDown);
      window.addEventListener('message',handleParentMessage);
      document.addEventListener('click',handleImageClick);
      document.addEventListener('keydown',handleImageKeyDown);
      document.addEventListener('click',handleForumNavigationClick);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(queueHeight);
      executeUserScripts();
      prepareImages();
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`}function Le(a){return a.replace(/<script\b([^>]*)>/gi,(t,n)=>`<script${n.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function $e(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'"].join("; ")}function K(){return new URL("/bbs/content/",window.location.origin).href}function U(a){return a.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Me(a){if(!a||typeof a!="object")return!1;const t=a;return t.source!==S||typeof t.frameId!="string"?!1:t.type==="anchor"?typeof t.offsetTop=="number"&&Number.isFinite(t.offsetTop)&&t.offsetTop>=0:t.type==="navigate"?typeof t.url=="string":t.type==="image-open"?typeof t.imageIndex=="number"&&Number.isSafeInteger(t.imageIndex)&&Array.isArray(t.images)&&t.images.length>0&&t.imageIndex>=0&&t.imageIndex<t.images.length&&t.images.every(n=>!!n&&typeof n=="object"&&typeof n.alt=="string"&&typeof n.src=="string"&&n.src.length>0&&(n.galleryId===void 0&&n.galleryIndex===void 0||typeof n.galleryId=="number"&&Number.isSafeInteger(n.galleryId)&&n.galleryId>=0&&typeof n.galleryIndex=="number"&&Number.isSafeInteger(n.galleryIndex)&&n.galleryIndex>=0)):t.type==="resize"&&typeof t.height=="number"&&Number.isFinite(t.height)}function Ce(){const[a,t]=f.useState(()=>document.documentElement.classList.contains("dark"));return f.useEffect(()=>{const n=document.documentElement,g=()=>t(n.classList.contains("dark")),l=new MutationObserver(g);return l.observe(n,{attributeFilter:["class"],attributes:!0}),()=>l.disconnect()},[]),a}function Fe({bodyClassName:a="thread-floor-body",bodyFallback:t=null,bodyHtml:n,floor:g,isActivitySignupCanceled:l=!1,onImageOpen:s,signatureClassName:o="thread-signature",signatureHtml:i,signatureText:m}){const r=s?(d,c,p,u)=>{const h=d[c];h&&s([h],0,p,u?()=>u(c):void 0)}:void 0;return e.jsxs(e.Fragment,{children:[n?e.jsx(z,{className:a,floor:g,html:n,isActivitySignupCanceled:l,onImageOpen:s,variant:"floor"}):t,i?e.jsx(z,{className:o,floor:g,html:i,onImageOpen:r,variant:"signature"}):m?e.jsx("footer",{className:o,children:e.jsx("p",{children:m})}):null]})}const He="自动保存至草稿箱",Pe=[{label:"不使用签名档",value:0},{label:"签名档 1",value:1},{label:"签名档 2",value:2},{label:"签名档 3",value:3}];function Ue({label:a="帖子标题",maxLength:t=40,onChange:n,placeholder:g="请输入帖子标题",required:l=!1,value:s}){return e.jsxs("label",{className:"post-editor-title-field",children:[a?e.jsx("span",{children:a}):null,e.jsx("input",{autoComplete:"off",maxLength:t,onChange:o=>n(o.target.value),placeholder:g,required:l,value:s}),e.jsxs("small",{children:[s.trim().length," / ",t]})]})}function Be({afterEditor:a,ariaLabel:t,attachmentDialogDescription:n,attachmentLabel:g="待上传附件",attachments:l,beforeEditor:s,className:o="",editorRef:i,editorValue:m,focusRequest:r,formatAttachmentMeta:d=T=>C(T.size),heading:c,headingMeta:p,id:u,name:h,onAddAttachments:k,onChange:R,onPreview:x,onRemoveAttachment:I,onSignatureChange:E,onSubmit:N,placeholder:y,previewDisabled:v=!1,secondaryActions:A,signatureIndex:j,status:b,statusIsError:F=!1,submitCompactLabel:W,submitDisabled:J=!1,submitIcon:Y,submitLabel:H,uploadingAttachments:P=!1}){const[T,O]=f.useState(!1),_=u?`${u}-title`:`${h}-editor-title`,D=b===He;return e.jsxs("section",{"aria-labelledby":_,className:`reply-editor ${o}`.trim(),id:u,ref:i,children:[e.jsxs("header",{className:"reply-editor-heading",children:[e.jsx("h2",{id:_,children:c}),e.jsx("p",{children:p})]}),s,e.jsx("div",{className:"reply-editor-core",children:e.jsx(ue,{ariaLabel:t,focusRequest:r,onChange:R,placeholder:y,value:m})}),a,e.jsx("div",{"aria-label":"选择签名档",className:"reply-signature-options",role:"radiogroup",children:Pe.map(w=>e.jsxs("label",{children:[e.jsx("input",{checked:j===w.value,name:h,onChange:()=>E(w.value),type:"radio",value:w.value}),w.label]},w.value))}),l.length>0&&e.jsx("ul",{className:"reply-attachments","aria-label":g,children:l.map(w=>e.jsxs("li",{children:[e.jsx($,{size:13}),e.jsx("span",{children:w.name}),e.jsx("small",{children:d(w)}),e.jsx("button",{"aria-label":`移除附件 ${w.name}`,onClick:()=>I(w.id),type:"button",children:e.jsx(M,{size:13})})]},w.id))}),e.jsxs("footer",{className:"reply-editor-footer",children:[e.jsxs("button",{className:"reply-secondary-button",disabled:P,onClick:()=>O(!0),type:"button",children:[e.jsx($,{size:15}),e.jsx("span",{className:"reply-action-label-full",children:"添加附件"}),e.jsx("span",{className:"reply-action-label-compact",children:"附件"}),l.length>0&&e.jsx("span",{className:"reply-attachment-count",children:l.length})]}),b&&e.jsxs("span",{className:`reply-editor-status ${F?"thread-edit-error":""} ${D?"reply-editor-status-auto-save":""}`.trim(),role:F?"alert":"status",children:[D&&e.jsx("span",{"aria-hidden":"true",className:"reply-editor-auto-save-dot",children:"·"}),b]}),e.jsxs("div",{className:"reply-editor-submit",children:[e.jsxs("button",{className:"reply-secondary-button",disabled:v,onClick:x,type:"button",children:[e.jsx(le,{size:15}),"预览"]}),A,e.jsxs("button",{className:"reply-publish-button",disabled:J,onClick:N,type:"button",children:[Y,e.jsx("span",{className:"reply-action-label-full",children:H}),e.jsx("span",{className:"reply-action-label-compact",children:W??H})]})]})]}),T&&e.jsx(Oe,{attachments:l,description:n,formatAttachmentMeta:d,onAdd:k,onClose:()=>O(!1),onRemove:I,uploading:P})]})}function Ke({attachments:a,editorValue:t,formatAttachmentMeta:n=c=>C(c.size),label:g,onClose:l,previewAuthor:s,previewExtra:o,previewFloor:i,previewSignature:m,previewedAt:r,title:d}){return f.useEffect(()=>(document.body.classList.add("reply-preview-open"),()=>document.body.classList.remove("reply-preview-open")),[]),f.useEffect(()=>{function c(p){p.key==="Escape"&&l()}return document.addEventListener("keydown",c),()=>document.removeEventListener("keydown",c)},[l]),e.jsx("div",{className:"reply-preview-backdrop",onClick:l,role:"presentation",children:e.jsxs("section",{"aria-labelledby":"post-editor-preview-title","aria-modal":"true",className:"reply-preview-dialog",onClick:c=>c.stopPropagation(),role:"dialog",children:[e.jsxs("header",{children:[e.jsxs("div",{children:[e.jsx("span",{children:g}),e.jsx("h2",{id:"post-editor-preview-title",children:d})]}),e.jsx("button",{"aria-label":"关闭内容预览",onClick:l,type:"button",children:e.jsx(M,{size:18})})]}),e.jsxs("div",{className:"reply-preview-stage",children:[e.jsxs("article",{className:"thread-floor reply-preview-floor",children:[e.jsx("div",{className:"thread-avatar-rail reply-preview-avatar-rail",children:e.jsx("div",{className:"thread-avatar-button",children:e.jsx("img",{src:s.avatar,alt:""})})}),e.jsxs("div",{className:"thread-floor-main",children:[e.jsxs("header",{className:"thread-floor-header",children:[e.jsx("div",{className:"thread-floor-author",children:e.jsx("strong",{children:s.name})}),e.jsx("div",{className:"thread-floor-time",children:e.jsx("time",{children:r})}),e.jsxs("span",{className:"thread-floor-index",children:["#",i]})]}),e.jsx(Fe,{bodyClassName:"thread-floor-body reply-preview-floor-body",bodyHtml:ge(t),floor:i,signatureHtml:m}),a.length>0&&e.jsx("ul",{className:"reply-preview-attachments","aria-label":"附件预览",children:a.map(c=>e.jsxs("li",{children:[e.jsx($,{size:13}),e.jsx("span",{children:c.name}),e.jsx("small",{children:n(c)})]},c.id))})]})]}),o]}),e.jsx("footer",{children:e.jsx("button",{className:"reply-secondary-button",onClick:l,type:"button",children:"返回编辑"})})]})})}function Oe({attachments:a,description:t,formatAttachmentMeta:n,onAdd:g,onClose:l,onRemove:s,uploading:o}){const i=f.useRef(null);function m(r){g(Array.from(r.currentTarget.files??[])),r.currentTarget.value=""}return e.jsx("div",{className:"attachment-dialog-backdrop",onClick:l,role:"presentation",children:e.jsxs("section",{"aria-labelledby":"post-editor-attachment-dialog-title","aria-modal":"true",className:"attachment-dialog",onClick:r=>r.stopPropagation(),role:"dialog",children:[e.jsxs("header",{children:[e.jsx("span",{children:e.jsx(G,{size:17})}),e.jsx("h2",{id:"post-editor-attachment-dialog-title",children:"文件上传"}),e.jsx("button",{"aria-label":"关闭文件上传",onClick:l,type:"button",children:e.jsx(M,{size:18})})]}),e.jsxs("button",{className:"attachment-drop-button",disabled:o,onClick:()=>i.current?.click(),type:"button",children:[e.jsx(G,{size:22}),e.jsx("strong",{children:o?"正在上传附件…":"选择一个或多个文件"}),e.jsx("span",{children:t})]}),e.jsx("input",{className:"sr-only",disabled:o,multiple:!0,onChange:m,ref:i,type:"file"}),a.length>0&&e.jsx("ul",{children:a.map(r=>e.jsxs("li",{children:[e.jsxs("div",{children:[e.jsx("strong",{children:r.name}),e.jsx("span",{children:n(r)})]}),e.jsx("button",{"aria-label":`移除附件 ${r.name}`,onClick:()=>s(r.id),type:"button",children:e.jsx(ye,{size:15})})]},r.id))}),e.jsx("footer",{children:e.jsx("button",{className:"reply-publish-button",onClick:l,type:"button",children:"完成"})})]})})}function We(a){return a.mode!=="rich"?a.content.trim().length>0:de(a.content)}function Je(a){const t=n=>String(n).padStart(2,"0");return`${a.getFullYear()}-${t(a.getMonth()+1)}-${t(a.getDate())} ${t(a.getHours())}:${t(a.getMinutes())}:${t(a.getSeconds())}`}function Ye(a){return C(a)}function C(a){return a<=0?"大小未知":a>=1024*1024?`${(a/1024/1024).toFixed(2)} MB`:`${Math.max(1,Math.round(a/1024))} KB`}export{He as A,ve as F,Be as P,Fe as T,Ue as a,Ke as b,Je as c,Ye as f,We as h};
