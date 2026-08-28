import { normalizeCssColor } from './RichTextEditor.richText';
import type { RichInlineStyle } from './RichTextEditor.types';

const richToggleCommands = [
  'bold',
  'italic',
  'underline',
  'strikeThrough',
  'superscript',
  'subscript',
] as const;

type RichToggleCommand = typeof richToggleCommands[number];
export type RichToggleCommandStates = Record<RichToggleCommand, boolean> & {
  firstLineIndent: boolean;
};

export const maxRecentTextColors = 8;
const recentTextColorsStorageKey = 'capubbs-rich-text-recent-colors:v1';
export const richTypingStyleAttribute = 'data-capubbs-typing-style';
export const richTypingStyleMarker = '\u200B';
const richFirstLineIndentValue = '2em';

export function normalizeRichIndentation(editor: HTMLElement) {
  const indentationBlockquotes = editor.querySelectorAll<HTMLElement>(
    'blockquote:not(.forum-quote):not(.forum-legacy-quote):not(.capubbs-floor-quote)',
  );

  indentationBlockquotes.forEach((blockquote) => {
    blockquote.style.removeProperty('margin');
    blockquote.style.removeProperty('margin-left');
    blockquote.style.removeProperty('border');
    blockquote.style.removeProperty('padding');

    if (!blockquote.getAttribute('style')?.trim()) blockquote.removeAttribute('style');
  });
}

export function createInactiveRichCommandStates(): RichToggleCommandStates {
  return {
    bold: false,
    firstLineIndent: false,
    italic: false,
    strikeThrough: false,
    subscript: false,
    superscript: false,
    underline: false,
  };
}

export function readRichCommandStates(editor: HTMLElement): RichToggleCommandStates {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return createInactiveRichCommandStates();

  const range = selection.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return createInactiveRichCommandStates();

  const states = richToggleCommands.reduce((commandStates, command) => {
    try {
      commandStates[command] = document.queryCommandState(command);
    } catch {
      commandStates[command] = false;
    }
    return commandStates;
  }, createInactiveRichCommandStates());

  const verticalAlign = findRichVerticalAlignAtCaret(range, editor);
  if (verticalAlign) {
    states.superscript = verticalAlign === 'super';
    states.subscript = verticalAlign === 'sub';
  }
  states.firstLineIndent = isRichFirstLineIndentActive(range, editor);
  return states;
}

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
    editor.querySelectorAll<HTMLElement>('p, div, h1, h2, h3, h4, h5, h6'),
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
    if (/^(?:P|DIV|H[1-6])$/.test(element.tagName) && !element.closest('.capubbs-gallery')) {
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

function findRichVerticalAlignAtCaret(range: Range, editor: HTMLElement): 'super' | 'sub' | null {
  let element = range.startContainer instanceof Element
    ? range.startContainer
    : range.startContainer.parentElement;
  while (element && element !== editor) {
    const tagName = element.tagName.toLowerCase();
    const verticalAlign = element instanceof HTMLElement
      ? element.style.verticalAlign.trim().toLowerCase()
      : '';
    if (tagName === 'sup' || verticalAlign === 'super') return 'super';
    if (tagName === 'sub' || verticalAlign === 'sub') return 'sub';
    element = element.parentElement;
  }
  return null;
}

export function normalizeRichTypingStylesAfterInput(editor: HTMLElement) {
  const typingSpans = Array.from(editor.querySelectorAll<HTMLElement>(`[${richTypingStyleAttribute}]`));
  const completedSpans = typingSpans.filter((span) => (
    (span.textContent ?? '').replaceAll(richTypingStyleMarker, '').length > 0
    || Boolean(span.querySelector('br, img, hr'))
  ));
  if (completedSpans.length === 0) return;

  const textNodes = new Set<Text>();
  completedSpans.forEach((span) => {
    const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node instanceof Text && node.data.includes(richTypingStyleMarker)) textNodes.add(node);
      node = walker.nextNode();
    }
  });

  const selection = window.getSelection();
  const activeRange = selection?.rangeCount && editor.contains(selection.getRangeAt(0).commonAncestorContainer)
    ? selection.getRangeAt(0).cloneRange()
    : null;
  const startOffset = activeRange?.startContainer instanceof Text
    ? getOffsetWithoutTypingMarkers(activeRange.startContainer.data, activeRange.startOffset)
    : null;
  const endOffset = activeRange?.endContainer instanceof Text
    ? getOffsetWithoutTypingMarkers(activeRange.endContainer.data, activeRange.endOffset)
    : null;

  textNodes.forEach((node) => {
    node.data = node.data.replaceAll(richTypingStyleMarker, '');
  });
  completedSpans.forEach((span) => span.removeAttribute(richTypingStyleAttribute));

  if (!selection || !activeRange) return;
  try {
    if (startOffset !== null) {
      activeRange.setStart(activeRange.startContainer, Math.min(startOffset, activeRange.startContainer.textContent?.length ?? 0));
    }
    if (endOffset !== null) {
      activeRange.setEnd(activeRange.endContainer, Math.min(endOffset, activeRange.endContainer.textContent?.length ?? 0));
    }
    selection.removeAllRanges();
    selection.addRange(activeRange);
  } catch {
    // The browser already placed the caret safely after the input.
  }
}

function getOffsetWithoutTypingMarkers(value: string, offset: number) {
  return value.slice(0, offset).replaceAll(richTypingStyleMarker, '').length;
}

export function finalizeRichTypingStyles(html: string) {
  if (!html.includes(richTypingStyleMarker) && !html.includes(richTypingStyleAttribute)) return html;

  const template = document.createElement('template');
  template.innerHTML = html;
  const typingSpans = Array.from(template.content.querySelectorAll<HTMLElement>(`[${richTypingStyleAttribute}]`));
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node instanceof Text && node.data.includes(richTypingStyleMarker)) {
      node.data = node.data.replaceAll(richTypingStyleMarker, '');
    }
    node = walker.nextNode();
  }
  typingSpans.forEach((span) => {
    span.removeAttribute(richTypingStyleAttribute);
    if (!(span.textContent ?? '').length && !span.querySelector('br, img, hr')) span.remove();
  });
  return template.innerHTML;
}

export function removeOverriddenRichInlineStyles(content: DocumentFragment, style: RichInlineStyle) {
  content.querySelectorAll<HTMLElement>('*').forEach((element) => {
    removeOverriddenRichInlineStyleFromElement(element, style);
  });
  normalizeRedundantRichSpans(content);
}

export function removeOverriddenRichInlineStylesFromFullySelectedAncestors(
  wrapper: HTMLSpanElement,
  editor: HTMLElement,
  style: RichInlineStyle,
) {
  let selectedNode: Node = wrapper;
  let ancestor = wrapper.parentElement;
  while (ancestor && ancestor !== editor && ancestor.tagName === 'SPAN') {
    const childNodes = Array.from(ancestor.childNodes);
    if (childNodes.length !== 1 || childNodes[0] !== selectedNode) break;

    removeOverriddenRichInlineStyleFromElement(ancestor, style);
    if (
      ancestor instanceof HTMLSpanElement
      && selectedNode instanceof HTMLSpanElement
      && canMergeRichInlineStyleSpans(ancestor, selectedNode)
    ) {
      mergeRichInlineStyles(ancestor, selectedNode);
      const parent = ancestor.parentElement;
      ancestor.replaceWith(selectedNode);
      ancestor = parent;
    } else if (ancestor.attributes.length === 0) {
      const parent = ancestor.parentElement;
      ancestor.replaceWith(...Array.from(ancestor.childNodes));
      ancestor = parent;
    } else {
      selectedNode = ancestor;
      ancestor = ancestor.parentElement;
    }
  }
}

export function mergeFullySelectedChildRichSpansIntoWrapper(wrapper: HTMLSpanElement) {
  let child = wrapper.firstElementChild;
  while (
    wrapper.childNodes.length === 1
    && child instanceof HTMLSpanElement
    && canMergeRichInlineStyleSpans(child, wrapper)
  ) {
    mergeRichInlineStyles(child, wrapper);
    child.replaceWith(...Array.from(child.childNodes));
    child = wrapper.firstElementChild;
  }
}

function canMergeRichInlineStyleSpans(source: HTMLSpanElement, target: HTMLSpanElement) {
  const supportedProperties = new Set(['color', 'font-family', 'font-size']);
  return source.attributes.length === 1
    && source.hasAttribute('style')
    && target.attributes.length === 1
    && target.hasAttribute('style')
    && Array.from(source.style).every((property) => supportedProperties.has(property))
    && Array.from(target.style).every((property) => supportedProperties.has(property));
}

function mergeRichInlineStyles(source: HTMLSpanElement, target: HTMLSpanElement) {
  Array.from(source.style).forEach((property) => {
    if (!target.style.getPropertyValue(property)) {
      target.style.setProperty(
        property,
        source.style.getPropertyValue(property),
        source.style.getPropertyPriority(property),
      );
    }
  });
}

function removeOverriddenRichInlineStyleFromElement(element: HTMLElement, style: RichInlineStyle) {
  if (style.color) {
    element.style.removeProperty('color');
    element.removeAttribute('color');
  }
  if (style.fontFamily) {
    element.style.removeProperty('font-family');
    element.removeAttribute('face');
  }
  if (style.fontSize) {
    element.style.removeProperty('font-size');
    element.removeAttribute('size');
  }
  if (element.hasAttribute('style') && !element.getAttribute('style')?.trim()) {
    element.removeAttribute('style');
  }
}

export function normalizeRedundantRichSpans(content: ParentNode) {
  content.normalize();
  Array.from(content.querySelectorAll('span')).reverse().forEach((span) => {
    if (!(span.textContent ?? '').length && !span.querySelector('br, img, hr')) {
      span.remove();
    } else if (span.attributes.length === 0) {
      span.replaceWith(...Array.from(span.childNodes));
    }
  });
  content.normalize();
}

export function readRecentTextColors() {
  if (typeof window === 'undefined') return [];
  try {
    const storedColors = JSON.parse(window.localStorage.getItem(recentTextColorsStorageKey) ?? '[]');
    if (!Array.isArray(storedColors)) return [];
    return storedColors
      .map((color) => typeof color === 'string' ? normalizeCssColor(color) : null)
      .filter((color): color is string => color !== null)
      .slice(0, maxRecentTextColors);
  } catch {
    return [];
  }
}

export function storeRecentTextColors(colors: string[]) {
  try {
    window.localStorage.setItem(recentTextColorsStorageKey, JSON.stringify(colors));
  } catch {
    // The color still applies when persistent storage is unavailable.
  }
}

export function isSelectionInsideStructuredRichBlock(editor: HTMLElement, node: Node) {
  let element = node instanceof Element ? node : node.parentElement;
  while (element && element !== editor) {
    if (/^(?:BLOCKQUOTE|H[1-6]|LI|PRE|T[DH])$/.test(element.tagName)) return true;
    element = element.parentElement;
  }
  return false;
}
