import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  currentPage: number;
  pageCount: number;
  threadId: number;
  authorOnly?: boolean;
  compact?: boolean;
};

function pageHref(threadId: number, page: number, authorOnly: boolean) {
  const params = new URLSearchParams({ thread: String(threadId), page: String(page) });
  if (authorOnly) params.set('author', '1');
  return `/?${params.toString()}`;
}

function visiblePages(currentPage: number, pageCount: number) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  return Array.from(new Set([1, currentPage - 1, currentPage, currentPage + 1, pageCount]))
    .filter((page) => page > 0 && page <= pageCount)
    .sort((left, right) => left - right);
}

export function ThreadPagination({
  authorOnly = false,
  compact = false,
  currentPage,
  pageCount,
  threadId,
}: PaginationProps) {
  const pages = visiblePages(currentPage, pageCount);

  return (
    <nav className={`thread-pagination ${compact ? 'thread-pagination-compact' : ''}`} aria-label="帖子分页">
      <a
        aria-disabled={currentPage === 1}
        aria-label="上一页"
        className="thread-page-button"
        href={currentPage === 1 ? undefined : pageHref(threadId, currentPage - 1, authorOnly)}
      >
        <ChevronLeft size={15} />
        {!compact && <span>上一页</span>}
      </a>

      {pages.map((page, index) => {
        const previous = pages[index - 1];
        return (
          <span className="contents" key={page}>
            {previous && page - previous > 1 ? <span className="thread-page-gap">…</span> : null}
            <a
              aria-current={page === currentPage ? 'page' : undefined}
              className="thread-page-number"
              href={pageHref(threadId, page, authorOnly)}
            >
              {page}
            </a>
          </span>
        );
      })}

      <a
        aria-disabled={currentPage === pageCount}
        aria-label="下一页"
        className="thread-page-button"
        href={currentPage === pageCount ? undefined : pageHref(threadId, currentPage + 1, authorOnly)}
      >
        {!compact && <span>下一页</span>}
        <ChevronRight size={15} />
      </a>
    </nav>
  );
}

type FloorNode = { floor: number; author: string };

export function FloorNodes({
  activeFloor,
  floors,
}: {
  activeFloor: number;
  floors: FloorNode[];
}) {
  function navigateToFloor(floor: number) {
    document.getElementById(`floor-${floor}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#floor-${floor}`);
  }

  return (
    <aside className="floor-node-rail" aria-label="当前页楼层目录">
      <div className="floor-node-line" aria-hidden="true" />
      {floors.map((entry) => {
        const active = entry.floor === activeFloor;
        return (
          <button
            aria-current={active ? 'location' : undefined}
            aria-label={`跳转到第 ${entry.floor} 楼，作者 ${entry.author}`}
            className={`floor-node ${active ? 'floor-node-active' : ''}`}
            key={entry.floor}
            onClick={() => navigateToFloor(entry.floor)}
            title={`#${entry.floor} · ${entry.author}`}
            type="button"
          >
            <span />
            {active && <strong>#{entry.floor}</strong>}
          </button>
        );
      })}
    </aside>
  );
}

export function MobileFloorNode({
  activeFloor,
  floors,
}: {
  activeFloor: number;
  floors: FloorNode[];
}) {
  const currentIndex = Math.max(0, floors.findIndex((floor) => floor.floor === activeFloor));

  function navigate(offset: number) {
    const target = floors[Math.min(floors.length - 1, Math.max(0, currentIndex + offset))];
    if (!target) return;
    document.getElementById(`floor-${target.floor}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="mobile-floor-node" aria-label="移动端楼层导航">
      <button aria-label="上一楼" disabled={currentIndex === 0} onClick={() => navigate(-1)} type="button">
        <ChevronLeft size={14} />
      </button>
      <span>● #{activeFloor}</span>
      <button aria-label="下一楼" disabled={currentIndex === floors.length - 1} onClick={() => navigate(1)} type="button">
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
