import { DialogPresence } from '../components/layout/DialogPresence';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getRichTextEditorHtmlValue,
  getRichTextEditorStorageValue,
  type RichTextEditorValue,
} from '../components/editor/RichTextEditor';
import { AppBackground } from '../components/layout/AppBackground';
import { LoadingSpinner as LoaderCircle } from '../components/layout/LoadingSpinner';
import { LoadingState } from '../components/layout/LoadingState';
import { TopBar } from '../components/layout/TopBar';
import {
  formatPostEditorBytes,
  hasPostEditorContent,
  PostEditor,
  PostEditorPreviewDialog,
  hasPostEditorCustomColors,
  PostEditorTitleField,
} from '../components/thread/PostEditor';
import {
  fetchEditableThreadFloor,
  fetchThreadAttachmentInfo,
  fetchThreadDetail,
  isAbortError,
  ThreadApiError,
  uploadThreadAttachments,
  type ThreadAttachmentUploadProgress,
  updateThreadFloor,
  type EditableThreadFloor,
  type ThreadAttachmentInfo,
} from '../api/thread';
import { useAuth } from '../context/AuthContext';
import { useAutoSaveEnabled } from '../hooks/useAssistiveFeatures';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { toForumHref } from '../utils/forumBasePath';
import { getLoginPathWithReturnTo, getRegisterPathWithReturnTo } from '../utils/authRoutes';
import { normalizeFloorQuotesForLegacyStorage } from '../utils/floorQuote';
import { getThreadFloorHref, getThreadPageForFloor } from '../utils/threadRoutes';
import {
  deleteStoredThreadEditDraft,
  readStoredThreadEditDraft,
  saveStoredThreadEditDraft,
  type StoredThreadEditDraft,
} from '../utils/threadEditDraftStorage';
import { getTitleIndentationClassName } from '../utils/titleIndentation';
import { useConfirmDialog } from '../components/ConfirmDialog';
import { DraftRestoreCard } from '../components/thread/DraftRestoreCard';

const AUTO_SAVE_DELAY_MS = 1_200;

type EditRequest = {
  bid: number;
  pid: number;
  tid: number;
};

export function ThreadEditPage() {
  const { confirm, confirmDialog } = useConfirmDialog();
  const leavingConfirmedRef = useRef(false);
  const locationSearch = window.location.search;
  const request = useMemo(getEditRequest, [locationSearch]);
  const { status: authStatus, viewer } = useAuth();
  const autoSaveEnabled = useAutoSaveEnabled();
  const ownerKey = viewer?.username ?? null;
  const [floor, setFloor] = useState<EditableThreadFloor | null>(null);
  const [draftLoadComplete, setDraftLoadComplete] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<StoredThreadEditDraft | null>(null);
  const [storedDraftSnapshot, setStoredDraftSnapshot] = useState<string | null>(null);
  const [isDeletingDraft, setIsDeletingDraft] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const lastAutoSaveAttemptRef = useRef<string | null>(null);
  const [title, setTitle] = useState('');
  const [editorValue, setEditorValue] = useState<RichTextEditorValue>({ content: '', mode: 'rich' });
  const [signatureIndex, setSignatureIndex] = useState(0);
  const [attachments, setAttachments] = useState<ThreadAttachmentInfo[]>([]);
  const [attachmentStatus, setAttachmentStatus] = useState('');
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const [attachmentUploadProgress, setAttachmentUploadProgress] = useState<ThreadAttachmentUploadProgress | null>(null);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewConfirming, setPreviewConfirming] = useState(false);

  useEffect(() => {
    if (!request || authStatus === 'loading' || authStatus === 'restoring') return;
    if (authStatus === 'guest') {
      setLoadError('登录后才能编辑帖子或楼层。');
      return;
    }

    const controller = new AbortController();
    setLoadError('');
    setFloor(null);

    void fetchThreadDetail({
      authorOnly: false,
      bid: request.bid,
      decoration: false,
      page: getThreadPageForFloor(request.pid),
      prefetch: true,
      signal: controller.signal,
      tagMedalDisplay: false,
      tid: request.tid,
    }).then((thread) => {
      if (thread.locked) throw new ThreadApiError('主题已锁定。');
      return fetchEditableThreadFloor({ ...request, signal: controller.signal });
    }).then(
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

  useEffect(() => {
    if (!floor) return;
    setDraftLoadComplete(false);
    setPendingDraft(null);
    setStoredDraftSnapshot(null);
    lastAutoSaveAttemptRef.current = null;
    if (!ownerKey) {
      setDraftLoadComplete(true);
      return;
    }

    let active = true;
    void readStoredThreadEditDraft(floor, ownerKey).then((draft) => {
      if (!active || !draft) return;
      if (makeDraftSnapshot(draft) === makeFloorSnapshot(floor)) {
        void deleteStoredThreadEditDraft(floor, ownerKey).catch(() => undefined);
        return;
      }
      setPendingDraft(draft);
    }, () => undefined).finally(() => {
      if (active) setDraftLoadComplete(true);
    });

    return () => { active = false; };
  }, [floor, ownerKey]);

  const isMainPost = floor?.pid === 1;
  const backHref = request ? getThreadFloorHref(request.bid, request.tid, request.pid) : toForumHref('/');
  const displayTitle = floor ? (isMainPost ? title.trim() || floor.title : floor.title) : '';
  useDocumentTitle(!request
    ? '无法确定编辑对象'
    : loadError
      ? '暂时无法进入编辑'
      : floor ? displayTitle : '正在读取编辑内容');
  const currentSnapshot = makeSnapshot(title, editorValue, signatureIndex, attachments.map((attachment) => attachment.id));
  const isDirty = Boolean(floor && currentSnapshot !== makeFloorSnapshot(floor));
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
      if (leavingConfirmedRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [isDirty, isSaving]);

  useEffect(() => {
    if (
      !autoSaveEnabled
      || !floor
      || !ownerKey
      || !draftLoadComplete
      || pendingDraft
      || isSaving
      || isSavingDraft
      || isUploadingAttachments
      || currentSnapshot === lastAutoSaveAttemptRef.current
    ) return;

    if (!isDirty) {
      if (storedDraftSnapshot === null) return;
      lastAutoSaveAttemptRef.current = currentSnapshot;
      void deleteStoredThreadEditDraft(floor, ownerKey).then(() => setStoredDraftSnapshot(null), () => undefined);
      return;
    }

    const timer = window.setTimeout(() => { void saveDraft(); }, AUTO_SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [
    autoSaveEnabled,
    currentSnapshot,
    draftLoadComplete,
    floor,
    isDirty,
    isSaving,
    isSavingDraft,
    isUploadingAttachments,
    ownerKey,
    pendingDraft,
    storedDraftSnapshot,
  ]);

  async function saveDraft() {
    if (!floor || !ownerKey) return;
    const snapshot = currentSnapshot;
    lastAutoSaveAttemptRef.current = snapshot;
    setIsSavingDraft(true);
    try {
      await saveStoredThreadEditDraft({
        attachments,
        bid: floor.bid,
        editor: getRichTextEditorStorageValue(editorValue),
        excerpt: getDraftExcerpt(editorValue, attachments),
        pid: floor.pid,
        signatureIndex,
        tid: floor.tid,
        title,
      }, ownerKey);
      setStoredDraftSnapshot(snapshot);
    } catch {
      // The next edit retries; the beforeunload warning still protects unsaved changes.
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function clearStoredDraft() {
    if (!floor || !ownerKey) return;
    try {
      await deleteStoredThreadEditDraft(floor, ownerKey);
    } catch {
      // A stale draft is discarded on the next visit once it matches the saved floor.
    }
  }

  function restorePendingDraft() {
    if (!floor || !pendingDraft) return;
    const draft = pendingDraft;
    const restoredTitle = isMainPost ? draft.title : floor.title;
    setTitle(restoredTitle);
    setEditorValue(draft.editor);
    setSignatureIndex(draft.signatureIndex);
    setAttachments(draft.attachments);
    const snapshot = makeSnapshot(
      restoredTitle,
      draft.editor,
      draft.signatureIndex,
      draft.attachments.map((attachment) => attachment.id),
    );
    setStoredDraftSnapshot(snapshot);
    lastAutoSaveAttemptRef.current = snapshot;
    setPendingDraft(null);
    setSaveError('');
  }

  async function removePendingDraft() {
    if (!floor || !pendingDraft || isDeletingDraft) return;
    if (!(await confirm({
      cancelLabel: '取消',
      confirmLabel: '删除',
      danger: true,
      message: '删除后无法恢复。',
      title: '删除草稿',
    }))) return;

    setIsDeletingDraft(true);
    try {
      await deleteStoredThreadEditDraft(floor, ownerKey);
      setPendingDraft(null);
      setSaveError('');
    } catch {
      setSaveError('草稿删除失败，请稍后重试');
    } finally {
      setIsDeletingDraft(false);
    }
  }

  async function leaveEditor() {
    if (isDirty && !(await confirm({ title: '放弃修改', message: '放弃尚未保存的修改？', confirmLabel: '放弃', danger: true }))) return;
    leavingConfirmedRef.current = true;
    if (isDirty) await clearStoredDraft();
    window.location.href = backHref;
  }

  async function saveEdit() {
    if (!floor || !canSave) return;

    const html = normalizeFloorQuotesForLegacyStorage(getRichTextEditorHtmlValue(editorValue));
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
      await clearStoredDraft();
      window.location.href = getThreadFloorHref(saved.bid, saved.tid, saved.pid);
    } catch (error) {
      setSaveError(error instanceof ThreadApiError ? error.message : '保存修改失败，请稍后重试。');
      setIsSaving(false);
    }
  }

  async function addAttachments(files: File[]) {
    if (files.length === 0 || isUploadingAttachments) return;
    const oversizedFile = files.find((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFile) {
      setAttachmentStatus(`${oversizedFile.name} 超过 5MB，无法上传。`);
      return;
    }

    setAttachmentStatus(files.length > 1 ? `正在上传 ${files.length} 个附件…` : `正在上传 ${files[0].name}…`);
    setIsUploadingAttachments(true);
    try {
      const results = await uploadThreadAttachments(files, setAttachmentUploadProgress);
      const uploaded = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
      const failed = results.filter((result) => result.status === 'rejected');
      if (uploaded.length > 0) setAttachments((current) => [...current, ...uploaded]);
      setAttachmentStatus(failed.length > 0
        ? `已添加 ${uploaded.length} 个附件，${failed.length} 个上传失败。`
        : `已添加 ${uploaded.length} 个附件`);
    } finally {
      setIsUploadingAttachments(false);
      setAttachmentUploadProgress(null);
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
            backHref={toForumHref('/')}
            description="当前地址缺少有效的版块、帖子或楼层编号。"
            title="无法确定编辑对象"
          />
        ) : loadError ? (
          <EditRequestState
            backHref={backHref}
            description={loadError}
            onRetry={() => window.location.reload()}
            loginHref={authStatus === 'guest' ? getLoginPathWithReturnTo() : undefined}
            registerHref={authStatus === 'guest' ? getRegisterPathWithReturnTo() : undefined}
            title="暂时无法进入编辑"
          />
        ) : !floor || !draftLoadComplete ? (
          <LoadingState label="正在读取编辑内容" />
        ) : (
          <>
            <header className="thread-edit-heading-card">
              <button aria-label="返回帖子" className="thread-edit-back" onClick={() => void leaveEditor()} type="button">
                <ArrowLeft size={19} />
              </button>
              <div className="thread-edit-heading-copy">
                <span>{isMainPost ? '编辑帖子' : '编辑楼层'}</span>
                <h1 className={getTitleIndentationClassName(displayTitle)} id="edit-page-title">{displayTitle}</h1>
              </div>
            </header>

            {pendingDraft ? (
              <DraftRestoreCard
                className="thread-edit-form"
                deleting={isDeletingDraft}
                error={saveError || undefined}
                excerpt={pendingDraft.excerpt}
                heading={isMainPost ? pendingDraft.title || floor.title : `#${floor.pid} · ${floor.title}`}
                id="edit-draft-restore"
                onDelete={() => void removePendingDraft()}
                onRestore={restorePendingDraft}
                updatedAt={pendingDraft.updatedAt}
              />
            ) : (
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
                headingMeta={isDirty
                  ? storedDraftSnapshot === currentSnapshot ? '修改已暂存在本机' : '有尚未保存的修改'
                  : `#${floor.pid} · ${floor.author}`}
                name="thread-edit-signature"
                onAddAttachments={(files) => void addAttachments(files)}
                onChange={(value) => {
                  setEditorValue(value);
                  setSaveError('');
                }}
                onPreview={() => {
                  setPreviewConfirming(false);
                  setPreviewOpen(true);
                }}
                onRemoveAttachment={removeAttachment}
                onSignatureChange={(value) => {
                  setSignatureIndex(value);
                  setSaveError('');
                }}
                onSubmit={() => {
                  if (canSave && contentReady && hasPostEditorCustomColors(editorValue)) {
                    setPreviewConfirming(true);
                    setPreviewOpen(true);
                  } else void saveEdit();
                }}
                placeholder={isMainPost ? '修改帖子正文……' : '修改这一楼的回复内容……'}
                previewDisabled={!contentReady}
                signatureIndex={signatureIndex}
                status={saveError || attachmentStatus}
                statusIsError={Boolean(saveError)}
                submitDisabled={!canSave}
                submitIcon={isSaving ? <LoaderCircle size={15} /> : <Save size={15} />}
                submitLabel={isSaving ? '保存中' : '保存修改'}
                attachmentUploadProgress={attachmentUploadProgress}
                uploadingAttachments={isUploadingAttachments}
              />
            )}
          </>
        )}
      </main>

      <DialogPresence>{previewOpen && floor && (
        <PostEditorPreviewDialog
          attachments={attachments}
          confirm={previewConfirming ? {
            icon: <Save size={15} />,
            label: '保存修改',
            onConfirm: () => {
              setPreviewOpen(false);
              void saveEdit();
            },
          } : undefined}
          editorValue={editorValue}
          label={isMainPost ? '帖子修改预览' : `楼层修改预览 · #${floor.pid}`}
          onClose={() => setPreviewOpen(false)}
          previewAuthor={floor.previewAuthor}
          previewFloor={floor.pid}
          previewSignature={signatureIndex > 0 ? floor.previewSignatures[signatureIndex - 1] : undefined}
          previewedAt={formatPostTime(floor.updatedAt || floor.createdAt)}
          title={displayTitle}
        />
      )}</DialogPresence>
      {confirmDialog}
    </div>
  );
}

function EditRequestState({
  backHref,
  description,
  loginHref,
  onRetry,
  registerHref,
  title,
}: {
  backHref: string;
  description: string;
  loginHref?: string;
  onRetry?: () => void;
  registerHref?: string;
  title: string;
}) {
  return (
    <section className="thread-edit-request-state">
      <h1>{title}</h1>
      <p>{description}</p>
      <div>
        {onRetry && <button onClick={onRetry} type="button">重新加载</button>}
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

function makeSnapshot(
  title: string,
  editor: RichTextEditorValue,
  signatureIndex: number,
  attachmentIds: string[],
) {
  return JSON.stringify({ attachmentIds, editor, signatureIndex, title });
}

function makeFloorSnapshot(floor: EditableThreadFloor) {
  return makeSnapshot(
    floor.title,
    { content: floor.text, mode: 'rich' },
    floor.signatureIndex,
    getAttachmentIds(floor.attachments),
  );
}

function makeDraftSnapshot(draft: StoredThreadEditDraft) {
  return makeSnapshot(
    draft.title,
    draft.editor,
    draft.signatureIndex,
    draft.attachments.map((attachment) => attachment.id),
  );
}

function getDraftExcerpt(editor: RichTextEditorValue, attachments: ThreadAttachmentInfo[]) {
  const text = editor.mode === 'markdown'
    ? editor.content.replace(/[#*_>`\-[\]()]/g, ' ').replace(/\s+/g, ' ').trim()
    : editor.content.replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/\s+/g, ' ')
      .trim();
  return text || (attachments.length ? '附件编辑草稿' : '空白编辑草稿');
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
