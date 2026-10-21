export type CropImageKind = 'avatar' | 'decoration' | 'medal';

type CropImageLimits = {
  maxBytes: number;
  maxSide: number;
  minSide: number;
};

// Mirrors the server-side upload limits of each image kind.
export const CROP_IMAGE_LIMITS: Record<CropImageKind, CropImageLimits> = {
  avatar: { maxBytes: 1024 * 1024, maxSide: 4096, minSide: 64 },
  decoration: { maxBytes: 64 * 1024, maxSide: 4096, minSide: 64 },
  medal: { maxBytes: 1024 * 1024, maxSide: 8192, minSide: 64 },
};

export const CROP_COMPRESSED_NOTICE = '图片超出大小限制，已自动压缩';

const WEBP_QUALITIES = [0.95, 0.88, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
const SHRINK_RATIO = 0.85;

export type CropRect = { height: number; width: number; x: number; y: number };

export type CroppedImage = { compressed: boolean; dataUrl: string };

/**
 * Renders the crop at its original pixel size as PNG. Only when the result
 * exceeds the kind's limits is it re-encoded as WebP and, if still too big, shrunk.
 */
export async function renderCroppedImage(
  image: HTMLImageElement,
  crop: CropRect,
  kind: CropImageKind,
  canvas: HTMLCanvasElement,
): Promise<CroppedImage | null> {
  const context = canvas.getContext('2d');
  if (!context) return null;
  const limits = CROP_IMAGE_LIMITS[kind];
  const naturalSide = Math.round(Math.min(crop.width, crop.height));
  let size = Math.max(limits.minSide, Math.min(naturalSide, limits.maxSide));
  let compressed = naturalSide > limits.maxSide;

  while (size >= limits.minSide) {
    canvas.width = size;
    canvas.height = size;
    context.clearRect(0, 0, size, size);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, size, size);
    context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size);

    const png = await canvasBlob(canvas, 'image/png');
    if (png && png.size < limits.maxBytes) return { compressed, dataUrl: await blobDataUrl(png) };

    compressed = true;
    for (const quality of WEBP_QUALITIES) {
      const webp = await canvasBlob(canvas, 'image/webp', quality);
      if (webp && webp.type === 'image/webp' && webp.size < limits.maxBytes) {
        return { compressed, dataUrl: await blobDataUrl(webp) };
      }
    }
    size = Math.floor(size * SHRINK_RATIO);
  }
  return null;
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

function blobDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('read')));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
