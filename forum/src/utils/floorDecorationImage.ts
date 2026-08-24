const MAX_DECORATION_BYTES = 64 * 1024;
const OUTPUT_SIZES = [320, 288, 256, 224];
const OUTPUT_QUALITIES = [0.86, 0.76, 0.66, 0.56, 0.46, 0.36];

export async function createFloorDecorationFile(dataUrl: string, variant: 'light' | 'dark') {
  const source = await loadImage(dataUrl);
  for (const size of OUTPUT_SIZES) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('浏览器无法处理当前图片。');
    context.clearRect(0, 0, size, size);
    context.drawImage(source, 0, 0, size, size);

    for (const quality of OUTPUT_QUALITIES) {
      const blob = await canvasToBlob(canvas, 'image/webp', quality)
        ?? await canvasToBlob(canvas, 'image/jpeg', quality);
      if (blob && blob.size < MAX_DECORATION_BYTES) {
        const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
        return new File([blob], `floor-decoration-${variant}.${extension}`, { type: blob.type });
      }
    }
  }

  throw new Error('图片无法压缩至 64 KB 以下，请换一张图片。');
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片读取失败。'));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}
