import{c as Y,j as e,r as m,ak as W,al as Q,ab as Z,a8 as ee,am as te,an as re,ao as ae,ap as ne,X as k,a5 as ie}from"./index-D2br73zJ.js";import{b as _,m as R,r as oe,f as se,h as le,R as ce,a as ue,C as D}from"./RichTextEditor-CWLC4QWr.js";import{m as de}from"./thread-DMP94M0i.js";import{r as me,t as pe,a as ge}from"./forumMarkup-DJWDIhE_.js";import{T as fe}from"./trash-2-DDqIdBCQ.js";const he=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],$=Y("paperclip",he);function ye({className:r="",html:a,onImageOpen:i,variant:c}){if(!a)return null;function n(t,s){if(!i||!(t instanceof Element))return;const l=t.closest("img");if(!(l instanceof HTMLImageElement))return;const p=Array.from(s.querySelectorAll("img")),d=p.indexOf(l);d<0||i(p.map(g=>({alt:g.alt.trim(),src:g.currentSrc||g.src})),d,l)}function o(t){const s=_(t.target);if(s&&t.target instanceof Element){t.preventDefault(),t.stopPropagation(),R(t.target,s);return}!i||!(t.target instanceof HTMLImageElement)||(t.preventDefault(),n(t.target,t.currentTarget))}function u(t){const s=_(t.target);if(s&&["Enter"," "].includes(t.key)&&t.target instanceof Element){t.preventDefault(),R(t.target,s);return}if(["ArrowLeft","ArrowRight"].includes(t.key)&&t.target instanceof Element&&t.target.closest(".capubbs-gallery")){t.preventDefault(),R(t.target,t.key==="ArrowLeft"?"prev":"next");return}!i||!(t.target instanceof HTMLImageElement)||!["Enter"," "].includes(t.key)||(t.preventDefault(),n(t.target,t.currentTarget))}return e.jsx("div",{className:`forum-markup forum-markup-${c} ${r}`.trim(),"data-forum-markup":c,dangerouslySetInnerHTML:{__html:a},onClick:o,onKeyDown:u})}const be=28,xe=64,ve=5e4,we=30,z=30,E="capubbs-thread-html-frame";function q({className:r="",floor:a,html:i,isActivitySignupCanceled:c=!1,onImageOpen:n,variant:o}){const u=m.useMemo(()=>o==="signature"?oe(i):i,[i,o]),t=Ee(u,o==="signature"),s=m.useMemo(()=>me(t,{normalizeLegacyLineBreaks:o==="signature"}),[t,o]),l=m.useMemo(()=>pe(t),[t]);return ge(t)?e.jsx(je,{className:r,floor:a,html:l,isActivitySignupCanceled:c,onImageOpen:n,variant:o}):e.jsx(ye,{className:r,html:s,onImageOpen:n,variant:o})}function je({className:r,floor:a,html:i,isActivitySignupCanceled:c,onImageOpen:n,variant:o}){const u=m.useRef(null),t=m.useRef(`${o}-${a}-${Math.random().toString(36).slice(2)}`),s=m.useRef(n);s.current=n;const l=o==="signature"?be:xe,p=!!n,[d,g]=m.useState(null),h=Me(),j=Ne(),A=m.useMemo(()=>Ae({canOpenImages:p,frameId:t.current,html:i,isActivitySignupCanceled:c,isDarkTheme:h,parentStyleText:j,variant:o}),[p,i,c,h,j,o]),I=m.useMemo(()=>`data:text/html;charset=utf-8,${encodeURIComponent(A)}`,[A]);return m.useEffect(()=>{g(null)},[I]),m.useEffect(()=>{function S(f){if(!(f.source!==u.current?.contentWindow||!ke(f.data))&&f.data.frameId===t.current){if(f.data.type==="anchor"){const y=u.current;if(!y)return;const x=window.getComputedStyle(document.documentElement),v=Number.parseFloat(x.getPropertyValue("--topbar-height"))||0,w=window.scrollY+y.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,w+f.data.offsetTop-v-16)});return}if(f.data.type==="navigate"){const y=W(f.data.url,B());if(!y)return;window.history.pushState(null,"",y),window.dispatchEvent(new Event(Q));const x=new URL(y,window.location.origin);x.hash?window.requestAnimationFrame(()=>{const v=decodeURIComponent(x.hash.slice(1)),w=Z(`#${v}`);(w?ee(w):document.getElementById(v))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(f.data.type==="image-open"){const y=u.current;if(!y)return;s.current?.(f.data.images,f.data.imageIndex,y);return}g(Math.min(ve,Math.max(l,Math.ceil(f.data.height))))}}return window.addEventListener("message",S),()=>window.removeEventListener("message",S)},[l]),e.jsx("iframe",{ref:u,className:`thread-html-frame thread-html-frame-${o} ${r}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-same-origin",scrolling:"no",src:I,style:{"--thread-html-frame-width-allowance":`${z}px`,...d===null?{}:{"--thread-html-frame-height":`${d}px`}},title:o==="signature"?`第 ${a} 楼签名档`:`第 ${a} 楼正文`})}function Ee(r,a){const[i,c]=m.useState(r);return m.useEffect(()=>{const n=new AbortController,o=a?se(r):[];if(c(r),o.length===0)return()=>n.abort();const u=Array.from(new Map(o.map(t=>[`${t.bid}:${t.tid}:${t.pid}`,t])).values());return Promise.all(u.map(async t=>{try{const s=await de(t,n.signal);return[`${t.bid}:${t.tid}:${t.pid}`,s]}catch(s){if(s instanceof DOMException&&s.name==="AbortError")throw s;return[`${t.bid}:${t.tid}:${t.pid}`,""]}})).then(t=>{if(n.signal.aborted)return;const s=new Map(t);let l=r;o.forEach(p=>{const d=s.get(`${p.bid}:${p.tid}:${p.pid}`);d&&(l=l.replace(p.marker,d))}),c(l)}).catch(()=>{}),()=>n.abort()},[a,r]),i}function Ae({canOpenImages:r,frameId:a,html:i,isActivitySignupCanceled:c,isDarkTheme:n,parentStyleText:o,variant:u}){const t=u==="signature",s=t?"#999999":n?"rgb(228 228 231)":"rgb(63 63 70)",l=n?"rgb(125 211 252)":"rgb(3 105 161)",p=t?"monospace":"ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",d=t?"14px":"14.72px",g=t?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",h=c?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${n?"dark":"light"}" style="background:transparent;color-scheme:${n?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${$e(B())}">
  <meta http-equiv="Content-Security-Policy" content="${Te()}">
  <style data-capubbs-parent-styles>${Re(o)}</style>
  <style>
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:${s};font-family:${p};font-size:${d};line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${z}px);${g}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}a{color:${l}}img,video,canvas,svg{max-width:100%;height:auto}pre{max-width:100%;overflow:auto;white-space:pre-wrap}table{max-width:100%}
  </style>
  <script>${Ie(a,r)}<\/script>
  <script src="/bbs/lib/jquery.min.js"><\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${u}${h}">${Se(i)}</main></body>
</html>`}function Ie(r,a){return`(function(){
    var frameId=${JSON.stringify(r)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var canOpenImages=${JSON.stringify(a)};
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
      window.parent.postMessage({source:'${E}',type:'resize',frameId:frameId,height:height},'*');
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
        window.parent.postMessage({source:'${E}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${E}',type:'navigate',frameId:frameId,url:url},'*');
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
      window.parent.postMessage({source:'${E}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
    function prepareImages(){
      if(!canOpenImages)return;
      Array.prototype.forEach.call(document.images,function(image){
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
      Array.prototype.forEach.call(document.images,function(image){image.addEventListener('load',queueHeight);image.addEventListener('error',queueHeight);});
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
  }());`}function Se(r){return r.replace(/<script\b([^>]*)>/gi,(a,i)=>`<script${i.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function Te(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'"].join("; ")}function B(){return new URL("/bbs/content/",window.location.origin).href}function U(){return Array.from(document.styleSheets).map(r=>{try{return Array.from(r.cssRules).map(a=>a.cssText).join(`
`)}catch{const a=r.ownerNode;return a instanceof HTMLStyleElement?a.textContent??"":""}}).filter(Boolean).join(`
`)}function Ne(){const[r,a]=m.useState(U);return m.useEffect(()=>{const i=()=>{const n=U();a(o=>o===n?o:n)},c=new MutationObserver(i);return c.observe(document.head,{attributes:!0,childList:!0,characterData:!0,subtree:!0}),i(),()=>c.disconnect()},[]),r}function Re(r){return r.replace(/<\/style/gi,"<\\/style")}function $e(r){return r.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function ke(r){if(!r||typeof r!="object")return!1;const a=r;return a.source!==E||typeof a.frameId!="string"?!1:a.type==="anchor"?typeof a.offsetTop=="number"&&Number.isFinite(a.offsetTop)&&a.offsetTop>=0:a.type==="navigate"?typeof a.url=="string":a.type==="image-open"?typeof a.imageIndex=="number"&&Number.isSafeInteger(a.imageIndex)&&Array.isArray(a.images)&&a.images.length>0&&a.imageIndex>=0&&a.imageIndex<a.images.length&&a.images.every(i=>!!i&&typeof i=="object"&&typeof i.alt=="string"&&typeof i.src=="string"&&i.src.length>0):a.type==="resize"&&typeof a.height=="number"&&Number.isFinite(a.height)}function Me(){const[r,a]=m.useState(()=>document.documentElement.classList.contains("dark"));return m.useEffect(()=>{const i=document.documentElement,c=()=>a(i.classList.contains("dark")),n=new MutationObserver(c);return n.observe(i,{attributeFilter:["class"],attributes:!0}),()=>n.disconnect()},[]),r}function Ce({bodyClassName:r="thread-floor-body",bodyFallback:a=null,bodyHtml:i,floor:c,isActivitySignupCanceled:n=!1,onImageOpen:o,signatureClassName:u="thread-signature",signatureHtml:t,signatureText:s}){const l=o?(p,d,g)=>{const h=p[d];h&&o([h],0,g)}:void 0;return e.jsxs(e.Fragment,{children:[i?e.jsx(q,{className:r,floor:c,html:i,isActivitySignupCanceled:n,onImageOpen:o,variant:"floor"}):a,t?e.jsx(q,{className:u,floor:c,html:t,onImageOpen:l,variant:"signature"}):s?e.jsx("footer",{className:u,children:e.jsx("p",{children:s})}):null]})}const He="自动保存至草稿箱",Pe=[{label:"不使用签名档",value:0},{label:"签名档 1",value:1},{label:"签名档 2",value:2},{label:"签名档 3",value:3}];function Ue({label:r="帖子标题",maxLength:a=120,onChange:i,placeholder:c="请输入帖子标题",required:n=!1,value:o}){return e.jsxs("label",{className:"post-editor-title-field",children:[r?e.jsx("span",{children:r}):null,e.jsx("input",{autoComplete:"off",maxLength:a,onChange:u=>i(u.target.value),placeholder:c,required:n,value:o}),e.jsxs("small",{children:[o.trim().length," / ",a]})]})}function ze({afterEditor:r,ariaLabel:a,attachmentDialogDescription:i,attachmentLabel:c="待上传附件",attachments:n,beforeEditor:o,className:u="",editorRef:t,editorValue:s,focusRequest:l,formatAttachmentMeta:p=N=>M(N.size),heading:d,headingMeta:g,id:h,name:j,onAddAttachments:A,onChange:I,onPreview:S,onRemoveAttachment:f,onSignatureChange:y,onSubmit:x,placeholder:v,previewDisabled:w=!1,secondaryActions:G,signatureIndex:K,status:T,statusIsError:C=!1,submitCompactLabel:J,submitDisabled:V=!1,submitIcon:X,submitLabel:H,uploadingAttachments:P=!1}){const[N,F]=m.useState(!1),L=h?`${h}-title`:`${j}-editor-title`,O=T===He;return e.jsxs("section",{"aria-labelledby":L,className:`reply-editor ${u}`.trim(),id:h,ref:t,children:[e.jsxs("header",{className:"reply-editor-heading",children:[e.jsx("h2",{id:L,children:d}),e.jsx("p",{children:g})]}),o,e.jsx("div",{className:"reply-editor-core",children:e.jsx(ce,{ariaLabel:a,focusRequest:l,onChange:I,placeholder:v,value:s})}),r,e.jsx("div",{"aria-label":"选择签名档",className:"reply-signature-options",role:"radiogroup",children:Pe.map(b=>e.jsxs("label",{children:[e.jsx("input",{checked:K===b.value,name:j,onChange:()=>y(b.value),type:"radio",value:b.value}),b.label]},b.value))}),n.length>0&&e.jsx("ul",{className:"reply-attachments","aria-label":c,children:n.map(b=>e.jsxs("li",{children:[e.jsx($,{size:13}),e.jsx("span",{children:b.name}),e.jsx("small",{children:p(b)}),e.jsx("button",{"aria-label":`移除附件 ${b.name}`,onClick:()=>f(b.id),type:"button",children:e.jsx(k,{size:13})})]},b.id))}),e.jsxs("footer",{className:"reply-editor-footer",children:[e.jsxs("button",{className:"reply-secondary-button",disabled:P,onClick:()=>F(!0),type:"button",children:[e.jsx($,{size:15}),e.jsx("span",{className:"reply-action-label-full",children:"添加附件"}),e.jsx("span",{className:"reply-action-label-compact",children:"附件"}),n.length>0&&e.jsx("span",{className:"reply-attachment-count",children:n.length})]}),T&&e.jsxs("span",{className:`reply-editor-status ${C?"thread-edit-error":""} ${O?"reply-editor-status-auto-save":""}`.trim(),role:C?"alert":"status",children:[O&&e.jsx("span",{"aria-hidden":"true",className:"reply-editor-auto-save-dot",children:"·"}),T]}),e.jsxs("div",{className:"reply-editor-submit",children:[e.jsxs("button",{className:"reply-secondary-button",disabled:w,onClick:S,type:"button",children:[e.jsx(ie,{size:15}),"预览"]}),G,e.jsxs("button",{className:"reply-publish-button",disabled:V,onClick:x,type:"button",children:[X,e.jsx("span",{className:"reply-action-label-full",children:H}),e.jsx("span",{className:"reply-action-label-compact",children:J??H})]})]})]}),N&&e.jsx(Fe,{attachments:n,description:i,formatAttachmentMeta:p,onAdd:A,onClose:()=>F(!1),onRemove:f,uploading:P})]})}function Be({attachments:r,editorValue:a,formatAttachmentMeta:i=d=>M(d.size),label:c,onClose:n,previewAuthor:o,previewExtra:u,previewFloor:t,previewSignature:s,previewedAt:l,title:p}){return m.useEffect(()=>(document.body.classList.add("reply-preview-open"),()=>document.body.classList.remove("reply-preview-open")),[]),m.useEffect(()=>{function d(g){g.key==="Escape"&&n()}return document.addEventListener("keydown",d),()=>document.removeEventListener("keydown",d)},[n]),e.jsx("div",{className:"reply-preview-backdrop",onClick:n,role:"presentation",children:e.jsxs("section",{"aria-labelledby":"post-editor-preview-title","aria-modal":"true",className:"reply-preview-dialog",onClick:d=>d.stopPropagation(),role:"dialog",children:[e.jsxs("header",{children:[e.jsxs("div",{children:[e.jsx("span",{children:c}),e.jsx("h2",{id:"post-editor-preview-title",children:p})]}),e.jsx("button",{"aria-label":"关闭内容预览",onClick:n,type:"button",children:e.jsx(k,{size:18})})]}),e.jsxs("div",{className:"reply-preview-stage",children:[e.jsxs("article",{className:"thread-floor reply-preview-floor",children:[e.jsx("div",{className:"thread-avatar-rail reply-preview-avatar-rail",children:e.jsx("div",{className:"thread-avatar-button",children:e.jsx("img",{src:o.avatar,alt:""})})}),e.jsxs("div",{className:"thread-floor-main",children:[e.jsxs("header",{className:"thread-floor-header",children:[e.jsx("div",{className:"thread-floor-author",children:e.jsx("strong",{children:o.name})}),e.jsx("div",{className:"thread-floor-time",children:e.jsx("time",{children:l})}),e.jsxs("span",{className:"thread-floor-index",children:["#",t]})]}),e.jsx(Ce,{bodyClassName:"thread-floor-body reply-preview-floor-body",bodyHtml:ue(a),floor:t,signatureHtml:s}),r.length>0&&e.jsx("ul",{className:"reply-preview-attachments","aria-label":"附件预览",children:r.map(d=>e.jsxs("li",{children:[e.jsx($,{size:13}),e.jsx("span",{children:d.name}),e.jsx("small",{children:i(d)})]},d.id))})]})]}),u]}),e.jsx("footer",{children:e.jsx("button",{className:"reply-secondary-button",onClick:n,type:"button",children:"返回编辑"})})]})})}function Fe({attachments:r,description:a,formatAttachmentMeta:i,onAdd:c,onClose:n,onRemove:o,uploading:u}){const t=m.useRef(null);function s(l){c(Array.from(l.currentTarget.files??[])),l.currentTarget.value=""}return e.jsx("div",{className:"attachment-dialog-backdrop",onClick:n,role:"presentation",children:e.jsxs("section",{"aria-labelledby":"post-editor-attachment-dialog-title","aria-modal":"true",className:"attachment-dialog",onClick:l=>l.stopPropagation(),role:"dialog",children:[e.jsxs("header",{children:[e.jsx("span",{children:e.jsx(D,{size:17})}),e.jsx("h2",{id:"post-editor-attachment-dialog-title",children:"文件上传"}),e.jsx("button",{"aria-label":"关闭文件上传",onClick:n,type:"button",children:e.jsx(k,{size:18})})]}),e.jsxs("button",{className:"attachment-drop-button",disabled:u,onClick:()=>t.current?.click(),type:"button",children:[e.jsx(D,{size:22}),e.jsx("strong",{children:u?"正在上传附件…":"选择一个或多个文件"}),e.jsx("span",{children:a})]}),e.jsx("input",{className:"sr-only",disabled:u,multiple:!0,onChange:s,ref:t,type:"file"}),r.length>0&&e.jsx("ul",{children:r.map(l=>e.jsxs("li",{children:[e.jsxs("div",{children:[e.jsx("strong",{children:l.name}),e.jsx("span",{children:i(l)})]}),e.jsx("button",{"aria-label":`移除附件 ${l.name}`,onClick:()=>o(l.id),type:"button",children:e.jsx(fe,{size:15})})]},l.id))}),e.jsx("footer",{children:e.jsx("button",{className:"reply-publish-button",onClick:n,type:"button",children:"完成"})})]})})}function Ge(r){return r.mode!=="rich"?r.content.trim().length>0:le(r.content)}function Ke(r){const a=i=>String(i).padStart(2,"0");return`${r.getFullYear()}-${a(r.getMonth()+1)}-${a(r.getDate())} ${a(r.getHours())}:${a(r.getMinutes())}:${a(r.getSeconds())}`}function Je(r){return M(r)}function M(r){return r<=0?"大小未知":r>=1024*1024?`${(r/1024/1024).toFixed(2)} MB`:`${Math.max(1,Math.round(r/1024))} KB`}export{He as A,ye as F,ze as P,Ce as T,Ue as a,Be as b,Ke as c,Je as f,Ge as h};
