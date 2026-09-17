export type RichImageTextAlign = 'top' | 'center' | 'bottom';

const layoutSelector = '[data-capubbs-image-layout]';
const mediaSelector = '[data-capubbs-image-media]';
const textSelector = '[data-capubbs-image-text]';
const boundarySelector = 'img, hr, figure, table, blockquote, h1, h2, h3, h4, h5, h6, script, style, iframe, video, audio, .capubbs-gallery, [data-capubbs-image-layout]';

export function getRichImageLayout(image: HTMLImageElement) {
  const media = image.closest?.<HTMLElement>(mediaSelector);
  const layout = media?.parentElement;
  return layout?.matches(layoutSelector) ? layout : null;
}

export function getRichImageTextAlign(image: HTMLImageElement): RichImageTextAlign {
  const alignment = getRichImageLayout(image)?.getAttribute('data-capubbs-image-layout');
  return alignment === 'center' || alignment === 'bottom' ? alignment : 'top';
}

export function getRichImageWidthTarget(image: HTMLImageElement): HTMLElement {
  return getRichImageLayout(image)?.querySelector<HTMLElement>(`:scope > ${mediaSelector}`) ?? image;
}

export function getRichImageLayoutScope(editor: HTMLElement, image: HTMLImageElement) {
  const scope = getRichImageLayout(image)
    ?? image.parentElement?.closest<HTMLElement>('div, li, td, th, blockquote, section, article');
  return scope && editor.contains(scope) ? scope : editor;
}

// These styles are stored with the content so drafts, previews and published HTML
// use the same layout without a script, fixed image height or viewport measurements.
export function syncRichImageLayout(image: HTMLImageElement, side: 'left' | 'right') {
  const layout = getRichImageLayout(image);
  if (!layout) return;
  layout.style.flexDirection = side === 'right' ? 'row-reverse' : 'row';
  image.setAttribute('data-capubbs-image-wrap', side);
  image.style.cssFloat = 'none';
  image.style.margin = '0';
  image.style.width = '100%';
  image.style.maxWidth = '100%';
  image.style.height = 'auto';
  image.style.display = 'block';
}

export function removeRichImageLayout(image: HTMLImageElement) {
  const layout = getRichImageLayout(image);
  if (!layout) return;
  const media = getRichImageWidthTarget(image);
  const text = layout.querySelector<HTMLElement>(`:scope > ${textSelector}`);
  if (!text) return;

  image.style.width = media.style.width;
  image.style.cssFloat = image.getAttribute('data-capubbs-image-wrap') === 'right' ? 'right' : 'left';
  const originalDisplay = layout.getAttribute('data-capubbs-image-display') ?? '';
  if (originalDisplay) image.style.display = originalDisplay;
  else image.style.removeProperty('display');

  const placeholder = text.querySelector('[data-capubbs-image-placeholder]');
  if (placeholder) placeholder.replaceWith(image);
  else text.prepend(image);
  text.querySelectorAll('[data-capubbs-image-empty]').forEach((element) => {
    element.removeAttribute('hidden');
    element.removeAttribute('data-capubbs-image-empty');
  });
  layout.replaceWith(...text.childNodes);
}

export function applyRichImageTextAlign(
  editor: HTMLElement,
  image: HTMLImageElement,
  alignment: RichImageTextAlign,
  side: 'left' | 'right',
  widthPercentage: number,
) {
  if (alignment === 'top') {
    removeRichImageLayout(image);
    return;
  }

  const layout = getRichImageLayout(image) ?? createRichImageLayout(editor, image, widthPercentage);
  layout.setAttribute('data-capubbs-image-layout', alignment);
  const text = layout.querySelector<HTMLElement>(`:scope > ${textSelector}`)!;
  // The image starts at the top. With taller text the row grows and both start
  // at the top; shorter text can align to the image's center or bottom.
  text.style.alignSelf = alignment === 'center' ? 'center' : 'flex-end';
  syncRichImageLayout(image, side);
}

function createRichImageLayout(editor: HTMLElement, image: HTMLImageElement, widthPercentage: number) {
  const scope = getRichImageLayoutScope(editor, image);
  const boundary = Array.from(scope.querySelectorAll(boundarySelector)).find((element) => (
    !element.contains(image)
    && Boolean(image.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)
  ));

  // Split paragraphs/inline formatting at both ends before moving the range.
  // This keeps preceding text, subsequent images and their formatting in place.
  const start = splitBefore(image, scope);
  const end = boundary ? splitBefore(boundary, scope) : null;
  const layout = document.createElement('div');
  layout.setAttribute('data-capubbs-image-layout', 'center');
  layout.setAttribute('data-capubbs-image-display', image.style.display);
  layout.style.cssText = 'display:flex;align-items:flex-start;gap:1em;margin:0 0 0.75em;';
  scope.insertBefore(layout, start);

  const placeholder = document.createElement('span');
  placeholder.setAttribute('data-capubbs-image-placeholder', 'true');
  placeholder.hidden = true;
  image.before(placeholder);

  const range = document.createRange();
  range.setStartBefore(start === image ? placeholder : start);
  if (end) range.setEndBefore(end);
  else range.setEnd(scope, scope.childNodes.length);
  const content = range.extractContents();

  const media = document.createElement('div');
  media.setAttribute('data-capubbs-image-media', 'true');
  media.setAttribute('contenteditable', 'false');
  media.style.cssText = `flex:0 0 auto;align-self:flex-start;width:${widthPercentage}%;max-width:calc(100% - 1em);margin:0;`;
  const text = document.createElement('div');
  text.setAttribute('data-capubbs-image-text', 'true');
  text.style.cssText = 'display:flow-root;flex:1 1 0%;min-width:0;margin:0;';
  text.append(content);

  // Keep a linked/formatted image linked while it is in its own column. The
  // original ancestors stay around the placeholder for lossless ungrouping.
  let mediaContent: Node = image;
  let ancestor = image.parentElement;
  while (ancestor && /^(A|SPAN|B|STRONG|I|EM|U|S|FONT)$/.test(ancestor.tagName)) {
    const clone = ancestor.cloneNode(false) as HTMLElement;
    clone.removeAttribute('id');
    clone.append(mediaContent);
    mediaContent = clone;
    ancestor = ancestor.parentElement;
  }
  media.append(mediaContent);
  for (let parent = placeholder.parentElement; parent && parent !== text; parent = parent.parentElement) {
    if (hasVisibleContent(parent)) break;
    if (!parent.hidden) {
      parent.hidden = true;
      parent.setAttribute('data-capubbs-image-empty', 'true');
    }
  }
  if (!hasVisibleContent(text)) {
    const paragraph = document.createElement('p');
    paragraph.append(document.createElement('br'));
    text.append(paragraph);
  }
  layout.append(media, text);
  return layout;
}

function hasVisibleContent(element: Element) {
  return Boolean(element.textContent?.trim() || element.querySelector('img, br, hr, video, audio, iframe, table'));
}

function splitBefore(node: Node, scope: HTMLElement) {
  let child = node;
  while (child.parentNode !== scope && child.parentNode) child = child.parentNode;
  if (child === node) return child;

  const range = document.createRange();
  range.setStartBefore(node);
  range.setEndAfter(child);
  const tail = range.extractContents();
  const first = tail.firstChild!;
  scope.insertBefore(tail, child.nextSibling);
  if (child instanceof HTMLElement && !hasVisibleContent(child)) child.remove();
  if (first instanceof HTMLElement && child instanceof HTMLElement && scope.contains(child)) {
    const retainedIds = new Set([child, ...child.querySelectorAll('[id]')].map((element) => element.id).filter(Boolean));
    [first, ...first.querySelectorAll('[id]')].forEach((element) => {
      if (retainedIds.has(element.id)) element.removeAttribute('id');
    });
  }
  return first;
}
