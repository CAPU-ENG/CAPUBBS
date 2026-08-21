async function i(e){let t=0;const o=e.catch(()=>{});await Promise.race([o,new Promise(a=>{t=window.setTimeout(a,800)})]),t&&window.clearTimeout(t)}export{i as w};
