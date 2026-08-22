import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  getRichTextEditorHtmlValue,
  type RichTextEditorValue,
} from '../components/editor/RichTextEditor';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import {
  formatPostEditorBytes,
  hasPostEditorContent,
  PostEditor,
  PostEditorPreviewDialog,
  PostEditorTitleField,
} from '../components/thread/PostEditor';
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
import { getLoginPathWithReturnTo, getRegisterPathWithReturnTo } from '../utils/authRoutes';
import { getThreadFloorHref } from '../utils/threadRoutes';

type EditRequest = {
  bid: number;
  pid: number;
  tid: number;
};

export function ThreadEditPage() {
  const locationSearch = window.location.search;
  const request = useMemo(getEditRequest, [locationSearch]);
  const { status: authStatus } = useAuth();
  const [floor, setFloor] = useState<EditableThreadFloor | null>(null);
  const [title, setTitle] = useState('');
  const [editorValue, setEditorValue] = useState<RichTextEditorValue>({ content: '', mode: 'rich' });
  const [signatureIndex, setSignatureIndex] = useState(0);
  const [attachments, setAttachments] = useState<ThreadAttachmentInfo[]>([]);
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
  const contentReady = hasPostEditorContent(editorValue);
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

  async function saveEdit() {
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
            registerHref={authStatus === 'guest' ? getRegisterPathWithReturnTo() : undefined}
            title="暂时无法进入编辑"
          />
        ) : !floor ? (
          <section className="thread-edit-request-state" aria-live="polite">
            <LoaderCircle className="thread-edit-spinner" size={22} />
            <h1>正在读取编辑内容</h1>
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

            <PostEditor
              ariaLabel={isMainPost ? `编辑《${floor.title}》正文` : `编辑《${floor.title}》第 ${floor.pid} 楼`}
              attachmentDialogDescription="文件会立即上传，并在保存修改后关联到当前楼层"
              attachmentLabel="帖子附件"
              attachments={attachments}
              beforeEditor={isMainPost ? (
                <PostEditorTitleField
                  onChange={(value) => {
                    setTitle(value);
                    setSaveError('');
                  }}
                  value={title}
                />
              ) : undefined}
              className="thread-edit-form"
              editorValue={editorValue}
              formatAttachmentMeta={(attachment) => attachment.size > 0
                ? formatPostEditorBytes(attachment.size)
                : `附件 #${attachment.id}`}
              heading={isMainPost ? '编辑帖子' : '编辑楼层'}
              headingMeta={isDirty ? '有尚未保存的修改' : `#${floor.pid} · ${floor.author}`}
              name="thread-edit-signature"
              onAddAttachments={(files) => void addAttachments(files)}
              onChange={(value) => {
                setEditorValue(value);
                setSaveError('');
              }}
              onPreview={() => setPreviewOpen(true)}
              onRemoveAttachment={removeAttachment}
              onSignatureChange={(value) => {
                setSignatureIndex(value);
                setSaveError('');
              }}
              onSubmit={() => void saveEdit()}
              placeholder={isMainPost ? '修改帖子正文……' : '修改这一楼的回复内容……'}
              previewDisabled={!contentReady}
              signatureIndex={signatureIndex}
              status={saveError || attachmentStatus}
              statusIsError={Boolean(saveError)}
              submitCompactLabel={isSaving ? '保存中' : '保存'}
              submitDisabled={!canSave}
              submitIcon={isSaving ? <LoaderCircle className="thread-edit-spinner" size={15} /> : <Save size={15} />}
              submitLabel={isSaving ? '保存中' : '保存修改'}
              uploadingAttachments={isUploadingAttachments}
            />
          </>
        )}
      </main>

      {previewOpen && floor && (
        <PostEditorPreviewDialog
          attachments={attachments}
          editorValue={editorValue}
          formatAttachmentMeta={(attachment) => attachment.size > 0
            ? formatPostEditorBytes(attachment.size)
            : `附件 #${attachment.id}`}
          label={isMainPost ? '帖子修改预览' : `楼层修改预览 · #${floor.pid}`}
          onClose={() => setPreviewOpen(false)}
          previewAuthor={{ avatar: floor.previewAvatar, name: floor.author }}
          previewFloor={floor.pid}
          previewSignature={signatureIndex > 0 ? floor.previewSignatures[signatureIndex - 1] : undefined}
          previewedAt={formatPostTime(floor.updatedAt || floor.createdAt)}
          title={isMainPost ? title.trim() || floor.title : `Re: ${floor.title}`}
        />
      )}
    </div>
  );
}

function EditRequestState({
  backHref,
  description,
  loginHref,
  registerHref,
  title,
}: {
  backHref: string;
  description: string;
  loginHref?: string;
  registerHref?: string;
  title: string;
}) {
  return (
    <section className="thread-edit-request-state">
      <h1>{title}</h1>
      <p>{description}</p>
      <div>
        <a href={backHref}>返回帖子</a>
        {loginHref && <a className="thread-edit-login-link" href={loginHref}>前往登录</a>}
        {registerHref && <a className="thread-edit-register-link" href={registerHref}>注册账号</a>}
      </div>
    </section>
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
