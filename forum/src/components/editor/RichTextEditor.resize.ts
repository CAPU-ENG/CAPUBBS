import {
  getRichImageLayout,
  getRichImageWidthTarget,
  removeRichImageLayout,
  syncRichImageLayout,
  type RichImageTextAlign,
} from './RichTextEditor.imageLayout.ts';

export type ActiveRichImageResize = {
  contentWidth: number;
  direction: 1 | -1;
  image: HTMLImageElement;
  minWidthPercentage: number;
  pointerId: number;
  startWidthPercentage: number;
  startX: number;
};

export type ActiveGalleryResize = {
  gallery: HTMLElement;
  maxHeight: number;
  minHeight: number;
  pointerId: number;
  resizeControl: HTMLElement;
  startHeight: number;
  startY: number;
};

export type RichImageResizeHandle = {
  left: number;
  top: number;
  wrap: RichImageWrap;
  textAlign: RichImageTextAlign;
};

export type RichImageWrap = 'none' | 'left' | 'right';

export type ImageIntrinsicDimensions = {
  height: number;
  width: number;
};

export const richImageResizeMinWidth = 48;
export const galleryResizeMinHeight = 160;
export const galleryResizeMaxHeight = 1200;

export function clampImageDimension(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function applyGalleryImageHeight(
  gallery: HTMLElement,
  resizeControl: HTMLElement,
  height: number,
) {
  const roundedHeight = Math.round(height);
  gallery.style.setProperty('--capubbs-gallery-image-height', `${roundedHeight}px`);
  resizeControl.setAttribute('aria-valuemax', String(galleryResizeMaxHeight));
  resizeControl.setAttribute('aria-valuemin', String(galleryResizeMinHeight));
  resizeControl.setAttribute('aria-valuenow', String(roundedHeight));
}

export function applyImageWidthPercentage(image: HTMLImageElement, widthPercentage: number) {
  const normalizedWidth = Math.round(widthPercentage * 100) / 100;
  const width = `${normalizedWidth}%`;
  getRichImageWidthTarget(image).style.width = width;
  image.style.height = 'auto';
}

export function getRichImageWrap(image: HTMLImageElement): RichImageWrap {
  const float = getRichImageLayout(image) ? image.getAttribute('data-capubbs-image-wrap')
    : image.style.cssFloat || image.getAttribute('align');
  return float === 'left' || float === 'right' ? float : 'none';
}

export function applyImageTextWrap(
  image: HTMLImageElement,
  wrap: RichImageWrap,
  currentWidthPercentage: number,
) {
  const wasWrapped = getRichImageWrap(image) !== 'none';
  if (getRichImageLayout(image)) {
    if (wrap === 'none') removeRichImageLayout(image);
    else {
      applyImageWidthPercentage(image, currentWidthPercentage);
      syncRichImageLayout(image, wrap);
      return;
    }
  }
  image.style.cssFloat = wrap;
  image.style.margin = wrap === 'left' ? '0 1em 0.75em 0'
    : wrap === 'right' ? '0 0 0.75em 1em' : '';

  if (wrap === 'none') {
    image.style.removeProperty('max-width');
    image.removeAttribute('data-capubbs-image-wrap');
  } else {
    image.setAttribute('data-capubbs-image-wrap', wrap);
    image.style.maxWidth = 'calc(100% - 1em)';
    // Leave room for multiple lines of text without enlarging smaller images.
    applyImageWidthPercentage(image, wasWrapped ? currentWidthPercentage : Math.min(currentWidthPercentage, 50));
  }
}

export function applyImageIntrinsicDimensions(
  image: HTMLImageElement,
  dimensions: ImageIntrinsicDimensions,
) {
  const width = Math.round(dimensions.width);
  const height = Math.round(dimensions.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return false;

  image.setAttribute('width', String(width));
  image.setAttribute('height', String(height));
  return true;
}

export function getEditorContentWidth(editor: HTMLElement) {
  const computedStyle = window.getComputedStyle(editor);
  const horizontalPadding = (Number.parseFloat(computedStyle.paddingLeft) || 0)
    + (Number.parseFloat(computedStyle.paddingRight) || 0);
  return Math.max(1, editor.clientWidth - horizontalPadding);
}

export function getImageWidthPercentage(width: number, contentWidth: number) {
  if (width <= 0 || contentWidth <= 0) return 100;
  return clampImageDimension(width / contentWidth * 100, 0, 100);
}

export function getResizedImageWidthPercentage(
  startWidthPercentage: number,
  horizontalDelta: number,
  contentWidth: number,
  minWidthPercentage: number,
) {
  if (contentWidth <= 0) return startWidthPercentage;
  return clampImageDimension(
    startWidthPercentage + horizontalDelta / contentWidth * 100,
    minWidthPercentage,
    100,
  );
}
