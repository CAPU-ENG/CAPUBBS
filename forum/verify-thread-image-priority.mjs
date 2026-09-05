import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { getFrameImagePriority } from './src/components/thread/threadImagePriority.ts';

const viewport = { width: 1280, height: 900 };
const frame = { top: -2000, bottom: 6000, left: 0, right: 900 };
const bounds = (top, bottom) => ({ top, bottom, left: 0, right: 300 });
assert.equal(getFrameImagePriority(frame, [bounds(2200, 2400)], viewport), 'high');
assert.equal(getFrameImagePriority(frame, [bounds(5000, 5200)], viewport), 'low', 'offscreen images inside a tall visible frame must stay low priority');
assert.equal(getFrameImagePriority(frame, [bounds(0, 200)], viewport), 'low');
assert.equal(getFrameImagePriority(frame, [bounds(2200, 2200)], viewport), 'low', 'hidden slides must not be treated as visible');
assert.equal(getFrameImagePriority(frame, [bounds(5000, 5200), bounds(2200, 2400)], viewport), 'high', 'a shared image must use its visible occurrence');
assert.equal(getFrameImagePriority({ ...frame, bottom: 100 }, [bounds(2200, 2400)], viewport), 'low', 'frame clipping must be respected');

const listeners = new Map();
globalThis.window = {
  addEventListener: (event, callback) => listeners.set(event, callback),
  location: { origin: 'http://localhost:8087' },
};
const downloads = [];
globalThis.fetch = (url, options) => new Promise((resolve, reject) => {
  downloads.push({ url, priority: options.priority, resolve, reject });
});
const { loadThreadImageResource, refreshThreadImagePriorities } = await import('./src/components/thread/threadImageResourceCache.ts');
const tick = () => delay(5);
async function waitFor(predicate) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) return;
    await tick();
  }
  assert.fail('the image queue did not advance');
}
const imageUrl = (name) => `/bbs/images/${name}.jpg`;
const nameOf = (download) => download.url.split('/').pop().replace('.jpg', '');
const priorities = { first: 'low', second: 'low', older: 'low', target: 'low' };
const pending = Object.keys(priorities).map((name) => loadThreadImageResource(imageUrl(name), () => priorities[name]));
await tick();
assert.deepEqual(downloads.map(nameOf), ['first', 'second'], 'only two background downloads may start');
assert.ok(downloads.every((download) => download.priority === 'low'));

priorities.target = 'high';
listeners.get('scroll')();
await tick();
assert.deepEqual(downloads.map(nameOf), ['first', 'second', 'target'], 'jumping must start the visible image before older queued preloads without waiting for active backgrounds');
assert.equal(downloads[2].priority, 'high');

const shared = loadThreadImageResource(imageUrl('older'), () => 'high');
await tick();
assert.equal(downloads[3].priority, 'high', 'a visible consumer must upgrade a queued shared URL');
assert.equal(nameOf(downloads[3]), 'older');

const extraPriorities = ['high', 'high', 'high', 'high'];
const extras = extraPriorities.map((_, index) => loadThreadImageResource(imageUrl(`extra-${index}`), () => extraPriorities[index]));
await tick();
assert.equal(downloads.length, 6, 'total concurrency must stay bounded');
extraPriorities[2] = 'low';
const okResponse = () => new Response(new Blob(['image'], { type: 'image/jpeg' }), { headers: { 'content-type': 'image/jpeg' } });
downloads[2].resolve(okResponse());
await waitFor(() => downloads.length === 7);
assert.equal(nameOf(downloads[6]), 'extra-3', 'the next slot must use current visibility rather than the original enqueue order');
assert.equal(downloads.filter((download) => nameOf(download) === 'target').length, 1, 'promotion must never restart an in-flight request');

let mounted = true;
const unmounted = loadThreadImageResource(imageUrl('unmounted'), () => mounted ? 'low' : null);
const canceled = assert.rejects(unmounted, { name: 'AbortError' });
mounted = false;
refreshThreadImagePriorities();
await canceled;
assert.ok(downloads.every((download) => nameOf(download) !== 'unmounted'), 'unmounted queued images must not consume network');

// Drain the deferred network; allow any remaining background item to start.
downloads.forEach((download) => download.resolve(okResponse()));
await waitFor(() => downloads.length === 8);
downloads.at(-1).resolve(okResponse());
const resources = await Promise.all([...pending, shared, ...extras]);
assert.equal(resources[2], resources[4], 'priority scheduling must preserve resource deduplication');
assert.equal(downloads.filter((download) => nameOf(download) === 'older').length, 1);

const failure = loadThreadImageResource(imageUrl('retry'));
const rejected = assert.rejects(failure, /network failure/);
await tick();
downloads.at(-1).reject(new Error('network failure'));
await rejected;
const retry = loadThreadImageResource(imageUrl('retry'));
await tick();
downloads.at(-1).resolve(okResponse());
resources.push(await retry);
assert.equal(downloads.filter((download) => nameOf(download) === 'retry').length, 2, 'a failed download must release its slot and allow a retry');
resources.forEach((resource) => URL.revokeObjectURL(resource.objectUrl));
console.log('thread image priority verification passed');
