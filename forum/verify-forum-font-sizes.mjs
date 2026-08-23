import assert from 'node:assert/strict';
import {
  FORUM_DEFAULT_FONT_SIZE,
  normalizeAbsoluteCssFontSize,
  normalizeLegacyFontSizeAttribute,
} from './src/utils/forumFontSize.ts';

assert.equal(FORUM_DEFAULT_FONT_SIZE, '15px');

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

console.log(`forum font size verification passed (${legacyCases.length + keywordCases.length + 3} cases)`);
