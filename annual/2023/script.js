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
