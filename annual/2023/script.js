// document/window listeners, observers and frames outlive a page body swap; release them first
var annualPageCleanups = [];

function onAnnualPageLeave(cleanup) {
    annualPageCleanups.push(cleanup);
}

function initAnnualPage() {
    annualPageCleanups.splice(0).forEach(function (cleanup) { cleanup(); });

    (function () {
    var map = document.querySelector('[data-route-map]');
    if (!map || !('IntersectionObserver' in window)) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var motion = map.querySelector('animateMotion');
    map.classList.add('is-ready');

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            map.classList.add('is-playing');
            if (motion && motion.beginElement) motion.beginElement();
        });
    }, { threshold: 0.4 });

    observer.observe(map);
    onAnnualPageLeave(function () { observer.disconnect(); });
    })();

(function () {
    var root = document.querySelector('[data-traces]');
    var source = document.getElementById('traces-data');
    if (!root || !source || !window.requestAnimationFrame) return;

    var data = JSON.parse(source.textContent);
    var svg = root.querySelector('.traces-svg');
    var frame = root.querySelector('.traces-frame');
    var layer = root.querySelector('.trace-active');
    var labels = root.querySelector('.traces-labels');
    var buttons = Array.prototype.slice.call(root.querySelectorAll('.trace'));
    var allButton = root.querySelector('.traces-all');
    var NS = 'http://www.w3.org/2000/svg';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var W = data.view[0];
    var H = data.view[1];
    var full = [0, 0, W, H];
    var view = full.slice();
    var routes = {};
    var groups = {};
    var marks = [];
    var trail = [];
    var current = null;
    var request = 0;

    data.routes.forEach(function (r) { routes[r.id] = r; });
    Array.prototype.forEach.call(root.querySelectorAll('.trace-path'), function (g) {
        groups[g.getAttribute('data-trace')] = g;
    });

    // viewBox that frames one route with some context, keeping the map's aspect ratio
    function fit(box) {
        var bw = box[2] - box[0];
        var bh = box[3] - box[1];
        var pad = Math.max(bw, bh) * 0.28 + 6;
        var x = box[0] - pad;
        var y = box[1] - pad;
        var w = bw + pad * 2;
        var h = bh + pad * 2;
        var minW = W * 0.09;
        var aspect = W / H;
        if (w < minW) { x -= (minW - w) / 2; w = minW; }
        if (w / h > aspect) { y -= (w / aspect - h) / 2; h = w / aspect; }
        else { x -= (h * aspect - w) / 2; w = h * aspect; }
        if (w >= W || h >= H) return full.slice();
        return [Math.max(0, Math.min(x, W - w)), Math.max(0, Math.min(y, H - h)), w, h];
    }

    function apply(v) {
        view = v;
        svg.setAttribute('viewBox', v.map(function (n) { return n.toFixed(2); }).join(' '));
        svg.style.setProperty('--u', (v[2] / (frame.clientWidth || W)).toFixed(4));
        placeLabels();
    }

    function animateTo(target) {
        cancelAnimationFrame(request);
        // animation frames don't run in hidden tabs; jump straight to the target there
        if (reduce || document.hidden) { apply(target); return; }
        var from = view.slice();
        var start = null;
        function step(t) {
            if (start === null) start = t;
            var k = Math.min(1, (t - start) / 750);
            var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
            apply(from.map(function (a, i) { return a + (target[i] - a) * e; }));
            if (k < 1) request = requestAnimationFrame(step);
        }
        request = requestAnimationFrame(step);
    }

    function buildLabels(route) {
        labels.textContent = '';
        marks = route.nodes.map(function (node, i) {
            var el = document.createElement('span');
            var dot = document.createElement('i');
            var name = document.createElement('b');
            el.className = 'trace-node';
            el.style.setProperty('--i', i);
            name.textContent = node[0];
            el.appendChild(dot);
            el.appendChild(name);
            labels.appendChild(el);
            return { el: el, x: node[1], y: node[2], w: name.offsetWidth, h: name.offsetHeight };
        });
    }

    // put each place name on the side (right, left, above, below, diagonals) that covers the least of
    // the drawn road, the other stops and the names already placed
    function placeLabels() {
        if (!marks.length) return;
        var pw = frame.clientWidth;
        var ph = frame.clientHeight;
        var sx = pw / view[2];
        var sy = ph / view[3];
        var gap = 10;
        var placed = [];
        var road = trail.map(function (p) { return [(p[0] - view[0]) * sx, (p[1] - view[1]) * sy]; });
        var dots = marks.map(function (m) { return [(m.x - view[0]) * sx, (m.y - view[1]) * sy]; });
        marks.forEach(function (m, index) {
            var x = dots[index][0];
            var y = dots[index][1];
            var options = [
                ['right', x + gap, y - m.h / 2],
                ['left', x - gap - m.w, y - m.h / 2],
                ['above', x - m.w / 2, y - gap - m.h],
                ['below', x - m.w / 2, y + gap],
                ['above-right', x + gap * 0.6, y - gap * 0.6 - m.h],
                ['below-right', x + gap * 0.6, y + gap * 0.6],
                ['above-left', x - gap * 0.6 - m.w, y - gap * 0.6 - m.h],
                ['below-left', x - gap * 0.6 - m.w, y + gap * 0.6]
            ];
            var best = null;
            options.forEach(function (o, order) {
                var l = o[1] - 3, t = o[2] - 2, r = o[1] + m.w + 3, b = o[2] + m.h + 2;
                var score = order * 0.01;
                if (l < 2 || r > pw - 2 || t < 2 || b > ph - 2) score += 1000;
                placed.forEach(function (p) {
                    if (l < p[0] + p[2] && r > p[0] && t < p[1] + p[3] && b > p[1]) score += 500;
                });
                dots.forEach(function (d, j) {
                    if (j !== index && d[0] > l - 6 && d[0] < r + 6 && d[1] > t - 6 && d[1] < b + 6) score += 300;
                });
                road.forEach(function (p) {
                    if (p[0] > l && p[0] < r && p[1] > t && p[1] < b) score += 1;
                });
                if (!best || score < best[0]) best = [score, o];
            });
            placed.push([best[1][1], best[1][2], m.w, m.h]);
            m.el.setAttribute('data-side', best[1][0]);
            m.el.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)';
        });
    }

    function drawActive(id) {
        var d = document.getElementById(groups[id].getAttribute('data-ref')).getAttribute('d');
        layer.textContent = '';
        ['trace-casing', 'trace-centre'].forEach(function (cls) {
            var path = document.createElementNS(NS, 'path');
            path.setAttribute('d', d);
            path.setAttribute('class', cls);
            if (cls === 'trace-casing') path.setAttribute('pathLength', '1');
            layer.appendChild(path);
        });
        // sample the road so labels can keep off it
        var probe = layer.lastChild;
        var total = probe.getTotalLength ? probe.getTotalLength() : 0;
        trail = [];
        for (var i = 0, n = 240; total && i <= n; i++) {
            var pt = probe.getPointAtLength(total * i / n);
            trail.push([pt.x, pt.y]);
        }
    }

    function select(id, overview) {
        current = id;
        buttons.forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.getAttribute('data-trace') === id));
        });
        Object.keys(groups).forEach(function (k) { groups[k].classList.toggle('is-active', k === id); });
        root.classList.toggle('has-active', !!id);
        if (allButton) allButton.setAttribute('aria-pressed', String(!id));
        if (!id) {
            layer.textContent = '';
            labels.textContent = '';
            marks = [];
            trail = [];
            animateTo(full);
            return;
        }
        drawActive(id);
        buildLabels(routes[id]);
        if (overview) apply(full);
        else animateTo(fit(routes[id].box));
    }

    buttons.forEach(function (b) {
        var id = b.getAttribute('data-trace');
        b.addEventListener('click', function () { select(current === id ? null : id); });
        b.addEventListener('mouseenter', function () { groups[id].classList.add('is-hover'); });
        b.addEventListener('mouseleave', function () { groups[id].classList.remove('is-hover'); });
    });

    Object.keys(groups).forEach(function (id) {
        groups[id].addEventListener('click', function () {
            select(current === id ? null : id);
            var button = root.querySelector('.trace[data-trace="' + id + '"]');
            if (button && button.scrollIntoView) button.scrollIntoView({ block: 'nearest' });
        });
    });

    if (allButton) allButton.addEventListener('click', function () { if (current) select(null); });

    function onKey(event) {
        if (event.key === 'Escape' && current && !document.querySelector('.lightbox')) select(null);
    }
    function onResize() { apply(view); }
    var resizer = window.ResizeObserver ? new ResizeObserver(onResize) : null;
    document.addEventListener('keydown', onKey);
    if (resizer) resizer.observe(frame);
    else window.addEventListener('resize', onResize);
    onAnnualPageLeave(function () {
        cancelAnimationFrame(request);
        document.removeEventListener('keydown', onKey);
        if (resizer) resizer.disconnect();
        else window.removeEventListener('resize', onResize);
    });

    root.classList.add('is-ready');
    select('2023', true);
    })();

(function () {
    var root = document.querySelector('[data-chronicle]');
    if (!root) return;
    var scroller = root.querySelector('.chron-scroller');
    var steps = Array.prototype.slice.call(root.querySelectorAll('.chron-step'));
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var drag = null;
    var glide = 0;

    function max() { return scroller.scrollWidth - scroller.clientWidth; }

    function sync() {
        steps[0].disabled = scroller.scrollLeft <= 1;
        steps[1].disabled = scroller.scrollLeft >= max() - 1;
    }

    function stopGlide() {
        if (glide) cancelAnimationFrame(glide);
        glide = 0;
    }

    // mouse drag with a little momentum; touch and pen keep the browser's native scrolling
    scroller.addEventListener('pointerdown', function (event) {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        stopGlide();
        drag = { x: event.clientX, left: scroller.scrollLeft, lastX: event.clientX, lastT: event.timeStamp, v: 0, moved: false };
        scroller.setPointerCapture(event.pointerId);
    });
    scroller.addEventListener('pointermove', function (event) {
        if (!drag) return;
        var dx = event.clientX - drag.x;
        if (Math.abs(dx) > 3 && !drag.moved) {
            drag.moved = true;
            root.classList.add('is-dragging');
        }
        scroller.scrollLeft = drag.left - dx;
        var dt = event.timeStamp - drag.lastT;
        if (dt > 0) drag.v = (event.clientX - drag.lastX) / dt;
        drag.lastX = event.clientX;
        drag.lastT = event.timeStamp;
    });
    function release(event) {
        if (!drag) return;
        var v = drag.v * 16;
        var moved = drag.moved;
        drag = null;
        root.classList.remove('is-dragging');
        if (scroller.hasPointerCapture && scroller.hasPointerCapture(event.pointerId)) scroller.releasePointerCapture(event.pointerId);
        if (!moved || reduce || Math.abs(v) < 1) return;
        (function step() {
            scroller.scrollLeft -= v;
            v *= 0.94;
            glide = Math.abs(v) > 0.5 ? requestAnimationFrame(step) : 0;
        })();
    }
    scroller.addEventListener('pointerup', release);
    scroller.addEventListener('pointercancel', release);

    // a vertical mouse wheel moves the timeline sideways until it reaches either end
    scroller.addEventListener('wheel', function (event) {
        if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        var delta = event.deltaMode === 1 ? event.deltaY * 32 : event.deltaY;
        if ((delta < 0 && scroller.scrollLeft <= 0) || (delta > 0 && scroller.scrollLeft >= max() - 1)) return;
        event.preventDefault();
        stopGlide();
        scroller.scrollLeft += delta;
    }, { passive: false });

    steps.forEach(function (button) {
        button.addEventListener('click', function () {
            stopGlide();
            var by = Number(button.getAttribute('data-step')) * scroller.clientWidth * 0.8;
            scroller.scrollBy({ left: by, behavior: reduce ? 'auto' : 'smooth' });
        });
    });

    scroller.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    onAnnualPageLeave(function () {
        stopGlide();
        window.removeEventListener('resize', sync);
    });
    root.classList.add('is-ready');
    sync();
    })();

// mark the side contents entry for the section being read
(function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.report-toc a[href^="#"]'));
    if (!links.length) return;
    var targets = links.map(function (link) {
        return document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1)));
    });
    var frame = 0;

    function update() {
        frame = 0;
        var line = 120;
        var chapter = -1;
        var section = -1;
        targets.forEach(function (target, i) {
            if (!target || target.getBoundingClientRect().top > line) return;
            if (links[i].parentElement.parentElement.parentElement.tagName === 'LI') section = i;
            else { chapter = i; section = -1; }
        });
        links.forEach(function (link, i) {
            if (i === chapter || i === section) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }
    function schedule() {
        if (!frame) frame = window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    onAnnualPageLeave(function () {
        if (frame) window.cancelAnimationFrame(frame);
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
    });
    update();
    })();

// click a photo to see it full screen; click again, press Esc or use the close button to go back
(function () {
    var links = document.querySelectorAll('.figure a, .colophon-cover');
    if (!links.length) return;
    var box = null;
    var closer = null;
    var opener = null;

    function close() {
        if (!box) return;
        box.remove();
        box = null;
        closer = null;
        document.documentElement.classList.remove('has-lightbox');
        if (opener && opener.isConnected) opener.focus();
    }

    Array.prototype.forEach.call(links, function (link) {
        link.addEventListener('click', function (event) {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
            var source = link.querySelector('img');
            if (!source) return;
            event.preventDefault();
            opener = link;
            box = document.createElement('div');
            box.className = 'lightbox';
            box.setAttribute('role', 'dialog');
            box.setAttribute('aria-modal', 'true');
            box.setAttribute('aria-label', source.alt || '图片');
            var img = document.createElement('img');
            img.src = link.getAttribute('href');
            img.alt = source.alt;
            closer = document.createElement('button');
            closer.type = 'button';
            closer.className = 'lightbox-close';
            closer.setAttribute('aria-label', '关闭');
            closer.textContent = '×';
            box.appendChild(img);
            box.appendChild(closer);
            box.addEventListener('click', close);
            document.body.appendChild(box);
            document.documentElement.classList.add('has-lightbox');
            closer.focus();
        });
    });

    function onKey(event) {
        if (!box) return;
        if (event.key === 'Escape') close();
        // the close button is the only control in the dialog, so Tab stays on it
        else if (event.key === 'Tab') {
            event.preventDefault();
            closer.focus();
        }
    }
    document.addEventListener('keydown', onKey);
    onAnnualPageLeave(function () {
        opener = null;
        close();
        document.removeEventListener('keydown', onKey);
    });
    })();

}

window.initAnnualPage = initAnnualPage;
initAnnualPage();

// bridge annual pages inside one document so the old and new route can share a transition
(function () {
    if (!document.body || !window.fetch || !window.DOMParser) return;

    var script = document.querySelector('script[src$="/script.js"], script[src$="script.js"]');
    var annualRoot = '';
    if (script) {
        try { annualRoot = new window.URL(script.src, window.location.href).pathname.replace(/script\.js$/, ''); } catch (error) { annualRoot = ''; }
    }
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nativeViewTransition = typeof document.startViewTransition === 'function'
        && window.CSS
        && window.CSS.supports
        && window.CSS.supports('view-transition-name: root');
    // article pages are also published on COS, which serves them faster than the site
    var pageMirror = 'https://chexie-1342390402.cos.ap-beijing.myqcloud.com';
    var busy = false;
    var activePath = window.location.pathname + window.location.search;
    var saveTimer = 0;
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

    // each history entry keeps its own scroll position so Back returns to the same place
    function savedScroll() {
        var state = window.history.state;
        return state && typeof state.annualScroll === 'number' ? state.annualScroll : null;
    }

    function rememberScroll() {
        window.clearTimeout(saveTimer);
        saveTimer = 0;
        try { window.history.replaceState({ annualScroll: window.scrollY }, ''); } catch (error) { /* state is optional */ }
    }

    function isAnnualPage(url) {
        return !!annualRoot
            && url.origin === window.location.origin
            && url.pathname.indexOf(annualRoot) === 0
            && /(?:\/|\.html)$/.test(url.pathname);
    }

    function destinationFor(link, event) {
        if (event.defaultPrevented) return null;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return null;
        if (link.classList.contains('colophon-cover')) return null;
        var parent = link.parentElement;
        while (parent && parent !== document.body) {
            if (parent.classList.contains('figure')) return null;
            parent = parent.parentElement;
        }
        if (link.hasAttribute('download')) return null;

        var target = (link.getAttribute('target') || '').toLowerCase();
        if (target && target !== '_self') return null;

        var href = link.getAttribute('href');
        if (!href || href.charAt(0) === '#') return null;

        var url;
        try { url = new window.URL(href, window.location.href); } catch (error) { return null; }
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
        if (!isAnnualPage(url)) return null;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return null;
        return url;
    }

    // fallback transition: bars cover the page while the next page loads, then slide away
    function startWipe() {
        var wipe = document.createElement('div');
        wipe.className = 'page-wipe';
        wipe.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < 8; i += 1) {
            var bar = document.createElement('i');
            bar.style.setProperty('--wipe-i', i);
            wipe.appendChild(bar);
        }
        document.documentElement.appendChild(wipe);
        return {
            covered: new Promise(function (resolve) { window.setTimeout(resolve, 460); }),
            reveal: function () {
                wipe.classList.add('is-out');
                window.setTimeout(function () {
                    if (wipe.parentNode) wipe.parentNode.removeChild(wipe);
                }, 620);
            }
        };
    }

    function copyBody(nextBody, url) {
        var body = document.body;
        while (body.attributes.length) body.removeAttribute(body.attributes[0].name);
        Array.prototype.forEach.call(nextBody.attributes, function (attribute) {
            body.setAttribute(attribute.name, attribute.value);
        });
        while (body.firstChild) body.removeChild(body.firstChild);
        var base = document.createElement('base');
        base.href = url.href;
        document.head.appendChild(base);
        try {
            Array.prototype.forEach.call(nextBody.childNodes, function (node) {
                body.appendChild(document.importNode(node, true));
            });
        } finally {
            base.parentNode.removeChild(base);
        }
    }

    // jump without the stylesheet's smooth scrolling
    function jumpTo(y) {
        var root = document.documentElement;
        var previous = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, y);
        if (!y) {
            root.scrollTop = 0;
            document.body.scrollTop = 0;
        }
        root.style.scrollBehavior = previous;
    }

    function scrollToTop() {
        jumpTo(0);
    }

    function scrollToRoute(url) {
        if (!url.hash) {
            scrollToTop();
            return;
        }
        var id;
        try { id = decodeURIComponent(url.hash.slice(1)); } catch (error) { id = url.hash.slice(1); }
        var target = document.getElementById(id);
        if (target) target.scrollIntoView();
        else scrollToTop();
    }

    // move focus to the new page so keyboard and screen reader users start from its heading
    function focusPage(url) {
        var target = null;
        if (url.hash) {
            try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch (error) { target = null; }
        }
        target = target || document.querySelector('main h1') || document.querySelector('main');
        if (!target) return;
        if (!target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1');
            target.setAttribute('data-route-focus', '');
        }
        try { target.focus({ preventScroll: true }); } catch (error) { target.focus(); }
    }

    function applyPage(nextDocument, url, scrollY) {
        document.title = nextDocument.title;
        if (nextDocument.documentElement.lang) document.documentElement.lang = nextDocument.documentElement.lang;
        document.documentElement.className = nextDocument.documentElement.className;
        copyBody(nextDocument.body, url);
        window.initAnnualPage();
        focusPage(url);
        if (scrollY === null) scrollToRoute(url);
        else jumpTo(scrollY);
        activePath = url.pathname + url.search;
    }

    function finish() {
        busy = false;
        document.documentElement.classList.remove('is-routing');
        // Back or Forward pressed during a transition: catch up with the address bar
        var here = new window.URL(window.location.href);
        if (here.pathname + here.search !== activePath && isAnnualPage(here)) loadPage(here, false, savedScroll());
    }

    function loadPage(url, push, scrollY) {
        busy = true;
        document.documentElement.classList.add('is-routing');
        var wipe = !reduce && !nativeViewTransition ? startWipe() : null;
        function fetchPage(href, init) {
            return fetch(href, init).then(function (response) {
                if (!response.ok) throw new Error('Annual page request failed: ' + response.status);
                return response.text();
            });
        }
        var sameOrigin = function () { return fetchPage(url.href, { credentials: 'same-origin' }); };
        var request = (url.pathname.indexOf(annualRoot + 'articles/') === 0
            ? fetchPage(pageMirror + url.pathname, { mode: 'cors', credentials: 'omit' }).catch(sameOrigin)
            : sameOrigin())
            .then(function (html) {
                var nextDocument = new window.DOMParser().parseFromString(html, 'text/html');
                if (!nextDocument.body) throw new Error('Annual page has no body');
                return nextDocument;
            });

        Promise.all([request, wipe ? wipe.covered : null])
            .then(function (results) {
                var nextDocument = results[0];
                function update() {
                    if (push) window.history.pushState({ annualScroll: 0 }, '', url.href);
                    applyPage(nextDocument, url, scrollY);
                }

                if (!reduce && nativeViewTransition) {
                    var transition = document.startViewTransition(update);
                    (transition.updateCallbackDone || transition.finished).then(finish, finish);
                    return;
                }

                update();
                if (wipe) wipe.reveal();
                finish();
            })
            .catch(function () {
                busy = false;
                if (push) window.location.assign(url.href);
                else window.location.replace(url.href);
            });
    }

    document.addEventListener('click', function (event) {
        var link = event.target;
        if (link && link.nodeType !== 1) link = link.parentElement;
        while (link && link.tagName && link.tagName.toLowerCase() !== 'a') link = link.parentElement;
        if (!link) return;
        var url = destinationFor(link, event);
        if (!url) return;
        event.preventDefault();
        if (busy) return;
        rememberScroll();
        loadPage(url, true, null);
    });

    window.addEventListener('scroll', function () {
        if (busy) return;
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(rememberScroll, 200);
    }, { passive: true });

    window.addEventListener('popstate', function () {
        // the entry has already changed; a pending save would write the old page's position into it
        window.clearTimeout(saveTimer);
        saveTimer = 0;
        if (busy) return;
        var url = new window.URL(window.location.href);
        if (!isAnnualPage(url)) return;
        var scrollY = savedScroll();
        if (url.pathname + url.search === activePath) {
            if (scrollY === null) scrollToRoute(url);
            else jumpTo(scrollY);
            return;
        }
        loadPage(url, false, scrollY);
    });

    // a reload keeps the position this entry was left at
    if (savedScroll() !== null && !window.location.hash) jumpTo(savedScroll());
})();
