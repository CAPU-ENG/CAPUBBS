import assert from 'node:assert/strict';
import {
  applyImageIntrinsicDimensions,
  applyImageWidthPercentage,
  getImageWidthPercentage,
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
      this[property] = '';
    },
  };

  return {
    attributes,
    image: {
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

console.log('rich image resizing verification passed (15 assertions)');
