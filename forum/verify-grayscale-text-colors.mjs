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

// parse() returns { red, green, blue, alpha }; gray inputs have equal channels.
for (const [source, channel] of grayscaleCases) {
  const color = parseForumGrayscaleTextColor(source);
  assert.ok(color, source);
  assert.deepEqual([color.red, color.green, color.blue], [channel, channel, channel], source);
}

assert.equal(parseForumGrayscaleTextColor('#123456'), null);
// Near-gray colors are inverted too since b83c3f83 (widened in 16673e52).
assert.deepEqual(parseForumGrayscaleTextColor('rgb(20 21 20)'), { alpha: 1, blue: 20, green: 21, red: 20 });
assert.equal(invertForumGrayscaleTextColor('rgb(20 21 20)'), '#eaebea');
assert.equal(invertForumGrayscaleTextColor('#333'), '#cccccc');
assert.equal(invertForumGrayscaleTextColor('white'), '#000000');
assert.equal(invertForumGrayscaleTextColor('rgba(32, 32, 32, 0.5)'), 'rgba(223, 223, 223, 0.5)');
assert.equal(invertForumGrayscaleTextColor('#336699'), null);

const frameSource = readFileSync(
  new URL('./src/components/thread/ThreadHtmlContent.tsx', import.meta.url),
  'utf8',
);
const threadStyles = readFileSync(new URL('./src/styles/thread.css', import.meta.url), 'utf8');
const frameStyles = readFileSync(new URL('./src/styles/thread-html-frame.css', import.meta.url), 'utf8');
assert.match(frameSource, /syncGrayscaleTextColors\(document\.body\);/);
assert.match(frameSource, /syncGrayscaleTextColors\(contentRoot\);/);
// Since 31ab74e9 the frame injects the shared factory instead of an inline copy;
// the original-color markers live in that factory.
const grayscaleSource = readFileSync(new URL('./src/utils/forumGrayscaleTextColor.ts', import.meta.url), 'utf8');
assert.match(frameSource, /\$\{createForumGrayscaleTextColor\.toString\(\)\}/);
assert.match(grayscaleSource, /original-grayscale-color-attr/);
assert.match(grayscaleSource, /original-grayscale-style-color/);
assert.match(frameSource, /const darkColor = isSignature \? '#666666'/);
assert.match(threadStyles, /\.dark \.forum-markup-signature \{\s*color: #666;/);
assert.match(frameStyles, /:root\.dark \.forum-markup-signature \{\s*color: #666;/);

console.log('forum grayscale text color verification passed');
