export type FrameImageBounds = { top: number; bottom: number; left: number; right: number };

export function getFrameImagePriority(
  frame: FrameImageBounds,
  images: FrameImageBounds[],
  viewport: { width: number; height: number },
): 'high' | 'low' {
  return images.some((image) => (
    image.right > image.left && image.bottom > image.top
    && frame.top + image.bottom > Math.max(0, frame.top)
    && frame.top + image.top < Math.min(viewport.height, frame.bottom)
    && frame.left + image.right > Math.max(0, frame.left)
    && frame.left + image.left < Math.min(viewport.width, frame.right)
  )) ? 'high' : 'low';
}
