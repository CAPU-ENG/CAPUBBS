import assert from 'node:assert/strict';
import {
  getMarkdownListEnterEdit,
  getMarkdownTabEdit,
} from './src/components/editor/RichTextEditor.markdown.ts';

assert.deepEqual(getMarkdownTabEdit('- 第一项', 5, 5, false), {
  content: '  - 第一项',
  selectionEnd: 7,
  selectionStart: 7,
});

assert.deepEqual(getMarkdownTabEdit('  - 第一项', 7, 7, true), {
  content: '- 第一项',
  selectionEnd: 5,
  selectionStart: 5,
});

assert.deepEqual(getMarkdownTabEdit('- 第一项\n- 第二项', 0, 11, false), {
  content: '  - 第一项\n  - 第二项',
  selectionEnd: 15,
  selectionStart: 2,
});

assert.deepEqual(getMarkdownTabEdit('  - 第一项\n\t- 第二项', 0, 14, true), {
  content: '- 第一项\n- 第二项',
  selectionEnd: 11,
  selectionStart: 0,
});

assert.deepEqual(getMarkdownTabEdit('- 第一项\n- 第二项', 0, 6, false), {
  content: '  - 第一项\n- 第二项',
  selectionEnd: 8,
  selectionStart: 2,
});

assert.deepEqual(getMarkdownListEnterEdit('- 第一项', 5, 5), {
  content: '- 第一项\n- ',
  selectionEnd: 8,
  selectionStart: 8,
});

assert.deepEqual(getMarkdownListEnterEdit('+ 第一项', 5, 5), {
  content: '+ 第一项\n+ ',
  selectionEnd: 8,
  selectionStart: 8,
});

assert.deepEqual(getMarkdownListEnterEdit('  * 子项目', 7, 7), {
  content: '  * 子项目\n  * ',
  selectionEnd: 12,
  selectionStart: 12,
});

assert.deepEqual(getMarkdownListEnterEdit('9. 第九项', 6, 6), {
  content: '9. 第九项\n10. ',
  selectionEnd: 11,
  selectionStart: 11,
});

assert.deepEqual(getMarkdownListEnterEdit('09. 第九项', 7, 7), {
  content: '09. 第九项\n10. ',
  selectionEnd: 12,
  selectionStart: 12,
});

assert.deepEqual(getMarkdownListEnterEdit('- 第一项\n- ', 8, 8), {
  content: '- 第一项\n',
  selectionEnd: 6,
  selectionStart: 6,
});

assert.deepEqual(getMarkdownListEnterEdit('1. 第一项\n2. \n3. 第三项', 10, 10), {
  content: '1. 第一项\n\n3. 第三项',
  selectionEnd: 7,
  selectionStart: 7,
});

assert.equal(getMarkdownListEnterEdit('普通文本', 4, 4), null);
assert.equal(getMarkdownListEnterEdit('- 第一项', 0, 5), null);
assert.equal(getMarkdownListEnterEdit('- ', 0, 0), null);

console.log('markdown editing verification passed (15 assertions)');
