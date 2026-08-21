import{c as z,j as e,r as m,ai as J,aj as V,a9 as X,a6 as Y,X as k,a3 as Q}from"./index-DDm1CNAd.js";import{r as Z,f as ee,R as te,a as re}from"./RichTextEditor-CmgOno7E.js";import{m as ne}from"./thread-BmVzEqgB.js";import{r as ae,t as ie,a as se}from"./forumMarkup-C6dKq34n.js";import{T as oe}from"./trash-2-Dda7zV34.js";const le=[["path",{d:"M12 13v8",key:"1l5pq0"}],["path",{d:"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",key:"1pljnt"}],["path",{d:"m8 17 4-4 4 4",key:"1quai1"}]],P=z("cloud-upload",le);const ce=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],M=z("paperclip",ce);function ue({className:t="",html:r,onImageOpen:i,variant:l}){if(!r)return null;function a(n,u){if(!i||!(n instanceof Element))return;const o=n.closest("img");if(!(o instanceof HTMLImageElement))return;const p=Array.from(u.querySelectorAll("img")),d=p.indexOf(o);d<0||i(p.map(h=>({alt:h.alt.trim(),src:h.currentSrc||h.src})),d,o)}function s(n){!i||!(n.target instanceof HTMLImageElement)||(n.preventDefault(),a(n.target,n.currentTarget))}function c(n){!i||!(n.target instanceof HTMLImageElement)||!["Enter"," "].includes(n.key)||(n.preventDefault(),a(n.target,n.currentTarget))}return e.jsx("div",{className:`forum-markup forum-markup-${l} ${t}`.trim(),"data-forum-markup":l,dangerouslySetInnerHTML:{__html:r},onClick:s,onKeyDown:c})}const de=28,me=64,pe=5e4,he=30,_=30,N="capubbs-thread-html-frame";function q({className:t="",floor:r,html:i,isActivitySignupCanceled:l=!1,onImageOpen:a,variant:s}){const c=m.useMemo(()=>s==="signature"?Z(i):i,[i,s]),n=ge(c,s==="signature"),u=m.useMemo(()=>ae(n,{normalizeLegacyLineBreaks:s==="signature"}),[n,s]),o=m.useMemo(()=>ie(n),[n]);return se(n)?e.jsx(fe,{className:t,floor:r,html:o,isActivitySignupCanceled:l,onImageOpen:a,variant:s}):e.jsx(ue,{className:t,html:u,onImageOpen:a,variant:s})}function fe({className:t,floor:r,html:i,isActivitySignupCanceled:l,onImageOpen:a,variant:s}){const c=m.useRef(null),n=m.useRef(`${s}-${r}-${Math.random().toString(36).slice(2)}`),u=m.useRef(a);u.current=a;const o=s==="signature"?de:me,p=!!a,[d,h]=m.useState(null),g=Ie(),x=je(),v=m.useMemo(()=>be({canOpenImages:p,frameId:n.current,html:i,isActivitySignupCanceled:l,isDarkTheme:g,parentStyleText:x,variant:s}),[p,i,l,g,x,s]),j=m.useMemo(()=>`data:text/html;charset=utf-8,${encodeURIComponent(v)}`,[v]);return m.useEffect(()=>{h(null)},[j]),m.useEffect(()=>{function w(f){if(!(f.source!==c.current?.contentWindow||!$e(f.data))&&f.data.frameId===n.current){if(f.data.type==="navigate"){const y=J(f.data.url,D());if(!y)return;window.history.pushState(null,"",y),window.dispatchEvent(new Event(V));const E=new URL(y,window.location.origin);E.hash?window.requestAnimationFrame(()=>{const $=decodeURIComponent(E.hash.slice(1)),I=X(`#${$}`);(I?Y(I):document.getElementById($))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(f.data.type==="image-open"){const y=c.current;if(!y)return;u.current?.(f.data.images,f.data.imageIndex,y);return}h(Math.min(pe,Math.max(o,Math.ceil(f.data.height))))}}return window.addEventListener("message",w),()=>window.removeEventListener("message",w)},[o]),e.jsx("iframe",{ref:c,className:`thread-html-frame thread-html-frame-${s} ${t}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-same-origin",scrolling:"no",src:j,style:{"--thread-html-frame-width-allowance":`${_}px`,...d===null?{}:{"--thread-html-frame-height":`${d}px`}},title:s==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`})}function ge(t,r){const[i,l]=m.useState(t);return m.useEffect(()=>{const a=new AbortController,s=r?ee(t):[];if(l(t),s.length===0)return()=>a.abort();const c=Array.from(new Map(s.map(n=>[`${n.bid}:${n.tid}:${n.pid}`,n])).values());return Promise.all(c.map(async n=>{try{const u=await ne(n,a.signal);return[`${n.bid}:${n.tid}:${n.pid}`,u]}catch(u){if(u instanceof DOMException&&u.name==="AbortError")throw u;return[`${n.bid}:${n.tid}:${n.pid}`,""]}})).then(n=>{if(a.signal.aborted)return;const u=new Map(n);let o=t;s.forEach(p=>{const d=u.get(`${p.bid}:${p.tid}:${p.pid}`);d&&(o=o.replace(p.marker,d))}),l(o)}).catch(()=>{}),()=>a.abort()},[r,t]),i}function be({canOpenImages:t,frameId:r,html:i,isActivitySignupCanceled:l,isDarkTheme:a,parentStyleText:s,variant:c}){const n=c==="signature",u=n?"#999999":a?"rgb(228 228 231)":"rgb(63 63 70)",o=a?"rgb(125 211 252)":"rgb(3 105 161)",p=n?"monospace":"ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",d=n?"14px":"14.72px",h=n?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",g=l?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${a?"dark":"light"}" style="background:transparent;color-scheme:${a?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${Ee(D())}">
  <meta http-equiv="Content-Security-Policy" content="${ve()}">
  <style data-capubbs-parent-styles>${we(s)}</style>
  <style>
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:${u};font-family:${p};font-size:${d};line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${_}px);${h}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}a{color:${o}}img,video,canvas,svg{max-width:100%;height:auto}pre{max-width:100%;overflow:auto;white-space:pre-wrap}table{max-width:100%}
  </style>
  <script>${ye(r,t)}<\/script>
  <script src="/bbs/lib/jquery.min.js"><\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${c}${g}">${xe(i)}</main></body>
</html>`}function ye(t,r){return`(function(){
    var frameId=${JSON.stringify(t)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var canOpenImages=${JSON.stringify(r)};
    var minBottomGuard=${he};
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
      window.parent.postMessage({source:'${N}',type:'resize',frameId:frameId,height:height},'*');
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
    function getLegacyThreadUrl(target){
      var anchor=target&&target.closest?target.closest('a'):null;
      if(!anchor)return '';
      var href=anchor.getAttribute('href');
      if(!href)return '';
      try{
        var url=new URL(href,document.baseURI);
        var host=url.hostname.toLowerCase();
        var trusted=url.origin===forumOrigin||host==='chexie.net'||host.endsWith('.chexie.net');
        var path=url.pathname.replace(/\\/{2,}/g,'/').replace(/\\/+$/,'')||'/';
        var appPath=path.replace(/^\\/(?:bbs-new|capubbs-new)(?=\\/)/,'');
        var legacyPath=appPath==='/thread.php'||appPath==='/bbs/content'||appPath==='/bbs/content/index.php'||appPath==='/cgi-bin/bbs.pl'||/^\\/threads\\/\\d+-\\d+$/.test(appPath);
        return trusted&&legacyPath?url.href:'';
      }catch(error){return '';}
    }
    function handleLegacyThreadClick(event){
      if(event.defaultPrevented||event.button!==0||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getLegacyThreadUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${N}',type:'navigate',frameId:frameId,url:url},'*');
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
      window.parent.postMessage({source:'${N}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
    function init(){
      var contentRoot=document.querySelector('.capubbs-html-frame-root');
      if(window.ResizeObserver&&contentRoot)new ResizeObserver(queueHeight).observe(contentRoot);
      if(window.MutationObserver&&contentRoot)new MutationObserver(function(){queueHeight();prepareImages();}).observe(contentRoot,{attributes:true,characterData:true,childList:true,subtree:true});
      Array.prototype.forEach.call(document.images,function(image){image.addEventListener('load',queueHeight);image.addEventListener('error',queueHeight);});
      window.addEventListener('load',queueHeight);
      document.addEventListener('transitionend',queueHeight);
      document.addEventListener('animationend',queueHeight);
      document.addEventListener('click',handleImageClick);
      document.addEventListener('keydown',handleImageKeyDown);
      document.addEventListener('click',handleLegacyThreadClick);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(queueHeight);
      executeUserScripts();
      prepareImages();
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`}function xe(t){return t.replace(/<script\b([^>]*)>/gi,(r,i)=>`<script${i.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function ve(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'"].join("; ")}function D(){return new URL("/bbs/content/",window.location.origin).href}function O(){return Array.from(document.styleSheets).map(t=>{try{return Array.from(t.cssRules).map(r=>r.cssText).join(`
`)}catch{const r=t.ownerNode;return r instanceof HTMLStyleElement?r.textContent??"":""}}).filter(Boolean).join(`
`)}function je(){const[t,r]=m.useState(O);return m.useEffect(()=>{const i=()=>{const a=O();r(s=>s===a?s:a)},l=new MutationObserver(i);return l.observe(document.head,{attributes:!0,childList:!0,characterData:!0,subtree:!0}),i(),()=>l.disconnect()},[]),t}function we(t){return t.replace(/<\/style/gi,"<\\/style")}function Ee(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function $e(t){if(!t||typeof t!="object")return!1;const r=t;return r.source!==N||typeof r.frameId!="string"?!1:r.type==="navigate"?typeof r.url=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(i=>!!i&&typeof i=="object"&&typeof i.alt=="string"&&typeof i.src=="string"&&i.src.length>0):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function Ie(){const[t,r]=m.useState(()=>document.documentElement.classList.contains("dark"));return m.useEffect(()=>{const i=document.documentElement,l=()=>r(i.classList.contains("dark")),a=new MutationObserver(l);return a.observe(i,{attributeFilter:["class"],attributes:!0}),()=>a.disconnect()},[]),t}function Ne({bodyClassName:t="thread-floor-body",bodyFallback:r=null,bodyHtml:i,floor:l,isActivitySignupCanceled:a=!1,onImageOpen:s,signatureClassName:c="thread-signature",signatureHtml:n,signatureText:u}){const o=s?(p,d,h)=>{const g=p[d];g&&s([g],0,h)}:void 0;return e.jsxs(e.Fragment,{children:[i?e.jsx(q,{className:t,floor:l,html:i,isActivitySignupCanceled:a,onImageOpen:s,variant:"floor"}):r,n?e.jsx(q,{className:c,floor:l,html:n,onImageOpen:o,variant:"signature"}):u?e.jsx("footer",{className:c,children:e.jsx("p",{children:u})}):null]})}const Se=[{label:"不使用签名档",value:0},{label:"签名档 1",value:1},{label:"签名档 2",value:2},{label:"签名档 3",value:3}];function Le({label:t="帖子标题",maxLength:r=120,onChange:i,placeholder:l="请输入帖子标题",required:a=!1,value:s}){return e.jsxs("label",{className:"post-editor-title-field",children:[t?e.jsx("span",{children:t}):null,e.jsx("input",{autoComplete:"off",maxLength:r,onChange:c=>i(c.target.value),placeholder:l,required:a,value:s}),e.jsxs("small",{children:[s.trim().length," / ",r]})]})}function Ae({afterEditor:t,ariaLabel:r,attachmentDialogDescription:i,attachmentLabel:l="待上传附件",attachments:a,beforeEditor:s,className:c="",editorRef:n,editorValue:u,focusRequest:o,formatAttachmentMeta:p=S=>H(S.size),heading:d,headingMeta:h,id:g,name:x,onAddAttachments:v,onChange:j,onPreview:w,onRemoveAttachment:f,onSignatureChange:y,onSubmit:E,placeholder:$,previewDisabled:I=!1,secondaryActions:B,signatureIndex:U,status:R,statusIsError:T=!1,submitCompactLabel:K,submitDisabled:G=!1,submitIcon:W,submitLabel:C,uploadingAttachments:L=!1}){const[S,A]=m.useState(!1),F=g?`${g}-title`:`${x}-editor-title`;return e.jsxs("section",{"aria-labelledby":F,className:`reply-editor ${c}`.trim(),id:g,ref:n,children:[e.jsxs("header",{className:"reply-editor-heading",children:[e.jsx("h2",{id:F,children:d}),e.jsx("p",{children:h})]}),s,e.jsx("div",{className:"reply-editor-core",children:e.jsx(te,{ariaLabel:r,focusRequest:o,onChange:j,placeholder:$,value:u})}),t,e.jsx("div",{"aria-label":"选择签名档",className:"reply-signature-options",role:"radiogroup",children:Se.map(b=>e.jsxs("label",{children:[e.jsx("input",{checked:U===b.value,name:x,onChange:()=>y(b.value),type:"radio",value:b.value}),b.label]},b.value))}),a.length>0&&e.jsx("ul",{className:"reply-attachments","aria-label":l,children:a.map(b=>e.jsxs("li",{children:[e.jsx(M,{size:13}),e.jsx("span",{children:b.name}),e.jsx("small",{children:p(b)}),e.jsx("button",{"aria-label":`移除附件 ${b.name}`,onClick:()=>f(b.id),type:"button",children:e.jsx(k,{size:13})})]},b.id))}),e.jsxs("footer",{className:"reply-editor-footer",children:[e.jsxs("button",{className:"reply-secondary-button",disabled:L,onClick:()=>A(!0),type:"button",children:[e.jsx(M,{size:15}),e.jsx("span",{className:"reply-action-label-full",children:"添加附件"}),e.jsx("span",{className:"reply-action-label-compact",children:"附件"}),a.length>0&&e.jsx("span",{className:"reply-attachment-count",children:a.length})]}),R&&e.jsx("span",{className:`reply-editor-status ${T?"thread-edit-error":""}`,role:T?"alert":"status",children:R}),e.jsxs("div",{className:"reply-editor-submit",children:[e.jsxs("button",{className:"reply-secondary-button",disabled:I,onClick:w,type:"button",children:[e.jsx(Q,{size:15}),"预览"]}),B,e.jsxs("button",{className:"reply-publish-button",disabled:G,onClick:E,type:"button",children:[W,e.jsx("span",{className:"reply-action-label-full",children:C}),e.jsx("span",{className:"reply-action-label-compact",children:K??C})]})]})]}),S&&e.jsx(Me,{attachments:a,description:i,formatAttachmentMeta:p,onAdd:v,onClose:()=>A(!1),onRemove:f,uploading:L})]})}function Fe({attachments:t,editorValue:r,formatAttachmentMeta:i=d=>H(d.size),label:l,onClose:a,previewAuthor:s,previewExtra:c,previewFloor:n,previewSignature:u,previewedAt:o,title:p}){return m.useEffect(()=>(document.body.classList.add("reply-preview-open"),()=>document.body.classList.remove("reply-preview-open")),[]),m.useEffect(()=>{function d(h){h.key==="Escape"&&a()}return document.addEventListener("keydown",d),()=>document.removeEventListener("keydown",d)},[a]),e.jsx("div",{className:"reply-preview-backdrop",onClick:a,role:"presentation",children:e.jsxs("section",{"aria-labelledby":"post-editor-preview-title","aria-modal":"true",className:"reply-preview-dialog",onClick:d=>d.stopPropagation(),role:"dialog",children:[e.jsxs("header",{children:[e.jsxs("div",{children:[e.jsx("span",{children:l}),e.jsx("h2",{id:"post-editor-preview-title",children:p})]}),e.jsx("button",{"aria-label":"关闭内容预览",onClick:a,type:"button",children:e.jsx(k,{size:18})})]}),e.jsxs("div",{className:"reply-preview-stage",children:[e.jsxs("article",{className:"thread-floor reply-preview-floor",children:[e.jsx("div",{className:"thread-avatar-rail reply-preview-avatar-rail",children:e.jsx("div",{className:"thread-avatar-button",children:e.jsx("img",{src:s.avatar,alt:""})})}),e.jsxs("div",{className:"thread-floor-main",children:[e.jsxs("header",{className:"thread-floor-header",children:[e.jsx("div",{className:"thread-floor-author",children:e.jsx("strong",{children:s.name})}),e.jsx("div",{className:"thread-floor-time",children:e.jsx("time",{children:o})}),e.jsxs("span",{className:"thread-floor-index",children:["#",n]})]}),e.jsx(Ne,{bodyClassName:"thread-floor-body reply-preview-floor-body",bodyHtml:re(r),floor:n,signatureHtml:u}),t.length>0&&e.jsx("ul",{className:"reply-preview-attachments","aria-label":"附件预览",children:t.map(d=>e.jsxs("li",{children:[e.jsx(M,{size:13}),e.jsx("span",{children:d.name}),e.jsx("small",{children:i(d)})]},d.id))})]})]}),c]}),e.jsx("footer",{children:e.jsx("button",{className:"reply-secondary-button",onClick:a,type:"button",children:"返回编辑"})})]})})}function Me({attachments:t,description:r,formatAttachmentMeta:i,onAdd:l,onClose:a,onRemove:s,uploading:c}){const n=m.useRef(null);function u(o){l(Array.from(o.currentTarget.files??[])),o.currentTarget.value=""}return e.jsx("div",{className:"attachment-dialog-backdrop",onClick:a,role:"presentation",children:e.jsxs("section",{"aria-labelledby":"post-editor-attachment-dialog-title","aria-modal":"true",className:"attachment-dialog",onClick:o=>o.stopPropagation(),role:"dialog",children:[e.jsxs("header",{children:[e.jsx("span",{children:e.jsx(P,{size:17})}),e.jsx("h2",{id:"post-editor-attachment-dialog-title",children:"文件上传"}),e.jsx("button",{"aria-label":"关闭文件上传",onClick:a,type:"button",children:e.jsx(k,{size:18})})]}),e.jsxs("button",{className:"attachment-drop-button",disabled:c,onClick:()=>n.current?.click(),type:"button",children:[e.jsx(P,{size:22}),e.jsx("strong",{children:c?"正在上传附件…":"选择一个或多个文件"}),e.jsx("span",{children:r})]}),e.jsx("input",{className:"sr-only",disabled:c,multiple:!0,onChange:u,ref:n,type:"file"}),t.length>0&&e.jsx("ul",{children:t.map(o=>e.jsxs("li",{children:[e.jsxs("div",{children:[e.jsx("strong",{children:o.name}),e.jsx("span",{children:i(o)})]}),e.jsx("button",{"aria-label":`移除附件 ${o.name}`,onClick:()=>s(o.id),type:"button",children:e.jsx(oe,{size:15})})]},o.id))}),e.jsx("footer",{children:e.jsx("button",{className:"reply-publish-button",onClick:a,type:"button",children:"完成"})})]})})}function Pe(t){if(t.mode!=="rich")return t.content.trim().length>0;const r=document.createElement("div");return r.innerHTML=t.content,(r.textContent??"").replace(/\u00a0/g," ").trim().length>0||!!r.querySelector("img, hr")}function qe(t){const r=i=>String(i).padStart(2,"0");return`${t.getFullYear()}-${r(t.getMonth()+1)}-${r(t.getDate())} ${r(t.getHours())}:${r(t.getMinutes())}:${r(t.getSeconds())}`}function Oe(t){return H(t)}function H(t){return t<=0?"大小未知":t>=1024*1024?`${(t/1024/1024).toFixed(2)} MB`:`${Math.max(1,Math.round(t/1024))} KB`}export{ue as F,Ae as P,Ne as T,Le as a,Fe as b,qe as c,Oe as f,Pe as h};
