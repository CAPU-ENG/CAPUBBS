import assert from 'node:assert/strict';
import {
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
assert.equal(style.height, '');
assert.equal(attributes.get('width'), '37.13%');
assert.equal(attributes.has('height'), false);

console.log('rich image resizing verification passed (10 assertions)');
