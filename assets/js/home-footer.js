(() => {
  'use strict';
  const items = Array.from(document.querySelectorAll('[data-footer-qr]'));
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let active = null;
  let pinned = null;
  let suppressFocus = false;
  let closeTimer;

  function show(item, pin = false) {
    window.clearTimeout(closeTimer);
    active = item;
    pinned = pin ? item : null;
    items.forEach(candidate => {
      candidate.open = candidate === item;
      candidate.querySelector('summary').setAttribute('aria-expanded', String(candidate.open));
    });
  }

  items.forEach(item => {
    const trigger = item.querySelector('summary');
    trigger.setAttribute('aria-expanded', String(item.open));
    trigger.addEventListener('click', event => {
      event.preventDefault();
      show(pinned === item ? null : item, pinned !== item);
    });
    item.addEventListener('pointerenter', event => {
      if (!canHover.matches || event.pointerType === 'touch') return;
      window.clearTimeout(closeTimer);
      if (active !== item) show(item);
    });
    item.addEventListener('pointerleave', () => {
      if (active !== item || pinned === item || item.contains(document.activeElement)) return;
      closeTimer = window.setTimeout(() => {
        if (active === item && pinned !== item && !item.contains(document.activeElement)) show(null);
      }, 120);
    });
    item.addEventListener('focusin', () => {
      if (!suppressFocus && active !== item) show(item);
    });
    item.addEventListener('focusout', event => {
      if (active === item && !item.contains(event.relatedTarget)) show(null);
    });
  });

  document.addEventListener('click', event => {
    if (active && !active.contains(event.target)) show(null);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !active) return;
    const trigger = active.querySelector('summary');
    show(null);
    suppressFocus = true;
    trigger.focus({ preventScroll: true });
    suppressFocus = false;
    event.preventDefault();
  });
  window.addEventListener('pagehide', () => show(null));
})();
