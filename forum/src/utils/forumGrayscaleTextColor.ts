import type { Theme } from './theme';

type GrayscaleColor = {
  alpha: number;
  blue: number;
  green: number;
  red: number;
};

// Self-contained so HTML floor frames can embed the same code via Function.prototype.toString;
// it must not reference anything outside its own body.
export function createForumGrayscaleTextColor() {
  // Colors whose channel spread (max - min) stays within this range are treated as gray and inverted in dark mode.
  // The range widens as the color darkens: 32 from mid-gray up, growing to cover every color whose brightest channel is 64 or less.
  const minChromaLimit = 32;
  const darkChromaLimit = 96;
  const namedColors: Record<string, [number, number, number]> = {
    black: [0, 0, 0],
    darkgray: [169, 169, 169],
    darkgrey: [169, 169, 169],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    gainsboro: [220, 220, 220],
    gray: [128, 128, 128],
    grey: [128, 128, 128],
    lightgray: [211, 211, 211],
    lightgrey: [211, 211, 211],
    silver: [192, 192, 192],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
  };
  const originalColorAttribute = 'data-capubbs-original-grayscale-color-attr';
  const originalStyleColorAttribute = 'data-capubbs-original-grayscale-style-color';
  const colorSelector = `[color], [style], [${originalColorAttribute}], [${originalStyleColorAttribute}]`;

  function toGrayscaleColor(red: number, green: number, blue: number, alpha: number): GrayscaleColor | null {
    const brightest = Math.max(red, green, blue);
    const chromaLimit = Math.max(minChromaLimit, darkChromaLimit - brightest / 2);
    return brightest - Math.min(red, green, blue) <= chromaLimit ? { alpha, blue, green, red } : null;
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

  function parse(value: string | null | undefined): GrayscaleColor | null {
    const colorText = String(value ?? '').trim().toLowerCase().replace(/^['"]|['"]$/g, '');
    const compactColorText = colorText.replace(/\s+/g, '');
    const namedColor = namedColors[compactColorText];

    if (namedColor) return toGrayscaleColor(namedColor[0], namedColor[1], namedColor[2], 1);

    const hexMatch = compactColorText.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
    if (hexMatch) {
      const expandedHex = hexMatch[1].length <= 4
        ? hexMatch[1].split('').map((character) => `${character}${character}`).join('')
        : hexMatch[1];
      const red = Number.parseInt(expandedHex.slice(0, 2), 16);
      const green = Number.parseInt(expandedHex.slice(2, 4), 16);
      const blue = Number.parseInt(expandedHex.slice(4, 6), 16);
      const alpha = expandedHex.length === 8 ? Number.parseInt(expandedHex.slice(6, 8), 16) / 255 : 1;
      return toGrayscaleColor(red, green, blue, alpha);
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
    return toGrayscaleColor(red, green, blue, alpha);
  }

  function invert(value: string | null | undefined, allowAlpha = true) {
    const grayscaleColor = parse(value);
    if (!grayscaleColor) return null;

    // Flip HSL lightness while keeping hue and saturation, so a slight tint survives; pure grays become 255 - channel.
    const { alpha, blue, green, red } = grayscaleColor;
    const shift = 255 - Math.max(red, green, blue) - Math.min(red, green, blue);
    const channels = [red + shift, green + shift, blue + shift];
    if (allowAlpha && alpha < 1) return `rgba(${channels.join(', ')}, ${Number(alpha.toFixed(3))})`;

    return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
  }

  function syncColorAttribute(element: Element, dark: boolean) {
    const originalColor = element.getAttribute(originalColorAttribute);
    if (!dark) {
      if (originalColor === null) return;
      element.setAttribute('color', originalColor);
      element.removeAttribute(originalColorAttribute);
      return;
    }

    const sourceColor = originalColor ?? element.getAttribute('color');
    const invertedColor = invert(sourceColor, false);
    if (!invertedColor || sourceColor === null) return;
    if (originalColor === null) element.setAttribute(originalColorAttribute, sourceColor);
    if (element.getAttribute('color') !== invertedColor) element.setAttribute('color', invertedColor);
  }

  function syncStyleColor(element: HTMLElement, dark: boolean) {
    const originalColor = element.getAttribute(originalStyleColorAttribute);
    if (!dark) {
      if (originalColor === null) return;
      element.style.setProperty('color', originalColor, element.style.getPropertyPriority('color'));
      element.removeAttribute(originalStyleColorAttribute);
      return;
    }

    const sourceColor = originalColor ?? element.style.getPropertyValue('color');
    const invertedColor = invert(sourceColor);
    if (!invertedColor || !sourceColor) return;
    if (originalColor === null) element.setAttribute(originalStyleColorAttribute, sourceColor);
    if (element.style.getPropertyValue('color') !== invertedColor) {
      element.style.setProperty('color', invertedColor, element.style.getPropertyPriority('color'));
    }
  }

  function sync(root: ParentNode, dark: boolean) {
    const elements = [
      ...(root instanceof Element && root.matches(colorSelector) ? [root] : []),
      ...Array.from(root.querySelectorAll(colorSelector)),
    ];

    elements.forEach((element) => {
      syncColorAttribute(element, dark);
      // Checked structurally so it also works for elements created by another window.
      const { style } = element as Partial<HTMLElement>;
      if (style && typeof style.getPropertyValue === 'function') syncStyleColor(element as HTMLElement, dark);
    });
  }

  return { invert, parse, sync };
}

const forumGrayscaleTextColor = createForumGrayscaleTextColor();

export const parseForumGrayscaleTextColor = forumGrayscaleTextColor.parse;
export const invertForumGrayscaleTextColor = forumGrayscaleTextColor.invert;

export function syncForumGrayscaleTextColors(root: Element, theme: Theme) {
  forumGrayscaleTextColor.sync(root, theme === 'dark');
}
