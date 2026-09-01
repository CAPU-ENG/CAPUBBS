import type { Theme } from './theme';

type GrayscaleColor = {
  alpha: number;
  channel: number;
};

const GRAYSCALE_NAMED_COLORS: Record<string, number> = {
  black: 0,
  darkgray: 169,
  darkgrey: 169,
  dimgray: 105,
  dimgrey: 105,
  gainsboro: 220,
  gray: 128,
  grey: 128,
  lightgray: 211,
  lightgrey: 211,
  silver: 192,
  white: 255,
  whitesmoke: 245,
};

const ORIGINAL_COLOR_ATTRIBUTE = 'data-capubbs-original-grayscale-color-attr';
const ORIGINAL_STYLE_COLOR_ATTRIBUTE = 'data-capubbs-original-grayscale-style-color';

export function parseForumGrayscaleTextColor(value: string | null | undefined): GrayscaleColor | null {
  const colorText = String(value ?? '').trim().toLowerCase().replace(/^['"]|['"]$/g, '');
  const compactColorText = colorText.replace(/\s+/g, '');
  const namedChannel = GRAYSCALE_NAMED_COLORS[compactColorText];

  if (typeof namedChannel === 'number') return { alpha: 1, channel: namedChannel };

  const hexMatch = compactColorText.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (hexMatch) {
    const expandedHex = hexMatch[1].length <= 4
      ? hexMatch[1].split('').map((character) => `${character}${character}`).join('')
      : hexMatch[1];
    const red = Number.parseInt(expandedHex.slice(0, 2), 16);
    const green = Number.parseInt(expandedHex.slice(2, 4), 16);
    const blue = Number.parseInt(expandedHex.slice(4, 6), 16);
    const alpha = expandedHex.length === 8 ? Number.parseInt(expandedHex.slice(6, 8), 16) / 255 : 1;
    return red === green && green === blue ? { alpha, channel: red } : null;
  }

  const rgbMatch = colorText.match(
    /^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*|\s+)(\d{1,3}(?:\.\d+)?%?)(?:\s*(?:,|\/)\s*([01](?:\.\d+)?|\.\d+|100%|\d{1,3}(?:\.\d+)?%))?\s*\)$/,
  );
  if (!rgbMatch) return null;

  const red = parseRgbChannel(rgbMatch[1]);
  const green = parseRgbChannel(rgbMatch[2]);
  const blue = parseRgbChannel(rgbMatch[3]);
  const alpha = parseAlphaChannel(rgbMatch[4]);
  if (red === null || green === null || blue === null || alpha === null) return null;
  return red === green && green === blue ? { alpha, channel: red } : null;
}

export function invertForumGrayscaleTextColor(value: string | null | undefined, allowAlpha = true) {
  const grayscaleColor = parseForumGrayscaleTextColor(value);
  if (!grayscaleColor) return null;

  const invertedChannel = 255 - grayscaleColor.channel;
  if (allowAlpha && grayscaleColor.alpha < 1) {
    return `rgba(${invertedChannel}, ${invertedChannel}, ${invertedChannel}, ${formatAlpha(grayscaleColor.alpha)})`;
  }

  const hex = invertedChannel.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
}

export function syncForumGrayscaleTextColors(root: Element, theme: Theme) {
  const elements = [
    ...(root.matches('[color], [style]') ? [root] : []),
    ...Array.from(root.querySelectorAll<HTMLElement>('[color], [style]')),
  ];

  elements.forEach((element) => {
    syncColorAttribute(element, theme);
    if (element instanceof HTMLElement) syncStyleColor(element, theme);
  });
}

function syncColorAttribute(element: Element, theme: Theme) {
  const originalColor = element.getAttribute(ORIGINAL_COLOR_ATTRIBUTE);
  if (theme === 'light') {
    if (originalColor === null) return;
    element.setAttribute('color', originalColor);
    element.removeAttribute(ORIGINAL_COLOR_ATTRIBUTE);
    return;
  }

  const sourceColor = originalColor ?? element.getAttribute('color');
  const invertedColor = invertForumGrayscaleTextColor(sourceColor, false);
  if (!invertedColor || sourceColor === null) return;
  if (originalColor === null) element.setAttribute(ORIGINAL_COLOR_ATTRIBUTE, sourceColor);
  if (element.getAttribute('color') !== invertedColor) element.setAttribute('color', invertedColor);
}

function syncStyleColor(element: HTMLElement, theme: Theme) {
  const originalColor = element.getAttribute(ORIGINAL_STYLE_COLOR_ATTRIBUTE);
  if (theme === 'light') {
    if (originalColor === null) return;
    element.style.setProperty('color', originalColor, element.style.getPropertyPriority('color'));
    element.removeAttribute(ORIGINAL_STYLE_COLOR_ATTRIBUTE);
    return;
  }

  const sourceColor = originalColor ?? element.style.getPropertyValue('color');
  const invertedColor = invertForumGrayscaleTextColor(sourceColor);
  if (!invertedColor || !sourceColor) return;
  if (originalColor === null) element.setAttribute(ORIGINAL_STYLE_COLOR_ATTRIBUTE, sourceColor);
  if (element.style.getPropertyValue('color') !== invertedColor) {
    element.style.setProperty('color', invertedColor, element.style.getPropertyPriority('color'));
  }
}

function parseRgbChannel(value: string) {
  const isPercent = value.endsWith('%');
  const channel = Number(isPercent ? value.slice(0, -1) : value);
  if (!Number.isFinite(channel)) return null;
  if (isPercent) return channel >= 0 && channel <= 100 ? Math.round(channel * 2.55) : null;
  return channel >= 0 && channel <= 255 ? Math.round(channel) : null;
}

function parseAlphaChannel(value: string | undefined) {
  if (value === undefined) return 1;
  const isPercent = value.endsWith('%');
  const alpha = Number(isPercent ? value.slice(0, -1) : value);
  if (!Number.isFinite(alpha)) return null;
  if (isPercent) return alpha >= 0 && alpha <= 100 ? alpha / 100 : null;
  return alpha >= 0 && alpha <= 1 ? alpha : null;
}

function formatAlpha(alpha: number) {
  return Number(alpha.toFixed(3));
}
