import{q as Ee,r as i,$ as Qe,j as t,a0 as Ze,X as ye,d as et,e as tt,ba as rt,bb as at,bc as nt,bd as ot,be as it,aM as lt,bf as st,aS as ct,aG as ut,bg as dt,bh as mt,bi as gt,bj as ft,bk as pt,a4 as ht,V as ne,z as bt,a6 as yt,b7 as xt,bl as vt}from"./index-DBxXOIX_.js";import{e as It,d as Ae,m as de,s as wt,f as At,r as kt,h as St,a as Te,P as Ne}from"./RichTextEditor.gallery-c-JAzXRy.js";import{P as Rt}from"./plus-bghR8x7p.js";import{R as jt}from"./rotate-ccw-DDDo2DXa.js";import{D as Le,T as me}from"./TagBadge-Bxae-wjU.js";import{T as xe}from"./trash-2-BKo-XMPR.js";import{P as ke}from"./pencil-CnBHa7Q_.js";import{E as Ct}from"./external-link-BynHHG2I.js";import{T as Et}from"./triangle-alert-B0RhkBin.js";const Tt=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],Nt=Ee("paperclip",Tt);const Lt=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],qt=Ee("reply",Lt);async function $t(e){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),!0}catch{}const r=document.createElement("textarea");r.value=e,r.setAttribute("readonly",""),r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select();try{return document.execCommand("copy")}finally{r.remove()}}const Mt={black:0,darkgray:169,darkgrey:169,dimgray:105,dimgrey:105,gainsboro:220,gray:128,grey:128,lightgray:211,lightgrey:211,silver:192,white:255,whitesmoke:245},ge="data-capubbs-original-grayscale-color-attr",fe="data-capubbs-original-grayscale-style-color";function Pt(e){const r=String(e??"").trim().toLowerCase().replace(/^['"]|['"]$/g,""),a=r.replace(/\s+/g,""),l=Mt[a];if(typeof l=="number")return{alpha:1,channel:l};const n=a.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);if(n){const o=n[1].length<=4?n[1].split("").map(k=>`${k}${k}`).join(""):n[1],f=Number.parseInt(o.slice(0,2),16),p=Number.parseInt(o.slice(2,4),16),w=Number.parseInt(o.slice(4,6),16),y=o.length===8?Number.parseInt(o.slice(6,8),16)/255:1;return f===p&&p===w?{alpha:y,channel:f}:null}const u=r.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*(?:,|\/)\s*([01](?:\.\d+)?|\.\d+|100%|\d{1,3}(?:\.\d+)?%))?\s*\)$/);if(!u)return null;const s=pe(u[1]),c=pe(u[2]),d=pe(u[3]),h=Ot(u[4]);return s===null||c===null||d===null||h===null?null:s===c&&c===d?{alpha:h,channel:s}:null}function qe(e,r=!0){const a=Pt(e);if(!a)return null;const l=255-a.channel;if(r&&a.alpha<1)return`rgba(${l}, ${l}, ${l}, ${Gt(a.alpha)})`;const n=l.toString(16).padStart(2,"0");return`#${n}${n}${n}`}function Ft(e,r){[...e.matches("[color], [style]")?[e]:[],...Array.from(e.querySelectorAll("[color], [style]"))].forEach(l=>{Dt(l,r),l instanceof HTMLElement&&zt(l,r)})}function Dt(e,r){const a=e.getAttribute(ge);if(r==="light"){if(a===null)return;e.setAttribute("color",a),e.removeAttribute(ge);return}const l=a??e.getAttribute("color"),n=qe(l,!1);!n||l===null||(a===null&&e.setAttribute(ge,l),e.getAttribute("color")!==n&&e.setAttribute("color",n))}function zt(e,r){const a=e.getAttribute(fe);if(r==="light"){if(a===null)return;e.style.setProperty("color",a,e.style.getPropertyPriority("color")),e.removeAttribute(fe);return}const l=a??e.style.getPropertyValue("color"),n=qe(l);!n||!l||(a===null&&e.setAttribute(fe,l),e.style.getPropertyValue("color")!==n&&e.style.setProperty("color",n,e.style.getPropertyPriority("color")))}function pe(e){const r=e.endsWith("%"),a=Number(r?e.slice(0,-1):e);return Number.isFinite(a)?r?a>=0&&a<=100?Math.round(a*2.55):null:a>=0&&a<=255?Math.round(a):null:null}function Ot(e){if(e===void 0)return 1;const r=e.endsWith("%"),a=Number(r?e.slice(0,-1):e);return Number.isFinite(a)?r?a>=0&&a<=100?a/100:null:a>=0&&a<=1?a:null:null}function Gt(e){return Number(e.toFixed(3))}function $e({className:e="",html:r,onImageOpen:a,variant:l}){const n=i.useRef(null),{theme:u}=Qe(),s=i.useMemo(()=>({__html:r}),[r]);if(i.useLayoutEffect(()=>{const o=n.current;o&&(It(o),Ft(o,u))},[r,u]),i.useEffect(()=>{const o=n.current;if(!o)return;const f=Array.from(o.querySelectorAll("img")),p=y=>{y.dataset.capubbsImageLoaded="true"},w=f.map(y=>{if(y.complete)return p(y),null;const k=()=>p(y);return y.addEventListener("load",k,{once:!0}),y.addEventListener("error",k,{once:!0}),{handleLoad:k,image:y}});return()=>{w.forEach(y=>{y&&(y.image.removeEventListener("load",y.handleLoad),y.image.removeEventListener("error",y.handleLoad))})}},[r]),!r)return null;function c(o,f){if(!a||!(o instanceof Element))return;const p=o.closest("img");if(!(p instanceof HTMLImageElement))return;const w=p.closest(".capubbs-gallery"),y=w?Array.from(w.querySelectorAll('[data-capubbs-gallery-slide="true"] img')):Array.from(f.querySelectorAll("img")).filter(v=>!v.closest(".capubbs-gallery")),k=y.indexOf(p);if(k<0)return;const q=y.map(v=>Ht(v,f)),M=y.map((v,j)=>{const $=q[j];return{alt:v.alt.trim(),element:v,src:v.currentSrc||v.src,...$?{galleryId:$.galleryId,galleryIndex:$.galleryIndex}:{}}});a(M,k,p,v=>{const j=q[v];j&&wt(j.gallery,j.galleryIndex)})}function d(o){const f=Ae(o.target);if(f&&o.target instanceof Element){o.preventDefault(),o.stopPropagation(),de(o.target,f);return}!a||!(o.target instanceof HTMLImageElement)||(o.preventDefault(),c(o.target,o.currentTarget))}function h(o){const f=Ae(o.target);if(f&&["Enter"," "].includes(o.key)&&o.target instanceof Element){o.preventDefault(),de(o.target,f);return}if(["ArrowLeft","ArrowRight"].includes(o.key)&&o.target instanceof Element&&o.target.closest(".capubbs-gallery")){o.preventDefault(),de(o.target,o.key==="ArrowLeft"?"prev":"next");return}!a||!(o.target instanceof HTMLImageElement)||!["Enter"," "].includes(o.key)||(o.preventDefault(),c(o.target,o.currentTarget))}return t.jsx("div",{ref:n,className:`forum-markup forum-markup-${l} ${e}`.trim(),"data-forum-markup":l,dangerouslySetInnerHTML:s,onClick:d,onKeyDown:h})}function Ht(e,r){const a=e.closest(".capubbs-gallery");if(!a||!r.contains(a))return null;const n=Array.from(r.querySelectorAll(".capubbs-gallery")).indexOf(a),s=Array.from(a.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(e);return n>=0&&s>=0?{gallery:a,galleryId:n,galleryIndex:s}:null}const O=1,Me=4,ie=.25;function Ut(e){return Math.min(Me,Math.max(O,e))}function he(e){const[r,a]=[...e.values()];return!r||!a?null:Math.hypot(a.x-r.x,a.y-r.y)}function _t({images:e,initialImageIndex:r,onImageChange:a,onClose:l}){const n=Math.min(Math.max(0,r),Math.max(0,e.length-1)),[u,s]=i.useState(n),[c,d]=i.useState(O),[h,o]=i.useState({x:0,y:0}),[f,p]=i.useState(!1),w=i.useRef(null),y=i.useRef(null),k=i.useRef(null),q=i.useRef(null),M=i.useRef(n),S=i.useRef(O),v=i.useRef({x:0,y:0}),j=i.useRef(null),$=i.useRef(!1),C=i.useRef(new Map),P=i.useRef(null),V=i.useRef(O),X=i.useRef(a),W=i.useRef(l);X.current=a,W.current=l;function R(g,x=S.current){const I=w.current,T=k.current;if(!I||!T||x<=O)return{x:0,y:0};const B=Math.max(0,(T.clientWidth*x-I.clientWidth)/2),N=Math.max(0,(T.clientHeight*x-I.clientHeight)/2);return{x:Math.min(B,Math.max(-B,g.x)),y:Math.min(N,Math.max(-N,g.y))}}function H(g,x=S.current){const I=R(g,x);v.current=I,o(I)}function A(g){const x=Math.round(Ut(g)*100)/100;S.current=x,d(x),H(v.current,x)}function F(){S.current=O,v.current={x:0,y:0},d(O),o({x:0,y:0})}function E(g){const x=Math.min(Math.max(0,g),e.length-1);x!==M.current&&(M.current=x,s(x),F(),X.current?.(x))}function U(){W.current(M.current)}i.useEffect(()=>{const g=document.body.style.overflow,x=document.activeElement,I=w.current;document.body.style.overflow="hidden",q.current?.focus();function T(b){if(b.key==="Escape"){b.preventDefault(),U();return}if(b.key==="ArrowLeft"){b.preventDefault(),b.stopPropagation(),E(M.current-1);return}if(b.key==="ArrowRight"){b.preventDefault(),b.stopPropagation(),E(M.current+1);return}if(b.key==="+"||b.key==="="){b.preventDefault(),b.stopPropagation(),A(S.current+ie);return}if(b.key==="-"){b.preventDefault(),b.stopPropagation(),A(S.current-ie);return}if(b.key==="0"){b.preventDefault(),b.stopPropagation(),F();return}if(b.key==="Tab"){const Y=y.current?.querySelectorAll("button:not(:disabled)");if(!Y?.length)return;const te=Y[0],ae=Y[Y.length-1],re=document.activeElement;if(b.shiftKey&&re===te){b.preventDefault(),ae.focus();return}if(!b.shiftKey&&re===ae){b.preventDefault(),te.focus();return}y.current?.contains(re)||(b.preventDefault(),te.focus())}}function B(b){if(b.preventDefault(),b.stopPropagation(),b.deltaY===0)return;const Y=b.ctrlKey?.01:.002;A(S.current*Math.exp(-b.deltaY*Y))}function N(b){b.preventDefault(),b.stopPropagation(),V.current=S.current}function z(b){if(b.preventDefault(),b.stopPropagation(),C.current.size>=2)return;const Y=b.scale;typeof Y=="number"&&A(V.current*Y)}function ee(){H(v.current,S.current)}return document.addEventListener("keydown",T,{capture:!0}),window.addEventListener("resize",ee),I?.addEventListener("wheel",B,{passive:!1}),I?.addEventListener("gesturestart",N,{passive:!1}),I?.addEventListener("gesturechange",z,{passive:!1}),I?.addEventListener("gestureend",z,{passive:!1}),()=>{document.removeEventListener("keydown",T,{capture:!0}),window.removeEventListener("resize",ee),I?.removeEventListener("wheel",B),I?.removeEventListener("gesturestart",N),I?.removeEventListener("gesturechange",z),I?.removeEventListener("gestureend",z),document.body.style.overflow=g,x instanceof HTMLElement&&x.focus()}},[]);function _(g,x,I){j.current={pointerId:g,startX:x,startY:I,originX:v.current.x,originY:v.current.y},p(!0)}function K(g){if(g.target instanceof Element&&g.target.closest("button, .thread-image-lightbox-controls"))return;const x=g.pointerType==="touch",I=g.pointerType==="mouse"&&g.button===0;if(!(!x&&!I)&&($.current=!1,!(!x&&S.current<=O))){if(g.preventDefault(),g.currentTarget.setPointerCapture(g.pointerId),x&&(C.current.set(g.pointerId,{x:g.clientX,y:g.clientY}),C.current.size===2)){P.current=he(C.current),j.current=null,p(!1);return}S.current>O&&_(g.pointerId,g.clientX,g.clientY)}}function Q(g){const x=C.current.has(g.pointerId),I=j.current;if(!x&&I?.pointerId!==g.pointerId)return;if(g.preventDefault(),g.stopPropagation(),x&&C.current.set(g.pointerId,{x:g.clientX,y:g.clientY}),C.current.size===2){const N=he(C.current),z=P.current;if(!N||!z){P.current=N;return}Math.abs(N-z)>1&&($.current=!0),A(S.current*(N/z)),P.current=N;return}if(!I||S.current<=O)return;const T=g.clientX-I.startX,B=g.clientY-I.startY;Math.hypot(T,B)>3&&($.current=!0),H({x:I.originX+T,y:I.originY+B})}function Z(g){const x=C.current.delete(g.pointerId),I=j.current?.pointerId===g.pointerId;if(!(!x&&!I)){if(P.current=C.current.size===2?he(C.current):null,C.current.size===1&&S.current>O){const[T]=C.current.entries();if(T){const[B,N]=T;_(B,N.x,N.y)}}else j.current=null,p(!1);g.currentTarget.hasPointerCapture(g.pointerId)&&g.currentTarget.releasePointerCapture(g.pointerId)}}const oe=Math.round(c*100),D=e[u]??e[0];return D?Ze.createPortal(t.jsx("div",{className:"thread-image-lightbox-backdrop","data-can-pan":c>O,"data-dragging":f,onClick:g=>{if($.current)return;const x=g.target;x instanceof Element&&x.closest("img, button, .thread-image-lightbox-controls")||U()},onPointerCancel:Z,onPointerDown:K,onPointerMove:Q,onPointerUp:Z,ref:w,role:"presentation",children:t.jsxs("figure",{"aria-label":D.alt?`图片预览：${D.alt}（${u+1}/${e.length}）`:`图片预览（${u+1}/${e.length}）`,"aria-modal":"true",className:"thread-image-lightbox",ref:y,role:"dialog",children:[t.jsx("button",{"aria-label":"关闭图片预览",className:"thread-image-lightbox-close",onClick:U,ref:q,type:"button",children:t.jsx(ye,{size:20})}),e.length>1&&t.jsxs(t.Fragment,{children:[t.jsx("button",{"aria-label":"上一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-prev",disabled:u===0,onClick:()=>E(u-1),title:"上一张（←）",type:"button",children:t.jsx(et,{size:28})}),t.jsx("button",{"aria-label":"下一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-next",disabled:u===e.length-1,onClick:()=>E(u+1),title:"下一张（→）",type:"button",children:t.jsx(tt,{size:28})})]}),t.jsx(Bt,{image:D,imageRef:k,onReady:()=>H(v.current,S.current),transform:`translate3d(${h.x}px, ${h.y}px, 0) scale(${c})`}),D.alt&&t.jsx("figcaption",{children:D.alt}),t.jsxs("div",{"aria-label":"图片缩放",className:"thread-image-lightbox-controls",role:"toolbar",children:[t.jsx("button",{"aria-label":"缩小图片",disabled:c<=O,onClick:()=>A(c-ie),title:"缩小（-）",type:"button",children:t.jsx(At,{size:18})}),t.jsxs("output",{"aria-label":"当前缩放比例","aria-live":"polite",children:[oe,"%"]}),t.jsx("button",{"aria-label":"放大图片",disabled:c>=Me,onClick:()=>A(c+ie),title:"放大（+）",type:"button",children:t.jsx(Rt,{size:18})}),t.jsx("button",{"aria-label":"恢复原始大小",disabled:c===O,onClick:F,title:"恢复原始大小（0）",type:"button",children:t.jsx(jt,{size:17})})]})]})}),document.body):null}function Bt({image:e,imageRef:r,onReady:a,transform:l}){const n=i.useRef(null),u=i.useRef(a);return u.current=a,i.useLayoutEffect(()=>{const s=e.element,c=n.current,d=s?.parentNode;if(!s||!c?.parentNode||!d)return;const h=s.ownerDocument.createComment("capubbs-lightbox-image"),o=s.getAttribute("style"),f=s.getAttribute("draggable");d.insertBefore(h,s),c.parentNode.insertBefore(s,c),s.draggable=!1,r.current=s;const p=()=>u.current();return s.addEventListener("load",p),s.complete&&p(),()=>{s.removeEventListener("load",p),o===null?s.removeAttribute("style"):s.setAttribute("style",o),f===null?s.removeAttribute("draggable"):s.setAttribute("draggable",f),h.parentNode?.insertBefore(s,h),h.remove(),r.current===s&&(r.current=null)}},[e,r]),i.useLayoutEffect(()=>{e.element&&(e.element.style.transform=l)},[e,l]),e.element?t.jsx("span",{hidden:!0,ref:n}):t.jsx("img",{alt:e.alt,draggable:"false",onLoad:a,ref:r,src:e.src,style:{transform:l}})}const Wt=':root{--surface: #fffefa;--surface-raised: #ffffff;--surface-soft: #f6f8f4;--text: #20231f;--text-strong: #111411;--text-muted: #687068;--text-faint: #919991;--line: #e1e6df;--line-strong: #cdd5cc;--brand: #236b4c;--brand-strong: #174f38;--danger: #b8473f}:root.dark{--surface: #171d19;--surface-raised: #1c241f;--surface-soft: #1f2822;--text: #dde5de;--text-strong: #f6faf6;--text-muted: #a0aca2;--text-faint: #748078;--line: #2c362f;--line-strong: #3c493f;--brand: #69b98d;--brand-strong: #8bcca6;--danger: #ef8178}::-moz-selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}::selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentcolor}blockquote,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}a{color:inherit;text-decoration:inherit}button{margin:0;padding:0;background-color:transparent;color:inherit;font:inherit;letter-spacing:inherit;text-transform:none}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}.capubbs-html-frame-root iframe{background-color:transparent!important}img,video{max-width:100%;height:auto}table{border-color:inherit;border-collapse:collapse;text-indent:0}.capubbs-activity-signup-canceled,.capubbs-activity-signup-canceled *{color:var(--danger)!important;text-decoration-color:var(--danger)!important;text-decoration-line:line-through!important;text-decoration-thickness:2px!important}.forum-markup>:first-child{margin-top:0}.forum-markup>:last-child{margin-bottom:0}.forum-markup p,.forum-markup div{margin:0}.forum-markup-floor p{margin:0 0 .75em}.forum-markup-floor>div+div{margin-top:.55em}.forum-markup a{color:var(--brand-strong);font-weight:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.16em}.forum-markup .forum-mention{text-decoration:none}.forum-markup blockquote{margin:0 0 0 2em;border:0;padding:0;background:transparent;color:inherit}.forum-markup blockquote.forum-quote,.forum-markup .forum-legacy-quote,.forum-markup blockquote.capubbs-floor-quote{margin:.8em 0;border-left:3px solid color-mix(in srgb,var(--brand) 38%,var(--line));padding:.55em .75em;background:var(--surface-soft);color:var(--text-muted)}.forum-markup .capubbs-floor-quote-jump{margin-left:.75em}.forum-markup .forum-legacy-quote-content{margin:0}.forum-markup h1,.forum-markup h2,.forum-markup h3,.forum-markup h4,.forum-markup h5,.forum-markup h6{margin:.9rem 0 .45rem;color:var(--brand-strong);font-weight:800;line-height:1.35}.forum-markup h1{font-size:1.45rem}.forum-markup h2{font-size:1.25rem}.forum-markup h3{font-size:1.1rem}.forum-markup h4,.forum-markup h5,.forum-markup h6{font-size:1em}.forum-markup ul,.forum-markup ol{margin:.65em 0;padding-left:1.45em}.forum-markup ul{list-style:disc}.forum-markup ol{list-style:decimal}.forum-markup ol.capubbs-ordered-list-alpha{list-style-type:lower-alpha}.forum-markup ol.capubbs-ordered-list-roman{list-style-type:lower-roman}.forum-markup pre{max-width:100%;overflow-x:auto;margin:.75em 0;border-radius:2px;padding:.75em;background:#182531;color:#f8fafc;white-space:pre-wrap}.forum-markup code,.forum-markup kbd{border-radius:2px;padding:.08em .25em;background:color-mix(in srgb,var(--surface-soft) 75%,var(--line));font-family:SFMono-Regular,Cascadia Code,Consolas,monospace;font-size:.9em}.forum-markup pre code{padding:0;background:transparent;color:inherit}.forum-markup font[size="1"]{font-size:11px}.forum-markup font[size="2"]{font-size:13px}.forum-markup font[size="3"]{font-size:15px}.forum-markup font[size="4"]{font-size:17px}.forum-markup font[size="5"]{font-size:19px}.forum-markup font[size="6"]{font-size:21px}.forum-markup font[size="7"]{font-size:23px}.forum-markup hr{margin:.9em 0;border:0;border-top:1px solid var(--line-strong)}.forum-markup img{display:inline-block;height:auto;max-width:100%;vertical-align:middle}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){background-color:color-mix(in srgb,var(--surface-soft) 82%,var(--line));background-image:linear-gradient(105deg,transparent 20%,color-mix(in srgb,var(--surface-raised) 70%,transparent) 45%,transparent 70%);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}.forum-markup img[role=button]{cursor:zoom-in}.forum-markup img[role=button]:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse}.forum-markup td,.forum-markup th{border:1px solid var(--line);padding:.35em .5em}.forum-markup-signature{color:#999;font-family:monospace;font-size:14px;line-height:1.6;overflow-wrap:anywhere}:root.dark .forum-markup-signature{color:#666}.forum-markup .capubbs-gallery{position:relative;display:block;width:100%;margin:.9rem 0;overflow:hidden;border:1px solid var(--line);border-radius:2px;background:transparent;color:var(--text)}.forum-markup .capubbs-gallery:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup .capubbs-gallery-header{position:relative;display:flex;min-height:44px;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:9px 12px;border-bottom:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-title{width:100%;min-width:0;margin:0;color:var(--text-strong);font-size:.82rem;font-weight:760;line-height:1.4;text-align:center}.forum-markup .capubbs-gallery-stage{position:relative;display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide{display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-slide>img{display:block;width:100%;height:var(--capubbs-gallery-image-height, clamp(280px, 52vw, 560px));max-width:none;margin:0 auto;border-radius:0;-o-object-fit:contain;object-fit:contain}.forum-markup .capubbs-gallery-caption{display:block;margin:0;color:var(--text-muted);font-size:.78rem;line-height:1.55;text-align:center}.forum-markup .capubbs-gallery-caption[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-footer{position:relative;display:flex;min-height:44px;align-items:center;justify-content:center;margin:0;padding:9px 12px;border-top:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-captions{width:100%;min-width:0;margin:0;padding-inline:48px;text-align:center}.forum-markup .capubbs-gallery-count{position:absolute;top:50%;right:12px;color:var(--text-faint);font-size:.72rem;font-variant-numeric:tabular-nums;font-weight:760;line-height:1.25;transform:translateY(-50%)}.forum-markup .capubbs-gallery-count[data-capubbs-gallery-current]:before{content:attr(data-capubbs-gallery-current) "/" attr(data-capubbs-gallery-total)}.forum-markup .capubbs-gallery-nav{position:absolute;z-index:4;top:50%;display:grid;width:36px;height:48px;place-items:center;padding:0;transform:translateY(-50%);border:1px solid rgb(255 255 255 / .25);border-radius:2px;background:#00000080;color:#fff;cursor:pointer;transition:.15s ease}.forum-markup .capubbs-gallery-nav:hover{background:#000000b8}.forum-markup .capubbs-gallery-nav:focus-visible{outline:2px solid #fff;outline-offset:2px}.forum-markup .capubbs-gallery-nav:before{font-family:Arial,sans-serif;font-size:2rem;font-weight:300;line-height:1}.forum-markup .capubbs-gallery-nav-prev:before{content:"‹"}.forum-markup .capubbs-gallery-nav-next:before{content:"›"}.forum-markup .capubbs-gallery-nav-prev{left:10px}.forum-markup .capubbs-gallery-nav-next{right:10px}@keyframes capubbs-image-loading{0%{background-position:120% 0}to{background-position:-80% 0}}@media(max-width:640px){.forum-markup .capubbs-gallery-slide>img{height:var(--capubbs-gallery-image-height, min(72vw, 420px))}.forum-markup .capubbs-gallery-nav{width:32px;height:42px}.forum-markup .capubbs-gallery-nav-prev{left:7px}.forum-markup .capubbs-gallery-nav-next{right:7px}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){animation:none}}',Se=64*1024*1024,se=new Map,ce=new Map;function Pe(e){return new URL(e,new URL("/bbs/content/",window.location.origin)).href}function Yt(e){const r=Pe(e),a=new URL(r);if(a.origin!==window.location.origin||!a.pathname.startsWith("/bbs/images/")&&!a.pathname.startsWith("/bbsimg/"))return Promise.reject(new Error("仅代理论坛图片目录"));const l=se.get(r);if(l)return l;const n=fetch(r,{credentials:"same-origin",referrerPolicy:"no-referrer"}).then(async u=>{if(!u.ok)throw new Error(`图片加载失败：${u.status}`);if(!(u.headers.get("content-type")?.toLowerCase()??"").startsWith("image/"))throw new Error("图片响应类型无效");const c=Number.parseInt(u.headers.get("content-length")??"",10);if(Number.isFinite(c)&&c>Se)throw new Error("图片大小超出限制");const d=await u.blob();if(d.size>Se)throw new Error("图片大小超出限制");const h={blob:d,objectUrl:URL.createObjectURL(d),sourceUrl:r};return ce.set(r,h),h}).catch(u=>{throw se.delete(r),u});return se.set(r,n),n}function Vt(e){try{return ce.get(Pe(e))?.objectUrl}catch{return}}typeof window<"u"&&window.addEventListener("pagehide",e=>{e.persisted||(ce.forEach(r=>URL.revokeObjectURL(r.objectUrl)),ce.clear(),se.clear())});const Kt=28,Jt=64,Xt=5e4,Qt=30,Fe=30,G="capubbs-thread-html-frame",De=new URL("/bbs/lib/jquery.min.js",window.location.origin).href,Zt=cr(Wt),er=/\son[a-z][\w:-]*\s*=/i;let le=null;function Re({className:e="",floor:r,html:a,isActivitySignupCanceled:l=!1,onImageOpen:n,onIsolatedTextSelection:u,variant:s}){const c=i.useMemo(()=>s==="signature"?kt(a):a,[a,s]),d=rr(c,s==="signature"),h=rt(d),o=i.useMemo(()=>h?null:at(d,{normalizeLegacyLineBreaks:s==="signature"}),[d,h,s]),f=i.useMemo(()=>nt(d),[d]);return!h&&o!==null?t.jsx($e,{className:e,html:o,onImageOpen:n,variant:s}):t.jsx(tr,{className:e,floor:r,html:f,isActivitySignupCanceled:l,onImageOpen:n,onTextSelection:u,variant:s})}function tr({className:e,floor:r,html:a,isActivitySignupCanceled:l,onImageOpen:n,onTextSelection:u,variant:s}){const c=i.useRef(null),d=i.useRef(`${s}-${r}-${Math.random().toString(36).slice(2)}`),h=i.useRef(n);h.current=n;const o=i.useRef(u);o.current=u;const f=s==="signature"?Kt:Jt,p=!!n,[w,y]=i.useState(null),k=dr(),q=i.useRef(k),M=it(),S=s==="signature"?14:M,v=i.useMemo(()=>ir(or(a)),[a]),j=v.includes('type="text/capubbs-user-script"')||er.test(v),$=i.useMemo(()=>ar({canOpenImages:p,frameId:d.current,needsJquery:j,html:v,isActivitySignupCanceled:l,isDarkTheme:q.current,fontSize:S,variant:s}),[p,v,S,l,j,s]),C=i.useMemo(()=>`data:text/html;charset=utf-8,${encodeURIComponent($)}`,[$]),P=i.useCallback(()=>{c.current?.contentWindow?.postMessage({frameId:d.current,source:G,theme:k?"dark":"light",type:"theme"},"*")},[k]),V=i.useCallback((W=c.current?.contentWindow)=>{!j||!W||je().then(R=>{c.current?.contentWindow===W&&W.postMessage({frameId:d.current,jquerySource:R,source:G,type:"jquery-response"},"*")})},[j]),X=i.useCallback(()=>{P(),V()},[V,P]);return i.useEffect(()=>{y(null)},[C]),i.useEffect(()=>{P()},[P]),i.useEffect(()=>{j&&je()},[j]),i.useLayoutEffect(()=>{function W(R){const H=c.current?.contentWindow;if(!(!H||R.source!==H||!ur(R.data))&&R.data.frameId===d.current){if(R.data.type==="jquery-request"){V(H);return}if(R.data.type==="image-resource-request"){const A=H;Yt(R.data.url).then(F=>{c.current?.contentWindow===A&&A.postMessage({blob:F.blob,frameId:d.current,requestId:R.data.requestId,source:G,type:"image-resource-response"},"*")}).catch(()=>{c.current?.contentWindow===A&&A.postMessage({frameId:d.current,requestId:R.data.requestId,source:G,type:"image-resource-error"},"*")});return}if(R.data.type==="anchor"){const A=c.current;if(!A)return;const F=window.getComputedStyle(document.documentElement),E=Number.parseFloat(F.getPropertyValue("--topbar-height"))||0,U=window.scrollY+A.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,U+R.data.offsetTop-E-16)});return}if(R.data.type==="navigate"){const A=lt(R.data.url,ze());if(!A)return;window.history.pushState(null,"",A),window.dispatchEvent(new Event(st));const F=new URL(A,window.location.origin);F.hash?window.requestAnimationFrame(()=>{const E=decodeURIComponent(F.hash.slice(1)),U=ct(`#${E}`);(U?ut(U):document.getElementById(E))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(R.data.type==="image-open"){const A=c.current;if(!A)return;const F=Array.from(A.contentDocument?.querySelectorAll("img")??[]),E=R.data.images.map(_=>({..._,element:typeof _.elementIndex=="number"?F[_.elementIndex]:void 0,src:Vt(_.src)??_.src})),U=_=>{const K=E[_];!K||typeof K.galleryId!="number"||!Number.isSafeInteger(K.galleryIndex)||A.contentWindow?.postMessage({frameId:d.current,galleryId:K.galleryId,galleryIndex:K.galleryIndex,source:G,type:"gallery-select"},"*")};h.current?.(E,R.data.imageIndex,A,U);return}if(R.data.type==="selection"){R.data.text&&window.getSelection()?.removeAllRanges(),o.current?.(R.data.text);return}y(Math.min(Xt,Math.max(f,Math.ceil(R.data.height))))}}return window.addEventListener("message",W),()=>window.removeEventListener("message",W)},[f,V]),t.jsx("iframe",{ref:c,className:`thread-html-frame thread-html-frame-${s} ${e}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-same-origin allow-downloads",scrolling:"no",src:C,onLoad:X,style:{"--thread-html-frame-width-allowance":`${Fe}px`,...w===null?{}:{"--thread-html-frame-height":`${w}px`}},title:s==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`})}function rr(e,r){const[a,l]=i.useState(e);return i.useEffect(()=>{const n=new AbortController,u=r?St(e):[];if(l(e),u.length===0)return()=>n.abort();const s=Array.from(new Map(u.map(c=>[`${c.bid}:${c.tid}:${c.pid}`,c])).values());return Promise.all(s.map(async c=>{try{const d=await ot(c,n.signal);return[`${c.bid}:${c.tid}:${c.pid}`,d]}catch(d){if(d instanceof DOMException&&d.name==="AbortError")throw d;return[`${c.bid}:${c.tid}:${c.pid}`,""]}})).then(c=>{if(n.signal.aborted)return;const d=new Map(c);let h=e;u.forEach(o=>{const f=d.get(`${o.bid}:${o.tid}:${o.pid}`);f&&(h=h.replace(o.marker,f))}),l(h)}).catch(()=>{}),()=>n.abort()},[r,e]),a}function ar({canOpenImages:e,frameId:r,fontSize:a,needsJquery:l,html:n,isActivitySignupCanceled:u,isDarkTheme:s,variant:c}){const d=c==="signature",h=d?"#999999":"rgb(63 63 70)",o=d?"#666666":"rgb(228 228 231)",f=d?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",p=d?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",w=u?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${s?"dark":"light"}" style="background:transparent;color-scheme:${s?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${sr(ze())}">
  <meta http-equiv="Content-Security-Policy" content="${lr()}">
  <style>${Zt}</style>
  <style>
    html{--capubbs-frame-text-color:${h}}html.dark{--capubbs-frame-text-color:${o}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${f};font-size:${a}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${Fe}px);${p}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${nr(r,e,l)}<\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${c}${w}">${n}</main></body>
</html>`}function nr(e,r,a){return`(function(){
    var frameId=${JSON.stringify(e)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(dt)};
    var canOpenImages=${JSON.stringify(r)};
    var needsJquery=${JSON.stringify(a)};
    var jquerySourceUrl=${JSON.stringify(De)};
    var forumAppExactPaths=${JSON.stringify(mt)};
    var forumAppPathPrefixes=${JSON.stringify(gt)};
    var legacyForumExactPaths=${JSON.stringify(ft)};
    var legacyForumPathPatterns=${JSON.stringify(pt)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${Qt};
    var queued=false;
    var selectionQueued=false;
    var lastSelectionText='';
    var userScriptsExecuted=false;
    var imageResourceRequestIndex=0;
    var imageResourceRequests={};
    var imageResourceRequestIdsBySource={};
    var imageResourceObjectUrls=[];
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
      window.parent.postMessage({source:'${G}',type:'resize',frameId:frameId,height:height},'*');
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
      window.parent.postMessage({source:'${G}',type:'selection',frameId:frameId,text:text},'*');
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
        window.parent.postMessage({source:'${G}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${G}',type:'navigate',frameId:frameId,url:url},'*');
    }
    function getTargetImage(target){
      var image=target&&target.closest?target.closest('img'):null;
      return image&&image.tagName==='IMG'?image:null;
    }
    function openImage(image){
      if(!canOpenImages||!image)return;
      var gallery=image.closest?image.closest('.capubbs-gallery'):null;
      var imageElements=gallery
        ?Array.prototype.slice.call(gallery.querySelectorAll('[data-capubbs-gallery-slide="true"] img'))
        :Array.prototype.slice.call(document.querySelectorAll('.capubbs-html-frame-root img')).filter(function(candidate){
          return !candidate.closest||!candidate.closest('.capubbs-gallery');
        });
      var imageIndex=imageElements.indexOf(image);
      if(imageIndex<0)return;
      var allImages=Array.prototype.slice.call(document.querySelectorAll('.capubbs-html-frame-root img'));
      var images=imageElements.map(function(candidate){
        var resourceSource=candidate.getAttribute('data-capubbs-image-resource-src');
        var item={alt:(candidate.alt||'').trim(),elementIndex:allImages.indexOf(candidate),src:resourceSource?new URL(resourceSource,document.baseURI).href:(candidate.currentSrc||candidate.src||'')};
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
      window.parent.postMessage({source:'${G}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
      if(image.getAttribute('data-capubbs-image-resource-src')&&!image.getAttribute('src'))return;
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
          if(!image.style.width)image.style.width=boundedWidth;
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
    function requestImageResources(){
      Array.prototype.forEach.call(document.querySelectorAll('img[data-capubbs-image-resource-src]'),function(image){
        if(image.getAttribute('src')||image.getAttribute('data-capubbs-image-resource-requested')==='true')return;
        var source=image.getAttribute('data-capubbs-image-resource-src')||'';
        var normalizedSource=new URL(source,document.baseURI).href;
        var existingRequestId=imageResourceRequestIdsBySource[normalizedSource];
        image.setAttribute('data-capubbs-image-resource-requested','true');
        if(existingRequestId&&imageResourceRequests[existingRequestId]){
          imageResourceRequests[existingRequestId].images.push(image);
          return;
        }
        var requestId=frameId+'-image-'+(++imageResourceRequestIndex);
        imageResourceRequests[requestId]={images:[image],source:normalizedSource};
        imageResourceRequestIdsBySource[normalizedSource]=requestId;
        window.parent.postMessage({
          source:'${G}',
          type:'image-resource-request',
          frameId:frameId,
          requestId:requestId,
          url:normalizedSource
        },'*');
      });
    }
    function applyImageResourceResponse(data){
      var request=imageResourceRequests[data.requestId];
      if(!request)return;
      delete imageResourceRequests[data.requestId];
      delete imageResourceRequestIdsBySource[request.source];
      if(data.type==='image-resource-response'&&data.blob instanceof Blob){
        var objectUrl=URL.createObjectURL(data.blob);
        imageResourceObjectUrls.push(objectUrl);
        request.images.forEach(function(image){image.src=objectUrl;observeImageLoad(image);});
        return;
      }
      request.images.forEach(function(image){image.src=request.source;observeImageLoad(image);});
    }
    function revokeImageResourceObjectUrls(){
      imageResourceObjectUrls.forEach(function(objectUrl){URL.revokeObjectURL(objectUrl);});
      imageResourceObjectUrls=[];
    }
    function createGalleryNavigationControl(direction,label){
      var control=document.createElement('span');
      control.className='capubbs-gallery-nav capubbs-gallery-nav-'+direction;
      control.setAttribute('data-capubbs-gallery-action',direction);
      control.setAttribute('aria-label',label);
      control.setAttribute('role','button');
      control.setAttribute('tabindex','0');
      return control;
    }
    function setGalleryAttribute(element,name,value){
      if(element.getAttribute(name)!==value)element.setAttribute(name,value);
    }
    function setGalleryItemActive(item,active){
      setGalleryAttribute(item,'data-capubbs-gallery-active',active?'true':'false');
      setGalleryAttribute(item,'aria-hidden',active?'false':'true');
    }
    function prepareGalleries(){
      Array.prototype.forEach.call(document.querySelectorAll('.capubbs-html-frame-root .capubbs-gallery'),function(gallery){
        var stage=gallery.querySelector('.capubbs-gallery-stage');
        var slides=Array.prototype.slice.call(gallery.querySelectorAll('[data-capubbs-gallery-slide="true"]'));
        if(!stage||slides.length===0)return;
        var header=gallery.querySelector('.capubbs-gallery-header');
        if(!header){header=document.createElement('header');header.className='capubbs-gallery-header';gallery.insertBefore(header,stage);}
        if(!header.querySelector('.capubbs-gallery-title')){
          var title=document.createElement('figcaption');title.className='capubbs-gallery-title';header.appendChild(title);
        }
        if(slides.length>1&&!stage.querySelector('[data-capubbs-gallery-action="prev"]'))stage.appendChild(createGalleryNavigationControl('prev','上一张图片'));
        if(slides.length>1&&!stage.querySelector('[data-capubbs-gallery-action="next"]'))stage.appendChild(createGalleryNavigationControl('next','下一张图片'));
        var footer=gallery.querySelector('.capubbs-gallery-footer');
        if(!footer){footer=document.createElement('footer');footer.className='capubbs-gallery-footer';gallery.appendChild(footer);}
        var captionsContainer=footer.querySelector('.capubbs-gallery-captions');
        if(!captionsContainer){captionsContainer=document.createElement('div');captionsContainer.className='capubbs-gallery-captions';footer.insertBefore(captionsContainer,footer.firstChild);}
        var captions=Array.prototype.slice.call(captionsContainer.querySelectorAll('[data-capubbs-gallery-caption="true"]'));
        while(captions.length<slides.length){
          var caption=document.createElement('span');caption.className='capubbs-gallery-caption';caption.setAttribute('data-capubbs-gallery-caption','true');captionsContainer.appendChild(caption);captions.push(caption);
        }
        var count=footer.querySelector('.capubbs-gallery-count');
        if(!count){count=document.createElement('span');count.className='capubbs-gallery-count';footer.appendChild(count);}
        var storedIndex=parseInt(gallery.getAttribute('data-capubbs-gallery-index')||'',10);
        var activeIndex=slides.findIndex(function(slide){return slide.getAttribute('data-capubbs-gallery-active')==='true';});
        var normalizedIndex=activeIndex>=0?activeIndex:(Number.isFinite(storedIndex)&&storedIndex>=0&&storedIndex<slides.length?storedIndex:0);
        setGalleryAttribute(gallery,'data-capubbs-gallery-index',String(normalizedIndex));
        setGalleryAttribute(gallery,'role','region');
        setGalleryAttribute(gallery,'tabindex','0');
        if(!gallery.getAttribute('aria-label'))setGalleryAttribute(gallery,'aria-label','图廊');
        slides.forEach(function(slide,index){setGalleryItemActive(slide,index===normalizedIndex);});
        captions.forEach(function(caption,index){setGalleryItemActive(caption,index===normalizedIndex);});
        setGalleryAttribute(count,'data-capubbs-gallery-current',String(normalizedIndex+1));
        setGalleryAttribute(count,'data-capubbs-gallery-total',String(slides.length));
        setGalleryAttribute(count,'aria-label','第 '+(normalizedIndex+1)+' 张，共 '+slides.length+' 张图片');
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
      if(event.source!==window.parent||!data||data.source!=='${G}'||data.frameId!==frameId)return;
      if(data.type==='jquery-response'){
        loadJqueryAndExecuteUserScripts(data.jquerySource);
        return;
      }
      if(data.type==='image-resource-response'||data.type==='image-resource-error'){
        applyImageResourceResponse(data);
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
      if(window.MutationObserver&&contentRoot)new MutationObserver(function(){queueHeight();requestImageResources();prepareImages();prepareGalleries();syncGrayscaleTextColors(contentRoot);}).observe(contentRoot,{attributes:true,characterData:true,childList:true,subtree:true});
      window.addEventListener('load',queueHeight);
      window.addEventListener('unload',revokeImageResourceObjectUrls);
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
      if(needsJquery)window.parent.postMessage({source:'${G}',type:'jquery-request',frameId:frameId},'*');
      else executeUserScripts();
      requestImageResources();
      prepareImages();
      prepareGalleries();
      syncGrayscaleTextColors(contentRoot);
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`}function or(e){return e.replace(/<script\b([^>]*)>/gi,(r,a)=>`<script${a.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function ir(e){if(!/<img\b/i.test(e))return e;const r=document.createElement("template");return r.innerHTML=e,r.content.querySelectorAll("img[src]").forEach(a=>{const l=a.getAttribute("src")?.trim()??"";!l||/^(?:blob:|data:)/i.test(l)||(a.dataset.capubbsImageResourceSrc=l,a.removeAttribute("src"),a.removeAttribute("srcset"),a.closest("picture")?.querySelectorAll("source[srcset]").forEach(n=>{n.removeAttribute("srcset")}))}),r.innerHTML}function je(){return le||(le=fetch(De,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw new Error(`Failed to load jQuery: ${e.status}`);return e.text()}).catch(()=>null),le)}function lr(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'","upgrade-insecure-requests"].join("; ")}function ze(){return new URL("/bbs/content/",window.location.origin).href}function sr(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function cr(e){return e.replace(/<\/style/gi,"<\\/style")}function ur(e){if(!e||typeof e!="object")return!1;const r=e;return r.source!==G||typeof r.frameId!="string"?!1:r.type==="anchor"?typeof r.offsetTop=="number"&&Number.isFinite(r.offsetTop)&&r.offsetTop>=0:r.type==="navigate"?typeof r.url=="string":r.type==="jquery-request"?!0:r.type==="image-resource-request"?typeof r.requestId=="string"&&r.requestId.length>0&&typeof r.url=="string"&&r.url.length>0:r.type==="selection"?typeof r.text=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(a=>!!a&&typeof a=="object"&&typeof a.alt=="string"&&typeof a.elementIndex=="number"&&Number.isSafeInteger(a.elementIndex)&&a.elementIndex>=0&&typeof a.src=="string"&&a.src.length>0&&(a.galleryId===void 0&&a.galleryIndex===void 0||typeof a.galleryId=="number"&&Number.isSafeInteger(a.galleryId)&&a.galleryId>=0&&typeof a.galleryIndex=="number"&&Number.isSafeInteger(a.galleryIndex)&&a.galleryIndex>=0)):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function dr(){const[e,r]=i.useState(()=>document.documentElement.classList.contains("dark"));return i.useEffect(()=>{const a=document.documentElement,l=()=>r(a.classList.contains("dark")),n=new MutationObserver(l);return n.observe(a,{attributeFilter:["class"],attributes:!0}),()=>n.disconnect()},[]),e}function mr({attachments:e=[],bodyClassName:r="thread-floor-body",bodyFallback:a=null,bodyHtml:l,floor:n,isActivitySignupCanceled:u=!1,onImageOpen:s,onIsolatedTextSelection:c,signatureClassName:d="thread-signature",signatureHtml:h,signatureText:o}){const f=s?(p,w,y,k)=>{const q=p[w];q&&s([q],0,y,k?()=>k(w):void 0)}:void 0;return t.jsxs(t.Fragment,{children:[l?t.jsx(Re,{className:r,floor:n,html:l,isActivitySignupCanceled:u,onImageOpen:s,onIsolatedTextSelection:c,variant:"floor"}):a,t.jsx(gr,{attachments:e}),h?t.jsx(Re,{className:d,floor:n,html:h,onImageOpen:f,variant:"signature"}):o?t.jsx("footer",{className:d,children:t.jsx("p",{children:o})}):null]})}function gr({attachments:e}){return e.length===0?null:t.jsxs("section",{"aria-label":"附件",className:"thread-attachments",children:[t.jsxs("header",{className:"thread-attachments-heading",children:[t.jsx(Nt,{"aria-hidden":"true",size:14}),t.jsx("span",{children:"附件"}),t.jsx("small",{children:e.length})]}),t.jsx("ul",{children:e.map(r=>{const a=t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"thread-attachment-name",children:r.name}),t.jsx("small",{children:fr(r)}),r.exists!==!1&&t.jsx(ht,{"aria-hidden":"true",size:15})]});return t.jsx("li",{children:r.exists===!1?t.jsx("div",{"aria-disabled":"true",className:"thread-attachment-link is-unavailable",children:a}):t.jsx("a",{className:"thread-attachment-link",download:r.name,href:r.downloadHref||`/bbs/download/?id=${encodeURIComponent(r.id)}`,children:a})},r.id)})})]})}function fr(e){if(e.exists===!1)return"文件不可用";const r=[pr(e.size),(e.price??0)>0?"付费附件":"免费"];return e.downloadCount!==void 0&&r.push(`下载 ${e.downloadCount} 次`),r.join(" · ")}function pr(e){if(e<=0)return"大小未知";if(e<1024)return`${e} B`;const r=["KB","MB","GB","TB"];let a=e,l=-1;do a/=1024,l+=1;while(a>=1024&&l<r.length-1);return`${a.toFixed(a>=10?1:2)} ${r[l]}`}function hr({author:e,id:r}){const a=e.tags??[],[l,n]=i.useState(!1),u=i.useRef(null),s=i.useRef(null),c=i.useRef(null),d=i.useRef(null),h=a.map(o=>`${o.id}:${o.name}`).join("|");return i.useLayoutEffect(()=>{if(a.length===0){n(!1);return}const o=()=>{const p=u.current,w=s.current,y=c.current,k=d.current;if(!p||!w||!y||!k||p.offsetWidth===0)return;const q=y.getBoundingClientRect().width,M=k.getBoundingClientRect().width,S=Number.parseFloat(getComputedStyle(w).columnGap)||0,v=w.clientWidth-q-S,j=M>v+1;n($=>$===j?$:j)};o();const f=new ResizeObserver(o);return[u.current,s.current,d.current].forEach(p=>{p&&f.observe(p)}),()=>f.disconnect()},[h,a.length]),t.jsxs("div",{id:r,ref:u,className:"author-hover-card",role:"dialog","aria-label":`${e.name} 的用户摘要`,children:[t.jsxs("div",{className:"author-card-head",children:[t.jsx("img",{src:e.avatar,alt:""}),t.jsxs("div",{className:"author-card-head-copy",children:[t.jsxs("div",{ref:s,className:"author-card-name-line","data-tags-overflow":l?"true":void 0,children:[t.jsx("strong",{ref:c,children:e.name}),t.jsx("div",{className:"author-card-tag-slot",children:t.jsx(me,{size:"compact",tags:a})})]}),(e.stars>0||e.role)&&t.jsxs("span",{className:"author-card-status",children:["★".repeat(e.stars),e.stars>0&&e.role?" · ":"",e.role]})]})]}),l?t.jsx("div",{className:"author-card-tags-row",children:t.jsx(me,{size:"compact",tags:a})}):null,e.medals?.length?t.jsx("div",{className:"author-card-medals",children:t.jsx(Ne,{medals:e.medals,profileName:e.name,variant:"compact"})}):null,t.jsx("div",{ref:d,className:"author-card-tag-width-measure","aria-hidden":"true",children:t.jsx(me,{size:"compact",tags:a})}),t.jsxs("dl",{children:[t.jsxs("div",{children:[t.jsx("dt",{children:"主题"}),t.jsx("dd",{children:e.topics})]}),t.jsxs("div",{children:[t.jsx("dt",{children:"回复"}),t.jsx("dd",{children:e.replies})]}),t.jsxs("div",{children:[t.jsx("dt",{children:"签到"}),t.jsx("dd",{children:e.checkins})]})]}),t.jsxs("p",{children:["最近在线：",e.lastSeen]}),t.jsxs("a",{href:ne(e.name),children:["查看个人主页 ",t.jsx(Ct,{size:13})]})]})}function br({author:e}){const r=e.tags??[],a=Te(r),l=ne(e.name);return t.jsxs("aside",{className:"thread-author-profile","aria-label":`${e.name} 的资料`,children:[t.jsx("a",{"aria-label":`查看${e.name}的个人主页`,className:"thread-author-profile-avatar",href:l,children:t.jsx("img",{src:e.avatar,alt:""})}),t.jsx("div",{className:"thread-author-profile-identity",children:t.jsx("a",{href:l,children:e.name})}),(e.stars>0||e.role)&&t.jsxs("div",{className:"thread-author-profile-status",children:[e.stars>0&&t.jsx("span",{"aria-label":`${e.stars} 星`,children:"★".repeat(e.stars)}),e.role&&t.jsx("strong",{children:e.role})]}),t.jsx(Le,{tags:a}),t.jsx(Ne,{medals:e.medals??[],profileName:e.name,variant:"compact"}),t.jsxs("dl",{className:"thread-author-profile-stats",children:[t.jsxs("div",{children:[t.jsx("dt",{children:"主题"}),t.jsx("dd",{children:e.topics})]}),t.jsxs("div",{children:[t.jsx("dt",{children:"回复"}),t.jsx("dd",{children:e.replies})]}),t.jsxs("div",{children:[t.jsx("dt",{children:"签到"}),t.jsx("dd",{children:e.checkins})]})]}),t.jsxs("p",{className:"thread-author-profile-last-seen",children:[t.jsx("span",{children:"最近在线"}),t.jsx("strong",{children:e.lastSeen})]})]})}function be(e){return e.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function yr(e){const r=window.getSelection()?.toString();r&&(e.preventDefault(),e.clipboardData.setData("text/plain",r))}function xr({articleAfterContent:e,author:r,avatarRail:a,className:l="",content:n,decorationImageSrc:u,editedAt:s,floor:c,floorIndex:d,id:h,inlineAvatar:o=!1,mainAfterContent:f,onCopy:p,publishedAt:w,showAuthorProfile:y}){const k=r.tags??[],q=Te(k);return t.jsxs("article",{className:`thread-floor${y?" thread-floor-with-author-profile":""}${l?` ${l}`:""}`,"data-floor":c,id:h,onCopy:p,children:[u&&t.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:t.jsx("img",{alt:"",src:u})}),y?t.jsx(br,{author:r}):!o&&a,t.jsxs("div",{className:"thread-floor-main",children:[t.jsxs("header",{className:"thread-floor-header",children:[!y&&o&&a,t.jsxs("div",{className:"thread-floor-author",children:[t.jsx("a",{href:ne(r.name),children:r.name}),t.jsx(Le,{tags:q})]}),t.jsxs("div",{className:"thread-floor-time",children:[t.jsx("time",{children:be(w)}),s&&t.jsxs(t.Fragment,{children:[t.jsx("span",{children:"·"}),t.jsxs("time",{children:["编辑于 ",be(s)]})]})]}),d]}),y?t.jsx("div",{className:"thread-floor-content",children:n}):n,f]}),e]})}function vr({canDelete:e,canEdit:r,canQuote:a,canReply:l,decorative:n=!1,deleting:u=!1,editHref:s="",onDelete:c,onQuote:d,onReply:h}){const o=n?-1:void 0,f=i.useRef(null);return t.jsxs("div",{"aria-hidden":n||void 0,className:`thread-floor-actions${n?" thread-floor-actions-decorative":""}`,children:[a&&t.jsxs("button",{onClick:p=>{const w=f.current?f.current.text:Ce(p.currentTarget);f.current=null,d?.(w)},onPointerDown:p=>{p.button===0&&(f.current={text:Ce(p.currentTarget)})},tabIndex:o,type:"button",children:[t.jsx(xt,{size:15}),"引用"]}),l&&t.jsxs("button",{onClick:h,tabIndex:o,type:"button",children:[t.jsx(qt,{size:15}),"回复"]}),r&&(n?t.jsxs("button",{tabIndex:-1,type:"button",children:[t.jsx(ke,{size:15}),"编辑"]}):t.jsxs("a",{href:s,children:[t.jsx(ke,{size:15}),"编辑"]})),e&&t.jsxs("button",{"aria-busy":u||void 0,className:"floor-action-danger",disabled:!n&&u,onClick:n?void 0:p=>c?.(p.currentTarget),tabIndex:o,type:"button",children:[t.jsx(xe,{size:15}),u?"删除中":"删除"]})]})}function qr({canQuote:e,canReply:r,decorationImageSrc:a,editHref:l,floor:n,isActivityThread:u,isMainPost:s,inlineAvatar:c,showAuthorProfile:d,hideSignature:h,onDeleteFloor:o,onDeleteNestedReply:f,onIsolatedTextSelection:p,onQuote:w,onSubmitNestedReply:y,viewer:k}){const[q,M]=i.useState(!1),[S,v]=i.useState(null),[j,$]=i.useState([]),[C,P]=i.useState(""),[V,X]=i.useState(!1),[W,R]=i.useState([]),[H,A]=i.useState(""),[F,E]=i.useState(""),[U,_]=i.useState(null),[K,Q]=i.useState(""),[Z,oe]=i.useState(!1),[D,g]=i.useState(void 0),[x,I]=i.useState(null),[T,B]=i.useState(!1),N=i.useRef(null),z=i.useRef(null),ee=i.useRef(null),b=i.useRef(null),Y=i.useRef(null),te=i.useMemo(()=>[...n.nestedReplies??[],...W].filter(m=>!j.includes(m.id)),[j,n.nestedReplies,W]),ae=u&&!s&&/<\s*(?:s|strike)\b/i.test(n.contentHtml??""),re=`thread-floor-body${ae?" capubbs-activity-signup-canceled":""}`;i.useEffect(()=>()=>{z.current!==null&&window.clearTimeout(z.current)},[]),i.useEffect(()=>{if(!T)return;function m(L){N.current?.contains(L.target)||B(!1)}return document.addEventListener("pointerdown",m),()=>document.removeEventListener("pointerdown",m)},[T]);async function Oe(){const m=`${window.location.origin}${window.location.pathname}${window.location.search}#${n.floor}`;await $t(m)&&(M(!0),z.current!==null&&window.clearTimeout(z.current),z.current=window.setTimeout(()=>M(!1),1800))}const ve=(m,L,J,ue)=>{Y.current=J,I({imageIndex:L,images:m,onImageChange:ue})};function Ge(m){x?.onImageChange?.(m),I(null),window.requestAnimationFrame(()=>Y.current?.focus())}function Ie(m=null){g(m),A(""),E(""),Q(""),window.requestAnimationFrame(()=>b.current?.focus())}function we(){g(void 0),A(""),Q("")}async function He(m){m.preventDefault();const L=H.trim();if(!(!L||!k||Z)){oe(!0),Q("");try{const J=await y(n,D??null,L);R(ue=>[...ue,{author:k,canDelete:!0,content:L,id:J>0?String(J):`local-${n.id}-${Date.now()}`,publishedAt:Ar(new Date),target:D??void 0}]),we()}catch(J){Q(J instanceof Error?J.message:"楼中楼回复发布失败，请稍后重试。")}finally{oe(!1)}}}async function Ue(m){_(m.id),E("");try{await f(n,m),$(L=>[...L,m.id]),R(L=>L.filter(J=>J.id!==m.id)),v(null)}catch(L){E(L instanceof Error?L.message:"楼中楼删除失败，请稍后重试。")}finally{_(null)}}async function _e(){if(!V){X(!0),P("");try{await o(n)}catch(m){P(m instanceof Error?m.message:"楼层删除失败，请稍后重试。"),X(!1)}}}function Be(){v(null),P(""),E(""),window.requestAnimationFrame(()=>ee.current?.focus())}function We(){if(!S)return;const m=S;v(null),m.kind==="floor"?_e():Ue(m.reply)}const Ye=t.jsxs("div",{className:`thread-avatar-rail${T?" thread-avatar-rail-open":""}`,ref:N,children:[t.jsx("button",{"aria-controls":`author-card-${n.floor}`,"aria-expanded":T,"aria-label":`查看${n.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>B(m=>!m),type:"button",children:t.jsx("img",{src:n.author.avatar,alt:""})}),t.jsx(hr,{author:n.author,id:`author-card-${n.floor}`})]}),Ve=t.jsx(mr,{attachments:n.attachments,bodyFallback:t.jsx("div",{className:re,children:n.paragraphs.map(m=>t.jsx("p",{children:m},m))}),bodyClassName:re,bodyHtml:n.contentHtml,floor:n.floor,isActivitySignupCanceled:ae,onImageOpen:ve,onIsolatedTextSelection:m=>p(n,m),signatureHtml:h?void 0:n.signatureHtml,signatureText:h?void 0:n.signature}),Ke=t.jsxs("button",{"aria-label":`复制第 ${n.floor} 楼链接`,className:"thread-floor-index",onClick:Oe,title:"复制楼层链接",type:"button",children:["#",n.floor]}),Je=t.jsxs(t.Fragment,{children:[t.jsx(vr,{canDelete:(!u||s)&&(n.canDelete??n.isOwn??!1),canEdit:(!u||s)&&!!n.isOwn,canQuote:e,canReply:r,deleting:V,editHref:l,onDelete:m=>{ee.current=m,P(""),v({kind:"floor"})},onQuote:m=>w(n,m),onReply:()=>Ie()}),C&&t.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:C}),te.length>0&&t.jsx("section",{className:"nested-replies","aria-label":`${n.floor} 楼的楼中楼回复`,children:te.map(m=>t.jsxs("article",{children:[t.jsx("img",{src:m.author.avatar,alt:""}),t.jsxs("div",{className:"nested-reply-main",children:[t.jsxs("div",{className:"nested-reply-identity",children:[t.jsx("a",{className:"nested-reply-author",href:ne(m.author.name),children:m.author.name}),m.target&&t.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",t.jsx("a",{href:ne(m.target),children:m.target})]})]}),m.contentHtml?t.jsx($e,{className:"nested-reply-content",html:m.contentHtml,onImageOpen:ve,variant:"nested"}):t.jsx("p",{children:m.content}),t.jsxs("footer",{className:"nested-reply-footer",children:[t.jsx("time",{children:be(m.publishedAt)}),r&&t.jsx("button",{onClick:()=>Ie(m.author.name),type:"button",children:"回复"}),m.canDelete&&t.jsxs("button",{className:"nested-reply-delete",disabled:U===m.id,onClick:L=>{ee.current=L.currentTarget,E(""),v({kind:"nested",reply:m})},type:"button",children:[t.jsx(xe,{size:12}),U===m.id?"删除中":"删除"]})]})]})]},m.id))}),F&&t.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:F}),D!==void 0&&r&&t.jsxs("form",{className:"nested-reply-composer",onSubmit:He,children:[t.jsx("textarea",{"aria-label":D?`回复 @${D}`:`回复第 ${n.floor} 楼`,maxLength:500,onChange:m=>{A(m.target.value),Q("")},placeholder:D?`回复 @${D}`:"写一条楼中楼回复",ref:b,rows:2,value:H}),t.jsxs("div",{className:"nested-reply-composer-actions",children:[t.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:Z,onClick:we,type:"button",children:t.jsx(ye,{size:15})}),t.jsxs("button",{className:"nested-reply-submit",disabled:!H.trim()||Z,type:"submit",children:[t.jsx(bt,{size:14}),Z?"发送中":"发送"]})]}),K&&t.jsx("p",{className:"nested-reply-error",role:"alert",children:K})]})]}),Xe=t.jsxs(t.Fragment,{children:[q&&t.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[t.jsx(yt,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),x&&t.jsx(_t,{images:x.images,initialImageIndex:x.imageIndex,onImageChange:x.onImageChange,onClose:Ge}),S&&t.jsx(Ir,{floor:n,isMainPost:s,onCancel:Be,onConfirm:We,target:S})]});return t.jsx(xr,{articleAfterContent:Xe,author:n.author,avatarRail:Ye,content:Ve,decorationImageSrc:a,editedAt:n.editedAt,floor:n.floor,floorIndex:Ke,id:String(n.floor),inlineAvatar:c,mainAfterContent:Je,onCopy:yr,publishedAt:n.publishedAt,showAuthorProfile:d})}function Ce(e){const r=e.closest(".thread-floor")?.querySelector(".thread-floor-body");return vt(window.getSelection(),r??null)}function Ir({floor:e,isMainPost:r,onCancel:a,onConfirm:l,target:n}){const u=n.kind==="nested"?n.reply:null,s=u?"删除楼中楼回复":r?"删除主楼":"删除回复",c=u?"":r?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",d=u?.author.name??e.author.name,h=u?`#${e.floor} · 楼中楼`:`#${e.floor}`,o=wr(u?.content||e.quoteText||e.paragraphs[0]||"");return i.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),i.useEffect(()=>{function f(p){p.key==="Escape"&&a()}return document.addEventListener("keydown",f),()=>document.removeEventListener("keydown",f)},[a]),t.jsx("div",{className:"thread-delete-dialog-backdrop",onMouseDown:f=>{f.currentTarget===f.target&&a()},role:"presentation",children:t.jsxs("section",{"aria-describedby":c?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[t.jsxs("header",{children:[t.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:t.jsx(Et,{size:19})}),t.jsx("div",{children:t.jsx("h2",{id:"thread-delete-dialog-title",children:s})}),t.jsx("button",{"aria-label":"关闭删除确认",onClick:a,type:"button",children:t.jsx(ye,{size:18})})]}),t.jsxs("div",{className:"thread-delete-dialog-body",children:[c&&t.jsx("p",{id:"thread-delete-dialog-description",children:c}),t.jsxs("div",{className:"thread-delete-dialog-target",children:[t.jsxs("span",{children:[d," · ",h]}),t.jsx("p",{children:o||"此回复没有可预览的文字内容。"})]})]}),t.jsxs("footer",{children:[t.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:a,type:"button",children:"取消"}),t.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:l,type:"button",children:[t.jsx(xe,{size:15}),"确认删除"]})]})]})})}function wr(e){const r=e.replace(/\s+/g," ").trim();return r.length>100?`${r.slice(0,100).trimEnd()}…`:r}function Ar(e){const r=a=>String(a).padStart(2,"0");return`${e.getFullYear()}-${r(e.getMonth()+1)}-${r(e.getDate())} ${r(e.getHours())}:${r(e.getMinutes())}:${r(e.getSeconds())}`}export{Nt as P,mr as T,xr as a,vr as b,qr as c,$t as w};
