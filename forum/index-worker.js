const INDEX_CACHE = 'capubbs-forum-index-v1';
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

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || typeof message.type !== 'string') return;
  if (message.type === 'CACHE_CURRENT_INDEX') {
    event.waitUntil(cacheLatestIndex());
  }
  if (message.type === 'COMPARE_INDEX_VERSION' && /^[a-f0-9]{64}$/.test(message.version)) {
    event.waitUntil(markDirtyWhenVersionChanged(message.version));
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate'
    || url.origin !== self.location.origin || !isForumPagePath(url.pathname)) return;

  event.respondWith(resolveForumNavigation(event.request));
});

function isForumPagePath(pathname) {
  if (pathname !== '/bbs' && !pathname.startsWith('/bbs/')) return false;
  if (PASSTHROUGH_PATHS.has(pathname)) return false;
  return !PASSTHROUGH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

async function resolveForumNavigation(request) {
  if (await forumMode() !== 'new') return fetch(request);

  const cache = await caches.open(INDEX_CACHE);
  const meta = await readMeta(cache);
  if (!meta || meta.dirty) return fetchAndCacheIndex(request, cache);
  return (await cache.match(INDEX_CACHE_KEY)) || fetchAndCacheIndex(request, cache);
}

async function cacheLatestIndex() {
  if (await forumMode() !== 'new') return;
  const cache = await caches.open(INDEX_CACHE);
  if (await cache.match(INDEX_CACHE_KEY)) return;
  await fetchAndCacheIndex(new Request('/bbs/', { credentials: 'include' }), cache);
}

async function fetchAndCacheIndex(request, cache) {
  try {
    const response = await fetch(request);
    if (!response.ok || !isHtml(response)) return response;
    const version = await responseVersion(response.clone());
    await Promise.all([
      cache.put(INDEX_CACHE_KEY, response.clone()),
      writeMeta(cache, { dirty: false, version }),
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

async function responseVersion(response) {
  const contents = new TextEncoder().encode(await response.text());
  const digest = await crypto.subtle.digest('SHA-256', contents);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
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

async function forumMode() {
  if (!self.cookieStore) return null;
  const cookie = await self.cookieStore.get('capubbs_forum_mode');
  return cookie && cookie.value;
}
