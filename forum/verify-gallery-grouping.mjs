import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const markupSource = readFileSync(
  new URL('./src/components/thread/ForumMarkup.tsx', import.meta.url),
  'utf8',
);
const gallerySource = readFileSync(
  new URL('./src/components/editor/RichTextEditor.gallery.ts', import.meta.url),
  'utf8',
);

assert.match(
  markupSource,
  /const gallery = image\.closest<HTMLElement>\('\.capubbs-gallery'\);[\s\S]*?gallery\.querySelectorAll<HTMLImageElement>\('\[data-capubbs-gallery-slide="true"\] img'\)[\s\S]*?filter\([\s\S]*?!candidate\.closest\('\.capubbs-gallery'\)/,
  'direct post rendering must isolate the selected gallery and group only bare floor images',
);
assert.match(
  markupSource,
  /ensureGalleryDisplayControls\(container\);/,
  'direct post rendering must repair historical gallery controls',
);
assert.match(
  gallerySource,
  /export function ensureGalleryDisplayControls[\s\S]*?capubbs-gallery-count/,
  'gallery repair must restore missing count controls',
);
assert.match(
  gallerySource,
  /function createGalleryNavigationControl[\s\S]*?dataset\.capubbsGalleryAction/,
  'gallery repair must restore missing navigation controls',
);

console.log('gallery grouping verification passed (4 assertions)');
