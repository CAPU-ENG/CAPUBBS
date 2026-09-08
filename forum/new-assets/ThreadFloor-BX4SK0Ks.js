import{q as $e,r as i,$ as nt,bq as ot,j as a,a0 as st,X as Ae,d as it,e as lt,br as ct,bs as ut,bt as dt,bu as mt,bv as gt,aM as ft,bw as pt,aS as ht,aG as bt,bx as yt,by as xt,bz as vt,bA as wt,bB as It,a4 as At,V as ie,z as St,a6 as kt,b7 as Rt,bC as Et}from"./index-BCzl1RcE.js";import{e as Ct,d as Ne,m as ge,s as jt,f as Nt,r as Lt,h as Tt,a as ze,P as Fe}from"./RichTextEditor.gallery-Bfenev1u.js";import{P as qt}from"./plus-B7W91kmx.js";import{R as Pt}from"./rotate-ccw-tpp4LUAz.js";import{D as De,T as fe}from"./TagBadge-CIZKVZlH.js";import{T as Se}from"./trash-2-CAKfjp68.js";import{P as Le}from"./pencil-CLx2kErg.js";import{E as Mt}from"./external-link-DTkOMhau.js";import{T as $t}from"./triangle-alert-D-mVNENH.js";const zt=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],Ft=$e("paperclip",zt);const Dt=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],Ot=$e("reply",Dt);async function Ht(e){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),!0}catch{}const r=document.createElement("textarea");r.value=e,r.setAttribute("readonly",""),r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select();try{return document.execCommand("copy")}finally{r.remove()}}const Gt={black:0,darkgray:169,darkgrey:169,dimgray:105,dimgrey:105,gainsboro:220,gray:128,grey:128,lightgray:211,lightgrey:211,silver:192,white:255,whitesmoke:245},pe="data-capubbs-original-grayscale-color-attr",he="data-capubbs-original-grayscale-style-color";function Ut(e){const r=String(e??"").trim().toLowerCase().replace(/^['"]|['"]$/g,""),t=r.replace(/\s+/g,""),o=Gt[t];if(typeof o=="number")return{alpha:1,channel:o};const n=t.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);if(n){const s=n[1].length<=4?n[1].split("").map(v=>`${v}${v}`).join(""):n[1],f=Number.parseInt(s.slice(0,2),16),p=Number.parseInt(s.slice(2,4),16),A=Number.parseInt(s.slice(4,6),16),h=s.length===8?Number.parseInt(s.slice(6,8),16)/255:1;return f===p&&p===A?{alpha:h,channel:f}:null}const u=r.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*(?:,|\/)\s*([01](?:\.\d+)?|\.\d+|100%|\d{1,3}(?:\.\d+)?%))?\s*\)$/);if(!u)return null;const l=be(u[1]),c=be(u[2]),d=be(u[3]),y=Yt(u[4]);return l===null||c===null||d===null||y===null?null:l===c&&c===d?{alpha:y,channel:l}:null}function Oe(e,r=!0){const t=Ut(e);if(!t)return null;const o=255-t.channel;if(r&&t.alpha<1)return`rgba(${o}, ${o}, ${o}, ${Vt(t.alpha)})`;const n=o.toString(16).padStart(2,"0");return`#${n}${n}${n}`}function _t(e,r){[...e.matches("[color], [style]")?[e]:[],...Array.from(e.querySelectorAll("[color], [style]"))].forEach(o=>{Bt(o,r),o instanceof HTMLElement&&Wt(o,r)})}function Bt(e,r){const t=e.getAttribute(pe);if(r==="light"){if(t===null)return;e.setAttribute("color",t),e.removeAttribute(pe);return}const o=t??e.getAttribute("color"),n=Oe(o,!1);!n||o===null||(t===null&&e.setAttribute(pe,o),e.getAttribute("color")!==n&&e.setAttribute("color",n))}function Wt(e,r){const t=e.getAttribute(he);if(r==="light"){if(t===null)return;e.style.setProperty("color",t,e.style.getPropertyPriority("color")),e.removeAttribute(he);return}const o=t??e.style.getPropertyValue("color"),n=Oe(o);!n||!o||(t===null&&e.setAttribute(he,o),e.style.getPropertyValue("color")!==n&&e.style.setProperty("color",n,e.style.getPropertyPriority("color")))}function be(e){const r=e.endsWith("%"),t=Number(r?e.slice(0,-1):e);return Number.isFinite(t)?r?t>=0&&t<=100?Math.round(t*2.55):null:t>=0&&t<=255?Math.round(t):null:null}function Yt(e){if(e===void 0)return 1;const r=e.endsWith("%"),t=Number(r?e.slice(0,-1):e);return Number.isFinite(t)?r?t>=0&&t<=100?t/100:null:t>=0&&t<=1?t:null:null}function Vt(e){return Number(e.toFixed(3))}function Jt(e){const r=[];return e.querySelectorAll("table").forEach(t=>{if(t.parentElement?.closest("table")||t.querySelector("table")||t.rows.length<2||!Array.from(t.rows).some(s=>s.cells.length>1))return;let o=t.parentElement;if(!o?.classList.contains("forum-table-scroll")){o=t.ownerDocument.createElement("div"),o.className="forum-table-scroll",o.tabIndex=0,t.before(o),o.append(t),t.classList.add("forum-data-table");let s=[],f=null;Array.from(t.rows).forEach((p,A)=>{f!==p.parentElement&&(f=p.parentElement,s=[]);let h=0;Array.from(p.cells).forEach(v=>{for(;(s[h]??0)>0;)h+=1;h===0&&v.colSpan===1&&v.classList.add("forum-table-first-column"),A===0&&!t.tHead&&v.classList.add("forum-table-heading");const T=v.rowSpan===0?t.rows.length:v.rowSpan;for(let S=0;S<v.colSpan;S+=1)s[h+S]=T;h+=v.colSpan;const N=t.ownerDocument.createElement("div");for(N.className="forum-table-cell-content";v.firstChild;)N.append(v.firstChild);v.append(N)}),s=s.map(v=>Math.max(0,v-1))})}const n=o;let u=n.parentElement;u?.classList.contains("forum-table-viewport")||(u=t.ownerDocument.createElement("div"),u.className="forum-table-viewport",n.before(u),u.append(n));const l=u,c=()=>{n.classList.toggle("forum-table-scrolled",n.scrollLeft>0),l.classList.toggle("forum-table-more-right",n.scrollWidth-n.clientWidth-n.scrollLeft>1)};c(),n.addEventListener("scroll",c,{passive:!0});const d=t.ownerDocument.defaultView,y=d?.ResizeObserver?new d.ResizeObserver(c):null;y?.observe(n),y?.observe(t),d?.addEventListener("resize",c),r.push(()=>{n.removeEventListener("scroll",c),y?.disconnect(),d?.removeEventListener("resize",c)})}),()=>r.forEach(t=>t())}function He({className:e="",html:r,onImageOpen:t,variant:o}){const n=i.useRef(null),{theme:u}=nt(),l=i.useMemo(()=>({__html:r}),[r]);if(i.useLayoutEffect(()=>{const s=n.current;if(s&&o!=="signature")return Jt(s)},[r,o]),i.useLayoutEffect(()=>{const s=n.current;s&&(Ct(s),_t(s,u))},[r,u]),i.useLayoutEffect(()=>{const s=n.current;if(s)return ot(s)},[r]),i.useEffect(()=>{const s=n.current;if(!s)return;const f=Array.from(s.querySelectorAll("img")),p=h=>{h.dataset.capubbsImageLoaded="true"},A=f.map(h=>{if(h.complete)return p(h),null;const v=()=>p(h);return h.addEventListener("load",v,{once:!0}),h.addEventListener("error",v,{once:!0}),{handleLoad:v,image:h}});return()=>{A.forEach(h=>{h&&(h.image.removeEventListener("load",h.handleLoad),h.image.removeEventListener("error",h.handleLoad))})}},[r]),!r)return null;function c(s,f){if(!t||!(s instanceof Element))return;const p=s.closest("img");if(!(p instanceof HTMLImageElement))return;const A=p.closest(".capubbs-gallery"),h=A?Array.from(A.querySelectorAll('[data-capubbs-gallery-slide="true"] img')):Array.from(f.querySelectorAll("img")).filter(k=>!k.closest(".capubbs-gallery")),v=h.indexOf(p);if(v<0)return;const T=h.map(k=>Kt(k,f)),N=h.map((k,L)=>{const q=T[L];return{alt:k.alt.trim(),element:k,src:k.currentSrc||k.src,...q?{galleryId:q.galleryId,galleryIndex:q.galleryIndex}:{}}});t(N,v,p,k=>{const L=T[k];L&&jt(L.gallery,L.galleryIndex)})}function d(s){const f=Ne(s.target);if(f&&s.target instanceof Element){s.preventDefault(),s.stopPropagation(),ge(s.target,f);return}!t||!(s.target instanceof HTMLImageElement)||(s.preventDefault(),c(s.target,s.currentTarget))}function y(s){const f=Ne(s.target);if(f&&["Enter"," "].includes(s.key)&&s.target instanceof Element){s.preventDefault(),ge(s.target,f);return}if(["ArrowLeft","ArrowRight"].includes(s.key)&&s.target instanceof Element&&s.target.closest(".capubbs-gallery")){s.preventDefault(),ge(s.target,s.key==="ArrowLeft"?"prev":"next");return}!t||!(s.target instanceof HTMLImageElement)||!["Enter"," "].includes(s.key)||(s.preventDefault(),c(s.target,s.currentTarget))}return a.jsx("div",{ref:n,className:`forum-markup forum-markup-${o} ${e}`.trim(),"data-forum-markup":o,dangerouslySetInnerHTML:l,onClick:d,onKeyDown:y})}function Kt(e,r){const t=e.closest(".capubbs-gallery");if(!t||!r.contains(t))return null;const n=Array.from(r.querySelectorAll(".capubbs-gallery")).indexOf(t),l=Array.from(t.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(e);return n>=0&&l>=0?{gallery:t,galleryId:n,galleryIndex:l}:null}const U=1,Ge=4,ce=.25;function Xt(e){return Math.min(Ge,Math.max(U,e))}function ye(e){const[r,t]=[...e.values()];return!r||!t?null:Math.hypot(t.x-r.x,t.y-r.y)}function Qt({images:e,initialImageIndex:r,onImageChange:t,onClose:o}){const n=Math.min(Math.max(0,r),Math.max(0,e.length-1)),[u,l]=i.useState(n),[c,d]=i.useState(U),[y,s]=i.useState({x:0,y:0}),[f,p]=i.useState(!1),A=i.useRef(null),h=i.useRef(null),v=i.useRef(null),T=i.useRef(null),N=i.useRef(n),S=i.useRef(U),k=i.useRef({x:0,y:0}),L=i.useRef(null),q=i.useRef(!1),j=i.useRef(new Map),H=i.useRef(null),F=i.useRef(U),X=i.useRef(t),J=i.useRef(o);X.current=t,J.current=o;function Q(m,b=S.current){const w=A.current,P=v.current;if(!w||!P||b<=U)return{x:0,y:0};const W=Math.max(0,(P.clientWidth*b-w.clientWidth)/2),M=Math.max(0,(P.clientHeight*b-w.clientHeight)/2);return{x:Math.min(W,Math.max(-W,m.x)),y:Math.min(M,Math.max(-M,m.y))}}function _(m,b=S.current){const w=Q(m,b);k.current=w,s(w)}function B(m){const b=Math.round(Xt(m)*100)/100;S.current=b,d(b),_(k.current,b)}function Z(){S.current=U,k.current={x:0,y:0},d(U),s({x:0,y:0})}function R(m){const b=Math.min(Math.max(0,m),e.length-1);b!==N.current&&(N.current=b,l(b),Z(),X.current?.(b))}function D(){J.current(N.current)}i.useEffect(()=>{const m=document.body.style.overflow,b=document.activeElement,w=A.current;document.body.style.overflow="hidden",T.current?.focus();function P(x){if(x.key==="Escape"){x.preventDefault(),D();return}if(x.key==="ArrowLeft"){x.preventDefault(),x.stopPropagation(),R(N.current-1);return}if(x.key==="ArrowRight"){x.preventDefault(),x.stopPropagation(),R(N.current+1);return}if(x.key==="+"||x.key==="="){x.preventDefault(),x.stopPropagation(),B(S.current+ce);return}if(x.key==="-"){x.preventDefault(),x.stopPropagation(),B(S.current-ce);return}if(x.key==="0"){x.preventDefault(),x.stopPropagation(),Z();return}if(x.key==="Tab"){const V=h.current?.querySelectorAll("button:not(:disabled)");if(!V?.length)return;const ae=V[0],se=V[V.length-1],ne=document.activeElement;if(x.shiftKey&&ne===ae){x.preventDefault(),se.focus();return}if(!x.shiftKey&&ne===se){x.preventDefault(),ae.focus();return}h.current?.contains(ne)||(x.preventDefault(),ae.focus())}}function W(x){if(x.preventDefault(),x.stopPropagation(),x.deltaY===0)return;const V=x.ctrlKey?.01:.002;B(S.current*Math.exp(-x.deltaY*V))}function M(x){x.preventDefault(),x.stopPropagation(),F.current=S.current}function G(x){if(x.preventDefault(),x.stopPropagation(),j.current.size>=2)return;const V=x.scale;typeof V=="number"&&B(F.current*V)}function re(){_(k.current,S.current)}return document.addEventListener("keydown",P,{capture:!0}),window.addEventListener("resize",re),w?.addEventListener("wheel",W,{passive:!1}),w?.addEventListener("gesturestart",M,{passive:!1}),w?.addEventListener("gesturechange",G,{passive:!1}),w?.addEventListener("gestureend",G,{passive:!1}),()=>{document.removeEventListener("keydown",P,{capture:!0}),window.removeEventListener("resize",re),w?.removeEventListener("wheel",W),w?.removeEventListener("gesturestart",M),w?.removeEventListener("gesturechange",G),w?.removeEventListener("gestureend",G),document.body.style.overflow=m,b instanceof HTMLElement&&b.focus()}},[]);function ee(m,b,w){L.current={pointerId:m,startX:b,startY:w,originX:k.current.x,originY:k.current.y},p(!0)}function I(m){if(m.target instanceof Element&&m.target.closest("button, .thread-image-lightbox-controls"))return;const b=m.pointerType==="touch",w=m.pointerType==="mouse"&&m.button===0;if(!(!b&&!w)&&(q.current=!1,!(!b&&S.current<=U))){if(m.preventDefault(),m.currentTarget.setPointerCapture(m.pointerId),b&&(j.current.set(m.pointerId,{x:m.clientX,y:m.clientY}),j.current.size===2)){H.current=ye(j.current),L.current=null,p(!1);return}S.current>U&&ee(m.pointerId,m.clientX,m.clientY)}}function Y(m){const b=j.current.has(m.pointerId),w=L.current;if(!b&&w?.pointerId!==m.pointerId)return;if(m.preventDefault(),m.stopPropagation(),b&&j.current.set(m.pointerId,{x:m.clientX,y:m.clientY}),j.current.size===2){const M=ye(j.current),G=H.current;if(!M||!G){H.current=M;return}Math.abs(M-G)>1&&(q.current=!0),B(S.current*(M/G)),H.current=M;return}if(!w||S.current<=U)return;const P=m.clientX-w.startX,W=m.clientY-w.startY;Math.hypot(P,W)>3&&(q.current=!0),_({x:w.originX+P,y:w.originY+W})}function C(m){const b=j.current.delete(m.pointerId),w=L.current?.pointerId===m.pointerId;if(!(!b&&!w)){if(H.current=j.current.size===2?ye(j.current):null,j.current.size===1&&S.current>U){const[P]=j.current.entries();if(P){const[W,M]=P;ee(W,M.x,M.y)}}else L.current=null,p(!1);m.currentTarget.hasPointerCapture(m.pointerId)&&m.currentTarget.releasePointerCapture(m.pointerId)}}const O=Math.round(c*100),E=e[u]??e[0];return E?st.createPortal(a.jsx("div",{className:"thread-image-lightbox-backdrop","data-can-pan":c>U,"data-dragging":f,onClick:m=>{if(q.current)return;const b=m.target;b instanceof Element&&b.closest("img, button, .thread-image-lightbox-controls")||D()},onPointerCancel:C,onPointerDown:I,onPointerMove:Y,onPointerUp:C,ref:A,role:"presentation",children:a.jsxs("figure",{"aria-label":E.alt?`图片预览：${E.alt}（${u+1}/${e.length}）`:`图片预览（${u+1}/${e.length}）`,"aria-modal":"true",className:"thread-image-lightbox",ref:h,role:"dialog",children:[a.jsx("button",{"aria-label":"关闭图片预览",className:"thread-image-lightbox-close",onClick:D,ref:T,type:"button",children:a.jsx(Ae,{size:20})}),e.length>1&&a.jsxs(a.Fragment,{children:[a.jsx("button",{"aria-label":"上一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-prev",disabled:u===0,onClick:()=>R(u-1),title:"上一张（←）",type:"button",children:a.jsx(it,{size:28})}),a.jsx("button",{"aria-label":"下一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-next",disabled:u===e.length-1,onClick:()=>R(u+1),title:"下一张（→）",type:"button",children:a.jsx(lt,{size:28})})]}),a.jsx(Zt,{image:E,imageRef:v,onReady:()=>_(k.current,S.current),transform:`translate3d(${y.x}px, ${y.y}px, 0) scale(${c})`}),E.alt&&a.jsx("figcaption",{children:E.alt}),a.jsxs("div",{"aria-label":"图片缩放",className:"thread-image-lightbox-controls",role:"toolbar",children:[a.jsx("button",{"aria-label":"缩小图片",disabled:c<=U,onClick:()=>B(c-ce),title:"缩小（-）",type:"button",children:a.jsx(Nt,{size:18})}),a.jsxs("output",{"aria-label":"当前缩放比例","aria-live":"polite",children:[O,"%"]}),a.jsx("button",{"aria-label":"放大图片",disabled:c>=Ge,onClick:()=>B(c+ce),title:"放大（+）",type:"button",children:a.jsx(qt,{size:18})}),a.jsx("button",{"aria-label":"恢复原始大小",disabled:c===U,onClick:Z,title:"恢复原始大小（0）",type:"button",children:a.jsx(Pt,{size:17})})]})]})}),document.body):null}function Zt({image:e,imageRef:r,onReady:t,transform:o}){const n=i.useRef(null),u=i.useRef(t);return u.current=t,i.useLayoutEffect(()=>{const l=e.element,c=n.current,d=l?.parentNode;if(!l||!c?.parentNode||!d)return;const y=l.ownerDocument.createComment("capubbs-lightbox-image"),s=l.getAttribute("style"),f=l.getAttribute("draggable");d.insertBefore(y,l),c.parentNode.insertBefore(l,c),l.draggable=!1,r.current=l;const p=()=>u.current();return l.addEventListener("load",p),l.complete&&p(),()=>{l.removeEventListener("load",p),s===null?l.removeAttribute("style"):l.setAttribute("style",s),f===null?l.removeAttribute("draggable"):l.setAttribute("draggable",f),y.parentNode?.insertBefore(l,y),y.remove(),r.current===l&&(r.current=null)}},[e,r]),i.useLayoutEffect(()=>{e.element&&(e.element.style.transform=o)},[e,o]),e.element?a.jsx("span",{hidden:!0,ref:n}):a.jsx("img",{alt:e.alt,draggable:"false",onLoad:t,ref:r,src:e.src,style:{transform:o}})}const er=':root{--surface: #fffefa;--surface-raised: #ffffff;--surface-soft: #f6f8f4;--text: #20231f;--text-strong: #111411;--text-muted: #687068;--text-faint: #919991;--line: #e1e6df;--line-strong: #cdd5cc;--brand: #236b4c;--brand-strong: #174f38;--danger: #b8473f}:root.dark{--surface: #171d19;--surface-raised: #1c241f;--surface-soft: #1f2822;--text: #dde5de;--text-strong: #f6faf6;--text-muted: #a0aca2;--text-faint: #748078;--line: #2c362f;--line-strong: #3c493f;--brand: #69b98d;--brand-strong: #8bcca6;--danger: #ef8178}::-moz-selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}::selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentcolor}blockquote,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}a{color:inherit;text-decoration:inherit}button{margin:0;padding:0;background-color:transparent;color:inherit;font:inherit;letter-spacing:inherit;text-transform:none}button:where(:not([style]):not([class])){min-height:32px;border:1px solid var(--line);border-radius:.5px;padding:4px 12px;background-color:var(--surface);color:var(--text-muted);font-size:14px;font-weight:680;line-height:1.5;vertical-align:middle;cursor:pointer;transition:background-color .14s ease,border-color .14s ease,color .14s ease}button:where(:not([style]):not([class]):hover:not(:disabled)){border-color:var(--line-strong);background-color:var(--surface-soft);color:var(--brand-strong)}button:where(:not([style]):not([class]):focus-visible){outline:2px solid var(--brand);outline-offset:2px}button:where(:not([style]):not([class]):disabled){cursor:not-allowed;opacity:.5}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}.capubbs-html-frame-root iframe{background-color:transparent!important}img,video{max-width:100%;height:auto}table{border-color:inherit;border-collapse:collapse;text-indent:0}.capubbs-activity-signup-canceled,.capubbs-activity-signup-canceled *{color:var(--danger)!important;text-decoration-color:var(--danger)!important;text-decoration-line:line-through!important;text-decoration-thickness:2px!important}.forum-markup>:first-child{margin-top:0}.forum-markup>:last-child{margin-bottom:0}.forum-markup p,.forum-markup div{margin:0}.forum-markup-floor p{margin:0 0 .75em}.forum-markup-floor>div+div{margin-top:.55em}.forum-markup a{color:var(--brand-strong);font-weight:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.16em}.forum-markup .forum-mention{text-decoration:none}.forum-markup blockquote{margin:0 0 0 2em;border:0;padding:0;background:transparent;color:inherit}.forum-markup blockquote.forum-quote,.forum-markup .forum-legacy-quote,.forum-markup blockquote.capubbs-floor-quote{margin:.8em 0;border-left:3px solid color-mix(in srgb,var(--brand) 38%,var(--line));padding:.55em .75em;background:var(--surface-soft);color:var(--text-muted)}.forum-markup .capubbs-floor-quote-jump{margin-left:.75em}.forum-markup .forum-legacy-quote-content{margin:0}.forum-markup h1,.forum-markup h2,.forum-markup h3,.forum-markup h4,.forum-markup h5,.forum-markup h6{margin:.9rem 0 .45rem;color:var(--brand-strong);font-weight:800;line-height:1.35}.forum-markup h1{font-size:1.45rem}.forum-markup h2{font-size:1.25rem}.forum-markup h3{font-size:1.1rem}.forum-markup h4,.forum-markup h5,.forum-markup h6{font-size:1em}.forum-markup ul,.forum-markup ol{margin:.65em 0;padding-left:1.45em}.forum-markup ul{list-style:disc}.forum-markup ol{list-style:decimal}.forum-markup ol.capubbs-ordered-list-alpha{list-style-type:lower-alpha}.forum-markup ol.capubbs-ordered-list-roman{list-style-type:lower-roman}.forum-markup pre{max-width:100%;overflow-x:auto;margin:.75em 0;border-radius:2px;padding:.75em;background:#182531;color:#f8fafc;white-space:pre-wrap}.forum-markup code,.forum-markup kbd{border-radius:2px;padding:.08em .25em;background:color-mix(in srgb,var(--surface-soft) 75%,var(--line));font-family:SFMono-Regular,Cascadia Code,Consolas,monospace;font-size:.9em}.forum-markup pre code{padding:0;background:transparent;color:inherit}.forum-markup font[size="1"]{font-size:11px}.forum-markup font[size="2"]{font-size:13px}.forum-markup font[size="3"]{font-size:15px}.forum-markup font[size="4"]{font-size:17px}.forum-markup font[size="5"]{font-size:19px}.forum-markup font[size="6"]{font-size:21px}.forum-markup font[size="7"]{font-size:23px}.forum-markup hr{margin:.9em 0;border:0;border-top:1px solid var(--line-strong)}.forum-markup img{display:inline-block;height:auto;max-width:100%;vertical-align:middle}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){color:transparent;font-size:0;background-color:color-mix(in srgb,var(--surface-soft) 82%,var(--line));background-image:linear-gradient(105deg,transparent 20%,color-mix(in srgb,var(--surface-raised) 70%,transparent) 45%,transparent 70%);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}.forum-markup img[role=button]{cursor:zoom-in}.forum-markup img[role=button]:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse}.forum-markup td,.forum-markup th{border:1px solid var(--line);padding:.35em .5em}.forum-markup-signature{color:#999;font-family:monospace;font-size:14px;line-height:1.6;overflow-wrap:anywhere}:root.dark .forum-markup-signature{color:#666}.forum-markup .capubbs-gallery{position:relative;display:block;width:100%;margin:.9rem 0;overflow:hidden;border:1px solid var(--line);border-radius:2px;background:transparent;color:var(--text)}.forum-markup .capubbs-gallery:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup .capubbs-gallery-header{position:relative;display:flex;min-height:44px;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:9px 12px;border-bottom:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-title{width:100%;min-width:0;margin:0;color:var(--text-strong);font-size:.82rem;font-weight:760;line-height:1.4;text-align:center}.forum-markup .capubbs-gallery-stage{position:relative;display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide{display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-slide>img{display:block;width:100%;height:var(--capubbs-gallery-image-height, clamp(280px, 52vw, 560px));max-width:none;margin:0 auto;border-radius:0;-o-object-fit:contain;object-fit:contain}.forum-markup .capubbs-gallery-caption{display:block;margin:0;color:var(--text-muted);font-size:.78rem;line-height:1.55;text-align:center}.forum-markup .capubbs-gallery-caption[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-footer{position:relative;display:flex;min-height:44px;align-items:center;justify-content:center;margin:0;padding:9px 12px;border-top:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-captions{width:100%;min-width:0;margin:0;padding-inline:48px;text-align:center}.forum-markup .capubbs-gallery-count{position:absolute;top:50%;right:12px;color:var(--text-faint);font-size:.72rem;font-variant-numeric:tabular-nums;font-weight:760;line-height:1.25;transform:translateY(-50%)}.forum-markup .capubbs-gallery-count[data-capubbs-gallery-current]:before{content:attr(data-capubbs-gallery-current) "/" attr(data-capubbs-gallery-total)}.forum-markup .capubbs-gallery-nav{position:absolute;z-index:4;top:50%;display:grid;width:36px;height:48px;place-items:center;padding:0;transform:translateY(-50%);border:1px solid rgb(255 255 255 / .25);border-radius:2px;background:#00000080;color:#fff;cursor:pointer;transition:.15s ease}.forum-markup .capubbs-gallery-nav:hover{background:#000000b8}.forum-markup .capubbs-gallery-nav:focus-visible{outline:2px solid #fff;outline-offset:2px}.forum-markup .capubbs-gallery-nav:before{font-family:Arial,sans-serif;font-size:2rem;font-weight:300;line-height:1}.forum-markup .capubbs-gallery-nav-prev:before{content:"‹"}.forum-markup .capubbs-gallery-nav-next:before{content:"›"}.forum-markup .capubbs-gallery-nav-prev{left:10px}.forum-markup .capubbs-gallery-nav-next{right:10px}@keyframes capubbs-image-loading{0%{background-position:120% 0}to{background-position:-80% 0}}@media(max-width:640px){.forum-markup .capubbs-gallery-slide>img{height:var(--capubbs-gallery-image-height, min(72vw, 420px))}.forum-markup .capubbs-gallery-nav{width:32px;height:42px}.forum-markup .capubbs-gallery-nav-prev{left:7px}.forum-markup .capubbs-gallery-nav-next{right:7px}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){animation:none}}',tr="/bbs/new-assets/threadHtmlBootstrap-x4mBAuLM.html";function ke(e,r){try{const t=new URL(e,r);return!["http:","https:"].includes(t.protocol)||t.hostname!=="music.163.com"||!["/outchain/player","/m/outchain/player"].includes(t.pathname)||t.username||t.password||t.port?null:(t.protocol="https:",t.href)}catch{return null}}function rr(e,r){const t=new URL(e);return t.pathname=/Android|iPhone|iPad|iPod|Mobile/i.test(r)?"/m/outchain/player":"/outchain/player",t.href}function ar(e){if(!e)return{left:0,top:0};const r=window.getComputedStyle(e);return{left:e.offsetLeft+e.clientLeft+(Number.parseFloat(r.paddingLeft)||0),top:e.offsetTop+e.clientTop+(Number.parseFloat(r.paddingTop)||0)}}function nr(e){if(!e||typeof e!="object")return!1;const r=e;return typeof r.id=="string"&&typeof r.src=="string"&&ke(r.src,"https://music.163.com")===r.src&&["left","top","width","height"].every(t=>{const o=r[t];return typeof o=="number"&&Number.isFinite(o)&&Math.abs(o)<=1e5})&&r.width>0&&r.height>0}const Te=64*1024*1024,le=new Map,de=new Map,oe=new Map;let ve=0,we=0,xe=!1;function te(){xe||!oe.size||(xe=!0,setTimeout(()=>{xe=!1;const e=[];oe.forEach((r,t)=>{const o=r.priorities.map(n=>n());if(o.every(n=>n===null)){oe.delete(t),le.delete(t),r.reject(new DOMException("图片所在内容已卸载","AbortError"));return}e.push({source:t,request:r,priority:o.includes("high")?"high":"low"})}),e.sort((r,t)=>+(t.priority==="high")-+(r.priority==="high"));for(const{source:r,request:t,priority:o}of e){if(ve>=6)break;o==="low"&&we>=2||(oe.delete(r),ve+=1,o==="low"&&(we+=1),t.start(o))}},0))}function Ue(e){return new URL(e,new URL("/bbs/content/",window.location.origin)).href}function or(e,r=()=>"high"){const t=Ue(e),o=new URL(t);if(o.origin!==window.location.origin||!o.pathname.startsWith("/bbs/images/")&&!o.pathname.startsWith("/bbsimg/"))return Promise.reject(new Error("仅代理论坛图片目录"));const n=le.get(t);if(n)return oe.get(t)?.priorities.push(r),te(),n;const u=new Promise((l,c)=>{oe.set(t,{priorities:[r],reject:c,start:d=>{sr(t,d).then(l,c).finally(()=>{ve-=1,d==="low"&&(we-=1),te()})}})});return le.set(t,u),te(),u}function sr(e,r){return fetch(e,{credentials:"same-origin",referrerPolicy:"no-referrer",priority:r}).then(async t=>{if(!t.ok)throw new Error(`图片加载失败：${t.status}`);if(!(t.headers.get("content-type")?.toLowerCase()??"").startsWith("image/"))throw new Error("图片响应类型无效");const n=Number.parseInt(t.headers.get("content-length")??"",10);if(Number.isFinite(n)&&n>Te)throw new Error("图片大小超出限制");const u=await t.blob();if(u.size>Te)throw new Error("图片大小超出限制");const l={blob:u,objectUrl:URL.createObjectURL(u),sourceUrl:e};return de.set(e,l),l}).catch(t=>{throw le.delete(e),t})}function ir(e){try{return de.get(Ue(e))?.objectUrl}catch{return}}typeof window<"u"&&(window.addEventListener("scroll",te,{passive:!0}),window.addEventListener("resize",te),window.addEventListener("pagehide",e=>{e.persisted||(de.forEach(r=>URL.revokeObjectURL(r.objectUrl)),de.clear(),le.clear())}));function lr(e,r,t){return r.some(o=>o.right>o.left&&o.bottom>o.top&&e.top+o.bottom>Math.max(0,e.top)&&e.top+o.top<Math.min(t.height,e.bottom)&&e.left+o.right>Math.max(0,e.left)&&e.left+o.left<Math.min(t.width,e.right))?"high":"low"}const cr=28,ur=64,dr=5e4,mr=30,_e=30,z="capubbs-thread-html-frame",Be=new URL("/bbs/lib/jquery.min.js",window.location.origin).href,gr=Ar(er),fr=/\son[a-z][\w:-]*\s*=/i;let ue=null;function qe({className:e="",floor:r,html:t,isActivitySignupCanceled:o=!1,onImageOpen:n,onIsolatedTextSelection:u,variant:l}){const c=i.useMemo(()=>l==="signature"?Lt(t):t,[t,l]),d=hr(c,l==="signature"),y=ct(d),s=i.useMemo(()=>y?null:ut(d,{normalizeLegacyLineBreaks:l==="signature"}),[d,y,l]),f=i.useMemo(()=>dt(d),[d]);return!y&&s!==null?a.jsx(He,{className:e,html:s,onImageOpen:n,variant:l}):a.jsx(pr,{className:e,floor:r,html:f,isActivitySignupCanceled:o,onImageOpen:n,onTextSelection:u,variant:l})}function pr({className:e,floor:r,html:t,isActivitySignupCanceled:o,onImageOpen:n,onTextSelection:u,variant:l}){const c=i.useRef(null),d=i.useRef(`${l}-${r}-${Math.random().toString(36).slice(2)}`),y=i.useRef(n);y.current=n;const s=i.useRef(u);s.current=u;const f=l==="signature"?cr:ur,p=!!n,[A,h]=i.useState(null),[v,T]=i.useState(null),N=kr(),S=i.useRef(N),k=gt(),L=l==="signature"?14:k,q=i.useMemo(()=>vr(xr(t)),[t]),j=q.includes('type="text/capubbs-user-script"')||fr.test(q),H=i.useMemo(()=>br({canOpenImages:p,frameId:d.current,needsJquery:j,html:q,isActivitySignupCanceled:o,isDarkTheme:S.current,fontSize:L,variant:l}),[p,q,L,o,j,l]),F=i.useMemo(()=>Math.random().toString(36).slice(2),[H]),X=i.useMemo(()=>`${tr}#${new URLSearchParams({frameId:d.current,token:F})}`,[F]),J=i.useCallback(()=>{c.current?.contentWindow?.postMessage({source:z,type:"document-response",frameId:d.current,token:F,html:H},"*")},[F,H]),Q=i.useCallback(()=>{c.current?.contentWindow?.postMessage({frameId:d.current,source:z,theme:N?"dark":"light",type:"theme"},"*")},[N]),_=i.useCallback((R=c.current?.contentWindow)=>{!j||!R||Pe().then(D=>{c.current?.contentWindow===R&&R.postMessage({frameId:d.current,jquerySource:D,source:z,type:"jquery-response"},"*")})},[j]),B=i.useCallback(()=>{J(),Q(),_()},[J,_,Q]);i.useEffect(()=>{h(null)},[X]),i.useEffect(()=>{Q()},[Q]),i.useEffect(()=>{j&&Pe()},[j]),i.useLayoutEffect(()=>{te()},[A]),i.useLayoutEffect(()=>{let R=!0;const D=new Map;function ee(I){const Y=c.current?.contentWindow;if(!(!Y||I.source!==Y||!Sr(I.data))&&I.data.frameId===d.current){if(I.data.type==="netease-layout"){T({token:F,players:I.data.players});return}if(I.data.type==="document-request"){I.data.token===F&&J();return}if(I.data.type==="jquery-request"){_(Y);return}if(I.data.type==="image-resource-layout"){D.has(I.data.requestId)&&(D.set(I.data.requestId,I.data.bounds),te());return}if(I.data.type==="image-resource-request"){const C=Y,O=I.data.requestId;D.set(O,I.data.bounds);const E=()=>{const m=c.current;return!R||!m||m.contentWindow!==C?null:lr(m.getBoundingClientRect(),D.get(O)??[],{width:window.innerWidth,height:window.innerHeight})};or(I.data.url,E).then(m=>{!R||c.current?.contentWindow!==C||C.postMessage({blob:m.blob,priority:E(),frameId:d.current,requestId:I.data.requestId,source:z,type:"image-resource-response"},"*")}).catch(()=>{!R||c.current?.contentWindow!==C||C.postMessage({priority:E(),frameId:d.current,requestId:I.data.requestId,source:z,type:"image-resource-error"},"*")}).finally(()=>D.delete(O));return}if(I.data.type==="anchor"){const C=c.current;if(!C)return;const O=window.getComputedStyle(document.documentElement),E=Number.parseFloat(O.getPropertyValue("--topbar-height"))||0,m=window.scrollY+C.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,m+I.data.offsetTop-E-16)});return}if(I.data.type==="navigate"){const C=ft(I.data.url,Re());if(!C)return;window.history.pushState(null,"",C),window.dispatchEvent(new Event(pt));const O=new URL(C,window.location.origin);O.hash?window.requestAnimationFrame(()=>{const E=decodeURIComponent(O.hash.slice(1)),m=ht(`#${E}`);(m?bt(m):document.getElementById(E))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(I.data.type==="image-open"){const C=c.current;if(!C)return;const O=Array.from(C.contentDocument?.querySelectorAll("img")??[]),E=I.data.images.map(b=>({...b,element:typeof b.elementIndex=="number"?O[b.elementIndex]:void 0,src:ir(b.src)??b.src})),m=b=>{const w=E[b];!w||typeof w.galleryId!="number"||!Number.isSafeInteger(w.galleryIndex)||C.contentWindow?.postMessage({frameId:d.current,galleryId:w.galleryId,galleryIndex:w.galleryIndex,source:z,type:"gallery-select"},"*")};y.current?.(E,I.data.imageIndex,C,m);return}if(I.data.type==="selection"){I.data.text&&window.getSelection()?.removeAllRanges(),s.current?.(I.data.text);return}h(Math.min(dr,Math.max(f,Math.ceil(I.data.height))))}}return window.addEventListener("message",ee),()=>{R=!1,D.clear(),window.removeEventListener("message",ee),te()}},[F,X,f,J,_]);const Z=ar(c.current);return a.jsxs("div",{className:"thread-html-frame-container",children:[a.jsx("iframe",{ref:c,className:`thread-html-frame thread-html-frame-${l} ${e}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-downloads",scrolling:"no",src:X,onLoad:B,style:{"--thread-html-frame-width-allowance":`${_e}px`,...A===null?{}:{"--thread-html-frame-height":`${A}px`}},title:l==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`},F),v?.token===F?v.players.map(R=>a.jsx("iframe",{className:"thread-netease-player",src:rr(R.src,navigator.userAgent),title:"网易云音乐播放器",allow:"autoplay",scrolling:"no",style:{left:R.left+Z.left,top:R.top+Z.top,width:R.width,height:R.height}},`${F}-${R.id}`)):null]})}function hr(e,r){const[t,o]=i.useState(e);return i.useEffect(()=>{const n=new AbortController,u=r?Tt(e):[];if(o(e),u.length===0)return()=>n.abort();const l=Array.from(new Map(u.map(c=>[`${c.bid}:${c.tid}:${c.pid}`,c])).values());return Promise.all(l.map(async c=>{try{const d=await mt(c,n.signal);return[`${c.bid}:${c.tid}:${c.pid}`,d]}catch(d){if(d instanceof DOMException&&d.name==="AbortError")throw d;return[`${c.bid}:${c.tid}:${c.pid}`,""]}})).then(c=>{if(n.signal.aborted)return;const d=new Map(c);let y=e;u.forEach(s=>{const f=d.get(`${s.bid}:${s.tid}:${s.pid}`);f&&(y=y.replace(s.marker,f))}),o(y)}).catch(()=>{}),()=>n.abort()},[r,e]),t}function br({canOpenImages:e,frameId:r,fontSize:t,needsJquery:o,html:n,isActivitySignupCanceled:u,isDarkTheme:l,variant:c}){const d=c==="signature",y=d?"#999999":"rgb(63 63 70)",s=d?"#666666":"rgb(228 228 231)",f=d?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",p=d?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",A=u?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${l?"dark":"light"}" style="background:transparent;color-scheme:${l?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${Ir(Re())}">
  <meta http-equiv="Content-Security-Policy" content="${wr()}">
  <style>${gr}</style>
  <style>
    html{--capubbs-frame-text-color:${y}}html.dark{--capubbs-frame-text-color:${s}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${f};font-size:${t}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${_e}px);${p}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${yr(r,e,o)}<\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${c}${A}">${n}</main></body>
</html>`}function yr(e,r,t){return`(function(){
    var frameId=${JSON.stringify(e)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(yt)};
    var canOpenImages=${JSON.stringify(r)};
    var needsJquery=${JSON.stringify(t)};
    var normalizeNetEasePlayerUrl=${ke.toString()};
    var playerIds=new WeakMap();
    var nextPlayerId=0;
    var lastPlayerLayout='';
    var jquerySourceUrl=${JSON.stringify(Be)};
    var forumAppExactPaths=${JSON.stringify(xt)};
    var forumAppPathPrefixes=${JSON.stringify(vt)};
    var legacyForumExactPaths=${JSON.stringify(wt)};
    var legacyForumPathPatterns=${JSON.stringify(It)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${mr};
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
      window.parent.postMessage({source:'${z}',type:'resize',frameId:frameId,height:height},'*');
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
      window.parent.postMessage({source:'${z}',type:'netease-layout',frameId:frameId,players:players},'*');
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
      window.parent.postMessage({source:'${z}',type:'selection',frameId:frameId,text:text},'*');
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
        window.parent.postMessage({source:'${z}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${z}',type:'navigate',frameId:frameId,url:url},'*');
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
      window.parent.postMessage({source:'${z}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
      window.parent.postMessage({source:'${z}',type:'image-resource-layout',frameId:frameId,requestId:requestId,bounds:getImageResourceBounds(request.images)},'*');
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
          source:'${z}',
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
      if(event.source!==window.parent||!data||data.source!=='${z}'||data.frameId!==frameId)return;
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
      if(needsJquery)window.parent.postMessage({source:'${z}',type:'jquery-request',frameId:frameId},'*');
      else executeUserScripts();
      requestImageResources();
      prepareImages();
      prepareGalleries();
      syncGrayscaleTextColors(contentRoot);
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`}function xr(e){return e.replace(/<script\b([^>]*)>/gi,(r,t)=>`<script${t.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function vr(e){if(!/<(?:img|iframe)\b/i.test(e))return e;const r=document.createElement("template");return r.innerHTML=e,r.content.querySelectorAll("iframe[src]").forEach(t=>{const o=ke(t.getAttribute("src")??"",Re());o&&(t.dataset.capubbsNeteaseSrc=o,t.removeAttribute("src"))}),r.content.querySelectorAll("img[src]").forEach(t=>{const o=t.getAttribute("src")?.trim()??"";!o||/^(?:blob:|data:)/i.test(o)||(t.dataset.capubbsImageResourceSrc=o,t.setAttribute("fetchpriority","low"),t.removeAttribute("src"),t.removeAttribute("srcset"),t.closest("picture")?.querySelectorAll("source[srcset]").forEach(n=>{n.removeAttribute("srcset")}))}),r.innerHTML}function Pe(){return ue||(ue=fetch(Be,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw new Error(`Failed to load jQuery: ${e.status}`);return e.text()}).catch(()=>null),ue)}function wr(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'","upgrade-insecure-requests"].join("; ")}function Re(){return new URL("/bbs/content/",window.location.origin).href}function Ir(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Ar(e){return e.replace(/<\/style/gi,"<\\/style")}function Sr(e){if(!e||typeof e!="object")return!1;const r=e;return r.source!==z||typeof r.frameId!="string"?!1:r.type==="netease-layout"?Array.isArray(r.players)&&r.players.every(nr):r.type==="document-request"?typeof r.token=="string":r.type==="anchor"?typeof r.offsetTop=="number"&&Number.isFinite(r.offsetTop)&&r.offsetTop>=0:r.type==="navigate"?typeof r.url=="string":r.type==="jquery-request"?!0:r.type==="image-resource-request"||r.type==="image-resource-layout"?typeof r.requestId=="string"&&r.requestId.length>0&&Array.isArray(r.bounds)&&r.bounds.every(t=>t&&["top","bottom","left","right"].every(o=>typeof t[o]=="number"&&Number.isFinite(t[o])))&&(r.type==="image-resource-layout"||"url"in r&&typeof r.url=="string"&&r.url.length>0):r.type==="selection"?typeof r.text=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(t=>!!t&&typeof t=="object"&&typeof t.alt=="string"&&typeof t.elementIndex=="number"&&Number.isSafeInteger(t.elementIndex)&&t.elementIndex>=0&&typeof t.src=="string"&&t.src.length>0&&(t.galleryId===void 0&&t.galleryIndex===void 0||typeof t.galleryId=="number"&&Number.isSafeInteger(t.galleryId)&&t.galleryId>=0&&typeof t.galleryIndex=="number"&&Number.isSafeInteger(t.galleryIndex)&&t.galleryIndex>=0)):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function kr(){const[e,r]=i.useState(()=>document.documentElement.classList.contains("dark"));return i.useEffect(()=>{const t=document.documentElement,o=()=>r(t.classList.contains("dark")),n=new MutationObserver(o);return n.observe(t,{attributeFilter:["class"],attributes:!0}),()=>n.disconnect()},[]),e}function Rr({attachments:e=[],bodyClassName:r="thread-floor-body",bodyFallback:t=null,bodyHtml:o,floor:n,isActivitySignupCanceled:u=!1,onImageOpen:l,onIsolatedTextSelection:c,signatureClassName:d="thread-signature",signatureHtml:y,signatureText:s}){const f=l?(p,A,h,v)=>{const T=p[A];T&&l([T],0,h,v?()=>v(A):void 0)}:void 0;return a.jsxs(a.Fragment,{children:[o?a.jsx(qe,{className:r,floor:n,html:o,isActivitySignupCanceled:u,onImageOpen:l,onIsolatedTextSelection:c,variant:"floor"}):t,a.jsx(Er,{attachments:e}),y?a.jsx(qe,{className:d,floor:n,html:y,onImageOpen:f,variant:"signature"}):s?a.jsx("footer",{className:d,children:a.jsx("p",{children:s})}):null]})}function Er({attachments:e}){return e.length===0?null:a.jsxs("section",{"aria-label":"附件",className:"thread-attachments",children:[a.jsxs("header",{className:"thread-attachments-heading",children:[a.jsx(Ft,{"aria-hidden":"true",size:14}),a.jsx("span",{children:"附件"}),a.jsx("small",{children:e.length})]}),a.jsx("ul",{children:e.map(r=>{const t=a.jsxs(a.Fragment,{children:[a.jsx("span",{className:"thread-attachment-name",children:r.name}),a.jsx("small",{children:Cr(r)}),r.exists!==!1&&a.jsx(At,{"aria-hidden":"true",size:15})]});return a.jsx("li",{children:r.exists===!1?a.jsx("div",{"aria-disabled":"true",className:"thread-attachment-link is-unavailable",children:t}):a.jsx("a",{className:"thread-attachment-link",download:r.name,href:r.downloadHref||`/bbs/download/?id=${encodeURIComponent(r.id)}`,children:t})},r.id)})})]})}function Cr(e){if(e.exists===!1)return"文件不可用";const r=[jr(e.size),(e.price??0)>0?"付费附件":"免费"];return e.downloadCount!==void 0&&r.push(`下载 ${e.downloadCount} 次`),r.join(" · ")}function jr(e){if(e<=0)return"大小未知";if(e<1024)return`${e} B`;const r=["KB","MB","GB","TB"];let t=e,o=-1;do t/=1024,o+=1;while(t>=1024&&o<r.length-1);return`${t.toFixed(t>=10?1:2)} ${r[o]}`}function Nr({author:e,id:r}){const t=e.tags??[],[o,n]=i.useState(!1),u=i.useRef(null),l=i.useRef(null),c=i.useRef(null),d=i.useRef(null),y=t.map(s=>`${s.id}:${s.name}`).join("|");return i.useLayoutEffect(()=>{if(t.length===0){n(!1);return}const s=()=>{const p=u.current,A=l.current,h=c.current,v=d.current;if(!p||!A||!h||!v||p.offsetWidth===0)return;const T=h.getBoundingClientRect().width,N=v.getBoundingClientRect().width,S=Number.parseFloat(getComputedStyle(A).columnGap)||0,k=A.clientWidth-T-S,L=N>k+1;n(q=>q===L?q:L)};s();const f=new ResizeObserver(s);return[u.current,l.current,d.current].forEach(p=>{p&&f.observe(p)}),()=>f.disconnect()},[y,t.length]),a.jsxs("div",{id:r,ref:u,className:"author-hover-card",role:"dialog","aria-label":`${e.name} 的用户摘要`,children:[a.jsxs("div",{className:"author-card-head",children:[a.jsx("img",{src:e.avatar,alt:""}),a.jsxs("div",{className:"author-card-head-copy",children:[a.jsxs("div",{ref:l,className:"author-card-name-line","data-tags-overflow":o?"true":void 0,children:[a.jsx("strong",{ref:c,children:e.name}),a.jsx("div",{className:"author-card-tag-slot",children:a.jsx(fe,{size:"compact",tags:t})})]}),(e.stars>0||e.role)&&a.jsxs("span",{className:"author-card-status",children:["★".repeat(e.stars),e.stars>0&&e.role?" · ":"",e.role]})]})]}),o?a.jsx("div",{className:"author-card-tags-row",children:a.jsx(fe,{size:"compact",tags:t})}):null,e.medals?.length?a.jsx("div",{className:"author-card-medals",children:a.jsx(Fe,{medals:e.medals,profileName:e.name,variant:"compact"})}):null,a.jsx("div",{ref:d,className:"author-card-tag-width-measure","aria-hidden":"true",children:a.jsx(fe,{size:"compact",tags:t})}),a.jsxs("dl",{children:[a.jsxs("div",{children:[a.jsx("dt",{children:"主题"}),a.jsx("dd",{children:e.topics})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"回复"}),a.jsx("dd",{children:e.replies})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"签到"}),a.jsx("dd",{children:e.checkins})]})]}),a.jsxs("p",{children:["最近在线：",e.lastSeen]}),a.jsxs("a",{href:ie(e.name),children:["查看个人主页 ",a.jsx(Mt,{size:13})]})]})}function Lr({author:e}){const r=e.tags??[],t=ze(r),o=ie(e.name);return a.jsxs("aside",{className:"thread-author-profile","aria-label":`${e.name} 的资料`,children:[a.jsx("a",{"aria-label":`查看${e.name}的个人主页`,className:"thread-author-profile-avatar",href:o,children:a.jsx("img",{src:e.avatar,alt:""})}),a.jsx("div",{className:"thread-author-profile-identity",children:a.jsx("a",{href:o,children:e.name})}),(e.stars>0||e.role)&&a.jsxs("div",{className:"thread-author-profile-status",children:[e.stars>0&&a.jsx("span",{"aria-label":`${e.stars} 星`,children:"★".repeat(e.stars)}),e.role&&a.jsx("strong",{children:e.role})]}),a.jsx(De,{tags:t}),a.jsx(Fe,{medals:e.medals??[],profileName:e.name,variant:"compact"}),a.jsxs("dl",{className:"thread-author-profile-stats",children:[a.jsxs("div",{children:[a.jsx("dt",{children:"主题"}),a.jsx("dd",{children:e.topics})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"回复"}),a.jsx("dd",{children:e.replies})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"签到"}),a.jsx("dd",{children:e.checkins})]})]}),a.jsxs("p",{className:"thread-author-profile-last-seen",children:[a.jsx("span",{children:"最近在线"}),a.jsx("strong",{children:e.lastSeen})]})]})}function Ie(e){return e.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function Tr(e){const r=window.getSelection()?.toString();r&&(e.preventDefault(),e.clipboardData.setData("text/plain",r))}function qr({articleAfterContent:e,author:r,avatarRail:t,className:o="",content:n,decorationImageSrc:u,editedAt:l,floor:c,floorIndex:d,id:y,inlineAvatar:s=!1,mainAfterContent:f,onCopy:p,publishedAt:A,showAuthorProfile:h}){const v=r.tags??[],T=ze(v);return a.jsxs("article",{className:`thread-floor${h?" thread-floor-with-author-profile":""}${o?` ${o}`:""}`,"data-floor":c,id:y,onCopy:p,children:[u&&a.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:a.jsx("img",{alt:"",src:u})}),h?a.jsx(Lr,{author:r}):!s&&t,a.jsxs("div",{className:"thread-floor-main",children:[a.jsxs("header",{className:"thread-floor-header",children:[!h&&s&&t,a.jsxs("div",{className:"thread-floor-author",children:[a.jsx("a",{href:ie(r.name),children:r.name}),a.jsx(De,{tags:T})]}),a.jsxs("div",{className:"thread-floor-time",children:[a.jsx("time",{children:Ie(A)}),l&&a.jsxs(a.Fragment,{children:[a.jsx("span",{children:"·"}),a.jsxs("time",{children:["编辑于 ",Ie(l)]})]})]}),d]}),h?a.jsx("div",{className:"thread-floor-content",children:n}):n,f]}),e]})}function Pr({canDelete:e,canEdit:r,canQuote:t,canReply:o,decorative:n=!1,deleting:u=!1,editHref:l="",onDelete:c,onQuote:d,onReply:y}){const s=n?-1:void 0,f=i.useRef(null);return a.jsxs("div",{"aria-hidden":n||void 0,className:`thread-floor-actions${n?" thread-floor-actions-decorative":""}`,children:[t&&a.jsxs("button",{onClick:p=>{const A=f.current?f.current.text:Me(p.currentTarget);f.current=null,d?.(A)},onPointerDown:p=>{p.button===0&&(f.current={text:Me(p.currentTarget)})},tabIndex:s,type:"button",children:[a.jsx(Rt,{size:15}),"引用"]}),o&&a.jsxs("button",{onClick:y,tabIndex:s,type:"button",children:[a.jsx(Ot,{size:15}),"回复"]}),r&&(n?a.jsxs("button",{tabIndex:-1,type:"button",children:[a.jsx(Le,{size:15}),"编辑"]}):a.jsxs("a",{href:l,children:[a.jsx(Le,{size:15}),"编辑"]})),e&&a.jsxs("button",{"aria-busy":u||void 0,className:"floor-action-danger",disabled:!n&&u,onClick:n?void 0:p=>c?.(p.currentTarget),tabIndex:s,type:"button",children:[a.jsx(Se,{size:15}),u?"删除中":"删除"]})]})}function Yr({canQuote:e,canReply:r,decorationImageSrc:t,editHref:o,floor:n,isActivityThread:u,isMainPost:l,inlineAvatar:c,showAuthorProfile:d,hideSignature:y,onDeleteFloor:s,onDeleteNestedReply:f,onIsolatedTextSelection:p,onQuote:A,onSubmitNestedReply:h,viewer:v}){const[T,N]=i.useState(!1),[S,k]=i.useState(null),[L,q]=i.useState([]),[j,H]=i.useState(""),[F,X]=i.useState(!1),[J,Q]=i.useState([]),[_,B]=i.useState(""),[Z,R]=i.useState(""),[D,ee]=i.useState(null),[I,Y]=i.useState(""),[C,O]=i.useState(!1),[E,m]=i.useState(void 0),[b,w]=i.useState(null),[P,W]=i.useState(!1),M=i.useRef(null),G=i.useRef(null),re=i.useRef(null),x=i.useRef(null),V=i.useRef(null),ae=i.useMemo(()=>[...n.nestedReplies??[],...J].filter(g=>!L.includes(g.id)),[L,n.nestedReplies,J]),se=u&&!l&&/<\s*(?:s|strike)\b/i.test(n.contentHtml??""),ne=`thread-floor-body${se?" capubbs-activity-signup-canceled":""}`;i.useEffect(()=>()=>{G.current!==null&&window.clearTimeout(G.current)},[]),i.useEffect(()=>{if(!P)return;function g($){M.current?.contains($.target)||W(!1)}return document.addEventListener("pointerdown",g),()=>document.removeEventListener("pointerdown",g)},[P]);async function We(){const g=`${window.location.origin}${window.location.pathname}${window.location.search}#${n.floor}`;await Ht(g)&&(N(!0),G.current!==null&&window.clearTimeout(G.current),G.current=window.setTimeout(()=>N(!1),1800))}const Ee=(g,$,K,me)=>{V.current=K,w({imageIndex:$,images:g,onImageChange:me})};function Ye(g){b?.onImageChange?.(g),w(null),window.requestAnimationFrame(()=>V.current?.focus())}function Ce(g=null){m(g),B(""),R(""),Y(""),window.requestAnimationFrame(()=>x.current?.focus())}function je(){m(void 0),B(""),Y("")}async function Ve(g){g.preventDefault();const $=_.trim();if(!(!$||!v||C)){O(!0),Y("");try{const K=await h(n,E??null,$);Q(me=>[...me,{author:v,canDelete:!0,content:$,id:K>0?String(K):`local-${n.id}-${Date.now()}`,publishedAt:zr(new Date),target:E??void 0}]),je()}catch(K){Y(K instanceof Error?K.message:"楼中楼回复发布失败，请稍后重试。")}finally{O(!1)}}}async function Je(g){ee(g.id),R("");try{await f(n,g),q($=>[...$,g.id]),Q($=>$.filter(K=>K.id!==g.id)),k(null)}catch($){R($ instanceof Error?$.message:"楼中楼删除失败，请稍后重试。")}finally{ee(null)}}async function Ke(){if(!F){X(!0),H("");try{await s(n)}catch(g){H(g instanceof Error?g.message:"楼层删除失败，请稍后重试。"),X(!1)}}}function Xe(){k(null),H(""),R(""),window.requestAnimationFrame(()=>re.current?.focus())}function Qe(){if(!S)return;const g=S;k(null),g.kind==="floor"?Ke():Je(g.reply)}const Ze=a.jsxs("div",{className:`thread-avatar-rail${P?" thread-avatar-rail-open":""}`,ref:M,children:[a.jsx("button",{"aria-controls":`author-card-${n.floor}`,"aria-expanded":P,"aria-label":`查看${n.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>W(g=>!g),type:"button",children:a.jsx("img",{src:n.author.avatar,alt:""})}),a.jsx(Nr,{author:n.author,id:`author-card-${n.floor}`})]}),et=a.jsx(Rr,{attachments:n.attachments,bodyFallback:a.jsx("div",{className:ne,children:n.paragraphs.map(g=>a.jsx("p",{children:g},g))}),bodyClassName:ne,bodyHtml:n.contentHtml,floor:n.floor,isActivitySignupCanceled:se,onImageOpen:Ee,onIsolatedTextSelection:g=>p(n,g),signatureHtml:y?void 0:n.signatureHtml,signatureText:y?void 0:n.signature}),tt=a.jsxs("button",{"aria-label":`复制第 ${n.floor} 楼链接`,className:"thread-floor-index",onClick:We,title:"复制楼层链接",type:"button",children:["#",n.floor]}),rt=a.jsxs(a.Fragment,{children:[a.jsx(Pr,{canDelete:(!u||l)&&(n.canDelete??n.isOwn??!1),canEdit:(!u||l)&&!!n.isOwn,canQuote:e,canReply:r,deleting:F,editHref:o,onDelete:g=>{re.current=g,H(""),k({kind:"floor"})},onQuote:g=>A(n,g),onReply:()=>Ce()}),j&&a.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:j}),ae.length>0&&a.jsx("section",{className:"nested-replies","aria-label":`${n.floor} 楼的楼中楼回复`,children:ae.map(g=>a.jsxs("article",{children:[a.jsx("img",{src:g.author.avatar,alt:""}),a.jsxs("div",{className:"nested-reply-main",children:[a.jsxs("div",{className:"nested-reply-identity",children:[a.jsx("a",{className:"nested-reply-author",href:ie(g.author.name),children:g.author.name}),g.target&&a.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",a.jsx("a",{href:ie(g.target),children:g.target})]})]}),g.contentHtml?a.jsx(He,{className:"nested-reply-content",html:g.contentHtml,onImageOpen:Ee,variant:"nested"}):a.jsx("p",{children:g.content}),a.jsxs("footer",{className:"nested-reply-footer",children:[a.jsx("time",{children:Ie(g.publishedAt)}),r&&a.jsx("button",{onClick:()=>Ce(g.author.name),type:"button",children:"回复"}),g.canDelete&&a.jsxs("button",{className:"nested-reply-delete",disabled:D===g.id,onClick:$=>{re.current=$.currentTarget,R(""),k({kind:"nested",reply:g})},type:"button",children:[a.jsx(Se,{size:12}),D===g.id?"删除中":"删除"]})]})]})]},g.id))}),Z&&a.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:Z}),E!==void 0&&r&&a.jsxs("form",{className:"nested-reply-composer",onSubmit:Ve,children:[a.jsx("textarea",{"aria-label":E?`回复 @${E}`:`回复第 ${n.floor} 楼`,maxLength:500,onChange:g=>{B(g.target.value),Y("")},placeholder:E?`回复 @${E}`:"写一条楼中楼回复",ref:x,rows:2,value:_}),a.jsxs("div",{className:"nested-reply-composer-actions",children:[a.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:C,onClick:je,type:"button",children:a.jsx(Ae,{size:15})}),a.jsxs("button",{className:"nested-reply-submit",disabled:!_.trim()||C,type:"submit",children:[a.jsx(St,{size:14}),C?"发送中":"发送"]})]}),I&&a.jsx("p",{className:"nested-reply-error",role:"alert",children:I})]})]}),at=a.jsxs(a.Fragment,{children:[T&&a.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[a.jsx(kt,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),b&&a.jsx(Qt,{images:b.images,initialImageIndex:b.imageIndex,onImageChange:b.onImageChange,onClose:Ye}),S&&a.jsx(Mr,{floor:n,isMainPost:l,onCancel:Xe,onConfirm:Qe,target:S})]});return a.jsx(qr,{articleAfterContent:at,author:n.author,avatarRail:Ze,content:et,decorationImageSrc:t,editedAt:n.editedAt,floor:n.floor,floorIndex:tt,id:String(n.floor),inlineAvatar:c,mainAfterContent:rt,onCopy:Tr,publishedAt:n.publishedAt,showAuthorProfile:d})}function Me(e){const r=e.closest(".thread-floor")?.querySelector(".thread-floor-body");return Et(window.getSelection(),r??null)}function Mr({floor:e,isMainPost:r,onCancel:t,onConfirm:o,target:n}){const u=n.kind==="nested"?n.reply:null,l=u?"删除楼中楼回复":r?"删除主楼":"删除回复",c=u?"":r?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",d=u?.author.name??e.author.name,y=u?`#${e.floor} · 楼中楼`:`#${e.floor}`,s=$r(u?.content||e.quoteText||e.paragraphs[0]||"");return i.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),i.useEffect(()=>{function f(p){p.key==="Escape"&&t()}return document.addEventListener("keydown",f),()=>document.removeEventListener("keydown",f)},[t]),a.jsx("div",{className:"thread-delete-dialog-backdrop",onMouseDown:f=>{f.currentTarget===f.target&&t()},role:"presentation",children:a.jsxs("section",{"aria-describedby":c?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[a.jsxs("header",{children:[a.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:a.jsx($t,{size:19})}),a.jsx("div",{children:a.jsx("h2",{id:"thread-delete-dialog-title",children:l})}),a.jsx("button",{"aria-label":"关闭删除确认",onClick:t,type:"button",children:a.jsx(Ae,{size:18})})]}),a.jsxs("div",{className:"thread-delete-dialog-body",children:[c&&a.jsx("p",{id:"thread-delete-dialog-description",children:c}),a.jsxs("div",{className:"thread-delete-dialog-target",children:[a.jsxs("span",{children:[d," · ",y]}),a.jsx("p",{children:s||"此回复没有可预览的文字内容。"})]})]}),a.jsxs("footer",{children:[a.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:t,type:"button",children:"取消"}),a.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:o,type:"button",children:[a.jsx(Se,{size:15}),"确认删除"]})]})]})})}function $r(e){const r=e.replace(/\s+/g," ").trim();return r.length>100?`${r.slice(0,100).trimEnd()}…`:r}function zr(e){const r=t=>String(t).padStart(2,"0");return`${e.getFullYear()}-${r(e.getMonth()+1)}-${r(e.getDate())} ${r(e.getHours())}:${r(e.getMinutes())}:${r(e.getSeconds())}`}export{Ft as P,Rr as T,qr as a,Pr as b,Yr as c,Ht as w};
