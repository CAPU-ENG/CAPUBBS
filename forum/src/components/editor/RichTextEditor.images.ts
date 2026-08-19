import { imageCompressionMaxEdge } from './RichTextEditor.constants';
import { md5BytesHex } from '../../utils/md5';

export function getClipboardImageFile(clipboardData: DataTransfer) {
  const file = Array.from(clipboardData.files).find((item) => item.type.startsWith('image/'));

  if (file) {
    return file;
  }

  const imageItem = Array.from(clipboardData.items).find((item) => item.kind === 'file' && item.type.startsWith('image/'));

  return imageItem?.getAsFile() ?? null;
}

export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function getImageAltText(file: File) {
  return file.name.replace(/\.[^.]+$/, '').trim() || '粘贴图片';
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('图片读取失败。'));
    });
    reader.addEventListener('error', () => reject(new Error('图片读取失败。')));
    reader.readAsDataURL(file);
  });
}

export async function createUploadablePngFileUnderLimit(file: File, maxBytes: number) {
  if (file.type === 'image/png' && file.size <= maxBytes) {
    return ensurePngFileName(file);
  }

  const image = await loadImageSource(file);
  let scale = Math.min(1, imageCompressionMaxEdge / Math.max(image.width, image.height));
  let smallestBlob: Blob | null = null;

  try {
    for (let scalePass = 0; scalePass < 14; scalePass += 1) {
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const blob = await renderImageToPngBlob(image.source, width, height);

      smallestBlob = !smallestBlob || blob.size < smallestBlob.size ? blob : smallestBlob;

      if (blob.size <= maxBytes) {
        return blobToPngFile(blob, file);
      }

      const shrinkRatio = Math.sqrt(maxBytes / blob.size) * 0.92;
      scale *= Math.max(0.2, Math.min(0.82, shrinkRatio));
    }
  } finally {
    image.close?.();
  }

  throw new Error('无法在当前压缩参数下生成 2MB 以内的 PNG 图片。');
}

export async function getImageFileMd5Hex(file: File) {
  return md5BytesHex(new Uint8Array(await file.arrayBuffer()));
}

export async function uploadEditorImage(file: File, md5: string) {
  const dataUrl = await readFileAsDataUrl(file);
  const uploadUrl = getEditorImageUploadUrl();
  const response = await fetch(uploadUrl, {
    body: JSON.stringify({
      dataUrl,
      md5,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const payload = await readUploadResponse(response);

  if (!response.ok) {
    throw new Error(getUploadError(payload));
  }

  if (!isUploadResponse(payload)) {
    throw new Error('图片上传成功但返回地址无效。');
  }

  return payload;
}

function getEditorImageUploadUrl() {
  if (import.meta.env.DEV) {
    return '/bbs-new/api/editor-images';
  }

  throw new Error('编辑器图片上传接口尚未接入服务器现有 API，已记录在 bbs-new/apiNeed.md。');
}

export async function compressImageFileUnderLimit(file: File, maxBytes: number) {
  if (file.size <= maxBytes) {
    return file;
  }

  const image = await loadImageSource(file);
  let scale = Math.min(1, imageCompressionMaxEdge / Math.max(image.width, image.height));
  let smallestBlob: Blob | null = null;
  const qualitySteps = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42];

  try {
    for (let scalePass = 0; scalePass < 9; scalePass += 1) {
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      for (const quality of qualitySteps) {
        const blob = await renderImageToJpegBlob(image.source, width, height, quality);
        smallestBlob = !smallestBlob || blob.size < smallestBlob.size ? blob : smallestBlob;

        if (blob.size <= maxBytes) {
          return blobToImageFile(blob, file);
        }
      }

      if (!smallestBlob) {
        break;
      }

      const shrinkRatio = Math.sqrt(maxBytes / smallestBlob.size) * 0.92;
      scale *= Math.max(0.45, Math.min(0.85, shrinkRatio));
    }
  } finally {
    image.close?.();
  }

  throw new Error('无法在当前压缩参数下压到 2MB 以内。');
}

async function loadImageSource(file: File): Promise<{
  close?: () => void;
  height: number;
  source: CanvasImageSource;
  width: number;
}> {
  if ('createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file);

      return {
        close: () => bitmap.close(),
        height: bitmap.height,
        source: bitmap,
        width: bitmap.width,
      };
    } catch {
      // Fall through to HTMLImageElement decoding for formats createImageBitmap cannot read.
    }
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadHtmlImage(objectUrl);

    return {
      close: () => URL.revokeObjectURL(objectUrl),
      height: image.naturalHeight,
      source: image,
      width: image.naturalWidth,
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function loadHtmlImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片解析失败，无法压缩。'));
    image.src = src;
  });
}

function renderImageToJpegBlob(source: CanvasImageSource, width: number, height: number, quality: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('当前浏览器不支持 Canvas 图片压缩。');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error('图片压缩失败。'));
      },
      'image/jpeg',
      quality,
    );
  });
}

function renderImageToPngBlob(source: CanvasImageSource, width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('当前浏览器不支持 Canvas 图片处理。');
  }

  context.drawImage(source, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('PNG 图片生成失败。'));
    }, 'image/png');
  });
}

function blobToImageFile(blob: Blob, originalFile: File) {
  const baseName = originalFile.name.replace(/\.[^.]+$/, '') || 'pasted-image';

  return new File([blob], `${baseName}.jpg`, {
    lastModified: Date.now(),
    type: 'image/jpeg',
  });
}

function ensurePngFileName(file: File) {
  if (/\.png$/i.test(file.name)) {
    return file;
  }

  return new File([file], `${getImageBaseName(file)}.png`, {
    lastModified: file.lastModified,
    type: 'image/png',
  });
}

function blobToPngFile(blob: Blob, originalFile: File) {
  return new File([blob], `${getImageBaseName(originalFile)}.png`, {
    lastModified: Date.now(),
    type: 'image/png',
  });
}

function getImageBaseName(file: File) {
  return file.name.replace(/\.[^.]+$/, '') || 'pasted-image';
}

async function readUploadResponse(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function getUploadError(payload: unknown) {
  if (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string') {
    return payload.error;
  }

  return '图片上传失败，请稍后重试。';
}

function isUploadResponse(payload: unknown): payload is { md5: string; url: string } {
  return (
    !!payload &&
    typeof payload === 'object' &&
    'md5' in payload &&
    'url' in payload &&
    typeof payload.md5 === 'string' &&
    typeof payload.url === 'string'
  );
}
