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
const lightboxSource = readFileSync(
  new URL('./src/components/thread/ThreadImageLightbox.tsx', import.meta.url),
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
assert.match(
  gallerySource,
  /while \(captions\.length < slides\.length\)[\s\S]*?capubbsGalleryCaption = 'true'/,
  'gallery normalization must restore one caption placeholder per slide',
);
assert.match(
  gallerySource,
  /const normalizedIndex = activeIndex[\s\S]*?setGalleryItemActive\(slide[\s\S]*?capubbsGalleryTotal = String\(slides\.length\)/,
  'gallery normalization must reconcile active state, index, and total count',
);
assert.match(
  markupSource,
  /element: candidate/,
  'direct post images must pass their loaded element to the lightbox',
);
assert.match(
  lightboxSource,
  /originalParent\.insertBefore\(placeholder, element\)[\s\S]*?marker\.parentNode\.insertBefore\(element, marker\)[\s\S]*?placeholder\.parentNode\?\.insertBefore\(element, placeholder\)/,
  'the lightbox must move and restore the existing image element',
);
assert.doesNotMatch(
  lightboxSource,
  /new Image\(\)/,
  'the lightbox must not preload duplicate image resources',
);
assert.match(
  lightboxSource,
  /target\.closest\('img, button, \.thread-image-lightbox-controls'\)[\s\S]*?closePreview\(\)/,
  'lightbox clicks outside the image and controls must close the preview',
);

console.log('gallery grouping verification passed (10 assertions)');
