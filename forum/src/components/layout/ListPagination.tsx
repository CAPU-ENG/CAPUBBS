import { Pagination } from './Pagination';

export function ListPagination({
  ariaLabel,
  className = '',
  currentPage,
  onPageChange,
  pageCount,
}: {
  ariaLabel: string;
  className?: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className={`list-pagination forum-pagination-card ${className}`}>
      <Pagination
        ariaLabel={ariaLabel}
        compact
        currentPage={currentPage}
        onPageChange={onPageChange}
        pageCount={pageCount}
        showPageJump
      />
    </div>
  );
}
