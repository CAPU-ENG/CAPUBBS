// Run after building and starting the local PHP router. No browser or production writes.
import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const origin = process.env.CAPUBBS_PHP_ORIGIN || 'http://127.0.0.1:19018';
const response = await fetch(origin + '/bbs/index/');
assert.equal(response.status, 200);
const html = await response.text();
const code = html.match(/<script id="forum-startup-script">([\s\S]*?)<\/script>/)?.[1];
assert.ok(code);
const config = JSON.parse(code.match(/\((\{"base":[\s\S]*\})\);?\s*$/)[1]);
const source = await readFile(new URL('./bootstrap/startup.js', import.meta.url), 'utf8');
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const legacyHashes = new Map([
  ['board-C_3w10kx.js', 'efe340117604bf8805a4589ab2f5b9ca764f73e3b29f808094bffc62a18a840e'],
  ['md5-ZIXNWvOX.js', 'ff702e90678470839816532cdae0d37e4bca33f2e64d520ec5280769e87b8f12'],
  ['papaparse.min-DX2SMnoj.js', 'bd6ef0dcb6f09d86d70c0fd42d25d755ec88b8e36c92a25189803954e2be0381'],
  ['index-BqqU-t3H.js', '4ac1b369a4a432900da758fd794a7c2c67c2892286afe3b1ecb6ae78e7d38685'],
  ['defaultSignature-y_5Hem3W.js', '32100936d31e9521aa7bd37237490feb3e570f65e26a05a3b6a6fd6feac05681'],
]);
const payloads = new Map();
const legacy = config.assets.filter((asset) => asset.variants);
assert.deepEqual(legacy.map((asset) => asset.url), config.assets
  .filter((asset) => legacyHashes.has(asset.url.split('/').at(-1)))
  .map((asset) => asset.url), 'Compatibility must match the known immutable assets still present in this build');
for (const asset of config.assets) {
  const result = await fetch(origin + asset.url);
  assert.equal(result.status, 200, asset.url);
  const bytes = new Uint8Array(await result.arrayBuffer());
  assert.equal(bytes.length, asset.size);
  payloads.set(asset.url, bytes);
  if (!asset.variants) continue;
  const crlf = Buffer.from(Buffer.from(bytes).toString('utf8').replace(/\r?\n/g, '\r\n'));
  assert.deepEqual(asset.variants, [bytes, crlf].map((body) => ({ size: body.length, sha256: digest(body) })));
  assert.equal(digest(crlf), legacyHashes.get(asset.url.split('/').at(-1)));
}

function run(options = {}) {
  const elements = new Map();
  const values = [], requests = [], installed = [], idle = new Map(), intervals = new Map();
  let resolveOutcome;
  const outcome = new Promise((resolve) => { resolveOutcome = resolve; });
  const element = (id) => ({
    dataset: {}, textContent: '', setAttribute() {}, removeAttribute() {}, addEventListener() {}, remove() {},
    set value(value) { values.push(value); },
    set hidden(value) { if (id === 'forum-startup-retry' && !value) resolveOutcome('failed'); },
  });
  const window = {
    crypto: options.crypto, location: { pathname: options.path || '/bbs/main/' },
    matchMedia: () => ({ matches: false }), addEventListener() {}, removeEventListener() {},
  };
  if (options.cryptoGetter) Object.defineProperty(window, 'crypto', { get: options.cryptoGetter });
  const context = {
    window, AbortController, sessionStorage: { getItem() {}, removeItem() {} }, localStorage: { getItem() {} },
    document: {
      getElementById(id) { if (!elements.has(id)) elements.set(id, element(id)); return elements.get(id); },
      createElement: (tag) => ({ tag }), head: { appendChild(node) {
        installed.push(node);
        if (node.tag === 'link') queueMicrotask(() => node.onload());
        else resolveOutcome('started');
      } },
    },
    setTimeout(fn, ms) { if (!ms) { queueMicrotask(fn); return; } const id = {}; idle.set(id, fn); return id; },
    clearTimeout(id) { idle.delete(id); },
    setInterval(fn) { const id = {}; intervals.set(id, fn); return id; },
    clearInterval(id) { intervals.delete(id); },
    async fetch(url, init) {
      requests.push(url);
      assert.equal(init.cache, 'force-cache');
      let bytes = payloads.get(url);
      if (options.transform) bytes = options.transform(bytes, url);
      const headers = new Headers({ 'content-type': url.endsWith('.css') ? 'text/css' : 'application/javascript' });
      if (options.noStream) return { ok: true, headers, body: null, arrayBuffer: async () => Uint8Array.from(bytes).buffer };
      let offset = 0;
      return { ok: true, headers, body: { getReader: () => ({
        async read() {
          if (offset === bytes.length) return { done: true };
          const value = bytes.subarray(offset, offset + (options.chunkSize || 4093));
          offset += value.length;
          return { value, done: false };
        }, releaseLock() {},
      }) } };
    },
  };
  const runtime = options.config ? source.replace('__FORUM_STARTUP_CONFIG__', JSON.stringify(options.config)) : code;
  vm.runInNewContext(options.code || runtime, context);
  return { outcome, window, values, requests, installed, idle };
}

// Test the exact source fallback, including SHA-256 padding boundaries, without TextEncoder/Web Crypto.
const unit = run({ code: source.replace('window.__forumStartup =',
  'window.testHash = sha256Fallback; window.__forumStartup =').replace('__FORUM_STARTUP_CONFIG__', 'null') });
for (const size of [0, 1, 3, 55, 56, 63, 64, 65, 119, 120, 127, 128, 129, 64568, 1000000]) {
  const bytes = Uint8Array.from({ length: size }, (_, index) => index % 251);
  assert.equal(unit.window.testHash(bytes), digest(bytes), 'Fallback SHA-256 size ' + size);
}
assert.equal(unit.window.testHash(new Uint8Array([97, 98, 99])),
  'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
unit.window.__forumStartup.ready();

const crlfPayloads = new Map(legacy.map((asset) => [asset.url,
  Buffer.from(Buffer.from(payloads.get(asset.url)).toString('utf8').replace(/\r?\n/g, '\r\n'))]));
if (process.env.CAPUBBS_LEGACY_ORIGIN) {
  for (const asset of legacy) {
    const result = await fetch(process.env.CAPUBBS_LEGACY_ORIGIN + asset.url);
    assert.equal(result.status, 200);
    const bytes = new Uint8Array(await result.arrayBuffer());
    assert.equal(digest(bytes), asset.variants[1].sha256, 'Actual historical production bytes');
    crlfPayloads.set(asset.url, bytes);
  }
}
const cryptoModes = [
  {}, { crypto: {} }, { crypto: webcrypto },
  { crypto: { subtle: { digest: async () => { throw new Error('disabled'); } } } },
  { crypto: { subtle: { digest() { throw new Error('disabled'); } } } },
  { cryptoGetter() { throw new Error('restricted'); } },
];
let checks = 0;
async function expect(options, expected = 'started') {
  const state = run(options);
  assert.equal(await state.outcome, expected);
  if (expected === 'started') {
    assert.equal(state.values.at(-1), 100);
    assert.deepEqual(state.values, [...state.values].sort((a, b) => a - b));
    assert.equal(new Set(state.requests).size, state.requests.length, 'No extra fetches');
    state.window.__forumStartup.ready();
  } else {
    assert.equal(state.values.includes(100), false, 'Invalid content must never reach 100%');
    assert.equal(state.installed.length, 0);
  }
  checks++;
}
for (const asset of legacy) {
  const single = { ...config, assets: [asset], common: [0], pages: {} };
  for (const mode of cryptoModes) for (const noStream of [false, true]) for (const crlf of [false, true]) {
    await expect({ ...mode, noStream, config: single, transform: (bytes, url) => crlf ? crlfPayloads.get(url) : bytes });
  }
  await expect({ config: single, chunkSize: 1, transform: (_, url) => crlfPayloads.get(url) });
  for (const noStream of [false, true]) for (const crlf of [false, true]) {
    for (const corruption of ['truncate', 'oversize', 'same-size', 'truncate-to-lf']) {
      if (corruption === 'truncate-to-lf' && !crlf) continue;
      await expect({ config: single, noStream, transform(bytes, url) {
        const body = Uint8Array.from(crlf ? crlfPayloads.get(url) : bytes);
        if (corruption === 'truncate') return body.subarray(0, body.length - 1);
        if (corruption === 'truncate-to-lf') return body.subarray(0, asset.size);
        if (corruption === 'oversize') return new Uint8Array(asset.variants[1].size + 1);
        body[0] ^= 1;
        return body;
      } }, 'failed');
    }
  }
}
for (const path of ['main', 'login', 'manage', 'user', 'users', 'register', 'post', 'editpid', 'home', 'favorite']) {
  await expect({ path: '/bbs/' + path, transform: (bytes, url) => crlfPayloads.get(url) || bytes });
}
// Native hashing may finish after timeout: do not report 100% or install any module then.
let finishDigest;
const pending = run({ config: { ...config, assets: [legacy[0]], common: [0], pages: {} },
  crypto: { subtle: { digest: () => new Promise((resolve) => { finishDigest = resolve; }) } } });
await new Promise((resolve) => setImmediate(resolve));
assert.ok(finishDigest);
assert.equal(pending.values.includes(100), false);
for (const callback of pending.idle.values()) callback();
assert.equal(await pending.outcome, 'failed');
finishDigest(await webcrypto.subtle.digest('SHA-256', payloads.get(legacy[0].url)));
await new Promise((resolve) => setImmediate(resolve));
assert.equal(pending.values.includes(100), false);
assert.equal(pending.installed.length, 0);
console.log(`PASS: ${checks} cache compatibility cases, shipped-asset allowlist, SHA-256 vectors, and late-digest timeout.`);
