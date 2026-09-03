const INDEX_CACHE = 'capubbs-forum-index-v1';
const ASSET_CACHE = 'capubbs-forum-assets-v1';
const INDEX_CACHE_KEY = '/bbs/__capubbs-index-cache__';
const INDEX_META_KEY = '/bbs/__capubbs-index-meta__';
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
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || typeof message.type !== 'string') return;
  if (message.type === 'CACHE_CURRENT_INDEX') {
    event.waitUntil(cacheLatestIndex());
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
  const cache = await caches.open(INDEX_CACHE);
  await fetchAndCacheIndex(new Request('/bbs/', { credentials: 'include' }), cache);
  await self.skipWaiting();
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

async function fetchAndCacheIndex(request, cache) {
  try {
    const response = await fetch(request);
    if (!response.ok || !isHtml(response)) return response;
    const html = await response.clone().text();
    if (!isForumIndexHtml(html)) return response;
    const version = await contentsVersion(html);
    const previousMeta = await readMeta(cache);
    await Promise.all([
      cache.put(INDEX_CACHE_KEY, response.clone()),
      writeMeta(cache, { dirty: false, mode: previousMeta?.mode || 'new', version }),
      cacheCriticalAssets(html),
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

async function cacheCriticalAssets(html) {
  const urls = Array.from(html.matchAll(/(?:src|href)=["'](\/bbs\/new-assets\/[^"']+)["']/g), (match) => match[1]);
  await Promise.allSettled(urls.map((url) => cacheFirstAsset(new Request(url))));
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
