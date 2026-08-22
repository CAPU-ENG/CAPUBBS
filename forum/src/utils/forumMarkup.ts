import { getPublicProfilePath } from './userRoutes';
import { translateLegacyForumThreadHref } from './legacyForumRoutes';
import { translateLegacyBbcode } from './legacyBbcode';
import { localizeChexieImageRequests, normalizeLegacyPostImage } from './legacyAssets';

export { forumMarkupToPlainText } from './legacyBbcode';

const PUBLIC_ASSET_ORIGIN = 'https://chexie.net';
const BLOCKED_TAGS = new Set([
  'BASE', 'BUTTON', 'EMBED', 'FORM', 'IFRAME', 'INPUT', 'LINK', 'META',
  'OBJECT', 'SCRIPT', 'STYLE', 'SVG', 'TEMPLATE',
]);
const ALLOWED_TAGS = new Set([
  'A', 'ABBR', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'DIV', 'EM',
  'FIGCAPTION', 'FIGURE', 'FONT', 'FOOTER', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'HEADER', 'HR', 'I', 'IMG', 'KBD', 'LI', 'MARK', 'OL', 'P', 'PRE', 'S', 'SPAN',
  'STRONG', 'SUB', 'SUP', 'TABLE', 'TBODY', 'TD', 'TH', 'THEAD', 'TR',
  'U', 'UL',
]);
const ALIGNABLE_TAGS = new Set([
  'BLOCKQUOTE', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'P', 'PRE',
  'TABLE', 'TD', 'TH', 'IMG',
]);
const ALLOWED_TEXT_ALIGNMENTS = new Set(['center', 'justify', 'left', 'right']);
const VERTICAL_ALIGNABLE_TAGS = new Set(['TD', 'TH']);
const INLINE_STYLE_TAGS = new Set(ALLOWED_TAGS);
const INLINE_STYLE_PROPERTIES = [
  'background-color', 'color', 'font-family', 'font-size', 'font-style', 'font-weight',
  'line-height', 'text-align', 'text-decoration', 'text-indent', 'vertical-align', 'white-space',
] as const;
const LEGACY_DIMENSION_TAGS = new Set(['TABLE', 'TD', 'TH']);
const LEGACY_COLOR_TAGS = new Set([
  'BLOCKQUOTE', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'P', 'PRE',
  'TABLE', 'TD', 'TH',
]);
const TEXT_DIRECTION_TAGS = new Set([
  'BLOCKQUOTE', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'P', 'PRE',
]);
const ALLOWED_CLASSES = new Set([
  'capubbs-floor-quote',
  'capubbs-floor-quote-content',
  'capubbs-floor-quote-jump',
  'capubbs-floor-quote-meta',
  'capubbs-code-shell',
  'capubbs-gallery',
  'capubbs-gallery-caption',
  'capubbs-gallery-captions',
  'capubbs-gallery-count',
  'capubbs-gallery-footer',
  'capubbs-gallery-header',
  'capubbs-gallery-nav',
  'capubbs-gallery-nav-next',
  'capubbs-gallery-nav-prev',
  'capubbs-gallery-slide',
  'capubbs-gallery-stage',
  'capubbs-gallery-title',
  'forum-quote',
  'forum-legacy-quote',
  'forum-legacy-quote-content',
  'forum-link',
  'forum-mention',
]);

declare const safeForumHtmlBrand: unique symbol;
export type SafeForumHtml = string & { readonly [safeForumHtmlBrand]: true };

export function renderForumMarkup(
  value: string,
  options: { normalizeLegacyLineBreaks?: boolean } = {},
): SafeForumHtml {
  if (!value.trim()) return '' as SafeForumHtml;

  const parser = new DOMParser();
  const source = options.normalizeLegacyLineBreaks ? normalizeLegacyLineBreaks(value) : value;
  const document = parser.parseFromString(translateLegacyBbcode(source), 'text/html');
  const elements = Array.from(document.body.querySelectorAll('*'));

  elements.forEach((element) => sanitizeElement(element));
  return document.body.innerHTML as SafeForumHtml;
}

export function translateLegacyForumMarkup(value: string) {
  return localizeChexieImageRequests(translateLegacyBbcode(value));
}

const ISOLATED_HTML_TAG_PATTERN = /<\s*\/?\s*(?:script|style|link|meta|base|iframe|frame|frameset|object|embed|audio|video|canvas|svg|math|form|input|textarea|select|button|option)\b/i;
const ISOLATED_HTML_ACTIVE_ATTRIBUTE_PATTERN = /\s(?:on[a-z][\w:-]*|srcdoc)\s*=/i;
const ISOLATED_HTML_STYLE_ATTRIBUTE_PATTERN = /\sstyle\s*=/i;
const ISOLATED_HTML_URL_PATTERN = /\b(?:href|action|formaction)\s*=\s*(?:"\s*(?:javascript|data):|'\s*(?:javascript|data):|(?:javascript|data):)/i;
const ISOLATED_HTML_DOCUMENT_PATTERN = /<\s*(?:!doctype|html|head|body)\b/i;
const DIRECT_RICH_TEXT_TAG_PATTERN = /<(?:a|abbr|b|blockquote|br|code|del|div|em|figcaption|figure|font|h[1-6]?|hr|i|img|kbd|li|mark|ol|p|pre|s|span|strong|sub|sup|table|tbody|td|th|thead|tr|u|ul)\b[^>]*>/gi;

export function requiresIsolatedForumHtml(value: string) {
  const contentWithoutDirectRichTextTags = value.replace(DIRECT_RICH_TEXT_TAG_PATTERN, '');

  return ISOLATED_HTML_TAG_PATTERN.test(value)
    || ISOLATED_HTML_ACTIVE_ATTRIBUTE_PATTERN.test(value)
    || ISOLATED_HTML_STYLE_ATTRIBUTE_PATTERN.test(contentWithoutDirectRichTextTags)
    || ISOLATED_HTML_URL_PATTERN.test(value)
    || ISOLATED_HTML_DOCUMENT_PATTERN.test(value);
}

function normalizeLegacyLineBreaks(value: string) {
  const normalized = value.replace(/(?:<br\s*\/?>\s*){2,}/gi, (sequence) => {
    const breakCount = sequence.match(/<br\b/gi)?.length ?? 1;
    return '<br>'.repeat(Math.ceil(breakCount / 2));
  });
  return normalized.replace(/(?:<br\s*\/?>\s*)+$/gi, '');
}

function sanitizeElement(element: Element) {
  if (BLOCKED_TAGS.has(element.tagName)) {
    element.remove();
    return;
  }
  if (!ALLOWED_TAGS.has(element.tagName)) {
    element.replaceWith(...Array.from(element.childNodes));
    return;
  }

  normalizeLegacyClasses(element);
  if (
    element.getAttribute('data-capubbs-gallery-edit') === 'true'
    || element.getAttribute('data-capubbs-gallery-resize') === 'true'
  ) {
    element.remove();
    return;
  }

  Array.from(element.attributes).forEach((attribute) => {
    if (!isAllowedAttribute(element, attribute.name.toLowerCase())) {
      element.removeAttribute(attribute.name);
    }
  });

  if (element.classList.contains('capubbs-gallery')) sanitizeGalleryStyle(element as HTMLElement);
  else if (element.hasAttribute('style')) sanitizeInlineStyle(element);
  sanitizeLegacyPresentationAttributes(element);
  if (element instanceof HTMLAnchorElement) sanitizeAnchor(element);
  if (element instanceof HTMLImageElement) sanitizeImage(element);
  if (element.tagName === 'FONT') sanitizeFont(element);
}

function normalizeLegacyClasses(element: Element) {
  const normalized = Array.from(element.classList).map((className) => {
    if (className === 'quotel') return 'forum-legacy-quote';
    if (className === 'quoter') return 'forum-legacy-quote-content';
    if (className === 'author') return 'forum-mention';
    if (className === 'link') return 'forum-link';
    return className;
  }).filter((className) => ALLOWED_CLASSES.has(className));

  if (normalized.length > 0) element.setAttribute('class', Array.from(new Set(normalized)).join(' '));
  else element.removeAttribute('class');
}

function isAllowedAttribute(element: Element, name: string) {
  if (name === 'class' || name === 'title') return true;
  if (name === 'align') return ALIGNABLE_TAGS.has(element.tagName);
  if (name === 'valign') return VERTICAL_ALIGNABLE_TAGS.has(element.tagName);
  if (name === 'width' || name === 'height') {
    return element.tagName === 'IMG' || LEGACY_DIMENSION_TAGS.has(element.tagName);
  }
  if (name === 'bgcolor') return LEGACY_COLOR_TAGS.has(element.tagName);
  if (name === 'border') return element.tagName === 'TABLE' || element.tagName === 'IMG';
  if (name === 'cellpadding' || name === 'cellspacing') return element.tagName === 'TABLE';
  if (name === 'nowrap') return VERTICAL_ALIGNABLE_TAGS.has(element.tagName);
  if (name === 'dir') return TEXT_DIRECTION_TAGS.has(element.tagName);
  if (name === 'hspace' || name === 'vspace') return element.tagName === 'IMG';
  if (name === 'clear') return element.tagName === 'BR';
  if (name === 'noshade' || name === 'size') return element.tagName === 'HR';
  const isGalleryElement = Boolean(element.closest('.capubbs-gallery'));
  if (name === 'style') return element.classList.contains('capubbs-gallery') || INLINE_STYLE_TAGS.has(element.tagName);
  if (isGalleryElement && [
    'aria-hidden',
    'aria-label',
    'contenteditable',
    'data-capubbs-gallery-action',
    'data-capubbs-gallery-active',
    'data-capubbs-gallery-caption',
    'data-capubbs-gallery-current',
    'data-capubbs-gallery-index',
    'data-capubbs-gallery-slide',
    'data-capubbs-gallery-total',
    'role',
    'tabindex',
  ].includes(name)) return true;
  if (element.tagName === 'A') return ['href', 'target'].includes(name);
  if (element.tagName === 'IMG') return ['alt', 'height', 'loading', 'src', 'width'].includes(name);
  if (element.tagName === 'FONT') return ['color', 'face', 'size'].includes(name);
  if (['TD', 'TH'].includes(element.tagName)) return ['colspan', 'rowspan'].includes(name);
  return false;
}

function sanitizeLegacyPresentationAttributes(element: Element) {
  if (element.hasAttribute('align')) sanitizeTextAlignment(element);
  if (element.hasAttribute('valign')) sanitizeVerticalAlignment(element);
  if (element.tagName !== 'IMG' && element.hasAttribute('width')) sanitizeLegacyDimension(element, 'width');
  if (element.tagName !== 'IMG' && element.hasAttribute('height')) sanitizeLegacyDimension(element, 'height');
  if (element.hasAttribute('bgcolor')) sanitizeLegacyColor(element);
  if (element.hasAttribute('border')) sanitizeLegacyInteger(element, 'border', 20);
  if (element.hasAttribute('cellpadding')) sanitizeLegacyInteger(element, 'cellpadding', 100);
  if (element.hasAttribute('cellspacing')) sanitizeLegacyInteger(element, 'cellspacing', 100);
  if (element.hasAttribute('nowrap')) element.setAttribute('nowrap', '');
  if (element.hasAttribute('dir')) sanitizeTextDirection(element);
  if (element.hasAttribute('hspace')) sanitizeLegacyInteger(element, 'hspace', 100);
  if (element.hasAttribute('vspace')) sanitizeLegacyInteger(element, 'vspace', 100);
  if (element.hasAttribute('clear')) sanitizeClear(element);
  if (element.hasAttribute('noshade')) element.setAttribute('noshade', '');
  if (element.hasAttribute('size')) sanitizeLegacyInteger(element, 'size', 100);
}

function sanitizeTextAlignment(element: Element) {
  const alignment = element.getAttribute('align')?.trim().toLowerCase() ?? '';
  if (ALLOWED_TEXT_ALIGNMENTS.has(alignment)) element.setAttribute('align', alignment);
  else element.removeAttribute('align');
}

function sanitizeVerticalAlignment(element: Element) {
  const alignment = element.getAttribute('valign')?.trim().toLowerCase() ?? '';
  if (['baseline', 'bottom', 'middle', 'top'].includes(alignment)) element.setAttribute('valign', alignment);
  else element.removeAttribute('valign');
}

function sanitizeLegacyDimension(element: Element, attribute: 'height' | 'width') {
  const value = element.getAttribute(attribute)?.trim() ?? '';
  if (/^(?:\d{1,4}(?:\.\d+)?%?|auto)$/i.test(value)) element.setAttribute(attribute, value.toLowerCase());
  else element.removeAttribute(attribute);
}

function sanitizeLegacyColor(element: Element) {
  const color = element.getAttribute('bgcolor')?.trim() ?? '';
  if (/^(?:#[0-9a-f]{3,8}|[a-z]{1,32})$/i.test(color)) element.setAttribute('bgcolor', color);
  else element.removeAttribute('bgcolor');
}

function sanitizeLegacyInteger(element: Element, attribute: string, maximum: number) {
  const rawValue = element.getAttribute(attribute)?.trim() ?? '';
  const value = Number.parseInt(rawValue, 10);
  if (/^\d+$/.test(rawValue) && Number.isInteger(value) && value <= maximum) element.setAttribute(attribute, String(value));
  else element.removeAttribute(attribute);
}

function sanitizeTextDirection(element: Element) {
  const direction = element.getAttribute('dir')?.trim().toLowerCase() ?? '';
  if (['auto', 'ltr', 'rtl'].includes(direction)) element.setAttribute('dir', direction);
  else element.removeAttribute('dir');
}

function sanitizeClear(element: Element) {
  const clear = element.getAttribute('clear')?.trim().toLowerCase() ?? '';
  if (['all', 'left', 'none', 'right'].includes(clear)) element.setAttribute('clear', clear);
  else element.removeAttribute('clear');
}

function sanitizeInlineStyle(element: Element) {
  const rawStyle = element.getAttribute('style')?.trim() ?? '';
  if (!rawStyle) {
    element.removeAttribute('style');
    return;
  }

  const parsedStyle = document.createElement('span').style;
  parsedStyle.cssText = rawStyle;
  const declarations: string[] = [];

  INLINE_STYLE_PROPERTIES.forEach((property) => {
    const value = parsedStyle.getPropertyValue(property).trim();
    if (value && isAllowedInlineStyleValue(element, property, value)) declarations.push(`${property}: ${value}`);
  });

  if (declarations.length > 0) element.setAttribute('style', declarations.join('; '));
  else element.removeAttribute('style');
}

function isAllowedInlineStyleValue(
  element: Element,
  property: (typeof INLINE_STYLE_PROPERTIES)[number],
  value: string,
) {
  if (value.length > 200 || /[{}<>]|!important|(?:url|expression|javascript)\s*\(/i.test(value)) return false;

  switch (property) {
    case 'background-color':
    case 'color':
      return isSafeCssColor(value);
    case 'font-family':
      return /^[^;{}<>]+$/.test(value);
    case 'font-size':
      return /^(?:xx-small|x-small|small|medium|large|x-large|xx-large|larger|smaller|-?(?:\d+(?:\.\d+)?)(?:px|pt|pc|em|rem|ex|ch|vw|vh|vmin|vmax|%)?)$/i.test(value);
    case 'font-style':
      return /^(?:normal|italic|oblique)$/i.test(value);
    case 'font-weight':
      return /^(?:normal|bold|bolder|lighter|[1-9]00)$/i.test(value);
    case 'line-height':
      return /^(?:normal|(?:\d+(?:\.\d+)?)(?:px|pt|pc|em|rem|ex|ch|vw|vh|vmin|vmax|%)?)$/i.test(value);
    case 'text-align':
      return ALIGNABLE_TAGS.has(element.tagName) && ALLOWED_TEXT_ALIGNMENTS.has(value.toLowerCase());
    case 'text-decoration':
      return /^(?:none|underline|overline|line-through)$/i.test(value);
    case 'text-indent':
      return /^-?(?:\d+(?:\.\d+)?)(?:px|pt|pc|em|rem|ex|ch|vw|vh|vmin|vmax|%)$/i.test(value);
    case 'vertical-align':
      return (VERTICAL_ALIGNABLE_TAGS.has(element.tagName) || element.tagName === 'IMG')
        && /^(?:baseline|bottom|middle|sub|super|text-bottom|text-top|top)$/i.test(value);
    case 'white-space':
      return /^(?:normal|nowrap|pre|pre-line|pre-wrap|break-spaces)$/i.test(value);
    default:
      return false;
  }
}

function isSafeCssColor(value: string) {
  return /^(?:#[0-9a-f]{3,8}|(?:rgb|rgba|hsl|hsla)\([^)]{1,96}\)|[a-z]{1,32})$/i.test(value);
}

function sanitizeGalleryStyle(gallery: HTMLElement) {
  const rawStyle = gallery.getAttribute('style')?.trim() ?? '';
  const heightMatch = rawStyle.match(/^--capubbs-gallery-image-height:\s*(\d+(?:\.\d+)?)px;?$/i);
  const height = Number.parseFloat(heightMatch?.[1] ?? '');

  if (!Number.isFinite(height) || height < 160 || height > 1200) {
    gallery.removeAttribute('style');
    return;
  }

  gallery.setAttribute('style', `--capubbs-gallery-image-height: ${Math.round(height)}px`);
}

function sanitizeAnchor(anchor: HTMLAnchorElement) {
  const href = normalizeForumLink(anchor.getAttribute('href') ?? '', anchor.classList.contains('forum-mention'));
  if (!href) {
    anchor.removeAttribute('href');
    anchor.removeAttribute('target');
    return;
  }

  anchor.setAttribute('href', href);
  anchor.setAttribute('rel', 'noopener noreferrer');
  if (/^https?:\/\//i.test(href)) anchor.setAttribute('target', '_blank');
  else anchor.removeAttribute('target');
}

function sanitizeImage(image: HTMLImageElement) {
  const src = normalizeLegacyPostImage(image.getAttribute('src'));
  if (!src) {
    image.remove();
    return;
  }

  image.setAttribute('src', src);
  image.setAttribute('loading', 'lazy');
  image.setAttribute('role', 'button');
  image.setAttribute('tabindex', '0');
  image.setAttribute('aria-label', image.alt.trim() ? `查看大图：${image.alt.trim()}` : '查看大图');
  if (!image.title) image.setAttribute('title', '点击查看大图');
  sanitizeDimension(image, 'width');
  sanitizeDimension(image, 'height');
}

function sanitizeDimension(image: HTMLImageElement, attribute: 'height' | 'width') {
  const rawValue = image.getAttribute(attribute);
  if (!rawValue) return;
  const value = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(value) || value <= 0 || value > 4096) image.removeAttribute(attribute);
  else image.setAttribute(attribute, String(value));
}

function sanitizeFont(element: Element) {
  const color = element.getAttribute('color')?.trim() ?? '';
  const face = element.getAttribute('face')?.trim() ?? '';
  const size = Number.parseInt(element.getAttribute('size') ?? '', 10);

  if (!/^(?:#[0-9a-f]{3,8}|[a-z]{1,24})$/i.test(color)) element.removeAttribute('color');
  if (!/^[\p{L}\p{N}_\-\s,"']{1,80}$/u.test(face)) element.removeAttribute('face');
  if (!Number.isFinite(size) || size < 1 || size > 7) element.removeAttribute('size');
  else element.setAttribute('size', String(size));
}

function normalizeForumLink(value: string, isMention: boolean) {
  const href = value.trim();
  if (!href) return '';

  const legacyThreadHref = translateLegacyForumThreadHref(href);
  if (legacyThreadHref) return legacyThreadHref;
  const legacyProfileName = getLegacyProfileName(href, isMention);
  if (legacyProfileName) return getPublicProfilePath(legacyProfileName);
  if (/^mailto:[^\s@]+@[^\s@]+$/i.test(href)) return href;
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('//')) return `https:${href}`;
  if (/^www\./i.test(href)) return `https://${href}`;
  if (href.startsWith('#') || href.startsWith('?') || href.startsWith('/')) return href;

  if (/^(?:\.\.\/|\.\/)/.test(href)) {
    try {
      const resolved = new URL(href, `${PUBLIC_ASSET_ORIGIN}/bbs/content/`);
      return `${resolved.pathname}${resolved.search}${resolved.hash}`;
    } catch {
      return '';
    }
  }
  return '';
}

function getLegacyProfileName(href: string, isMention: boolean) {
  try {
    const resolved = new URL(href, `${PUBLIC_ASSET_ORIGIN}/bbs/content/`);
    const legacyUser = resolved.searchParams.get('user')?.trim()
      || resolved.searchParams.get('view')?.trim();
    if (legacyUser && /\/bbs\/(?:home|user)\/?$/i.test(resolved.pathname)) return legacyUser;
    return isMention ? resolved.searchParams.get('name')?.trim() ?? '' : '';
  } catch {
    return '';
  }
}
