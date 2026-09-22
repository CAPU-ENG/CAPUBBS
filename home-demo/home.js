(() => {
  'use strict';

  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  const mobileLayout = window.matchMedia('(max-width: 760px)');

  function setMenu(open, restoreFocus = false) {
    menu.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
    if (restoreFocus) menu.focus();
  }

  if (menu && navigation) {
    menu.hidden = false;
    document.documentElement.classList.add('has-js');
    menu.addEventListener('click', () => {
      setMenu(menu.getAttribute('aria-expanded') !== 'true');
    });
    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        setMenu(false, true);
      }
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.site-header')) setMenu(false);
    });
    mobileLayout.addEventListener('change', () => {
      const focusWillBeHidden = mobileLayout.matches && navigation.contains(document.activeElement);
      setMenu(false, focusWillBeHidden);
    });
  }

  const photos = Array.from(document.querySelectorAll('[data-photo]'));
  const caption = document.querySelector('[data-photo-caption]');
  const photoNumber = document.querySelector('[data-photo-number]');
  const controls = document.querySelector('.photo-controls');
  const captions = ['甘南 · 红山口', '甘南 · 洛克之路', '甘南 · 草原途中'];
  let activePhoto = 0;

  if (photos.length && controls && caption && photoNumber) {
    controls.hidden = false;
    controls.addEventListener('click', (event) => {
      const button = event.target.closest('[data-photo-step]');
      if (!button) return;
      photos[activePhoto].hidden = true;
      photos[activePhoto].classList.remove('is-active');
      activePhoto = (activePhoto + Number(button.dataset.photoStep) + photos.length) % photos.length;
      photos[activePhoto].hidden = false;
      photos[activePhoto].classList.add('is-active');
      caption.textContent = captions[activePhoto];
      photoNumber.textContent = String(activePhoto + 1).padStart(2, '0');
    });
  }

  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
