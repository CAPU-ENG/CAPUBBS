export const FORUM_DEFAULT_FONT_SIZE = '15px';

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
