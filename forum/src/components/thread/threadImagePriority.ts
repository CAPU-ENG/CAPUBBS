import type { GalleryImageRole } from '../../utils/galleryImageLoading';

export type FrameImageBounds = {
  top: number; bottom: number; left: number; right: number;
  gallery?: GalleryImageRole;
};
export type ThreadImagePriority = 'high' | 'low' | 'deferred';

export function getFrameImagePriority(
  frame: FrameImageBounds,
  images: FrameImageBounds[],
  viewport: { width: number; height: number },
): ThreadImagePriority {
  let priority: ThreadImagePriority = 'deferred';
  for (const image of images) {
    const visible = image.right > image.left && image.bottom > image.top
      && frame.top + image.bottom > Math.max(0, frame.top)
      && frame.top + image.top < Math.min(viewport.height, frame.bottom)
      && frame.left + image.right > Math.max(0, frame.left)
      && frame.left + image.left < Math.min(viewport.width, frame.right);
    if (image.gallery) {
      if (!visible || image.gallery === 'deferred') continue;
      if (image.gallery === 'current') return 'high';
      priority = 'low';
    } else {
      if (visible) return 'high';
      priority = 'low';
    }
  }
  return priority;
}
