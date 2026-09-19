import { normalizeCssColor } from './RichTextEditor.richText';
import { isRichFirstLineIndentActive } from './RichTextEditor.richIndent';
import { defaultRichTextFontSize, richTextFontOptions } from './RichTextEditor.constants';
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

export {
  applyRichFirstLineIndent,
  ensureRichParagraphBlocks,
  isRichFirstLineIndentActive,
  removeRichFirstLineIndent,
  toggleRichFirstLineIndentForParagraphs,
  toggleRichFirstLineIndentForRange,
} from './RichTextEditor.richIndent';

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

export function readRichHeading(editor: HTMLElement): string {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 'p';
  if (!editor.contains(selection.getRangeAt(0).commonAncestorContainer)) return 'p';

  const node = selection.focusNode;
  let element = node instanceof Element ? node : node?.parentElement;
  while (element && element !== editor) {
    if (/^H[1-6]$/.test(element.tagName)) return element.tagName.toLowerCase();
    element = element.parentElement;
  }
  return 'p';
}

export function readRichFontStyles(editor: HTMLElement) {
  const defaults = { fontFamily: '', fontSize: defaultRichTextFontSize };
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return defaults;
  if (!editor.contains(selection.getRangeAt(0).commonAncestorContainer)) return defaults;

  const node = selection.focusNode;
  const element = node instanceof Element ? node : node?.parentElement;
  if (!element) return defaults;

  const style = window.getComputedStyle(element);
  const editorStyle = window.getComputedStyle(editor);
  const families = normalizeRichFontFamilies(style.fontFamily);
  const defaultFamilies = normalizeRichFontFamilies(editorStyle.fontFamily);
  const fontOption = richTextFontOptions.find((option) => {
    const optionFamilies = normalizeRichFontFamilies(option.value);
    // Match named aliases, without treating a shared serif/sans-serif fallback as the font.
    const aliases = optionFamilies.length > 1 ? optionFamilies.slice(0, -1) : optionFamilies;
    return aliases.includes(families[0]);
  });

  return {
    fontFamily: families.join(',') === defaultFamilies.join(',')
      ? ''
      : fontOption?.value ?? style.fontFamily,
    fontSize: style.fontSize || defaultRichTextFontSize,
  };
}

function normalizeRichFontFamilies(fontFamily: string) {
  return fontFamily.split(',').map((family) => family.trim().replace(/^['"]|['"]$/g, '').toLowerCase());
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

export function removeRichQuoteAtCaret(editor: HTMLElement, selection: Selection, key: string) {
  if (!['Backspace', 'Delete'].includes(key) || selection.rangeCount === 0 || !selection.isCollapsed) return false;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.startContainer)) return false;
  const element = range.startContainer.nodeType === 1
    ? range.startContainer as Element
    : range.startContainer.parentElement;
  const quote = element?.closest<HTMLElement>('blockquote.forum-quote, blockquote.forum-legacy-quote');
  if (!quote || !editor.contains(quote)) return false;
  const body = quote.querySelector<HTMLElement>('.capubbs-manual-quote-body')
    ?? (quote.classList.contains('forum-quote') ? quote : null);
  if (!body || !body.contains(range.startContainer)) return false;

  // Only placeholders and empty formatting wrappers count as empty. Media,
  // embedded HTML and nested structured blocks must keep their contents.
  const hasContent = (root: ParentNode) => Array.from(root.childNodes).some(function occupied(node): boolean {
    if (node.nodeType === 3) return Boolean(node.textContent?.replace(/\u200B/g, ''));
    if (node.nodeType !== 1) return false;
    const child = node as Element;
    if (child.tagName === 'BR') return false;
    if (!/^(P|DIV|SPAN|B|STRONG|I|EM|U|S|STRIKE|FONT|SUB|SUP)$/.test(child.tagName)) return true;
    return Array.from(child.childNodes).some(occupied);
  });
  const empty = !hasContent(body);
  if (!empty) {
    if (key !== 'Backspace') return false;
    const before = range.cloneRange();
    before.selectNodeContents(body);
    before.setEnd(range.startContainer, range.startOffset);
    const preceding = before.cloneContents();
    if (hasContent(preceding) || preceding.querySelector('br')) return false;
  }

  const replacement = editor.ownerDocument.createElement('div');
  if (empty) replacement.append(editor.ownerDocument.createElement('br'));
  else replacement.append(...Array.from(body.childNodes));
  quote.replaceWith(replacement);
  range.selectNodeContents(replacement);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}
