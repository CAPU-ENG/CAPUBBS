import { Image as ImageIcon } from 'lucide-react';
import { maxInlineImageBytes } from './RichTextEditor.constants';
import { formatBytes } from './RichTextEditor.images';
import type { PastedImageState } from './RichTextEditor.types';

type PastedImageDialogProps = {
  compressingLabel?: string;
  compressLabel?: string;
  image: PastedImageState | null;
  previewAlt?: string;
  title?: string;
  tooLargeMessage?: string;
  onCancel: () => void;
  onCompress: () => void;
  onUpload: () => void;
  uploadLabel?: string;
  uploadingLabel?: string;
};

export function PastedImageDialog({
  compressingLabel = '压缩中...',
  compressLabel = '压缩图片',
  image,
  previewAlt = '粘贴图片预览',
  title = '插入粘贴图片',
  tooLargeMessage = '图片超过 2MB，需要先压缩后再插入。',
  onCancel,
  onCompress,
  onUpload,
  uploadLabel = '上传并插入',
  uploadingLabel = '上传中...',
}: PastedImageDialogProps) {
  if (!image) {
    return null;
  }

  const isTooLarge = image.workingFile.size > maxInlineImageBytes;
  const isBusy = image.isCompressing || image.isUploading;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pasted-image-dialog-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/65 p-3 dark:bg-black/75"
      onClick={image.isUploading ? undefined : onCancel}
    >
      <section
        className="w-[min(calc(100vw-1.5rem),34rem)] overflow-hidden rounded-[2px] border border-zinc-200 bg-white text-zinc-950 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-white/10">
          <span className="flex h-8 w-8 items-center justify-center rounded-[1px] bg-emerald-50 text-[#174f38] dark:bg-emerald-200 dark:text-zinc-950">
            <ImageIcon size={17} />
          </span>
          <div className="min-w-0">
            <h2 id="pasted-image-dialog-title" className="text-[length:var(--ui-font-size-xl)] font-semibold">{title}</h2>
            <p className="mt-0.5 text-[length:var(--ui-font-size-sm)] font-medium text-zinc-500 dark:text-zinc-400">
              图片体积：{formatBytes(image.workingFile.size)}
              {image.workingFile.size !== image.originalFile.size ? `，原图 ${formatBytes(image.originalFile.size)}` : ''}
            </p>
          </div>
        </header>

        <div className="grid gap-4 px-4 py-4">
          <div className="flex max-h-[42vh] items-center justify-center overflow-hidden rounded-[2px] border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04]">
            <img src={image.previewUrl} alt={previewAlt} className="max-h-[42vh] w-auto max-w-full object-contain" />
          </div>

          {isTooLarge ? (
            <div className="rounded-[2px] border border-amber-200 bg-amber-50 px-3 py-3 text-[length:var(--ui-font-size-lg)] text-amber-900 dark:border-amber-100/15 dark:bg-amber-300/10 dark:text-amber-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-semibold">{tooLargeMessage}</span>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={onCompress}
                  className="inline-flex h-9 items-center rounded-[1px] bg-[#174f38] px-3 text-[length:var(--ui-font-size-md)] font-bold text-white transition hover:bg-[#123d2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] disabled:cursor-wait disabled:opacity-60 dark:bg-emerald-200 dark:text-zinc-950 dark:hover:bg-emerald-100"
                >
                  {image.isCompressing ? compressingLabel : compressLabel}
                </button>
              </div>
            </div>
          ) : null}

          {image.error ? (
            <p className="rounded-[2px] border border-rose-200 bg-rose-50 px-3 py-2 text-[length:var(--ui-font-size-sm)] font-semibold text-rose-700 dark:border-rose-100/20 dark:bg-rose-300/10 dark:text-rose-100">
              {image.error}
            </p>
          ) : null}
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-950">
          <button
            type="button"
            onClick={onUpload}
            disabled={isTooLarge || isBusy}
            className="inline-flex h-9 items-center rounded-[1px] bg-[#174f38] px-3 text-[length:var(--ui-font-size-md)] font-bold text-white transition hover:bg-[#123d2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-emerald-200 dark:text-zinc-950 dark:hover:bg-emerald-100"
          >
            {image.isUploading ? uploadingLabel : uploadLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={image.isUploading}
            className="inline-flex h-9 items-center rounded-[1px] border border-zinc-200 bg-white px-3 text-[length:var(--ui-font-size-md)] font-semibold text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            取消
          </button>
        </footer>
      </section>
    </div>
  );
}
