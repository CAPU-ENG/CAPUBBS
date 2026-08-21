import { imageCompressionMaxEdge } from './RichTextEditor.constants';
import { md5BytesHex } from '../../utils/md5';

type EditorImageFormat = 'gif' | 'jpeg' | 'png' | 'webp';

const editorImageFormatByExtension: Record<string, EditorImageFormat> = {
  gif: 'gif',
  jpeg: 'jpeg',
  jpg: 'jpeg',
  png: 'png',
  webp: 'webp',
};
const editorImageFormatByMime: Record<string, EditorImageFormat> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const editorImageInputAccept = '.gif,.jpg,.jpeg,.png,.webp,image/gif,image/jpeg,image/png,image/webp';

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
  return file.name.replace(/\.[^.]+$/, '').trim() || '图片';
}

export async function validateEditorImageFile(file: File) {
  const extension = file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase() ?? '';
  const extensionFormat = editorImageFormatByExtension[extension];

  if (!extensionFormat) {
    throw new Error('仅支持 JPG、PNG、GIF、WebP 图片。');
  }

  const mime = file.type.trim().toLowerCase();
  const mimeFormat = mime ? editorImageFormatByMime[mime] : undefined;
  if (mime && !mimeFormat) {
    throw new Error('仅支持 JPG、PNG、GIF、WebP 图片。');
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const headerFormat = detectEditorImageFormat(header);
  if (!headerFormat || headerFormat !== extensionFormat || (mimeFormat && mimeFormat !== headerFormat)) {
    throw new Error('文件内容与图片格式不匹配，请重新选择。');
  }
}

function detectEditorImageFormat(bytes: Uint8Array): EditorImageFormat | null {
  if (hasBytes(bytes, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (hasAscii(bytes, 0, 'GIF87a') || hasAscii(bytes, 0, 'GIF89a')) return 'gif';
  if (hasAscii(bytes, 0, 'RIFF') && hasAscii(bytes, 8, 'WEBP')) return 'webp';
  return null;
}

function hasBytes(bytes: Uint8Array, signature: number[]) {
  return signature.every((byte, index) => bytes[index] === byte);
}

function hasAscii(bytes: Uint8Array, offset: number, signature: string) {
  return Array.from(signature).every((character, index) => bytes[offset + index] === character.charCodeAt(0));
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
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(uploadUrl, {
    body: formData,
    method: 'POST',
  });

  const payload = await readUploadResponse(response);

  if (!response.ok) {
    throw new Error(getUploadError(payload));
  }

  const url = getUploadedImageUrl(payload);
  if (!url) {
    throw new Error('图片上传成功但返回地址无效。');
  }

  return { md5, url };
}

const uploadUrl = import.meta.env.VITE_EDITOR_IMAGE_UPLOAD_URL?.trim() || '/bbs/content/test.php';

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
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getUploadError(payload: unknown) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim();
  }

  if (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string') {
    return payload.error;
  }

  return '图片上传失败，请稍后重试。';
}

function getUploadedImageUrl(payload: unknown) {
  if (!payload || typeof payload !== 'object' || !('upload' in payload)) {
    return null;
  }

  const upload = payload.upload;
  if (!upload || typeof upload !== 'object' || !('links' in upload)) {
    return null;
  }

  const links = upload.links;
  if (!links || typeof links !== 'object' || !('original' in links)) {
    return null;
  }

  return typeof links.original === 'string' && links.original.trim() ? links.original : null;
}
