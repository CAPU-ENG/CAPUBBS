import{q as Me,r as s,$ as at,ba as nt,j as t,a0 as ot,X as Ae,d as it,e as st,bb as lt,bc as ct,bd as ut,be as dt,bf as gt,aM as mt,bg as ft,aS as pt,aG as ht,bh as bt,bi as yt,bj as xt,bk as vt,bl as It,a4 as wt,V as ie,z as At,a6 as Rt,b7 as kt,bm as St}from"./index-D2cfJZTd.js";import{e as jt,d as Ce,m as me,s as Ct,f as Et,r as Tt,h as Nt,a as $e,P as Pe}from"./RichTextEditor.gallery-CGKJnvNr.js";import{P as qt}from"./plus-CISKiVA7.js";import{R as Lt}from"./rotate-ccw-BQJEkYcJ.js";import{D as Fe,T as fe}from"./TagBadge-D0BeKr7D.js";import{T as Re}from"./trash-2-D8yyIb3G.js";import{P as Ee}from"./pencil-BSE91oJ3.js";import{E as Mt}from"./external-link-WE0wDJZD.js";import{T as $t}from"./triangle-alert-VGAvk7Rv.js";const Pt=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],Ft=Me("paperclip",Pt);const Dt=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],zt=Me("reply",Dt);async function Ot(e){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),!0}catch{}const r=document.createElement("textarea");r.value=e,r.setAttribute("readonly",""),r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select();try{return document.execCommand("copy")}finally{r.remove()}}const Gt={black:0,darkgray:169,darkgrey:169,dimgray:105,dimgrey:105,gainsboro:220,gray:128,grey:128,lightgray:211,lightgrey:211,silver:192,white:255,whitesmoke:245},pe="data-capubbs-original-grayscale-color-attr",he="data-capubbs-original-grayscale-style-color";function Ht(e){const r=String(e??"").trim().toLowerCase().replace(/^['"]|['"]$/g,""),a=r.replace(/\s+/g,""),o=Gt[a];if(typeof o=="number")return{alpha:1,channel:o};const n=a.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);if(n){const i=n[1].length<=4?n[1].split("").map(k=>`${k}${k}`).join(""):n[1],f=Number.parseInt(i.slice(0,2),16),p=Number.parseInt(i.slice(2,4),16),A=Number.parseInt(i.slice(4,6),16),y=i.length===8?Number.parseInt(i.slice(6,8),16)/255:1;return f===p&&p===A?{alpha:y,channel:f}:null}const u=r.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*(?:,|\/)\s*([01](?:\.\d+)?|\.\d+|100%|\d{1,3}(?:\.\d+)?%))?\s*\)$/);if(!u)return null;const l=be(u[1]),c=be(u[2]),d=be(u[3]),b=Wt(u[4]);return l===null||c===null||d===null||b===null?null:l===c&&c===d?{alpha:b,channel:l}:null}function De(e,r=!0){const a=Ht(e);if(!a)return null;const o=255-a.channel;if(r&&a.alpha<1)return`rgba(${o}, ${o}, ${o}, ${Yt(a.alpha)})`;const n=o.toString(16).padStart(2,"0");return`#${n}${n}${n}`}function Ut(e,r){[...e.matches("[color], [style]")?[e]:[],...Array.from(e.querySelectorAll("[color], [style]"))].forEach(o=>{_t(o,r),o instanceof HTMLElement&&Bt(o,r)})}function _t(e,r){const a=e.getAttribute(pe);if(r==="light"){if(a===null)return;e.setAttribute("color",a),e.removeAttribute(pe);return}const o=a??e.getAttribute("color"),n=De(o,!1);!n||o===null||(a===null&&e.setAttribute(pe,o),e.getAttribute("color")!==n&&e.setAttribute("color",n))}function Bt(e,r){const a=e.getAttribute(he);if(r==="light"){if(a===null)return;e.style.setProperty("color",a,e.style.getPropertyPriority("color")),e.removeAttribute(he);return}const o=a??e.style.getPropertyValue("color"),n=De(o);!n||!o||(a===null&&e.setAttribute(he,o),e.style.getPropertyValue("color")!==n&&e.style.setProperty("color",n,e.style.getPropertyPriority("color")))}function be(e){const r=e.endsWith("%"),a=Number(r?e.slice(0,-1):e);return Number.isFinite(a)?r?a>=0&&a<=100?Math.round(a*2.55):null:a>=0&&a<=255?Math.round(a):null:null}function Wt(e){if(e===void 0)return 1;const r=e.endsWith("%"),a=Number(r?e.slice(0,-1):e);return Number.isFinite(a)?r?a>=0&&a<=100?a/100:null:a>=0&&a<=1?a:null:null}function Yt(e){return Number(e.toFixed(3))}function ze({className:e="",html:r,onImageOpen:a,variant:o}){const n=s.useRef(null),{theme:u}=at(),l=s.useMemo(()=>({__html:r}),[r]);if(s.useLayoutEffect(()=>{const i=n.current;i&&(jt(i),Ut(i,u))},[r,u]),s.useLayoutEffect(()=>{const i=n.current;if(i)return nt(i)},[r]),s.useEffect(()=>{const i=n.current;if(!i)return;const f=Array.from(i.querySelectorAll("img")),p=y=>{y.dataset.capubbsImageLoaded="true"},A=f.map(y=>{if(y.complete)return p(y),null;const k=()=>p(y);return y.addEventListener("load",k,{once:!0}),y.addEventListener("error",k,{once:!0}),{handleLoad:k,image:y}});return()=>{A.forEach(y=>{y&&(y.image.removeEventListener("load",y.handleLoad),y.image.removeEventListener("error",y.handleLoad))})}},[r]),!r)return null;function c(i,f){if(!a||!(i instanceof Element))return;const p=i.closest("img");if(!(p instanceof HTMLImageElement))return;const A=p.closest(".capubbs-gallery"),y=A?Array.from(A.querySelectorAll('[data-capubbs-gallery-slide="true"] img')):Array.from(f.querySelectorAll("img")).filter(I=>!I.closest(".capubbs-gallery")),k=y.indexOf(p);if(k<0)return;const $=y.map(I=>Vt(I,f)),F=y.map((I,j)=>{const P=$[j];return{alt:I.alt.trim(),element:I,src:I.currentSrc||I.src,...P?{galleryId:P.galleryId,galleryIndex:P.galleryIndex}:{}}});a(F,k,p,I=>{const j=$[I];j&&Ct(j.gallery,j.galleryIndex)})}function d(i){const f=Ce(i.target);if(f&&i.target instanceof Element){i.preventDefault(),i.stopPropagation(),me(i.target,f);return}!a||!(i.target instanceof HTMLImageElement)||(i.preventDefault(),c(i.target,i.currentTarget))}function b(i){const f=Ce(i.target);if(f&&["Enter"," "].includes(i.key)&&i.target instanceof Element){i.preventDefault(),me(i.target,f);return}if(["ArrowLeft","ArrowRight"].includes(i.key)&&i.target instanceof Element&&i.target.closest(".capubbs-gallery")){i.preventDefault(),me(i.target,i.key==="ArrowLeft"?"prev":"next");return}!a||!(i.target instanceof HTMLImageElement)||!["Enter"," "].includes(i.key)||(i.preventDefault(),c(i.target,i.currentTarget))}return t.jsx("div",{ref:n,className:`forum-markup forum-markup-${o} ${e}`.trim(),"data-forum-markup":o,dangerouslySetInnerHTML:l,onClick:d,onKeyDown:b})}function Vt(e,r){const a=e.closest(".capubbs-gallery");if(!a||!r.contains(a))return null;const n=Array.from(r.querySelectorAll(".capubbs-gallery")).indexOf(a),l=Array.from(a.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(e);return n>=0&&l>=0?{gallery:a,galleryId:n,galleryIndex:l}:null}const _=1,Oe=4,ce=.25;function Kt(e){return Math.min(Oe,Math.max(_,e))}function ye(e){const[r,a]=[...e.values()];return!r||!a?null:Math.hypot(a.x-r.x,a.y-r.y)}function Jt({images:e,initialImageIndex:r,onImageChange:a,onClose:o}){const n=Math.min(Math.max(0,r),Math.max(0,e.length-1)),[u,l]=s.useState(n),[c,d]=s.useState(_),[b,i]=s.useState({x:0,y:0}),[f,p]=s.useState(!1),A=s.useRef(null),y=s.useRef(null),k=s.useRef(null),$=s.useRef(null),F=s.useRef(n),S=s.useRef(_),I=s.useRef({x:0,y:0}),j=s.useRef(null),P=s.useRef(!1),C=s.useRef(new Map),D=s.useRef(null),X=s.useRef(_),ee=s.useRef(a),G=s.useRef(o);ee.current=a,G.current=o;function B(m,v=S.current){const w=A.current,q=k.current;if(!w||!q||v<=_)return{x:0,y:0};const Y=Math.max(0,(q.clientWidth*v-w.clientWidth)/2),L=Math.max(0,(q.clientHeight*v-w.clientHeight)/2);return{x:Math.min(Y,Math.max(-Y,m.x)),y:Math.min(L,Math.max(-L,m.y))}}function K(m,v=S.current){const w=B(m,v);I.current=w,i(w)}function x(m){const v=Math.round(Kt(m)*100)/100;S.current=v,d(v),K(I.current,v)}function J(){S.current=_,I.current={x:0,y:0},d(_),i({x:0,y:0})}function R(m){const v=Math.min(Math.max(0,m),e.length-1);v!==F.current&&(F.current=v,l(v),J(),ee.current?.(v))}function E(){G.current(F.current)}s.useEffect(()=>{const m=document.body.style.overflow,v=document.activeElement,w=A.current;document.body.style.overflow="hidden",$.current?.focus();function q(h){if(h.key==="Escape"){h.preventDefault(),E();return}if(h.key==="ArrowLeft"){h.preventDefault(),h.stopPropagation(),R(F.current-1);return}if(h.key==="ArrowRight"){h.preventDefault(),h.stopPropagation(),R(F.current+1);return}if(h.key==="+"||h.key==="="){h.preventDefault(),h.stopPropagation(),x(S.current+ce);return}if(h.key==="-"){h.preventDefault(),h.stopPropagation(),x(S.current-ce);return}if(h.key==="0"){h.preventDefault(),h.stopPropagation(),J();return}if(h.key==="Tab"){const V=y.current?.querySelectorAll("button:not(:disabled)");if(!V?.length)return;const re=V[0],oe=V[V.length-1],ae=document.activeElement;if(h.shiftKey&&ae===re){h.preventDefault(),oe.focus();return}if(!h.shiftKey&&ae===oe){h.preventDefault(),re.focus();return}y.current?.contains(ae)||(h.preventDefault(),re.focus())}}function Y(h){if(h.preventDefault(),h.stopPropagation(),h.deltaY===0)return;const V=h.ctrlKey?.01:.002;x(S.current*Math.exp(-h.deltaY*V))}function L(h){h.preventDefault(),h.stopPropagation(),X.current=S.current}function U(h){if(h.preventDefault(),h.stopPropagation(),C.current.size>=2)return;const V=h.scale;typeof V=="number"&&x(X.current*V)}function te(){K(I.current,S.current)}return document.addEventListener("keydown",q,{capture:!0}),window.addEventListener("resize",te),w?.addEventListener("wheel",Y,{passive:!1}),w?.addEventListener("gesturestart",L,{passive:!1}),w?.addEventListener("gesturechange",U,{passive:!1}),w?.addEventListener("gestureend",U,{passive:!1}),()=>{document.removeEventListener("keydown",q,{capture:!0}),window.removeEventListener("resize",te),w?.removeEventListener("wheel",Y),w?.removeEventListener("gesturestart",L),w?.removeEventListener("gesturechange",U),w?.removeEventListener("gestureend",U),document.body.style.overflow=m,v instanceof HTMLElement&&v.focus()}},[]);function T(m,v,w){j.current={pointerId:m,startX:v,startY:w,originX:I.current.x,originY:I.current.y},p(!0)}function N(m){if(m.target instanceof Element&&m.target.closest("button, .thread-image-lightbox-controls"))return;const v=m.pointerType==="touch",w=m.pointerType==="mouse"&&m.button===0;if(!(!v&&!w)&&(P.current=!1,!(!v&&S.current<=_))){if(m.preventDefault(),m.currentTarget.setPointerCapture(m.pointerId),v&&(C.current.set(m.pointerId,{x:m.clientX,y:m.clientY}),C.current.size===2)){D.current=ye(C.current),j.current=null,p(!1);return}S.current>_&&T(m.pointerId,m.clientX,m.clientY)}}function z(m){const v=C.current.has(m.pointerId),w=j.current;if(!v&&w?.pointerId!==m.pointerId)return;if(m.preventDefault(),m.stopPropagation(),v&&C.current.set(m.pointerId,{x:m.clientX,y:m.clientY}),C.current.size===2){const L=ye(C.current),U=D.current;if(!L||!U){D.current=L;return}Math.abs(L-U)>1&&(P.current=!0),x(S.current*(L/U)),D.current=L;return}if(!w||S.current<=_)return;const q=m.clientX-w.startX,Y=m.clientY-w.startY;Math.hypot(q,Y)>3&&(P.current=!0),K({x:w.originX+q,y:w.originY+Y})}function W(m){const v=C.current.delete(m.pointerId),w=j.current?.pointerId===m.pointerId;if(!(!v&&!w)){if(D.current=C.current.size===2?ye(C.current):null,C.current.size===1&&S.current>_){const[q]=C.current.entries();if(q){const[Y,L]=q;T(Y,L.x,L.y)}}else j.current=null,p(!1);m.currentTarget.hasPointerCapture(m.pointerId)&&m.currentTarget.releasePointerCapture(m.pointerId)}}const le=Math.round(c*100),H=e[u]??e[0];return H?ot.createPortal(t.jsx("div",{className:"thread-image-lightbox-backdrop","data-can-pan":c>_,"data-dragging":f,onClick:m=>{if(P.current)return;const v=m.target;v instanceof Element&&v.closest("img, button, .thread-image-lightbox-controls")||E()},onPointerCancel:W,onPointerDown:N,onPointerMove:z,onPointerUp:W,ref:A,role:"presentation",children:t.jsxs("figure",{"aria-label":H.alt?`图片预览：${H.alt}（${u+1}/${e.length}）`:`图片预览（${u+1}/${e.length}）`,"aria-modal":"true",className:"thread-image-lightbox",ref:y,role:"dialog",children:[t.jsx("button",{"aria-label":"关闭图片预览",className:"thread-image-lightbox-close",onClick:E,ref:$,type:"button",children:t.jsx(Ae,{size:20})}),e.length>1&&t.jsxs(t.Fragment,{children:[t.jsx("button",{"aria-label":"上一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-prev",disabled:u===0,onClick:()=>R(u-1),title:"上一张（←）",type:"button",children:t.jsx(it,{size:28})}),t.jsx("button",{"aria-label":"下一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-next",disabled:u===e.length-1,onClick:()=>R(u+1),title:"下一张（→）",type:"button",children:t.jsx(st,{size:28})})]}),t.jsx(Xt,{image:H,imageRef:k,onReady:()=>K(I.current,S.current),transform:`translate3d(${b.x}px, ${b.y}px, 0) scale(${c})`}),H.alt&&t.jsx("figcaption",{children:H.alt}),t.jsxs("div",{"aria-label":"图片缩放",className:"thread-image-lightbox-controls",role:"toolbar",children:[t.jsx("button",{"aria-label":"缩小图片",disabled:c<=_,onClick:()=>x(c-ce),title:"缩小（-）",type:"button",children:t.jsx(Et,{size:18})}),t.jsxs("output",{"aria-label":"当前缩放比例","aria-live":"polite",children:[le,"%"]}),t.jsx("button",{"aria-label":"放大图片",disabled:c>=Oe,onClick:()=>x(c+ce),title:"放大（+）",type:"button",children:t.jsx(qt,{size:18})}),t.jsx("button",{"aria-label":"恢复原始大小",disabled:c===_,onClick:J,title:"恢复原始大小（0）",type:"button",children:t.jsx(Lt,{size:17})})]})]})}),document.body):null}function Xt({image:e,imageRef:r,onReady:a,transform:o}){const n=s.useRef(null),u=s.useRef(a);return u.current=a,s.useLayoutEffect(()=>{const l=e.element,c=n.current,d=l?.parentNode;if(!l||!c?.parentNode||!d)return;const b=l.ownerDocument.createComment("capubbs-lightbox-image"),i=l.getAttribute("style"),f=l.getAttribute("draggable");d.insertBefore(b,l),c.parentNode.insertBefore(l,c),l.draggable=!1,r.current=l;const p=()=>u.current();return l.addEventListener("load",p),l.complete&&p(),()=>{l.removeEventListener("load",p),i===null?l.removeAttribute("style"):l.setAttribute("style",i),f===null?l.removeAttribute("draggable"):l.setAttribute("draggable",f),b.parentNode?.insertBefore(l,b),b.remove(),r.current===l&&(r.current=null)}},[e,r]),s.useLayoutEffect(()=>{e.element&&(e.element.style.transform=o)},[e,o]),e.element?t.jsx("span",{hidden:!0,ref:n}):t.jsx("img",{alt:e.alt,draggable:"false",onLoad:a,ref:r,src:e.src,style:{transform:o}})}const Qt=':root{--surface: #fffefa;--surface-raised: #ffffff;--surface-soft: #f6f8f4;--text: #20231f;--text-strong: #111411;--text-muted: #687068;--text-faint: #919991;--line: #e1e6df;--line-strong: #cdd5cc;--brand: #236b4c;--brand-strong: #174f38;--danger: #b8473f}:root.dark{--surface: #171d19;--surface-raised: #1c241f;--surface-soft: #1f2822;--text: #dde5de;--text-strong: #f6faf6;--text-muted: #a0aca2;--text-faint: #748078;--line: #2c362f;--line-strong: #3c493f;--brand: #69b98d;--brand-strong: #8bcca6;--danger: #ef8178}::-moz-selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}::selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentcolor}blockquote,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}a{color:inherit;text-decoration:inherit}button{margin:0;padding:0;background-color:transparent;color:inherit;font:inherit;letter-spacing:inherit;text-transform:none}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}.capubbs-html-frame-root iframe{background-color:transparent!important}img,video{max-width:100%;height:auto}table{border-color:inherit;border-collapse:collapse;text-indent:0}.capubbs-activity-signup-canceled,.capubbs-activity-signup-canceled *{color:var(--danger)!important;text-decoration-color:var(--danger)!important;text-decoration-line:line-through!important;text-decoration-thickness:2px!important}.forum-markup>:first-child{margin-top:0}.forum-markup>:last-child{margin-bottom:0}.forum-markup p,.forum-markup div{margin:0}.forum-markup-floor p{margin:0 0 .75em}.forum-markup-floor>div+div{margin-top:.55em}.forum-markup a{color:var(--brand-strong);font-weight:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.16em}.forum-markup .forum-mention{text-decoration:none}.forum-markup blockquote{margin:0 0 0 2em;border:0;padding:0;background:transparent;color:inherit}.forum-markup blockquote.forum-quote,.forum-markup .forum-legacy-quote,.forum-markup blockquote.capubbs-floor-quote{margin:.8em 0;border-left:3px solid color-mix(in srgb,var(--brand) 38%,var(--line));padding:.55em .75em;background:var(--surface-soft);color:var(--text-muted)}.forum-markup .capubbs-floor-quote-jump{margin-left:.75em}.forum-markup .forum-legacy-quote-content{margin:0}.forum-markup h1,.forum-markup h2,.forum-markup h3,.forum-markup h4,.forum-markup h5,.forum-markup h6{margin:.9rem 0 .45rem;color:var(--brand-strong);font-weight:800;line-height:1.35}.forum-markup h1{font-size:1.45rem}.forum-markup h2{font-size:1.25rem}.forum-markup h3{font-size:1.1rem}.forum-markup h4,.forum-markup h5,.forum-markup h6{font-size:1em}.forum-markup ul,.forum-markup ol{margin:.65em 0;padding-left:1.45em}.forum-markup ul{list-style:disc}.forum-markup ol{list-style:decimal}.forum-markup ol.capubbs-ordered-list-alpha{list-style-type:lower-alpha}.forum-markup ol.capubbs-ordered-list-roman{list-style-type:lower-roman}.forum-markup pre{max-width:100%;overflow-x:auto;margin:.75em 0;border-radius:2px;padding:.75em;background:#182531;color:#f8fafc;white-space:pre-wrap}.forum-markup code,.forum-markup kbd{border-radius:2px;padding:.08em .25em;background:color-mix(in srgb,var(--surface-soft) 75%,var(--line));font-family:SFMono-Regular,Cascadia Code,Consolas,monospace;font-size:.9em}.forum-markup pre code{padding:0;background:transparent;color:inherit}.forum-markup font[size="1"]{font-size:11px}.forum-markup font[size="2"]{font-size:13px}.forum-markup font[size="3"]{font-size:15px}.forum-markup font[size="4"]{font-size:17px}.forum-markup font[size="5"]{font-size:19px}.forum-markup font[size="6"]{font-size:21px}.forum-markup font[size="7"]{font-size:23px}.forum-markup hr{margin:.9em 0;border:0;border-top:1px solid var(--line-strong)}.forum-markup img{display:inline-block;height:auto;max-width:100%;vertical-align:middle}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){background-color:color-mix(in srgb,var(--surface-soft) 82%,var(--line));background-image:linear-gradient(105deg,transparent 20%,color-mix(in srgb,var(--surface-raised) 70%,transparent) 45%,transparent 70%);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}.forum-markup img[role=button]{cursor:zoom-in}.forum-markup img[role=button]:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse}.forum-markup td,.forum-markup th{border:1px solid var(--line);padding:.35em .5em}.forum-markup-signature{color:#999;font-family:monospace;font-size:14px;line-height:1.6;overflow-wrap:anywhere}:root.dark .forum-markup-signature{color:#666}.forum-markup .capubbs-gallery{position:relative;display:block;width:100%;margin:.9rem 0;overflow:hidden;border:1px solid var(--line);border-radius:2px;background:transparent;color:var(--text)}.forum-markup .capubbs-gallery:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup .capubbs-gallery-header{position:relative;display:flex;min-height:44px;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:9px 12px;border-bottom:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-title{width:100%;min-width:0;margin:0;color:var(--text-strong);font-size:.82rem;font-weight:760;line-height:1.4;text-align:center}.forum-markup .capubbs-gallery-stage{position:relative;display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide{display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-slide>img{display:block;width:100%;height:var(--capubbs-gallery-image-height, clamp(280px, 52vw, 560px));max-width:none;margin:0 auto;border-radius:0;-o-object-fit:contain;object-fit:contain}.forum-markup .capubbs-gallery-caption{display:block;margin:0;color:var(--text-muted);font-size:.78rem;line-height:1.55;text-align:center}.forum-markup .capubbs-gallery-caption[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-footer{position:relative;display:flex;min-height:44px;align-items:center;justify-content:center;margin:0;padding:9px 12px;border-top:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-captions{width:100%;min-width:0;margin:0;padding-inline:48px;text-align:center}.forum-markup .capubbs-gallery-count{position:absolute;top:50%;right:12px;color:var(--text-faint);font-size:.72rem;font-variant-numeric:tabular-nums;font-weight:760;line-height:1.25;transform:translateY(-50%)}.forum-markup .capubbs-gallery-count[data-capubbs-gallery-current]:before{content:attr(data-capubbs-gallery-current) "/" attr(data-capubbs-gallery-total)}.forum-markup .capubbs-gallery-nav{position:absolute;z-index:4;top:50%;display:grid;width:36px;height:48px;place-items:center;padding:0;transform:translateY(-50%);border:1px solid rgb(255 255 255 / .25);border-radius:2px;background:#00000080;color:#fff;cursor:pointer;transition:.15s ease}.forum-markup .capubbs-gallery-nav:hover{background:#000000b8}.forum-markup .capubbs-gallery-nav:focus-visible{outline:2px solid #fff;outline-offset:2px}.forum-markup .capubbs-gallery-nav:before{font-family:Arial,sans-serif;font-size:2rem;font-weight:300;line-height:1}.forum-markup .capubbs-gallery-nav-prev:before{content:"‹"}.forum-markup .capubbs-gallery-nav-next:before{content:"›"}.forum-markup .capubbs-gallery-nav-prev{left:10px}.forum-markup .capubbs-gallery-nav-next{right:10px}@keyframes capubbs-image-loading{0%{background-position:120% 0}to{background-position:-80% 0}}@media(max-width:640px){.forum-markup .capubbs-gallery-slide>img{height:var(--capubbs-gallery-image-height, min(72vw, 420px))}.forum-markup .capubbs-gallery-nav{width:32px;height:42px}.forum-markup .capubbs-gallery-nav-prev{left:7px}.forum-markup .capubbs-gallery-nav-next{right:7px}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){animation:none}}',Te=64*1024*1024,se=new Map,de=new Map,ne=new Map;let ve=0,Ie=0,xe=!1;function Z(){xe||!ne.size||(xe=!0,setTimeout(()=>{xe=!1;const e=[];ne.forEach((r,a)=>{const o=r.priorities.map(n=>n());if(o.every(n=>n===null)){ne.delete(a),se.delete(a),r.reject(new DOMException("图片所在内容已卸载","AbortError"));return}e.push({source:a,request:r,priority:o.includes("high")?"high":"low"})}),e.sort((r,a)=>+(a.priority==="high")-+(r.priority==="high"));for(const{source:r,request:a,priority:o}of e){if(ve>=6)break;o==="low"&&Ie>=2||(ne.delete(r),ve+=1,o==="low"&&(Ie+=1),a.start(o))}},0))}function Ge(e){return new URL(e,new URL("/bbs/content/",window.location.origin)).href}function Zt(e,r=()=>"high"){const a=Ge(e),o=new URL(a);if(o.origin!==window.location.origin||!o.pathname.startsWith("/bbs/images/")&&!o.pathname.startsWith("/bbsimg/"))return Promise.reject(new Error("仅代理论坛图片目录"));const n=se.get(a);if(n)return ne.get(a)?.priorities.push(r),Z(),n;const u=new Promise((l,c)=>{ne.set(a,{priorities:[r],reject:c,start:d=>{er(a,d).then(l,c).finally(()=>{ve-=1,d==="low"&&(Ie-=1),Z()})}})});return se.set(a,u),Z(),u}function er(e,r){return fetch(e,{credentials:"same-origin",referrerPolicy:"no-referrer",priority:r}).then(async a=>{if(!a.ok)throw new Error(`图片加载失败：${a.status}`);if(!(a.headers.get("content-type")?.toLowerCase()??"").startsWith("image/"))throw new Error("图片响应类型无效");const n=Number.parseInt(a.headers.get("content-length")??"",10);if(Number.isFinite(n)&&n>Te)throw new Error("图片大小超出限制");const u=await a.blob();if(u.size>Te)throw new Error("图片大小超出限制");const l={blob:u,objectUrl:URL.createObjectURL(u),sourceUrl:e};return de.set(e,l),l}).catch(a=>{throw se.delete(e),a})}function tr(e){try{return de.get(Ge(e))?.objectUrl}catch{return}}typeof window<"u"&&(window.addEventListener("scroll",Z,{passive:!0}),window.addEventListener("resize",Z),window.addEventListener("pagehide",e=>{e.persisted||(de.forEach(r=>URL.revokeObjectURL(r.objectUrl)),de.clear(),se.clear())}));function rr(e,r,a){return r.some(o=>o.right>o.left&&o.bottom>o.top&&e.top+o.bottom>Math.max(0,e.top)&&e.top+o.top<Math.min(a.height,e.bottom)&&e.left+o.right>Math.max(0,e.left)&&e.left+o.left<Math.min(a.width,e.right))?"high":"low"}const ar=28,nr=64,or=5e4,ir=30,He=30,O="capubbs-thread-html-frame",Ue=new URL("/bbs/lib/jquery.min.js",window.location.origin).href,sr=br(Qt),lr=/\son[a-z][\w:-]*\s*=/i;let ue=null;function Ne({className:e="",floor:r,html:a,isActivitySignupCanceled:o=!1,onImageOpen:n,onIsolatedTextSelection:u,variant:l}){const c=s.useMemo(()=>l==="signature"?Tt(a):a,[a,l]),d=ur(c,l==="signature"),b=lt(d),i=s.useMemo(()=>b?null:ct(d,{normalizeLegacyLineBreaks:l==="signature"}),[d,b,l]),f=s.useMemo(()=>ut(d),[d]);return!b&&i!==null?t.jsx(ze,{className:e,html:i,onImageOpen:n,variant:l}):t.jsx(cr,{className:e,floor:r,html:f,isActivitySignupCanceled:o,onImageOpen:n,onTextSelection:u,variant:l})}function cr({className:e,floor:r,html:a,isActivitySignupCanceled:o,onImageOpen:n,onTextSelection:u,variant:l}){const c=s.useRef(null),d=s.useRef(`${l}-${r}-${Math.random().toString(36).slice(2)}`),b=s.useRef(n);b.current=n;const i=s.useRef(u);i.current=u;const f=l==="signature"?ar:nr,p=!!n,[A,y]=s.useState(null),k=xr(),$=s.useRef(k),F=gt(),S=l==="signature"?14:F,I=s.useMemo(()=>fr(mr(a)),[a]),j=I.includes('type="text/capubbs-user-script"')||lr.test(I),P=s.useMemo(()=>dr({canOpenImages:p,frameId:d.current,needsJquery:j,html:I,isActivitySignupCanceled:o,isDarkTheme:$.current,fontSize:S,variant:l}),[p,I,S,o,j,l]),C=s.useMemo(()=>`data:text/html;charset=utf-8,${encodeURIComponent(P)}`,[P]),D=s.useCallback(()=>{c.current?.contentWindow?.postMessage({frameId:d.current,source:O,theme:k?"dark":"light",type:"theme"},"*")},[k]),X=s.useCallback((G=c.current?.contentWindow)=>{!j||!G||qe().then(B=>{c.current?.contentWindow===G&&G.postMessage({frameId:d.current,jquerySource:B,source:O,type:"jquery-response"},"*")})},[j]),ee=s.useCallback(()=>{D(),X()},[X,D]);return s.useEffect(()=>{y(null)},[C]),s.useEffect(()=>{D()},[D]),s.useEffect(()=>{j&&qe()},[j]),s.useLayoutEffect(()=>{Z()},[A]),s.useLayoutEffect(()=>{let G=!0;const B=new Map;function K(x){const J=c.current?.contentWindow;if(!(!J||x.source!==J||!yr(x.data))&&x.data.frameId===d.current){if(x.data.type==="jquery-request"){X(J);return}if(x.data.type==="image-resource-layout"){B.has(x.data.requestId)&&(B.set(x.data.requestId,x.data.bounds),Z());return}if(x.data.type==="image-resource-request"){const R=J,E=x.data.requestId;B.set(E,x.data.bounds);const T=()=>{const N=c.current;return!G||!N||N.contentWindow!==R?null:rr(N.getBoundingClientRect(),B.get(E)??[],{width:window.innerWidth,height:window.innerHeight})};Zt(x.data.url,T).then(N=>{!G||c.current?.contentWindow!==R||R.postMessage({blob:N.blob,priority:T(),frameId:d.current,requestId:x.data.requestId,source:O,type:"image-resource-response"},"*")}).catch(()=>{!G||c.current?.contentWindow!==R||R.postMessage({priority:T(),frameId:d.current,requestId:x.data.requestId,source:O,type:"image-resource-error"},"*")}).finally(()=>B.delete(E));return}if(x.data.type==="anchor"){const R=c.current;if(!R)return;const E=window.getComputedStyle(document.documentElement),T=Number.parseFloat(E.getPropertyValue("--topbar-height"))||0,N=window.scrollY+R.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,N+x.data.offsetTop-T-16)});return}if(x.data.type==="navigate"){const R=mt(x.data.url,_e());if(!R)return;window.history.pushState(null,"",R),window.dispatchEvent(new Event(ft));const E=new URL(R,window.location.origin);E.hash?window.requestAnimationFrame(()=>{const T=decodeURIComponent(E.hash.slice(1)),N=pt(`#${T}`);(N?ht(N):document.getElementById(T))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(x.data.type==="image-open"){const R=c.current;if(!R)return;const E=Array.from(R.contentDocument?.querySelectorAll("img")??[]),T=x.data.images.map(z=>({...z,element:typeof z.elementIndex=="number"?E[z.elementIndex]:void 0,src:tr(z.src)??z.src})),N=z=>{const W=T[z];!W||typeof W.galleryId!="number"||!Number.isSafeInteger(W.galleryIndex)||R.contentWindow?.postMessage({frameId:d.current,galleryId:W.galleryId,galleryIndex:W.galleryIndex,source:O,type:"gallery-select"},"*")};b.current?.(T,x.data.imageIndex,R,N);return}if(x.data.type==="selection"){x.data.text&&window.getSelection()?.removeAllRanges(),i.current?.(x.data.text);return}y(Math.min(or,Math.max(f,Math.ceil(x.data.height))))}}return window.addEventListener("message",K),()=>{G=!1,B.clear(),window.removeEventListener("message",K),Z()}},[C,f,X]),t.jsx("iframe",{ref:c,className:`thread-html-frame thread-html-frame-${l} ${e}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-same-origin allow-downloads",scrolling:"no",src:C,onLoad:ee,style:{"--thread-html-frame-width-allowance":`${He}px`,...A===null?{}:{"--thread-html-frame-height":`${A}px`}},title:l==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`})}function ur(e,r){const[a,o]=s.useState(e);return s.useEffect(()=>{const n=new AbortController,u=r?Nt(e):[];if(o(e),u.length===0)return()=>n.abort();const l=Array.from(new Map(u.map(c=>[`${c.bid}:${c.tid}:${c.pid}`,c])).values());return Promise.all(l.map(async c=>{try{const d=await dt(c,n.signal);return[`${c.bid}:${c.tid}:${c.pid}`,d]}catch(d){if(d instanceof DOMException&&d.name==="AbortError")throw d;return[`${c.bid}:${c.tid}:${c.pid}`,""]}})).then(c=>{if(n.signal.aborted)return;const d=new Map(c);let b=e;u.forEach(i=>{const f=d.get(`${i.bid}:${i.tid}:${i.pid}`);f&&(b=b.replace(i.marker,f))}),o(b)}).catch(()=>{}),()=>n.abort()},[r,e]),a}function dr({canOpenImages:e,frameId:r,fontSize:a,needsJquery:o,html:n,isActivitySignupCanceled:u,isDarkTheme:l,variant:c}){const d=c==="signature",b=d?"#999999":"rgb(63 63 70)",i=d?"#666666":"rgb(228 228 231)",f=d?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",p=d?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",A=u?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${l?"dark":"light"}" style="background:transparent;color-scheme:${l?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${hr(_e())}">
  <meta http-equiv="Content-Security-Policy" content="${pr()}">
  <style>${sr}</style>
  <style>
    html{--capubbs-frame-text-color:${b}}html.dark{--capubbs-frame-text-color:${i}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${f};font-size:${a}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${He}px);${p}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${gr(r,e,o)}<\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${c}${A}">${n}</main></body>
</html>`}function gr(e,r,a){return`(function(){
    var frameId=${JSON.stringify(e)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(bt)};
    var canOpenImages=${JSON.stringify(r)};
    var needsJquery=${JSON.stringify(a)};
    var jquerySourceUrl=${JSON.stringify(Ue)};
    var forumAppExactPaths=${JSON.stringify(yt)};
    var forumAppPathPrefixes=${JSON.stringify(xt)};
    var legacyForumExactPaths=${JSON.stringify(vt)};
    var legacyForumPathPatterns=${JSON.stringify(It)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${ir};
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
      window.parent.postMessage({source:'${O}',type:'resize',frameId:frameId,height:height},'*');
      Object.keys(imageResourceRequests).forEach(function(requestId){reportImageResourceLayout(requestId);});
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
      window.parent.postMessage({source:'${O}',type:'selection',frameId:frameId,text:text},'*');
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
        window.parent.postMessage({source:'${O}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${O}',type:'navigate',frameId:frameId,url:url},'*');
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
      window.parent.postMessage({source:'${O}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
      window.parent.postMessage({source:'${O}',type:'image-resource-layout',frameId:frameId,requestId:requestId,bounds:getImageResourceBounds(request.images)},'*');
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
          source:'${O}',
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
      if(event.source!==window.parent||!data||data.source!=='${O}'||data.frameId!==frameId)return;
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
      if(needsJquery)window.parent.postMessage({source:'${O}',type:'jquery-request',frameId:frameId},'*');
      else executeUserScripts();
      requestImageResources();
      prepareImages();
      prepareGalleries();
      syncGrayscaleTextColors(contentRoot);
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`}function mr(e){return e.replace(/<script\b([^>]*)>/gi,(r,a)=>`<script${a.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function fr(e){if(!/<img\b/i.test(e))return e;const r=document.createElement("template");return r.innerHTML=e,r.content.querySelectorAll("img[src]").forEach(a=>{const o=a.getAttribute("src")?.trim()??"";!o||/^(?:blob:|data:)/i.test(o)||(a.dataset.capubbsImageResourceSrc=o,a.setAttribute("fetchpriority","low"),a.removeAttribute("src"),a.removeAttribute("srcset"),a.closest("picture")?.querySelectorAll("source[srcset]").forEach(n=>{n.removeAttribute("srcset")}))}),r.innerHTML}function qe(){return ue||(ue=fetch(Ue,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw new Error(`Failed to load jQuery: ${e.status}`);return e.text()}).catch(()=>null),ue)}function pr(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'","upgrade-insecure-requests"].join("; ")}function _e(){return new URL("/bbs/content/",window.location.origin).href}function hr(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function br(e){return e.replace(/<\/style/gi,"<\\/style")}function yr(e){if(!e||typeof e!="object")return!1;const r=e;return r.source!==O||typeof r.frameId!="string"?!1:r.type==="anchor"?typeof r.offsetTop=="number"&&Number.isFinite(r.offsetTop)&&r.offsetTop>=0:r.type==="navigate"?typeof r.url=="string":r.type==="jquery-request"?!0:r.type==="image-resource-request"||r.type==="image-resource-layout"?typeof r.requestId=="string"&&r.requestId.length>0&&Array.isArray(r.bounds)&&r.bounds.every(a=>a&&["top","bottom","left","right"].every(o=>typeof a[o]=="number"&&Number.isFinite(a[o])))&&(r.type==="image-resource-layout"||"url"in r&&typeof r.url=="string"&&r.url.length>0):r.type==="selection"?typeof r.text=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(a=>!!a&&typeof a=="object"&&typeof a.alt=="string"&&typeof a.elementIndex=="number"&&Number.isSafeInteger(a.elementIndex)&&a.elementIndex>=0&&typeof a.src=="string"&&a.src.length>0&&(a.galleryId===void 0&&a.galleryIndex===void 0||typeof a.galleryId=="number"&&Number.isSafeInteger(a.galleryId)&&a.galleryId>=0&&typeof a.galleryIndex=="number"&&Number.isSafeInteger(a.galleryIndex)&&a.galleryIndex>=0)):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function xr(){const[e,r]=s.useState(()=>document.documentElement.classList.contains("dark"));return s.useEffect(()=>{const a=document.documentElement,o=()=>r(a.classList.contains("dark")),n=new MutationObserver(o);return n.observe(a,{attributeFilter:["class"],attributes:!0}),()=>n.disconnect()},[]),e}function vr({attachments:e=[],bodyClassName:r="thread-floor-body",bodyFallback:a=null,bodyHtml:o,floor:n,isActivitySignupCanceled:u=!1,onImageOpen:l,onIsolatedTextSelection:c,signatureClassName:d="thread-signature",signatureHtml:b,signatureText:i}){const f=l?(p,A,y,k)=>{const $=p[A];$&&l([$],0,y,k?()=>k(A):void 0)}:void 0;return t.jsxs(t.Fragment,{children:[o?t.jsx(Ne,{className:r,floor:n,html:o,isActivitySignupCanceled:u,onImageOpen:l,onIsolatedTextSelection:c,variant:"floor"}):a,t.jsx(Ir,{attachments:e}),b?t.jsx(Ne,{className:d,floor:n,html:b,onImageOpen:f,variant:"signature"}):i?t.jsx("footer",{className:d,children:t.jsx("p",{children:i})}):null]})}function Ir({attachments:e}){return e.length===0?null:t.jsxs("section",{"aria-label":"附件",className:"thread-attachments",children:[t.jsxs("header",{className:"thread-attachments-heading",children:[t.jsx(Ft,{"aria-hidden":"true",size:14}),t.jsx("span",{children:"附件"}),t.jsx("small",{children:e.length})]}),t.jsx("ul",{children:e.map(r=>{const a=t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"thread-attachment-name",children:r.name}),t.jsx("small",{children:wr(r)}),r.exists!==!1&&t.jsx(wt,{"aria-hidden":"true",size:15})]});return t.jsx("li",{children:r.exists===!1?t.jsx("div",{"aria-disabled":"true",className:"thread-attachment-link is-unavailable",children:a}):t.jsx("a",{className:"thread-attachment-link",download:r.name,href:r.downloadHref||`/bbs/download/?id=${encodeURIComponent(r.id)}`,children:a})},r.id)})})]})}function wr(e){if(e.exists===!1)return"文件不可用";const r=[Ar(e.size),(e.price??0)>0?"付费附件":"免费"];return e.downloadCount!==void 0&&r.push(`下载 ${e.downloadCount} 次`),r.join(" · ")}function Ar(e){if(e<=0)return"大小未知";if(e<1024)return`${e} B`;const r=["KB","MB","GB","TB"];let a=e,o=-1;do a/=1024,o+=1;while(a>=1024&&o<r.length-1);return`${a.toFixed(a>=10?1:2)} ${r[o]}`}function Rr({author:e,id:r}){const a=e.tags??[],[o,n]=s.useState(!1),u=s.useRef(null),l=s.useRef(null),c=s.useRef(null),d=s.useRef(null),b=a.map(i=>`${i.id}:${i.name}`).join("|");return s.useLayoutEffect(()=>{if(a.length===0){n(!1);return}const i=()=>{const p=u.current,A=l.current,y=c.current,k=d.current;if(!p||!A||!y||!k||p.offsetWidth===0)return;const $=y.getBoundingClientRect().width,F=k.getBoundingClientRect().width,S=Number.parseFloat(getComputedStyle(A).columnGap)||0,I=A.clientWidth-$-S,j=F>I+1;n(P=>P===j?P:j)};i();const f=new ResizeObserver(i);return[u.current,l.current,d.current].forEach(p=>{p&&f.observe(p)}),()=>f.disconnect()},[b,a.length]),t.jsxs("div",{id:r,ref:u,className:"author-hover-card",role:"dialog","aria-label":`${e.name} 的用户摘要`,children:[t.jsxs("div",{className:"author-card-head",children:[t.jsx("img",{src:e.avatar,alt:""}),t.jsxs("div",{className:"author-card-head-copy",children:[t.jsxs("div",{ref:l,className:"author-card-name-line","data-tags-overflow":o?"true":void 0,children:[t.jsx("strong",{ref:c,children:e.name}),t.jsx("div",{className:"author-card-tag-slot",children:t.jsx(fe,{size:"compact",tags:a})})]}),(e.stars>0||e.role)&&t.jsxs("span",{className:"author-card-status",children:["★".repeat(e.stars),e.stars>0&&e.role?" · ":"",e.role]})]})]}),o?t.jsx("div",{className:"author-card-tags-row",children:t.jsx(fe,{size:"compact",tags:a})}):null,e.medals?.length?t.jsx("div",{className:"author-card-medals",children:t.jsx(Pe,{medals:e.medals,profileName:e.name,variant:"compact"})}):null,t.jsx("div",{ref:d,className:"author-card-tag-width-measure","aria-hidden":"true",children:t.jsx(fe,{size:"compact",tags:a})}),t.jsxs("dl",{children:[t.jsxs("div",{children:[t.jsx("dt",{children:"主题"}),t.jsx("dd",{children:e.topics})]}),t.jsxs("div",{children:[t.jsx("dt",{children:"回复"}),t.jsx("dd",{children:e.replies})]}),t.jsxs("div",{children:[t.jsx("dt",{children:"签到"}),t.jsx("dd",{children:e.checkins})]})]}),t.jsxs("p",{children:["最近在线：",e.lastSeen]}),t.jsxs("a",{href:ie(e.name),children:["查看个人主页 ",t.jsx(Mt,{size:13})]})]})}function kr({author:e}){const r=e.tags??[],a=$e(r),o=ie(e.name);return t.jsxs("aside",{className:"thread-author-profile","aria-label":`${e.name} 的资料`,children:[t.jsx("a",{"aria-label":`查看${e.name}的个人主页`,className:"thread-author-profile-avatar",href:o,children:t.jsx("img",{src:e.avatar,alt:""})}),t.jsx("div",{className:"thread-author-profile-identity",children:t.jsx("a",{href:o,children:e.name})}),(e.stars>0||e.role)&&t.jsxs("div",{className:"thread-author-profile-status",children:[e.stars>0&&t.jsx("span",{"aria-label":`${e.stars} 星`,children:"★".repeat(e.stars)}),e.role&&t.jsx("strong",{children:e.role})]}),t.jsx(Fe,{tags:a}),t.jsx(Pe,{medals:e.medals??[],profileName:e.name,variant:"compact"}),t.jsxs("dl",{className:"thread-author-profile-stats",children:[t.jsxs("div",{children:[t.jsx("dt",{children:"主题"}),t.jsx("dd",{children:e.topics})]}),t.jsxs("div",{children:[t.jsx("dt",{children:"回复"}),t.jsx("dd",{children:e.replies})]}),t.jsxs("div",{children:[t.jsx("dt",{children:"签到"}),t.jsx("dd",{children:e.checkins})]})]}),t.jsxs("p",{className:"thread-author-profile-last-seen",children:[t.jsx("span",{children:"最近在线"}),t.jsx("strong",{children:e.lastSeen})]})]})}function we(e){return e.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function Sr(e){const r=window.getSelection()?.toString();r&&(e.preventDefault(),e.clipboardData.setData("text/plain",r))}function jr({articleAfterContent:e,author:r,avatarRail:a,className:o="",content:n,decorationImageSrc:u,editedAt:l,floor:c,floorIndex:d,id:b,inlineAvatar:i=!1,mainAfterContent:f,onCopy:p,publishedAt:A,showAuthorProfile:y}){const k=r.tags??[],$=$e(k);return t.jsxs("article",{className:`thread-floor${y?" thread-floor-with-author-profile":""}${o?` ${o}`:""}`,"data-floor":c,id:b,onCopy:p,children:[u&&t.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:t.jsx("img",{alt:"",src:u})}),y?t.jsx(kr,{author:r}):!i&&a,t.jsxs("div",{className:"thread-floor-main",children:[t.jsxs("header",{className:"thread-floor-header",children:[!y&&i&&a,t.jsxs("div",{className:"thread-floor-author",children:[t.jsx("a",{href:ie(r.name),children:r.name}),t.jsx(Fe,{tags:$})]}),t.jsxs("div",{className:"thread-floor-time",children:[t.jsx("time",{children:we(A)}),l&&t.jsxs(t.Fragment,{children:[t.jsx("span",{children:"·"}),t.jsxs("time",{children:["编辑于 ",we(l)]})]})]}),d]}),y?t.jsx("div",{className:"thread-floor-content",children:n}):n,f]}),e]})}function Cr({canDelete:e,canEdit:r,canQuote:a,canReply:o,decorative:n=!1,deleting:u=!1,editHref:l="",onDelete:c,onQuote:d,onReply:b}){const i=n?-1:void 0,f=s.useRef(null);return t.jsxs("div",{"aria-hidden":n||void 0,className:`thread-floor-actions${n?" thread-floor-actions-decorative":""}`,children:[a&&t.jsxs("button",{onClick:p=>{const A=f.current?f.current.text:Le(p.currentTarget);f.current=null,d?.(A)},onPointerDown:p=>{p.button===0&&(f.current={text:Le(p.currentTarget)})},tabIndex:i,type:"button",children:[t.jsx(kt,{size:15}),"引用"]}),o&&t.jsxs("button",{onClick:b,tabIndex:i,type:"button",children:[t.jsx(zt,{size:15}),"回复"]}),r&&(n?t.jsxs("button",{tabIndex:-1,type:"button",children:[t.jsx(Ee,{size:15}),"编辑"]}):t.jsxs("a",{href:l,children:[t.jsx(Ee,{size:15}),"编辑"]})),e&&t.jsxs("button",{"aria-busy":u||void 0,className:"floor-action-danger",disabled:!n&&u,onClick:n?void 0:p=>c?.(p.currentTarget),tabIndex:i,type:"button",children:[t.jsx(Re,{size:15}),u?"删除中":"删除"]})]})}function Gr({canQuote:e,canReply:r,decorationImageSrc:a,editHref:o,floor:n,isActivityThread:u,isMainPost:l,inlineAvatar:c,showAuthorProfile:d,hideSignature:b,onDeleteFloor:i,onDeleteNestedReply:f,onIsolatedTextSelection:p,onQuote:A,onSubmitNestedReply:y,viewer:k}){const[$,F]=s.useState(!1),[S,I]=s.useState(null),[j,P]=s.useState([]),[C,D]=s.useState(""),[X,ee]=s.useState(!1),[G,B]=s.useState([]),[K,x]=s.useState(""),[J,R]=s.useState(""),[E,T]=s.useState(null),[N,z]=s.useState(""),[W,le]=s.useState(!1),[H,m]=s.useState(void 0),[v,w]=s.useState(null),[q,Y]=s.useState(!1),L=s.useRef(null),U=s.useRef(null),te=s.useRef(null),h=s.useRef(null),V=s.useRef(null),re=s.useMemo(()=>[...n.nestedReplies??[],...G].filter(g=>!j.includes(g.id)),[j,n.nestedReplies,G]),oe=u&&!l&&/<\s*(?:s|strike)\b/i.test(n.contentHtml??""),ae=`thread-floor-body${oe?" capubbs-activity-signup-canceled":""}`;s.useEffect(()=>()=>{U.current!==null&&window.clearTimeout(U.current)},[]),s.useEffect(()=>{if(!q)return;function g(M){L.current?.contains(M.target)||Y(!1)}return document.addEventListener("pointerdown",g),()=>document.removeEventListener("pointerdown",g)},[q]);async function Be(){const g=`${window.location.origin}${window.location.pathname}${window.location.search}#${n.floor}`;await Ot(g)&&(F(!0),U.current!==null&&window.clearTimeout(U.current),U.current=window.setTimeout(()=>F(!1),1800))}const ke=(g,M,Q,ge)=>{V.current=Q,w({imageIndex:M,images:g,onImageChange:ge})};function We(g){v?.onImageChange?.(g),w(null),window.requestAnimationFrame(()=>V.current?.focus())}function Se(g=null){m(g),x(""),R(""),z(""),window.requestAnimationFrame(()=>h.current?.focus())}function je(){m(void 0),x(""),z("")}async function Ye(g){g.preventDefault();const M=K.trim();if(!(!M||!k||W)){le(!0),z("");try{const Q=await y(n,H??null,M);B(ge=>[...ge,{author:k,canDelete:!0,content:M,id:Q>0?String(Q):`local-${n.id}-${Date.now()}`,publishedAt:Nr(new Date),target:H??void 0}]),je()}catch(Q){z(Q instanceof Error?Q.message:"楼中楼回复发布失败，请稍后重试。")}finally{le(!1)}}}async function Ve(g){T(g.id),R("");try{await f(n,g),P(M=>[...M,g.id]),B(M=>M.filter(Q=>Q.id!==g.id)),I(null)}catch(M){R(M instanceof Error?M.message:"楼中楼删除失败，请稍后重试。")}finally{T(null)}}async function Ke(){if(!X){ee(!0),D("");try{await i(n)}catch(g){D(g instanceof Error?g.message:"楼层删除失败，请稍后重试。"),ee(!1)}}}function Je(){I(null),D(""),R(""),window.requestAnimationFrame(()=>te.current?.focus())}function Xe(){if(!S)return;const g=S;I(null),g.kind==="floor"?Ke():Ve(g.reply)}const Qe=t.jsxs("div",{className:`thread-avatar-rail${q?" thread-avatar-rail-open":""}`,ref:L,children:[t.jsx("button",{"aria-controls":`author-card-${n.floor}`,"aria-expanded":q,"aria-label":`查看${n.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>Y(g=>!g),type:"button",children:t.jsx("img",{src:n.author.avatar,alt:""})}),t.jsx(Rr,{author:n.author,id:`author-card-${n.floor}`})]}),Ze=t.jsx(vr,{attachments:n.attachments,bodyFallback:t.jsx("div",{className:ae,children:n.paragraphs.map(g=>t.jsx("p",{children:g},g))}),bodyClassName:ae,bodyHtml:n.contentHtml,floor:n.floor,isActivitySignupCanceled:oe,onImageOpen:ke,onIsolatedTextSelection:g=>p(n,g),signatureHtml:b?void 0:n.signatureHtml,signatureText:b?void 0:n.signature}),et=t.jsxs("button",{"aria-label":`复制第 ${n.floor} 楼链接`,className:"thread-floor-index",onClick:Be,title:"复制楼层链接",type:"button",children:["#",n.floor]}),tt=t.jsxs(t.Fragment,{children:[t.jsx(Cr,{canDelete:(!u||l)&&(n.canDelete??n.isOwn??!1),canEdit:(!u||l)&&!!n.isOwn,canQuote:e,canReply:r,deleting:X,editHref:o,onDelete:g=>{te.current=g,D(""),I({kind:"floor"})},onQuote:g=>A(n,g),onReply:()=>Se()}),C&&t.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:C}),re.length>0&&t.jsx("section",{className:"nested-replies","aria-label":`${n.floor} 楼的楼中楼回复`,children:re.map(g=>t.jsxs("article",{children:[t.jsx("img",{src:g.author.avatar,alt:""}),t.jsxs("div",{className:"nested-reply-main",children:[t.jsxs("div",{className:"nested-reply-identity",children:[t.jsx("a",{className:"nested-reply-author",href:ie(g.author.name),children:g.author.name}),g.target&&t.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",t.jsx("a",{href:ie(g.target),children:g.target})]})]}),g.contentHtml?t.jsx(ze,{className:"nested-reply-content",html:g.contentHtml,onImageOpen:ke,variant:"nested"}):t.jsx("p",{children:g.content}),t.jsxs("footer",{className:"nested-reply-footer",children:[t.jsx("time",{children:we(g.publishedAt)}),r&&t.jsx("button",{onClick:()=>Se(g.author.name),type:"button",children:"回复"}),g.canDelete&&t.jsxs("button",{className:"nested-reply-delete",disabled:E===g.id,onClick:M=>{te.current=M.currentTarget,R(""),I({kind:"nested",reply:g})},type:"button",children:[t.jsx(Re,{size:12}),E===g.id?"删除中":"删除"]})]})]})]},g.id))}),J&&t.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:J}),H!==void 0&&r&&t.jsxs("form",{className:"nested-reply-composer",onSubmit:Ye,children:[t.jsx("textarea",{"aria-label":H?`回复 @${H}`:`回复第 ${n.floor} 楼`,maxLength:500,onChange:g=>{x(g.target.value),z("")},placeholder:H?`回复 @${H}`:"写一条楼中楼回复",ref:h,rows:2,value:K}),t.jsxs("div",{className:"nested-reply-composer-actions",children:[t.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:W,onClick:je,type:"button",children:t.jsx(Ae,{size:15})}),t.jsxs("button",{className:"nested-reply-submit",disabled:!K.trim()||W,type:"submit",children:[t.jsx(At,{size:14}),W?"发送中":"发送"]})]}),N&&t.jsx("p",{className:"nested-reply-error",role:"alert",children:N})]})]}),rt=t.jsxs(t.Fragment,{children:[$&&t.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[t.jsx(Rt,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),v&&t.jsx(Jt,{images:v.images,initialImageIndex:v.imageIndex,onImageChange:v.onImageChange,onClose:We}),S&&t.jsx(Er,{floor:n,isMainPost:l,onCancel:Je,onConfirm:Xe,target:S})]});return t.jsx(jr,{articleAfterContent:rt,author:n.author,avatarRail:Qe,content:Ze,decorationImageSrc:a,editedAt:n.editedAt,floor:n.floor,floorIndex:et,id:String(n.floor),inlineAvatar:c,mainAfterContent:tt,onCopy:Sr,publishedAt:n.publishedAt,showAuthorProfile:d})}function Le(e){const r=e.closest(".thread-floor")?.querySelector(".thread-floor-body");return St(window.getSelection(),r??null)}function Er({floor:e,isMainPost:r,onCancel:a,onConfirm:o,target:n}){const u=n.kind==="nested"?n.reply:null,l=u?"删除楼中楼回复":r?"删除主楼":"删除回复",c=u?"":r?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",d=u?.author.name??e.author.name,b=u?`#${e.floor} · 楼中楼`:`#${e.floor}`,i=Tr(u?.content||e.quoteText||e.paragraphs[0]||"");return s.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),s.useEffect(()=>{function f(p){p.key==="Escape"&&a()}return document.addEventListener("keydown",f),()=>document.removeEventListener("keydown",f)},[a]),t.jsx("div",{className:"thread-delete-dialog-backdrop",onMouseDown:f=>{f.currentTarget===f.target&&a()},role:"presentation",children:t.jsxs("section",{"aria-describedby":c?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[t.jsxs("header",{children:[t.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:t.jsx($t,{size:19})}),t.jsx("div",{children:t.jsx("h2",{id:"thread-delete-dialog-title",children:l})}),t.jsx("button",{"aria-label":"关闭删除确认",onClick:a,type:"button",children:t.jsx(Ae,{size:18})})]}),t.jsxs("div",{className:"thread-delete-dialog-body",children:[c&&t.jsx("p",{id:"thread-delete-dialog-description",children:c}),t.jsxs("div",{className:"thread-delete-dialog-target",children:[t.jsxs("span",{children:[d," · ",b]}),t.jsx("p",{children:i||"此回复没有可预览的文字内容。"})]})]}),t.jsxs("footer",{children:[t.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:a,type:"button",children:"取消"}),t.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:o,type:"button",children:[t.jsx(Re,{size:15}),"确认删除"]})]})]})})}function Tr(e){const r=e.replace(/\s+/g," ").trim();return r.length>100?`${r.slice(0,100).trimEnd()}…`:r}function Nr(e){const r=a=>String(a).padStart(2,"0");return`${e.getFullYear()}-${r(e.getMonth()+1)}-${r(e.getDate())} ${r(e.getHours())}:${r(e.getMinutes())}:${r(e.getSeconds())}`}export{Ft as P,vr as T,jr as a,Cr as b,Gr as c,Ot as w};
