// Inlined into index.html by the build plugin; this must have no external dependencies.
(function (config) {
  var overlay = document.getElementById('forum-startup');
  var status = document.getElementById('forum-startup-status');
  var percent = document.getElementById('forum-startup-percent');
  var progress = document.getElementById('forum-startup-progress');
  var indeterminate = document.getElementById('forum-startup-indeterminate');
  var retry = document.getElementById('forum-startup-retry');
  var finished = false;
  var failed = false;
  var timer;
  var statusTimer;
  var messages = [
    '正在检查快拆碗组……',
    '正在清点队医箱药物……',
    '正在佩戴头盔……',
    '正在记录行者足音……',
    '正在坡顶合影留念……',
    '正在五四操场为你竖起大拇指……',
    '正在讨论下次拉练的路线……',
  ];
  var messageIndex = 0;
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

  function shuffleMessages(lastMessage) {
    for (var i = messages.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var message = messages[i];
      messages[i] = messages[j];
      messages[j] = message;
    }
    // Keep the first message of a new round different from the last one shown.
    if (messages[0] === lastMessage) {
      var next = 1 + Math.floor(Math.random() * (messages.length - 1));
      messages[0] = messages[next];
      messages[next] = lastMessage;
    }
    messageIndex = 0;
  }

  function rotateStatus() {
    if (finished || failed) return;
    var previous = document.createElement('span');
    previous.className = 'startup-message-out';
    previous.setAttribute('aria-hidden', 'true');
    previous.textContent = messages[messageIndex];
    messageIndex += 1;
    if (messageIndex === messages.length) shuffleMessages(previous.textContent);
    var current = document.createElement('span');
    current.className = 'startup-message-in';
    current.textContent = messages[messageIndex];
    status.textContent = '';
    status.appendChild(previous);
    status.appendChild(current);
  }

  function fail() {
    if (finished || failed) return;
    failed = true;
    clearTimeout(timer);
    clearInterval(statusTimer);
    controller.abort();
    status.textContent = '加载失败';
    indeterminate.hidden = true;
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
    clearInterval(statusTimer);
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
  shuffleMessages();
  status.textContent = messages[messageIndex];
  statusTimer = setInterval(rotateStatus, 1000);

  if (!config) {
    // Vite development serves source modules without a fixed byte manifest.
    percent.textContent = '';
    progress.hidden = true;
    progress.removeAttribute('value');
    indeterminate.hidden = false;
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

  function hex(bytes) {
    var result = '';
    for (var i = 0; i < bytes.length; i++) result += ('0' + bytes[i].toString(16)).slice(-2);
    return result;
  }

  // Only the small, explicitly listed historical files use this fallback. It
  // needs neither a secure context nor TextEncoder or another network request.
  function sha256Fallback(bytes) {
    var constants = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];
    var state = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var padded = new Uint8Array(Math.ceil((bytes.length + 9) / 64) * 64);
    padded.set(bytes);
    padded[bytes.length] = 0x80;
    var view = new DataView(padded.buffer);
    view.setUint32(padded.length - 8, Math.floor(bytes.length / 0x20000000));
    view.setUint32(padded.length - 4, bytes.length * 8);
    var words = new Uint32Array(64);
    function rotate(value, bits) { return (value >>> bits) | (value << (32 - bits)); }
    for (var offset = 0; offset < padded.length; offset += 64) {
      var i;
      for (i = 0; i < 16; i++) words[i] = view.getUint32(offset + i * 4);
      for (i = 16; i < 64; i++) {
        var x = words[i - 15];
        var y = words[i - 2];
        words[i] = words[i - 16] + (rotate(x, 7) ^ rotate(x, 18) ^ (x >>> 3))
          + words[i - 7] + (rotate(y, 17) ^ rotate(y, 19) ^ (y >>> 10));
      }
      var a = state[0], b = state[1], c = state[2], d = state[3];
      var e = state[4], f = state[5], g = state[6], h = state[7];
      for (i = 0; i < 64; i++) {
        var t1 = h + (rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25))
          + ((e & f) ^ (~e & g)) + constants[i] + words[i];
        var t2 = (rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22)) + ((a & b) ^ (a & c) ^ (b & c));
        h = g; g = f; f = e; e = (d + t1) | 0;
        d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      var next = [a, b, c, d, e, f, g, h];
      for (i = 0; i < 8; i++) state[i] = (state[i] + next[i]) | 0;
    }
    var result = new Uint8Array(32);
    var resultView = new DataView(result.buffer);
    for (var j = 0; j < 8; j++) resultView.setUint32(j * 4, state[j]);
    return hex(result);
  }

  async function sha256(bytes) {
    try {
      if (window.crypto && window.crypto.subtle) {
        return hex(new Uint8Array(await window.crypto.subtle.digest('SHA-256', bytes)));
      }
    } catch (_) { /* Disabled or restricted Web Crypto must not prevent startup. */ }
    return sha256Fallback(bytes);
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
    var variants = asset.variants;
    var maximum = variants ? Math.max.apply(null, variants.map(function (variant) { return variant.size; })) : asset.size;
    // Preallocate a bounded buffer, avoiding per-chunk allocations even for tiny streams.
    var bytes = variants ? new Uint8Array(maximum) : null;
    function receive(chunk) {
      if (failed || received + chunk.byteLength > maximum) throw new Error('Invalid startup resource: ' + asset.url);
      if (bytes) bytes.set(chunk, received);
      received += chunk.byteLength;
      update(asset, received);
    }
    if (response.body && response.body.getReader) {
      var reader = response.body.getReader();
      try {
        while (true) {
          var chunk = await reader.read();
          if (chunk.done) break;
          receive(chunk.value);
        }
      } finally {
        reader.releaseLock();
      }
    } else {
      receive(new Uint8Array(await response.arrayBuffer()));
    }
    if (variants) {
      var candidates = variants.filter(function (variant) { return variant.size === received; });
      if (!candidates.length) throw new Error('Incomplete startup resource: ' + asset.url);
      var digest = await sha256(bytes.subarray(0, received));
      if (!candidates.some(function (variant) { return variant.sha256 === digest; })) {
        throw new Error('Corrupt startup resource: ' + asset.url);
      }
    } else if (received !== asset.size) throw new Error('Incomplete startup resource: ' + asset.url);
    if (failed) return;
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
