import assert from 'node:assert/strict';
import { toggleRichFirstLineIndentForParagraphs } from './src/components/editor/RichTextEditor.richIndent.ts';

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

console.log('rich text indentation verification passed (4 assertions)');
