import assert from 'node:assert/strict';
import {
  clipboardPlainTextToRichHtml,
  getClipboardImageFile,
  getMicrosoftWordClipboardHtml,
  getWordClipboardElementAction,
  isMicrosoftWordClipboardHtml,
  isUsefulMicrosoftWordClipboardStyle,
} from './src/components/editor/RichTextEditor.clipboard.ts';

function createClipboardData({ files = [], html = '', items = [], plainText = '' } = {}) {
  return {
    files,
    getData(type) {
      if (type === 'text/plain') return plainText;
      if (type === 'text/html') return html;
      return '';
    },
    items,
  };
}

const generatedWordPreview = { name: 'word-preview.png', type: 'image/png' };
const copiedScreenshot = { name: 'screenshot.png', type: 'image/png' };
const wordHtml = '<p class="MsoNormal" style="mso-margin-top-alt:auto"><span>Word 正文</span><o:p></o:p></p>';

assert.equal(isMicrosoftWordClipboardHtml(wordHtml), true);
assert.equal(isMicrosoftWordClipboardHtml('<p>普通网页正文</p>'), false);
assert.equal(
  getMicrosoftWordClipboardHtml(createClipboardData({ html: wordHtml, plainText: 'Word 正文' })),
  wordHtml,
);
assert.equal(
  getMicrosoftWordClipboardHtml(createClipboardData({ html: wordHtml })),
  '',
);

assert.equal(getWordClipboardElementAction('p'), 'keep');
assert.equal(getWordClipboardElementAction('STRONG'), 'keep');
assert.equal(getWordClipboardElementAction('span'), 'keep');
assert.equal(getWordClipboardElementAction('font'), 'keep');
assert.equal(getWordClipboardElementAction('o:p'), 'unwrap');
assert.equal(getWordClipboardElementAction('style'), 'remove');
assert.equal(getWordClipboardElementAction('IMG'), 'remove');
assert.equal(isUsefulMicrosoftWordClipboardStyle('font-family', 'Arial, sans-serif'), true);
assert.equal(isUsefulMicrosoftWordClipboardStyle('font-size', '10.5pt'), true);
assert.equal(isUsefulMicrosoftWordClipboardStyle('color', '#A02B93'), true);
assert.equal(isUsefulMicrosoftWordClipboardStyle('text-indent', '21pt'), true);
assert.equal(isUsefulMicrosoftWordClipboardStyle('border-bottom-width', '1pt'), true);
assert.equal(isUsefulMicrosoftWordClipboardStyle('mso-fareast-font-family', '等线'), false);
assert.equal(isUsefulMicrosoftWordClipboardStyle('position', 'absolute'), false);
assert.equal(isUsefulMicrosoftWordClipboardStyle('background-color', 'url(https://example.com/a.png)'), false);
assert.equal(
  clipboardPlainTextToRichHtml('第一行\r\n第二行\n<&>'),
  '第一行<br>第二行<br>&lt;&amp;&gt;',
);

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

console.log('editor paste verification passed (25 assertions)');
