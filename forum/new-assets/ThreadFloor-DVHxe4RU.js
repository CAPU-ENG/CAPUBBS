import{q as $e,r as i,$ as nt,bq as ot,j as t,a0 as it,X as Ae,d as st,e as lt,br as ct,bs as ut,bt as dt,bu as mt,bv as gt,aM as ft,bw as pt,aS as ht,aG as bt,bx as yt,by as xt,bz as vt,bA as wt,bB as It,a4 as At,V as se,z as St,a6 as kt,b7 as Rt,bC as Ct}from"./index-BP4tMapo.js";import{e as jt,d as Ne,m as ge,s as Et,f as Nt,r as Tt,h as qt,a as Fe,P as ze}from"./RichTextEditor.gallery-DlP2Wt22.js";import{P as Lt}from"./plus-CjdgZfaA.js";import{R as Mt}from"./rotate-ccw-BPoYoSJO.js";import{D as De,T as fe}from"./TagBadge-BEjfnCVX.js";import{T as Se}from"./trash-2-C7B7qQOK.js";import{P as Te}from"./pencil-Mlh7yLJA.js";import{E as Pt}from"./external-link-BkgsDxYJ.js";import{T as $t}from"./triangle-alert-DZlu284s.js";const Ft=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],zt=$e("paperclip",Ft);const Dt=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],Ot=$e("reply",Dt);async function Ht(e){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),!0}catch{}const r=document.createElement("textarea");r.value=e,r.setAttribute("readonly",""),r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select();try{return document.execCommand("copy")}finally{r.remove()}}const Gt={black:0,darkgray:169,darkgrey:169,dimgray:105,dimgrey:105,gainsboro:220,gray:128,grey:128,lightgray:211,lightgrey:211,silver:192,white:255,whitesmoke:245},pe="data-capubbs-original-grayscale-color-attr",he="data-capubbs-original-grayscale-style-color";function Ut(e){const r=String(e??"").trim().toLowerCase().replace(/^['"]|['"]$/g,""),a=r.replace(/\s+/g,""),o=Gt[a];if(typeof o=="number")return{alpha:1,channel:o};const n=a.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);if(n){const s=n[1].length<=4?n[1].split("").map(S=>`${S}${S}`).join(""):n[1],f=Number.parseInt(s.slice(0,2),16),h=Number.parseInt(s.slice(2,4),16),I=Number.parseInt(s.slice(4,6),16),x=s.length===8?Number.parseInt(s.slice(6,8),16)/255:1;return f===h&&h===I?{alpha:x,channel:f}:null}const d=r.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*(?:,|\/)\s*([01](?:\.\d+)?|\.\d+|100%|\d{1,3}(?:\.\d+)?%))?\s*\)$/);if(!d)return null;const l=be(d[1]),c=be(d[2]),m=be(d[3]),y=Yt(d[4]);return l===null||c===null||m===null||y===null?null:l===c&&c===m?{alpha:y,channel:l}:null}function Oe(e,r=!0){const a=Ut(e);if(!a)return null;const o=255-a.channel;if(r&&a.alpha<1)return`rgba(${o}, ${o}, ${o}, ${Vt(a.alpha)})`;const n=o.toString(16).padStart(2,"0");return`#${n}${n}${n}`}function _t(e,r){[...e.matches("[color], [style]")?[e]:[],...Array.from(e.querySelectorAll("[color], [style]"))].forEach(o=>{Bt(o,r),o instanceof HTMLElement&&Wt(o,r)})}function Bt(e,r){const a=e.getAttribute(pe);if(r==="light"){if(a===null)return;e.setAttribute("color",a),e.removeAttribute(pe);return}const o=a??e.getAttribute("color"),n=Oe(o,!1);!n||o===null||(a===null&&e.setAttribute(pe,o),e.getAttribute("color")!==n&&e.setAttribute("color",n))}function Wt(e,r){const a=e.getAttribute(he);if(r==="light"){if(a===null)return;e.style.setProperty("color",a,e.style.getPropertyPriority("color")),e.removeAttribute(he);return}const o=a??e.style.getPropertyValue("color"),n=Oe(o);!n||!o||(a===null&&e.setAttribute(he,o),e.style.getPropertyValue("color")!==n&&e.style.setProperty("color",n,e.style.getPropertyPriority("color")))}function be(e){const r=e.endsWith("%"),a=Number(r?e.slice(0,-1):e);return Number.isFinite(a)?r?a>=0&&a<=100?Math.round(a*2.55):null:a>=0&&a<=255?Math.round(a):null:null}function Yt(e){if(e===void 0)return 1;const r=e.endsWith("%"),a=Number(r?e.slice(0,-1):e);return Number.isFinite(a)?r?a>=0&&a<=100?a/100:null:a>=0&&a<=1?a:null:null}function Vt(e){return Number(e.toFixed(3))}function He({className:e="",html:r,onImageOpen:a,variant:o}){const n=i.useRef(null),{theme:d}=nt(),l=i.useMemo(()=>({__html:r}),[r]);if(i.useLayoutEffect(()=>{const s=n.current;s&&(jt(s),_t(s,d))},[r,d]),i.useLayoutEffect(()=>{const s=n.current;if(s)return ot(s)},[r]),i.useEffect(()=>{const s=n.current;if(!s)return;const f=Array.from(s.querySelectorAll("img")),h=x=>{x.dataset.capubbsImageLoaded="true"},I=f.map(x=>{if(x.complete)return h(x),null;const S=()=>h(x);return x.addEventListener("load",S,{once:!0}),x.addEventListener("error",S,{once:!0}),{handleLoad:S,image:x}});return()=>{I.forEach(x=>{x&&(x.image.removeEventListener("load",x.handleLoad),x.image.removeEventListener("error",x.handleLoad))})}},[r]),!r)return null;function c(s,f){if(!a||!(s instanceof Element))return;const h=s.closest("img");if(!(h instanceof HTMLImageElement))return;const I=h.closest(".capubbs-gallery"),x=I?Array.from(I.querySelectorAll('[data-capubbs-gallery-slide="true"] img')):Array.from(f.querySelectorAll("img")).filter(A=>!A.closest(".capubbs-gallery")),S=x.indexOf(h);if(S<0)return;const F=x.map(A=>Jt(A,f)),q=x.map((A,N)=>{const T=F[N];return{alt:A.alt.trim(),element:A,src:A.currentSrc||A.src,...T?{galleryId:T.galleryId,galleryIndex:T.galleryIndex}:{}}});a(q,S,h,A=>{const N=F[A];N&&Et(N.gallery,N.galleryIndex)})}function m(s){const f=Ne(s.target);if(f&&s.target instanceof Element){s.preventDefault(),s.stopPropagation(),ge(s.target,f);return}!a||!(s.target instanceof HTMLImageElement)||(s.preventDefault(),c(s.target,s.currentTarget))}function y(s){const f=Ne(s.target);if(f&&["Enter"," "].includes(s.key)&&s.target instanceof Element){s.preventDefault(),ge(s.target,f);return}if(["ArrowLeft","ArrowRight"].includes(s.key)&&s.target instanceof Element&&s.target.closest(".capubbs-gallery")){s.preventDefault(),ge(s.target,s.key==="ArrowLeft"?"prev":"next");return}!a||!(s.target instanceof HTMLImageElement)||!["Enter"," "].includes(s.key)||(s.preventDefault(),c(s.target,s.currentTarget))}return t.jsx("div",{ref:n,className:`forum-markup forum-markup-${o} ${e}`.trim(),"data-forum-markup":o,dangerouslySetInnerHTML:l,onClick:m,onKeyDown:y})}function Jt(e,r){const a=e.closest(".capubbs-gallery");if(!a||!r.contains(a))return null;const n=Array.from(r.querySelectorAll(".capubbs-gallery")).indexOf(a),l=Array.from(a.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(e);return n>=0&&l>=0?{gallery:a,galleryId:n,galleryIndex:l}:null}const U=1,Ge=4,ce=.25;function Kt(e){return Math.min(Ge,Math.max(U,e))}function ye(e){const[r,a]=[...e.values()];return!r||!a?null:Math.hypot(a.x-r.x,a.y-r.y)}function Xt({images:e,initialImageIndex:r,onImageChange:a,onClose:o}){const n=Math.min(Math.max(0,r),Math.max(0,e.length-1)),[d,l]=i.useState(n),[c,m]=i.useState(U),[y,s]=i.useState({x:0,y:0}),[f,h]=i.useState(!1),I=i.useRef(null),x=i.useRef(null),S=i.useRef(null),F=i.useRef(null),q=i.useRef(n),C=i.useRef(U),A=i.useRef({x:0,y:0}),N=i.useRef(null),T=i.useRef(!1),E=i.useRef(new Map),H=i.useRef(null),z=i.useRef(U),X=i.useRef(a),J=i.useRef(o);X.current=a,J.current=o;function Q(u,p=C.current){const v=I.current,L=S.current;if(!v||!L||p<=U)return{x:0,y:0};const W=Math.max(0,(L.clientWidth*p-v.clientWidth)/2),M=Math.max(0,(L.clientHeight*p-v.clientHeight)/2);return{x:Math.min(W,Math.max(-W,u.x)),y:Math.min(M,Math.max(-M,u.y))}}function _(u,p=C.current){const v=Q(u,p);A.current=v,s(v)}function B(u){const p=Math.round(Kt(u)*100)/100;C.current=p,m(p),_(A.current,p)}function Z(){C.current=U,A.current={x:0,y:0},m(U),s({x:0,y:0})}function k(u){const p=Math.min(Math.max(0,u),e.length-1);p!==q.current&&(q.current=p,l(p),Z(),X.current?.(p))}function D(){J.current(q.current)}i.useEffect(()=>{const u=document.body.style.overflow,p=document.activeElement,v=I.current;document.body.style.overflow="hidden",F.current?.focus();function L(b){if(b.key==="Escape"){b.preventDefault(),D();return}if(b.key==="ArrowLeft"){b.preventDefault(),b.stopPropagation(),k(q.current-1);return}if(b.key==="ArrowRight"){b.preventDefault(),b.stopPropagation(),k(q.current+1);return}if(b.key==="+"||b.key==="="){b.preventDefault(),b.stopPropagation(),B(C.current+ce);return}if(b.key==="-"){b.preventDefault(),b.stopPropagation(),B(C.current-ce);return}if(b.key==="0"){b.preventDefault(),b.stopPropagation(),Z();return}if(b.key==="Tab"){const V=x.current?.querySelectorAll("button:not(:disabled)");if(!V?.length)return;const ae=V[0],ie=V[V.length-1],ne=document.activeElement;if(b.shiftKey&&ne===ae){b.preventDefault(),ie.focus();return}if(!b.shiftKey&&ne===ie){b.preventDefault(),ae.focus();return}x.current?.contains(ne)||(b.preventDefault(),ae.focus())}}function W(b){if(b.preventDefault(),b.stopPropagation(),b.deltaY===0)return;const V=b.ctrlKey?.01:.002;B(C.current*Math.exp(-b.deltaY*V))}function M(b){b.preventDefault(),b.stopPropagation(),z.current=C.current}function G(b){if(b.preventDefault(),b.stopPropagation(),E.current.size>=2)return;const V=b.scale;typeof V=="number"&&B(z.current*V)}function re(){_(A.current,C.current)}return document.addEventListener("keydown",L,{capture:!0}),window.addEventListener("resize",re),v?.addEventListener("wheel",W,{passive:!1}),v?.addEventListener("gesturestart",M,{passive:!1}),v?.addEventListener("gesturechange",G,{passive:!1}),v?.addEventListener("gestureend",G,{passive:!1}),()=>{document.removeEventListener("keydown",L,{capture:!0}),window.removeEventListener("resize",re),v?.removeEventListener("wheel",W),v?.removeEventListener("gesturestart",M),v?.removeEventListener("gesturechange",G),v?.removeEventListener("gestureend",G),document.body.style.overflow=u,p instanceof HTMLElement&&p.focus()}},[]);function ee(u,p,v){N.current={pointerId:u,startX:p,startY:v,originX:A.current.x,originY:A.current.y},h(!0)}function w(u){if(u.target instanceof Element&&u.target.closest("button, .thread-image-lightbox-controls"))return;const p=u.pointerType==="touch",v=u.pointerType==="mouse"&&u.button===0;if(!(!p&&!v)&&(T.current=!1,!(!p&&C.current<=U))){if(u.preventDefault(),u.currentTarget.setPointerCapture(u.pointerId),p&&(E.current.set(u.pointerId,{x:u.clientX,y:u.clientY}),E.current.size===2)){H.current=ye(E.current),N.current=null,h(!1);return}C.current>U&&ee(u.pointerId,u.clientX,u.clientY)}}function Y(u){const p=E.current.has(u.pointerId),v=N.current;if(!p&&v?.pointerId!==u.pointerId)return;if(u.preventDefault(),u.stopPropagation(),p&&E.current.set(u.pointerId,{x:u.clientX,y:u.clientY}),E.current.size===2){const M=ye(E.current),G=H.current;if(!M||!G){H.current=M;return}Math.abs(M-G)>1&&(T.current=!0),B(C.current*(M/G)),H.current=M;return}if(!v||C.current<=U)return;const L=u.clientX-v.startX,W=u.clientY-v.startY;Math.hypot(L,W)>3&&(T.current=!0),_({x:v.originX+L,y:v.originY+W})}function j(u){const p=E.current.delete(u.pointerId),v=N.current?.pointerId===u.pointerId;if(!(!p&&!v)){if(H.current=E.current.size===2?ye(E.current):null,E.current.size===1&&C.current>U){const[L]=E.current.entries();if(L){const[W,M]=L;ee(W,M.x,M.y)}}else N.current=null,h(!1);u.currentTarget.hasPointerCapture(u.pointerId)&&u.currentTarget.releasePointerCapture(u.pointerId)}}const O=Math.round(c*100),R=e[d]??e[0];return R?it.createPortal(t.jsx("div",{className:"thread-image-lightbox-backdrop","data-can-pan":c>U,"data-dragging":f,onClick:u=>{if(T.current)return;const p=u.target;p instanceof Element&&p.closest("img, button, .thread-image-lightbox-controls")||D()},onPointerCancel:j,onPointerDown:w,onPointerMove:Y,onPointerUp:j,ref:I,role:"presentation",children:t.jsxs("figure",{"aria-label":R.alt?`图片预览：${R.alt}（${d+1}/${e.length}）`:`图片预览（${d+1}/${e.length}）`,"aria-modal":"true",className:"thread-image-lightbox",ref:x,role:"dialog",children:[t.jsx("button",{"aria-label":"关闭图片预览",className:"thread-image-lightbox-close",onClick:D,ref:F,type:"button",children:t.jsx(Ae,{size:20})}),e.length>1&&t.jsxs(t.Fragment,{children:[t.jsx("button",{"aria-label":"上一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-prev",disabled:d===0,onClick:()=>k(d-1),title:"上一张（←）",type:"button",children:t.jsx(st,{size:28})}),t.jsx("button",{"aria-label":"下一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-next",disabled:d===e.length-1,onClick:()=>k(d+1),title:"下一张（→）",type:"button",children:t.jsx(lt,{size:28})})]}),t.jsx(Qt,{image:R,imageRef:S,onReady:()=>_(A.current,C.current),transform:`translate3d(${y.x}px, ${y.y}px, 0) scale(${c})`}),R.alt&&t.jsx("figcaption",{children:R.alt}),t.jsxs("div",{"aria-label":"图片缩放",className:"thread-image-lightbox-controls",role:"toolbar",children:[t.jsx("button",{"aria-label":"缩小图片",disabled:c<=U,onClick:()=>B(c-ce),title:"缩小（-）",type:"button",children:t.jsx(Nt,{size:18})}),t.jsxs("output",{"aria-label":"当前缩放比例","aria-live":"polite",children:[O,"%"]}),t.jsx("button",{"aria-label":"放大图片",disabled:c>=Ge,onClick:()=>B(c+ce),title:"放大（+）",type:"button",children:t.jsx(Lt,{size:18})}),t.jsx("button",{"aria-label":"恢复原始大小",disabled:c===U,onClick:Z,title:"恢复原始大小（0）",type:"button",children:t.jsx(Mt,{size:17})})]})]})}),document.body):null}function Qt({image:e,imageRef:r,onReady:a,transform:o}){const n=i.useRef(null),d=i.useRef(a);return d.current=a,i.useLayoutEffect(()=>{const l=e.element,c=n.current,m=l?.parentNode;if(!l||!c?.parentNode||!m)return;const y=l.ownerDocument.createComment("capubbs-lightbox-image"),s=l.getAttribute("style"),f=l.getAttribute("draggable");m.insertBefore(y,l),c.parentNode.insertBefore(l,c),l.draggable=!1,r.current=l;const h=()=>d.current();return l.addEventListener("load",h),l.complete&&h(),()=>{l.removeEventListener("load",h),s===null?l.removeAttribute("style"):l.setAttribute("style",s),f===null?l.removeAttribute("draggable"):l.setAttribute("draggable",f),y.parentNode?.insertBefore(l,y),y.remove(),r.current===l&&(r.current=null)}},[e,r]),i.useLayoutEffect(()=>{e.element&&(e.element.style.transform=o)},[e,o]),e.element?t.jsx("span",{hidden:!0,ref:n}):t.jsx("img",{alt:e.alt,draggable:"false",onLoad:a,ref:r,src:e.src,style:{transform:o}})}const Zt=':root{--surface: #fffefa;--surface-raised: #ffffff;--surface-soft: #f6f8f4;--text: #20231f;--text-strong: #111411;--text-muted: #687068;--text-faint: #919991;--line: #e1e6df;--line-strong: #cdd5cc;--brand: #236b4c;--brand-strong: #174f38;--danger: #b8473f}:root.dark{--surface: #171d19;--surface-raised: #1c241f;--surface-soft: #1f2822;--text: #dde5de;--text-strong: #f6faf6;--text-muted: #a0aca2;--text-faint: #748078;--line: #2c362f;--line-strong: #3c493f;--brand: #69b98d;--brand-strong: #8bcca6;--danger: #ef8178}::-moz-selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}::selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentcolor}blockquote,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}a{color:inherit;text-decoration:inherit}button{margin:0;padding:0;background-color:transparent;color:inherit;font:inherit;letter-spacing:inherit;text-transform:none}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}.capubbs-html-frame-root iframe{background-color:transparent!important}img,video{max-width:100%;height:auto}table{border-color:inherit;border-collapse:collapse;text-indent:0}.capubbs-activity-signup-canceled,.capubbs-activity-signup-canceled *{color:var(--danger)!important;text-decoration-color:var(--danger)!important;text-decoration-line:line-through!important;text-decoration-thickness:2px!important}.forum-markup>:first-child{margin-top:0}.forum-markup>:last-child{margin-bottom:0}.forum-markup p,.forum-markup div{margin:0}.forum-markup-floor p{margin:0 0 .75em}.forum-markup-floor>div+div{margin-top:.55em}.forum-markup a{color:var(--brand-strong);font-weight:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.16em}.forum-markup .forum-mention{text-decoration:none}.forum-markup blockquote{margin:0 0 0 2em;border:0;padding:0;background:transparent;color:inherit}.forum-markup blockquote.forum-quote,.forum-markup .forum-legacy-quote,.forum-markup blockquote.capubbs-floor-quote{margin:.8em 0;border-left:3px solid color-mix(in srgb,var(--brand) 38%,var(--line));padding:.55em .75em;background:var(--surface-soft);color:var(--text-muted)}.forum-markup .capubbs-floor-quote-jump{margin-left:.75em}.forum-markup .forum-legacy-quote-content{margin:0}.forum-markup h1,.forum-markup h2,.forum-markup h3,.forum-markup h4,.forum-markup h5,.forum-markup h6{margin:.9rem 0 .45rem;color:var(--brand-strong);font-weight:800;line-height:1.35}.forum-markup h1{font-size:1.45rem}.forum-markup h2{font-size:1.25rem}.forum-markup h3{font-size:1.1rem}.forum-markup h4,.forum-markup h5,.forum-markup h6{font-size:1em}.forum-markup ul,.forum-markup ol{margin:.65em 0;padding-left:1.45em}.forum-markup ul{list-style:disc}.forum-markup ol{list-style:decimal}.forum-markup ol.capubbs-ordered-list-alpha{list-style-type:lower-alpha}.forum-markup ol.capubbs-ordered-list-roman{list-style-type:lower-roman}.forum-markup pre{max-width:100%;overflow-x:auto;margin:.75em 0;border-radius:2px;padding:.75em;background:#182531;color:#f8fafc;white-space:pre-wrap}.forum-markup code,.forum-markup kbd{border-radius:2px;padding:.08em .25em;background:color-mix(in srgb,var(--surface-soft) 75%,var(--line));font-family:SFMono-Regular,Cascadia Code,Consolas,monospace;font-size:.9em}.forum-markup pre code{padding:0;background:transparent;color:inherit}.forum-markup font[size="1"]{font-size:11px}.forum-markup font[size="2"]{font-size:13px}.forum-markup font[size="3"]{font-size:15px}.forum-markup font[size="4"]{font-size:17px}.forum-markup font[size="5"]{font-size:19px}.forum-markup font[size="6"]{font-size:21px}.forum-markup font[size="7"]{font-size:23px}.forum-markup hr{margin:.9em 0;border:0;border-top:1px solid var(--line-strong)}.forum-markup img{display:inline-block;height:auto;max-width:100%;vertical-align:middle}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){color:transparent;font-size:0;background-color:color-mix(in srgb,var(--surface-soft) 82%,var(--line));background-image:linear-gradient(105deg,transparent 20%,color-mix(in srgb,var(--surface-raised) 70%,transparent) 45%,transparent 70%);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}.forum-markup img[role=button]{cursor:zoom-in}.forum-markup img[role=button]:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse}.forum-markup td,.forum-markup th{border:1px solid var(--line);padding:.35em .5em}.forum-markup-signature{color:#999;font-family:monospace;font-size:14px;line-height:1.6;overflow-wrap:anywhere}:root.dark .forum-markup-signature{color:#666}.forum-markup .capubbs-gallery{position:relative;display:block;width:100%;margin:.9rem 0;overflow:hidden;border:1px solid var(--line);border-radius:2px;background:transparent;color:var(--text)}.forum-markup .capubbs-gallery:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup .capubbs-gallery-header{position:relative;display:flex;min-height:44px;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:9px 12px;border-bottom:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-title{width:100%;min-width:0;margin:0;color:var(--text-strong);font-size:.82rem;font-weight:760;line-height:1.4;text-align:center}.forum-markup .capubbs-gallery-stage{position:relative;display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide{display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-slide>img{display:block;width:100%;height:var(--capubbs-gallery-image-height, clamp(280px, 52vw, 560px));max-width:none;margin:0 auto;border-radius:0;-o-object-fit:contain;object-fit:contain}.forum-markup .capubbs-gallery-caption{display:block;margin:0;color:var(--text-muted);font-size:.78rem;line-height:1.55;text-align:center}.forum-markup .capubbs-gallery-caption[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-footer{position:relative;display:flex;min-height:44px;align-items:center;justify-content:center;margin:0;padding:9px 12px;border-top:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-captions{width:100%;min-width:0;margin:0;padding-inline:48px;text-align:center}.forum-markup .capubbs-gallery-count{position:absolute;top:50%;right:12px;color:var(--text-faint);font-size:.72rem;font-variant-numeric:tabular-nums;font-weight:760;line-height:1.25;transform:translateY(-50%)}.forum-markup .capubbs-gallery-count[data-capubbs-gallery-current]:before{content:attr(data-capubbs-gallery-current) "/" attr(data-capubbs-gallery-total)}.forum-markup .capubbs-gallery-nav{position:absolute;z-index:4;top:50%;display:grid;width:36px;height:48px;place-items:center;padding:0;transform:translateY(-50%);border:1px solid rgb(255 255 255 / .25);border-radius:2px;background:#00000080;color:#fff;cursor:pointer;transition:.15s ease}.forum-markup .capubbs-gallery-nav:hover{background:#000000b8}.forum-markup .capubbs-gallery-nav:focus-visible{outline:2px solid #fff;outline-offset:2px}.forum-markup .capubbs-gallery-nav:before{font-family:Arial,sans-serif;font-size:2rem;font-weight:300;line-height:1}.forum-markup .capubbs-gallery-nav-prev:before{content:"‹"}.forum-markup .capubbs-gallery-nav-next:before{content:"›"}.forum-markup .capubbs-gallery-nav-prev{left:10px}.forum-markup .capubbs-gallery-nav-next{right:10px}@keyframes capubbs-image-loading{0%{background-position:120% 0}to{background-position:-80% 0}}@media(max-width:640px){.forum-markup .capubbs-gallery-slide>img{height:var(--capubbs-gallery-image-height, min(72vw, 420px))}.forum-markup .capubbs-gallery-nav{width:32px;height:42px}.forum-markup .capubbs-gallery-nav-prev{left:7px}.forum-markup .capubbs-gallery-nav-next{right:7px}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){animation:none}}',er="/bbs/new-assets/threadHtmlBootstrap-x4mBAuLM.html";function ke(e,r){try{const a=new URL(e,r);return!["http:","https:"].includes(a.protocol)||a.hostname!=="music.163.com"||a.pathname!=="/outchain/player"||a.username||a.password||a.port?null:(a.protocol="https:",a.href)}catch{return null}}function tr(e){if(!e)return{left:0,top:0};const r=window.getComputedStyle(e);return{left:e.offsetLeft+e.clientLeft+(Number.parseFloat(r.paddingLeft)||0),top:e.offsetTop+e.clientTop+(Number.parseFloat(r.paddingTop)||0)}}function rr(e){if(!e||typeof e!="object")return!1;const r=e;return typeof r.id=="string"&&typeof r.src=="string"&&ke(r.src,"https://music.163.com")===r.src&&["left","top","width","height"].every(a=>{const o=r[a];return typeof o=="number"&&Number.isFinite(o)&&Math.abs(o)<=1e5})&&r.width>0&&r.height>0}const qe=64*1024*1024,le=new Map,de=new Map,oe=new Map;let ve=0,we=0,xe=!1;function te(){xe||!oe.size||(xe=!0,setTimeout(()=>{xe=!1;const e=[];oe.forEach((r,a)=>{const o=r.priorities.map(n=>n());if(o.every(n=>n===null)){oe.delete(a),le.delete(a),r.reject(new DOMException("图片所在内容已卸载","AbortError"));return}e.push({source:a,request:r,priority:o.includes("high")?"high":"low"})}),e.sort((r,a)=>+(a.priority==="high")-+(r.priority==="high"));for(const{source:r,request:a,priority:o}of e){if(ve>=6)break;o==="low"&&we>=2||(oe.delete(r),ve+=1,o==="low"&&(we+=1),a.start(o))}},0))}function Ue(e){return new URL(e,new URL("/bbs/content/",window.location.origin)).href}function ar(e,r=()=>"high"){const a=Ue(e),o=new URL(a);if(o.origin!==window.location.origin||!o.pathname.startsWith("/bbs/images/")&&!o.pathname.startsWith("/bbsimg/"))return Promise.reject(new Error("仅代理论坛图片目录"));const n=le.get(a);if(n)return oe.get(a)?.priorities.push(r),te(),n;const d=new Promise((l,c)=>{oe.set(a,{priorities:[r],reject:c,start:m=>{nr(a,m).then(l,c).finally(()=>{ve-=1,m==="low"&&(we-=1),te()})}})});return le.set(a,d),te(),d}function nr(e,r){return fetch(e,{credentials:"same-origin",referrerPolicy:"no-referrer",priority:r}).then(async a=>{if(!a.ok)throw new Error(`图片加载失败：${a.status}`);if(!(a.headers.get("content-type")?.toLowerCase()??"").startsWith("image/"))throw new Error("图片响应类型无效");const n=Number.parseInt(a.headers.get("content-length")??"",10);if(Number.isFinite(n)&&n>qe)throw new Error("图片大小超出限制");const d=await a.blob();if(d.size>qe)throw new Error("图片大小超出限制");const l={blob:d,objectUrl:URL.createObjectURL(d),sourceUrl:e};return de.set(e,l),l}).catch(a=>{throw le.delete(e),a})}function or(e){try{return de.get(Ue(e))?.objectUrl}catch{return}}typeof window<"u"&&(window.addEventListener("scroll",te,{passive:!0}),window.addEventListener("resize",te),window.addEventListener("pagehide",e=>{e.persisted||(de.forEach(r=>URL.revokeObjectURL(r.objectUrl)),de.clear(),le.clear())}));function ir(e,r,a){return r.some(o=>o.right>o.left&&o.bottom>o.top&&e.top+o.bottom>Math.max(0,e.top)&&e.top+o.top<Math.min(a.height,e.bottom)&&e.left+o.right>Math.max(0,e.left)&&e.left+o.left<Math.min(a.width,e.right))?"high":"low"}const sr=28,lr=64,cr=5e4,ur=30,_e=30,$="capubbs-thread-html-frame",Be=new URL("/bbs/lib/jquery.min.js",window.location.origin).href,dr=wr(Zt),mr=/\son[a-z][\w:-]*\s*=/i;let ue=null;function Le({className:e="",floor:r,html:a,isActivitySignupCanceled:o=!1,onImageOpen:n,onIsolatedTextSelection:d,variant:l}){const c=i.useMemo(()=>l==="signature"?Tt(a):a,[a,l]),m=fr(c,l==="signature"),y=ct(m),s=i.useMemo(()=>y?null:ut(m,{normalizeLegacyLineBreaks:l==="signature"}),[m,y,l]),f=i.useMemo(()=>dt(m),[m]);return!y&&s!==null?t.jsx(He,{className:e,html:s,onImageOpen:n,variant:l}):t.jsx(gr,{className:e,floor:r,html:f,isActivitySignupCanceled:o,onImageOpen:n,onTextSelection:d,variant:l})}function gr({className:e,floor:r,html:a,isActivitySignupCanceled:o,onImageOpen:n,onTextSelection:d,variant:l}){const c=i.useRef(null),m=i.useRef(`${l}-${r}-${Math.random().toString(36).slice(2)}`),y=i.useRef(n);y.current=n;const s=i.useRef(d);s.current=d;const f=l==="signature"?sr:lr,h=!!n,[I,x]=i.useState(null),[S,F]=i.useState(null),q=Ar(),C=i.useRef(q),A=gt(),N=l==="signature"?14:A,T=i.useMemo(()=>yr(br(a)),[a]),E=T.includes('type="text/capubbs-user-script"')||mr.test(T),H=i.useMemo(()=>pr({canOpenImages:h,frameId:m.current,needsJquery:E,html:T,isActivitySignupCanceled:o,isDarkTheme:C.current,fontSize:N,variant:l}),[h,T,N,o,E,l]),z=i.useMemo(()=>Math.random().toString(36).slice(2),[H]),X=i.useMemo(()=>`${er}#${new URLSearchParams({frameId:m.current,token:z})}`,[z]),J=i.useCallback(()=>{c.current?.contentWindow?.postMessage({source:$,type:"document-response",frameId:m.current,token:z,html:H},"*")},[z,H]),Q=i.useCallback(()=>{c.current?.contentWindow?.postMessage({frameId:m.current,source:$,theme:q?"dark":"light",type:"theme"},"*")},[q]),_=i.useCallback((k=c.current?.contentWindow)=>{!E||!k||Me().then(D=>{c.current?.contentWindow===k&&k.postMessage({frameId:m.current,jquerySource:D,source:$,type:"jquery-response"},"*")})},[E]),B=i.useCallback(()=>{J(),Q(),_()},[J,_,Q]);i.useEffect(()=>{x(null)},[X]),i.useEffect(()=>{Q()},[Q]),i.useEffect(()=>{E&&Me()},[E]),i.useLayoutEffect(()=>{te()},[I]),i.useLayoutEffect(()=>{let k=!0;const D=new Map;function ee(w){const Y=c.current?.contentWindow;if(!(!Y||w.source!==Y||!Ir(w.data))&&w.data.frameId===m.current){if(w.data.type==="netease-layout"){F({token:z,players:w.data.players});return}if(w.data.type==="document-request"){w.data.token===z&&J();return}if(w.data.type==="jquery-request"){_(Y);return}if(w.data.type==="image-resource-layout"){D.has(w.data.requestId)&&(D.set(w.data.requestId,w.data.bounds),te());return}if(w.data.type==="image-resource-request"){const j=Y,O=w.data.requestId;D.set(O,w.data.bounds);const R=()=>{const u=c.current;return!k||!u||u.contentWindow!==j?null:ir(u.getBoundingClientRect(),D.get(O)??[],{width:window.innerWidth,height:window.innerHeight})};ar(w.data.url,R).then(u=>{!k||c.current?.contentWindow!==j||j.postMessage({blob:u.blob,priority:R(),frameId:m.current,requestId:w.data.requestId,source:$,type:"image-resource-response"},"*")}).catch(()=>{!k||c.current?.contentWindow!==j||j.postMessage({priority:R(),frameId:m.current,requestId:w.data.requestId,source:$,type:"image-resource-error"},"*")}).finally(()=>D.delete(O));return}if(w.data.type==="anchor"){const j=c.current;if(!j)return;const O=window.getComputedStyle(document.documentElement),R=Number.parseFloat(O.getPropertyValue("--topbar-height"))||0,u=window.scrollY+j.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,u+w.data.offsetTop-R-16)});return}if(w.data.type==="navigate"){const j=ft(w.data.url,Re());if(!j)return;window.history.pushState(null,"",j),window.dispatchEvent(new Event(pt));const O=new URL(j,window.location.origin);O.hash?window.requestAnimationFrame(()=>{const R=decodeURIComponent(O.hash.slice(1)),u=ht(`#${R}`);(u?bt(u):document.getElementById(R))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(w.data.type==="image-open"){const j=c.current;if(!j)return;const O=Array.from(j.contentDocument?.querySelectorAll("img")??[]),R=w.data.images.map(p=>({...p,element:typeof p.elementIndex=="number"?O[p.elementIndex]:void 0,src:or(p.src)??p.src})),u=p=>{const v=R[p];!v||typeof v.galleryId!="number"||!Number.isSafeInteger(v.galleryIndex)||j.contentWindow?.postMessage({frameId:m.current,galleryId:v.galleryId,galleryIndex:v.galleryIndex,source:$,type:"gallery-select"},"*")};y.current?.(R,w.data.imageIndex,j,u);return}if(w.data.type==="selection"){w.data.text&&window.getSelection()?.removeAllRanges(),s.current?.(w.data.text);return}x(Math.min(cr,Math.max(f,Math.ceil(w.data.height))))}}return window.addEventListener("message",ee),()=>{k=!1,D.clear(),window.removeEventListener("message",ee),te()}},[z,X,f,J,_]);const Z=tr(c.current);return t.jsxs("div",{className:"thread-html-frame-container",children:[t.jsx("iframe",{ref:c,className:`thread-html-frame thread-html-frame-${l} ${e}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-downloads",scrolling:"no",src:X,onLoad:B,style:{"--thread-html-frame-width-allowance":`${_e}px`,...I===null?{}:{"--thread-html-frame-height":`${I}px`}},title:l==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`},z),S?.token===z?S.players.map(k=>t.jsx("iframe",{className:"thread-netease-player",src:k.src,title:"网易云音乐播放器",allow:"autoplay",scrolling:"no",style:{left:k.left+Z.left,top:k.top+Z.top,width:k.width,height:k.height}},`${z}-${k.id}`)):null]})}function fr(e,r){const[a,o]=i.useState(e);return i.useEffect(()=>{const n=new AbortController,d=r?qt(e):[];if(o(e),d.length===0)return()=>n.abort();const l=Array.from(new Map(d.map(c=>[`${c.bid}:${c.tid}:${c.pid}`,c])).values());return Promise.all(l.map(async c=>{try{const m=await mt(c,n.signal);return[`${c.bid}:${c.tid}:${c.pid}`,m]}catch(m){if(m instanceof DOMException&&m.name==="AbortError")throw m;return[`${c.bid}:${c.tid}:${c.pid}`,""]}})).then(c=>{if(n.signal.aborted)return;const m=new Map(c);let y=e;d.forEach(s=>{const f=m.get(`${s.bid}:${s.tid}:${s.pid}`);f&&(y=y.replace(s.marker,f))}),o(y)}).catch(()=>{}),()=>n.abort()},[r,e]),a}function pr({canOpenImages:e,frameId:r,fontSize:a,needsJquery:o,html:n,isActivitySignupCanceled:d,isDarkTheme:l,variant:c}){const m=c==="signature",y=m?"#999999":"rgb(63 63 70)",s=m?"#666666":"rgb(228 228 231)",f=m?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",h=m?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",I=d?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${l?"dark":"light"}" style="background:transparent;color-scheme:${l?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${vr(Re())}">
  <meta http-equiv="Content-Security-Policy" content="${xr()}">
  <style>${dr}</style>
  <style>
    html{--capubbs-frame-text-color:${y}}html.dark{--capubbs-frame-text-color:${s}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${f};font-size:${a}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${_e}px);${h}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${hr(r,e,o)}<\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${c}${I}">${n}</main></body>
</html>`}function hr(e,r,a){return`(function(){
    var frameId=${JSON.stringify(e)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(yt)};
    var canOpenImages=${JSON.stringify(r)};
    var needsJquery=${JSON.stringify(a)};
    var normalizeNetEasePlayerUrl=${ke.toString()};
    var playerIds=new WeakMap();
    var nextPlayerId=0;
    var lastPlayerLayout='';
    var jquerySourceUrl=${JSON.stringify(Be)};
    var forumAppExactPaths=${JSON.stringify(xt)};
    var forumAppPathPrefixes=${JSON.stringify(vt)};
    var legacyForumExactPaths=${JSON.stringify(wt)};
    var legacyForumPathPatterns=${JSON.stringify(It)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${ur};
    var queued=false;
    var selectionQueued=false;
    var lastSelectionText='';
    var userScriptsExecuted=false;
    var imageResourceRequestIndex=0;
    var imageResourceRequests={};
    var imageResourceRequestIdsBySource={};
    var imageResourceObjectUrls=[];
    var priorityObservedImages=new WeakSet();
    var imagePriorityObserver=window.IntersectionObserver?new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var priority=entry.isIntersecting?'high':'low';
        if(entry.target.fetchPriority!==priority)entry.target.fetchPriority=priority;
        if(entry.isIntersecting&&entry.target.loading!=='eager')entry.target.loading='eager';
      });
    },{rootMargin:'0px',threshold:0}):null;
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
      window.parent.postMessage({source:'${$}',type:'resize',frameId:frameId,height:height},'*');
      Object.keys(imageResourceRequests).forEach(function(requestId){reportImageResourceLayout(requestId);});
      reportNetEasePlayers();
    }
    function reportNetEasePlayers(){
      var players=[];
      Array.prototype.forEach.call(document.querySelectorAll('.capubbs-html-frame-root iframe'),function(player){
        var raw=player.getAttribute('src')||player.getAttribute('data-capubbs-netease-src')||'';
        var src=normalizeNetEasePlayerUrl(raw,document.baseURI);
        if(!src)return;
        if(player.getAttribute('data-capubbs-netease-src')!==src)player.setAttribute('data-capubbs-netease-src',src);
        if(player.hasAttribute('src'))player.removeAttribute('src');
        var rect=player.getBoundingClientRect();
        var style=window.getComputedStyle(player);
        if(rect.width<=0||rect.height<=0||style.display==='none'||style.visibility==='hidden')return;
        if(!playerIds.has(player))playerIds.set(player,String(++nextPlayerId));
        players.push({id:playerIds.get(player),src:src,left:rect.left,top:rect.top,width:rect.width,height:rect.height});
      });
      var serialized=JSON.stringify(players);
      if(serialized===lastPlayerLayout)return;
      lastPlayerLayout=serialized;
      window.parent.postMessage({source:'${$}',type:'netease-layout',frameId:frameId,players:players},'*');
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
      window.parent.postMessage({source:'${$}',type:'selection',frameId:frameId,text:text},'*');
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
        window.parent.postMessage({source:'${$}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${$}',type:'navigate',frameId:frameId,url:url},'*');
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
      window.parent.postMessage({source:'${$}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
        if(imagePriorityObserver&&!priorityObservedImages.has(image)){
          priorityObservedImages.add(image);
          imagePriorityObserver.observe(image);
        }
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
    function getImageResourceBounds(images){
      return images.map(function(image){
        var bounds=image.getBoundingClientRect();
        return {top:bounds.top,bottom:bounds.bottom,left:bounds.left,right:bounds.right};
      });
    }
    function reportImageResourceLayout(requestId){
      var request=imageResourceRequests[requestId];
      if(!request)return;
      window.parent.postMessage({source:'${$}',type:'image-resource-layout',frameId:frameId,requestId:requestId,bounds:getImageResourceBounds(request.images)},'*');
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
          reportImageResourceLayout(existingRequestId);
          return;
        }
        var requestId=frameId+'-image-'+(++imageResourceRequestIndex);
        imageResourceRequests[requestId]={images:[image],source:normalizedSource};
        imageResourceRequestIdsBySource[normalizedSource]=requestId;
        window.parent.postMessage({
          source:'${$}',
          type:'image-resource-request',
          frameId:frameId,
          requestId:requestId,
          url:normalizedSource,
          bounds:getImageResourceBounds([image])
        },'*');
      });
    }
    function applyImageResourceResponse(data){
      var request=imageResourceRequests[data.requestId];
      if(!request)return;
      delete imageResourceRequests[data.requestId];
      delete imageResourceRequestIdsBySource[request.source];
      request.images.forEach(function(image){image.fetchPriority=data.priority==='high'?'high':'low';});
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
      if(event.source!==window.parent||!data||data.source!=='${$}'||data.frameId!==frameId)return;
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
      window.addEventListener('resize',queueHeight);
      document.addEventListener('scroll',queueHeight,true);
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
      if(needsJquery)window.parent.postMessage({source:'${$}',type:'jquery-request',frameId:frameId},'*');
      else executeUserScripts();
      requestImageResources();
      prepareImages();
      prepareGalleries();
      syncGrayscaleTextColors(contentRoot);
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`}function br(e){return e.replace(/<script\b([^>]*)>/gi,(r,a)=>`<script${a.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function yr(e){if(!/<(?:img|iframe)\b/i.test(e))return e;const r=document.createElement("template");return r.innerHTML=e,r.content.querySelectorAll("iframe[src]").forEach(a=>{const o=ke(a.getAttribute("src")??"",Re());o&&(a.dataset.capubbsNeteaseSrc=o,a.removeAttribute("src"))}),r.content.querySelectorAll("img[src]").forEach(a=>{const o=a.getAttribute("src")?.trim()??"";!o||/^(?:blob:|data:)/i.test(o)||(a.dataset.capubbsImageResourceSrc=o,a.setAttribute("fetchpriority","low"),a.removeAttribute("src"),a.removeAttribute("srcset"),a.closest("picture")?.querySelectorAll("source[srcset]").forEach(n=>{n.removeAttribute("srcset")}))}),r.innerHTML}function Me(){return ue||(ue=fetch(Be,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw new Error(`Failed to load jQuery: ${e.status}`);return e.text()}).catch(()=>null),ue)}function xr(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'","upgrade-insecure-requests"].join("; ")}function Re(){return new URL("/bbs/content/",window.location.origin).href}function vr(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function wr(e){return e.replace(/<\/style/gi,"<\\/style")}function Ir(e){if(!e||typeof e!="object")return!1;const r=e;return r.source!==$||typeof r.frameId!="string"?!1:r.type==="netease-layout"?Array.isArray(r.players)&&r.players.every(rr):r.type==="document-request"?typeof r.token=="string":r.type==="anchor"?typeof r.offsetTop=="number"&&Number.isFinite(r.offsetTop)&&r.offsetTop>=0:r.type==="navigate"?typeof r.url=="string":r.type==="jquery-request"?!0:r.type==="image-resource-request"||r.type==="image-resource-layout"?typeof r.requestId=="string"&&r.requestId.length>0&&Array.isArray(r.bounds)&&r.bounds.every(a=>a&&["top","bottom","left","right"].every(o=>typeof a[o]=="number"&&Number.isFinite(a[o])))&&(r.type==="image-resource-layout"||"url"in r&&typeof r.url=="string"&&r.url.length>0):r.type==="selection"?typeof r.text=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(a=>!!a&&typeof a=="object"&&typeof a.alt=="string"&&typeof a.elementIndex=="number"&&Number.isSafeInteger(a.elementIndex)&&a.elementIndex>=0&&typeof a.src=="string"&&a.src.length>0&&(a.galleryId===void 0&&a.galleryIndex===void 0||typeof a.galleryId=="number"&&Number.isSafeInteger(a.galleryId)&&a.galleryId>=0&&typeof a.galleryIndex=="number"&&Number.isSafeInteger(a.galleryIndex)&&a.galleryIndex>=0)):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function Ar(){const[e,r]=i.useState(()=>document.documentElement.classList.contains("dark"));return i.useEffect(()=>{const a=document.documentElement,o=()=>r(a.classList.contains("dark")),n=new MutationObserver(o);return n.observe(a,{attributeFilter:["class"],attributes:!0}),()=>n.disconnect()},[]),e}function Sr({attachments:e=[],bodyClassName:r="thread-floor-body",bodyFallback:a=null,bodyHtml:o,floor:n,isActivitySignupCanceled:d=!1,onImageOpen:l,onIsolatedTextSelection:c,signatureClassName:m="thread-signature",signatureHtml:y,signatureText:s}){const f=l?(h,I,x,S)=>{const F=h[I];F&&l([F],0,x,S?()=>S(I):void 0)}:void 0;return t.jsxs(t.Fragment,{children:[o?t.jsx(Le,{className:r,floor:n,html:o,isActivitySignupCanceled:d,onImageOpen:l,onIsolatedTextSelection:c,variant:"floor"}):a,t.jsx(kr,{attachments:e}),y?t.jsx(Le,{className:m,floor:n,html:y,onImageOpen:f,variant:"signature"}):s?t.jsx("footer",{className:m,children:t.jsx("p",{children:s})}):null]})}function kr({attachments:e}){return e.length===0?null:t.jsxs("section",{"aria-label":"附件",className:"thread-attachments",children:[t.jsxs("header",{className:"thread-attachments-heading",children:[t.jsx(zt,{"aria-hidden":"true",size:14}),t.jsx("span",{children:"附件"}),t.jsx("small",{children:e.length})]}),t.jsx("ul",{children:e.map(r=>{const a=t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"thread-attachment-name",children:r.name}),t.jsx("small",{children:Rr(r)}),r.exists!==!1&&t.jsx(At,{"aria-hidden":"true",size:15})]});return t.jsx("li",{children:r.exists===!1?t.jsx("div",{"aria-disabled":"true",className:"thread-attachment-link is-unavailable",children:a}):t.jsx("a",{className:"thread-attachment-link",download:r.name,href:r.downloadHref||`/bbs/download/?id=${encodeURIComponent(r.id)}`,children:a})},r.id)})})]})}function Rr(e){if(e.exists===!1)return"文件不可用";const r=[Cr(e.size),(e.price??0)>0?"付费附件":"免费"];return e.downloadCount!==void 0&&r.push(`下载 ${e.downloadCount} 次`),r.join(" · ")}function Cr(e){if(e<=0)return"大小未知";if(e<1024)return`${e} B`;const r=["KB","MB","GB","TB"];let a=e,o=-1;do a/=1024,o+=1;while(a>=1024&&o<r.length-1);return`${a.toFixed(a>=10?1:2)} ${r[o]}`}function jr({author:e,id:r}){const a=e.tags??[],[o,n]=i.useState(!1),d=i.useRef(null),l=i.useRef(null),c=i.useRef(null),m=i.useRef(null),y=a.map(s=>`${s.id}:${s.name}`).join("|");return i.useLayoutEffect(()=>{if(a.length===0){n(!1);return}const s=()=>{const h=d.current,I=l.current,x=c.current,S=m.current;if(!h||!I||!x||!S||h.offsetWidth===0)return;const F=x.getBoundingClientRect().width,q=S.getBoundingClientRect().width,C=Number.parseFloat(getComputedStyle(I).columnGap)||0,A=I.clientWidth-F-C,N=q>A+1;n(T=>T===N?T:N)};s();const f=new ResizeObserver(s);return[d.current,l.current,m.current].forEach(h=>{h&&f.observe(h)}),()=>f.disconnect()},[y,a.length]),t.jsxs("div",{id:r,ref:d,className:"author-hover-card",role:"dialog","aria-label":`${e.name} 的用户摘要`,children:[t.jsxs("div",{className:"author-card-head",children:[t.jsx("img",{src:e.avatar,alt:""}),t.jsxs("div",{className:"author-card-head-copy",children:[t.jsxs("div",{ref:l,className:"author-card-name-line","data-tags-overflow":o?"true":void 0,children:[t.jsx("strong",{ref:c,children:e.name}),t.jsx("div",{className:"author-card-tag-slot",children:t.jsx(fe,{size:"compact",tags:a})})]}),(e.stars>0||e.role)&&t.jsxs("span",{className:"author-card-status",children:["★".repeat(e.stars),e.stars>0&&e.role?" · ":"",e.role]})]})]}),o?t.jsx("div",{className:"author-card-tags-row",children:t.jsx(fe,{size:"compact",tags:a})}):null,e.medals?.length?t.jsx("div",{className:"author-card-medals",children:t.jsx(ze,{medals:e.medals,profileName:e.name,variant:"compact"})}):null,t.jsx("div",{ref:m,className:"author-card-tag-width-measure","aria-hidden":"true",children:t.jsx(fe,{size:"compact",tags:a})}),t.jsxs("dl",{children:[t.jsxs("div",{children:[t.jsx("dt",{children:"主题"}),t.jsx("dd",{children:e.topics})]}),t.jsxs("div",{children:[t.jsx("dt",{children:"回复"}),t.jsx("dd",{children:e.replies})]}),t.jsxs("div",{children:[t.jsx("dt",{children:"签到"}),t.jsx("dd",{children:e.checkins})]})]}),t.jsxs("p",{children:["最近在线：",e.lastSeen]}),t.jsxs("a",{href:se(e.name),children:["查看个人主页 ",t.jsx(Pt,{size:13})]})]})}function Er({author:e}){const r=e.tags??[],a=Fe(r),o=se(e.name);return t.jsxs("aside",{className:"thread-author-profile","aria-label":`${e.name} 的资料`,children:[t.jsx("a",{"aria-label":`查看${e.name}的个人主页`,className:"thread-author-profile-avatar",href:o,children:t.jsx("img",{src:e.avatar,alt:""})}),t.jsx("div",{className:"thread-author-profile-identity",children:t.jsx("a",{href:o,children:e.name})}),(e.stars>0||e.role)&&t.jsxs("div",{className:"thread-author-profile-status",children:[e.stars>0&&t.jsx("span",{"aria-label":`${e.stars} 星`,children:"★".repeat(e.stars)}),e.role&&t.jsx("strong",{children:e.role})]}),t.jsx(De,{tags:a}),t.jsx(ze,{medals:e.medals??[],profileName:e.name,variant:"compact"}),t.jsxs("dl",{className:"thread-author-profile-stats",children:[t.jsxs("div",{children:[t.jsx("dt",{children:"主题"}),t.jsx("dd",{children:e.topics})]}),t.jsxs("div",{children:[t.jsx("dt",{children:"回复"}),t.jsx("dd",{children:e.replies})]}),t.jsxs("div",{children:[t.jsx("dt",{children:"签到"}),t.jsx("dd",{children:e.checkins})]})]}),t.jsxs("p",{className:"thread-author-profile-last-seen",children:[t.jsx("span",{children:"最近在线"}),t.jsx("strong",{children:e.lastSeen})]})]})}function Ie(e){return e.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function Nr(e){const r=window.getSelection()?.toString();r&&(e.preventDefault(),e.clipboardData.setData("text/plain",r))}function Tr({articleAfterContent:e,author:r,avatarRail:a,className:o="",content:n,decorationImageSrc:d,editedAt:l,floor:c,floorIndex:m,id:y,inlineAvatar:s=!1,mainAfterContent:f,onCopy:h,publishedAt:I,showAuthorProfile:x}){const S=r.tags??[],F=Fe(S);return t.jsxs("article",{className:`thread-floor${x?" thread-floor-with-author-profile":""}${o?` ${o}`:""}`,"data-floor":c,id:y,onCopy:h,children:[d&&t.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:t.jsx("img",{alt:"",src:d})}),x?t.jsx(Er,{author:r}):!s&&a,t.jsxs("div",{className:"thread-floor-main",children:[t.jsxs("header",{className:"thread-floor-header",children:[!x&&s&&a,t.jsxs("div",{className:"thread-floor-author",children:[t.jsx("a",{href:se(r.name),children:r.name}),t.jsx(De,{tags:F})]}),t.jsxs("div",{className:"thread-floor-time",children:[t.jsx("time",{children:Ie(I)}),l&&t.jsxs(t.Fragment,{children:[t.jsx("span",{children:"·"}),t.jsxs("time",{children:["编辑于 ",Ie(l)]})]})]}),m]}),x?t.jsx("div",{className:"thread-floor-content",children:n}):n,f]}),e]})}function qr({canDelete:e,canEdit:r,canQuote:a,canReply:o,decorative:n=!1,deleting:d=!1,editHref:l="",onDelete:c,onQuote:m,onReply:y}){const s=n?-1:void 0,f=i.useRef(null);return t.jsxs("div",{"aria-hidden":n||void 0,className:`thread-floor-actions${n?" thread-floor-actions-decorative":""}`,children:[a&&t.jsxs("button",{onClick:h=>{const I=f.current?f.current.text:Pe(h.currentTarget);f.current=null,m?.(I)},onPointerDown:h=>{h.button===0&&(f.current={text:Pe(h.currentTarget)})},tabIndex:s,type:"button",children:[t.jsx(Rt,{size:15}),"引用"]}),o&&t.jsxs("button",{onClick:y,tabIndex:s,type:"button",children:[t.jsx(Ot,{size:15}),"回复"]}),r&&(n?t.jsxs("button",{tabIndex:-1,type:"button",children:[t.jsx(Te,{size:15}),"编辑"]}):t.jsxs("a",{href:l,children:[t.jsx(Te,{size:15}),"编辑"]})),e&&t.jsxs("button",{"aria-busy":d||void 0,className:"floor-action-danger",disabled:!n&&d,onClick:n?void 0:h=>c?.(h.currentTarget),tabIndex:s,type:"button",children:[t.jsx(Se,{size:15}),d?"删除中":"删除"]})]})}function Br({canQuote:e,canReply:r,decorationImageSrc:a,editHref:o,floor:n,isActivityThread:d,isMainPost:l,inlineAvatar:c,showAuthorProfile:m,hideSignature:y,onDeleteFloor:s,onDeleteNestedReply:f,onIsolatedTextSelection:h,onQuote:I,onSubmitNestedReply:x,viewer:S}){const[F,q]=i.useState(!1),[C,A]=i.useState(null),[N,T]=i.useState([]),[E,H]=i.useState(""),[z,X]=i.useState(!1),[J,Q]=i.useState([]),[_,B]=i.useState(""),[Z,k]=i.useState(""),[D,ee]=i.useState(null),[w,Y]=i.useState(""),[j,O]=i.useState(!1),[R,u]=i.useState(void 0),[p,v]=i.useState(null),[L,W]=i.useState(!1),M=i.useRef(null),G=i.useRef(null),re=i.useRef(null),b=i.useRef(null),V=i.useRef(null),ae=i.useMemo(()=>[...n.nestedReplies??[],...J].filter(g=>!N.includes(g.id)),[N,n.nestedReplies,J]),ie=d&&!l&&/<\s*(?:s|strike)\b/i.test(n.contentHtml??""),ne=`thread-floor-body${ie?" capubbs-activity-signup-canceled":""}`;i.useEffect(()=>()=>{G.current!==null&&window.clearTimeout(G.current)},[]),i.useEffect(()=>{if(!L)return;function g(P){M.current?.contains(P.target)||W(!1)}return document.addEventListener("pointerdown",g),()=>document.removeEventListener("pointerdown",g)},[L]);async function We(){const g=`${window.location.origin}${window.location.pathname}${window.location.search}#${n.floor}`;await Ht(g)&&(q(!0),G.current!==null&&window.clearTimeout(G.current),G.current=window.setTimeout(()=>q(!1),1800))}const Ce=(g,P,K,me)=>{V.current=K,v({imageIndex:P,images:g,onImageChange:me})};function Ye(g){p?.onImageChange?.(g),v(null),window.requestAnimationFrame(()=>V.current?.focus())}function je(g=null){u(g),B(""),k(""),Y(""),window.requestAnimationFrame(()=>b.current?.focus())}function Ee(){u(void 0),B(""),Y("")}async function Ve(g){g.preventDefault();const P=_.trim();if(!(!P||!S||j)){O(!0),Y("");try{const K=await x(n,R??null,P);Q(me=>[...me,{author:S,canDelete:!0,content:P,id:K>0?String(K):`local-${n.id}-${Date.now()}`,publishedAt:Pr(new Date),target:R??void 0}]),Ee()}catch(K){Y(K instanceof Error?K.message:"楼中楼回复发布失败，请稍后重试。")}finally{O(!1)}}}async function Je(g){ee(g.id),k("");try{await f(n,g),T(P=>[...P,g.id]),Q(P=>P.filter(K=>K.id!==g.id)),A(null)}catch(P){k(P instanceof Error?P.message:"楼中楼删除失败，请稍后重试。")}finally{ee(null)}}async function Ke(){if(!z){X(!0),H("");try{await s(n)}catch(g){H(g instanceof Error?g.message:"楼层删除失败，请稍后重试。"),X(!1)}}}function Xe(){A(null),H(""),k(""),window.requestAnimationFrame(()=>re.current?.focus())}function Qe(){if(!C)return;const g=C;A(null),g.kind==="floor"?Ke():Je(g.reply)}const Ze=t.jsxs("div",{className:`thread-avatar-rail${L?" thread-avatar-rail-open":""}`,ref:M,children:[t.jsx("button",{"aria-controls":`author-card-${n.floor}`,"aria-expanded":L,"aria-label":`查看${n.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>W(g=>!g),type:"button",children:t.jsx("img",{src:n.author.avatar,alt:""})}),t.jsx(jr,{author:n.author,id:`author-card-${n.floor}`})]}),et=t.jsx(Sr,{attachments:n.attachments,bodyFallback:t.jsx("div",{className:ne,children:n.paragraphs.map(g=>t.jsx("p",{children:g},g))}),bodyClassName:ne,bodyHtml:n.contentHtml,floor:n.floor,isActivitySignupCanceled:ie,onImageOpen:Ce,onIsolatedTextSelection:g=>h(n,g),signatureHtml:y?void 0:n.signatureHtml,signatureText:y?void 0:n.signature}),tt=t.jsxs("button",{"aria-label":`复制第 ${n.floor} 楼链接`,className:"thread-floor-index",onClick:We,title:"复制楼层链接",type:"button",children:["#",n.floor]}),rt=t.jsxs(t.Fragment,{children:[t.jsx(qr,{canDelete:(!d||l)&&(n.canDelete??n.isOwn??!1),canEdit:(!d||l)&&!!n.isOwn,canQuote:e,canReply:r,deleting:z,editHref:o,onDelete:g=>{re.current=g,H(""),A({kind:"floor"})},onQuote:g=>I(n,g),onReply:()=>je()}),E&&t.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:E}),ae.length>0&&t.jsx("section",{className:"nested-replies","aria-label":`${n.floor} 楼的楼中楼回复`,children:ae.map(g=>t.jsxs("article",{children:[t.jsx("img",{src:g.author.avatar,alt:""}),t.jsxs("div",{className:"nested-reply-main",children:[t.jsxs("div",{className:"nested-reply-identity",children:[t.jsx("a",{className:"nested-reply-author",href:se(g.author.name),children:g.author.name}),g.target&&t.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",t.jsx("a",{href:se(g.target),children:g.target})]})]}),g.contentHtml?t.jsx(He,{className:"nested-reply-content",html:g.contentHtml,onImageOpen:Ce,variant:"nested"}):t.jsx("p",{children:g.content}),t.jsxs("footer",{className:"nested-reply-footer",children:[t.jsx("time",{children:Ie(g.publishedAt)}),r&&t.jsx("button",{onClick:()=>je(g.author.name),type:"button",children:"回复"}),g.canDelete&&t.jsxs("button",{className:"nested-reply-delete",disabled:D===g.id,onClick:P=>{re.current=P.currentTarget,k(""),A({kind:"nested",reply:g})},type:"button",children:[t.jsx(Se,{size:12}),D===g.id?"删除中":"删除"]})]})]})]},g.id))}),Z&&t.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:Z}),R!==void 0&&r&&t.jsxs("form",{className:"nested-reply-composer",onSubmit:Ve,children:[t.jsx("textarea",{"aria-label":R?`回复 @${R}`:`回复第 ${n.floor} 楼`,maxLength:500,onChange:g=>{B(g.target.value),Y("")},placeholder:R?`回复 @${R}`:"写一条楼中楼回复",ref:b,rows:2,value:_}),t.jsxs("div",{className:"nested-reply-composer-actions",children:[t.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:j,onClick:Ee,type:"button",children:t.jsx(Ae,{size:15})}),t.jsxs("button",{className:"nested-reply-submit",disabled:!_.trim()||j,type:"submit",children:[t.jsx(St,{size:14}),j?"发送中":"发送"]})]}),w&&t.jsx("p",{className:"nested-reply-error",role:"alert",children:w})]})]}),at=t.jsxs(t.Fragment,{children:[F&&t.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[t.jsx(kt,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),p&&t.jsx(Xt,{images:p.images,initialImageIndex:p.imageIndex,onImageChange:p.onImageChange,onClose:Ye}),C&&t.jsx(Lr,{floor:n,isMainPost:l,onCancel:Xe,onConfirm:Qe,target:C})]});return t.jsx(Tr,{articleAfterContent:at,author:n.author,avatarRail:Ze,content:et,decorationImageSrc:a,editedAt:n.editedAt,floor:n.floor,floorIndex:tt,id:String(n.floor),inlineAvatar:c,mainAfterContent:rt,onCopy:Nr,publishedAt:n.publishedAt,showAuthorProfile:m})}function Pe(e){const r=e.closest(".thread-floor")?.querySelector(".thread-floor-body");return Ct(window.getSelection(),r??null)}function Lr({floor:e,isMainPost:r,onCancel:a,onConfirm:o,target:n}){const d=n.kind==="nested"?n.reply:null,l=d?"删除楼中楼回复":r?"删除主楼":"删除回复",c=d?"":r?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",m=d?.author.name??e.author.name,y=d?`#${e.floor} · 楼中楼`:`#${e.floor}`,s=Mr(d?.content||e.quoteText||e.paragraphs[0]||"");return i.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),i.useEffect(()=>{function f(h){h.key==="Escape"&&a()}return document.addEventListener("keydown",f),()=>document.removeEventListener("keydown",f)},[a]),t.jsx("div",{className:"thread-delete-dialog-backdrop",onMouseDown:f=>{f.currentTarget===f.target&&a()},role:"presentation",children:t.jsxs("section",{"aria-describedby":c?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[t.jsxs("header",{children:[t.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:t.jsx($t,{size:19})}),t.jsx("div",{children:t.jsx("h2",{id:"thread-delete-dialog-title",children:l})}),t.jsx("button",{"aria-label":"关闭删除确认",onClick:a,type:"button",children:t.jsx(Ae,{size:18})})]}),t.jsxs("div",{className:"thread-delete-dialog-body",children:[c&&t.jsx("p",{id:"thread-delete-dialog-description",children:c}),t.jsxs("div",{className:"thread-delete-dialog-target",children:[t.jsxs("span",{children:[m," · ",y]}),t.jsx("p",{children:s||"此回复没有可预览的文字内容。"})]})]}),t.jsxs("footer",{children:[t.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:a,type:"button",children:"取消"}),t.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:o,type:"button",children:[t.jsx(Se,{size:15}),"确认删除"]})]})]})})}function Mr(e){const r=e.replace(/\s+/g," ").trim();return r.length>100?`${r.slice(0,100).trimEnd()}…`:r}function Pr(e){const r=a=>String(a).padStart(2,"0");return`${e.getFullYear()}-${r(e.getMonth()+1)}-${r(e.getDate())} ${r(e.getHours())}:${r(e.getMinutes())}:${r(e.getSeconds())}`}export{zt as P,Sr as T,Tr as a,qr as b,Br as c,Ht as w};
