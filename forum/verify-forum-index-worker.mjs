import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const forumDirectory = dirname(fileURLToPath(import.meta.url));
const workerSource = readFileSync(resolve(forumDirectory, 'public/index-worker.js'), 'utf8');
const origin = 'https://capubbs.test';
const listeners = new Map();
const cacheStores = new Map();
const fetches = [];
let claimed = false;
let skippedWaiting = false;

class BrowserRequest extends Request {
  constructor(input, init) {
    super(typeof input === 'string' ? new URL(input, origin) : input, init);
  }
}

class MemoryCache {
  constructor() {
    this.entries = new Map();
  }

  async match(input) {
    const response = this.entries.get(requestUrl(input));
    return response?.clone();
  }

  async put(input, response) {
    this.entries.set(requestUrl(input), response.clone());
  }
}

function requestUrl(input) {
  return new URL(typeof input === 'string' ? input : input.url, origin).href;
}

const manifest = {
  'src/main.tsx': {
    assets: ['new-assets/logo.webp'],
    css: ['new-assets/main.css'],
    file: 'new-assets/main.js',
    isEntry: true,
  },
  'src/pages/ThreadPage.tsx': {
    file: 'new-assets/thread.js',
    isDynamicEntry: true,
  },
};

async function mockFetch(input) {
  const url = requestUrl(input);
  fetches.push(url);
  const pathname = new URL(url).pathname;
  if (pathname === '/bbs/') {
    return new Response('<!doctype html><div id="root"></div><script src="/bbs/new-assets/main.js"></script>', {
      headers: { 'Content-Type': 'text/html; charset=UTF-8' },
    });
  }
  if (pathname === '/bbs/new-assets/precache-manifest.json') {
    return new Response(JSON.stringify(manifest), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (pathname.startsWith('/bbs/new-assets/')) {
    return new Response(`asset:${pathname}`, {
      headers: { 'Content-Type': pathname.endsWith('.css') ? 'text/css' : 'text/javascript' },
    });
  }
  throw new Error(`Unexpected fetch: ${url}`);
}

const caches = {
  async delete(name) {
    return cacheStores.delete(name);
  },
  async keys() {
    return Array.from(cacheStores.keys());
  },
  async open(name) {
    if (!cacheStores.has(name)) cacheStores.set(name, new MemoryCache());
    return cacheStores.get(name);
  },
};

const workerGlobal = {
  addEventListener(type, listener) {
    listeners.set(type, listener);
  },
  clients: {
    async claim() {
      claimed = true;
    },
  },
  cookieStore: null,
  location: { origin },
  async skipWaiting() {
    skippedWaiting = true;
  },
};

const context = vm.createContext({
  caches,
  console,
  crypto: webcrypto,
  Date,
  Error,
  fetch: mockFetch,
  Object,
  Promise,
  Request: BrowserRequest,
  Response,
  self: workerGlobal,
  Set,
  String,
  TextEncoder,
  URL,
});
vm.runInContext(workerSource, context, { filename: 'index-worker.js' });

let installPromise;
listeners.get('install')({
  waitUntil(promise) {
    installPromise = promise;
  },
});
await installPromise;

assert.equal(skippedWaiting, true);
assert.equal(fetches.filter((url) => new URL(url).pathname === '/bbs/').length, 1);
assert.equal(fetches.filter((url) => new URL(url).pathname === '/bbs/new-assets/precache-manifest.json').length, 1);
const assetCache = cacheStores.get('capubbs-forum-assets-v2');
assert.ok(assetCache);
assert.deepEqual(
  Array.from(assetCache.entries.keys()).map((url) => new URL(url).pathname).sort(),
  ['/bbs/new-assets/logo.webp', '/bbs/new-assets/main.css', '/bbs/new-assets/main.js', '/bbs/new-assets/thread.js'],
);
assert.ok(await cacheStores.get('capubbs-forum-index-v2').match('/bbs/__capubbs-index-cache__'));

cacheStores.set('capubbs-forum-index-v1', new MemoryCache());
cacheStores.set('capubbs-forum-assets-v1', new MemoryCache());
let activatePromise;
listeners.get('activate')({
  waitUntil(promise) {
    activatePromise = promise;
  },
});
await activatePromise;
assert.equal(claimed, true);
assert.equal(cacheStores.has('capubbs-forum-index-v1'), false);
assert.equal(cacheStores.has('capubbs-forum-assets-v1'), false);

let messagePromise;
let reply;
listeners.get('message')({
  data: { mode: 'new', type: 'PREPARE_FORUM_SHELL' },
  ports: [{ postMessage(value) { reply = value; } }],
  waitUntil(promise) {
    messagePromise = promise;
  },
});
await messagePromise;
assert.equal(reply?.ok, true);
assert.deepEqual(Object.keys(reply), ['ok']);

console.log('Forum index worker verification passed.');
