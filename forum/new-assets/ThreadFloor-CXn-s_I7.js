import{w as ze,r as l,a3 as st,bv as it,j as a,a4 as lt,$ as Ae,d as ct,e as ut,bw as dt,bx as mt,by as ft,bz as pt,bA as gt,aP as ht,bB as bt,aW as yt,aJ as xt,bC as vt,bD as wt,bE as It,bF as At,bG as kt,a8 as St,Z as ie,G as Rt,aa as Et,bc as Ct,bH as jt}from"./index-Ds192UTW.js";import{e as Lt,d as Le,m as fe,s as Tt,f as Nt,r as qt,h as Pt,a as De,P as Fe}from"./RichTextEditor.gallery-BBji22Xj.js";import{P as Mt}from"./plus-aLKrHNv4.js";import{R as $t}from"./rotate-ccw-VYeDL3bG.js";import{f as zt}from"./dataDisplay-CGd8IMVW.js";import{D as Oe,T as pe}from"./TagBadge-BB2S92Kd.js";import{T as ke}from"./trash-2-BXVOcInz.js";import{P as Te}from"./pencil-CbnBNSrr.js";import{E as Dt}from"./external-link-C_Z6R3d-.js";import{T as Ft}from"./triangle-alert-DQuNcpZC.js";const Ot=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],Ht=ze("paperclip",Ot);const Gt=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],Ut=ze("reply",Gt);async function _t(e){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),!0}catch{}const r=document.createElement("textarea");r.value=e,r.setAttribute("readonly",""),r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select();try{return document.execCommand("copy")}finally{r.remove()}}const Bt={black:0,darkgray:169,darkgrey:169,dimgray:105,dimgrey:105,gainsboro:220,gray:128,grey:128,lightgray:211,lightgrey:211,silver:192,white:255,whitesmoke:245},ge="data-capubbs-original-grayscale-color-attr",he="data-capubbs-original-grayscale-style-color";function Wt(e){const r=String(e??"").trim().toLowerCase().replace(/^['"]|['"]$/g,""),t=r.replace(/\s+/g,""),o=Bt[t];if(typeof o=="number")return{alpha:1,channel:o};const n=t.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);if(n){const s=n[1].length<=4?n[1].split("").map(f=>`${f}${f}`).join(""):n[1],p=Number.parseInt(s.slice(0,2),16),g=Number.parseInt(s.slice(2,4),16),I=Number.parseInt(s.slice(4,6),16),y=s.length===8?Number.parseInt(s.slice(6,8),16)/255:1;return p===g&&g===I?{alpha:y,channel:p}:null}const u=r.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*(?:,|\/)\s*([01](?:\.\d+)?|\.\d+|100%|\d{1,3}(?:\.\d+)?%))?\s*\)$/);if(!u)return null;const i=be(u[1]),c=be(u[2]),d=be(u[3]),b=Kt(u[4]);return i===null||c===null||d===null||b===null?null:i===c&&c===d?{alpha:b,channel:i}:null}function He(e,r=!0){const t=Wt(e);if(!t)return null;const o=255-t.channel;if(r&&t.alpha<1)return`rgba(${o}, ${o}, ${o}, ${Xt(t.alpha)})`;const n=o.toString(16).padStart(2,"0");return`#${n}${n}${n}`}function Yt(e,r){[...e.matches("[color], [style]")?[e]:[],...Array.from(e.querySelectorAll("[color], [style]"))].forEach(o=>{Vt(o,r),o instanceof HTMLElement&&Jt(o,r)})}function Vt(e,r){const t=e.getAttribute(ge);if(r==="light"){if(t===null)return;e.setAttribute("color",t),e.removeAttribute(ge);return}const o=t??e.getAttribute("color"),n=He(o,!1);!n||o===null||(t===null&&e.setAttribute(ge,o),e.getAttribute("color")!==n&&e.setAttribute("color",n))}function Jt(e,r){const t=e.getAttribute(he);if(r==="light"){if(t===null)return;e.style.setProperty("color",t,e.style.getPropertyPriority("color")),e.removeAttribute(he);return}const o=t??e.style.getPropertyValue("color"),n=He(o);!n||!o||(t===null&&e.setAttribute(he,o),e.style.getPropertyValue("color")!==n&&e.style.setProperty("color",n,e.style.getPropertyPriority("color")))}function be(e){const r=e.endsWith("%"),t=Number(r?e.slice(0,-1):e);return Number.isFinite(t)?r?t>=0&&t<=100?Math.round(t*2.55):null:t>=0&&t<=255?Math.round(t):null:null}function Kt(e){if(e===void 0)return 1;const r=e.endsWith("%"),t=Number(r?e.slice(0,-1):e);return Number.isFinite(t)?r?t>=0&&t<=100?t/100:null:t>=0&&t<=1?t:null:null}function Xt(e){return Number(e.toFixed(3))}function Qt(e){const r=[];return e.querySelectorAll("table").forEach(t=>{if(t.classList.contains("forum-punishment-table")||t.parentElement?.closest("table")||t.querySelector("table")||t.rows.length<2||!Array.from(t.rows).some(s=>s.cells.length>1))return;let o=t.parentElement;if(!o?.classList.contains("forum-table-scroll")){o=t.ownerDocument.createElement("div"),o.className="forum-table-scroll",o.tabIndex=0,t.before(o),o.append(t),t.classList.add("forum-data-table");let s=[],p=null;Array.from(t.rows).forEach((g,I)=>{p!==g.parentElement&&(p=g.parentElement,s=[]);let y=0;Array.from(g.cells).forEach(f=>{for(;(s[y]??0)>0;)y+=1;y===0&&f.colSpan===1&&f.classList.add("forum-table-first-column"),I===0&&!t.tHead&&f.classList.add("forum-table-heading");const S=f.rowSpan===0?t.rows.length:f.rowSpan;for(let k=0;k<f.colSpan;k+=1)s[y+k]=S;y+=f.colSpan;const E=t.ownerDocument.createElement("div");for(E.className="forum-table-cell-content";f.firstChild;)E.append(f.firstChild);f.append(E)}),s=s.map(f=>Math.max(0,f-1))})}const n=o;let u=n.parentElement;u?.classList.contains("forum-table-viewport")||(u=t.ownerDocument.createElement("div"),u.className="forum-table-viewport",n.before(u),u.append(n));const i=u,c=()=>{n.classList.toggle("forum-table-scrolled",n.scrollLeft>0),i.classList.toggle("forum-table-more-right",n.scrollWidth-n.clientWidth-n.scrollLeft>1)};c(),n.addEventListener("scroll",c,{passive:!0});const d=t.ownerDocument.defaultView,b=d?.ResizeObserver?new d.ResizeObserver(c):null;b?.observe(n),b?.observe(t),d?.addEventListener("resize",c),r.push(()=>{n.removeEventListener("scroll",c),b?.disconnect(),d?.removeEventListener("resize",c)})}),()=>r.forEach(t=>t())}function Ge(e){const r=e.ownerDocument.defaultView;if(!r)return()=>{};const t=[];return e.querySelectorAll(".forum-punishment-table").forEach(o=>{const n=o.parentElement;if(!n?.classList.contains("forum-punishment-scroll"))return;let u=!1;function i(){if(u||!n)return;const d=n.clientWidth,b=Math.max(o.offsetWidth,o.scrollWidth);if(d<=0||b<=0)return;const s=Math.min(1,d/b),p=`scale(${s})`,g=`${Math.ceil(o.offsetHeight*s)}px`;o.style.transform!==p&&(o.style.transform=p),n.style.height!==g&&(n.style.height=g)}const c=r.ResizeObserver?new r.ResizeObserver(i):null;c?.observe(n),c?.observe(o),r.addEventListener("resize",i),e.ownerDocument.fonts?.ready.then(i),i(),t.push(()=>{u=!0,c?.disconnect(),r.removeEventListener("resize",i)})}),()=>t.forEach(o=>o())}function Ue({className:e="",html:r,onImageOpen:t,variant:o}){const n=l.useRef(null),{theme:u}=st(),i=l.useMemo(()=>({__html:r}),[r]);if(l.useLayoutEffect(()=>{const s=n.current;if(s&&o!=="signature")return Qt(s)},[r,o]),l.useLayoutEffect(()=>{const s=n.current;if(s&&o!=="signature")return Ge(s)},[r,o]),l.useLayoutEffect(()=>{const s=n.current;s&&(Lt(s),Yt(s,u))},[r,u]),l.useLayoutEffect(()=>{const s=n.current;if(s)return it(s)},[r]),l.useEffect(()=>{const s=n.current;if(!s)return;const p=Array.from(s.querySelectorAll("img")),g=y=>{y.dataset.capubbsImageLoaded="true"},I=p.map(y=>{if(y.complete)return g(y),null;const f=()=>g(y);return y.addEventListener("load",f,{once:!0}),y.addEventListener("error",f,{once:!0}),{handleLoad:f,image:y}});return()=>{I.forEach(y=>{y&&(y.image.removeEventListener("load",y.handleLoad),y.image.removeEventListener("error",y.handleLoad))})}},[r]),!r)return null;function c(s,p){if(!t||!(s instanceof Element))return;const g=s.closest("img");if(!(g instanceof HTMLImageElement))return;const I=g.closest(".capubbs-gallery"),y=I?Array.from(I.querySelectorAll('[data-capubbs-gallery-slide="true"] img')):Array.from(p.querySelectorAll("img")).filter(R=>!R.closest(".capubbs-gallery")),f=y.indexOf(g);if(f<0)return;const S=y.map(R=>Zt(R,p)),E=y.map((R,N)=>{const q=S[N];return{alt:R.alt.trim(),element:R,src:R.currentSrc||R.src,...q?{galleryId:q.galleryId,galleryIndex:q.galleryIndex}:{}}});t(E,f,g,R=>{const N=S[R];N&&Tt(N.gallery,N.galleryIndex)})}function d(s){const p=Le(s.target);if(p&&s.target instanceof Element){s.preventDefault(),s.stopPropagation(),fe(s.target,p);return}!t||!(s.target instanceof HTMLImageElement)||(s.preventDefault(),c(s.target,s.currentTarget))}function b(s){const p=Le(s.target);if(p&&["Enter"," "].includes(s.key)&&s.target instanceof Element){s.preventDefault(),fe(s.target,p);return}if(["ArrowLeft","ArrowRight"].includes(s.key)&&s.target instanceof Element&&s.target.closest(".capubbs-gallery")){s.preventDefault(),fe(s.target,s.key==="ArrowLeft"?"prev":"next");return}!t||!(s.target instanceof HTMLImageElement)||!["Enter"," "].includes(s.key)||(s.preventDefault(),c(s.target,s.currentTarget))}return a.jsx("div",{ref:n,className:`forum-markup forum-markup-${o} ${e}`.trim(),"data-forum-markup":o,dangerouslySetInnerHTML:i,onClick:d,onKeyDown:b})}function Zt(e,r){const t=e.closest(".capubbs-gallery");if(!t||!r.contains(t))return null;const n=Array.from(r.querySelectorAll(".capubbs-gallery")).indexOf(t),i=Array.from(t.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(e);return n>=0&&i>=0?{gallery:t,galleryId:n,galleryIndex:i}:null}const U=1,_e=4,ce=.25;function er(e){return Math.min(_e,Math.max(U,e))}function ye(e){const[r,t]=[...e.values()];return!r||!t?null:Math.hypot(t.x-r.x,t.y-r.y)}function tr({images:e,initialImageIndex:r,onImageChange:t,onClose:o}){const n=Math.min(Math.max(0,r),Math.max(0,e.length-1)),[u,i]=l.useState(n),[c,d]=l.useState(U),[b,s]=l.useState({x:0,y:0}),[p,g]=l.useState(!1),I=l.useRef(null),y=l.useRef(null),f=l.useRef(null),S=l.useRef(null),E=l.useRef(n),k=l.useRef(U),R=l.useRef({x:0,y:0}),N=l.useRef(null),q=l.useRef(!1),T=l.useRef(new Map),H=l.useRef(null),D=l.useRef(U),X=l.useRef(t),J=l.useRef(o);X.current=t,J.current=o;function Q(m,x=k.current){const w=I.current,P=f.current;if(!w||!P||x<=U)return{x:0,y:0};const W=Math.max(0,(P.clientWidth*x-w.clientWidth)/2),M=Math.max(0,(P.clientHeight*x-w.clientHeight)/2);return{x:Math.min(W,Math.max(-W,m.x)),y:Math.min(M,Math.max(-M,m.y))}}function _(m,x=k.current){const w=Q(m,x);R.current=w,s(w)}function B(m){const x=Math.round(er(m)*100)/100;k.current=x,d(x),_(R.current,x)}function Z(){k.current=U,R.current={x:0,y:0},d(U),s({x:0,y:0})}function C(m){const x=Math.min(Math.max(0,m),e.length-1);x!==E.current&&(E.current=x,i(x),Z(),X.current?.(x))}function F(){J.current(E.current)}l.useEffect(()=>{const m=document.body.style.overflow,x=document.activeElement,w=I.current;document.body.style.overflow="hidden",S.current?.focus();function P(v){if(v.key==="Escape"){v.preventDefault(),F();return}if(v.key==="ArrowLeft"){v.preventDefault(),v.stopPropagation(),C(E.current-1);return}if(v.key==="ArrowRight"){v.preventDefault(),v.stopPropagation(),C(E.current+1);return}if(v.key==="+"||v.key==="="){v.preventDefault(),v.stopPropagation(),B(k.current+ce);return}if(v.key==="-"){v.preventDefault(),v.stopPropagation(),B(k.current-ce);return}if(v.key==="0"){v.preventDefault(),v.stopPropagation(),Z();return}if(v.key==="Tab"){const V=y.current?.querySelectorAll("button:not(:disabled)");if(!V?.length)return;const ae=V[0],se=V[V.length-1],ne=document.activeElement;if(v.shiftKey&&ne===ae){v.preventDefault(),se.focus();return}if(!v.shiftKey&&ne===se){v.preventDefault(),ae.focus();return}y.current?.contains(ne)||(v.preventDefault(),ae.focus())}}function W(v){if(v.preventDefault(),v.stopPropagation(),v.deltaY===0)return;const V=v.ctrlKey?.01:.002;B(k.current*Math.exp(-v.deltaY*V))}function M(v){v.preventDefault(),v.stopPropagation(),D.current=k.current}function G(v){if(v.preventDefault(),v.stopPropagation(),T.current.size>=2)return;const V=v.scale;typeof V=="number"&&B(D.current*V)}function re(){_(R.current,k.current)}return document.addEventListener("keydown",P,{capture:!0}),window.addEventListener("resize",re),w?.addEventListener("wheel",W,{passive:!1}),w?.addEventListener("gesturestart",M,{passive:!1}),w?.addEventListener("gesturechange",G,{passive:!1}),w?.addEventListener("gestureend",G,{passive:!1}),()=>{document.removeEventListener("keydown",P,{capture:!0}),window.removeEventListener("resize",re),w?.removeEventListener("wheel",W),w?.removeEventListener("gesturestart",M),w?.removeEventListener("gesturechange",G),w?.removeEventListener("gestureend",G),document.body.style.overflow=m,x instanceof HTMLElement&&x.focus()}},[]);function ee(m,x,w){N.current={pointerId:m,startX:x,startY:w,originX:R.current.x,originY:R.current.y},g(!0)}function A(m){if(m.target instanceof Element&&m.target.closest("button, .thread-image-lightbox-controls"))return;const x=m.pointerType==="touch",w=m.pointerType==="mouse"&&m.button===0;if(!(!x&&!w)&&(q.current=!1,!(!x&&k.current<=U))){if(m.preventDefault(),m.currentTarget.setPointerCapture(m.pointerId),x&&(T.current.set(m.pointerId,{x:m.clientX,y:m.clientY}),T.current.size===2)){H.current=ye(T.current),N.current=null,g(!1);return}k.current>U&&ee(m.pointerId,m.clientX,m.clientY)}}function Y(m){const x=T.current.has(m.pointerId),w=N.current;if(!x&&w?.pointerId!==m.pointerId)return;if(m.preventDefault(),m.stopPropagation(),x&&T.current.set(m.pointerId,{x:m.clientX,y:m.clientY}),T.current.size===2){const M=ye(T.current),G=H.current;if(!M||!G){H.current=M;return}Math.abs(M-G)>1&&(q.current=!0),B(k.current*(M/G)),H.current=M;return}if(!w||k.current<=U)return;const P=m.clientX-w.startX,W=m.clientY-w.startY;Math.hypot(P,W)>3&&(q.current=!0),_({x:w.originX+P,y:w.originY+W})}function L(m){const x=T.current.delete(m.pointerId),w=N.current?.pointerId===m.pointerId;if(!(!x&&!w)){if(H.current=T.current.size===2?ye(T.current):null,T.current.size===1&&k.current>U){const[P]=T.current.entries();if(P){const[W,M]=P;ee(W,M.x,M.y)}}else N.current=null,g(!1);m.currentTarget.hasPointerCapture(m.pointerId)&&m.currentTarget.releasePointerCapture(m.pointerId)}}const O=Math.round(c*100),j=e[u]??e[0];return j?lt.createPortal(a.jsx("div",{className:"thread-image-lightbox-backdrop","data-can-pan":c>U,"data-dragging":p,onClick:m=>{if(q.current)return;const x=m.target;x instanceof Element&&x.closest("img, button, .thread-image-lightbox-controls")||F()},onPointerCancel:L,onPointerDown:A,onPointerMove:Y,onPointerUp:L,ref:I,role:"presentation",children:a.jsxs("figure",{"aria-label":j.alt?`图片预览：${j.alt}（${u+1}/${e.length}）`:`图片预览（${u+1}/${e.length}）`,"aria-modal":"true",className:"thread-image-lightbox",ref:y,role:"dialog",children:[a.jsx("button",{"aria-label":"关闭图片预览",className:"thread-image-lightbox-close",onClick:F,ref:S,type:"button",children:a.jsx(Ae,{size:20})}),e.length>1&&a.jsxs(a.Fragment,{children:[a.jsx("button",{"aria-label":"上一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-prev",disabled:u===0,onClick:()=>C(u-1),title:"上一张（←）",type:"button",children:a.jsx(ct,{size:28})}),a.jsx("button",{"aria-label":"下一张图片",className:"thread-image-lightbox-nav thread-image-lightbox-next",disabled:u===e.length-1,onClick:()=>C(u+1),title:"下一张（→）",type:"button",children:a.jsx(ut,{size:28})})]}),a.jsx(rr,{image:j,imageRef:f,onReady:()=>_(R.current,k.current),transform:`translate3d(${b.x}px, ${b.y}px, 0) scale(${c})`}),j.alt&&a.jsx("figcaption",{children:j.alt}),a.jsxs("div",{"aria-label":"图片缩放",className:"thread-image-lightbox-controls",role:"toolbar",children:[a.jsx("button",{"aria-label":"缩小图片",disabled:c<=U,onClick:()=>B(c-ce),title:"缩小（-）",type:"button",children:a.jsx(Nt,{size:18})}),a.jsxs("output",{"aria-label":"当前缩放比例","aria-live":"polite",children:[O,"%"]}),a.jsx("button",{"aria-label":"放大图片",disabled:c>=_e,onClick:()=>B(c+ce),title:"放大（+）",type:"button",children:a.jsx(Mt,{size:18})}),a.jsx("button",{"aria-label":"恢复原始大小",disabled:c===U,onClick:Z,title:"恢复原始大小（0）",type:"button",children:a.jsx($t,{size:17})})]})]})}),document.body):null}function rr({image:e,imageRef:r,onReady:t,transform:o}){const n=l.useRef(null),u=l.useRef(t);return u.current=t,l.useLayoutEffect(()=>{const i=e.element,c=n.current,d=i?.parentNode;if(!i||!c?.parentNode||!d)return;const b=i.ownerDocument.createComment("capubbs-lightbox-image"),s=i.getAttribute("style"),p=i.getAttribute("draggable");d.insertBefore(b,i),c.parentNode.insertBefore(i,c),i.draggable=!1,r.current=i;const g=()=>u.current();return i.addEventListener("load",g),i.complete&&g(),()=>{i.removeEventListener("load",g),s===null?i.removeAttribute("style"):i.setAttribute("style",s),p===null?i.removeAttribute("draggable"):i.setAttribute("draggable",p),b.parentNode?.insertBefore(i,b),b.remove(),r.current===i&&(r.current=null)}},[e,r]),l.useLayoutEffect(()=>{e.element&&(e.element.style.transform=o)},[e,o]),e.element?a.jsx("span",{hidden:!0,ref:n}):a.jsx("img",{alt:e.alt,draggable:"false",onLoad:t,ref:r,src:e.src,style:{transform:o}})}function ar(e){if(!/<punishment_record\b/i.test(e))return null;const r=document.createElement("template");r.innerHTML=e;const t=Array.from(r.content.querySelectorAll("punishment_record")).filter(n=>!n.closest("pre, code, textarea"));if(t.length===0)return null;const o=t.map(n=>{const u=n.getAttribute("year")?.trim()??"",i=/^\d{4}$/.test(u)&&Number(u)>1?Number(u):null,c=document.createElement("div");return n.replaceWith(c,...Array.from(n.childNodes)),{placeholder:c,year:i}});return{needsRecords:o.some(({year:n})=>n!==null),render(n,u){return o.forEach(({placeholder:i,year:c})=>{if(c===null||u){i.textContent=c===null?"罚跑记录学年无效":u;return}const d=document.createElement("table"),b=`${c-1}-${c} 学年罚跑记录`;d.className="forum-punishment-table",d.setAttribute("aria-label",b);const s=document.createElement("div");s.className="forum-punishment-title",s.setAttribute("role","heading"),s.setAttribute("aria-level","2"),s.textContent=b;const p=d.createTHead().insertRow();["姓名","ID","原因","长度","职务加罚","开始时间","结束时间","完成情况"].forEach(f=>{const S=document.createElement("th");S.scope="col",S.textContent=f,p.append(S)});const g=d.createTBody(),I=n.filter(f=>{const S=f.startDate.match(/^(\d{4})-(\d{1,2})-/);if(!S)return!1;const E=Number(S[2]);return E>=1&&E<=12&&Number(S[1])+(E>=9?1:0)===c});if(I.forEach(f=>{const S=g.insertRow(),E=f.distance?/公里|km/i.test(f.distance)?f.distance:`${f.distance} km`:"—";[f.name||"—",f.username||"—",f.reason||"—",E,f.addition?"是":"否",Ne(f.startDate),Ne(f.endDate),f.isComplete?"已完成":"进行中"].forEach(k=>{S.insertCell().textContent=k})}),I.length===0){const f=g.insertRow().insertCell();f.colSpan=8,f.className="forum-punishment-empty",f.textContent="暂无罚跑记录"}const y=document.createElement("div");y.className="forum-punishment-scroll",y.append(d),i.className="forum-punishment-record",i.replaceChildren(s,y)}),r.innerHTML}}}function Ne(e){return!e||e==="0000-00-00"?"—":e.replaceAll("-",".")}function nr(e,r){const t=l.useMemo(()=>r?ar(e):null,[r,e]),[o,n]=l.useState(null);return l.useEffect(()=>{if(!t||!t.needsRecords)return;const u=new AbortController;return zt("punishments",u.signal).then(({punishmentRecords:i})=>{u.signal.aborted||n({prepared:t,html:t.render(i)})}).catch(i=>{u.signal.aborted||n({prepared:t,html:t.render([],i instanceof Error?i.message:"罚跑记录加载失败")})}),()=>u.abort()},[t]),t?t.needsRecords?o?.prepared===t?o.html:"":t.render([]):e}const or='.forum-markup .forum-punishment-table{display:table;width:-moz-max-content;width:max-content;min-width:100%;max-width:none;border-collapse:separate;border-spacing:0;transform-origin:top left}.forum-markup .forum-punishment-table :is(th,td){border:0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:9px;background:var(--surface);color:var(--text-muted);font:inherit;text-align:center;white-space:nowrap}.forum-markup .forum-punishment-table tbody tr:hover>td{background:var(--brand-faint, color-mix(in srgb, var(--brand) 8%, var(--surface)))}.forum-markup .forum-punishment-table tr>:last-child{border-right:0}.forum-markup .forum-punishment-table tbody tr:last-child>td{border-bottom:0}.forum-markup .forum-punishment-table th{background:var(--surface-soft);color:var(--text-faint);font-weight:780}.forum-markup .forum-punishment-record{box-sizing:border-box;min-width:0;max-width:100%;border:1px solid var(--line)}.forum-markup .forum-punishment-scroll{max-width:100%;overflow:hidden}.forum-markup .forum-punishment-title{padding:12px 14px;border-bottom:1px solid var(--line);background:var(--surface-soft);color:var(--text-strong);font-family:inherit;font-size:var(--ui-font-size-lg, 14px);font-weight:760;line-height:1.5;text-align:center}.forum-markup .forum-punishment-table .forum-punishment-empty{text-align:center}.forum-markup .forum-punishment-empty>.forum-table-cell-content{width:auto;max-width:none}:root{--surface: #fffefa;--surface-raised: #ffffff;--surface-soft: #f6f8f4;--text: #20231f;--text-strong: #111411;--text-muted: #687068;--text-faint: #919991;--line: #e1e6df;--line-strong: #cdd5cc;--brand: #236b4c;--brand-strong: #174f38;--danger: #b8473f}:root.dark{--surface: #171d19;--surface-raised: #1c241f;--surface-soft: #1f2822;--text: #dde5de;--text-strong: #f6faf6;--text-muted: #a0aca2;--text-faint: #748078;--line: #2c362f;--line-strong: #3c493f;--brand: #69b98d;--brand-strong: #8bcca6;--danger: #ef8178}::-moz-selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}::selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentcolor}blockquote,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}a{color:inherit;text-decoration:inherit}button{margin:0;padding:0;background-color:transparent;color:inherit;font:inherit;letter-spacing:inherit;text-transform:none}button:where(:not([style]):not([class])){min-height:32px;border:1px solid var(--line);border-radius:.5px;padding:4px 12px;background-color:var(--surface);color:var(--text-muted);font-size:14px;font-weight:680;line-height:1.5;vertical-align:middle;cursor:pointer;transition:background-color .14s ease,border-color .14s ease,color .14s ease}button:where(:not([style]):not([class]):hover:not(:disabled)){border-color:var(--line-strong);background-color:var(--surface-soft);color:var(--brand-strong)}button:where(:not([style]):not([class]):focus-visible){outline:2px solid var(--brand);outline-offset:2px}button:where(:not([style]):not([class]):disabled){cursor:not-allowed;opacity:.5}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}.capubbs-html-frame-root iframe{background-color:transparent!important}img,video{max-width:100%;height:auto}table{border-color:inherit;border-collapse:collapse;text-indent:0}.capubbs-activity-signup-canceled,.capubbs-activity-signup-canceled *{color:var(--danger)!important;text-decoration-color:var(--danger)!important;text-decoration-line:line-through!important;text-decoration-thickness:2px!important}.forum-markup>:first-child{margin-top:0}.forum-markup>:last-child{margin-bottom:0}.forum-markup p,.forum-markup div{margin:0}.forum-markup-floor p{margin:0 0 .75em}.forum-markup-floor>div+div{margin-top:.55em}.forum-markup a{color:var(--brand-strong);font-weight:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.16em}.forum-markup .forum-mention{text-decoration:none}.forum-markup blockquote{margin:0 0 0 2em;border:0;padding:0;background:transparent;color:inherit}.forum-markup blockquote.forum-quote,.forum-markup .forum-legacy-quote,.forum-markup blockquote.capubbs-floor-quote{margin:.8em 0;border-left:3px solid color-mix(in srgb,var(--brand) 38%,var(--line));padding:.55em .75em;background:var(--surface-soft);color:var(--text-muted)}.forum-markup .capubbs-floor-quote-jump{margin-left:.75em}.forum-markup .forum-legacy-quote-content{margin:0}.forum-markup h1,.forum-markup h2,.forum-markup h3,.forum-markup h4,.forum-markup h5,.forum-markup h6{margin:.9rem 0 .45rem;color:var(--brand-strong);font-weight:800;line-height:1.35}.forum-markup h1{font-size:1.45rem}.forum-markup h2{font-size:1.25rem}.forum-markup h3{font-size:1.1rem}.forum-markup h4,.forum-markup h5,.forum-markup h6{font-size:1em}.forum-markup ul,.forum-markup ol{margin:.65em 0;padding-left:1.45em}.forum-markup ul{list-style:disc}.forum-markup ol{list-style:decimal}.forum-markup ol.capubbs-ordered-list-alpha{list-style-type:lower-alpha}.forum-markup ol.capubbs-ordered-list-roman{list-style-type:lower-roman}.forum-markup pre{max-width:100%;overflow-x:auto;margin:.75em 0;border-radius:2px;padding:.75em;background:#182531;color:#f8fafc;white-space:pre-wrap}.forum-markup code,.forum-markup kbd{border-radius:2px;padding:.08em .25em;background:color-mix(in srgb,var(--surface-soft) 75%,var(--line));font-family:SFMono-Regular,Cascadia Code,Consolas,monospace;font-size:.9em}.forum-markup pre code{padding:0;background:transparent;color:inherit}.forum-markup font[size="1"]{font-size:11px}.forum-markup font[size="2"]{font-size:13px}.forum-markup font[size="3"]{font-size:15px}.forum-markup font[size="4"]{font-size:17px}.forum-markup font[size="5"]{font-size:19px}.forum-markup font[size="6"]{font-size:21px}.forum-markup font[size="7"]{font-size:23px}.forum-markup hr{margin:.9em 0;border:0;border-top:1px solid var(--line-strong)}.forum-markup img{display:inline-block;height:auto;max-width:100%;vertical-align:middle}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){color:transparent;font-size:0;background-color:color-mix(in srgb,var(--surface-soft) 82%,var(--line));background-image:linear-gradient(105deg,transparent 20%,color-mix(in srgb,var(--surface-raised) 70%,transparent) 45%,transparent 70%);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}.forum-markup img[role=button]{cursor:zoom-in}.forum-markup img[role=button]:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse}.forum-markup td,.forum-markup th{border:1px solid var(--line);padding:.35em .5em}.forum-markup-signature{color:#999;font-family:monospace;font-size:14px;line-height:1.6;overflow-wrap:anywhere}:root.dark .forum-markup-signature{color:#666}.forum-markup .capubbs-gallery{position:relative;display:block;width:100%;margin:.9rem 0;overflow:hidden;border:1px solid var(--line);border-radius:2px;background:transparent;color:var(--text)}.forum-markup .capubbs-gallery:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup .capubbs-gallery-header{position:relative;display:flex;min-height:44px;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:9px 12px;border-bottom:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-title{width:100%;min-width:0;margin:0;color:var(--text-strong);font-size:.82rem;font-weight:760;line-height:1.4;text-align:center}.forum-markup .capubbs-gallery-stage{position:relative;display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide{display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-slide>img{display:block;width:100%;height:var(--capubbs-gallery-image-height, clamp(280px, 52vw, 560px));max-width:none;margin:0 auto;border-radius:0;-o-object-fit:contain;object-fit:contain}.forum-markup .capubbs-gallery-caption{display:block;margin:0;color:var(--text-muted);font-size:.78rem;line-height:1.55;text-align:center}.forum-markup .capubbs-gallery-caption[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-footer{position:relative;display:flex;min-height:44px;align-items:center;justify-content:center;margin:0;padding:9px 12px;border-top:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-captions{width:100%;min-width:0;margin:0;padding-inline:48px;text-align:center}.forum-markup .capubbs-gallery-count{position:absolute;top:50%;right:12px;color:var(--text-faint);font-size:.72rem;font-variant-numeric:tabular-nums;font-weight:760;line-height:1.25;transform:translateY(-50%)}.forum-markup .capubbs-gallery-count[data-capubbs-gallery-current]:before{content:attr(data-capubbs-gallery-current) "/" attr(data-capubbs-gallery-total)}.forum-markup .capubbs-gallery-nav{position:absolute;z-index:4;top:50%;display:grid;width:36px;height:48px;place-items:center;padding:0;transform:translateY(-50%);border:1px solid rgb(255 255 255 / .25);border-radius:2px;background:#00000080;color:#fff;cursor:pointer;transition:.15s ease}.forum-markup .capubbs-gallery-nav:hover{background:#000000b8}.forum-markup .capubbs-gallery-nav:focus-visible{outline:2px solid #fff;outline-offset:2px}.forum-markup .capubbs-gallery-nav:before{font-family:Arial,sans-serif;font-size:2rem;font-weight:300;line-height:1}.forum-markup .capubbs-gallery-nav-prev:before{content:"‹"}.forum-markup .capubbs-gallery-nav-next:before{content:"›"}.forum-markup .capubbs-gallery-nav-prev{left:10px}.forum-markup .capubbs-gallery-nav-next{right:10px}@keyframes capubbs-image-loading{0%{background-position:120% 0}to{background-position:-80% 0}}@media(max-width:640px){.forum-markup .capubbs-gallery-slide>img{height:var(--capubbs-gallery-image-height, min(72vw, 420px))}.forum-markup .capubbs-gallery-nav{width:32px;height:42px}.forum-markup .capubbs-gallery-nav-prev{left:7px}.forum-markup .capubbs-gallery-nav-next{right:7px}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){animation:none}}',sr="/bbs/new-assets/threadHtmlBootstrap-x4mBAuLM.html";function ir(e,r){const t=new URL(e);return t.pathname=/Android|iPhone|iPad|iPod|Mobile/i.test(r)?"/m/outchain/player":"/outchain/player",t.href}function Se(e,r){try{const t=new URL(e,r);return!(t.hostname==="player.bilibili.com"&&t.pathname==="/player.html"||t.hostname==="music.163.com"&&["/outchain/player","/m/outchain/player"].includes(t.pathname))||!["http:","https:"].includes(t.protocol)||t.username||t.password||t.port?null:(t.protocol="https:",t.href)}catch{return null}}function lr(e,r){const t=new URL(e);return t.hostname==="music.163.com"?(t.searchParams.set("auto","0"),ir(t.href,r)):(t.searchParams.set("autoplay","0"),t.href)}function cr(e){if(!e)return{left:0,top:0};const r=window.getComputedStyle(e);return{left:e.offsetLeft+e.clientLeft+(Number.parseFloat(r.paddingLeft)||0),top:e.offsetTop+e.clientTop+(Number.parseFloat(r.paddingTop)||0)}}function ur(e){if(!e||typeof e!="object")return!1;const r=e;return typeof r.id=="string"&&typeof r.src=="string"&&Se(r.src,"https://music.163.com")===r.src&&["left","top","width","height"].every(t=>{const o=r[t];return typeof o=="number"&&Number.isFinite(o)&&Math.abs(o)<=1e5})&&r.width>0&&r.height>0}const qe=64*1024*1024,le=new Map,de=new Map,oe=new Map;let ve=0,we=0,xe=!1;function te(){xe||!oe.size||(xe=!0,setTimeout(()=>{xe=!1;const e=[];oe.forEach((r,t)=>{const o=r.priorities.map(n=>n());if(o.every(n=>n===null)){oe.delete(t),le.delete(t),r.reject(new DOMException("图片所在内容已卸载","AbortError"));return}e.push({source:t,request:r,priority:o.includes("high")?"high":"low"})}),e.sort((r,t)=>+(t.priority==="high")-+(r.priority==="high"));for(const{source:r,request:t,priority:o}of e){if(ve>=6)break;o==="low"&&we>=2||(oe.delete(r),ve+=1,o==="low"&&(we+=1),t.start(o))}},0))}function Be(e){return new URL(e,new URL("/bbs/content/",window.location.origin)).href}function dr(e,r=()=>"high"){const t=Be(e),o=new URL(t);if(o.origin!==window.location.origin||!o.pathname.startsWith("/bbs/images/")&&!o.pathname.startsWith("/bbsimg/"))return Promise.reject(new Error("仅代理论坛图片目录"));const n=le.get(t);if(n)return oe.get(t)?.priorities.push(r),te(),n;const u=new Promise((i,c)=>{oe.set(t,{priorities:[r],reject:c,start:d=>{mr(t,d).then(i,c).finally(()=>{ve-=1,d==="low"&&(we-=1),te()})}})});return le.set(t,u),te(),u}function mr(e,r){return fetch(e,{credentials:"same-origin",referrerPolicy:"no-referrer",priority:r}).then(async t=>{if(!t.ok)throw new Error(`图片加载失败：${t.status}`);if(!(t.headers.get("content-type")?.toLowerCase()??"").startsWith("image/"))throw new Error("图片响应类型无效");const n=Number.parseInt(t.headers.get("content-length")??"",10);if(Number.isFinite(n)&&n>qe)throw new Error("图片大小超出限制");const u=await t.blob();if(u.size>qe)throw new Error("图片大小超出限制");const i={blob:u,objectUrl:URL.createObjectURL(u),sourceUrl:e};return de.set(e,i),i}).catch(t=>{throw le.delete(e),t})}function fr(e){try{return de.get(Be(e))?.objectUrl}catch{return}}typeof window<"u"&&(window.addEventListener("scroll",te,{passive:!0}),window.addEventListener("resize",te),window.addEventListener("pagehide",e=>{e.persisted||(de.forEach(r=>URL.revokeObjectURL(r.objectUrl)),de.clear(),le.clear())}));function pr(e,r,t){return r.some(o=>o.right>o.left&&o.bottom>o.top&&e.top+o.bottom>Math.max(0,e.top)&&e.top+o.top<Math.min(t.height,e.bottom)&&e.left+o.right>Math.max(0,e.left)&&e.left+o.left<Math.min(t.width,e.right))?"high":"low"}const gr=28,hr=64,br=5e4,yr=30,We=30,z="capubbs-thread-html-frame",Ye=new URL("/bbs/lib/jquery.min.js",window.location.origin).href,xr=jr(or),vr=/\son[a-z][\w:-]*\s*=/i;let ue=null;function Pe({className:e="",floor:r,html:t,isActivitySignupCanceled:o=!1,onImageOpen:n,onIsolatedTextSelection:u,variant:i}){const c=l.useMemo(()=>i==="signature"?qt(t):t,[t,i]),d=Ir(c,i==="signature"),b=nr(d,i==="floor"),s=dt(b),p=l.useMemo(()=>s?null:mt(b,{normalizeLegacyLineBreaks:i==="signature"}),[b,s,i]),g=l.useMemo(()=>ft(b),[b]);return!s&&p!==null?a.jsx(Ue,{className:e,html:p,onImageOpen:n,variant:i}):a.jsx(wr,{className:e,floor:r,html:g,isActivitySignupCanceled:o,onImageOpen:n,onTextSelection:u,variant:i})}function wr({className:e,floor:r,html:t,isActivitySignupCanceled:o,onImageOpen:n,onTextSelection:u,variant:i}){const c=l.useRef(null),d=l.useRef(`${i}-${r}-${Math.random().toString(36).slice(2)}`),b=l.useRef(n);b.current=n;const s=l.useRef(u);s.current=u;const p=i==="signature"?gr:hr,g=!!n,[I,y]=l.useState(null),[f,S]=l.useState(null),E=Tr(),k=l.useRef(E),R=gt(),N=i==="signature"?14:R,q=l.useMemo(()=>Rr(Sr(t)),[t]),T=q.includes('type="text/capubbs-user-script"')||vr.test(q),H=l.useMemo(()=>Ar({canOpenImages:g,frameId:d.current,needsJquery:T,html:q,isActivitySignupCanceled:o,isDarkTheme:k.current,fontSize:N,variant:i}),[g,q,N,o,T,i]),D=l.useMemo(()=>Math.random().toString(36).slice(2),[H]),X=l.useMemo(()=>`${sr}#${new URLSearchParams({frameId:d.current,token:D})}`,[D]),J=l.useCallback(()=>{c.current?.contentWindow?.postMessage({source:z,type:"document-response",frameId:d.current,token:D,html:H},"*")},[D,H]),Q=l.useCallback(()=>{c.current?.contentWindow?.postMessage({frameId:d.current,source:z,theme:E?"dark":"light",type:"theme"},"*")},[E]),_=l.useCallback((C=c.current?.contentWindow)=>{!T||!C||Me().then(F=>{c.current?.contentWindow===C&&C.postMessage({frameId:d.current,jquerySource:F,source:z,type:"jquery-response"},"*")})},[T]),B=l.useCallback(()=>{J(),Q(),_()},[J,_,Q]);l.useEffect(()=>{y(null)},[X]),l.useEffect(()=>{Q()},[Q]),l.useEffect(()=>{T&&Me()},[T]),l.useLayoutEffect(()=>{te()},[I]),l.useLayoutEffect(()=>{let C=!0;const F=new Map;function ee(A){const Y=c.current?.contentWindow;if(!(!Y||A.source!==Y||!Lr(A.data))&&A.data.frameId===d.current){if(A.data.type==="embedded-player-layout"){S({token:D,players:A.data.players});return}if(A.data.type==="document-request"){A.data.token===D&&J();return}if(A.data.type==="jquery-request"){_(Y);return}if(A.data.type==="image-resource-layout"){F.has(A.data.requestId)&&(F.set(A.data.requestId,A.data.bounds),te());return}if(A.data.type==="image-resource-request"){const L=Y,O=A.data.requestId;F.set(O,A.data.bounds);const j=()=>{const m=c.current;return!C||!m||m.contentWindow!==L?null:pr(m.getBoundingClientRect(),F.get(O)??[],{width:window.innerWidth,height:window.innerHeight})};dr(A.data.url,j).then(m=>{!C||c.current?.contentWindow!==L||L.postMessage({blob:m.blob,priority:j(),frameId:d.current,requestId:A.data.requestId,source:z,type:"image-resource-response"},"*")}).catch(()=>{!C||c.current?.contentWindow!==L||L.postMessage({priority:j(),frameId:d.current,requestId:A.data.requestId,source:z,type:"image-resource-error"},"*")}).finally(()=>F.delete(O));return}if(A.data.type==="anchor"){const L=c.current;if(!L)return;const O=window.getComputedStyle(document.documentElement),j=Number.parseFloat(O.getPropertyValue("--topbar-height"))||0,m=window.scrollY+L.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,m+A.data.offsetTop-j-16)});return}if(A.data.type==="navigate"){const L=ht(A.data.url,Re());if(!L)return;window.history.pushState(null,"",L),window.dispatchEvent(new Event(bt));const O=new URL(L,window.location.origin);O.hash?window.requestAnimationFrame(()=>{const j=decodeURIComponent(O.hash.slice(1)),m=yt(`#${j}`);(m?xt(m):document.getElementById(j))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(A.data.type==="image-open"){const L=c.current;if(!L)return;const O=Array.from(L.contentDocument?.querySelectorAll("img")??[]),j=A.data.images.map(x=>({...x,element:typeof x.elementIndex=="number"?O[x.elementIndex]:void 0,src:fr(x.src)??x.src})),m=x=>{const w=j[x];!w||typeof w.galleryId!="number"||!Number.isSafeInteger(w.galleryIndex)||L.contentWindow?.postMessage({frameId:d.current,galleryId:w.galleryId,galleryIndex:w.galleryIndex,source:z,type:"gallery-select"},"*")};b.current?.(j,A.data.imageIndex,L,m);return}if(A.data.type==="selection"){A.data.text&&window.getSelection()?.removeAllRanges(),s.current?.(A.data.text);return}y(Math.min(br,Math.max(p,Math.ceil(A.data.height))))}}return window.addEventListener("message",ee),()=>{C=!1,F.clear(),window.removeEventListener("message",ee),te()}},[D,X,p,J,_]);const Z=cr(c.current);return a.jsxs("div",{className:"thread-html-frame-container",children:[a.jsx("iframe",{ref:c,className:`thread-html-frame thread-html-frame-${i} ${e}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-downloads",scrolling:"no",src:X,onLoad:B,style:{"--thread-html-frame-width-allowance":`${We}px`,...I===null?{}:{"--thread-html-frame-height":`${I}px`}},title:i==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`},D),f?.token===D?f.players.map(C=>a.jsx("iframe",{className:"thread-embedded-player",src:lr(C.src,navigator.userAgent),title:new URL(C.src).hostname==="player.bilibili.com"?"哔哩哔哩播放器":"网易云音乐播放器",allow:"autoplay; fullscreen; picture-in-picture",allowFullScreen:!0,scrolling:"no",style:{left:C.left+Z.left,top:C.top+Z.top,width:C.width,height:C.height}},`${D}-${C.id}`)):null]})}function Ir(e,r){const[t,o]=l.useState(e);return l.useEffect(()=>{const n=new AbortController,u=r?Pt(e):[];if(o(e),u.length===0)return()=>n.abort();const i=Array.from(new Map(u.map(c=>[`${c.bid}:${c.tid}:${c.pid}`,c])).values());return Promise.all(i.map(async c=>{try{const d=await pt(c,n.signal);return[`${c.bid}:${c.tid}:${c.pid}`,d]}catch(d){if(d instanceof DOMException&&d.name==="AbortError")throw d;return[`${c.bid}:${c.tid}:${c.pid}`,""]}})).then(c=>{if(n.signal.aborted)return;const d=new Map(c);let b=e;u.forEach(s=>{const p=d.get(`${s.bid}:${s.tid}:${s.pid}`);p&&(b=b.replace(s.marker,p))}),o(b)}).catch(()=>{}),()=>n.abort()},[r,e]),t}function Ar({canOpenImages:e,frameId:r,fontSize:t,needsJquery:o,html:n,isActivitySignupCanceled:u,isDarkTheme:i,variant:c}){const d=c==="signature",b=d?"#999999":"rgb(63 63 70)",s=d?"#666666":"rgb(228 228 231)",p=d?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",g=d?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",I=u?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${i?"dark":"light"}" style="background:transparent;color-scheme:${i?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${Cr(Re())}">
  <meta http-equiv="Content-Security-Policy" content="${Er()}">
  <style>${xr}</style>
  <style>
    html{--capubbs-frame-text-color:${b}}html.dark{--capubbs-frame-text-color:${s}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${p};font-size:${t}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${We}px);${g}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${kr(r,e,o)}<\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${c}${I}">${n}</main></body>
</html>`}function kr(e,r,t){return`(function(){
    var frameId=${JSON.stringify(e)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(vt)};
    var canOpenImages=${JSON.stringify(r)};
    var needsJquery=${JSON.stringify(t)};
    var preparePunishmentTableFit=${Ge.toString()};
    var normalizeEmbeddedPlayerUrl=${Se.toString()};
    var playerIds=new WeakMap();
    var nextPlayerId=0;
    var lastPlayerLayout='';
    var jquerySourceUrl=${JSON.stringify(Ye)};
    var forumAppExactPaths=${JSON.stringify(wt)};
    var forumAppPathPrefixes=${JSON.stringify(It)};
    var legacyForumExactPaths=${JSON.stringify(At)};
    var legacyForumPathPatterns=${JSON.stringify(kt)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${yr};
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
      reportEmbeddedPlayers();
    }
    function reportEmbeddedPlayers(){
      var players=[];
      Array.prototype.forEach.call(document.querySelectorAll('.capubbs-html-frame-root iframe'),function(player){
        var raw=player.getAttribute('src')||player.getAttribute('data-capubbs-player-src')||'';
        var src=normalizeEmbeddedPlayerUrl(raw,document.baseURI);
        if(!src)return;
        if(player.getAttribute('data-capubbs-player-src')!==src)player.setAttribute('data-capubbs-player-src',src);
        if(player.hasAttribute('src'))player.removeAttribute('src');
        // Closed details can retain descendant geometry despite not painting it.
        // Only the first direct summary remains visible, including its children.
        for(var child=player,parent=player.parentElement;parent;child=parent,parent=parent.parentElement){
          if(parent.tagName!=='DETAILS'||parent.hasAttribute('open'))continue;
          var summary=Array.prototype.find.call(parent.children,function(element){return element.tagName==='SUMMARY';});
          if(child!==summary)return;
        }
        var rect=player.getBoundingClientRect();
        var style=window.getComputedStyle(player);
        if(rect.width<=0||rect.height<=0||style.display==='none'||style.visibility==='hidden')return;
        if(!playerIds.has(player))playerIds.set(player,String(++nextPlayerId));
        players.push({id:playerIds.get(player),src:src,left:rect.left,top:rect.top,width:rect.width,height:rect.height});
      });
      var serialized=JSON.stringify(players);
      if(serialized===lastPlayerLayout)return;
      lastPlayerLayout=serialized;
      window.parent.postMessage({source:'${z}',type:'embedded-player-layout',frameId:frameId,players:players},'*');
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
      if(contentRoot){
        var disposePunishmentTableFit=preparePunishmentTableFit(contentRoot);
        window.addEventListener('unload',disposePunishmentTableFit,{once:true});
      }
      if(window.ResizeObserver&&contentRoot)new ResizeObserver(queueHeight).observe(contentRoot);
      if(window.MutationObserver&&contentRoot)new MutationObserver(function(){queueHeight();requestImageResources();prepareImages();prepareGalleries();syncGrayscaleTextColors(contentRoot);}).observe(contentRoot,{attributes:true,characterData:true,childList:true,subtree:true});
      window.addEventListener('load',queueHeight);
      window.addEventListener('resize',queueHeight);
      document.addEventListener('scroll',queueHeight,true);
      document.addEventListener('toggle',queueHeight,true);
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
  }());`}function Sr(e){return e.replace(/<script\b([^>]*)>/gi,(r,t)=>`<script${t.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function Rr(e){if(!/<(?:img|iframe)\b/i.test(e))return e;const r=document.createElement("template");return r.innerHTML=e,r.content.querySelectorAll("iframe[src]").forEach(t=>{const o=Se(t.getAttribute("src")??"",Re());o&&(t.dataset.capubbsPlayerSrc=o,t.removeAttribute("src"))}),r.content.querySelectorAll("img[src]").forEach(t=>{const o=t.getAttribute("src")?.trim()??"";!o||/^(?:blob:|data:)/i.test(o)||(t.dataset.capubbsImageResourceSrc=o,t.setAttribute("fetchpriority","low"),t.removeAttribute("src"),t.removeAttribute("srcset"),t.closest("picture")?.querySelectorAll("source[srcset]").forEach(n=>{n.removeAttribute("srcset")}))}),r.innerHTML}function Me(){return ue||(ue=fetch(Ye,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw new Error(`Failed to load jQuery: ${e.status}`);return e.text()}).catch(()=>null),ue)}function Er(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'","upgrade-insecure-requests"].join("; ")}function Re(){return new URL("/bbs/content/",window.location.origin).href}function Cr(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function jr(e){return e.replace(/<\/style/gi,"<\\/style")}function Lr(e){if(!e||typeof e!="object")return!1;const r=e;return r.source!==z||typeof r.frameId!="string"?!1:r.type==="embedded-player-layout"?Array.isArray(r.players)&&r.players.every(ur):r.type==="document-request"?typeof r.token=="string":r.type==="anchor"?typeof r.offsetTop=="number"&&Number.isFinite(r.offsetTop)&&r.offsetTop>=0:r.type==="navigate"?typeof r.url=="string":r.type==="jquery-request"?!0:r.type==="image-resource-request"||r.type==="image-resource-layout"?typeof r.requestId=="string"&&r.requestId.length>0&&Array.isArray(r.bounds)&&r.bounds.every(t=>t&&["top","bottom","left","right"].every(o=>typeof t[o]=="number"&&Number.isFinite(t[o])))&&(r.type==="image-resource-layout"||"url"in r&&typeof r.url=="string"&&r.url.length>0):r.type==="selection"?typeof r.text=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(t=>!!t&&typeof t=="object"&&typeof t.alt=="string"&&typeof t.elementIndex=="number"&&Number.isSafeInteger(t.elementIndex)&&t.elementIndex>=0&&typeof t.src=="string"&&t.src.length>0&&(t.galleryId===void 0&&t.galleryIndex===void 0||typeof t.galleryId=="number"&&Number.isSafeInteger(t.galleryId)&&t.galleryId>=0&&typeof t.galleryIndex=="number"&&Number.isSafeInteger(t.galleryIndex)&&t.galleryIndex>=0)):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function Tr(){const[e,r]=l.useState(()=>document.documentElement.classList.contains("dark"));return l.useEffect(()=>{const t=document.documentElement,o=()=>r(t.classList.contains("dark")),n=new MutationObserver(o);return n.observe(t,{attributeFilter:["class"],attributes:!0}),()=>n.disconnect()},[]),e}function Nr({attachments:e=[],bodyClassName:r="thread-floor-body",bodyFallback:t=null,bodyHtml:o,floor:n,isActivitySignupCanceled:u=!1,onImageOpen:i,onIsolatedTextSelection:c,signatureClassName:d="thread-signature",signatureHtml:b,signatureText:s}){const p=i?(g,I,y,f)=>{const S=g[I];S&&i([S],0,y,f?()=>f(I):void 0)}:void 0;return a.jsxs(a.Fragment,{children:[o?a.jsx(Pe,{className:r,floor:n,html:o,isActivitySignupCanceled:u,onImageOpen:i,onIsolatedTextSelection:c,variant:"floor"}):t,a.jsx(qr,{attachments:e}),b?a.jsx(Pe,{className:d,floor:n,html:b,onImageOpen:p,variant:"signature"}):s?a.jsx("footer",{className:d,children:a.jsx("p",{children:s})}):null]})}function qr({attachments:e}){return e.length===0?null:a.jsxs("section",{"aria-label":"附件",className:"thread-attachments",children:[a.jsxs("header",{className:"thread-attachments-heading",children:[a.jsx(Ht,{"aria-hidden":"true",size:14}),a.jsx("span",{children:"附件"}),a.jsx("small",{children:e.length})]}),a.jsx("ul",{children:e.map(r=>{const t=a.jsxs(a.Fragment,{children:[a.jsx("span",{className:"thread-attachment-name",children:r.name}),a.jsx("small",{children:Pr(r)}),r.exists!==!1&&a.jsx(St,{"aria-hidden":"true",size:15})]});return a.jsx("li",{children:r.exists===!1?a.jsx("div",{"aria-disabled":"true",className:"thread-attachment-link is-unavailable",children:t}):a.jsx("a",{className:"thread-attachment-link",download:r.name,href:r.downloadHref||`/bbs/download/?id=${encodeURIComponent(r.id)}`,children:t})},r.id)})})]})}function Pr(e){if(e.exists===!1)return"文件不可用";const r=[Mr(e.size),(e.price??0)>0?"付费附件":"免费"];return e.downloadCount!==void 0&&r.push(`下载 ${e.downloadCount} 次`),r.join(" · ")}function Mr(e){if(e<=0)return"大小未知";if(e<1024)return`${e} B`;const r=["KB","MB","GB","TB"];let t=e,o=-1;do t/=1024,o+=1;while(t>=1024&&o<r.length-1);return`${t.toFixed(t>=10?1:2)} ${r[o]}`}function $r({author:e,id:r}){const t=e.tags??[],[o,n]=l.useState(!1),u=l.useRef(null),i=l.useRef(null),c=l.useRef(null),d=l.useRef(null),b=t.map(s=>`${s.id}:${s.name}`).join("|");return l.useLayoutEffect(()=>{if(t.length===0){n(!1);return}const s=()=>{const g=u.current,I=i.current,y=c.current,f=d.current;if(!g||!I||!y||!f||g.offsetWidth===0)return;const S=y.getBoundingClientRect().width,E=f.getBoundingClientRect().width,k=Number.parseFloat(getComputedStyle(I).columnGap)||0,R=I.clientWidth-S-k,N=E>R+1;n(q=>q===N?q:N)};s();const p=new ResizeObserver(s);return[u.current,i.current,d.current].forEach(g=>{g&&p.observe(g)}),()=>p.disconnect()},[b,t.length]),a.jsxs("div",{id:r,ref:u,className:"author-hover-card",role:"dialog","aria-label":`${e.name} 的用户摘要`,children:[a.jsxs("div",{className:"author-card-head",children:[a.jsx("img",{src:e.avatar,alt:""}),a.jsxs("div",{className:"author-card-head-copy",children:[a.jsxs("div",{ref:i,className:"author-card-name-line","data-tags-overflow":o?"true":void 0,children:[a.jsx("strong",{ref:c,children:e.name}),a.jsx("div",{className:"author-card-tag-slot",children:a.jsx(pe,{size:"compact",tags:t})})]}),(e.stars>0||e.role)&&a.jsxs("span",{className:"author-card-status",children:["★".repeat(e.stars),e.stars>0&&e.role?" · ":"",e.role]})]})]}),o?a.jsx("div",{className:"author-card-tags-row",children:a.jsx(pe,{size:"compact",tags:t})}):null,e.medals?.length?a.jsx("div",{className:"author-card-medals",children:a.jsx(Fe,{medals:e.medals,profileName:e.name,variant:"compact"})}):null,a.jsx("div",{ref:d,className:"author-card-tag-width-measure","aria-hidden":"true",children:a.jsx(pe,{size:"compact",tags:t})}),a.jsxs("dl",{children:[a.jsxs("div",{children:[a.jsx("dt",{children:"主题"}),a.jsx("dd",{children:e.topics})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"回复"}),a.jsx("dd",{children:e.replies})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"签到"}),a.jsx("dd",{children:e.checkins})]})]}),a.jsxs("p",{children:["最近在线：",e.lastSeen]}),a.jsxs("a",{href:ie(e.name),children:["查看个人主页 ",a.jsx(Dt,{size:13})]})]})}function zr({author:e}){const r=e.tags??[],t=De(r),o=ie(e.name);return a.jsxs("aside",{className:"thread-author-profile","aria-label":`${e.name} 的资料`,children:[a.jsx("a",{"aria-label":`查看${e.name}的个人主页`,className:"thread-author-profile-avatar",href:o,children:a.jsx("img",{src:e.avatar,alt:""})}),a.jsx("div",{className:"thread-author-profile-identity",children:a.jsx("a",{href:o,children:e.name})}),(e.stars>0||e.role)&&a.jsxs("div",{className:"thread-author-profile-status",children:[e.stars>0&&a.jsx("span",{"aria-label":`${e.stars} 星`,children:"★".repeat(e.stars)}),e.role&&a.jsx("strong",{children:e.role})]}),a.jsx(Oe,{tags:t}),a.jsx(Fe,{medals:e.medals??[],profileName:e.name,variant:"compact"}),a.jsxs("dl",{className:"thread-author-profile-stats",children:[a.jsxs("div",{children:[a.jsx("dt",{children:"主题"}),a.jsx("dd",{children:e.topics})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"回复"}),a.jsx("dd",{children:e.replies})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"签到"}),a.jsx("dd",{children:e.checkins})]})]}),a.jsxs("p",{className:"thread-author-profile-last-seen",children:[a.jsx("span",{children:"最近在线"}),a.jsx("strong",{children:e.lastSeen})]})]})}function Ie(e){return e.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function Dr(e){const r=window.getSelection()?.toString();r&&(e.preventDefault(),e.clipboardData.setData("text/plain",r))}function Fr({articleAfterContent:e,author:r,avatarRail:t,className:o="",content:n,decorationImageSrc:u,editedAt:i,floor:c,floorIndex:d,id:b,inlineAvatar:s=!1,mainAfterContent:p,onCopy:g,publishedAt:I,showAuthorProfile:y}){const f=r.tags??[],S=De(f);return a.jsxs("article",{className:`thread-floor${y?" thread-floor-with-author-profile":""}${o?` ${o}`:""}`,"data-floor":c,id:b,onCopy:g,children:[u&&a.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:a.jsx("img",{alt:"",src:u})}),y?a.jsx(zr,{author:r}):!s&&t,a.jsxs("div",{className:"thread-floor-main",children:[a.jsxs("header",{className:"thread-floor-header",children:[!y&&s&&t,a.jsxs("div",{className:"thread-floor-author",children:[a.jsx("a",{href:ie(r.name),children:r.name}),a.jsx(Oe,{tags:S})]}),a.jsxs("div",{className:"thread-floor-time",children:[a.jsx("time",{children:Ie(I)}),i&&a.jsxs(a.Fragment,{children:[a.jsx("span",{children:"·"}),a.jsxs("time",{children:["编辑于 ",Ie(i)]})]})]}),d]}),y?a.jsx("div",{className:"thread-floor-content",children:n}):n,p]}),e]})}function Or({canDelete:e,canEdit:r,canQuote:t,canReply:o,decorative:n=!1,deleting:u=!1,editHref:i="",onDelete:c,onQuote:d,onReply:b}){const s=n?-1:void 0,p=l.useRef(null);return a.jsxs("div",{"aria-hidden":n||void 0,className:`thread-floor-actions${n?" thread-floor-actions-decorative":""}`,children:[t&&a.jsxs("button",{onClick:g=>{const I=p.current?p.current.text:$e(g.currentTarget);p.current=null,d?.(I)},onPointerDown:g=>{g.button===0&&(p.current={text:$e(g.currentTarget)})},tabIndex:s,type:"button",children:[a.jsx(Ct,{size:15}),"引用"]}),o&&a.jsxs("button",{onClick:b,tabIndex:s,type:"button",children:[a.jsx(Ut,{size:15}),"回复"]}),r&&(n?a.jsxs("button",{tabIndex:-1,type:"button",children:[a.jsx(Te,{size:15}),"编辑"]}):a.jsxs("a",{href:i,children:[a.jsx(Te,{size:15}),"编辑"]})),e&&a.jsxs("button",{"aria-busy":u||void 0,className:"floor-action-danger",disabled:!n&&u,onClick:n?void 0:g=>c?.(g.currentTarget),tabIndex:s,type:"button",children:[a.jsx(ke,{size:15}),u?"删除中":"删除"]})]})}function ea({canQuote:e,canReply:r,decorationImageSrc:t,editHref:o,floor:n,isActivityThread:u,isMainPost:i,inlineAvatar:c,showAuthorProfile:d,hideSignature:b,onDeleteFloor:s,onDeleteNestedReply:p,onIsolatedTextSelection:g,onQuote:I,onSubmitNestedReply:y,viewer:f}){const[S,E]=l.useState(!1),[k,R]=l.useState(null),[N,q]=l.useState([]),[T,H]=l.useState(""),[D,X]=l.useState(!1),[J,Q]=l.useState([]),[_,B]=l.useState(""),[Z,C]=l.useState(""),[F,ee]=l.useState(null),[A,Y]=l.useState(""),[L,O]=l.useState(!1),[j,m]=l.useState(void 0),[x,w]=l.useState(null),[P,W]=l.useState(!1),M=l.useRef(null),G=l.useRef(null),re=l.useRef(null),v=l.useRef(null),V=l.useRef(null),ae=l.useMemo(()=>[...n.nestedReplies??[],...J].filter(h=>!N.includes(h.id)),[N,n.nestedReplies,J]),se=u&&!i&&/<\s*(?:s|strike)\b/i.test(n.contentHtml??""),ne=`thread-floor-body${se?" capubbs-activity-signup-canceled":""}`;l.useEffect(()=>()=>{G.current!==null&&window.clearTimeout(G.current)},[]),l.useEffect(()=>{if(!P)return;function h($){M.current?.contains($.target)||W(!1)}return document.addEventListener("pointerdown",h),()=>document.removeEventListener("pointerdown",h)},[P]);async function Ve(){const h=`${window.location.origin}${window.location.pathname}${window.location.search}#${n.floor}`;await _t(h)&&(E(!0),G.current!==null&&window.clearTimeout(G.current),G.current=window.setTimeout(()=>E(!1),1800))}const Ee=(h,$,K,me)=>{V.current=K,w({imageIndex:$,images:h,onImageChange:me})};function Je(h){x?.onImageChange?.(h),w(null),window.requestAnimationFrame(()=>V.current?.focus())}function Ce(h=null){m(h),B(""),C(""),Y(""),window.requestAnimationFrame(()=>v.current?.focus())}function je(){m(void 0),B(""),Y("")}async function Ke(h){h.preventDefault();const $=_.trim();if(!(!$||!f||L)){O(!0),Y("");try{const K=await y(n,j??null,$);Q(me=>[...me,{author:f,canDelete:!0,content:$,id:K>0?String(K):`local-${n.id}-${Date.now()}`,publishedAt:Ur(new Date),target:j??void 0}]),je()}catch(K){Y(K instanceof Error?K.message:"楼中楼回复发布失败，请稍后重试。")}finally{O(!1)}}}async function Xe(h){ee(h.id),C("");try{await p(n,h),q($=>[...$,h.id]),Q($=>$.filter(K=>K.id!==h.id)),R(null)}catch($){C($ instanceof Error?$.message:"楼中楼删除失败，请稍后重试。")}finally{ee(null)}}async function Qe(){if(!D){X(!0),H("");try{await s(n)}catch(h){H(h instanceof Error?h.message:"楼层删除失败，请稍后重试。"),X(!1)}}}function Ze(){R(null),H(""),C(""),window.requestAnimationFrame(()=>re.current?.focus())}function et(){if(!k)return;const h=k;R(null),h.kind==="floor"?Qe():Xe(h.reply)}const tt=a.jsxs("div",{className:`thread-avatar-rail${P?" thread-avatar-rail-open":""}`,ref:M,children:[a.jsx("button",{"aria-controls":`author-card-${n.floor}`,"aria-expanded":P,"aria-label":`查看${n.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>W(h=>!h),type:"button",children:a.jsx("img",{src:n.author.avatar,alt:""})}),a.jsx($r,{author:n.author,id:`author-card-${n.floor}`})]}),rt=a.jsx(Nr,{attachments:n.attachments,bodyFallback:a.jsx("div",{className:ne,children:n.paragraphs.map(h=>a.jsx("p",{children:h},h))}),bodyClassName:ne,bodyHtml:n.contentHtml,floor:n.floor,isActivitySignupCanceled:se,onImageOpen:Ee,onIsolatedTextSelection:h=>g(n,h),signatureHtml:b?void 0:n.signatureHtml,signatureText:b?void 0:n.signature}),at=a.jsxs("button",{"aria-label":`复制第 ${n.floor} 楼链接`,className:"thread-floor-index",onClick:Ve,title:"复制楼层链接",type:"button",children:["#",n.floor]}),nt=a.jsxs(a.Fragment,{children:[a.jsx(Or,{canDelete:(!u||i)&&(n.canDelete??n.isOwn??!1),canEdit:(!u||i)&&!!n.isOwn,canQuote:e,canReply:r,deleting:D,editHref:o,onDelete:h=>{re.current=h,H(""),R({kind:"floor"})},onQuote:h=>I(n,h),onReply:()=>Ce()}),T&&a.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:T}),ae.length>0&&a.jsx("section",{className:"nested-replies","aria-label":`${n.floor} 楼的楼中楼回复`,children:ae.map(h=>a.jsxs("article",{children:[a.jsx("img",{src:h.author.avatar,alt:""}),a.jsxs("div",{className:"nested-reply-main",children:[a.jsxs("div",{className:"nested-reply-identity",children:[a.jsx("a",{className:"nested-reply-author",href:ie(h.author.name),children:h.author.name}),h.target&&a.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",a.jsx("a",{href:ie(h.target),children:h.target})]})]}),h.contentHtml?a.jsx(Ue,{className:"nested-reply-content",html:h.contentHtml,onImageOpen:Ee,variant:"nested"}):a.jsx("p",{children:h.content}),a.jsxs("footer",{className:"nested-reply-footer",children:[a.jsx("time",{children:Ie(h.publishedAt)}),r&&a.jsx("button",{onClick:()=>Ce(h.author.name),type:"button",children:"回复"}),h.canDelete&&a.jsxs("button",{className:"nested-reply-delete",disabled:F===h.id,onClick:$=>{re.current=$.currentTarget,C(""),R({kind:"nested",reply:h})},type:"button",children:[a.jsx(ke,{size:12}),F===h.id?"删除中":"删除"]})]})]})]},h.id))}),Z&&a.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:Z}),j!==void 0&&r&&a.jsxs("form",{className:"nested-reply-composer",onSubmit:Ke,children:[a.jsx("textarea",{"aria-label":j?`回复 @${j}`:`回复第 ${n.floor} 楼`,maxLength:500,onChange:h=>{B(h.target.value),Y("")},placeholder:j?`回复 @${j}`:"写一条楼中楼回复",ref:v,rows:2,value:_}),a.jsxs("div",{className:"nested-reply-composer-actions",children:[a.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:L,onClick:je,type:"button",children:a.jsx(Ae,{size:15})}),a.jsxs("button",{className:"nested-reply-submit",disabled:!_.trim()||L,type:"submit",children:[a.jsx(Rt,{size:14}),L?"发送中":"发送"]})]}),A&&a.jsx("p",{className:"nested-reply-error",role:"alert",children:A})]})]}),ot=a.jsxs(a.Fragment,{children:[S&&a.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[a.jsx(Et,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),x&&a.jsx(tr,{images:x.images,initialImageIndex:x.imageIndex,onImageChange:x.onImageChange,onClose:Je}),k&&a.jsx(Hr,{floor:n,isMainPost:i,onCancel:Ze,onConfirm:et,target:k})]});return a.jsx(Fr,{articleAfterContent:ot,author:n.author,avatarRail:tt,content:rt,decorationImageSrc:t,editedAt:n.editedAt,floor:n.floor,floorIndex:at,id:String(n.floor),inlineAvatar:c,mainAfterContent:nt,onCopy:Dr,publishedAt:n.publishedAt,showAuthorProfile:d})}function $e(e){const r=e.closest(".thread-floor")?.querySelector(".thread-floor-body");return jt(window.getSelection(),r??null)}function Hr({floor:e,isMainPost:r,onCancel:t,onConfirm:o,target:n}){const u=n.kind==="nested"?n.reply:null,i=u?"删除楼中楼回复":r?"删除主楼":"删除回复",c=u?"":r?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",d=u?.author.name??e.author.name,b=u?`#${e.floor} · 楼中楼`:`#${e.floor}`,s=Gr(u?.content||e.quoteText||e.paragraphs[0]||"");return l.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),l.useEffect(()=>{function p(g){g.key==="Escape"&&t()}return document.addEventListener("keydown",p),()=>document.removeEventListener("keydown",p)},[t]),a.jsx("div",{className:"thread-delete-dialog-backdrop",onMouseDown:p=>{p.currentTarget===p.target&&t()},role:"presentation",children:a.jsxs("section",{"aria-describedby":c?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[a.jsxs("header",{children:[a.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:a.jsx(Ft,{size:19})}),a.jsx("div",{children:a.jsx("h2",{id:"thread-delete-dialog-title",children:i})}),a.jsx("button",{"aria-label":"关闭删除确认",onClick:t,type:"button",children:a.jsx(Ae,{size:18})})]}),a.jsxs("div",{className:"thread-delete-dialog-body",children:[c&&a.jsx("p",{id:"thread-delete-dialog-description",children:c}),a.jsxs("div",{className:"thread-delete-dialog-target",children:[a.jsxs("span",{children:[d," · ",b]}),a.jsx("p",{children:s||"此回复没有可预览的文字内容。"})]})]}),a.jsxs("footer",{children:[a.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:t,type:"button",children:"取消"}),a.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:o,type:"button",children:[a.jsx(ke,{size:15}),"确认删除"]})]})]})})}function Gr(e){const r=e.replace(/\s+/g," ").trim();return r.length>100?`${r.slice(0,100).trimEnd()}…`:r}function Ur(e){const r=t=>String(t).padStart(2,"0");return`${e.getFullYear()}-${r(e.getMonth()+1)}-${r(e.getDate())} ${r(e.getHours())}:${r(e.getMinutes())}:${r(e.getSeconds())}`}export{Ht as P,Nr as T,Fr as a,Or as b,ea as c,_t as w};
