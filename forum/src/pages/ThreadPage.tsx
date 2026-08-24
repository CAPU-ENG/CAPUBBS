import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpToLine, Bookmark, BookmarkCheck, Check, Eye, EyeOff, Link2, MessageCircle, RotateCw, Settings } from 'lucide-react';
import { ActivitySignupForm } from '../components/thread/ActivitySignupForm';
import { ReplyEditor, type QuoteRequest } from '../components/thread/ReplyEditor';
import { ThreadFloor } from '../components/thread/ThreadFloor';
import { FloorNodes, MobileFloorNode, ThreadPagination } from '../components/thread/ThreadNavigation';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import floorDecorationDemoImage from '../assets/activity/activity.avif';
import { setThreadBookmarked } from '../api/favorite';
import { deleteNestedReply, deleteThreadFloor, postNestedReply } from '../api/thread';
import { useAuth } from '../context/AuthContext';
import type { NestedReply, ThreadFloorData } from '../data/threadDemo';
import {
  useAssistiveBarEnabled,
  useBackToTopEnabled,
  useSignaturesHidden,
  useSignatureToggleEnabled,
} from '../hooks/useAssistiveFeatures';
import { useAuthorProfileEnabled } from '../hooks/useAuthorProfile';
import { useAvatarFollowDisabled } from '../hooks/useAvatarFollow';
import { useThreadTopBar } from '../hooks/useThreadTopBar';
import { useThreadData } from '../hooks/useThreadData';
import { useTopBarAutoHideEnabled } from '../hooks/useTopBarAutoHide';
import { saveSignaturesHidden } from '../utils/assistiveFeatures';
import { getLoginPathWithReturnTo, getRegisterPathWithReturnTo } from '../utils/authRoutes';
import { writeClipboardText } from '../utils/clipboard';
import {
  getActivityManagementHref,
  getThreadEditHref,
  getThreadFloorElement,
  getThreadFloorFromHash,
  getThreadFloorHref,
  getThreadHref,
  getThreadPageForFloor,
} from '../utils/threadRoutes';
import { markThreadRead } from '../utils/threadReadState';
import { isActivityPhoneQuestion, maskActivitySignupFloor } from '../utils/activityPhonePrivacy';
import { getPublicProfilePath } from '../utils/userRoutes';

function getThreadRequest() {
  const params = new URLSearchParams(window.location.search);
  const tid = positiveInteger(params.get('tid') ?? params.get('thread'));
  const requestedBid = positiveInteger(params.get('bid'));
  const authorOnly = params.get('see_lz') === '1' || params.get('author') === '1';
  const hashFloor = getThreadFloorFromHash(window.location.hash);

  return {
    authorOnly,
    bid: requestedBid || (tid === 102 ? 3 : 0),
    page: !authorOnly && hashFloor
      ? getThreadPageForFloor(hashFloor)
      : positiveInteger(params.get('p') ?? params.get('page')) || 1,
    tid,
  };
}

function positiveInteger(value: string | null) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

export function ThreadPage() {
  const assistiveBarEnabled = useAssistiveBarEnabled();
  const authorProfileEnabled = useAuthorProfileEnabled();
  const avatarFollowPreferenceDisabled = useAvatarFollowDisabled();
  const avatarFollowDisabled = authorProfileEnabled || avatarFollowPreferenceDisabled;
  const backToTopEnabled = useBackToTopEnabled();
  const topBarAutoHideEnabled = useTopBarAutoHideEnabled();
  const { viewer } = useAuth();
  const request = getThreadRequest();
  const floorDecorationDemoEnabled = new URLSearchParams(window.location.search).get('floorDecorationDemo') === '1';
  const { data, error, retry, status } = useThreadData(request);
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const quoteRequestIdRef = useRef(0);
  const [activeFloor, setActiveFloor] = useState(1);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkPending, setBookmarkPending] = useState(false);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const [copyNoticeOpen, setCopyNoticeOpen] = useState(false);
  const copyNoticeTimerRef = useRef<number | null>(null);
  const editorRef = useRef<HTMLElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const threadTopBar = useThreadTopBar(titleRef, topBarAutoHideEnabled);
  const signaturesHidden = useSignaturesHidden();
  const signatureToggleEnabled = useSignatureToggleEnabled();
  const inlineFloorAvatar = !authorProfileEnabled && avatarFollowDisabled && !assistiveBarEnabled;
  const threadPageShellClassName = [
    'thread-page-shell',
    authorProfileEnabled ? 'thread-page-shell-author-profile' : 'thread-page-shell-compact-author',
    avatarFollowDisabled ? 'thread-page-shell-avatar-static' : 'thread-page-shell-avatar-sticky',
    assistiveBarEnabled ? 'thread-page-shell-with-assistive-bar' : 'thread-page-shell-without-assistive-bar',
  ].filter(Boolean).join(' ');
  const syncAvatarStickyTop = useCallback((topBarBottom: number) => {
    pageRef.current?.style.setProperty('--thread-avatar-sticky-top', `${topBarBottom}px`);
  }, []);
  const pageFloors = useMemo(() => {
    if (!data?.activity) return data?.floors ?? [];

    const phoneFieldLabels = data.activity.questions
      .filter(isActivityPhoneQuestion)
      .map((question) => question.label);
    const fieldLabels = [...data.activity.questions.map((question) => question.label), '报名状态'];
    if (phoneFieldLabels.length === 0) return data.floors;

    return data.floors.map((floor) => {
      const canViewPhone = floor.isOwn || viewer?.username === data.authorName;
      return canViewPhone ? floor : maskActivitySignupFloor(floor, phoneFieldLabels, fieldLabels);
    });
  }, [data, viewer?.username]);

  useEffect(() => {
    if (!data) return;
    setBookmarked(data.bookmarked);
    setBookmarkError(null);
  }, [data]);

  useEffect(() => {
    if (!data) return;
    markThreadRead(`${data.bid}-${data.tid}`, viewer?.username);
  }, [data, viewer?.username]);

  useEffect(() => {
    return () => {
      if (copyNoticeTimerRef.current !== null) window.clearTimeout(copyNoticeTimerRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (!data) return;
    const hashFloor = getThreadFloorFromHash(window.location.hash);
    if (hashFloor) getThreadFloorElement(hashFloor)?.scrollIntoView({ block: 'start' });
  }, [data]);

  useEffect(() => {
    const floorElements = pageFloors
      .map((floor) => getThreadFloorElement(floor.floor))
      .filter((floor): floor is HTMLElement => floor !== null);
    let frame = 0;

    function updateActiveFloor() {
      frame = 0;
      if (floorElements.length === 0) return;

      const readingLine = window.innerHeight * 0.28;
      const reachedPageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      let nextFloor = Number(floorElements[0].dataset.floor);

      for (const floor of floorElements) {
        if (floor.getBoundingClientRect().top > readingLine) break;
        nextFloor = Number(floor.dataset.floor);
      }

      if (reachedPageBottom) {
        nextFloor = Number(floorElements[floorElements.length - 1].dataset.floor);
      }
      if (nextFloor) setActiveFloor(nextFloor);
    }

    function scheduleActiveFloorUpdate() {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveFloor);
    }

    setActiveFloor(pageFloors[0]?.floor ?? 1);
    window.addEventListener('scroll', scheduleActiveFloorUpdate, { passive: true });
    window.addEventListener('resize', scheduleActiveFloorUpdate);
    scheduleActiveFloorUpdate();

    return () => {
      window.removeEventListener('scroll', scheduleActiveFloorUpdate);
      window.removeEventListener('resize', scheduleActiveFloorUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [data?.currentPage, pageFloors]);

  function quoteFloor(floor: ThreadFloorData) {
    if (!data) return;
    quoteRequestIdRef.current += 1;
    setQuoteRequest({
      author: floor.author.name,
      authorHref: getPublicProfilePath(floor.author.name),
      floor: floor.floor,
      floorHref: getThreadFloorHref(data.bid, data.tid, floor.floor),
      quote: (floor.quoteText || floor.paragraphs[0] || '').slice(0, 90),
      requestId: quoteRequestIdRef.current,
    });
    window.requestAnimationFrame(() => {
      window.scrollTo({ behavior: 'smooth', top: document.documentElement.scrollHeight });
    });
  }

  async function submitNestedReply(floor: ThreadFloorData, targetName: string | null, content: string) {
    const text = targetName ? `回复 @${targetName}：${content}` : content;
    return postNestedReply({ fid: floor.fid, text });
  }

  async function removeNestedReply(floor: ThreadFloorData, reply: NestedReply) {
    const text = reply.target ? `回复 @${reply.target}：${reply.content}` : reply.content;
    await deleteNestedReply({ fid: floor.fid, id: Number(reply.id), text });
    window.location.reload();
  }

  async function removeFloor(floor: ThreadFloorData) {
    if (!data) return;
    await deleteThreadFloor({
      bid: data.bid,
      pid: floor.floor,
      tid: data.tid,
    });

    if (floor.floor === 1 && data.replies === 0) {
      window.location.href = data.boardHref;
      return;
    }

    window.location.reload();
  }

  function toggleAuthorOnly() {
    if (!data) return;
    const params = new URLSearchParams({
      bid: String(data.bid),
      p: '1',
      tid: String(data.tid),
    });
    if (!data.authorOnly) params.set('see_lz', '1');
    window.location.href = `/?${params.toString()}`;
  }

  async function toggleBookmark() {
    if (!data || bookmarkPending) return;
    if (!data.viewer) {
      window.location.href = getLoginPathWithReturnTo();
      return;
    }

    const nextBookmarked = !bookmarked;
    setBookmarkPending(true);
    setBookmarkError(null);
    try {
      await setThreadBookmarked({
        bid: data.bid,
        bookmarked: nextBookmarked,
        tid: data.tid,
      });
      setBookmarked(nextBookmarked);
    } catch (bookmarkActionError) {
      setBookmarkError(bookmarkActionError instanceof Error
        ? bookmarkActionError.message
        : nextBookmarked ? '收藏失败，请稍后重试。' : '取消收藏失败，请稍后重试。');
    } finally {
      setBookmarkPending(false);
    }
  }

  async function copyThreadLink() {
    if (!data) return;
    const link = new URL(getThreadHref(data.bid, data.tid), window.location.origin).href;
    const copied = await writeClipboardText(link);
    if (!copied) return;

    setCopyNoticeOpen(true);
    if (copyNoticeTimerRef.current !== null) window.clearTimeout(copyNoticeTimerRef.current);
    copyNoticeTimerRef.current = window.setTimeout(() => setCopyNoticeOpen(false), 1800);
  }

  function scrollToPageTop() {
    window.scrollTo({ left: 0, top: 0 });
  }

  function toggleSignatures() {
    saveSignaturesHidden(!signaturesHidden);
  }

  if (!data) {
    return (
      <div className={`relative min-h-screen text-[var(--text)] transition-colors duration-200${avatarFollowDisabled ? ' thread-avatar-follow-disabled' : ''}`} ref={pageRef}>
        <AppBackground />
        <TopBar />
        <main className={threadPageShellClassName}>
          <section className="thread-request-state" aria-live="polite">
            {status === 'loading' ? (
              <>
                <span className="thread-request-spinner" aria-hidden="true" />
                <h1>正在读取帖子</h1>
              </>
            ) : (
              <>
                <h1>帖子暂时无法打开</h1>
                <p>{error}</p>
                <button onClick={retry} type="button"><RotateCw size={15} />重新加载</button>
              </>
            )}
          </section>
        </main>
      </div>
    );
  }

  const nodeFloors = pageFloors.map((floor) => ({
    author: floor.author.name,
    floor: floor.floor,
    preview: createFloorPreview(floor),
  }));
  const loginHref = getLoginPathWithReturnTo();
  const registerHref = getRegisterPathWithReturnTo();
  const canManageActivity = Boolean(
    data.isActivity
    && viewer
    && (viewer.rights >= 3 || viewer.username === data.authorName),
  );
  const starRestricted = Boolean(
    data.viewer
    && !data.locked
    && (viewer?.rights ?? 0) <= 1
    && data.viewer.stars < data.requiredStars,
  );

  return (
    <div className={`relative min-h-screen text-[var(--text)] transition-colors duration-200${avatarFollowDisabled ? ' thread-avatar-follow-disabled' : ''}`} ref={pageRef}>
      <AppBackground />
      <TopBar
        autoHidden={threadTopBar.hidden}
        contextHref="#thread-title"
        contextTitle={data.title}
        onBottomChange={syncAvatarStickyTop}
        showContextTitle={threadTopBar.showContextTitle}
      />

      <main className={threadPageShellClassName}>
        <header className="thread-title-card">
          <div className="thread-title-heading">
            <h1 id="thread-title" ref={titleRef}>
              <button
                aria-label="复制帖子链接"
                className="thread-title-copy-button"
                onClick={() => { void copyThreadLink(); }}
                title="复制帖子链接"
                type="button"
              >
                {data.title}
                <Link2 aria-hidden="true" className="thread-title-copy-icon" size={18} />
              </button>
            </h1>
            {canManageActivity && (
              <a className="thread-activity-management-link" href={getActivityManagementHref(data.bid, data.tid)}>
                <Settings size={15} />活动管理
              </a>
            )}
          </div>
          <div className="thread-title-meta">
            <a className="thread-board-card" href={data.boardHref}>{data.board}</a>
            <span><MessageCircle size={15} />{data.replies} 条回复</span>
            <span><Eye size={16} />{data.views} 次浏览</span>
            <div className="thread-title-actions">
              <button
                aria-pressed={data.authorOnly}
                className={data.authorOnly ? 'thread-title-action-active' : ''}
                onClick={toggleAuthorOnly}
                type="button"
              >
                {data.authorOnly ? '查看全部' : '只看楼主'}
              </button>
              <button
                aria-busy={bookmarkPending}
                aria-pressed={bookmarked}
                className={bookmarked ? 'thread-title-action-active' : ''}
                disabled={bookmarkPending}
                onClick={() => { void toggleBookmark(); }}
                type="button"
              >
                {bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                {bookmarkPending ? (bookmarked ? '取消中' : '收藏中') : bookmarked ? '取消收藏' : '收藏'}
              </button>
            </div>
          </div>
          {bookmarkError && <p className="thread-bookmark-error" role="alert">{bookmarkError}</p>}
        </header>

        <div className="thread-top-pagination">
          <ThreadPagination
            authorOnly={data.authorOnly}
            boardId={data.bid}
            currentPage={data.currentPage}
            pageCount={data.pageCount}
            showPageJump
            threadId={data.tid}
          />
        </div>

        <div className="thread-content-layout">
          <section className="thread-floor-list" aria-label={`第 ${data.currentPage} 页楼层`}>
            {pageFloors.map((floor) => (
              <Fragment key={floor.id}>
                <ThreadFloor
                  canQuote={!data.isActivity && data.canReply && Boolean(data.viewer)}
                  canReply={data.canReply && Boolean(data.viewer)}
                  decoration={floorDecorationDemoEnabled ? {
                    imageSrc: floorDecorationDemoImage,
                    placement: 'top-right',
                  } : undefined}
                  editHref={getThreadEditHref(data.bid, data.tid, floor.floor)}
                  floor={floor}
                  hideSignature={assistiveBarEnabled && signatureToggleEnabled && signaturesHidden}
                  isActivityThread={data.isActivity}
                  isMainPost={floor.floor === 1}
                  inlineAvatar={inlineFloorAvatar}
                  showAuthorProfile={authorProfileEnabled}
                  onDeleteFloor={removeFloor}
                  onDeleteNestedReply={removeNestedReply}
                  onQuote={quoteFloor}
                  onSubmitNestedReply={submitNestedReply}
                  viewer={data.viewer}
                />
                {floor.floor === 1 && data.activity && (
                  <ActivitySignupForm
                    activity={data.activity}
                    bid={data.bid}
                    floors={pageFloors}
                    locked={data.locked}
                    loginHref={loginHref}
                    registerHref={registerHref}
                    signatures={data.viewerSignatures}
                    threadTitle={data.title}
                    tid={data.tid}
                    viewer={data.viewer}
                  />
                )}
              </Fragment>
            ))}
          </section>
          {assistiveBarEnabled && (
            <div className="thread-side-rail">
              <FloorNodes activeFloor={activeFloor} floors={nodeFloors} />
              {(backToTopEnabled || signatureToggleEnabled) && (
                <div className="thread-assistive-tools" aria-label="帖子辅助功能">
                  {backToTopEnabled && (
                    <button onClick={scrollToPageTop} type="button">
                      <ArrowUpToLine size={15} />
                      回到顶部
                    </button>
                  )}
                  {signatureToggleEnabled && (
                    <button
                      aria-pressed={signaturesHidden}
                      className={signaturesHidden ? 'thread-assistive-tool-active' : ''}
                      onClick={toggleSignatures}
                      type="button"
                    >
                      {signaturesHidden ? <Eye size={15} /> : <EyeOff size={15} />}
                      {signaturesHidden ? '显示签名档' : '屏蔽签名档'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="thread-bottom-pagination">
          <ThreadPagination
            authorOnly={data.authorOnly}
            boardId={data.bid}
            currentPage={data.currentPage}
            pageCount={data.pageCount}
            showPageJump
            threadId={data.tid}
          />
        </div>

        {!data.isActivity && (data.canReply && data.viewer ? (
          <ReplyEditor
            bid={data.bid}
            board={data.board}
            boardHref={data.boardHref}
            editorRef={editorRef}
            ownerKey={data.viewer.name}
            previewAuthor={data.viewer}
            previewFloor={data.replies + 2}
            previewSignatures={data.viewerSignatures}
            quoteRequest={quoteRequest}
            tid={data.tid}
            threadTitle={data.title}
          />
        ) : (
          <section className="thread-reply-unavailable">
            <strong>{data.locked ? '本主题已锁定' : starRestricted ? `本版回复至少需要 ${data.requiredStars} 星` : '登录后参与回复'}</strong>
            {(data.locked || starRestricted) && (
              <p>{data.locked ? '当前主题暂不接受新的楼层回复。' : `你当前为 ${data.viewer?.stars ?? 0} 星，暂时无法回复。`}</p>
            )}
            {!data.locked && !starRestricted && (
              <div className="thread-reply-auth-actions">
                <a href={loginHref}>前往登录</a>
                <a href={registerHref}>注册账号</a>
              </div>
            )}
          </section>
        ))}
      </main>

      {assistiveBarEnabled && nodeFloors.length > 0 && (
        <div className="mobile-thread-controls" aria-label="移动端帖子工具" role="group">
          {backToTopEnabled && (
            <button
              aria-label="回到顶部"
              className="mobile-thread-assistive-tool"
              onClick={scrollToPageTop}
              title="回到顶部"
              type="button"
            >
              <ArrowUpToLine size={15} />
            </button>
          )}
          {signatureToggleEnabled && (
            <button
              aria-label={signaturesHidden ? '显示签名档' : '屏蔽签名档'}
              aria-pressed={signaturesHidden}
              className={`mobile-thread-assistive-tool ${signaturesHidden ? 'mobile-thread-assistive-tool-active' : ''}`}
              onClick={toggleSignatures}
              title={signaturesHidden ? '显示签名档' : '屏蔽签名档'}
              type="button"
            >
              {signaturesHidden ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          )}
          <MobileFloorNode activeFloor={activeFloor} floors={nodeFloors} />
        </div>
      )}
      {copyNoticeOpen && (
        <div aria-live="polite" className="copy-floor-toast" role="status">
          <Check aria-hidden="true" size={15} />
          已复制帖子链接
        </div>
      )}
    </div>
  );
}

function createFloorPreview(floor: ThreadFloorData) {
  const content = (floor.quoteText || floor.paragraphs.join(' ')).replace(/\s+/g, ' ').trim();
  if (!content) return '此楼层暂无可预览的内容。';
  return content.length > 160 ? `${content.slice(0, 160).trimEnd()}…` : content;
}
