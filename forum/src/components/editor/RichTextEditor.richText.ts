import type { RichInlineStyle } from './RichTextEditor.types';

export function applyInlineStyleToElement(element: HTMLElement, style: RichInlineStyle) {
  if (style.color) {
    element.style.color = style.color;
  }

  if (style.fontFamily) {
    element.style.fontFamily = style.fontFamily;
  }

  if (style.fontSize) {
    element.style.fontSize = style.fontSize;
  }
}

export function getInheritedRichInlineStyle(range: Range) {
  const element = getElementFromNode(range.startContainer);
  if (!element || typeof window === 'undefined') {
    return {};
  }

  const computedStyle = window.getComputedStyle(element);

  return {
    color: computedStyle.color,
    fontFamily: computedStyle.fontFamily,
    fontSize: computedStyle.fontSize,
  };
}

export function richInlineStyleToString(style: RichInlineStyle) {
  return [
    style.color ? `color: ${style.color}` : '',
    style.fontFamily ? `font-family: ${style.fontFamily}` : '',
    style.fontSize ? `font-size: ${style.fontSize}` : '',
  ].filter(Boolean).join('; ');
}

export function focusRichTextEditorAtEnd(editor: HTMLDivElement) {
  editor.focus();

  const selection = window.getSelection();

  if (!selection) {
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function normalizeCssColor(value: string) {
  const rgb = parseCssColor(value);

  if (!rgb) {
    return null;
  }

  return rgbToHex(rgb.red, rgb.green, rgb.blue);
}

export function hexToRgbSource(value: string) {
  const rgb = parseCssColor(value);

  if (!rgb) {
    return value;
  }

  return `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`;
}

function getElementFromNode(node: Node) {
  return node instanceof HTMLElement ? node : node.parentElement;
}

function parseCssColor(value: string) {
  const trimmedValue = value.trim();
  const hexMatch = trimmedValue.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);

  if (hexMatch) {
    const hex = hexMatch[1].length === 3
      ? hexMatch[1].split('').map((character) => `${character}${character}`).join('')
      : hexMatch[1];

    return {
      blue: parseInt(hex.slice(4, 6), 16),
      green: parseInt(hex.slice(2, 4), 16),
      red: parseInt(hex.slice(0, 2), 16),
    };
  }

  const rgbMatch = trimmedValue.match(/^(?:rgb\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/i);
  if (!rgbMatch) {
    return null;
  }

  const red = Number(rgbMatch[1]);
  const green = Number(rgbMatch[2]);
  const blue = Number(rgbMatch[3]);

  if (![red, green, blue].every((channel) => Number.isInteger(channel) && channel >= 0 && channel <= 255)) {
    return null;
  }

  return { blue, green, red };
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}
