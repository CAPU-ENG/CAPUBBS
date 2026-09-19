// Inlined into index.html by the build plugin; this must have no external dependencies.
(function (config) {
  var overlay = document.getElementById('forum-startup');
  var status = document.getElementById('forum-startup-status');
  var percent = document.getElementById('forum-startup-percent');
  var progress = document.getElementById('forum-startup-progress');
  var retry = document.getElementById('forum-startup-retry');
  var finished = false;
  var failed = false;
  var timer;
  var controller = new AbortController();
  var cacheMode = 'force-cache';
  var retryKey = 'capubbs-startup-retry';

  try {
    if (sessionStorage.getItem(retryKey) === 'true') cacheMode = 'reload';
    sessionStorage.removeItem(retryKey);
  } catch (_) { /* HTTP caching still works when session storage is unavailable. */ }

  var theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  try {
    if (localStorage.getItem('capubbs-theme-follows-system') === 'false') {
      var storedTheme = localStorage.getItem('capubbs-theme');
      if (storedTheme === 'dark' || storedTheme === 'light') theme = storedTheme;
    }
  } catch (_) { /* Storage restrictions must not prevent startup. */ }
  overlay.dataset.theme = theme;

  function fail() {
    if (finished || failed) return;
    failed = true;
    clearTimeout(timer);
    controller.abort();
    status.textContent = '加载失败';
    overlay.setAttribute('aria-busy', 'false');
    retry.hidden = false;
  }

  function touch() {
    clearTimeout(timer);
    // This is an inactivity limit, not a limit on a slow but progressing download.
    timer = setTimeout(fail, 60000);
  }

  function ready() {
    if (finished || failed) return;
    finished = true;
    clearTimeout(timer);
    window.removeEventListener('vite:preloadError', fail);
    overlay.remove();
    document.getElementById('forum-startup-style').remove();
  }

  window.__forumStartup = { ready: ready, fail: fail };
  window.addEventListener('vite:preloadError', fail);
  retry.addEventListener('click', function () {
    try { sessionStorage.setItem(retryKey, 'true'); } catch (_) { /* Reload without the cache override. */ }
    window.location.reload();
  });
  touch();

  if (!config) {
    // Vite development serves source modules without a fixed byte manifest.
    status.textContent = '正在加载';
    percent.textContent = '';
    progress.removeAttribute('value');
    return;
  }

  var route = window.location.pathname.slice(config.base.length).split('/')[0];
  var pageAssets = Object.prototype.hasOwnProperty.call(config.pages, route) ? config.pages[route] : [];
  var indexes = Array.from(new Set(config.common.concat(pageAssets)));
  var assets = indexes.map(function (index) { return config.assets[index]; });
  var total = assets.reduce(function (sum, asset) { return sum + asset.size; }, 0);
  var loaded = new Map();
  var completed = 0;

  function update(asset, bytes) {
    if (failed) return;
    loaded.set(asset.url, Math.min(bytes, asset.size));
    var received = 0;
    loaded.forEach(function (size) { received += size; });
    // Fetch streams contain decoded bytes; build sizes use the same basis, even with gzip/Brotli.
    var value = completed === assets.length ? 100 : Math.min(99, Math.floor(received * 100 / total));
    progress.value = value;
    percent.textContent = value + '%';
    touch();
  }

  async function download(asset) {
    var response = await fetch(asset.url, {
      cache: cacheMode,
      mode: 'cors',
      credentials: 'same-origin',
      signal: controller.signal,
    });
    var mime = response.headers.get('content-type') || '';
    if (!response.ok || !(asset.css ? /text\/css/i : /(?:java|ecma)script/i).test(mime)) {
      throw new Error('Startup resource unavailable: ' + asset.url);
    }
    var received = 0;
    if (response.body && response.body.getReader) {
      var reader = response.body.getReader();
      try {
        while (true) {
          var chunk = await reader.read();
          if (chunk.done) break;
          received += chunk.value.byteLength;
          update(asset, received);
        }
      } finally {
        reader.releaseLock();
      }
    } else {
      received = (await response.arrayBuffer()).byteLength;
    }
    if (received !== asset.size) throw new Error('Incomplete startup resource: ' + asset.url);
    completed += 1;
    update(asset, asset.size);
  }

  function installStyle(asset) {
    return new Promise(function (resolve, reject) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.crossOrigin = 'anonymous';
      link.href = asset.url;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  async function start() {
    try {
      // Bound concurrency so a direct visit does not flood the connection.
      var next = 0;
      async function worker() {
        while (!failed && next < assets.length) await download(assets[next++]);
      }
      await Promise.all(Array.from({ length: Math.min(4, assets.length) }, worker));
      if (failed) return;
      status.textContent = '正在打开页面';
      await Promise.all(assets.filter(function (asset) { return asset.css; }).map(installStyle));
      if (failed) return;
      // Load from the original URLs so relative imports, CSS URLs and the HTTP cache keep working.
      var script = document.createElement('script');
      script.type = 'module';
      script.crossOrigin = 'anonymous';
      script.src = config.entry;
      script.onerror = fail;
      document.head.appendChild(script);
    } catch (_) {
      fail();
    }
  }

  // Let the self-contained HTML render before installing any external stylesheet.
  setTimeout(start, 0);
})(__FORUM_STARTUP_CONFIG__);
