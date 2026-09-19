import{D as De,a4 as ut,r as d,a9 as dt,cd as mt,ce as pt,j as n,cf as gt,cg as ft,ch as ht,ci as bt,cj as yt,bi as xt,ba as vt,at as wt,bc as It,ck as At,cl as St,cm as kt,cn as Rt,co as Et,cp as Ct,af as jt,u as qt,a2 as te,n as ye,a5 as He,K as Nt,ah as Tt,M as Ne,cq as Ue,c6 as Lt,aJ as ce,c2 as $t,aa as Pt,cr as Mt}from"./index-CdReoHQP.js";import{e as Ft,d as Te,m as ue,s as zt,r as Ot,f as Dt,T as Ht,a as Ge,P as _e}from"./RichTextEditor.gallery-BbBbDjLh.js";import{f as Ut}from"./dataDisplay-C26Mk0IH.js";import{P as de}from"./pencil-Dm1FzaGd.js";import{T as Gt}from"./triangle-alert-D_kdXQUW.js";const _t=[["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",key:"1miecu"}]],Bt=De("paperclip",_t);const Wt=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],Vt=De("reply",Wt);async function Jt(e){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),!0}catch{}const r=document.createElement("textarea");r.value=e,r.setAttribute("readonly",""),r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select();try{return document.execCommand("copy")}finally{r.remove()}}const Kt=400;function Zr(e,r){return r?`回复 @${r}：${e}`:e}function Yt(e){const r=Array.from(e).length,t=Kt,o=r>t;return{canSubmit:!!e.trim()&&!o,isOverLimit:o,length:r,limit:t}}function Be(e,r){e.querySelectorAll(".capubbs-gallery").forEach(t=>{const o=t.querySelector(".capubbs-gallery-stage");if(!o||o.querySelector(".capubbs-gallery-quote"))return;const a=t.ownerDocument.createElement("button");a.type="button",a.className="capubbs-gallery-quote",a.innerHTML='<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg><span>引用</span>',a.setAttribute("aria-label","引用图片"),a.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation();const i=Array.from(t.querySelectorAll('[data-capubbs-gallery-slide="true"]')),s=i.findIndex(b=>b.getAttribute("data-capubbs-gallery-active")==="true"),u=s>=0?s:0,p=i[u]?.querySelector("img");if(!p)return;const m=p.getAttribute("data-capubbs-image-resource-src")||p.getAttribute("data-capubbs-gallery-src")||p.getAttribute("src");if(!m)return;let h;try{h=new URL(m,p.baseURI)}catch{return}if(!["http:","https:"].includes(h.protocol))return;const c=t.querySelectorAll('[data-capubbs-gallery-caption="true"]');r({src:h.href,title:t.querySelector(".capubbs-gallery-title")?.textContent?.trim()??"",caption:c[u]?.textContent?.trim()??""})}),o.appendChild(a)})}function ea(e,r,t){let o;try{o=new URL(r.src)}catch{return e}if(!["http:","https:"].includes(o.protocol))return e;const a=[r.title.trim(),r.caption.trim()].filter(Boolean).join("-"),l=a?`【${a}】`:"",i=m=>m.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),s=`<p class="capubbs-floor-quote-content"><img src="${i(o.href)}" alt=""></p>${l?`<p class="capubbs-floor-quote-content">${i(l)}</p>`:""}`,u=o.href.replace(/[<>\\]/g,m=>encodeURIComponent(m)),p=l.replace(/([\\`*_{}\[\]()#+.!|>~-])/g,"\\$1");return ut(e,t,{html:s,markdown:`![](<${u}>)${p?`

${p}`:""}`})}const Qt={black:0,darkgray:169,darkgrey:169,dimgray:105,dimgrey:105,gainsboro:220,gray:128,grey:128,lightgray:211,lightgrey:211,silver:192,white:255,whitesmoke:245},me="data-capubbs-original-grayscale-color-attr",pe="data-capubbs-original-grayscale-style-color";function Xt(e){const r=String(e??"").trim().toLowerCase().replace(/^['"]|['"]$/g,""),t=r.replace(/\s+/g,""),o=Qt[t];if(typeof o=="number")return{alpha:1,channel:o};const a=t.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);if(a){const m=a[1].length<=4?a[1].split("").map(f=>`${f}${f}`).join(""):a[1],h=Number.parseInt(m.slice(0,2),16),c=Number.parseInt(m.slice(2,4),16),b=Number.parseInt(m.slice(4,6),16),x=m.length===8?Number.parseInt(m.slice(6,8),16)/255:1;return h===c&&c===b?{alpha:x,channel:h}:null}const l=r.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*(?:,|\/)\s*([01](?:\.\d+)?|\.\d+|100%|\d{1,3}(?:\.\d+)?%))?\s*\)$/);if(!l)return null;const i=ge(l[1]),s=ge(l[2]),u=ge(l[3]),p=rr(l[4]);return i===null||s===null||u===null||p===null?null:i===s&&s===u?{alpha:p,channel:i}:null}function We(e,r=!0){const t=Xt(e);if(!t)return null;const o=255-t.channel;if(r&&t.alpha<1)return`rgba(${o}, ${o}, ${o}, ${ar(t.alpha)})`;const a=o.toString(16).padStart(2,"0");return`#${a}${a}${a}`}function Zt(e,r){[...e.matches("[color], [style]")?[e]:[],...Array.from(e.querySelectorAll("[color], [style]"))].forEach(o=>{er(o,r),o instanceof HTMLElement&&tr(o,r)})}function er(e,r){const t=e.getAttribute(me);if(r==="light"){if(t===null)return;e.setAttribute("color",t),e.removeAttribute(me);return}const o=t??e.getAttribute("color"),a=We(o,!1);!a||o===null||(t===null&&e.setAttribute(me,o),e.getAttribute("color")!==a&&e.setAttribute("color",a))}function tr(e,r){const t=e.getAttribute(pe);if(r==="light"){if(t===null)return;e.style.setProperty("color",t,e.style.getPropertyPriority("color")),e.removeAttribute(pe);return}const o=t??e.style.getPropertyValue("color"),a=We(o);!a||!o||(t===null&&e.setAttribute(pe,o),e.style.getPropertyValue("color")!==a&&e.style.setProperty("color",a,e.style.getPropertyPriority("color")))}function ge(e){const r=e.endsWith("%"),t=Number(r?e.slice(0,-1):e);return Number.isFinite(t)?r?t>=0&&t<=100?Math.round(t*2.55):null:t>=0&&t<=255?Math.round(t):null:null}function rr(e){if(e===void 0)return 1;const r=e.endsWith("%"),t=Number(r?e.slice(0,-1):e);return Number.isFinite(t)?r?t>=0&&t<=100?t/100:null:t>=0&&t<=1?t:null:null}function ar(e){return Number(e.toFixed(3))}function nr(e){const r=[];return e.querySelectorAll("table").forEach(t=>{if(t.classList.contains("forum-punishment-table")||t.parentElement?.closest("table")||t.querySelector("table")||t.rows.length<2||!Array.from(t.rows).some(m=>m.cells.length>1))return;let o=t.parentElement;if(!o?.classList.contains("forum-table-scroll")){o=t.ownerDocument.createElement("div"),o.className="forum-table-scroll",o.tabIndex=0,t.before(o),o.append(t),t.classList.add("forum-data-table");let m=[],h=null;Array.from(t.rows).forEach((c,b)=>{h!==c.parentElement&&(h=c.parentElement,m=[]);let x=0;Array.from(c.cells).forEach(f=>{for(;(m[x]??0)>0;)x+=1;x===0&&f.colSpan===1&&f.classList.add("forum-table-first-column"),b===0&&!t.tHead&&f.classList.add("forum-table-heading");const y=f.rowSpan===0?t.rows.length:f.rowSpan;for(let E=0;E<f.colSpan;E+=1)m[x+E]=y;x+=f.colSpan;const w=t.ownerDocument.createElement("div");for(w.className="forum-table-cell-content";f.firstChild;)w.append(f.firstChild);f.append(w)}),m=m.map(f=>Math.max(0,f-1))})}const a=o;let l=a.parentElement;l?.classList.contains("forum-table-viewport")||(l=t.ownerDocument.createElement("div"),l.className="forum-table-viewport",a.before(l),l.append(a));const i=l,s=()=>{a.classList.toggle("forum-table-scrolled",a.scrollLeft>0),i.classList.toggle("forum-table-more-right",a.scrollWidth-a.clientWidth-a.scrollLeft>1)};s(),a.addEventListener("scroll",s,{passive:!0});const u=t.ownerDocument.defaultView,p=u?.ResizeObserver?new u.ResizeObserver(s):null;p?.observe(a),p?.observe(t),u?.addEventListener("resize",s),r.push(()=>{a.removeEventListener("scroll",s),p?.disconnect(),u?.removeEventListener("resize",s)})}),()=>r.forEach(t=>t())}function Ve(e){const r=e.ownerDocument.defaultView;if(!r)return()=>{};const t=[];return e.querySelectorAll(".forum-punishment-table").forEach(o=>{const a=o.parentElement;if(!a?.classList.contains("forum-punishment-scroll"))return;let l=!1;function i(){if(l||!a)return;const u=a.clientWidth,p=Math.max(o.offsetWidth,o.scrollWidth);if(u<=0||p<=0)return;const m=Math.min(1,u/p),h=`scale(${m})`,c=`${Math.ceil(o.offsetHeight*m)}px`;o.style.transform!==h&&(o.style.transform=h),a.style.height!==c&&(a.style.height=c)}const s=r.ResizeObserver?new r.ResizeObserver(i):null;s?.observe(a),s?.observe(o),r.addEventListener("resize",i),e.ownerDocument.fonts?.ready.then(i),i(),t.push(()=>{l=!0,s?.disconnect(),r.removeEventListener("resize",i)})}),()=>t.forEach(o=>o())}function Je({className:e="",html:r,onImageOpen:t,onImageQuote:o,variant:a}){const l=d.useRef(null),i=d.useRef(o);i.current=o;const{theme:s}=dt(),u=d.useMemo(()=>({__html:mt(r)}),[r]);if(d.useLayoutEffect(()=>{const c=l.current;if(c&&a!=="signature")return nr(c)},[r,a]),d.useLayoutEffect(()=>{const c=l.current;if(c&&a!=="signature")return Ve(c)},[r,a]),d.useLayoutEffect(()=>{const c=l.current;c&&(Ft(c),o&&a==="floor"?Be(c,b=>i.current?.(b)):c.querySelectorAll(".capubbs-gallery-quote").forEach(b=>b.remove()),Zt(c,s))},[r,s,!!o,a]),d.useLayoutEffect(()=>{const c=l.current;if(c)return pt(c)},[r]),d.useEffect(()=>{const c=l.current;if(!c)return;const b=Array.from(c.querySelectorAll("img")),x=y=>{y.dataset.capubbsImageLoaded="true"},f=b.map(y=>{if(y.complete&&y.getAttribute("src"))return x(y),null;const w=()=>x(y);return y.addEventListener("load",w,{once:!0}),y.addEventListener("error",w,{once:!0}),{handleLoad:w,image:y}});return()=>{f.forEach(y=>{y&&(y.image.removeEventListener("load",y.handleLoad),y.image.removeEventListener("error",y.handleLoad))})}},[r]),!r)return null;function p(c,b){if(!t||!(c instanceof Element))return;const x=c.closest("img");if(!(x instanceof HTMLImageElement))return;const f=x.closest(".capubbs-gallery"),y=f?Array.from(f.querySelectorAll('[data-capubbs-gallery-slide="true"] img')):Array.from(b.querySelectorAll("img")).filter(S=>!S.closest(".capubbs-gallery")),w=y.indexOf(x);if(w<0)return;const E=y.map(S=>or(S,b)),M=y.map((S,O)=>{const D=E[O];return{alt:S.alt.trim(),element:S,src:S.currentSrc||S.getAttribute("src")||S.dataset.capubbsGallerySrc||"",...D?{galleryId:D.galleryId,galleryIndex:D.galleryIndex}:{}}});t(M,w,x,S=>{const O=E[S];O&&zt(O.gallery,O.galleryIndex)})}function m(c){const b=Te(c.target);if(b&&c.target instanceof Element){c.preventDefault(),c.stopPropagation(),ue(c.target,b);return}!t||!(c.target instanceof HTMLImageElement)||(c.preventDefault(),p(c.target,c.currentTarget))}function h(c){const b=Te(c.target);if(b&&["Enter"," "].includes(c.key)&&c.target instanceof Element){c.preventDefault(),ue(c.target,b);return}if(["ArrowLeft","ArrowRight"].includes(c.key)&&c.target instanceof Element&&c.target.closest(".capubbs-gallery")){c.preventDefault(),ue(c.target,c.key==="ArrowLeft"?"prev":"next");return}!t||!(c.target instanceof HTMLImageElement)||!["Enter"," "].includes(c.key)||(c.preventDefault(),p(c.target,c.currentTarget))}return n.jsx("div",{ref:l,className:`forum-markup forum-markup-${a} ${e}`.trim(),"data-forum-markup":a,dangerouslySetInnerHTML:u,onClick:m,onKeyDown:h})}function or(e,r){const t=e.closest(".capubbs-gallery");if(!t||!r.contains(t))return null;const a=Array.from(r.querySelectorAll(".capubbs-gallery")).indexOf(t),i=Array.from(t.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(e);return a>=0&&i>=0?{gallery:t,galleryId:a,galleryIndex:i}:null}function sr(e){if(!/<punishment_record\b/i.test(e))return null;const r=document.createElement("template");r.innerHTML=e;const t=Array.from(r.content.querySelectorAll("punishment_record")).filter(a=>!a.closest("pre, code, textarea"));if(t.length===0)return null;const o=t.map(a=>{const l=a.getAttribute("year")?.trim()??"",i=/^\d{4}$/.test(l)&&Number(l)>1?Number(l):null,s=document.createElement("div");return a.replaceWith(s,...Array.from(a.childNodes)),{placeholder:s,year:i}});return{needsRecords:o.some(({year:a})=>a!==null),render(a,l){return o.forEach(({placeholder:i,year:s})=>{if(s===null||l){i.textContent=s===null?"罚跑记录学年无效":l;return}const u=document.createElement("table"),p=`${s-1}-${s} 学年罚跑记录`;u.className="forum-punishment-table",u.setAttribute("aria-label",p);const m=document.createElement("div");m.className="forum-punishment-title",m.setAttribute("role","heading"),m.setAttribute("aria-level","2"),m.textContent=p;const h=u.createTHead().insertRow();["姓名","ID","原因","长度","职务加罚","开始时间","结束时间","完成情况"].forEach(f=>{const y=document.createElement("th");y.scope="col",y.textContent=f,h.append(y)});const c=u.createTBody(),b=a.filter(f=>{const y=f.startDate.match(/^(\d{4})-(\d{1,2})-/);if(!y)return!1;const w=Number(y[2]);return w>=1&&w<=12&&Number(y[1])+(w>=9?1:0)===s});if(b.forEach(f=>{const y=c.insertRow(),w=f.distance?/公里|km/i.test(f.distance)?f.distance:`${f.distance} km`:"—";[f.name||"—",f.username||"—",f.reason||"—",w,f.addition?"是":"否",Le(f.startDate),Le(f.endDate),f.isComplete?"已完成":"进行中"].forEach(E=>{y.insertCell().textContent=E})}),b.length===0){const f=c.insertRow().insertCell();f.colSpan=8,f.className="forum-punishment-empty",f.textContent="暂无罚跑记录"}const x=document.createElement("div");x.className="forum-punishment-scroll",x.append(u),i.className="forum-punishment-record",i.replaceChildren(m,x)}),r.innerHTML}}}function Le(e){return!e||e==="0000-00-00"?"—":e.replaceAll("-",".")}function ir(e,r){const t=d.useMemo(()=>r?sr(e):null,[r,e]),[o,a]=d.useState(null);return d.useEffect(()=>{if(!t||!t.needsRecords)return;const l=new AbortController;return Ut("punishments",l.signal).then(({punishmentRecords:i})=>{l.signal.aborted||a({prepared:t,html:t.render(i)})}).catch(i=>{l.signal.aborted||a({prepared:t,html:t.render([],i instanceof Error?i.message:"罚跑记录加载失败")})}),()=>l.abort()},[t]),t?t.needsRecords?o?.prepared===t?o.html:"":t.render([]):e}const lr='.forum-markup-floor .capubbs-gallery-quote{position:absolute;display:inline-flex;align-items:center;gap:4px;z-index:5;top:10px;right:10px;padding:4px 8px;border:1px solid rgb(255 255 255 / .25);border-radius:2px;background:#00000080;color:#fff;font:inherit;font-size:12px;line-height:1.5;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .15s ease,background .15s ease}.forum-markup-floor .capubbs-gallery-stage:hover .capubbs-gallery-quote,.forum-markup-floor .capubbs-gallery-stage:focus-within .capubbs-gallery-quote{opacity:1;pointer-events:auto}.forum-markup-floor .capubbs-gallery-quote:hover{background:#000000b8}.forum-markup-floor .capubbs-gallery-quote:focus-visible{outline:2px solid #fff;outline-offset:2px}@media(hover:none){.forum-markup-floor .capubbs-gallery-quote{opacity:1;pointer-events:auto}}.forum-markup .forum-punishment-table{display:table;width:-moz-max-content;width:max-content;min-width:100%;max-width:none;border-collapse:separate;border-spacing:0;transform-origin:top left}.forum-markup .forum-punishment-table :is(th,td){border:0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:9px;background:var(--surface);color:var(--text-muted);font:inherit;text-align:center;white-space:nowrap}.forum-markup .forum-punishment-table tbody tr:hover>td{background:var(--brand-faint, color-mix(in srgb, var(--brand) 8%, var(--surface)))}.forum-markup .forum-punishment-table tr>:last-child{border-right:0}.forum-markup .forum-punishment-table tbody tr:last-child>td{border-bottom:0}.forum-markup .forum-punishment-table th{background:var(--surface-soft);color:var(--text-faint);font-weight:780}.forum-markup .forum-punishment-record{box-sizing:border-box;min-width:0;max-width:100%;border:1px solid var(--line)}.forum-markup .forum-punishment-scroll{max-width:100%;overflow:hidden}.forum-markup .forum-punishment-title{padding:12px 14px;border-bottom:1px solid var(--line);background:var(--surface-soft);color:var(--text-strong);font-family:inherit;font-size:var(--ui-font-size-lg, 14px);font-weight:760;line-height:1.5;text-align:center}.forum-markup .forum-punishment-table .forum-punishment-empty{text-align:center}.forum-markup .forum-punishment-empty>.forum-table-cell-content{width:auto;max-width:none}:root{--surface: #fffefa;--surface-raised: #ffffff;--surface-soft: #f6f8f4;--text: #20231f;--text-strong: #111411;--text-muted: #687068;--text-faint: #919991;--line: #e1e6df;--line-strong: #cdd5cc;--brand: #236b4c;--brand-strong: #174f38;--danger: #b8473f}:root.dark{--surface: #171d19;--surface-raised: #1c241f;--surface-soft: #1f2822;--text: #dde5de;--text-strong: #f6faf6;--text-muted: #a0aca2;--text-faint: #748078;--line: #2c362f;--line-strong: #3c493f;--brand: #69b98d;--brand-strong: #8bcca6;--danger: #ef8178}::-moz-selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}::selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentcolor}blockquote,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}a{color:inherit;text-decoration:inherit}button{margin:0;padding:0;background-color:transparent;color:inherit;font:inherit;letter-spacing:inherit;text-transform:none}button:where(:not([style]):not([class])){min-height:32px;border:1px solid var(--line);border-radius:.5px;padding:4px 12px;background-color:var(--surface);color:var(--text-muted);font-size:14px;font-weight:680;line-height:1.5;vertical-align:middle;cursor:pointer;transition:background-color .14s ease,border-color .14s ease,color .14s ease}button:where(:not([style]):not([class]):hover:not(:disabled)){border-color:var(--line-strong);background-color:var(--surface-soft);color:var(--brand-strong)}button:where(:not([style]):not([class]):focus-visible){outline:2px solid var(--brand);outline-offset:2px}button:where(:not([style]):not([class]):disabled){cursor:not-allowed;opacity:.5}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}.capubbs-html-frame-root iframe{background-color:transparent!important}img,video{max-width:100%;height:auto}table{border-color:inherit;border-collapse:collapse;text-indent:0}.capubbs-activity-signup-canceled,.capubbs-activity-signup-canceled *{color:var(--danger)!important;text-decoration-color:var(--danger)!important;text-decoration-line:line-through!important;text-decoration-thickness:2px!important}.forum-markup>:first-child{margin-top:0}.forum-markup>:last-child{margin-bottom:0}.forum-markup p,.forum-markup div{margin:0}.forum-markup-floor p{margin:0 0 .75em}.forum-markup-floor>div+div{margin-top:.55em}.forum-markup a{color:var(--brand-strong);font-weight:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.16em}.forum-markup .forum-mention{text-decoration:none}.forum-markup blockquote{margin:0 0 0 2em;border:0;padding:0;background:transparent;color:inherit}.forum-markup blockquote.forum-quote,.forum-markup .forum-legacy-quote,.forum-markup blockquote.capubbs-floor-quote{margin:.8em 0;border-left:3px solid color-mix(in srgb,var(--brand) 38%,var(--line));padding:.55em .75em;background:var(--surface-soft);color:var(--text-muted)}.forum-markup .capubbs-floor-quote-jump{margin-left:.75em}.forum-markup .forum-legacy-quote-content{margin:0}.forum-markup h1,.forum-markup h2,.forum-markup h3,.forum-markup h4,.forum-markup h5,.forum-markup h6{margin:.9rem 0 .45rem;color:var(--brand-strong);font-weight:800;line-height:1.35}.forum-markup h1{font-size:1.45rem}.forum-markup h2{font-size:1.25rem}.forum-markup h3{font-size:1.1rem}.forum-markup h4,.forum-markup h5,.forum-markup h6{font-size:1em}.forum-markup ul,.forum-markup ol{margin:.65em 0;padding-left:1.45em}.forum-markup ul{list-style:disc}.forum-markup ol{list-style:decimal}.forum-markup ol.capubbs-ordered-list-alpha{list-style-type:lower-alpha}.forum-markup ol.capubbs-ordered-list-roman{list-style-type:lower-roman}.forum-markup pre{max-width:100%;overflow-x:auto;margin:.75em 0;border-radius:2px;padding:.75em;background:#182531;color:#f8fafc;white-space:pre-wrap}.forum-markup code,.forum-markup kbd{border-radius:2px;padding:.08em .25em;background:color-mix(in srgb,var(--surface-soft) 75%,var(--line));font-family:SFMono-Regular,Cascadia Code,Consolas,monospace;font-size:.9em}.forum-markup pre code{padding:0;background:transparent;color:inherit}.forum-markup font[size="1"]{font-size:11px}.forum-markup font[size="2"]{font-size:13px}.forum-markup font[size="3"]{font-size:15px}.forum-markup font[size="4"]{font-size:17px}.forum-markup font[size="5"]{font-size:19px}.forum-markup font[size="6"]{font-size:21px}.forum-markup font[size="7"]{font-size:23px}.forum-markup hr{margin:.9em 0;border:0;border-top:1px solid var(--line-strong)}.forum-markup img{display:inline-block;height:auto;max-width:100%;vertical-align:middle}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){color:transparent;font-size:0}.forum-markup .capubbs-gallery-slide img:not([data-capubbs-image-loaded=true]){opacity:0}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]),.forum-markup .capubbs-gallery-slide:has(img:not([data-capubbs-image-loaded=true])){background-color:color-mix(in srgb,var(--surface-soft) 82%,var(--line));background-image:linear-gradient(105deg,transparent 20%,color-mix(in srgb,var(--surface-raised) 70%,transparent) 45%,transparent 70%);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}.forum-markup img[role=button]{cursor:zoom-in}.forum-markup img[role=button]:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse}.forum-markup td,.forum-markup th{border:1px solid var(--line);padding:.35em .5em}.forum-markup-signature{color:#999;font-family:monospace;font-size:14px;line-height:1.6;overflow-wrap:anywhere}:root.dark .forum-markup-signature{color:#666}.forum-markup .capubbs-gallery{position:relative;display:block;width:100%;margin:.9rem 0;overflow:hidden;border:1px solid var(--line);border-radius:2px;background:transparent;color:var(--text)}.forum-markup .capubbs-gallery:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup .capubbs-gallery-header{position:relative;display:flex;min-height:44px;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:9px 12px;border-bottom:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-title{width:100%;min-width:0;margin:0;color:var(--text-strong);font-size:.82rem;font-weight:760;line-height:1.4;text-align:center}.forum-markup .capubbs-gallery-stage{position:relative;display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide{display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-slide>img{display:block;width:100%;height:var(--capubbs-gallery-image-height, clamp(280px, 52vw, 560px));max-width:none;margin:0 auto;border-radius:0;-o-object-fit:contain;object-fit:contain}.forum-markup .capubbs-gallery-caption{display:block;margin:0;color:var(--text-muted);font-size:.78rem;line-height:1.55;text-align:center}.forum-markup .capubbs-gallery-caption[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-footer{position:relative;display:flex;min-height:44px;align-items:center;justify-content:center;margin:0;padding:9px 12px;border-top:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-captions{width:100%;min-width:0;margin:0;padding-inline:48px;text-align:center}.forum-markup .capubbs-gallery-count{position:absolute;top:50%;right:12px;color:var(--text-faint);font-size:.72rem;font-variant-numeric:tabular-nums;font-weight:760;line-height:1.25;transform:translateY(-50%)}.forum-markup .capubbs-gallery-count[data-capubbs-gallery-current]:before{content:attr(data-capubbs-gallery-current) "/" attr(data-capubbs-gallery-total)}.forum-markup .capubbs-gallery-nav{position:absolute;z-index:4;top:50%;display:grid;width:36px;height:48px;place-items:center;padding:0;transform:translateY(-50%);border:1px solid rgb(255 255 255 / .25);border-radius:2px;background:#00000080;color:#fff;cursor:pointer;transition:.15s ease}.forum-markup .capubbs-gallery-nav:hover{background:#000000b8}.forum-markup .capubbs-gallery-nav:focus-visible{outline:2px solid #fff;outline-offset:2px}.forum-markup .capubbs-gallery-nav:before{font-family:Arial,sans-serif;font-size:2rem;font-weight:300;line-height:1}.forum-markup .capubbs-gallery-nav-prev:before{content:"‹"}.forum-markup .capubbs-gallery-nav-next:before{content:"›"}.forum-markup .capubbs-gallery-nav-prev{left:10px}.forum-markup .capubbs-gallery-nav-next{right:10px}@keyframes capubbs-image-loading{0%{background-position:120% 0}to{background-position:-80% 0}}@media(max-width:640px){.forum-markup .capubbs-gallery-slide>img{height:var(--capubbs-gallery-image-height, min(72vw, 420px))}.forum-markup .capubbs-gallery-nav{width:32px;height:42px}.forum-markup .capubbs-gallery-nav-prev{left:7px}.forum-markup .capubbs-gallery-nav-next{right:7px}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]),.forum-markup .capubbs-gallery-slide:has(img:not([data-capubbs-image-loaded=true])){animation:none}}:is(.forum-markup,.capubbs-editor-prose) .capubbs-gallery[data-capubbs-gallery-tag]>.capubbs-gallery-header[hidden]{display:none}@media(max-width:640px){:is(.forum-markup,.capubbs-editor-prose) .capubbs-gallery[data-capubbs-gallery-tag] .capubbs-gallery-stage,:is(.forum-markup,.capubbs-editor-prose) .capubbs-gallery[data-capubbs-gallery-tag] .capubbs-gallery-slide>img{height:min(var(--capubbs-gallery-image-height, 420px),72vw)}}',cr="/bbs/new-assets/threadHtmlBootstrap-x4mBAuLM.html";function ur(e,r){const t=new URL(e);return t.pathname=/Android|iPhone|iPad|iPod|Mobile/i.test(r)?"/m/outchain/player":"/outchain/player",t.href}function xe(e,r){try{const t=new URL(e,r);return!(t.hostname==="player.bilibili.com"&&t.pathname==="/player.html"||t.hostname==="music.163.com"&&["/outchain/player","/m/outchain/player"].includes(t.pathname))||!["http:","https:"].includes(t.protocol)||t.username||t.password||t.port?null:(t.protocol="https:",t.href)}catch{return null}}function dr(e,r){const t=new URL(e);return t.hostname==="music.163.com"?(t.searchParams.set("auto","0"),ur(t.href,r)):(t.searchParams.set("autoplay","0"),t.href)}function mr(e){if(!e)return{left:0,top:0};const r=window.getComputedStyle(e);return{left:e.offsetLeft+e.clientLeft+(Number.parseFloat(r.paddingLeft)||0),top:e.offsetTop+e.clientTop+(Number.parseFloat(r.paddingTop)||0)}}function pr(e){if(!e||typeof e!="object")return!1;const r=e;return typeof r.id=="string"&&typeof r.src=="string"&&xe(r.src,"https://music.163.com")===r.src&&["left","top","width","height"].every(t=>{const o=r[t];return typeof o=="number"&&Number.isFinite(o)&&Math.abs(o)<=1e5})&&r.width>0&&r.height>0}const $e=64*1024*1024,Pe=6,gr=2,re=new Map,se=new Map,K=new Map,Y=new Map;let fe=!1;function he(e){const r=e.priorities.map(t=>t());return r.includes("high")?"high":r.includes("low")?"low":r.includes("deferred")?"deferred":null}function z(){fe||!K.size&&!Y.size||(fe=!0,setTimeout(()=>{fe=!1;const e=[];K.forEach((i,s)=>{const u=he(i);if(u===null){K.delete(s),re.delete(s),i.reject(new DOMException("图片所在内容已卸载","AbortError"));return}u!=="deferred"&&e.push({source:s,request:i,priority:u})}),e.sort((i,s)=>+(s.priority==="high")-+(i.priority==="high"));const r=Array.from(Y.values(),i=>({download:i,priority:he(i.request)}));r.forEach(({download:i,priority:s})=>{s===null&&i.controller.abort()});const t=r.filter(({download:i})=>i.controller.signal.aborted).length;let o=e.filter(({priority:i})=>i==="high").length-(Pe-Y.size+t);const a=r.filter(({download:i,priority:s})=>s!=="high"&&!i.controller.signal.aborted).sort((i,s)=>+(s.priority==="deferred")-+(i.priority==="deferred"));for(const{download:i}of a){if(o<=0)break;o-=1,i.preempted=!0,i.controller.abort()}let l=r.filter(({priority:i})=>i!=="high").length;for(const{source:i,request:s,priority:u}of e){if(Y.size>=Pe)break;u==="low"&&l>=gr||(K.delete(i),u==="low"&&(l+=1),fr(i,s,u))}},0))}function fr(e,r,t){const o={request:r,controller:new AbortController,preempted:!1};Y.set(e,o),hr(e,t,o.controller.signal).then(a=>{o.controller.signal.throwIfAborted();const l={blob:a,objectUrl:URL.createObjectURL(a),sourceUrl:e};se.set(e,l),r.resolve(l)}).catch(a=>{o.preempted||o.controller.signal.aborted&&he(r)!==null?K.set(e,r):(re.delete(e),r.reject(a))}).finally(()=>{Y.delete(e),z()})}function Ke(e){return new URL(e,new URL("/bbs/content/",window.location.origin)).href}function Me(e,r=()=>"high"){const t=Ke(e),o=re.get(t);if(o)return(K.get(t)??Y.get(t)?.request)?.priorities.push(r),z(),o;const a=new Promise((l,i)=>{K.set(t,{priorities:[r],reject:i,resolve:l})});return re.set(t,a),z(),a}function hr(e,r,t){const o=new URL(e);return o.origin!==window.location.origin||!o.pathname.startsWith("/bbs/images/")&&!o.pathname.startsWith("/bbsimg/")?Promise.reject(new Error("仅代理论坛图片目录")):fetch(e,{credentials:"same-origin",referrerPolicy:"no-referrer",priority:r,signal:t}).then(async a=>{if(!a.ok)throw new Error(`图片加载失败：${a.status}`);if(!(a.headers.get("content-type")?.toLowerCase()??"").startsWith("image/"))throw new Error("图片响应类型无效");const i=Number.parseInt(a.headers.get("content-length")??"",10);if(Number.isFinite(i)&&i>$e)throw new Error("图片大小超出限制");const s=await a.blob();if(s.size>$e)throw new Error("图片大小超出限制");return s})}function br(e){try{return se.get(Ke(e))?.objectUrl}catch{return}}typeof window<"u"&&(window.addEventListener("scroll",z,{passive:!0,capture:!0}),window.addEventListener("resize",z),window.addEventListener("pagehide",e=>{e.persisted||(se.forEach(r=>URL.revokeObjectURL(r.objectUrl)),se.clear(),re.clear())}));function yr(e,r,t){let o="deferred";for(const a of r){const l=a.right>a.left&&a.bottom>a.top&&e.top+a.bottom>Math.max(0,e.top)&&e.top+a.top<Math.min(t.height,e.bottom)&&e.left+a.right>Math.max(0,e.left)&&e.left+a.left<Math.min(t.width,e.right);if(a.gallery){if(!l||a.gallery==="deferred")continue;if(a.gallery==="current")return"high";o="low"}else{if(l)return"high";o="low"}}return o}const xr=28,vr=64,wr=5e4,Ir=30,Ye=30,R="capubbs-thread-html-frame",Qe=new URL("/bbs/lib/jquery.min.js",window.location.origin).href,Ar=Lr(lr),Sr=/\son[a-z][\w:-]*\s*=/i;let oe=null;function Fe({className:e="",floor:r,html:t,isActivitySignupCanceled:o=!1,onImageOpen:a,onImageQuote:l,onIsolatedTextSelection:i,variant:s}){const u=d.useMemo(()=>s==="signature"?Ot(t):t,[t,s]),p=Rr(u,s==="signature"),m=ir(p,s==="floor"),h=gt(m),c=d.useMemo(()=>h?null:ft(m,{normalizeLegacyLineBreaks:s==="signature"}),[m,h,s]),b=d.useMemo(()=>ht(m),[m]);return!h&&c!==null?n.jsx(Je,{className:e,html:c,onImageOpen:a,onImageQuote:l,variant:s}):n.jsx(kr,{className:e,floor:r,html:b,isActivitySignupCanceled:o,onImageOpen:a,onImageQuote:l,onTextSelection:i,variant:s})}function kr({className:e,floor:r,html:t,isActivitySignupCanceled:o,onImageOpen:a,onImageQuote:l,onTextSelection:i,variant:s}){const u=d.useRef(null),p=d.useRef(`${s}-${r}-${Math.random().toString(36).slice(2)}`),m=d.useRef(l);m.current=l;const h=s==="floor"&&!!l,c=d.useRef(a);c.current=a;const b=d.useRef(i);b.current=i;const x=s==="signature"?xr:vr,f=!!a,[y,w]=d.useState(null),[E,M]=d.useState(null),N=Pr(),S=d.useRef(N),O=yt(),D=s==="signature"?14:O,H=d.useMemo(()=>qr(jr(t)),[t]),U=H.includes('type="text/capubbs-user-script"')||Sr.test(H),Q=d.useMemo(()=>Er({canOpenImages:f,canQuoteImages:h,frameId:p.current,needsJquery:U,html:H,isActivitySignupCanceled:o,isDarkTheme:S.current,fontSize:D,variant:s}),[f,h,H,D,o,U,s]),T=d.useMemo(()=>Math.random().toString(36).slice(2),[Q]),X=d.useMemo(()=>`${cr}#${new URLSearchParams({frameId:p.current,token:T})}`,[T]),G=d.useCallback(()=>{u.current?.contentWindow?.postMessage({source:R,type:"document-response",frameId:p.current,token:T,html:Q},"*")},[T,Q]),_=d.useCallback(()=>{u.current?.contentWindow?.postMessage({frameId:p.current,source:R,theme:N?"dark":"light",type:"theme"},"*")},[N]),W=d.useCallback((k=u.current?.contentWindow)=>{!U||!k||ze().then(P=>{u.current?.contentWindow===k&&k.postMessage({frameId:p.current,jquerySource:P,source:R,type:"jquery-response"},"*")})},[U]),V=d.useCallback(()=>{G(),_(),W()},[G,W,_]);d.useEffect(()=>{w(null)},[X]),d.useEffect(()=>{_()},[_]),d.useEffect(()=>{U&&ze()},[U]),d.useLayoutEffect(()=>{z()},[y]),d.useLayoutEffect(()=>{let k=!0;const P=new Map;function B(v){const J=u.current?.contentWindow;if(!(!J||v.source!==J||!$r(v.data))&&v.data.frameId===p.current){if(v.data.type==="embedded-player-layout"){M({token:T,players:v.data.players});return}if(v.data.type==="document-request"){v.data.token===T&&G();return}if(v.data.type==="jquery-request"){W(J);return}if(v.data.type==="image-resource-layout"){P.has(v.data.requestId)&&(P.set(v.data.requestId,v.data.bounds),z());return}if(v.data.type==="image-resource-request"){const I=J,L=v.data.requestId;P.set(L,v.data.bounds);const A=()=>{const q=u.current;return!k||!q||q.contentWindow!==I?null:yr(q.getBoundingClientRect(),P.get(L)??[],{width:window.innerWidth,height:window.innerHeight})};Me(v.data.url,A).then(q=>{!k||u.current?.contentWindow!==I||I.postMessage({blob:q.blob,priority:A(),frameId:p.current,requestId:v.data.requestId,source:R,type:"image-resource-response"},"*")}).catch(()=>{!k||u.current?.contentWindow!==I||I.postMessage({priority:A(),frameId:p.current,requestId:v.data.requestId,source:R,type:"image-resource-error"},"*")}).finally(()=>P.delete(L));return}if(v.data.type==="anchor"){const I=u.current;if(!I)return;const L=window.getComputedStyle(document.documentElement),A=Number.parseFloat(L.getPropertyValue("--topbar-height"))||0,q=window.scrollY+I.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,q+v.data.offsetTop-A-16)});return}if(v.data.type==="navigate"){const I=xt(v.data.url,ve());if(!I)return;window.history.pushState(null,"",I),window.dispatchEvent(new Event(vt));const L=new URL(I,window.location.origin);L.hash?window.requestAnimationFrame(()=>{const A=decodeURIComponent(L.hash.slice(1)),q=wt(`#${A}`);(q?It(q):document.getElementById(A))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(v.data.type==="image-quote"){m.current?.(v.data.image);return}if(v.data.type==="image-open"){const I=u.current;if(!I)return;const L=Array.from(I.contentDocument?.querySelectorAll("img")??[]),A=v.data.images.map($=>({...$,element:typeof $.elementIndex=="number"?L[$.elementIndex]:void 0,src:br($.src)??$.src,loadSource:j=>(j.addEventListener("abort",z,{once:!0}),Me($.src,()=>j.aborted?null:"high").then(ae=>ae.objectUrl,()=>$.src).finally(()=>j.removeEventListener("abort",z)))})),q=$=>{const j=A[$];!j||typeof j.galleryId!="number"||!Number.isSafeInteger(j.galleryIndex)||I.contentWindow?.postMessage({frameId:p.current,galleryId:j.galleryId,galleryIndex:j.galleryIndex,source:R,type:"gallery-select"},"*")};c.current?.(A,v.data.imageIndex,I,q);return}if(v.data.type==="selection"){v.data.text&&window.getSelection()?.removeAllRanges(),b.current?.(v.data.text);return}w(Math.min(wr,Math.max(x,Math.ceil(v.data.height))))}}return window.addEventListener("message",B),()=>{k=!1,P.clear(),window.removeEventListener("message",B),z()}},[T,X,x,G,W]);const Z=mr(u.current);return n.jsxs("div",{className:"thread-html-frame-container",children:[n.jsx("iframe",{ref:u,className:`thread-html-frame thread-html-frame-${s} ${e}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-downloads",scrolling:"no",src:X,onLoad:V,style:{"--thread-html-frame-width-allowance":`${Ye}px`,...y===null?{}:{"--thread-html-frame-height":`${y}px`}},title:s==="signature"?`第 ${r} 楼签名档`:`第 ${r} 楼正文`},T),E?.token===T?E.players.map(k=>n.jsx("iframe",{className:"thread-embedded-player",src:dr(k.src,navigator.userAgent),title:new URL(k.src).hostname==="player.bilibili.com"?"哔哩哔哩播放器":"网易云音乐播放器",allow:"autoplay; fullscreen; picture-in-picture",allowFullScreen:!0,scrolling:"no",style:{left:k.left+Z.left,top:k.top+Z.top,width:k.width,height:k.height}},`${T}-${k.id}`)):null]})}function Rr(e,r){const[t,o]=d.useState(e);return d.useEffect(()=>{const a=new AbortController,l=r?Dt(e):[];if(o(e),l.length===0)return()=>a.abort();const i=Array.from(new Map(l.map(s=>[`${s.bid}:${s.tid}:${s.pid}`,s])).values());return Promise.all(i.map(async s=>{try{const u=await bt(s,a.signal);return[`${s.bid}:${s.tid}:${s.pid}`,u]}catch(u){if(u instanceof DOMException&&u.name==="AbortError")throw u;return[`${s.bid}:${s.tid}:${s.pid}`,""]}})).then(s=>{if(a.signal.aborted)return;const u=new Map(s);let p=e;l.forEach(m=>{const h=u.get(`${m.bid}:${m.tid}:${m.pid}`);h&&(p=p.replace(m.marker,h))}),o(p)}).catch(()=>{}),()=>a.abort()},[r,e]),t}function Er({canOpenImages:e,canQuoteImages:r,frameId:t,fontSize:o,needsJquery:a,html:l,isActivitySignupCanceled:i,isDarkTheme:s,variant:u}){const p=u==="signature",m=p?"#999999":"rgb(63 63 70)",h=p?"#666666":"rgb(228 228 231)",c=p?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",b=p?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",x=i?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${s?"dark":"light"}" style="background:transparent;color-scheme:${s?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${Tr(ve())}">
  <meta http-equiv="Content-Security-Policy" content="${Nr()}">
  <style>${Ar}</style>
  <style>
    html{--capubbs-frame-text-color:${m}}html.dark{--capubbs-frame-text-color:${h}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${c};font-size:${o}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${Ye}px);${b}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${Cr(t,e,a,r)}<\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${u}${x}">${l}</main></body>
</html>`}function Cr(e,r,t,o=!1){return`(function(){
    var frameId=${JSON.stringify(e)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(At)};
    var canOpenImages=${JSON.stringify(r)};
    var canQuoteImages=${JSON.stringify(o)};
    var ensureGalleryQuoteControls=${Be.toString()};
    var needsJquery=${JSON.stringify(t)};
    var preparePunishmentTableFit=${Ve.toString()};
    var getGalleryImageState=${St.toString()};
    var normalizeEmbeddedPlayerUrl=${xe.toString()};
    var playerIds=new WeakMap();
    var nextPlayerId=0;
    var lastPlayerLayout='';
    var jquerySourceUrl=${JSON.stringify(Qe)};
    var forumAppExactPaths=${JSON.stringify(kt)};
    var forumAppPathPrefixes=${JSON.stringify(Rt)};
    var legacyForumExactPaths=${JSON.stringify(Et)};
    var legacyForumPathPatterns=${JSON.stringify(Ct)}.map(function(pattern){return new RegExp(pattern);});
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
      window.parent.postMessage({source:'${R}',type:'resize',frameId:frameId,height:height},'*');
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
      window.parent.postMessage({source:'${R}',type:'embedded-player-layout',frameId:frameId,players:players},'*');
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
      window.parent.postMessage({source:'${R}',type:'selection',frameId:frameId,text:text},'*');
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
        window.parent.postMessage({source:'${R}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${R}',type:'navigate',frameId:frameId,url:url},'*');
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
      window.parent.postMessage({source:'${R}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
      window.parent.postMessage({source:'${R}',type:'image-resource-layout',frameId:frameId,requestId:requestId,bounds:getImageResourceBounds(request.images)},'*');
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
          source:'${R}',
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
      if(canQuoteImages)ensureGalleryQuoteControls(document,function(image){
        window.parent.postMessage({source:'${R}',type:'image-quote',frameId:frameId,image:image},'*');
      });
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
      if(event.source!==window.parent||!data||data.source!=='${R}'||data.frameId!==frameId)return;
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
      if(needsJquery)window.parent.postMessage({source:'${R}',type:'jquery-request',frameId:frameId},'*');
      else executeUserScripts();
      prepareImages();
      prepareGalleries();
      requestImageResources();
      syncGrayscaleTextColors(contentRoot);
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`}function jr(e){return e.replace(/<script\b([^>]*)>/gi,(r,t)=>`<script${t.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function qr(e){if(!/<(?:img|iframe)\b/i.test(e))return e;const r=document.createElement("template");return r.innerHTML=e,r.content.querySelectorAll("iframe[src]").forEach(t=>{const o=xe(t.getAttribute("src")??"",ve());o&&(t.dataset.capubbsPlayerSrc=o,t.removeAttribute("src"))}),r.content.querySelectorAll("img[src]").forEach(t=>{const o=t.getAttribute("src")?.trim()??"";!o||/^(?:blob:|data:)/i.test(o)||(t.dataset.capubbsImageResourceSrc=o,t.setAttribute("fetchpriority","low"),t.removeAttribute("src"),t.removeAttribute("srcset"),t.closest("picture")?.querySelectorAll("source[srcset]").forEach(a=>{a.removeAttribute("srcset")}))}),r.innerHTML}function ze(){return oe||(oe=fetch(Qe,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw new Error(`Failed to load jQuery: ${e.status}`);return e.text()}).catch(()=>null),oe)}function Nr(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'","upgrade-insecure-requests"].join("; ")}function ve(){return new URL("/bbs/content/",window.location.origin).href}function Tr(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Lr(e){return e.replace(/<\/style/gi,"<\\/style")}function $r(e){if(!e||typeof e!="object")return!1;const r=e;if(r.source!==R||typeof r.frameId!="string")return!1;if(r.type==="image-quote"){const t=r.image;if(!t||typeof t.src!="string"||typeof t.title!="string"||typeof t.caption!="string")return!1;try{return["http:","https:"].includes(new URL(t.src).protocol)}catch{return!1}}return r.type==="embedded-player-layout"?Array.isArray(r.players)&&r.players.every(pr):r.type==="document-request"?typeof r.token=="string":r.type==="anchor"?typeof r.offsetTop=="number"&&Number.isFinite(r.offsetTop)&&r.offsetTop>=0:r.type==="navigate"?typeof r.url=="string":r.type==="jquery-request"?!0:r.type==="image-resource-request"||r.type==="image-resource-layout"?typeof r.requestId=="string"&&r.requestId.length>0&&Array.isArray(r.bounds)&&r.bounds.every(t=>t&&(t.gallery===void 0||["current","adjacent","deferred"].includes(t.gallery))&&["top","bottom","left","right"].every(o=>typeof t[o]=="number"&&Number.isFinite(t[o])))&&(r.type==="image-resource-layout"||"url"in r&&typeof r.url=="string"&&r.url.length>0):r.type==="selection"?typeof r.text=="string":r.type==="image-open"?typeof r.imageIndex=="number"&&Number.isSafeInteger(r.imageIndex)&&Array.isArray(r.images)&&r.images.length>0&&r.imageIndex>=0&&r.imageIndex<r.images.length&&r.images.every(t=>!!t&&typeof t=="object"&&typeof t.alt=="string"&&typeof t.elementIndex=="number"&&Number.isSafeInteger(t.elementIndex)&&t.elementIndex>=0&&typeof t.src=="string"&&t.src.length>0&&(t.galleryId===void 0&&t.galleryIndex===void 0||typeof t.galleryId=="number"&&Number.isSafeInteger(t.galleryId)&&t.galleryId>=0&&typeof t.galleryIndex=="number"&&Number.isSafeInteger(t.galleryIndex)&&t.galleryIndex>=0)):r.type==="resize"&&typeof r.height=="number"&&Number.isFinite(r.height)}function Pr(){const[e,r]=d.useState(()=>document.documentElement.classList.contains("dark"));return d.useEffect(()=>{const t=document.documentElement,o=()=>r(t.classList.contains("dark")),a=new MutationObserver(o);return a.observe(t,{attributeFilter:["class"],attributes:!0}),()=>a.disconnect()},[]),e}function Mr({attachments:e=[],bodyClassName:r="thread-floor-body",bodyFallback:t=null,bodyHtml:o,floor:a,isActivitySignupCanceled:l=!1,onImageOpen:i,onImageQuote:s,onIsolatedTextSelection:u,signatureClassName:p="thread-signature",signatureHtml:m,signatureText:h}){const c=i?(b,x,f,y)=>{const w=b[x];w&&i([w],0,f,y?()=>y(x):void 0)}:void 0;return n.jsxs(n.Fragment,{children:[o?n.jsx(Fe,{className:r,floor:a,html:o,isActivitySignupCanceled:l,onImageOpen:i,onImageQuote:s,onIsolatedTextSelection:u,variant:"floor"}):t,n.jsx(Fr,{attachments:e}),m?n.jsx(Fe,{className:p,floor:a,html:m,onImageOpen:c,variant:"signature"}):h?n.jsx("footer",{className:p,children:n.jsx("p",{children:h})}):null]})}function Fr({attachments:e}){return e.length===0?null:n.jsxs("section",{"aria-label":"附件",className:"thread-attachments",children:[n.jsxs("header",{className:"thread-attachments-heading",children:[n.jsx(Bt,{"aria-hidden":"true",size:14}),n.jsx("span",{children:"附件"}),n.jsx("small",{children:e.length})]}),n.jsx("ul",{children:e.map(r=>{const t=n.jsxs(n.Fragment,{children:[n.jsx("span",{className:"thread-attachment-name",children:r.name}),n.jsx("small",{children:zr(r)}),r.exists!==!1&&n.jsx(jt,{"aria-hidden":"true",size:15})]});return n.jsx("li",{children:r.exists===!1?n.jsx("div",{"aria-disabled":"true",className:"thread-attachment-link is-unavailable",children:t}):n.jsx("a",{className:"thread-attachment-link",download:r.name,href:r.downloadHref||`/bbs/download/?id=${encodeURIComponent(r.id)}`,children:t})},r.id)})})]})}function zr(e){if(e.exists===!1)return"文件不可用";const r=[Or(e.size),(e.price??0)>0?"付费附件":"免费"];return e.downloadCount!==void 0&&r.push(`下载 ${e.downloadCount} 次`),r.join(" · ")}function Or(e){if(e<=0)return"大小未知";if(e<1024)return`${e} B`;const r=["KB","MB","GB","TB"];let t=e,o=-1;do t/=1024,o+=1;while(t>=1024&&o<r.length-1);return`${t.toFixed(t>=10?1:2)} ${r[o]}`}function Dr({author:e,id:r}){const t=e.tags??[],[o,a]=d.useState(!1),l=d.useRef(null),i=d.useRef(null),s=d.useRef(null),u=d.useRef(null),p=t.map(m=>`${m.id}:${m.name}`).join("|");return d.useLayoutEffect(()=>{if(t.length===0){a(!1);return}const m=()=>{const c=l.current,b=i.current,x=s.current,f=u.current;if(!c||!b||!x||!f||c.offsetWidth===0)return;const y=x.getBoundingClientRect().width,w=f.getBoundingClientRect().width,E=Number.parseFloat(getComputedStyle(b).columnGap)||0,M=b.clientWidth-y-E,N=w>M+1;a(S=>S===N?S:N)};m();const h=new ResizeObserver(m);return[l.current,i.current,u.current].forEach(c=>{c&&h.observe(c)}),()=>h.disconnect()},[p,t.length]),n.jsxs("div",{id:r,ref:l,className:"author-hover-card",role:"dialog","aria-label":`${e.name} 的用户摘要`,children:[n.jsxs("div",{className:"author-card-head",children:[n.jsx("img",{src:e.avatar,alt:""}),n.jsxs("div",{className:"author-card-head-copy",children:[n.jsxs("div",{ref:i,className:"author-card-name-line","data-tags-overflow":o?"true":void 0,children:[n.jsx("strong",{ref:s,children:e.name}),n.jsx("div",{className:"author-card-tag-slot",children:n.jsx(ce,{size:"compact",tags:t})})]}),(e.stars>0||e.role)&&n.jsxs("span",{className:"author-card-status",children:["★".repeat(e.stars),e.stars>0&&e.role?" · ":"",e.role]})]})]}),o?n.jsx("div",{className:"author-card-tags-row",children:n.jsx(ce,{size:"compact",tags:t})}):null,e.medals?.length?n.jsx("div",{className:"author-card-medals",children:n.jsx(_e,{medals:e.medals,profileName:e.name,variant:"compact"})}):null,n.jsx("div",{ref:u,className:"author-card-tag-width-measure","aria-hidden":"true",children:n.jsx(ce,{size:"compact",tags:t})}),n.jsxs("dl",{children:[n.jsxs("div",{children:[n.jsx("dt",{children:"主题"}),n.jsx("dd",{children:e.topics})]}),n.jsxs("div",{children:[n.jsx("dt",{children:"回复"}),n.jsx("dd",{children:e.replies})]}),n.jsxs("div",{children:[n.jsx("dt",{children:"签到"}),n.jsx("dd",{children:e.checkins})]})]}),n.jsxs("p",{children:["最近在线：",e.lastSeen]}),n.jsxs("a",{href:te(e.name),children:["查看个人主页 ",n.jsx($t,{size:13})]})]})}function Hr({author:e}){const r=e.tags??[],t=Ge(r),o=te(e.name);return n.jsxs("aside",{className:"thread-author-profile","aria-label":`${e.name} 的资料`,children:[n.jsx("a",{"aria-label":`查看${e.name}的个人主页`,className:"thread-author-profile-avatar",href:o,children:n.jsx("img",{src:e.avatar,alt:""})}),n.jsx("div",{className:"thread-author-profile-identity",children:n.jsx("a",{href:o,children:e.name})}),(e.stars>0||e.role)&&n.jsxs("div",{className:"thread-author-profile-status",children:[e.stars>0&&n.jsx("span",{"aria-label":`${e.stars} 星`,children:"★".repeat(e.stars)}),e.role&&n.jsx("strong",{children:e.role})]}),n.jsx(Ue,{tags:t}),n.jsx(_e,{medals:e.medals??[],profileName:e.name,variant:"compact"}),n.jsxs("dl",{className:"thread-author-profile-stats",children:[n.jsxs("div",{children:[n.jsx("dt",{children:"主题"}),n.jsx("dd",{children:e.topics})]}),n.jsxs("div",{children:[n.jsx("dt",{children:"回复"}),n.jsx("dd",{children:e.replies})]}),n.jsxs("div",{children:[n.jsx("dt",{children:"签到"}),n.jsx("dd",{children:e.checkins})]})]}),n.jsxs("p",{className:"thread-author-profile-last-seen",children:[n.jsx("span",{children:"最近在线"}),n.jsx("strong",{children:e.lastSeen})]})]})}function be(e){return e.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function Ur(e){const r=window.getSelection()?.toString();r&&(e.preventDefault(),e.clipboardData.setData("text/plain",r))}function Gr({articleAfterContent:e,author:r,avatarRail:t,className:o="",content:a,decorationImageSrc:l,editedAt:i,floor:s,floorIndex:u,id:p,inlineAvatar:m=!1,mainAfterContent:h,onCopy:c,publishedAt:b,showAuthorProfile:x}){const f=r.tags??[],y=Ge(f);return n.jsxs("article",{className:`thread-floor${x?" thread-floor-with-author-profile":""}${o?` ${o}`:""}`,"data-floor":s,id:p,onCopy:c,children:[l&&n.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:n.jsx("img",{alt:"",src:l})}),x?n.jsx(Hr,{author:r}):!m&&t,n.jsxs("div",{className:"thread-floor-main",children:[n.jsxs("header",{className:"thread-floor-header",children:[!x&&m&&t,n.jsxs("div",{className:"thread-floor-author",children:[n.jsx("a",{href:te(r.name),children:r.name}),n.jsx(Ue,{tags:y})]}),n.jsxs("div",{className:"thread-floor-time",children:[n.jsx("time",{children:be(b)}),i&&n.jsxs(n.Fragment,{children:[n.jsx("span",{children:"·"}),n.jsxs("time",{children:["编辑于 ",be(i)]})]})]}),u]}),x?n.jsx("div",{className:"thread-floor-content",children:a}):a,h]}),e]})}function _r({canDelete:e,canEdit:r,canQuote:t,canReply:o,decorative:a=!1,deleting:l=!1,editHref:i="",onDelete:s,onEditSignup:u,onQuote:p,onReply:m}){const h=a?-1:void 0,c=d.useRef(null);return n.jsxs("div",{"aria-hidden":a||void 0,className:`thread-floor-actions${a?" thread-floor-actions-decorative":""}`,children:[t&&n.jsxs("button",{onClick:b=>{const x=c.current?c.current.text:Oe(b.currentTarget);c.current=null,p?.(x)},onPointerDown:b=>{b.button===0&&(c.current={text:Oe(b.currentTarget)})},tabIndex:h,type:"button",children:[n.jsx(Lt,{size:15}),"引用"]}),u&&!a&&n.jsxs("button",{onClick:u,type:"button",children:[n.jsx(de,{size:15}),"编辑报名"]}),o&&n.jsxs("button",{onClick:m,tabIndex:h,type:"button",children:[n.jsx(Vt,{size:15}),"回复"]}),r&&(a?n.jsxs("button",{tabIndex:-1,type:"button",children:[n.jsx(de,{size:15}),"编辑"]}):n.jsxs("a",{href:i,children:[n.jsx(de,{size:15}),"编辑"]})),e&&n.jsxs("button",{"aria-busy":l||void 0,className:"floor-action-danger",disabled:!a&&l,onClick:a?void 0:b=>s?.(b.currentTarget),tabIndex:h,type:"button",children:[n.jsx(ye,{size:15}),l?"删除中":"删除"]})]})}function ta({canQuote:e,canReply:r,decorationImageSrc:t,editHref:o,floor:a,isActivityThread:l,isMainPost:i,inlineAvatar:s,showAuthorProfile:u,hideSignature:p,onDeleteFloor:m,onDeleteNestedReply:h,onEditSignup:c,onIsolatedTextSelection:b,onQuote:x,onSubmitNestedReply:f,viewer:y}){const[w,E]=d.useState(!1),[M,N]=d.useState(null),[S,O]=d.useState([]),[D,H]=d.useState(""),[U,Q]=d.useState(!1),[T,X]=d.useState([]),[G,_]=d.useState(""),[W,V]=d.useState(""),[Z,k]=d.useState(null),[P,B]=d.useState(""),[v,J]=d.useState(!1),[I,L]=d.useState(void 0),A=Yt(G),q=qt(":scope > article"),$=`nested-reply-count-${a.id}`,[j,ae]=d.useState(null),[ne,we]=d.useState(!1),Ie=d.useRef(null),ee=d.useRef(null),ie=d.useRef(null),Ae=d.useRef(null),Se=d.useRef(null),ke=d.useMemo(()=>[...a.nestedReplies??[],...T].filter(g=>!S.includes(g.id)),[S,a.nestedReplies,T]),Re=l&&!i&&/<\s*(?:s|strike)\b/i.test(a.contentHtml??""),Ee=`thread-floor-body${Re?" capubbs-activity-signup-canceled":""}`;d.useEffect(()=>()=>{ee.current!==null&&window.clearTimeout(ee.current)},[]),d.useEffect(()=>{if(!ne)return;function g(C){Ie.current?.contains(C.target)||we(!1)}return document.addEventListener("pointerdown",g),()=>document.removeEventListener("pointerdown",g)},[ne]);async function Xe(){const g=`${window.location.origin}${window.location.pathname}${window.location.search}#${a.floor}`;await Jt(g)&&(E(!0),ee.current!==null&&window.clearTimeout(ee.current),ee.current=window.setTimeout(()=>E(!1),1800))}const Ce=(g,C,F,le)=>{Se.current=F,ae({imageIndex:C,images:g,onImageChange:le})};function Ze(g){j?.onImageChange?.(g),ae(null),window.requestAnimationFrame(()=>Se.current?.focus())}function je(g=null){L(g),_(""),V(""),B(""),window.requestAnimationFrame(()=>Ae.current?.focus())}function qe(){L(void 0),_(""),B("")}async function et(g){g.preventDefault();const C=G.trim();if(!(!A.canSubmit||!y||!r||v)){J(!0),B("");try{const F=await f(a,I??null,C);X(le=>[...le,{author:y,canDelete:!0,content:C,id:F>0?String(F):`local-${a.id}-${Date.now()}`,publishedAt:Vr(new Date),target:I??void 0}]),qe()}catch(F){B(F instanceof Error?F.message:"楼中楼回复发布失败，请稍后重试。")}finally{J(!1)}}}async function tt(g){k(g.id),V("");try{await h(a,g),O(C=>[...C,g.id]),X(C=>C.filter(F=>F.id!==g.id)),N(null)}catch(C){V(C instanceof Error?C.message:"楼中楼删除失败，请稍后重试。")}finally{k(null)}}async function rt(){if(!U){Q(!0),H("");try{await m(a)}catch(g){H(g instanceof Error?g.message:"楼层删除失败，请稍后重试。"),Q(!1)}}}function at(){N(null),H(""),V(""),window.requestAnimationFrame(()=>ie.current?.focus())}function nt(){if(!M)return;const g=M;N(null),g.kind==="floor"?rt():tt(g.reply)}const ot=n.jsxs("div",{className:`thread-avatar-rail${ne?" thread-avatar-rail-open":""}`,ref:Ie,children:[n.jsx("button",{"aria-controls":`author-card-${a.floor}`,"aria-expanded":ne,"aria-label":`查看${a.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>we(g=>!g),type:"button",children:n.jsx("img",{src:a.author.avatar,alt:""})}),n.jsx(Dr,{author:a.author,id:`author-card-${a.floor}`})]}),st=n.jsx(Mr,{attachments:a.attachments,bodyFallback:n.jsx("div",{className:Ee,children:a.paragraphs.map(g=>n.jsx("p",{children:g},g))}),bodyClassName:Ee,bodyHtml:a.contentHtml,floor:a.floor,isActivitySignupCanceled:Re,onImageOpen:Ce,onImageQuote:e?g=>x(a,void 0,g):void 0,onIsolatedTextSelection:g=>b(a,g),signatureHtml:p?void 0:a.signatureHtml,signatureText:p?void 0:a.signature}),it=n.jsxs("button",{"aria-label":`复制第 ${a.floor} 楼链接`,className:"thread-floor-index",onClick:Xe,title:"复制楼层链接",type:"button",children:["#",a.floor]}),lt=n.jsxs(n.Fragment,{children:[n.jsx(_r,{canDelete:(!l||i)&&(a.canDelete??a.isOwn??!1),canEdit:(!l||i)&&!!a.isOwn,canQuote:e,canReply:r,deleting:U,editHref:o,onEditSignup:l&&!i&&a.isOwn?c:void 0,onDelete:g=>{ie.current=g,H(""),N({kind:"floor"})},onQuote:g=>x(a,g),onReply:()=>je()}),D&&n.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:D}),ke.length>0&&n.jsx("section",{className:"nested-replies",ref:q,"aria-label":`${a.floor} 楼的楼中楼回复`,children:ke.map(g=>n.jsxs("article",{children:[n.jsx("img",{src:g.author.avatar,alt:""}),n.jsxs("div",{className:"nested-reply-main",children:[n.jsxs("div",{className:"nested-reply-identity",children:[n.jsx("a",{className:"nested-reply-author",href:te(g.author.name),children:g.author.name}),g.target&&n.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",n.jsx("a",{className:"nested-reply-author",href:te(g.target),children:g.target})]})]}),g.contentHtml?n.jsx(Je,{className:"nested-reply-content",html:g.contentHtml,onImageOpen:Ce,variant:"nested"}):n.jsx("p",{children:g.content}),n.jsxs("footer",{className:"nested-reply-footer",children:[n.jsx("time",{children:be(g.publishedAt)}),r&&n.jsx("button",{onClick:()=>je(g.author.name),type:"button",children:"回复"}),g.canDelete&&n.jsxs("button",{className:"nested-reply-delete",disabled:Z===g.id,onClick:C=>{ie.current=C.currentTarget,V(""),N({kind:"nested",reply:g})},type:"button",children:[n.jsx(ye,{size:12}),Z===g.id?"删除中":"删除"]})]})]})]},g.id))}),W&&n.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:W}),I!==void 0&&r&&n.jsxs("form",{className:"nested-reply-composer",onSubmit:et,children:[n.jsxs("div",{className:"nested-reply-input-field",children:[n.jsx("textarea",{"aria-describedby":$,"aria-invalid":A.isOverLimit||void 0,"aria-label":I?`回复 @${I}`:`回复第 ${a.floor} 楼`,onChange:g=>{_(g.target.value),B("")},placeholder:I?`回复 @${I}`:"写一条楼中楼回复",ref:Ae,rows:2,value:G}),n.jsxs("small",{"aria-label":`已输入 ${A.length} 字，最多 ${A.limit} 字`,className:`nested-reply-character-count${A.isOverLimit?" nested-reply-character-count-error":""}`,id:$,children:[A.length," / ",A.limit]})]}),n.jsxs("div",{className:"nested-reply-composer-actions",children:[n.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:v,onClick:qe,type:"button",children:n.jsx(He,{size:15})}),n.jsxs("button",{className:"nested-reply-submit",disabled:!A.canSubmit||v,type:"submit",children:[n.jsx(Nt,{size:14}),v?"发送中":"发送"]})]}),P&&n.jsx("p",{className:"nested-reply-error",role:"alert",children:P})]})]}),ct=n.jsxs(n.Fragment,{children:[w&&n.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[n.jsx(Tt,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),n.jsx(Ne,{children:j&&n.jsx(Ht,{images:j.images,initialImageIndex:j.imageIndex,onImageChange:j.onImageChange,onClose:Ze})}),n.jsx(Ne,{mobileSize:"compact",children:M&&n.jsx(Br,{floor:a,isMainPost:i,onCancel:at,onConfirm:nt,target:M})})]});return n.jsx(Gr,{articleAfterContent:ct,author:a.author,avatarRail:ot,content:st,decorationImageSrc:t,editedAt:a.editedAt,floor:a.floor,floorIndex:it,id:String(a.floor),inlineAvatar:s,mainAfterContent:lt,onCopy:Ur,publishedAt:a.publishedAt,showAuthorProfile:u})}function Oe(e){const r=e.closest(".thread-floor")?.querySelector(".thread-floor-body");return Mt(window.getSelection(),r??null)}function Br({floor:e,isMainPost:r,onCancel:t,onConfirm:o,target:a}){const l=a.kind==="nested"?a.reply:null,i=l?"删除楼中楼回复":r?"删除主楼":"删除回复",s=l?"":r?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",u=l?.author.name??e.author.name,p=l?`#${e.floor} · 楼中楼`:`#${e.floor}`,m=Wr(l?.content||e.quoteText||e.paragraphs[0]||"");return d.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),d.useEffect(()=>{function h(c){c.key==="Escape"&&t()}return document.addEventListener("keydown",h),()=>document.removeEventListener("keydown",h)},[t]),n.jsx(Pt,{className:"thread-delete-dialog-backdrop",onMouseDown:h=>{h.currentTarget===h.target&&t()},role:"presentation",children:n.jsxs("section",{"aria-describedby":s?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[n.jsxs("header",{children:[n.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:n.jsx(Gt,{size:19})}),n.jsx("div",{children:n.jsx("h2",{id:"thread-delete-dialog-title",children:i})}),n.jsx("button",{"aria-label":"关闭删除确认",onClick:t,type:"button",children:n.jsx(He,{size:18})})]}),n.jsxs("div",{className:"thread-delete-dialog-body",children:[s&&n.jsx("p",{id:"thread-delete-dialog-description",children:s}),n.jsxs("div",{className:"thread-delete-dialog-target",children:[n.jsxs("span",{children:[u," · ",p]}),n.jsx("p",{children:m||"此回复没有可预览的文字内容。"})]})]}),n.jsxs("footer",{children:[n.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:t,type:"button",children:"取消"}),n.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:o,type:"button",children:[n.jsx(ye,{size:15}),"确认删除"]})]})]})})}function Wr(e){const r=e.replace(/\s+/g," ").trim();return r.length>100?`${r.slice(0,100).trimEnd()}…`:r}function Vr(e){const r=t=>String(t).padStart(2,"0");return`${e.getFullYear()}-${r(e.getMonth()+1)}-${r(e.getDate())} ${r(e.getHours())}:${r(e.getMinutes())}:${r(e.getSeconds())}`}export{Bt as P,Mr as T,ea as a,Gr as b,_r as c,ta as d,Zr as f,Jt as w};
