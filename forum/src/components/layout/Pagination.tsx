import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

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

  const windowStart = Math.min(Math.max(currentPage - 3, 1), pageCount - 6);
  return Array.from({ length: 7 }, (_, index) => windowStart + index);
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
  const pageJumpVisible = showPageJump && pagesAreCollapsed;

  return (
    <nav
      className={`thread-pagination ${compact ? 'thread-pagination-compact' : ''} ${pageJumpVisible ? 'thread-pagination-with-jump' : ''}`}
      aria-label={ariaLabel}
    >
      <div className="thread-pagination-pages">
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

        {pages[0] > 1 ? <span className="thread-page-gap">…</span> : null}
        {pages.map((page) => (
          <span className="contents" key={page}>
            <a
              aria-current={page === currentPage ? 'page' : undefined}
              className="thread-page-number"
              href={pageHref(page)}
            >
              {page}
            </a>
          </span>
        ))}
        {pages[pages.length - 1] < pageCount ? <span className="thread-page-gap">…</span> : null}

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
      </div>

      {pageJumpVisible ? (
        <div aria-label="跳转页码" className="thread-page-jump">
          <span>跳转到</span>
          <details>
            <summary>
              页数
              <ChevronDown aria-hidden="true" size={14} />
            </summary>
            <div aria-label={`选择页码，共 ${pageCount} 页`} className="thread-page-jump-menu">
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                <a
                  aria-current={page === currentPage ? 'page' : undefined}
                  href={pageHref(page)}
                  key={page}
                >
                  {page}
                </a>
              ))}
            </div>
          </details>
        </div>
      ) : null}
    </nav>
  );
}
