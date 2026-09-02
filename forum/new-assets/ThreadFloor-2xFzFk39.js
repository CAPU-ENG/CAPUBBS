import{p as je,r as o,K as Ke,j as e,M as Ve,X as he,b as Je,d as Xe,aS as Qe,az as Ze,aT as et,aF as tt,at as rt,aU as at,aV as nt,aW as ot,aX as it,aY as lt,O as st,G as ae,x as ct,Q as ut,aQ as dt}from"./index-1xPd6PRi.js";import{d as we,m as ce,s as mt,e as gt,r as ft,f as pt,a as Ae,P as Re}from"./RichTextEditor.gallery-DdrBJh0l.js";import{a as ht,r as bt,t as yt,g as xt}from"./forumMarkup-DspegoXW.js";import{P as vt}from"./plus-CMls6dON.js";import{R as wt}from"./rotate-ccw-D8XNqpl1.js";import{l as kt}from"./thread-6BMXRFng.js";import{D as Ee,T as ue}from"./TagBadge-C9-nejGI.js";import{T as be}from"./trash-2-Oyh2QNZJ.js";import{P as ke}from"./pencil-E7cER5Ax.js";import{E as It}from"./external-link-BIYp-rBV.js";import{T as St}from"./triangle-alert-D35T_C2w.js";const Ct=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],jt=je("paperclip",Ct);const At=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],Rt=je("reply",At);async function Et(t){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(t),!0}catch{}const r=document.createElement("textarea");r.value=t,r.setAttribute("readonly",""),r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select();try{return document.execCommand("copy")}finally{r.remove()}}const Tt={black:0,darkgray:169,darkgrey:169,dimgray:105,dimgrey:105,gainsboro:220,gray:128,grey:128,lightgray:211,lightgrey:211,silver:192,white:255,whitesmoke:245},de="data-capubbs-original-grayscale-color-attr",me="data-capubbs-original-grayscale-style-color";function Nt(t){const r=String(t??"").trim().toLowerCase().replace(/^['"]|['"]$/g,""),a=r.replace(/\s+/g,""),l=Tt[a];if(typeof l=="number")return{alpha:1,channel:l};const n=a.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);if(n){const i=n[1].length<=4?n[1].split("").map(I=>`${I}${I}`).join(""):n[1],f=Number.parseInt(i.slice(0,2),16),h=Number.parseInt(i.slice(2,4),16),k=Number.parseInt(i.slice(4,6),16),b=i.length===8?Number.parseInt(i.slice(6,8),16)/255:1;return f===h&&h===k?{alpha:b,channel:f}:null}const u=r.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*(?:,|\/)\s*([01](?:\.\d+)?|\.\d+|100%|\d{1,3}(?:\.\d+)?%))?\s*\)$/);if(!u)return null;const m=ge(u[1]),s=ge(u[2]),g=ge(u[3]),x=Pt(u[4]);return m===null||s===null||g===null||x===null?null:m===s&&s===g?{alpha:x,channel:m}:null}function Te(t,r=!0){const a=Nt(t);if(!a)return null;const l=255-a.channel;if(r&&a.alpha<1)return`rgba(${l}, ${l}, ${l}, ${Ft(a.alpha)})`;const n=l.toString(16).padStart(2,"0");return`#${n}${n}${n}`}function $t(t,r){[...t.matches("[color], [style]")?[t]:[],...Array.from(t.querySelectorAll("[color], [style]"))].forEach(l=>{Lt(l,r),l instanceof HTMLElement&&Mt(l,r)})}function Lt(t,r){const a=t.getAttribute(de);if(r==="light"){if(a===null)return;t.setAttribute("color",a),t.removeAttribute(de);return}const l=a??t.getAttribute("color"),n=Te(l,!1);!n||l===null||(a===null&&t.setAttribute(de,l),t.getAttribute("color")!==n&&t.setAttribute("color",n))}function Mt(t,r){const a=t.getAttribute(me);if(r==="light"){if(a===null)return;t.style.setProperty("color",a,t.style.getPropertyPriority("color")),t.removeAttribute(me);return}const l=a??t.style.getPropertyValue("color"),n=Te(l);!n||!l||(a===null&&t.setAttribute(me,l),t.style.getPropertyValue("color")!==n&&t.style.setProperty("color",n,t.style.getPropertyPriority("color")))}function ge(t){const r=t.endsWith("%"),a=Number(r?t.slice(0,-1):t);return Number.isFinite(a)?r?a>=0&&a<=100?Math.round(a*2.55):null:a>=0&&a<=255?Math.round(a):null:null}function Pt(t){if(t===void 0)return 1;const r=t.endsWith("%"),a=Number(r?t.slice(0,-1):t);return Number.isFinite(a)?r?a>=0&&a<=100?a/100:null:a>=0&&a<=1?a:null:null}function Ft(t){return Number(t.toFixed(3))}function Ne({className:t="",html:r,onImageOpen:a,variant:l}){const n=o.useRef(null),{theme:u}=Ke(),m=o.useMemo(()=>({__html:r}),[r]);if(o.useLayoutEffect(()=>{const i=n.current;i&&$t(i,u)},[r,u]),o.useEffect(()=>{const i=n.current;if(!i)return;const f=Array.from(i.querySelectorAll("img")),h=b=>{b.dataset.capubbsImageLoaded="true"},k=f.map(b=>{if(b.complete)return h(b),null;const I=()=>h(b);return b.addEventListener("load",I,{once:!0}),b.addEventListener("error",I,{once:!0}),{handleLoad:I,image:b}});return()=>{k.forEach(b=>{b&&(b.image.removeEventListener("load",b.handleLoad),b.image.removeEventListener("error",b.handleLoad))})}},[r]),!r)return null;function s(i,f){if(!a||!(i instanceof Element))return;const h=i.closest("img");if(!(h instanceof HTMLImageElement))return;const k=Array.from(f.querySelectorAll("img")),b=k.indexOf(h);if(b<0)return;const I=k.map(v=>Dt(v,f)),M=k.map((v,S)=>{const j=I[S];return{alt:v.alt.trim(),src:v.currentSrc||v.src,...j?{galleryId:j.galleryId,galleryIndex:j.galleryIndex}:{}}});a(M,b,h,v=>{const S=I[v];S&&mt(S.gallery,S.galleryIndex)})}function g(i){const f=we(i.target);if(f&&i.target instanceof Element){i.preventDefault(),i.stopPropagation(),ce(i.target,f);return}!a||!(i.target instanceof HTMLImageElement)||(i.preventDefault(),s(i.target,i.currentTarget))}function x(i){const f=we(i.target);if(f&&["Enter"," "].includes(i.key)&&i.target instanceof Element){i.preventDefault(),ce(i.target,f);return}if(["ArrowLeft","ArrowRight"].includes(i.key)&&i.target instanceof Element&&i.target.closest(".capubbs-gallery")){i.preventDefault(),ce(i.target,i.key==="ArrowLeft"?"prev":"next");return}!a||!(i.target instanceof HTMLImageElement)||!["Enter"," "].includes(i.key)||(i.preventDefault(),s(i.target,i.currentTarget))}return e.jsx("div",{ref:n,className:`forum-markup forum-markup-${l} ${t}`.trim(),"data-forum-markup":l,dangerouslySetInnerHTML:m,onClick:g,onKeyDown:x})}function Dt(t,r){const a=t.closest(".capubbs-gallery");if(!a||!r.contains(a))return null;const n=Array.from(r.querySelectorAll(".capubbs-gallery")).indexOf(a),m=Array.from(a.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(t);return n>=0&&m>=0?{gallery:a,galleryId:n,galleryIndex:m}:null}const z=1,$e=4,ie=.25;function qt(t){return Math.min($e,Math.max(z,t))}function fe(t){const[r,a]=[...t.values()];return!r||!a?null:Math.hypot(a.x-r.x,a.y-r.y)}function zt({images:t,initialImageIndex:r,onImageChange:a,onClose:l}){const n=Math.min(Math.max(0,r),Math.max(0,t.length-1)),[u,m]=o.useState(n),[s,g]=o.useState(z),[x,i]=o.useState({x:0,y:0}),[f,h]=o.useState(!1),k=o.useRef(null),b=o.useRef(null),I=o.useRef(null),M=o.useRef(null),D=o.useRef(n),v=o.useRef(z),S=o.useRef({x:0,y:0}),j=o.useRef(null),G=o.useRef(!1),R=o.useRef(new Map),P=o.useRef(null),W=o.useRef(z),V=o.useRef(a),_=o.useRef(l);V.current=a,_.current=l;function C(d,y=v.current){const w=k.current,N=I.current;if(!w||!N||y<=z)return{x:0,y:0};const O=Math.max(0,(N.clientWidth*y-w.clientWidth)/2),$=Math.max(0,(N.clientHeight*y-w.clientHeight)/2);return{x:Math.min(O,Math.max(-O,d.x)),y:Math.min($,Math.max(-$,d.y))}}function U(d,y=v.current){const w=C(d,y);S.current=w,i(w)}function A(d){const y=Math.round(qt(d)*100)/100;v.current=y,g(y),U(S.current,y)}function H(){v.current=z,S.current={x:0,y:0},g(z),i({x:0,y:0})}function E(d){const y=Math.min(Math.max(0,d),t.length-1);y!==D.current&&(D.current=y,m(y),H(),V.current?.(y))}function T(){_.current(D.current)}o.useEffect(()=>{const d=document.body.style.overflow,y=document.activeElement,w=k.current;document.body.style.overflow="hidden",M.current?.focus();function N(p){if(p.key==="Escape"){p.preventDefault(),T();return}if(p.key==="ArrowLeft"){p.preventDefault(),p.stopPropagation(),E(D.current-1);return}if(p.key==="ArrowRight"){p.preventDefault(),p.stopPropagation(),E(D.current+1);return}if(p.key==="+"||p.key==="="){p.preventDefault(),p.stopPropagation(),A(v.current+ie);return}if(p.key==="-"){p.preventDefault(),p.stopPropagation(),A(v.current-ie);return}if(p.key==="0"){p.preventDefault(),p.stopPropagation(),H();return}if(p.key==="Tab"){const B=b.current?.querySelectorAll("button:not(:disabled)");if(!B?.length)return;const Z=B[0],re=B[B.length-1],ee=document.activeElement;if(p.shiftKey&&ee===Z){p.preventDefault(),re.focus();return}if(!p.shiftKey&&ee===re){p.preventDefault(),Z.focus();return}b.current?.contains(ee)||(p.preventDefault(),Z.focus())}}function O(p){if(p.preventDefault(),p.stopPropagation(),p.deltaY===0)return;const B=p.ctrlKey?.01:.002;A(v.current*Math.exp(-p.deltaY*B))}function $(p){p.preventDefault(),p.stopPropagation(),W.current=v.current}function q(p){if(p.preventDefault(),p.stopPropagation(),R.current.size>=2)return;const B=p.scale;typeof B=="number"&&A(W.current*B)}function Q(){U(S.current,v.current)}return document.addEventListener("keydown",N,{capture:!0}),window.addEventListener("resize",Q),w?.addEventListener("wheel",O,{passive:!1}),w?.addEventListener("gesturestart",$,{passive:!1}),w?.addEventListener("gesturechange",q,{passive:!1}),w?.addEventListener("gestureend",q,{passive:!1}),()=>{document.removeEventListener("keydown",N,{capture:!0}),window.removeEventListener("resize",Q),w?.removeEventListener("wheel",O),w?.removeEventListener("gesturestart",$),w?.removeEventListener("gesturechange",q),w?.removeEventListener("gestureend",q),document.body.style.overflow=d,y instanceof HTMLElement&&y.focus()}},[]),o.useEffect(()=>{[t[u-1],t[u+1]].forEach(d=>{if(!d)return;const y=new Image;y.src=d.src})},[u,t]);function te(d,y,w){j.current={pointerId:d,startX:y,startY:w,originX:S.current.x,originY:S.current.y},h(!0)}function ne(d){if(d.target instanceof Element&&d.target.closest("button, .thread-image-lightbox-controls"))return;const y=d.pointerType==="touch",w=d.pointerType==="mouse"&&d.button===0;if(!(!y&&!w)&&(G.current=!1,!(!y&&v.current<=z))){if(d.preventDefault(),d.currentTarget.setPointerCapture(d.pointerId),y&&(R.current.set(d.pointerId,{x:d.clientX,y:d.clientY}),R.current.size===2)){P.current=fe(R.current),j.current=null,h(!1);return}v.current>z&&te(d.pointerId,d.clientX,d.clientY)}}function J(d){const y=R.current.has(d.pointerId),w=j.current;if(!y&&w?.pointerId!==d.pointerId)return;if(d.preventDefault(),d.stopPropagation(),y&&R.current.set(d.pointerId,{x:d.clientX,y:d.clientY}),R.current.size===2){const $=fe(R.current),q=P.current;if(!$||!q){P.current=$;return}Math.abs($-q)>1&&(G.current=!0),A(v.current*($/q)),P.current=$;return}if(!w||v.current<=z)return;const N=d.clientX-w.startX,O=d.clientY-w.startY;Math.hypot(N,O)>3&&(G.current=!0),U({x:w.originX+N,y:w.originY+O})}function X(d){const y=R.current.delete(d.pointerId),w=j.current?.pointerId===d.pointerId;if(!(!y&&!w)){if(P.current=R.current.size===2?fe(R.current):null,R.current.size===1&&v.current>z){const[N]=R.current.entries();if(N){const[O,$]=N;te(O,$.x,$.y)}}else j.current=null,h(!1);d.currentTarget.hasPointerCapture(d.pointerId)&&d.currentTarget.releasePointerCapture(d.pointerId)}}const oe=Math.round(s*100),F=t[u]??t[0];return F?Ve.createPortal(e.jsx("div",{className:"thread-image-lightbox-backdrop","data-can-pan":s>z,"data-dragging":f,onClick:d=>{d.target===d.currentTarget&&!G.current&&T()},onPointerCancel:X,onPointerDown:ne,onPointerMove:J,onPointerUp:X,ref:k,role:"presentation",children:e.jsxs("figure",{"aria-label":F.alt?`图片预览：${F.alt}（${u+1}/${t.length}）`:`图片预览（${u+1}/${t.length}）`,"aria-modal":"true",className:"thread-image-lightbox",ref:b,role:"dialog",children:[e.jsx("button",{"aria-label":"关闭图片预览",className:"thread-image-lightbox-close",onClick:T,ref:M,type:"button",children:e.jsx(he,{size:20})}),t.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{"aria-label":"上一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-prev",disabled:u===0,onClick:()=>E(u-1),title:"上一张（←）",type:"button",children:e.jsx(Je,{size:28})}),e.jsx("button",{"aria-label":"下一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-next",disabled:u===t.length-1,onClick:()=>E(u+1),title:"下一张（→）",type:"button",children:e.jsx(Xe,{size:28})})]}),e.jsx("img",{alt:F.alt,draggable:"false",onLoad:()=>U(S.current,v.current),ref:I,src:F.src,style:{transform:`translate3d(${x.x}px, ${x.y}px, 0) scale(${s})`}}),F.alt&&e.jsx("figcaption",{children:F.alt}),e.jsxs("div",{"aria-label":"图片缩放",className:"thread-image-lightbox-controls",role:"toolbar",children:[e.jsx("button",{"aria-label":"缩小图片",disabled:s<=z,onClick:()=>A(s-ie),title:"缩小（-）",type:"button",children:e.jsx(gt,{size:18})}),e.jsxs("output",{"aria-label":"当前缩放比例","aria-live":"polite",children:[oe,"%"]}),e.jsx("button",{"aria-label":"放大图片",disabled:s>=$e,onClick:()=>A(s+ie),title:"放大（+）",type:"button",children:e.jsx(vt,{size:18})}),e.jsx("button",{"aria-label":"恢复原始大小",disabled:s===z,onClick:H,title:"恢复原始大小（0）",type:"button",children:e.jsx(wt,{size:17})})]})]})}),document.body):null}const Ht=':root{--surface: #fffefa;--surface-raised: #ffffff;--surface-soft: #f6f8f4;--text: #20231f;--text-strong: #111411;--text-muted: #687068;--text-faint: #919991;--line: #e1e6df;--line-strong: #cdd5cc;--brand: #236b4c;--brand-strong: #174f38;--danger: #b8473f}:root.dark{--surface: #171d19;--surface-raised: #1c241f;--surface-soft: #1f2822;--text: #dde5de;--text-strong: #f6faf6;--text-muted: #a0aca2;--text-faint: #748078;--line: #2c362f;--line-strong: #3c493f;--brand: #69b98d;--brand-strong: #8bcca6;--danger: #ef8178}::-moz-selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}::selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentcolor}blockquote,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}a{color:inherit;text-decoration:inherit}button{margin:0;padding:0;background-color:transparent;color:inherit;font:inherit;letter-spacing:inherit;text-transform:none}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}.capubbs-html-frame-root iframe{background-color:transparent!important}img,video{max-width:100%;height:auto}table{border-color:inherit;border-collapse:collapse;text-indent:0}.capubbs-activity-signup-canceled,.capubbs-activity-signup-canceled *{color:var(--danger)!important;text-decoration-color:var(--danger)!important;text-decoration-line:line-through!important;text-decoration-thickness:2px!important}.forum-markup>:first-child{margin-top:0}.forum-markup>:last-child{margin-bottom:0}.forum-markup p,.forum-markup div{margin:0}.forum-markup-floor p{margin:0 0 .75em}.forum-markup-floor>div+div{margin-top:.55em}.forum-markup a{color:var(--brand-strong);font-weight:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.16em}.forum-markup .forum-mention{text-decoration:none}.forum-markup blockquote{margin:0 0 0 2em;border:0;padding:0;background:transparent;color:inherit}.forum-markup blockquote.forum-quote,.forum-markup .forum-legacy-quote,.forum-markup blockquote.capubbs-floor-quote{margin:.8em 0;border-left:3px solid color-mix(in srgb,var(--brand) 38%,var(--line));padding:.55em .75em;background:var(--surface-soft);color:var(--text-muted)}.forum-markup .capubbs-floor-quote-jump{margin-left:.75em}.forum-markup .forum-legacy-quote-content{margin:0}.forum-markup h1,.forum-markup h2,.forum-markup h3,.forum-markup h4,.forum-markup h5,.forum-markup h6{margin:.9rem 0 .45rem;color:var(--brand-strong);font-weight:800;line-height:1.35}.forum-markup h1{font-size:1.45rem}.forum-markup h2{font-size:1.25rem}.forum-markup h3{font-size:1.1rem}.forum-markup h4,.forum-markup h5,.forum-markup h6{font-size:1em}.forum-markup ul,.forum-markup ol{margin:.65em 0;padding-left:1.45em}.forum-markup ul{list-style:disc}.forum-markup ol{list-style:decimal}.forum-markup ol.capubbs-ordered-list-alpha{list-style-type:lower-alpha}.forum-markup ol.capubbs-ordered-list-roman{list-style-type:lower-roman}.forum-markup pre{max-width:100%;overflow-x:auto;margin:.75em 0;border-radius:2px;padding:.75em;background:#182531;color:#f8fafc;white-space:pre-wrap}.forum-markup code,.forum-markup kbd{border-radius:2px;padding:.08em .25em;background:color-mix(in srgb,var(--surface-soft) 75%,var(--line));font-family:SFMono-Regular,Cascadia Code,Consolas,monospace;font-size:.9em}.forum-markup pre code{padding:0;background:transparent;color:inherit}.forum-markup font[size="1"]{font-size:11px}.forum-markup font[size="2"]{font-size:13px}.forum-markup font[size="3"]{font-size:15px}.forum-markup font[size="4"]{font-size:17px}.forum-markup font[size="5"]{font-size:19px}.forum-markup font[size="6"]{font-size:21px}.forum-markup font[size="7"]{font-size:23px}.forum-markup hr{margin:.9em 0;border:0;border-top:1px solid var(--line-strong)}.forum-markup img{display:inline-block;height:auto;max-width:100%;vertical-align:middle}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){background-color:color-mix(in srgb,var(--surface-soft) 82%,var(--line));background-image:linear-gradient(105deg,transparent 20%,color-mix(in srgb,var(--surface-raised) 70%,transparent) 45%,transparent 70%);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}.forum-markup img[role=button]{cursor:zoom-in}.forum-markup img[role=button]:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse}.forum-markup td,.forum-markup th{border:1px solid var(--line);padding:.35em .5em}.forum-markup-signature{color:#999;font-family:monospace;font-size:14px;line-height:1.6;overflow-wrap:anywhere}:root.dark .forum-markup-signature{color:#666}.forum-markup .capubbs-gallery{position:relative;display:block;width:100%;margin:.9rem 0;overflow:hidden;border:1px solid var(--line);border-radius:2px;background:transparent;color:var(--text)}.forum-markup .capubbs-gallery:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup .capubbs-gallery-header{position:relative;display:flex;min-height:44px;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:9px 12px;border-bottom:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-title{width:100%;min-width:0;margin:0;color:var(--text-strong);font-size:.82rem;font-weight:760;line-height:1.4;text-align:center}.forum-markup .capubbs-gallery-stage{position:relative;display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide{display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-slide>img{display:block;width:100%;height:var(--capubbs-gallery-image-height, clamp(280px, 52vw, 560px));max-width:none;margin:0 auto;border-radius:0;-o-object-fit:contain;object-fit:contain}.forum-markup .capubbs-gallery-caption{display:block;margin:0;color:var(--text-muted);font-size:.78rem;line-height:1.55;text-align:center}.forum-markup .capubbs-gallery-caption[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-footer{position:relative;display:flex;min-height:44px;align-items:center;justify-content:center;margin:0;padding:9px 12px;border-top:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-captions{width:100%;min-width:0;margin:0;padding-inline:48px;text-align:center}.forum-markup .capubbs-gallery-count{position:absolute;top:50%;right:12px;color:var(--text-faint);font-size:.72rem;font-variant-numeric:tabular-nums;font-weight:760;line-height:1.25;transform:translateY(-50%)}.forum-markup .capubbs-gallery-count[data-capubbs-gallery-current]:before{content:attr(data-capubbs-gallery-current) "/" attr(data-capubbs-gallery-total)}.forum-markup .capubbs-gallery-nav{position:absolute;z-index:4;top:50%;display:grid;width:36px;height:48px;place-items:center;padding:0;transform:translateY(-50%);border:1px solid rgb(255 255 255 / .25);border-radius:2px;background:#00000080;color:#fff;cursor:pointer;transition:.15s ease}.forum-markup .capubbs-gallery-nav:hover{background:#000000b8}.forum-markup .capubbs-gallery-nav:focus-visible{outline:2px solid #fff;outline-offset:2px}.forum-markup .capubbs-gallery-nav:before{font-family:Arial,sans-serif;font-size:2rem;font-weight:300;line-height:1}.forum-markup .capubbs-gallery-nav-prev:before{content:"‹"}.forum-markup .capubbs-gallery-nav-next:before{content:"›"}.forum-markup .capubbs-gallery-nav-prev{left:10px}.forum-markup .capubbs-gallery-nav-next{right:10px}@keyframes capubbs-image-loading{0%{background-position:120% 0}to{background-position:-80% 0}}@media(max-width:640px){.forum-markup .capubbs-gallery-slide>img{height:var(--capubbs-gallery-image-height, min(72vw, 420px))}.forum-markup .capubbs-gallery-nav{width:32px;height:42px}.forum-markup .capubbs-gallery-nav-prev{left:7px}.forum-markup .capubbs-gallery-nav-next{right:7px}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){animation:none}}',Ot=28,Gt=64,_t=5e4,Ut=30,Le=30,Y="capubbs-thread-html-frame",Me=new URL("/bbs/lib/jquery.min.js",window.location.origin).href,Bt=er(Ht),Yt=/\son[a-z][\w:-]*\s*=/i;let le=null;function Ie({className:t="",floor:r,html:a,isActivitySignupCanceled:l=!1,onImageOpen:n,onIsolatedTextSelection:u,variant:m}){const s=o.useMemo(()=>m==="signature"?ft(a):a,[a,m]),g=Kt(s,m==="signature"),x=ht(g),i=o.useMemo(()=>x?null:bt(g,{normalizeLegacyLineBreaks:m==="signature"}),[g,x,m]),f=o.useMemo(()=>yt(g),[g]);return!x&&i!==null?e.jsx(Ne,{className:t,html:i,onImageOpen:n,variant:m}):e.jsx(Wt,{className:t,floor:r,html:f,isActivitySignupCanceled:l,onImageOpen:n,onTextSelection:u,variant:m})}function Wt({className:t,floor:r,html:a,isActivitySignupCanceled:l,onImageOpen:n,onTextSelection:u,variant:m}){const s=o.useRef(null),g=o.useRef(`${m}-${r}-${Math.random().toString(36).slice(2)}`),x=o.useRef(n);x.current=n;const i=o.useRef(u);i.current=u;const f=m==="signature"?Ot:Gt,h=!!n,[k,b]=o.useState(null),I=rr(),M=o.useRef(I),D=Qe(),v=m==="signature"?14:D,S=o.useMemo(()=>Xt(a),[a]),j=S.includes('type="text/capubbs-user-script"')||Yt.test(S),G=o.useMemo(()=>Vt({canOpenImages:h,frameId:g.current,needsJquery:j,html:S,isActivitySignupCanceled:l,isDarkTheme:M.current,fontSize:v,variant:m}),[h,S,v,l,j,m]),R=o.useMemo(()=>`data:text/html;charset=utf-8,${encodeURIComponent(G)}`,[G]),P=o.useCallback(()=>{s.current?.contentWindow?.postMessage({frameId:g.current,source:Y,theme:I?"dark":"light",type:"theme"},"*")},[I]),W=o.useCallback((_=s.current?.contentWindow)=>{!j||!_||Se().then(C=>{s.current?.contentWindow===_&&_.postMessage({frameId:g.current,jquerySource:C,source:Y,type:"jquery-response"},"*")})},[j]),V=o.useCallback(()=>{P(),W()},[W,P]);return o.useEffect(()=>{b(null)},[R]),o.useEffect(()=>{P()},[P]),o.useEffect(()=>{j&&Se()},[j]),o.useLayoutEffect(()=>{function _(C){const U=s.current?.contentWindow;if(!(!U||C.source!==U||!tr(C.data))&&C.data.frameId===g.current){if(C.data.type==="jquery-request"){W(U);return}if(C.data.type==="anchor"){const A=s.current;if(!A)return;const H=window.getComputedStyle(document.documentElement),E=Number.parseFloat(H.getPropertyValue("--topbar-height"))||0,T=window.scrollY+A.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,T+C.data.offsetTop-E-16)});return}if(C.data.type==="navigate"){const A=Ze(C.data.url,Pe());if(!A)return;window.history.pushState(null,"",A),window.dispatchEvent(new Event(et));const H=new URL(A,window.location.origin);H.hash?window.requestAnimationFrame(()=>{const E=decodeURIComponent(H.hash.slice(1)),T=tt(`#${E}`);(T?rt(T):document.getElementById(E))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(C.data.type==="image-open"){const A=s.current;if(!A)return;const H=E=>{const T=C.data.images[E];!T||typeof T.galleryId!="number"||!Number.isSafeInteger(T.galleryIndex)||A.contentWindow?.postMessage({frameId:g.current,galleryId:T.galleryId,galleryIndex:T.galleryIndex,source:Y,type:"gallery-select"},"*")};x.current?.(C.data.images,C.data.imageIndex,A,H);return}if(C.data.type==="selection"){C.data.text&&window.getSelection()?.removeAllRanges(),i.current?.(C.data.text);return}b(Math.min(_t,Math.max(f,Math.ceil(C.data.height))))}}return window.addEventListener("message",_),()=>window.removeEventListener("message",_)},[f,W]),e.jsx("iframe",{ref:s,className:`thread-html-frame thread-html-frame-${m} ${t}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-same-origin allow-downloads",scrolling:"no",src:R,onLoad:V,style:{"--thread-html-frame-width-allowance":`${Le}px`,...k===null?{}:{"--thread-html-frame-height":`${k}px`}},title:m==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`})}function Kt(t,r){const[a,l]=o.useState(t);return o.useEffect(()=>{const n=new AbortController,u=r?pt(t):[];if(l(t),u.length===0)return()=>n.abort();const m=Array.from(new Map(u.map(s=>[`${s.bid}:${s.tid}:${s.pid}`,s])).values());return Promise.all(m.map(async s=>{try{const g=await kt(s,n.signal);return[`${s.bid}:${s.tid}:${s.pid}`,g]}catch(g){if(g instanceof DOMException&&g.name==="AbortError")throw g;return[`${s.bid}:${s.tid}:${s.pid}`,""]}})).then(s=>{if(n.signal.aborted)return;const g=new Map(s);let x=t;u.forEach(i=>{const f=g.get(`${i.bid}:${i.tid}:${i.pid}`);f&&(x=x.replace(i.marker,f))}),l(x)}).catch(()=>{}),()=>n.abort()},[r,t]),a}function Vt({canOpenImages:t,frameId:r,fontSize:a,needsJquery:l,html:n,isActivitySignupCanceled:u,isDarkTheme:m,variant:s}){const g=s==="signature",x=g?"#999999":"rgb(63 63 70)",i=g?"#666666":"rgb(228 228 231)",f=g?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",h=g?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",k=u?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${m?"dark":"light"}" style="background:transparent;color-scheme:${m?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${Zt(Pe())}">
  <meta http-equiv="Content-Security-Policy" content="${Qt()}">
  <style>${Bt}</style>
  <style>
    html{--capubbs-frame-text-color:${x}}html.dark{--capubbs-frame-text-color:${i}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${f};font-size:${a}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${Le}px);${h}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${Jt(r,t,l)}<\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${s}${k}">${n}</main></body>
</html>`}function Jt(t,r,a){return`(function(){
    var frameId=${JSON.stringify(t)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(at)};
    var canOpenImages=${JSON.stringify(r)};
    var needsJquery=${JSON.stringify(a)};
    var jquerySourceUrl=${JSON.stringify(Me)};
    var forumAppExactPaths=${JSON.stringify(nt)};
    var forumAppPathPrefixes=${JSON.stringify(ot)};
    var legacyForumExactPaths=${JSON.stringify(it)};
    var legacyForumPathPatterns=${JSON.stringify(lt)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${Ut};
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
      window.parent.postMessage({source:'${Y}',type:'resize',frameId:frameId,height:height},'*');
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
      window.parent.postMessage({source:'${Y}',type:'selection',frameId:frameId,text:text},'*');
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
        window.parent.postMessage({source:'${Y}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${Y}',type:'navigate',frameId:frameId,url:url},'*');
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
      window.parent.postMessage({source:'${Y}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
      if(event.source!==window.parent||!data||data.source!=='${Y}'||data.frameId!==frameId)return;
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
      if(window.MutationObserver&&contentRoot)new MutationObserver(function(){queueHeight();prepareImages();syncGrayscaleTextColors(contentRoot);}).observe(contentRoot,{attributes:true,characterData:true,childList:true,subtree:true});
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
      if(needsJquery)window.parent.postMessage({source:'${Y}',type:'jquery-request',frameId:frameId},'*');
      else executeUserScripts();
      prepareImages();
      syncGrayscaleTextColors(contentRoot);
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`}function Xt(t){return t.replace(/<script\b([^>]*)>/gi,(r,a)=>`<script${a.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function Se(){return le||(le=fetch(Me,{credentials:"same-origin"}).then(t=>{if(!t.ok)throw new Error(`Failed to load jQuery: ${t.status}`);return t.text()}).catch(()=>null),le)}function Qt(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'","upgrade-insecure-requests"].join("; ")}function Pe(){return new URL("/bbs/content/",window.location.origin).href}function Zt(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function er(t){return t.replace(/<\/style/gi,"<\\/style")}function tr(t){if(!t||typeof t!="object")return!1;const r=t;return r.source!==Y||typeof r.frameId!="string"?!1:r.type==="anchor"?typeof r.offsetTop=="number"&&Number.isFinite(r.offsetTop)&&r.offsetTop>=0:r.type==="navigate"?typeof r.url=="string":r.type==="jquery-request"?!0:r.type==="selection"?typeof r.text=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(a=>!!a&&typeof a=="object"&&typeof a.alt=="string"&&typeof a.src=="string"&&a.src.length>0&&(a.galleryId===void 0&&a.galleryIndex===void 0||typeof a.galleryId=="number"&&Number.isSafeInteger(a.galleryId)&&a.galleryId>=0&&typeof a.galleryIndex=="number"&&Number.isSafeInteger(a.galleryIndex)&&a.galleryIndex>=0)):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function rr(){const[t,r]=o.useState(()=>document.documentElement.classList.contains("dark"));return o.useEffect(()=>{const a=document.documentElement,l=()=>r(a.classList.contains("dark")),n=new MutationObserver(l);return n.observe(a,{attributeFilter:["class"],attributes:!0}),()=>n.disconnect()},[]),t}function ar({attachments:t=[],bodyClassName:r="thread-floor-body",bodyFallback:a=null,bodyHtml:l,floor:n,isActivitySignupCanceled:u=!1,onImageOpen:m,onIsolatedTextSelection:s,signatureClassName:g="thread-signature",signatureHtml:x,signatureText:i}){const f=m?(h,k,b,I)=>{const M=h[k];M&&m([M],0,b,I?()=>I(k):void 0)}:void 0;return e.jsxs(e.Fragment,{children:[l?e.jsx(Ie,{className:r,floor:n,html:l,isActivitySignupCanceled:u,onImageOpen:m,onIsolatedTextSelection:s,variant:"floor"}):a,e.jsx(nr,{attachments:t}),x?e.jsx(Ie,{className:g,floor:n,html:x,onImageOpen:f,variant:"signature"}):i?e.jsx("footer",{className:g,children:e.jsx("p",{children:i})}):null]})}function nr({attachments:t}){return t.length===0?null:e.jsxs("section",{"aria-label":"附件",className:"thread-attachments",children:[e.jsxs("header",{className:"thread-attachments-heading",children:[e.jsx(jt,{"aria-hidden":"true",size:14}),e.jsx("span",{children:"附件"}),e.jsx("small",{children:t.length})]}),e.jsx("ul",{children:t.map(r=>{const a=e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"thread-attachment-name",children:r.name}),e.jsx("small",{children:or(r)}),r.exists!==!1&&e.jsx(st,{"aria-hidden":"true",size:15})]});return e.jsx("li",{children:r.exists===!1?e.jsx("div",{"aria-disabled":"true",className:"thread-attachment-link is-unavailable",children:a}):e.jsx("a",{className:"thread-attachment-link",download:r.name,href:r.downloadHref||`/bbs/download/?id=${encodeURIComponent(r.id)}`,children:a})},r.id)})})]})}function or(t){if(t.exists===!1)return"文件不可用";const r=[ir(t.size),(t.price??0)>0?"付费附件":"免费"];return t.downloadCount!==void 0&&r.push(`下载 ${t.downloadCount} 次`),r.join(" · ")}function ir(t){if(t<=0)return"大小未知";if(t<1024)return`${t} B`;const r=["KB","MB","GB","TB"];let a=t,l=-1;do a/=1024,l+=1;while(a>=1024&&l<r.length-1);return`${a.toFixed(a>=10?1:2)} ${r[l]}`}function lr({author:t,id:r}){const a=t.tags??[],[l,n]=o.useState(!1),u=o.useRef(null),m=o.useRef(null),s=o.useRef(null),g=o.useRef(null),x=a.map(i=>`${i.id}:${i.name}`).join("|");return o.useLayoutEffect(()=>{if(a.length===0){n(!1);return}const i=()=>{const h=u.current,k=m.current,b=s.current,I=g.current;if(!h||!k||!b||!I||h.offsetWidth===0)return;const M=b.getBoundingClientRect().width,D=I.getBoundingClientRect().width,v=Number.parseFloat(getComputedStyle(k).columnGap)||0,S=k.clientWidth-M-v,j=D>S+1;n(G=>G===j?G:j)};i();const f=new ResizeObserver(i);return[u.current,m.current,g.current].forEach(h=>{h&&f.observe(h)}),()=>f.disconnect()},[x,a.length]),e.jsxs("div",{id:r,ref:u,className:"author-hover-card",role:"dialog","aria-label":`${t.name} 的用户摘要`,children:[e.jsxs("div",{className:"author-card-head",children:[e.jsx("img",{src:t.avatar,alt:""}),e.jsxs("div",{className:"author-card-head-copy",children:[e.jsxs("div",{ref:m,className:"author-card-name-line","data-tags-overflow":l?"true":void 0,children:[e.jsx("strong",{ref:s,children:t.name}),e.jsx("div",{className:"author-card-tag-slot",children:e.jsx(ue,{size:"compact",tags:a})})]}),(t.stars>0||t.role)&&e.jsxs("span",{className:"author-card-status",children:["★".repeat(t.stars),t.stars>0&&t.role?" · ":"",t.role]})]})]}),l?e.jsx("div",{className:"author-card-tags-row",children:e.jsx(ue,{size:"compact",tags:a})}):null,t.medals?.length?e.jsx("div",{className:"author-card-medals",children:e.jsx(Re,{medals:t.medals,profileName:t.name,variant:"compact"})}):null,e.jsx("div",{ref:g,className:"author-card-tag-width-measure","aria-hidden":"true",children:e.jsx(ue,{size:"compact",tags:a})}),e.jsxs("dl",{children:[e.jsxs("div",{children:[e.jsx("dt",{children:"主题"}),e.jsx("dd",{children:t.topics})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"回复"}),e.jsx("dd",{children:t.replies})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"签到"}),e.jsx("dd",{children:t.checkins})]})]}),e.jsxs("p",{children:["最近在线：",t.lastSeen]}),e.jsxs("a",{href:ae(t.name),children:["查看个人主页 ",e.jsx(It,{size:13})]})]})}function sr({author:t}){const r=t.tags??[],a=Ae(r),l=ae(t.name);return e.jsxs("aside",{className:"thread-author-profile","aria-label":`${t.name} 的资料`,children:[e.jsx("a",{"aria-label":`查看${t.name}的个人主页`,className:"thread-author-profile-avatar",href:l,children:e.jsx("img",{src:t.avatar,alt:""})}),e.jsx("div",{className:"thread-author-profile-identity",children:e.jsx("a",{href:l,children:t.name})}),(t.stars>0||t.role)&&e.jsxs("div",{className:"thread-author-profile-status",children:[t.stars>0&&e.jsx("span",{"aria-label":`${t.stars} 星`,children:"★".repeat(t.stars)}),t.role&&e.jsx("strong",{children:t.role})]}),e.jsx(Ee,{tags:a}),e.jsx(Re,{medals:t.medals??[],profileName:t.name,variant:"compact"}),e.jsxs("dl",{className:"thread-author-profile-stats",children:[e.jsxs("div",{children:[e.jsx("dt",{children:"主题"}),e.jsx("dd",{children:t.topics})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"回复"}),e.jsx("dd",{children:t.replies})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"签到"}),e.jsx("dd",{children:t.checkins})]})]}),e.jsxs("p",{className:"thread-author-profile-last-seen",children:[e.jsx("span",{children:"最近在线"}),e.jsx("strong",{children:t.lastSeen})]})]})}function pe(t){return t.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function cr(t){const r=window.getSelection()?.toString();r&&(t.preventDefault(),t.clipboardData.setData("text/plain",r))}function ur({articleAfterContent:t,author:r,avatarRail:a,className:l="",content:n,decorationImageSrc:u,editedAt:m,floor:s,floorIndex:g,id:x,inlineAvatar:i=!1,mainAfterContent:f,onCopy:h,publishedAt:k,showAuthorProfile:b}){const I=r.tags??[],M=Ae(I);return e.jsxs("article",{className:`thread-floor${b?" thread-floor-with-author-profile":""}${l?` ${l}`:""}`,"data-floor":s,id:x,onCopy:h,children:[u&&e.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:e.jsx("img",{alt:"",src:u})}),b?e.jsx(sr,{author:r}):!i&&a,e.jsxs("div",{className:"thread-floor-main",children:[e.jsxs("header",{className:"thread-floor-header",children:[!b&&i&&a,e.jsxs("div",{className:"thread-floor-author",children:[e.jsx("a",{href:ae(r.name),children:r.name}),e.jsx(Ee,{tags:M})]}),e.jsxs("div",{className:"thread-floor-time",children:[e.jsx("time",{children:pe(k)}),m&&e.jsxs(e.Fragment,{children:[e.jsx("span",{children:"·"}),e.jsxs("time",{children:["编辑于 ",pe(m)]})]})]}),g]}),b?e.jsx("div",{className:"thread-floor-content",children:n}):n,f]}),t]})}function dr({canDelete:t,canEdit:r,canQuote:a,canReply:l,decorative:n=!1,deleting:u=!1,editHref:m="",onDelete:s,onQuote:g,onReply:x}){const i=n?-1:void 0,f=o.useRef(null);return e.jsxs("div",{"aria-hidden":n||void 0,className:`thread-floor-actions${n?" thread-floor-actions-decorative":""}`,children:[a&&e.jsxs("button",{onClick:h=>{const k=f.current?f.current.text:Ce(h.currentTarget);f.current=null,g?.(k)},onPointerDown:h=>{h.button===0&&(f.current={text:Ce(h.currentTarget)})},tabIndex:i,type:"button",children:[e.jsx(dt,{size:15}),"引用"]}),l&&e.jsxs("button",{onClick:x,tabIndex:i,type:"button",children:[e.jsx(Rt,{size:15}),"回复"]}),r&&(n?e.jsxs("button",{tabIndex:-1,type:"button",children:[e.jsx(ke,{size:15}),"编辑"]}):e.jsxs("a",{href:m,children:[e.jsx(ke,{size:15}),"编辑"]})),t&&e.jsxs("button",{"aria-busy":u||void 0,className:"floor-action-danger",disabled:!n&&u,onClick:n?void 0:h=>s?.(h.currentTarget),tabIndex:i,type:"button",children:[e.jsx(be,{size:15}),u?"删除中":"删除"]})]})}function jr({canQuote:t,canReply:r,decorationImageSrc:a,editHref:l,floor:n,isActivityThread:u,isMainPost:m,inlineAvatar:s,showAuthorProfile:g,hideSignature:x,onDeleteFloor:i,onDeleteNestedReply:f,onIsolatedTextSelection:h,onQuote:k,onSubmitNestedReply:b,viewer:I}){const[M,D]=o.useState(!1),[v,S]=o.useState(null),[j,G]=o.useState([]),[R,P]=o.useState(""),[W,V]=o.useState(!1),[_,C]=o.useState([]),[U,A]=o.useState(""),[H,E]=o.useState(""),[T,te]=o.useState(null),[ne,J]=o.useState(""),[X,oe]=o.useState(!1),[F,d]=o.useState(void 0),[y,w]=o.useState(null),[N,O]=o.useState(!1),$=o.useRef(null),q=o.useRef(null),Q=o.useRef(null),p=o.useRef(null),B=o.useRef(null),Z=o.useMemo(()=>[...n.nestedReplies??[],..._].filter(c=>!j.includes(c.id)),[j,n.nestedReplies,_]),re=u&&!m&&/<\s*(?:s|strike)\b/i.test(n.contentHtml??""),ee=`thread-floor-body${re?" capubbs-activity-signup-canceled":""}`;o.useEffect(()=>()=>{q.current!==null&&window.clearTimeout(q.current)},[]),o.useEffect(()=>{if(!N)return;function c(L){$.current?.contains(L.target)||O(!1)}return document.addEventListener("pointerdown",c),()=>document.removeEventListener("pointerdown",c)},[N]);async function Fe(){const c=`${window.location.origin}${window.location.pathname}${window.location.search}#${n.floor}`;await Et(c)&&(D(!0),q.current!==null&&window.clearTimeout(q.current),q.current=window.setTimeout(()=>D(!1),1800))}const ye=(c,L,K,se)=>{B.current=K,w({imageIndex:L,images:c,onImageChange:se})};function De(c){y?.onImageChange?.(c),w(null),window.requestAnimationFrame(()=>B.current?.focus())}function xe(c=null){d(c),A(""),E(""),J(""),window.requestAnimationFrame(()=>p.current?.focus())}function ve(){d(void 0),A(""),J("")}async function qe(c){c.preventDefault();const L=U.trim();if(!(!L||!I||X)){oe(!0),J("");try{const K=await b(n,F??null,L);C(se=>[...se,{author:I,canDelete:!0,content:L,id:K>0?String(K):`local-${n.id}-${Date.now()}`,publishedAt:fr(new Date),target:F??void 0}]),ve()}catch(K){J(K instanceof Error?K.message:"楼中楼回复发布失败，请稍后重试。")}finally{oe(!1)}}}async function ze(c){te(c.id),E("");try{await f(n,c),G(L=>[...L,c.id]),C(L=>L.filter(K=>K.id!==c.id)),S(null)}catch(L){E(L instanceof Error?L.message:"楼中楼删除失败，请稍后重试。")}finally{te(null)}}async function He(){if(!W){V(!0),P("");try{await i(n)}catch(c){P(c instanceof Error?c.message:"楼层删除失败，请稍后重试。"),V(!1)}}}function Oe(){S(null),P(""),E(""),window.requestAnimationFrame(()=>Q.current?.focus())}function Ge(){if(!v)return;const c=v;S(null),c.kind==="floor"?He():ze(c.reply)}const _e=e.jsxs("div",{className:`thread-avatar-rail${N?" thread-avatar-rail-open":""}`,ref:$,children:[e.jsx("button",{"aria-controls":`author-card-${n.floor}`,"aria-expanded":N,"aria-label":`查看${n.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>O(c=>!c),type:"button",children:e.jsx("img",{src:n.author.avatar,alt:""})}),e.jsx(lr,{author:n.author,id:`author-card-${n.floor}`})]}),Ue=e.jsx(ar,{attachments:n.attachments,bodyFallback:e.jsx("div",{className:ee,children:n.paragraphs.map(c=>e.jsx("p",{children:c},c))}),bodyClassName:ee,bodyHtml:n.contentHtml,floor:n.floor,isActivitySignupCanceled:re,onImageOpen:ye,onIsolatedTextSelection:c=>h(n,c),signatureHtml:x?void 0:n.signatureHtml,signatureText:x?void 0:n.signature}),Be=e.jsxs("button",{"aria-label":`复制第 ${n.floor} 楼链接`,className:"thread-floor-index",onClick:Fe,title:"复制楼层链接",type:"button",children:["#",n.floor]}),Ye=e.jsxs(e.Fragment,{children:[e.jsx(dr,{canDelete:(!u||m)&&(n.canDelete??n.isOwn??!1),canEdit:(!u||m)&&!!n.isOwn,canQuote:t,canReply:r,deleting:W,editHref:l,onDelete:c=>{Q.current=c,P(""),S({kind:"floor"})},onQuote:c=>k(n,c),onReply:()=>xe()}),R&&e.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:R}),Z.length>0&&e.jsx("section",{className:"nested-replies","aria-label":`${n.floor} 楼的楼中楼回复`,children:Z.map(c=>e.jsxs("article",{children:[e.jsx("img",{src:c.author.avatar,alt:""}),e.jsxs("div",{className:"nested-reply-main",children:[e.jsxs("div",{className:"nested-reply-identity",children:[e.jsx("a",{className:"nested-reply-author",href:ae(c.author.name),children:c.author.name}),c.target&&e.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",e.jsx("a",{href:ae(c.target),children:c.target})]})]}),c.contentHtml?e.jsx(Ne,{className:"nested-reply-content",html:c.contentHtml,onImageOpen:ye,variant:"nested"}):e.jsx("p",{children:c.content}),e.jsxs("footer",{className:"nested-reply-footer",children:[e.jsx("time",{children:pe(c.publishedAt)}),r&&e.jsx("button",{onClick:()=>xe(c.author.name),type:"button",children:"回复"}),c.canDelete&&e.jsxs("button",{className:"nested-reply-delete",disabled:T===c.id,onClick:L=>{Q.current=L.currentTarget,E(""),S({kind:"nested",reply:c})},type:"button",children:[e.jsx(be,{size:12}),T===c.id?"删除中":"删除"]})]})]})]},c.id))}),H&&e.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:H}),F!==void 0&&r&&e.jsxs("form",{className:"nested-reply-composer",onSubmit:qe,children:[e.jsx("textarea",{"aria-label":F?`回复 @${F}`:`回复第 ${n.floor} 楼`,maxLength:500,onChange:c=>{A(c.target.value),J("")},placeholder:F?`回复 @${F}`:"写一条楼中楼回复",ref:p,rows:2,value:U}),e.jsxs("div",{className:"nested-reply-composer-actions",children:[e.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:X,onClick:ve,type:"button",children:e.jsx(he,{size:15})}),e.jsxs("button",{className:"nested-reply-submit",disabled:!U.trim()||X,type:"submit",children:[e.jsx(ct,{size:14}),X?"发送中":"发送"]})]}),ne&&e.jsx("p",{className:"nested-reply-error",role:"alert",children:ne})]})]}),We=e.jsxs(e.Fragment,{children:[M&&e.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[e.jsx(ut,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),y&&e.jsx(zt,{images:y.images,initialImageIndex:y.imageIndex,onImageChange:y.onImageChange,onClose:De}),v&&e.jsx(mr,{floor:n,isMainPost:m,onCancel:Oe,onConfirm:Ge,target:v})]});return e.jsx(ur,{articleAfterContent:We,author:n.author,avatarRail:_e,content:Ue,decorationImageSrc:a,editedAt:n.editedAt,floor:n.floor,floorIndex:Be,id:String(n.floor),inlineAvatar:s,mainAfterContent:Ye,onCopy:cr,publishedAt:n.publishedAt,showAuthorProfile:g})}function Ce(t){const r=t.closest(".thread-floor")?.querySelector(".thread-floor-body");return xt(window.getSelection(),r??null)}function mr({floor:t,isMainPost:r,onCancel:a,onConfirm:l,target:n}){const u=n.kind==="nested"?n.reply:null,m=u?"删除楼中楼回复":r?"删除主楼":"删除回复",s=u?"":r?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",g=u?.author.name??t.author.name,x=u?`#${t.floor} · 楼中楼`:`#${t.floor}`,i=gr(u?.content||t.quoteText||t.paragraphs[0]||"");return o.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),o.useEffect(()=>{function f(h){h.key==="Escape"&&a()}return document.addEventListener("keydown",f),()=>document.removeEventListener("keydown",f)},[a]),e.jsx("div",{className:"thread-delete-dialog-backdrop",onMouseDown:f=>{f.currentTarget===f.target&&a()},role:"presentation",children:e.jsxs("section",{"aria-describedby":s?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[e.jsxs("header",{children:[e.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:e.jsx(St,{size:19})}),e.jsx("div",{children:e.jsx("h2",{id:"thread-delete-dialog-title",children:m})}),e.jsx("button",{"aria-label":"关闭删除确认",onClick:a,type:"button",children:e.jsx(he,{size:18})})]}),e.jsxs("div",{className:"thread-delete-dialog-body",children:[s&&e.jsx("p",{id:"thread-delete-dialog-description",children:s}),e.jsxs("div",{className:"thread-delete-dialog-target",children:[e.jsxs("span",{children:[g," · ",x]}),e.jsx("p",{children:i||"此回复没有可预览的文字内容。"})]})]}),e.jsxs("footer",{children:[e.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:a,type:"button",children:"取消"}),e.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:l,type:"button",children:[e.jsx(be,{size:15}),"确认删除"]})]})]})})}function gr(t){const r=t.replace(/\s+/g," ").trim();return r.length>100?`${r.slice(0,100).trimEnd()}…`:r}function fr(t){const r=a=>String(a).padStart(2,"0");return`${t.getFullYear()}-${r(t.getMonth()+1)}-${r(t.getDate())} ${r(t.getHours())}:${r(t.getMinutes())}:${r(t.getSeconds())}`}export{jt as P,ar as T,ur as a,dr as b,jr as c,Et as w};
