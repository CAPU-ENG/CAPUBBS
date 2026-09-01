import{p as Ie,r as o,j as e,a3 as Ue,X as fe,b as Be,d as Ye,aS as Ke,az as We,aT as Xe,aF as Je,at as Qe,aU as Ve,aV as Ze,aW as et,aX as tt,aY as rt,N as at,G as ae,x as nt,P as ot,aQ as it}from"./index-DG5VsjWu.js";import{d as ye,m as ce,s as st,e as lt,r as ct,f as ut,a as je,P as Se}from"./RichTextEditor.gallery-B8EBPikl.js";import{a as dt,r as mt,t as ft,g as gt}from"./forumMarkup-BjaNhhp8.js";import{P as pt}from"./plus-BadRVCpI.js";import{R as ht}from"./rotate-ccw-BTGMUzsA.js";import{l as bt}from"./thread-CUAmX428.js";import{D as Ee,T as ue}from"./TagBadge-C7aQI6Vu.js";import{T as ge}from"./trash-2-B7OFImJH.js";import{P as xe}from"./pencil-BCNtQtm3.js";import{E as yt}from"./external-link-BUqji_GP.js";import{T as xt}from"./triangle-alert-Cgu4XNWf.js";const vt=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],wt=Ie("paperclip",vt);const kt=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],It=Ie("reply",kt);async function jt(t){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(t),!0}catch{}const r=document.createElement("textarea");r.value=t,r.setAttribute("readonly",""),r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select();try{return document.execCommand("copy")}finally{r.remove()}}function Re({className:t="",html:r,onImageOpen:a,variant:g}){const n=o.useRef(null),d=o.useMemo(()=>({__html:r}),[r]);if(o.useEffect(()=>{const i=n.current;if(!i)return;const m=Array.from(i.querySelectorAll("img")),b=h=>{h.dataset.capubbsImageLoaded="true"},x=m.map(h=>{if(h.complete)return b(h),null;const k=()=>b(h);return h.addEventListener("load",k,{once:!0}),h.addEventListener("error",k,{once:!0}),{handleLoad:k,image:h}});return()=>{x.forEach(h=>{h&&(h.image.removeEventListener("load",h.handleLoad),h.image.removeEventListener("error",h.handleLoad))})}},[r]),!r)return null;function u(i,m){if(!a||!(i instanceof Element))return;const b=i.closest("img");if(!(b instanceof HTMLImageElement))return;const x=Array.from(m.querySelectorAll("img")),h=x.indexOf(b);if(h<0)return;const k=x.map(E=>St(E,m)),R=x.map((E,v)=>{const I=k[v];return{alt:E.alt.trim(),src:E.currentSrc||E.src,...I?{galleryId:I.galleryId,galleryIndex:I.galleryIndex}:{}}});a(R,h,b,E=>{const v=k[E];v&&st(v.gallery,v.galleryIndex)})}function l(i){const m=ye(i.target);if(m&&i.target instanceof Element){i.preventDefault(),i.stopPropagation(),ce(i.target,m);return}!a||!(i.target instanceof HTMLImageElement)||(i.preventDefault(),u(i.target,i.currentTarget))}function f(i){const m=ye(i.target);if(m&&["Enter"," "].includes(i.key)&&i.target instanceof Element){i.preventDefault(),ce(i.target,m);return}if(["ArrowLeft","ArrowRight"].includes(i.key)&&i.target instanceof Element&&i.target.closest(".capubbs-gallery")){i.preventDefault(),ce(i.target,i.key==="ArrowLeft"?"prev":"next");return}!a||!(i.target instanceof HTMLImageElement)||!["Enter"," "].includes(i.key)||(i.preventDefault(),u(i.target,i.currentTarget))}return e.jsx("div",{ref:n,className:`forum-markup forum-markup-${g} ${t}`.trim(),"data-forum-markup":g,dangerouslySetInnerHTML:d,onClick:l,onKeyDown:f})}function St(t,r){const a=t.closest(".capubbs-gallery");if(!a||!r.contains(a))return null;const n=Array.from(r.querySelectorAll(".capubbs-gallery")).indexOf(a),u=Array.from(a.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(t);return n>=0&&u>=0?{gallery:a,galleryId:n,galleryIndex:u}:null}const z=1,Ae=4,ie=.25;function Et(t){return Math.min(Ae,Math.max(z,t))}function de(t){const[r,a]=[...t.values()];return!r||!a?null:Math.hypot(a.x-r.x,a.y-r.y)}function Rt({images:t,initialImageIndex:r,onImageChange:a,onClose:g}){const n=Math.min(Math.max(0,r),Math.max(0,t.length-1)),[d,u]=o.useState(n),[l,f]=o.useState(z),[i,m]=o.useState({x:0,y:0}),[b,x]=o.useState(!1),h=o.useRef(null),k=o.useRef(null),R=o.useRef(null),F=o.useRef(null),E=o.useRef(n),v=o.useRef(z),I=o.useRef({x:0,y:0}),T=o.useRef(null),_=o.useRef(!1),A=o.useRef(new Map),P=o.useRef(null),K=o.useRef(z),X=o.useRef(a),G=o.useRef(g);X.current=a,G.current=g;function j(c,y=v.current){const w=h.current,C=R.current;if(!w||!C||y<=z)return{x:0,y:0};const O=Math.max(0,(C.clientWidth*y-w.clientWidth)/2),L=Math.max(0,(C.clientHeight*y-w.clientHeight)/2);return{x:Math.min(O,Math.max(-O,c.x)),y:Math.min(L,Math.max(-L,c.y))}}function U(c,y=v.current){const w=j(c,y);I.current=w,m(w)}function S(c){const y=Math.round(Et(c)*100)/100;v.current=y,f(y),U(I.current,y)}function H(){v.current=z,I.current={x:0,y:0},f(z),m({x:0,y:0})}function N(c){const y=Math.min(Math.max(0,c),t.length-1);y!==E.current&&(E.current=y,u(y),H(),X.current?.(y))}function $(){G.current(E.current)}o.useEffect(()=>{const c=document.body.style.overflow,y=document.activeElement,w=h.current;document.body.style.overflow="hidden",F.current?.focus();function C(p){if(p.key==="Escape"){p.preventDefault(),$();return}if(p.key==="ArrowLeft"){p.preventDefault(),p.stopPropagation(),N(E.current-1);return}if(p.key==="ArrowRight"){p.preventDefault(),p.stopPropagation(),N(E.current+1);return}if(p.key==="+"||p.key==="="){p.preventDefault(),p.stopPropagation(),S(v.current+ie);return}if(p.key==="-"){p.preventDefault(),p.stopPropagation(),S(v.current-ie);return}if(p.key==="0"){p.preventDefault(),p.stopPropagation(),H();return}if(p.key==="Tab"){const B=k.current?.querySelectorAll("button:not(:disabled)");if(!B?.length)return;const Z=B[0],re=B[B.length-1],ee=document.activeElement;if(p.shiftKey&&ee===Z){p.preventDefault(),re.focus();return}if(!p.shiftKey&&ee===re){p.preventDefault(),Z.focus();return}k.current?.contains(ee)||(p.preventDefault(),Z.focus())}}function O(p){if(p.preventDefault(),p.stopPropagation(),p.deltaY===0)return;const B=p.ctrlKey?.01:.002;S(v.current*Math.exp(-p.deltaY*B))}function L(p){p.preventDefault(),p.stopPropagation(),K.current=v.current}function q(p){if(p.preventDefault(),p.stopPropagation(),A.current.size>=2)return;const B=p.scale;typeof B=="number"&&S(K.current*B)}function V(){U(I.current,v.current)}return document.addEventListener("keydown",C,{capture:!0}),window.addEventListener("resize",V),w?.addEventListener("wheel",O,{passive:!1}),w?.addEventListener("gesturestart",L,{passive:!1}),w?.addEventListener("gesturechange",q,{passive:!1}),w?.addEventListener("gestureend",q,{passive:!1}),()=>{document.removeEventListener("keydown",C,{capture:!0}),window.removeEventListener("resize",V),w?.removeEventListener("wheel",O),w?.removeEventListener("gesturestart",L),w?.removeEventListener("gesturechange",q),w?.removeEventListener("gestureend",q),document.body.style.overflow=c,y instanceof HTMLElement&&y.focus()}},[]),o.useEffect(()=>{[t[d-1],t[d+1]].forEach(c=>{if(!c)return;const y=new Image;y.src=c.src})},[d,t]);function te(c,y,w){T.current={pointerId:c,startX:y,startY:w,originX:I.current.x,originY:I.current.y},x(!0)}function ne(c){if(c.target instanceof Element&&c.target.closest("button, .thread-image-lightbox-controls"))return;const y=c.pointerType==="touch",w=c.pointerType==="mouse"&&c.button===0;if(!(!y&&!w)&&(_.current=!1,!(!y&&v.current<=z))){if(c.preventDefault(),c.currentTarget.setPointerCapture(c.pointerId),y&&(A.current.set(c.pointerId,{x:c.clientX,y:c.clientY}),A.current.size===2)){P.current=de(A.current),T.current=null,x(!1);return}v.current>z&&te(c.pointerId,c.clientX,c.clientY)}}function J(c){const y=A.current.has(c.pointerId),w=T.current;if(!y&&w?.pointerId!==c.pointerId)return;if(c.preventDefault(),c.stopPropagation(),y&&A.current.set(c.pointerId,{x:c.clientX,y:c.clientY}),A.current.size===2){const L=de(A.current),q=P.current;if(!L||!q){P.current=L;return}Math.abs(L-q)>1&&(_.current=!0),S(v.current*(L/q)),P.current=L;return}if(!w||v.current<=z)return;const C=c.clientX-w.startX,O=c.clientY-w.startY;Math.hypot(C,O)>3&&(_.current=!0),U({x:w.originX+C,y:w.originY+O})}function Q(c){const y=A.current.delete(c.pointerId),w=T.current?.pointerId===c.pointerId;if(!(!y&&!w)){if(P.current=A.current.size===2?de(A.current):null,A.current.size===1&&v.current>z){const[C]=A.current.entries();if(C){const[O,L]=C;te(O,L.x,L.y)}}else T.current=null,x(!1);c.currentTarget.hasPointerCapture(c.pointerId)&&c.currentTarget.releasePointerCapture(c.pointerId)}}const oe=Math.round(l*100),D=t[d]??t[0];return D?Ue.createPortal(e.jsx("div",{className:"thread-image-lightbox-backdrop","data-can-pan":l>z,"data-dragging":b,onClick:c=>{c.target===c.currentTarget&&!_.current&&$()},onPointerCancel:Q,onPointerDown:ne,onPointerMove:J,onPointerUp:Q,ref:h,role:"presentation",children:e.jsxs("figure",{"aria-label":D.alt?`图片预览：${D.alt}（${d+1}/${t.length}）`:`图片预览（${d+1}/${t.length}）`,"aria-modal":"true",className:"thread-image-lightbox",ref:k,role:"dialog",children:[e.jsx("button",{"aria-label":"关闭图片预览",className:"thread-image-lightbox-close",onClick:$,ref:F,type:"button",children:e.jsx(fe,{size:20})}),t.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{"aria-label":"上一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-prev",disabled:d===0,onClick:()=>N(d-1),title:"上一张（←）",type:"button",children:e.jsx(Be,{size:28})}),e.jsx("button",{"aria-label":"下一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-next",disabled:d===t.length-1,onClick:()=>N(d+1),title:"下一张（→）",type:"button",children:e.jsx(Ye,{size:28})})]}),e.jsx("img",{alt:D.alt,draggable:"false",onLoad:()=>U(I.current,v.current),ref:R,src:D.src,style:{transform:`translate3d(${i.x}px, ${i.y}px, 0) scale(${l})`}}),D.alt&&e.jsx("figcaption",{children:D.alt}),e.jsxs("div",{"aria-label":"图片缩放",className:"thread-image-lightbox-controls",role:"toolbar",children:[e.jsx("button",{"aria-label":"缩小图片",disabled:l<=z,onClick:()=>S(l-ie),title:"缩小（-）",type:"button",children:e.jsx(lt,{size:18})}),e.jsxs("output",{"aria-label":"当前缩放比例","aria-live":"polite",children:[oe,"%"]}),e.jsx("button",{"aria-label":"放大图片",disabled:l>=Ae,onClick:()=>S(l+ie),title:"放大（+）",type:"button",children:e.jsx(pt,{size:18})}),e.jsx("button",{"aria-label":"恢复原始大小",disabled:l===z,onClick:H,title:"恢复原始大小（0）",type:"button",children:e.jsx(ht,{size:17})})]})]})}),document.body):null}const At=':root{--surface: #fffefa;--surface-raised: #ffffff;--surface-soft: #f6f8f4;--text: #20231f;--text-strong: #111411;--text-muted: #687068;--text-faint: #919991;--line: #e1e6df;--line-strong: #cdd5cc;--brand: #236b4c;--brand-strong: #174f38;--danger: #b8473f}:root.dark{--surface: #171d19;--surface-raised: #1c241f;--surface-soft: #1f2822;--text: #dde5de;--text-strong: #f6faf6;--text-muted: #a0aca2;--text-faint: #748078;--line: #2c362f;--line-strong: #3c493f;--brand: #69b98d;--brand-strong: #8bcca6;--danger: #ef8178}::-moz-selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}::selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentcolor}blockquote,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}a{color:inherit;text-decoration:inherit}button{margin:0;padding:0;background-color:transparent;color:inherit;font:inherit;letter-spacing:inherit;text-transform:none}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}.capubbs-html-frame-root iframe{background-color:transparent!important}img,video{max-width:100%;height:auto}table{border-color:inherit;border-collapse:collapse;text-indent:0}.capubbs-activity-signup-canceled,.capubbs-activity-signup-canceled *{color:var(--danger)!important;text-decoration-color:var(--danger)!important;text-decoration-line:line-through!important;text-decoration-thickness:2px!important}.forum-markup>:first-child{margin-top:0}.forum-markup>:last-child{margin-bottom:0}.forum-markup p,.forum-markup div{margin:0}.forum-markup-floor p{margin:0 0 .75em}.forum-markup-floor>div+div{margin-top:.55em}.forum-markup a{color:var(--brand-strong);font-weight:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.16em}.forum-markup .forum-mention{text-decoration:none}.forum-markup blockquote{margin:0 0 0 2em;border:0;padding:0;background:transparent;color:inherit}.forum-markup blockquote.forum-quote,.forum-markup .forum-legacy-quote,.forum-markup blockquote.capubbs-floor-quote{margin:.8em 0;border-left:3px solid color-mix(in srgb,var(--brand) 38%,var(--line));padding:.55em .75em;background:var(--surface-soft);color:var(--text-muted)}.forum-markup .capubbs-floor-quote-jump{margin-left:.75em}.forum-markup .forum-legacy-quote-content{margin:0}.forum-markup h1,.forum-markup h2,.forum-markup h3,.forum-markup h4,.forum-markup h5,.forum-markup h6{margin:.9rem 0 .45rem;color:var(--brand-strong);font-weight:800;line-height:1.35}.forum-markup h1{font-size:1.45rem}.forum-markup h2{font-size:1.25rem}.forum-markup h3{font-size:1.1rem}.forum-markup h4,.forum-markup h5,.forum-markup h6{font-size:1em}.forum-markup ul,.forum-markup ol{margin:.65em 0;padding-left:1.45em}.forum-markup ul{list-style:disc}.forum-markup ol{list-style:decimal}.forum-markup ol.capubbs-ordered-list-alpha{list-style-type:lower-alpha}.forum-markup ol.capubbs-ordered-list-roman{list-style-type:lower-roman}.forum-markup pre{max-width:100%;overflow-x:auto;margin:.75em 0;border-radius:2px;padding:.75em;background:#182531;color:#f8fafc;white-space:pre-wrap}.forum-markup code,.forum-markup kbd{border-radius:2px;padding:.08em .25em;background:color-mix(in srgb,var(--surface-soft) 75%,var(--line));font-family:SFMono-Regular,Cascadia Code,Consolas,monospace;font-size:.9em}.forum-markup pre code{padding:0;background:transparent;color:inherit}.forum-markup font[size="1"]{font-size:11px}.forum-markup font[size="2"]{font-size:13px}.forum-markup font[size="3"]{font-size:15px}.forum-markup font[size="4"]{font-size:17px}.forum-markup font[size="5"]{font-size:19px}.forum-markup font[size="6"]{font-size:21px}.forum-markup font[size="7"]{font-size:23px}.forum-markup hr{margin:.9em 0;border:0;border-top:1px solid var(--line-strong)}.forum-markup img{display:inline-block;height:auto;max-width:100%;vertical-align:middle}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){background-color:color-mix(in srgb,var(--surface-soft) 82%,var(--line));background-image:linear-gradient(105deg,transparent 20%,color-mix(in srgb,var(--surface-raised) 70%,transparent) 45%,transparent 70%);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}.forum-markup img[role=button]{cursor:zoom-in}.forum-markup img[role=button]:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse}.forum-markup td,.forum-markup th{border:1px solid var(--line);padding:.35em .5em}.forum-markup-signature{color:#999;font-family:monospace;font-size:14px;line-height:1.6;overflow-wrap:anywhere}.forum-markup .capubbs-gallery{position:relative;display:block;width:100%;margin:.9rem 0;overflow:hidden;border:1px solid var(--line);border-radius:2px;background:transparent;color:var(--text)}.forum-markup .capubbs-gallery:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup .capubbs-gallery-header{position:relative;display:flex;min-height:44px;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:9px 12px;border-bottom:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-title{width:100%;min-width:0;margin:0;color:var(--text-strong);font-size:.82rem;font-weight:760;line-height:1.4;text-align:center}.forum-markup .capubbs-gallery-stage{position:relative;display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide{display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-slide>img{display:block;width:100%;height:var(--capubbs-gallery-image-height, clamp(280px, 52vw, 560px));max-width:none;margin:0 auto;border-radius:0;-o-object-fit:contain;object-fit:contain}.forum-markup .capubbs-gallery-caption{display:block;margin:0;color:var(--text-muted);font-size:.78rem;line-height:1.55;text-align:center}.forum-markup .capubbs-gallery-caption[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-footer{position:relative;display:flex;min-height:44px;align-items:center;justify-content:center;margin:0;padding:9px 12px;border-top:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-captions{width:100%;min-width:0;margin:0;padding-inline:48px;text-align:center}.forum-markup .capubbs-gallery-count{position:absolute;top:50%;right:12px;color:var(--text-faint);font-size:.72rem;font-variant-numeric:tabular-nums;font-weight:760;line-height:1.25;transform:translateY(-50%)}.forum-markup .capubbs-gallery-count[data-capubbs-gallery-current]:before{content:attr(data-capubbs-gallery-current) "/" attr(data-capubbs-gallery-total)}.forum-markup .capubbs-gallery-nav{position:absolute;z-index:4;top:50%;display:grid;width:36px;height:48px;place-items:center;padding:0;transform:translateY(-50%);border:1px solid rgb(255 255 255 / .25);border-radius:2px;background:#00000080;color:#fff;cursor:pointer;transition:.15s ease}.forum-markup .capubbs-gallery-nav:hover{background:#000000b8}.forum-markup .capubbs-gallery-nav:focus-visible{outline:2px solid #fff;outline-offset:2px}.forum-markup .capubbs-gallery-nav:before{font-family:Arial,sans-serif;font-size:2rem;font-weight:300;line-height:1}.forum-markup .capubbs-gallery-nav-prev:before{content:"‹"}.forum-markup .capubbs-gallery-nav-next:before{content:"›"}.forum-markup .capubbs-gallery-nav-prev{left:10px}.forum-markup .capubbs-gallery-nav-next{right:10px}@keyframes capubbs-image-loading{0%{background-position:120% 0}to{background-position:-80% 0}}@media(max-width:640px){.forum-markup .capubbs-gallery-slide>img{height:var(--capubbs-gallery-image-height, min(72vw, 420px))}.forum-markup .capubbs-gallery-nav{width:32px;height:42px}.forum-markup .capubbs-gallery-nav-prev{left:7px}.forum-markup .capubbs-gallery-nav-next{right:7px}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){animation:none}}',Tt=28,Nt=64,$t=5e4,Ct=30,Te=30,Y="capubbs-thread-html-frame",Ne=new URL("/bbs/lib/jquery.min.js",window.location.origin).href,Lt=Ot(At);let se=null;function ve({className:t="",floor:r,html:a,isActivitySignupCanceled:g=!1,onImageOpen:n,onIsolatedTextSelection:d,variant:u}){const l=o.useMemo(()=>u==="signature"?ct(a):a,[a,u]),f=Pt(l,u==="signature"),i=dt(f),m=o.useMemo(()=>i?null:mt(f,{normalizeLegacyLineBreaks:u==="signature"}),[f,i,u]),b=o.useMemo(()=>ft(f),[f]);return!i&&m!==null?e.jsx(Re,{className:t,html:m,onImageOpen:n,variant:u}):e.jsx(Mt,{className:t,floor:r,html:b,isActivitySignupCanceled:g,onImageOpen:n,onTextSelection:d,variant:u})}function Mt({className:t,floor:r,html:a,isActivitySignupCanceled:g,onImageOpen:n,onTextSelection:d,variant:u}){const l=o.useRef(null),f=o.useRef(`${u}-${r}-${Math.random().toString(36).slice(2)}`),i=o.useRef(n);i.current=n;const m=o.useRef(d);m.current=d;const b=u==="signature"?Tt:Nt,x=!!n,[h,k]=o.useState(null),R=Gt(),F=o.useRef(R),E=Ke(),v=u==="signature"?14:E,I=o.useMemo(()=>qt(a),[a]),T=I.includes('type="text/capubbs-user-script"'),_=o.useMemo(()=>Dt({canOpenImages:x,frameId:f.current,hasUserScripts:T,html:I,isActivitySignupCanceled:g,isDarkTheme:F.current,fontSize:v,variant:u}),[x,I,v,T,g,u]),A=o.useMemo(()=>`data:text/html;charset=utf-8,${encodeURIComponent(_)}`,[_]),P=o.useCallback(()=>{l.current?.contentWindow?.postMessage({frameId:f.current,source:Y,theme:R?"dark":"light",type:"theme"},"*")},[R]),K=o.useCallback((G=l.current?.contentWindow)=>{!T||!G||we().then(j=>{l.current?.contentWindow===G&&G.postMessage({frameId:f.current,jquerySource:j,source:Y,type:"jquery-response"},"*")})},[T]),X=o.useCallback(()=>{P(),K()},[K,P]);return o.useEffect(()=>{k(null)},[A]),o.useEffect(()=>{P()},[P]),o.useEffect(()=>{T&&we()},[T]),o.useLayoutEffect(()=>{function G(j){const U=l.current?.contentWindow;if(!(!U||j.source!==U||!_t(j.data))&&j.data.frameId===f.current){if(j.data.type==="jquery-request"){K(U);return}if(j.data.type==="anchor"){const S=l.current;if(!S)return;const H=window.getComputedStyle(document.documentElement),N=Number.parseFloat(H.getPropertyValue("--topbar-height"))||0,$=window.scrollY+S.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,$+j.data.offsetTop-N-16)});return}if(j.data.type==="navigate"){const S=We(j.data.url,$e());if(!S)return;window.history.pushState(null,"",S),window.dispatchEvent(new Event(Xe));const H=new URL(S,window.location.origin);H.hash?window.requestAnimationFrame(()=>{const N=decodeURIComponent(H.hash.slice(1)),$=Je(`#${N}`);($?Qe($):document.getElementById(N))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(j.data.type==="image-open"){const S=l.current;if(!S)return;const H=N=>{const $=j.data.images[N];!$||typeof $.galleryId!="number"||!Number.isSafeInteger($.galleryIndex)||S.contentWindow?.postMessage({frameId:f.current,galleryId:$.galleryId,galleryIndex:$.galleryIndex,source:Y,type:"gallery-select"},"*")};i.current?.(j.data.images,j.data.imageIndex,S,H);return}if(j.data.type==="selection"){j.data.text&&window.getSelection()?.removeAllRanges(),m.current?.(j.data.text);return}k(Math.min($t,Math.max(b,Math.ceil(j.data.height))))}}return window.addEventListener("message",G),()=>window.removeEventListener("message",G)},[b,K]),e.jsx("iframe",{ref:l,className:`thread-html-frame thread-html-frame-${u} ${t}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-same-origin allow-downloads",scrolling:"no",src:A,onLoad:X,style:{"--thread-html-frame-width-allowance":`${Te}px`,...h===null?{}:{"--thread-html-frame-height":`${h}px`}},title:u==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`})}function Pt(t,r){const[a,g]=o.useState(t);return o.useEffect(()=>{const n=new AbortController,d=r?ut(t):[];if(g(t),d.length===0)return()=>n.abort();const u=Array.from(new Map(d.map(l=>[`${l.bid}:${l.tid}:${l.pid}`,l])).values());return Promise.all(u.map(async l=>{try{const f=await bt(l,n.signal);return[`${l.bid}:${l.tid}:${l.pid}`,f]}catch(f){if(f instanceof DOMException&&f.name==="AbortError")throw f;return[`${l.bid}:${l.tid}:${l.pid}`,""]}})).then(l=>{if(n.signal.aborted)return;const f=new Map(l);let i=t;d.forEach(m=>{const b=f.get(`${m.bid}:${m.tid}:${m.pid}`);b&&(i=i.replace(m.marker,b))}),g(i)}).catch(()=>{}),()=>n.abort()},[r,t]),a}function Dt({canOpenImages:t,frameId:r,fontSize:a,hasUserScripts:g,html:n,isActivitySignupCanceled:d,isDarkTheme:u,variant:l}){const f=l==="signature",i=f?"#999999":"rgb(63 63 70)",m=f?"#999999":"rgb(228 228 231)",b=f?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",x=f?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",h=d?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${u?"dark":"light"}" style="background:transparent;color-scheme:${u?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${Ht($e())}">
  <meta http-equiv="Content-Security-Policy" content="${zt()}">
  <style>${Lt}</style>
  <style>
    html{--capubbs-frame-text-color:${i}}html.dark{--capubbs-frame-text-color:${m}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${b};font-size:${a}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${Te}px);${x}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${Ft(r,t,g)}<\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${l}${h}">${n}</main></body>
</html>`}function Ft(t,r,a){return`(function(){
    var frameId=${JSON.stringify(t)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(Ve)};
    var canOpenImages=${JSON.stringify(r)};
    var hasUserScripts=${JSON.stringify(a)};
    var jquerySourceUrl=${JSON.stringify(Ne)};
    var forumAppExactPaths=${JSON.stringify(Ze)};
    var forumAppPathPrefixes=${JSON.stringify(et)};
    var legacyForumExactPaths=${JSON.stringify(tt)};
    var legacyForumPathPatterns=${JSON.stringify(rt)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${Ct};
    var queued=false;
    var selectionQueued=false;
    var lastSelectionText='';
    var userScriptsExecuted=false;
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
      document.addEventListener('selectionchange',queueSelection);
      document.addEventListener('click',handleGalleryClick);
      document.addEventListener('keydown',handleGalleryKeyDown);
      window.addEventListener('message',handleParentMessage);
      document.addEventListener('click',handleImageClick);
      document.addEventListener('keydown',handleImageKeyDown);
      document.addEventListener('click',handleForumNavigationClick);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(queueHeight);
      if(hasUserScripts)window.parent.postMessage({source:'${Y}',type:'jquery-request',frameId:frameId},'*');
      else executeUserScripts();
      prepareImages();
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`}function qt(t){return t.replace(/<script\b([^>]*)>/gi,(r,a)=>`<script${a.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function we(){return se||(se=fetch(Ne,{credentials:"same-origin"}).then(t=>{if(!t.ok)throw new Error(`Failed to load jQuery: ${t.status}`);return t.text()}).catch(()=>null),se)}function zt(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'","upgrade-insecure-requests"].join("; ")}function $e(){return new URL("/bbs/content/",window.location.origin).href}function Ht(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Ot(t){return t.replace(/<\/style/gi,"<\\/style")}function _t(t){if(!t||typeof t!="object")return!1;const r=t;return r.source!==Y||typeof r.frameId!="string"?!1:r.type==="anchor"?typeof r.offsetTop=="number"&&Number.isFinite(r.offsetTop)&&r.offsetTop>=0:r.type==="navigate"?typeof r.url=="string":r.type==="jquery-request"?!0:r.type==="selection"?typeof r.text=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(a=>!!a&&typeof a=="object"&&typeof a.alt=="string"&&typeof a.src=="string"&&a.src.length>0&&(a.galleryId===void 0&&a.galleryIndex===void 0||typeof a.galleryId=="number"&&Number.isSafeInteger(a.galleryId)&&a.galleryId>=0&&typeof a.galleryIndex=="number"&&Number.isSafeInteger(a.galleryIndex)&&a.galleryIndex>=0)):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function Gt(){const[t,r]=o.useState(()=>document.documentElement.classList.contains("dark"));return o.useEffect(()=>{const a=document.documentElement,g=()=>r(a.classList.contains("dark")),n=new MutationObserver(g);return n.observe(a,{attributeFilter:["class"],attributes:!0}),()=>n.disconnect()},[]),t}function Ut({attachments:t=[],bodyClassName:r="thread-floor-body",bodyFallback:a=null,bodyHtml:g,floor:n,isActivitySignupCanceled:d=!1,onImageOpen:u,onIsolatedTextSelection:l,signatureClassName:f="thread-signature",signatureHtml:i,signatureText:m}){const b=u?(x,h,k,R)=>{const F=x[h];F&&u([F],0,k,R?()=>R(h):void 0)}:void 0;return e.jsxs(e.Fragment,{children:[g?e.jsx(ve,{className:r,floor:n,html:g,isActivitySignupCanceled:d,onImageOpen:u,onIsolatedTextSelection:l,variant:"floor"}):a,e.jsx(Bt,{attachments:t}),i?e.jsx(ve,{className:f,floor:n,html:i,onImageOpen:b,variant:"signature"}):m?e.jsx("footer",{className:f,children:e.jsx("p",{children:m})}):null]})}function Bt({attachments:t}){return t.length===0?null:e.jsxs("section",{"aria-label":"附件",className:"thread-attachments",children:[e.jsxs("header",{className:"thread-attachments-heading",children:[e.jsx(wt,{"aria-hidden":"true",size:14}),e.jsx("span",{children:"附件"}),e.jsx("small",{children:t.length})]}),e.jsx("ul",{children:t.map(r=>{const a=e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"thread-attachment-name",children:r.name}),e.jsx("small",{children:Yt(r)}),r.exists!==!1&&e.jsx(at,{"aria-hidden":"true",size:15})]});return e.jsx("li",{children:r.exists===!1?e.jsx("div",{"aria-disabled":"true",className:"thread-attachment-link is-unavailable",children:a}):e.jsx("a",{className:"thread-attachment-link",download:r.name,href:r.downloadHref||`/bbs/download/?id=${encodeURIComponent(r.id)}`,children:a})},r.id)})})]})}function Yt(t){if(t.exists===!1)return"文件不可用";const r=[Kt(t.size),(t.price??0)>0?"付费附件":"免费"];return t.downloadCount!==void 0&&r.push(`下载 ${t.downloadCount} 次`),r.join(" · ")}function Kt(t){if(t<=0)return"大小未知";if(t<1024)return`${t} B`;const r=["KB","MB","GB","TB"];let a=t,g=-1;do a/=1024,g+=1;while(a>=1024&&g<r.length-1);return`${a.toFixed(a>=10?1:2)} ${r[g]}`}function Wt({author:t,id:r}){const a=t.tags??[],[g,n]=o.useState(!1),d=o.useRef(null),u=o.useRef(null),l=o.useRef(null),f=o.useRef(null),i=a.map(m=>`${m.id}:${m.name}`).join("|");return o.useLayoutEffect(()=>{if(a.length===0){n(!1);return}const m=()=>{const x=d.current,h=u.current,k=l.current,R=f.current;if(!x||!h||!k||!R||x.offsetWidth===0)return;const F=k.getBoundingClientRect().width,E=R.getBoundingClientRect().width,v=Number.parseFloat(getComputedStyle(h).columnGap)||0,I=h.clientWidth-F-v,T=E>I+1;n(_=>_===T?_:T)};m();const b=new ResizeObserver(m);return[d.current,u.current,f.current].forEach(x=>{x&&b.observe(x)}),()=>b.disconnect()},[i,a.length]),e.jsxs("div",{id:r,ref:d,className:"author-hover-card",role:"dialog","aria-label":`${t.name} 的用户摘要`,children:[e.jsxs("div",{className:"author-card-head",children:[e.jsx("img",{src:t.avatar,alt:""}),e.jsxs("div",{className:"author-card-head-copy",children:[e.jsxs("div",{ref:u,className:"author-card-name-line","data-tags-overflow":g?"true":void 0,children:[e.jsx("strong",{ref:l,children:t.name}),e.jsx("div",{className:"author-card-tag-slot",children:e.jsx(ue,{size:"compact",tags:a})})]}),(t.stars>0||t.role)&&e.jsxs("span",{className:"author-card-status",children:["★".repeat(t.stars),t.stars>0&&t.role?" · ":"",t.role]})]})]}),g?e.jsx("div",{className:"author-card-tags-row",children:e.jsx(ue,{size:"compact",tags:a})}):null,t.medals?.length?e.jsx("div",{className:"author-card-medals",children:e.jsx(Se,{medals:t.medals,profileName:t.name,variant:"compact"})}):null,e.jsx("div",{ref:f,className:"author-card-tag-width-measure","aria-hidden":"true",children:e.jsx(ue,{size:"compact",tags:a})}),e.jsxs("dl",{children:[e.jsxs("div",{children:[e.jsx("dt",{children:"主题"}),e.jsx("dd",{children:t.topics})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"回复"}),e.jsx("dd",{children:t.replies})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"签到"}),e.jsx("dd",{children:t.checkins})]})]}),e.jsxs("p",{children:["最近在线：",t.lastSeen]}),e.jsxs("a",{href:ae(t.name),children:["查看个人主页 ",e.jsx(yt,{size:13})]})]})}function Xt({author:t}){const r=t.tags??[],a=je(r),g=ae(t.name);return e.jsxs("aside",{className:"thread-author-profile","aria-label":`${t.name} 的资料`,children:[e.jsx("a",{"aria-label":`查看${t.name}的个人主页`,className:"thread-author-profile-avatar",href:g,children:e.jsx("img",{src:t.avatar,alt:""})}),e.jsx("div",{className:"thread-author-profile-identity",children:e.jsx("a",{href:g,children:t.name})}),(t.stars>0||t.role)&&e.jsxs("div",{className:"thread-author-profile-status",children:[t.stars>0&&e.jsx("span",{"aria-label":`${t.stars} 星`,children:"★".repeat(t.stars)}),t.role&&e.jsx("strong",{children:t.role})]}),e.jsx(Ee,{tags:a}),e.jsx(Se,{medals:t.medals??[],profileName:t.name,variant:"compact"}),e.jsxs("dl",{className:"thread-author-profile-stats",children:[e.jsxs("div",{children:[e.jsx("dt",{children:"主题"}),e.jsx("dd",{children:t.topics})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"回复"}),e.jsx("dd",{children:t.replies})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"签到"}),e.jsx("dd",{children:t.checkins})]})]}),e.jsxs("p",{className:"thread-author-profile-last-seen",children:[e.jsx("span",{children:"最近在线"}),e.jsx("strong",{children:t.lastSeen})]})]})}function me(t){return t.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function Jt(t){const r=window.getSelection()?.toString();r&&(t.preventDefault(),t.clipboardData.setData("text/plain",r))}function Qt({articleAfterContent:t,author:r,avatarRail:a,className:g="",content:n,decorationImageSrc:d,editedAt:u,floor:l,floorIndex:f,id:i,inlineAvatar:m=!1,mainAfterContent:b,onCopy:x,publishedAt:h,showAuthorProfile:k}){const R=r.tags??[],F=je(R);return e.jsxs("article",{className:`thread-floor${k?" thread-floor-with-author-profile":""}${g?` ${g}`:""}`,"data-floor":l,id:i,onCopy:x,children:[d&&e.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:e.jsx("img",{alt:"",src:d})}),k?e.jsx(Xt,{author:r}):!m&&a,e.jsxs("div",{className:"thread-floor-main",children:[e.jsxs("header",{className:"thread-floor-header",children:[!k&&m&&a,e.jsxs("div",{className:"thread-floor-author",children:[e.jsx("a",{href:ae(r.name),children:r.name}),e.jsx(Ee,{tags:F})]}),e.jsxs("div",{className:"thread-floor-time",children:[e.jsx("time",{children:me(h)}),u&&e.jsxs(e.Fragment,{children:[e.jsx("span",{children:"·"}),e.jsxs("time",{children:["编辑于 ",me(u)]})]})]}),f]}),k?e.jsx("div",{className:"thread-floor-content",children:n}):n,b]}),t]})}function Vt({canDelete:t,canEdit:r,canQuote:a,canReply:g,decorative:n=!1,deleting:d=!1,editHref:u="",onDelete:l,onQuote:f,onReply:i}){const m=n?-1:void 0,b=o.useRef(null);return e.jsxs("div",{"aria-hidden":n||void 0,className:`thread-floor-actions${n?" thread-floor-actions-decorative":""}`,children:[a&&e.jsxs("button",{onClick:x=>{const h=b.current?b.current.text:ke(x.currentTarget);b.current=null,f?.(h)},onPointerDown:x=>{x.button===0&&(b.current={text:ke(x.currentTarget)})},tabIndex:m,type:"button",children:[e.jsx(it,{size:15}),"引用"]}),g&&e.jsxs("button",{onClick:i,tabIndex:m,type:"button",children:[e.jsx(It,{size:15}),"回复"]}),r&&(n?e.jsxs("button",{tabIndex:-1,type:"button",children:[e.jsx(xe,{size:15}),"编辑"]}):e.jsxs("a",{href:u,children:[e.jsx(xe,{size:15}),"编辑"]})),t&&e.jsxs("button",{"aria-busy":d||void 0,className:"floor-action-danger",disabled:!n&&d,onClick:n?void 0:x=>l?.(x.currentTarget),tabIndex:m,type:"button",children:[e.jsx(ge,{size:15}),d?"删除中":"删除"]})]})}function fr({canQuote:t,canReply:r,decorationImageSrc:a,editHref:g,floor:n,isActivityThread:d,isMainPost:u,inlineAvatar:l,showAuthorProfile:f,hideSignature:i,onDeleteFloor:m,onDeleteNestedReply:b,onIsolatedTextSelection:x,onQuote:h,onSubmitNestedReply:k,viewer:R}){const[F,E]=o.useState(!1),[v,I]=o.useState(null),[T,_]=o.useState([]),[A,P]=o.useState(""),[K,X]=o.useState(!1),[G,j]=o.useState([]),[U,S]=o.useState(""),[H,N]=o.useState(""),[$,te]=o.useState(null),[ne,J]=o.useState(""),[Q,oe]=o.useState(!1),[D,c]=o.useState(void 0),[y,w]=o.useState(null),[C,O]=o.useState(!1),L=o.useRef(null),q=o.useRef(null),V=o.useRef(null),p=o.useRef(null),B=o.useRef(null),Z=o.useMemo(()=>[...n.nestedReplies??[],...G].filter(s=>!T.includes(s.id)),[T,n.nestedReplies,G]),re=d&&!u&&/<\s*(?:s|strike)\b/i.test(n.contentHtml??""),ee=`thread-floor-body${re?" capubbs-activity-signup-canceled":""}`;o.useEffect(()=>()=>{q.current!==null&&window.clearTimeout(q.current)},[]),o.useEffect(()=>{if(!C)return;function s(M){L.current?.contains(M.target)||O(!1)}return document.addEventListener("pointerdown",s),()=>document.removeEventListener("pointerdown",s)},[C]);async function Ce(){const s=`${window.location.origin}${window.location.pathname}${window.location.search}#${n.floor}`;await jt(s)&&(E(!0),q.current!==null&&window.clearTimeout(q.current),q.current=window.setTimeout(()=>E(!1),1800))}const pe=(s,M,W,le)=>{B.current=W,w({imageIndex:M,images:s,onImageChange:le})};function Le(s){y?.onImageChange?.(s),w(null),window.requestAnimationFrame(()=>B.current?.focus())}function he(s=null){c(s),S(""),N(""),J(""),window.requestAnimationFrame(()=>p.current?.focus())}function be(){c(void 0),S(""),J("")}async function Me(s){s.preventDefault();const M=U.trim();if(!(!M||!R||Q)){oe(!0),J("");try{const W=await k(n,D??null,M);j(le=>[...le,{author:R,canDelete:!0,content:M,id:W>0?String(W):`local-${n.id}-${Date.now()}`,publishedAt:tr(new Date),target:D??void 0}]),be()}catch(W){J(W instanceof Error?W.message:"楼中楼回复发布失败，请稍后重试。")}finally{oe(!1)}}}async function Pe(s){te(s.id),N("");try{await b(n,s),_(M=>[...M,s.id]),j(M=>M.filter(W=>W.id!==s.id)),I(null)}catch(M){N(M instanceof Error?M.message:"楼中楼删除失败，请稍后重试。")}finally{te(null)}}async function De(){if(!K){X(!0),P("");try{await m(n)}catch(s){P(s instanceof Error?s.message:"楼层删除失败，请稍后重试。"),X(!1)}}}function Fe(){I(null),P(""),N(""),window.requestAnimationFrame(()=>V.current?.focus())}function qe(){if(!v)return;const s=v;I(null),s.kind==="floor"?De():Pe(s.reply)}const ze=e.jsxs("div",{className:`thread-avatar-rail${C?" thread-avatar-rail-open":""}`,ref:L,children:[e.jsx("button",{"aria-controls":`author-card-${n.floor}`,"aria-expanded":C,"aria-label":`查看${n.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>O(s=>!s),type:"button",children:e.jsx("img",{src:n.author.avatar,alt:""})}),e.jsx(Wt,{author:n.author,id:`author-card-${n.floor}`})]}),He=e.jsx(Ut,{attachments:n.attachments,bodyFallback:e.jsx("div",{className:ee,children:n.paragraphs.map(s=>e.jsx("p",{children:s},s))}),bodyClassName:ee,bodyHtml:n.contentHtml,floor:n.floor,isActivitySignupCanceled:re,onImageOpen:pe,onIsolatedTextSelection:s=>x(n,s),signatureHtml:i?void 0:n.signatureHtml,signatureText:i?void 0:n.signature}),Oe=e.jsxs("button",{"aria-label":`复制第 ${n.floor} 楼链接`,className:"thread-floor-index",onClick:Ce,title:"复制楼层链接",type:"button",children:["#",n.floor]}),_e=e.jsxs(e.Fragment,{children:[e.jsx(Vt,{canDelete:(!d||u)&&(n.canDelete??n.isOwn??!1),canEdit:(!d||u)&&!!n.isOwn,canQuote:t,canReply:r,deleting:K,editHref:g,onDelete:s=>{V.current=s,P(""),I({kind:"floor"})},onQuote:s=>h(n,s),onReply:()=>he()}),A&&e.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:A}),Z.length>0&&e.jsx("section",{className:"nested-replies","aria-label":`${n.floor} 楼的楼中楼回复`,children:Z.map(s=>e.jsxs("article",{children:[e.jsx("img",{src:s.author.avatar,alt:""}),e.jsxs("div",{className:"nested-reply-main",children:[e.jsxs("div",{className:"nested-reply-identity",children:[e.jsx("a",{className:"nested-reply-author",href:ae(s.author.name),children:s.author.name}),s.target&&e.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",e.jsx("a",{href:ae(s.target),children:s.target})]})]}),s.contentHtml?e.jsx(Re,{className:"nested-reply-content",html:s.contentHtml,onImageOpen:pe,variant:"nested"}):e.jsx("p",{children:s.content}),e.jsxs("footer",{className:"nested-reply-footer",children:[e.jsx("time",{children:me(s.publishedAt)}),r&&e.jsx("button",{onClick:()=>he(s.author.name),type:"button",children:"回复"}),s.canDelete&&e.jsxs("button",{className:"nested-reply-delete",disabled:$===s.id,onClick:M=>{V.current=M.currentTarget,N(""),I({kind:"nested",reply:s})},type:"button",children:[e.jsx(ge,{size:12}),$===s.id?"删除中":"删除"]})]})]})]},s.id))}),H&&e.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:H}),D!==void 0&&r&&e.jsxs("form",{className:"nested-reply-composer",onSubmit:Me,children:[e.jsx("textarea",{"aria-label":D?`回复 @${D}`:`回复第 ${n.floor} 楼`,maxLength:500,onChange:s=>{S(s.target.value),J("")},placeholder:D?`回复 @${D}`:"写一条楼中楼回复",ref:p,rows:2,value:U}),e.jsxs("div",{className:"nested-reply-composer-actions",children:[e.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:Q,onClick:be,type:"button",children:e.jsx(fe,{size:15})}),e.jsxs("button",{className:"nested-reply-submit",disabled:!U.trim()||Q,type:"submit",children:[e.jsx(nt,{size:14}),Q?"发送中":"发送"]})]}),ne&&e.jsx("p",{className:"nested-reply-error",role:"alert",children:ne})]})]}),Ge=e.jsxs(e.Fragment,{children:[F&&e.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[e.jsx(ot,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),y&&e.jsx(Rt,{images:y.images,initialImageIndex:y.imageIndex,onImageChange:y.onImageChange,onClose:Le}),v&&e.jsx(Zt,{floor:n,isMainPost:u,onCancel:Fe,onConfirm:qe,target:v})]});return e.jsx(Qt,{articleAfterContent:Ge,author:n.author,avatarRail:ze,content:He,decorationImageSrc:a,editedAt:n.editedAt,floor:n.floor,floorIndex:Oe,id:String(n.floor),inlineAvatar:l,mainAfterContent:_e,onCopy:Jt,publishedAt:n.publishedAt,showAuthorProfile:f})}function ke(t){const r=t.closest(".thread-floor")?.querySelector(".thread-floor-body");return gt(window.getSelection(),r??null)}function Zt({floor:t,isMainPost:r,onCancel:a,onConfirm:g,target:n}){const d=n.kind==="nested"?n.reply:null,u=d?"删除楼中楼回复":r?"删除主楼":"删除回复",l=d?"":r?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",f=d?.author.name??t.author.name,i=d?`#${t.floor} · 楼中楼`:`#${t.floor}`,m=er(d?.content||t.quoteText||t.paragraphs[0]||"");return o.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),o.useEffect(()=>{function b(x){x.key==="Escape"&&a()}return document.addEventListener("keydown",b),()=>document.removeEventListener("keydown",b)},[a]),e.jsx("div",{className:"thread-delete-dialog-backdrop",onMouseDown:b=>{b.currentTarget===b.target&&a()},role:"presentation",children:e.jsxs("section",{"aria-describedby":l?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[e.jsxs("header",{children:[e.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:e.jsx(xt,{size:19})}),e.jsx("div",{children:e.jsx("h2",{id:"thread-delete-dialog-title",children:u})}),e.jsx("button",{"aria-label":"关闭删除确认",onClick:a,type:"button",children:e.jsx(fe,{size:18})})]}),e.jsxs("div",{className:"thread-delete-dialog-body",children:[l&&e.jsx("p",{id:"thread-delete-dialog-description",children:l}),e.jsxs("div",{className:"thread-delete-dialog-target",children:[e.jsxs("span",{children:[f," · ",i]}),e.jsx("p",{children:m||"此回复没有可预览的文字内容。"})]})]}),e.jsxs("footer",{children:[e.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:a,type:"button",children:"取消"}),e.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:g,type:"button",children:[e.jsx(ge,{size:15}),"确认删除"]})]})]})})}function er(t){const r=t.replace(/\s+/g," ").trim();return r.length>100?`${r.slice(0,100).trimEnd()}…`:r}function tr(t){const r=a=>String(a).padStart(2,"0");return`${t.getFullYear()}-${r(t.getMonth()+1)}-${r(t.getDate())} ${r(t.getHours())}:${r(t.getMinutes())}:${r(t.getSeconds())}`}export{wt as P,Ut as T,Qt as a,Vt as b,fr as c,jt as w};
