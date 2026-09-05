import assert from 'node:assert/strict';

const observers = [];
globalThis.window = { innerHeight: 900, innerWidth: 1280 };
globalThis.IntersectionObserver = class {
  targets = new Set();
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    observers.push(this);
  }
  observe(target) { this.targets.add(target); }
  unobserve(target) { this.targets.delete(target); }
  disconnect() { this.targets.clear(); this.disconnected = true; }
  intersect(target, isIntersecting = true) {
    this.callback([{ target, isIntersecting }]);
  }
};

const { preloadNearbyImages } = await import('./src/utils/imagePreloading.ts');
function imageAt(top, gallery = null) {
  return {
    loading: 'lazy', complete: false, naturalWidth: 0,
    src: '/bbs/images/example.jpg',
    closest: () => gallery,
    getBoundingClientRect: () => ({ top, bottom: top + 200, left: 0, right: 300, width: 300, height: 200 }),
  };
}
function container(...images) {
  return { querySelectorAll: () => images };
}

const visible = imageAt(0);
const ahead = imageAt(4400);
const behind = imageAt(-3500);
const distant = imageAt(6000);
const cached = Object.assign(imageAt(6000), { complete: true, naturalWidth: 300 });
const cleanup = preloadNearbyImages(container(visible, ahead, behind, distant, cached));
assert.equal(visible.loading, 'eager', 'the initial viewport must start loading synchronously');
assert.equal(visible.fetchPriority, 'high', 'visible images must take priority over preloads');
assert.equal(ahead.fetchPriority, 'low', 'nearby preloads must not compete at high priority');
assert.equal(ahead.loading, 'eager', 'images four screens ahead must start before entering the viewport');
assert.equal(behind.loading, 'eager', 'upward scrolling must get the same head start');
assert.equal(distant.loading, 'lazy', 'distant images must retain native lazy loading');
assert.equal(distant.src, '/bbs/images/example.jpg', 'image URLs must remain available to native loading and the lightbox');
assert.equal(observers[0].options.rootMargin, '3600px 0px');
assert.deepEqual([...observers[0].targets], [distant], 'cached and nearby images must not remain observed');
observers[0].intersect(distant, false);
assert.equal(distant.loading, 'lazy', 'non-intersecting notifications must not trigger downloads');
observers[0].intersect(distant);
assert.equal(distant.loading, 'eager', 'approaching the extended viewport must trigger loading');
assert.equal(observers[0].targets.size, 0, 'loaded images must be unobserved');
observers[1].intersect(visible, false);
observers[1].intersect(distant);
assert.equal(visible.fetchPriority, 'low', 'leaving the viewport must lower the old image priority');
assert.equal(distant.fetchPriority, 'high', 'jumping to a preloaded image must upgrade its priority');
assert.equal(observers[1].targets.has(distant), true, 'eager images must remain observed for priority changes');

const gallery = imageAt(8000);
const firstSlide = imageAt(8000, gallery);
const hiddenSlide = imageAt(0, gallery);
hiddenSlide.getBoundingClientRect = () => ({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 });
const cleanupGallery = preloadNearbyImages(container(firstSlide, hiddenSlide));
assert.equal(observers.length, 2, 'multiple floors must share the preload and priority observers');
assert.equal(hiddenSlide.loading, 'lazy', 'hidden slides in a distant gallery must wait for the gallery');
cleanup();
assert.equal(observers[0].targets.has(gallery), true, 'unmounting another floor must not cancel gallery observation');
observers[0].intersect(gallery);
assert.equal(firstSlide.loading, 'eager');
assert.equal(hiddenSlide.loading, 'eager', 'nearby galleries must preload hidden slides for switching');
assert.equal(hiddenSlide.fetchPriority, 'low', 'hidden gallery slides must remain low priority');
observers[1].intersect(firstSlide);
assert.equal(firstSlide.fetchPriority, 'high', 'the visible gallery slide must be promoted independently');
cleanupGallery();
assert.equal(observers[0].disconnected, true, 'the observer must be released when no work remains');
assert.equal(observers[1].disconnected, true, 'the priority observer must also be released');

const removed = imageAt(9000);
const cleanupRemoved = preloadNearbyImages(container(removed));
cleanupRemoved();
observers[2].intersect(removed);
observers[3].intersect(removed);
assert.equal(removed.loading, 'lazy', 'queued notifications after unmount must not start downloads');
assert.equal(removed.fetchPriority, 'low', 'queued notifications after unmount must not promote images');

const retained = imageAt(9000);
retained.loading = 'eager';
const cleanupRetained = preloadNearbyImages(container(retained));
observers[5].intersect(retained);
assert.equal(retained.fetchPriority, 'high', 'rerenders must keep tracking already eager images');
cleanupRetained();

delete globalThis.IntersectionObserver;
const fallback = imageAt(9000);
preloadNearbyImages(container(fallback))();
assert.equal(fallback.loading, 'eager', 'browsers without observation support must still load images');
console.log('image preloading verification passed');
