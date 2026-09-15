import assert from 'node:assert/strict';
import {
  applyImageIntrinsicDimensions,
  applyImageTextWrap,
  applyImageWidthPercentage,
  getImageWidthPercentage,
  getRichImageWrap,
  getResizedImageWidthPercentage,
} from './src/components/editor/RichTextEditor.resize.ts';

function createImageStub() {
  const attributes = new Map([
    ['height', '480'],
    ['width', '640'],
  ]);
  const style = {
    height: '480px',
    width: '640px',
    removeProperty(property) {
      this[property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = '';
    },
  };

  return {
    attributes,
    image: {
      getAttribute(name) {
        return attributes.get(name) ?? null;
      },
      removeAttribute(name) {
        attributes.delete(name);
      },
      setAttribute(name, value) {
        attributes.set(name, value);
      },
      style,
    },
    style,
  };
}

assert.equal(getImageWidthPercentage(640, 800), 80);
assert.equal(getImageWidthPercentage(900, 800), 100);
assert.equal(getImageWidthPercentage(0, 800), 100);

assert.equal(getResizedImageWidthPercentage(80, 80, 800, 6), 90);
assert.equal(getResizedImageWidthPercentage(80, 400, 800, 6), 100);
assert.equal(getResizedImageWidthPercentage(20, -200, 800, 6), 6);

const { attributes, image, style } = createImageStub();
applyImageWidthPercentage(image, 37.126);
assert.equal(style.width, '37.13%');
assert.equal(style.height, 'auto');
assert.equal(attributes.get('width'), '640');
assert.equal(attributes.get('height'), '480');

assert.equal(applyImageIntrinsicDimensions(image, { height: 1080, width: 1920 }), true);
assert.equal(attributes.get('width'), '1920');
assert.equal(attributes.get('height'), '1080');
assert.equal(applyImageIntrinsicDimensions(image, { height: 0, width: 1920 }), false);
assert.equal(attributes.get('height'), '1080');

assert.equal(getRichImageWrap(image), 'none');
applyImageTextWrap(image, 'left', 100);
assert.equal(getRichImageWrap(image), 'left');
assert.equal(attributes.get('data-capubbs-image-wrap'), 'left');
assert.equal(style.width, '50%');
assert.equal(style.margin, '0 1em 0.75em 0');
assert.equal(attributes.get('width'), '1920');
assert.equal(attributes.get('height'), '1080');

applyImageTextWrap(image, 'right', 30);
assert.equal(getRichImageWrap(image), 'right');
assert.equal(style.width, '30%');
assert.equal(style.margin, '0 0 0.75em 1em');
applyImageWidthPercentage(image, 24);
assert.equal(getRichImageWrap(image), 'right');

applyImageTextWrap(image, 'left', 65);
assert.equal(style.width, '65%', 'switching sides preserves a manually resized image');
assert.equal(style.maxWidth, 'calc(100% - 1em)');
applyImageWidthPercentage(image, 24);
applyImageTextWrap(image, 'none', 24);
assert.equal(getRichImageWrap(image), 'none');
assert.equal(style.width, '24%');
assert.equal(style.margin, '');
assert.equal(style.maxWidth, '');
assert.equal(attributes.has('data-capubbs-image-wrap'), false);

console.log('rich image resizing and text wrapping verification passed');
