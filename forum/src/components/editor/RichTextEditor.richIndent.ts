const richFirstLineIndentValue = '2em';
const richParagraphBlockSelector = 'p, div, h1, h2, h3, h4, h5, h6, li, blockquote';

export function ensureRichParagraphBlocks(range: Range, editor: HTMLElement) {
  let paragraphBlocks = getSelectedRichParagraphBlocks(range, editor);
  if (paragraphBlocks.length > 0) return paragraphBlocks;

  document.execCommand('formatBlock', false, 'p');
  const selection = window.getSelection();
  const formattedRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
  if (!formattedRange || !editor.contains(formattedRange.commonAncestorContainer)) return [];

  paragraphBlocks = getSelectedRichParagraphBlocks(formattedRange, editor);
  return paragraphBlocks;
}

function getSelectedRichParagraphBlocks(range: Range, editor: HTMLElement) {
  if (range.collapsed) {
    const paragraph = findRichParagraphBlock(range.startContainer, editor);
    return paragraph ? [paragraph] : [];
  }

  const selectedBlocks = Array.from(
    editor.querySelectorAll<HTMLElement>(richParagraphBlockSelector),
  ).filter((element) => !element.closest('.capubbs-gallery') && rangeIntersectsNode(range, element));
  const startBlock = findRichParagraphBlock(range.startContainer, editor);
  const endBlock = findRichParagraphBlock(range.endContainer, editor);
  if (startBlock) selectedBlocks.push(startBlock);
  if (endBlock) selectedBlocks.push(endBlock);

  const uniqueBlocks = Array.from(new Set(selectedBlocks));
  return uniqueBlocks.filter((block) => (
    !uniqueBlocks.some((otherBlock) => otherBlock !== block && block.contains(otherBlock))
  ));
}

function findRichParagraphBlock(node: Node, editor: HTMLElement) {
  let element = node instanceof Element ? node : node.parentElement;
  while (element && element !== editor) {
    if (/^(?:P|DIV|H[1-6]|LI|BLOCKQUOTE)$/.test(element.tagName) && !element.closest('.capubbs-gallery')) {
      return element as HTMLElement;
    }
    element = element.parentElement;
  }
  return null;
}

function rangeIntersectsNode(range: Range, node: Node) {
  try {
    return range.intersectsNode(node);
  } catch {
    return false;
  }
}

export function isRichFirstLineIndentActive(range: Range, editor: HTMLElement) {
  const paragraphBlocks = getSelectedRichParagraphBlocks(range, editor);
  return paragraphBlocks.length > 0 && paragraphBlocks.every(hasRichFirstLineIndent);
}

function hasRichFirstLineIndent(paragraph: HTMLElement) {
  return paragraph.style.getPropertyValue('text-indent').replaceAll(' ', '').toLowerCase()
    === richFirstLineIndentValue;
}

export function applyRichFirstLineIndent(paragraph: HTMLElement) {
  paragraph.style.setProperty('text-indent', richFirstLineIndentValue);
}

export function removeRichFirstLineIndent(paragraph: HTMLElement) {
  paragraph.style.removeProperty('text-indent');
  if (!paragraph.getAttribute('style')?.trim()) paragraph.removeAttribute('style');
}

export function toggleRichFirstLineIndentForRange(range: Range, editor: HTMLElement) {
  const paragraphBlocks = ensureRichParagraphBlocks(range, editor);
  toggleRichFirstLineIndentForParagraphs(paragraphBlocks);
  return paragraphBlocks;
}

export function toggleRichFirstLineIndentForParagraphs(paragraphBlocks: HTMLElement[]) {
  if (paragraphBlocks.length === 0) return;

  const shouldRemoveIndent = paragraphBlocks.every(hasRichFirstLineIndent);
  paragraphBlocks.forEach(
    shouldRemoveIndent ? removeRichFirstLineIndent : applyRichFirstLineIndent,
  );
}
