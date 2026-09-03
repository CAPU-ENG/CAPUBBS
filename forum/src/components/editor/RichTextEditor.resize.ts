export type ActiveRichImageResize = {
  contentWidth: number;
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
};

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
  image.style.width = width;
  image.style.height = 'auto';
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
