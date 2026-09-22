(() => {
  'use strict';
  const requests = new Map();
  const pendingCards = new WeakSet();
  const queue = [];
  const callbackPrefix = '__capuVideoCover_' + Date.now().toString(36) + '_';
  let callbackSequence = 0;
  let activeRequests = 0;

  function videoIdentity(value) {
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port
        || !['bilibili.com', 'www.bilibili.com', 'm.bilibili.com'].includes(url.hostname)) return null;
      const match = url.pathname.match(/^\/video\/(BV[a-zA-Z0-9]{10}|[aA][vV]([1-9][0-9]{0,19}))\/?$/);
      if (!match) return null;
      const parameter = match[2] ? 'aid' : 'bvid';
      const id = match[2] || match[1];
      return { parameter, id, key: parameter + ':' + id };
    } catch (_) { return null; }
  }

  function coverUrl(value) {
    if (typeof value !== 'string' || value.length > 2048 || /[\x00-\x20\x7f\\]/.test(value)) return '';
    try {
      const url = new URL(value, 'https://i0.hdslb.com');
      if (!/^https?:\/\//i.test(value) && !value.startsWith('//')) return '';
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port
        || !(url.hostname === 'hdslb.com' || url.hostname.endsWith('.hdslb.com'))) return '';
      url.protocol = 'https:';
      return url.href;
    } catch (_) { return ''; }
  }

  function requestCover(video) {
    return new Promise(resolve => {
      const callback = callbackPrefix + (++callbackSequence);
      const script = document.createElement('script');
      const url = new URL('https://api.bilibili.com/x/web-interface/view');
      url.search = new URLSearchParams({ [video.parameter]: video.id, jsonp: 'jsonp', callback });
      let settled = false;
      let timer;
      function finish(result, mayArriveLate = false) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        script.onload = null; script.onerror = null;
        script.remove();
        if (mayArriveLate) {
          // A removed script may still execute after a timeout. Ignore its late callback.
          window[callback] = () => {};
          window.setTimeout(() => { delete window[callback]; }, 60000);
        } else {
          delete window[callback];
        }
        resolve(result);
      }
      window[callback] = payload => {
        const data = payload?.data;
        const matchesVideo = String(data?.[video.parameter]) === video.id;
        finish(payload?.code === 0 && matchesVideo ? coverUrl(data.pic) : '');
      };
      script.async = true;
      script.referrerPolicy = 'no-referrer';
      script.src = url.href;
      script.onerror = () => finish('', true);
      script.onload = () => finish(''); // A successful callback has already settled the request.
      timer = window.setTimeout(() => finish('', true), 8000);
      try { document.head.append(script); } catch (_) { finish(''); }
    });
  }

  function drainQueue() {
    while (activeRequests < 3 && queue.length) {
      const { video, resolve } = queue.shift();
      activeRequests++;
      requestCover(video).then(resolve).finally(() => { activeRequests--; drainQueue(); });
    }
  }

  function getCover(video) {
    const previous = requests.get(video.key);
    if (previous && previous.expires > Date.now()) return previous.promise;
    const record = { expires: Infinity, promise: null };
    record.promise = new Promise(resolve => { queue.push({ video, resolve }); });
    requests.set(video.key, record);
    record.promise.then(url => { record.expires = Date.now() + (url ? 15 * 60 * 1000 : 60000); });
    drainQueue();
    return record.promise;
  }

  async function fillCard(root, link) {
    const video = videoIdentity(link.href);
    const cover = link.querySelector('.video-cover');
    if (!video || !cover || cover.querySelector('img') || pendingCards.has(link)) return;
    pendingCards.add(link);
    const url = await getCover(video);
    pendingCards.delete(link);
    if (!url || !root.contains(link) || videoIdentity(link.href)?.key !== video.key) return;
    const image = document.createElement('img');
    image.alt = ''; image.loading = 'lazy'; image.decoding = 'async';
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('error', () => image.remove(), { once: true });
    image.src = url;
    cover.prepend(image);
    if (image.complete && !image.naturalWidth) image.remove();
  }

  // Metadata is kept only in page memory; images load directly from Bilibili's CDN.
  window.CapuHomeVideoCovers = {
    update(root) { root.querySelectorAll('.video-link').forEach(link => { void fillCard(root, link); }); },
  };
})();
