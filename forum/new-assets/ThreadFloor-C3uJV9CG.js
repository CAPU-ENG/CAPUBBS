import{p as Ie,r as s,j as e,a3 as ze,X as ge,b as _e,d as qe,aS as Ge,az as Be,aT as Ue,aF as Ke,at as Ye,aU as We,aV as Xe,aW as Je,aX as Ve,aY as Qe,N as Ze,G as se,x as et,P as tt,aQ as rt}from"./index-CJXpCeG7.js";import{d as ye,m as le,s as at,e as nt,r as st,f as it,a as we,P as je}from"./RichTextEditor.gallery-wXywGvwf.js";import{P as ot}from"./plus-CZTxsJ6s.js";import{R as lt}from"./rotate-ccw-BiaHlQeY.js";import{l as ct}from"./thread-D7b_OeGg.js";import{a as dt,r as ut,t as gt}from"./forumMarkup-BGC23GGe.js";import{D as Re,T as ce}from"./TagBadge-sIuxrTDL.js";import{T as me}from"./trash-2-DI9d69EZ.js";import{P as xe}from"./pencil-I3J8--7W.js";import{E as mt}from"./external-link-Cot2j1r_.js";import{T as ft}from"./triangle-alert-DH3ILlXd.js";const ht=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],pt=Ie("paperclip",ht);const yt=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],xt=Ie("reply",yt);async function bt(t){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(t),!0}catch{}const r=document.createElement("textarea");r.value=t,r.setAttribute("readonly",""),r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select();try{return document.execCommand("copy")}finally{r.remove()}}function Ee({className:t="",html:r,onImageOpen:a,variant:g}){const n=s.useRef(null),o=s.useMemo(()=>({__html:r}),[r]);if(s.useEffect(()=>{const i=n.current;if(!i)return;const u=Array.from(i.querySelectorAll("img")),y=p=>{p.dataset.capubbsImageLoaded="true"},I=u.map(p=>{if(p.complete)return y(p),null;const j=()=>y(p);return p.addEventListener("load",j,{once:!0}),p.addEventListener("error",j,{once:!0}),{handleLoad:j,image:p}});return()=>{I.forEach(p=>{p&&(p.image.removeEventListener("load",p.handleLoad),p.image.removeEventListener("error",p.handleLoad))})}},[r]),!r)return null;function m(i,u){if(!a||!(i instanceof Element))return;const y=i.closest("img");if(!(y instanceof HTMLImageElement))return;const I=Array.from(u.querySelectorAll("img")),p=I.indexOf(y);if(p<0)return;const j=I.map(R=>vt(R,u)),T=I.map((R,v)=>{const S=j[v];return{alt:R.alt.trim(),src:R.currentSrc||R.src,...S?{galleryId:S.galleryId,galleryIndex:S.galleryIndex}:{}}});a(T,p,y,R=>{const v=j[R];v&&at(v.gallery,v.galleryIndex)})}function l(i){const u=ye(i.target);if(u&&i.target instanceof Element){i.preventDefault(),i.stopPropagation(),le(i.target,u);return}!a||!(i.target instanceof HTMLImageElement)||(i.preventDefault(),m(i.target,i.currentTarget))}function h(i){const u=ye(i.target);if(u&&["Enter"," "].includes(i.key)&&i.target instanceof Element){i.preventDefault(),le(i.target,u);return}if(["ArrowLeft","ArrowRight"].includes(i.key)&&i.target instanceof Element&&i.target.closest(".capubbs-gallery")){i.preventDefault(),le(i.target,i.key==="ArrowLeft"?"prev":"next");return}!a||!(i.target instanceof HTMLImageElement)||!["Enter"," "].includes(i.key)||(i.preventDefault(),m(i.target,i.currentTarget))}return e.jsx("div",{ref:n,className:`forum-markup forum-markup-${g} ${t}`.trim(),"data-forum-markup":g,dangerouslySetInnerHTML:o,onClick:l,onKeyDown:h})}function vt(t,r){const a=t.closest(".capubbs-gallery");if(!a||!r.contains(a))return null;const n=Array.from(r.querySelectorAll(".capubbs-gallery")).indexOf(a),m=Array.from(a.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(t);return n>=0&&m>=0?{gallery:a,galleryId:n,galleryIndex:m}:null}const M=1,Se=4,ie=.25;function It(t){return Math.min(Se,Math.max(M,t))}function de(t){const[r,a]=[...t.values()];return!r||!a?null:Math.hypot(a.x-r.x,a.y-r.y)}function wt({images:t,initialImageIndex:r,onImageChange:a,onClose:g}){const n=Math.min(Math.max(0,r),Math.max(0,t.length-1)),[o,m]=s.useState(n),[l,h]=s.useState(M),[i,u]=s.useState({x:0,y:0}),[y,I]=s.useState(!1),p=s.useRef(null),j=s.useRef(null),T=s.useRef(null),C=s.useRef(null),R=s.useRef(n),v=s.useRef(M),S=s.useRef({x:0,y:0}),P=s.useRef(null),E=s.useRef(!1),w=s.useRef(new Map),$=s.useRef(null),F=s.useRef(M),k=s.useRef(a),Q=s.useRef(g);k.current=a,Q.current=g;function Z(c,x=v.current){const b=p.current,L=T.current;if(!b||!L||x<=M)return{x:0,y:0};const D=Math.max(0,(L.clientWidth*x-b.clientWidth)/2),A=Math.max(0,(L.clientHeight*x-b.clientHeight)/2);return{x:Math.min(D,Math.max(-D,c.x)),y:Math.min(A,Math.max(-A,c.y))}}function U(c,x=v.current){const b=Z(c,x);S.current=b,u(b)}function z(c){const x=Math.round(It(c)*100)/100;v.current=x,h(x),U(S.current,x)}function G(){v.current=M,S.current={x:0,y:0},h(M),u({x:0,y:0})}function Y(c){const x=Math.min(Math.max(0,c),t.length-1);x!==R.current&&(R.current=x,m(x),G(),k.current?.(x))}function X(){Q.current(R.current)}s.useEffect(()=>{const c=document.body.style.overflow,x=document.activeElement,b=p.current;document.body.style.overflow="hidden",C.current?.focus();function L(f){if(f.key==="Escape"){f.preventDefault(),X();return}if(f.key==="ArrowLeft"){f.preventDefault(),f.stopPropagation(),Y(R.current-1);return}if(f.key==="ArrowRight"){f.preventDefault(),f.stopPropagation(),Y(R.current+1);return}if(f.key==="+"||f.key==="="){f.preventDefault(),f.stopPropagation(),z(v.current+ie);return}if(f.key==="-"){f.preventDefault(),f.stopPropagation(),z(v.current-ie);return}if(f.key==="0"){f.preventDefault(),f.stopPropagation(),G();return}if(f.key==="Tab"){const O=j.current?.querySelectorAll("button:not(:disabled)");if(!O?.length)return;const V=O[0],ae=O[O.length-1],ne=document.activeElement;if(f.shiftKey&&ne===V){f.preventDefault(),ae.focus();return}if(!f.shiftKey&&ne===ae){f.preventDefault(),V.focus();return}j.current?.contains(ne)||(f.preventDefault(),V.focus())}}function D(f){if(f.preventDefault(),f.stopPropagation(),f.deltaY===0)return;const O=f.ctrlKey?.01:.002;z(v.current*Math.exp(-f.deltaY*O))}function A(f){f.preventDefault(),f.stopPropagation(),F.current=v.current}function H(f){if(f.preventDefault(),f.stopPropagation(),w.current.size>=2)return;const O=f.scale;typeof O=="number"&&z(F.current*O)}function re(){U(S.current,v.current)}return document.addEventListener("keydown",L,{capture:!0}),window.addEventListener("resize",re),b?.addEventListener("wheel",D,{passive:!1}),b?.addEventListener("gesturestart",A,{passive:!1}),b?.addEventListener("gesturechange",H,{passive:!1}),b?.addEventListener("gestureend",H,{passive:!1}),()=>{document.removeEventListener("keydown",L,{capture:!0}),window.removeEventListener("resize",re),b?.removeEventListener("wheel",D),b?.removeEventListener("gesturestart",A),b?.removeEventListener("gesturechange",H),b?.removeEventListener("gestureend",H),document.body.style.overflow=c,x instanceof HTMLElement&&x.focus()}},[]),s.useEffect(()=>{[t[o-1],t[o+1]].forEach(c=>{if(!c)return;const x=new Image;x.src=c.src})},[o,t]);function ee(c,x,b){P.current={pointerId:c,startX:x,startY:b,originX:S.current.x,originY:S.current.y},I(!0)}function W(c){if(c.target instanceof Element&&c.target.closest("button, .thread-image-lightbox-controls"))return;const x=c.pointerType==="touch",b=c.pointerType==="mouse"&&c.button===0;if(!(!x&&!b)&&(E.current=!1,!(!x&&v.current<=M))){if(c.preventDefault(),c.currentTarget.setPointerCapture(c.pointerId),x&&(w.current.set(c.pointerId,{x:c.clientX,y:c.clientY}),w.current.size===2)){$.current=de(w.current),P.current=null,I(!1);return}v.current>M&&ee(c.pointerId,c.clientX,c.clientY)}}function J(c){const x=w.current.has(c.pointerId),b=P.current;if(!x&&b?.pointerId!==c.pointerId)return;if(c.preventDefault(),c.stopPropagation(),x&&w.current.set(c.pointerId,{x:c.clientX,y:c.clientY}),w.current.size===2){const A=de(w.current),H=$.current;if(!A||!H){$.current=A;return}Math.abs(A-H)>1&&(E.current=!0),z(v.current*(A/H)),$.current=A;return}if(!b||v.current<=M)return;const L=c.clientX-b.startX,D=c.clientY-b.startY;Math.hypot(L,D)>3&&(E.current=!0),U({x:b.originX+L,y:b.originY+D})}function te(c){const x=w.current.delete(c.pointerId),b=P.current?.pointerId===c.pointerId;if(!(!x&&!b)){if($.current=w.current.size===2?de(w.current):null,w.current.size===1&&v.current>M){const[L]=w.current.entries();if(L){const[D,A]=L;ee(D,A.x,A.y)}}else P.current=null,I(!1);c.currentTarget.hasPointerCapture(c.pointerId)&&c.currentTarget.releasePointerCapture(c.pointerId)}}const B=Math.round(l*100),_=t[o]??t[0];return _?ze.createPortal(e.jsx("div",{className:"thread-image-lightbox-backdrop","data-can-pan":l>M,"data-dragging":y,onClick:c=>{c.target===c.currentTarget&&!E.current&&X()},onPointerCancel:te,onPointerDown:W,onPointerMove:J,onPointerUp:te,ref:p,role:"presentation",children:e.jsxs("figure",{"aria-label":_.alt?`图片预览：${_.alt}（${o+1}/${t.length}）`:`图片预览（${o+1}/${t.length}）`,"aria-modal":"true",className:"thread-image-lightbox",ref:j,role:"dialog",children:[e.jsx("button",{"aria-label":"关闭图片预览",className:"thread-image-lightbox-close",onClick:X,ref:C,type:"button",children:e.jsx(ge,{size:20})}),t.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{"aria-label":"上一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-prev",disabled:o===0,onClick:()=>Y(o-1),title:"上一张（←）",type:"button",children:e.jsx(_e,{size:28})}),e.jsx("button",{"aria-label":"下一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-next",disabled:o===t.length-1,onClick:()=>Y(o+1),title:"下一张（→）",type:"button",children:e.jsx(qe,{size:28})})]}),e.jsx("img",{alt:_.alt,draggable:"false",onLoad:()=>U(S.current,v.current),ref:T,src:_.src,style:{transform:`translate3d(${i.x}px, ${i.y}px, 0) scale(${l})`}}),_.alt&&e.jsx("figcaption",{children:_.alt}),e.jsxs("div",{"aria-label":"图片缩放",className:"thread-image-lightbox-controls",role:"toolbar",children:[e.jsx("button",{"aria-label":"缩小图片",disabled:l<=M,onClick:()=>z(l-ie),title:"缩小（-）",type:"button",children:e.jsx(nt,{size:18})}),e.jsxs("output",{"aria-label":"当前缩放比例","aria-live":"polite",children:[B,"%"]}),e.jsx("button",{"aria-label":"放大图片",disabled:l>=Se,onClick:()=>z(l+ie),title:"放大（+）",type:"button",children:e.jsx(ot,{size:18})}),e.jsx("button",{"aria-label":"恢复原始大小",disabled:l===M,onClick:G,title:"恢复原始大小（0）",type:"button",children:e.jsx(lt,{size:17})})]})]})}),document.body):null}const jt="/bbs/new-assets/thread-html-frame-DuCry7dF.css",Rt=28,Et=64,St=5e4,At=30,Ae=30,K="capubbs-thread-html-frame",Nt=new URL(jt,window.location.origin).href;function be({className:t="",floor:r,html:a,isActivitySignupCanceled:g=!1,onImageOpen:n,variant:o}){const m=s.useMemo(()=>o==="signature"?st(a):a,[a,o]),l=kt(m,o==="signature"),h=dt(l),i=s.useMemo(()=>h?null:ut(l,{normalizeLegacyLineBreaks:o==="signature"}),[l,h,o]),u=s.useMemo(()=>gt(l),[l]);return!h&&i!==null?e.jsx(Ee,{className:t,html:i,onImageOpen:n,variant:o}):e.jsx(Tt,{className:t,floor:r,html:u,isActivitySignupCanceled:g,onImageOpen:n,variant:o})}function Tt({className:t,floor:r,html:a,isActivitySignupCanceled:g,onImageOpen:n,variant:o}){const m=s.useRef(null),l=s.useRef(`${o}-${r}-${Math.random().toString(36).slice(2)}`),h=s.useRef(n);h.current=n;const i=o==="signature"?Rt:Et,u=!!n,[y,I]=s.useState(null),p=Dt(),j=s.useRef(p),T=Ge(),C=o==="signature"?14:T,R=s.useMemo(()=>$t({canOpenImages:u,frameId:l.current,html:a,isActivitySignupCanceled:g,isDarkTheme:j.current,fontSize:C,variant:o}),[u,C,a,g,o]),v=s.useMemo(()=>`data:text/html;charset=utf-8,${encodeURIComponent(R)}`,[R]),S=s.useCallback(()=>{m.current?.contentWindow?.postMessage({frameId:l.current,source:K,theme:p?"dark":"light",type:"theme"},"*")},[p]);return s.useEffect(()=>{I(null)},[v]),s.useEffect(()=>{S()},[S]),s.useLayoutEffect(()=>{function P(E){if(!(E.source!==m.current?.contentWindow||!Pt(E.data))&&E.data.frameId===l.current){if(E.data.type==="anchor"){const w=m.current;if(!w)return;const $=window.getComputedStyle(document.documentElement),F=Number.parseFloat($.getPropertyValue("--topbar-height"))||0,k=window.scrollY+w.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,k+E.data.offsetTop-F-16)});return}if(E.data.type==="navigate"){const w=Be(E.data.url,Ne());if(!w)return;window.history.pushState(null,"",w),window.dispatchEvent(new Event(Ue));const $=new URL(w,window.location.origin);$.hash?window.requestAnimationFrame(()=>{const F=decodeURIComponent($.hash.slice(1)),k=Ke(`#${F}`);(k?Ye(k):document.getElementById(F))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(E.data.type==="image-open"){const w=m.current;if(!w)return;const $=F=>{const k=E.data.images[F];!k||typeof k.galleryId!="number"||!Number.isSafeInteger(k.galleryIndex)||w.contentWindow?.postMessage({frameId:l.current,galleryId:k.galleryId,galleryIndex:k.galleryIndex,source:K,type:"gallery-select"},"*")};h.current?.(E.data.images,E.data.imageIndex,w,$);return}I(Math.min(St,Math.max(i,Math.ceil(E.data.height))))}}return window.addEventListener("message",P),()=>window.removeEventListener("message",P)},[i]),e.jsx("iframe",{ref:m,className:`thread-html-frame thread-html-frame-${o} ${t}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-same-origin",scrolling:"no",src:v,onLoad:S,style:{"--thread-html-frame-width-allowance":`${Ae}px`,...y===null?{}:{"--thread-html-frame-height":`${y}px`}},title:o==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`})}function kt(t,r){const[a,g]=s.useState(t);return s.useEffect(()=>{const n=new AbortController,o=r?it(t):[];if(g(t),o.length===0)return()=>n.abort();const m=Array.from(new Map(o.map(l=>[`${l.bid}:${l.tid}:${l.pid}`,l])).values());return Promise.all(m.map(async l=>{try{const h=await ct(l,n.signal);return[`${l.bid}:${l.tid}:${l.pid}`,h]}catch(h){if(h instanceof DOMException&&h.name==="AbortError")throw h;return[`${l.bid}:${l.tid}:${l.pid}`,""]}})).then(l=>{if(n.signal.aborted)return;const h=new Map(l);let i=t;o.forEach(u=>{const y=h.get(`${u.bid}:${u.tid}:${u.pid}`);y&&(i=i.replace(u.marker,y))}),g(i)}).catch(()=>{}),()=>n.abort()},[r,t]),a}function $t({canOpenImages:t,frameId:r,fontSize:a,html:g,isActivitySignupCanceled:n,isDarkTheme:o,variant:m}){const l=m==="signature",h=l?"#999999":"rgb(63 63 70)",i=l?"#999999":"rgb(228 228 231)",u=l?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",y=l?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",I=n?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${o?"dark":"light"}" style="background:transparent;color-scheme:${o?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${ve(Ne())}">
  <meta http-equiv="Content-Security-Policy" content="${Mt()}">
  <link rel="stylesheet" href="${ve(Nt)}">
  <style>
    html{--capubbs-frame-text-color:${h}}html.dark{--capubbs-frame-text-color:${i}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${u};font-size:${a}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${Ae}px);${y}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${Lt(r,t)}<\/script>
  <script src="/bbs/lib/jquery.min.js"><\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${m}${I}">${Ct(g)}</main></body>
</html>`}function Lt(t,r){return`(function(){
    var frameId=${JSON.stringify(t)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(We)};
    var canOpenImages=${JSON.stringify(r)};
    var forumAppExactPaths=${JSON.stringify(Xe)};
    var forumAppPathPrefixes=${JSON.stringify(Je)};
    var legacyForumExactPaths=${JSON.stringify(Ve)};
    var legacyForumPathPatterns=${JSON.stringify(Qe)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${At};
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
  }());`}function Ct(t){return t.replace(/<script\b([^>]*)>/gi,(r,a)=>`<script${a.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function Mt(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'"].join("; ")}function Ne(){return new URL("/bbs/content/",window.location.origin).href}function ve(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Pt(t){if(!t||typeof t!="object")return!1;const r=t;return r.source!==K||typeof r.frameId!="string"?!1:r.type==="anchor"?typeof r.offsetTop=="number"&&Number.isFinite(r.offsetTop)&&r.offsetTop>=0:r.type==="navigate"?typeof r.url=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(a=>!!a&&typeof a=="object"&&typeof a.alt=="string"&&typeof a.src=="string"&&a.src.length>0&&(a.galleryId===void 0&&a.galleryIndex===void 0||typeof a.galleryId=="number"&&Number.isSafeInteger(a.galleryId)&&a.galleryId>=0&&typeof a.galleryIndex=="number"&&Number.isSafeInteger(a.galleryIndex)&&a.galleryIndex>=0)):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function Dt(){const[t,r]=s.useState(()=>document.documentElement.classList.contains("dark"));return s.useEffect(()=>{const a=document.documentElement,g=()=>r(a.classList.contains("dark")),n=new MutationObserver(g);return n.observe(a,{attributeFilter:["class"],attributes:!0}),()=>n.disconnect()},[]),t}function Ft({attachments:t=[],bodyClassName:r="thread-floor-body",bodyFallback:a=null,bodyHtml:g,floor:n,isActivitySignupCanceled:o=!1,onImageOpen:m,signatureClassName:l="thread-signature",signatureHtml:h,signatureText:i}){const u=m?(y,I,p,j)=>{const T=y[I];T&&m([T],0,p,j?()=>j(I):void 0)}:void 0;return e.jsxs(e.Fragment,{children:[g?e.jsx(be,{className:r,floor:n,html:g,isActivitySignupCanceled:o,onImageOpen:m,variant:"floor"}):a,e.jsx(Ht,{attachments:t}),h?e.jsx(be,{className:l,floor:n,html:h,onImageOpen:u,variant:"signature"}):i?e.jsx("footer",{className:l,children:e.jsx("p",{children:i})}):null]})}function Ht({attachments:t}){return t.length===0?null:e.jsxs("section",{"aria-label":"附件",className:"thread-attachments",children:[e.jsxs("header",{className:"thread-attachments-heading",children:[e.jsx(pt,{"aria-hidden":"true",size:14}),e.jsx("span",{children:"附件"}),e.jsx("small",{children:t.length})]}),e.jsx("ul",{children:t.map(r=>{const a=e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"thread-attachment-name",children:r.name}),e.jsx("small",{children:Ot(r)}),r.exists!==!1&&e.jsx(Ze,{"aria-hidden":"true",size:15})]});return e.jsx("li",{children:r.exists===!1?e.jsx("div",{"aria-disabled":"true",className:"thread-attachment-link is-unavailable",children:a}):e.jsx("a",{className:"thread-attachment-link",download:r.name,href:r.downloadHref||`/bbs/download/?id=${encodeURIComponent(r.id)}`,children:a})},r.id)})})]})}function Ot(t){if(t.exists===!1)return"文件不可用";const r=[zt(t.size),(t.price??0)>0?"付费附件":"免费"];return t.downloadCount!==void 0&&r.push(`下载 ${t.downloadCount} 次`),r.join(" · ")}function zt(t){if(t<=0)return"大小未知";if(t<1024)return`${t} B`;const r=["KB","MB","GB","TB"];let a=t,g=-1;do a/=1024,g+=1;while(a>=1024&&g<r.length-1);return`${a.toFixed(a>=10?1:2)} ${r[g]}`}function _t({author:t,id:r}){const a=t.tags??[],[g,n]=s.useState(!1),o=s.useRef(null),m=s.useRef(null),l=s.useRef(null),h=s.useRef(null),i=a.map(u=>`${u.id}:${u.name}`).join("|");return s.useLayoutEffect(()=>{if(a.length===0){n(!1);return}const u=()=>{const I=o.current,p=m.current,j=l.current,T=h.current;if(!I||!p||!j||!T||I.offsetWidth===0)return;const C=j.getBoundingClientRect().width,R=T.getBoundingClientRect().width,v=Number.parseFloat(getComputedStyle(p).columnGap)||0,S=p.clientWidth-C-v,P=R>S+1;n(E=>E===P?E:P)};u();const y=new ResizeObserver(u);return[o.current,m.current,h.current].forEach(I=>{I&&y.observe(I)}),()=>y.disconnect()},[i,a.length]),e.jsxs("div",{id:r,ref:o,className:"author-hover-card",role:"dialog","aria-label":`${t.name} 的用户摘要`,children:[e.jsxs("div",{className:"author-card-head",children:[e.jsx("img",{src:t.avatar,alt:""}),e.jsxs("div",{className:"author-card-head-copy",children:[e.jsxs("div",{ref:m,className:"author-card-name-line","data-tags-overflow":g?"true":void 0,children:[e.jsx("strong",{ref:l,children:t.name}),e.jsx("div",{className:"author-card-tag-slot",children:e.jsx(ce,{size:"compact",tags:a})})]}),(t.stars>0||t.role)&&e.jsxs("span",{className:"author-card-status",children:["★".repeat(t.stars),t.stars>0&&t.role?" · ":"",t.role]})]})]}),g?e.jsx("div",{className:"author-card-tags-row",children:e.jsx(ce,{size:"compact",tags:a})}):null,t.medals?.length?e.jsx("div",{className:"author-card-medals",children:e.jsx(je,{medals:t.medals,profileName:t.name,variant:"compact"})}):null,e.jsx("div",{ref:h,className:"author-card-tag-width-measure","aria-hidden":"true",children:e.jsx(ce,{size:"compact",tags:a})}),e.jsxs("dl",{children:[e.jsxs("div",{children:[e.jsx("dt",{children:"主题"}),e.jsx("dd",{children:t.topics})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"回复"}),e.jsx("dd",{children:t.replies})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"签到"}),e.jsx("dd",{children:t.checkins})]})]}),e.jsxs("p",{children:["最近在线：",t.lastSeen]}),e.jsxs("a",{href:se(t.name),children:["查看个人主页 ",e.jsx(mt,{size:13})]})]})}function qt({author:t}){const r=t.tags??[],a=we(r),g=se(t.name);return e.jsxs("aside",{className:"thread-author-profile","aria-label":`${t.name} 的资料`,children:[e.jsx("a",{"aria-label":`查看${t.name}的个人主页`,className:"thread-author-profile-avatar",href:g,children:e.jsx("img",{src:t.avatar,alt:""})}),e.jsx("div",{className:"thread-author-profile-identity",children:e.jsx("a",{href:g,children:t.name})}),(t.stars>0||t.role)&&e.jsxs("div",{className:"thread-author-profile-status",children:[t.stars>0&&e.jsx("span",{"aria-label":`${t.stars} 星`,children:"★".repeat(t.stars)}),t.role&&e.jsx("strong",{children:t.role})]}),e.jsx(Re,{tags:a}),e.jsx(je,{medals:t.medals??[],profileName:t.name,variant:"compact"}),e.jsxs("dl",{className:"thread-author-profile-stats",children:[e.jsxs("div",{children:[e.jsx("dt",{children:"主题"}),e.jsx("dd",{children:t.topics})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"回复"}),e.jsx("dd",{children:t.replies})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"签到"}),e.jsx("dd",{children:t.checkins})]})]}),e.jsxs("p",{className:"thread-author-profile-last-seen",children:[e.jsx("span",{children:"最近在线"}),e.jsx("strong",{children:t.lastSeen})]})]})}function ue(t){return t.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function Gt(t){const r=window.getSelection()?.toString();r&&(t.preventDefault(),t.clipboardData.setData("text/plain",r))}function Bt({articleAfterContent:t,author:r,avatarRail:a,className:g="",content:n,decorationImageSrc:o,editedAt:m,floor:l,floorIndex:h,id:i,inlineAvatar:u=!1,mainAfterContent:y,onCopy:I,publishedAt:p,showAuthorProfile:j}){const T=r.tags??[],C=we(T);return e.jsxs("article",{className:`thread-floor${j?" thread-floor-with-author-profile":""}${g?` ${g}`:""}`,"data-floor":l,id:i,onCopy:I,children:[o&&e.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:e.jsx("img",{alt:"",src:o})}),j?e.jsx(qt,{author:r}):!u&&a,e.jsxs("div",{className:"thread-floor-main",children:[e.jsxs("header",{className:"thread-floor-header",children:[!j&&u&&a,e.jsxs("div",{className:"thread-floor-author",children:[e.jsx("a",{href:se(r.name),children:r.name}),e.jsx(Re,{tags:C})]}),e.jsxs("div",{className:"thread-floor-time",children:[e.jsx("time",{children:ue(p)}),m&&e.jsxs(e.Fragment,{children:[e.jsx("span",{children:"·"}),e.jsxs("time",{children:["编辑于 ",ue(m)]})]})]}),h]}),j?e.jsx("div",{className:"thread-floor-content",children:n}):n,y]}),t]})}function Ut({canDelete:t,canEdit:r,canQuote:a,canReply:g,decorative:n=!1,deleting:o=!1,editHref:m="",onDelete:l,onQuote:h,onReply:i}){const u=n?-1:void 0;return e.jsxs("div",{"aria-hidden":n||void 0,className:`thread-floor-actions${n?" thread-floor-actions-decorative":""}`,children:[a&&e.jsxs("button",{onClick:h,tabIndex:u,type:"button",children:[e.jsx(rt,{size:15}),"引用"]}),g&&e.jsxs("button",{onClick:i,tabIndex:u,type:"button",children:[e.jsx(xt,{size:15}),"回复"]}),r&&(n?e.jsxs("button",{tabIndex:-1,type:"button",children:[e.jsx(xe,{size:15}),"编辑"]}):e.jsxs("a",{href:m,children:[e.jsx(xe,{size:15}),"编辑"]})),t&&e.jsxs("button",{"aria-busy":o||void 0,className:"floor-action-danger",disabled:!n&&o,onClick:n?void 0:y=>l?.(y.currentTarget),tabIndex:u,type:"button",children:[e.jsx(me,{size:15}),o?"删除中":"删除"]})]})}function ir({canQuote:t,canReply:r,decorationImageSrc:a,editHref:g,floor:n,isActivityThread:o,isMainPost:m,inlineAvatar:l,showAuthorProfile:h,hideSignature:i,onDeleteFloor:u,onDeleteNestedReply:y,onQuote:I,onSubmitNestedReply:p,viewer:j}){const[T,C]=s.useState(!1),[R,v]=s.useState(null),[S,P]=s.useState([]),[E,w]=s.useState(""),[$,F]=s.useState(!1),[k,Q]=s.useState([]),[Z,U]=s.useState(""),[z,G]=s.useState(""),[Y,X]=s.useState(null),[ee,W]=s.useState(""),[J,te]=s.useState(!1),[B,_]=s.useState(void 0),[c,x]=s.useState(null),[b,L]=s.useState(!1),D=s.useRef(null),A=s.useRef(null),H=s.useRef(null),re=s.useRef(null),f=s.useRef(null),O=s.useMemo(()=>[...n.nestedReplies??[],...k].filter(d=>!S.includes(d.id)),[S,n.nestedReplies,k]),V=o&&!m&&/<\s*(?:s|strike)\b/i.test(n.contentHtml??""),ae=`thread-floor-body${V?" capubbs-activity-signup-canceled":""}`;s.useEffect(()=>()=>{A.current!==null&&window.clearTimeout(A.current)},[]),s.useEffect(()=>{if(!b)return;function d(N){D.current?.contains(N.target)||L(!1)}return document.addEventListener("pointerdown",d),()=>document.removeEventListener("pointerdown",d)},[b]);async function ne(){const d=`${window.location.origin}${window.location.pathname}${window.location.search}#${n.floor}`;await bt(d)&&(C(!0),A.current!==null&&window.clearTimeout(A.current),A.current=window.setTimeout(()=>C(!1),1800))}const fe=(d,N,q,oe)=>{f.current=q,x({imageIndex:N,images:d,onImageChange:oe})};function Te(d){c?.onImageChange?.(d),x(null),window.requestAnimationFrame(()=>f.current?.focus())}function he(d=null){_(d),U(""),G(""),W(""),window.requestAnimationFrame(()=>re.current?.focus())}function pe(){_(void 0),U(""),W("")}async function ke(d){d.preventDefault();const N=Z.trim();if(!(!N||!j||J)){te(!0),W("");try{const q=await p(n,B??null,N);Q(oe=>[...oe,{author:j,canDelete:!0,content:N,id:q>0?String(q):`local-${n.id}-${Date.now()}`,publishedAt:Wt(new Date),target:B??void 0}]),pe()}catch(q){W(q instanceof Error?q.message:"楼中楼回复发布失败，请稍后重试。")}finally{te(!1)}}}async function $e(d){X(d.id),G("");try{await y(n,d),P(N=>[...N,d.id]),Q(N=>N.filter(q=>q.id!==d.id)),v(null)}catch(N){G(N instanceof Error?N.message:"楼中楼删除失败，请稍后重试。")}finally{X(null)}}async function Le(){if(!$){F(!0),w("");try{await u(n)}catch(d){w(d instanceof Error?d.message:"楼层删除失败，请稍后重试。"),F(!1)}}}function Ce(){v(null),w(""),G(""),window.requestAnimationFrame(()=>H.current?.focus())}function Me(){if(!R)return;const d=R;v(null),d.kind==="floor"?Le():$e(d.reply)}const Pe=e.jsxs("div",{className:`thread-avatar-rail${b?" thread-avatar-rail-open":""}`,ref:D,children:[e.jsx("button",{"aria-controls":`author-card-${n.floor}`,"aria-expanded":b,"aria-label":`查看${n.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>L(d=>!d),type:"button",children:e.jsx("img",{src:n.author.avatar,alt:""})}),e.jsx(_t,{author:n.author,id:`author-card-${n.floor}`})]}),De=e.jsx(Ft,{attachments:n.attachments,bodyFallback:e.jsx("div",{className:ae,children:n.paragraphs.map(d=>e.jsx("p",{children:d},d))}),bodyClassName:ae,bodyHtml:n.contentHtml,floor:n.floor,isActivitySignupCanceled:V,onImageOpen:fe,signatureHtml:i?void 0:n.signatureHtml,signatureText:i?void 0:n.signature}),Fe=e.jsxs("button",{"aria-label":`复制第 ${n.floor} 楼链接`,className:"thread-floor-index",onClick:ne,title:"复制楼层链接",type:"button",children:["#",n.floor]}),He=e.jsxs(e.Fragment,{children:[e.jsx(Ut,{canDelete:(!o||m)&&(n.canDelete??n.isOwn??!1),canEdit:(!o||m)&&!!n.isOwn,canQuote:t,canReply:r,deleting:$,editHref:g,onDelete:d=>{H.current=d,w(""),v({kind:"floor"})},onQuote:()=>I(n),onReply:()=>he()}),E&&e.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:E}),O.length>0&&e.jsx("section",{className:"nested-replies","aria-label":`${n.floor} 楼的楼中楼回复`,children:O.map(d=>e.jsxs("article",{children:[e.jsx("img",{src:d.author.avatar,alt:""}),e.jsxs("div",{children:[e.jsx("a",{className:"nested-reply-author",href:se(d.author.name),children:d.author.name}),d.target&&e.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",e.jsx("a",{href:se(d.target),children:d.target})]}),d.contentHtml?e.jsx(Ee,{className:"nested-reply-content",html:d.contentHtml,onImageOpen:fe,variant:"nested"}):e.jsx("p",{children:d.content}),e.jsxs("footer",{className:"nested-reply-footer",children:[e.jsx("time",{children:ue(d.publishedAt)}),r&&e.jsx("button",{onClick:()=>he(d.author.name),type:"button",children:"回复"}),d.canDelete&&e.jsxs("button",{className:"nested-reply-delete",disabled:Y===d.id,onClick:N=>{H.current=N.currentTarget,G(""),v({kind:"nested",reply:d})},type:"button",children:[e.jsx(me,{size:12}),Y===d.id?"删除中":"删除"]})]})]})]},d.id))}),z&&e.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:z}),B!==void 0&&r&&e.jsxs("form",{className:"nested-reply-composer",onSubmit:ke,children:[e.jsx("textarea",{"aria-label":B?`回复 @${B}`:`回复第 ${n.floor} 楼`,maxLength:500,onChange:d=>{U(d.target.value),W("")},placeholder:B?`回复 @${B}`:"写一条楼中楼回复",ref:re,rows:2,value:Z}),e.jsxs("div",{className:"nested-reply-composer-actions",children:[e.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:J,onClick:pe,type:"button",children:e.jsx(ge,{size:15})}),e.jsxs("button",{className:"nested-reply-submit",disabled:!Z.trim()||J,type:"submit",children:[e.jsx(et,{size:14}),J?"发送中":"发送"]})]}),ee&&e.jsx("p",{className:"nested-reply-error",role:"alert",children:ee})]})]}),Oe=e.jsxs(e.Fragment,{children:[T&&e.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[e.jsx(tt,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),c&&e.jsx(wt,{images:c.images,initialImageIndex:c.imageIndex,onImageChange:c.onImageChange,onClose:Te}),R&&e.jsx(Kt,{floor:n,isMainPost:m,onCancel:Ce,onConfirm:Me,target:R})]});return e.jsx(Bt,{articleAfterContent:Oe,author:n.author,avatarRail:Pe,content:De,decorationImageSrc:a,editedAt:n.editedAt,floor:n.floor,floorIndex:Fe,id:String(n.floor),inlineAvatar:l,mainAfterContent:He,onCopy:Gt,publishedAt:n.publishedAt,showAuthorProfile:h})}function Kt({floor:t,isMainPost:r,onCancel:a,onConfirm:g,target:n}){const o=n.kind==="nested"?n.reply:null,m=o?"删除楼中楼回复":r?"删除主楼":"删除回复",l=o?"":r?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",h=o?.author.name??t.author.name,i=o?`#${t.floor} · 楼中楼`:`#${t.floor}`,u=Yt(o?.content||t.quoteText||t.paragraphs[0]||"");return s.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),s.useEffect(()=>{function y(I){I.key==="Escape"&&a()}return document.addEventListener("keydown",y),()=>document.removeEventListener("keydown",y)},[a]),e.jsx("div",{className:"thread-delete-dialog-backdrop",onMouseDown:y=>{y.currentTarget===y.target&&a()},role:"presentation",children:e.jsxs("section",{"aria-describedby":l?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[e.jsxs("header",{children:[e.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:e.jsx(ft,{size:19})}),e.jsx("div",{children:e.jsx("h2",{id:"thread-delete-dialog-title",children:m})}),e.jsx("button",{"aria-label":"关闭删除确认",onClick:a,type:"button",children:e.jsx(ge,{size:18})})]}),e.jsxs("div",{className:"thread-delete-dialog-body",children:[l&&e.jsx("p",{id:"thread-delete-dialog-description",children:l}),e.jsxs("div",{className:"thread-delete-dialog-target",children:[e.jsxs("span",{children:[h," · ",i]}),e.jsx("p",{children:u||"此回复没有可预览的文字内容。"})]})]}),e.jsxs("footer",{children:[e.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:a,type:"button",children:"取消"}),e.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:g,type:"button",children:[e.jsx(me,{size:15}),"确认删除"]})]})]})})}function Yt(t){const r=t.replace(/\s+/g," ").trim();return r.length>100?`${r.slice(0,100).trimEnd()}…`:r}function Wt(t){const r=a=>String(a).padStart(2,"0");return`${t.getFullYear()}-${r(t.getMonth()+1)}-${r(t.getDate())} ${r(t.getHours())}:${r(t.getMinutes())}:${r(t.getSeconds())}`}export{pt as P,Ft as T,Bt as a,Ut as b,ir as c,bt as w};
