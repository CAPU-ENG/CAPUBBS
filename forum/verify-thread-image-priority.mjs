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
assert.equal(getFrameImagePriority(frame, [{ ...bounds(2200, 2600), gallery: 'current' }], viewport), 'high');
assert.equal(getFrameImagePriority(frame, [{ ...bounds(2200, 2600), gallery: 'adjacent' }], viewport), 'low');
assert.equal(getFrameImagePriority(frame, [{ ...bounds(2200, 2600), gallery: 'deferred' }], viewport), 'deferred', 'other slides in a visible gallery must not download');
assert.equal(getFrameImagePriority(frame, [{ ...bounds(5000, 5400), gallery: 'current' }], viewport), 'deferred', 'a visible tall frame must not load distant galleries');
assert.equal(getFrameImagePriority(frame, [{ ...bounds(5000, 5400), gallery: 'adjacent' }, { ...bounds(2200, 2600), gallery: 'current' }], viewport), 'high', 'a shared URL must use its visible gallery occurrence');

const listeners = new Map();
globalThis.window = {
  addEventListener: (event, callback, options) => listeners.set(event, { callback, options }),
  location: { origin: 'http://localhost:8087' },
};
const downloads = [];
const network = new Set();
const delayedAbortNames = new Set();
let peakConcurrency = 0;
globalThis.fetch = (url, options) => new Promise((resolve, reject) => {
  const download = { url, priority: options.priority, signal: options.signal, done: false };
  const settle = (callback, value) => {
    if (download.done) return;
    download.done = true;
    network.delete(download);
    callback(value);
  };
  download.resolve = value => settle(resolve, value);
  download.reject = error => settle(reject, error);
  options.signal.addEventListener('abort', () => {
    if (!delayedAbortNames.has(nameOf(download))) download.reject(options.signal.reason);
  }, { once: true });
  downloads.push(download);
  network.add(download);
  peakConcurrency = Math.max(peakConcurrency, network.size);
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
const imageUrl = name => `/bbs/images/${name}.jpg`;
const nameOf = download => download.url.split('/').pop().replace('.jpg', '');
const attempts = name => downloads.filter(download => nameOf(download) === name);
const okResponse = () => new Response(new Blob(['image'], { type: 'image/jpeg' }), { headers: { 'content-type': 'image/jpeg' } });
const complete = download => download.resolve(okResponse());
const resources = [];
async function drain(pending) {
  let done = false;
  const all = Promise.all(pending).then(results => { resources.push(...results); done = true; });
  await waitFor(() => {
    [...network].forEach(complete);
    return done;
  });
  await all;
  await tick();
}

const priorities = { first: 'low', second: 'low', older: 'low', target: 'low' };
const pending = Object.keys(priorities).map(name => loadThreadImageResource(imageUrl(name), () => priorities[name]));
await tick();
assert.deepEqual(downloads.map(nameOf), ['first', 'second'], 'only two background downloads may start');
priorities.target = 'high';
listeners.get('scroll').callback();
await waitFor(() => attempts('target').length === 1);
assert.equal(attempts('target')[0].priority, 'high', 'a visible request must overtake older queued background work');
const shared = loadThreadImageResource(imageUrl('older'), () => 'high');
await waitFor(() => attempts('older').length === 1);
await drain([...pending, shared]);
assert.equal(resources[2], resources[4], 'equivalent consumers must share a resource');
assert.equal(listeners.get('scroll').options.capture, true, 'nested scrolling must also refresh priorities');

// Fill every slot with old foreground work, then jump to two other galleries.
const oldPriorities = Array(6).fill('high');
const old = oldPriorities.map((_, i) => loadThreadImageResource(imageUrl(`old-${i}`), () => oldPriorities[i]));
await waitFor(() => network.size === 6);
const pinned = loadThreadImageResource(imageUrl('old-0'), () => 'high');
const neighbor = loadThreadImageResource(imageUrl('waiting-neighbor'), () => 'low');
const newPriorities = ['deferred', 'deferred'];
const targets = newPriorities.map((_, i) => loadThreadImageResource(imageUrl(`new-${i}`), () => newPriorities[i]));
let interruptedSettled = false;
void old[1].then(() => { interruptedSettled = true; }, () => { interruptedSettled = true; });
oldPriorities.fill('deferred');
newPriorities.fill('high');
listeners.get('scroll').callback();
await waitFor(() => attempts('new-1').length === 1);
assert.equal(attempts('old-0')[0].signal.aborted, false, 'a visible second consumer must protect an active shared download');
assert.equal(downloads.filter(d => nameOf(d).startsWith('old-') && d.signal.aborted).length, 2, 'only enough offscreen downloads to make room may be interrupted');
assert.equal(attempts('waiting-neighbor').length, 0, 'newly visible images must overtake adjacent preloads');
assert.ok(attempts('new-0').concat(attempts('new-1')).every(d => d.priority === 'high'));
assert.equal(interruptedSettled, false, 'preemption must not reject or resolve the original shared promise');
[...network].forEach(complete);
await waitFor(() => attempts('waiting-neighbor').length === 1);
complete(attempts('waiting-neighbor')[0]);
await tick();
assert.equal(attempts('old-1').length, 1, 'offscreen preempted images must stay paused after other work completes');
oldPriorities.fill('high');
listeners.get('resize').callback();
await waitFor(() => attempts('old-1').length === 2);
await drain([...old, pinned, neighbor, ...targets]);
assert.equal(attempts('old-0').length, 1, 'visible shared resources must not restart');

// An abort can race response completion; do not reuse its slot prematurely.
delayedAbortNames.add('late-body');
let latePriority = 'low';
const late = loadThreadImageResource(imageUrl('late-body'), () => latePriority);
const foreground = Array.from({ length: 5 }, (_, i) => loadThreadImageResource(imageUrl(`protected-${i}`)));
await waitFor(() => network.size === 6);
let resizedPriority = 'deferred';
const resized = loadThreadImageResource(imageUrl('resized-target'), () => resizedPriority);
latePriority = 'deferred';
resizedPriority = 'high';
listeners.get('resize').callback();
await waitFor(() => attempts('late-body')[0].signal.aborted);
assert.equal(attempts('resized-target').length, 0, 'aborting requests still count until their body reader settles');
complete(attempts('late-body')[0]);
await waitFor(() => attempts('resized-target').length === 1);
assert.equal(network.size, 6);
await drain([...foreground, resized]);
assert.equal(attempts('late-body').length, 1, 'a late canceled response must not be cached or automatically restarted');
latePriority = 'high';
refreshThreadImagePriorities();
await waitFor(() => attempts('late-body').length === 2);
await drain([late]);
assert.ok(peakConcurrency <= 6, 'preemption must never exceed six simultaneous downloads');

let mounted = true;
const unmounted = loadThreadImageResource(imageUrl('unmounted'), () => mounted ? 'deferred' : null);
const canceled = assert.rejects(unmounted, { name: 'AbortError' });
mounted = false;
refreshThreadImagePriorities();
await canceled;
assert.equal(attempts('unmounted').length, 0);
let activeMounted = true;
const removedActive = loadThreadImageResource(imageUrl('removed-active'), () => activeMounted ? 'high' : null);
const activeCanceled = assert.rejects(removedActive, { name: 'AbortError' });
await waitFor(() => attempts('removed-active').length === 1);
activeMounted = false;
refreshThreadImagePriorities();
await activeCanceled;
assert.ok(attempts('removed-active')[0].signal.aborted, 'unmounting must cancel unneeded active downloads');

delayedAbortNames.add('remounted');
let oldConsumerMounted = true;
const oldConsumer = loadThreadImageResource(imageUrl('remounted'), () => oldConsumerMounted ? 'high' : null);
await waitFor(() => attempts('remounted').length === 1);
oldConsumerMounted = false;
refreshThreadImagePriorities();
await waitFor(() => attempts('remounted')[0].signal.aborted);
const newConsumer = loadThreadImageResource(imageUrl('remounted'));
complete(attempts('remounted')[0]);
await waitFor(() => attempts('remounted').length === 2);
await drain([oldConsumer, newConsumer]);
assert.equal(await oldConsumer, await newConsumer, 'a new consumer joining an aborted attempt must share its restart, not receive an abort failure');

const failure = loadThreadImageResource(imageUrl('retry'));
const rejected = assert.rejects(failure, /network failure/);
await waitFor(() => attempts('retry').length === 1);
attempts('retry')[0].reject(new Error('network failure'));
await rejected;
const retry = loadThreadImageResource(imageUrl('retry'));
await drain([retry]);
assert.equal(attempts('retry').length, 2, 'real failures must remain retryable');
let fallbackPriority = 'deferred';
let fallbackRejected = false;
const fallback = loadThreadImageResource('https://images.example.com/gallery.jpg', () => fallbackPriority)
  .catch(() => { fallbackRejected = true; });
await tick();
assert.equal(fallbackRejected, false);
fallbackPriority = 'high';
refreshThreadImagePriorities();
await fallback;
assert.equal(fallbackRejected, true);
assert.ok(downloads.every(d => new URL(d.url).origin === window.location.origin));
new Set(resources).forEach(resource => URL.revokeObjectURL(resource.objectUrl));
console.log('thread image priority verification passed (viewport preemption, shared consumers, abort races, retry and concurrency)');
