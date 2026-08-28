import { ArrowLeft, LoaderCircle, Save, Send } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchBoardPage, isAbortError, type BoardInfo } from '../api/board';
import {
  fetchThreadEditorViewer,
  ThreadApiError,
  uploadThreadAttachment,
  type ThreadAttachmentInfo,
  type ThreadEditorViewer,
} from '../api/thread';
import { publishThreadContent } from '../api/threadPublishing';
import {
  getRichTextEditorHtmlValue,
  getRichTextEditorStorageValue,
  type RichTextEditorValue,
} from '../components/editor/RichTextEditor';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import {
  formatPostEditorBytes,
  formatPostEditorPreviewTimestamp,
  hasPostEditorContent,
  AUTO_SAVE_STATUS,
  PostEditor,
  PostEditorPreviewDialog,
  PostEditorTitleField,
} from '../components/thread/PostEditor';
import {
  ActivityDateSchedule,
  ActivitySignupEditor,
  ActivitySignupFormPreview,
  ActivitySignupSchedule,
} from '../components/thread/ActivitySignupEditor';
import { useAuth } from '../context/AuthContext';
import { useAutoSaveEnabled } from '../hooks/useAssistiveFeatures';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getLoginPathWithReturnTo, getRegisterPathWithReturnTo } from '../utils/authRoutes';
import {
  readDefaultSignatureIndex,
  saveDefaultSignatureIndex,
} from '../utils/defaultSignature';
import { queueLocalDraftCleanup } from '../utils/draftCleanup';
import { normalizeFloorQuotesForLegacyStorage } from '../utils/floorQuote';
import {
  readStoredReplyDraftForThread,
  saveStoredReplyDraft,
  type StoredReplyAttachment,
} from '../utils/replyDraftStorage';
import {
  readStoredThreadComposeDraft,
  saveStoredThreadComposeDraft,
} from '../utils/threadComposeDraftStorage';
import { getThreadFloorHref } from '../utils/threadRoutes';
import {
  activitySignupDateTimeToUnixSeconds,
  buildActivityCreateOptions,
  createDefaultActivityDateRange,
  createDefaultActivitySignupSettings,
  validateActivityDateRange,
  validateActivitySignupSettings,
  type ActivityDateRange,
  type ActivitySignupSettings,
} from '../utils/activitySignup';

const THREAD_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';
const AUTO_SAVE_DELAY_MS = 1_200;

type ComposeAttachment = ThreadAttachmentInfo & Pick<Partial<StoredReplyAttachment>, 'lastModified' | 'type'>;

export function ThreadComposePage() {
  const autoSaveEnabled = useAutoSaveEnabled();
  const locationSearch = window.location.search;
  const request = useMemo(getComposeRequest, [locationSearch]);
  const { status: authStatus, viewer } = useAuth();
  const [board, setBoard] = useState<BoardInfo | null>(null);
  const [editorViewer, setEditorViewer] = useState<ThreadEditorViewer | null>(null);
  const [replyBoardName, setReplyBoardName] = useState('');
  const [title, setTitle] = useState('');
  const [editorValue, setEditorValue] = useState<RichTextEditorValue>({ content: '', mode: 'rich' });
  const [signatureIndex, setSignatureIndex] = useState(0);
  const [attachments, setAttachments] = useState<ComposeAttachment[]>([]);
  const [activitySchedule, setActivitySchedule] = useState<ActivityDateRange>(createDefaultActivityDateRange);
  const [activitySignup, setActivitySignup] = useState<ActivitySignupSettings>(createDefaultActivitySignupSettings);
  const [status, setStatus] = useState('');
  const [statusIsError, setStatusIsError] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [viewerLoadError, setViewerLoadError] = useState('');
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewedAt, setPreviewedAt] = useState('');
  const [draftLoadComplete, setDraftLoadComplete] = useState(false);
  const [storedReplyDraftId, setStoredReplyDraftId] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState(() => makeSnapshot('', { content: '', mode: 'rich' }, 0, [], null, null));
  const lastAutoSaveAttemptRef = useRef<string | null>(null);

  const ownerKey = viewer?.username ?? null;
  const isReply = Boolean(request?.tid);
  const isActivity = request?.kind === 'activity';
  const canCreateActivity = Boolean(
    isActivity
    && request?.bid === 1
    && authStatus === 'authenticated'
    && (viewer?.rights ?? 0) >= 2,
  );
  const boardName = board?.name ?? (isReply ? replyBoardName : '');
  const starRestricted = Boolean(
    board
    && viewer
    && viewer.rights <= 1
    && viewer.stars < board.requiredStars,
  );
  const boardHref = request ? `/?bid=${request.bid}` : '/';
  const backHref = request?.tid
    ? `/?${new URLSearchParams({ bid: String(request.bid), p: '1', tid: String(request.tid) }).toString()}#reply-editor`
    : boardHref;
  const currentSnapshot = makeSnapshot(
    title,
    editorValue,
    signatureIndex,
    attachments,
    isActivity ? activitySchedule : null,
    isActivity ? activitySignup : null,
  );
  const isDirty = currentSnapshot !== savedSnapshot;
  const contentReady = hasPostEditorContent(editorValue);
  const canPublish = Boolean(
    request
    && boardName
    && (isReply || title.trim())
    && contentReady
    && !starRestricted
    && (!isActivity || (
      canCreateActivity
      && validateActivityDateRange(activitySchedule)
      && validateActivitySignupSettings(activitySignup)
    ))
    && !isUploadingAttachments
    && !isPublishing,
  );

  useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    setBoard(null);
    setLoadError('');

    void fetchBoardPage(request.bid, 1, false, controller.signal).then(
      (page) => setBoard(page.board),
      (error: unknown) => {
        if (isAbortError(error)) return;
        setLoadError(error instanceof Error ? error.message : '版面信息读取失败，请稍后重试。');
      },
    );
    return () => controller.abort();
  }, [request]);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !ownerKey) {
      setEditorViewer(null);
      setViewerLoadError('');
      return;
    }

    const controller = new AbortController();
    setEditorViewer(null);
    setViewerLoadError('');
    void fetchThreadEditorViewer(ownerKey, controller.signal).then(
      setEditorViewer,
      (error: unknown) => {
        if (isAbortError(error)) return;
        setViewerLoadError(error instanceof Error ? error.message : '用户签名档读取失败，请稍后重试。');
      },
    );
    return () => controller.abort();
  }, [authStatus, ownerKey]);

  useEffect(() => {
    if (
      !request
      || authStatus !== 'authenticated'
      || !ownerKey
      || (!request.tid && !board)
    ) return;
    let active = true;
    const defaultSignatureIndex = readDefaultSignatureIndex(ownerKey);
    setDraftLoadComplete(false);
    setLoadError('');
    setStatus('');
    setStatusIsError(false);
    setTitle('');
    setEditorValue({ content: '', mode: 'rich' });
    setSignatureIndex(defaultSignatureIndex);
    setAttachments([]);
    setReplyBoardName('');
    setStoredReplyDraftId(null);
    setActivitySchedule(createDefaultActivityDateRange());
    setActivitySignup(createDefaultActivitySignupSettings());
    setSavedSnapshot(makeSnapshot('', { content: '', mode: 'rich' }, defaultSignatureIndex, [], null, null));
    lastAutoSaveAttemptRef.current = null;

    const loadDraft = async () => {
      if (request.tid) {
        const draft = await readStoredReplyDraftForThread(request.bid, request.tid, ownerKey);
        if (!active) return;
        if (!draft) {
          setLoadError('没有在本机找到这个帖子的回帖草稿。');
          setDraftLoadComplete(true);
          return;
        }
        setTitle(draft.threadTitle);
        setReplyBoardName(draft.board);
        setEditorValue(draft.editor);
        setSignatureIndex(draft.signatureIndex ?? 0);
        setAttachments(draft.attachments);
        setStoredReplyDraftId(draft.id);
        setSavedSnapshot(makeSnapshot(draft.threadTitle, draft.editor, draft.signatureIndex ?? 0, draft.attachments, null, null));
        setStatus('已从本机恢复回帖草稿');
        setStatusIsError(false);
        setDraftLoadComplete(true);
        return;
      }

      const draft = await readStoredThreadComposeDraft(request.bid, ownerKey, isActivity ? 'activity' : 'thread');
      if (!active) return;
      if (draft) {
        setTitle(draft.title);
        setEditorValue(draft.editor);
        setSignatureIndex(draft.signatureIndex);
        setAttachments(draft.attachments);
        const signupSettings = isActivity
          ? draft.activitySignup ?? createDefaultActivitySignupSettings()
          : createDefaultActivitySignupSettings();
        const activityDateRange = isActivity
          ? draft.activitySchedule ?? createDefaultActivityDateRange()
          : createDefaultActivityDateRange();
        setActivitySchedule(activityDateRange);
        setActivitySignup(signupSettings);
        setSavedSnapshot(makeSnapshot(
          draft.title,
          draft.editor,
          draft.signatureIndex,
          draft.attachments,
          isActivity ? activityDateRange : null,
          isActivity ? signupSettings : null,
        ));
        setStatus('已恢复这个版块的发帖草稿');
        setStatusIsError(false);
      }
      setDraftLoadComplete(true);
    };

    void loadDraft().catch(() => {
      if (!active) return;
      setLoadError(isReply ? '回帖草稿读取失败，请检查浏览器存储权限。' : '发帖草稿读取失败，请检查浏览器存储权限。');
      setDraftLoadComplete(true);
    });

    return () => { active = false; };
  }, [authStatus, board, isActivity, isReply, ownerKey, request]);

  useEffect(() => {
    if (!isDirty || isPublishing) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [isDirty, isPublishing]);

  useEffect(() => {
    if (
      !autoSaveEnabled
      || !draftLoadComplete
      || !request
      || !boardName
      || !ownerKey
      || !isDirty
      || currentSnapshot === lastAutoSaveAttemptRef.current
      || isSavingDraft
      || isPublishing
      || isUploadingAttachments
      || (!contentReady && attachments.length === 0 && (isReply || !title.trim()))
    ) return;

    const timer = window.setTimeout(() => { void saveDraft(true); }, AUTO_SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [
    attachments.length,
    autoSaveEnabled,
    boardName,
    contentReady,
    currentSnapshot,
    draftLoadComplete,
    isDirty,
    isPublishing,
    isReply,
    isSavingDraft,
    isUploadingAttachments,
    ownerKey,
    request,
    title,
  ]);

  function clearStatus() {
    setStatus('');
    setStatusIsError(false);
  }

  function leaveEditor() {
    if (!isDirty || window.confirm(`放弃尚未保存的${isReply ? '回帖草稿修改' : '发帖内容'}？`)) {
      window.location.href = backHref;
    }
  }

  async function addAttachments(files: File[]) {
    if (files.length === 0 || isUploadingAttachments) return;
    const oversizedFile = files.find((file) => file.size > 100 * 1024 * 1024);
    if (oversizedFile) {
      setStatus(`${oversizedFile.name} 超过 100MB，无法上传。`);
      setStatusIsError(true);
      return;
    }

    setStatus(files.length > 1 ? `正在上传 ${files.length} 个附件…` : `正在上传 ${files[0].name}…`);
    setStatusIsError(false);
    setIsUploadingAttachments(true);
    try {
      const results = await Promise.allSettled(files.map(uploadThreadAttachment));
      const uploaded = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
      const failed = results.filter((result) => result.status === 'rejected');
      if (uploaded.length > 0) setAttachments((current) => [...current, ...uploaded]);
      setStatus(failed.length > 0
        ? `已添加 ${uploaded.length} 个附件，${failed.length} 个上传失败。`
        : `已添加 ${uploaded.length} 个附件`);
      setStatusIsError(failed.length > 0);
    } finally {
      setIsUploadingAttachments(false);
    }
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
    clearStatus();
  }

  async function saveDraft(automatic = false) {
    if (!request || !boardName || !ownerKey || isSavingDraft) return;
    if (automatic) lastAutoSaveAttemptRef.current = currentSnapshot;
    if (!contentReady && attachments.length === 0 && (isReply || !title.trim())) {
      setStatus(`没有可保存的${isReply ? '回帖' : '发帖'}内容`);
      setStatusIsError(true);
      return;
    }

    setIsSavingDraft(true);
    if (!automatic) setStatus('正在保存草稿…');
    setStatusIsError(false);
    try {
      if (request.tid) {
        const result = await saveStoredReplyDraft({
          attachments: attachments.map((attachment) => ({
            id: attachment.id,
            lastModified: attachment.lastModified,
            name: attachment.name,
            size: attachment.size,
            type: attachment.type || 'application/octet-stream',
          })),
          bid: request.bid,
          board: boardName,
          boardHref,
          editor: getRichTextEditorStorageValue(editorValue),
          excerpt: getDraftExcerpt(editorValue, attachments, '回帖'),
          id: storedReplyDraftId ?? undefined,
          signatureIndex,
          threadTitle: title,
          tid: request.tid,
        }, ownerKey);
        if (!result.ok) throw new Error('回帖草稿保存失败');
        setStoredReplyDraftId(result.draft.id);
      } else {
        await saveStoredThreadComposeDraft({
          activitySchedule: isActivity ? activitySchedule : undefined,
          activitySignup: isActivity ? activitySignup : undefined,
          attachments,
          bid: request.bid,
          board: boardName,
          boardHref,
          editor: getRichTextEditorStorageValue(editorValue),
          excerpt: getDraftExcerpt(editorValue, attachments, '发帖'),
          kind: isActivity ? 'activity' : 'thread',
          signatureIndex,
          title: title.trim() || '未命名主题',
        }, ownerKey);
      }
      setSavedSnapshot(currentSnapshot);
      setStatus(automatic ? AUTO_SAVE_STATUS : '已存入草稿箱，可前往个人中心-草稿箱查看');
    } catch {
      setStatus('草稿保存失败，请检查浏览器存储权限后重试。');
      setStatusIsError(true);
    } finally {
      setIsSavingDraft(false);
    }
  }

  function openPreview() {
    if (!contentReady) return;
    setPreviewedAt(formatPostEditorPreviewTimestamp(new Date()));
    setPreviewOpen(true);
    clearStatus();
  }

  async function publish() {
    if (!request || !canPublish) return;
    const html = normalizeFloorQuotesForLegacyStorage(getRichTextEditorHtmlValue(editorValue));
    if (html.length > 100_000) {
      setStatus('正文超过 10 万字符，请精简内容或检查是否粘贴了过大的图片。');
      setStatusIsError(true);
      return;
    }

    setIsPublishing(true);
    setStatus(`正在发表${isReply ? '回复' : isActivity ? '活动' : '主题'}…`);
    setStatusIsError(false);
    try {
      const published = await publishThread({
        activitySchedule: isActivity ? activitySchedule : null,
        activitySignup: isActivity ? activitySignup : null,
        attachments: attachments.map((attachment) => attachment.id).join(' '),
        author: ownerKey ?? '',
        bid: request.bid,
        signatureIndex,
        text: html,
        tid: request.tid,
        title: title.trim(),
      });
      saveDefaultSignatureIndex(signatureIndex, ownerKey);
      if (ownerKey) {
        queueLocalDraftCleanup(request.tid
          ? { bid: request.bid, ownerKey, tid: request.tid, type: 'reply' }
          : {
            bid: request.bid,
            draftKind: isActivity ? 'activity' : 'thread',
            ownerKey,
            type: 'thread-compose',
          });
      }
      window.location.href = published.tid && published.pid
        ? getThreadFloorHref(published.bid, published.tid, published.pid)
        : published.tid
          ? `/?bid=${published.bid}&p=1&tid=${published.tid}#1`
        : `/?bid=${published.bid}`;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `${isReply ? '回复' : '主题'}发表失败，请稍后重试。`);
      setStatusIsError(true);
      setIsPublishing(false);
    }
  }

  const authPending = authStatus === 'loading' || authStatus === 'restoring';
  const pageLoadError = loadError || viewerLoadError;
  const pagePending = Boolean(
    request
    && !pageLoadError
    && (
      authPending
      || !board
      || (authStatus === 'authenticated' && (!draftLoadComplete || !editorViewer))
    ),
  );
  const documentTitle = !request
    ? '无法确定编辑对象'
    : pageLoadError
      ? '暂时无法进入编辑页'
      : authStatus === 'guest'
        ? `登录后${isReply ? '编辑草稿' : '开始发帖'}`
        : pagePending
          ? '正在准备编辑器'
          : isActivity && !canCreateActivity
            ? '当前无法发起活动'
            : starRestricted && board
              ? '当前星级不足'
              : boardName
                ? isReply ? `编辑：${title}` : isActivity ? '发起新活动' : '发表新主题'
                : '无法确定编辑对象';
  useDocumentTitle(documentTitle);

  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#compose-page-title" contextTitle={isReply ? title : boardName} />
      <main className="thread-edit-page-shell">
        {!request ? (
          <ComposeRequestState
            backHref="/"
            description="当前地址缺少有效的版块编号。"
            title="无法确定编辑对象"
          />
        ) : pageLoadError ? (
          <ComposeRequestState
            backHref={backHref}
            backLabel={isReply ? '返回帖子' : '返回版面'}
            description={pageLoadError}
            title="暂时无法进入编辑页"
          />
        ) : authStatus === 'guest' ? (
          <ComposeRequestState
            backHref={backHref}
            backLabel={isReply ? '返回帖子' : '返回版面'}
            description={`登录后才能${isReply ? '编辑回帖草稿' : '发表新主题'}，当前内容不会被提交。`}
            loginHref={getLoginPathWithReturnTo()}
            registerHref={getRegisterPathWithReturnTo()}
            title={`登录后${isReply ? '编辑草稿' : '开始发帖'}`}
          />
        ) : pagePending ? (
          <section className="thread-edit-request-state" aria-live="polite">
            <LoaderCircle className="thread-edit-spinner" size={22} />
            <h1>正在准备编辑器</h1>
          </section>
        ) : isActivity && !canCreateActivity ? (
          <ComposeRequestState
            backHref={backHref}
            description={request.bid === 1
              ? '仅权限值不低于 2 的会员可以发起活动。'
              : '活动只能发布在车协工作区。'}
            title="当前无法发起活动"
          />
        ) : starRestricted && board ? (
          <ComposeRequestState
            backHref={backHref}
            backLabel={isReply ? '返回帖子' : '返回版面'}
            description={`在「${board.name}」发帖或回复至少需要 ${board.requiredStars} 星。`}
            title="当前星级不足"
          />
        ) : boardName ? (
          <>
            <header className="thread-edit-heading-card">
              <button aria-label={isReply ? '返回帖子' : '返回版面'} className="thread-edit-back" onClick={leaveEditor} type="button">
                <ArrowLeft size={19} />
              </button>
              <div className="thread-edit-heading-copy">
                <span>{boardName} / {isReply ? '回帖草稿' : '发帖'}</span>
                <h1 id="compose-page-title">{isReply ? `编辑：${title}` : isActivity ? '发起新活动' : '发表新主题'}</h1>
              </div>
            </header>

            <PostEditor
              afterEditor={isActivity ? (
                <ActivitySignupEditor
                  onChange={(value) => {
                    setActivitySignup(value);
                    clearStatus();
                  }}
                  value={activitySignup}
                />
              ) : undefined}
              ariaLabel={isReply ? `编辑《${title}》的回帖草稿` : `在「${boardName}」${isActivity ? '发起活动' : '发表新主题'}`}
              attachmentDialogDescription={`文件会立即上传，并在发表${isReply ? '回复' : '主题'}后关联到内容`}
              attachmentLabel={isReply ? '回帖附件' : '主题附件'}
              attachments={attachments}
              beforeEditor={!isReply ? (
                <>
                  <PostEditorTitleField
                    label=""
                    onChange={(value) => {
                      setTitle(value);
                      clearStatus();
                    }}
                    placeholder={isActivity ? '请输入活动名称' : '请输入帖子标题'}
                    required
                    value={title}
                  />
                  {isActivity ? (
                    <>
                      <ActivityDateSchedule
                        onChange={(value) => {
                          setActivitySchedule(value);
                          clearStatus();
                        }}
                        value={activitySchedule}
                      />
                      <ActivitySignupSchedule
                        onChange={(value) => {
                          setActivitySignup(value);
                          clearStatus();
                        }}
                        value={activitySignup}
                      />
                    </>
                  ) : null}
                </>
              ) : undefined}
              className={`thread-edit-form ${isActivity ? 'activity-compose-form' : ''}`}
              editorValue={editorValue}
              formatAttachmentMeta={(attachment) => formatPostEditorBytes(attachment.size)}
              heading={isReply ? '编辑回帖草稿' : isActivity ? '新活动' : '新主题'}
              headingMeta={isReply ? `Re: ${title}` : title.trim() ? title.trim() : `发布到 ${boardName}`}
              name={isReply ? 'reply-draft-compose-signature' : 'thread-compose-signature'}
              onAddAttachments={(files) => void addAttachments(files)}
              onChange={(value) => {
                setEditorValue(value);
                clearStatus();
              }}
              onPreview={openPreview}
              onRemoveAttachment={removeAttachment}
              onSignatureChange={(value) => {
                setSignatureIndex(value);
                clearStatus();
              }}
              onSubmit={() => void publish()}
              placeholder={isReply ? '继续编辑你的回复……' : isActivity ? '填写活动介绍、行程安排和注意事项……' : '写下正文，可以补充背景、细节和你希望大家讨论的问题……'}
              previewDisabled={!contentReady}
              secondaryActions={(
                <button
                  className="reply-secondary-button"
                  disabled={isSavingDraft || isPublishing}
                  onClick={() => void saveDraft()}
                  type="button"
                >
                  {isSavingDraft ? <LoaderCircle className="thread-edit-spinner" size={15} /> : <Save size={15} />}
                  <span className="reply-action-label-full">{isSavingDraft ? '保存中' : isReply ? '保存草稿' : '存入草稿'}</span>
                  <span className="reply-action-label-compact">{isSavingDraft ? '保存中' : '草稿'}</span>
                </button>
              )}
              signatureIndex={signatureIndex}
              status={status}
              statusIsError={statusIsError}
              submitCompactLabel={isPublishing ? '发表中' : isReply ? '回复' : isActivity ? '发布活动' : '发表'}
              submitDisabled={!canPublish}
              submitIcon={isPublishing ? <LoaderCircle className="thread-edit-spinner" size={15} /> : <Send size={15} />}
              submitLabel={isPublishing ? '正在发表' : isReply ? '发布回复' : isActivity ? '发布活动' : '发表主题'}
              uploadingAttachments={isUploadingAttachments}
            />
          </>
        ) : null}
      </main>

      {previewOpen && boardName && editorViewer && (
        <PostEditorPreviewDialog
          attachments={attachments}
          editorValue={editorValue}
          formatAttachmentMeta={(attachment) => formatPostEditorBytes(attachment.size)}
          label={`${boardName} · ${isReply ? '回帖' : isActivity ? '活动' : '发帖'}预览`}
          onClose={() => setPreviewOpen(false)}
          previewAuthor={editorViewer}
          previewExtra={isActivity ? (
            <ActivitySignupFormPreview value={activitySignup} viewerName={editorViewer.name} />
          ) : undefined}
          previewFloor={isReply ? 2 : 1}
          previewSignature={signatureIndex > 0 ? editorViewer.signatures[signatureIndex - 1] : undefined}
          previewedAt={previewedAt}
          title={isReply ? `Re: ${title}` : title.trim() || '未命名主题'}
        />
      )}
    </div>
  );
}

function ComposeRequestState({
  backHref,
  backLabel = '返回版面',
  description,
  loginHref,
  registerHref,
  title,
}: {
  backHref: string;
  backLabel?: string;
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
        <a href={backHref}>{backLabel}</a>
        {loginHref && <a className="thread-edit-login-link" href={loginHref}>前往登录</a>}
        {registerHref && <a className="thread-edit-register-link" href={registerHref}>注册账号</a>}
      </div>
    </section>
  );
}

function getComposeRequest() {
  const params = new URLSearchParams(window.location.search);
  const bid = Number(params.get('bid'));
  const tidValue = Number(params.get('tid'));
  if (!Number.isSafeInteger(bid) || bid <= 0) return null;
  return {
    bid,
    kind: Number.isSafeInteger(tidValue) && tidValue > 0
      ? 'thread' as const
      : params.get('kind') === 'activity' ? 'activity' as const : 'thread' as const,
    tid: Number.isSafeInteger(tidValue) && tidValue > 0 ? tidValue : null,
  };
}

function makeSnapshot(
  title: string,
  editor: RichTextEditorValue,
  signatureIndex: number,
  attachments: ComposeAttachment[],
  activitySchedule: ActivityDateRange | null,
  activitySignup: ActivitySignupSettings | null,
) {
  return JSON.stringify({
    activitySchedule,
    attachments: attachments.map((attachment) => attachment.id),
    activitySignup,
    editor,
    signatureIndex,
    title,
  });
}

function getDraftExcerpt(
  editor: RichTextEditorValue,
  attachments: ComposeAttachment[],
  draftType: '发帖' | '回帖',
) {
  const text = editor.mode === 'markdown'
    ? editor.content.replace(/[#*_>`\-[\]()]/g, ' ').replace(/\s+/g, ' ').trim()
    : editor.content.replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/\s+/g, ' ')
      .trim();
  return text || (attachments.length ? `附件${draftType}草稿` : `空白${draftType}草稿`);
}

async function publishThread({
  activitySchedule,
  activitySignup,
  attachments,
  author,
  bid,
  signatureIndex,
  text,
  tid,
  title,
}: {
  activitySchedule: ActivityDateRange | null;
  activitySignup: ActivitySignupSettings | null;
  attachments: string;
  author: string;
  bid: number;
  signatureIndex: number;
  text: string;
  tid: number | null;
  title: string;
}) {
  if (activitySchedule && activitySignup) {
    return publishActivityThread({
      activitySchedule,
      activitySignup,
      attachments,
      bid,
      signatureIndex,
      text,
      title,
    });
  }
  return publishThreadContent({
    attachments,
    author,
    bid,
    signatureIndex,
    text,
    tid,
    title,
  });
}

async function publishActivityThread({
  activitySchedule,
  activitySignup,
  attachments,
  bid,
  signatureIndex,
  text,
  title,
}: {
  activitySchedule: ActivityDateRange;
  activitySignup: ActivitySignupSettings;
  attachments: string;
  bid: number;
  signatureIndex: number;
  text: string;
  title: string;
}) {
  let response: Response;
  try {
    response = await fetch(THREAD_API_URL, {
      body: new URLSearchParams({
        ask: 'activity_create',
        attachs: attachments,
        activity_ends_on: activitySchedule.endsOn,
        activity_starts_on: activitySchedule.startsOn,
        bid: String(bid),
        options: JSON.stringify(buildActivityCreateOptions(activitySignup.questions)),
        sig: String(signatureIndex),
        signup_ends_at: String(activitySignupDateTimeToUnixSeconds(activitySignup.endsAt)),
        signup_starts_at: String(activitySignupDateTimeToUnixSeconds(activitySignup.startsAt)),
        text,
        title,
      }),
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
    });
  } catch {
    throw new ThreadApiError('暂时无法连接论坛服务，活动发布失败。');
  }

  let payload: {
    code?: unknown;
    data?: { bid?: unknown; tid?: unknown };
    message?: string;
  };
  try {
    payload = await response.json() as typeof payload;
  } catch {
    throw new ThreadApiError('论坛服务返回了无法识别的数据。');
  }

  if (!response.ok || Number(payload.code) !== 0) {
    throw new ThreadApiError(payload.message?.trim() || '活动发布失败，请稍后重试。');
  }

  const publishedBid = Number(payload.data?.bid);
  const publishedTid = Number(payload.data?.tid);
  return {
    bid: Number.isSafeInteger(publishedBid) && publishedBid > 0 ? publishedBid : bid,
    pid: 1,
    tid: Number.isSafeInteger(publishedTid) && publishedTid > 0 ? publishedTid : null,
  };
}
