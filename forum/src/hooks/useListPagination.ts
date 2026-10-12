import { useEffect, useRef, useState } from 'react';

// Client-side paging for lists already loaded in full. Changing resetKey
// (selected tag, sort order, filters) returns to the first page.
export function useListPagination<T>(items: T[], pageSize: number, resetKey: unknown = null) {
  const [page, setPage] = useState(1);
  const anchorRef = useRef<HTMLDivElement>(null);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pageCount);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  function changePage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), pageCount));
    const anchor = anchorRef.current;
    if (anchor && anchor.getBoundingClientRect().top < 0) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return {
    anchorRef,
    currentPage,
    onPageChange: changePage,
    pageCount,
    pageItems: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
  };
}
