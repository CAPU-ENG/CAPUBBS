import { useEffect, useRef, useState } from 'react';
import { Bookmark, BookmarkCheck, Eye, MessageCircle, RotateCw } from 'lucide-react';
import { ReplyEditor, type ReplyTarget } from '../components/thread/ReplyEditor';
import { ThreadFloor } from '../components/thread/ThreadFloor';
import { FloorNodes, MobileFloorNode, ThreadPagination } from '../components/thread/ThreadNavigation';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { postNestedReply } from '../api/thread';
import type { ThreadFloorData } from '../data/threadDemo';
import { useScrollContextTitle } from '../hooks/useScrollContextTitle';
import { useThreadData } from '../hooks/useThreadData';
import { getLoginPathWithReturnTo } from '../utils/authRoutes';

function getThreadRequest() {
  const params = new URLSearchParams(window.location.search);
  const tid = positiveInteger(params.get('tid') ?? params.get('thread'));
  const requestedBid = positiveInteger(params.get('bid'));

  return {
    authorOnly: params.get('see_lz') === '1' || params.get('author') === '1',
    bid: requestedBid || (tid === 102 ? 3 : 0),
    page: positiveInteger(params.get('p') ?? params.get('page')) || 1,
    tid,
  };
}

function positiveInteger(value: string | null) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

export function ThreadPage() {
  const request = getThreadRequest();
  const { data, error, retry, status } = useThreadData(request);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [activeFloor, setActiveFloor] = useState(1);
  const [bookmarked, setBookmarked] = useState(false);
  const editorRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const showTitleInTopBar = useScrollContextTitle(titleRef);
  const pageFloors = data?.floors ?? [];

  useEffect(() => {
    if (!data) return;
    const saved = window.localStorage.getItem(`capubbs-bookmark-${data.id}`);
    setBookmarked(saved === null ? data.bookmarked : saved === '1');
  }, [data]);

  useEffect(() => {
    const floorElements = pageFloors
      .map((floor) => document.getElementById(`floor-${floor.floor}`))
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

    const hashFloor = Number(window.location.hash.match(/^#(?:floor-)?(\d+)$/)?.[1]);
    if (hashFloor) {
      window.requestAnimationFrame(() => {
        document.getElementById(`floor-${hashFloor}`)?.scrollIntoView({ block: 'start' });
      });
    }

    return () => {
      window.removeEventListener('scroll', scheduleActiveFloorUpdate);
      window.removeEventListener('resize', scheduleActiveFloorUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [data?.currentPage, pageFloors]);

  function scrollToEditor(target: ReplyTarget) {
    setReplyTarget(target);
    window.requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function quoteFloor(floor: ThreadFloorData) {
    scrollToEditor({
      author: floor.author.name,
      floor: floor.floor,
      quote: (floor.quoteText || floor.paragraphs[0] || '').slice(0, 90),
    });
  }

  async function submitNestedReply(floor: ThreadFloorData, targetName: string | null, content: string) {
    const text = targetName ? `回复 @${targetName}：${content}` : content;
    await postNestedReply({ fid: floor.fid, text });
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

  function toggleBookmark() {
    if (!data) return;
    setBookmarked((current) => {
      const next = !current;
      window.localStorage.setItem(`capubbs-bookmark-${data.id}`, next ? '1' : '0');
      return next;
    });
  }

  if (!data) {
    return (
      <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
        <AppBackground />
        <TopBar />
        <main className="thread-page-shell">
          <section className="thread-request-state" aria-live="polite">
            {status === 'loading' ? (
              <>
                <span className="thread-request-spinner" aria-hidden="true" />
                <h1>正在读取帖子</h1>
                <p>楼层、作者资料与回复会一起载入。</p>
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

  const nodeFloors = pageFloors.map((floor) => ({ floor: floor.floor, author: floor.author.name }));
  const loginHref = getLoginPathWithReturnTo();

  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar
        contextHref="#thread-title"
        contextTitle={data.title}
        showContextTitle={showTitleInTopBar}
      />

      <main className="thread-page-shell">
        <header className="thread-title-card">
          <h1 id="thread-title" ref={titleRef}>{data.title}</h1>
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
                aria-pressed={bookmarked}
                className={bookmarked ? 'thread-title-action-active' : ''}
                onClick={toggleBookmark}
                type="button"
              >
                {bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                {bookmarked ? '取消收藏' : '收藏'}
              </button>
            </div>
          </div>
        </header>

        <div className="thread-content-layout">
          <section className="thread-floor-list" aria-label={`第 ${data.currentPage} 页楼层`}>
            {pageFloors.map((floor) => (
              <ThreadFloor
                canReply={data.canReply && Boolean(data.viewer)}
                floor={floor}
                isMainPost={floor.floor === 1}
                key={floor.id}
                onQuote={quoteFloor}
                onSubmitNestedReply={submitNestedReply}
                viewer={data.viewer}
              />
            ))}
          </section>
          <FloorNodes activeFloor={activeFloor} floors={nodeFloors} />
        </div>

        <div className="thread-bottom-pagination">
          <ThreadPagination
            authorOnly={data.authorOnly}
            boardId={data.bid}
            currentPage={data.currentPage}
            pageCount={data.pageCount}
            threadId={data.tid}
          />
        </div>

        {data.canReply && data.viewer ? (
          <ReplyEditor
            editorRef={editorRef}
            onClearTarget={() => setReplyTarget(null)}
            previewAuthor={data.viewer}
            previewFloor={data.replies + 2}
            previewSignatures={data.viewerSignatures}
            target={replyTarget}
            threadTitle={data.title}
          />
        ) : (
          <section className="thread-reply-unavailable">
            <strong>{data.locked ? '本主题已锁定' : '登录后参与回复'}</strong>
            <p>{data.locked ? '当前主题暂不接受新的楼层回复。' : '登录后即可使用完整编辑器、签名档与附件功能。'}</p>
            {!data.locked && <a href={loginHref}>前往登录</a>}
          </section>
        )}
      </main>

      {nodeFloors.length > 0 && <MobileFloorNode activeFloor={activeFloor} floors={nodeFloors} />}
    </div>
  );
}
