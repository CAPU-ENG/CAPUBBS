import { DialogLayer, DialogPresence } from '../layout/DialogPresence';
import { Eye, Moon, Paperclip, Sun, Trash2, UploadCloud, X } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import type { ThreadAttachmentUploadProgress } from '../../api/thread';
import { getFloorDecorationPath } from '../../data/floorDecoration';
import type { ThreadAttachment, ThreadAuthor } from '../../data/thread';
import { useFloorDecorationEnabled } from '../../hooks/useAssistiveFeatures';
import { useAuthorProfileEnabled } from '../../hooks/useAuthorProfile';
import { useTheme } from '../../hooks/useTheme';
import { parseForumGrayscaleTextColor } from '../../utils/forumGrayscaleTextColor';
import { applyTheme, readThemeSnapshot, type Theme } from '../../utils/theme';
import { getTitleIndentationClassName } from '../../utils/titleIndentation';
import {
  getRichTextEditorHtmlValue,
  hasRichTextEditorHtmlContent,
  RichTextEditor,
  type RichTextEditorValue,
} from '../editor/RichTextEditor';
import { ThreadFloorActions, ThreadFloorPresentation } from './ThreadFloor';
import { ThreadPostContent } from './ThreadPostContent';
import { Button } from '../Button';

export type PostEditorAttachment = Pick<ThreadAttachment, 'id' | 'name' | 'size'>;

export type PostEditorPreviewAuthor = ThreadAuthor;

export const AUTO_SAVE_STATUS = '自动保存至草稿箱';

const signatureOptions = [
  { label: '不使用签名档', value: 0 },
  { label: '签名档 1', value: 1 },
  { label: '签名档 2', value: 2 },
  { label: '签名档 3', value: 3 },
] as const;

export function PostEditorTitleField({
  label = '帖子标题',
  maxLength = 40,
  onChange,
  placeholder = '请输入帖子标题',
  required = false,
  value,
}: {
  label?: string;
  maxLength?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="post-editor-title-field">
      {label ? <span>{label}</span> : null}
      <input
        autoComplete="off"
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
      <small>{value.trim().length} / {maxLength}</small>
    </label>
  );
}

export function PostEditor({
  afterEditor,
  ariaLabel,
  attachmentDialogDescription,
  attachmentLabel = '待上传附件',
  attachmentUploadProgress,
  attachments,
  beforeEditor,
  className = '',
  editorRef,
  editorValue,
  focusRequest,
  formatAttachmentMeta = (attachment) => formatBytes(attachment.size),
  heading,
  headingMeta,
  id,
  name,
  onAddAttachments,
  onChange,
  onPreview,
  onRemoveAttachment,
  onSignatureChange,
  onSubmit,
  placeholder,
  previewDisabled = false,
  secondaryActions,
  signatureIndex,
  status,
  statusIsError = false,
  submitDisabled = false,
  submitIcon,
  submitLabel,
  uploadingAttachments = false,
}: {
  afterEditor?: ReactNode;
  ariaLabel: string;
  attachmentDialogDescription: string;
  attachmentLabel?: string;
  attachmentUploadProgress?: ThreadAttachmentUploadProgress | null;
  attachments: PostEditorAttachment[];
  beforeEditor?: ReactNode;
  className?: string;
  editorRef?: RefObject<HTMLElement | null>;
  editorValue: RichTextEditorValue;
  focusRequest?: number;
  formatAttachmentMeta?: (attachment: PostEditorAttachment) => string;
  heading: string;
  headingMeta: string;
  id?: string;
  name: string;
  onAddAttachments: (files: File[]) => void;
  onChange: (value: RichTextEditorValue) => void;
  onPreview: () => void;
  onRemoveAttachment: (id: string) => void;
  onSignatureChange: (value: number) => void;
  onSubmit: () => void;
  placeholder?: string;
  previewDisabled?: boolean;
  secondaryActions?: ReactNode;
  signatureIndex: number;
  status?: string;
  statusIsError?: boolean;
  submitDisabled?: boolean;
  submitIcon: ReactNode;
  submitLabel: string;
  uploadingAttachments?: boolean;
}) {
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const headingId = id ? `${id}-title` : `${name}-editor-title`;
  const statusIsAutoSave = status === AUTO_SAVE_STATUS;

  return (
    <section
      aria-labelledby={headingId}
      className={`forum-card reply-editor ${className}`.trim()}
      id={id}
      ref={editorRef}
    >
      <header className="reply-editor-heading">
        <h2 id={headingId}>{heading}</h2>
        <p>{headingMeta}</p>
      </header>

      {beforeEditor}

      <div className="reply-editor-core rich-text-editor-field">
        <RichTextEditor
          ariaLabel={ariaLabel}
          focusRequest={focusRequest}
          onChange={onChange}
          placeholder={placeholder}
          value={editorValue}
        />
      </div>

      {afterEditor}

      <div aria-label="选择签名档" className="reply-signature-options" role="radiogroup">
        {signatureOptions.map((option) => (
          <label key={option.value}>
            <input
              checked={signatureIndex === option.value}
              name={name}
              onChange={() => onSignatureChange(option.value)}
              type="radio"
              value={option.value}
            />
            {option.label}
          </label>
        ))}
      </div>

      {attachments.length > 0 && (
        <ul className="reply-attachments" aria-label={attachmentLabel}>
          {attachments.map((attachment) => (
            <li key={attachment.id}>
              <Paperclip size={13} />
              <span>{attachment.name}</span>
              <small>{formatAttachmentMeta(attachment)}</small>
              <button
                aria-label={`移除附件 ${attachment.name}`}
                onClick={() => onRemoveAttachment(attachment.id)}
                type="button"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className="reply-editor-footer">
        <Button
          onClick={() => setAttachmentDialogOpen(true)}
          type="button"
        >
          <Paperclip size={15} />
          添加附件
          {attachments.length > 0 && <span className="reply-attachment-count">{attachments.length}</span>}
        </Button>
        {status && (
          <span
            className={`reply-editor-status ${statusIsError ? 'thread-edit-error' : ''} ${statusIsAutoSave ? 'reply-editor-status-auto-save' : ''}`.trim()}
            role={statusIsError ? 'alert' : 'status'}
          >
            {statusIsAutoSave && <span aria-hidden="true" className="reply-editor-auto-save-dot">·</span>}
            {status}
          </span>
        )}
        <div className="reply-editor-submit">
          <Button disabled={previewDisabled} onClick={onPreview} type="button">
            <Eye size={15} />
            预览
          </Button>
          {secondaryActions}
          <Button variant="primary" disabled={submitDisabled} onClick={onSubmit} type="button">
            {submitIcon}
            {submitLabel}
          </Button>
        </div>
      </footer>

      <DialogPresence>{attachmentDialogOpen && (
        <PostEditorAttachmentDialog
          attachments={attachments}
          description={attachmentDialogDescription}
          formatAttachmentMeta={formatAttachmentMeta}
          onAdd={onAddAttachments}
          onClose={() => setAttachmentDialogOpen(false)}
          onRemove={onRemoveAttachment}
          uploading={uploadingAttachments}
          progress={attachmentUploadProgress}
        />
      )}</DialogPresence>
    </section>
  );
}

export type PostEditorPreviewConfirm = {
  icon?: ReactNode;
  label: string;
  onConfirm: () => void;
};

export function PostEditorPreviewDialog({
  attachments,
  confirm,
  editorValue,
  label,
  onClose,
  previewAuthor,
  previewExtra,
  previewFloor,
  previewSignature,
  previewedAt,
  title,
}: {
  attachments: PostEditorAttachment[];
  confirm?: PostEditorPreviewConfirm;
  editorValue: RichTextEditorValue;
  label: string;
  onClose: () => void;
  previewAuthor: PostEditorPreviewAuthor;
  previewExtra?: ReactNode;
  previewFloor: number;
  previewSignature?: string;
  previewedAt: string;
  title: string;
}) {
  const showAuthorProfile = useAuthorProfileEnabled();
  const floorDecorationEnabled = useFloorDecorationEnabled();
  const { theme } = useTheme();
  const [previewTheme, setPreviewTheme] = useState<Theme>(theme);
  const decorationImageSrc = floorDecorationEnabled
    ? getFloorDecorationPath(previewAuthor.floorDecoration, previewTheme)
    : '';
  const previewPostContent = (
    <ThreadPostContent
      attachments={attachments}
      bodyClassName="thread-floor-body reply-preview-floor-body"
      bodyHtml={getRichTextEditorHtmlValue(editorValue)}
      floor={previewFloor}
      signatureHtml={previewSignature}
    />
  );

  useEffect(() => {
    document.body.classList.add('reply-preview-open');
    return () => document.body.classList.remove('reply-preview-open');
  }, []);

  // Preview theme is applied to the page only while the dialog is open; the saved preference is untouched.
  useEffect(() => {
    applyTheme(previewTheme);
  }, [previewTheme]);

  useEffect(() => () => applyTheme(readThemeSnapshot().theme), []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <DialogLayer className="reply-preview-backdrop" onClick={onClose} role="presentation">
      <section
        aria-labelledby="post-editor-preview-title"
        aria-modal="true"
        className={`reply-preview-dialog${showAuthorProfile ? ' reply-preview-dialog-author-profile' : ''}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header>
          <div>
            <span>{label}</span>
            <h2 className={getTitleIndentationClassName(title)} id="post-editor-preview-title">{title}</h2>
          </div>
          <div className="reply-preview-header-actions">
            <button
              aria-label={previewTheme === 'dark' ? '切换到日间模式' : '切换到夜间模式'}
              onClick={() => setPreviewTheme((current) => current === 'dark' ? 'light' : 'dark')}
              title={previewTheme === 'dark' ? '日间模式' : '夜间模式'}
              type="button"
            >
              {previewTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button aria-label="关闭内容预览" onClick={onClose} type="button"><X size={18} /></button>
          </div>
        </header>
        <div className="reply-preview-stage">
          <ThreadFloorPresentation
            author={previewAuthor}
            avatarRail={(
              <div className="thread-avatar-rail reply-preview-avatar-rail">
                <div className="thread-avatar-button"><img src={previewAuthor.avatar} alt="" /></div>
              </div>
            )}
            className="reply-preview-floor"
            content={previewPostContent}
            decorationImageSrc={decorationImageSrc}
            floor={previewFloor}
            floorIndex={<span className="thread-floor-index">#{previewFloor}</span>}
            mainAfterContent={(
              <ThreadFloorActions
                canDelete
                canEdit
                canQuote
                canReply
                decorative
              />
            )}
            publishedAt={previewedAt}
            showAuthorProfile={showAuthorProfile}
          />
          {previewExtra}
        </div>
        <footer>
          {confirm && <p className="reply-preview-color-notice" role="status">内容含自定义颜色，请切换日间/夜间模式检查显示效果</p>}
          <Button onClick={onClose} type="button">返回编辑</Button>
          {confirm && (
            <Button variant="primary" onClick={confirm.onConfirm} type="button">
              {confirm.icon}
              {confirm.label}
            </Button>
          )}
        </footer>
      </section>
    </DialogLayer>
  );
}

function PostEditorAttachmentDialog({
  attachments,
  description,
  formatAttachmentMeta,
  onAdd,
  onClose,
  onRemove,
  uploading,
  progress,
}: {
  attachments: PostEditorAttachment[];
  description: string;
  formatAttachmentMeta: (attachment: PostEditorAttachment) => string;
  onAdd: (files: File[]) => void;
  onClose: () => void;
  onRemove: (id: string) => void;
  uploading: boolean;
  progress?: ThreadAttachmentUploadProgress | null;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileError, setFileError] = useState('');

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    const oversizedFile = files.find((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFile) {
      setFileError(`${oversizedFile.name} 超过 5MB，无法上传。`);
      return;
    }
    setFileError('');
    onAdd(files);
  }

  return (
    <DialogLayer className="attachment-dialog-backdrop" onClick={onClose} role="presentation">
      <section
        aria-labelledby="post-editor-attachment-dialog-title"
        aria-modal="true"
        className="attachment-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header>
          <span><UploadCloud size={17} /></span>
          <h2 id="post-editor-attachment-dialog-title">文件上传</h2>
          <button aria-label="关闭文件上传" onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <button
          className="attachment-drop-button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <UploadCloud size={22} />
          <strong>{uploading ? '正在上传附件…' : '选择一个或多个文件'}</strong>
          <span>{description}</span>
          <span>单个文件不超过 5MB</span>
        </button>
        {uploading && progress && (
          <div className="attachment-upload-progress">
            <div role="status">正在上传第 {progress.fileIndex} / {progress.fileCount} 个文件</div>
            <strong className="attachment-upload-name" title={progress.fileName}>{progress.fileName}</strong>
            <progress aria-label="当前文件上传进度" max={100} value={progress.percent} />
            <div className="attachment-upload-details">
              <span>{progress.percent}%</span>
              <span>{formatTransferBytes(progress.loaded)} / {formatTransferBytes(progress.total)}</span>
              <span>{formatTransferBytes(progress.bytesPerSecond)}/s</span>
            </div>
            {progress.percent === 100 && <span>正在处理附件…</span>}
          </div>
        )}
        {fileError && <p className="reply-editor-status thread-edit-error" role="alert">{fileError}</p>}
        <input className="sr-only" disabled={uploading} multiple onChange={handleFileChange} ref={inputRef} type="file" />
        {attachments.length > 0 && (
          <ul>
            {attachments.map((attachment) => (
              <li key={attachment.id}>
                <div>
                  <strong>{attachment.name}</strong>
                  <span>{formatAttachmentMeta(attachment)}</span>
                </div>
                <button aria-label={`移除附件 ${attachment.name}`} onClick={() => onRemove(attachment.id)} type="button">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <footer><Button variant="primary" onClick={onClose} type="button">完成</Button></footer>
      </section>
    </DialogLayer>
  );
}

export function hasPostEditorContent(value: RichTextEditorValue) {
  if (value.mode !== 'rich') return value.content.trim().length > 0;
  return hasRichTextEditorHtmlContent(value.content);
}

const CSS_COLOR_DECLARATION = /(?:^|[;{\s])(?:color|background(?:-color)?)\s*:/i;
const BBCODE_COLOR = /\[(?:color|bgcolor|backcolor)=([^\]]+)\]/gi;

function isCustomTextColor(value: string | null | undefined) {
  const color = String(value ?? '').trim();
  return Boolean(color) && !/^(?:inherit|initial|unset|revert|currentcolor)$/i.test(color)
    && !parseForumGrayscaleTextColor(color);
}

function isCustomBackground(value: string | null | undefined) {
  const background = String(value ?? '').trim();
  return Boolean(background) && !/^(?:none|transparent|inherit|initial|unset|revert)$/i.test(background);
}

// Grayscale text colors are inverted automatically in dark mode, so only real colors and backgrounds count.
export function hasPostEditorCustomColors(value: RichTextEditorValue) {
  for (const match of value.content.matchAll(BBCODE_COLOR)) {
    if (match[0].toLowerCase().startsWith('[color=') ? isCustomTextColor(match[1]) : isCustomBackground(match[1])) return true;
  }

  const template = document.createElement('template');
  template.innerHTML = getRichTextEditorHtmlValue(value);
  const fragment = template.content;
  if (Array.from(fragment.querySelectorAll('style')).some((style) => CSS_COLOR_DECLARATION.test(style.textContent ?? ''))) return true;

  return Array.from(fragment.querySelectorAll<HTMLElement>('[color], [bgcolor], [style]')).some((element) => (
    isCustomTextColor(element.getAttribute('color'))
    || isCustomBackground(element.getAttribute('bgcolor'))
    || isCustomTextColor(element.style.color)
    || isCustomBackground(element.style.backgroundColor)
    || isCustomBackground(element.style.backgroundImage)
  ));
}

export function formatPostEditorPreviewTimestamp(value: Date) {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
}

export function formatPostEditorBytes(bytes: number) {
  return formatBytes(bytes);
}

function formatBytes(bytes: number) {
  if (bytes <= 0) return '大小未知';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatTransferBytes(bytes: number) {
  if (bytes < 1024) return `${Math.max(0, Math.round(bytes))} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
