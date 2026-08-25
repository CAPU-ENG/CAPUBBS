import { Eye, Paperclip, Trash2, UploadCloud, X } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { getFloorDecorationPath } from '../../data/floorDecoration';
import type { ThreadAuthor } from '../../data/threadDemo';
import { useFloorDecorationEnabled } from '../../hooks/useAssistiveFeatures';
import { useAuthorProfileEnabled } from '../../hooks/useAuthorProfile';
import { useTheme } from '../../hooks/useTheme';
import {
  getRichTextEditorHtmlValue,
  hasRichTextEditorHtmlContent,
  RichTextEditor,
  type RichTextEditorValue,
} from '../editor/RichTextEditor';
import { ThreadFloorPresentation } from './ThreadFloor';
import { ThreadPostContent } from './ThreadPostContent';

export type PostEditorAttachment = {
  id: string;
  name: string;
  size: number;
};

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
  submitCompactLabel,
  submitDisabled = false,
  submitIcon,
  submitLabel,
  uploadingAttachments = false,
}: {
  afterEditor?: ReactNode;
  ariaLabel: string;
  attachmentDialogDescription: string;
  attachmentLabel?: string;
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
  placeholder: string;
  previewDisabled?: boolean;
  secondaryActions?: ReactNode;
  signatureIndex: number;
  status?: string;
  statusIsError?: boolean;
  submitCompactLabel?: string;
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
      className={`reply-editor ${className}`.trim()}
      id={id}
      ref={editorRef}
    >
      <header className="reply-editor-heading">
        <h2 id={headingId}>{heading}</h2>
        <p>{headingMeta}</p>
      </header>

      {beforeEditor}

      <div className="reply-editor-core">
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
        <button
          className="reply-secondary-button"
          disabled={uploadingAttachments}
          onClick={() => setAttachmentDialogOpen(true)}
          type="button"
        >
          <Paperclip size={15} />
          <span className="reply-action-label-full">添加附件</span>
          <span className="reply-action-label-compact">附件</span>
          {attachments.length > 0 && <span className="reply-attachment-count">{attachments.length}</span>}
        </button>
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
          <button className="reply-secondary-button" disabled={previewDisabled} onClick={onPreview} type="button">
            <Eye size={15} />
            预览
          </button>
          {secondaryActions}
          <button className="reply-publish-button" disabled={submitDisabled} onClick={onSubmit} type="button">
            {submitIcon}
            <span className="reply-action-label-full">{submitLabel}</span>
            <span className="reply-action-label-compact">{submitCompactLabel ?? submitLabel}</span>
          </button>
        </div>
      </footer>

      {attachmentDialogOpen && (
        <PostEditorAttachmentDialog
          attachments={attachments}
          description={attachmentDialogDescription}
          formatAttachmentMeta={formatAttachmentMeta}
          onAdd={onAddAttachments}
          onClose={() => setAttachmentDialogOpen(false)}
          onRemove={onRemoveAttachment}
          uploading={uploadingAttachments}
        />
      )}
    </section>
  );
}

export function PostEditorPreviewDialog({
  attachments,
  editorValue,
  formatAttachmentMeta = (attachment) => formatBytes(attachment.size),
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
  editorValue: RichTextEditorValue;
  formatAttachmentMeta?: (attachment: PostEditorAttachment) => string;
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
  const decorationImageSrc = floorDecorationEnabled
    ? getFloorDecorationPath(previewAuthor.floorDecoration, theme)
    : '';
  const previewPostContent = (
    <ThreadPostContent
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

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="reply-preview-backdrop" onClick={onClose} role="presentation">
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
            <h2 id="post-editor-preview-title">{title}</h2>
          </div>
          <button aria-label="关闭内容预览" onClick={onClose} type="button"><X size={18} /></button>
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
            mainAfterContent={attachments.length > 0 ? (
              <ul className="reply-preview-attachments" aria-label="附件预览">
                {attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <Paperclip size={13} />
                    <span>{attachment.name}</span>
                    <small>{formatAttachmentMeta(attachment)}</small>
                  </li>
                ))}
              </ul>
            ) : undefined}
            publishedAt={previewedAt}
            showAuthorProfile={showAuthorProfile}
          />
          {previewExtra}
        </div>
        <footer>
          <button className="reply-secondary-button" onClick={onClose} type="button">返回编辑</button>
        </footer>
      </section>
    </div>
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
}: {
  attachments: PostEditorAttachment[];
  description: string;
  formatAttachmentMeta: (attachment: PostEditorAttachment) => string;
  onAdd: (files: File[]) => void;
  onClose: () => void;
  onRemove: (id: string) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onAdd(Array.from(event.currentTarget.files ?? []));
    event.currentTarget.value = '';
  }

  return (
    <div className="attachment-dialog-backdrop" onClick={onClose} role="presentation">
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
        </button>
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
        <footer><button className="reply-publish-button" onClick={onClose} type="button">完成</button></footer>
      </section>
    </div>
  );
}

export function hasPostEditorContent(value: RichTextEditorValue) {
  if (value.mode !== 'rich') return value.content.trim().length > 0;
  return hasRichTextEditorHtmlContent(value.content);
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
