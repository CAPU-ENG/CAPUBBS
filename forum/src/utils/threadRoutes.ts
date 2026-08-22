const THREAD_PAGE_SIZE = 12;

export type ThreadNestedReplyTarget = {
  author: string;
  floor: number;
  time: number;
};

const NESTED_REPLY_HASH_PATTERN = /^#lzl-([1-9]\d*)-(.+)-(\d+)$/;

export function getThreadFloorFromHash(hash: string) {
  const match = hash.match(/^#(?:floor-)?([1-9]\d*)$/);
  if (match) {
    const floor = Number(match[1]);
    return Number.isSafeInteger(floor) ? floor : 0;
  }

  const nestedReply = getThreadNestedReplyTargetFromHash(hash);
  return nestedReply?.floor ?? 0;
}

export function getThreadNestedReplyTargetFromHash(hash: string): ThreadNestedReplyTarget | null {
  const match = hash.match(NESTED_REPLY_HASH_PATTERN);
  if (!match) return null;

  let author = '';
  try {
    author = decodeURIComponent(match[2]);
  } catch {
    return null;
  }

  const floor = Number(match[1]);
  const time = Number(match[3]);
  if (!author || !Number.isSafeInteger(floor) || !Number.isSafeInteger(time) || time <= 0) return null;
  return { author, floor, time };
}

export function getThreadNestedReplyElement(target: ThreadNestedReplyTarget) {
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>('[data-nested-reply-floor]'),
  );
  const matches = candidates.filter((element) => (
    Number(element.dataset.nestedReplyFloor) === target.floor
    && element.dataset.nestedReplyAuthor === target.author
  ));
  return matches.find((element) => nestedReplyTimeMatches(element.dataset.nestedReplyTime, target.time))
    ?? matches[0]
    ?? null;
}

function nestedReplyTimeMatches(value: string | undefined, timestamp: number) {
  if (!value) return false;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return Math.floor(numeric) === timestamp;

  const parsed = Date.parse(value.replace(
    /^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,
    '$1-$2-$3 $4:$5:$6',
  ));
  return Number.isFinite(parsed) && Math.floor(parsed / 1000) === timestamp;
}

export function getThreadFloorElement(floor: number) {
  if (!Number.isSafeInteger(floor) || floor <= 0) return null;
  return document.getElementById(String(floor))
    ?? document.getElementById(`floor-${floor}`);
}

export function getThreadPageForFloor(floor: number) {
  return Math.max(1, Math.ceil(floor / THREAD_PAGE_SIZE));
}

export function getThreadHref(bid: number, tid: number) {
  const params = new URLSearchParams({
    bid: String(bid),
    p: '1',
    tid: String(tid),
  });
  return `/?${params.toString()}`;
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
