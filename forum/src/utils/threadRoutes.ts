const THREAD_PAGE_SIZE = 12;

export function getThreadFloorFromHash(hash: string) {
  const match = hash.match(/^#(?:floor-)?([1-9]\d*)$/);
  if (!match) return 0;

  const floor = Number(match[1]);
  return Number.isSafeInteger(floor) ? floor : 0;
}

export function getThreadFloorElement(floor: number) {
  if (!Number.isSafeInteger(floor) || floor <= 0) return null;
  return document.getElementById(String(floor))
    ?? document.getElementById(`floor-${floor}`);
}

export function getThreadPageForFloor(floor: number) {
  return Math.max(1, Math.ceil(floor / THREAD_PAGE_SIZE));
}

export function getThreadComposeHref(bid: number, tid?: number, kind: 'activity' | 'thread' = 'thread') {
  const params = new URLSearchParams({ bid: String(bid) });
  if (tid) params.set('tid', String(tid));
  if (!tid && kind === 'activity') params.set('kind', 'activity');
  return `/post?${params.toString()}`;
}

export function getThreadFloorHref(bid: number, tid: number, pid: number) {
  const params = new URLSearchParams({
    bid: String(bid),
    p: String(getThreadPageForFloor(pid)),
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

export function getActivityManagementHref(bid: number, tid: number) {
  const params = new URLSearchParams({
    bid: String(bid),
    tid: String(tid),
  });
  return `/activity-management?${params.toString()}`;
}
