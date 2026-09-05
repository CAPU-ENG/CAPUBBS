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
  return { querySelectorAll: () => images.filter((image) => image.loading === 'lazy') };
}

const visible = imageAt(0);
const ahead = imageAt(2600);
const behind = imageAt(-1500);
const distant = imageAt(6000);
const cached = Object.assign(imageAt(6000), { complete: true, naturalWidth: 300 });
const cleanup = preloadNearbyImages(container(visible, ahead, behind, distant, cached));
assert.equal(visible.loading, 'eager', 'the initial viewport must start loading synchronously');
assert.equal(ahead.loading, 'eager', 'images two screens ahead must start before entering the viewport');
assert.equal(behind.loading, 'eager', 'upward scrolling must get the same head start');
assert.equal(distant.loading, 'lazy', 'distant images must retain native lazy loading');
assert.equal(distant.src, '/bbs/images/example.jpg', 'image URLs must remain available to native loading and the lightbox');
assert.equal(observers[0].options.rootMargin, '1800px 0px');
assert.deepEqual([...observers[0].targets], [distant], 'cached and nearby images must not remain observed');
observers[0].intersect(distant, false);
assert.equal(distant.loading, 'lazy', 'non-intersecting notifications must not trigger downloads');
observers[0].intersect(distant);
assert.equal(distant.loading, 'eager', 'approaching the extended viewport must trigger loading');
assert.equal(observers[0].targets.size, 0, 'loaded images must be unobserved');

const gallery = imageAt(8000);
const firstSlide = imageAt(8000, gallery);
const hiddenSlide = imageAt(0, gallery);
const cleanupGallery = preloadNearbyImages(container(firstSlide, hiddenSlide));
assert.equal(observers.length, 1, 'multiple floors must share an observer');
assert.equal(hiddenSlide.loading, 'lazy', 'hidden slides in a distant gallery must wait for the gallery');
cleanup();
assert.equal(observers[0].targets.has(gallery), true, 'unmounting another floor must not cancel gallery observation');
observers[0].intersect(gallery);
assert.equal(firstSlide.loading, 'eager');
assert.equal(hiddenSlide.loading, 'eager', 'nearby galleries must preload hidden slides for switching');
cleanupGallery();
assert.equal(observers[0].disconnected, true, 'the observer must be released when no work remains');

const removed = imageAt(9000);
const cleanupRemoved = preloadNearbyImages(container(removed));
cleanupRemoved();
observers[1].intersect(removed);
assert.equal(removed.loading, 'lazy', 'queued notifications after unmount must not start downloads');

delete globalThis.IntersectionObserver;
const fallback = imageAt(9000);
preloadNearbyImages(container(fallback))();
assert.equal(fallback.loading, 'eager', 'browsers without observation support must still load images');
console.log('image preloading verification passed');
