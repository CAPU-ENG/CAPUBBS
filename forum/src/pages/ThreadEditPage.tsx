import { ArrowLeft, Eye, LoaderCircle, Paperclip, Save, Trash2, UploadCloud, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  getRichTextEditorHtmlValue,
  getRichTextEditorPreviewDocument,
  RichTextEditor,
  type RichTextEditorValue,
} from '../components/editor/RichTextEditor';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import {
  fetchEditableThreadFloor,
  fetchThreadAttachmentInfo,
  isAbortError,
  ThreadApiError,
  uploadThreadAttachment,
  updateThreadFloor,
  type EditableThreadFloor,
  type ThreadAttachmentInfo,
} from '../api/thread';
import { useAuth } from '../context/AuthContext';
import { getLoginPathWithReturnTo } from '../utils/authRoutes';
import { getThreadFloorHref } from '../utils/threadRoutes';

type EditRequest = {
  bid: number;
  pid: number;
  tid: number;
};

const signatureOptions = [
  { label: '不使用签名档', value: 0 },
  { label: '签名档 1', value: 1 },
  { label: '签名档 2', value: 2 },
  { label: '签名档 3', value: 3 },
] as const;

export function ThreadEditPage() {
  const locationSearch = window.location.search;
  const request = useMemo(getEditRequest, [locationSearch]);
  const { status: authStatus } = useAuth();
  const [floor, setFloor] = useState<EditableThreadFloor | null>(null);
  const [title, setTitle] = useState('');
  const [editorValue, setEditorValue] = useState<RichTextEditorValue>({ content: '', mode: 'rich' });
  const [signatureIndex, setSignatureIndex] = useState(0);
  const [attachments, setAttachments] = useState<ThreadAttachmentInfo[]>([]);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [attachmentStatus, setAttachmentStatus] = useState('');
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!request || authStatus === 'loading' || authStatus === 'restoring') return;
    if (authStatus === 'guest') {
      setLoadError('登录后才能编辑帖子或楼层。');
      return;
    }

    const controller = new AbortController();
    setLoadError('');

    void fetchEditableThreadFloor({ ...request, signal: controller.signal }).then(
      (editableFloor) => {
        const attachmentIds = getAttachmentIds(editableFloor.attachments);
        setFloor(editableFloor);
        setTitle(editableFloor.title);
        setEditorValue({ content: editableFloor.text, mode: 'rich' });
        setSignatureIndex(editableFloor.signatureIndex);
        setAttachments(attachmentIds.map((id) => ({ id, name: `附件 #${id}`, size: 0 })));

        void Promise.all(attachmentIds.map(async (id) => {
          try {
            return await fetchThreadAttachmentInfo(id, controller.signal);
          } catch (error) {
            if (isAbortError(error)) throw error;
            return { id, name: `附件 #${id}`, size: 0 };
          }
        })).then((items) => setAttachments((current) => current.map((attachment) => (
          items.find((item) => item.id === attachment.id) ?? attachment
        ))), (error: unknown) => {
          if (!isAbortError(error)) setAttachmentStatus('部分附件信息读取失败，保存时仍会保留关联。');
        });
      },
      (error: unknown) => {
        if (isAbortError(error)) return;
        setLoadError(error instanceof Error ? error.message : '编辑内容读取失败，请稍后重试。');
      },
    );

    return () => controller.abort();
  }, [authStatus, request]);

  const isMainPost = floor?.pid === 1;
  const backHref = request ? getThreadFloorHref(request.bid, request.tid, request.pid) : '/';
  const isDirty = Boolean(floor && (
    title !== floor.title
    || editorValue.content !== floor.text
    || editorValue.mode !== 'rich'
    || signatureIndex !== floor.signatureIndex
    || attachments.map((attachment) => attachment.id).join(' ') !== getAttachmentIds(floor.attachments).join(' ')
  ));
  const contentReady = hasEditorContent(editorValue);
  const canSave = Boolean(
    floor
    && contentReady
    && (!isMainPost || title.trim())
    && !isSaving
    && !isUploadingAttachments,
  );

  useEffect(() => {
    if (!isDirty || isSaving) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [isDirty, isSaving]);

  function leaveEditor() {
    if (!isDirty || window.confirm('放弃尚未保存的修改？')) {
      window.location.href = backHref;
    }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!floor || !canSave) return;

    const html = getRichTextEditorHtmlValue(editorValue);
    if (html.length > 100_000) {
      setSaveError('正文超过 10 万字符，请精简内容或检查是否粘贴了过大的图片。');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    try {
      const saved = await updateThreadFloor({
        attachments: attachments.map((attachment) => attachment.id).join(' '),
        bid: floor.bid,
        pid: floor.pid,
        signatureIndex,
        text: html,
        tid: floor.tid,
        title: isMainPost ? title.trim() : floor.title,
      });
      window.location.href = getThreadFloorHref(saved.bid, saved.tid, saved.pid);
    } catch (error) {
      setSaveError(error instanceof ThreadApiError ? error.message : '保存修改失败，请稍后重试。');
      setIsSaving(false);
    }
  }

  async function addAttachments(files: File[]) {
    if (files.length === 0) return;
    const oversizedFile = files.find((file) => file.size > 100 * 1024 * 1024);
    if (oversizedFile) {
      setAttachmentStatus(`${oversizedFile.name} 超过 100MB，无法上传。`);
      return;
    }

    setAttachmentStatus(files.length > 1 ? `正在上传 ${files.length} 个附件…` : `正在上传 ${files[0].name}…`);
    setIsUploadingAttachments(true);
    try {
      const results = await Promise.allSettled(files.map(uploadThreadAttachment));
      const uploaded = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
      const failed = results.filter((result) => result.status === 'rejected');
      if (uploaded.length > 0) setAttachments((current) => [...current, ...uploaded]);
      setAttachmentStatus(failed.length > 0
        ? `已添加 ${uploaded.length} 个附件，${failed.length} 个上传失败。`
        : `已添加 ${uploaded.length} 个附件`);
    } finally {
      setIsUploadingAttachments(false);
    }
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
    setAttachmentStatus('附件已从当前楼层移除，保存后生效。');
  }

  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#edit-page-title" contextTitle={floor?.title} />
      <main className="thread-edit-page-shell">
        {!request ? (
          <EditRequestState
            backHref="/"
            description="当前地址缺少有效的版块、帖子或楼层编号。"
            title="无法确定编辑对象"
          />
        ) : loadError ? (
          <EditRequestState
            backHref={backHref}
            description={loadError}
            loginHref={authStatus === 'guest' ? getLoginPathWithReturnTo() : undefined}
            title="暂时无法进入编辑"
          />
        ) : !floor ? (
          <section className="thread-edit-request-state" aria-live="polite">
            <LoaderCircle className="thread-edit-spinner" size={22} />
            <h1>正在读取编辑内容</h1>
            <p>系统正在确认楼层信息和编辑权限。</p>
          </section>
        ) : (
          <>
            <header className="thread-edit-heading-card">
              <button aria-label="返回帖子" className="thread-edit-back" onClick={leaveEditor} type="button">
                <ArrowLeft size={19} />
              </button>
              <div className="thread-edit-heading-copy">
                <span>{isMainPost ? '编辑帖子' : '编辑楼层'}</span>
                <h1 id="edit-page-title">{isMainPost ? title.trim() || floor.title : `Re: ${floor.title}`}</h1>
              </div>
            </header>

            <section className="thread-edit-source-card" aria-label="原内容信息">
              <div><span>所属帖子</span><strong>{floor.title}</strong></div>
              <div><span>楼层</span><strong>#{floor.pid}</strong></div>
              <div><span>作者</span><strong>{floor.author}</strong></div>
              <div><span>{floor.updatedAt ? '最后编辑' : '发布时间'}</span><strong>{formatPostTime(floor.updatedAt || floor.createdAt)}</strong></div>
            </section>

            <form className="reply-editor thread-edit-form" onSubmit={saveEdit}>
              <header className="reply-editor-heading">
                <h2>{isMainPost ? '编辑帖子' : '编辑楼层'}</h2>
                <p>{isDirty ? '有尚未保存的修改' : `#${floor.pid} · ${floor.author}`}</p>
              </header>

              {isMainPost && (
                <label className="thread-edit-title-field">
                  <span>帖子标题</span>
                  <input
                    autoComplete="off"
                    maxLength={120}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      setSaveError('');
                    }}
                    placeholder="请输入帖子标题"
                    value={title}
                  />
                  <small>{title.trim().length} / 120</small>
                </label>
              )}

              <div className="reply-editor-core">
                <RichTextEditor
                  ariaLabel={isMainPost ? `编辑《${floor.title}》正文` : `编辑《${floor.title}》第 ${floor.pid} 楼`}
                  onChange={(value) => {
                    setEditorValue(value);
                    setSaveError('');
                  }}
                  placeholder={isMainPost ? '修改帖子正文……' : '修改这一楼的回复内容……'}
                  value={editorValue}
                />
              </div>

              <div aria-label="选择签名档" className="reply-signature-options" role="radiogroup">
                {signatureOptions.map((option) => (
                  <label key={option.value}>
                    <input
                      checked={signatureIndex === option.value}
                      name="thread-edit-signature"
                      onChange={() => {
                        setSignatureIndex(option.value);
                        setSaveError('');
                      }}
                      type="radio"
                      value={option.value}
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              {attachments.length > 0 && (
                <ul className="reply-attachments" aria-label="帖子附件">
                  {attachments.map((attachment) => (
                    <li key={attachment.id}>
                      <Paperclip size={13} />
                      <span>{attachment.name}</span>
                      <small>{attachment.size > 0 ? formatBytes(attachment.size) : `#${attachment.id}`}</small>
                      <button
                        aria-label={`移除附件 ${attachment.name}`}
                        onClick={() => removeAttachment(attachment.id)}
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
                  disabled={isUploadingAttachments}
                  onClick={() => setAttachmentDialogOpen(true)}
                  type="button"
                >
                  <Paperclip size={15} />
                  <span className="reply-action-label-full">添加附件</span>
                  <span className="reply-action-label-compact">附件</span>
                  {attachments.length > 0 && <span className="reply-attachment-count">{attachments.length}</span>}
                </button>
                {(saveError || attachmentStatus) && (
                  <span className={`reply-editor-status ${saveError ? 'thread-edit-error' : ''}`} role={saveError ? 'alert' : 'status'}>
                    {saveError || attachmentStatus}
                  </span>
                )}
                <div className="reply-editor-submit">
                  <button
                    className="reply-secondary-button"
                    disabled={!contentReady}
                    onClick={() => setPreviewOpen(true)}
                    type="button"
                  >
                    <Eye size={15} /> 预览
                  </button>
                  <button className="reply-publish-button" disabled={!canSave} type="submit">
                    {isSaving ? <LoaderCircle className="thread-edit-spinner" size={15} /> : <Save size={15} />}
                    {isSaving ? '保存中' : '保存修改'}
                  </button>
                </div>
              </footer>
            </form>
          </>
        )}
      </main>

      {previewOpen && floor && (
        <EditPreviewDialog
          editorValue={editorValue}
          floor={floor}
          title={isMainPost ? title.trim() || floor.title : `Re: ${floor.title}`}
          onClose={() => setPreviewOpen(false)}
        />
      )}
      {attachmentDialogOpen && (
        <ThreadEditAttachmentDialog
          attachments={attachments}
          onAdd={(files) => void addAttachments(files)}
          onClose={() => setAttachmentDialogOpen(false)}
          onRemove={removeAttachment}
          uploading={isUploadingAttachments}
        />
      )}
    </div>
  );
}

function EditRequestState({
  backHref,
  description,
  loginHref,
  title,
}: {
  backHref: string;
  description: string;
  loginHref?: string;
  title: string;
}) {
  return (
    <section className="thread-edit-request-state">
      <h1>{title}</h1>
      <p>{description}</p>
      <div>
        <a href={backHref}>返回帖子</a>
        {loginHref && <a className="thread-edit-login-link" href={loginHref}>前往登录</a>}
      </div>
    </section>
  );
}

function ThreadEditAttachmentDialog({
  attachments,
  onAdd,
  onClose,
  onRemove,
  uploading,
}: {
  attachments: ThreadAttachmentInfo[];
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
        aria-labelledby="thread-edit-attachment-dialog-title"
        aria-modal="true"
        className="attachment-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header>
          <span><UploadCloud size={17} /></span>
          <h2 id="thread-edit-attachment-dialog-title">文件上传</h2>
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
          <span>文件会立即上传，并在保存修改后关联到当前楼层</span>
        </button>
        <input className="sr-only" disabled={uploading} multiple onChange={handleFileChange} ref={inputRef} type="file" />
        {attachments.length > 0 && (
          <ul>
            {attachments.map((attachment) => (
              <li key={attachment.id}>
                <div>
                  <strong>{attachment.name}</strong>
                  <span>{attachment.size > 0 ? formatBytes(attachment.size) : `附件 #${attachment.id}`}</span>
                </div>
                <button
                  aria-label={`移除附件 ${attachment.name}`}
                  onClick={() => onRemove(attachment.id)}
                  type="button"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <footer>
          <button className="reply-publish-button" onClick={onClose} type="button">完成</button>
        </footer>
      </section>
    </div>
  );
}

function EditPreviewDialog({
  editorValue,
  floor,
  onClose,
  title,
}: {
  editorValue: RichTextEditorValue;
  floor: EditableThreadFloor;
  onClose: () => void;
  title: string;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.classList.add('layer-open');
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.classList.remove('layer-open');
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  return (
    <div className="thread-edit-preview-backdrop" onClick={onClose} role="presentation">
      <section
        aria-labelledby="thread-edit-preview-title"
        aria-modal="true"
        className="thread-edit-preview-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header>
          <div>
            <span>修改预览 · #{floor.pid}</span>
            <h2 id="thread-edit-preview-title">{title}</h2>
          </div>
          <button aria-label="关闭预览" onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className="thread-edit-preview-meta">
          <strong>{floor.author}</strong>
          <span>此处只预览正文，实际发布时间保持不变</span>
        </div>
        <iframe
          onLoad={(event) => resizePreviewFrame(event.currentTarget)}
          sandbox="allow-same-origin"
          srcDoc={getRichTextEditorPreviewDocument(editorValue, { embedded: true })}
          title="编辑内容预览"
        />
      </section>
    </div>
  );
}

function getEditRequest(): EditRequest | null {
  const params = new URLSearchParams(window.location.search);
  const bid = positiveInteger(params.get('bid'));
  const tid = positiveInteger(params.get('tid'));
  const pid = positiveInteger(params.get('pid'));
  return bid && tid && pid ? { bid, pid, tid } : null;
}

function positiveInteger(value: string | null) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

function getAttachmentIds(value: string) {
  return value.split(/\s+/).map((id) => id.trim()).filter(Boolean);
}

function hasEditorContent(value: RichTextEditorValue) {
  if (value.mode === 'markdown') return Boolean(value.content.trim());
  const container = document.createElement('div');
  container.innerHTML = value.content;
  return Boolean((container.textContent ?? '').trim() || container.querySelector('img, video, iframe'));
}

function formatPostTime(value: string) {
  if (!value) return '时间未知';
  if (/^\d{10,13}$/.test(value)) {
    const timestamp = Number(value) * (value.length === 10 ? 1000 : 1);
    const date = new Date(timestamp);
    if (!Number.isNaN(date.getTime())) {
      const pad = (part: number) => String(part).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
  }
  return value.replace(/^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(?:\d{2}秒)?$/, '$1-$2-$3 $4:$5');
}

function resizePreviewFrame(frame: HTMLIFrameElement) {
  const previewDocument = frame.contentDocument;
  if (!previewDocument) return;
  const updateHeight = () => {
    frame.style.height = `${Math.max(180, previewDocument.documentElement.scrollHeight)}px`;
  };
  updateHeight();
  previewDocument.querySelectorAll('img').forEach((image) => {
    if (!image.complete) image.addEventListener('load', updateHeight, { once: true });
  });
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
