import type { FormEvent } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

type PaginationProps = {
  ariaLabel: string;
  compact?: boolean;
  currentPage: number;
  pageCount: number;
  pageHref: (page: number) => string;
  showPageJump?: boolean;
};

function visiblePages(currentPage: number, pageCount: number) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);

  return Array.from(new Set([1, currentPage - 1, currentPage, currentPage + 1, pageCount]))
    .filter((page) => page > 0 && page <= pageCount)
    .sort((left, right) => left - right);
}

export function Pagination({
  ariaLabel,
  compact = false,
  currentPage,
  pageCount,
  pageHref,
  showPageJump = false,
}: PaginationProps) {
  const pages = visiblePages(currentPage, pageCount);
  const pagesAreCollapsed = pages.length < pageCount;

  function jumpToPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const requestedPage = Number(new FormData(event.currentTarget).get('page'));
    if (!Number.isInteger(requestedPage) || requestedPage < 1 || requestedPage > pageCount) return;
    window.location.assign(pageHref(requestedPage));
  }

  return (
    <nav className={`thread-pagination ${compact ? 'thread-pagination-compact' : ''}`} aria-label={ariaLabel}>
      <a
        aria-disabled={currentPage === 1}
        aria-label="首页"
        className="thread-page-button"
        href={currentPage === 1 ? undefined : pageHref(1)}
        title="首页"
      >
        <ChevronsLeft size={15} />
      </a>

      <a
        aria-disabled={currentPage === 1}
        aria-label="上一页"
        className="thread-page-button"
        href={currentPage === 1 ? undefined : pageHref(currentPage - 1)}
        title="上一页"
      >
        <ChevronLeft size={15} />
      </a>

      {pages.map((page, index) => {
        const previous = pages[index - 1];
        return (
          <span className="contents" key={page}>
            {previous && page - previous > 1 ? <span className="thread-page-gap">…</span> : null}
            <a
              aria-current={page === currentPage ? 'page' : undefined}
              className="thread-page-number"
              href={pageHref(page)}
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
        href={currentPage === pageCount ? undefined : pageHref(currentPage + 1)}
        title="下一页"
      >
        <ChevronRight size={15} />
      </a>

      <a
        aria-disabled={currentPage === pageCount}
        aria-label="尾页"
        className="thread-page-button"
        href={currentPage === pageCount ? undefined : pageHref(pageCount)}
        title="尾页"
      >
        <ChevronsRight size={15} />
      </a>

      {showPageJump && pagesAreCollapsed ? (
        <form aria-label="跳转页码" className="thread-page-jump" onSubmit={jumpToPage}>
          <input
            aria-label={`输入页码，范围 1 至 ${pageCount}`}
            inputMode="numeric"
            max={pageCount}
            min={1}
            name="page"
            placeholder="页码"
            required
            step={1}
            type="number"
          />
          <button type="submit">跳转</button>
        </form>
      ) : null}
    </nav>
  );
}
