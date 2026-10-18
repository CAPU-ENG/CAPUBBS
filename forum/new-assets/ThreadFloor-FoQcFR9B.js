import{E as mt,r as u,a0 as pt,j as a,$ as De,a3 as he,c6 as gt,c7 as ft,O as pe,c8 as ht,bd as bt,b5 as yt,ah as xt,b7 as vt,c9 as wt,ca as It,cb as kt,cc as St,cd as At,ce as Rt,a2 as Et,u as jt,Z as te,n as be,M as qt,a5 as Nt,cf as He,b$ as Lt,aC as ce,bW as Tt}from"./index-BAPtwWMc.js";import{e as Ct,f as $t,h as Le,m as ue,s as Mt,r as Pt,i as Ft,P as zt,T as Ot,a as Ue,b as Ge}from"./RichTextEditor.gallery-CLnkifFm.js";import{a as Dt,b as Ht,r as Ut,t as Gt,g as _t}from"./forumMarkup-D9hyLVbA.js";import{m as Bt}from"./thread-c8eEcJ9J.js";import{f as Wt}from"./dataDisplay-hMfdrEOi.js";import{P as de}from"./pencil-BvXTG05-.js";import{T as Jt}from"./triangle-alert-CHFf-YDt.js";const Kt=[["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}],["path",{d:"m9 17-5-5 5-5",key:"nvlc11"}]],Qt=mt("reply",Kt);function _e(){const r={black:[0,0,0],darkgray:[169,169,169],darkgrey:[169,169,169],darkslategray:[47,79,79],darkslategrey:[47,79,79],dimgray:[105,105,105],dimgrey:[105,105,105],gainsboro:[220,220,220],gray:[128,128,128],grey:[128,128,128],lightgray:[211,211,211],lightgrey:[211,211,211],silver:[192,192,192],slategray:[112,128,144],slategrey:[112,128,144],white:[255,255,255],whitesmoke:[245,245,245]},o="data-capubbs-original-grayscale-color-attr",n="data-capubbs-original-grayscale-style-color",c=`[color], [style], [${o}], [${n}]`;function i(s,p,m,x){const y=Math.max(s,p,m),k=Math.max(32,96-y/2);return y-Math.min(s,p,m)<=k?{alpha:x,blue:m,green:p,red:s}:null}function l(s){const p=s.endsWith("%"),m=Number(p?s.slice(0,-1):s);return Number.isFinite(m)?p?m>=0&&m<=100?Math.round(m*2.55):null:m>=0&&m<=255?Math.round(m):null:null}function d(s){if(s===void 0)return 1;const p=s.endsWith("%"),m=Number(p?s.slice(0,-1):s);return Number.isFinite(m)?p?m>=0&&m<=100?m/100:null:m>=0&&m<=1?m:null:null}function b(s){const p=String(s??"").trim().toLowerCase().replace(/^['"]|['"]$/g,""),m=p.replace(/\s+/g,""),x=r[m];if(x)return i(x[0],x[1],x[2],1);const y=m.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);if(y){const q=y[1].length<=4?y[1].split("").map(H=>`${H}${H}`).join(""):y[1],C=Number.parseInt(q.slice(0,2),16),B=Number.parseInt(q.slice(2,4),16),M=Number.parseInt(q.slice(4,6),16),W=q.length===8?Number.parseInt(q.slice(6,8),16)/255:1;return i(C,B,M,W)}const k=p.match(/^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*(?:,|\/)\s*([01](?:\.\d+)?|\.\d+|100%|\d{1,3}(?:\.\d+)?%))?\s*\)$/);if(!k)return null;const S=l(k[1]),j=l(k[2]),z=l(k[3]),A=d(k[4]);return S===null||j===null||z===null||A===null?null:i(S,j,z,A)}function g(s,p=!0){const m=b(s);if(!m)return null;const{alpha:x,blue:y,green:k,red:S}=m,j=255-Math.max(S,k,y)-Math.min(S,k,y),z=[S+j,k+j,y+j];return p&&x<1?`rgba(${z.join(", ")}, ${Number(x.toFixed(3))})`:`#${z.map(A=>A.toString(16).padStart(2,"0")).join("")}`}function f(s,p){const m=s.getAttribute(o);if(!p){if(m===null)return;s.setAttribute("color",m),s.removeAttribute(o);return}const x=m??s.getAttribute("color"),y=g(x,!1);!y||x===null||(m===null&&s.setAttribute(o,x),s.getAttribute("color")!==y&&s.setAttribute("color",y))}function v(s,p){const m=s.getAttribute(n);if(!p){if(m===null)return;s.style.setProperty("color",m,s.style.getPropertyPriority("color")),s.removeAttribute(n);return}const x=m??s.style.getPropertyValue("color"),y=g(x);!y||!x||(m===null&&s.setAttribute(n,x),s.style.getPropertyValue("color")!==y&&s.style.setProperty("color",y,s.style.getPropertyPriority("color")))}function I(s,p){[...s instanceof Element&&s.matches(c)?[s]:[],...Array.from(s.querySelectorAll(c))].forEach(x=>{f(x,p);const{style:y}=x;y&&typeof y.getPropertyValue=="function"&&v(x,p)})}return{invert:g,parse:b,sync:I}}const Be=_e(),ea=Be.parse;function Yt(t,e){Be.sync(t,e==="dark")}async function Vt(t){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(t),!0}catch{}const e=document.createElement("textarea");e.value=t,e.setAttribute("readonly",""),e.style.position="fixed",e.style.opacity="0",document.body.appendChild(e),e.select();try{return document.execCommand("copy")}finally{e.remove()}}const Xt=400;function ta(t,e){return e?`回复 @${e}：${t}`:t}function Zt(t){const e=Array.from(t).length,r=Xt,o=e>r;return{canSubmit:!!t.trim()&&!o,isOverLimit:o,length:e,limit:r}}function We(t,e){t.querySelectorAll(".capubbs-gallery").forEach(r=>{const o=r.querySelector(".capubbs-gallery-stage");if(!o||o.querySelector(".capubbs-gallery-quote"))return;const n=r.ownerDocument.createElement("button");n.type="button",n.className="capubbs-gallery-quote",n.innerHTML='<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg><span>引用</span>',n.setAttribute("aria-label","引用图片"),n.addEventListener("click",c=>{c.preventDefault(),c.stopPropagation();const i=Array.from(r.querySelectorAll('[data-capubbs-gallery-slide="true"]')),l=i.findIndex(I=>I.getAttribute("data-capubbs-gallery-active")==="true"),d=l>=0?l:0,b=i[d]?.querySelector("img");if(!b)return;const g=b.getAttribute("data-capubbs-image-resource-src")||b.getAttribute("data-capubbs-gallery-src")||b.getAttribute("src");if(!g)return;let f;try{f=new URL(g,b.baseURI)}catch{return}if(!["http:","https:"].includes(f.protocol))return;const v=r.querySelectorAll('[data-capubbs-gallery-caption="true"]');e({src:f.href,title:r.querySelector(".capubbs-gallery-title")?.textContent?.trim()??"",caption:v[d]?.textContent?.trim()??""})}),o.appendChild(n)})}function ra(t,e,r){let o;try{o=new URL(e.src)}catch{return t}if(!["http:","https:"].includes(o.protocol))return t;const n=[e.title.trim(),e.caption.trim()].filter(Boolean).join("-"),c=n?`【${n}】`:"",i=g=>g.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),l=`<p class="capubbs-floor-quote-content"><img src="${i(o.href)}" alt=""></p>${c?`<p class="capubbs-floor-quote-content">${i(c)}</p>`:""}`,d=o.href.replace(/[<>\\]/g,g=>encodeURIComponent(g)),b=c.replace(/([\\`*_{}\[\]()#+.!|>~-])/g,"\\$1");return Dt(t,r,{html:l,markdown:`![](<${d}>)${b?`

${b}`:""}`})}function Te(){return document.documentElement.classList.contains("dark")?"dark":"light"}function Je(){const[t,e]=u.useState(Te);return u.useEffect(()=>{const r=()=>e(Te()),o=new MutationObserver(r);return o.observe(document.documentElement,{attributeFilter:["class"],attributes:!0}),r(),()=>o.disconnect()},[]),t}const er='<svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/><path d="M9 21H3v-6"/></svg>';function tr(t){const e=t.createElement("button");return e.type="button",e.className="forum-table-expand",e.dataset.forumTableExpand="true",e.setAttribute("aria-label","放大表格"),e.title="放大表格",e.innerHTML=er,e}function rr(t){return t instanceof Element?t.closest('[data-forum-table-expand="true"]')?.closest(".forum-table-viewport")?.querySelector("table.forum-data-table")??null:null}function ar(t){const e=[];return t.querySelectorAll("table").forEach(r=>{if(r.classList.contains("forum-punishment-table")||r.parentElement?.closest("table")||r.querySelector("table")||r.rows.length<2||!Array.from(r.rows).some(i=>i.cells.length>1))return;let o=r.parentElement;if(!o?.classList.contains("forum-table-scroll")){o=r.ownerDocument.createElement("div"),o.className="forum-table-scroll",o.tabIndex=0,r.before(o),o.append(r),r.classList.add("forum-data-table");let i=[],l=null;Array.from(r.rows).forEach((d,b)=>{l!==d.parentElement&&(l=d.parentElement,i=[]);let g=0;Array.from(d.cells).forEach(f=>{for(;(i[g]??0)>0;)g+=1;g===0&&f.colSpan===1&&f.classList.add("forum-table-first-column"),b===0&&!r.tHead&&f.classList.add("forum-table-heading");const v=f.rowSpan===0?r.rows.length:f.rowSpan;for(let s=0;s<f.colSpan;s+=1)i[g+s]=v;g+=f.colSpan;const I=r.ownerDocument.createElement("div");for(I.className="forum-table-cell-content";f.firstChild;)I.append(f.firstChild);f.append(I)}),i=i.map(f=>Math.max(0,f-1))})}const n=o;let c=n.parentElement;c?.classList.contains("forum-table-viewport")||(c=r.ownerDocument.createElement("div"),c.className="forum-table-viewport",n.before(c),c.append(n)),c.querySelector(":scope > .forum-table-expand")||c.append(tr(r.ownerDocument)),e.push(Ke(c,n,r))}),()=>e.forEach(r=>r())}function Ke(t,e,r){const o=()=>{e.classList.toggle("forum-table-scrolled",e.scrollLeft>0),t.classList.toggle("forum-table-more-right",e.scrollWidth-e.clientWidth-e.scrollLeft>1)};o(),e.addEventListener("scroll",o,{passive:!0});const n=r.ownerDocument.defaultView,c=n?.ResizeObserver?new n.ResizeObserver(o):null;return c?.observe(e),c?.observe(r),n?.addEventListener("resize",o),()=>{e.removeEventListener("scroll",o),c?.disconnect(),n?.removeEventListener("resize",o)}}function nr({html:t,onClose:e}){const r=u.useRef(null),o=u.useRef(null);return u.useEffect(()=>(document.body.classList.add("gallery-dialog-open"),()=>document.body.classList.remove("gallery-dialog-open")),[]),u.useLayoutEffect(()=>{const n=r.current,c=o.current,i=c?.querySelector("table");if(!(!n||!c||!i))return Ke(n,c,i)},[t]),pt.createPortal(a.jsx(De,{className:"gallery-dialog-backdrop",onClick:e,onDismiss:e,role:"presentation",children:a.jsxs("section",{"aria-labelledby":"forum-table-dialog-title","aria-modal":"true",className:"gallery-dialog forum-table-dialog",onClick:n=>n.stopPropagation(),role:"dialog",children:[a.jsxs("header",{children:[a.jsx("span",{children:a.jsx(Ct,{size:18})}),a.jsx("h2",{id:"forum-table-dialog-title",children:"表格"}),a.jsx("button",{"aria-label":"关闭表格","data-autofocus":!0,onClick:e,type:"button",children:a.jsx(he,{size:18})})]}),a.jsx("div",{className:"forum-markup forum-table-dialog-body",children:a.jsx("div",{className:"forum-table-viewport",ref:r,children:a.jsx("div",{className:"forum-table-scroll",dangerouslySetInnerHTML:{__html:t},ref:o,tabIndex:0})})})]})}),document.body)}function Qe(t){const e=t.ownerDocument.defaultView;if(!e)return()=>{};const r=[];return t.querySelectorAll(".forum-punishment-table").forEach(o=>{const n=o.parentElement;if(!n?.classList.contains("forum-punishment-scroll"))return;let c=!1;function i(){if(c||!n)return;const d=n.clientWidth,b=Math.max(o.offsetWidth,o.scrollWidth);if(d<=0||b<=0)return;const g=Math.min(1,d/b),f=`scale(${g})`,v=`${Math.ceil(o.offsetHeight*g)}px`;o.style.transform!==f&&(o.style.transform=f),n.style.height!==v&&(n.style.height=v)}const l=e.ResizeObserver?new e.ResizeObserver(i):null;l?.observe(n),l?.observe(o),e.addEventListener("resize",i),t.ownerDocument.fonts?.ready.then(i),i(),r.push(()=>{c=!0,l?.disconnect(),e.removeEventListener("resize",i)})}),()=>r.forEach(o=>o())}function Ye({className:t="",html:e,onImageOpen:r,onImageQuote:o,variant:n}){const c=u.useRef(null),i=u.useRef(o);i.current=o;const l=Je(),[d,b]=u.useState(null),g=u.useMemo(()=>({__html:gt(e)}),[e]);if(u.useLayoutEffect(()=>{const s=c.current;if(s&&n!=="signature")return ar(s)},[e,n]),u.useLayoutEffect(()=>{const s=c.current;if(s&&n!=="signature")return Qe(s)},[e,n]),u.useLayoutEffect(()=>{const s=c.current;s&&($t(s),o&&n==="floor"?We(s,p=>i.current?.(p)):s.querySelectorAll(".capubbs-gallery-quote").forEach(p=>p.remove()),Yt(s,l))},[e,l,!!o,n]),u.useLayoutEffect(()=>{const s=c.current;if(s)return ft(s)},[e]),u.useEffect(()=>{const s=c.current;if(!s)return;const p=Array.from(s.querySelectorAll("img")),m=y=>{y.dataset.capubbsImageLoaded="true"},x=p.map(y=>{if(y.complete&&y.getAttribute("src"))return m(y),null;const k=()=>m(y);return y.addEventListener("load",k,{once:!0}),y.addEventListener("error",k,{once:!0}),{handleLoad:k,image:y}});return()=>{x.forEach(y=>{y&&(y.image.removeEventListener("load",y.handleLoad),y.image.removeEventListener("error",y.handleLoad))})}},[e]),!e)return null;function f(s,p){if(!r||!(s instanceof Element))return;const m=s.closest("img");if(!(m instanceof HTMLImageElement))return;const x=m.closest(".capubbs-gallery"),y=x?Array.from(x.querySelectorAll('[data-capubbs-gallery-slide="true"] img')):Array.from(p.querySelectorAll("img")).filter(A=>!A.closest(".capubbs-gallery")),k=y.indexOf(m);if(k<0)return;const S=y.map(A=>or(A,p)),j=y.map((A,q)=>{const C=S[q];return{alt:A.alt.trim(),element:A,src:A.currentSrc||A.getAttribute("src")||A.dataset.capubbsGallerySrc||"",...C?{galleryId:C.galleryId,galleryIndex:C.galleryIndex}:{}}});r(j,k,m,A=>{const q=S[A];q&&Mt(q.gallery,q.galleryIndex)})}function v(s){const p=rr(s.target);if(p){s.preventDefault(),s.stopPropagation(),b(p.outerHTML);return}const m=Le(s.target);if(m&&s.target instanceof Element){s.preventDefault(),s.stopPropagation(),ue(s.target,m);return}!r||!(s.target instanceof HTMLImageElement)||(s.preventDefault(),f(s.target,s.currentTarget))}function I(s){const p=Le(s.target);if(p&&["Enter"," "].includes(s.key)&&s.target instanceof Element){s.preventDefault(),ue(s.target,p);return}if(["ArrowLeft","ArrowRight"].includes(s.key)&&s.target instanceof Element&&s.target.closest(".capubbs-gallery")){s.preventDefault(),ue(s.target,s.key==="ArrowLeft"?"prev":"next");return}!r||!(s.target instanceof HTMLImageElement)||!["Enter"," "].includes(s.key)||(s.preventDefault(),f(s.target,s.currentTarget))}return a.jsxs(a.Fragment,{children:[a.jsx("div",{ref:c,className:`forum-markup forum-markup-${n} ${t}`.trim(),"data-forum-markup":n,dangerouslySetInnerHTML:g,onClick:v,onKeyDown:I}),a.jsx(pe,{children:d?a.jsx(nr,{html:d,onClose:()=>b(null)}):null})]})}function or(t,e){const r=t.closest(".capubbs-gallery");if(!r||!e.contains(r))return null;const n=Array.from(e.querySelectorAll(".capubbs-gallery")).indexOf(r),i=Array.from(r.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).indexOf(t);return n>=0&&i>=0?{gallery:r,galleryId:n,galleryIndex:i}:null}function sr(t){if(!/<punishment_record\b/i.test(t))return null;const e=document.createElement("template");e.innerHTML=t;const r=Array.from(e.content.querySelectorAll("punishment_record")).filter(n=>!n.closest("pre, code, textarea"));if(r.length===0)return null;const o=r.map(n=>{const c=n.getAttribute("year")?.trim()??"",i=/^\d{4}$/.test(c)&&Number(c)>1?Number(c):null,l=document.createElement("div");return n.replaceWith(l,...Array.from(n.childNodes)),{placeholder:l,year:i}});return{needsRecords:o.some(({year:n})=>n!==null),render(n,c){return o.forEach(({placeholder:i,year:l})=>{if(l===null||c){i.textContent=l===null?"罚跑记录学年无效":c;return}const d=document.createElement("table"),b=`${l-1}-${l} 学年罚跑记录`;d.className="forum-punishment-table",d.setAttribute("aria-label",b);const g=document.createElement("div");g.className="forum-punishment-title",g.setAttribute("role","heading"),g.setAttribute("aria-level","2"),g.textContent=b;const f=d.createTHead().insertRow();["姓名","ID","原因","长度","职务加罚","开始时间","结束时间","完成情况"].forEach(p=>{const m=document.createElement("th");m.scope="col",m.textContent=p,f.append(m)});const v=d.createTBody(),I=n.filter(p=>{const m=p.startDate.match(/^(\d{4})-(\d{1,2})-/);if(!m)return!1;const x=Number(m[2]);return x>=1&&x<=12&&Number(m[1])+(x>=9?1:0)===l});if(I.forEach(p=>{const m=v.insertRow(),x=p.distance?/公里|km/i.test(p.distance)?p.distance:`${p.distance} km`:"—";[p.name||"—",p.username||"—",p.reason||"—",x,p.addition?"是":"否",Ce(p.startDate),Ce(p.endDate),p.isComplete?"已完成":"进行中"].forEach(y=>{m.insertCell().textContent=y})}),I.length===0){const p=v.insertRow().insertCell();p.colSpan=8,p.className="forum-punishment-empty",p.textContent="暂无罚跑记录"}const s=document.createElement("div");s.className="forum-punishment-scroll",s.append(d),i.className="forum-punishment-record",i.replaceChildren(g,s)}),e.innerHTML}}}function Ce(t){return!t||t==="0000-00-00"?"—":t.replaceAll("-",".")}function ir(t,e){const r=u.useMemo(()=>e?sr(t):null,[e,t]),[o,n]=u.useState(null);return u.useEffect(()=>{if(!r||!r.needsRecords)return;const c=new AbortController;return Wt("punishments",c.signal).then(({punishmentRecords:i})=>{c.signal.aborted||n({prepared:r,html:r.render(i)})}).catch(i=>{c.signal.aborted||n({prepared:r,html:r.render([],i instanceof Error?i.message:"罚跑记录加载失败")})}),()=>c.abort()},[r]),r?r.needsRecords?o?.prepared===r?o.html:"":r.render([]):t}const lr='.forum-markup-floor .capubbs-gallery-quote{position:absolute;display:inline-flex;align-items:center;gap:4px;z-index:5;top:10px;right:10px;padding:4px 8px;border:1px solid rgb(255 255 255 / .25);border-radius:var(--card-radius);background:#00000080;color:#fff;font:inherit;font-size:12px;line-height:1.5;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .15s ease,background .15s ease}.forum-markup-floor .capubbs-gallery-stage:hover .capubbs-gallery-quote,.forum-markup-floor .capubbs-gallery-stage:focus-within .capubbs-gallery-quote{opacity:1;pointer-events:auto}.forum-markup-floor .capubbs-gallery-quote:hover{background:#000000b8}.forum-markup-floor .capubbs-gallery-quote:focus-visible{outline:2px solid #fff;outline-offset:2px}@media(hover:none){.forum-markup-floor .capubbs-gallery-quote{opacity:1;pointer-events:auto}}.forum-markup .forum-punishment-table{display:table;width:-moz-max-content;width:max-content;min-width:100%;max-width:none;border-collapse:separate;border-spacing:0;transform-origin:top left}.forum-markup .forum-punishment-table :is(th,td){border:0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:8px;background:var(--surface);color:var(--text-muted);font:inherit;text-align:center;white-space:nowrap}.forum-markup .forum-punishment-table tbody tr:hover>td{background:var(--brand-faint, color-mix(in srgb, var(--brand) 8%, var(--surface)))}.forum-markup .forum-punishment-table tr>:last-child{border-right:0}.forum-markup .forum-punishment-table tbody tr:last-child>td{border-bottom:0}.forum-markup .forum-punishment-table th{background:var(--surface-soft);color:var(--text-faint);font-weight:780}.forum-markup .forum-punishment-record{box-sizing:border-box;min-width:0;max-width:100%;border:1px solid var(--line)}.forum-markup .forum-punishment-scroll{max-width:100%;overflow:hidden}.forum-markup .forum-punishment-title{padding:12px 14px;border-bottom:1px solid var(--line);background:var(--surface-soft);color:var(--text-strong);font-family:inherit;font-size:var(--ui-font-size-lg, 14px);font-weight:760;line-height:1.5;text-align:center}.forum-markup .forum-punishment-table .forum-punishment-empty{text-align:center}.forum-markup .forum-punishment-empty>.forum-table-cell-content{width:auto;max-width:none}:root{--card-radius: 2px;--surface: #fffefa;--surface-raised: #ffffff;--surface-soft: #f6f8f4;--text: #20231f;--text-strong: #111411;--text-muted: #687068;--text-faint: #6c746c;--line: #e1e6df;--line-strong: #cdd5cc;--brand: #236b4c;--brand-strong: #174f38;--danger: #b8473f}:root.dark{--surface: #171d19;--surface-raised: #1c241f;--surface-soft: #1f2822;--text: #dde5de;--text-strong: #f6faf6;--text-muted: #a0aca2;--text-faint: #849086;--line: #2c362f;--line-strong: #3c493f;--brand: #69b98d;--brand-strong: #8bcca6;--danger: #ef8178}::-moz-selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}::selection{background:color-mix(in srgb,var(--brand) 24%,transparent)}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentcolor}blockquote,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}a{color:inherit;text-decoration:inherit}button{margin:0;padding:0;background-color:transparent;color:inherit;font:inherit;letter-spacing:inherit;text-transform:none}button:where(:not([style]):not([class])){min-height:32px;border:1px solid var(--line);border-radius:.5px;padding:4px 12px;background-color:var(--surface);color:var(--text-muted);font-size:14px;font-weight:680;line-height:1.5;vertical-align:middle;cursor:pointer;transition:background-color .14s ease,border-color .14s ease,color .14s ease}button:where(:not([style]):not([class]):hover:not(:disabled)){border-color:var(--line-strong);background-color:var(--surface-soft);color:var(--brand-strong)}button:where(:not([style]):not([class]):focus-visible){outline:2px solid var(--brand);outline-offset:2px}button:where(:not([style]):not([class]):disabled){cursor:not-allowed;opacity:.5}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}.capubbs-html-frame-root iframe{background-color:transparent!important}img,video{max-width:100%;height:auto}table{border-color:inherit;border-collapse:collapse;text-indent:0}.capubbs-activity-signup-canceled,.capubbs-activity-signup-canceled *{color:var(--danger)!important;text-decoration-color:var(--danger)!important;text-decoration-line:line-through!important;text-decoration-thickness:2px!important}.forum-markup>:first-child{margin-top:0}.forum-markup>:last-child{margin-bottom:0}.forum-markup p,.forum-markup div{margin:0}.forum-markup-floor p{margin:0 0 .75em}.forum-markup-floor>div+div{margin-top:.55em}.forum-markup a{color:var(--brand-strong);font-weight:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.16em}.forum-markup .forum-mention{text-decoration:none}.forum-markup blockquote{margin:0 0 0 2em;border:0;padding:0;background:transparent;color:inherit}.forum-markup blockquote.forum-quote,.forum-markup .forum-legacy-quote,.forum-markup blockquote.capubbs-floor-quote{margin:.8em 0;border-left:3px solid color-mix(in srgb,var(--brand) 38%,var(--line));padding:.55em .75em;background:var(--surface-soft);color:var(--text-muted)}.forum-markup .capubbs-floor-quote-jump{margin-left:.75em}.forum-markup .forum-legacy-quote-content{margin:0}.forum-markup h1,.forum-markup h2,.forum-markup h3,.forum-markup h4,.forum-markup h5,.forum-markup h6{margin:.9rem 0 .45rem;color:var(--brand-strong);font-weight:800;line-height:1.35}.forum-markup h1{font-size:1.45rem}.forum-markup h2{font-size:1.25rem}.forum-markup h3{font-size:1.1rem}.forum-markup h4,.forum-markup h5,.forum-markup h6{font-size:1em}.forum-markup ul,.forum-markup ol{margin:.65em 0;padding-left:1.45em}.forum-markup ul{list-style:disc}.forum-markup ol{list-style:decimal}.forum-markup ol.capubbs-ordered-list-alpha{list-style-type:lower-alpha}.forum-markup ol.capubbs-ordered-list-roman{list-style-type:lower-roman}.forum-markup pre{max-width:100%;overflow-x:auto;margin:.75em 0;border-radius:var(--card-radius);padding:.75em;background:#182531;color:#f8fafc;white-space:pre-wrap}.forum-markup pre.replay-info-txt{border-radius:0;padding:0;background:transparent;color:inherit}.forum-markup code,.forum-markup kbd{border-radius:var(--card-radius);padding:.08em .25em;background:color-mix(in srgb,var(--surface-soft) 75%,var(--line));font-family:SFMono-Regular,Cascadia Code,Consolas,monospace;font-size:.9em}.forum-markup pre code{padding:0;background:transparent;color:inherit}.forum-markup font[size="1"]{font-size:11px}.forum-markup font[size="2"]{font-size:13px}.forum-markup font[size="3"]{font-size:15px}.forum-markup font[size="4"]{font-size:17px}.forum-markup font[size="5"]{font-size:19px}.forum-markup font[size="6"]{font-size:21px}.forum-markup font[size="7"]{font-size:23px}.forum-markup hr{margin:.9em 0;border:0;border-top:1px solid var(--line-strong)}.forum-markup img{display:inline-block;height:auto;max-width:100%;vertical-align:middle}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]){color:transparent;font-size:0}.forum-markup .capubbs-gallery-slide img:not([data-capubbs-image-loaded=true]){opacity:0}.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]),.forum-markup .capubbs-gallery-slide:has(img:not([data-capubbs-image-loaded=true])){background-color:color-mix(in srgb,var(--surface-soft) 82%,var(--line));background-image:linear-gradient(105deg,transparent 20%,color-mix(in srgb,var(--surface-raised) 70%,transparent) 45%,transparent 70%);background-size:220% 100%;animation:capubbs-image-loading 1.2s ease-in-out infinite}.forum-markup img[role=button]{cursor:zoom-in}.forum-markup img[role=button]:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse}.forum-markup td,.forum-markup th{border:1px solid var(--line);padding:.35em .5em}.forum-markup-signature{color:#999;font-family:monospace;font-size:14px;line-height:1.6;overflow-wrap:anywhere}:root.dark .forum-markup-signature{color:#666}.forum-markup .capubbs-gallery{position:relative;display:block;width:100%;margin:.9rem 0;overflow:hidden;border:1px solid var(--line);border-radius:var(--card-radius);background:transparent;color:var(--text)}.forum-markup .capubbs-gallery:focus-visible{outline:2px solid var(--brand);outline-offset:3px}.forum-markup .capubbs-gallery-header{position:relative;display:flex;min-height:44px;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:9px 12px;border-bottom:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-title{width:100%;min-width:0;margin:0;color:var(--text-strong);font-size:.82rem;font-weight:760;line-height:1.4;text-align:center}.forum-markup .capubbs-gallery-stage{position:relative;display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide{display:block;margin:0;background:transparent}.forum-markup .capubbs-gallery-slide[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-slide>img{display:block;width:100%;height:var(--capubbs-gallery-image-height, clamp(280px, 52vw, 560px));max-width:none;margin:0 auto;border-radius:0;-o-object-fit:contain;object-fit:contain}.forum-markup .capubbs-gallery-caption{display:block;margin:0;color:var(--text-muted);font-size:.78rem;line-height:1.55;text-align:center}.forum-markup .capubbs-gallery-caption[data-capubbs-gallery-active=false]{display:none}.forum-markup .capubbs-gallery-footer{position:relative;display:flex;min-height:44px;align-items:center;justify-content:center;margin:0;padding:9px 12px;border-top:1px solid var(--line);background:var(--surface-soft)}.forum-markup .capubbs-gallery-captions{width:100%;min-width:0;margin:0;padding-inline:48px;text-align:center}.forum-markup .capubbs-gallery-count{position:absolute;top:50%;right:12px;color:var(--text-faint);font-size:.72rem;font-variant-numeric:tabular-nums;font-weight:760;line-height:1.25;transform:translateY(-50%)}.forum-markup .capubbs-gallery-count[data-capubbs-gallery-current]:before{content:attr(data-capubbs-gallery-current) "/" attr(data-capubbs-gallery-total)}.forum-markup .capubbs-gallery-nav{position:absolute;z-index:4;top:50%;display:grid;width:36px;height:48px;place-items:center;padding:0;transform:translateY(-50%);border:1px solid rgb(255 255 255 / .25);border-radius:var(--card-radius);background:#00000080;color:#fff;cursor:pointer;transition:.15s ease}.forum-markup .capubbs-gallery-nav:hover{background:#000000b8}.forum-markup .capubbs-gallery-nav:focus-visible{outline:2px solid #fff;outline-offset:2px}.forum-markup .capubbs-gallery-nav:before{font-family:Arial,sans-serif;font-size:2rem;font-weight:300;line-height:1}.forum-markup .capubbs-gallery-nav-prev:before{content:"‹"}.forum-markup .capubbs-gallery-nav-next:before{content:"›"}.forum-markup .capubbs-gallery-nav-prev{left:10px}.forum-markup .capubbs-gallery-nav-next{right:10px}@keyframes capubbs-image-loading{0%{background-position:120% 0}to{background-position:-80% 0}}@media(max-width:640px){.forum-markup .capubbs-gallery-slide>img{height:var(--capubbs-gallery-image-height, min(72vw, 420px))}.forum-markup .capubbs-gallery-nav{width:32px;height:42px}.forum-markup .capubbs-gallery-nav-prev{left:7px}.forum-markup .capubbs-gallery-nav-next{right:7px}}@media(prefers-reduced-motion:reduce){.forum-markup img[data-capubbs-image-width][data-capubbs-image-height]:not([data-capubbs-image-loaded=true]),.forum-markup .capubbs-gallery-slide:has(img:not([data-capubbs-image-loaded=true])){animation:none}}:is(.forum-markup,.capubbs-editor-prose) .capubbs-gallery[data-capubbs-gallery-tag]>.capubbs-gallery-header[hidden]{display:none}@media(max-width:640px){:is(.forum-markup,.capubbs-editor-prose) .capubbs-gallery[data-capubbs-gallery-tag] .capubbs-gallery-stage,:is(.forum-markup,.capubbs-editor-prose) .capubbs-gallery[data-capubbs-gallery-tag] .capubbs-gallery-slide>img{height:min(var(--capubbs-gallery-image-height, 420px),72vw)}}',cr="/bbs/new-assets/threadHtmlBootstrap-x4mBAuLM.html";function ur(t,e){const r=new URL(t);return r.pathname=/Android|iPhone|iPad|iPod|Mobile/i.test(e)?"/m/outchain/player":"/outchain/player",r.href}function ye(t,e){try{const r=new URL(t,e);return!(r.hostname==="player.bilibili.com"&&r.pathname==="/player.html"||r.hostname==="music.163.com"&&["/outchain/player","/m/outchain/player"].includes(r.pathname))||!["http:","https:"].includes(r.protocol)||r.username||r.password||r.port?null:(r.protocol="https:",r.href)}catch{return null}}function dr(t,e){const r=new URL(t);return r.hostname==="music.163.com"?(r.searchParams.set("auto","0"),ur(r.href,e)):(r.searchParams.set("autoplay","0"),r.href)}function mr(t){if(!t)return{left:0,top:0};const e=window.getComputedStyle(t);return{left:t.offsetLeft+t.clientLeft+(Number.parseFloat(e.paddingLeft)||0),top:t.offsetTop+t.clientTop+(Number.parseFloat(e.paddingTop)||0)}}function pr(t){if(!t||typeof t!="object")return!1;const e=t;return typeof e.id=="string"&&typeof e.src=="string"&&ye(e.src,"https://music.163.com")===e.src&&["left","top","width","height"].every(r=>{const o=e[r];return typeof o=="number"&&Number.isFinite(o)&&Math.abs(o)<=1e5})&&e.width>0&&e.height>0}const $e=64*1024*1024,Me=6,gr=2,re=new Map,se=new Map,V=new Map,X=new Map;let me=!1;function ge(t){const e=t.priorities.map(r=>r());return e.includes("high")?"high":e.includes("low")?"low":e.includes("deferred")?"deferred":null}function G(){me||!V.size&&!X.size||(me=!0,setTimeout(()=>{me=!1;const t=[];V.forEach((i,l)=>{const d=ge(i);if(d===null){V.delete(l),re.delete(l),i.reject(new DOMException("图片所在内容已卸载","AbortError"));return}d!=="deferred"&&t.push({source:l,request:i,priority:d})}),t.sort((i,l)=>+(l.priority==="high")-+(i.priority==="high"));const e=Array.from(X.values(),i=>({download:i,priority:ge(i.request)}));e.forEach(({download:i,priority:l})=>{l===null&&i.controller.abort()});const r=e.filter(({download:i})=>i.controller.signal.aborted).length;let o=t.filter(({priority:i})=>i==="high").length-(Me-X.size+r);const n=e.filter(({download:i,priority:l})=>l!=="high"&&!i.controller.signal.aborted).sort((i,l)=>+(l.priority==="deferred")-+(i.priority==="deferred"));for(const{download:i}of n){if(o<=0)break;o-=1,i.preempted=!0,i.controller.abort()}let c=e.filter(({priority:i})=>i!=="high").length;for(const{source:i,request:l,priority:d}of t){if(X.size>=Me)break;d==="low"&&c>=gr||(V.delete(i),d==="low"&&(c+=1),fr(i,l,d))}},0))}function fr(t,e,r){const o={request:e,controller:new AbortController,preempted:!1};X.set(t,o),hr(t,r,o.controller.signal).then(n=>{o.controller.signal.throwIfAborted();const c={blob:n,objectUrl:URL.createObjectURL(n),sourceUrl:t};se.set(t,c),e.resolve(c)}).catch(n=>{o.preempted||o.controller.signal.aborted&&ge(e)!==null?V.set(t,e):(re.delete(t),e.reject(n))}).finally(()=>{X.delete(t),G()})}function Ve(t){return new URL(t,new URL("/bbs/content/",window.location.origin)).href}function Pe(t,e=()=>"high"){const r=Ve(t),o=re.get(r);if(o)return(V.get(r)??X.get(r)?.request)?.priorities.push(e),G(),o;const n=new Promise((c,i)=>{V.set(r,{priorities:[e],reject:i,resolve:c})});return re.set(r,n),G(),n}function hr(t,e,r){const o=new URL(t);return o.origin!==window.location.origin||!o.pathname.startsWith("/bbs/images/")&&!o.pathname.startsWith("/bbsimg/")?Promise.reject(new Error("仅代理论坛图片目录")):fetch(t,{credentials:"same-origin",referrerPolicy:"no-referrer",priority:e,signal:r}).then(async n=>{if(!n.ok)throw new Error(`图片加载失败：${n.status}`);if(!(n.headers.get("content-type")?.toLowerCase()??"").startsWith("image/"))throw new Error("图片响应类型无效");const i=Number.parseInt(n.headers.get("content-length")??"",10);if(Number.isFinite(i)&&i>$e)throw new Error("图片大小超出限制");const l=await n.blob();if(l.size>$e)throw new Error("图片大小超出限制");return l})}function br(t){try{return se.get(Ve(t))?.objectUrl}catch{return}}typeof window<"u"&&(window.addEventListener("scroll",G,{passive:!0,capture:!0}),window.addEventListener("resize",G),window.addEventListener("pagehide",t=>{t.persisted||(se.forEach(e=>URL.revokeObjectURL(e.objectUrl)),se.clear(),re.clear())}));function yr(t,e,r){let o="deferred";for(const n of e){const c=n.right>n.left&&n.bottom>n.top&&t.top+n.bottom>Math.max(0,t.top)&&t.top+n.top<Math.min(r.height,t.bottom)&&t.left+n.right>Math.max(0,t.left)&&t.left+n.left<Math.min(r.width,t.right);if(n.gallery){if(!c||n.gallery==="deferred")continue;if(n.gallery==="current")return"high";o="low"}else{if(c)return"high";o="low"}}return o}const xr=28,vr=64,wr=5e4,Ir=30,Xe=30,T="capubbs-thread-html-frame",Ze=new URL("/bbs/lib/jquery.min.js",window.location.origin).href,kr=Cr(lr),Sr=/\son[a-z][\w:-]*\s*=/i;let oe=null;function Fe({className:t="",floor:e,html:r,isActivitySignupCanceled:o=!1,onImageOpen:n,onImageQuote:c,onIsolatedTextSelection:i,variant:l}){const d=u.useMemo(()=>l==="signature"?Pt(r):r,[r,l]),b=Rr(d,l==="signature"),g=ir(b,l==="floor"),f=Ht(g),v=u.useMemo(()=>f?null:Ut(g,{normalizeLegacyLineBreaks:l==="signature"}),[g,f,l]),I=u.useMemo(()=>Gt(g),[g]);return!f&&v!==null?a.jsx(Ye,{className:t,html:v,onImageOpen:n,onImageQuote:c,variant:l}):a.jsx(Ar,{className:t,floor:e,html:I,isActivitySignupCanceled:o,onImageOpen:n,onImageQuote:c,onTextSelection:i,variant:l})}function Ar({className:t,floor:e,html:r,isActivitySignupCanceled:o,onImageOpen:n,onImageQuote:c,onTextSelection:i,variant:l}){const d=u.useRef(null),b=u.useRef(`${l}-${e}-${Math.random().toString(36).slice(2)}`),g=u.useRef(c);g.current=c;const f=l==="floor"&&!!c,v=u.useRef(n);v.current=n;const I=u.useRef(i);I.current=i;const s=l==="signature"?xr:vr,p=!!n,[m,x]=u.useState(null),[y,k]=u.useState(null),S=Je()==="dark",j=u.useRef(S),z=ht(),A=l==="signature"?14:z,q=u.useMemo(()=>Nr(qr(r)),[r]),C=q.includes('type="text/capubbs-user-script"')||Sr.test(q),B=u.useMemo(()=>Er({canOpenImages:p,canQuoteImages:f,frameId:b.current,needsJquery:C,html:q,isActivitySignupCanceled:o,isDarkTheme:j.current,fontSize:A,variant:l}),[p,f,q,A,o,C,l]),M=u.useMemo(()=>Math.random().toString(36).slice(2),[B]),W=u.useMemo(()=>`${cr}#${new URLSearchParams({frameId:b.current,token:M})}`,[M]),H=u.useCallback(()=>{d.current?.contentWindow?.postMessage({source:T,type:"document-response",frameId:b.current,token:M,html:B},"*")},[M,B]),J=u.useCallback(()=>{d.current?.contentWindow?.postMessage({frameId:b.current,source:T,theme:S?"dark":"light",type:"theme"},"*")},[S]),K=u.useCallback((N=d.current?.contentWindow)=>{!C||!N||ze().then(O=>{d.current?.contentWindow===N&&N.postMessage({frameId:b.current,jquerySource:O,source:T,type:"jquery-response"},"*")})},[C]),ae=u.useCallback(()=>{H(),J(),K()},[H,K,J]);u.useEffect(()=>{x(null)},[W]),u.useEffect(()=>{J()},[J]),u.useEffect(()=>{C&&ze()},[C]),u.useLayoutEffect(()=>{G()},[m]),u.useLayoutEffect(()=>{let N=!0;const O=new Map;function Z(w){const _=d.current?.contentWindow;if(!(!_||w.source!==_||!$r(w.data))&&w.data.frameId===b.current){if(w.data.type==="embedded-player-layout"){k({token:M,players:w.data.players});return}if(w.data.type==="document-request"){w.data.token===M&&H();return}if(w.data.type==="jquery-request"){K(_);return}if(w.data.type==="image-resource-layout"){O.has(w.data.requestId)&&(O.set(w.data.requestId,w.data.bounds),G());return}if(w.data.type==="image-resource-request"){const E=_,L=w.data.requestId;O.set(L,w.data.bounds);const P=()=>{const R=d.current;return!N||!R||R.contentWindow!==E?null:yr(R.getBoundingClientRect(),O.get(L)??[],{width:window.innerWidth,height:window.innerHeight})};Pe(w.data.url,P).then(R=>{!N||d.current?.contentWindow!==E||E.postMessage({blob:R.blob,priority:P(),frameId:b.current,requestId:w.data.requestId,source:T,type:"image-resource-response"},"*")}).catch(()=>{!N||d.current?.contentWindow!==E||E.postMessage({priority:P(),frameId:b.current,requestId:w.data.requestId,source:T,type:"image-resource-error"},"*")}).finally(()=>O.delete(L));return}if(w.data.type==="anchor"){const E=d.current;if(!E)return;const L=window.getComputedStyle(document.documentElement),P=Number.parseFloat(L.getPropertyValue("--topbar-height"))||0,R=window.scrollY+E.getBoundingClientRect().top;window.scrollTo({left:0,top:Math.max(0,R+w.data.offsetTop-P-16)});return}if(w.data.type==="navigate"){const E=bt(w.data.url,xe());if(!E)return;window.history.pushState(null,"",E),window.dispatchEvent(new Event(yt));const L=new URL(E,window.location.origin);L.hash?window.requestAnimationFrame(()=>{const P=decodeURIComponent(L.hash.slice(1)),R=xt(`#${P}`);(R?vt(R):document.getElementById(P))?.scrollIntoView({block:"start"})}):window.scrollTo({left:0,top:0});return}if(w.data.type==="image-quote"){g.current?.(w.data.image);return}if(w.data.type==="image-open"){const E=d.current;if(!E)return;const L=Array.from(E.contentDocument?.querySelectorAll("img")??[]),P=w.data.images.map(D=>({...D,element:typeof D.elementIndex=="number"?L[D.elementIndex]:void 0,src:br(D.src)??D.src,loadSource:F=>(F.addEventListener("abort",G,{once:!0}),Pe(D.src,()=>F.aborted?null:"high").then(Y=>Y.objectUrl,()=>D.src).finally(()=>F.removeEventListener("abort",G)))})),R=D=>{const F=P[D];!F||typeof F.galleryId!="number"||!Number.isSafeInteger(F.galleryIndex)||E.contentWindow?.postMessage({frameId:b.current,galleryId:F.galleryId,galleryIndex:F.galleryIndex,source:T,type:"gallery-select"},"*")};v.current?.(P,w.data.imageIndex,E,R);return}if(w.data.type==="selection"){w.data.text&&window.getSelection()?.removeAllRanges(),I.current?.(w.data.text);return}x(Math.min(wr,Math.max(s,Math.ceil(w.data.height))))}}return window.addEventListener("message",Z),()=>{N=!1,O.clear(),window.removeEventListener("message",Z),G()}},[M,W,s,H,K]);const Q=mr(d.current);return a.jsxs("div",{className:"thread-html-frame-container",children:[a.jsx("iframe",{ref:d,className:`thread-html-frame thread-html-frame-${l} ${t}`.trim(),referrerPolicy:"no-referrer",sandbox:"allow-scripts allow-downloads",scrolling:"no",src:W,onLoad:ae,style:{"--thread-html-frame-width-allowance":`${Xe}px`,...m===null?{}:{"--thread-html-frame-height":`${m}px`}},title:l==="signature"?`第 ${e} 楼签名档`:`第 ${e} 楼正文`},M),y?.token===M?y.players.map(N=>a.jsx("iframe",{className:"thread-embedded-player",src:dr(N.src,navigator.userAgent),title:new URL(N.src).hostname==="player.bilibili.com"?"哔哩哔哩播放器":"网易云音乐播放器",allow:"autoplay; fullscreen; picture-in-picture",allowFullScreen:!0,scrolling:"no",style:{left:N.left+Q.left,top:N.top+Q.top,width:N.width,height:N.height}},`${M}-${N.id}`)):null]})}function Rr(t,e){const[r,o]=u.useState(t);return u.useEffect(()=>{const n=new AbortController,c=e?Ft(t):[];if(o(t),c.length===0)return()=>n.abort();const i=Array.from(new Map(c.map(l=>[`${l.bid}:${l.tid}:${l.pid}`,l])).values());return Promise.all(i.map(async l=>{try{const d=await Bt(l,n.signal);return[`${l.bid}:${l.tid}:${l.pid}`,d]}catch(d){if(d instanceof DOMException&&d.name==="AbortError")throw d;return[`${l.bid}:${l.tid}:${l.pid}`,""]}})).then(l=>{if(n.signal.aborted)return;const d=new Map(l);let b=t;c.forEach(g=>{const f=d.get(`${g.bid}:${g.tid}:${g.pid}`);f&&(b=b.replace(g.marker,f))}),o(b)}).catch(()=>{}),()=>n.abort()},[e,t]),r}function Er({canOpenImages:t,canQuoteImages:e,frameId:r,fontSize:o,needsJquery:n,html:c,isActivitySignupCanceled:i,isDarkTheme:l,variant:d}){const b=d==="signature",g=b?"#999999":"rgb(63 63 70)",f=b?"#666666":"rgb(228 228 231)",v=b?"monospace":"'Noto Sans CJK SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif",I=b?"padding-top:10px;color:inherit;font-family:inherit;font-size:inherit;":"",s=i?" capubbs-activity-signup-canceled":"";return`<!doctype html>
<html class="${l?"dark":"light"}" style="background:transparent;color-scheme:${l?"dark":"light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <base href="${Tr(xe())}">
  <meta http-equiv="Content-Security-Policy" content="${Lr()}">
  <style>${kr}</style>
  <style>
    html{--capubbs-frame-text-color:${g}}html.dark{--capubbs-frame-text-color:${f}}
    html,body{margin:0;padding:0;min-width:0;min-height:0;overflow:hidden;background:transparent!important;color:var(--capubbs-frame-text-color);font-family:${v};font-size:${o}px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    .capubbs-html-frame-root{display:flow-root;width:calc(100% - ${Xe}px);${I}}.capubbs-html-frame-root iframe{display:inline-block;vertical-align:baseline}
  </style>
  <script>${jr(r,t,n,e)}<\/script>
</head>
<body><main class="capubbs-html-frame-root forum-markup forum-markup-${d}${s}">${c}</main></body>
</html>`}function jr(t,e,r,o=!1){return`(function(){
    var frameId=${JSON.stringify(t)};
    var forumOrigin=${JSON.stringify(window.location.origin)};
    var forumBasePath=${JSON.stringify(wt)};
    var canOpenImages=${JSON.stringify(e)};
    var canQuoteImages=${JSON.stringify(o)};
    var ensureGalleryQuoteControls=${We.toString()};
    var needsJquery=${JSON.stringify(r)};
    var preparePunishmentTableFit=${Qe.toString()};
    var getGalleryImageState=${It.toString()};
    var normalizeEmbeddedPlayerUrl=${ye.toString()};
    var playerIds=new WeakMap();
    var nextPlayerId=0;
    var lastPlayerLayout='';
    var jquerySourceUrl=${JSON.stringify(Ze)};
    var forumAppExactPaths=${JSON.stringify(kt)};
    var forumAppPathPrefixes=${JSON.stringify(St)};
    var legacyForumExactPaths=${JSON.stringify(At)};
    var legacyForumPathPatterns=${JSON.stringify(Rt)}.map(function(pattern){return new RegExp(pattern);});
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
    var grayscaleTextColor=(${_e.toString()})();
    var syncingGrayscaleTextColors=false;
    function syncGrayscaleTextColors(root){
      if(syncingGrayscaleTextColors)return;
      syncingGrayscaleTextColors=true;
      try{grayscaleTextColor.sync(root&&root.querySelectorAll?root:document,document.documentElement.classList.contains('dark'));}
      finally{syncingGrayscaleTextColors=false;}
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
      window.parent.postMessage({source:'${T}',type:'resize',frameId:frameId,height:height},'*');
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
      window.parent.postMessage({source:'${T}',type:'embedded-player-layout',frameId:frameId,players:players},'*');
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
      window.parent.postMessage({source:'${T}',type:'selection',frameId:frameId,text:text},'*');
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
        window.parent.postMessage({source:'${T}',type:'anchor',frameId:frameId,offsetTop:offsetTop},'*');
        return;
      }
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      var url=getForumNavigationUrl(event.target);
      if(!url)return;
      event.preventDefault();
      window.parent.postMessage({source:'${T}',type:'navigate',frameId:frameId,url:url},'*');
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
      window.parent.postMessage({source:'${T}',type:'image-open',frameId:frameId,images:images,imageIndex:imageIndex},'*');
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
      window.parent.postMessage({source:'${T}',type:'image-resource-layout',frameId:frameId,requestId:requestId,bounds:getImageResourceBounds(request.images)},'*');
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
          source:'${T}',
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
        window.parent.postMessage({source:'${T}',type:'image-quote',frameId:frameId,image:image},'*');
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
      if(event.source!==window.parent||!data||data.source!=='${T}'||data.frameId!==frameId)return;
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
      if(needsJquery)window.parent.postMessage({source:'${T}',type:'jquery-request',frameId:frameId},'*');
      else executeUserScripts();
      prepareImages();
      prepareGalleries();
      requestImageResources();
      syncGrayscaleTextColors(contentRoot);
      queueHeight();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  }());`}function qr(t){return t.replace(/<script\b([^>]*)>/gi,(e,r)=>`<script${r.replace(/\s+type\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"")} type="text/capubbs-user-script">`)}function Nr(t){if(!/<(?:img|iframe)\b/i.test(t))return t;const e=document.createElement("template");return e.innerHTML=t,e.content.querySelectorAll("iframe[src]").forEach(r=>{const o=ye(r.getAttribute("src")??"",xe());o&&(r.dataset.capubbsPlayerSrc=o,r.removeAttribute("src"))}),e.content.querySelectorAll("img[src]").forEach(r=>{const o=r.getAttribute("src")?.trim()??"";!o||/^(?:blob:|data:)/i.test(o)||(r.dataset.capubbsImageResourceSrc=o,r.setAttribute("fetchpriority","low"),r.removeAttribute("src"),r.removeAttribute("srcset"),r.closest("picture")?.querySelectorAll("source[srcset]").forEach(n=>{n.removeAttribute("srcset")}))}),e.innerHTML}function ze(){return oe||(oe=fetch(Ze,{credentials:"same-origin"}).then(t=>{if(!t.ok)throw new Error(`Failed to load jQuery: ${t.status}`);return t.text()}).catch(()=>null),oe)}function Lr(){return["default-src 'none'","script-src 'unsafe-inline' http: https: data: blob:","style-src 'unsafe-inline' http: https:","img-src http: https: data: blob:","media-src http: https: data: blob:","font-src http: https: data: blob:","frame-src http: https: data: blob:","child-src http: https: data: blob:","connect-src 'none'","object-src 'none'","form-action 'none'","upgrade-insecure-requests"].join("; ")}function xe(){return new URL("/bbs/content/",window.location.origin).href}function Tr(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Cr(t){return t.replace(/<\/style/gi,"<\\/style")}function $r(t){if(!t||typeof t!="object")return!1;const e=t;if(e.source!==T||typeof e.frameId!="string")return!1;if(e.type==="image-quote"){const r=e.image;if(!r||typeof r.src!="string"||typeof r.title!="string"||typeof r.caption!="string")return!1;try{return["http:","https:"].includes(new URL(r.src).protocol)}catch{return!1}}return e.type==="embedded-player-layout"?Array.isArray(e.players)&&e.players.every(pr):e.type==="document-request"?typeof e.token=="string":e.type==="anchor"?typeof e.offsetTop=="number"&&Number.isFinite(e.offsetTop)&&e.offsetTop>=0:e.type==="navigate"?typeof e.url=="string":e.type==="jquery-request"?!0:e.type==="image-resource-request"||e.type==="image-resource-layout"?typeof e.requestId=="string"&&e.requestId.length>0&&Array.isArray(e.bounds)&&e.bounds.every(r=>r&&(r.gallery===void 0||["current","adjacent","deferred"].includes(r.gallery))&&["top","bottom","left","right"].every(o=>typeof r[o]=="number"&&Number.isFinite(r[o])))&&(e.type==="image-resource-layout"||"url"in e&&typeof e.url=="string"&&e.url.length>0):e.type==="selection"?typeof e.text=="string":e.type==="image-open"?typeof e.imageIndex=="number"&&Number.isSafeInteger(e.imageIndex)&&Array.isArray(e.images)&&e.images.length>0&&e.imageIndex>=0&&e.imageIndex<e.images.length&&e.images.every(r=>!!r&&typeof r=="object"&&typeof r.alt=="string"&&typeof r.elementIndex=="number"&&Number.isSafeInteger(r.elementIndex)&&r.elementIndex>=0&&typeof r.src=="string"&&r.src.length>0&&(r.galleryId===void 0&&r.galleryIndex===void 0||typeof r.galleryId=="number"&&Number.isSafeInteger(r.galleryId)&&r.galleryId>=0&&typeof r.galleryIndex=="number"&&Number.isSafeInteger(r.galleryIndex)&&r.galleryIndex>=0)):e.type==="resize"&&typeof e.height=="number"&&Number.isFinite(e.height)}function Mr({attachments:t=[],bodyClassName:e="thread-floor-body",bodyFallback:r=null,bodyHtml:o,floor:n,isActivitySignupCanceled:c=!1,onImageOpen:i,onImageQuote:l,onIsolatedTextSelection:d,signatureClassName:b="thread-signature",signatureHtml:g,signatureText:f}){const v=i?(I,s,p,m)=>{const x=I[s];x&&i([x],0,p,m?()=>m(s):void 0)}:void 0;return a.jsxs(a.Fragment,{children:[o?a.jsx(Fe,{className:e,floor:n,html:o,isActivitySignupCanceled:c,onImageOpen:i,onImageQuote:l,onIsolatedTextSelection:d,variant:"floor"}):r,a.jsx(Pr,{attachments:t}),g?a.jsx(Fe,{className:b,floor:n,html:g,onImageOpen:v,variant:"signature"}):f?a.jsx("footer",{className:b,children:a.jsx("p",{children:f})}):null]})}function Pr({attachments:t}){return t.length===0?null:a.jsxs("section",{"aria-label":"附件",className:"thread-attachments",children:[a.jsxs("header",{className:"thread-attachments-heading",children:[a.jsx(zt,{"aria-hidden":"true",size:14}),a.jsx("span",{children:"附件"}),a.jsx("small",{children:t.length})]}),a.jsx("ul",{children:t.map(e=>{const r=a.jsxs(a.Fragment,{children:[a.jsx("span",{className:"thread-attachment-name",children:e.name}),a.jsx("small",{children:Fr(e)}),e.exists!==!1&&a.jsx(Et,{"aria-hidden":"true",size:15})]});return a.jsx("li",{children:e.exists===!1?a.jsx("div",{"aria-disabled":"true",className:"thread-attachment-link is-unavailable",children:r}):a.jsx("a",{className:"thread-attachment-link",download:e.name,href:e.downloadHref||`/bbs/download/?id=${encodeURIComponent(e.id)}`,children:r})},e.id)})})]})}function Fr(t){if(t.exists===!1)return"文件不可用";const e=[zr(t.size),(t.price??0)>0?"付费附件":"免费"];return t.downloadCount!==void 0&&e.push(`下载 ${t.downloadCount} 次`),e.join(" · ")}function zr(t){if(t<=0)return"大小未知";if(t<1024)return`${t} B`;const e=["KB","MB","GB","TB"];let r=t,o=-1;do r/=1024,o+=1;while(r>=1024&&o<e.length-1);return`${r.toFixed(r>=10?1:2)} ${e[o]}`}function Or({author:t,id:e}){const r=t.tags??[],[o,n]=u.useState(!1),c=u.useRef(null),i=u.useRef(null),l=u.useRef(null),d=u.useRef(null),b=r.map(g=>`${g.id}:${g.name}`).join("|");return u.useLayoutEffect(()=>{if(r.length===0){n(!1);return}const g=()=>{const v=c.current,I=i.current,s=l.current,p=d.current;if(!v||!I||!s||!p||v.offsetWidth===0)return;const m=s.getBoundingClientRect().width,x=p.getBoundingClientRect().width,y=Number.parseFloat(getComputedStyle(I).columnGap)||0,k=I.clientWidth-m-y,S=x>k+1;n(j=>j===S?j:S)};g();const f=new ResizeObserver(g);return[c.current,i.current,d.current].forEach(v=>{v&&f.observe(v)}),()=>f.disconnect()},[b,r.length]),a.jsxs("div",{id:e,ref:c,className:"author-hover-card",role:"dialog","aria-label":`${t.name} 的用户摘要`,children:[a.jsxs("div",{className:"author-card-head",children:[a.jsx("img",{src:t.avatar,alt:""}),a.jsxs("div",{className:"author-card-head-copy",children:[a.jsxs("div",{ref:i,className:"author-card-name-line","data-tags-overflow":o?"true":void 0,children:[a.jsx("strong",{ref:l,children:t.name}),a.jsx("div",{className:"author-card-tag-slot",children:a.jsx(ce,{size:"compact",tags:r})})]}),(t.stars>0||t.role)&&a.jsxs("span",{className:"author-card-status",children:["★".repeat(t.stars),t.stars>0&&t.role?" · ":"",t.role]})]})]}),o?a.jsx("div",{className:"author-card-tags-row",children:a.jsx(ce,{size:"compact",tags:r})}):null,t.medals?.length?a.jsx("div",{className:"author-card-medals",children:a.jsx(Ge,{medals:t.medals,profileName:t.name,variant:"compact"})}):null,a.jsx("div",{ref:d,className:"author-card-tag-width-measure","aria-hidden":"true",children:a.jsx(ce,{size:"compact",tags:r})}),a.jsxs("dl",{children:[a.jsxs("div",{children:[a.jsx("dt",{children:"主题"}),a.jsx("dd",{children:t.topics})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"回复"}),a.jsx("dd",{children:t.replies})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"签到"}),a.jsx("dd",{children:t.checkins})]})]}),a.jsxs("p",{children:["最近在线：",t.lastSeen]}),a.jsxs("a",{href:te(t.name),children:["查看个人主页 ",a.jsx(Tt,{size:13})]})]})}function Dr({author:t}){const e=t.tags??[],r=Ue(e),o=te(t.name);return a.jsxs("aside",{className:"thread-author-profile","aria-label":`${t.name} 的资料`,children:[a.jsx("a",{"aria-label":`查看${t.name}的个人主页`,className:"thread-author-profile-avatar",href:o,children:a.jsx("img",{src:t.avatar,alt:""})}),a.jsx("div",{className:"thread-author-profile-identity",children:a.jsx("a",{href:o,children:t.name})}),(t.stars>0||t.role)&&a.jsxs("div",{className:"thread-author-profile-status",children:[t.stars>0&&a.jsx("span",{"aria-label":`${t.stars} 星`,children:"★".repeat(t.stars)}),t.role&&a.jsx("strong",{children:t.role})]}),a.jsx(He,{tags:r}),a.jsx(Ge,{medals:t.medals??[],profileName:t.name,variant:"compact"}),a.jsxs("dl",{className:"thread-author-profile-stats",children:[a.jsxs("div",{children:[a.jsx("dt",{children:"主题"}),a.jsx("dd",{children:t.topics})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"回复"}),a.jsx("dd",{children:t.replies})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"签到"}),a.jsx("dd",{children:t.checkins})]})]}),a.jsxs("p",{className:"thread-author-profile-last-seen",children:[a.jsx("span",{children:"最近在线"}),a.jsx("strong",{children:t.lastSeen})]})]})}function fe(t){return t.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,"$1-$2-$3 $4:$5:$6")}function Hr(t){const e=window.getSelection()?.toString();e&&(t.preventDefault(),t.clipboardData.setData("text/plain",e))}function Ur({articleAfterContent:t,author:e,avatarRail:r,className:o="",content:n,decorationImageSrc:c,editedAt:i,floor:l,floorIndex:d,id:b,inlineAvatar:g=!1,mainAfterContent:f,onCopy:v,publishedAt:I,showAuthorProfile:s}){const p=e.tags??[],m=Ue(p);return a.jsxs("article",{className:`forum-card thread-floor${s?" thread-floor-with-author-profile":""}${o?` ${o}`:""}`,"data-floor":l,id:b,onCopy:v,children:[c&&a.jsx("span",{"aria-hidden":"true",className:"thread-floor-decoration",children:a.jsx("img",{alt:"",src:c})}),s?a.jsx(Dr,{author:e}):!g&&r,a.jsxs("div",{className:"thread-floor-main",children:[a.jsxs("header",{className:"thread-floor-header",children:[!s&&g&&r,a.jsxs("div",{className:"thread-floor-author",children:[a.jsx("a",{href:te(e.name),children:e.name}),a.jsx(He,{tags:m})]}),a.jsxs("div",{className:"thread-floor-time",children:[a.jsx("time",{children:fe(I)}),i&&a.jsxs(a.Fragment,{children:[a.jsx("span",{children:"·"}),a.jsxs("time",{children:["编辑于 ",fe(i)]})]})]}),d]}),s?a.jsx("div",{className:"thread-floor-content",children:n}):n,f]}),t]})}function Gr({canDelete:t,canEdit:e,canQuote:r,canReply:o,decorative:n=!1,deleting:c=!1,editHref:i="",onDelete:l,onEditSignup:d,onQuote:b,onReply:g}){const f=n?-1:void 0,v=u.useRef(null);return a.jsxs("div",{"aria-hidden":n||void 0,className:`thread-floor-actions${n?" thread-floor-actions-decorative":""}`,children:[r&&a.jsxs("button",{onClick:I=>{const s=v.current?v.current.text:Oe(I.currentTarget);v.current=null,b?.(s)},onPointerDown:I=>{I.button===0&&(v.current={text:Oe(I.currentTarget)})},tabIndex:f,type:"button",children:[a.jsx(Lt,{size:15}),"引用"]}),d&&!n&&a.jsxs("button",{onClick:d,type:"button",children:[a.jsx(de,{size:15}),"编辑报名"]}),o&&a.jsxs("button",{onClick:g,tabIndex:f,type:"button",children:[a.jsx(Qt,{size:15}),"回复"]}),e&&(n?a.jsxs("button",{tabIndex:-1,type:"button",children:[a.jsx(de,{size:15}),"编辑"]}):a.jsxs("a",{href:i,children:[a.jsx(de,{size:15}),"编辑"]})),t&&a.jsxs("button",{"aria-busy":c||void 0,className:"floor-action-danger",disabled:!n&&c,onClick:n?void 0:I=>l?.(I.currentTarget),tabIndex:f,type:"button",children:[a.jsx(be,{size:15}),c?"删除中":"删除"]})]})}function aa({canQuote:t,canReply:e,decorationImageSrc:r,editHref:o,floor:n,isActivityThread:c,isMainPost:i,locked:l,inlineAvatar:d,showAuthorProfile:b,hideSignature:g,onDeleteFloor:f,onDeleteNestedReply:v,onEditSignup:I,onIsolatedTextSelection:s,onQuote:p,onSubmitNestedReply:m,viewer:x}){const[y,k]=u.useState(!1),[S,j]=u.useState(null),[z,A]=u.useState([]),[q,C]=u.useState(""),[B,M]=u.useState(!1),[W,H]=u.useState([]),[J,K]=u.useState(""),[ae,Q]=u.useState(""),[N,O]=u.useState(null),[Z,w]=u.useState(""),[_,E]=u.useState(!1),[L,P]=u.useState(void 0),R=Zt(J),D=jt(":scope > article"),F=`nested-reply-count-${n.id}`,[Y,ve]=u.useState(null),[ne,we]=u.useState(!1),Ie=u.useRef(null),ee=u.useRef(null),ie=u.useRef(null),ke=u.useRef(null),Se=u.useRef(null),Ae=u.useMemo(()=>[...n.nestedReplies??[],...W].filter(h=>!z.includes(h.id)),[z,n.nestedReplies,W]),Re=c&&!i&&/<\s*(?:s|strike)\b/i.test(n.contentHtml??""),Ee=`thread-floor-body${Re?" capubbs-activity-signup-canceled":""}`;u.useEffect(()=>()=>{ee.current!==null&&window.clearTimeout(ee.current)},[]),u.useEffect(()=>{if(!ne)return;function h($){Ie.current?.contains($.target)||we(!1)}return document.addEventListener("pointerdown",h),()=>document.removeEventListener("pointerdown",h)},[ne]);async function et(){const h=`${window.location.origin}${window.location.pathname}${window.location.search}#${n.floor}`;await Vt(h)&&(k(!0),ee.current!==null&&window.clearTimeout(ee.current),ee.current=window.setTimeout(()=>k(!1),1800))}const je=(h,$,U,le)=>{Se.current=U,ve({imageIndex:$,images:h,onImageChange:le})};function tt(h){Y?.onImageChange?.(h),ve(null),window.requestAnimationFrame(()=>Se.current?.focus())}function qe(h=null){P(h),K(""),Q(""),w(""),window.requestAnimationFrame(()=>ke.current?.focus())}function Ne(){P(void 0),K(""),w("")}async function rt(h){h.preventDefault();const $=J.trim();if(!(!R.canSubmit||!x||!e||_)){E(!0),w("");try{const U=await m(n,L??null,$);H(le=>[...le,{author:x,canDelete:!0,content:$,id:U>0?String(U):`local-${n.id}-${Date.now()}`,publishedAt:Wr(new Date),target:L??void 0}]),Ne()}catch(U){w(U instanceof Error?U.message:"楼中楼回复发布失败，请稍后重试。")}finally{E(!1)}}}async function at(h){O(h.id),Q("");try{await v(n,h),A($=>[...$,h.id]),H($=>$.filter(U=>U.id!==h.id)),j(null)}catch($){Q($ instanceof Error?$.message:"楼中楼删除失败，请稍后重试。")}finally{O(null)}}async function nt(){if(!B){M(!0),C("");try{await f(n)}catch(h){C(h instanceof Error?h.message:"楼层删除失败，请稍后重试。"),M(!1)}}}function ot(){j(null),C(""),Q(""),window.requestAnimationFrame(()=>ie.current?.focus())}function st(){if(l||!S)return;const h=S;j(null),h.kind==="floor"?nt():at(h.reply)}const it=a.jsxs("div",{className:`thread-avatar-rail${ne?" thread-avatar-rail-open":""}`,ref:Ie,children:[a.jsx("button",{"aria-controls":`author-card-${n.floor}`,"aria-expanded":ne,"aria-label":`查看${n.author.name}的资料卡`,className:"thread-avatar-button",onClick:()=>we(h=>!h),type:"button",children:a.jsx("img",{src:n.author.avatar,alt:""})}),a.jsx(Or,{author:n.author,id:`author-card-${n.floor}`})]}),lt=a.jsx(Mr,{attachments:n.attachments,bodyFallback:a.jsx("div",{className:Ee,children:n.paragraphs.map(h=>a.jsx("p",{children:h},h))}),bodyClassName:Ee,bodyHtml:n.contentHtml,floor:n.floor,isActivitySignupCanceled:Re,onImageOpen:je,onImageQuote:t?h=>p(n,void 0,h):void 0,onIsolatedTextSelection:h=>s(n,h),signatureHtml:g?void 0:n.signatureHtml,signatureText:g?void 0:n.signature}),ct=a.jsxs("button",{"aria-label":`复制第 ${n.floor} 楼链接`,className:"thread-floor-index",onClick:et,title:"复制楼层链接",type:"button",children:["#",n.floor]}),ut=a.jsxs(a.Fragment,{children:[a.jsx(Gr,{canDelete:!l&&(!c||i)&&(n.canDelete??n.isOwn??!1),canEdit:!l&&(!c||i)&&!!n.isOwn,canQuote:t,canReply:e,deleting:B,editHref:o,onEditSignup:!l&&c&&!i&&n.isOwn?I:void 0,onDelete:h=>{ie.current=h,C(""),j({kind:"floor"})},onQuote:h=>p(n,h),onReply:()=>qe()}),q&&a.jsx("p",{className:"thread-floor-delete-error",role:"alert",children:q}),Ae.length>0&&a.jsx("section",{className:"nested-replies",ref:D,"aria-label":`${n.floor} 楼的楼中楼回复`,children:Ae.map(h=>a.jsxs("article",{children:[a.jsx("img",{src:h.author.avatar,alt:""}),a.jsxs("div",{className:"nested-reply-main",children:[a.jsxs("div",{className:"nested-reply-identity",children:[a.jsx("a",{className:"nested-reply-author",href:te(h.author.name),children:h.author.name}),h.target&&a.jsxs("span",{className:"nested-reply-target",children:[" ","回复"," ",a.jsx("a",{className:"nested-reply-author",href:te(h.target),children:h.target})]})]}),h.contentHtml?a.jsx(Ye,{className:"nested-reply-content",html:h.contentHtml,onImageOpen:je,variant:"nested"}):a.jsx("p",{children:h.content}),a.jsxs("footer",{className:"nested-reply-footer",children:[a.jsx("time",{children:fe(h.publishedAt)}),e&&a.jsx("button",{onClick:()=>qe(h.author.name),type:"button",children:"回复"}),!l&&h.canDelete&&a.jsxs("button",{className:"nested-reply-delete",disabled:N===h.id,onClick:$=>{ie.current=$.currentTarget,Q(""),j({kind:"nested",reply:h})},type:"button",children:[a.jsx(be,{size:12}),N===h.id?"删除中":"删除"]})]})]})]},h.id))}),ae&&a.jsx("p",{className:"nested-reply-delete-error",role:"alert",children:ae}),L!==void 0&&e&&a.jsxs("form",{className:"nested-reply-composer",onSubmit:rt,children:[a.jsxs("div",{className:"nested-reply-input-field",children:[a.jsx("textarea",{"aria-describedby":F,"aria-invalid":R.isOverLimit||void 0,"aria-label":L?`回复 @${L}`:`回复第 ${n.floor} 楼`,onChange:h=>{K(h.target.value),w("")},placeholder:L?`回复 @${L}`:"写一条楼中楼回复",ref:ke,rows:2,value:J}),a.jsxs("small",{"aria-label":`已输入 ${R.length} 字，最多 ${R.limit} 字`,className:`nested-reply-character-count${R.isOverLimit?" nested-reply-character-count-error":""}`,id:F,children:[R.length," / ",R.limit]})]}),a.jsxs("div",{className:"nested-reply-composer-actions",children:[a.jsx("button",{"aria-label":"取消楼中楼回复",className:"nested-reply-cancel",disabled:_,onClick:Ne,type:"button",children:a.jsx(he,{size:15})}),a.jsxs("button",{className:"nested-reply-submit",disabled:!R.canSubmit||_,type:"submit",children:[a.jsx(qt,{size:14}),_?"发送中":"发送"]})]}),Z&&a.jsx("p",{className:"nested-reply-error",role:"alert",children:Z})]})]}),dt=a.jsxs(a.Fragment,{children:[y&&a.jsxs("div",{"aria-live":"polite",className:"copy-floor-toast",role:"status",children:[a.jsx(Nt,{"aria-hidden":"true",size:15}),"已复制楼层链接"]}),a.jsx(pe,{children:Y&&a.jsx(Ot,{images:Y.images,initialImageIndex:Y.imageIndex,onImageChange:Y.onImageChange,onClose:tt})}),a.jsx(pe,{mobileSize:"compact",children:!l&&S&&a.jsx(_r,{floor:n,isMainPost:i,onCancel:ot,onConfirm:st,target:S})})]});return a.jsx(Ur,{articleAfterContent:dt,author:n.author,avatarRail:it,content:lt,decorationImageSrc:r,editedAt:n.editedAt,floor:n.floor,floorIndex:ct,id:String(n.floor),inlineAvatar:d,mainAfterContent:ut,onCopy:Hr,publishedAt:n.publishedAt,showAuthorProfile:b})}function Oe(t){const e=t.closest(".thread-floor")?.querySelector(".thread-floor-body");return _t(window.getSelection(),e??null)}function _r({floor:t,isMainPost:e,onCancel:r,onConfirm:o,target:n}){const c=n.kind==="nested"?n.reply:null,i=c?"删除楼中楼回复":e?"删除主楼":"删除回复",l=c?"":e?"删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。":"删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。",d=c?.author.name??t.author.name,b=c?`#${t.floor} · 楼中楼`:`#${t.floor}`,g=Br(c?.content||t.quoteText||t.paragraphs[0]||"");return u.useEffect(()=>(document.body.classList.add("thread-delete-dialog-open"),()=>document.body.classList.remove("thread-delete-dialog-open")),[]),u.useEffect(()=>{function f(v){v.key==="Escape"&&r()}return document.addEventListener("keydown",f),()=>document.removeEventListener("keydown",f)},[r]),a.jsx(De,{className:"thread-delete-dialog-backdrop",onMouseDown:f=>{f.currentTarget===f.target&&r()},role:"presentation",children:a.jsxs("section",{"aria-describedby":l?"thread-delete-dialog-description":void 0,"aria-labelledby":"thread-delete-dialog-title","aria-modal":"true",className:"thread-delete-dialog",role:"dialog",children:[a.jsxs("header",{children:[a.jsx("span",{className:"thread-delete-dialog-icon","aria-hidden":"true",children:a.jsx(Jt,{size:19})}),a.jsx("div",{children:a.jsx("h2",{id:"thread-delete-dialog-title",children:i})}),a.jsx("button",{"aria-label":"关闭删除确认",onClick:r,type:"button",children:a.jsx(he,{size:18})})]}),a.jsxs("div",{className:"thread-delete-dialog-body",children:[l&&a.jsx("p",{id:"thread-delete-dialog-description",children:l}),a.jsxs("div",{className:"thread-delete-dialog-target",children:[a.jsxs("span",{children:[d," · ",b]}),a.jsx("p",{children:g||"此回复没有可预览的文字内容。"})]})]}),a.jsxs("footer",{children:[a.jsx("button",{autoFocus:!0,className:"thread-delete-dialog-cancel",onClick:r,type:"button",children:"取消"}),a.jsxs("button",{className:"thread-delete-dialog-confirm",onClick:o,type:"button",children:[a.jsx(be,{size:15}),"确认删除"]})]})]})})}function Br(t){const e=t.replace(/\s+/g," ").trim();return e.length>100?`${e.slice(0,100).trimEnd()}…`:e}function Wr(t){const e=r=>String(r).padStart(2,"0");return`${t.getFullYear()}-${e(t.getMonth()+1)}-${e(t.getDate())} ${e(t.getHours())}:${e(t.getMinutes())}:${e(t.getSeconds())}`}export{Mr as T,ra as a,Ur as b,Gr as c,aa as d,ta as f,ea as p,Vt as w};
