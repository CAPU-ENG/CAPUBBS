import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination } from '../layout/Pagination';

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

export function ThreadPagination({
  authorOnly = false,
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
      pageHref={(page) => pageHref(threadId, page, authorOnly)}
    />
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
