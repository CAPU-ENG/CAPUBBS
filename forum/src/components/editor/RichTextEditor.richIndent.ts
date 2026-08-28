const richFirstLineIndentValue = '2em';
const richParagraphBlockSelector = 'p, div, h1, h2, h3, h4, h5, h6, li, blockquote';

export function ensureRichParagraphBlocks(range: Range, editor: HTMLElement) {
  let paragraphBlocks = getSelectedRichParagraphBlocks(range, editor);
  if (paragraphBlocks.length > 0) {
    return splitSelectedRichParagraphBreaks(range, paragraphBlocks);
  }

  document.execCommand('formatBlock', false, 'p');
  const selection = window.getSelection();
  const formattedRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
  if (!formattedRange || !editor.contains(formattedRange.commonAncestorContainer)) return [];

  paragraphBlocks = getSelectedRichParagraphBlocks(formattedRange, editor);
  return splitSelectedRichParagraphBreaks(formattedRange, paragraphBlocks);
}

function splitSelectedRichParagraphBreaks(range: Range, paragraphBlocks: HTMLElement[]) {
  if (range.collapsed) return paragraphBlocks;

  const splitPlans = paragraphBlocks.map((paragraph) => {
    if (!['P', 'DIV'].includes(paragraph.tagName)) return null;

    const groups = groupRichParagraphChildNodes(Array.from(paragraph.childNodes));
    if (groups.length < 2) return null;

    const selectedGroups = groups.map((nodes) => (
      nodes.some((node) => rangeIntersectsNode(range, node))
    ));
    if (!selectedGroups.some(Boolean)) selectedGroups.fill(true);

    return { groups, paragraph, selectedGroups };
  });

  const replacements = new Map<HTMLElement, HTMLElement[]>();
  splitPlans.forEach((plan) => {
    if (!plan) return;

    const replacementParagraphs = plan.groups.map((nodes, index) => {
      const paragraph = document.createElement('p');
      Array.from(plan.paragraph.attributes).forEach((attribute) => {
        if (attribute.name !== 'id' || index === 0) {
          paragraph.setAttribute(attribute.name, attribute.value);
        }
      });
      nodes.forEach((node) => paragraph.append(node));
      if (nodes.length === 0) paragraph.append(document.createElement('br'));
      return paragraph;
    });

    plan.paragraph.replaceWith(...replacementParagraphs);
    replacements.set(
      plan.paragraph,
      replacementParagraphs.filter((_, index) => plan.selectedGroups[index]),
    );
  });

  return paragraphBlocks.flatMap((paragraph) => replacements.get(paragraph) ?? [paragraph]);
}

export function groupRichParagraphChildNodes<T extends { nodeName: string }>(childNodes: T[]) {
  return childNodes.reduce<T[][]>((groups, node) => {
    if (node.nodeName.toUpperCase() === 'BR') {
      groups.push([]);
    } else {
      groups.at(-1)?.push(node);
    }
    return groups;
  }, [[]]);
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
