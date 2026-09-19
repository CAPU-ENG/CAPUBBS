import{z as De,r as u,ac as ct,bX as ut,bY as dt,j as a,bZ as mt,b_ as pt,b$ as gt,c0 as ft,c1 as ht,b4 as bt,aY as yt,at as xt,a_ as vt,c2 as wt,c3 as It,c4 as At,c5 as St,c6 as kt,c7 as Rt,ai as Et,u as Ct,a1 as Z,n as he,a8 as He,J as jt,ak as Nt,K as Te,c8 as Ue,bT as Tt,aG as ie,ad as Lt,c9 as qt}from"./index-sD1GTEQq.js";import{e as $t,d as Le,m as le,s as Pt,r as Mt,f as Ft,T as zt,a as Ge,P as _e}from"./RichTextEditor.gallery-BYE243u8.js";import{f as Ot}from"./dataDisplay-xKgC1eSa.js";import{P as ce}from"./pencil-eniMPGOb.js";import{E as Dt}from"./external-link-DxhMpNhz.js";import{T as Ht}from"./triangle-alert-BsM7btqs.js";const Ut=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],Gt=De("paperclip",Ut);const _t=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],Bt=De("reply",_t);async function Wt(e){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),!0}catch{}const t=document.createElement("textarea");t.value=e,t.setAttribute("readonly",""),t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.select();try{return document.execCommand("copy")}finally{t.remove()}}const Vt=400;function Xr(e,t){return t?`回复 @${t}：${e}`:e}function Jt(e){const t=Array.from(e).length,r=Vt,o=t>r;return{canSubmit:!!e.trim()&&!o,isOverLimit:o,length:t,limit:r}}const Kt={black:0,darkgray:169,darkgrey:169,dimgray:105,dimgrey:105,gainsboro:220,gray:128,grey:128,lightgray:211,lightgrey:211,silver:192,white:255,whitesmoke:245},ue="data-capubbs-original-grayscale-color-attr",de="data-capubbs-original-grayscale-style-color";function Yt(e){const t=String(e??"").trim().toLowerCase().replace(/^['"]|['"]$/g,""),r=t.replace(/\s+/g,""),o=Kt[r];if(typeof o=="number")return{alpha:1,channel:o};const n=r.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);if(n){const i=n[1].length<=4?n[1].split("").map(m=>`${m}${m}`).join(""):n[1],g=Number.parseInt(i.slice(0,2),16),h=Number.parseInt(i.slice(2,4),16),y=Number.parseInt(i.slice(4,6),16),f=i.length===8?Number.parseInt(i.slice(6,8),16)/255:1;return g===h&&h===y?{alpha:f,channel:g}:null}const c=t.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*(?:,|\/)\s*([01](?:\.\d+)?|\.\d+|100%|\d{1,3}(?:\.\d+)?%))?\s*\)$/);if(!c)return null;const s=me(c[1]),l=me(c[2]),d=me(c[3]),b=er(c[4]);return s===null||l===null||d===null||b===null?null:s===l&&l===d?{alpha:b,channel:s}:null}function Be(e,t=!0){const r=Yt(e);if(!r)return null;const o=255-r.channel;if(t&&r.alpha<1)return`rgba(${o}, ${o}, ${o}, ${tr(r.alpha)})`;const n=o.toString(16).padStart(2,"0");return`#${n}${n}${n}`}function Qt(e,t){[...e.matches("[color], [style]")?[e]:[],...Array.from(e.querySelectorAll("[color], [style]"))].forEach(o=>{Xt(o,t),o instanceof HTMLElement&&Zt(o,t)})}function Xt(e,t){const r=e.getAttribute(ue);if(t==="light"){if(r===null)return;e.setAttribute("color",r),e.removeAttribute(ue);return}const o=r??e.getAttribute("color"),n=Be(o,!1);!n||o===null||(r===null&&e.setAttribute(ue,o),e.getAttribute("color")!==n&&e.setAttribute("color",n))}function Zt(e,t){const r=e.getAttribute(de);if(t==="light"){if(r===null)return;e.style.setProperty("color",r,e.style.getPropertyPriority("color")),e.removeAttribute(de);return}const o=r??e.style.getPropertyValue("color"),n=Be(o);!n||!o||(r===null&&e.setAttribute(de,o),e.style.getPropertyValue("color")!==n&&e.style.setProperty("color",n,e.style.getPropertyPriority("color")))}function me(e){const t=e.endsWith("%"),r=Number(t?e.slice(0,-1):e);return Number.isFinite(r)?t?r>=0&&r<=100?Math.round(r*2.55):null:r>=0&&r<=255?Math.round(r):null:null}function er(e){if(e===void 0)return 1;const t=e.endsWith("%"),r=Number(t?e.slice(0,-1):e);return Number.isFinite(r)?t?r>=0&&r<=100?r/100:null:r>=0&&r<=1?r:null:null}function tr(e){return Number(e.toFixed(3))}function rr(e){const t=[];return e.querySelectorAll("table").forEach(r=>{if(r.classList.contains("forum-punishment-table")||r.parentElement?.closest("table")||r.querySelector("table")||r.rows.length<2||!Array.from(r.rows).some(i=>i.cells.length>1))return;let o=r.parentElement;if(!o?.classList.contains("forum-table-scroll")){o=r.ownerDocument.createElement("div"),o.className="forum-table-scroll",o.tabIndex=0,r.before(o),o.append(r),r.classList.add("forum-data-table");let i=[],g=null;Array.from(r.rows).forEach((h,y)=>{g!==h.parentElement&&(g=h.parentElement,i=[]);let f=0;Array.from(h.cells).forEach(m=>{for(;(i[f]??0)>0;)f+=1;f===0&&m.colSpan===1&&m.classList.add("forum-table-first-column"),y===0&&!r.tHead&&m.classList.add("forum-table-heading");const v=m.rowSpan===0?r.rows.length:m.rowSpan;for(let P=0;P<m.colSpan;P+=1)i[f+P]=v;f+=m.colSpan;const I=r.ownerDocument.createElement("div");for(I.className="forum-table-cell-content";m.firstChild;)I.append(m.firstChild);m.append(I)}),i=i.map(m=>Math.max(0,m-1))})}const n=o;let c=n.parentElement;c?.classList.contains("forum-table-viewport")||(c=r.ownerDocument.createElement("div"),c.className="forum-table-viewport",n.before(c),c.append(n));const s=c,l=()=>{n.classList.toggle("forum-table-scrolled",n.scrollLeft>0),s.classList.toggle("forum-table-more-right",n.scrollWidth-n.clientWidth-n.scrollLeft>1)};l(),n.addEventListener("scroll",l,{passive:!0});const d=r.ownerDocument.defaultView,b=d?.ResizeObserver?new d.ResizeObserver(l):null;b?.observe(n),b?.observe(r),d?.addEventListener("resize",l),t.push(()=>{n.removeEventListener("scroll",l),b?.disconnect(),d?.removeEventListener("resize",l)})}),()=>t.forEach(r=>r())}function We(e){const t=e.ownerDocument.defaultView;if(!t)return()=>{};const r=[];return e.querySelectorAll(".forum-punishment-table").forEach(o=>{const n=o.parentElement;if(!n?.classList.contains("forum-punishment-scroll"))return;let c=!1;function s(){if(c||!n)return;const d=n.clientWidth,b=Math.max(o.offsetWidth,o.scrollWidth);if(d<=0||b<=0)return;const i=Math.min(1,d/b),g=`scale(${i})`,h=`${Math.ceil(o.offsetHeight*i)}px`;o.style.transform!==g&&(o.style.transform=g),n.style.height!==h&&(n.style.height=h)}const l=t.ResizeObserver?new t.ResizeObserver(s):null;l?.observe(n),l?.observe(o),t.addEventListener("resize",s),e.ownerDocument.fonts?.ready.then(s),s(),r.push(()=>{c=!0,l?.disconnect(),t.removeEventListener("resize",s)})}),()=>r.forEach(o=>o())}function Ve({className:e="",html:t,onImageOpen:r,variant:o}){const n=u.useRef(null),{theme:c}=ct(),s=u.useMemo(()=>({__html:ut(t)}),[t]);if(u.useLayoutEffect(()=>{const i=n.current;if(i&&o!=="signature")return rr(i)},[t,o]),u.useLayoutEffect(()=>{const i=n.current;if(i&&o!=="signature")return We(i)},[t,o]),u.useLayoutEffect(()=>{const i=n.current;i&&($t(i),Qt(i,c))},[t,c]),u.useLayoutEffect(()=>{const i=n.current;if(i)return dt(i)},[t]),u.useEffect(()=>{const i=n.current;if(!i)return;const g=Array.from(i.querySelectorAll("img")),h=f=>{f.dataset.capubbsImageLoaded="true"},y=g.map(f=>{if(f.complete&&f.getAttribute("src"))return h(f),null;const m=()=>h(f);return f.addEventListener("load",m,{once:!0}),f.addEventListener("error",m,{once:!0}),{handleLoad:m,image:f}});return()=>{y.forEach(f=>{f&&(f.image.removeEventListener("load",f.handleLoad),f.image.removeEventListener("error",f.handleLoad))})}},[t]),!t)return null;function l(i,g){if(!r||!(i instanceof Element))return;const h=i.closest("img");if(!(h instanceof HTMLImageElement))return;const y=h.closest(".capubbs-gallery"),f=y?Array.from(y.querySelectorAll('[data-capubbs-gallery-slide="true"] img')):Array.from(g.querySelectorAll("img")).filter(A=>!A.closest(".capubbs-gallery")),m=f.indexOf(h);if(m<0)return;const v=f.map(A=>ar(A,g)),I=f.map((A,E)=>{const L=v[E];return{alt:A.alt.trim(),element:A,src:A.currentSrc||A.getAttribute("src")||A.dataset.capubbsGallerySrc||"",...L?{galleryId:L.galleryId,galleryIndex:L.galleryIndex}:{}}});r(I,m,h,A=>{const E=v[A];E&&Pt(E.gallery,E.galleryIndex)})}function d(i){const g=Le(i.target);if(g&&i.target instanceof Element){i.preventDefault(),i.stopPropagation(),le(i.target,g);return}!r||!(i.target instanceof HTMLImageElement)||(i.preventDefault(),l(i.target,i.currentTarget))}function b(i){const g=Le(i.target);if(g&&["Enter"," "].includes(i.key)&&i.target instanceof Element){i.preventDefault(),le(i.target,g);return}if(["ArrowLeft","ArrowRight"].includes(i.key)&&i.target instanceof Element&&i.target.closest(".capubbs-gallery")){i.preventDefault(),le(i.target,i.key==="ArrowLeft"?"prev":"next");return}!r||!(i.target instanceof HTMLImageElement)||!["Enter"," "].includes(i.key)||(i.preventDefault(),l(i.target,i.currentTarget))}return a.jsx("div",{ref:n,className:`forum-markup forum-markup-${o} ${e}`.trim(),"data-forum-markup":o,dangerouslySetInnerHTML:s,onClick:d,onKeyDown:b})}function ar(e,t){const r=e.closest(".capubbs-gallery");if(!r||!t.contains(r))return null;const n=Array.from(t.querySelectorAll(".capubbs-gallery")).indexOf(r),s=Array.from(r.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(e);return n>=0&&s>=0?{gallery:r,galleryId:n,galleryIndex:s}:null}function nr(e){if(!/<punishment_record\b/i.test(e))return null;const t=document.createElement("template");t.innerHTML=e;const r=Array.from(t.content.querySelectorAll("punishment_record")).filter(n=>!n.closest("pre, code, textarea"));if(r.length===0)return null;const o=r.map(n=>{const c=n.getAttribute("year")?.trim()??"",s=/^\d{4}$/.test(c)&&Number(c)>1?Number(c):null,l=document.createElement("div");return n.replaceWith(l,...Array.from(n.childNodes)),{placeholder:l,year:s}});return{needsRecords:o.some(({year:n})=>n!==null),render(n,c){return o.forEach(({placeholder:s,year:l})=>{if(l===null||c){s.textContent=l===null?"罚跑记录学年无效":c;return}const d=document.createElement("table"),b=`${l-1}-${l} 学年罚跑记录`;d.className="forum-punishment-table",d.setAttribute("aria-label",b);const i=document.createElement("div");i.className="forum-punishment-title",i.setAttribute("role","heading"),i.setAttribute("aria-level","2"),i.textContent=b;const g=d.createTHead().insertRow();["姓名","ID","原因","长度","职务加罚","开始时间","结束时间","完成情况"].forEach(m=>{const v=document.createElement("th");v.scope="col",v.textContent=m,g.append(v)});const h=d.createTBody(),y=n.filter(m=>{const v=m.startDate.match(/^(\d{4})-(\d{1,2})-/);if(!v)return!1;const I=Number(v[2]);return I>=1&&I<=12&&Number(v[1])+(I>=9?1:0)===l});if(y.forEach(m=>{const v=h.insertRow(),I=m.distance?/公里|km/i.test(m.distance)?m.distance:`${m.distance} km`:"—";[m.name||"—",m.username||"—",m.reason||"—",I,m.addition?"是":"否",qe(m.startDate),qe(m.endDate),m.isComplete?"已完成":"进行中"].forEach(P=>{v.insertCell().textContent=P})}),y.length===0){const m=h.insertRow().insertCell();m.colSpan=8,m.className="forum-punishment-empty",m.textContent="暂无罚跑记录"}const f=document.createElement("div");f.className="forum-punishment-scroll",f.append(d),s.className="forum-punishment-record",s.replaceChildren(i,f)}),t.innerHTML}}}function qe(e){return!e||e==="0000-00-00"?"—":e.replaceAll("-",".")}function or(e,t){const r=u.useMemo(()=>t?nr(e):null,[t,e]),[o,n]=u.useState(null);return u.useEffect(()=>{if(!r||!r.needsRecords)return;const c=new AbortController;return Ot("punishments",c.signal).then(({punishmentRecords:s})=>{c.signal.aborted||n({prepared:r,html:r.render(s)})}).catch(s=>{c.signal.aborted||n({prepared:r,html:r.render([],s instanceof Error?s.message:"罚跑记录加载失败")})}),()=>c.abort()},[r]),r?r.needsRecords?o?.prepared===r?o.html:"":r.render([]):e}const sr='.forum-markup .forum-punishment-table{display:table;width:-moz-max-content;width:max-content;min-width:100%;max-width:none;border-collapse:separate;border-spacing:0;transform-origin:top left}.forum-markup .forum-punishment-table :is(th,td){border:0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:9px;background:var(--surface);color:var(--text-muted);font:inherit;text-align:center;white-space:nowrap}.forum-markup .forum-punishment-table tbody tr:hover>td{background:var(--brand-faint, color-mix(in srgb, var(--brand) 8%, var(--surface)))}.forum-markup .forum-punishment-table tr>:last-child{border-right:0}.forum-markup .forum-punishment-table tbody tr:last-child>td{border-bottom:0}.forum-markup .forum-punishment-table th{background:var(--surface-soft);color:var(--text-faint);font-weight:780}.forum-markup .forum-punishment-record{box-sizing:border-box;min-width:0;max-width:100%;border:1px solid var(--line)}.forum-markup .forum-punishment-scroll{max-width:100%;overflow:hidden}.forum-markup .forum-punishment-title{padding:12px 14px;border-bottom:1px solid var(--line);background:var(--surface-soft);color:var(--text-strong);font-family:inherit;font-size:var(--ui-font-size-lg, 14px);font-weight:760;line-height:1.5;text-align:center}.forum-markup .forum-punishment-table .forum-punishment-empty{text-align:center}.forum-markup .forum-punishment-empty>.forum-table-cell-content{width:auto;max-width:none}:root{--surface: #fffefa;--surface-raised: #ffffff;--surface-soft: #f6f8f4;--text: #20231f;--text-strong: #111411;--text-muted: #687068;--text-faint: #919991;--line: #e1e6df;--line-strong: #cdd5cc;--brand: #236b4c;--brand-strong: #174f38;--danger: #b8473f}:root.dark{--surface: #171d19;--surface-raised: #1c241f;--surface-soft: #1f2822;--text: #dde5de;--text-strong: #f6faf6;--text-muted: #a0aca2;--text-faint: #748078;--line: #2c362f;--line-strong: #3c493f;--brand: #69b98d;--brand-strong: #8bcca6;--danger: #ef8178}::-moz-selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}::selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentcolor}blockquote,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}a{color:inherit;text-decoration:inherit}button{margin:0;padding:0;background-color:transparent;color:inherit;font:inherit;letter-spacing:inherit;text-transform:none}button:where(:not([style]):not([class])){min-height:32px;border:1px solid var(--line);border-radius:.5px;padding:4px 12px;background-color:var(--surface);color:var(--text-muted);font-size:14px;font-weight:680;line-height:1.5;vertical-align:middle;cursor:pointer;transition:background-color .14s ease,border-color .14s ease,color .14s ease}button:where(:not([style]):not([class]):hover:not(:disabled)){border-color:var(--line-strong);background-color:var(--surface-soft);color:var(--brand-strong)}button:where(:not([style]):not([class]):focus-visible){outline:2px solid var(--brand);outline-offset:2px}button:where(:not([style]):not([class]):disabled){cursor:not-allowed;opacity:.5}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}.capubbs-html-frame-root iframe{background-color:transparent!important}img,video{max-width:100%;height:auto}table{border-color:inherit;border-collapse:collapse;text-indent:0}.capubbs-activity-signup-canceled,.capubbs-activity-signup-canceled *{color:var(--danger)!important;text-decoration-color:var(--danger)!important;text-decoration-line:line-through!important;text-decoration-thickness:2px!important}.forum-markup>:first-child{margin-top:0}.forum-markup>:last-child{margin-bottom:0}.forum-markup p,.forum-markup div{margin:0}.forum-markup-floor p{margin:0 0 .75em}.forum-markup-floor>div+div{margin-top:.55em}.forum-markup a{color:var(--brand-strong);font-weight:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.16em}.forum-markup .forum-mention{text-decoration:none}.forum-markup blockquote{margin:0 0 0 2em;border:0;padding:0;background:transparent;color:inherit}.forum-markup blockquote.forum-quote,.forum-markup .forum-legacy-quote,.forum-markup blockquote.capubbs-floor-quote{margin:.8em 0;border-left:3px solid color-mix(in srgb,var(--brand) 38%,var(--line));padding:.55em .75em;background:var(--surface-soft);color:var(--text-muted)}.forum-markup .capubbs-floor-quote-jump{margin-left:.75em}.forum-markup .forum-legacy-quote-content{margin:0}.forum-markup h1,.forum-markup h2,.forum-markup h3,.forum-markup h4,.forum-markup h5,.forum-markup h6{margin:.9rem 0 .45rem;color:var(--brand-strong);font-weight:800;line-height:1.35}.forum-markup h1{font-size:1.45rem}.forum-markup h2{font-size:1.25rem}.forum-markup h3{font-size:1.1rem}.forum-markup h4,.forum-markup h5,.forum-markup h6{font-size:1em}.forum-markup ul,.forum-markup ol{margin:.65em 0;padding-left:1.45em}.forum-markup ul{list-style:disc}.forum-markup ol{list-style:decimal}.forum-markup ol.capubbs-ordered-list-alpha{list-style-type:lower-alpha}.forum-markup ol.capubbs-ordered-list-roman{list-style-type:lower-roman}.forum-markup pre{max-width:100%;overflow-x:auto;margin:.75em 0;border-radius:2px;padding:.75em;background:#182531;color:#f8fafc;white-space:pre-wrap}.forum-markup code,.forum-markup kbd{border-radius:2px;padding:.08em .25em;background:color-mix(in srgb,var(--surface-soft) 75%,var(--line));font-family:SFMono-Regular,Cascadia Code,Consolas,monospace;font-size:.9em}.forum-markup pre code{padding:0;background:transparent;color:inherit}.forum-markup font[size="1"]{font-size:11px}.forum-markup font[size="2"]{font-size:13px}.forum-markup font[size="3"]{font-size:15px}.forum-markup font[size="4"]{font-size:17px}.forum-markup font[size="5"]{font-size:19px}.forum-markup font[size="6"]{font-size:21px}.forum-markup font[size="7"]{font-size:23px}.forum-markup hr{margin:.9em 0;border:0;border-top:1px solid var(--line-strong)}.forum-markup img{display:inline-block;height:auto;max-width:100%;vertical-align:middle}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){color:transparent;font-size:0}.forum-markup .capubbs-gallery-slide img:not([data-capubbs-image-loaded=true]){opacity:0}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]),.forum-markup .capubbs-gallery-slide:has(img:not([data-capubbs-image-loaded=true])){background-color:color-mix(in srgb,var(--surface-soft) 82%,var(--line));background-image:linear-gradient(105deg,transparent 20%,color-mix(in srgb,var(--surface-raised) 70%,transparent) 45%,transparent 70%);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}.forum-markup img[role=button]{cursor:zoom-in}.forum-markup img[role=button]:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse}.forum-markup td,.forum-markup th{border:1px solid var(--line);padding:.35em .5em}.forum-markup-signature{color:#999;font-family:monospace;font-size:14px;line-height:1.6;overflow-wrap:anywhere}:root.dark .forum-markup-signature{color:#666}.forum-markup .capubbs-gallery{position:relative;display:block;width:100%;margin:.9rem 0;overflow:hidden;border:1px solid var(--line);border-radius:2px;background:transparent;color:var(--text)}.forum-markup .capubbs-gallery:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup .capubbs-gallery-header{position:relative;display:flex;min-height:44px;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:9px 12px;border-bottom:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-title{width:100%;min-width:0;margin:0;color:var(--text-strong);font-size:.82rem;font-weight:760;line-height:1.4;text-align:center}.forum-markup .capubbs-gallery-stage{position:relative;display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide{display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-slide>img{display:block;width:100%;height:var(--capubbs-gallery-image-height, clamp(280px, 52vw, 560px));max-width:none;margin:0 auto;border-radius:0;-o-object-fit:contain;object-fit:contain}.forum-markup .capubbs-gallery-caption{display:block;margin:0;color:var(--text-muted);font-size:.78rem;line-height:1.55;text-align:center}.forum-markup .capubbs-gallery-caption[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-footer{position:relative;display:flex;min-height:44px;align-items:center;justify-content:center;margin:0;padding:9px 12px;border-top:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-captions{width:100%;min-width:0;margin:0;padding-inline:48px;text-align:center}.forum-markup .capubbs-gallery-count{position:absolute;top:50%;right:12px;color:var(--text-faint);font-size:.72rem;font-variant-numeric:tabular-nums;font-weight:760;line-height:1.25;transform:translateY(-50%)}.forum-markup .capubbs-gallery-count[data-capubbs-gallery-current]:before{content:attr(data-capubbs-gallery-current) "/" attr(data-capubbs-gallery-total)}.forum-markup .capubbs-gallery-nav{position:absolute;z-index:4;top:50%;display:grid;width:36px;height:48px;place-items:center;padding:0;transform:translateY(-50%);border:1px solid rgb(255 255 255 / .25);border-radius:2px;background:#00000080;color:#fff;cursor:pointer;transition:.15s ease}.forum-markup .capubbs-gallery-nav:hover{background:#000000b8}.forum-markup .capubbs-gallery-nav:focus-visible{outline:2px solid #fff;outline-offset:2px}.forum-markup .capubbs-gallery-nav:before{font-family:Arial,sans-serif;font-size:2rem;font-weight:300;line-height:1}.forum-markup .capubbs-gallery-nav-prev:before{content:"‹"}.forum-markup .capubbs-gallery-nav-next:before{content:"›"}.forum-markup .capubbs-gallery-nav-prev{left:10px}.forum-markup .capubbs-gallery-nav-next{right:10px}@keyframes capubbs-image-loading{0%{background-position:120% 0}to{background-position:-80% 0}}@media(max-width:640px){.forum-markup .capubbs-gallery-slide>img{height:var(--capubbs-gallery-image-height, min(72vw, 420px))}.forum-markup .capubbs-gallery-nav{width:32px;height:42px}.forum-markup .capubbs-gallery-nav-prev{left:7px}.forum-markup .capubbs-gallery-nav-next{right:7px}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]),.forum-markup .capubbs-gallery-slide:has(img:not([data-capubbs-image-loaded=true])){animation:none}}:is(.forum-markup,.capubbs-editor-prose) .capubbs-gallery[data-capubbs-gallery-tag]>.capubbs-gallery-header[hidden]{display:none}@media(max-width:640px){:is(.forum-markup,.capubbs-editor-prose) .capubbs-gallery[data-capubbs-gallery-tag] .capubbs-gallery-stage,:is(.forum-markup,.capubbs-editor-prose) .capubbs-gallery[data-capubbs-gallery-tag] .capubbs-gallery-slide>img{height:min(var(--capubbs-gallery-image-height, 420px),72vw)}}',ir="/bbs/new-assets/threadHtmlBootstrap-x4mBAuLM.html";function lr(e,t){const r=new URL(e);return r.pathname=/Android|iPhone|iPad|iPod|Mobile/i.test(t)?"/m/outchain/player":"/outchain/player",r.href}function be(e,t){try{const r=new URL(e,t);return!(r.hostname==="player.bilibili.com"&&r.pathname==="/player.html"||r.hostname==="music.163.com"&&["/outchain/player","/m/outchain/player"].includes(r.pathname))||!["http:","https:"].includes(r.protocol)||r.username||r.password||r.port?null:(r.protocol="https:",r.href)}catch{return null}}function cr(e,t){const r=new URL(e);return r.hostname==="music.163.com"?(r.searchParams.set("auto","0"),lr(r.href,t)):(r.searchParams.set("autoplay","0"),r.href)}function ur(e){if(!e)return{left:0,top:0};const t=window.getComputedStyle(e);return{left:e.offsetLeft+e.clientLeft+(Number.parseFloat(t.paddingLeft)||0),top:e.offsetTop+e.clientTop+(Number.parseFloat(t.paddingTop)||0)}}function dr(e){if(!e||typeof e!="object")return!1;const t=e;return typeof t.id=="string"&&typeof t.src=="string"&&be(t.src,"https://music.163.com")===t.src&&["left","top","width","height"].every(r=>{const o=t[r];return typeof o=="number"&&Number.isFinite(o)&&Math.abs(o)<=1e5})&&t.width>0&&t.height>0}const $e=64*1024*1024,Pe=6,mr=2,ee=new Map,ae=new Map,_=new Map,B=new Map;let pe=!1;function ge(e){const t=e.priorities.map(r=>r());return t.includes("high")?"high":t.includes("low")?"low":t.includes("deferred")?"deferred":null}function z(){pe||!_.size&&!B.size||(pe=!0,setTimeout(()=>{pe=!1;const e=[];_.forEach((s,l)=>{const d=ge(s);if(d===null){_.delete(l),ee.delete(l),s.reject(new DOMException("图片所在内容已卸载","AbortError"));return}d!=="deferred"&&e.push({source:l,request:s,priority:d})}),e.sort((s,l)=>+(l.priority==="high")-+(s.priority==="high"));const t=Array.from(B.values(),s=>({download:s,priority:ge(s.request)}));t.forEach(({download:s,priority:l})=>{l===null&&s.controller.abort()});const r=t.filter(({download:s})=>s.controller.signal.aborted).length;let o=e.filter(({priority:s})=>s==="high").length-(Pe-B.size+r);const n=t.filter(({download:s,priority:l})=>l!=="high"&&!s.controller.signal.aborted).sort((s,l)=>+(l.priority==="deferred")-+(s.priority==="deferred"));for(const{download:s}of n){if(o<=0)break;o-=1,s.preempted=!0,s.controller.abort()}let c=t.filter(({priority:s})=>s!=="high").length;for(const{source:s,request:l,priority:d}of e){if(B.size>=Pe)break;d==="low"&&c>=mr||(_.delete(s),d==="low"&&(c+=1),pr(s,l,d))}},0))}function pr(e,t,r){const o={request:t,controller:new AbortController,preempted:!1};B.set(e,o),gr(e,r,o.controller.signal).then(n=>{o.controller.signal.throwIfAborted();const c={blob:n,objectUrl:URL.createObjectURL(n),sourceUrl:e};ae.set(e,c),t.resolve(c)}).catch(n=>{o.preempted||o.controller.signal.aborted&&ge(t)!==null?_.set(e,t):(ee.delete(e),t.reject(n))}).finally(()=>{B.delete(e),z()})}function Je(e){return new URL(e,new URL("/bbs/content/",window.location.origin)).href}function Me(e,t=()=>"high"){const r=Je(e),o=ee.get(r);if(o)return(_.get(r)??B.get(r)?.request)?.priorities.push(t),z(),o;const n=new Promise((c,s)=>{_.set(r,{priorities:[t],reject:s,resolve:c})});return ee.set(r,n),z(),n}function gr(e,t,r){const o=new URL(e);return o.origin!==window.location.origin||!o.pathname.startsWith("/bbs/images/")&&!o.pathname.startsWith("/bbsimg/")?Promise.reject(new Error("仅代理论坛图片目录")):fetch(e,{credentials:"same-origin",referrerPolicy:"no-referrer",priority:t,signal:r}).then(async n=>{if(!n.ok)throw new Error(`图片加载失败：${n.status}`);if(!(n.headers.get("content-type")?.toLowerCase()??"").startsWith("image/"))throw new Error("图片响应类型无效");const s=Number.parseInt(n.headers.get("content-length")??"",10);if(Number.isFinite(s)&&s>$e)throw new Error("图片大小超出限制");const l=await n.blob();if(l.size>$e)throw new Error("图片大小超出限制");return l})}function fr(e){try{return ae.get(Je(e))?.objectUrl}catch{return}}typeof window<"u"&&(window.addEventListener("scroll",z,{passive:!0,capture:!0}),window.addEventListener("resize",z),window.addEventListener("pagehide",e=>{e.persisted||(ae.forEach(t=>URL.revokeObjectURL(t.objectUrl)),ae.clear(),ee.clear())}));function hr(e,t,r){let o="deferred";for(const n of t){const c=n.right>n.left&&n.bottom>n.top&&e.top+n.bottom>Math.max(0,e.top)&&e.top+n.top<Math.min(r.height,e.bottom)&&e.left+n.right>Math.max(0,e.left)&&e.left+n.left<Math.min(r.width,e.right);if(n.gallery){if(!c||n.gallery==="deferred")continue;if(n.gallery==="current")return"high";o="low"}else{if(c)return"high";o="low"}}return o}const br=28,yr=64,xr=5e4,vr=30,Ke=30,C="capubbs-thread-html-frame",Ye=new URL("/bbs/lib/jquery.min.js",window.location.origin).href,wr=Tr(sr),Ir=/\son[a-z][\w:-]*\s*=/i;let re=null;function Fe({className:e="",floor:t,html:r,isActivitySignupCanceled:o=!1,onImageOpen:n,onIsolatedTextSelection:c,variant:s}){const l=u.useMemo(()=>s==="signature"?Mt(r):r,[r,s]),d=Sr(l,s==="signature"),b=or(d,s==="floor"),i=mt(b),g=u.useMemo(()=>i?null:pt(b,{normalizeLegacyLineBreaks:s==="signature"}),[b,i,s]),h=u.useMemo(()=>gt(b),[b]);return!i&&g!==null?a.jsx(Ve,{className:e,html:g,onImageOpen:n,variant:s}):a.jsx(Ar,{className:e,floor:t,html:h,isActivitySignupCanceled:o,onImageOpen:n,onTextSelection:c,variant:s})}function Ar({className:e,floor:t,html:r,isActivitySignupCanceled:o,onImageOpen:n,onTextSelection:c,variant:s}){const l=u.useRef(null),d=u.useRef(`${s}-${t}-${Math.random().toString(36).slice(2)}`),b=u.useRef(n);b.current=n;const i=u.useRef(c);i.current=c;const g=s==="signature"?br:yr,h=!!n,[y,f]=u.useState(null),[m,v]=u.useState(null),I=qr(),P=u.useRef(I),A=ht(),E=s==="signature"?14:A,L=u.useMemo(()=>Cr(Er(r)),[r]),O=L.includes('type="text/capubbs-user-script"')||Ir.test(L),W=u.useMemo(()=>kr({canOpenImages:h,frameId:d.current,needsJquery:O,html:L,isActivitySignupCanceled:o,isDarkTheme:P.current,fontSize:E,variant:s}),[h,L,E,o,O,s]),N=u.useMemo(()=>Math.random().toString(36).slice(2),[W]),V=u.useMemo(()=>`${ir}#${new URLSearchParams({frameId:d.current,token:N})}`,[N]),D=u.useCallback(()=>{l.current?.contentWindow?.postMessage({source:C,type:"document-response",frameId:d.current,token:N,html:W},"*")},[N,W]),H=u.useCallback(()=>{l.current?.contentWindow?.postMessage({frameId:d.current,source:C,theme:I?"dark":"light",type:"theme"},"*")},[I]),U=u.useCallback((k=l.current?.contentWindow)=>{!O||!k||ze().then(q=>{l.current?.contentWindow===k&&k.postMessage({frameId:d.current,jquerySource:q,source:C,type:"jquery-response"},"*")})},[O]),K=u.useCallback(()=>{D(),H(),U()},[D,U,H]);u.useEffect(()=>{f(null)},[V]),u.useEffect(()=>{H()},[H]),u.useEffect(()=>{O&&ze()},[O]),u.useLayoutEffect(()=>{z()},[y]),u.useLayoutEffect(()=>{let k=!0;const q=new Map;function Y(x){const G=l.current?.contentWindow;if(!(!G||x.source!==G||!Lr(x.data))&&x.data.frameId===d.current){if(x.data.type==="embedded-player-layout"){v({token:N,players:x.data.players});return}if(x.data.type==="document-request"){x.data.token===N&&D();return}if(x.data.type==="jquery-request"){U(G);return}if(x.data.type==="image-resource-layout"){q.has(x.data.requestId)&&(q.set(x.data.requestId,x.data.bounds),z());return}if(x.data.type==="image-resource-request"){const w=G,T=x.data.requestId;q.set(T,x.data.bounds);const $=()=>{const S=l.current;return!k||!S||S.contentWindow!==w?null:hr(S.getBoundingClientRect(),q.get(T)??[],{width:window.innerWidth,height:window.innerHeight})};Me(x.data.url,$).then(S=>{!k||l.current?.contentWindow!==w||w.postMessage({blob:S.blob,priority:$(),frameId:d.current,requestId:x.data.requestId,source:C,type:"image-resource-response"},"*")}).catch(()=>{!k||l.current?.contentWindow!==w||w.postMessage({priority:$(),frameId:d.current,requestId:x.data.requestId,source:C,type:"image-resource-error"},"*")}).finally(()=>q.delete(T));return}if(x.data.type==="anchor"){const w=l.current;if(!w)return;const T=window.getComputedStyle(document.documentElement),$=Number.parseFloat(T.getPropertyValue("--topbar-height"))||0,S=window.scrollY+w.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,S+x.data.offsetTop-$-16)});return}if(x.data.type==="navigate"){const w=bt(x.data.url,ye());if(!w)return;window.history.pushState(null,"",w),window.dispatchEvent(new Event(yt));const T=new URL(w,window.location.origin);T.hash?window.requestAnimationFrame(()=>{const $=decodeURIComponent(T.hash.slice(1)),S=xt(`#${$}`);(S?vt(S):document.getElementById($))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(x.data.type==="image-open"){const w=l.current;if(!w)return;const T=Array.from(w.contentDocument?.querySelectorAll("img")??[]),$=x.data.images.map(M=>({...M,element:typeof M.elementIndex=="number"?T[M.elementIndex]:void 0,src:fr(M.src)??M.src,loadSource:R=>(R.addEventListener("abort",z,{once:!0}),Me(M.src,()=>R.aborted?null:"high").then(ne=>ne.objectUrl,()=>M.src).finally(()=>R.removeEventListener("abort",z)))})),S=M=>{const R=$[M];!R||typeof R.galleryId!="number"||!Number.isSafeInteger(R.galleryIndex)||w.contentWindow?.postMessage({frameId:d.current,galleryId:R.galleryId,galleryIndex:R.galleryIndex,source:C,type:"gallery-select"},"*")};b.current?.($,x.data.imageIndex,w,S);return}if(x.data.type==="selection"){x.data.text&&window.getSelection()?.removeAllRanges(),i.current?.(x.data.text);return}f(Math.min(xr,Math.max(g,Math.ceil(x.data.height))))}}return window.addEventListener("message",Y),()=>{k=!1,q.clear(),window.removeEventListener("message",Y),z()}},[N,V,g,D,U]);const J=ur(l.current);return a.jsxs("div",{className:"thread-html-frame-container",children:[a.jsx("iframe",{ref:l,className:`thread-html-frame thread-html-frame-${s} ${e}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-downloads",scrolling:"no",src:V,onLoad:K,style:{"--thread-html-frame-width-allowance":`${Ke}px`,...y===null?{}:{"--thread-html-frame-height":`${y}px`}},title:s==="signature"?`第 ${t} 楼签名档`:`第 ${t} 楼正文`},N),m?.token===N?m.players.map(k=>a.jsx("iframe",{className:"thread-embedded-player",src:cr(k.src,navigator.userAgent),title:new URL(k.src).hostname==="player.bilibili.com"?"哔哩哔哩播放器":"网易云音乐播放器",allow:"autoplay; fullscreen; picture-in-picture",allowFullScreen:!0,scrolling:"no",style:{left:k.left+J.left,top:k.top+J.top,width:k.width,height:k.height}},`${N}-${k.id}`)):null]})}function Sr(e,t){const[r,o]=u.useState(e);return u.useEffect(()=>{const n=new AbortController,c=t?Ft(e):[];if(o(e),c.length===0)return()=>n.abort();const s=Array.from(new Map(c.map(l=>[`${l.bid}:${l.tid}:${l.pid}`,l])).values());return Promise.all(s.map(async l=>{try{const d=await ft(l,n.signal);return[`${l.bid}:${l.tid}:${l.pid}`,d]}catch(d){if(d instanceof DOMException&&d.name==="AbortError")throw d;return[`${l.bid}:${l.tid}:${l.pid}`,""]}})).then(l=>{if(n.signal.aborted)return;const d=new Map(l);let b=e;c.forEach(i=>{const g=d.get(`${i.bid}:${i.tid}:${i.pid}`);g&&(b=b.replace(i.marker,g))}),o(b)}).catch(()=>{}),()=>n.abort()},[t,e]),r}function kr({canOpenImages:e,frameId:t,fontSize:r,needsJquery:o,html:n,isActivitySignupCanceled:c,isDarkTheme:s,variant:l}){const d=l==="signature",b=d?"#999999":"rgb(63 63 70)",i=d?"#666666":"rgb(228 228 231)",g=d?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",h=d?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",y=c?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${s?"dark":"light"}" style="background:transparent;color-scheme:${s?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${Nr(ye())}">
  <meta http-equiv="Content-Security-Policy" content="${jr()}">
  <style>${wr}</style>
  <style>
    html{--capubbs-frame-text-color:${b}}html.dark{--capubbs-frame-text-color:${i}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${g};font-size:${r}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${Ke}px);${h}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${Rr(t,e,o)}<\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${l}${y}">${n}</main></body>
</html>`}function Rr(e,t,r){return`(function(){
    var frameId=${JSON.stringify(e)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(wt)};
    var canOpenImages=${JSON.stringify(t)};
    var needsJquery=${JSON.stringify(r)};
    var preparePunishmentTableFit=${We.toString()};
    var getGalleryImageState=${It.toString()};
    var normalizeEmbeddedPlayerUrl=${be.toString()};
    var playerIds=new WeakMap();
    var nextPlayerId=0;
    var lastPlayerLayout='';
    var jquerySourceUrl=${JSON.stringify(Ye)};
    var forumAppExactPaths=${JSON.stringify(At)};
    var forumAppPathPrefixes=${JSON.stringify(St)};
    var legacyForumExactPaths=${JSON.stringify(kt)};
    var legacyForumPathPatterns=${JSON.stringify(Rt)}.map(function(pattern){return new RegExp(pattern);});
    var minBottomGuard=${vr};
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
      window.parent.postMessage({source:'${C}',type:'resize',frameId:frameId,height:height},'*');
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
      window.parent.postMessage({source:'${C}',type:'embedded-player-layout',frameId:frameId,players:players},'*');
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
      window.parent.postMessage({source:'${C}',type:'selection',frameId:frameId,text:text},'*');
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
        window.parent.postMessage({source:'${C}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${C}',type:'navigate',frameId:frameId,url:url},'*');
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
      window.parent.postMessage({source:'${C}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
      window.parent.postMessage({source:'${C}',type:'image-resource-layout',frameId:frameId,requestId:requestId,bounds:getImageResourceBounds(request.images)},'*');
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
          source:'${C}',
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
      if(event.source!==window.parent||!data||data.source!=='${C}'||data.frameId!==frameId)return;
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
      if(needsJquery)window.parent.postMessage({source:'${C}',type:'jquery-request',frameId:frameId},'*');
      else executeUserScripts();
      prepareImages();
      prepareGalleries();
      requestImageResources();
      syncGrayscaleTextColors(contentRoot);
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`}function Er(e){return e.replace(/<script\b([^>]*)>/gi,(t,r)=>`<script${r.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function Cr(e){if(!/<(?:img|iframe)\b/i.test(e))return e;const t=document.createElement("template");return t.innerHTML=e,t.content.querySelectorAll("iframe[src]").forEach(r=>{const o=be(r.getAttribute("src")??"",ye());o&&(r.dataset.capubbsPlayerSrc=o,r.removeAttribute("src"))}),t.content.querySelectorAll("img[src]").forEach(r=>{const o=r.getAttribute("src")?.trim()??"";!o||/^(?:blob:|data:)/i.test(o)||(r.dataset.capubbsImageResourceSrc=o,r.setAttribute("fetchpriority","low"),r.removeAttribute("src"),r.removeAttribute("srcset"),r.closest("picture")?.querySelectorAll("source[srcset]").forEach(n=>{n.removeAttribute("srcset")}))}),t.innerHTML}function ze(){return re||(re=fetch(Ye,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw new Error(`Failed to load jQuery: ${e.status}`);return e.text()}).catch(()=>null),re)}function jr(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'","upgrade-insecure-requests"].join("; ")}function ye(){return new URL("/bbs/content/",window.location.origin).href}function Nr(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Tr(e){return e.replace(/<\/style/gi,"<\\/style")}function Lr(e){if(!e||typeof e!="object")return!1;const t=e;return t.source!==C||typeof t.frameId!="string"?!1:t.type==="embedded-player-layout"?Array.isArray(t.players)&&t.players.every(dr):t.type==="document-request"?typeof t.token=="string":t.type==="anchor"?typeof t.offsetTop=="number"&&Number.isFinite(t.offsetTop)&&t.offsetTop>=0:t.type==="navigate"?typeof t.url=="string":t.type==="jquery-request"?!0:t.type==="image-resource-request"||t.type==="image-resource-layout"?typeof t.requestId=="string"&&t.requestId.length>0&&Array.isArray(t.bounds)&&t.bounds.every(r=>r&&(r.gallery===void 0||["current","adjacent","deferred"].includes(r.gallery))&&["top","bottom","left","right"].every(o=>typeof r[o]=="number"&&Number.isFinite(r[o])))&&(t.type==="image-resource-layout"||"url"in t&&typeof t.url=="string"&&t.url.length>0):t.type==="selection"?typeof t.text=="string":t.type==="image-open"?typeof t.imageIndex=="number"&&Number.isSafeInteger(t.imageIndex)&&Array.isArray(t.images)&&t.images.length>0&&t.imageIndex>=0&&t.imageIndex<t.images.length&&t.images.every(r=>!!r&&typeof r=="object"&&typeof r.alt=="string"&&typeof r.elementIndex=="number"&&Number.isSafeInteger(r.elementIndex)&&r.elementIndex>=0&&typeof r.src=="string"&&r.src.length>0&&(r.galleryId===void 0&&r.galleryIndex===void 0||typeof r.galleryId=="number"&&Number.isSafeInteger(r.galleryId)&&r.galleryId>=0&&typeof r.galleryIndex=="number"&&Number.isSafeInteger(r.galleryIndex)&&r.galleryIndex>=0)):t.type==="resize"&&typeof t.height=="number"&&Number.isFinite(t.height)}function qr(){const[e,t]=u.useState(()=>document.documentElement.classList.contains("dark"));return u.useEffect(()=>{const r=document.documentElement,o=()=>t(r.classList.contains("dark")),n=new MutationObserver(o);return n.observe(r,{attributeFilter:["class"],attributes:!0}),()=>n.disconnect()},[]),e}function $r({attachments:e=[],bodyClassName:t="thread-floor-body",bodyFallback:r=null,bodyHtml:o,floor:n,isActivitySignupCanceled:c=!1,onImageOpen:s,onIsolatedTextSelection:l,signatureClassName:d="thread-signature",signatureHtml:b,signatureText:i}){const g=s?(h,y,f,m)=>{const v=h[y];v&&s([v],0,f,m?()=>m(y):void 0)}:void 0;return a.jsxs(a.Fragment,{children:[o?a.jsx(Fe,{className:t,floor:n,html:o,isActivitySignupCanceled:c,onImageOpen:s,onIsolatedTextSelection:l,variant:"floor"}):r,a.jsx(Pr,{attachments:e}),b?a.jsx(Fe,{className:d,floor:n,html:b,onImageOpen:g,variant:"signature"}):i?a.jsx("footer",{className:d,children:a.jsx("p",{children:i})}):null]})}function Pr({attachments:e}){return e.length===0?null:a.jsxs("section",{"aria-label":"附件",className:"thread-attachments",children:[a.jsxs("header",{className:"thread-attachments-heading",children:[a.jsx(Gt,{"aria-hidden":"true",size:14}),a.jsx("span",{children:"附件"}),a.jsx("small",{children:e.length})]}),a.jsx("ul",{children:e.map(t=>{const r=a.jsxs(a.Fragment,{children:[a.jsx("span",{className:"thread-attachment-name",children:t.name}),a.jsx("small",{children:Mr(t)}),t.exists!==!1&&a.jsx(Et,{"aria-hidden":"true",size:15})]});return a.jsx("li",{children:t.exists===!1?a.jsx("div",{"aria-disabled":"true",className:"thread-attachment-link is-unavailable",children:r}):a.jsx("a",{className:"thread-attachment-link",download:t.name,href:t.downloadHref||`/bbs/download/?id=${encodeURIComponent(t.id)}`,children:r})},t.id)})})]})}function Mr(e){if(e.exists===!1)return"文件不可用";const t=[Fr(e.size),(e.price??0)>0?"付费附件":"免费"];return e.downloadCount!==void 0&&t.push(`下载 ${e.downloadCount} 次`),t.join(" · ")}function Fr(e){if(e<=0)return"大小未知";if(e<1024)return`${e} B`;const t=["KB","MB","GB","TB"];let r=e,o=-1;do r/=1024,o+=1;while(r>=1024&&o<t.length-1);return`${r.toFixed(r>=10?1:2)} ${t[o]}`}function zr({author:e,id:t}){const r=e.tags??[],[o,n]=u.useState(!1),c=u.useRef(null),s=u.useRef(null),l=u.useRef(null),d=u.useRef(null),b=r.map(i=>`${i.id}:${i.name}`).join("|");return u.useLayoutEffect(()=>{if(r.length===0){n(!1);return}const i=()=>{const h=c.current,y=s.current,f=l.current,m=d.current;if(!h||!y||!f||!m||h.offsetWidth===0)return;const v=f.getBoundingClientRect().width,I=m.getBoundingClientRect().width,P=Number.parseFloat(getComputedStyle(y).columnGap)||0,A=y.clientWidth-v-P,E=I>A+1;n(L=>L===E?L:E)};i();const g=new ResizeObserver(i);return[c.current,s.current,d.current].forEach(h=>{h&&g.observe(h)}),()=>g.disconnect()},[b,r.length]),a.jsxs("div",{id:t,ref:c,className:"author-hover-card",role:"dialog","aria-label":`${e.name} 的用户摘要`,children:[a.jsxs("div",{className:"author-card-head",children:[a.jsx("img",{src:e.avatar,alt:""}),a.jsxs("div",{className:"author-card-head-copy",children:[a.jsxs("div",{ref:s,className:"author-card-name-line","data-tags-overflow":o?"true":void 0,children:[a.jsx("strong",{ref:l,children:e.name}),a.jsx("div",{className:"author-card-tag-slot",children:a.jsx(ie,{size:"compact",tags:r})})]}),(e.stars>0||e.role)&&a.jsxs("span",{className:"author-card-status",children:["★".repeat(e.stars),e.stars>0&&e.role?" · ":"",e.role]})]})]}),o?a.jsx("div",{className:"author-card-tags-row",children:a.jsx(ie,{size:"compact",tags:r})}):null,e.medals?.length?a.jsx("div",{className:"author-card-medals",children:a.jsx(_e,{medals:e.medals,profileName:e.name,variant:"compact"})}):null,a.jsx("div",{ref:d,className:"author-card-tag-width-measure","aria-hidden":"true",children:a.jsx(ie,{size:"compact",tags:r})}),a.jsxs("dl",{children:[a.jsxs("div",{children:[a.jsx("dt",{children:"主题"}),a.jsx("dd",{children:e.topics})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"回复"}),a.jsx("dd",{children:e.replies})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"签到"}),a.jsx("dd",{children:e.checkins})]})]}),a.jsxs("p",{children:["最近在线：",e.lastSeen]}),a.jsxs("a",{href:Z(e.name),children:["查看个人主页 ",a.jsx(Dt,{size:13})]})]})}function Or({author:e}){const t=e.tags??[],r=Ge(t),o=Z(e.name);return a.jsxs("aside",{className:"thread-author-profile","aria-label":`${e.name} 的资料`,children:[a.jsx("a",{"aria-label":`查看${e.name}的个人主页`,className:"thread-author-profile-avatar",href:o,children:a.jsx("img",{src:e.avatar,alt:""})}),a.jsx("div",{className:"thread-author-profile-identity",children:a.jsx("a",{href:o,children:e.name})}),(e.stars>0||e.role)&&a.jsxs("div",{className:"thread-author-profile-status",children:[e.stars>0&&a.jsx("span",{"aria-label":`${e.stars} 星`,children:"★".repeat(e.stars)}),e.role&&a.jsx("strong",{children:e.role})]}),a.jsx(Ue,{tags:r}),a.jsx(_e,{medals:e.medals??[],profileName:e.name,variant:"compact"}),a.jsxs("dl",{className:"thread-author-profile-stats",children:[a.jsxs("div",{children:[a.jsx("dt",{children:"主题"}),a.jsx("dd",{children:e.topics})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"回复"}),a.jsx("dd",{children:e.replies})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"签到"}),a.jsx("dd",{children:e.checkins})]})]}),a.jsxs("p",{className:"thread-author-profile-last-seen",children:[a.jsx("span",{children:"最近在线"}),a.jsx("strong",{children:e.lastSeen})]})]})}function fe(e){return e.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function Dr(e){const t=window.getSelection()?.toString();t&&(e.preventDefault(),e.clipboardData.setData("text/plain",t))}function Hr({articleAfterContent:e,author:t,avatarRail:r,className:o="",content:n,decorationImageSrc:c,editedAt:s,floor:l,floorIndex:d,id:b,inlineAvatar:i=!1,mainAfterContent:g,onCopy:h,publishedAt:y,showAuthorProfile:f}){const m=t.tags??[],v=Ge(m);return a.jsxs("article",{className:`thread-floor${f?" thread-floor-with-author-profile":""}${o?` ${o}`:""}`,"data-floor":l,id:b,onCopy:h,children:[c&&a.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:a.jsx("img",{alt:"",src:c})}),f?a.jsx(Or,{author:t}):!i&&r,a.jsxs("div",{className:"thread-floor-main",children:[a.jsxs("header",{className:"thread-floor-header",children:[!f&&i&&r,a.jsxs("div",{className:"thread-floor-author",children:[a.jsx("a",{href:Z(t.name),children:t.name}),a.jsx(Ue,{tags:v})]}),a.jsxs("div",{className:"thread-floor-time",children:[a.jsx("time",{children:fe(y)}),s&&a.jsxs(a.Fragment,{children:[a.jsx("span",{children:"·"}),a.jsxs("time",{children:["编辑于 ",fe(s)]})]})]}),d]}),f?a.jsx("div",{className:"thread-floor-content",children:n}):n,g]}),e]})}function Ur({canDelete:e,canEdit:t,canQuote:r,canReply:o,decorative:n=!1,deleting:c=!1,editHref:s="",onDelete:l,onEditSignup:d,onQuote:b,onReply:i}){const g=n?-1:void 0,h=u.useRef(null);return a.jsxs("div",{"aria-hidden":n||void 0,className:`thread-floor-actions${n?" thread-floor-actions-decorative":""}`,children:[r&&a.jsxs("button",{onClick:y=>{const f=h.current?h.current.text:Oe(y.currentTarget);h.current=null,b?.(f)},onPointerDown:y=>{y.button===0&&(h.current={text:Oe(y.currentTarget)})},tabIndex:g,type:"button",children:[a.jsx(Tt,{size:15}),"引用"]}),d&&!n&&a.jsxs("button",{onClick:d,type:"button",children:[a.jsx(ce,{size:15}),"编辑报名"]}),o&&a.jsxs("button",{onClick:i,tabIndex:g,type:"button",children:[a.jsx(Bt,{size:15}),"回复"]}),t&&(n?a.jsxs("button",{tabIndex:-1,type:"button",children:[a.jsx(ce,{size:15}),"编辑"]}):a.jsxs("a",{href:s,children:[a.jsx(ce,{size:15}),"编辑"]})),e&&a.jsxs("button",{"aria-busy":c||void 0,className:"floor-action-danger",disabled:!n&&c,onClick:n?void 0:y=>l?.(y.currentTarget),tabIndex:g,type:"button",children:[a.jsx(he,{size:15}),c?"删除中":"删除"]})]})}function Zr({canQuote:e,canReply:t,decorationImageSrc:r,editHref:o,floor:n,isActivityThread:c,isMainPost:s,inlineAvatar:l,showAuthorProfile:d,hideSignature:b,onDeleteFloor:i,onDeleteNestedReply:g,onEditSignup:h,onIsolatedTextSelection:y,onQuote:f,onSubmitNestedReply:m,viewer:v}){const[I,P]=u.useState(!1),[A,E]=u.useState(null),[L,O]=u.useState([]),[W,N]=u.useState(""),[V,D]=u.useState(!1),[H,U]=u.useState([]),[K,J]=u.useState(""),[k,q]=u.useState(""),[Y,x]=u.useState(null),[G,w]=u.useState(""),[T,$]=u.useState(!1),[S,M]=u.useState(void 0),R=Jt(K),ne=Ct(":scope > article"),xe=`nested-reply-count-${n.id}`,[Q,ve]=u.useState(null),[te,we]=u.useState(!1),Ie=u.useRef(null),X=u.useRef(null),oe=u.useRef(null),Ae=u.useRef(null),Se=u.useRef(null),ke=u.useMemo(()=>[...n.nestedReplies??[],...H].filter(p=>!L.includes(p.id)),[L,n.nestedReplies,H]),Re=c&&!s&&/<\s*(?:s|strike)\b/i.test(n.contentHtml??""),Ee=`thread-floor-body${Re?" capubbs-activity-signup-canceled":""}`;u.useEffect(()=>()=>{X.current!==null&&window.clearTimeout(X.current)},[]),u.useEffect(()=>{if(!te)return;function p(j){Ie.current?.contains(j.target)||we(!1)}return document.addEventListener("pointerdown",p),()=>document.removeEventListener("pointerdown",p)},[te]);async function Qe(){const p=`${window.location.origin}${window.location.pathname}${window.location.search}#${n.floor}`;await Wt(p)&&(P(!0),X.current!==null&&window.clearTimeout(X.current),X.current=window.setTimeout(()=>P(!1),1800))}const Ce=(p,j,F,se)=>{Se.current=F,ve({imageIndex:j,images:p,onImageChange:se})};function Xe(p){Q?.onImageChange?.(p),ve(null),window.requestAnimationFrame(()=>Se.current?.focus())}function je(p=null){M(p),J(""),q(""),w(""),window.requestAnimationFrame(()=>Ae.current?.focus())}function Ne(){M(void 0),J(""),w("")}async function Ze(p){p.preventDefault();const j=K.trim();if(!(!R.canSubmit||!v||!t||T)){$(!0),w("");try{const F=await m(n,S??null,j);U(se=>[...se,{author:v,canDelete:!0,content:j,id:F>0?String(F):`local-${n.id}-${Date.now()}`,publishedAt:Br(new Date),target:S??void 0}]),Ne()}catch(F){w(F instanceof Error?F.message:"楼中楼回复发布失败，请稍后重试。")}finally{$(!1)}}}async function et(p){x(p.id),q("");try{await g(n,p),O(j=>[...j,p.id]),U(j=>j.filter(F=>F.id!==p.id)),E(null)}catch(j){q(j instanceof Error?j.message:"楼中楼删除失败，请稍后重试。")}finally{x(null)}}async function tt(){if(!V){D(!0),N("");try{await i(n)}catch(p){N(p instanceof Error?p.message:"楼层删除失败，请稍后重试。"),D(!1)}}}function rt(){E(null),N(""),q(""),window.requestAnimationFrame(()=>oe.current?.focus())}function at(){if(!A)return;const p=A;E(null),p.kind==="floor"?tt():et(p.reply)}const nt=a.jsxs("div",{className:`thread-avatar-rail${te?" thread-avatar-rail-open":""}`,ref:Ie,children:[a.jsx("button",{"aria-controls":`author-card-${n.floor}`,"aria-expanded":te,"aria-label":`查看${n.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>we(p=>!p),type:"button",children:a.jsx("img",{src:n.author.avatar,alt:""})}),a.jsx(zr,{author:n.author,id:`author-card-${n.floor}`})]}),ot=a.jsx($r,{attachments:n.attachments,bodyFallback:a.jsx("div",{className:Ee,children:n.paragraphs.map(p=>a.jsx("p",{children:p},p))}),bodyClassName:Ee,bodyHtml:n.contentHtml,floor:n.floor,isActivitySignupCanceled:Re,onImageOpen:Ce,onIsolatedTextSelection:p=>y(n,p),signatureHtml:b?void 0:n.signatureHtml,signatureText:b?void 0:n.signature}),st=a.jsxs("button",{"aria-label":`复制第 ${n.floor} 楼链接`,className:"thread-floor-index",onClick:Qe,title:"复制楼层链接",type:"button",children:["#",n.floor]}),it=a.jsxs(a.Fragment,{children:[a.jsx(Ur,{canDelete:(!c||s)&&(n.canDelete??n.isOwn??!1),canEdit:(!c||s)&&!!n.isOwn,canQuote:e,canReply:t,deleting:V,editHref:o,onEditSignup:c&&!s&&n.isOwn?h:void 0,onDelete:p=>{oe.current=p,N(""),E({kind:"floor"})},onQuote:p=>f(n,p),onReply:()=>je()}),W&&a.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:W}),ke.length>0&&a.jsx("section",{className:"nested-replies",ref:ne,"aria-label":`${n.floor} 楼的楼中楼回复`,children:ke.map(p=>a.jsxs("article",{children:[a.jsx("img",{src:p.author.avatar,alt:""}),a.jsxs("div",{className:"nested-reply-main",children:[a.jsxs("div",{className:"nested-reply-identity",children:[a.jsx("a",{className:"nested-reply-author",href:Z(p.author.name),children:p.author.name}),p.target&&a.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",a.jsx("a",{className:"nested-reply-author",href:Z(p.target),children:p.target})]})]}),p.contentHtml?a.jsx(Ve,{className:"nested-reply-content",html:p.contentHtml,onImageOpen:Ce,variant:"nested"}):a.jsx("p",{children:p.content}),a.jsxs("footer",{className:"nested-reply-footer",children:[a.jsx("time",{children:fe(p.publishedAt)}),t&&a.jsx("button",{onClick:()=>je(p.author.name),type:"button",children:"回复"}),p.canDelete&&a.jsxs("button",{className:"nested-reply-delete",disabled:Y===p.id,onClick:j=>{oe.current=j.currentTarget,q(""),E({kind:"nested",reply:p})},type:"button",children:[a.jsx(he,{size:12}),Y===p.id?"删除中":"删除"]})]})]})]},p.id))}),k&&a.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:k}),S!==void 0&&t&&a.jsxs("form",{className:"nested-reply-composer",onSubmit:Ze,children:[a.jsxs("div",{className:"nested-reply-input-field",children:[a.jsx("textarea",{"aria-describedby":xe,"aria-invalid":R.isOverLimit||void 0,"aria-label":S?`回复 @${S}`:`回复第 ${n.floor} 楼`,onChange:p=>{J(p.target.value),w("")},placeholder:S?`回复 @${S}`:"写一条楼中楼回复",ref:Ae,rows:2,value:K}),a.jsxs("small",{"aria-label":`已输入 ${R.length} 字，最多 ${R.limit} 字`,className:`nested-reply-character-count${R.isOverLimit?" nested-reply-character-count-error":""}`,id:xe,children:[R.length," / ",R.limit]})]}),a.jsxs("div",{className:"nested-reply-composer-actions",children:[a.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:T,onClick:Ne,type:"button",children:a.jsx(He,{size:15})}),a.jsxs("button",{className:"nested-reply-submit",disabled:!R.canSubmit||T,type:"submit",children:[a.jsx(jt,{size:14}),T?"发送中":"发送"]})]}),G&&a.jsx("p",{className:"nested-reply-error",role:"alert",children:G})]})]}),lt=a.jsxs(a.Fragment,{children:[I&&a.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[a.jsx(Nt,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),a.jsx(Te,{children:Q&&a.jsx(zt,{images:Q.images,initialImageIndex:Q.imageIndex,onImageChange:Q.onImageChange,onClose:Xe})}),a.jsx(Te,{mobileSize:"compact",children:A&&a.jsx(Gr,{floor:n,isMainPost:s,onCancel:rt,onConfirm:at,target:A})})]});return a.jsx(Hr,{articleAfterContent:lt,author:n.author,avatarRail:nt,content:ot,decorationImageSrc:r,editedAt:n.editedAt,floor:n.floor,floorIndex:st,id:String(n.floor),inlineAvatar:l,mainAfterContent:it,onCopy:Dr,publishedAt:n.publishedAt,showAuthorProfile:d})}function Oe(e){const t=e.closest(".thread-floor")?.querySelector(".thread-floor-body");return qt(window.getSelection(),t??null)}function Gr({floor:e,isMainPost:t,onCancel:r,onConfirm:o,target:n}){const c=n.kind==="nested"?n.reply:null,s=c?"删除楼中楼回复":t?"删除主楼":"删除回复",l=c?"":t?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",d=c?.author.name??e.author.name,b=c?`#${e.floor} · 楼中楼`:`#${e.floor}`,i=_r(c?.content||e.quoteText||e.paragraphs[0]||"");return u.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),u.useEffect(()=>{function g(h){h.key==="Escape"&&r()}return document.addEventListener("keydown",g),()=>document.removeEventListener("keydown",g)},[r]),a.jsx(Lt,{className:"thread-delete-dialog-backdrop",onMouseDown:g=>{g.currentTarget===g.target&&r()},role:"presentation",children:a.jsxs("section",{"aria-describedby":l?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[a.jsxs("header",{children:[a.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:a.jsx(Ht,{size:19})}),a.jsx("div",{children:a.jsx("h2",{id:"thread-delete-dialog-title",children:s})}),a.jsx("button",{"aria-label":"关闭删除确认",onClick:r,type:"button",children:a.jsx(He,{size:18})})]}),a.jsxs("div",{className:"thread-delete-dialog-body",children:[l&&a.jsx("p",{id:"thread-delete-dialog-description",children:l}),a.jsxs("div",{className:"thread-delete-dialog-target",children:[a.jsxs("span",{children:[d," · ",b]}),a.jsx("p",{children:i||"此回复没有可预览的文字内容。"})]})]}),a.jsxs("footer",{children:[a.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:r,type:"button",children:"取消"}),a.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:o,type:"button",children:[a.jsx(he,{size:15}),"确认删除"]})]})]})})}function _r(e){const t=e.replace(/\s+/g," ").trim();return t.length>100?`${t.slice(0,100).trimEnd()}…`:t}function Br(e){const t=r=>String(r).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())} ${t(e.getHours())}:${t(e.getMinutes())}:${t(e.getSeconds())}`}export{Gt as P,$r as T,Hr as a,Ur as b,Zr as c,Xr as f,Wt as w};
