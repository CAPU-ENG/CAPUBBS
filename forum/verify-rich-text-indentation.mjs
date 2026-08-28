import assert from 'node:assert/strict';
import {
  groupRichParagraphChildNodes,
  toggleRichFirstLineIndentForParagraphs,
} from './src/components/editor/RichTextEditor.richIndent.ts';

function createParagraph(firstLineIndent = '') {
  const properties = new Map();
  if (firstLineIndent) properties.set('text-indent', firstLineIndent);

  return {
    getAttribute(name) {
      if (name !== 'style' || properties.size === 0) return null;
      return Array.from(properties, ([property, value]) => `${property}: ${value}`).join('; ');
    },
    removeAttribute(name) {
      assert.equal(name, 'style');
      properties.clear();
    },
    style: {
      getPropertyValue(property) {
        return properties.get(property) ?? '';
      },
      removeProperty(property) {
        const previousValue = properties.get(property) ?? '';
        properties.delete(property);
        return previousValue;
      },
      setProperty(property, value) {
        properties.set(property, value);
      },
    },
  };
}

function readIndent(paragraph) {
  return paragraph.style.getPropertyValue('text-indent');
}

const unindentedParagraphs = [createParagraph(), createParagraph(), createParagraph()];
toggleRichFirstLineIndentForParagraphs(unindentedParagraphs);
assert.deepEqual(unindentedParagraphs.map(readIndent), ['2em', '2em', '2em']);

const mixedParagraphs = [createParagraph('2em'), createParagraph(), createParagraph('2em')];
toggleRichFirstLineIndentForParagraphs(mixedParagraphs);
assert.deepEqual(mixedParagraphs.map(readIndent), ['2em', '2em', '2em']);

toggleRichFirstLineIndentForParagraphs(mixedParagraphs);
assert.deepEqual(mixedParagraphs.map(readIndent), ['', '', '']);
assert.deepEqual(mixedParagraphs.map((paragraph) => paragraph.getAttribute('style')), [null, null, null]);

const text = (value) => ({ nodeName: '#text', value });
const breakNode = { nodeName: 'BR' };
assert.deepEqual(
  groupRichParagraphChildNodes([
    text('说明'), breakNode, text('第一项'), breakNode, text('第二项'), breakNode, text('第三项'),
  ]).map((group) => group.map((node) => node.value ?? '<br>')),
  [['说明'], ['第一项'], ['第二项'], ['第三项']],
);

assert.deepEqual(
  groupRichParagraphChildNodes([text('首段'), breakNode, breakNode, text('末段')])
    .map((group) => group.map((node) => node.value ?? '<br>')),
  [['首段'], [], ['末段']],
);

console.log('rich text indentation verification passed (6 assertions)');
