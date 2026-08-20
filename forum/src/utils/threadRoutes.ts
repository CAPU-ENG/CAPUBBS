const THREAD_PAGE_SIZE = 12;

export function getThreadComposeHref(bid: number, tid?: number) {
  const params = new URLSearchParams({ bid: String(bid) });
  if (tid) params.set('tid', String(tid));
  return `/post?${params.toString()}`;
}

export function getThreadFloorHref(bid: number, tid: number, pid: number) {
  const params = new URLSearchParams({
    bid: String(bid),
    p: String(Math.ceil(pid / THREAD_PAGE_SIZE)),
    tid: String(tid),
  });
  return `/?${params.toString()}#${pid}`;
}

export function getThreadEditHref(bid: number, tid: number, pid: number) {
  const params = new URLSearchParams({
    bid: String(bid),
    pid: String(pid),
    tid: String(tid),
  });
  return `/editpid?${params.toString()}`;
}
