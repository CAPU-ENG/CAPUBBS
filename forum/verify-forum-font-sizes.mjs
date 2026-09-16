import assert from 'node:assert/strict';
import {
  FORUM_CONTENT_FONT_SIZE_OPTIONS,
  FORUM_CONTENT_FONT_SIZE_STORAGE_KEY,
  FORUM_DEFAULT_FONT_SIZE,
  FORUM_DEFAULT_FONT_SIZE_PIXELS,
  normalizeForumContentFontSize,
  normalizeAbsoluteCssFontSize,
  normalizeLegacyFontSizeAttribute,
  readForumContentFontSize,
  saveForumContentFontSize,
  subscribeForumContentFontSize,
} from './src/utils/forumFontSize.ts';

assert.equal(FORUM_DEFAULT_FONT_SIZE, '15px');
assert.equal(FORUM_DEFAULT_FONT_SIZE_PIXELS, 15);
assert.deepEqual(FORUM_CONTENT_FONT_SIZE_OPTIONS, [13, 14, 15, 16, 17]);
assert.equal(normalizeForumContentFontSize(null), 15);
assert.equal(normalizeForumContentFontSize('13'), 13);
assert.equal(normalizeForumContentFontSize('17'), 17);
assert.equal(normalizeForumContentFontSize('12'), 15);
assert.equal(normalizeForumContentFontSize('16px'), 15);

const storedValues = new Map();
let preferenceChangeCount = 0;
globalThis.window = {
  dispatchEvent() {
    preferenceChangeCount += 1;
  },
  localStorage: {
    getItem(key) {
      return storedValues.get(key) ?? null;
    },
    setItem(key, value) {
      storedValues.set(key, value);
    },
  },
};

assert.equal(readForumContentFontSize(), 15);
assert.equal(saveForumContentFontSize(16), true);
assert.equal(storedValues.get(FORUM_CONTENT_FONT_SIZE_STORAGE_KEY), '16');
assert.equal(readForumContentFontSize(), 16);
assert.equal(preferenceChangeCount, 1);
assert.equal(saveForumContentFontSize(18), false);

const mobileViewport = Object.assign(new EventTarget(), { matches: true });
const windowEvents = new EventTarget();
window.matchMedia = () => mobileViewport;
window.addEventListener = windowEvents.addEventListener.bind(windowEvents);
window.removeEventListener = windowEvents.removeEventListener.bind(windowEvents);

assert.equal(readForumContentFontSize(), 16, 'mobile preserves the saved font size');
storedValues.clear();
assert.equal(readForumContentFontSize(), 14, 'mobile uses the smaller default');
storedValues.set(FORUM_CONTENT_FONT_SIZE_STORAGE_KEY, 'invalid');
assert.equal(readForumContentFontSize(), 14, 'invalid preferences use the mobile default');

const observedFontSizes = [];
const unsubscribe = subscribeForumContentFontSize(() => observedFontSizes.push(readForumContentFontSize()));
mobileViewport.matches = false;
mobileViewport.dispatchEvent(new Event('change'));
mobileViewport.matches = true;
mobileViewport.dispatchEvent(new Event('change'));
assert.deepEqual(observedFontSizes, [15, 14], 'the default follows viewport changes');

storedValues.set(FORUM_CONTENT_FONT_SIZE_STORAGE_KEY, '17');
mobileViewport.matches = false;
mobileViewport.dispatchEvent(new Event('change'));
assert.equal(observedFontSizes.at(-1), 17, 'viewport changes preserve explicit preferences');
storedValues.clear();
windowEvents.dispatchEvent(Object.assign(new Event('storage'), { key: null }));
assert.equal(observedFontSizes.at(-1), 15, 'clearing preferences restores the viewport default');

unsubscribe();
mobileViewport.matches = true;
mobileViewport.dispatchEvent(new Event('change'));
windowEvents.dispatchEvent(Object.assign(new Event('storage'), { key: FORUM_CONTENT_FONT_SIZE_STORAGE_KEY }));
assert.deepEqual(observedFontSizes, [15, 14, 17, 15], 'unsubscribing removes all listeners');
window.localStorage.getItem = () => { throw new Error('Storage unavailable'); };
assert.equal(readForumContentFontSize(), 14, 'mobile default works without local storage');
delete globalThis.window;

const legacyCases = [
  ['1', '11px'],
  ['2', '13px'],
  ['3', '15px'],
  ['4', '17px'],
  ['5', '19px'],
  ['6', '21px'],
  ['7', '23px'],
  ['+2', '19px'],
  ['-2', '11px'],
  ['12', '23px'],
];

for (const [source, expected] of legacyCases) {
  assert.equal(normalizeLegacyFontSizeAttribute(source), expected, source);
}

const keywordCases = [
  ['x-small', '11px'],
  ['small', '13px'],
  ['medium', '15px'],
  ['large', '17px'],
  ['x-large', '19px'],
  ['xx-large', '21px'],
  ['xxx-large', '23px'],
];

for (const [source, expected] of keywordCases) {
  assert.equal(normalizeAbsoluteCssFontSize(source), expected, source);
}

assert.equal(normalizeLegacyFontSizeAttribute('18px'), null);
assert.equal(normalizeAbsoluteCssFontSize('18px'), null);

console.log('forum font size verification passed (responsive defaults, saved preferences and legacy sizes)');
