export const FORUM_CONTENT_FONT_SIZE_STORAGE_KEY = 'capubbs-forum-content-font-size';
export const FORUM_CONTENT_FONT_SIZE_CHANGE_EVENT = 'capubbs-forum-content-font-size-change';
export const FORUM_CONTENT_FONT_SIZE_OPTIONS = [13, 14, 15, 16, 17] as const;
export type ForumContentFontSize = (typeof FORUM_CONTENT_FONT_SIZE_OPTIONS)[number];
export const FORUM_DEFAULT_FONT_SIZE_PIXELS: ForumContentFontSize = 15;
export const FORUM_DEFAULT_FONT_SIZE = `${FORUM_DEFAULT_FONT_SIZE_PIXELS}px`;

export function readForumContentFontSize(): ForumContentFontSize {
  if (typeof window === 'undefined') return FORUM_DEFAULT_FONT_SIZE_PIXELS;

  try {
    return normalizeForumContentFontSize(window.localStorage.getItem(FORUM_CONTENT_FONT_SIZE_STORAGE_KEY));
  } catch {
    return FORUM_DEFAULT_FONT_SIZE_PIXELS;
  }
}

export function applyForumContentFontSize(fontSize: ForumContentFontSize) {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--forum-content-font-size', `${fontSize}px`);
}

export function saveForumContentFontSize(fontSize: number) {
  if (typeof window === 'undefined' || !isForumContentFontSize(fontSize)) return false;

  try {
    window.localStorage.setItem(FORUM_CONTENT_FONT_SIZE_STORAGE_KEY, String(fontSize));
  } catch {
    return false;
  }

  applyForumContentFontSize(fontSize);
  window.dispatchEvent(new Event(FORUM_CONTENT_FONT_SIZE_CHANGE_EVENT));
  return true;
}

export function subscribeForumContentFontSize(listener: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === FORUM_CONTENT_FONT_SIZE_STORAGE_KEY) listener();
  };

  window.addEventListener(FORUM_CONTENT_FONT_SIZE_CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(FORUM_CONTENT_FONT_SIZE_CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}

export function normalizeForumContentFontSize(value: string | null): ForumContentFontSize {
  const fontSize = Number(value);
  return isForumContentFontSize(fontSize) ? fontSize : FORUM_DEFAULT_FONT_SIZE_PIXELS;
}

function isForumContentFontSize(value: number): value is ForumContentFontSize {
  return FORUM_CONTENT_FONT_SIZE_OPTIONS.some((fontSize) => fontSize === value);
}

const LEGACY_FONT_SIZE_PIXELS = [11, 13, 15, 17, 19, 21, 23] as const;

const ABSOLUTE_CSS_FONT_SIZE_PIXELS: Record<string, number> = {
  'xx-small': 9,
  'x-small': 11,
  small: 13,
  medium: 15,
  large: 17,
  'x-large': 19,
  'xx-large': 21,
  'xxx-large': 23,
};

export function normalizeLegacyFontSizeAttribute(value: string) {
  const normalized = value.trim().toLowerCase();
  const relativeMatch = normalized.match(/^([+-])(\d+)$/);
  const absoluteMatch = normalized.match(/^\d+$/);
  let legacySize: number;

  if (relativeMatch) {
    const offset = Number(relativeMatch[2]) * (relativeMatch[1] === '-' ? -1 : 1);
    legacySize = 3 + offset;
  } else if (absoluteMatch) {
    legacySize = Number(normalized);
  } else {
    return null;
  }

  if (!Number.isSafeInteger(legacySize)) return null;
  const boundedSize = Math.min(7, Math.max(1, legacySize));
  return `${LEGACY_FONT_SIZE_PIXELS[boundedSize - 1]}px`;
}

export function normalizeAbsoluteCssFontSize(value: string) {
  const pixels = ABSOLUTE_CSS_FONT_SIZE_PIXELS[value.trim().toLowerCase()];
  return pixels ? `${pixels}px` : null;
}

export function normalizeForumFontSizeElements(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('font[size]').forEach((element) => {
    if (element.style.getPropertyValue('font-size').trim()) return;

    const normalized = normalizeLegacyFontSizeAttribute(element.getAttribute('size') ?? '');
    if (normalized) element.style.setProperty('font-size', normalized);
  });

  root.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
    const current = element.style.getPropertyValue('font-size');
    const normalized = normalizeAbsoluteCssFontSize(current);
    if (!normalized) return;

    element.style.setProperty(
      'font-size',
      normalized,
      element.style.getPropertyPriority('font-size'),
    );
  });
}

export function normalizeForumFontSizeMarkup(value: string) {
  if (!requiresFontSizeNormalization(value) || /<\s*(?:!doctype|html|head|body)\b/i.test(value)) {
    return value;
  }

  const template = document.createElement('template');
  template.innerHTML = value;
  normalizeForumFontSizeElements(template.content);
  return template.innerHTML;
}

function requiresFontSizeNormalization(value: string) {
  return /<font\b[^>]*\bsize\s*=/i.test(value)
    || /\bfont-size\s*:\s*(?:xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large)\b/i.test(value);
}
