import{c as X,r as p,j as e,ap as Y,aq as Q,ag as Z,ab as ee,ar as te,as as re,at as ae,au as ne,X as $,a9 as ie}from"./index-CsoRMomU.js";import{b as q,m as k,s as le,r as se,f as oe,h as ce,R as de,a as ue,C as _}from"./RichTextEditor-CJsduPT8.js";import{m as ge}from"./thread-Di1vBNVc.js";import{r as me,a as pe,t as fe}from"./forumMarkup-Dy-9Yg62.js";import{T as he}from"./trash-2-BOlc8qAX.js";const ye=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],T=X("paperclip",ye);function be({className:r="",html:t,onImageOpen:n,variant:o}){const i=p.useRef(null),s=p.useMemo(()=>({__html:t}),[t]);if(p.useEffect(()=>{const a=i.current;if(!a)return;const u=Array.from(a.querySelectorAll("img")),d=g=>{g.dataset.capubbsImageLoaded="true"},h=u.map(g=>{if(g.complete)return d(g),null;const b=()=>d(g);return g.addEventListener("load",b,{once:!0}),g.addEventListener("error",b,{once:!0}),{handleLoad:b,image:g}});return()=>{h.forEach(g=>{g&&(g.image.removeEventListener("load",g.handleLoad),g.image.removeEventListener("error",g.handleLoad))})}},[t]),!t)return null;function c(a,u){if(!n||!(a instanceof Element))return;const d=a.closest("img");if(!(d instanceof HTMLImageElement))return;const h=Array.from(u.querySelectorAll("img")),g=h.indexOf(d);if(g<0)return;const b=h.map(x=>xe(x,u)),E=h.map((x,f)=>{const y=b[f];return{alt:x.alt.trim(),src:x.currentSrc||x.src,...y?{galleryId:y.galleryId,galleryIndex:y.galleryIndex}:{}}});n(E,g,d,x=>{const f=b[x];f&&le(f.gallery,f.galleryIndex)})}function l(a){const u=q(a.target);if(u&&a.target instanceof Element){a.preventDefault(),a.stopPropagation(),k(a.target,u);return}!n||!(a.target instanceof HTMLImageElement)||(a.preventDefault(),c(a.target,a.currentTarget))}function m(a){const u=q(a.target);if(u&&["Enter"," "].includes(a.key)&&a.target instanceof Element){a.preventDefault(),k(a.target,u);return}if(["ArrowLeft","ArrowRight"].includes(a.key)&&a.target instanceof Element&&a.target.closest(".capubbs-gallery")){a.preventDefault(),k(a.target,a.key==="ArrowLeft"?"prev":"next");return}!n||!(a.target instanceof HTMLImageElement)||!["Enter"," "].includes(a.key)||(a.preventDefault(),c(a.target,a.currentTarget))}return e.jsx("div",{ref:i,className:`forum-markup forum-markup-${o} ${r}`.trim(),"data-forum-markup":o,dangerouslySetInnerHTML:s,onClick:l,onKeyDown:m})}function xe(r,t){const n=r.closest(".capubbs-gallery");if(!n||!t.contains(n))return null;const i=Array.from(t.querySelectorAll(".capubbs-gallery")).indexOf(n),c=Array.from(n.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(r);return i>=0&&c>=0?{gallery:n,galleryId:i,galleryIndex:c}:null}const ve=28,Ie=64,we=5e4,Ae=30,z=30,j="capubbs-thread-html-frame";function G({className:r="",floor:t,html:n,isActivitySignupCanceled:o=!1,onImageOpen:i,variant:s}){const c=p.useMemo(()=>s==="signature"?se(n):n,[n,s]),l=je(c,s==="signature"),m=me(l),a=p.useMemo(()=>m?null:pe(l,{normalizeLegacyLineBreaks:s==="signature"}),[l,m,s]),u=p.useMemo(()=>fe(l),[l]);return!m&&a!==null?e.jsx(be,{className:r,html:a,onImageOpen:i,variant:s}):e.jsx(Ee,{className:r,floor:t,html:u,isActivitySignupCanceled:o,onImageOpen:i,variant:s})}function Ee({className:r,floor:t,html:n,isActivitySignupCanceled:o,onImageOpen:i,variant:s}){const c=p.useRef(null),l=p.useRef(`${s}-${t}-${Math.random().toString(36).slice(2)}`),m=p.useRef(i);m.current=i;const a=s==="signature"?ve:Ie,u=!!i,[d,h]=p.useState(null),g=Ce(),b=Te(),E=p.useMemo(()=>Se({canOpenImages:u,frameId:l.current,html:n,isActivitySignupCanceled:o,isDarkTheme:g,parentStyleText:b,variant:s}),[u,n,o,g,b,s]),S=p.useMemo(()=>`data:text/html;charset=utf-8,${encodeURIComponent(E)}`,[E]);return p.useEffect(()=>{h(null)},[S]),p.useEffect(()=>{function x(f){if(!(f.source!==c.current?.contentWindow||!Me(f.data))&&f.data.frameId===l.current){if(f.data.type==="anchor"){const y=c.current;if(!y)return;const w=window.getComputedStyle(document.documentElement),A=Number.parseFloat(w.getPropertyValue("--topbar-height"))||0,v=window.scrollY+y.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,v+f.data.offsetTop-A-16)});return}if(f.data.type==="navigate"){const y=Y(f.data.url,U());if(!y)return;window.history.pushState(null,"",y),window.dispatchEvent(new Event(Q));const w=new URL(y,window.location.origin);w.hash?window.requestAnimationFrame(()=>{const A=decodeURIComponent(w.hash.slice(1)),v=Z(`#${A}`);(v?ee(v):document.getElementById(A))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(f.data.type==="image-open"){const y=c.current;if(!y)return;const w=A=>{const v=f.data.images[A];!v||typeof v.galleryId!="number"||!Number.isSafeInteger(v.galleryIndex)||y.contentWindow?.postMessage({frameId:l.current,galleryId:v.galleryId,galleryIndex:v.galleryIndex,source:j,type:"gallery-select"},"*")};m.current?.(f.data.images,f.data.imageIndex,y,w);return}h(Math.min(we,Math.max(a,Math.ceil(f.data.height))))}}return window.addEventListener("message",x),()=>window.removeEventListener("message",x)},[a]),e.jsx("iframe",{ref:c,className:`thread-html-frame thread-html-frame-${s} ${r}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-same-origin",scrolling:"no",src:S,style:{"--thread-html-frame-width-allowance":`${z}px`,...d===null?{}:{"--thread-html-frame-height":`${d}px`}},title:s==="signature"?`第 ${t} 楼签名档`:`第 ${t} 楼正文`})}function je(r,t){const[n,o]=p.useState(r);return p.useEffect(()=>{const i=new AbortController,s=t?oe(r):[];if(o(r),s.length===0)return()=>i.abort();const c=Array.from(new Map(s.map(l=>[`${l.bid}:${l.tid}:${l.pid}`,l])).values());return Promise.all(c.map(async l=>{try{const m=await ge(l,i.signal);return[`${l.bid}:${l.tid}:${l.pid}`,m]}catch(m){if(m instanceof DOMException&&m.name==="AbortError")throw m;return[`${l.bid}:${l.tid}:${l.pid}`,""]}})).then(l=>{if(i.signal.aborted)return;const m=new Map(l);let a=r;s.forEach(u=>{const d=m.get(`${u.bid}:${u.tid}:${u.pid}`);d&&(a=a.replace(u.marker,d))}),o(a)}).catch(()=>{}),()=>i.abort()},[t,r]),n}function Se({canOpenImages:r,frameId:t,html:n,isActivitySignupCanceled:o,isDarkTheme:i,parentStyleText:s,variant:c}){const l=c==="signature",m=l?"#999999":i?"rgb(228 228 231)":"rgb(63 63 70)",a=i?"rgb(125 211 252)":"rgb(3 105 161)",u=l?"monospace":"ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",d=l?"14px":"14.72px",h=l?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",g=o?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${i?"dark":"light"}" style="background:transparent;color-scheme:${i?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${Le(U())}">
  <meta http-equiv="Content-Security-Policy" content="${ke()}">
  <style data-capubbs-parent-styles>${$e(s)}</style>
  <style>
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:${m};font-family:${u};font-size:${d};line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${z}px);${h}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}a{color:${a}}img,video,canvas,svg{max-width:100%;height:auto}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]{background:linear-gradient(105deg,transparent 20%,rgba(255,255,255,.42) 45%,transparent 70%);background-color:rgba(128,128,128,.16);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}@keyframes capubbs-image-loading{from{background-position:120% 0}to{background-position:-80% 0}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]{animation:none}}pre{max-width:100%;overflow:auto;white-space:pre-wrap}table{max-width:100%}
  </style>
  <script>${Ne(t,r)}<\/script>
  <script src="/bbs/lib/jquery.min.js"><\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${c}${g}">${Re(n)}</main></body>
</html>`}function Ne(r,t){return`(function(){
    var frameId=${JSON.stringify(r)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var canOpenImages=${JSON.stringify(t)};
    var forumAppExactPaths=${JSON.stringify(te)};
    var forumAppPathPrefixes=${JSON.stringify(re)};
    var legacyForumExactPaths=${JSON.stringify(ae)};
    var legacyForumPathPatterns=${JSON.stringify(ne)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${Ae};
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
      window.parent.postMessage({source:'${j}',type:'resize',frameId:frameId,height:height},'*');
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
        window.parent.postMessage({source:'${j}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${j}',type:'navigate',frameId:frameId,url:url},'*');
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
      window.parent.postMessage({source:'${j}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
      if(event.source!==window.parent||!data||data.source!=='${j}'||data.type!=='gallery-select'||data.frameId!==frameId)return;
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
  }());`}function Re(r){return r.replace(/<script\b([^>]*)>/gi,(t,n)=>`<script${n.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function ke(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'"].join("; ")}function U(){return new URL("/bbs/content/",window.location.origin).href}function D(){return Array.from(document.styleSheets).map(r=>{try{return Array.from(r.cssRules).map(t=>t.cssText).join(`
`)}catch{const t=r.ownerNode;return t instanceof HTMLStyleElement?t.textContent??"":""}}).filter(Boolean).join(`
`)}function Te(){const[r,t]=p.useState(D);return p.useEffect(()=>{const n=()=>{const i=D();t(s=>s===i?s:i)},o=new MutationObserver(n);return o.observe(document.head,{attributes:!0,childList:!0,characterData:!0,subtree:!0}),n(),()=>o.disconnect()},[]),r}function $e(r){return r.replace(/<\/style/gi,"<\\/style")}function Le(r){return r.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Me(r){if(!r||typeof r!="object")return!1;const t=r;return t.source!==j||typeof t.frameId!="string"?!1:t.type==="anchor"?typeof t.offsetTop=="number"&&Number.isFinite(t.offsetTop)&&t.offsetTop>=0:t.type==="navigate"?typeof t.url=="string":t.type==="image-open"?typeof t.imageIndex=="number"&&Number.isSafeInteger(t.imageIndex)&&Array.isArray(t.images)&&t.images.length>0&&t.imageIndex>=0&&t.imageIndex<t.images.length&&t.images.every(n=>!!n&&typeof n=="object"&&typeof n.alt=="string"&&typeof n.src=="string"&&n.src.length>0&&(n.galleryId===void 0&&n.galleryIndex===void 0||typeof n.galleryId=="number"&&Number.isSafeInteger(n.galleryId)&&n.galleryId>=0&&typeof n.galleryIndex=="number"&&Number.isSafeInteger(n.galleryIndex)&&n.galleryIndex>=0)):t.type==="resize"&&typeof t.height=="number"&&Number.isFinite(t.height)}function Ce(){const[r,t]=p.useState(()=>document.documentElement.classList.contains("dark"));return p.useEffect(()=>{const n=document.documentElement,o=()=>t(n.classList.contains("dark")),i=new MutationObserver(o);return i.observe(n,{attributeFilter:["class"],attributes:!0}),()=>i.disconnect()},[]),r}function Fe({bodyClassName:r="thread-floor-body",bodyFallback:t=null,bodyHtml:n,floor:o,isActivitySignupCanceled:i=!1,onImageOpen:s,signatureClassName:c="thread-signature",signatureHtml:l,signatureText:m}){const a=s?(u,d,h,g)=>{const b=u[d];b&&s([b],0,h,g?()=>g(d):void 0)}:void 0;return e.jsxs(e.Fragment,{children:[n?e.jsx(G,{className:r,floor:o,html:n,isActivitySignupCanceled:i,onImageOpen:s,variant:"floor"}):t,l?e.jsx(G,{className:c,floor:o,html:l,onImageOpen:a,variant:"signature"}):m?e.jsx("footer",{className:c,children:e.jsx("p",{children:m})}):null]})}const He="自动保存至草稿箱",Pe=[{label:"不使用签名档",value:0},{label:"签名档 1",value:1},{label:"签名档 2",value:2},{label:"签名档 3",value:3}];function Ue({label:r="帖子标题",maxLength:t=120,onChange:n,placeholder:o="请输入帖子标题",required:i=!1,value:s}){return e.jsxs("label",{className:"post-editor-title-field",children:[r?e.jsx("span",{children:r}):null,e.jsx("input",{autoComplete:"off",maxLength:t,onChange:c=>n(c.target.value),placeholder:o,required:i,value:s}),e.jsxs("small",{children:[s.trim().length," / ",t]})]})}function Be({afterEditor:r,ariaLabel:t,attachmentDialogDescription:n,attachmentLabel:o="待上传附件",attachments:i,beforeEditor:s,className:c="",editorRef:l,editorValue:m,focusRequest:a,formatAttachmentMeta:u=R=>L(R.size),heading:d,headingMeta:h,id:g,name:b,onAddAttachments:E,onChange:S,onPreview:x,onRemoveAttachment:f,onSignatureChange:y,onSubmit:w,placeholder:A,previewDisabled:v=!1,secondaryActions:B,signatureIndex:K,status:N,statusIsError:M=!1,submitCompactLabel:W,submitDisabled:J=!1,submitIcon:V,submitLabel:C,uploadingAttachments:F=!1}){const[R,H]=p.useState(!1),P=g?`${g}-title`:`${b}-editor-title`,O=N===He;return e.jsxs("section",{"aria-labelledby":P,className:`reply-editor ${c}`.trim(),id:g,ref:l,children:[e.jsxs("header",{className:"reply-editor-heading",children:[e.jsx("h2",{id:P,children:d}),e.jsx("p",{children:h})]}),s,e.jsx("div",{className:"reply-editor-core",children:e.jsx(de,{ariaLabel:t,focusRequest:a,onChange:S,placeholder:A,value:m})}),r,e.jsx("div",{"aria-label":"选择签名档",className:"reply-signature-options",role:"radiogroup",children:Pe.map(I=>e.jsxs("label",{children:[e.jsx("input",{checked:K===I.value,name:b,onChange:()=>y(I.value),type:"radio",value:I.value}),I.label]},I.value))}),i.length>0&&e.jsx("ul",{className:"reply-attachments","aria-label":o,children:i.map(I=>e.jsxs("li",{children:[e.jsx(T,{size:13}),e.jsx("span",{children:I.name}),e.jsx("small",{children:u(I)}),e.jsx("button",{"aria-label":`移除附件 ${I.name}`,onClick:()=>f(I.id),type:"button",children:e.jsx($,{size:13})})]},I.id))}),e.jsxs("footer",{className:"reply-editor-footer",children:[e.jsxs("button",{className:"reply-secondary-button",disabled:F,onClick:()=>H(!0),type:"button",children:[e.jsx(T,{size:15}),e.jsx("span",{className:"reply-action-label-full",children:"添加附件"}),e.jsx("span",{className:"reply-action-label-compact",children:"附件"}),i.length>0&&e.jsx("span",{className:"reply-attachment-count",children:i.length})]}),N&&e.jsxs("span",{className:`reply-editor-status ${M?"thread-edit-error":""} ${O?"reply-editor-status-auto-save":""}`.trim(),role:M?"alert":"status",children:[O&&e.jsx("span",{"aria-hidden":"true",className:"reply-editor-auto-save-dot",children:"·"}),N]}),e.jsxs("div",{className:"reply-editor-submit",children:[e.jsxs("button",{className:"reply-secondary-button",disabled:v,onClick:x,type:"button",children:[e.jsx(ie,{size:15}),"预览"]}),B,e.jsxs("button",{className:"reply-publish-button",disabled:J,onClick:w,type:"button",children:[V,e.jsx("span",{className:"reply-action-label-full",children:C}),e.jsx("span",{className:"reply-action-label-compact",children:W??C})]})]})]}),R&&e.jsx(Oe,{attachments:i,description:n,formatAttachmentMeta:u,onAdd:E,onClose:()=>H(!1),onRemove:f,uploading:F})]})}function Ke({attachments:r,editorValue:t,formatAttachmentMeta:n=d=>L(d.size),label:o,onClose:i,previewAuthor:s,previewExtra:c,previewFloor:l,previewSignature:m,previewedAt:a,title:u}){return p.useEffect(()=>(document.body.classList.add("reply-preview-open"),()=>document.body.classList.remove("reply-preview-open")),[]),p.useEffect(()=>{function d(h){h.key==="Escape"&&i()}return document.addEventListener("keydown",d),()=>document.removeEventListener("keydown",d)},[i]),e.jsx("div",{className:"reply-preview-backdrop",onClick:i,role:"presentation",children:e.jsxs("section",{"aria-labelledby":"post-editor-preview-title","aria-modal":"true",className:"reply-preview-dialog",onClick:d=>d.stopPropagation(),role:"dialog",children:[e.jsxs("header",{children:[e.jsxs("div",{children:[e.jsx("span",{children:o}),e.jsx("h2",{id:"post-editor-preview-title",children:u})]}),e.jsx("button",{"aria-label":"关闭内容预览",onClick:i,type:"button",children:e.jsx($,{size:18})})]}),e.jsxs("div",{className:"reply-preview-stage",children:[e.jsxs("article",{className:"thread-floor reply-preview-floor",children:[e.jsx("div",{className:"thread-avatar-rail reply-preview-avatar-rail",children:e.jsx("div",{className:"thread-avatar-button",children:e.jsx("img",{src:s.avatar,alt:""})})}),e.jsxs("div",{className:"thread-floor-main",children:[e.jsxs("header",{className:"thread-floor-header",children:[e.jsx("div",{className:"thread-floor-author",children:e.jsx("strong",{children:s.name})}),e.jsx("div",{className:"thread-floor-time",children:e.jsx("time",{children:a})}),e.jsxs("span",{className:"thread-floor-index",children:["#",l]})]}),e.jsx(Fe,{bodyClassName:"thread-floor-body reply-preview-floor-body",bodyHtml:ue(t),floor:l,signatureHtml:m}),r.length>0&&e.jsx("ul",{className:"reply-preview-attachments","aria-label":"附件预览",children:r.map(d=>e.jsxs("li",{children:[e.jsx(T,{size:13}),e.jsx("span",{children:d.name}),e.jsx("small",{children:n(d)})]},d.id))})]})]}),c]}),e.jsx("footer",{children:e.jsx("button",{className:"reply-secondary-button",onClick:i,type:"button",children:"返回编辑"})})]})})}function Oe({attachments:r,description:t,formatAttachmentMeta:n,onAdd:o,onClose:i,onRemove:s,uploading:c}){const l=p.useRef(null);function m(a){o(Array.from(a.currentTarget.files??[])),a.currentTarget.value=""}return e.jsx("div",{className:"attachment-dialog-backdrop",onClick:i,role:"presentation",children:e.jsxs("section",{"aria-labelledby":"post-editor-attachment-dialog-title","aria-modal":"true",className:"attachment-dialog",onClick:a=>a.stopPropagation(),role:"dialog",children:[e.jsxs("header",{children:[e.jsx("span",{children:e.jsx(_,{size:17})}),e.jsx("h2",{id:"post-editor-attachment-dialog-title",children:"文件上传"}),e.jsx("button",{"aria-label":"关闭文件上传",onClick:i,type:"button",children:e.jsx($,{size:18})})]}),e.jsxs("button",{className:"attachment-drop-button",disabled:c,onClick:()=>l.current?.click(),type:"button",children:[e.jsx(_,{size:22}),e.jsx("strong",{children:c?"正在上传附件…":"选择一个或多个文件"}),e.jsx("span",{children:t})]}),e.jsx("input",{className:"sr-only",disabled:c,multiple:!0,onChange:m,ref:l,type:"file"}),r.length>0&&e.jsx("ul",{children:r.map(a=>e.jsxs("li",{children:[e.jsxs("div",{children:[e.jsx("strong",{children:a.name}),e.jsx("span",{children:n(a)})]}),e.jsx("button",{"aria-label":`移除附件 ${a.name}`,onClick:()=>s(a.id),type:"button",children:e.jsx(he,{size:15})})]},a.id))}),e.jsx("footer",{children:e.jsx("button",{className:"reply-publish-button",onClick:i,type:"button",children:"完成"})})]})})}function We(r){return r.mode!=="rich"?r.content.trim().length>0:ce(r.content)}function Je(r){const t=n=>String(n).padStart(2,"0");return`${r.getFullYear()}-${t(r.getMonth()+1)}-${t(r.getDate())} ${t(r.getHours())}:${t(r.getMinutes())}:${t(r.getSeconds())}`}function Ve(r){return L(r)}function L(r){return r<=0?"大小未知":r>=1024*1024?`${(r/1024/1024).toFixed(2)} MB`:`${Math.max(1,Math.round(r/1024))} KB`}export{He as A,be as F,Be as P,Fe as T,Ue as a,Ke as b,Je as c,Ve as f,We as h};
