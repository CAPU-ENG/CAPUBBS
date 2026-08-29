import{d as Re,r as i,j as e,aA as Ke,X as re,s as We,f as Xe,W as Je,aB as Ve,aC as Qe,ar as Ze,am as et,aD as tt,aE as rt,aF as at,aG as nt,l as ie,af as st,al as it,Y as lt,_ as ot}from"./index-CLq0vcO1.js";import{c as ve,m as de,s as ct,M as dt,r as ut,f as mt,d as pe,e as Ne,P as Se,h as gt,R as ft,b as pt,a as ht,C as je}from"./RichTextEditor-bSPZc1sN.js";import{u as yt}from"./useAuthorProfile-S7akdHd9.js";import{P as xt}from"./plus-DVxKerMU.js";import{R as bt}from"./rotate-ccw-BleGkigs.js";import{l as vt}from"./thread-CQyWpxMZ.js";import{r as jt,b as It,t as wt}from"./forumMarkup-CA2EeGBo.js";import{D as Ae,a as ue}from"./TagBadge-BhMsIZMH.js";import{T as oe}from"./trash-2-C60p9ff4.js";import{C as Et}from"./check-Djxhr-6T.js";import{Q as Rt}from"./quote-BXm3uE2Y.js";import{P as Ie}from"./pencil-DCMCskXK.js";import{E as Nt}from"./external-link-7XV-rQpf.js";import{T as St}from"./triangle-alert-BuC2CaSA.js";const At=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],ge=Re("paperclip",At);const kt=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],Tt=Re("reply",kt);async function Ct(t){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(t),!0}catch{}const r=document.createElement("textarea");r.value=t,r.setAttribute("readonly",""),r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select();try{return document.execCommand("copy")}finally{r.remove()}}function ke({className:t="",html:r,onImageOpen:n,variant:g}){const a=i.useRef(null),l=i.useMemo(()=>({__html:r}),[r]);if(i.useEffect(()=>{const s=a.current;if(!s)return;const m=Array.from(s.querySelectorAll("img")),h=p=>{p.dataset.capubbsImageLoaded="true"},j=m.map(p=>{if(p.complete)return h(p),null;const I=()=>h(p);return p.addEventListener("load",I,{once:!0}),p.addEventListener("error",I,{once:!0}),{handleLoad:I,image:p}});return()=>{j.forEach(p=>{p&&(p.image.removeEventListener("load",p.handleLoad),p.image.removeEventListener("error",p.handleLoad))})}},[r]),!r)return null;function u(s,m){if(!n||!(s instanceof Element))return;const h=s.closest("img");if(!(h instanceof HTMLImageElement))return;const j=Array.from(m.querySelectorAll("img")),p=j.indexOf(h);if(p<0)return;const I=j.map(E=>$t(E,m)),T=j.map((E,x)=>{const S=I[x];return{alt:E.alt.trim(),src:E.currentSrc||E.src,...S?{galleryId:S.galleryId,galleryIndex:S.galleryIndex}:{}}});n(T,p,h,E=>{const x=I[E];x&&ct(x.gallery,x.galleryIndex)})}function o(s){const m=ve(s.target);if(m&&s.target instanceof Element){s.preventDefault(),s.stopPropagation(),de(s.target,m);return}!n||!(s.target instanceof HTMLImageElement)||(s.preventDefault(),u(s.target,s.currentTarget))}function f(s){const m=ve(s.target);if(m&&["Enter"," "].includes(s.key)&&s.target instanceof Element){s.preventDefault(),de(s.target,m);return}if(["ArrowLeft","ArrowRight"].includes(s.key)&&s.target instanceof Element&&s.target.closest(".capubbs-gallery")){s.preventDefault(),de(s.target,s.key==="ArrowLeft"?"prev":"next");return}!n||!(s.target instanceof HTMLImageElement)||!["Enter"," "].includes(s.key)||(s.preventDefault(),u(s.target,s.currentTarget))}return e.jsx("div",{ref:a,className:`forum-markup forum-markup-${g} ${t}`.trim(),"data-forum-markup":g,dangerouslySetInnerHTML:l,onClick:o,onKeyDown:f})}function $t(t,r){const n=t.closest(".capubbs-gallery");if(!n||!r.contains(n))return null;const a=Array.from(r.querySelectorAll(".capubbs-gallery")).indexOf(n),u=Array.from(n.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(t);return a>=0&&u>=0?{gallery:n,galleryId:a,galleryIndex:u}:null}const F=1,Te=4,le=.25;function Lt(t){return Math.min(Te,Math.max(F,t))}function me(t){const[r,n]=[...t.values()];return!r||!n?null:Math.hypot(n.x-r.x,n.y-r.y)}function Mt({images:t,initialImageIndex:r,onImageChange:n,onClose:g}){const a=Math.min(Math.max(0,r),Math.max(0,t.length-1)),[l,u]=i.useState(a),[o,f]=i.useState(F),[s,m]=i.useState({x:0,y:0}),[h,j]=i.useState(!1),p=i.useRef(null),I=i.useRef(null),T=i.useRef(null),N=i.useRef(null),E=i.useRef(a),x=i.useRef(F),S=i.useRef({x:0,y:0}),M=i.useRef(null),R=i.useRef(!1),w=i.useRef(new Map),C=i.useRef(null),P=i.useRef(F),A=i.useRef(n),V=i.useRef(g);A.current=n,V.current=g;function ee(c,b=x.current){const v=p.current,D=T.current;if(!v||!D||b<=F)return{x:0,y:0};const H=Math.max(0,(D.clientWidth*b-v.clientWidth)/2),k=Math.max(0,(D.clientHeight*b-v.clientHeight)/2);return{x:Math.min(H,Math.max(-H,c.x)),y:Math.min(k,Math.max(-k,c.y))}}function G(c,b=x.current){const v=ee(c,b);S.current=v,m(v)}function O(c){const b=Math.round(Lt(c)*100)/100;x.current=b,f(b),G(S.current,b)}function z(){x.current=F,S.current={x:0,y:0},f(F),m({x:0,y:0})}function U(c){const b=Math.min(Math.max(0,c),t.length-1);b!==E.current&&(E.current=b,u(b),z(),A.current?.(b))}function B(){V.current(E.current)}i.useEffect(()=>{const c=document.body.style.overflow,b=document.activeElement,v=p.current;document.body.style.overflow="hidden",N.current?.focus();function D(y){if(y.key==="Escape"){y.preventDefault(),B();return}if(y.key==="ArrowLeft"){y.preventDefault(),y.stopPropagation(),U(E.current-1);return}if(y.key==="ArrowRight"){y.preventDefault(),y.stopPropagation(),U(E.current+1);return}if(y.key==="+"||y.key==="="){y.preventDefault(),y.stopPropagation(),O(x.current+le);return}if(y.key==="-"){y.preventDefault(),y.stopPropagation(),O(x.current-le);return}if(y.key==="0"){y.preventDefault(),y.stopPropagation(),z();return}if(y.key==="Tab"){const q=I.current?.querySelectorAll("button:not(:disabled)");if(!q?.length)return;const te=q[0],ne=q[q.length-1],se=document.activeElement;if(y.shiftKey&&se===te){y.preventDefault(),ne.focus();return}if(!y.shiftKey&&se===ne){y.preventDefault(),te.focus();return}I.current?.contains(se)||(y.preventDefault(),te.focus())}}function H(y){if(y.preventDefault(),y.stopPropagation(),y.deltaY===0)return;const q=y.ctrlKey?.01:.002;O(x.current*Math.exp(-y.deltaY*q))}function k(y){y.preventDefault(),y.stopPropagation(),P.current=x.current}function _(y){if(y.preventDefault(),y.stopPropagation(),w.current.size>=2)return;const q=y.scale;typeof q=="number"&&O(P.current*q)}function ae(){G(S.current,x.current)}return document.addEventListener("keydown",D,{capture:!0}),window.addEventListener("resize",ae),v?.addEventListener("wheel",H,{passive:!1}),v?.addEventListener("gesturestart",k,{passive:!1}),v?.addEventListener("gesturechange",_,{passive:!1}),v?.addEventListener("gestureend",_,{passive:!1}),()=>{document.removeEventListener("keydown",D,{capture:!0}),window.removeEventListener("resize",ae),v?.removeEventListener("wheel",H),v?.removeEventListener("gesturestart",k),v?.removeEventListener("gesturechange",_),v?.removeEventListener("gestureend",_),document.body.style.overflow=c,b instanceof HTMLElement&&b.focus()}},[]),i.useEffect(()=>{[t[l-1],t[l+1]].forEach(c=>{if(!c)return;const b=new Image;b.src=c.src})},[l,t]);function Q(c,b,v){M.current={pointerId:c,startX:b,startY:v,originX:S.current.x,originY:S.current.y},j(!0)}function Y(c){if(c.target instanceof Element&&c.target.closest("button, .thread-image-lightbox-controls"))return;const b=c.pointerType==="touch",v=c.pointerType==="mouse"&&c.button===0;if(!(!b&&!v)&&(R.current=!1,!(!b&&x.current<=F))){if(c.preventDefault(),c.currentTarget.setPointerCapture(c.pointerId),b&&(w.current.set(c.pointerId,{x:c.clientX,y:c.clientY}),w.current.size===2)){C.current=me(w.current),M.current=null,j(!1);return}x.current>F&&Q(c.pointerId,c.clientX,c.clientY)}}function X(c){const b=w.current.has(c.pointerId),v=M.current;if(!b&&v?.pointerId!==c.pointerId)return;if(c.preventDefault(),c.stopPropagation(),b&&w.current.set(c.pointerId,{x:c.clientX,y:c.clientY}),w.current.size===2){const k=me(w.current),_=C.current;if(!k||!_){C.current=k;return}Math.abs(k-_)>1&&(R.current=!0),O(x.current*(k/_)),C.current=k;return}if(!v||x.current<=F)return;const D=c.clientX-v.startX,H=c.clientY-v.startY;Math.hypot(D,H)>3&&(R.current=!0),G({x:v.originX+D,y:v.originY+H})}function $(c){const b=w.current.delete(c.pointerId),v=M.current?.pointerId===c.pointerId;if(!(!b&&!v)){if(C.current=w.current.size===2?me(w.current):null,w.current.size===1&&x.current>F){const[D]=w.current.entries();if(D){const[H,k]=D;Q(H,k.x,k.y)}}else M.current=null,j(!1);c.currentTarget.hasPointerCapture(c.pointerId)&&c.currentTarget.releasePointerCapture(c.pointerId)}}const J=Math.round(o*100),K=t[l]??t[0];return K?Ke.createPortal(e.jsx("div",{className:"thread-image-lightbox-backdrop","data-can-pan":o>F,"data-dragging":h,onClick:c=>{c.target===c.currentTarget&&!R.current&&B()},onPointerCancel:$,onPointerDown:Y,onPointerMove:X,onPointerUp:$,ref:p,role:"presentation",children:e.jsxs("figure",{"aria-label":K.alt?`图片预览：${K.alt}（${l+1}/${t.length}）`:`图片预览（${l+1}/${t.length}）`,"aria-modal":"true",className:"thread-image-lightbox",ref:I,role:"dialog",children:[e.jsx("button",{"aria-label":"关闭图片预览",className:"thread-image-lightbox-close",onClick:B,ref:N,type:"button",children:e.jsx(re,{size:20})}),t.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{"aria-label":"上一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-prev",disabled:l===0,onClick:()=>U(l-1),title:"上一张（←）",type:"button",children:e.jsx(We,{size:28})}),e.jsx("button",{"aria-label":"下一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-next",disabled:l===t.length-1,onClick:()=>U(l+1),title:"下一张（→）",type:"button",children:e.jsx(Xe,{size:28})})]}),e.jsx("img",{alt:K.alt,draggable:"false",onLoad:()=>G(S.current,x.current),ref:T,src:K.src,style:{transform:`translate3d(${s.x}px, ${s.y}px, 0) scale(${o})`}}),K.alt&&e.jsx("figcaption",{children:K.alt}),e.jsxs("div",{"aria-label":"图片缩放",className:"thread-image-lightbox-controls",role:"toolbar",children:[e.jsx("button",{"aria-label":"缩小图片",disabled:o<=F,onClick:()=>O(o-le),title:"缩小（-）",type:"button",children:e.jsx(dt,{size:18})}),e.jsxs("output",{"aria-label":"当前缩放比例","aria-live":"polite",children:[J,"%"]}),e.jsx("button",{"aria-label":"放大图片",disabled:o>=Te,onClick:()=>O(o+le),title:"放大（+）",type:"button",children:e.jsx(xt,{size:18})}),e.jsx("button",{"aria-label":"恢复原始大小",disabled:o===F,onClick:z,title:"恢复原始大小（0）",type:"button",children:e.jsx(bt,{size:17})})]})]})}),document.body):null}const Dt="/assets/thread-html-frame-DuCry7dF.css",Pt=28,Ft=64,Ht=5e4,Ot=30,Ce=30,Z="capubbs-thread-html-frame",zt=new URL(Dt,window.location.origin).href;function we({className:t="",floor:r,html:n,isActivitySignupCanceled:g=!1,onImageOpen:a,variant:l}){const u=i.useMemo(()=>l==="signature"?ut(n):n,[n,l]),o=qt(u,l==="signature"),f=jt(o),s=i.useMemo(()=>f?null:It(o,{normalizeLegacyLineBreaks:l==="signature"}),[o,f,l]),m=i.useMemo(()=>wt(o),[o]);return!f&&s!==null?e.jsx(ke,{className:t,html:s,onImageOpen:a,variant:l}):e.jsx(_t,{className:t,floor:r,html:m,isActivitySignupCanceled:g,onImageOpen:a,variant:l})}function _t({className:t,floor:r,html:n,isActivitySignupCanceled:g,onImageOpen:a,variant:l}){const u=i.useRef(null),o=i.useRef(`${l}-${r}-${Math.random().toString(36).slice(2)}`),f=i.useRef(a);f.current=a;const s=l==="signature"?Pt:Ft,m=!!a,[h,j]=i.useState(null),p=Wt(),I=i.useRef(p),T=Je(),N=l==="signature"?14:T,E=i.useMemo(()=>Gt({canOpenImages:m,frameId:o.current,html:n,isActivitySignupCanceled:g,isDarkTheme:I.current,fontSize:N,variant:l}),[m,N,n,g,l]),x=i.useMemo(()=>`data:text/html;charset=utf-8,${encodeURIComponent(E)}`,[E]),S=i.useCallback(()=>{u.current?.contentWindow?.postMessage({frameId:o.current,source:Z,theme:p?"dark":"light",type:"theme"},"*")},[p]);return i.useEffect(()=>{j(null)},[x]),i.useEffect(()=>{S()},[S]),i.useLayoutEffect(()=>{function M(R){if(!(R.source!==u.current?.contentWindow||!Kt(R.data))&&R.data.frameId===o.current){if(R.data.type==="anchor"){const w=u.current;if(!w)return;const C=window.getComputedStyle(document.documentElement),P=Number.parseFloat(C.getPropertyValue("--topbar-height"))||0,A=window.scrollY+w.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,A+R.data.offsetTop-P-16)});return}if(R.data.type==="navigate"){const w=Ve(R.data.url,$e());if(!w)return;window.history.pushState(null,"",w),window.dispatchEvent(new Event(Qe));const C=new URL(w,window.location.origin);C.hash?window.requestAnimationFrame(()=>{const P=decodeURIComponent(C.hash.slice(1)),A=Ze(`#${P}`);(A?et(A):document.getElementById(P))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(R.data.type==="image-open"){const w=u.current;if(!w)return;const C=P=>{const A=R.data.images[P];!A||typeof A.galleryId!="number"||!Number.isSafeInteger(A.galleryIndex)||w.contentWindow?.postMessage({frameId:o.current,galleryId:A.galleryId,galleryIndex:A.galleryIndex,source:Z,type:"gallery-select"},"*")};f.current?.(R.data.images,R.data.imageIndex,w,C);return}j(Math.min(Ht,Math.max(s,Math.ceil(R.data.height))))}}return window.addEventListener("message",M),()=>window.removeEventListener("message",M)},[s]),e.jsx("iframe",{ref:u,className:`thread-html-frame thread-html-frame-${l} ${t}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-same-origin",scrolling:"no",src:x,onLoad:S,style:{"--thread-html-frame-width-allowance":`${Ce}px`,...h===null?{}:{"--thread-html-frame-height":`${h}px`}},title:l==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`})}function qt(t,r){const[n,g]=i.useState(t);return i.useEffect(()=>{const a=new AbortController,l=r?mt(t):[];if(g(t),l.length===0)return()=>a.abort();const u=Array.from(new Map(l.map(o=>[`${o.bid}:${o.tid}:${o.pid}`,o])).values());return Promise.all(u.map(async o=>{try{const f=await vt(o,a.signal);return[`${o.bid}:${o.tid}:${o.pid}`,f]}catch(f){if(f instanceof DOMException&&f.name==="AbortError")throw f;return[`${o.bid}:${o.tid}:${o.pid}`,""]}})).then(o=>{if(a.signal.aborted)return;const f=new Map(o);let s=t;l.forEach(m=>{const h=f.get(`${m.bid}:${m.tid}:${m.pid}`);h&&(s=s.replace(m.marker,h))}),g(s)}).catch(()=>{}),()=>a.abort()},[r,t]),n}function Gt({canOpenImages:t,frameId:r,fontSize:n,html:g,isActivitySignupCanceled:a,isDarkTheme:l,variant:u}){const o=u==="signature",f=o?"#999999":"rgb(63 63 70)",s=o?"#999999":"rgb(228 228 231)",m=o?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",h=o?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",j=a?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${l?"dark":"light"}" style="background:transparent;color-scheme:${l?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${Ee($e())}">
  <meta http-equiv="Content-Security-Policy" content="${Yt()}">
  <link rel="stylesheet" href="${Ee(zt)}">
  <style>
    html{--capubbs-frame-text-color:${f}}html.dark{--capubbs-frame-text-color:${s}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${m};font-size:${n}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${Ce}px);${h}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${Ut(r,t)}<\/script>
  <script src="/bbs/lib/jquery.min.js"><\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${u}${j}">${Bt(g)}</main></body>
</html>`}function Ut(t,r){return`(function(){
    var frameId=${JSON.stringify(t)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var canOpenImages=${JSON.stringify(r)};
    var forumAppExactPaths=${JSON.stringify(tt)};
    var forumAppPathPrefixes=${JSON.stringify(rt)};
    var legacyForumExactPaths=${JSON.stringify(at)};
    var legacyForumPathPatterns=${JSON.stringify(nt)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${Ot};
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
      window.parent.postMessage({source:'${Z}',type:'resize',frameId:frameId,height:height},'*');
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
        window.parent.postMessage({source:'${Z}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${Z}',type:'navigate',frameId:frameId,url:url},'*');
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
      window.parent.postMessage({source:'${Z}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
      if(event.source!==window.parent||!data||data.source!=='${Z}'||data.frameId!==frameId)return;
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
  }());`}function Bt(t){return t.replace(/<script\b([^>]*)>/gi,(r,n)=>`<script${n.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function Yt(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'"].join("; ")}function $e(){return new URL("/bbs/content/",window.location.origin).href}function Ee(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Kt(t){if(!t||typeof t!="object")return!1;const r=t;return r.source!==Z||typeof r.frameId!="string"?!1:r.type==="anchor"?typeof r.offsetTop=="number"&&Number.isFinite(r.offsetTop)&&r.offsetTop>=0:r.type==="navigate"?typeof r.url=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(n=>!!n&&typeof n=="object"&&typeof n.alt=="string"&&typeof n.src=="string"&&n.src.length>0&&(n.galleryId===void 0&&n.galleryIndex===void 0||typeof n.galleryId=="number"&&Number.isSafeInteger(n.galleryId)&&n.galleryId>=0&&typeof n.galleryIndex=="number"&&Number.isSafeInteger(n.galleryIndex)&&n.galleryIndex>=0)):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function Wt(){const[t,r]=i.useState(()=>document.documentElement.classList.contains("dark"));return i.useEffect(()=>{const n=document.documentElement,g=()=>r(n.classList.contains("dark")),a=new MutationObserver(g);return a.observe(n,{attributeFilter:["class"],attributes:!0}),()=>a.disconnect()},[]),t}function Le({bodyClassName:t="thread-floor-body",bodyFallback:r=null,bodyHtml:n,floor:g,isActivitySignupCanceled:a=!1,onImageOpen:l,signatureClassName:u="thread-signature",signatureHtml:o,signatureText:f}){const s=l?(m,h,j,p)=>{const I=m[h];I&&l([I],0,j,p?()=>p(h):void 0)}:void 0;return e.jsxs(e.Fragment,{children:[n?e.jsx(we,{className:t,floor:g,html:n,isActivitySignupCanceled:a,onImageOpen:l,variant:"floor"}):r,o?e.jsx(we,{className:u,floor:g,html:o,onImageOpen:s,variant:"signature"}):f?e.jsx("footer",{className:u,children:e.jsx("p",{children:f})}):null]})}function Xt({author:t,id:r}){const n=t.tags??pe(t.name),[g,a]=i.useState(!1),l=i.useRef(null),u=i.useRef(null),o=i.useRef(null),f=i.useRef(null),s=n.map(m=>`${m.id}:${m.name}`).join("|");return i.useLayoutEffect(()=>{if(n.length===0){a(!1);return}const m=()=>{const j=l.current,p=u.current,I=o.current,T=f.current;if(!j||!p||!I||!T||j.offsetWidth===0)return;const N=I.getBoundingClientRect().width,E=T.getBoundingClientRect().width,x=Number.parseFloat(getComputedStyle(p).columnGap)||0,S=p.clientWidth-N-x,M=E>S+1;a(R=>R===M?R:M)};m();const h=new ResizeObserver(m);return[l.current,u.current,f.current].forEach(j=>{j&&h.observe(j)}),()=>h.disconnect()},[s,n.length]),e.jsxs("div",{id:r,ref:l,className:"author-hover-card",role:"dialog","aria-label":`${t.name} 的用户摘要`,children:[e.jsxs("div",{className:"author-card-head",children:[e.jsx("img",{src:t.avatar,alt:""}),e.jsxs("div",{className:"author-card-head-copy",children:[e.jsxs("div",{ref:u,className:"author-card-name-line","data-tags-overflow":g?"true":void 0,children:[e.jsx("strong",{ref:o,children:t.name}),e.jsx("div",{className:"author-card-tag-slot",children:e.jsx(ue,{size:"compact",tags:n})})]}),(t.stars>0||t.role)&&e.jsxs("span",{className:"author-card-status",children:["★".repeat(t.stars),t.stars>0&&t.role?" · ":"",t.role]})]})]}),g?e.jsx("div",{className:"author-card-tags-row",children:e.jsx(ue,{size:"compact",tags:n})}):null,t.medals?.length?e.jsx("div",{className:"author-card-medals",children:e.jsx(Se,{medals:t.medals,profileName:t.name,variant:"compact"})}):null,e.jsx("div",{ref:f,className:"author-card-tag-width-measure","aria-hidden":"true",children:e.jsx(ue,{size:"compact",tags:n})}),e.jsxs("dl",{children:[e.jsxs("div",{children:[e.jsx("dt",{children:"主题"}),e.jsx("dd",{children:t.topics})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"回复"}),e.jsx("dd",{children:t.replies})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"签到"}),e.jsx("dd",{children:t.checkins})]})]}),e.jsxs("p",{children:["最近在线：",t.lastSeen]}),e.jsxs("a",{href:ie(t.name),children:["查看个人主页 ",e.jsx(Nt,{size:13})]})]})}function Jt({author:t}){const r=t.tags??pe(t.name),n=Ne(r),g=ie(t.name);return e.jsxs("aside",{className:"thread-author-profile","aria-label":`${t.name} 的资料`,children:[e.jsx("a",{"aria-label":`查看${t.name}的个人主页`,className:"thread-author-profile-avatar",href:g,children:e.jsx("img",{src:t.avatar,alt:""})}),e.jsx("div",{className:"thread-author-profile-identity",children:e.jsx("a",{href:g,children:t.name})}),(t.stars>0||t.role)&&e.jsxs("div",{className:"thread-author-profile-status",children:[t.stars>0&&e.jsx("span",{"aria-label":`${t.stars} 星`,children:"★".repeat(t.stars)}),t.role&&e.jsx("strong",{children:t.role})]}),e.jsx(Ae,{tags:n}),e.jsx(Se,{medals:t.medals??[],profileName:t.name,variant:"compact"}),e.jsxs("dl",{className:"thread-author-profile-stats",children:[e.jsxs("div",{children:[e.jsx("dt",{children:"主题"}),e.jsx("dd",{children:t.topics})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"回复"}),e.jsx("dd",{children:t.replies})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"签到"}),e.jsx("dd",{children:t.checkins})]})]}),e.jsxs("p",{className:"thread-author-profile-last-seen",children:[e.jsx("span",{children:"最近在线"}),e.jsx("strong",{children:t.lastSeen})]})]})}function fe(t){return t.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function Vt(t){const r=window.getSelection()?.toString();r&&(t.preventDefault(),t.clipboardData.setData("text/plain",r))}function Me({articleAfterContent:t,author:r,avatarRail:n,className:g="",content:a,decorationImageSrc:l,editedAt:u,floor:o,floorIndex:f,id:s,inlineAvatar:m=!1,mainAfterContent:h,onCopy:j,publishedAt:p,showAuthorProfile:I}){const T=r.tags??pe(r.name),N=Ne(T);return e.jsxs("article",{className:`thread-floor${I?" thread-floor-with-author-profile":""}${g?` ${g}`:""}`,"data-floor":o,id:s,onCopy:j,children:[l&&e.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:e.jsx("img",{alt:"",src:l})}),I?e.jsx(Jt,{author:r}):!m&&n,e.jsxs("div",{className:"thread-floor-main",children:[e.jsxs("header",{className:"thread-floor-header",children:[!I&&m&&n,e.jsxs("div",{className:"thread-floor-author",children:[e.jsx("a",{href:ie(r.name),children:r.name}),e.jsx(Ae,{tags:N})]}),e.jsxs("div",{className:"thread-floor-time",children:[e.jsx("time",{children:fe(p)}),u&&e.jsxs(e.Fragment,{children:[e.jsx("span",{children:"·"}),e.jsxs("time",{children:["编辑于 ",fe(u)]})]})]}),f]}),I?e.jsx("div",{className:"thread-floor-content",children:a}):a,h]}),t]})}function De({canDelete:t,canEdit:r,canQuote:n,canReply:g,decorative:a=!1,deleting:l=!1,editHref:u="",onDelete:o,onQuote:f,onReply:s}){const m=a?-1:void 0;return e.jsxs("div",{"aria-hidden":a||void 0,className:`thread-floor-actions${a?" thread-floor-actions-decorative":""}`,children:[n&&e.jsxs("button",{onClick:f,tabIndex:m,type:"button",children:[e.jsx(Rt,{size:15}),"引用"]}),g&&e.jsxs("button",{onClick:s,tabIndex:m,type:"button",children:[e.jsx(Tt,{size:15}),"回复"]}),r&&(a?e.jsxs("button",{tabIndex:-1,type:"button",children:[e.jsx(Ie,{size:15}),"编辑"]}):e.jsxs("a",{href:u,children:[e.jsx(Ie,{size:15}),"编辑"]})),t&&e.jsxs("button",{"aria-busy":l||void 0,className:"floor-action-danger",disabled:!a&&l,onClick:a?void 0:h=>o?.(h.currentTarget),tabIndex:m,type:"button",children:[e.jsx(oe,{size:15}),l?"删除中":"删除"]})]})}function xr({canQuote:t,canReply:r,decorationImageSrc:n,editHref:g,floor:a,isActivityThread:l,isMainPost:u,inlineAvatar:o,showAuthorProfile:f,hideSignature:s,onDeleteFloor:m,onDeleteNestedReply:h,onQuote:j,onSubmitNestedReply:p,viewer:I}){const[T,N]=i.useState(!1),[E,x]=i.useState(null),[S,M]=i.useState([]),[R,w]=i.useState(""),[C,P]=i.useState(!1),[A,V]=i.useState([]),[ee,G]=i.useState(""),[O,z]=i.useState(""),[U,B]=i.useState(null),[Q,Y]=i.useState(""),[X,$]=i.useState(!1),[J,K]=i.useState(void 0),[c,b]=i.useState(null),[v,D]=i.useState(!1),H=i.useRef(null),k=i.useRef(null),_=i.useRef(null),ae=i.useRef(null),y=i.useRef(null),q=i.useMemo(()=>[...a.nestedReplies??[],...A].filter(d=>!S.includes(d.id)),[S,a.nestedReplies,A]),te=l&&!u&&/<\s*(?:s|strike)\b/i.test(a.contentHtml??""),ne=`thread-floor-body${te?" capubbs-activity-signup-canceled":""}`;i.useEffect(()=>()=>{k.current!==null&&window.clearTimeout(k.current)},[]),i.useEffect(()=>{if(!v)return;function d(L){H.current?.contains(L.target)||D(!1)}return document.addEventListener("pointerdown",d),()=>document.removeEventListener("pointerdown",d)},[v]);async function se(){const d=`${window.location.origin}${window.location.pathname}${window.location.search}#${a.floor}`;await Ct(d)&&(N(!0),k.current!==null&&window.clearTimeout(k.current),k.current=window.setTimeout(()=>N(!1),1800))}const ye=(d,L,W,ce)=>{y.current=W,b({imageIndex:L,images:d,onImageChange:ce})};function Pe(d){c?.onImageChange?.(d),b(null),window.requestAnimationFrame(()=>y.current?.focus())}function xe(d=null){K(d),G(""),z(""),Y(""),window.requestAnimationFrame(()=>ae.current?.focus())}function be(){K(void 0),G(""),Y("")}async function Fe(d){d.preventDefault();const L=ee.trim();if(!(!L||!I||X)){$(!0),Y("");try{const W=await p(a,J??null,L);V(ce=>[...ce,{author:I,canDelete:!0,content:L,id:W>0?String(W):`local-${a.id}-${Date.now()}`,publishedAt:er(new Date),target:J??void 0}]),be()}catch(W){Y(W instanceof Error?W.message:"楼中楼回复发布失败，请稍后重试。")}finally{$(!1)}}}async function He(d){B(d.id),z("");try{await h(a,d),M(L=>[...L,d.id]),V(L=>L.filter(W=>W.id!==d.id)),x(null)}catch(L){z(L instanceof Error?L.message:"楼中楼删除失败，请稍后重试。")}finally{B(null)}}async function Oe(){if(!C){P(!0),w("");try{await m(a)}catch(d){w(d instanceof Error?d.message:"楼层删除失败，请稍后重试。"),P(!1)}}}function ze(){x(null),w(""),z(""),window.requestAnimationFrame(()=>_.current?.focus())}function _e(){if(!E)return;const d=E;x(null),d.kind==="floor"?Oe():He(d.reply)}const qe=e.jsxs("div",{className:`thread-avatar-rail${v?" thread-avatar-rail-open":""}`,ref:H,children:[e.jsx("button",{"aria-controls":`author-card-${a.floor}`,"aria-expanded":v,"aria-label":`查看${a.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>D(d=>!d),type:"button",children:e.jsx("img",{src:a.author.avatar,alt:""})}),e.jsx(Xt,{author:a.author,id:`author-card-${a.floor}`})]}),Ge=e.jsx(Le,{bodyFallback:e.jsx("div",{className:ne,children:a.paragraphs.map(d=>e.jsx("p",{children:d},d))}),bodyClassName:ne,bodyHtml:a.contentHtml,floor:a.floor,isActivitySignupCanceled:te,onImageOpen:ye,signatureHtml:s?void 0:a.signatureHtml,signatureText:s?void 0:a.signature}),Ue=e.jsxs("button",{"aria-label":`复制第 ${a.floor} 楼链接`,className:"thread-floor-index",onClick:se,title:"复制楼层链接",type:"button",children:["#",a.floor]}),Be=e.jsxs(e.Fragment,{children:[e.jsx(De,{canDelete:(!l||u)&&(a.canDelete??a.isOwn??!1),canEdit:(!l||u)&&!!a.isOwn,canQuote:t,canReply:r,deleting:C,editHref:g,onDelete:d=>{_.current=d,w(""),x({kind:"floor"})},onQuote:()=>j(a),onReply:()=>xe()}),R&&e.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:R}),q.length>0&&e.jsx("section",{className:"nested-replies","aria-label":`${a.floor} 楼的楼中楼回复`,children:q.map(d=>e.jsxs("article",{children:[e.jsx("img",{src:d.author.avatar,alt:""}),e.jsxs("div",{children:[e.jsx("a",{className:"nested-reply-author",href:ie(d.author.name),children:d.author.name}),d.target&&e.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",e.jsx("a",{href:ie(d.target),children:d.target})]}),d.contentHtml?e.jsx(ke,{className:"nested-reply-content",html:d.contentHtml,onImageOpen:ye,variant:"nested"}):e.jsx("p",{children:d.content}),e.jsxs("footer",{className:"nested-reply-footer",children:[e.jsx("time",{children:fe(d.publishedAt)}),r&&e.jsx("button",{onClick:()=>xe(d.author.name),type:"button",children:"回复"}),d.canDelete&&e.jsxs("button",{className:"nested-reply-delete",disabled:U===d.id,onClick:L=>{_.current=L.currentTarget,z(""),x({kind:"nested",reply:d})},type:"button",children:[e.jsx(oe,{size:12}),U===d.id?"删除中":"删除"]})]})]})]},d.id))}),O&&e.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:O}),J!==void 0&&r&&e.jsxs("form",{className:"nested-reply-composer",onSubmit:Fe,children:[e.jsx("textarea",{"aria-label":J?`回复 @${J}`:`回复第 ${a.floor} 楼`,maxLength:500,onChange:d=>{G(d.target.value),Y("")},placeholder:J?`回复 @${J}`:"写一条楼中楼回复",ref:ae,rows:2,value:ee}),e.jsxs("div",{className:"nested-reply-composer-actions",children:[e.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:X,onClick:be,type:"button",children:e.jsx(re,{size:15})}),e.jsxs("button",{className:"nested-reply-submit",disabled:!ee.trim()||X,type:"submit",children:[e.jsx(st,{size:14}),X?"发送中":"发送"]})]}),Q&&e.jsx("p",{className:"nested-reply-error",role:"alert",children:Q})]})]}),Ye=e.jsxs(e.Fragment,{children:[T&&e.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[e.jsx(Et,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),c&&e.jsx(Mt,{images:c.images,initialImageIndex:c.imageIndex,onImageChange:c.onImageChange,onClose:Pe}),E&&e.jsx(Qt,{floor:a,isMainPost:u,onCancel:ze,onConfirm:_e,target:E})]});return e.jsx(Me,{articleAfterContent:Ye,author:a.author,avatarRail:qe,content:Ge,decorationImageSrc:n,editedAt:a.editedAt,floor:a.floor,floorIndex:Ue,id:String(a.floor),inlineAvatar:o,mainAfterContent:Be,onCopy:Vt,publishedAt:a.publishedAt,showAuthorProfile:f})}function Qt({floor:t,isMainPost:r,onCancel:n,onConfirm:g,target:a}){const l=a.kind==="nested"?a.reply:null,u=l?"删除楼中楼回复":r?"删除主楼":"删除回复",o=l?"":r?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",f=l?.author.name??t.author.name,s=l?`#${t.floor} · 楼中楼`:`#${t.floor}`,m=Zt(l?.content||t.quoteText||t.paragraphs[0]||"");return i.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),i.useEffect(()=>{function h(j){j.key==="Escape"&&n()}return document.addEventListener("keydown",h),()=>document.removeEventListener("keydown",h)},[n]),e.jsx("div",{className:"thread-delete-dialog-backdrop",onMouseDown:h=>{h.currentTarget===h.target&&n()},role:"presentation",children:e.jsxs("section",{"aria-describedby":o?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[e.jsxs("header",{children:[e.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:e.jsx(St,{size:19})}),e.jsx("div",{children:e.jsx("h2",{id:"thread-delete-dialog-title",children:u})}),e.jsx("button",{"aria-label":"关闭删除确认",onClick:n,type:"button",children:e.jsx(re,{size:18})})]}),e.jsxs("div",{className:"thread-delete-dialog-body",children:[o&&e.jsx("p",{id:"thread-delete-dialog-description",children:o}),e.jsxs("div",{className:"thread-delete-dialog-target",children:[e.jsxs("span",{children:[f," · ",s]}),e.jsx("p",{children:m||"此回复没有可预览的文字内容。"})]})]}),e.jsxs("footer",{children:[e.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:n,type:"button",children:"取消"}),e.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:g,type:"button",children:[e.jsx(oe,{size:15}),"确认删除"]})]})]})})}function Zt(t){const r=t.replace(/\s+/g," ").trim();return r.length>100?`${r.slice(0,100).trimEnd()}…`:r}function er(t){const r=n=>String(n).padStart(2,"0");return`${t.getFullYear()}-${r(t.getMonth()+1)}-${r(t.getDate())} ${r(t.getHours())}:${r(t.getMinutes())}:${r(t.getSeconds())}`}const tr="自动保存至草稿箱",rr=[{label:"不使用签名档",value:0},{label:"签名档 1",value:1},{label:"签名档 2",value:2},{label:"签名档 3",value:3}];function br({label:t="帖子标题",maxLength:r=40,onChange:n,placeholder:g="请输入帖子标题",required:a=!1,value:l}){return e.jsxs("label",{className:"post-editor-title-field",children:[t?e.jsx("span",{children:t}):null,e.jsx("input",{autoComplete:"off",maxLength:r,onChange:u=>n(u.target.value),placeholder:g,required:a,value:l}),e.jsxs("small",{children:[l.trim().length," / ",r]})]})}function vr({afterEditor:t,ariaLabel:r,attachmentDialogDescription:n,attachmentLabel:g="待上传附件",attachments:a,beforeEditor:l,className:u="",editorRef:o,editorValue:f,focusRequest:s,formatAttachmentMeta:m=B=>he(B.size),heading:h,headingMeta:j,id:p,name:I,onAddAttachments:T,onChange:N,onPreview:E,onRemoveAttachment:x,onSignatureChange:S,onSubmit:M,placeholder:R,previewDisabled:w=!1,secondaryActions:C,signatureIndex:P,status:A,statusIsError:V=!1,submitCompactLabel:ee,submitDisabled:G=!1,submitIcon:O,submitLabel:z,uploadingAttachments:U=!1}){const[B,Q]=i.useState(!1),Y=p?`${p}-title`:`${I}-editor-title`,X=A===tr;return e.jsxs("section",{"aria-labelledby":Y,className:`reply-editor ${u}`.trim(),id:p,ref:o,children:[e.jsxs("header",{className:"reply-editor-heading",children:[e.jsx("h2",{id:Y,children:h}),e.jsx("p",{children:j})]}),l,e.jsx("div",{className:"reply-editor-core rich-text-editor-field",children:e.jsx(ft,{ariaLabel:r,focusRequest:s,onChange:N,placeholder:R,value:f})}),t,e.jsx("div",{"aria-label":"选择签名档",className:"reply-signature-options",role:"radiogroup",children:rr.map($=>e.jsxs("label",{children:[e.jsx("input",{checked:P===$.value,name:I,onChange:()=>S($.value),type:"radio",value:$.value}),$.label]},$.value))}),a.length>0&&e.jsx("ul",{className:"reply-attachments","aria-label":g,children:a.map($=>e.jsxs("li",{children:[e.jsx(ge,{size:13}),e.jsx("span",{children:$.name}),e.jsx("small",{children:m($)}),e.jsx("button",{"aria-label":`移除附件 ${$.name}`,onClick:()=>x($.id),type:"button",children:e.jsx(re,{size:13})})]},$.id))}),e.jsxs("footer",{className:"reply-editor-footer",children:[e.jsxs("button",{className:"reply-secondary-button",disabled:U,onClick:()=>Q(!0),type:"button",children:[e.jsx(ge,{size:15}),e.jsx("span",{className:"reply-action-label-full",children:"添加附件"}),e.jsx("span",{className:"reply-action-label-compact",children:"附件"}),a.length>0&&e.jsx("span",{className:"reply-attachment-count",children:a.length})]}),A&&e.jsxs("span",{className:`reply-editor-status ${V?"thread-edit-error":""} ${X?"reply-editor-status-auto-save":""}`.trim(),role:V?"alert":"status",children:[X&&e.jsx("span",{"aria-hidden":"true",className:"reply-editor-auto-save-dot",children:"·"}),A]}),e.jsxs("div",{className:"reply-editor-submit",children:[e.jsxs("button",{className:"reply-secondary-button",disabled:w,onClick:E,type:"button",children:[e.jsx(it,{size:15}),"预览"]}),C,e.jsxs("button",{className:"reply-publish-button",disabled:G,onClick:M,type:"button",children:[O,e.jsx("span",{className:"reply-action-label-full",children:z}),e.jsx("span",{className:"reply-action-label-compact",children:ee??z})]})]})]}),B&&e.jsx(ar,{attachments:a,description:n,formatAttachmentMeta:m,onAdd:T,onClose:()=>Q(!1),onRemove:x,uploading:U})]})}function jr({attachments:t,editorValue:r,formatAttachmentMeta:n=h=>he(h.size),label:g,onClose:a,previewAuthor:l,previewExtra:u,previewFloor:o,previewSignature:f,previewedAt:s,title:m}){const h=yt(),j=lt(),{theme:p}=ot(),I=j?pt(l.floorDecoration,p):"",T=e.jsx(Le,{bodyClassName:"thread-floor-body reply-preview-floor-body",bodyHtml:ht(r),floor:o,signatureHtml:f});return i.useEffect(()=>(document.body.classList.add("reply-preview-open"),()=>document.body.classList.remove("reply-preview-open")),[]),i.useEffect(()=>{function N(E){E.key==="Escape"&&a()}return document.addEventListener("keydown",N),()=>document.removeEventListener("keydown",N)},[a]),e.jsx("div",{className:"reply-preview-backdrop",onClick:a,role:"presentation",children:e.jsxs("section",{"aria-labelledby":"post-editor-preview-title","aria-modal":"true",className:`reply-preview-dialog${h?" reply-preview-dialog-author-profile":""}`,onClick:N=>N.stopPropagation(),role:"dialog",children:[e.jsxs("header",{children:[e.jsxs("div",{children:[e.jsx("span",{children:g}),e.jsx("h2",{id:"post-editor-preview-title",children:m})]}),e.jsx("button",{"aria-label":"关闭内容预览",onClick:a,type:"button",children:e.jsx(re,{size:18})})]}),e.jsxs("div",{className:"reply-preview-stage",children:[e.jsx(Me,{author:l,avatarRail:e.jsx("div",{className:"thread-avatar-rail reply-preview-avatar-rail",children:e.jsx("div",{className:"thread-avatar-button",children:e.jsx("img",{src:l.avatar,alt:""})})}),className:"reply-preview-floor",content:T,decorationImageSrc:I,floor:o,floorIndex:e.jsxs("span",{className:"thread-floor-index",children:["#",o]}),mainAfterContent:e.jsxs(e.Fragment,{children:[t.length>0&&e.jsx("ul",{className:"reply-preview-attachments","aria-label":"附件预览",children:t.map(N=>e.jsxs("li",{children:[e.jsx(ge,{size:13}),e.jsx("span",{children:N.name}),e.jsx("small",{children:n(N)})]},N.id))}),e.jsx(De,{canDelete:!0,canEdit:!0,canQuote:!0,canReply:!0,decorative:!0})]}),publishedAt:s,showAuthorProfile:h}),u]}),e.jsx("footer",{children:e.jsx("button",{className:"reply-secondary-button",onClick:a,type:"button",children:"返回编辑"})})]})})}function ar({attachments:t,description:r,formatAttachmentMeta:n,onAdd:g,onClose:a,onRemove:l,uploading:u}){const o=i.useRef(null);function f(s){g(Array.from(s.currentTarget.files??[])),s.currentTarget.value=""}return e.jsx("div",{className:"attachment-dialog-backdrop",onClick:a,role:"presentation",children:e.jsxs("section",{"aria-labelledby":"post-editor-attachment-dialog-title","aria-modal":"true",className:"attachment-dialog",onClick:s=>s.stopPropagation(),role:"dialog",children:[e.jsxs("header",{children:[e.jsx("span",{children:e.jsx(je,{size:17})}),e.jsx("h2",{id:"post-editor-attachment-dialog-title",children:"文件上传"}),e.jsx("button",{"aria-label":"关闭文件上传",onClick:a,type:"button",children:e.jsx(re,{size:18})})]}),e.jsxs("button",{className:"attachment-drop-button",disabled:u,onClick:()=>o.current?.click(),type:"button",children:[e.jsx(je,{size:22}),e.jsx("strong",{children:u?"正在上传附件…":"选择一个或多个文件"}),e.jsx("span",{children:r})]}),e.jsx("input",{className:"sr-only",disabled:u,multiple:!0,onChange:f,ref:o,type:"file"}),t.length>0&&e.jsx("ul",{children:t.map(s=>e.jsxs("li",{children:[e.jsxs("div",{children:[e.jsx("strong",{children:s.name}),e.jsx("span",{children:n(s)})]}),e.jsx("button",{"aria-label":`移除附件 ${s.name}`,onClick:()=>l(s.id),type:"button",children:e.jsx(oe,{size:15})})]},s.id))}),e.jsx("footer",{children:e.jsx("button",{className:"reply-publish-button",onClick:a,type:"button",children:"完成"})})]})})}function Ir(t){return t.mode!=="rich"?t.content.trim().length>0:gt(t.content)}function wr(t){const r=n=>String(n).padStart(2,"0");return`${t.getFullYear()}-${r(t.getMonth()+1)}-${r(t.getDate())} ${r(t.getHours())}:${r(t.getMinutes())}:${r(t.getSeconds())}`}function Er(t){return he(t)}function he(t){return t<=0?"大小未知":t>=1024*1024?`${(t/1024/1024).toFixed(2)} MB`:`${Math.max(1,Math.round(t/1024))} KB`}export{tr as A,vr as P,xr as T,br as a,jr as b,wr as c,Er as f,Ir as h,Ct as w};
