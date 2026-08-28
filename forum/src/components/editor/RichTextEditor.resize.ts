export type ActiveRichImageResize = {
  aspectRatio: number;
  image: HTMLImageElement;
  maxWidth: number;
  pointerId: number;
  startHeight: number;
  startWidth: number;
  startX: number;
  startY: number;
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

export type ImagePixelDimensions = {
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

export function applyImagePixelDimensions(image: HTMLImageElement, width: number, height: number) {
  image.style.width = `${width}px`;
  image.style.height = `${height}px`;
  image.setAttribute('width', String(width));
  image.setAttribute('height', String(height));
}

export function getEditorContentWidth(editor: HTMLElement) {
  const computedStyle = window.getComputedStyle(editor);
  const horizontalPadding = (Number.parseFloat(computedStyle.paddingLeft) || 0)
    + (Number.parseFloat(computedStyle.paddingRight) || 0);
  return Math.max(1, editor.clientWidth - horizontalPadding);
}

export function applyImageIntrinsicDimensions(image: HTMLImageElement, maxWidth: number) {
  return applyImageDimensions(image, maxWidth, {
    height: image.naturalHeight,
    width: image.naturalWidth,
  });
}

export function applyImageDimensions(
  image: HTMLImageElement,
  maxWidth: number,
  dimensions: ImagePixelDimensions,
) {
  if (dimensions.width <= 0 || dimensions.height <= 0) return false;

  const width = Math.min(dimensions.width, Math.max(1, Math.round(maxWidth)));
  const height = Math.max(1, Math.round(dimensions.height * width / dimensions.width));
  applyImagePixelDimensions(image, width, height);
  return true;
}
