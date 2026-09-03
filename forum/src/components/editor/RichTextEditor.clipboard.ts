const wordClipboardAllowedTags = new Set([
  'a', 'b', 'blockquote', 'br', 'code', 'del', 'em', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'hr', 'i', 'li', 'ol', 'p', 'pre', 's', 'strike',
  'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead',
  'tr', 'u', 'ul',
]);
const wordClipboardRemovedTags = new Set([
  'button', 'canvas', 'embed', 'form', 'iframe', 'img', 'input', 'link',
  'meta', 'object', 'script', 'select', 'style', 'svg', 'template', 'textarea',
  'title', 'xml',
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

export function getMicrosoftWordClipboardHtml(clipboardData: DataTransfer) {
  const plainText = clipboardData.getData('text/plain').trim();
  const html = clipboardData.getData('text/html');
  return plainText && isMicrosoftWordClipboardHtml(html) ? html : '';
}

export function sanitizeMicrosoftWordClipboardHtml(html: string) {
  const template = document.createElement('template');
  template.innerHTML = html;
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
  const href = tagName === 'a' ? getSafeClipboardHref(element.getAttribute('href')) : '';
  const colspan = /^(?:[2-9]|\d{2})$/.test(element.getAttribute('colspan') ?? '')
    ? element.getAttribute('colspan')
    : null;
  const rowspan = /^(?:[2-9]|\d{2})$/.test(element.getAttribute('rowspan') ?? '')
    ? element.getAttribute('rowspan')
    : null;
  const listStart = /^-?\d+$/.test(element.getAttribute('start') ?? '')
    ? element.getAttribute('start')
    : null;

  Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name));

  if (href) element.setAttribute('href', href);
  if ((tagName === 'td' || tagName === 'th') && colspan) element.setAttribute('colspan', colspan);
  if ((tagName === 'td' || tagName === 'th') && rowspan) element.setAttribute('rowspan', rowspan);
  if (tagName === 'ol' && listStart) element.setAttribute('start', listStart);

  if (tagName === 'a' && !href) {
    element.replaceWith(...Array.from(element.childNodes));
  }
}

function getSafeClipboardHref(value: string | null) {
  const href = value?.trim() ?? '';
  return /^(?:https?:|mailto:|\/|#)/i.test(href) ? href : '';
}
