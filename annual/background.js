'use strict';

(function () {
    const page = document.querySelector('.annual-directory-page');
    if (!page) return;

    const pointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let x = 0;
    let y = 0;

    function hideSpotlight() {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        page.classList.remove('is-spotlight-active');
    }

    function moveSpotlight(event) {
        if (event.pointerType === 'touch') { hideSpotlight(); return; }
        if (!pointer.matches || reducedMotion.matches || document.hidden) return;
        x = event.clientX;
        y = event.clientY;
        if (frame) return;
        frame = window.requestAnimationFrame(function () {
            frame = 0;
            page.style.setProperty('--spotlight-x', x + 'px');
            page.style.setProperty('--spotlight-y', y + 'px');
            page.classList.add('is-spotlight-active');
        });
    }

    window.addEventListener('pointermove', moveSpotlight, { passive: true });
    window.addEventListener('pointerout', function (event) {
        if (!event.relatedTarget) hideSpotlight();
    }, { passive: true });
    window.addEventListener('pointercancel', hideSpotlight, { passive: true });
    window.addEventListener('blur', hideSpotlight);
    window.addEventListener('resize', hideSpotlight, { passive: true });
    window.addEventListener('pagehide', hideSpotlight);
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) hideSpotlight();
    });
    pointer.addEventListener('change', hideSpotlight);
    reducedMotion.addEventListener('change', hideSpotlight);
}());
