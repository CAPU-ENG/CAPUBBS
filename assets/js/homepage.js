(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  const mobileLayout = window.matchMedia('(max-width: 760px)');
  function closeMenu(restoreFocus = false) {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    if (restoreFocus) menu.focus();
  }
  menu.hidden = false;
  document.documentElement.classList.add('has-js');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a') && !event.target.closest('[data-home-login]')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  mobileLayout.addEventListener('change', () => closeMenu(mobileLayout.matches && navigation.contains(document.activeElement)));

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
  const caption = document.querySelector('[data-image-caption]');
  let images = [];
  let imageSignature = '';
  let currentImage = 0;
  let imageLoading = false;

  function showImage(index) {
    if (!images.length) return;
    const restoreFocus = slides.contains(document.activeElement);
    currentImage = (index + images.length) % images.length;
    Array.from(slides.children).forEach((slide, offset) => { slide.hidden = offset !== currentImage; });
    caption.textContent = images[currentImage].title || '宣传图';
    document.querySelector('[data-image-number]').textContent = String(currentImage + 1).padStart(2, '0');
    if (restoreFocus) slides.children[currentImage].querySelector('a').focus({ preventScroll: true });
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
      image.src = row.imgthumb || row.img;
      image.addEventListener('error', () => {
        if (row.img && image.src !== row.img) { image.src = row.img; return; }
        const error = document.createElement('span');
        error.className = 'image-error';
        error.textContent = '图片无法加载，点击查看原图 ↗';
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
      renderImages((await readApi('homepage_images'))?.images);
    } catch (_) {
      imageState.hidden = false;
      imageStatus.textContent = '宣传图暂时无法加载';
      imageRetry.hidden = false;
    } finally {
      imageRetry.disabled = false;
      imageLoading = false;
    }
  }
  imageRetry.addEventListener('click', () => { void loadImages(); });
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
  let videoSignature = '';
  function videoSpan(className, text) {
    const span = document.createElement('span');
    span.className = className; span.textContent = text; span.setAttribute('aria-hidden', 'true');
    return span;
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
      const signature = JSON.stringify(data);
      if (signature !== videoSignature) {
        const fragment = document.createDocumentFragment();
        next.forEach((item, index) => {
          const link = document.createElement('a');
          link.className = 'video-link'; link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
          const title = document.createElement('h3'); title.textContent = item.title;
          link.append(videoSpan('video-number', String(index + 1).padStart(2, '0')), videoSpan('video-play', '▷'), title, videoSpan('video-arrow', '↗'));
          fragment.append(link);
        });
        videoList.replaceChildren(fragment);
        videoSignature = signature;
      }
      const moreUrl = safeUrl(data.moreUrl);
      videoMore.hidden = !moreUrl;
      if (moreUrl) videoMore.href = moreUrl;
      else videoMore.removeAttribute('href');
      videoStatus.textContent = next.length ? '' : '暂无视频资料。';
      videoStatus.hidden = next.length > 0;
      videoRetry.hidden = true;
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
  window.addEventListener('pageshow', event => {
    if (event.persisted) { void loadImages(); void loadVideos(); }
  });
  window.addEventListener('focus', () => { void loadImages(); void loadVideos(); });
  void loadImages();
  void loadVideos();

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
    if (mobileLayout.matches && !navigation.classList.contains('is-open')) menu.focus();
    else if (opener) opener.focus();
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

  document.querySelector('[data-copy-wechat]').addEventListener('click', async event => {
    const button = event.currentTarget;
    const status = document.querySelector('[data-copy-status]');
    try {
      await navigator.clipboard.writeText(button.dataset.copyWechat);
      status.textContent = '已复制';
    } catch (_) {
      const range = document.createRange(); range.selectNodeContents(button.firstChild);
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      status.textContent = '请复制选中的公众号名称';
    }
  });
})();
