import{y as De,r as u,a7 as ct,bG as ut,bH as dt,j as a,bI as mt,bJ as pt,bK as gt,bL as ft,bM as ht,aX as bt,aP as yt,b2 as xt,aR as vt,bN as wt,bO as It,bP as At,bQ as St,bR as Rt,bS as Et,ad as kt,u as Ct,a0 as Z,a3 as He,I as jt,af as Nt,J as Ne,bn as Tt,a8 as Lt,bT as qt}from"./index-C6l3RHlO.js";import{e as $t,d as Te,m as se,s as Pt,r as Mt,f as Ft,T as Ot,a as Ue,P as Ge}from"./RichTextEditor.gallery-BN9qeYhz.js";import{f as zt}from"./dataDisplay-Bvb7Ao7g.js";import{D as _e,T as le}from"./TagBadge-DuAKl4W8.js";import{T as fe}from"./trash-2-BeTqXmIw.js";import{P as Le}from"./pencil-CDbWfcYB.js";import{E as Dt}from"./external-link-CMqdQ6q3.js";import{T as Ht}from"./triangle-alert-jb2_Qyew.js";const Ut=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],Gt=De("paperclip",Ut);const _t=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],Bt=De("reply",_t),Wt="(min-width: 1024px) and (prefers-reduced-motion: no-preference)";function Vt(){const e=u.useRef(null);return u.useEffect(()=>{const r=e.current,t=window.matchMedia?.(Wt);if(!r||!t||typeof IntersectionObserver>"u")return;let o=!!r.dataset.forumViewportEntrance;const n=new IntersectionObserver(l=>{o||!t.matches||!l.some(d=>d.isIntersecting)||(o=!0,r.dataset.forumViewportEntrance="entering",n.disconnect())},{rootMargin:"0px",threshold:0}),c=l=>{l.target===r&&o&&(r.dataset.forumViewportEntrance="done")},i=()=>{n.disconnect(),o?r.dataset.forumViewportEntrance="done":t.matches&&n.observe(r)};return i(),t.addEventListener("change",i),r.addEventListener("animationend",c),()=>{n.disconnect(),t.removeEventListener("change",i),r.removeEventListener("animationend",c)}},[]),e}async function Jt(e){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),!0}catch{}const r=document.createElement("textarea");r.value=e,r.setAttribute("readonly",""),r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select();try{return document.execCommand("copy")}finally{r.remove()}}const Kt=400;function ra(e,r){return r?`回复 @${r}：${e}`:e}function Yt(e){const r=Array.from(e).length,t=Kt,o=r>t;return{canSubmit:!!e.trim()&&!o,isOverLimit:o,length:r,limit:t}}const Qt={black:0,darkgray:169,darkgrey:169,dimgray:105,dimgrey:105,gainsboro:220,gray:128,grey:128,lightgray:211,lightgrey:211,silver:192,white:255,whitesmoke:245},ce="data-capubbs-original-grayscale-color-attr",ue="data-capubbs-original-grayscale-style-color";function Xt(e){const r=String(e??"").trim().toLowerCase().replace(/^['"]|['"]$/g,""),t=r.replace(/\s+/g,""),o=Qt[t];if(typeof o=="number")return{alpha:1,channel:o};const n=t.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);if(n){const s=n[1].length<=4?n[1].split("").map(m=>`${m}${m}`).join(""):n[1],g=Number.parseInt(s.slice(0,2),16),f=Number.parseInt(s.slice(2,4),16),x=Number.parseInt(s.slice(4,6),16),b=s.length===8?Number.parseInt(s.slice(6,8),16)/255:1;return g===f&&f===x?{alpha:b,channel:g}:null}const c=r.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*(?:,|\/)\s*([01](?:\.\d+)?|\.\d+|100%|\d{1,3}(?:\.\d+)?%))?\s*\)$/);if(!c)return null;const i=de(c[1]),l=de(c[2]),d=de(c[3]),h=rr(c[4]);return i===null||l===null||d===null||h===null?null:i===l&&l===d?{alpha:h,channel:i}:null}function Be(e,r=!0){const t=Xt(e);if(!t)return null;const o=255-t.channel;if(r&&t.alpha<1)return`rgba(${o}, ${o}, ${o}, ${ar(t.alpha)})`;const n=o.toString(16).padStart(2,"0");return`#${n}${n}${n}`}function Zt(e,r){[...e.matches("[color], [style]")?[e]:[],...Array.from(e.querySelectorAll("[color], [style]"))].forEach(o=>{er(o,r),o instanceof HTMLElement&&tr(o,r)})}function er(e,r){const t=e.getAttribute(ce);if(r==="light"){if(t===null)return;e.setAttribute("color",t),e.removeAttribute(ce);return}const o=t??e.getAttribute("color"),n=Be(o,!1);!n||o===null||(t===null&&e.setAttribute(ce,o),e.getAttribute("color")!==n&&e.setAttribute("color",n))}function tr(e,r){const t=e.getAttribute(ue);if(r==="light"){if(t===null)return;e.style.setProperty("color",t,e.style.getPropertyPriority("color")),e.removeAttribute(ue);return}const o=t??e.style.getPropertyValue("color"),n=Be(o);!n||!o||(t===null&&e.setAttribute(ue,o),e.style.getPropertyValue("color")!==n&&e.style.setProperty("color",n,e.style.getPropertyPriority("color")))}function de(e){const r=e.endsWith("%"),t=Number(r?e.slice(0,-1):e);return Number.isFinite(t)?r?t>=0&&t<=100?Math.round(t*2.55):null:t>=0&&t<=255?Math.round(t):null:null}function rr(e){if(e===void 0)return 1;const r=e.endsWith("%"),t=Number(r?e.slice(0,-1):e);return Number.isFinite(t)?r?t>=0&&t<=100?t/100:null:t>=0&&t<=1?t:null:null}function ar(e){return Number(e.toFixed(3))}function nr(e){const r=[];return e.querySelectorAll("table").forEach(t=>{if(t.classList.contains("forum-punishment-table")||t.parentElement?.closest("table")||t.querySelector("table")||t.rows.length<2||!Array.from(t.rows).some(s=>s.cells.length>1))return;let o=t.parentElement;if(!o?.classList.contains("forum-table-scroll")){o=t.ownerDocument.createElement("div"),o.className="forum-table-scroll",o.tabIndex=0,t.before(o),o.append(t),t.classList.add("forum-data-table");let s=[],g=null;Array.from(t.rows).forEach((f,x)=>{g!==f.parentElement&&(g=f.parentElement,s=[]);let b=0;Array.from(f.cells).forEach(m=>{for(;(s[b]??0)>0;)b+=1;b===0&&m.colSpan===1&&m.classList.add("forum-table-first-column"),x===0&&!t.tHead&&m.classList.add("forum-table-heading");const v=m.rowSpan===0?t.rows.length:m.rowSpan;for(let j=0;j<m.colSpan;j+=1)s[b+j]=v;b+=m.colSpan;const w=t.ownerDocument.createElement("div");for(w.className="forum-table-cell-content";m.firstChild;)w.append(m.firstChild);m.append(w)}),s=s.map(m=>Math.max(0,m-1))})}const n=o;let c=n.parentElement;c?.classList.contains("forum-table-viewport")||(c=t.ownerDocument.createElement("div"),c.className="forum-table-viewport",n.before(c),c.append(n));const i=c,l=()=>{n.classList.toggle("forum-table-scrolled",n.scrollLeft>0),i.classList.toggle("forum-table-more-right",n.scrollWidth-n.clientWidth-n.scrollLeft>1)};l(),n.addEventListener("scroll",l,{passive:!0});const d=t.ownerDocument.defaultView,h=d?.ResizeObserver?new d.ResizeObserver(l):null;h?.observe(n),h?.observe(t),d?.addEventListener("resize",l),r.push(()=>{n.removeEventListener("scroll",l),h?.disconnect(),d?.removeEventListener("resize",l)})}),()=>r.forEach(t=>t())}function We(e){const r=e.ownerDocument.defaultView;if(!r)return()=>{};const t=[];return e.querySelectorAll(".forum-punishment-table").forEach(o=>{const n=o.parentElement;if(!n?.classList.contains("forum-punishment-scroll"))return;let c=!1;function i(){if(c||!n)return;const d=n.clientWidth,h=Math.max(o.offsetWidth,o.scrollWidth);if(d<=0||h<=0)return;const s=Math.min(1,d/h),g=`scale(${s})`,f=`${Math.ceil(o.offsetHeight*s)}px`;o.style.transform!==g&&(o.style.transform=g),n.style.height!==f&&(n.style.height=f)}const l=r.ResizeObserver?new r.ResizeObserver(i):null;l?.observe(n),l?.observe(o),r.addEventListener("resize",i),e.ownerDocument.fonts?.ready.then(i),i(),t.push(()=>{c=!0,l?.disconnect(),r.removeEventListener("resize",i)})}),()=>t.forEach(o=>o())}function Ve({className:e="",html:r,onImageOpen:t,variant:o}){const n=u.useRef(null),{theme:c}=ct(),i=u.useMemo(()=>({__html:ut(r)}),[r]);if(u.useLayoutEffect(()=>{const s=n.current;if(s&&o!=="signature")return nr(s)},[r,o]),u.useLayoutEffect(()=>{const s=n.current;if(s&&o!=="signature")return We(s)},[r,o]),u.useLayoutEffect(()=>{const s=n.current;s&&($t(s),Zt(s,c))},[r,c]),u.useLayoutEffect(()=>{const s=n.current;if(s)return dt(s)},[r]),u.useEffect(()=>{const s=n.current;if(!s)return;const g=Array.from(s.querySelectorAll("img")),f=b=>{b.dataset.capubbsImageLoaded="true"},x=g.map(b=>{if(b.complete&&b.getAttribute("src"))return f(b),null;const m=()=>f(b);return b.addEventListener("load",m,{once:!0}),b.addEventListener("error",m,{once:!0}),{handleLoad:m,image:b}});return()=>{x.forEach(b=>{b&&(b.image.removeEventListener("load",b.handleLoad),b.image.removeEventListener("error",b.handleLoad))})}},[r]),!r)return null;function l(s,g){if(!t||!(s instanceof Element))return;const f=s.closest("img");if(!(f instanceof HTMLImageElement))return;const x=f.closest(".capubbs-gallery"),b=x?Array.from(x.querySelectorAll('[data-capubbs-gallery-slide="true"] img')):Array.from(g.querySelectorAll("img")).filter(S=>!S.closest(".capubbs-gallery")),m=b.indexOf(f);if(m<0)return;const v=b.map(S=>or(S,g)),w=b.map((S,T)=>{const L=v[T];return{alt:S.alt.trim(),element:S,src:S.currentSrc||S.getAttribute("src")||S.dataset.capubbsGallerySrc||"",...L?{galleryId:L.galleryId,galleryIndex:L.galleryIndex}:{}}});t(w,m,f,S=>{const T=v[S];T&&Pt(T.gallery,T.galleryIndex)})}function d(s){const g=Te(s.target);if(g&&s.target instanceof Element){s.preventDefault(),s.stopPropagation(),se(s.target,g);return}!t||!(s.target instanceof HTMLImageElement)||(s.preventDefault(),l(s.target,s.currentTarget))}function h(s){const g=Te(s.target);if(g&&["Enter"," "].includes(s.key)&&s.target instanceof Element){s.preventDefault(),se(s.target,g);return}if(["ArrowLeft","ArrowRight"].includes(s.key)&&s.target instanceof Element&&s.target.closest(".capubbs-gallery")){s.preventDefault(),se(s.target,s.key==="ArrowLeft"?"prev":"next");return}!t||!(s.target instanceof HTMLImageElement)||!["Enter"," "].includes(s.key)||(s.preventDefault(),l(s.target,s.currentTarget))}return a.jsx("div",{ref:n,className:`forum-markup forum-markup-${o} ${e}`.trim(),"data-forum-markup":o,dangerouslySetInnerHTML:i,onClick:d,onKeyDown:h})}function or(e,r){const t=e.closest(".capubbs-gallery");if(!t||!r.contains(t))return null;const n=Array.from(r.querySelectorAll(".capubbs-gallery")).indexOf(t),i=Array.from(t.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(e);return n>=0&&i>=0?{gallery:t,galleryId:n,galleryIndex:i}:null}function ir(e){if(!/<punishment_record\b/i.test(e))return null;const r=document.createElement("template");r.innerHTML=e;const t=Array.from(r.content.querySelectorAll("punishment_record")).filter(n=>!n.closest("pre, code, textarea"));if(t.length===0)return null;const o=t.map(n=>{const c=n.getAttribute("year")?.trim()??"",i=/^\d{4}$/.test(c)&&Number(c)>1?Number(c):null,l=document.createElement("div");return n.replaceWith(l,...Array.from(n.childNodes)),{placeholder:l,year:i}});return{needsRecords:o.some(({year:n})=>n!==null),render(n,c){return o.forEach(({placeholder:i,year:l})=>{if(l===null||c){i.textContent=l===null?"罚跑记录学年无效":c;return}const d=document.createElement("table"),h=`${l-1}-${l} 学年罚跑记录`;d.className="forum-punishment-table",d.setAttribute("aria-label",h);const s=document.createElement("div");s.className="forum-punishment-title",s.setAttribute("role","heading"),s.setAttribute("aria-level","2"),s.textContent=h;const g=d.createTHead().insertRow();["姓名","ID","原因","长度","职务加罚","开始时间","结束时间","完成情况"].forEach(m=>{const v=document.createElement("th");v.scope="col",v.textContent=m,g.append(v)});const f=d.createTBody(),x=n.filter(m=>{const v=m.startDate.match(/^(\d{4})-(\d{1,2})-/);if(!v)return!1;const w=Number(v[2]);return w>=1&&w<=12&&Number(v[1])+(w>=9?1:0)===l});if(x.forEach(m=>{const v=f.insertRow(),w=m.distance?/公里|km/i.test(m.distance)?m.distance:`${m.distance} km`:"—";[m.name||"—",m.username||"—",m.reason||"—",w,m.addition?"是":"否",qe(m.startDate),qe(m.endDate),m.isComplete?"已完成":"进行中"].forEach(j=>{v.insertCell().textContent=j})}),x.length===0){const m=f.insertRow().insertCell();m.colSpan=8,m.className="forum-punishment-empty",m.textContent="暂无罚跑记录"}const b=document.createElement("div");b.className="forum-punishment-scroll",b.append(d),i.className="forum-punishment-record",i.replaceChildren(s,b)}),r.innerHTML}}}function qe(e){return!e||e==="0000-00-00"?"—":e.replaceAll("-",".")}function sr(e,r){const t=u.useMemo(()=>r?ir(e):null,[r,e]),[o,n]=u.useState(null);return u.useEffect(()=>{if(!t||!t.needsRecords)return;const c=new AbortController;return zt("punishments",c.signal).then(({punishmentRecords:i})=>{c.signal.aborted||n({prepared:t,html:t.render(i)})}).catch(i=>{c.signal.aborted||n({prepared:t,html:t.render([],i instanceof Error?i.message:"罚跑记录加载失败")})}),()=>c.abort()},[t]),t?t.needsRecords?o?.prepared===t?o.html:"":t.render([]):e}const lr='.forum-markup .forum-punishment-table{display:table;width:-moz-max-content;width:max-content;min-width:100%;max-width:none;border-collapse:separate;border-spacing:0;transform-origin:top left}.forum-markup .forum-punishment-table :is(th,td){border:0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:9px;background:var(--surface);color:var(--text-muted);font:inherit;text-align:center;white-space:nowrap}.forum-markup .forum-punishment-table tbody tr:hover>td{background:var(--brand-faint, color-mix(in srgb, var(--brand) 8%, var(--surface)))}.forum-markup .forum-punishment-table tr>:last-child{border-right:0}.forum-markup .forum-punishment-table tbody tr:last-child>td{border-bottom:0}.forum-markup .forum-punishment-table th{background:var(--surface-soft);color:var(--text-faint);font-weight:780}.forum-markup .forum-punishment-record{box-sizing:border-box;min-width:0;max-width:100%;border:1px solid var(--line)}.forum-markup .forum-punishment-scroll{max-width:100%;overflow:hidden}.forum-markup .forum-punishment-title{padding:12px 14px;border-bottom:1px solid var(--line);background:var(--surface-soft);color:var(--text-strong);font-family:inherit;font-size:var(--ui-font-size-lg, 14px);font-weight:760;line-height:1.5;text-align:center}.forum-markup .forum-punishment-table .forum-punishment-empty{text-align:center}.forum-markup .forum-punishment-empty>.forum-table-cell-content{width:auto;max-width:none}:root{--surface: #fffefa;--surface-raised: #ffffff;--surface-soft: #f6f8f4;--text: #20231f;--text-strong: #111411;--text-muted: #687068;--text-faint: #919991;--line: #e1e6df;--line-strong: #cdd5cc;--brand: #236b4c;--brand-strong: #174f38;--danger: #b8473f}:root.dark{--surface: #171d19;--surface-raised: #1c241f;--surface-soft: #1f2822;--text: #dde5de;--text-strong: #f6faf6;--text-muted: #a0aca2;--text-faint: #748078;--line: #2c362f;--line-strong: #3c493f;--brand: #69b98d;--brand-strong: #8bcca6;--danger: #ef8178}::-moz-selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}::selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentcolor}blockquote,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}a{color:inherit;text-decoration:inherit}button{margin:0;padding:0;background-color:transparent;color:inherit;font:inherit;letter-spacing:inherit;text-transform:none}button:where(:not([style]):not([class])){min-height:32px;border:1px solid var(--line);border-radius:.5px;padding:4px 12px;background-color:var(--surface);color:var(--text-muted);font-size:14px;font-weight:680;line-height:1.5;vertical-align:middle;cursor:pointer;transition:background-color .14s ease,border-color .14s ease,color .14s ease}button:where(:not([style]):not([class]):hover:not(:disabled)){border-color:var(--line-strong);background-color:var(--surface-soft);color:var(--brand-strong)}button:where(:not([style]):not([class]):focus-visible){outline:2px solid var(--brand);outline-offset:2px}button:where(:not([style]):not([class]):disabled){cursor:not-allowed;opacity:.5}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}.capubbs-html-frame-root iframe{background-color:transparent!important}img,video{max-width:100%;height:auto}table{border-color:inherit;border-collapse:collapse;text-indent:0}.capubbs-activity-signup-canceled,.capubbs-activity-signup-canceled *{color:var(--danger)!important;text-decoration-color:var(--danger)!important;text-decoration-line:line-through!important;text-decoration-thickness:2px!important}.forum-markup>:first-child{margin-top:0}.forum-markup>:last-child{margin-bottom:0}.forum-markup p,.forum-markup div{margin:0}.forum-markup-floor p{margin:0 0 .75em}.forum-markup-floor>div+div{margin-top:.55em}.forum-markup a{color:var(--brand-strong);font-weight:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.16em}.forum-markup .forum-mention{text-decoration:none}.forum-markup blockquote{margin:0 0 0 2em;border:0;padding:0;background:transparent;color:inherit}.forum-markup blockquote.forum-quote,.forum-markup .forum-legacy-quote,.forum-markup blockquote.capubbs-floor-quote{margin:.8em 0;border-left:3px solid color-mix(in srgb,var(--brand) 38%,var(--line));padding:.55em .75em;background:var(--surface-soft);color:var(--text-muted)}.forum-markup .capubbs-floor-quote-jump{margin-left:.75em}.forum-markup .forum-legacy-quote-content{margin:0}.forum-markup h1,.forum-markup h2,.forum-markup h3,.forum-markup h4,.forum-markup h5,.forum-markup h6{margin:.9rem 0 .45rem;color:var(--brand-strong);font-weight:800;line-height:1.35}.forum-markup h1{font-size:1.45rem}.forum-markup h2{font-size:1.25rem}.forum-markup h3{font-size:1.1rem}.forum-markup h4,.forum-markup h5,.forum-markup h6{font-size:1em}.forum-markup ul,.forum-markup ol{margin:.65em 0;padding-left:1.45em}.forum-markup ul{list-style:disc}.forum-markup ol{list-style:decimal}.forum-markup ol.capubbs-ordered-list-alpha{list-style-type:lower-alpha}.forum-markup ol.capubbs-ordered-list-roman{list-style-type:lower-roman}.forum-markup pre{max-width:100%;overflow-x:auto;margin:.75em 0;border-radius:2px;padding:.75em;background:#182531;color:#f8fafc;white-space:pre-wrap}.forum-markup code,.forum-markup kbd{border-radius:2px;padding:.08em .25em;background:color-mix(in srgb,var(--surface-soft) 75%,var(--line));font-family:SFMono-Regular,Cascadia Code,Consolas,monospace;font-size:.9em}.forum-markup pre code{padding:0;background:transparent;color:inherit}.forum-markup font[size="1"]{font-size:11px}.forum-markup font[size="2"]{font-size:13px}.forum-markup font[size="3"]{font-size:15px}.forum-markup font[size="4"]{font-size:17px}.forum-markup font[size="5"]{font-size:19px}.forum-markup font[size="6"]{font-size:21px}.forum-markup font[size="7"]{font-size:23px}.forum-markup hr{margin:.9em 0;border:0;border-top:1px solid var(--line-strong)}.forum-markup img{display:inline-block;height:auto;max-width:100%;vertical-align:middle}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){color:transparent;font-size:0;background-color:color-mix(in srgb,var(--surface-soft) 82%,var(--line));background-image:linear-gradient(105deg,transparent 20%,color-mix(in srgb,var(--surface-raised) 70%,transparent) 45%,transparent 70%);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}.forum-markup img[role=button]{cursor:zoom-in}.forum-markup img[role=button]:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse}.forum-markup td,.forum-markup th{border:1px solid var(--line);padding:.35em .5em}.forum-markup-signature{color:#999;font-family:monospace;font-size:14px;line-height:1.6;overflow-wrap:anywhere}:root.dark .forum-markup-signature{color:#666}.forum-markup .capubbs-gallery{position:relative;display:block;width:100%;margin:.9rem 0;overflow:hidden;border:1px solid var(--line);border-radius:2px;background:transparent;color:var(--text)}.forum-markup .capubbs-gallery:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup .capubbs-gallery-header{position:relative;display:flex;min-height:44px;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:9px 12px;border-bottom:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-title{width:100%;min-width:0;margin:0;color:var(--text-strong);font-size:.82rem;font-weight:760;line-height:1.4;text-align:center}.forum-markup .capubbs-gallery-stage{position:relative;display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide{display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-slide>img{display:block;width:100%;height:var(--capubbs-gallery-image-height, clamp(280px, 52vw, 560px));max-width:none;margin:0 auto;border-radius:0;-o-object-fit:contain;object-fit:contain}.forum-markup .capubbs-gallery-caption{display:block;margin:0;color:var(--text-muted);font-size:.78rem;line-height:1.55;text-align:center}.forum-markup .capubbs-gallery-caption[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-footer{position:relative;display:flex;min-height:44px;align-items:center;justify-content:center;margin:0;padding:9px 12px;border-top:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-captions{width:100%;min-width:0;margin:0;padding-inline:48px;text-align:center}.forum-markup .capubbs-gallery-count{position:absolute;top:50%;right:12px;color:var(--text-faint);font-size:.72rem;font-variant-numeric:tabular-nums;font-weight:760;line-height:1.25;transform:translateY(-50%)}.forum-markup .capubbs-gallery-count[data-capubbs-gallery-current]:before{content:attr(data-capubbs-gallery-current) "/" attr(data-capubbs-gallery-total)}.forum-markup .capubbs-gallery-nav{position:absolute;z-index:4;top:50%;display:grid;width:36px;height:48px;place-items:center;padding:0;transform:translateY(-50%);border:1px solid rgb(255 255 255 / .25);border-radius:2px;background:#00000080;color:#fff;cursor:pointer;transition:.15s ease}.forum-markup .capubbs-gallery-nav:hover{background:#000000b8}.forum-markup .capubbs-gallery-nav:focus-visible{outline:2px solid #fff;outline-offset:2px}.forum-markup .capubbs-gallery-nav:before{font-family:Arial,sans-serif;font-size:2rem;font-weight:300;line-height:1}.forum-markup .capubbs-gallery-nav-prev:before{content:"‹"}.forum-markup .capubbs-gallery-nav-next:before{content:"›"}.forum-markup .capubbs-gallery-nav-prev{left:10px}.forum-markup .capubbs-gallery-nav-next{right:10px}@keyframes capubbs-image-loading{0%{background-position:120% 0}to{background-position:-80% 0}}@media(max-width:640px){.forum-markup .capubbs-gallery-slide>img{height:var(--capubbs-gallery-image-height, min(72vw, 420px))}.forum-markup .capubbs-gallery-nav{width:32px;height:42px}.forum-markup .capubbs-gallery-nav-prev{left:7px}.forum-markup .capubbs-gallery-nav-next{right:7px}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){animation:none}}',cr="/bbs/new-assets/threadHtmlBootstrap-x4mBAuLM.html";function ur(e,r){const t=new URL(e);return t.pathname=/Android|iPhone|iPad|iPod|Mobile/i.test(r)?"/m/outchain/player":"/outchain/player",t.href}function he(e,r){try{const t=new URL(e,r);return!(t.hostname==="player.bilibili.com"&&t.pathname==="/player.html"||t.hostname==="music.163.com"&&["/outchain/player","/m/outchain/player"].includes(t.pathname))||!["http:","https:"].includes(t.protocol)||t.username||t.password||t.port?null:(t.protocol="https:",t.href)}catch{return null}}function dr(e,r){const t=new URL(e);return t.hostname==="music.163.com"?(t.searchParams.set("auto","0"),ur(t.href,r)):(t.searchParams.set("autoplay","0"),t.href)}function mr(e){if(!e)return{left:0,top:0};const r=window.getComputedStyle(e);return{left:e.offsetLeft+e.clientLeft+(Number.parseFloat(r.paddingLeft)||0),top:e.offsetTop+e.clientTop+(Number.parseFloat(r.paddingTop)||0)}}function pr(e){if(!e||typeof e!="object")return!1;const r=e;return typeof r.id=="string"&&typeof r.src=="string"&&he(r.src,"https://music.163.com")===r.src&&["left","top","width","height"].every(t=>{const o=r[t];return typeof o=="number"&&Number.isFinite(o)&&Math.abs(o)<=1e5})&&r.width>0&&r.height>0}const $e=64*1024*1024,Pe=6,gr=2,ee=new Map,ae=new Map,B=new Map,W=new Map;let me=!1;function pe(e){const r=e.priorities.map(t=>t());return r.includes("high")?"high":r.includes("low")?"low":r.includes("deferred")?"deferred":null}function z(){me||!B.size&&!W.size||(me=!0,setTimeout(()=>{me=!1;const e=[];B.forEach((i,l)=>{const d=pe(i);if(d===null){B.delete(l),ee.delete(l),i.reject(new DOMException("图片所在内容已卸载","AbortError"));return}d!=="deferred"&&e.push({source:l,request:i,priority:d})}),e.sort((i,l)=>+(l.priority==="high")-+(i.priority==="high"));const r=Array.from(W.values(),i=>({download:i,priority:pe(i.request)}));r.forEach(({download:i,priority:l})=>{l===null&&i.controller.abort()});const t=r.filter(({download:i})=>i.controller.signal.aborted).length;let o=e.filter(({priority:i})=>i==="high").length-(Pe-W.size+t);const n=r.filter(({download:i,priority:l})=>l!=="high"&&!i.controller.signal.aborted).sort((i,l)=>+(l.priority==="deferred")-+(i.priority==="deferred"));for(const{download:i}of n){if(o<=0)break;o-=1,i.preempted=!0,i.controller.abort()}let c=r.filter(({priority:i})=>i!=="high").length;for(const{source:i,request:l,priority:d}of e){if(W.size>=Pe)break;d==="low"&&c>=gr||(B.delete(i),d==="low"&&(c+=1),fr(i,l,d))}},0))}function fr(e,r,t){const o={request:r,controller:new AbortController,preempted:!1};W.set(e,o),hr(e,t,o.controller.signal).then(n=>{o.controller.signal.throwIfAborted();const c={blob:n,objectUrl:URL.createObjectURL(n),sourceUrl:e};ae.set(e,c),r.resolve(c)}).catch(n=>{o.preempted||o.controller.signal.aborted&&pe(r)!==null?B.set(e,r):(ee.delete(e),r.reject(n))}).finally(()=>{W.delete(e),z()})}function Je(e){return new URL(e,new URL("/bbs/content/",window.location.origin)).href}function Me(e,r=()=>"high"){const t=Je(e),o=ee.get(t);if(o)return(B.get(t)??W.get(t)?.request)?.priorities.push(r),z(),o;const n=new Promise((c,i)=>{B.set(t,{priorities:[r],reject:i,resolve:c})});return ee.set(t,n),z(),n}function hr(e,r,t){const o=new URL(e);return o.origin!==window.location.origin||!o.pathname.startsWith("/bbs/images/")&&!o.pathname.startsWith("/bbsimg/")?Promise.reject(new Error("仅代理论坛图片目录")):fetch(e,{credentials:"same-origin",referrerPolicy:"no-referrer",priority:r,signal:t}).then(async n=>{if(!n.ok)throw new Error(`图片加载失败：${n.status}`);if(!(n.headers.get("content-type")?.toLowerCase()??"").startsWith("image/"))throw new Error("图片响应类型无效");const i=Number.parseInt(n.headers.get("content-length")??"",10);if(Number.isFinite(i)&&i>$e)throw new Error("图片大小超出限制");const l=await n.blob();if(l.size>$e)throw new Error("图片大小超出限制");return l})}function br(e){try{return ae.get(Je(e))?.objectUrl}catch{return}}typeof window<"u"&&(window.addEventListener("scroll",z,{passive:!0,capture:!0}),window.addEventListener("resize",z),window.addEventListener("pagehide",e=>{e.persisted||(ae.forEach(r=>URL.revokeObjectURL(r.objectUrl)),ae.clear(),ee.clear())}));function yr(e,r,t){let o="deferred";for(const n of r){const c=n.right>n.left&&n.bottom>n.top&&e.top+n.bottom>Math.max(0,e.top)&&e.top+n.top<Math.min(t.height,e.bottom)&&e.left+n.right>Math.max(0,e.left)&&e.left+n.left<Math.min(t.width,e.right);if(n.gallery){if(!c||n.gallery==="deferred")continue;if(n.gallery==="current")return"high";o="low"}else{if(c)return"high";o="low"}}return o}const xr=28,vr=64,wr=5e4,Ir=30,Ke=30,k="capubbs-thread-html-frame",Ye=new URL("/bbs/lib/jquery.min.js",window.location.origin).href,Ar=qr(lr),Sr=/\son[a-z][\w:-]*\s*=/i;let re=null;function Fe({className:e="",floor:r,html:t,isActivitySignupCanceled:o=!1,onImageOpen:n,onIsolatedTextSelection:c,variant:i}){const l=u.useMemo(()=>i==="signature"?Mt(t):t,[t,i]),d=Er(l,i==="signature"),h=sr(d,i==="floor"),s=mt(h),g=u.useMemo(()=>s?null:pt(h,{normalizeLegacyLineBreaks:i==="signature"}),[h,s,i]),f=u.useMemo(()=>gt(h),[h]);return!s&&g!==null?a.jsx(Ve,{className:e,html:g,onImageOpen:n,variant:i}):a.jsx(Rr,{className:e,floor:r,html:f,isActivitySignupCanceled:o,onImageOpen:n,onTextSelection:c,variant:i})}function Rr({className:e,floor:r,html:t,isActivitySignupCanceled:o,onImageOpen:n,onTextSelection:c,variant:i}){const l=u.useRef(null),d=u.useRef(`${i}-${r}-${Math.random().toString(36).slice(2)}`),h=u.useRef(n);h.current=n;const s=u.useRef(c);s.current=c;const g=i==="signature"?xr:vr,f=!!n,[x,b]=u.useState(null),[m,v]=u.useState(null),w=Pr(),j=u.useRef(w),S=ht(),T=i==="signature"?14:S,L=u.useMemo(()=>Nr(jr(t)),[t]),D=L.includes('type="text/capubbs-user-script"')||Sr.test(L),H=u.useMemo(()=>kr({canOpenImages:f,frameId:d.current,needsJquery:D,html:L,isActivitySignupCanceled:o,isDarkTheme:j.current,fontSize:T,variant:i}),[f,L,T,o,D,i]),q=u.useMemo(()=>Math.random().toString(36).slice(2),[H]),V=u.useMemo(()=>`${cr}#${new URLSearchParams({frameId:d.current,token:q})}`,[q]),G=u.useCallback(()=>{l.current?.contentWindow?.postMessage({source:k,type:"document-response",frameId:d.current,token:q,html:H},"*")},[q,H]),_=u.useCallback(()=>{l.current?.contentWindow?.postMessage({frameId:d.current,source:k,theme:w?"dark":"light",type:"theme"},"*")},[w]),U=u.useCallback((I=l.current?.contentWindow)=>{!D||!I||Oe().then(P=>{l.current?.contentWindow===I&&I.postMessage({frameId:d.current,jquerySource:P,source:k,type:"jquery-response"},"*")})},[D]),J=u.useCallback(()=>{G(),_(),U()},[G,U,_]);u.useEffect(()=>{b(null)},[V]),u.useEffect(()=>{_()},[_]),u.useEffect(()=>{D&&Oe()},[D]),u.useLayoutEffect(()=>{z()},[x]),u.useLayoutEffect(()=>{let I=!0;const P=new Map;function Y(y){const F=l.current?.contentWindow;if(!(!F||y.source!==F||!$r(y.data))&&y.data.frameId===d.current){if(y.data.type==="embedded-player-layout"){v({token:q,players:y.data.players});return}if(y.data.type==="document-request"){y.data.token===q&&G();return}if(y.data.type==="jquery-request"){U(F);return}if(y.data.type==="image-resource-layout"){P.has(y.data.requestId)&&(P.set(y.data.requestId,y.data.bounds),z());return}if(y.data.type==="image-resource-request"){const A=F,$=y.data.requestId;P.set($,y.data.bounds);const R=()=>{const N=l.current;return!I||!N||N.contentWindow!==A?null:yr(N.getBoundingClientRect(),P.get($)??[],{width:window.innerWidth,height:window.innerHeight})};Me(y.data.url,R).then(N=>{!I||l.current?.contentWindow!==A||A.postMessage({blob:N.blob,priority:R(),frameId:d.current,requestId:y.data.requestId,source:k,type:"image-resource-response"},"*")}).catch(()=>{!I||l.current?.contentWindow!==A||A.postMessage({priority:R(),frameId:d.current,requestId:y.data.requestId,source:k,type:"image-resource-error"},"*")}).finally(()=>P.delete($));return}if(y.data.type==="anchor"){const A=l.current;if(!A)return;const $=window.getComputedStyle(document.documentElement),R=Number.parseFloat($.getPropertyValue("--topbar-height"))||0,N=window.scrollY+A.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,N+y.data.offsetTop-R-16)});return}if(y.data.type==="navigate"){const A=bt(y.data.url,be());if(!A)return;window.history.pushState(null,"",A),window.dispatchEvent(new Event(yt));const $=new URL(A,window.location.origin);$.hash?window.requestAnimationFrame(()=>{const R=decodeURIComponent($.hash.slice(1)),N=xt(`#${R}`);(N?vt(N):document.getElementById(R))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(y.data.type==="image-open"){const A=l.current;if(!A)return;const $=Array.from(A.contentDocument?.querySelectorAll("img")??[]),R=y.data.images.map(E=>({...E,element:typeof E.elementIndex=="number"?$[E.elementIndex]:void 0,src:br(E.src)??E.src,loadSource:M=>(M.addEventListener("abort",z,{once:!0}),Me(E.src,()=>M.aborted?null:"high").then(ne=>ne.objectUrl,()=>E.src).finally(()=>M.removeEventListener("abort",z)))})),N=E=>{const M=R[E];!M||typeof M.galleryId!="number"||!Number.isSafeInteger(M.galleryIndex)||A.contentWindow?.postMessage({frameId:d.current,galleryId:M.galleryId,galleryIndex:M.galleryIndex,source:k,type:"gallery-select"},"*")};h.current?.(R,y.data.imageIndex,A,N);return}if(y.data.type==="selection"){y.data.text&&window.getSelection()?.removeAllRanges(),s.current?.(y.data.text);return}b(Math.min(wr,Math.max(g,Math.ceil(y.data.height))))}}return window.addEventListener("message",Y),()=>{I=!1,P.clear(),window.removeEventListener("message",Y),z()}},[q,V,g,G,U]);const K=mr(l.current);return a.jsxs("div",{className:"thread-html-frame-container",children:[a.jsx("iframe",{ref:l,className:`thread-html-frame thread-html-frame-${i} ${e}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-downloads",scrolling:"no",src:V,onLoad:J,style:{"--thread-html-frame-width-allowance":`${Ke}px`,...x===null?{}:{"--thread-html-frame-height":`${x}px`}},title:i==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`},q),m?.token===q?m.players.map(I=>a.jsx("iframe",{className:"thread-embedded-player",src:dr(I.src,navigator.userAgent),title:new URL(I.src).hostname==="player.bilibili.com"?"哔哩哔哩播放器":"网易云音乐播放器",allow:"autoplay; fullscreen; picture-in-picture",allowFullScreen:!0,scrolling:"no",style:{left:I.left+K.left,top:I.top+K.top,width:I.width,height:I.height}},`${q}-${I.id}`)):null]})}function Er(e,r){const[t,o]=u.useState(e);return u.useEffect(()=>{const n=new AbortController,c=r?Ft(e):[];if(o(e),c.length===0)return()=>n.abort();const i=Array.from(new Map(c.map(l=>[`${l.bid}:${l.tid}:${l.pid}`,l])).values());return Promise.all(i.map(async l=>{try{const d=await ft(l,n.signal);return[`${l.bid}:${l.tid}:${l.pid}`,d]}catch(d){if(d instanceof DOMException&&d.name==="AbortError")throw d;return[`${l.bid}:${l.tid}:${l.pid}`,""]}})).then(l=>{if(n.signal.aborted)return;const d=new Map(l);let h=e;c.forEach(s=>{const g=d.get(`${s.bid}:${s.tid}:${s.pid}`);g&&(h=h.replace(s.marker,g))}),o(h)}).catch(()=>{}),()=>n.abort()},[r,e]),t}function kr({canOpenImages:e,frameId:r,fontSize:t,needsJquery:o,html:n,isActivitySignupCanceled:c,isDarkTheme:i,variant:l}){const d=l==="signature",h=d?"#999999":"rgb(63 63 70)",s=d?"#666666":"rgb(228 228 231)",g=d?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",f=d?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",x=c?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${i?"dark":"light"}" style="background:transparent;color-scheme:${i?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${Lr(be())}">
  <meta http-equiv="Content-Security-Policy" content="${Tr()}">
  <style>${Ar}</style>
  <style>
    html{--capubbs-frame-text-color:${h}}html.dark{--capubbs-frame-text-color:${s}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${g};font-size:${t}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${Ke}px);${f}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${Cr(r,e,o)}<\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${l}${x}">${n}</main></body>
</html>`}function Cr(e,r,t){return`(function(){
    var frameId=${JSON.stringify(e)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(wt)};
    var canOpenImages=${JSON.stringify(r)};
    var needsJquery=${JSON.stringify(t)};
    var preparePunishmentTableFit=${We.toString()};
    var getGalleryImageState=${It.toString()};
    var normalizeEmbeddedPlayerUrl=${he.toString()};
    var playerIds=new WeakMap();
    var nextPlayerId=0;
    var lastPlayerLayout='';
    var jquerySourceUrl=${JSON.stringify(Ye)};
    var forumAppExactPaths=${JSON.stringify(At)};
    var forumAppPathPrefixes=${JSON.stringify(St)};
    var legacyForumExactPaths=${JSON.stringify(Rt)};
    var legacyForumPathPatterns=${JSON.stringify(Et)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${Ir};
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
      window.parent.postMessage({source:'${k}',type:'resize',frameId:frameId,height:height},'*');
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
      window.parent.postMessage({source:'${k}',type:'embedded-player-layout',frameId:frameId,players:players},'*');
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
      window.parent.postMessage({source:'${k}',type:'selection',frameId:frameId,text:text},'*');
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
        window.parent.postMessage({source:'${k}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${k}',type:'navigate',frameId:frameId,url:url},'*');
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
      window.parent.postMessage({source:'${k}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
        var state=getGalleryImageState(image);
        var bounds=(state?state.gallery:image).getBoundingClientRect();
        var result={top:bounds.top,bottom:bounds.bottom,left:bounds.left,right:bounds.right};
        if(state)result.gallery=state.role;
        return result;
      });
    }
    function reportImageResourceLayout(requestId){
      var request=imageResourceRequests[requestId];
      if(!request)return;
      window.parent.postMessage({source:'${k}',type:'image-resource-layout',frameId:frameId,requestId:requestId,bounds:getImageResourceBounds(request.images)},'*');
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
          source:'${k}',
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
      if(event.source!==window.parent||!data||data.source!=='${k}'||data.frameId!==frameId)return;
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
      if(needsJquery)window.parent.postMessage({source:'${k}',type:'jquery-request',frameId:frameId},'*');
      else executeUserScripts();
      prepareImages();
      prepareGalleries();
      requestImageResources();
      syncGrayscaleTextColors(contentRoot);
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`}function jr(e){return e.replace(/<script\b([^>]*)>/gi,(r,t)=>`<script${t.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function Nr(e){if(!/<(?:img|iframe)\b/i.test(e))return e;const r=document.createElement("template");return r.innerHTML=e,r.content.querySelectorAll("iframe[src]").forEach(t=>{const o=he(t.getAttribute("src")??"",be());o&&(t.dataset.capubbsPlayerSrc=o,t.removeAttribute("src"))}),r.content.querySelectorAll("img[src]").forEach(t=>{const o=t.getAttribute("src")?.trim()??"";!o||/^(?:blob:|data:)/i.test(o)||(t.dataset.capubbsImageResourceSrc=o,t.setAttribute("fetchpriority","low"),t.removeAttribute("src"),t.removeAttribute("srcset"),t.closest("picture")?.querySelectorAll("source[srcset]").forEach(n=>{n.removeAttribute("srcset")}))}),r.innerHTML}function Oe(){return re||(re=fetch(Ye,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw new Error(`Failed to load jQuery: ${e.status}`);return e.text()}).catch(()=>null),re)}function Tr(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'","upgrade-insecure-requests"].join("; ")}function be(){return new URL("/bbs/content/",window.location.origin).href}function Lr(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function qr(e){return e.replace(/<\/style/gi,"<\\/style")}function $r(e){if(!e||typeof e!="object")return!1;const r=e;return r.source!==k||typeof r.frameId!="string"?!1:r.type==="embedded-player-layout"?Array.isArray(r.players)&&r.players.every(pr):r.type==="document-request"?typeof r.token=="string":r.type==="anchor"?typeof r.offsetTop=="number"&&Number.isFinite(r.offsetTop)&&r.offsetTop>=0:r.type==="navigate"?typeof r.url=="string":r.type==="jquery-request"?!0:r.type==="image-resource-request"||r.type==="image-resource-layout"?typeof r.requestId=="string"&&r.requestId.length>0&&Array.isArray(r.bounds)&&r.bounds.every(t=>t&&(t.gallery===void 0||["current","adjacent","deferred"].includes(t.gallery))&&["top","bottom","left","right"].every(o=>typeof t[o]=="number"&&Number.isFinite(t[o])))&&(r.type==="image-resource-layout"||"url"in r&&typeof r.url=="string"&&r.url.length>0):r.type==="selection"?typeof r.text=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(t=>!!t&&typeof t=="object"&&typeof t.alt=="string"&&typeof t.elementIndex=="number"&&Number.isSafeInteger(t.elementIndex)&&t.elementIndex>=0&&typeof t.src=="string"&&t.src.length>0&&(t.galleryId===void 0&&t.galleryIndex===void 0||typeof t.galleryId=="number"&&Number.isSafeInteger(t.galleryId)&&t.galleryId>=0&&typeof t.galleryIndex=="number"&&Number.isSafeInteger(t.galleryIndex)&&t.galleryIndex>=0)):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function Pr(){const[e,r]=u.useState(()=>document.documentElement.classList.contains("dark"));return u.useEffect(()=>{const t=document.documentElement,o=()=>r(t.classList.contains("dark")),n=new MutationObserver(o);return n.observe(t,{attributeFilter:["class"],attributes:!0}),()=>n.disconnect()},[]),e}function Mr({attachments:e=[],bodyClassName:r="thread-floor-body",bodyFallback:t=null,bodyHtml:o,floor:n,isActivitySignupCanceled:c=!1,onImageOpen:i,onIsolatedTextSelection:l,signatureClassName:d="thread-signature",signatureHtml:h,signatureText:s}){const g=i?(f,x,b,m)=>{const v=f[x];v&&i([v],0,b,m?()=>m(x):void 0)}:void 0;return a.jsxs(a.Fragment,{children:[o?a.jsx(Fe,{className:r,floor:n,html:o,isActivitySignupCanceled:c,onImageOpen:i,onIsolatedTextSelection:l,variant:"floor"}):t,a.jsx(Fr,{attachments:e}),h?a.jsx(Fe,{className:d,floor:n,html:h,onImageOpen:g,variant:"signature"}):s?a.jsx("footer",{className:d,children:a.jsx("p",{children:s})}):null]})}function Fr({attachments:e}){return e.length===0?null:a.jsxs("section",{"aria-label":"附件",className:"thread-attachments",children:[a.jsxs("header",{className:"thread-attachments-heading",children:[a.jsx(Gt,{"aria-hidden":"true",size:14}),a.jsx("span",{children:"附件"}),a.jsx("small",{children:e.length})]}),a.jsx("ul",{children:e.map(r=>{const t=a.jsxs(a.Fragment,{children:[a.jsx("span",{className:"thread-attachment-name",children:r.name}),a.jsx("small",{children:Or(r)}),r.exists!==!1&&a.jsx(kt,{"aria-hidden":"true",size:15})]});return a.jsx("li",{children:r.exists===!1?a.jsx("div",{"aria-disabled":"true",className:"thread-attachment-link is-unavailable",children:t}):a.jsx("a",{className:"thread-attachment-link",download:r.name,href:r.downloadHref||`/bbs/download/?id=${encodeURIComponent(r.id)}`,children:t})},r.id)})})]})}function Or(e){if(e.exists===!1)return"文件不可用";const r=[zr(e.size),(e.price??0)>0?"付费附件":"免费"];return e.downloadCount!==void 0&&r.push(`下载 ${e.downloadCount} 次`),r.join(" · ")}function zr(e){if(e<=0)return"大小未知";if(e<1024)return`${e} B`;const r=["KB","MB","GB","TB"];let t=e,o=-1;do t/=1024,o+=1;while(t>=1024&&o<r.length-1);return`${t.toFixed(t>=10?1:2)} ${r[o]}`}function Dr({author:e,id:r}){const t=e.tags??[],[o,n]=u.useState(!1),c=u.useRef(null),i=u.useRef(null),l=u.useRef(null),d=u.useRef(null),h=t.map(s=>`${s.id}:${s.name}`).join("|");return u.useLayoutEffect(()=>{if(t.length===0){n(!1);return}const s=()=>{const f=c.current,x=i.current,b=l.current,m=d.current;if(!f||!x||!b||!m||f.offsetWidth===0)return;const v=b.getBoundingClientRect().width,w=m.getBoundingClientRect().width,j=Number.parseFloat(getComputedStyle(x).columnGap)||0,S=x.clientWidth-v-j,T=w>S+1;n(L=>L===T?L:T)};s();const g=new ResizeObserver(s);return[c.current,i.current,d.current].forEach(f=>{f&&g.observe(f)}),()=>g.disconnect()},[h,t.length]),a.jsxs("div",{id:r,ref:c,className:"author-hover-card",role:"dialog","aria-label":`${e.name} 的用户摘要`,children:[a.jsxs("div",{className:"author-card-head",children:[a.jsx("img",{src:e.avatar,alt:""}),a.jsxs("div",{className:"author-card-head-copy",children:[a.jsxs("div",{ref:i,className:"author-card-name-line","data-tags-overflow":o?"true":void 0,children:[a.jsx("strong",{ref:l,children:e.name}),a.jsx("div",{className:"author-card-tag-slot",children:a.jsx(le,{size:"compact",tags:t})})]}),(e.stars>0||e.role)&&a.jsxs("span",{className:"author-card-status",children:["★".repeat(e.stars),e.stars>0&&e.role?" · ":"",e.role]})]})]}),o?a.jsx("div",{className:"author-card-tags-row",children:a.jsx(le,{size:"compact",tags:t})}):null,e.medals?.length?a.jsx("div",{className:"author-card-medals",children:a.jsx(Ge,{medals:e.medals,profileName:e.name,variant:"compact"})}):null,a.jsx("div",{ref:d,className:"author-card-tag-width-measure","aria-hidden":"true",children:a.jsx(le,{size:"compact",tags:t})}),a.jsxs("dl",{children:[a.jsxs("div",{children:[a.jsx("dt",{children:"主题"}),a.jsx("dd",{children:e.topics})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"回复"}),a.jsx("dd",{children:e.replies})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"签到"}),a.jsx("dd",{children:e.checkins})]})]}),a.jsxs("p",{children:["最近在线：",e.lastSeen]}),a.jsxs("a",{href:Z(e.name),children:["查看个人主页 ",a.jsx(Dt,{size:13})]})]})}function Hr({author:e}){const r=e.tags??[],t=Ue(r),o=Z(e.name);return a.jsxs("aside",{className:"thread-author-profile","aria-label":`${e.name} 的资料`,children:[a.jsx("a",{"aria-label":`查看${e.name}的个人主页`,className:"thread-author-profile-avatar",href:o,children:a.jsx("img",{src:e.avatar,alt:""})}),a.jsx("div",{className:"thread-author-profile-identity",children:a.jsx("a",{href:o,children:e.name})}),(e.stars>0||e.role)&&a.jsxs("div",{className:"thread-author-profile-status",children:[e.stars>0&&a.jsx("span",{"aria-label":`${e.stars} 星`,children:"★".repeat(e.stars)}),e.role&&a.jsx("strong",{children:e.role})]}),a.jsx(_e,{tags:t}),a.jsx(Ge,{medals:e.medals??[],profileName:e.name,variant:"compact"}),a.jsxs("dl",{className:"thread-author-profile-stats",children:[a.jsxs("div",{children:[a.jsx("dt",{children:"主题"}),a.jsx("dd",{children:e.topics})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"回复"}),a.jsx("dd",{children:e.replies})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"签到"}),a.jsx("dd",{children:e.checkins})]})]}),a.jsxs("p",{className:"thread-author-profile-last-seen",children:[a.jsx("span",{children:"最近在线"}),a.jsx("strong",{children:e.lastSeen})]})]})}function ge(e){return e.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function Ur(e){const r=window.getSelection()?.toString();r&&(e.preventDefault(),e.clipboardData.setData("text/plain",r))}function Gr({articleAfterContent:e,articleRef:r,author:t,avatarRail:o,className:n="",content:c,decorationImageSrc:i,editedAt:l,floor:d,floorIndex:h,id:s,inlineAvatar:g=!1,mainAfterContent:f,onCopy:x,publishedAt:b,showAuthorProfile:m}){const v=t.tags??[],w=Ue(v);return a.jsxs("article",{className:`thread-floor${m?" thread-floor-with-author-profile":""}${n?` ${n}`:""}`,"data-floor":d,id:s,onCopy:x,ref:r,children:[i&&a.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:a.jsx("img",{alt:"",src:i})}),m?a.jsx(Hr,{author:t}):!g&&o,a.jsxs("div",{className:"thread-floor-main",children:[a.jsxs("header",{className:"thread-floor-header",children:[!m&&g&&o,a.jsxs("div",{className:"thread-floor-author",children:[a.jsx("a",{href:Z(t.name),children:t.name}),a.jsx(_e,{tags:w})]}),a.jsxs("div",{className:"thread-floor-time",children:[a.jsx("time",{children:ge(b)}),l&&a.jsxs(a.Fragment,{children:[a.jsx("span",{children:"·"}),a.jsxs("time",{children:["编辑于 ",ge(l)]})]})]}),h]}),m?a.jsx("div",{className:"thread-floor-content",children:c}):c,f]}),e]})}function _r({canDelete:e,canEdit:r,canQuote:t,canReply:o,decorative:n=!1,deleting:c=!1,editHref:i="",onDelete:l,onQuote:d,onReply:h}){const s=n?-1:void 0,g=u.useRef(null);return a.jsxs("div",{"aria-hidden":n||void 0,className:`thread-floor-actions${n?" thread-floor-actions-decorative":""}`,children:[t&&a.jsxs("button",{onClick:f=>{const x=g.current?g.current.text:ze(f.currentTarget);g.current=null,d?.(x)},onPointerDown:f=>{f.button===0&&(g.current={text:ze(f.currentTarget)})},tabIndex:s,type:"button",children:[a.jsx(Tt,{size:15}),"引用"]}),o&&a.jsxs("button",{onClick:h,tabIndex:s,type:"button",children:[a.jsx(Bt,{size:15}),"回复"]}),r&&(n?a.jsxs("button",{tabIndex:-1,type:"button",children:[a.jsx(Le,{size:15}),"编辑"]}):a.jsxs("a",{href:i,children:[a.jsx(Le,{size:15}),"编辑"]})),e&&a.jsxs("button",{"aria-busy":c||void 0,className:"floor-action-danger",disabled:!n&&c,onClick:n?void 0:f=>l?.(f.currentTarget),tabIndex:s,type:"button",children:[a.jsx(fe,{size:15}),c?"删除中":"删除"]})]})}function aa({canQuote:e,canReply:r,decorationImageSrc:t,editHref:o,floor:n,isActivityThread:c,isMainPost:i,inlineAvatar:l,showAuthorProfile:d,hideSignature:h,onDeleteFloor:s,onDeleteNestedReply:g,onIsolatedTextSelection:f,onQuote:x,onSubmitNestedReply:b,viewer:m}){const[v,w]=u.useState(!1),[j,S]=u.useState(null),[T,L]=u.useState([]),[D,H]=u.useState(""),[q,V]=u.useState(!1),[G,_]=u.useState([]),[U,J]=u.useState(""),[K,I]=u.useState(""),[P,Y]=u.useState(null),[y,F]=u.useState(""),[A,$]=u.useState(!1),[R,N]=u.useState(void 0),E=Yt(U),M=Vt(),ne=Ct(":scope > article"),ye=`nested-reply-count-${n.id}`,[Q,xe]=u.useState(null),[te,ve]=u.useState(!1),we=u.useRef(null),X=u.useRef(null),oe=u.useRef(null),Ie=u.useRef(null),Ae=u.useRef(null),Se=u.useMemo(()=>[...n.nestedReplies??[],...G].filter(p=>!T.includes(p.id)),[T,n.nestedReplies,G]),Re=c&&!i&&/<\s*(?:s|strike)\b/i.test(n.contentHtml??""),Ee=`thread-floor-body${Re?" capubbs-activity-signup-canceled":""}`;u.useEffect(()=>()=>{X.current!==null&&window.clearTimeout(X.current)},[]),u.useEffect(()=>{if(!te)return;function p(C){we.current?.contains(C.target)||ve(!1)}return document.addEventListener("pointerdown",p),()=>document.removeEventListener("pointerdown",p)},[te]);async function Qe(){const p=`${window.location.origin}${window.location.pathname}${window.location.search}#${n.floor}`;await Jt(p)&&(w(!0),X.current!==null&&window.clearTimeout(X.current),X.current=window.setTimeout(()=>w(!1),1800))}const ke=(p,C,O,ie)=>{Ae.current=O,xe({imageIndex:C,images:p,onImageChange:ie})};function Xe(p){Q?.onImageChange?.(p),xe(null),window.requestAnimationFrame(()=>Ae.current?.focus())}function Ce(p=null){N(p),J(""),I(""),F(""),window.requestAnimationFrame(()=>Ie.current?.focus())}function je(){N(void 0),J(""),F("")}async function Ze(p){p.preventDefault();const C=U.trim();if(!(!E.canSubmit||!m||!r||A)){$(!0),F("");try{const O=await b(n,R??null,C);_(ie=>[...ie,{author:m,canDelete:!0,content:C,id:O>0?String(O):`local-${n.id}-${Date.now()}`,publishedAt:Vr(new Date),target:R??void 0}]),je()}catch(O){F(O instanceof Error?O.message:"楼中楼回复发布失败，请稍后重试。")}finally{$(!1)}}}async function et(p){Y(p.id),I("");try{await g(n,p),L(C=>[...C,p.id]),_(C=>C.filter(O=>O.id!==p.id)),S(null)}catch(C){I(C instanceof Error?C.message:"楼中楼删除失败，请稍后重试。")}finally{Y(null)}}async function tt(){if(!q){V(!0),H("");try{await s(n)}catch(p){H(p instanceof Error?p.message:"楼层删除失败，请稍后重试。"),V(!1)}}}function rt(){S(null),H(""),I(""),window.requestAnimationFrame(()=>oe.current?.focus())}function at(){if(!j)return;const p=j;S(null),p.kind==="floor"?tt():et(p.reply)}const nt=a.jsxs("div",{className:`thread-avatar-rail${te?" thread-avatar-rail-open":""}`,ref:we,children:[a.jsx("button",{"aria-controls":`author-card-${n.floor}`,"aria-expanded":te,"aria-label":`查看${n.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>ve(p=>!p),type:"button",children:a.jsx("img",{src:n.author.avatar,alt:""})}),a.jsx(Dr,{author:n.author,id:`author-card-${n.floor}`})]}),ot=a.jsx(Mr,{attachments:n.attachments,bodyFallback:a.jsx("div",{className:Ee,children:n.paragraphs.map(p=>a.jsx("p",{children:p},p))}),bodyClassName:Ee,bodyHtml:n.contentHtml,floor:n.floor,isActivitySignupCanceled:Re,onImageOpen:ke,onIsolatedTextSelection:p=>f(n,p),signatureHtml:h?void 0:n.signatureHtml,signatureText:h?void 0:n.signature}),it=a.jsxs("button",{"aria-label":`复制第 ${n.floor} 楼链接`,className:"thread-floor-index",onClick:Qe,title:"复制楼层链接",type:"button",children:["#",n.floor]}),st=a.jsxs(a.Fragment,{children:[a.jsx(_r,{canDelete:(!c||i)&&(n.canDelete??n.isOwn??!1),canEdit:(!c||i)&&!!n.isOwn,canQuote:e,canReply:r,deleting:q,editHref:o,onDelete:p=>{oe.current=p,H(""),S({kind:"floor"})},onQuote:p=>x(n,p),onReply:()=>Ce()}),D&&a.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:D}),Se.length>0&&a.jsx("section",{className:"nested-replies",ref:ne,"aria-label":`${n.floor} 楼的楼中楼回复`,children:Se.map(p=>a.jsxs("article",{children:[a.jsx("img",{src:p.author.avatar,alt:""}),a.jsxs("div",{className:"nested-reply-main",children:[a.jsxs("div",{className:"nested-reply-identity",children:[a.jsx("a",{className:"nested-reply-author",href:Z(p.author.name),children:p.author.name}),p.target&&a.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",a.jsx("a",{className:"nested-reply-author",href:Z(p.target),children:p.target})]})]}),p.contentHtml?a.jsx(Ve,{className:"nested-reply-content",html:p.contentHtml,onImageOpen:ke,variant:"nested"}):a.jsx("p",{children:p.content}),a.jsxs("footer",{className:"nested-reply-footer",children:[a.jsx("time",{children:ge(p.publishedAt)}),r&&a.jsx("button",{onClick:()=>Ce(p.author.name),type:"button",children:"回复"}),p.canDelete&&a.jsxs("button",{className:"nested-reply-delete",disabled:P===p.id,onClick:C=>{oe.current=C.currentTarget,I(""),S({kind:"nested",reply:p})},type:"button",children:[a.jsx(fe,{size:12}),P===p.id?"删除中":"删除"]})]})]})]},p.id))}),K&&a.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:K}),R!==void 0&&r&&a.jsxs("form",{className:"nested-reply-composer",onSubmit:Ze,children:[a.jsxs("div",{className:"nested-reply-input-field",children:[a.jsx("textarea",{"aria-describedby":ye,"aria-invalid":E.isOverLimit||void 0,"aria-label":R?`回复 @${R}`:`回复第 ${n.floor} 楼`,onChange:p=>{J(p.target.value),F("")},placeholder:R?`回复 @${R}`:"写一条楼中楼回复",ref:Ie,rows:2,value:U}),a.jsxs("small",{"aria-label":`已输入 ${E.length} 字，最多 ${E.limit} 字`,className:`nested-reply-character-count${E.isOverLimit?" nested-reply-character-count-error":""}`,id:ye,children:[E.length," / ",E.limit]})]}),a.jsxs("div",{className:"nested-reply-composer-actions",children:[a.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:A,onClick:je,type:"button",children:a.jsx(He,{size:15})}),a.jsxs("button",{className:"nested-reply-submit",disabled:!E.canSubmit||A,type:"submit",children:[a.jsx(jt,{size:14}),A?"发送中":"发送"]})]}),y&&a.jsx("p",{className:"nested-reply-error",role:"alert",children:y})]})]}),lt=a.jsxs(a.Fragment,{children:[v&&a.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[a.jsx(Nt,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),a.jsx(Ne,{children:Q&&a.jsx(Ot,{images:Q.images,initialImageIndex:Q.imageIndex,onImageChange:Q.onImageChange,onClose:Xe})}),a.jsx(Ne,{mobileSize:"compact",children:j&&a.jsx(Br,{floor:n,isMainPost:i,onCancel:rt,onConfirm:at,target:j})})]});return a.jsx(Gr,{articleAfterContent:lt,articleRef:M,author:n.author,avatarRail:nt,content:ot,decorationImageSrc:t,editedAt:n.editedAt,floor:n.floor,floorIndex:it,id:String(n.floor),inlineAvatar:l,mainAfterContent:st,onCopy:Ur,publishedAt:n.publishedAt,showAuthorProfile:d})}function ze(e){const r=e.closest(".thread-floor")?.querySelector(".thread-floor-body");return qt(window.getSelection(),r??null)}function Br({floor:e,isMainPost:r,onCancel:t,onConfirm:o,target:n}){const c=n.kind==="nested"?n.reply:null,i=c?"删除楼中楼回复":r?"删除主楼":"删除回复",l=c?"":r?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",d=c?.author.name??e.author.name,h=c?`#${e.floor} · 楼中楼`:`#${e.floor}`,s=Wr(c?.content||e.quoteText||e.paragraphs[0]||"");return u.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),u.useEffect(()=>{function g(f){f.key==="Escape"&&t()}return document.addEventListener("keydown",g),()=>document.removeEventListener("keydown",g)},[t]),a.jsx(Lt,{className:"thread-delete-dialog-backdrop",onMouseDown:g=>{g.currentTarget===g.target&&t()},role:"presentation",children:a.jsxs("section",{"aria-describedby":l?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[a.jsxs("header",{children:[a.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:a.jsx(Ht,{size:19})}),a.jsx("div",{children:a.jsx("h2",{id:"thread-delete-dialog-title",children:i})}),a.jsx("button",{"aria-label":"关闭删除确认",onClick:t,type:"button",children:a.jsx(He,{size:18})})]}),a.jsxs("div",{className:"thread-delete-dialog-body",children:[l&&a.jsx("p",{id:"thread-delete-dialog-description",children:l}),a.jsxs("div",{className:"thread-delete-dialog-target",children:[a.jsxs("span",{children:[d," · ",h]}),a.jsx("p",{children:s||"此回复没有可预览的文字内容。"})]})]}),a.jsxs("footer",{children:[a.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:t,type:"button",children:"取消"}),a.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:o,type:"button",children:[a.jsx(fe,{size:15}),"确认删除"]})]})]})})}function Wr(e){const r=e.replace(/\s+/g," ").trim();return r.length>100?`${r.slice(0,100).trimEnd()}…`:r}function Vr(e){const r=t=>String(t).padStart(2,"0");return`${e.getFullYear()}-${r(e.getMonth()+1)}-${r(e.getDate())} ${r(e.getHours())}:${r(e.getMinutes())}:${r(e.getSeconds())}`}export{Gt as P,Mr as T,Gr as a,_r as b,aa as c,ra as f,Jt as w};
