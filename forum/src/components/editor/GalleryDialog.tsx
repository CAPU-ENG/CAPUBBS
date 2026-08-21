import { Images, Trash2, UploadCloud, X } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { editorImageInputAccept, validateEditorImageFile } from './RichTextEditor.images';

export type GalleryDialogImage = {
  caption: string;
  file: File;
  id: string;
  previewUrl: string;
};

export function GalleryDialog({
  onCancel,
  onInsert,
}: {
  onCancel: () => void;
  onInsert: (title: string, images: GalleryDialogImage[]) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<GalleryDialogImage[]>([]);
  const [title, setTitle] = useState('');
  const [images, setImages] = useState<GalleryDialogImage[]>([]);
  const [error, setError] = useState('');
  const [isCheckingFiles, setIsCheckingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
    imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
  }, []);

  async function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    if (files.length === 0) return;

    setError('');
    setIsCheckingFiles(true);

    try {
      const results = await Promise.allSettled(files.map(async (file) => {
        await validateEditorImageFile(file);
        return {
          caption: '',
          file,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          previewUrl: URL.createObjectURL(file),
        } satisfies GalleryDialogImage;
      }));
      const accepted = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
      const rejected = results.flatMap((result) => result.status === 'rejected' ? [result.reason] : []);

      if (accepted.length > 0) setImages((current) => [...current, ...accepted]);
      if (rejected.length > 0) {
        const firstError = rejected[0];
        setError(firstError instanceof Error ? firstError.message : '部分图片检查失败，请重新选择。');
      }
    } finally {
      setIsCheckingFiles(false);
    }
  }

  function removeImage(id: string) {
    setImages((current) => {
      const removed = current.find((image) => image.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  }

  function updateCaption(id: string, caption: string) {
    setImages((current) => current.map((image) => image.id === id ? { ...image, caption } : image));
  }

  async function insertGallery() {
    if (images.length < 2 || isCheckingFiles || isUploading) {
      if (images.length < 2) setError('请至少选择两张图片。');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      await onInsert(title, images);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '图廊上传失败，请稍后重试。');
      setIsUploading(false);
    }
  }

  return (
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
          <h2 id="gallery-dialog-title">插入图廊</h2>
          <button aria-label="关闭图廊编辑" disabled={isBusy} onClick={onCancel} type="button"><X size={18} /></button>
        </header>

        <div className="gallery-dialog-body">
          <label className="gallery-dialog-title-field">
            <span>总标题（选填）</span>
            <input
              disabled={isUploading}
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
            {isCheckingFiles ? '正在检查图片' : images.length > 0 ? '继续添加图片' : '选择多张图片'}
          </button>
          <input
            ref={inputRef}
            accept={editorImageInputAccept}
            className="sr-only"
            disabled={isCheckingFiles || isUploading}
            multiple
            onChange={addFiles}
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
                      disabled={isUploading}
                      maxLength={160}
                      onChange={(event) => updateCaption(image.id, event.target.value)}
                      placeholder="填写图注"
                      value={image.caption}
                    />
                  </label>
                  <button
                    aria-label={`移除第 ${index + 1} 张图片`}
                    disabled={isUploading}
                    onClick={() => removeImage(image.id)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ol>
          ) : null}

          {error ? <p className="gallery-dialog-error" role="alert">{error}</p> : null}
        </div>

        <footer>
          <span>{images.length} 张</span>
          <button disabled={isUploading} onClick={onCancel} type="button">取消</button>
          <button disabled={images.length < 2 || isCheckingFiles || isUploading} onClick={insertGallery} type="button">
            {isUploading ? '正在上传' : '上传并插入'}
          </button>
        </footer>
      </section>
    </div>
  );
}
