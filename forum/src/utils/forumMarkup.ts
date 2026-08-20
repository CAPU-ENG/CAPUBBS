import { getPublicProfilePath } from './userRoutes';

const PUBLIC_ASSET_ORIGIN = 'https://chexie.net';
const BLOCKED_TAGS = new Set([
  'BASE', 'BUTTON', 'EMBED', 'FORM', 'IFRAME', 'INPUT', 'LINK', 'META',
  'OBJECT', 'SCRIPT', 'STYLE', 'SVG', 'TEMPLATE',
]);
const ALLOWED_TAGS = new Set([
  'A', 'ABBR', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'DIV', 'EM',
  'FIGCAPTION', 'FIGURE', 'FONT', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'HR', 'I', 'IMG', 'KBD', 'LI', 'MARK', 'OL', 'P', 'PRE', 'S', 'SPAN',
  'STRONG', 'SUB', 'SUP', 'TABLE', 'TBODY', 'TD', 'TH', 'THEAD', 'TR',
  'U', 'UL',
]);
const ALLOWED_CLASSES = new Set([
  'capubbs-floor-quote',
  'capubbs-floor-quote-content',
  'capubbs-floor-quote-jump',
  'capubbs-floor-quote-meta',
  'capubbs-code-shell',
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
  return translateLegacyBbcode(value);
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

export function forumMarkupToPlainText(value: string) {
  if (!value.trim()) return '';
  const parser = new DOMParser();
  const document = parser.parseFromString(value, 'text/html');
  return (document.body.textContent ?? '').replace(/\s+/g, ' ').trim();
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
  Array.from(element.attributes).forEach((attribute) => {
    if (!isAllowedAttribute(element, attribute.name.toLowerCase())) {
      element.removeAttribute(attribute.name);
    }
  });

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
  if (element.tagName === 'A') return ['href', 'target'].includes(name);
  if (element.tagName === 'IMG') return ['alt', 'height', 'loading', 'src', 'width'].includes(name);
  if (element.tagName === 'FONT') return ['color', 'face', 'size'].includes(name);
  if (['TD', 'TH'].includes(element.tagName)) return ['colspan', 'rowspan'].includes(name);
  return false;
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
  const src = normalizeForumAssetUrl(image.getAttribute('src'));
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

function normalizeForumAssetUrl(value: string | null) {
  if (!value) return '';
  const path = value.trim();
  if (!path) return '';
  if (/^data:image\/(?:avif|gif|jpeg|png|webp);/i.test(path)) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('//')) return `https:${path}`;
  if (path.startsWith('/')) return `${PUBLIC_ASSET_ORIGIN}${path}`;

  const legacyImage = path.match(/^(?:(?:\.\.\/)+)?images\/([^\s]+)$/i);
  if (legacyImage) return `${PUBLIC_ASSET_ORIGIN}/bbs/images/${legacyImage[1]}`;
  if (/^\d+$/.test(path)) return `${PUBLIC_ASSET_ORIGIN}/bbsimg/i/${path}.gif`;

  try {
    return new URL(path, `${PUBLIC_ASSET_ORIGIN}/bbs/content/`).href;
  } catch {
    return '';
  }
}

function translateLegacyBbcode(value: string) {
  let html = value;
  const replacements: Array<[RegExp, (...matches: string[]) => string]> = [
    [/\[quote=([^\]]+)]([\s\S]*?)\[\/quote]/gi, (_match, author, content) => (
      `<blockquote class="forum-legacy-quote"><div class="forum-legacy-quote-content">`
      + `引用自 <a class="forum-mention" href="${escapeHtmlAttribute(getPublicProfilePath(forumMarkupToPlainText(author)))}">`
      + `${escapeHtml(forumMarkupToPlainText(author))}</a>：<br>${content}</div></blockquote>`
    )],
    [/\[quote]([\s\S]*?)\[\/quote]/gi, (_match, content) => `<blockquote class="forum-legacy-quote">${content}</blockquote>`],
    [/\[url=([^\]]+)]([\s\S]*?)\[\/url]/gi, (_match, href, content) => `<a class="forum-link" href="${escapeHtmlAttribute(href)}">${content}</a>`],
    [/\[url]([\s\S]*?)\[\/url]/gi, (_match, href) => `<a class="forum-link" href="${escapeHtmlAttribute(forumMarkupToPlainText(href))}">${href}</a>`],
    [/\[img]([\s\S]*?)\[\/img]/gi, (_match, src) => `<img src="${escapeHtmlAttribute(forumMarkupToPlainText(src))}" alt="">`],
    [/\[at]([\s\S]*?)\[\/at]/gi, (_match, name) => {
      const plainName = forumMarkupToPlainText(name);
      return `<a class="forum-mention" href="${escapeHtmlAttribute(getPublicProfilePath(plainName))}">@${escapeHtml(plainName)}</a>`;
    }],
    [/\[color=([^\]]+)]([\s\S]*?)\[\/color]/gi, (_match, color, content) => `<font color="${escapeHtmlAttribute(color)}">${content}</font>`],
    [/\[font=([^\]]+)]([\s\S]*?)\[\/font]/gi, (_match, face, content) => `<font face="${escapeHtmlAttribute(face)}">${content}</font>`],
    [/\[size=([^\]]+)]([\s\S]*?)\[\/size]/gi, (_match, size, content) => `<font size="${escapeHtmlAttribute(size)}">${content}</font>`],
    [/\[b]([\s\S]*?)\[\/b]/gi, (_match, content) => `<strong>${content}</strong>`],
    [/\[i]([\s\S]*?)\[\/i]/gi, (_match, content) => `<em>${content}</em>`],
    [/\[u]([\s\S]*?)\[\/u]/gi, (_match, content) => `<u>${content}</u>`],
    [/\[s]([\s\S]*?)\[\/s]/gi, (_match, content) => `<s>${content}</s>`],
  ];

  for (let pass = 0; pass < 4; pass += 1) {
    const before = html;
    replacements.forEach(([pattern, replace]) => {
      html = html.replace(pattern, replace);
    });
    if (html === before) break;
  }
  return html;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character] ?? character);
}

function escapeHtmlAttribute(value: string) {
  return escapeHtml(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
