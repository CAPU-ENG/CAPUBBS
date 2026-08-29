import{p as ze,r as s,j as e,$ as _e,X as ge,b as qe,d as Ge,aO as Ue,av as Be,aP as Ke,aB as Ye,ap as We,aQ as Xe,aR as Je,aS as Ve,aT as Qe,aU as Ze,G as se,x as et,K as tt,aM as rt}from"./index-DC9YaaXO.js";import{e as be,m as le,s as at,f as nt,r as st,h as it,b as me,a as we,P as je}from"./RichTextEditor.gallery-DekpLta2.js";import{P as ot}from"./plus-DaV3ezXI.js";import{R as lt}from"./rotate-ccw-BS4yBSK_.js";import{l as ct}from"./thread-C0_Xr4Y_.js";import{a as dt,r as ut,t as gt}from"./forumMarkup-Bo9agHId.js";import{D as Re,T as ce}from"./TagBadge-BVqynCGt.js";import{T as fe}from"./trash-2-wlCi0AOI.js";import{P as xe}from"./pencil-DDuP09A8.js";import{E as mt}from"./external-link-BI9CFYvJ.js";import{T as ft}from"./triangle-alert-Dfb7ycs4.js";const pt=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],ht=ze("reply",pt);async function yt(t){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(t),!0}catch{}const r=document.createElement("textarea");r.value=t,r.setAttribute("readonly",""),r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select();try{return document.execCommand("copy")}finally{r.remove()}}function Ee({className:t="",html:r,onImageOpen:n,variant:f}){const a=s.useRef(null),i=s.useMemo(()=>({__html:r}),[r]);if(s.useEffect(()=>{const o=a.current;if(!o)return;const u=Array.from(o.querySelectorAll("img")),y=h=>{h.dataset.capubbsImageLoaded="true"},w=u.map(h=>{if(h.complete)return y(h),null;const j=()=>y(h);return h.addEventListener("load",j,{once:!0}),h.addEventListener("error",j,{once:!0}),{handleLoad:j,image:h}});return()=>{w.forEach(h=>{h&&(h.image.removeEventListener("load",h.handleLoad),h.image.removeEventListener("error",h.handleLoad))})}},[r]),!r)return null;function m(o,u){if(!n||!(o instanceof Element))return;const y=o.closest("img");if(!(y instanceof HTMLImageElement))return;const w=Array.from(u.querySelectorAll("img")),h=w.indexOf(y);if(h<0)return;const j=w.map(R=>bt(R,u)),$=w.map((R,v)=>{const S=j[v];return{alt:R.alt.trim(),src:R.currentSrc||R.src,...S?{galleryId:S.galleryId,galleryIndex:S.galleryIndex}:{}}});n($,h,y,R=>{const v=j[R];v&&at(v.gallery,v.galleryIndex)})}function l(o){const u=be(o.target);if(u&&o.target instanceof Element){o.preventDefault(),o.stopPropagation(),le(o.target,u);return}!n||!(o.target instanceof HTMLImageElement)||(o.preventDefault(),m(o.target,o.currentTarget))}function p(o){const u=be(o.target);if(u&&["Enter"," "].includes(o.key)&&o.target instanceof Element){o.preventDefault(),le(o.target,u);return}if(["ArrowLeft","ArrowRight"].includes(o.key)&&o.target instanceof Element&&o.target.closest(".capubbs-gallery")){o.preventDefault(),le(o.target,o.key==="ArrowLeft"?"prev":"next");return}!n||!(o.target instanceof HTMLImageElement)||!["Enter"," "].includes(o.key)||(o.preventDefault(),m(o.target,o.currentTarget))}return e.jsx("div",{ref:a,className:`forum-markup forum-markup-${f} ${t}`.trim(),"data-forum-markup":f,dangerouslySetInnerHTML:i,onClick:l,onKeyDown:p})}function bt(t,r){const n=t.closest(".capubbs-gallery");if(!n||!r.contains(n))return null;const a=Array.from(r.querySelectorAll(".capubbs-gallery")).indexOf(n),m=Array.from(n.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(t);return a>=0&&m>=0?{gallery:n,galleryId:a,galleryIndex:m}:null}const C=1,Se=4,ie=.25;function xt(t){return Math.min(Se,Math.max(C,t))}function de(t){const[r,n]=[...t.values()];return!r||!n?null:Math.hypot(n.x-r.x,n.y-r.y)}function vt({images:t,initialImageIndex:r,onImageChange:n,onClose:f}){const a=Math.min(Math.max(0,r),Math.max(0,t.length-1)),[i,m]=s.useState(a),[l,p]=s.useState(C),[o,u]=s.useState({x:0,y:0}),[y,w]=s.useState(!1),h=s.useRef(null),j=s.useRef(null),$=s.useRef(null),M=s.useRef(null),R=s.useRef(a),v=s.useRef(C),S=s.useRef({x:0,y:0}),P=s.useRef(null),E=s.useRef(!1),I=s.useRef(new Map),k=s.useRef(null),F=s.useRef(C),N=s.useRef(n),Q=s.useRef(f);N.current=n,Q.current=f;function Z(c,b=v.current){const x=h.current,L=$.current;if(!x||!L||b<=C)return{x:0,y:0};const D=Math.max(0,(L.clientWidth*b-x.clientWidth)/2),A=Math.max(0,(L.clientHeight*b-x.clientHeight)/2);return{x:Math.min(D,Math.max(-D,c.x)),y:Math.min(A,Math.max(-A,c.y))}}function B(c,b=v.current){const x=Z(c,b);S.current=x,u(x)}function z(c){const b=Math.round(xt(c)*100)/100;v.current=b,p(b),B(S.current,b)}function G(){v.current=C,S.current={x:0,y:0},p(C),u({x:0,y:0})}function Y(c){const b=Math.min(Math.max(0,c),t.length-1);b!==R.current&&(R.current=b,m(b),G(),N.current?.(b))}function X(){Q.current(R.current)}s.useEffect(()=>{const c=document.body.style.overflow,b=document.activeElement,x=h.current;document.body.style.overflow="hidden",M.current?.focus();function L(g){if(g.key==="Escape"){g.preventDefault(),X();return}if(g.key==="ArrowLeft"){g.preventDefault(),g.stopPropagation(),Y(R.current-1);return}if(g.key==="ArrowRight"){g.preventDefault(),g.stopPropagation(),Y(R.current+1);return}if(g.key==="+"||g.key==="="){g.preventDefault(),g.stopPropagation(),z(v.current+ie);return}if(g.key==="-"){g.preventDefault(),g.stopPropagation(),z(v.current-ie);return}if(g.key==="0"){g.preventDefault(),g.stopPropagation(),G();return}if(g.key==="Tab"){const O=j.current?.querySelectorAll("button:not(:disabled)");if(!O?.length)return;const V=O[0],ae=O[O.length-1],ne=document.activeElement;if(g.shiftKey&&ne===V){g.preventDefault(),ae.focus();return}if(!g.shiftKey&&ne===ae){g.preventDefault(),V.focus();return}j.current?.contains(ne)||(g.preventDefault(),V.focus())}}function D(g){if(g.preventDefault(),g.stopPropagation(),g.deltaY===0)return;const O=g.ctrlKey?.01:.002;z(v.current*Math.exp(-g.deltaY*O))}function A(g){g.preventDefault(),g.stopPropagation(),F.current=v.current}function H(g){if(g.preventDefault(),g.stopPropagation(),I.current.size>=2)return;const O=g.scale;typeof O=="number"&&z(F.current*O)}function re(){B(S.current,v.current)}return document.addEventListener("keydown",L,{capture:!0}),window.addEventListener("resize",re),x?.addEventListener("wheel",D,{passive:!1}),x?.addEventListener("gesturestart",A,{passive:!1}),x?.addEventListener("gesturechange",H,{passive:!1}),x?.addEventListener("gestureend",H,{passive:!1}),()=>{document.removeEventListener("keydown",L,{capture:!0}),window.removeEventListener("resize",re),x?.removeEventListener("wheel",D),x?.removeEventListener("gesturestart",A),x?.removeEventListener("gesturechange",H),x?.removeEventListener("gestureend",H),document.body.style.overflow=c,b instanceof HTMLElement&&b.focus()}},[]),s.useEffect(()=>{[t[i-1],t[i+1]].forEach(c=>{if(!c)return;const b=new Image;b.src=c.src})},[i,t]);function ee(c,b,x){P.current={pointerId:c,startX:b,startY:x,originX:S.current.x,originY:S.current.y},w(!0)}function W(c){if(c.target instanceof Element&&c.target.closest("button, .thread-image-lightbox-controls"))return;const b=c.pointerType==="touch",x=c.pointerType==="mouse"&&c.button===0;if(!(!b&&!x)&&(E.current=!1,!(!b&&v.current<=C))){if(c.preventDefault(),c.currentTarget.setPointerCapture(c.pointerId),b&&(I.current.set(c.pointerId,{x:c.clientX,y:c.clientY}),I.current.size===2)){k.current=de(I.current),P.current=null,w(!1);return}v.current>C&&ee(c.pointerId,c.clientX,c.clientY)}}function J(c){const b=I.current.has(c.pointerId),x=P.current;if(!b&&x?.pointerId!==c.pointerId)return;if(c.preventDefault(),c.stopPropagation(),b&&I.current.set(c.pointerId,{x:c.clientX,y:c.clientY}),I.current.size===2){const A=de(I.current),H=k.current;if(!A||!H){k.current=A;return}Math.abs(A-H)>1&&(E.current=!0),z(v.current*(A/H)),k.current=A;return}if(!x||v.current<=C)return;const L=c.clientX-x.startX,D=c.clientY-x.startY;Math.hypot(L,D)>3&&(E.current=!0),B({x:x.originX+L,y:x.originY+D})}function te(c){const b=I.current.delete(c.pointerId),x=P.current?.pointerId===c.pointerId;if(!(!b&&!x)){if(k.current=I.current.size===2?de(I.current):null,I.current.size===1&&v.current>C){const[L]=I.current.entries();if(L){const[D,A]=L;ee(D,A.x,A.y)}}else P.current=null,w(!1);c.currentTarget.hasPointerCapture(c.pointerId)&&c.currentTarget.releasePointerCapture(c.pointerId)}}const U=Math.round(l*100),_=t[i]??t[0];return _?_e.createPortal(e.jsx("div",{className:"thread-image-lightbox-backdrop","data-can-pan":l>C,"data-dragging":y,onClick:c=>{c.target===c.currentTarget&&!E.current&&X()},onPointerCancel:te,onPointerDown:W,onPointerMove:J,onPointerUp:te,ref:h,role:"presentation",children:e.jsxs("figure",{"aria-label":_.alt?`图片预览：${_.alt}（${i+1}/${t.length}）`:`图片预览（${i+1}/${t.length}）`,"aria-modal":"true",className:"thread-image-lightbox",ref:j,role:"dialog",children:[e.jsx("button",{"aria-label":"关闭图片预览",className:"thread-image-lightbox-close",onClick:X,ref:M,type:"button",children:e.jsx(ge,{size:20})}),t.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{"aria-label":"上一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-prev",disabled:i===0,onClick:()=>Y(i-1),title:"上一张（←）",type:"button",children:e.jsx(qe,{size:28})}),e.jsx("button",{"aria-label":"下一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-next",disabled:i===t.length-1,onClick:()=>Y(i+1),title:"下一张（→）",type:"button",children:e.jsx(Ge,{size:28})})]}),e.jsx("img",{alt:_.alt,draggable:"false",onLoad:()=>B(S.current,v.current),ref:$,src:_.src,style:{transform:`translate3d(${o.x}px, ${o.y}px, 0) scale(${l})`}}),_.alt&&e.jsx("figcaption",{children:_.alt}),e.jsxs("div",{"aria-label":"图片缩放",className:"thread-image-lightbox-controls",role:"toolbar",children:[e.jsx("button",{"aria-label":"缩小图片",disabled:l<=C,onClick:()=>z(l-ie),title:"缩小（-）",type:"button",children:e.jsx(nt,{size:18})}),e.jsxs("output",{"aria-label":"当前缩放比例","aria-live":"polite",children:[U,"%"]}),e.jsx("button",{"aria-label":"放大图片",disabled:l>=Se,onClick:()=>z(l+ie),title:"放大（+）",type:"button",children:e.jsx(ot,{size:18})}),e.jsx("button",{"aria-label":"恢复原始大小",disabled:l===C,onClick:G,title:"恢复原始大小（0）",type:"button",children:e.jsx(lt,{size:17})})]})]})}),document.body):null}const It="/forum/assets/thread-html-frame-DuCry7dF.css",wt=28,jt=64,Rt=5e4,Et=30,Ae=30,K="capubbs-thread-html-frame",St=new URL(It,window.location.origin).href;function ve({className:t="",floor:r,html:n,isActivitySignupCanceled:f=!1,onImageOpen:a,variant:i}){const m=s.useMemo(()=>i==="signature"?st(n):n,[n,i]),l=Tt(m,i==="signature"),p=dt(l),o=s.useMemo(()=>p?null:ut(l,{normalizeLegacyLineBreaks:i==="signature"}),[l,p,i]),u=s.useMemo(()=>gt(l),[l]);return!p&&o!==null?e.jsx(Ee,{className:t,html:o,onImageOpen:a,variant:i}):e.jsx(At,{className:t,floor:r,html:u,isActivitySignupCanceled:f,onImageOpen:a,variant:i})}function At({className:t,floor:r,html:n,isActivitySignupCanceled:f,onImageOpen:a,variant:i}){const m=s.useRef(null),l=s.useRef(`${i}-${r}-${Math.random().toString(36).slice(2)}`),p=s.useRef(a);p.current=a;const o=i==="signature"?wt:jt,u=!!a,[y,w]=s.useState(null),h=Mt(),j=s.useRef(h),$=Ue(),M=i==="signature"?14:$,R=s.useMemo(()=>Nt({canOpenImages:u,frameId:l.current,html:n,isActivitySignupCanceled:f,isDarkTheme:j.current,fontSize:M,variant:i}),[u,M,n,f,i]),v=s.useMemo(()=>`data:text/html;charset=utf-8,${encodeURIComponent(R)}`,[R]),S=s.useCallback(()=>{m.current?.contentWindow?.postMessage({frameId:l.current,source:K,theme:h?"dark":"light",type:"theme"},"*")},[h]);return s.useEffect(()=>{w(null)},[v]),s.useEffect(()=>{S()},[S]),s.useLayoutEffect(()=>{function P(E){if(!(E.source!==m.current?.contentWindow||!Ct(E.data))&&E.data.frameId===l.current){if(E.data.type==="anchor"){const I=m.current;if(!I)return;const k=window.getComputedStyle(document.documentElement),F=Number.parseFloat(k.getPropertyValue("--topbar-height"))||0,N=window.scrollY+I.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,N+E.data.offsetTop-F-16)});return}if(E.data.type==="navigate"){const I=Be(E.data.url,Te());if(!I)return;window.history.pushState(null,"",I),window.dispatchEvent(new Event(Ke));const k=new URL(I,window.location.origin);k.hash?window.requestAnimationFrame(()=>{const F=decodeURIComponent(k.hash.slice(1)),N=Ye(`#${F}`);(N?We(N):document.getElementById(F))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(E.data.type==="image-open"){const I=m.current;if(!I)return;const k=F=>{const N=E.data.images[F];!N||typeof N.galleryId!="number"||!Number.isSafeInteger(N.galleryIndex)||I.contentWindow?.postMessage({frameId:l.current,galleryId:N.galleryId,galleryIndex:N.galleryIndex,source:K,type:"gallery-select"},"*")};p.current?.(E.data.images,E.data.imageIndex,I,k);return}w(Math.min(Rt,Math.max(o,Math.ceil(E.data.height))))}}return window.addEventListener("message",P),()=>window.removeEventListener("message",P)},[o]),e.jsx("iframe",{ref:m,className:`thread-html-frame thread-html-frame-${i} ${t}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-same-origin",scrolling:"no",src:v,onLoad:S,style:{"--thread-html-frame-width-allowance":`${Ae}px`,...y===null?{}:{"--thread-html-frame-height":`${y}px`}},title:i==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`})}function Tt(t,r){const[n,f]=s.useState(t);return s.useEffect(()=>{const a=new AbortController,i=r?it(t):[];if(f(t),i.length===0)return()=>a.abort();const m=Array.from(new Map(i.map(l=>[`${l.bid}:${l.tid}:${l.pid}`,l])).values());return Promise.all(m.map(async l=>{try{const p=await ct(l,a.signal);return[`${l.bid}:${l.tid}:${l.pid}`,p]}catch(p){if(p instanceof DOMException&&p.name==="AbortError")throw p;return[`${l.bid}:${l.tid}:${l.pid}`,""]}})).then(l=>{if(a.signal.aborted)return;const p=new Map(l);let o=t;i.forEach(u=>{const y=p.get(`${u.bid}:${u.tid}:${u.pid}`);y&&(o=o.replace(u.marker,y))}),f(o)}).catch(()=>{}),()=>a.abort()},[r,t]),n}function Nt({canOpenImages:t,frameId:r,fontSize:n,html:f,isActivitySignupCanceled:a,isDarkTheme:i,variant:m}){const l=m==="signature",p=l?"#999999":"rgb(63 63 70)",o=l?"#999999":"rgb(228 228 231)",u=l?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",y=l?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",w=a?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${i?"dark":"light"}" style="background:transparent;color-scheme:${i?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${Ie(Te())}">
  <meta http-equiv="Content-Security-Policy" content="${$t()}">
  <link rel="stylesheet" href="${Ie(St)}">
  <style>
    html{--capubbs-frame-text-color:${p}}html.dark{--capubbs-frame-text-color:${o}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${u};font-size:${n}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${Ae}px);${y}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${kt(r,t)}<\/script>
  <script src="/bbs/lib/jquery.min.js"><\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${m}${w}">${Lt(f)}</main></body>
</html>`}function kt(t,r){return`(function(){
    var frameId=${JSON.stringify(t)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(Xe)};
    var canOpenImages=${JSON.stringify(r)};
    var forumAppExactPaths=${JSON.stringify(Je)};
    var forumAppPathPrefixes=${JSON.stringify(Ve)};
    var legacyForumExactPaths=${JSON.stringify(Qe)};
    var legacyForumPathPatterns=${JSON.stringify(Ze)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${Et};
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
      window.parent.postMessage({source:'${K}',type:'resize',frameId:frameId,height:height},'*');
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
        var appPath=path===forumBasePath?'/':path.indexOf(forumBasePath+'/')===0?path.slice(forumBasePath.length):path;
        appPath=appPath.replace(/^\\/(?:bbs-new|capubbs-new)(?=\\/)/,'');
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
        window.parent.postMessage({source:'${K}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${K}',type:'navigate',frameId:frameId,url:url},'*');
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
      window.parent.postMessage({source:'${K}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
      if(event.source!==window.parent||!data||data.source!=='${K}'||data.frameId!==frameId)return;
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
  }());`}function Lt(t){return t.replace(/<script\b([^>]*)>/gi,(r,n)=>`<script${n.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function $t(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'"].join("; ")}function Te(){return new URL("/bbs/content/",window.location.origin).href}function Ie(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Ct(t){if(!t||typeof t!="object")return!1;const r=t;return r.source!==K||typeof r.frameId!="string"?!1:r.type==="anchor"?typeof r.offsetTop=="number"&&Number.isFinite(r.offsetTop)&&r.offsetTop>=0:r.type==="navigate"?typeof r.url=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(n=>!!n&&typeof n=="object"&&typeof n.alt=="string"&&typeof n.src=="string"&&n.src.length>0&&(n.galleryId===void 0&&n.galleryIndex===void 0||typeof n.galleryId=="number"&&Number.isSafeInteger(n.galleryId)&&n.galleryId>=0&&typeof n.galleryIndex=="number"&&Number.isSafeInteger(n.galleryIndex)&&n.galleryIndex>=0)):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function Mt(){const[t,r]=s.useState(()=>document.documentElement.classList.contains("dark"));return s.useEffect(()=>{const n=document.documentElement,f=()=>r(n.classList.contains("dark")),a=new MutationObserver(f);return a.observe(n,{attributeFilter:["class"],attributes:!0}),()=>a.disconnect()},[]),t}function Pt({bodyClassName:t="thread-floor-body",bodyFallback:r=null,bodyHtml:n,floor:f,isActivitySignupCanceled:a=!1,onImageOpen:i,signatureClassName:m="thread-signature",signatureHtml:l,signatureText:p}){const o=i?(u,y,w,h)=>{const j=u[y];j&&i([j],0,w,h?()=>h(y):void 0)}:void 0;return e.jsxs(e.Fragment,{children:[n?e.jsx(ve,{className:t,floor:f,html:n,isActivitySignupCanceled:a,onImageOpen:i,variant:"floor"}):r,l?e.jsx(ve,{className:m,floor:f,html:l,onImageOpen:o,variant:"signature"}):p?e.jsx("footer",{className:m,children:e.jsx("p",{children:p})}):null]})}function Dt({author:t,id:r}){const n=t.tags??me(t.name),[f,a]=s.useState(!1),i=s.useRef(null),m=s.useRef(null),l=s.useRef(null),p=s.useRef(null),o=n.map(u=>`${u.id}:${u.name}`).join("|");return s.useLayoutEffect(()=>{if(n.length===0){a(!1);return}const u=()=>{const w=i.current,h=m.current,j=l.current,$=p.current;if(!w||!h||!j||!$||w.offsetWidth===0)return;const M=j.getBoundingClientRect().width,R=$.getBoundingClientRect().width,v=Number.parseFloat(getComputedStyle(h).columnGap)||0,S=h.clientWidth-M-v,P=R>S+1;a(E=>E===P?E:P)};u();const y=new ResizeObserver(u);return[i.current,m.current,p.current].forEach(w=>{w&&y.observe(w)}),()=>y.disconnect()},[o,n.length]),e.jsxs("div",{id:r,ref:i,className:"author-hover-card",role:"dialog","aria-label":`${t.name} 的用户摘要`,children:[e.jsxs("div",{className:"author-card-head",children:[e.jsx("img",{src:t.avatar,alt:""}),e.jsxs("div",{className:"author-card-head-copy",children:[e.jsxs("div",{ref:m,className:"author-card-name-line","data-tags-overflow":f?"true":void 0,children:[e.jsx("strong",{ref:l,children:t.name}),e.jsx("div",{className:"author-card-tag-slot",children:e.jsx(ce,{size:"compact",tags:n})})]}),(t.stars>0||t.role)&&e.jsxs("span",{className:"author-card-status",children:["★".repeat(t.stars),t.stars>0&&t.role?" · ":"",t.role]})]})]}),f?e.jsx("div",{className:"author-card-tags-row",children:e.jsx(ce,{size:"compact",tags:n})}):null,t.medals?.length?e.jsx("div",{className:"author-card-medals",children:e.jsx(je,{medals:t.medals,profileName:t.name,variant:"compact"})}):null,e.jsx("div",{ref:p,className:"author-card-tag-width-measure","aria-hidden":"true",children:e.jsx(ce,{size:"compact",tags:n})}),e.jsxs("dl",{children:[e.jsxs("div",{children:[e.jsx("dt",{children:"主题"}),e.jsx("dd",{children:t.topics})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"回复"}),e.jsx("dd",{children:t.replies})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"签到"}),e.jsx("dd",{children:t.checkins})]})]}),e.jsxs("p",{children:["最近在线：",t.lastSeen]}),e.jsxs("a",{href:se(t.name),children:["查看个人主页 ",e.jsx(mt,{size:13})]})]})}function Ft({author:t}){const r=t.tags??me(t.name),n=we(r),f=se(t.name);return e.jsxs("aside",{className:"thread-author-profile","aria-label":`${t.name} 的资料`,children:[e.jsx("a",{"aria-label":`查看${t.name}的个人主页`,className:"thread-author-profile-avatar",href:f,children:e.jsx("img",{src:t.avatar,alt:""})}),e.jsx("div",{className:"thread-author-profile-identity",children:e.jsx("a",{href:f,children:t.name})}),(t.stars>0||t.role)&&e.jsxs("div",{className:"thread-author-profile-status",children:[t.stars>0&&e.jsx("span",{"aria-label":`${t.stars} 星`,children:"★".repeat(t.stars)}),t.role&&e.jsx("strong",{children:t.role})]}),e.jsx(Re,{tags:n}),e.jsx(je,{medals:t.medals??[],profileName:t.name,variant:"compact"}),e.jsxs("dl",{className:"thread-author-profile-stats",children:[e.jsxs("div",{children:[e.jsx("dt",{children:"主题"}),e.jsx("dd",{children:t.topics})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"回复"}),e.jsx("dd",{children:t.replies})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"签到"}),e.jsx("dd",{children:t.checkins})]})]}),e.jsxs("p",{className:"thread-author-profile-last-seen",children:[e.jsx("span",{children:"最近在线"}),e.jsx("strong",{children:t.lastSeen})]})]})}function ue(t){return t.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function Ht(t){const r=window.getSelection()?.toString();r&&(t.preventDefault(),t.clipboardData.setData("text/plain",r))}function Ot({articleAfterContent:t,author:r,avatarRail:n,className:f="",content:a,decorationImageSrc:i,editedAt:m,floor:l,floorIndex:p,id:o,inlineAvatar:u=!1,mainAfterContent:y,onCopy:w,publishedAt:h,showAuthorProfile:j}){const $=r.tags??me(r.name),M=we($);return e.jsxs("article",{className:`thread-floor${j?" thread-floor-with-author-profile":""}${f?` ${f}`:""}`,"data-floor":l,id:o,onCopy:w,children:[i&&e.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:e.jsx("img",{alt:"",src:i})}),j?e.jsx(Ft,{author:r}):!u&&n,e.jsxs("div",{className:"thread-floor-main",children:[e.jsxs("header",{className:"thread-floor-header",children:[!j&&u&&n,e.jsxs("div",{className:"thread-floor-author",children:[e.jsx("a",{href:se(r.name),children:r.name}),e.jsx(Re,{tags:M})]}),e.jsxs("div",{className:"thread-floor-time",children:[e.jsx("time",{children:ue(h)}),m&&e.jsxs(e.Fragment,{children:[e.jsx("span",{children:"·"}),e.jsxs("time",{children:["编辑于 ",ue(m)]})]})]}),p]}),j?e.jsx("div",{className:"thread-floor-content",children:a}):a,y]}),t]})}function zt({canDelete:t,canEdit:r,canQuote:n,canReply:f,decorative:a=!1,deleting:i=!1,editHref:m="",onDelete:l,onQuote:p,onReply:o}){const u=a?-1:void 0;return e.jsxs("div",{"aria-hidden":a||void 0,className:`thread-floor-actions${a?" thread-floor-actions-decorative":""}`,children:[n&&e.jsxs("button",{onClick:p,tabIndex:u,type:"button",children:[e.jsx(rt,{size:15}),"引用"]}),f&&e.jsxs("button",{onClick:o,tabIndex:u,type:"button",children:[e.jsx(ht,{size:15}),"回复"]}),r&&(a?e.jsxs("button",{tabIndex:-1,type:"button",children:[e.jsx(xe,{size:15}),"编辑"]}):e.jsxs("a",{href:m,children:[e.jsx(xe,{size:15}),"编辑"]})),t&&e.jsxs("button",{"aria-busy":i||void 0,className:"floor-action-danger",disabled:!a&&i,onClick:a?void 0:y=>l?.(y.currentTarget),tabIndex:u,type:"button",children:[e.jsx(fe,{size:15}),i?"删除中":"删除"]})]})}function tr({canQuote:t,canReply:r,decorationImageSrc:n,editHref:f,floor:a,isActivityThread:i,isMainPost:m,inlineAvatar:l,showAuthorProfile:p,hideSignature:o,onDeleteFloor:u,onDeleteNestedReply:y,onQuote:w,onSubmitNestedReply:h,viewer:j}){const[$,M]=s.useState(!1),[R,v]=s.useState(null),[S,P]=s.useState([]),[E,I]=s.useState(""),[k,F]=s.useState(!1),[N,Q]=s.useState([]),[Z,B]=s.useState(""),[z,G]=s.useState(""),[Y,X]=s.useState(null),[ee,W]=s.useState(""),[J,te]=s.useState(!1),[U,_]=s.useState(void 0),[c,b]=s.useState(null),[x,L]=s.useState(!1),D=s.useRef(null),A=s.useRef(null),H=s.useRef(null),re=s.useRef(null),g=s.useRef(null),O=s.useMemo(()=>[...a.nestedReplies??[],...N].filter(d=>!S.includes(d.id)),[S,a.nestedReplies,N]),V=i&&!m&&/<\s*(?:s|strike)\b/i.test(a.contentHtml??""),ae=`thread-floor-body${V?" capubbs-activity-signup-canceled":""}`;s.useEffect(()=>()=>{A.current!==null&&window.clearTimeout(A.current)},[]),s.useEffect(()=>{if(!x)return;function d(T){D.current?.contains(T.target)||L(!1)}return document.addEventListener("pointerdown",d),()=>document.removeEventListener("pointerdown",d)},[x]);async function ne(){const d=`${window.location.origin}${window.location.pathname}${window.location.search}#${a.floor}`;await yt(d)&&(M(!0),A.current!==null&&window.clearTimeout(A.current),A.current=window.setTimeout(()=>M(!1),1800))}const pe=(d,T,q,oe)=>{g.current=q,b({imageIndex:T,images:d,onImageChange:oe})};function Ne(d){c?.onImageChange?.(d),b(null),window.requestAnimationFrame(()=>g.current?.focus())}function he(d=null){_(d),B(""),G(""),W(""),window.requestAnimationFrame(()=>re.current?.focus())}function ye(){_(void 0),B(""),W("")}async function ke(d){d.preventDefault();const T=Z.trim();if(!(!T||!j||J)){te(!0),W("");try{const q=await h(a,U??null,T);Q(oe=>[...oe,{author:j,canDelete:!0,content:T,id:q>0?String(q):`local-${a.id}-${Date.now()}`,publishedAt:Gt(new Date),target:U??void 0}]),ye()}catch(q){W(q instanceof Error?q.message:"楼中楼回复发布失败，请稍后重试。")}finally{te(!1)}}}async function Le(d){X(d.id),G("");try{await y(a,d),P(T=>[...T,d.id]),Q(T=>T.filter(q=>q.id!==d.id)),v(null)}catch(T){G(T instanceof Error?T.message:"楼中楼删除失败，请稍后重试。")}finally{X(null)}}async function $e(){if(!k){F(!0),I("");try{await u(a)}catch(d){I(d instanceof Error?d.message:"楼层删除失败，请稍后重试。"),F(!1)}}}function Ce(){v(null),I(""),G(""),window.requestAnimationFrame(()=>H.current?.focus())}function Me(){if(!R)return;const d=R;v(null),d.kind==="floor"?$e():Le(d.reply)}const Pe=e.jsxs("div",{className:`thread-avatar-rail${x?" thread-avatar-rail-open":""}`,ref:D,children:[e.jsx("button",{"aria-controls":`author-card-${a.floor}`,"aria-expanded":x,"aria-label":`查看${a.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>L(d=>!d),type:"button",children:e.jsx("img",{src:a.author.avatar,alt:""})}),e.jsx(Dt,{author:a.author,id:`author-card-${a.floor}`})]}),De=e.jsx(Pt,{bodyFallback:e.jsx("div",{className:ae,children:a.paragraphs.map(d=>e.jsx("p",{children:d},d))}),bodyClassName:ae,bodyHtml:a.contentHtml,floor:a.floor,isActivitySignupCanceled:V,onImageOpen:pe,signatureHtml:o?void 0:a.signatureHtml,signatureText:o?void 0:a.signature}),Fe=e.jsxs("button",{"aria-label":`复制第 ${a.floor} 楼链接`,className:"thread-floor-index",onClick:ne,title:"复制楼层链接",type:"button",children:["#",a.floor]}),He=e.jsxs(e.Fragment,{children:[e.jsx(zt,{canDelete:(!i||m)&&(a.canDelete??a.isOwn??!1),canEdit:(!i||m)&&!!a.isOwn,canQuote:t,canReply:r,deleting:k,editHref:f,onDelete:d=>{H.current=d,I(""),v({kind:"floor"})},onQuote:()=>w(a),onReply:()=>he()}),E&&e.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:E}),O.length>0&&e.jsx("section",{className:"nested-replies","aria-label":`${a.floor} 楼的楼中楼回复`,children:O.map(d=>e.jsxs("article",{children:[e.jsx("img",{src:d.author.avatar,alt:""}),e.jsxs("div",{children:[e.jsx("a",{className:"nested-reply-author",href:se(d.author.name),children:d.author.name}),d.target&&e.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",e.jsx("a",{href:se(d.target),children:d.target})]}),d.contentHtml?e.jsx(Ee,{className:"nested-reply-content",html:d.contentHtml,onImageOpen:pe,variant:"nested"}):e.jsx("p",{children:d.content}),e.jsxs("footer",{className:"nested-reply-footer",children:[e.jsx("time",{children:ue(d.publishedAt)}),r&&e.jsx("button",{onClick:()=>he(d.author.name),type:"button",children:"回复"}),d.canDelete&&e.jsxs("button",{className:"nested-reply-delete",disabled:Y===d.id,onClick:T=>{H.current=T.currentTarget,G(""),v({kind:"nested",reply:d})},type:"button",children:[e.jsx(fe,{size:12}),Y===d.id?"删除中":"删除"]})]})]})]},d.id))}),z&&e.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:z}),U!==void 0&&r&&e.jsxs("form",{className:"nested-reply-composer",onSubmit:ke,children:[e.jsx("textarea",{"aria-label":U?`回复 @${U}`:`回复第 ${a.floor} 楼`,maxLength:500,onChange:d=>{B(d.target.value),W("")},placeholder:U?`回复 @${U}`:"写一条楼中楼回复",ref:re,rows:2,value:Z}),e.jsxs("div",{className:"nested-reply-composer-actions",children:[e.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:J,onClick:ye,type:"button",children:e.jsx(ge,{size:15})}),e.jsxs("button",{className:"nested-reply-submit",disabled:!Z.trim()||J,type:"submit",children:[e.jsx(et,{size:14}),J?"发送中":"发送"]})]}),ee&&e.jsx("p",{className:"nested-reply-error",role:"alert",children:ee})]})]}),Oe=e.jsxs(e.Fragment,{children:[$&&e.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[e.jsx(tt,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),c&&e.jsx(vt,{images:c.images,initialImageIndex:c.imageIndex,onImageChange:c.onImageChange,onClose:Ne}),R&&e.jsx(_t,{floor:a,isMainPost:m,onCancel:Ce,onConfirm:Me,target:R})]});return e.jsx(Ot,{articleAfterContent:Oe,author:a.author,avatarRail:Pe,content:De,decorationImageSrc:n,editedAt:a.editedAt,floor:a.floor,floorIndex:Fe,id:String(a.floor),inlineAvatar:l,mainAfterContent:He,onCopy:Ht,publishedAt:a.publishedAt,showAuthorProfile:p})}function _t({floor:t,isMainPost:r,onCancel:n,onConfirm:f,target:a}){const i=a.kind==="nested"?a.reply:null,m=i?"删除楼中楼回复":r?"删除主楼":"删除回复",l=i?"":r?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",p=i?.author.name??t.author.name,o=i?`#${t.floor} · 楼中楼`:`#${t.floor}`,u=qt(i?.content||t.quoteText||t.paragraphs[0]||"");return s.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),s.useEffect(()=>{function y(w){w.key==="Escape"&&n()}return document.addEventListener("keydown",y),()=>document.removeEventListener("keydown",y)},[n]),e.jsx("div",{className:"thread-delete-dialog-backdrop",onMouseDown:y=>{y.currentTarget===y.target&&n()},role:"presentation",children:e.jsxs("section",{"aria-describedby":l?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[e.jsxs("header",{children:[e.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:e.jsx(ft,{size:19})}),e.jsx("div",{children:e.jsx("h2",{id:"thread-delete-dialog-title",children:m})}),e.jsx("button",{"aria-label":"关闭删除确认",onClick:n,type:"button",children:e.jsx(ge,{size:18})})]}),e.jsxs("div",{className:"thread-delete-dialog-body",children:[l&&e.jsx("p",{id:"thread-delete-dialog-description",children:l}),e.jsxs("div",{className:"thread-delete-dialog-target",children:[e.jsxs("span",{children:[p," · ",o]}),e.jsx("p",{children:u||"此回复没有可预览的文字内容。"})]})]}),e.jsxs("footer",{children:[e.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:n,type:"button",children:"取消"}),e.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:f,type:"button",children:[e.jsx(fe,{size:15}),"确认删除"]})]})]})})}function qt(t){const r=t.replace(/\s+/g," ").trim();return r.length>100?`${r.slice(0,100).trimEnd()}…`:r}function Gt(t){const r=n=>String(n).padStart(2,"0");return`${t.getFullYear()}-${r(t.getMonth()+1)}-${r(t.getDate())} ${r(t.getHours())}:${r(t.getMinutes())}:${r(t.getSeconds())}`}export{Pt as T,Ot as a,zt as b,tr as c,yt as w};
