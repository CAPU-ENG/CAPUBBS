type ImageSize = { width: number; height: number };

export function getLightboxImageMetrics(image: ImageSize, viewport: ImageSize) {
  if (image.width <= 0 || image.height <= 0 || viewport.width <= 0 || viewport.height <= 0) {
    return { width: 0, height: 0, maxScale: 4 };
  }

  const fitScale = Math.min(1, viewport.width / image.width, viewport.height / image.height);
  return {
    width: image.width * fitScale,
    height: image.height * fitScale,
    // Small screens and tall images may need more than 4x to reach native size.
    maxScale: Math.max(4, 1 / fitScale),
  };
}
