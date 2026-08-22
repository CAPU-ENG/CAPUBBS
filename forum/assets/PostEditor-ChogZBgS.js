import{c as X,r as p,j as e,ap as Y,aq as Q,ag as Z,ab as ee,ar as te,as as re,at as ae,au as ne,X as $,a9 as ie}from"./index-Dp09W5m_.js";import{b as _,m as T,r as oe,f as se,h as le,R as ce,a as ue,C as D}from"./RichTextEditor-DKvnIuEo.js";import{m as de}from"./thread-DkVRljXb.js";import{r as me,a as ge,t as pe}from"./forumMarkup-CZSCGZYL.js";import{T as fe}from"./trash-2-GuQQSh_M.js";const he=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],N=X("paperclip",he);function be({className:t="",html:r,onImageOpen:i,variant:c}){const n=p.useRef(null);if(p.useEffect(()=>{const a=n.current;if(!a)return;const l=Array.from(a.querySelectorAll("img")),g=u=>{u.dataset.capubbsImageLoaded="true"},d=l.map(u=>{if(u.complete)return g(u),null;const f=()=>g(u);return u.addEventListener("load",f,{once:!0}),u.addEventListener("error",f,{once:!0}),{handleLoad:f,image:u}});return()=>{d.forEach(u=>{u&&(u.image.removeEventListener("load",u.handleLoad),u.image.removeEventListener("error",u.handleLoad))})}},[r]),!r)return null;function s(a,l){if(!i||!(a instanceof Element))return;const g=a.closest("img");if(!(g instanceof HTMLImageElement))return;const d=Array.from(l.querySelectorAll("img")),u=d.indexOf(g);u<0||i(d.map(f=>({alt:f.alt.trim(),src:f.currentSrc||f.src})),u,g)}function m(a){const l=_(a.target);if(l&&a.target instanceof Element){a.preventDefault(),a.stopPropagation(),T(a.target,l);return}!i||!(a.target instanceof HTMLImageElement)||(a.preventDefault(),s(a.target,a.currentTarget))}function o(a){const l=_(a.target);if(l&&["Enter"," "].includes(a.key)&&a.target instanceof Element){a.preventDefault(),T(a.target,l);return}if(["ArrowLeft","ArrowRight"].includes(a.key)&&a.target instanceof Element&&a.target.closest(".capubbs-gallery")){a.preventDefault(),T(a.target,a.key==="ArrowLeft"?"prev":"next");return}!i||!(a.target instanceof HTMLImageElement)||!["Enter"," "].includes(a.key)||(a.preventDefault(),s(a.target,a.currentTarget))}return e.jsx("div",{ref:n,className:`forum-markup forum-markup-${c} ${t}`.trim(),"data-forum-markup":c,dangerouslySetInnerHTML:{__html:r},onClick:m,onKeyDown:o})}const ye=28,ve=64,xe=5e4,we=30,U=30,j="capubbs-thread-html-frame";function q({className:t="",floor:r,html:i,isActivitySignupCanceled:c=!1,onImageOpen:n,variant:s}){const m=p.useMemo(()=>s==="signature"?oe(i):i,[i,s]),o=je(m,s==="signature"),a=me(o),l=p.useMemo(()=>a?null:ge(o,{normalizeLegacyLineBreaks:s==="signature"}),[o,a,s]),g=p.useMemo(()=>pe(o),[o]);return!a&&l!==null?e.jsx(be,{className:t,html:l,onImageOpen:n,variant:s}):e.jsx(Ee,{className:t,floor:r,html:g,isActivitySignupCanceled:c,onImageOpen:n,variant:s})}function Ee({className:t,floor:r,html:i,isActivitySignupCanceled:c,onImageOpen:n,variant:s}){const m=p.useRef(null),o=p.useRef(`${s}-${r}-${Math.random().toString(36).slice(2)}`),a=p.useRef(n);a.current=n;const l=s==="signature"?ye:ve,g=!!n,[d,u]=p.useState(null),f=Le(),E=ke(),A=p.useMemo(()=>Ae({canOpenImages:g,frameId:o.current,html:i,isActivitySignupCanceled:c,isDarkTheme:f,parentStyleText:E,variant:s}),[g,i,c,f,E,s]),I=p.useMemo(()=>`data:text/html;charset=utf-8,${encodeURIComponent(A)}`,[A]);return p.useEffect(()=>{u(null)},[I]),p.useEffect(()=>{function S(h){if(!(h.source!==m.current?.contentWindow||!$e(h.data))&&h.data.frameId===o.current){if(h.data.type==="anchor"){const b=m.current;if(!b)return;const v=window.getComputedStyle(document.documentElement),x=Number.parseFloat(v.getPropertyValue("--topbar-height"))||0,w=window.scrollY+b.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,w+h.data.offsetTop-x-16)});return}if(h.data.type==="navigate"){const b=Y(h.data.url,B());if(!b)return;window.history.pushState(null,"",b),window.dispatchEvent(new Event(Q));const v=new URL(b,window.location.origin);v.hash?window.requestAnimationFrame(()=>{const x=decodeURIComponent(v.hash.slice(1)),w=Z(`#${x}`);(w?ee(w):document.getElementById(x))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(h.data.type==="image-open"){const b=m.current;if(!b)return;a.current?.(h.data.images,h.data.imageIndex,b);return}u(Math.min(xe,Math.max(l,Math.ceil(h.data.height))))}}return window.addEventListener("message",S),()=>window.removeEventListener("message",S)},[l]),e.jsx("iframe",{ref:m,className:`thread-html-frame thread-html-frame-${s} ${t}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-same-origin",scrolling:"no",src:I,style:{"--thread-html-frame-width-allowance":`${U}px`,...d===null?{}:{"--thread-html-frame-height":`${d}px`}},title:s==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`})}function je(t,r){const[i,c]=p.useState(t);return p.useEffect(()=>{const n=new AbortController,s=r?se(t):[];if(c(t),s.length===0)return()=>n.abort();const m=Array.from(new Map(s.map(o=>[`${o.bid}:${o.tid}:${o.pid}`,o])).values());return Promise.all(m.map(async o=>{try{const a=await de(o,n.signal);return[`${o.bid}:${o.tid}:${o.pid}`,a]}catch(a){if(a instanceof DOMException&&a.name==="AbortError")throw a;return[`${o.bid}:${o.tid}:${o.pid}`,""]}})).then(o=>{if(n.signal.aborted)return;const a=new Map(o);let l=t;s.forEach(g=>{const d=a.get(`${g.bid}:${g.tid}:${g.pid}`);d&&(l=l.replace(g.marker,d))}),c(l)}).catch(()=>{}),()=>n.abort()},[r,t]),i}function Ae({canOpenImages:t,frameId:r,html:i,isActivitySignupCanceled:c,isDarkTheme:n,parentStyleText:s,variant:m}){const o=m==="signature",a=o?"#999999":n?"rgb(228 228 231)":"rgb(63 63 70)",l=n?"rgb(125 211 252)":"rgb(3 105 161)",g=o?"monospace":"ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",d=o?"14px":"14.72px",u=o?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",f=c?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${n?"dark":"light"}" style="background:transparent;color-scheme:${n?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${Ne(B())}">
  <meta http-equiv="Content-Security-Policy" content="${Re()}">
  <style data-capubbs-parent-styles>${Te(s)}</style>
  <style>
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:${a};font-family:${g};font-size:${d};line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${U}px);${u}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}a{color:${l}}img,video,canvas,svg{max-width:100%;height:auto}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]{background:linear-gradient(105deg,transparent 20%,rgba(255,255,255,.42) 45%,transparent 70%);background-color:rgba(128,128,128,.16);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}@keyframes capubbs-image-loading{from{background-position:120% 0}to{background-position:-80% 0}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]{animation:none}}pre{max-width:100%;overflow:auto;white-space:pre-wrap}table{max-width:100%}
  </style>
  <script>${Ie(r,t)}<\/script>
  <script src="/bbs/lib/jquery.min.js"><\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${m}${f}">${Se(i)}</main></body>
</html>`}function Ie(t,r){return`(function(){
    var frameId=${JSON.stringify(t)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var canOpenImages=${JSON.stringify(r)};
    var forumAppExactPaths=${JSON.stringify(te)};
    var forumAppPathPrefixes=${JSON.stringify(re)};
    var legacyForumExactPaths=${JSON.stringify(ae)};
    var legacyForumPathPatterns=${JSON.stringify(ne)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${we};
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
        return {alt:(candidate.alt||'').trim(),src:candidate.currentSrc||candidate.src||''};
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
    function moveGallery(target,direction){
      var gallery=target&&target.closest?target.closest('.capubbs-gallery'):null;
      if(!gallery)return false;
      var slides=Array.prototype.slice.call(gallery.querySelectorAll('[data-capubbs-gallery-slide="true"]'));
      if(slides.length<2)return false;
      var activeIndex=slides.findIndex(function(slide){return slide.getAttribute('data-capubbs-gallery-active')==='true';});
      var storedIndex=parseInt(gallery.getAttribute('data-capubbs-gallery-index')||'0',10);
      var currentIndex=activeIndex>=0?activeIndex:(Number.isFinite(storedIndex)&&storedIndex>=0&&storedIndex<slides.length?storedIndex:0);
      var nextIndex=(currentIndex+(direction==='next'?1:-1)+slides.length)%slides.length;
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
    function handleGalleryClick(event){
      if(event.defaultPrevented||event.button!==0)return;
      var actionTarget=event.target&&event.target.closest?event.target.closest('[data-capubbs-gallery-action]'):null;
      var action=actionTarget?actionTarget.getAttribute('data-capubbs-gallery-action'):'';
      if(action!=='prev'&&action!=='next')return;
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
      document.addEventListener('click',handleImageClick);
      document.addEventListener('keydown',handleImageKeyDown);
      document.addEventListener('click',handleForumNavigationClick);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(queueHeight);
      executeUserScripts();
      prepareImages();
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`}function Se(t){return t.replace(/<script\b([^>]*)>/gi,(r,i)=>`<script${i.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function Re(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'"].join("; ")}function B(){return new URL("/bbs/content/",window.location.origin).href}function z(){return Array.from(document.styleSheets).map(t=>{try{return Array.from(t.cssRules).map(r=>r.cssText).join(`
`)}catch{const r=t.ownerNode;return r instanceof HTMLStyleElement?r.textContent??"":""}}).filter(Boolean).join(`
`)}function ke(){const[t,r]=p.useState(z);return p.useEffect(()=>{const i=()=>{const n=z();r(s=>s===n?s:n)},c=new MutationObserver(i);return c.observe(document.head,{attributes:!0,childList:!0,characterData:!0,subtree:!0}),i(),()=>c.disconnect()},[]),t}function Te(t){return t.replace(/<\/style/gi,"<\\/style")}function Ne(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function $e(t){if(!t||typeof t!="object")return!1;const r=t;return r.source!==j||typeof r.frameId!="string"?!1:r.type==="anchor"?typeof r.offsetTop=="number"&&Number.isFinite(r.offsetTop)&&r.offsetTop>=0:r.type==="navigate"?typeof r.url=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(i=>!!i&&typeof i=="object"&&typeof i.alt=="string"&&typeof i.src=="string"&&i.src.length>0):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function Le(){const[t,r]=p.useState(()=>document.documentElement.classList.contains("dark"));return p.useEffect(()=>{const i=document.documentElement,c=()=>r(i.classList.contains("dark")),n=new MutationObserver(c);return n.observe(i,{attributeFilter:["class"],attributes:!0}),()=>n.disconnect()},[]),t}function Me({bodyClassName:t="thread-floor-body",bodyFallback:r=null,bodyHtml:i,floor:c,isActivitySignupCanceled:n=!1,onImageOpen:s,signatureClassName:m="thread-signature",signatureHtml:o,signatureText:a}){const l=s?(g,d,u)=>{const f=g[d];f&&s([f],0,u)}:void 0;return e.jsxs(e.Fragment,{children:[i?e.jsx(q,{className:t,floor:c,html:i,isActivitySignupCanceled:n,onImageOpen:s,variant:"floor"}):r,o?e.jsx(q,{className:m,floor:c,html:o,onImageOpen:l,variant:"signature"}):a?e.jsx("footer",{className:m,children:e.jsx("p",{children:a})}):null]})}const Ce="自动保存至草稿箱",Fe=[{label:"不使用签名档",value:0},{label:"签名档 1",value:1},{label:"签名档 2",value:2},{label:"签名档 3",value:3}];function ze({label:t="帖子标题",maxLength:r=120,onChange:i,placeholder:c="请输入帖子标题",required:n=!1,value:s}){return e.jsxs("label",{className:"post-editor-title-field",children:[t?e.jsx("span",{children:t}):null,e.jsx("input",{autoComplete:"off",maxLength:r,onChange:m=>i(m.target.value),placeholder:c,required:n,value:s}),e.jsxs("small",{children:[s.trim().length," / ",r]})]})}function Ue({afterEditor:t,ariaLabel:r,attachmentDialogDescription:i,attachmentLabel:c="待上传附件",attachments:n,beforeEditor:s,className:m="",editorRef:o,editorValue:a,focusRequest:l,formatAttachmentMeta:g=k=>L(k.size),heading:d,headingMeta:u,id:f,name:E,onAddAttachments:A,onChange:I,onPreview:S,onRemoveAttachment:h,onSignatureChange:b,onSubmit:v,placeholder:x,previewDisabled:w=!1,secondaryActions:G,signatureIndex:K,status:R,statusIsError:M=!1,submitCompactLabel:J,submitDisabled:W=!1,submitIcon:V,submitLabel:C,uploadingAttachments:F=!1}){const[k,H]=p.useState(!1),P=f?`${f}-title`:`${E}-editor-title`,O=R===Ce;return e.jsxs("section",{"aria-labelledby":P,className:`reply-editor ${m}`.trim(),id:f,ref:o,children:[e.jsxs("header",{className:"reply-editor-heading",children:[e.jsx("h2",{id:P,children:d}),e.jsx("p",{children:u})]}),s,e.jsx("div",{className:"reply-editor-core",children:e.jsx(ce,{ariaLabel:r,focusRequest:l,onChange:I,placeholder:x,value:a})}),t,e.jsx("div",{"aria-label":"选择签名档",className:"reply-signature-options",role:"radiogroup",children:Fe.map(y=>e.jsxs("label",{children:[e.jsx("input",{checked:K===y.value,name:E,onChange:()=>b(y.value),type:"radio",value:y.value}),y.label]},y.value))}),n.length>0&&e.jsx("ul",{className:"reply-attachments","aria-label":c,children:n.map(y=>e.jsxs("li",{children:[e.jsx(N,{size:13}),e.jsx("span",{children:y.name}),e.jsx("small",{children:g(y)}),e.jsx("button",{"aria-label":`移除附件 ${y.name}`,onClick:()=>h(y.id),type:"button",children:e.jsx($,{size:13})})]},y.id))}),e.jsxs("footer",{className:"reply-editor-footer",children:[e.jsxs("button",{className:"reply-secondary-button",disabled:F,onClick:()=>H(!0),type:"button",children:[e.jsx(N,{size:15}),e.jsx("span",{className:"reply-action-label-full",children:"添加附件"}),e.jsx("span",{className:"reply-action-label-compact",children:"附件"}),n.length>0&&e.jsx("span",{className:"reply-attachment-count",children:n.length})]}),R&&e.jsxs("span",{className:`reply-editor-status ${M?"thread-edit-error":""} ${O?"reply-editor-status-auto-save":""}`.trim(),role:M?"alert":"status",children:[O&&e.jsx("span",{"aria-hidden":"true",className:"reply-editor-auto-save-dot",children:"·"}),R]}),e.jsxs("div",{className:"reply-editor-submit",children:[e.jsxs("button",{className:"reply-secondary-button",disabled:w,onClick:S,type:"button",children:[e.jsx(ie,{size:15}),"预览"]}),G,e.jsxs("button",{className:"reply-publish-button",disabled:W,onClick:v,type:"button",children:[V,e.jsx("span",{className:"reply-action-label-full",children:C}),e.jsx("span",{className:"reply-action-label-compact",children:J??C})]})]})]}),k&&e.jsx(He,{attachments:n,description:i,formatAttachmentMeta:g,onAdd:A,onClose:()=>H(!1),onRemove:h,uploading:F})]})}function Be({attachments:t,editorValue:r,formatAttachmentMeta:i=d=>L(d.size),label:c,onClose:n,previewAuthor:s,previewExtra:m,previewFloor:o,previewSignature:a,previewedAt:l,title:g}){return p.useEffect(()=>(document.body.classList.add("reply-preview-open"),()=>document.body.classList.remove("reply-preview-open")),[]),p.useEffect(()=>{function d(u){u.key==="Escape"&&n()}return document.addEventListener("keydown",d),()=>document.removeEventListener("keydown",d)},[n]),e.jsx("div",{className:"reply-preview-backdrop",onClick:n,role:"presentation",children:e.jsxs("section",{"aria-labelledby":"post-editor-preview-title","aria-modal":"true",className:"reply-preview-dialog",onClick:d=>d.stopPropagation(),role:"dialog",children:[e.jsxs("header",{children:[e.jsxs("div",{children:[e.jsx("span",{children:c}),e.jsx("h2",{id:"post-editor-preview-title",children:g})]}),e.jsx("button",{"aria-label":"关闭内容预览",onClick:n,type:"button",children:e.jsx($,{size:18})})]}),e.jsxs("div",{className:"reply-preview-stage",children:[e.jsxs("article",{className:"thread-floor reply-preview-floor",children:[e.jsx("div",{className:"thread-avatar-rail reply-preview-avatar-rail",children:e.jsx("div",{className:"thread-avatar-button",children:e.jsx("img",{src:s.avatar,alt:""})})}),e.jsxs("div",{className:"thread-floor-main",children:[e.jsxs("header",{className:"thread-floor-header",children:[e.jsx("div",{className:"thread-floor-author",children:e.jsx("strong",{children:s.name})}),e.jsx("div",{className:"thread-floor-time",children:e.jsx("time",{children:l})}),e.jsxs("span",{className:"thread-floor-index",children:["#",o]})]}),e.jsx(Me,{bodyClassName:"thread-floor-body reply-preview-floor-body",bodyHtml:ue(r),floor:o,signatureHtml:a}),t.length>0&&e.jsx("ul",{className:"reply-preview-attachments","aria-label":"附件预览",children:t.map(d=>e.jsxs("li",{children:[e.jsx(N,{size:13}),e.jsx("span",{children:d.name}),e.jsx("small",{children:i(d)})]},d.id))})]})]}),m]}),e.jsx("footer",{children:e.jsx("button",{className:"reply-secondary-button",onClick:n,type:"button",children:"返回编辑"})})]})})}function He({attachments:t,description:r,formatAttachmentMeta:i,onAdd:c,onClose:n,onRemove:s,uploading:m}){const o=p.useRef(null);function a(l){c(Array.from(l.currentTarget.files??[])),l.currentTarget.value=""}return e.jsx("div",{className:"attachment-dialog-backdrop",onClick:n,role:"presentation",children:e.jsxs("section",{"aria-labelledby":"post-editor-attachment-dialog-title","aria-modal":"true",className:"attachment-dialog",onClick:l=>l.stopPropagation(),role:"dialog",children:[e.jsxs("header",{children:[e.jsx("span",{children:e.jsx(D,{size:17})}),e.jsx("h2",{id:"post-editor-attachment-dialog-title",children:"文件上传"}),e.jsx("button",{"aria-label":"关闭文件上传",onClick:n,type:"button",children:e.jsx($,{size:18})})]}),e.jsxs("button",{className:"attachment-drop-button",disabled:m,onClick:()=>o.current?.click(),type:"button",children:[e.jsx(D,{size:22}),e.jsx("strong",{children:m?"正在上传附件…":"选择一个或多个文件"}),e.jsx("span",{children:r})]}),e.jsx("input",{className:"sr-only",disabled:m,multiple:!0,onChange:a,ref:o,type:"file"}),t.length>0&&e.jsx("ul",{children:t.map(l=>e.jsxs("li",{children:[e.jsxs("div",{children:[e.jsx("strong",{children:l.name}),e.jsx("span",{children:i(l)})]}),e.jsx("button",{"aria-label":`移除附件 ${l.name}`,onClick:()=>s(l.id),type:"button",children:e.jsx(fe,{size:15})})]},l.id))}),e.jsx("footer",{children:e.jsx("button",{className:"reply-publish-button",onClick:n,type:"button",children:"完成"})})]})})}function Ge(t){return t.mode!=="rich"?t.content.trim().length>0:le(t.content)}function Ke(t){const r=i=>String(i).padStart(2,"0");return`${t.getFullYear()}-${r(t.getMonth()+1)}-${r(t.getDate())} ${r(t.getHours())}:${r(t.getMinutes())}:${r(t.getSeconds())}`}function Je(t){return L(t)}function L(t){return t<=0?"大小未知":t>=1024*1024?`${(t/1024/1024).toFixed(2)} MB`:`${Math.max(1,Math.round(t/1024))} KB`}export{Ce as A,be as F,Ue as P,Me as T,ze as a,Be as b,Ke as c,Je as f,Ge as h};
