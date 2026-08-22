import { getPublicProfilePath } from './userRoutes';
import { translateLegacyForumThreadHref } from './legacyForumRoutes';
import { translateLegacyBbcode } from './legacyBbcode';
import { localizeChexieImageRequests, normalizeLegacyPostImage } from './legacyAssets';

export { forumMarkupToPlainText } from './legacyBbcode';

const PUBLIC_ASSET_ORIGIN = 'https://chexie.net';
// Legacy posts use arbitrary HTML for layout. Keep the deny list focused on active document content.
const BLACKLISTED_TAGS = new Set([
  'BASE', 'BUTTON', 'EMBED', 'FORM', 'IFRAME', 'INPUT', 'LINK', 'META',
  'OBJECT', 'SCRIPT', 'STYLE', 'SVG', 'TEMPLATE',
]);
const BLACKLISTED_ATTRIBUTE_NAMES = new Set(['formaction', 'srcdoc']);
const URL_ATTRIBUTE_NAMES = new Set([
  'action', 'background', 'cite', 'data', 'formaction', 'href', 'manifest', 'ping',
  'poster', 'src', 'srcset', 'usemap', 'xlink:href',
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
  if (BLACKLISTED_TAGS.has(element.tagName)) {
    element.remove();
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
    if (isBlacklistedAttribute(attribute.name.toLowerCase(), attribute.value)) {
      element.removeAttribute(attribute.name);
    }
  });

  if (element instanceof HTMLAnchorElement) sanitizeAnchor(element);
  if (element instanceof HTMLImageElement) sanitizeImage(element);
}

function normalizeLegacyClasses(element: Element) {
  const normalized = Array.from(element.classList).map((className) => {
    if (className === 'quotel') return 'forum-legacy-quote';
    if (className === 'quoter') return 'forum-legacy-quote-content';
    if (className === 'author') return 'forum-mention';
    if (className === 'link') return 'forum-link';
    return className;
  });

  if (normalized.length > 0) element.setAttribute('class', Array.from(new Set(normalized)).join(' '));
  else element.removeAttribute('class');
}

function isBlacklistedAttribute(name: string, value: string) {
  if (BLACKLISTED_ATTRIBUTE_NAMES.has(name) || /^on(?:[a-z]|$)/i.test(name)) return true;
  return URL_ATTRIBUTE_NAMES.has(name) && isDangerousUrl(value);
}

function isDangerousUrl(value: string) {
  const normalized = value.trim();
  return /^(?:javascript|vbscript):/i.test(normalized)
    || /^data\s*:\s*(?:text\/html|application\/xhtml\+xml|image\/svg\+xml)/i.test(normalized);
}

function sanitizeAnchor(anchor: HTMLAnchorElement) {
  const rawHref = anchor.getAttribute('href')?.trim() ?? '';
  const legacyProfileName = getLegacyProfileName(rawHref, anchor.classList.contains('forum-mention'));
  const href = translateLegacyForumThreadHref(rawHref)
    || (legacyProfileName ? getPublicProfilePath(legacyProfileName) : rawHref);
  if (!href || isDangerousUrl(href)) {
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
  const rawSrc = image.getAttribute('src')?.trim() ?? '';
  const normalizedSrc = normalizeLegacyPostImage(rawSrc);
  const src = normalizedSrc || rawSrc;
  if (!src || isDangerousUrl(src)) {
    image.remove();
    return;
  }

  image.setAttribute('src', src);
  image.setAttribute('loading', 'lazy');
  image.setAttribute('role', 'button');
  image.setAttribute('tabindex', '0');
  image.setAttribute('aria-label', image.alt.trim() ? `查看大图：${image.alt.trim()}` : '查看大图');
  if (!image.title) image.setAttribute('title', '点击查看大图');
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
