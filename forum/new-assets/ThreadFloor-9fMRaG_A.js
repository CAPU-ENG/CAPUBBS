import{p as Ce,r as l,_ as Ke,j as e,$ as Ve,X as he,b as Je,d as Xe,b8 as Qe,b9 as Ze,ba as et,bb as tt,bc as rt,aK as at,bd as nt,aQ as ot,aE as lt,be as it,bf as st,bg as ct,bh as ut,bi as dt,a3 as mt,R as ne,y as gt,a5 as ft,b5 as pt,bj as ht}from"./index-C_D8PGgE.js";import{e as bt,d as we,m as ce,s as yt,f as xt,r as vt,h as wt,a as je,P as Ee}from"./RichTextEditor.gallery-BK4JDM8c.js";import{P as It}from"./plus-Cy3CvPU_.js";import{R as kt}from"./rotate-ccw-DkiIQu45.js";import{D as Re,T as ue}from"./TagBadge-DG9eDI-8.js";import{T as be}from"./trash-2-C0_upBjB.js";import{P as Ie}from"./pencil-BoysgKSw.js";import{E as At}from"./external-link-CVhwTxvQ.js";import{T as St}from"./triangle-alert-DoULUbH-.js";const Ct=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],jt=Ce("paperclip",Ct);const Et=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],Rt=Ce("reply",Et);async function Tt(t){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(t),!0}catch{}const r=document.createElement("textarea");r.value=t,r.setAttribute("readonly",""),r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select();try{return document.execCommand("copy")}finally{r.remove()}}const Nt={black:0,darkgray:169,darkgrey:169,dimgray:105,dimgrey:105,gainsboro:220,gray:128,grey:128,lightgray:211,lightgrey:211,silver:192,white:255,whitesmoke:245},de="data-capubbs-original-grayscale-color-attr",me="data-capubbs-original-grayscale-style-color";function $t(t){const r=String(t??"").trim().toLowerCase().replace(/^['"]|['"]$/g,""),a=r.replace(/\s+/g,""),s=Nt[a];if(typeof s=="number")return{alpha:1,channel:s};const n=a.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);if(n){const o=n[1].length<=4?n[1].split("").map(k=>`${k}${k}`).join(""):n[1],f=Number.parseInt(o.slice(0,2),16),p=Number.parseInt(o.slice(2,4),16),I=Number.parseInt(o.slice(4,6),16),y=o.length===8?Number.parseInt(o.slice(6,8),16)/255:1;return f===p&&p===I?{alpha:y,channel:f}:null}const d=r.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*(?:,|\/)\s*([01](?:\.\d+)?|\.\d+|100%|\d{1,3}(?:\.\d+)?%))?\s*\)$/);if(!d)return null;const i=ge(d[1]),c=ge(d[2]),m=ge(d[3]),b=qt(d[4]);return i===null||c===null||m===null||b===null?null:i===c&&c===m?{alpha:b,channel:i}:null}function Te(t,r=!0){const a=$t(t);if(!a)return null;const s=255-a.channel;if(r&&a.alpha<1)return`rgba(${s}, ${s}, ${s}, ${Dt(a.alpha)})`;const n=s.toString(16).padStart(2,"0");return`#${n}${n}${n}`}function Lt(t,r){[...t.matches("[color], [style]")?[t]:[],...Array.from(t.querySelectorAll("[color], [style]"))].forEach(s=>{Mt(s,r),s instanceof HTMLElement&&Pt(s,r)})}function Mt(t,r){const a=t.getAttribute(de);if(r==="light"){if(a===null)return;t.setAttribute("color",a),t.removeAttribute(de);return}const s=a??t.getAttribute("color"),n=Te(s,!1);!n||s===null||(a===null&&t.setAttribute(de,s),t.getAttribute("color")!==n&&t.setAttribute("color",n))}function Pt(t,r){const a=t.getAttribute(me);if(r==="light"){if(a===null)return;t.style.setProperty("color",a,t.style.getPropertyPriority("color")),t.removeAttribute(me);return}const s=a??t.style.getPropertyValue("color"),n=Te(s);!n||!s||(a===null&&t.setAttribute(me,s),t.style.getPropertyValue("color")!==n&&t.style.setProperty("color",n,t.style.getPropertyPriority("color")))}function ge(t){const r=t.endsWith("%"),a=Number(r?t.slice(0,-1):t);return Number.isFinite(a)?r?a>=0&&a<=100?Math.round(a*2.55):null:a>=0&&a<=255?Math.round(a):null:null}function qt(t){if(t===void 0)return 1;const r=t.endsWith("%"),a=Number(r?t.slice(0,-1):t);return Number.isFinite(a)?r?a>=0&&a<=100?a/100:null:a>=0&&a<=1?a:null:null}function Dt(t){return Number(t.toFixed(3))}function Ne({className:t="",html:r,onImageOpen:a,variant:s}){const n=l.useRef(null),{theme:d}=Ke(),i=l.useMemo(()=>({__html:r}),[r]);if(l.useLayoutEffect(()=>{const o=n.current;o&&(bt(o),Lt(o,d))},[r,d]),l.useEffect(()=>{const o=n.current;if(!o)return;const f=Array.from(o.querySelectorAll("img")),p=y=>{y.dataset.capubbsImageLoaded="true"},I=f.map(y=>{if(y.complete)return p(y),null;const k=()=>p(y);return y.addEventListener("load",k,{once:!0}),y.addEventListener("error",k,{once:!0}),{handleLoad:k,image:y}});return()=>{I.forEach(y=>{y&&(y.image.removeEventListener("load",y.handleLoad),y.image.removeEventListener("error",y.handleLoad))})}},[r]),!r)return null;function c(o,f){if(!a||!(o instanceof Element))return;const p=o.closest("img");if(!(p instanceof HTMLImageElement))return;const I=p.closest(".capubbs-gallery"),y=I?Array.from(I.querySelectorAll('[data-capubbs-gallery-slide="true"] img')):Array.from(f.querySelectorAll("img")).filter(v=>!v.closest(".capubbs-gallery")),k=y.indexOf(p);if(k<0)return;const L=y.map(v=>Ft(v,f)),P=y.map((v,S)=>{const M=L[S];return{alt:v.alt.trim(),element:v,src:v.currentSrc||v.src,...M?{galleryId:M.galleryId,galleryIndex:M.galleryIndex}:{}}});a(P,k,p,v=>{const S=L[v];S&&yt(S.gallery,S.galleryIndex)})}function m(o){const f=we(o.target);if(f&&o.target instanceof Element){o.preventDefault(),o.stopPropagation(),ce(o.target,f);return}!a||!(o.target instanceof HTMLImageElement)||(o.preventDefault(),c(o.target,o.currentTarget))}function b(o){const f=we(o.target);if(f&&["Enter"," "].includes(o.key)&&o.target instanceof Element){o.preventDefault(),ce(o.target,f);return}if(["ArrowLeft","ArrowRight"].includes(o.key)&&o.target instanceof Element&&o.target.closest(".capubbs-gallery")){o.preventDefault(),ce(o.target,o.key==="ArrowLeft"?"prev":"next");return}!a||!(o.target instanceof HTMLImageElement)||!["Enter"," "].includes(o.key)||(o.preventDefault(),c(o.target,o.currentTarget))}return e.jsx("div",{ref:n,className:`forum-markup forum-markup-${s} ${t}`.trim(),"data-forum-markup":s,dangerouslySetInnerHTML:i,onClick:m,onKeyDown:b})}function Ft(t,r){const a=t.closest(".capubbs-gallery");if(!a||!r.contains(a))return null;const n=Array.from(r.querySelectorAll(".capubbs-gallery")).indexOf(a),i=Array.from(a.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(t);return n>=0&&i>=0?{gallery:a,galleryId:n,galleryIndex:i}:null}const z=1,$e=4,le=.25;function zt(t){return Math.min($e,Math.max(z,t))}function fe(t){const[r,a]=[...t.values()];return!r||!a?null:Math.hypot(a.x-r.x,a.y-r.y)}function Gt({images:t,initialImageIndex:r,onImageChange:a,onClose:s}){const n=Math.min(Math.max(0,r),Math.max(0,t.length-1)),[d,i]=l.useState(n),[c,m]=l.useState(z),[b,o]=l.useState({x:0,y:0}),[f,p]=l.useState(!1),I=l.useRef(null),y=l.useRef(null),k=l.useRef(null),L=l.useRef(null),P=l.useRef(n),A=l.useRef(z),v=l.useRef({x:0,y:0}),S=l.useRef(null),M=l.useRef(!1),E=l.useRef(new Map),q=l.useRef(null),K=l.useRef(z),X=l.useRef(a),_=l.useRef(s);X.current=a,_.current=s;function j(g,x=A.current){const w=I.current,T=k.current;if(!w||!T||x<=z)return{x:0,y:0};const O=Math.max(0,(T.clientWidth*x-w.clientWidth)/2),N=Math.max(0,(T.clientHeight*x-w.clientHeight)/2);return{x:Math.min(O,Math.max(-O,g.x)),y:Math.min(N,Math.max(-N,g.y))}}function B(g,x=A.current){const w=j(g,x);v.current=w,o(w)}function C(g){const x=Math.round(zt(g)*100)/100;A.current=x,m(x),B(v.current,x)}function G(){A.current=z,v.current={x:0,y:0},m(z),o({x:0,y:0})}function R(g){const x=Math.min(Math.max(0,g),t.length-1);x!==P.current&&(P.current=x,i(x),G(),X.current?.(x))}function H(){_.current(P.current)}l.useEffect(()=>{const g=document.body.style.overflow,x=document.activeElement,w=I.current;document.body.style.overflow="hidden",L.current?.focus();function T(h){if(h.key==="Escape"){h.preventDefault(),H();return}if(h.key==="ArrowLeft"){h.preventDefault(),h.stopPropagation(),R(P.current-1);return}if(h.key==="ArrowRight"){h.preventDefault(),h.stopPropagation(),R(P.current+1);return}if(h.key==="+"||h.key==="="){h.preventDefault(),h.stopPropagation(),C(A.current+le);return}if(h.key==="-"){h.preventDefault(),h.stopPropagation(),C(A.current-le);return}if(h.key==="0"){h.preventDefault(),h.stopPropagation(),G();return}if(h.key==="Tab"){const U=y.current?.querySelectorAll("button:not(:disabled)");if(!U?.length)return;const te=U[0],ae=U[U.length-1],re=document.activeElement;if(h.shiftKey&&re===te){h.preventDefault(),ae.focus();return}if(!h.shiftKey&&re===ae){h.preventDefault(),te.focus();return}y.current?.contains(re)||(h.preventDefault(),te.focus())}}function O(h){if(h.preventDefault(),h.stopPropagation(),h.deltaY===0)return;const U=h.ctrlKey?.01:.002;C(A.current*Math.exp(-h.deltaY*U))}function N(h){h.preventDefault(),h.stopPropagation(),K.current=A.current}function F(h){if(h.preventDefault(),h.stopPropagation(),E.current.size>=2)return;const U=h.scale;typeof U=="number"&&C(K.current*U)}function ee(){B(v.current,A.current)}return document.addEventListener("keydown",T,{capture:!0}),window.addEventListener("resize",ee),w?.addEventListener("wheel",O,{passive:!1}),w?.addEventListener("gesturestart",N,{passive:!1}),w?.addEventListener("gesturechange",F,{passive:!1}),w?.addEventListener("gestureend",F,{passive:!1}),()=>{document.removeEventListener("keydown",T,{capture:!0}),window.removeEventListener("resize",ee),w?.removeEventListener("wheel",O),w?.removeEventListener("gesturestart",N),w?.removeEventListener("gesturechange",F),w?.removeEventListener("gestureend",F),document.body.style.overflow=g,x instanceof HTMLElement&&x.focus()}},[]);function Y(g,x,w){S.current={pointerId:g,startX:x,startY:w,originX:v.current.x,originY:v.current.y},p(!0)}function V(g){if(g.target instanceof Element&&g.target.closest("button, .thread-image-lightbox-controls"))return;const x=g.pointerType==="touch",w=g.pointerType==="mouse"&&g.button===0;if(!(!x&&!w)&&(M.current=!1,!(!x&&A.current<=z))){if(g.preventDefault(),g.currentTarget.setPointerCapture(g.pointerId),x&&(E.current.set(g.pointerId,{x:g.clientX,y:g.clientY}),E.current.size===2)){q.current=fe(E.current),S.current=null,p(!1);return}A.current>z&&Y(g.pointerId,g.clientX,g.clientY)}}function Q(g){const x=E.current.has(g.pointerId),w=S.current;if(!x&&w?.pointerId!==g.pointerId)return;if(g.preventDefault(),g.stopPropagation(),x&&E.current.set(g.pointerId,{x:g.clientX,y:g.clientY}),E.current.size===2){const N=fe(E.current),F=q.current;if(!N||!F){q.current=N;return}Math.abs(N-F)>1&&(M.current=!0),C(A.current*(N/F)),q.current=N;return}if(!w||A.current<=z)return;const T=g.clientX-w.startX,O=g.clientY-w.startY;Math.hypot(T,O)>3&&(M.current=!0),B({x:w.originX+T,y:w.originY+O})}function Z(g){const x=E.current.delete(g.pointerId),w=S.current?.pointerId===g.pointerId;if(!(!x&&!w)){if(q.current=E.current.size===2?fe(E.current):null,E.current.size===1&&A.current>z){const[T]=E.current.entries();if(T){const[O,N]=T;Y(O,N.x,N.y)}}else S.current=null,p(!1);g.currentTarget.hasPointerCapture(g.pointerId)&&g.currentTarget.releasePointerCapture(g.pointerId)}}const oe=Math.round(c*100),D=t[d]??t[0];return D?Ve.createPortal(e.jsx("div",{className:"thread-image-lightbox-backdrop","data-can-pan":c>z,"data-dragging":f,onClick:g=>{g.target===g.currentTarget&&!M.current&&H()},onPointerCancel:Z,onPointerDown:V,onPointerMove:Q,onPointerUp:Z,ref:I,role:"presentation",children:e.jsxs("figure",{"aria-label":D.alt?`图片预览：${D.alt}（${d+1}/${t.length}）`:`图片预览（${d+1}/${t.length}）`,"aria-modal":"true",className:"thread-image-lightbox",ref:y,role:"dialog",children:[e.jsx("button",{"aria-label":"关闭图片预览",className:"thread-image-lightbox-close",onClick:H,ref:L,type:"button",children:e.jsx(he,{size:20})}),t.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{"aria-label":"上一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-prev",disabled:d===0,onClick:()=>R(d-1),title:"上一张（←）",type:"button",children:e.jsx(Je,{size:28})}),e.jsx("button",{"aria-label":"下一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-next",disabled:d===t.length-1,onClick:()=>R(d+1),title:"下一张（→）",type:"button",children:e.jsx(Xe,{size:28})})]}),e.jsx(Ht,{image:D,imageRef:k,onReady:()=>B(v.current,A.current),transform:`translate3d(${b.x}px, ${b.y}px, 0) scale(${c})`}),D.alt&&e.jsx("figcaption",{children:D.alt}),e.jsxs("div",{"aria-label":"图片缩放",className:"thread-image-lightbox-controls",role:"toolbar",children:[e.jsx("button",{"aria-label":"缩小图片",disabled:c<=z,onClick:()=>C(c-le),title:"缩小（-）",type:"button",children:e.jsx(xt,{size:18})}),e.jsxs("output",{"aria-label":"当前缩放比例","aria-live":"polite",children:[oe,"%"]}),e.jsx("button",{"aria-label":"放大图片",disabled:c>=$e,onClick:()=>C(c+le),title:"放大（+）",type:"button",children:e.jsx(It,{size:18})}),e.jsx("button",{"aria-label":"恢复原始大小",disabled:c===z,onClick:G,title:"恢复原始大小（0）",type:"button",children:e.jsx(kt,{size:17})})]})]})}),document.body):null}function Ht({image:t,imageRef:r,onReady:a,transform:s}){const n=l.useRef(null),d=l.useRef(a);return d.current=a,l.useLayoutEffect(()=>{const i=t.element,c=n.current,m=i?.parentNode;if(!i||!c?.parentNode||!m)return;const b=i.ownerDocument.createComment("capubbs-lightbox-image"),o=i.getAttribute("style"),f=i.getAttribute("draggable");m.insertBefore(b,i),c.parentNode.insertBefore(i,c),i.draggable=!1,r.current=i;const p=()=>d.current();return i.addEventListener("load",p),i.complete&&p(),()=>{i.removeEventListener("load",p),o===null?i.removeAttribute("style"):i.setAttribute("style",o),f===null?i.removeAttribute("draggable"):i.setAttribute("draggable",f),b.parentNode?.insertBefore(i,b),b.remove(),r.current===i&&(r.current=null)}},[t,r]),l.useLayoutEffect(()=>{t.element&&(t.element.style.transform=s)},[t,s]),t.element?e.jsx("span",{hidden:!0,ref:n}):e.jsx("img",{alt:t.alt,draggable:"false",onLoad:a,ref:r,src:t.src,style:{transform:s}})}const Ot=':root{--surface: #fffefa;--surface-raised: #ffffff;--surface-soft: #f6f8f4;--text: #20231f;--text-strong: #111411;--text-muted: #687068;--text-faint: #919991;--line: #e1e6df;--line-strong: #cdd5cc;--brand: #236b4c;--brand-strong: #174f38;--danger: #b8473f}:root.dark{--surface: #171d19;--surface-raised: #1c241f;--surface-soft: #1f2822;--text: #dde5de;--text-strong: #f6faf6;--text-muted: #a0aca2;--text-faint: #748078;--line: #2c362f;--line-strong: #3c493f;--brand: #69b98d;--brand-strong: #8bcca6;--danger: #ef8178}::-moz-selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}::selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentcolor}blockquote,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}a{color:inherit;text-decoration:inherit}button{margin:0;padding:0;background-color:transparent;color:inherit;font:inherit;letter-spacing:inherit;text-transform:none}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}.capubbs-html-frame-root iframe{background-color:transparent!important}img,video{max-width:100%;height:auto}table{border-color:inherit;border-collapse:collapse;text-indent:0}.capubbs-activity-signup-canceled,.capubbs-activity-signup-canceled *{color:var(--danger)!important;text-decoration-color:var(--danger)!important;text-decoration-line:line-through!important;text-decoration-thickness:2px!important}.forum-markup>:first-child{margin-top:0}.forum-markup>:last-child{margin-bottom:0}.forum-markup p,.forum-markup div{margin:0}.forum-markup-floor p{margin:0 0 .75em}.forum-markup-floor>div+div{margin-top:.55em}.forum-markup a{color:var(--brand-strong);font-weight:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.16em}.forum-markup .forum-mention{text-decoration:none}.forum-markup blockquote{margin:0 0 0 2em;border:0;padding:0;background:transparent;color:inherit}.forum-markup blockquote.forum-quote,.forum-markup .forum-legacy-quote,.forum-markup blockquote.capubbs-floor-quote{margin:.8em 0;border-left:3px solid color-mix(in srgb,var(--brand) 38%,var(--line));padding:.55em .75em;background:var(--surface-soft);color:var(--text-muted)}.forum-markup .capubbs-floor-quote-jump{margin-left:.75em}.forum-markup .forum-legacy-quote-content{margin:0}.forum-markup h1,.forum-markup h2,.forum-markup h3,.forum-markup h4,.forum-markup h5,.forum-markup h6{margin:.9rem 0 .45rem;color:var(--brand-strong);font-weight:800;line-height:1.35}.forum-markup h1{font-size:1.45rem}.forum-markup h2{font-size:1.25rem}.forum-markup h3{font-size:1.1rem}.forum-markup h4,.forum-markup h5,.forum-markup h6{font-size:1em}.forum-markup ul,.forum-markup ol{margin:.65em 0;padding-left:1.45em}.forum-markup ul{list-style:disc}.forum-markup ol{list-style:decimal}.forum-markup ol.capubbs-ordered-list-alpha{list-style-type:lower-alpha}.forum-markup ol.capubbs-ordered-list-roman{list-style-type:lower-roman}.forum-markup pre{max-width:100%;overflow-x:auto;margin:.75em 0;border-radius:2px;padding:.75em;background:#182531;color:#f8fafc;white-space:pre-wrap}.forum-markup code,.forum-markup kbd{border-radius:2px;padding:.08em .25em;background:color-mix(in srgb,var(--surface-soft) 75%,var(--line));font-family:SFMono-Regular,Cascadia Code,Consolas,monospace;font-size:.9em}.forum-markup pre code{padding:0;background:transparent;color:inherit}.forum-markup font[size="1"]{font-size:11px}.forum-markup font[size="2"]{font-size:13px}.forum-markup font[size="3"]{font-size:15px}.forum-markup font[size="4"]{font-size:17px}.forum-markup font[size="5"]{font-size:19px}.forum-markup font[size="6"]{font-size:21px}.forum-markup font[size="7"]{font-size:23px}.forum-markup hr{margin:.9em 0;border:0;border-top:1px solid var(--line-strong)}.forum-markup img{display:inline-block;height:auto;max-width:100%;vertical-align:middle}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){background-color:color-mix(in srgb,var(--surface-soft) 82%,var(--line));background-image:linear-gradient(105deg,transparent 20%,color-mix(in srgb,var(--surface-raised) 70%,transparent) 45%,transparent 70%);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}.forum-markup img[role=button]{cursor:zoom-in}.forum-markup img[role=button]:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse}.forum-markup td,.forum-markup th{border:1px solid var(--line);padding:.35em .5em}.forum-markup-signature{color:#999;font-family:monospace;font-size:14px;line-height:1.6;overflow-wrap:anywhere}:root.dark .forum-markup-signature{color:#666}.forum-markup .capubbs-gallery{position:relative;display:block;width:100%;margin:.9rem 0;overflow:hidden;border:1px solid var(--line);border-radius:2px;background:transparent;color:var(--text)}.forum-markup .capubbs-gallery:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup .capubbs-gallery-header{position:relative;display:flex;min-height:44px;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:9px 12px;border-bottom:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-title{width:100%;min-width:0;margin:0;color:var(--text-strong);font-size:.82rem;font-weight:760;line-height:1.4;text-align:center}.forum-markup .capubbs-gallery-stage{position:relative;display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide{display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-slide>img{display:block;width:100%;height:var(--capubbs-gallery-image-height, clamp(280px, 52vw, 560px));max-width:none;margin:0 auto;border-radius:0;-o-object-fit:contain;object-fit:contain}.forum-markup .capubbs-gallery-caption{display:block;margin:0;color:var(--text-muted);font-size:.78rem;line-height:1.55;text-align:center}.forum-markup .capubbs-gallery-caption[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-footer{position:relative;display:flex;min-height:44px;align-items:center;justify-content:center;margin:0;padding:9px 12px;border-top:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-captions{width:100%;min-width:0;margin:0;padding-inline:48px;text-align:center}.forum-markup .capubbs-gallery-count{position:absolute;top:50%;right:12px;color:var(--text-faint);font-size:.72rem;font-variant-numeric:tabular-nums;font-weight:760;line-height:1.25;transform:translateY(-50%)}.forum-markup .capubbs-gallery-count[data-capubbs-gallery-current]:before{content:attr(data-capubbs-gallery-current) "/" attr(data-capubbs-gallery-total)}.forum-markup .capubbs-gallery-nav{position:absolute;z-index:4;top:50%;display:grid;width:36px;height:48px;place-items:center;padding:0;transform:translateY(-50%);border:1px solid rgb(255 255 255 / .25);border-radius:2px;background:#00000080;color:#fff;cursor:pointer;transition:.15s ease}.forum-markup .capubbs-gallery-nav:hover{background:#000000b8}.forum-markup .capubbs-gallery-nav:focus-visible{outline:2px solid #fff;outline-offset:2px}.forum-markup .capubbs-gallery-nav:before{font-family:Arial,sans-serif;font-size:2rem;font-weight:300;line-height:1}.forum-markup .capubbs-gallery-nav-prev:before{content:"‹"}.forum-markup .capubbs-gallery-nav-next:before{content:"›"}.forum-markup .capubbs-gallery-nav-prev{left:10px}.forum-markup .capubbs-gallery-nav-next{right:10px}@keyframes capubbs-image-loading{0%{background-position:120% 0}to{background-position:-80% 0}}@media(max-width:640px){.forum-markup .capubbs-gallery-slide>img{height:var(--capubbs-gallery-image-height, min(72vw, 420px))}.forum-markup .capubbs-gallery-nav{width:32px;height:42px}.forum-markup .capubbs-gallery-nav-prev{left:7px}.forum-markup .capubbs-gallery-nav-next{right:7px}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){animation:none}}',_t=28,Bt=64,Ut=5e4,Yt=30,Le=30,W="capubbs-thread-html-frame",Me=new URL("/bbs/lib/jquery.min.js",window.location.origin).href,Wt=rr(Ot),Kt=/\son[a-z][\w:-]*\s*=/i;let ie=null;function ke({className:t="",floor:r,html:a,isActivitySignupCanceled:s=!1,onImageOpen:n,onIsolatedTextSelection:d,variant:i}){const c=l.useMemo(()=>i==="signature"?vt(a):a,[a,i]),m=Jt(c,i==="signature"),b=Qe(m),o=l.useMemo(()=>b?null:Ze(m,{normalizeLegacyLineBreaks:i==="signature"}),[m,b,i]),f=l.useMemo(()=>et(m),[m]);return!b&&o!==null?e.jsx(Ne,{className:t,html:o,onImageOpen:n,variant:i}):e.jsx(Vt,{className:t,floor:r,html:f,isActivitySignupCanceled:s,onImageOpen:n,onTextSelection:d,variant:i})}function Vt({className:t,floor:r,html:a,isActivitySignupCanceled:s,onImageOpen:n,onTextSelection:d,variant:i}){const c=l.useRef(null),m=l.useRef(`${i}-${r}-${Math.random().toString(36).slice(2)}`),b=l.useRef(n);b.current=n;const o=l.useRef(d);o.current=d;const f=i==="signature"?_t:Bt,p=!!n,[I,y]=l.useState(null),k=nr(),L=l.useRef(k),P=rt(),A=i==="signature"?14:P,v=l.useMemo(()=>Zt(a),[a]),S=v.includes('type="text/capubbs-user-script"')||Kt.test(v),M=l.useMemo(()=>Xt({canOpenImages:p,frameId:m.current,needsJquery:S,html:v,isActivitySignupCanceled:s,isDarkTheme:L.current,fontSize:A,variant:i}),[p,v,A,s,S,i]),E=l.useMemo(()=>`data:text/html;charset=utf-8,${encodeURIComponent(M)}`,[M]),q=l.useCallback(()=>{c.current?.contentWindow?.postMessage({frameId:m.current,source:W,theme:k?"dark":"light",type:"theme"},"*")},[k]),K=l.useCallback((_=c.current?.contentWindow)=>{!S||!_||Ae().then(j=>{c.current?.contentWindow===_&&_.postMessage({frameId:m.current,jquerySource:j,source:W,type:"jquery-response"},"*")})},[S]),X=l.useCallback(()=>{q(),K()},[K,q]);return l.useEffect(()=>{y(null)},[E]),l.useEffect(()=>{q()},[q]),l.useEffect(()=>{S&&Ae()},[S]),l.useLayoutEffect(()=>{function _(j){const B=c.current?.contentWindow;if(!(!B||j.source!==B||!ar(j.data))&&j.data.frameId===m.current){if(j.data.type==="jquery-request"){K(B);return}if(j.data.type==="anchor"){const C=c.current;if(!C)return;const G=window.getComputedStyle(document.documentElement),R=Number.parseFloat(G.getPropertyValue("--topbar-height"))||0,H=window.scrollY+C.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,H+j.data.offsetTop-R-16)});return}if(j.data.type==="navigate"){const C=at(j.data.url,Pe());if(!C)return;window.history.pushState(null,"",C),window.dispatchEvent(new Event(nt));const G=new URL(C,window.location.origin);G.hash?window.requestAnimationFrame(()=>{const R=decodeURIComponent(G.hash.slice(1)),H=ot(`#${R}`);(H?lt(H):document.getElementById(R))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(j.data.type==="image-open"){const C=c.current;if(!C)return;const G=Array.from(C.contentDocument?.querySelectorAll("img")??[]),R=j.data.images.map(Y=>({...Y,element:typeof Y.elementIndex=="number"?G[Y.elementIndex]:void 0})),H=Y=>{const V=R[Y];!V||typeof V.galleryId!="number"||!Number.isSafeInteger(V.galleryIndex)||C.contentWindow?.postMessage({frameId:m.current,galleryId:V.galleryId,galleryIndex:V.galleryIndex,source:W,type:"gallery-select"},"*")};b.current?.(R,j.data.imageIndex,C,H);return}if(j.data.type==="selection"){j.data.text&&window.getSelection()?.removeAllRanges(),o.current?.(j.data.text);return}y(Math.min(Ut,Math.max(f,Math.ceil(j.data.height))))}}return window.addEventListener("message",_),()=>window.removeEventListener("message",_)},[f,K]),e.jsx("iframe",{ref:c,className:`thread-html-frame thread-html-frame-${i} ${t}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-same-origin allow-downloads",scrolling:"no",src:E,onLoad:X,style:{"--thread-html-frame-width-allowance":`${Le}px`,...I===null?{}:{"--thread-html-frame-height":`${I}px`}},title:i==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`})}function Jt(t,r){const[a,s]=l.useState(t);return l.useEffect(()=>{const n=new AbortController,d=r?wt(t):[];if(s(t),d.length===0)return()=>n.abort();const i=Array.from(new Map(d.map(c=>[`${c.bid}:${c.tid}:${c.pid}`,c])).values());return Promise.all(i.map(async c=>{try{const m=await tt(c,n.signal);return[`${c.bid}:${c.tid}:${c.pid}`,m]}catch(m){if(m instanceof DOMException&&m.name==="AbortError")throw m;return[`${c.bid}:${c.tid}:${c.pid}`,""]}})).then(c=>{if(n.signal.aborted)return;const m=new Map(c);let b=t;d.forEach(o=>{const f=m.get(`${o.bid}:${o.tid}:${o.pid}`);f&&(b=b.replace(o.marker,f))}),s(b)}).catch(()=>{}),()=>n.abort()},[r,t]),a}function Xt({canOpenImages:t,frameId:r,fontSize:a,needsJquery:s,html:n,isActivitySignupCanceled:d,isDarkTheme:i,variant:c}){const m=c==="signature",b=m?"#999999":"rgb(63 63 70)",o=m?"#666666":"rgb(228 228 231)",f=m?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",p=m?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",I=d?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${i?"dark":"light"}" style="background:transparent;color-scheme:${i?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${tr(Pe())}">
  <meta http-equiv="Content-Security-Policy" content="${er()}">
  <style>${Wt}</style>
  <style>
    html{--capubbs-frame-text-color:${b}}html.dark{--capubbs-frame-text-color:${o}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${f};font-size:${a}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${Le}px);${p}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${Qt(r,t,s)}<\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${c}${I}">${n}</main></body>
</html>`}function Qt(t,r,a){return`(function(){
    var frameId=${JSON.stringify(t)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(it)};
    var canOpenImages=${JSON.stringify(r)};
    var needsJquery=${JSON.stringify(a)};
    var jquerySourceUrl=${JSON.stringify(Me)};
    var forumAppExactPaths=${JSON.stringify(st)};
    var forumAppPathPrefixes=${JSON.stringify(ct)};
    var legacyForumExactPaths=${JSON.stringify(ut)};
    var legacyForumPathPatterns=${JSON.stringify(dt)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${Yt};
    var queued=false;
    var selectionQueued=false;
    var lastSelectionText='';
    var userScriptsExecuted=false;
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
      window.parent.postMessage({source:'${W}',type:'resize',frameId:frameId,height:height},'*');
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
      window.parent.postMessage({source:'${W}',type:'selection',frameId:frameId,text:text},'*');
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
        window.parent.postMessage({source:'${W}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${W}',type:'navigate',frameId:frameId,url:url},'*');
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
        var item={alt:(candidate.alt||'').trim(),elementIndex:allImages.indexOf(candidate),src:candidate.currentSrc||candidate.src||''};
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
      window.parent.postMessage({source:'${W}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
      if(event.source!==window.parent||!data||data.source!=='${W}'||data.frameId!==frameId)return;
      if(data.type==='jquery-response'){
        loadJqueryAndExecuteUserScripts(data.jquerySource);
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
      if(window.MutationObserver&&contentRoot)new MutationObserver(function(){queueHeight();prepareImages();prepareGalleries();syncGrayscaleTextColors(contentRoot);}).observe(contentRoot,{attributes:true,characterData:true,childList:true,subtree:true});
      window.addEventListener('load',queueHeight);
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
      if(needsJquery)window.parent.postMessage({source:'${W}',type:'jquery-request',frameId:frameId},'*');
      else executeUserScripts();
      prepareImages();
      prepareGalleries();
      syncGrayscaleTextColors(contentRoot);
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`}function Zt(t){return t.replace(/<script\b([^>]*)>/gi,(r,a)=>`<script${a.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function Ae(){return ie||(ie=fetch(Me,{credentials:"same-origin"}).then(t=>{if(!t.ok)throw new Error(`Failed to load jQuery: ${t.status}`);return t.text()}).catch(()=>null),ie)}function er(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'","upgrade-insecure-requests"].join("; ")}function Pe(){return new URL("/bbs/content/",window.location.origin).href}function tr(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function rr(t){return t.replace(/<\/style/gi,"<\\/style")}function ar(t){if(!t||typeof t!="object")return!1;const r=t;return r.source!==W||typeof r.frameId!="string"?!1:r.type==="anchor"?typeof r.offsetTop=="number"&&Number.isFinite(r.offsetTop)&&r.offsetTop>=0:r.type==="navigate"?typeof r.url=="string":r.type==="jquery-request"?!0:r.type==="selection"?typeof r.text=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(a=>!!a&&typeof a=="object"&&typeof a.alt=="string"&&typeof a.elementIndex=="number"&&Number.isSafeInteger(a.elementIndex)&&a.elementIndex>=0&&typeof a.src=="string"&&a.src.length>0&&(a.galleryId===void 0&&a.galleryIndex===void 0||typeof a.galleryId=="number"&&Number.isSafeInteger(a.galleryId)&&a.galleryId>=0&&typeof a.galleryIndex=="number"&&Number.isSafeInteger(a.galleryIndex)&&a.galleryIndex>=0)):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function nr(){const[t,r]=l.useState(()=>document.documentElement.classList.contains("dark"));return l.useEffect(()=>{const a=document.documentElement,s=()=>r(a.classList.contains("dark")),n=new MutationObserver(s);return n.observe(a,{attributeFilter:["class"],attributes:!0}),()=>n.disconnect()},[]),t}function or({attachments:t=[],bodyClassName:r="thread-floor-body",bodyFallback:a=null,bodyHtml:s,floor:n,isActivitySignupCanceled:d=!1,onImageOpen:i,onIsolatedTextSelection:c,signatureClassName:m="thread-signature",signatureHtml:b,signatureText:o}){const f=i?(p,I,y,k)=>{const L=p[I];L&&i([L],0,y,k?()=>k(I):void 0)}:void 0;return e.jsxs(e.Fragment,{children:[s?e.jsx(ke,{className:r,floor:n,html:s,isActivitySignupCanceled:d,onImageOpen:i,onIsolatedTextSelection:c,variant:"floor"}):a,e.jsx(lr,{attachments:t}),b?e.jsx(ke,{className:m,floor:n,html:b,onImageOpen:f,variant:"signature"}):o?e.jsx("footer",{className:m,children:e.jsx("p",{children:o})}):null]})}function lr({attachments:t}){return t.length===0?null:e.jsxs("section",{"aria-label":"附件",className:"thread-attachments",children:[e.jsxs("header",{className:"thread-attachments-heading",children:[e.jsx(jt,{"aria-hidden":"true",size:14}),e.jsx("span",{children:"附件"}),e.jsx("small",{children:t.length})]}),e.jsx("ul",{children:t.map(r=>{const a=e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"thread-attachment-name",children:r.name}),e.jsx("small",{children:ir(r)}),r.exists!==!1&&e.jsx(mt,{"aria-hidden":"true",size:15})]});return e.jsx("li",{children:r.exists===!1?e.jsx("div",{"aria-disabled":"true",className:"thread-attachment-link is-unavailable",children:a}):e.jsx("a",{className:"thread-attachment-link",download:r.name,href:r.downloadHref||`/bbs/download/?id=${encodeURIComponent(r.id)}`,children:a})},r.id)})})]})}function ir(t){if(t.exists===!1)return"文件不可用";const r=[sr(t.size),(t.price??0)>0?"付费附件":"免费"];return t.downloadCount!==void 0&&r.push(`下载 ${t.downloadCount} 次`),r.join(" · ")}function sr(t){if(t<=0)return"大小未知";if(t<1024)return`${t} B`;const r=["KB","MB","GB","TB"];let a=t,s=-1;do a/=1024,s+=1;while(a>=1024&&s<r.length-1);return`${a.toFixed(a>=10?1:2)} ${r[s]}`}function cr({author:t,id:r}){const a=t.tags??[],[s,n]=l.useState(!1),d=l.useRef(null),i=l.useRef(null),c=l.useRef(null),m=l.useRef(null),b=a.map(o=>`${o.id}:${o.name}`).join("|");return l.useLayoutEffect(()=>{if(a.length===0){n(!1);return}const o=()=>{const p=d.current,I=i.current,y=c.current,k=m.current;if(!p||!I||!y||!k||p.offsetWidth===0)return;const L=y.getBoundingClientRect().width,P=k.getBoundingClientRect().width,A=Number.parseFloat(getComputedStyle(I).columnGap)||0,v=I.clientWidth-L-A,S=P>v+1;n(M=>M===S?M:S)};o();const f=new ResizeObserver(o);return[d.current,i.current,m.current].forEach(p=>{p&&f.observe(p)}),()=>f.disconnect()},[b,a.length]),e.jsxs("div",{id:r,ref:d,className:"author-hover-card",role:"dialog","aria-label":`${t.name} 的用户摘要`,children:[e.jsxs("div",{className:"author-card-head",children:[e.jsx("img",{src:t.avatar,alt:""}),e.jsxs("div",{className:"author-card-head-copy",children:[e.jsxs("div",{ref:i,className:"author-card-name-line","data-tags-overflow":s?"true":void 0,children:[e.jsx("strong",{ref:c,children:t.name}),e.jsx("div",{className:"author-card-tag-slot",children:e.jsx(ue,{size:"compact",tags:a})})]}),(t.stars>0||t.role)&&e.jsxs("span",{className:"author-card-status",children:["★".repeat(t.stars),t.stars>0&&t.role?" · ":"",t.role]})]})]}),s?e.jsx("div",{className:"author-card-tags-row",children:e.jsx(ue,{size:"compact",tags:a})}):null,t.medals?.length?e.jsx("div",{className:"author-card-medals",children:e.jsx(Ee,{medals:t.medals,profileName:t.name,variant:"compact"})}):null,e.jsx("div",{ref:m,className:"author-card-tag-width-measure","aria-hidden":"true",children:e.jsx(ue,{size:"compact",tags:a})}),e.jsxs("dl",{children:[e.jsxs("div",{children:[e.jsx("dt",{children:"主题"}),e.jsx("dd",{children:t.topics})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"回复"}),e.jsx("dd",{children:t.replies})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"签到"}),e.jsx("dd",{children:t.checkins})]})]}),e.jsxs("p",{children:["最近在线：",t.lastSeen]}),e.jsxs("a",{href:ne(t.name),children:["查看个人主页 ",e.jsx(At,{size:13})]})]})}function ur({author:t}){const r=t.tags??[],a=je(r),s=ne(t.name);return e.jsxs("aside",{className:"thread-author-profile","aria-label":`${t.name} 的资料`,children:[e.jsx("a",{"aria-label":`查看${t.name}的个人主页`,className:"thread-author-profile-avatar",href:s,children:e.jsx("img",{src:t.avatar,alt:""})}),e.jsx("div",{className:"thread-author-profile-identity",children:e.jsx("a",{href:s,children:t.name})}),(t.stars>0||t.role)&&e.jsxs("div",{className:"thread-author-profile-status",children:[t.stars>0&&e.jsx("span",{"aria-label":`${t.stars} 星`,children:"★".repeat(t.stars)}),t.role&&e.jsx("strong",{children:t.role})]}),e.jsx(Re,{tags:a}),e.jsx(Ee,{medals:t.medals??[],profileName:t.name,variant:"compact"}),e.jsxs("dl",{className:"thread-author-profile-stats",children:[e.jsxs("div",{children:[e.jsx("dt",{children:"主题"}),e.jsx("dd",{children:t.topics})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"回复"}),e.jsx("dd",{children:t.replies})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"签到"}),e.jsx("dd",{children:t.checkins})]})]}),e.jsxs("p",{className:"thread-author-profile-last-seen",children:[e.jsx("span",{children:"最近在线"}),e.jsx("strong",{children:t.lastSeen})]})]})}function pe(t){return t.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function dr(t){const r=window.getSelection()?.toString();r&&(t.preventDefault(),t.clipboardData.setData("text/plain",r))}function mr({articleAfterContent:t,author:r,avatarRail:a,className:s="",content:n,decorationImageSrc:d,editedAt:i,floor:c,floorIndex:m,id:b,inlineAvatar:o=!1,mainAfterContent:f,onCopy:p,publishedAt:I,showAuthorProfile:y}){const k=r.tags??[],L=je(k);return e.jsxs("article",{className:`thread-floor${y?" thread-floor-with-author-profile":""}${s?` ${s}`:""}`,"data-floor":c,id:b,onCopy:p,children:[d&&e.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:e.jsx("img",{alt:"",src:d})}),y?e.jsx(ur,{author:r}):!o&&a,e.jsxs("div",{className:"thread-floor-main",children:[e.jsxs("header",{className:"thread-floor-header",children:[!y&&o&&a,e.jsxs("div",{className:"thread-floor-author",children:[e.jsx("a",{href:ne(r.name),children:r.name}),e.jsx(Re,{tags:L})]}),e.jsxs("div",{className:"thread-floor-time",children:[e.jsx("time",{children:pe(I)}),i&&e.jsxs(e.Fragment,{children:[e.jsx("span",{children:"·"}),e.jsxs("time",{children:["编辑于 ",pe(i)]})]})]}),m]}),y?e.jsx("div",{className:"thread-floor-content",children:n}):n,f]}),t]})}function gr({canDelete:t,canEdit:r,canQuote:a,canReply:s,decorative:n=!1,deleting:d=!1,editHref:i="",onDelete:c,onQuote:m,onReply:b}){const o=n?-1:void 0,f=l.useRef(null);return e.jsxs("div",{"aria-hidden":n||void 0,className:`thread-floor-actions${n?" thread-floor-actions-decorative":""}`,children:[a&&e.jsxs("button",{onClick:p=>{const I=f.current?f.current.text:Se(p.currentTarget);f.current=null,m?.(I)},onPointerDown:p=>{p.button===0&&(f.current={text:Se(p.currentTarget)})},tabIndex:o,type:"button",children:[e.jsx(pt,{size:15}),"引用"]}),s&&e.jsxs("button",{onClick:b,tabIndex:o,type:"button",children:[e.jsx(Rt,{size:15}),"回复"]}),r&&(n?e.jsxs("button",{tabIndex:-1,type:"button",children:[e.jsx(Ie,{size:15}),"编辑"]}):e.jsxs("a",{href:i,children:[e.jsx(Ie,{size:15}),"编辑"]})),t&&e.jsxs("button",{"aria-busy":d||void 0,className:"floor-action-danger",disabled:!n&&d,onClick:n?void 0:p=>c?.(p.currentTarget),tabIndex:o,type:"button",children:[e.jsx(be,{size:15}),d?"删除中":"删除"]})]})}function Cr({canQuote:t,canReply:r,decorationImageSrc:a,editHref:s,floor:n,isActivityThread:d,isMainPost:i,inlineAvatar:c,showAuthorProfile:m,hideSignature:b,onDeleteFloor:o,onDeleteNestedReply:f,onIsolatedTextSelection:p,onQuote:I,onSubmitNestedReply:y,viewer:k}){const[L,P]=l.useState(!1),[A,v]=l.useState(null),[S,M]=l.useState([]),[E,q]=l.useState(""),[K,X]=l.useState(!1),[_,j]=l.useState([]),[B,C]=l.useState(""),[G,R]=l.useState(""),[H,Y]=l.useState(null),[V,Q]=l.useState(""),[Z,oe]=l.useState(!1),[D,g]=l.useState(void 0),[x,w]=l.useState(null),[T,O]=l.useState(!1),N=l.useRef(null),F=l.useRef(null),ee=l.useRef(null),h=l.useRef(null),U=l.useRef(null),te=l.useMemo(()=>[...n.nestedReplies??[],..._].filter(u=>!S.includes(u.id)),[S,n.nestedReplies,_]),ae=d&&!i&&/<\s*(?:s|strike)\b/i.test(n.contentHtml??""),re=`thread-floor-body${ae?" capubbs-activity-signup-canceled":""}`;l.useEffect(()=>()=>{F.current!==null&&window.clearTimeout(F.current)},[]),l.useEffect(()=>{if(!T)return;function u($){N.current?.contains($.target)||O(!1)}return document.addEventListener("pointerdown",u),()=>document.removeEventListener("pointerdown",u)},[T]);async function qe(){const u=`${window.location.origin}${window.location.pathname}${window.location.search}#${n.floor}`;await Tt(u)&&(P(!0),F.current!==null&&window.clearTimeout(F.current),F.current=window.setTimeout(()=>P(!1),1800))}const ye=(u,$,J,se)=>{U.current=J,w({imageIndex:$,images:u,onImageChange:se})};function De(u){x?.onImageChange?.(u),w(null),window.requestAnimationFrame(()=>U.current?.focus())}function xe(u=null){g(u),C(""),R(""),Q(""),window.requestAnimationFrame(()=>h.current?.focus())}function ve(){g(void 0),C(""),Q("")}async function Fe(u){u.preventDefault();const $=B.trim();if(!(!$||!k||Z)){oe(!0),Q("");try{const J=await y(n,D??null,$);j(se=>[...se,{author:k,canDelete:!0,content:$,id:J>0?String(J):`local-${n.id}-${Date.now()}`,publishedAt:hr(new Date),target:D??void 0}]),ve()}catch(J){Q(J instanceof Error?J.message:"楼中楼回复发布失败，请稍后重试。")}finally{oe(!1)}}}async function ze(u){Y(u.id),R("");try{await f(n,u),M($=>[...$,u.id]),j($=>$.filter(J=>J.id!==u.id)),v(null)}catch($){R($ instanceof Error?$.message:"楼中楼删除失败，请稍后重试。")}finally{Y(null)}}async function Ge(){if(!K){X(!0),q("");try{await o(n)}catch(u){q(u instanceof Error?u.message:"楼层删除失败，请稍后重试。"),X(!1)}}}function He(){v(null),q(""),R(""),window.requestAnimationFrame(()=>ee.current?.focus())}function Oe(){if(!A)return;const u=A;v(null),u.kind==="floor"?Ge():ze(u.reply)}const _e=e.jsxs("div",{className:`thread-avatar-rail${T?" thread-avatar-rail-open":""}`,ref:N,children:[e.jsx("button",{"aria-controls":`author-card-${n.floor}`,"aria-expanded":T,"aria-label":`查看${n.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>O(u=>!u),type:"button",children:e.jsx("img",{src:n.author.avatar,alt:""})}),e.jsx(cr,{author:n.author,id:`author-card-${n.floor}`})]}),Be=e.jsx(or,{attachments:n.attachments,bodyFallback:e.jsx("div",{className:re,children:n.paragraphs.map(u=>e.jsx("p",{children:u},u))}),bodyClassName:re,bodyHtml:n.contentHtml,floor:n.floor,isActivitySignupCanceled:ae,onImageOpen:ye,onIsolatedTextSelection:u=>p(n,u),signatureHtml:b?void 0:n.signatureHtml,signatureText:b?void 0:n.signature}),Ue=e.jsxs("button",{"aria-label":`复制第 ${n.floor} 楼链接`,className:"thread-floor-index",onClick:qe,title:"复制楼层链接",type:"button",children:["#",n.floor]}),Ye=e.jsxs(e.Fragment,{children:[e.jsx(gr,{canDelete:(!d||i)&&(n.canDelete??n.isOwn??!1),canEdit:(!d||i)&&!!n.isOwn,canQuote:t,canReply:r,deleting:K,editHref:s,onDelete:u=>{ee.current=u,q(""),v({kind:"floor"})},onQuote:u=>I(n,u),onReply:()=>xe()}),E&&e.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:E}),te.length>0&&e.jsx("section",{className:"nested-replies","aria-label":`${n.floor} 楼的楼中楼回复`,children:te.map(u=>e.jsxs("article",{children:[e.jsx("img",{src:u.author.avatar,alt:""}),e.jsxs("div",{className:"nested-reply-main",children:[e.jsxs("div",{className:"nested-reply-identity",children:[e.jsx("a",{className:"nested-reply-author",href:ne(u.author.name),children:u.author.name}),u.target&&e.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",e.jsx("a",{href:ne(u.target),children:u.target})]})]}),u.contentHtml?e.jsx(Ne,{className:"nested-reply-content",html:u.contentHtml,onImageOpen:ye,variant:"nested"}):e.jsx("p",{children:u.content}),e.jsxs("footer",{className:"nested-reply-footer",children:[e.jsx("time",{children:pe(u.publishedAt)}),r&&e.jsx("button",{onClick:()=>xe(u.author.name),type:"button",children:"回复"}),u.canDelete&&e.jsxs("button",{className:"nested-reply-delete",disabled:H===u.id,onClick:$=>{ee.current=$.currentTarget,R(""),v({kind:"nested",reply:u})},type:"button",children:[e.jsx(be,{size:12}),H===u.id?"删除中":"删除"]})]})]})]},u.id))}),G&&e.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:G}),D!==void 0&&r&&e.jsxs("form",{className:"nested-reply-composer",onSubmit:Fe,children:[e.jsx("textarea",{"aria-label":D?`回复 @${D}`:`回复第 ${n.floor} 楼`,maxLength:500,onChange:u=>{C(u.target.value),Q("")},placeholder:D?`回复 @${D}`:"写一条楼中楼回复",ref:h,rows:2,value:B}),e.jsxs("div",{className:"nested-reply-composer-actions",children:[e.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:Z,onClick:ve,type:"button",children:e.jsx(he,{size:15})}),e.jsxs("button",{className:"nested-reply-submit",disabled:!B.trim()||Z,type:"submit",children:[e.jsx(gt,{size:14}),Z?"发送中":"发送"]})]}),V&&e.jsx("p",{className:"nested-reply-error",role:"alert",children:V})]})]}),We=e.jsxs(e.Fragment,{children:[L&&e.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[e.jsx(ft,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),x&&e.jsx(Gt,{images:x.images,initialImageIndex:x.imageIndex,onImageChange:x.onImageChange,onClose:De}),A&&e.jsx(fr,{floor:n,isMainPost:i,onCancel:He,onConfirm:Oe,target:A})]});return e.jsx(mr,{articleAfterContent:We,author:n.author,avatarRail:_e,content:Be,decorationImageSrc:a,editedAt:n.editedAt,floor:n.floor,floorIndex:Ue,id:String(n.floor),inlineAvatar:c,mainAfterContent:Ye,onCopy:dr,publishedAt:n.publishedAt,showAuthorProfile:m})}function Se(t){const r=t.closest(".thread-floor")?.querySelector(".thread-floor-body");return ht(window.getSelection(),r??null)}function fr({floor:t,isMainPost:r,onCancel:a,onConfirm:s,target:n}){const d=n.kind==="nested"?n.reply:null,i=d?"删除楼中楼回复":r?"删除主楼":"删除回复",c=d?"":r?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",m=d?.author.name??t.author.name,b=d?`#${t.floor} · 楼中楼`:`#${t.floor}`,o=pr(d?.content||t.quoteText||t.paragraphs[0]||"");return l.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),l.useEffect(()=>{function f(p){p.key==="Escape"&&a()}return document.addEventListener("keydown",f),()=>document.removeEventListener("keydown",f)},[a]),e.jsx("div",{className:"thread-delete-dialog-backdrop",onMouseDown:f=>{f.currentTarget===f.target&&a()},role:"presentation",children:e.jsxs("section",{"aria-describedby":c?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[e.jsxs("header",{children:[e.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:e.jsx(St,{size:19})}),e.jsx("div",{children:e.jsx("h2",{id:"thread-delete-dialog-title",children:i})}),e.jsx("button",{"aria-label":"关闭删除确认",onClick:a,type:"button",children:e.jsx(he,{size:18})})]}),e.jsxs("div",{className:"thread-delete-dialog-body",children:[c&&e.jsx("p",{id:"thread-delete-dialog-description",children:c}),e.jsxs("div",{className:"thread-delete-dialog-target",children:[e.jsxs("span",{children:[m," · ",b]}),e.jsx("p",{children:o||"此回复没有可预览的文字内容。"})]})]}),e.jsxs("footer",{children:[e.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:a,type:"button",children:"取消"}),e.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:s,type:"button",children:[e.jsx(be,{size:15}),"确认删除"]})]})]})})}function pr(t){const r=t.replace(/\s+/g," ").trim();return r.length>100?`${r.slice(0,100).trimEnd()}…`:r}function hr(t){const r=a=>String(a).padStart(2,"0");return`${t.getFullYear()}-${r(t.getMonth()+1)}-${r(t.getDate())} ${r(t.getHours())}:${r(t.getMinutes())}:${r(t.getSeconds())}`}export{jt as P,or as T,mr as a,gr as b,Cr as c,Tt as w};
