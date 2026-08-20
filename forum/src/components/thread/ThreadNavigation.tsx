import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination } from '../layout/Pagination';

type PaginationProps = {
  boardId: number;
  currentPage: number;
  pageCount: number;
  threadId: number;
  authorOnly?: boolean;
  compact?: boolean;
};

function pageHref(boardId: number, threadId: number, page: number, authorOnly: boolean) {
  const params = new URLSearchParams({
    bid: String(boardId),
    p: String(page),
    tid: String(threadId),
  });
  if (authorOnly) params.set('see_lz', '1');
  return `/?${params.toString()}`;
}

export function ThreadPagination({
  authorOnly = false,
  boardId,
  compact = false,
  currentPage,
  pageCount,
  threadId,
}: PaginationProps) {
  return (
    <Pagination
      ariaLabel="帖子分页"
      compact={compact}
      currentPage={currentPage}
      pageCount={pageCount}
      pageHref={(page) => pageHref(boardId, threadId, page, authorOnly)}
    />
  );
}

type FloorNode = { floor: number; author: string; preview: string };

export function FloorNodes({
  activeFloor,
  floors,
}: {
  activeFloor: number;
  floors: FloorNode[];
}) {
  function navigateToFloor(floor: number) {
    document.getElementById(`floor-${floor}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${floor}`);
  }

  return (
    <aside className="floor-node-rail" aria-label="当前页楼层目录">
      <div className="floor-node-line" aria-hidden="true" />
      {floors.map((entry) => {
        const active = entry.floor === activeFloor;
        const tooltipId = `floor-node-preview-${entry.floor}`;
        return (
          <button
            aria-current={active ? 'location' : undefined}
            aria-describedby={tooltipId}
            aria-label={`跳转到第 ${entry.floor} 楼，作者 ${entry.author}`}
            className={`floor-node ${active ? 'floor-node-active' : ''}`}
            key={entry.floor}
            onClick={() => navigateToFloor(entry.floor)}
            type="button"
          >
            <span aria-hidden="true" className="floor-node-dot" />
            {active && <strong>#{entry.floor}</strong>}
            <span className="floor-node-preview" id={tooltipId} role="tooltip">
              <span className="floor-node-preview-meta">
                <strong>{entry.author}</strong>
                <em>#{entry.floor}</em>
              </span>
              <span className="floor-node-preview-content">{entry.preview}</span>
            </span>
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
