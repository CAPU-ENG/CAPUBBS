(() => {
  'use strict';
  // Adapt annual/background.js to the homepage's separate background areas.
  const areas = Array.from(document.querySelectorAll('.home-dotted-background'));
  if (!areas.length) return;
  const pointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let x = 0;
  let y = 0;

  function hideSpotlight() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    areas.forEach(area => area.classList.remove('is-spotlight-active'));
  }

  function moveSpotlight(event) {
    if (event.pointerType === 'touch') { hideSpotlight(); return; }
    if (!pointer.matches || reducedMotion.matches || document.hidden) return;
    x = event.clientX;
    y = event.clientY;
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      const bounds = areas.map(area => area.getBoundingClientRect());
      areas.forEach((area, index) => {
        area.style.setProperty('--spotlight-x', (x - bounds[index].left) + 'px');
        area.style.setProperty('--spotlight-y', (y - bounds[index].top) + 'px');
        area.classList.add('is-spotlight-active');
      });
    });
  }

  window.addEventListener('pointermove', moveSpotlight, { passive: true });
  window.addEventListener('pointerout', event => {
    if (!event.relatedTarget) hideSpotlight();
  }, { passive: true });
  window.addEventListener('pointercancel', hideSpotlight, { passive: true });
  window.addEventListener('scroll', hideSpotlight, { passive: true });
  window.addEventListener('resize', hideSpotlight, { passive: true });
  window.addEventListener('blur', hideSpotlight);
  window.addEventListener('pagehide', hideSpotlight);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hideSpotlight();
  });
  pointer.addEventListener('change', hideSpotlight);
  reducedMotion.addEventListener('change', hideSpotlight);
})();
