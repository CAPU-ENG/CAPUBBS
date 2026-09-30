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
    var NS = 'http://www.w3.org/2000/svg';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var W = data.view[0];
    var H = data.view[1];
    var full = [0, 0, W, H];
    var view = full.slice();
    var routes = {};
    var groups = {};
    var marks = [];
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
        var pad = Math.max(bw, bh) * 0.22 + 24;
        var x = box[0] - pad;
        var y = box[1] - pad;
        var w = bw + pad * 2;
        var h = bh + pad * 2;
        var minW = W * 0.28;
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
        if (reduce) { apply(target); return; }
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

    // put each place name on the first side (right, left, above, below) that stays clear of earlier names
    function placeLabels() {
        if (!marks.length) return;
        var pw = frame.clientWidth;
        var ph = frame.clientHeight;
        var sx = pw / view[2];
        var sy = ph / view[3];
        var gap = 9;
        var placed = [];
        marks.forEach(function (m) {
            var x = (m.x - view[0]) * sx;
            var y = (m.y - view[1]) * sy;
            var options = [
                ['right', x + gap, y - m.h / 2],
                ['left', x - gap - m.w, y - m.h / 2],
                ['above', x - m.w / 2, y - gap - m.h],
                ['below', x - m.w / 2, y + gap]
            ];
            var pick = options[0];
            for (var i = 0; i < options.length; i++) {
                var o = options[i];
                if (o[1] < 2 || o[1] + m.w > pw - 2 || o[2] < 2 || o[2] + m.h > ph - 2) continue;
                var clear = placed.every(function (p) {
                    return o[1] >= p[0] + p[2] || o[1] + m.w <= p[0] || o[2] >= p[1] + p[3] || o[2] + m.h <= p[1];
                });
                if (clear) { pick = o; break; }
            }
            placed.push([pick[1], pick[2], m.w, m.h]);
            m.el.setAttribute('data-side', pick[0]);
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
    }

    function select(id, overview) {
        current = id;
        buttons.forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.getAttribute('data-trace') === id));
        });
        Object.keys(groups).forEach(function (k) { groups[k].classList.toggle('is-active', k === id); });
        root.classList.toggle('has-active', !!id);
        if (!id) {
            layer.textContent = '';
            labels.textContent = '';
            marks = [];
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

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && current) select(null);
    });

    if (window.ResizeObserver) new ResizeObserver(function () { apply(view); }).observe(frame);
    else window.addEventListener('resize', function () { apply(view); });

    root.classList.add('is-ready');
    select('2023', true);
})();
