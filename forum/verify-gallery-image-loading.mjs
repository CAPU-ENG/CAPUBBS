import assert from 'node:assert/strict';
import { deferGalleryImage, getGalleryImageState, loadGalleryImage, preloadVisibleGalleryImages } from './src/utils/galleryImageLoading.ts';

const observers = [];
const mutations = [];
const listeners = new Map();
globalThis.window = {
  innerHeight: 900, innerWidth: 1280,
  addEventListener: (type, fn) => listeners.set(type, fn),
  removeEventListener: (type) => listeners.delete(type),
};
globalThis.IntersectionObserver = class {
  constructor(callback) { this.callback = callback; observers.push(this); }
  observe() {}
  disconnect() { this.disconnected = true; }
};
globalThis.MutationObserver = class {
  constructor(callback) { this.callback = callback; mutations.push(this); }
  observe() {}
  disconnect() { this.disconnected = true; }
};

function makeGallery(count, top) {
  const gallery = {
    top, current: 0,
    getAttribute: () => String(gallery.current),
    getBoundingClientRect: () => ({ top: gallery.top, bottom: gallery.top + 400, left: 0, right: 500 }),
    querySelectorAll: (selector) => selector === 'img' ? images : slides,
  };
  const slides = Array.from({ length: count }, (_, index) => ({
    getAttribute: () => index === gallery.current ? 'true' : 'false',
  }));
  const images = slides.map((slide, index) => {
    const attrs = new Map([['src', `/bbs/images/${index}.jpg`]]);
    return {
      dataset: {},
      complete: false,
      getAttribute: (name) => attrs.get(name) ?? null,
      setAttribute: (name, value) => attrs.set(name, value),
      hasAttribute: (name) => attrs.has(name),
      removeAttribute: (name) => attrs.delete(name),
      closest: (selector) => selector === '.capubbs-gallery' ? gallery : selector === 'picture' ? null : slide,
    };
  });
  return { gallery, images };
}

const { gallery, images } = makeGallery(40, 4000);
images.forEach(deferGalleryImage);
assert.ok(images.every((image) => !image.hasAttribute('src')), 'native loading must not see distant gallery sources');
const cleanup = preloadVisibleGalleryImages({ querySelectorAll: () => [gallery] });
assert.ok(images.every((image) => !image.hasAttribute('src')));
gallery.top = 100;
observers[0].callback();
const loadedIndices = () => images.flatMap((image, index) => image.hasAttribute('src') ? [index] : []);
assert.deepEqual(loadedIndices(), [0, 1, 39], 'a 40-image gallery must load only the current slide and circular neighbors');
assert.equal(images[0].fetchPriority, 'high');
assert.equal(images[1].fetchPriority, 'low');
assert.equal(images[39].fetchPriority, 'low');
images[0].complete = true;
gallery.current = 20;
mutations[0].callback();
assert.deepEqual(loadedIndices(), [0, 19, 20, 21], 'jumping must release old incomplete native requests and load the new neighborhood');
assert.equal(images[1].dataset.capubbsGallerySrc, '/bbs/images/1.jpg', 'interrupted native images must retain their source for a later revisit');
assert.equal(images[0].fetchPriority, 'low');
assert.equal(images[20].fetchPriority, 'high');
gallery.top = -1000;
gallery.current = 30;
mutations[0].callback();
assert.deepEqual(loadedIndices(), [0], 'leaving the viewport must release incomplete downloads but retain completed images');
assert.equal(images[30].hasAttribute('src'), false, 'offscreen script-driven changes must stay paused');
loadGalleryImage(images[30]);
assert.equal(images[30].getAttribute('src'), '/bbs/images/30.jpg', 'lightbox jumps must activate unloaded images explicitly');
cleanup();
assert.equal(observers[0].disconnected, true);
assert.equal(mutations[0].disconnected, true);
gallery.top = 0;
gallery.current = 10;
observers[0].callback();
assert.equal(images[10].hasAttribute('src'), false, 'stale callbacks after unmount must not download images');

for (const size of [1, 2, 3]) {
  const small = makeGallery(size, 0);
  const roles = small.images.map((image) => getGalleryImageState(image).role);
  assert.equal(roles[0], 'current');
  assert.ok(roles.slice(1).every((role) => role === 'adjacent'));
}

delete globalThis.IntersectionObserver;
const fallback = makeGallery(5, 4000);
fallback.images.forEach(deferGalleryImage);
const disposeFallback = preloadVisibleGalleryImages({ querySelectorAll: () => [fallback.gallery] });
assert.ok(fallback.images.every((image) => !image.hasAttribute('src')));
fallback.gallery.top = 0;
listeners.get('scroll')();
assert.equal(fallback.images[0].hasAttribute('src'), true, 'scroll fallback must still load visible galleries');
assert.equal(fallback.images[2].hasAttribute('src'), false);
disposeFallback();
console.log('gallery image loading verification passed');
