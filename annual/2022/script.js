// 行者 2022 — image lightbox, scroll reveals and page turns. Without script, or with reduced
// motion, everything is simply shown and links load as usual.
(() => {
    const root = document.documentElement;
    const motion = root.classList.contains('motion') && 'IntersectionObserver' in window;
    if (!motion) root.classList.remove('motion');
    const issue = new URL('./', document.currentScript.src).pathname;   // /annual/2022/

    // Article photos open full size over the page; the close button, Esc or any click closes them.
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[data-lightbox]');
        if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        const box = document.createElement('div');
        box.className = 'lightbox';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');
        const img = link.querySelector('img');
        box.innerHTML = '<button type="button" aria-label="关闭">×</button><img alt="">';
        box.querySelector('img').src = link.href;
        box.querySelector('img').alt = img ? img.alt : '';
        const close = () => { box.remove(); document.removeEventListener('keydown', onKey); link.focus(); };
        const onKey = (e) => { if (e.key === 'Escape') close(); };
        box.addEventListener('click', close);
        document.addEventListener('keydown', onKey);
        document.body.append(box);
        box.querySelector('button').focus();
    });

    // ---------- scroll reveals ----------
    const targets = [
        '.essay-sky', '.essay-head', '.prose > *',
        '.contents-head h2', '.contents-latin', '.contents-jump',
        '.volume-head', '.volume-photo', '.disc', '.group-name', '.entry',
        '.colophon-mark', '.colophon-credits > div', '.colophon-foot',
        '.article-hero', '.article-titles', '.people-index', '.pager',
    ].join(',');
    const show = (entries, observer) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
        }
    };
    // Article text is revealed as soon as any of it is on screen; page decoration waits a little longer.
    const decor = motion && new IntersectionObserver(show, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    const text = motion && new IntersectionObserver(show, { threshold: 0 });

    function reveals(immediate) {
        if (!motion) return;
        document.querySelectorAll(targets).forEach((el) => {
            // Siblings that enter together cascade in order.
            const list = [...el.parentElement.children].filter((c) => c.matches(targets));
            el.style.setProperty('--i', Math.min(list.indexOf(el), 10));
            el.classList.add('reveal');
            // After a page turn the first screen is already shown by the turning page.
            if (immediate && el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in');
            else (el.matches('.article-body > *') ? text : decor).observe(el);
        });
    }
    // ---------- article contents ----------
    // The sticky bar (.toc-fold) and the wide-screen card (.toc-aside) list the same sections. The
    // current one is the last whose top has passed a line 30% down the screen; it is marked in both,
    // named in the bar, counted in the card, and --toc-p carries the progress for their rails.
    let untrack = () => {};
    function contents() {
        untrack();
        const fold = document.querySelector('.toc-fold');
        const aside = document.querySelector('.toc-aside');
        if (!fold && !aside) return;
        const lists = [fold, aside].filter(Boolean);
        const links = lists.map((l) => [...l.querySelectorAll('.toc-list a')]);
        const targets = links[0].map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))));
        const now = fold && fold.querySelector('.toc-now');
        const count = aside && aside.querySelector('.toc-count');
        let current = -2;
        // what the contents must not cover
        const pictures = [...document.querySelectorAll('.article-body figure, .article-hero, .video, .pager, .colophon')];
        const covers = (el) => {
            if (!el || el.classList.contains('is-off')) return false;
            const r = el.getBoundingClientRect();
            if (!r.width) return false;   // not shown at this width (offsetParent is no test: the card is fixed)
            return pictures.some((p) => {
                const q = p.getBoundingClientRect();
                return q.left < r.right && q.right > r.left && q.top < r.bottom && q.bottom > r.top;
            });
        };

        const update = () => {
            lists.forEach((l) => l.classList.toggle('is-faint', covers(l)));
            const line = innerHeight * 0.3;
            let i = -1;
            targets.forEach((el, k) => { if (el && el.getBoundingClientRect().top <= line) i = k; });
            const last = targets[targets.length - 1];
            const end = last ? last.getBoundingClientRect().bottom <= innerHeight : false;
            const progress = i < 0 ? 0 : end ? 1 : (i + 1) / targets.length;
            lists.forEach((l) => l.style.setProperty('--toc-p', progress.toFixed(3)));
            if (i === current) return;
            current = i;
            links.forEach((group) => group.forEach((a, k) => a.setAttribute('aria-current', k === i ? 'true' : 'false')));
            const entry = links[0][i];
            if (now) now.textContent = entry ? [...entry.children].map((c) => c.textContent.trim()).filter(Boolean).join('　') : '';
            if (count) count.textContent = i < 0 ? `${targets.length}` : `${i + 1} / ${targets.length}`;
            // keep the marked entry in view inside the card's own scroll
            const mark = aside && links[lists.indexOf(aside)][i];
            if (mark && !aside.classList.contains('is-off')) {
                const box = mark.closest('.toc-list');
                const top = mark.offsetTop - box.offsetTop;
                if (top < box.scrollTop || top > box.scrollTop + box.clientHeight - mark.offsetHeight) {
                    box.scrollTo({ top: top - box.clientHeight / 3, behavior: 'smooth' });
                }
            }
        };
        let frame = 0;
        const onScroll = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; update(); }); };
        addEventListener('scroll', onScroll, { passive: true });
        addEventListener('resize', onScroll);
        // picking an entry in the sticky bar folds it away again
        const close = (event) => { if (event.target.closest('a')) fold.open = false; };
        if (fold) fold.addEventListener('click', close);

        // the card appears once the article header has scrolled away
        let observer = null;
        const head = document.querySelector('.article-head');
        if (aside && head && 'IntersectionObserver' in window) {
            aside.classList.add('is-off');
            observer = new IntersectionObserver(([e]) => aside.classList.toggle('is-off', e.isIntersecting));
            observer.observe(head);
        }
        untrack = () => {
            removeEventListener('scroll', onScroll);
            removeEventListener('resize', onScroll);
            if (observer) observer.disconnect();
        };
        update();
    }

    // ---------- banner under the top bar ----------
    // body.past-banner once the banner header (or the front cover) has gone up under the bar: the
    // bar, clear over the picture, turns to paper.
    let bannerWatch = null;
    function banner() {
        if (bannerWatch) bannerWatch.disconnect();
        bannerWatch = null;
        document.body.classList.remove('past-banner');
        const head = document.querySelector('.article-head.has-hero, .cover');   // a banner, or the front cover
        if (!head || !('IntersectionObserver' in window)) return;
        const bar = document.querySelector('.bar');
        const margin = bar ? bar.offsetHeight : 52;
        bannerWatch = new IntersectionObserver(([e]) => document.body.classList.toggle('past-banner', !e.isIntersecting),
            { rootMargin: `-${margin}px 0px 0px 0px` });
        bannerWatch.observe(head);
    }

    function setup(immediate) {
        reveals(immediate);
        contents();
        banner();
    }
    setup(false);

    // ---------- page turns ----------
    // Links inside the issue load in place and the page turns over a centre spine. Two clipped
    // copies of the page (left half, right half) are laid over it before and after the swap; the
    // view transition then folds the old right half over the spine, and its back is the new left
    // half (going on), or mirrors that (going back).
    if (!motion || !document.startViewTransition || !window.fetch || !window.DOMParser) return;

    let index = (history.state && history.state.index) || 0;
    history.replaceState({ ...history.state, index }, '');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    let busy = false;
    let shown = location.pathname;   // the page currently in the document

    // Article pages are also published on COS (tool/annual-upload-cos.mjs); a page turn reads them
    // there and falls back to the site's own copy. The front page always comes from the site.
    const CDN = 'https://chexie-1342390402.cos.ap-beijing.myqcloud.com';
    async function load(url) {
        const target = new URL(url, location.href);
        const sources = target.pathname.startsWith(`${issue}articles/`) ? [CDN + target.pathname] : [];
        sources.push(target.href.split('#')[0]);
        for (const source of sources) {
            try {
                const response = await fetch(source, { mode: 'cors' });
                if (response.ok) return await response.text();
            } catch (e) { /* try the next source */ }
        }
        throw new Error(`could not load ${url}`);
    }

    function halves() {
        const wrap = document.createElement('div');
        wrap.className = 'flip-halves';
        wrap.setAttribute('aria-hidden', 'true');
        for (const side of ['l', 'r']) {
            const pane = document.createElement('div');
            pane.className = `flip-pane flip-${side}`;
            const inner = document.createElement('div');
            inner.className = `flip-inner ${document.body.className}`;   // page-type styles key off the body class
            inner.style.top = `${-scrollY}px`;
            for (const node of document.body.children) {
                if (node === wrap || node.classList.contains('flip-halves') || node.tagName === 'SCRIPT') continue;
                const copy = node.cloneNode(true);
                copy.querySelectorAll('iframe').forEach((f) => f.replaceWith(document.createElement('div')));
                // ids stay unique in the live page; inside the logo they must stay, its gradients refer to them
                copy.querySelectorAll('[id]').forEach((e) => { if (!e.closest('svg')) e.removeAttribute('id'); });
                inner.append(copy);
            }
            pane.append(inner);
            wrap.append(pane);
        }
        document.body.append(wrap);
        return wrap;
    }

    async function turn(url, { back = false, push = true, scroll = 0 } = {}) {
        if (busy) {
            if (!push) location.reload();   // history moved while a page was still turning
            return;
        }
        busy = true;
        let doc;
        try {
            doc = new DOMParser().parseFromString(await load(url), 'text/html');
        } catch (e) {
            location.href = url;
            return;
        }
        if (push) {
            history.replaceState({ ...history.state, index, scroll: scrollY }, '');
            index += 1;
            history.pushState({ index, scroll: 0 }, '', url);
        }
        shown = new URL(url, location.href).pathname;
        const before = halves();
        root.dataset.flip = back ? 'back' : 'on';
        const transition = document.startViewTransition(() => {
            before.remove();
            document.title = doc.title;
            document.body.className = doc.body.className;
            document.body.innerHTML = doc.body.innerHTML;
            const theme = doc.querySelector('meta[name="theme-color"]');
            if (theme) document.querySelector('meta[name="theme-color"]').content = theme.content;
            const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
            // Jump, never glide (the page sets smooth scrolling): the turning page must already show
            // the new page's top, or the anchor, before the copies are taken.
            if (target) target.scrollIntoView({ behavior: 'instant' }); else scrollTo({ top: scroll, behavior: 'instant' });
            setup(true);
            halves();
        });
        transition.finished.finally(() => {
            document.querySelectorAll('.flip-halves').forEach((w) => w.remove());
            delete root.dataset.flip;
            busy = false;
        });
    }

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');
        if (!link || event.defaultPrevented || link.target || link.hasAttribute('download') || link.hasAttribute('data-lightbox')
            || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const url = new URL(link.href, location.href);
        const inIssue = url.origin === location.origin && url.pathname.startsWith(issue)
            && (url.pathname === issue || url.pathname.endsWith('.html'));
        if (!inIssue || url.pathname === location.pathname) return;   // other sites, other issues, same-page anchors
        event.preventDefault();
        // Going to the previous article or up to the contents turns the page back; a "next" link
        // turns forward wherever it leads (the last article's goes on to the 跋 on the front page).
        const up = url.pathname === issue || url.pathname === `${issue}index.html`;
        const back = link.rel === 'prev' || (up && link.rel !== 'next');
        turn(url.href, { back });
    });

    addEventListener('popstate', (event) => {
        if (location.pathname === shown) return;   // an anchor on the same page: the browser scrolls
        const state = event.state || {};
        const target = typeof state.index === 'number' ? state.index : index;
        const back = target < index;
        index = target;
        turn(location.href, { back, push: false, scroll: state.scroll || 0 });
    });
})();
