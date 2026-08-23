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

console.log(`forum font size verification passed (${legacyCases.length + keywordCases.length + 16} cases)`);
