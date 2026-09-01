import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  invertForumGrayscaleTextColor,
  parseForumGrayscaleTextColor,
} from './src/utils/forumGrayscaleTextColor.ts';

const grayscaleCases = [
  ['black', 0],
  ['white', 255],
  ['#333', 51],
  ['#80808080', 128],
  ['rgb(96, 96, 96)', 96],
  ['rgb(50% 50% 50% / 40%)', 127],
];

for (const [source, channel] of grayscaleCases) {
  assert.equal(parseForumGrayscaleTextColor(source)?.channel, channel, source);
}

assert.equal(parseForumGrayscaleTextColor('#123456'), null);
assert.equal(parseForumGrayscaleTextColor('rgb(20 21 20)'), null);
assert.equal(invertForumGrayscaleTextColor('#333'), '#cccccc');
assert.equal(invertForumGrayscaleTextColor('white'), '#000000');
assert.equal(invertForumGrayscaleTextColor('rgba(32, 32, 32, 0.5)'), 'rgba(223, 223, 223, 0.5)');
assert.equal(invertForumGrayscaleTextColor('#336699'), null);

const frameSource = readFileSync(
  new URL('./src/components/thread/ThreadHtmlContent.tsx', import.meta.url),
  'utf8',
);
assert.match(frameSource, /syncGrayscaleTextColors\(document\.body\);/);
assert.match(frameSource, /syncGrayscaleTextColors\(contentRoot\);/);
assert.match(frameSource, /original-grayscale-color-attr/);
assert.match(frameSource, /original-grayscale-style-color/);

console.log('forum grayscale text color verification passed (16 assertions)');
