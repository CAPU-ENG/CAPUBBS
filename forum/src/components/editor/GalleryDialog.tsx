import { ArrowDown, ArrowUp, Images, Trash2, UploadCloud, X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { maxInlineImageBytes } from './RichTextEditor.constants';
import {
  createUploadableImageFileUnderLimit,
  editorImageInputAccept,
  validateEditorImageFile,
} from './RichTextEditor.images';
import type { EditorGalleryImage } from './RichTextEditor.gallery';

export type GalleryDialogImage = {
  alt: string;
  caption: string;
  file?: File;
  id: string;
  isCompressing?: boolean;
  previewUrl: string;
  processingError?: string;
  url?: string;
};

export type GalleryUploadProgress = {
  current: number;
  percent: number;
  total: number;
};

export function GalleryDialog({
  initialImages = [],
  initialTitle = '',
  onCancel,
  onInsert,
}: {
  initialImages?: EditorGalleryImage[];
  initialTitle?: string;
  onCancel: () => void;
  onInsert: (
    title: string,
    images: GalleryDialogImage[],
    onProgress: (progress: GalleryUploadProgress) => void,
  ) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const checkingFilesRef = useRef(false);
  const imagesRef = useRef<GalleryDialogImage[]>([]);
  const isEditing = initialImages.length > 0;
  const [title, setTitle] = useState(initialTitle);
  const [images, setImages] = useState<GalleryDialogImage[]>(() => (
    initialImages.map((image, index) => ({
      ...image,
      id: `existing-${index}-${Math.random().toString(36).slice(2)}`,
      previewUrl: image.url,
    }))
  ));
  const [error, setError] = useState('');
  const [isCheckingFiles, setIsCheckingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<GalleryUploadProgress | null>(null);
  const isBusy = isCheckingFiles || isUploading;
  imagesRef.current = images;

  useEffect(() => {
    document.body.classList.add('gallery-dialog-open');

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isBusy) onCancel();
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.classList.remove('gallery-dialog-open');
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isBusy, onCancel]);

  useEffect(() => () => {
    imagesRef.current.forEach((image) => {
      if (image.file) URL.revokeObjectURL(image.previewUrl);
    });
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    if (files.length === 0 || checkingFilesRef.current) return;

    checkingFilesRef.current = true;
    setError('');
    setIsCheckingFiles(true);

    try {
      const results = await Promise.allSettled(files.map(async (file) => {
        await validateEditorImageFile(file);
        return {
          alt: file.name.replace(/\.[^.]+$/, '').trim() || '图片',
          caption: '',
          file,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          previewUrl: URL.createObjectURL(file),
        } satisfies GalleryDialogImage;
      }));
      const accepted = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
      const rejected = results.flatMap((result) => result.status === 'rejected' ? [result.reason] : []);

      const pendingImages = accepted.map((image) => ({ ...image, isCompressing: true }));
      if (pendingImages.length > 0) setImages((current) => [...current, ...pendingImages]);
      if (rejected.length > 0) {
        const firstError = rejected[0];
        setError(firstError instanceof Error ? firstError.message : '部分图片检查失败，请重新选择。');
      }

      for (const image of pendingImages) {
        if (!image.file) continue;

        try {
          const compressedFile = await createUploadableImageFileUnderLimit(image.file, maxInlineImageBytes);
          setImages((current) => current.map((currentImage) => (
            currentImage.id === image.id
              ? { ...currentImage, file: compressedFile, isCompressing: false, processingError: undefined }
              : currentImage
          )));
        } catch (reason) {
          const message = reason instanceof Error ? reason.message : '图片处理失败，请移除后重新选择。';
          setImages((current) => current.map((currentImage) => (
            currentImage.id === image.id
              ? { ...currentImage, isCompressing: false, processingError: message }
              : currentImage
          )));
          setError(message);
        }
      }
    } finally {
      checkingFilesRef.current = false;
      setIsCheckingFiles(false);
    }
  }, []);

  useEffect(() => {
    function pasteImages(event: ClipboardEvent) {
      if (!event.clipboardData) return;
      let files = Array.from(event.clipboardData.files).filter((file) => file.type.startsWith('image/'));
      if (files.length === 0) {
        files = Array.from(event.clipboardData.items).flatMap((item) => {
          if (item.kind !== 'file' || !item.type.startsWith('image/')) return [];
          const file = item.getAsFile();
          return file ? [file] : [];
        });
      }
      if (files.length === 0) return;

      event.preventDefault();
      event.stopPropagation();
      if (!isBusy) void addFiles(files);
    }

    document.addEventListener('paste', pasteImages, true);
    return () => document.removeEventListener('paste', pasteImages, true);
  }, [addFiles, isBusy]);

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    if (!isBusy) void addFiles(files);
  }

  function removeImage(id: string) {
    setImages((current) => {
      const removed = current.find((image) => image.id === id);
      if (removed?.file) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  }

  function updateCaption(id: string, caption: string) {
    setImages((current) => current.map((image) => image.id === id ? { ...image, caption } : image));
  }

  function moveImage(id: string, direction: -1 | 1) {
    if (isBusy) return;
    setImages((current) => {
      const index = current.findIndex((image) => image.id === id);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return current;

      const reordered = [...current];
      [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
      return reordered;
    });
  }

  async function insertGallery() {
    if (images.length === 0 || isCheckingFiles || isUploading || images.some((image) => image.processingError)) {
      if (images.length === 0) setError('请至少选择一张图片。');
      return;
    }

    setError('');
    setUploadProgress(null);
    setIsUploading(true);

    try {
      await onInsert(title, images, setUploadProgress);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '图廊上传失败，请稍后重试。');
      setIsUploading(false);
    }
  }

  return createPortal(
    <div className="gallery-dialog-backdrop" onClick={isBusy ? undefined : onCancel} role="presentation">
      <section
        aria-labelledby="gallery-dialog-title"
        aria-modal="true"
        className="gallery-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header>
          <span><Images size={18} /></span>
          <h2 id="gallery-dialog-title">{isEditing ? '编辑图廊' : '插入图廊'}</h2>
          <button aria-label="关闭图廊编辑" disabled={isBusy} onClick={onCancel} type="button"><X size={18} /></button>
        </header>

        <div className="gallery-dialog-body">
          <label className="gallery-dialog-title-field">
            <span>总标题（选填）</span>
            <input
              disabled={isBusy}
              maxLength={80}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="图廊标题"
              value={title}
            />
          </label>

          <button
            className="gallery-dialog-file-button"
            disabled={isCheckingFiles || isUploading}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <UploadCloud size={18} />
            {isCheckingFiles ? '正在处理图片' : images.length > 0 ? '继续添加图片' : '选择若干张图片'}
          </button>
          <p className="gallery-dialog-paste-hint">可直接粘贴图片（Ctrl+V / ⌘V）</p>
          <input
            ref={inputRef}
            accept={editorImageInputAccept}
            className="sr-only"
            disabled={isCheckingFiles || isUploading}
            multiple
            onChange={selectFiles}
            type="file"
          />

          {images.length > 0 ? (
            <ol className="gallery-dialog-images">
              {images.map((image, index) => (
                <li key={image.id}>
                  <div className="gallery-dialog-image-preview">
                    <img alt="" src={image.previewUrl} />
                    <span>{index + 1}</span>
                  </div>
                  <label>
                    <span>第 {index + 1} 张图注</span>
                    <input
                      disabled={isBusy}
                      maxLength={160}
                      onChange={(event) => updateCaption(image.id, event.target.value)}
                      placeholder="填写图注"
                      value={image.caption}
                    />
                  </label>
                  <div className="gallery-dialog-image-actions">
                    <button
                      aria-label={`上移第 ${index + 1} 张图片`}
                      disabled={isBusy || index === 0}
                      onClick={() => moveImage(image.id, -1)}
                      title="上移"
                      type="button"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      aria-label={`下移第 ${index + 1} 张图片`}
                      disabled={isBusy || index === images.length - 1}
                      onClick={() => moveImage(image.id, 1)}
                      title="下移"
                      type="button"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      aria-label={`移除第 ${index + 1} 张图片`}
                      disabled={isBusy}
                      onClick={() => removeImage(image.id)}
                      title="移除"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}

          {isUploading && uploadProgress ? (
            <div aria-live="polite" className="gallery-dialog-upload-progress">
              <div>
                <span>正在上传第 {uploadProgress.current} 张，共 {uploadProgress.total} 张</span>
                <strong>{uploadProgress.percent}%</strong>
              </div>
              <progress aria-label="图廊上传进度" max={100} value={uploadProgress.percent} />
            </div>
          ) : null}

          {error ? <p className="gallery-dialog-error" role="alert">{error}</p> : null}
        </div>

        <footer>
          <span>{images.length} 张</span>
          <button disabled={isBusy} onClick={onCancel} type="button">取消</button>
          <button disabled={images.length === 0 || isCheckingFiles || isUploading} onClick={insertGallery} type="button">
            {isUploading
              ? uploadProgress
                ? `上传 ${uploadProgress.current}/${uploadProgress.total} · ${uploadProgress.percent}%`
                : '正在上传'
              : isCheckingFiles
                ? '正在处理图片'
                : isEditing ? '保存图廊' : '上传并插入'}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
