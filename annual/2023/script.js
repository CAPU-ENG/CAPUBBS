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

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && current && !document.querySelector('.lightbox')) select(null);
    });

    if (window.ResizeObserver) new ResizeObserver(function () { apply(view); }).observe(frame);
    else window.addEventListener('resize', function () { apply(view); });

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
    root.classList.add('is-ready');
    sync();
})();

// click a photo to see it full screen; click again (or press Esc) to go back
(function () {
    var links = document.querySelectorAll('.figure a, .colophon-cover');
    if (!links.length) return;
    var box = null;
    var opener = null;

    function close() {
        if (!box) return;
        box.remove();
        box = null;
        document.documentElement.classList.remove('has-lightbox');
        if (opener) opener.focus();
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
            box.tabIndex = -1;
            var img = document.createElement('img');
            img.src = link.getAttribute('href');
            img.alt = source.alt;
            box.appendChild(img);
            box.addEventListener('click', close);
            document.body.appendChild(box);
            document.documentElement.classList.add('has-lightbox');
            box.focus();
        });
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') close();
    });
})();
