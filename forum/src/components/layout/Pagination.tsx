import type { MouseEventHandler, ReactNode, SyntheticEvent } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

type PaginationBaseProps = {
  alwaysShowPageJump?: boolean;
  ariaLabel: string;
  compact?: boolean;
  currentPage: number;
  pageCount: number;
  showPageJump?: boolean;
};

type PaginationProps = PaginationBaseProps & (
  | { onPageChange?: never; pageHref: (page: number) => string }
  | { onPageChange: (page: number) => void; pageHref?: never }
);

type PageControlProps = {
  ariaCurrent?: 'page';
  ariaLabel?: string;
  children: ReactNode;
  className: string;
  disabled?: boolean;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title?: string;
};

function PageControl({
  ariaCurrent,
  ariaLabel,
  children,
  className,
  disabled = false,
  href,
  onClick,
  title,
}: PageControlProps) {
  if (onClick) {
    return (
      <button
        aria-current={ariaCurrent}
        aria-label={ariaLabel}
        className={className}
        disabled={disabled}
        onClick={onClick}
        title={title}
        type="button"
      >
        {children}
      </button>
    );
  }

  return (
    <a
      aria-current={ariaCurrent}
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel}
      className={className}
      href={disabled ? undefined : href}
      title={title}
    >
      {children}
    </a>
  );
}

function visiblePages(currentPage: number, pageCount: number) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);

  const windowStart = Math.min(Math.max(currentPage - 3, 1), pageCount - 6);
  return Array.from({ length: 7 }, (_, index) => windowStart + index);
}

export function Pagination({
  alwaysShowPageJump = false,
  ariaLabel,
  compact = false,
  currentPage,
  onPageChange,
  pageCount,
  pageHref,
  showPageJump = false,
}: PaginationProps) {
  const pages = visiblePages(currentPage, pageCount);
  const pagesAreCollapsed = pages.length < pageCount;
  const pageJumpVisible = showPageJump && (alwaysShowPageJump || pagesAreCollapsed);

  function hrefFor(page: number, disabled = false) {
    return pageHref && !disabled ? pageHref(page) : undefined;
  }

  function clickFor(page: number, closeMenu = false): MouseEventHandler<HTMLButtonElement> | undefined {
    if (!onPageChange) return undefined;
    return (event) => {
      onPageChange(page);
      if (closeMenu) event.currentTarget.closest('details')?.removeAttribute('open');
    };
  }

  function revealCurrentPage(event: SyntheticEvent<HTMLDetailsElement>) {
    if (!event.currentTarget.open) return;

    const menu = event.currentTarget.querySelector<HTMLElement>('.thread-page-jump-menu');
    const currentPageLink = menu?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!menu || !currentPageLink) return;

    window.requestAnimationFrame(() => {
      const menuPadding = Number.parseFloat(window.getComputedStyle(menu).paddingTop) || 0;
      menu.scrollTop = currentPageLink.offsetTop - menuPadding;
    });
  }

  return (
    <nav
      className={`thread-pagination ${compact ? 'thread-pagination-compact' : ''} ${pageJumpVisible ? 'thread-pagination-with-jump' : ''}`}
      aria-label={ariaLabel}
    >
      <div className="thread-pagination-pages">
        <PageControl
          aria-label="首页"
          className="thread-page-button"
          disabled={currentPage === 1}
          href={hrefFor(1, currentPage === 1)}
          onClick={clickFor(1)}
          title="首页"
        >
          <ChevronsLeft size={15} />
        </PageControl>

        <PageControl
          aria-label="上一页"
          className="thread-page-button"
          disabled={currentPage === 1}
          href={hrefFor(currentPage - 1, currentPage === 1)}
          onClick={clickFor(currentPage - 1)}
          title="上一页"
        >
          <ChevronLeft size={15} />
        </PageControl>

        {pages[0] > 1 ? <span className="thread-page-gap">…</span> : null}
        {pages.map((page) => (
          <span className="contents" key={page}>
            <PageControl
              ariaCurrent={page === currentPage ? 'page' : undefined}
              className="thread-page-number"
              href={hrefFor(page)}
              onClick={clickFor(page)}
            >
              {page}
            </PageControl>
          </span>
        ))}
        {pages[pages.length - 1] < pageCount ? <span className="thread-page-gap">…</span> : null}

        <PageControl
          aria-label="下一页"
          className="thread-page-button"
          disabled={currentPage === pageCount}
          href={hrefFor(currentPage + 1, currentPage === pageCount)}
          onClick={clickFor(currentPage + 1)}
          title="下一页"
        >
          <ChevronRight size={15} />
        </PageControl>

        <PageControl
          aria-label="尾页"
          className="thread-page-button"
          disabled={currentPage === pageCount}
          href={hrefFor(pageCount, currentPage === pageCount)}
          onClick={clickFor(pageCount)}
          title="尾页"
        >
          <ChevronsRight size={15} />
        </PageControl>
      </div>

      {pageJumpVisible ? (
        <div aria-label="跳转页码" className="thread-page-jump">
          <span>跳转到</span>
          <details onToggle={revealCurrentPage}>
            <summary>
              {currentPage}
              <ChevronDown aria-hidden="true" size={14} />
            </summary>
            <div aria-label={`选择页码，共 ${pageCount} 页`} className="thread-page-jump-menu">
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                <PageControl
                  ariaCurrent={page === currentPage ? 'page' : undefined}
                  className="thread-page-jump-option"
                  href={hrefFor(page)}
                  key={page}
                  onClick={clickFor(page, true)}
                >
                  {page}
                </PageControl>
              ))}
            </div>
          </details>
        </div>
      ) : null}
    </nav>
  );
}
