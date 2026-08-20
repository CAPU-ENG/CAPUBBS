import { ArrowLeft, Eye, FilePenLine, LoaderCircle, Save, ShieldCheck, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
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
  isAbortError,
  ThreadApiError,
  updateThreadFloor,
  type EditableThreadFloor,
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
        setFloor(editableFloor);
        setTitle(editableFloor.title);
        setEditorValue({ content: editableFloor.text, mode: 'rich' });
        setSignatureIndex(editableFloor.signatureIndex);
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
  ));
  const contentReady = hasEditorContent(editorValue);
  const canSave = Boolean(
    floor
    && contentReady
    && (!isMainPost || title.trim())
    && !isSaving,
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
        attachments: floor.attachments,
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
                <p>{isMainPost ? '修改主楼标题与正文' : `正在修改 #${floor.pid} 楼的回复内容`}</p>
              </div>
              <div className="thread-edit-permission">
                <ShieldCheck size={15} /> 已验证编辑权限
              </div>
            </header>

            <section className="thread-edit-source-card" aria-label="原内容信息">
              <div><span>所属帖子</span><strong>{floor.title}</strong></div>
              <div><span>楼层</span><strong>#{floor.pid}</strong></div>
              <div><span>作者</span><strong>{floor.author}</strong></div>
              <div><span>{floor.updatedAt ? '最后编辑' : '发布时间'}</span><strong>{formatPostTime(floor.updatedAt || floor.createdAt)}</strong></div>
            </section>

            <form className="thread-edit-form" onSubmit={saveEdit}>
              <div className="thread-edit-form-heading">
                <div>
                  <FilePenLine size={18} />
                  <h2>{isMainPost ? '帖子内容' : '楼层内容'}</h2>
                </div>
                <span>{isDirty ? '有尚未保存的修改' : '尚未修改'}</span>
              </div>

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

              <div className="thread-edit-editor-field">
                <span>{isMainPost ? '正文' : '回复内容'}</span>
                <div className="thread-edit-editor-core">
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
              </div>

              <fieldset className="thread-edit-signatures">
                <legend>选择签名档</legend>
                <div>
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
              </fieldset>

              {floor.attachments && (
                <aside className="thread-edit-attachments-note">
                  当前楼层已有 {floor.attachments.split(/\s+/).filter(Boolean).length} 个附件，保存时会保留原附件关联。
                </aside>
              )}

              <footer className="thread-edit-form-footer">
                <button className="thread-edit-discard" onClick={leaveEditor} type="button">放弃修改</button>
                {saveError && <p role="alert">{saveError}</p>}
                <div>
                  <button
                    className="thread-edit-preview-button"
                    disabled={!contentReady}
                    onClick={() => setPreviewOpen(true)}
                    type="button"
                  >
                    <Eye size={15} /> 预览
                  </button>
                  <button className="thread-edit-save-button" disabled={!canSave} type="submit">
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
