// 行者 2021 — marks elements as they enter the viewport, sets up each page's pieces, opens photos in a
// lightbox and moves between article pages inside one document (the pages are also published on COS).
// Without this script, or with reduced motion, everything is shown at rest.
(() => {
    const root = document.documentElement;

    // Everything a page sets up for itself. Listeners on the window and the document, observers and frame
    // loops end with the signal, when the router swaps in another page.
    const initPage = (signal) => {
    const observe = (observer) => { signal.addEventListener('abort', () => observer.disconnect()); return observer; };
    if (root.classList.contains('motion') && 'IntersectionObserver' in window) {
        const io = observe(new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (!e.isIntersecting) continue;
                e.target.classList.add('in');
                io.unobserve(e.target);
            }
        }, { rootMargin: '0px 0px -12% 0px' }));
        for (const el of document.querySelectorAll('.prize, .fan, .prose .photo, .road-wrap, .colophon, .planet, .sign, .route, .route-block')) {
            el.classList.add('rv');
            io.observe(el);
        }
    }

    // ---------- cover: the prints in the sky lean with the pointer (--mx, --my in -1…1) ----------
    const cover = document.querySelector('.cover');
    if (cover && root.classList.contains('motion') && matchMedia('(hover: hover)').matches) {
        let frame = 0, mx = 0, my = 0;
        cover.addEventListener('pointermove', (e) => {
            const r = cover.getBoundingClientRect();
            mx = ((e.clientX - r.left) / r.width) * 2 - 1;
            my = ((e.clientY - r.top) / r.height) * 2 - 1;
            if (!frame) frame = requestAnimationFrame(() => {
                frame = 0;
                cover.style.setProperty('--mx', mx.toFixed(3));
                cover.style.setProperty('--my', my.toFixed(3));
            });
        });
        cover.addEventListener('pointerleave', () => { cover.style.setProperty('--mx', 0); cover.style.setProperty('--my', 0); });
    }

    // ---------- the year as a road: a milestone names its date and event ----------
    const road = document.querySelector('.road-wrap');
    if (road) {
        // the label lives on the page, not in the road (which scrolls sideways and would clip it)
        const tip = document.createElement('div');
        tip.className = 'road-tip';
        tip.hidden = true;
        document.body.append(tip);
        let shown = null;
        const show = (m) => {
            shown = m;
            const a = m.getBoundingClientRect();
            tip.textContent = m.getAttribute('aria-label');
            tip.hidden = false;
            // centred over the milestone, kept inside the window
            const half = tip.offsetWidth / 2, x = a.left + a.width / 2;
            tip.style.left = `${Math.min(Math.max(x, half + 8), innerWidth - half - 8)}px`;
            tip.style.top = `${a.top}px`;
        };
        const hide = () => { shown = null; tip.hidden = true; };
        road.addEventListener('pointerover', (e) => { const m = e.target.closest('.milestone'); if (m) show(m); });
        road.addEventListener('pointerout', (e) => { if (e.target.closest('.milestone')) hide(); });
        road.addEventListener('focusin', (e) => { const m = e.target.closest('.milestone'); if (m) show(m); });
        road.addEventListener('focusout', hide);
        road.addEventListener('scroll', hide, { passive: true });
        addEventListener('scroll', hide, { passive: true, signal });
        // on touch, the first tap names the milestone, a second tap follows it
        road.addEventListener('click', (e) => {
            const m = e.target.closest('.milestone');
            if (m && e.pointerType === 'touch' && shown !== m) { e.preventDefault(); show(m); }
        });
    }

    // ---------- article contents ----------
    // The sticky fold and the route of stops list the same sections. The current one is the last whose
    // top has passed a line 30% down the screen: named in the fold, filled on the route, and the stops
    // before it are marked as passed. The route shows once the article header has scrolled away.
    const fold = document.querySelector('.stops-fold');
    const route = document.querySelector('.stops');
    if (fold || route) {
        const lists = [fold, route].filter(Boolean);
        const links = lists.map((l) => [...l.querySelectorAll('.stops-list a')]);
        const targets = links[0].map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))));
        const now = fold && fold.querySelector('.stops-now');
        let current = -2;
        const update = () => {
            const line = innerHeight * 0.3;
            let i = -1;
            targets.forEach((el, k) => { if (el && el.getBoundingClientRect().top <= line) i = k; });
            if (i === current) return;
            current = i;
            links.forEach((group) => group.forEach((a, k) => {
                a.setAttribute('aria-current', k === i ? 'true' : 'false');
                a.classList.toggle('passed', k < i);
            }));
            const entry = links[0][i];
            if (now) now.textContent = entry ? [...entry.children].map((c) => c.textContent.trim()).filter(Boolean).join('　') : '';
        };
        let frame = 0;
        const onScroll = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; update(); }); };
        addEventListener('scroll', onScroll, { passive: true, signal });
        addEventListener('resize', onScroll, { signal });
        if (fold) fold.addEventListener('click', (e) => { if (e.target.closest('a')) fold.open = false; });
        const head = document.querySelector('.article-head');
        if (route && head && 'IntersectionObserver' in window) {
            route.classList.add('is-off');
            observe(new IntersectionObserver(([e]) => route.classList.toggle('is-off', e.isIntersecting))).observe(head);
        }
        update();
    }

    // ---------- the group photos as an endless light table ----------
    // The fourteen prints are laid out twice in a tile of 4 rows × 7 (autumn, spring, autumn, spring, in
    // date order — the printed issue's two columns laid on their side). Each print's second copy sits two
    // rows down and three columns over: the farthest the wrapping tile allows, so twins never meet, across
    // the seams included. Rows are shifted by different fractions of a slot (phase), and a print shifted past
    // the tile's right edge wraps to its left, which keeps the repeat seamless. The tile repeats in every
    // direction, so
    // the table can be travelled forever: while the pointer is over it, it flows steadily toward the pointer
    // (direction from the centre to the pointer, faster further out, still in a small middle zone); it can
    // be dragged (with inertia), panned by sideways wheel / Shift+wheel or arrow keys when focused, and it
    // drifts slowly when left alone. Only the first tile is in the reading and tab order; the
    // repeats are decorative. Without the script the photos stay a plain grid.
    const shots = document.querySelector('.shots');
    if (shots) {
        const figs = [...shots.querySelectorAll('.shot')];
        const SW = 300, SH = 214, COLS = 7, ROWS = 4, PW = 262;
        const PHASE = [0, .5, .2, .7];   // row offsets, in slots
        const TW = SW * COLS, TH = SH * ROWS;
        const rand = (i, k) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
        const tile = document.createElement('div');
        tile.className = 'wall-tile';
        tile.style.width = `${TW}px`; tile.style.height = `${TH}px`;
        const place = (fig, i, col, row) => {
            const x = (((col + PHASE[row]) * SW) % TW) + (SW - PW) / 2;
            const y = row * SH + 14;
            fig.dataset.k = i;
            fig.style.cssText = `left:${x.toFixed(0)}px;top:${y}px;width:${PW}px;--tilt:${((rand(i, row) - .5) * 4).toFixed(1)}deg`;
            fig.querySelectorAll('a, img').forEach((el) => { el.draggable = false; });
            tile.append(fig);
            return { fig, x, y, w: PW };
        };
        // the figures come autumn, spring, autumn, spring …: column by pair, row by season
        const spots = figs.map((fig, i) => place(fig, i, Math.floor(i / 2), i % 2));
        figs.forEach((fig, i) => {
            const twin = fig.cloneNode(true);
            twin.removeAttribute('id');
            twin.setAttribute('aria-hidden', 'true');
            twin.querySelectorAll('a').forEach((a) => { a.tabIndex = -1; });
            place(twin, i, (Math.floor(i / 2) + 3) % COLS, (i % 2) + 2);
        });
        const wall = document.createElement('div');
        wall.className = 'wall';
        wall.tabIndex = 0;
        wall.setAttribute('role', 'group');
        wall.setAttribute('aria-label', shots.closest('[aria-label]')?.getAttribute('aria-label') || '合影');
        const plane = document.createElement('div');
        plane.className = 'wall-plane';
        wall.append(plane);
        shots.replaceWith(wall);

        let tiles = [];
        const layout = () => {
            const cols = Math.ceil(wall.clientWidth / TW) + 2, rows2 = Math.ceil(wall.clientHeight / TH) + 2;
            tiles.forEach((t) => { if (t !== tile) t.remove(); });
            tiles = [];
            for (let r = 0; r < rows2; r++) for (let c = 0; c < cols; c++) {
                const t = r === 0 && c === 0 ? tile : tile.cloneNode(true);
                if (t !== tile) {
                    t.setAttribute('aria-hidden', 'true');
                    t.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
                    t.querySelectorAll('a').forEach((a) => { a.tabIndex = -1; });
                }
                t.style.left = `${c * TW}px`; t.style.top = `${r * TH}px`;
                plane.append(t);
                tiles.push(t);
            }
        };
        // the first tile sits one tile in from the corner, so there is always a copy to the left and above
        let ox = 0, oy = 0, vx = 0, vy = 0, frame = 0;
        const mod = (a, n) => ((a % n) + n) % n;
        const draw = () => { plane.style.transform = `translate(${-TW - mod(ox, TW)}px, ${-TH - mod(oy, TH)}px)`; };
        const motion = root.classList.contains('motion');
        let dragging = false, hovering = false, visible = false, last = 0;
        let fx = 0, fy = 0;   // flow toward the pointer, in px per frame
        const tick = (t) => {
            frame = 0;
            const dt = last ? Math.min(t - last, 50) / 16.7 : 1;
            last = t;
            if (!dragging) {
                ox += vx * dt; oy += vy * dt;
                vx *= Math.pow(.94, dt); vy *= Math.pow(.94, dt);
                if (Math.abs(vx) < .02) vx = 0;
                if (Math.abs(vy) < .02) vy = 0;
                if (motion && hovering) { ox += fx * dt; oy += fy * dt; }
                else if (motion && !vx && !vy) { ox += .22 * dt; oy += .1 * dt; }
            }
            draw();
            if (visible && !signal.aborted && (motion || vx || vy || dragging)) frame = requestAnimationFrame(tick);
            else last = 0;
        };
        const run = () => { if (!frame) frame = requestAnimationFrame(tick); };
        layout(); draw();
        addEventListener('resize', () => { layout(); draw(); }, { signal });
        if ('IntersectionObserver' in window) {
            observe(new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) run(); })).observe(wall);
        } else { visible = true; run(); }
        const MAX = 5.5, DEAD = .12;   // top speed (px per frame) at the edge; still within 12% of the centre
        const aim = (e) => {
            const r = wall.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width * 2 - 1, ny = (e.clientY - r.top) / r.height * 2 - 1;
            const d = Math.hypot(nx, ny);
            const k = d <= DEAD ? 0 : Math.min((d - DEAD) / (1 - DEAD), 1) * MAX / d;
            fx = nx * k; fy = ny * k;
        };
        wall.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovering = true; aim(e); run(); } });
        wall.addEventListener('pointermove', (e) => { if (hovering) aim(e); });
        wall.addEventListener('pointerleave', () => { hovering = false; fx = fy = 0; run(); });

        // drag, with inertia; a drag never counts as a click
        let start = null, moved = 0, px = 0, py = 0, pt = 0;
        wall.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            start = { x: e.clientX, y: e.clientY }; moved = 0; px = e.clientX; py = e.clientY; pt = performance.now();
            dragging = true; vx = vy = 0;
        });
        wall.addEventListener('pointermove', (e) => {
            if (!start) return;
            const dx = e.clientX - px, dy = e.clientY - py, now = performance.now();
            ox -= dx; oy -= dy;
            const k = Math.max(now - pt, 8) / 16.7;
            vx = -dx / k; vy = -dy / k;
            px = e.clientX; py = e.clientY; pt = now;
            moved = Math.max(moved, Math.hypot(e.clientX - start.x, e.clientY - start.y));
            // take the pointer only once it really drags, so a plain click still reaches the print
            if (moved > 6 && !wall.classList.contains('is-dragging')) {
                wall.setPointerCapture(e.pointerId);
                wall.classList.add('is-dragging');
            }
            run();
        });
        const release = () => {
            if (!start) return;
            start = null; dragging = false;
            if (performance.now() - pt > 80) vx = vy = 0;   // held still before letting go: no fling
            wall.classList.remove('is-dragging');
            run();
        };
        wall.addEventListener('pointerup', release);
        wall.addEventListener('pointercancel', release);
        wall.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);

        // sideways wheel or Shift+wheel pans; a plain vertical wheel still scrolls the page
        wall.addEventListener('wheel', (e) => {
            const dx = e.shiftKey ? e.deltaY || e.deltaX : e.deltaX;
            if (Math.abs(dx) <= Math.abs(e.shiftKey ? 0 : e.deltaY) || !dx) return;
            e.preventDefault();
            ox += dx; vx = 0; run();
        }, { passive: false });
        wall.addEventListener('keydown', (e) => {
            const step = 80, keys = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
            if (!keys[e.key]) return;
            e.preventDefault();
            vx = keys[e.key][0] / 12; vy = keys[e.key][1] / 12; run();
        });

        // centre a print (any copy of it) by gliding the table, and mark every copy of it
        const centre = (spot) => {
            const tx = spot.x + spot.w / 2 - wall.clientWidth / 2, ty = spot.y + 70 - wall.clientHeight / 2;
            const fx = ox, fy = oy, t0 = performance.now(), d = motion ? 700 : 0;
            vx = vy = 0;
            const step = (t) => {
                const u = d ? Math.min((t - t0) / d, 1) : 1, e = 1 - Math.pow(1 - u, 3);
                ox = fx + (tx - fx) * e; oy = fy + (ty - fy) * e; draw();
                if (u < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            wall.querySelectorAll('.shot').forEach((f) => f.classList.toggle('is-picked', f.dataset.k === String(spots.indexOf(spot))));
        };
        // arriving at #gallery or #photo-… (the cover's prints and the timeline thumbnails link here): bring the
        // table to the middle of the screen and, for a photo, glide it to that print. The photo anchors sit
        // inside the clipped table, so the browser's own jump is not trusted: this runs now and once more when
        // the page has loaded (fonts and pictures can still shift the layout).
        const goTo = () => {
            const id = decodeURIComponent(location.hash.slice(1));
            const spot = spots.find((s) => s.fig.id === id);
            if (!spot && id !== 'gallery') return;
            wall.scrollIntoView({ block: 'center' });
            if (spot) centre(spot);
        };
        // tabbing through the (first-tile) prints brings each into view
        wall.addEventListener('focusin', (e) => {
            const spot = spots.find((s) => s.fig.contains(e.target));
            if (spot && !dragging) centre(spot);
        });
        addEventListener('hashchange', goTo, { signal });
        if (location.hash) {
            if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
            goTo();
            addEventListener('load', () => requestAnimationFrame(() => {
                const id = decodeURIComponent(location.hash.slice(1));
                if (id === 'gallery' || spots.some((s) => s.fig.id === id)) wall.scrollIntoView({ block: 'center' });
            }), { once: true, signal });
        }
    }

    // ---------- the 21 骑行团 route map: a day in the list and its leg on the map light each other ----------
    const map = document.querySelector('.route-map');
    if (map) {
        const days = [...document.querySelectorAll('.route-days li[data-day]')];
        const light = (key) => {
            map.classList.toggle('has-hot', !!key);
            map.querySelectorAll('[data-day]').forEach((el) => el.classList.toggle('is-hot', el.dataset.day === key));
            days.forEach((li) => li.classList.toggle('is-hot', li.dataset.day === key));
        };
        const on = (e) => { const el = e.target.closest('[data-day]'); light(el ? el.dataset.day : null); };
        for (const zone of [map, document.querySelector('.route-days')]) {
            zone.addEventListener('pointerover', on);
            zone.addEventListener('pointerleave', () => light(null));
        }
        days.forEach((li) => { li.tabIndex = 0; li.addEventListener('focus', () => light(li.dataset.day)); li.addEventListener('blur', () => light(null)); });
    }

    // ---------- the banner postcard turns over on click / tap / Enter / Space (hover does it in CSS) ----------
    for (const card of document.querySelectorAll('.postcard')) {
        const turn = () => {
            const on = card.classList.toggle('is-flipped');
            card.setAttribute('aria-pressed', String(on));
        };
        card.addEventListener('click', turn);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); turn(); }
        });
    }
    };
    let pageLife = new AbortController();
    initPage(pageLife.signal);

    let box = null, opener = null;
    const close = () => {
        if (!box) return;
        box.remove(); box = null;
        document.removeEventListener('keydown', onKey);
        if (opener) opener.focus({ preventScroll: true });
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };

    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-lightbox]');
        if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        opener = a;
        const img = a.querySelector('img');
        box = document.createElement('div');
        box.className = 'lightbox';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');
        box.setAttribute('aria-label', img ? img.alt : '照片');
        const big = new Image();
        big.src = a.href;
        big.alt = img ? img.alt : '';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', '关闭');
        btn.textContent = '×';
        box.append(big, btn);
        box.addEventListener('click', close);
        document.body.append(box);
        document.addEventListener('keydown', onKey);
        btn.focus();
    });
    // ---------- between article pages: swap the page in place, read from COS first ----------
    // A link from one article page to another (pager, contents, the route's stops …) loads the next page
    // into this document: from COS, where the article pages are published under the same path, or from the
    // site when that fails. Only the body and title change; the stylesheet, script and the motion flag stay.
    // No transition: the new page simply appears, at its top or at its anchor. Back and Forward swap the
    // same way and return to where each page was left. The front page and other annuals load normally.
    // On a local preview the site's own files are read, so edits show at once.
    const me = document.currentScript || document.querySelector('script[src$="script.js"]');
    const annualRoot = me ? new URL(me.src, location.href).pathname.replace(/script(\.[0-9a-f]+)?\.js$/, '') : '';
    const articles = annualRoot + 'articles/';
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    const MIRROR = 'https://chexie-1342390402.cos.ap-beijing.myqcloud.com';
    if (annualRoot && window.fetch && window.DOMParser && location.pathname.startsWith(articles)) {
        let busy = false, saveTimer = 0, activePath = location.pathname;
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        const saved = () => (history.state && typeof history.state.y === 'number' ? history.state.y : null);
        const remember = () => {
            clearTimeout(saveTimer); saveTimer = 0;
            try { history.replaceState({ y: scrollY }, ''); } catch { /* state is optional */ }
        };
        const isArticle = (url) => url.origin === location.origin && url.pathname.startsWith(articles) && url.pathname.endsWith('.html');
        const jump = (y) => {
            const previous = root.style.scrollBehavior;
            root.style.scrollBehavior = 'auto';
            scrollTo(0, y);
            root.style.scrollBehavior = previous;
        };
        const toAnchor = (url) => {
            let el = null;
            if (url.hash) { try { el = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { el = null; } }
            if (el) el.scrollIntoView(); else jump(0);
            return el;
        };
        const fetchText = (href, init) => fetch(href, init).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.text(); });
        const apply = (doc, url, y) => {
            pageLife.abort();
            close();
            document.title = doc.title;
            const body = document.body;
            while (body.attributes.length) body.removeAttribute(body.attributes[0].name);
            for (const a of doc.body.attributes) body.setAttribute(a.name, a.value);
            // resolve the new page's relative links against its own address while it is moved in
            const base = document.createElement('base');
            base.href = url.href;
            document.head.append(base);
            try { body.replaceChildren(...[...doc.body.childNodes].map((n) => document.importNode(n, true))); }
            finally { base.remove(); }
            pageLife = new AbortController();
            initPage(pageLife.signal);
            const target = y === null ? toAnchor(url) : (jump(y), null);
            const focus = target || document.querySelector('main h1') || document.querySelector('main');
            if (focus) {
                if (!focus.hasAttribute('tabindex')) focus.setAttribute('tabindex', '-1');
                focus.focus({ preventScroll: true });
            }
            activePath = url.pathname;
        };
        const load = (url, push, y) => {
            busy = true;
            const own = () => fetchText(url.href, { credentials: 'same-origin' });
            (local ? own() : fetchText(MIRROR + url.pathname, { mode: 'cors', credentials: 'omit' }).catch(own))
                .then((html) => {
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    if (!doc.body || !doc.querySelector('main')) throw new Error('not an annual page');
                    if (push) history.pushState({ y: 0 }, '', url.href);
                    apply(doc, url, y);
                    busy = false;
                    // Back or Forward pressed while loading: catch up with the address bar
                    const here = new URL(location.href);
                    if (here.pathname !== activePath && isArticle(here)) load(here, false, saved());
                })
                .catch(() => { busy = false; if (push) location.assign(url.href); else location.replace(url.href); });
        };
        document.addEventListener('click', (e) => {
            if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            const a = e.target.closest('a[href]');
            if (!a || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
            const href = a.getAttribute('href');
            if (!href || href.startsWith('#')) return;
            const url = new URL(href, location.href);
            if (!isArticle(url) || url.pathname === location.pathname) return;
            e.preventDefault();
            if (busy) return;
            remember();
            load(url, true, null);
        });
        addEventListener('scroll', () => {
            if (busy) return;
            clearTimeout(saveTimer);
            saveTimer = setTimeout(remember, 200);
        }, { passive: true });
        addEventListener('popstate', () => {
            clearTimeout(saveTimer); saveTimer = 0;
            if (busy) return;
            const url = new URL(location.href);
            if (!isArticle(url)) { location.reload(); return; }
            if (url.pathname === activePath) { if (saved() === null) toAnchor(url); else jump(saved()); return; }
            load(url, false, saved());
        });
        if (saved() !== null && !location.hash) jump(saved());
    }
})();
