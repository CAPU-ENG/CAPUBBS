import assert from 'node:assert/strict';
import { getThreadTitleCopyIconPosition, observeThreadTitleCopyLayout } from './src/utils/threadTitleCopyLayout.ts';

const origin = { top: 100, left: 20 };
const firstLine = { top: 102, bottom: 130, right: 320 };
const secondLine = { top: 138, bottom: 166, right: 240 };

assert.equal(getThreadTitleCopyIconPosition([], { top: 140 }, origin), null);
assert.equal(getThreadTitleCopyIconPosition([firstLine], { top: 110 }, origin), null);
assert.equal(getThreadTitleCopyIconPosition([firstLine, secondLine], { top: 146 }, origin), null);

assert.deepEqual(
  getThreadTitleCopyIconPosition([firstLine], { top: 146 }, origin),
  { left: 303, top: 10 },
  'An orphan icon after one full line moves next to that line.',
);
assert.deepEqual(
  getThreadTitleCopyIconPosition([firstLine, secondLine], { top: 182 }, origin),
  { left: 303, top: 10 },
  'An orphan after multiple full lines moves to the first line, not the last.',
);
assert.deepEqual(
  getThreadTitleCopyIconPosition([
    { top: 102, bottom: 130, right: 180 },
    { top: 102, bottom: 130, right: 320 },
    secondLine,
  ], { top: 182 }, origin),
  { left: 303, top: 10 },
  'All fragments of the first line contribute to its right edge.',
);
assert.deepEqual(
  getThreadTitleCopyIconPosition([{ top: 42.5, bottom: 68.5, right: 268.75 }], { top: 80 }, { top: 40, left: 12.5 }),
  { left: 259.25, top: 9.5 },
  'Fractional font metrics and scrolled positions preserve the relative placement.',
);

// Check layout refresh and cleanup without opening a browser or judging visuals.
const attributes = new Map();
const properties = new Map();
const frames = new Map();
const windowListeners = new Map();
const fontListeners = new Map();
let nextFrame = 0;
let naturalIconTop = 146;
let resizeCallback;
let disconnected = false;
const button = {
  removeAttribute: (name) => attributes.delete(name),
  setAttribute: (name, value) => attributes.set(name, value),
  getBoundingClientRect: () => origin,
  style: {
    setProperty: (name, value) => properties.set(name, value),
    removeProperty: (name) => properties.delete(name),
  },
};
const elements = {
  '.thread-title-copy-button': button,
  '.thread-title-copy-text': { getClientRects: () => [firstLine] },
  '.thread-title-copy-icon': {
    getBoundingClientRect: () => {
      assert.equal(attributes.has('data-copy-icon-floating'), false, 'Every refresh measures the normal inline icon.');
      return { top: naturalIconTop };
    },
  },
};
globalThis.window = {
  requestAnimationFrame: (callback) => { frames.set(++nextFrame, callback); return nextFrame; },
  cancelAnimationFrame: (id) => frames.delete(id),
  addEventListener: (name, callback) => windowListeners.set(name, callback),
  removeEventListener: (name) => windowListeners.delete(name),
};
globalThis.document = {
  fonts: {
    ready: Promise.resolve(),
    addEventListener: (name, callback) => fontListeners.set(name, callback),
    removeEventListener: (name) => fontListeners.delete(name),
  },
};
globalThis.ResizeObserver = class {
  constructor(callback) { resizeCallback = callback; }
  observe(target) { assert.equal(target, button); }
  disconnect() { disconnected = true; }
};
function flushFrames() {
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach((callback) => callback());
}

const cleanup = observeThreadTitleCopyLayout({ querySelector: (selector) => elements[selector] });
assert.equal(attributes.get('data-copy-icon-floating'), 'true');
assert.equal(properties.get('--thread-title-copy-icon-left'), '303px');
await Promise.resolve();
flushFrames();

naturalIconTop = 110;
resizeCallback();
windowListeners.get('resize')();
assert.equal(frames.size, 1, 'Resize notifications share one update.');
flushFrames();
assert.equal(attributes.has('data-copy-icon-floating'), false, 'A wider layout restores the normal inline icon.');
assert.equal(properties.size, 0);

naturalIconTop = 146;
fontListeners.get('loadingdone')();
flushFrames();
assert.equal(attributes.get('data-copy-icon-floating'), 'true', 'A font change also checks for an orphan icon.');
resizeCallback();
cleanup();
assert.equal(disconnected, true);
assert.equal(frames.size, 0);
assert.equal(windowListeners.size, 0);
assert.equal(fontListeners.size, 0);
resizeCallback();
assert.equal(frames.size, 0, 'Disposed observers cannot schedule more work.');

console.log('Thread title copy icon layout checks passed.');
