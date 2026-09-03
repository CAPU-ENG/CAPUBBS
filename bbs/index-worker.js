const CACHE_PREFIX = 'capubbs-forum-';
const INDEX_CACHE = 'capubbs-forum-index-v2';
const ASSET_CACHE = 'capubbs-forum-assets-v2';
const INDEX_CACHE_KEY = '/bbs/__capubbs-index-cache__';
const INDEX_META_KEY = '/bbs/__capubbs-index-meta__';
const FORUM_SHELL_URL = '/bbs/?capubbs_shell=new';
const PRECACHE_MANIFEST_URL = '/bbs/new-assets/precache-manifest.json';
const PASSTHROUGH_PREFIXES = [
  '/bbs/assets/',
  '/bbs/attach/',
  '/bbs/download/',
  '/bbs/images/',
  '/bbs/lib/',
  '/bbs/utils/',
];
const PASSTHROUGH_PATHS = new Set([
  '/bbs/content/test.php',
  '/bbs/index-worker.js',
  '/bbs/register/action.php',
  '/bbs/register/userexists.php',
]);

self.addEventListener('install', (event) => {
  event.waitUntil(installForumShell());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(activateForumWorker());
});

self.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || typeof message.type !== 'string') return;
  if (message.type === 'CACHE_CURRENT_INDEX') {
    event.waitUntil(cacheLatestIndex());
  }
  if (message.type === 'PREPARE_FORUM_SHELL') {
    event.waitUntil(prepareForumShell(message.mode).then(
      () => replyToMessage(event, { ok: true }),
      (error) => replyToMessage(event, { error: String(error), ok: false }),
    ));
  }
  if (message.type === 'SET_FORUM_MODE' && (message.mode === 'new' || message.mode === 'legacy')) {
    event.waitUntil(storeForumMode(message.mode));
  }
  if (message.type === 'COMPARE_INDEX_VERSION' && /^[a-f0-9]{64}$/.test(message.version)) {
    event.waitUntil(markDirtyWhenVersionChanged(message.version));
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'GET' && url.origin === self.location.origin
    && url.pathname.startsWith('/bbs/new-assets/')) {
    event.respondWith(cacheFirstAsset(event.request));
    return;
  }
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate'
    || url.origin !== self.location.origin || !isForumPagePath(url.pathname)) return;

  event.respondWith(resolveForumNavigation(event.request));
});

async function installForumShell() {
  await prepareForumShell();
  await self.skipWaiting();
}

async function activateForumWorker() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames
    .filter((name) => name.startsWith(CACHE_PREFIX) && name !== INDEX_CACHE && name !== ASSET_CACHE)
    .map((name) => caches.delete(name)));
  await self.clients.claim();
}

async function prepareForumShell(mode) {
  const cache = await caches.open(INDEX_CACHE);
  if (mode === 'new' || mode === 'legacy') await storeForumMode(mode, cache);
  await fetchAndCacheIndex(new Request(FORUM_SHELL_URL, {
    cache: 'no-store',
    credentials: 'include',
  }), cache, true);
}

function replyToMessage(event, payload) {
  const port = event.ports && event.ports[0];
  if (port) port.postMessage(payload);
}

function isForumPagePath(pathname) {
  if (pathname !== '/bbs' && !pathname.startsWith('/bbs/')) return false;
  if (PASSTHROUGH_PATHS.has(pathname)) return false;
  return !PASSTHROUGH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

async function resolveForumNavigation(request) {
  const cache = await caches.open(INDEX_CACHE);
  if (await forumMode(cache) !== 'new') return fetch(request);
  const meta = await readMeta(cache);
  if (!meta || meta.dirty) return fetchAndCacheIndex(request, cache);
  return (await cache.match(INDEX_CACHE_KEY)) || fetchAndCacheIndex(request, cache);
}

async function cacheLatestIndex() {
  const cache = await caches.open(INDEX_CACHE);
  await storeForumMode('new', cache);
  if (await cache.match(INDEX_CACHE_KEY)) return;
  await fetchAndCacheIndex(new Request('/bbs/', { credentials: 'include' }), cache);
}

async function fetchAndCacheIndex(request, cache, requireForumIndex = false) {
  try {
    const response = await fetch(request);
    if (!response.ok || !isHtml(response)) {
      if (requireForumIndex) throw new Error(`Forum shell request failed: ${response.status}`);
      return response;
    }
    const html = await response.clone().text();
    if (!isForumIndexHtml(html)) {
      if (requireForumIndex) throw new Error('Forum shell response is not the new forum index.');
      return response;
    }
    const version = await contentsVersion(html);
    const previousMeta = await readMeta(cache);
    await Promise.all([
      cache.put(INDEX_CACHE_KEY, response.clone()),
      writeMeta(cache, { dirty: false, mode: previousMeta?.mode || 'new', version }),
      precacheForumAssets(),
    ]);
    return response;
  } catch (error) {
    const cached = await cache.match(INDEX_CACHE_KEY);
    if (cached) return cached;
    throw error;
  }
}

async function markDirtyWhenVersionChanged(version) {
  const cache = await caches.open(INDEX_CACHE);
  const meta = await readMeta(cache);
  if (!meta || !meta.version || meta.version === version) return;
  await writeMeta(cache, { ...meta, dirty: true });
}

async function contentsVersion(html) {
  const contents = new TextEncoder().encode(html);
  const digest = await crypto.subtle.digest('SHA-256', contents);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function isForumIndexHtml(html) {
  return html.includes('<div id="root"></div>') && html.includes('/bbs/new-assets/');
}

async function precacheForumAssets() {
  const manifestResponse = await fetch(`${PRECACHE_MANIFEST_URL}?v=${Date.now()}`, {
    cache: 'no-store',
    credentials: 'same-origin',
  });
  if (!manifestResponse.ok) throw new Error(`Precache manifest request failed: ${manifestResponse.status}`);
  const manifest = await manifestResponse.json();
  const urls = manifestAssetUrls(manifest);
  if (!urls.length) throw new Error('Precache manifest contains no assets.');

  for (let index = 0; index < urls.length; index += 6) {
    await Promise.all(urls.slice(index, index + 6).map((url) => cacheFirstAsset(new Request(url))));
  }
}

function manifestAssetUrls(manifest) {
  const paths = new Set();
  for (const entry of Object.values(manifest || {})) {
    if (!entry || typeof entry !== 'object') continue;
    if (typeof entry.file === 'string') paths.add(entry.file);
    for (const field of ['css', 'assets']) {
      if (!Array.isArray(entry[field])) continue;
      for (const path of entry[field]) if (typeof path === 'string') paths.add(path);
    }
  }
  return Array.from(paths, (path) => new URL(path, `${self.location.origin}/bbs/`).href)
    .filter((url) => new URL(url).pathname.startsWith('/bbs/new-assets/'));
}

async function cacheFirstAsset(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

function isHtml(response) {
  return (response.headers.get('Content-Type') || '').toLowerCase().includes('text/html');
}

async function readMeta(cache) {
  const response = await cache.match(INDEX_META_KEY);
  if (!response) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function writeMeta(cache, meta) {
  return cache.put(INDEX_META_KEY, new Response(JSON.stringify(meta), {
    headers: { 'Content-Type': 'application/json' },
  }));
}

async function storeForumMode(mode, existingCache) {
  const cache = existingCache || await caches.open(INDEX_CACHE);
  const meta = await readMeta(cache) || {};
  await writeMeta(cache, { ...meta, mode });
}

async function forumMode(cache) {
  if (self.cookieStore) {
    const cookie = await self.cookieStore.get('capubbs_forum_mode');
    if (cookie && (cookie.value === 'new' || cookie.value === 'legacy')) return cookie.value;
  }
  return (await readMeta(cache))?.mode || null;
}
