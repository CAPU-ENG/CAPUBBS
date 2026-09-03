import assert from 'node:assert/strict';
import { getClipboardImageFile } from './src/components/editor/RichTextEditor.clipboard.ts';

function createClipboardData({ files = [], items = [], plainText = '' } = {}) {
  return {
    files,
    getData(type) {
      return type === 'text/plain' ? plainText : '';
    },
    items,
  };
}

const generatedWordPreview = { name: 'word-preview.png', type: 'image/png' };
const copiedScreenshot = { name: 'screenshot.png', type: 'image/png' };

assert.equal(
  getClipboardImageFile(createClipboardData({
    files: [generatedWordPreview],
    plainText: 'Word 正文内容',
  })),
  null,
);

assert.equal(
  getClipboardImageFile(createClipboardData({ files: [copiedScreenshot] })),
  copiedScreenshot,
);

assert.equal(
  getClipboardImageFile(createClipboardData({
    items: [{
      getAsFile: () => copiedScreenshot,
      kind: 'file',
      type: 'image/png',
    }],
  })),
  copiedScreenshot,
);

assert.equal(
  getClipboardImageFile(createClipboardData({
    files: [generatedWordPreview],
    plainText: '   \n\t',
  })),
  generatedWordPreview,
);

assert.equal(
  getClipboardImageFile(createClipboardData({ plainText: '只有文字' })),
  null,
);

console.log('editor paste verification passed (5 assertions)');
