(() => {
  'use strict';
  document.documentElement.classList.add('has-js');
  const media = JSON.parse(document.querySelector('#homepage-media').textContent);
  const tabs = Array.from(document.querySelectorAll('[data-about-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-about-panel]'));
  document.querySelector('[data-about-tabs]').setAttribute('role', 'tablist');
  tabs.forEach(tab => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', tab.dataset.aboutTab);
  });
  panels.forEach(panel => { panel.setAttribute('role', 'tabpanel'); panel.tabIndex = 0; });
  function selectTab(id, focus = false) {
    const selected = tabs.find(tab => tab.dataset.aboutTab === id);
    if (!selected) return;
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.id !== id; });
    if (focus) selected.focus({ preventScroll: true });
  }
  function tabFromHash() {
    const id = window.location.hash.slice(1);
    return id === 'about' || !id ? 'introduction' : id;
  }
  function activateTab(tab) {
    selectTab(tab.dataset.aboutTab, true);
    window.history.replaceState(null, '', '#' + tab.dataset.aboutTab);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', event => { event.preventDefault(); activateTab(tab); });
    tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else if (event.key !== ' ') return;
      event.preventDefault();
      activateTab(tabs[next]);
    });
  });
  selectTab('introduction');
  selectTab(tabFromHash());
  window.addEventListener('hashchange', () => selectTab(tabFromHash()));

  async function readApi(ask) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`/api/api.php?${new URLSearchParams({ ask })}`, {
        cache: 'no-store', credentials: 'same-origin', headers: { Accept: 'application/json' }, signal: controller.signal,
      });
      const payload = await response.json();
      if (!response.ok || payload.code !== 0) throw new Error('读取失败');
      return payload.data;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function safeUrl(value) {
    if (typeof value !== 'string' || !value.trim() || /[\x00-\x20\x7f\\]/.test(value.trim())) return '';
    try {
      const url = new URL(value.trim(), window.location.origin + '/');
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return '';
      return url.href;
    } catch (_) { return ''; }
  }

  const promotion = document.querySelector('[data-promotion]');
  const slides = document.querySelector('#promotion-slides');
  const imageState = document.querySelector('[data-image-state]');
  const imageStatus = document.querySelector('[data-image-status]');
  const imageRetry = document.querySelector('[data-image-retry]');
  const imageControls = document.querySelector('[data-image-controls]');
  const imageAutoplay = document.querySelector('[data-image-autoplay]');
  const imageCount = document.querySelector('.promotion-count');
  const caption = document.querySelector('[data-image-caption]');
  let images = [];
  let imageSignature = '';
  let currentImage = 0;
  let imageLoading = false;
  let imageTimer = null;
  let imagePaused = false;
  let imageHovered = false;
  let imageFocusPaused = false;
  let imagePageActive = true;

  function scheduleImageRotation() {
    window.clearTimeout(imageTimer);
    imageTimer = null;
    const rotating = images.length > 1 && !imagePaused && !imageHovered && imagePageActive
      && !document.hidden && !(imageFocusPaused && promotion.contains(document.activeElement));
    imageCount.setAttribute('aria-live', rotating ? 'off' : 'polite');
    imageAutoplay.setAttribute('aria-label', imagePaused ? '开始自动轮播' : '暂停自动轮播');
    imageAutoplay.title = imageAutoplay.getAttribute('aria-label');
    imageAutoplay.querySelector('span').textContent = imagePaused ? '▶' : 'Ⅱ';
    if (rotating) imageTimer = window.setTimeout(() => showImage(currentImage + 1), 5000);
  }

  function showImage(index) {
    if (!images.length) { scheduleImageRotation(); return; }
    const restoreFocus = slides.contains(document.activeElement);
    currentImage = (index + images.length) % images.length;
    Array.from(slides.children).forEach((slide, offset) => { slide.hidden = offset !== currentImage; });
    caption.textContent = images[currentImage].title || '宣传图';
    document.querySelector('[data-image-number]').textContent = String(currentImage + 1).padStart(2, '0');
    const nextImage = slides.children[(currentImage + 1) % images.length].querySelector('img');
    if (nextImage) nextImage.loading = 'eager';
    if (restoreFocus) slides.children[currentImage].querySelector('a').focus({ preventScroll: true });
    scheduleImageRotation();
  }

  function renderImages(rows) {
    if (!Array.isArray(rows)) throw new Error('宣传图数据无效');
    const next = rows.map(row => ({
      img: safeUrl(row?.img), imgthumb: safeUrl(row?.imgthumb), title: typeof row?.title === 'string' ? row.title : '',
    })).filter(row => row.img || row.imgthumb);
    if (rows.length && !next.length) throw new Error('宣传图链接无效');
    imageState.hidden = next.length > 0;
    imageStatus.textContent = next.length ? '' : '暂无宣传图';
    imageRetry.hidden = true;
    imageControls.hidden = next.length < 2;
    document.querySelector('[data-image-total]').textContent = String(next.length).padStart(2, '0');
    const signature = JSON.stringify(next);
    if (signature === imageSignature) return;
    imageSignature = signature;
    images = next;
    const fragment = document.createDocumentFragment();
    images.forEach((row, index) => {
      const slide = document.createElement('div');
      slide.className = 'promotion-slide';
      slide.hidden = index !== 0;
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', '幻灯片');
      slide.setAttribute('aria-label', `${index + 1} / ${images.length}`);
      const link = document.createElement('a');
      link.href = row.img || row.imgthumb;
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      const image = document.createElement('img');
      image.alt = row.title || `宣传图 ${index + 1}`;
      image.loading = index === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';
      if (index === 0) image.setAttribute('fetchpriority', 'high');
      image.src = row.img || row.imgthumb;
      image.addEventListener('error', () => {
        if (row.imgthumb && image.src !== row.imgthumb) { image.src = row.imgthumb; return; }
        const error = document.createElement('span');
        error.className = 'image-error';
        error.textContent = '图片无法加载，点击查看原图';
        link.replaceChildren(error);
      });
      link.append(image); slide.append(link); fragment.append(slide);
    });
    slides.replaceChildren(fragment);
    caption.textContent = images.length ? images[0].title || '宣传图' : '宣传图';
    showImage(0);
  }

  async function loadImages() {
    if (imageLoading) return;
    imageLoading = true;
    imageRetry.disabled = true;
    if (!imageSignature) imageStatus.textContent = '正在加载宣传图…';
    try {
      const rows = (await readApi('homepage_images'))?.images;
      renderImages(Array.isArray(rows) && !rows.length ? media.images : rows);
    } catch (_) {
      imageState.hidden = images.length > 0;
      imageStatus.textContent = '宣传图暂时无法加载';
      imageRetry.hidden = false;
    } finally {
      imageRetry.disabled = false;
      imageLoading = false;
    }
  }
  imageRetry.addEventListener('click', () => { void loadImages(); });
  imageAutoplay.addEventListener('click', () => {
    imagePaused = !imagePaused;
    if (!imagePaused) imageFocusPaused = false;
    scheduleImageRotation();
  });
  promotion.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    imageHovered = true;
    scheduleImageRotation();
  });
  promotion.addEventListener('pointerleave', () => { imageHovered = false; scheduleImageRotation(); });
  promotion.addEventListener('focusin', () => { imageFocusPaused = true; scheduleImageRotation(); });
  promotion.addEventListener('focusout', () => { queueMicrotask(scheduleImageRotation); });
  document.addEventListener('visibilitychange', scheduleImageRotation);
  window.addEventListener('pagehide', () => { imagePageActive = false; scheduleImageRotation(); });
  promotion.addEventListener('click', event => {
    const button = event.target.closest('[data-image-step]');
    if (button) showImage(currentImage + Number(button.dataset.imageStep));
  });
  promotion.addEventListener('keydown', event => {
    if (!images.length || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    showImage(event.key === 'Home' ? 0 : event.key === 'End' ? images.length - 1 : currentImage + (event.key === 'ArrowLeft' ? -1 : 1));
  });

  const videoList = document.querySelector('[data-video-list]');
  const videoMore = document.querySelector('[data-video-more]');
  const videoStatus = document.querySelector('[data-video-status]');
  const videoRetry = document.querySelector('[data-video-retry]');
  let videoLoading = false;
  let videoSignature = JSON.stringify({
    videos: Array.from(videoList.querySelectorAll('.video-link')).map(link => ({ title: link.querySelector('h3').textContent, url: link.href })),
    moreUrl: videoMore.hidden ? '' : videoMore.href,
  });
  function videoCard(item) {
    const link = document.createElement('a');
    link.className = 'video-link'; link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    const cover = document.createElement('span');
    cover.className = 'video-cover'; cover.setAttribute('aria-hidden', 'true');
    const play = document.createElement('span'); play.className = 'video-play'; play.textContent = '▶';
    cover.append(play);
    const caption = document.createElement('div'); caption.className = 'video-caption';
    const title = document.createElement('h3'); title.textContent = item.title;
    caption.append(title); link.append(cover, caption);
    return link;
  }
  async function loadVideos() {
    if (videoLoading) return;
    videoLoading = true;
    videoRetry.disabled = true;
    try {
      const data = await readApi('homepage_videos');
      if (!Array.isArray(data?.videos)) throw new Error('视频数据无效');
      const next = data.videos.map(item => ({ title: typeof item?.title === 'string' ? item.title : '', url: safeUrl(item?.url) }));
      if (next.some(item => !item.url || !item.title)) throw new Error('视频链接无效');
      const moreUrl = safeUrl(data.moreUrl);
      const signature = JSON.stringify({ videos: next, moreUrl });
      if (signature !== videoSignature) {
        const focusedUrl = videoList.contains(document.activeElement) ? document.activeElement.href : '';
        videoList.replaceChildren(...next.map(videoCard));
        if (focusedUrl) Array.from(videoList.children).find(link => link.href === focusedUrl)?.focus({ preventScroll: true });
        videoSignature = signature;
      }
      videoMore.hidden = !moreUrl;
      if (moreUrl) videoMore.href = moreUrl;
      else videoMore.removeAttribute('href');
      videoStatus.textContent = next.length ? '' : '暂无视频资料。';
      videoStatus.hidden = next.length > 0;
      videoRetry.hidden = true;
      window.CapuHomeVideoCovers?.update(videoList);
    } catch (_) {
      videoStatus.textContent = videoList.children.length ? '视频列表更新失败，请重试。' : '视频暂时无法加载。';
      videoStatus.hidden = false;
      videoRetry.hidden = false;
    } finally {
      videoRetry.disabled = false;
      videoLoading = false;
    }
  }
  videoRetry.addEventListener('click', () => { void loadVideos(); });

  const contactText = document.querySelector('[data-contact-text]');
  const contactStatus = document.querySelector('[data-contact-status]');
  const contactRetry = document.querySelector('[data-contact-retry]');
  let contactLoading = false;
  async function loadContacts() {
    if (contactLoading) return;
    contactLoading = true;
    contactRetry.disabled = true;
    try {
      const data = await readApi('homepage_contacts');
      if (typeof data?.text !== 'string' || !data.text.trim()) throw new Error('联系方式无效');
      contactText.textContent = data.text;
      contactStatus.hidden = true;
      contactRetry.hidden = true;
    } catch (_) {
      contactStatus.textContent = contactText.textContent ? '联系方式更新失败，请重试。' : '联系方式暂时无法加载。';
      contactStatus.hidden = false;
      contactRetry.hidden = false;
    } finally {
      contactLoading = false;
      contactRetry.disabled = false;
    }
  }
  contactRetry.addEventListener('click', () => { void loadContacts(); });
  window.addEventListener('pageshow', event => {
    imagePageActive = true;
    scheduleImageRotation();
    if (event.persisted) { void loadImages(); void loadVideos(); void loadContacts(); }
  });
  window.addEventListener('focus', () => { void loadImages(); void loadVideos(); void loadContacts(); });
  window.CapuHomeVideoCovers?.update(videoList);
  renderImages(media.images);
  void loadImages();
  void loadVideos();
  if (!contactStatus.hidden) void loadContacts();

  const dialog = document.querySelector('#home-login');
  const form = document.querySelector('#home-login-form');
  const loginFields = document.querySelector('#home-login-fields');
  const loginError = document.querySelector('[data-login-error]');
  const username = document.querySelector('#home-username');
  const password = document.querySelector('#home-password');
  let loginBusy = false;
  window.showlogin = () => {
    if (!dialog.showModal) { window.location.assign('/bbs/login'); return; }
    loginError.hidden = true;
    dialog.showModal();
    username.focus();
  };
  document.querySelector('[data-close-login]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    password.value = '';
    const opener = document.querySelector('[data-home-login]');
    if (opener) opener.focus();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (loginBusy || !form.reportValidity()) return;
    loginBusy = true; loginFields.disabled = true; loginError.hidden = true;
    try {
      await window.CapuHomeSession.login(username.value.trim(), window.hex_md5(password.value));
      password.value = '';
      window.location.reload();
    } catch (error) {
      loginError.textContent = error.message || '登录失败，请重试。';
      loginError.hidden = false;
    } finally {
      loginBusy = false; loginFields.disabled = false;
    }
  });

})();
