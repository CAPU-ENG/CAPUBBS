// 行者 2019/2020 合刊: the top bar takes the tone of the section under it (clear over the painting,
// dark over the asphalt), and stanzas and signs are marked when they come into view.
(function () {
    'use strict';
    var bar = document.querySelector('.bar');
    var toned = Array.prototype.slice.call(document.querySelectorAll('main[data-tone], main [data-tone], body > footer[data-tone]'));

    function tone() {
        var line = bar ? bar.offsetHeight / 2 : 0;
        // last match wins: a banner inside <main> is more specific than <main> itself
        for (var i = toned.length - 1; i >= 0; i--) {
            var r = toned[i].getBoundingClientRect();
            if (r.top <= line && r.bottom > line) {
                bar.setAttribute('data-tone', toned[i].getAttribute('data-tone'));
                return;
            }
        }
    }
    if (bar && toned.length) {
        var queued = false;
        window.addEventListener('scroll', function () {
            if (queued) return;
            queued = true;
            requestAnimationFrame(function () { queued = false; tone(); });
        }, { passive: true });
        window.addEventListener('resize', tone);
        window.addEventListener('load', tone);
        tone();
    }

    // photos open large; Esc, the close button or a click anywhere closes
    var box = null, opener = null;
    function closeBox() {
        if (!box) return;
        box.remove();
        box = null;
        document.removeEventListener('keydown', onKey);
        if (opener) opener.focus();
    }
    function onKey(event) { if (event.key === 'Escape') closeBox(); }
    document.addEventListener('click', function (event) {
        var img = event.target.closest ? event.target.closest('.photo img, .person-photo img') : null;
        if (!img) return;
        opener = img;
        box = document.createElement('div');
        box.className = 'lightbox';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');
        box.setAttribute('aria-label', img.alt || '照片');
        var big = document.createElement('img');
        big.src = img.currentSrc || img.src;
        big.alt = img.alt;
        var close = document.createElement('button');
        close.type = 'button';
        close.setAttribute('aria-label', '关闭');
        close.textContent = '×';
        box.appendChild(big);
        box.appendChild(close);
        box.addEventListener('click', closeBox);
        document.body.appendChild(box);
        document.addEventListener('keydown', onKey);
        close.focus();
    });

    // progress marks beside the margin's dashed line: the coarsest of 10/20/25/50/100% whose marks stand
    // at least one screen apart; an article shorter than a screen shows only 100%
    var posts = document.querySelector('.km-posts');
    function placeMarks() {
        if (!posts || !posts.offsetHeight) return;
        var height = posts.offsetHeight, steps = [10, 20, 25, 50, 100], step = 100;
        for (var s = 0; s < steps.length; s++) {
            if (height * steps[s] / 100 >= innerHeight) { step = steps[s]; break; }
        }
        var html = '';
        for (var at = step; at <= 100; at += step) {
            html += '<span class="km-post" style="--at:' + at + '%">' + at + '%</span>';
        }
        posts.innerHTML = html;
    }
    if (posts) {
        var timer = 0;
        window.addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(placeMarks, 150); });
        window.addEventListener('load', placeMarks);
        placeMarks();
    }

    // section route: mark the stop being read and those already passed
    var stops = Array.prototype.slice.call(document.querySelectorAll('.outline a[href^="#"]'));
    if (stops.length) {
        var heads = stops.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
        var queuedStop = false;
        function here() {
            queuedStop = false;
            var line = innerHeight * 0.3, at = -1;
            for (var h = 0; h < heads.length; h++) {
                if (heads[h] && heads[h].getBoundingClientRect().top <= line) at = h;
            }
            for (var t = 0; t < stops.length; t++) {
                stops[t].classList.toggle('here', t === at);
                stops[t].classList.toggle('passed', t < at);
                if (t === at) stops[t].setAttribute('aria-current', 'location'); else stops[t].removeAttribute('aria-current');
            }
        }
        window.addEventListener('scroll', function () {
            if (!queuedStop) { queuedStop = true; requestAnimationFrame(here); }
        }, { passive: true });
        here();
    }

    // contents: the poles of 2019 and 2020 become one pole, from the first sign down to the road (the footer)
    var poles = document.querySelectorAll('.tower .pole'), ground = document.querySelector('body > .foot');
    if (poles.length && ground) {
        var joined = document.createElement('span');
        joined.className = 'pole pole-joined';
        joined.setAttribute('aria-hidden', 'true');
        document.body.appendChild(joined);
        document.documentElement.classList.add('poles-joined');
        var place = function () {
            var first = poles[0].getBoundingClientRect(), foot = ground.getBoundingClientRect();
            joined.style.left = (first.left + scrollX) + 'px';
            joined.style.top = (first.top + scrollY) + 'px';
            joined.style.height = Math.max(0, foot.top - first.top) + 'px';
        };
        place();
        window.addEventListener('resize', place);
        window.addEventListener('load', place);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    }

    var marked = document.querySelectorAll('.stanza, .tower .sign');
    if (!document.documentElement.classList.contains('motion') || !('IntersectionObserver' in window)) {
        for (var j = 0; j < marked.length; j++) marked[j].classList.add('in');
        return;
    }
    var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            seen.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -12% 0px' });
    for (var k = 0; k < marked.length; k++) seen.observe(marked[k]);
})();

// Page change inside the issue: yellow chevron ribbons ("^", like the speed markings painted on a road)
// burst out of the clicked link and sweep up the screen with the asphalt behind them; once the road
// covers everything the next page loads, and there the ribbons run on upwards and the asphalt clears from
// the bottom. sessionStorage carries the hand-over; the head script hides the new page until it starts.
(function () {
    'use strict';
    var KEY = 'xingzhe2020-go';
    var root = document.documentElement;
    var motion = root.classList.contains('motion');
    var ASPHALT = '#27292b', YELLOW = '#f2bf1c';
    var SLOPE = 0.62, RIBBONS = 4, BAND = 22, GAP = 52, LEAD = 30;

    function canvas() {
        var c = document.createElement('canvas');
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        c.width = Math.ceil(innerWidth * dpr);
        c.height = Math.ceil(innerHeight * dpr);
        c.className = 'speed';
        c.setAttribute('aria-hidden', 'true');
        var ctx = c.getContext('2d');
        ctx.scale(dpr, dpr);
        document.body.appendChild(c);
        return { el: c, ctx: ctx, w: innerWidth, h: innerHeight };
    }
    // the region below a "^" whose apex is r above (cx, cy)
    function chevron(ctx, cx, cy, r, far) {
        var L = far;
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + L, cy - r + SLOPE * L);
        ctx.lineTo(cx + L, cy + far);
        ctx.lineTo(cx - L, cy + far);
        ctx.lineTo(cx - L, cy - r + SLOPE * L);
        ctx.closePath();
    }
    // a ribbon: between the "^" at r and the "^" at r - BAND
    function ribbon(ctx, cx, cy, r, far) {
        var L = far, i = r - BAND;
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + L, cy - r + SLOPE * L);
        ctx.lineTo(cx + L, cy - i + SLOPE * L);
        ctx.lineTo(cx, cy - i);
        ctx.lineTo(cx - L, cy - i + SLOPE * L);
        ctx.lineTo(cx - L, cy - r + SLOPE * L);
        ctx.closePath();
    }
    // how far the apex must travel for the region below the "^" to cover the window
    function reach(s, cx, cy) {
        var need = 0, corners = [[0, 0], [s.w, 0], [0, s.h], [s.w, s.h]];
        for (var i = 0; i < corners.length; i++) {
            need = Math.max(need, cy - corners[i][1] + SLOPE * Math.abs(corners[i][0] - cx));
        }
        return need;
    }
    var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

    function run(duration, frame, done) {
        var start = null;
        function tick(now) {
            if (start === null) start = now;
            var t = Math.min(1, (now - start) / duration);
            frame(ease(t));
            if (t < 1) requestAnimationFrame(tick); else done();
        }
        requestAnimationFrame(tick);
    }

    // leaving: ribbons lead, the asphalt follows, both rising from the link
    function leave(x, y, href) {
        var s = canvas(), ctx = s.ctx, far = s.w + s.h;
        var total = reach(s, x, y) + LEAD + RIBBONS * GAP + 40;
        run(380, function (t) {
            var front = t * total;
            ctx.clearRect(0, 0, s.w, s.h);
            ctx.fillStyle = ASPHALT;
            ctx.beginPath(); chevron(ctx, x, y, front - LEAD - RIBBONS * GAP, far); ctx.fill();
            ctx.fillStyle = YELLOW;
            ctx.beginPath();
            for (var k = 0; k < RIBBONS; k++) {
                var r = front - k * GAP;
                if (r > BAND) ribbon(ctx, x, y, r, far);
            }
            ctx.fill();
        }, function () {
            try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* the next page then opens plainly */ }
            location.href = href;
        });
    }

    // arriving: the road still covers the page; ribbons run on upwards and the asphalt clears from below
    function arrive() {
        var s = canvas(), ctx = s.ctx, far = s.w + s.h;
        var x = s.w / 2, y = s.h;
        var total = reach(s, x, y) + LEAD + RIBBONS * GAP + 40;
        ctx.fillStyle = ASPHALT;
        ctx.fillRect(0, 0, s.w, s.h);
        root.classList.remove('arriving');
        run(420, function (t) {
            var edge = t * total;
            ctx.clearRect(0, 0, s.w, s.h);
            ctx.fillStyle = ASPHALT;
            ctx.fillRect(0, 0, s.w, s.h);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath(); chevron(ctx, x, y, edge, far); ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = YELLOW;
            ctx.beginPath();
            for (var k = 0; k < RIBBONS; k++) ribbon(ctx, x, y, edge + LEAD + k * GAP + BAND, far);
            ctx.fill();
        }, function () { s.el.remove(); });
    }

    var arriving = false;
    try { arriving = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch (e) { /* none */ }
    if (arriving && motion) arrive(); else root.classList.remove('arriving');
    // coming back through the history cache: drop any overlay left from leaving
    window.addEventListener('pageshow', function (event) {
        if (!event.persisted) return;
        var left = document.querySelectorAll('canvas.speed');
        for (var i = 0; i < left.length; i++) left[i].remove();
        busy = false;
    });

    var busy = false;
    var issue = new URL('./', document.querySelector('link[rel="stylesheet"][href$="style.css"]').href).pathname;
    document.addEventListener('click', function (event) {
        if (!motion || busy || event.defaultPrevented || event.button !== 0 ||
            event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        var a = event.target.closest ? event.target.closest('a[href]') : null;
        if (!a || a.target || a.hasAttribute('download')) return;
        var url = new URL(a.href, location.href);
        if (url.origin !== location.origin || url.pathname.indexOf(issue) !== 0) return;
        if (url.pathname === location.pathname && url.search === location.search) return; // same page: plain scroll
        event.preventDefault();
        busy = true;
        var x = event.clientX, y = event.clientY;
        if (!x && !y) { var r = a.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
        leave(x, y, url.href);
    });
})();
