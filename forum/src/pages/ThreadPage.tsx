import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, BookmarkCheck, Eye, MessageCircle } from 'lucide-react';
import { ReplyEditor, type ReplyTarget } from '../components/thread/ReplyEditor';
import { ThreadFloor } from '../components/thread/ThreadFloor';
import { FloorNodes, MobileFloorNode, ThreadPagination } from '../components/thread/ThreadNavigation';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { demoThread, type ThreadFloorData } from '../data/threadDemo';

function getRequestedPage() {
  const value = Number(new URLSearchParams(window.location.search).get('page') ?? '1');
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function getAuthorOnly() {
  return new URLSearchParams(window.location.search).get('author') === '1';
}

export function ThreadPage() {
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [activeFloor, setActiveFloor] = useState(1);
  const [showTitleInTopBar, setShowTitleInTopBar] = useState(false);
  const [bookmarked, setBookmarked] = useState(
    () => window.localStorage.getItem(`capubbs-bookmark-${demoThread.id}`) === '1',
  );
  const editorRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const authorOnly = getAuthorOnly();

  const filteredFloors = useMemo(
    () => authorOnly
      ? demoThread.floors.filter((floor) => floor.author.name === demoThread.authorName)
      : demoThread.floors,
    [authorOnly],
  );
  const pageCount = Math.max(1, Math.ceil(filteredFloors.length / demoThread.perPage));
  const currentPage = Math.min(getRequestedPage(), pageCount);
  const pageFloors = useMemo(
    () => filteredFloors.slice(
      (currentPage - 1) * demoThread.perPage,
      currentPage * demoThread.perPage,
    ),
    [currentPage, filteredFloors],
  );

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

    const hashFloor = Number(window.location.hash.match(/floor-(\d+)/)?.[1]);
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
  }, [currentPage, pageFloors]);

  useEffect(() => {
    let frame = 0;
    let lastScrollY = Math.max(0, window.scrollY);

    function updateTopBarTitle() {
      frame = 0;
      const currentScrollY = Math.max(0, window.scrollY);
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      const topBarHeight = Number.parseFloat(
        window.getComputedStyle(document.documentElement).getPropertyValue('--topbar-height'),
      ) || 64;
      const titleIsCovered = (titleRef.current?.getBoundingClientRect().bottom ?? Infinity) <= topBarHeight + 8;

      if (!titleIsCovered) {
        setShowTitleInTopBar(false);
        return;
      }

      if (scrollDelta > 1) {
        setShowTitleInTopBar(true);
      } else if (scrollDelta < -1) {
        setShowTitleInTopBar(false);
      }
    }

    function scheduleTopBarTitleUpdate() {
      if (frame) return;
      frame = window.requestAnimationFrame(updateTopBarTitle);
    }

    window.addEventListener('scroll', scheduleTopBarTitleUpdate, { passive: true });
    window.addEventListener('resize', scheduleTopBarTitleUpdate);
    scheduleTopBarTitleUpdate();

    return () => {
      window.removeEventListener('scroll', scheduleTopBarTitleUpdate);
      window.removeEventListener('resize', scheduleTopBarTitleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  function scrollToEditor(target: ReplyTarget) {
    setReplyTarget(target);
    window.requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function replyToFloor(floor: ThreadFloorData, targetName?: string) {
    scrollToEditor({ author: targetName ?? floor.author.name, floor: floor.floor });
  }

  function quoteFloor(floor: ThreadFloorData) {
    scrollToEditor({
      author: floor.author.name,
      floor: floor.floor,
      quote: floor.paragraphs[0].slice(0, 90),
    });
  }

  function toggleAuthorOnly() {
    const params = new URLSearchParams(window.location.search);
    params.set('thread', String(demoThread.id));
    params.set('page', '1');
    if (authorOnly) params.delete('author');
    else params.set('author', '1');
    window.location.href = `/?${params.toString()}`;
  }

  function toggleBookmark() {
    setBookmarked((current) => {
      const next = !current;
      window.localStorage.setItem(`capubbs-bookmark-${demoThread.id}`, next ? '1' : '0');
      return next;
    });
  }

  const nodeFloors = pageFloors.map((floor) => ({ floor: floor.floor, author: floor.author.name }));

  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar showThreadTitle={showTitleInTopBar} threadTitle={demoThread.title} />

      <main className="thread-page-shell">
        <div className="thread-route-row">
          <nav aria-label="面包屑">
            <a href={demoThread.boardHref}>{demoThread.board}</a>
            <span>/</span>
            <span>{demoThread.title}</span>
          </nav>
          <ThreadPagination
            authorOnly={authorOnly}
            compact
            currentPage={currentPage}
            pageCount={pageCount}
            threadId={demoThread.id}
          />
        </div>

        <header className="thread-title-card">
          <h1 id="thread-title" ref={titleRef}>{demoThread.title}</h1>
          <div className="thread-title-meta">
            <span><MessageCircle size={15} />{demoThread.floors.length - 1} 条回复</span>
            <span><Eye size={16} />{demoThread.views} 次浏览</span>
            <div className="thread-title-actions">
              <button
                aria-pressed={authorOnly}
                className={authorOnly ? 'thread-title-action-active' : ''}
                onClick={toggleAuthorOnly}
                type="button"
              >
                {authorOnly ? '查看全部' : '只看楼主'}
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
          <section className="thread-floor-list" aria-label={`第 ${currentPage} 页楼层`}>
            {pageFloors.map((floor) => (
              <ThreadFloor
                floor={floor}
                isMainPost={floor.floor === 1}
                key={floor.id}
                onQuote={quoteFloor}
                onReply={replyToFloor}
              />
            ))}
          </section>
          <FloorNodes activeFloor={activeFloor} floors={nodeFloors} />
        </div>

        <div className="thread-bottom-pagination">
          <ThreadPagination
            authorOnly={authorOnly}
            currentPage={currentPage}
            pageCount={pageCount}
            threadId={demoThread.id}
          />
        </div>

        <ReplyEditor
          editorRef={editorRef}
          onClearTarget={() => setReplyTarget(null)}
          target={replyTarget}
          threadTitle={demoThread.title}
        />
      </main>

      {nodeFloors.length > 0 && <MobileFloorNode activeFloor={activeFloor} floors={nodeFloors} />}
    </div>
  );
}
