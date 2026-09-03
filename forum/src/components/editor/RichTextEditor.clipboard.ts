const wordClipboardAllowedTags = new Set([
  'a', 'b', 'blockquote', 'br', 'code', 'del', 'div', 'em', 'font', 'h1',
  'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'li', 'ol', 'p', 'pre', 's',
  'span', 'strike', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot',
  'th', 'thead', 'tr', 'u', 'ul',
]);
const wordClipboardRemovedTags = new Set([
  'button', 'canvas', 'embed', 'form', 'iframe', 'img', 'input', 'link',
  'meta', 'object', 'script', 'select', 'style', 'svg', 'template', 'textarea',
  'title', 'xml',
]);
const wordClipboardUsefulStyleProperties = new Set([
  'background-color', 'border-collapse', 'border-spacing', 'color', 'direction',
  'font-family', 'font-size', 'font-stretch', 'font-style', 'font-variant',
  'font-weight', 'height', 'letter-spacing', 'line-height', 'list-style-position',
  'list-style-type', 'margin', 'margin-bottom', 'margin-left', 'margin-right',
  'margin-top', 'max-height', 'max-width', 'min-height', 'min-width', 'padding',
  'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'table-layout',
  'text-align', 'text-decoration', 'text-decoration-color',
  'text-decoration-line', 'text-decoration-style', 'text-decoration-thickness',
  'text-indent', 'text-transform', 'vertical-align', 'white-space', 'width',
  'word-spacing',
]);

export type WordClipboardElementAction = 'keep' | 'remove' | 'unwrap';

export function getWordClipboardElementAction(tagName: string): WordClipboardElementAction {
  const normalizedTagName = tagName.trim().toLowerCase();
  if (wordClipboardRemovedTags.has(normalizedTagName)) return 'remove';
  if (wordClipboardAllowedTags.has(normalizedTagName)) return 'keep';
  return 'unwrap';
}

export function isMicrosoftWordClipboardHtml(html: string) {
  return /(?:class\s*=\s*["']?Mso|\bmso-[\w-]+\s*:|urn:schemas-microsoft-com:office|<o:p\b|content\s*=\s*["'][^"']*Microsoft\s+Word)/i.test(html);
}

export function isUsefulMicrosoftWordClipboardStyle(property: string, value: string) {
  const normalizedProperty = property.trim().toLowerCase();
  const normalizedValue = value.trim();
  const isBorderProperty = /^border(?:-(?:bottom|left|right|top))?(?:-(?:color|style|width))?$/.test(normalizedProperty);

  return Boolean(normalizedValue)
    && (wordClipboardUsefulStyleProperties.has(normalizedProperty) || isBorderProperty)
    && !/(?:expression|url)\s*\(|(?:java|vb)script\s*:|@import|behavior\s*:/i.test(normalizedValue);
}

export function getMicrosoftWordClipboardHtml(clipboardData: DataTransfer) {
  const plainText = clipboardData.getData('text/plain').trim();
  const html = clipboardData.getData('text/html');
  return plainText && isMicrosoftWordClipboardHtml(html) ? html : '';
}

export function sanitizeMicrosoftWordClipboardHtml(html: string) {
  const template = document.createElement('template');
  template.innerHTML = html;
  applyUsefulWordClipboardStyleRules(template.content);
  removeClipboardComments(template.content);

  Array.from(template.content.querySelectorAll('*')).forEach((element) => {
    if (getWordClipboardElementAction(element.tagName) === 'remove') element.remove();
  });

  Array.from(template.content.querySelectorAll('*')).reverse().forEach((element) => {
    const action = getWordClipboardElementAction(element.tagName);
    if (action === 'unwrap') {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }
    if (action === 'keep') sanitizeWordClipboardElementAttributes(element);
  });

  return template.innerHTML.trim();
}

export function clipboardPlainTextToRichHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r\n?/g, '\n')
    .replace(/\n/g, '<br>');
}

export function getClipboardImageFile(clipboardData: DataTransfer) {
  // Word and other rich-text editors can expose the same copied selection as
  // both text and a generated image preview. Preserve the user's text paste in
  // that case, and only open the image flow for an image-only clipboard.
  if (clipboardData.getData('text/plain').trim()) {
    return null;
  }

  const file = Array.from(clipboardData.files).find((item) => item.type.startsWith('image/'));

  if (file) {
    return file;
  }

  const imageItem = Array.from(clipboardData.items).find((item) => item.kind === 'file' && item.type.startsWith('image/'));

  return imageItem?.getAsFile() ?? null;
}

function removeClipboardComments(node: Node) {
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === 8) {
      child.remove();
      return;
    }
    removeClipboardComments(child);
  });
}

function sanitizeWordClipboardElementAttributes(element: Element) {
  const tagName = element.tagName.toLowerCase();
  const styledElement = element instanceof HTMLElement ? element : null;
  const href = tagName === 'a' ? getSafeClipboardHref(element.getAttribute('href')) : '';
  const language = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(element.getAttribute('lang') ?? '')
    ? element.getAttribute('lang')
    : null;
  const direction = /^(?:auto|ltr|rtl)$/i.test(element.getAttribute('dir') ?? '')
    ? element.getAttribute('dir')?.toLowerCase() ?? null
    : null;
  const horizontalAlignment = /^(?:center|justify|left|right)$/i.test(element.getAttribute('align') ?? '')
    ? element.getAttribute('align')?.toLowerCase() ?? null
    : null;
  const verticalAlignment = /^(?:baseline|bottom|middle|top)$/i.test(element.getAttribute('valign') ?? '')
    ? element.getAttribute('valign')?.toLowerCase() ?? null
    : null;
  const fontColor = tagName === 'font' ? element.getAttribute('color')?.trim() ?? '' : '';
  const fontFace = tagName === 'font' ? element.getAttribute('face')?.trim() ?? '' : '';
  const fontSize = tagName === 'font' ? element.getAttribute('size')?.trim() ?? '' : '';
  const colspan = /^(?:[2-9]|\d{2})$/.test(element.getAttribute('colspan') ?? '')
    ? element.getAttribute('colspan')
    : null;
  const rowspan = /^(?:[2-9]|\d{2})$/.test(element.getAttribute('rowspan') ?? '')
    ? element.getAttribute('rowspan')
    : null;
  const listStart = /^-?\d+$/.test(element.getAttribute('start') ?? '')
    ? element.getAttribute('start')
    : null;
  const usefulStyles = Array.from(styledElement?.style ?? []).flatMap((property) => {
    const value = styledElement?.style.getPropertyValue(property) ?? '';
    return isUsefulMicrosoftWordClipboardStyle(property, value)
      ? [{ property, value }]
      : [];
  });

  Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name));

  usefulStyles.forEach(({ property, value }) => styledElement?.style.setProperty(property, value));
  if (href) element.setAttribute('href', href);
  if (language) element.setAttribute('lang', language);
  if (direction) element.setAttribute('dir', direction);
  if (horizontalAlignment && !styledElement?.style.textAlign) {
    styledElement?.style.setProperty('text-align', horizontalAlignment);
  }
  if (verticalAlignment && !styledElement?.style.verticalAlign) {
    styledElement?.style.setProperty('vertical-align', verticalAlignment);
  }
  if (tagName === 'font' && isSafeLegacyFontAttribute(fontColor)) element.setAttribute('color', fontColor);
  if (tagName === 'font' && isSafeLegacyFontAttribute(fontFace)) element.setAttribute('face', fontFace);
  if (tagName === 'font' && /^[+-]?[1-7]$/.test(fontSize)) element.setAttribute('size', fontSize);
  if ((tagName === 'td' || tagName === 'th') && colspan) element.setAttribute('colspan', colspan);
  if ((tagName === 'td' || tagName === 'th') && rowspan) element.setAttribute('rowspan', rowspan);
  if (tagName === 'ol' && listStart) element.setAttribute('start', listStart);

  if (tagName === 'a' && !href) {
    element.replaceWith(...Array.from(element.childNodes));
    return;
  }

  if ((tagName === 'div' || tagName === 'font' || tagName === 'span') && element.attributes.length === 0) {
    element.replaceWith(...Array.from(element.childNodes));
  }
}

function getSafeClipboardHref(value: string | null) {
  const href = value?.trim() ?? '';
  return /^(?:https?:|mailto:|\/|#)/i.test(href) ? href : '';
}

function isSafeLegacyFontAttribute(value: string) {
  return Boolean(value) && !/[<>`]|(?:expression|url)\s*\(|(?:java|vb)script\s*:/i.test(value);
}

function applyUsefulWordClipboardStyleRules(content: DocumentFragment) {
  const originalInlineProperties = new WeakMap<HTMLElement, Set<string>>();
  content.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
    originalInlineProperties.set(element, new Set(Array.from(element.style)));
  });

  content.querySelectorAll('style').forEach((styleElement) => {
    try {
      const styleSheet = new CSSStyleSheet();
      styleSheet.replaceSync(styleElement.textContent ?? '');
      Array.from(styleSheet.cssRules).forEach((rule) => {
        if (!(rule instanceof CSSStyleRule)) return;

        let matchedElements: NodeListOf<HTMLElement>;
        try {
          matchedElements = content.querySelectorAll<HTMLElement>(rule.selectorText);
        } catch {
          return;
        }

        matchedElements.forEach((element) => {
          const originalProperties = originalInlineProperties.get(element) ?? new Set<string>();
          Array.from(rule.style).forEach((property) => {
            const value = rule.style.getPropertyValue(property);
            if (
              !originalProperties.has(property)
              && isUsefulMicrosoftWordClipboardStyle(property, value)
            ) {
              element.style.setProperty(property, value);
            }
          });
        });
      });
    } catch {
      // Inline Word styles are still preserved when standalone CSS parsing is unavailable.
    }
  });
}
