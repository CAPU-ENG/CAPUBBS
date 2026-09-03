import { getPublicProfilePath } from '../utils/userRoutes';
import { normalizeLegacyAvatar } from '../utils/legacyAssets';
import { maskActivitySignupSummary } from '../utils/activityPhonePrivacy';
import { compareForumIndexVersion } from '../utils/forumIndexCache';

const HOME_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';
const HOME_CALENDAR_API_URL = import.meta.env.VITE_CALENDAR_API_URL?.trim()
  || '/assets/api/getCalendar.php';

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
  meta?: unknown;
};

type ApiRow = Record<string, unknown>;

export type HomeThread = {
  author: string;
  authorHref: string;
  avatar: string;
  bid: number;
  href: string;
  id: string;
  replies: number;
  summary: string;
  tid: number;
  timeLabel: string;
  timestamp: string;
  title: string;
  views: number;
};

export type HomeFeedSnapshot = {
  dirty: boolean;
  expiresAt: number;
  fullUrl: string;
  generation: string;
  items: HomeThread[];
  total: number;
};

export type HomeFeedPage = {
  hasMore: boolean;
  items: HomeThread[];
  snapshot: HomeFeedSnapshot | null;
};

export type HomeCalendarEvent = {
  date: string;
  description: string;
  id: string;
  time: string;
  title: string;
  url: string;
};

export type HomeSignupActivity = {
  activityEndsOn: string;
  activityStartsOn: string;
  endsAt: string;
  href: string;
  id: string;
  signupCount: number;
  startsAt: string;
  title: string;
};

export class HomeApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HomeApiError';
  }
}

export async function fetchHomeFeed(limit = 15, signal?: AbortSignal, includeText = true) {
  const rows = await requestRows({ ask: 'hot', hotnum: limit, text: includeText ? '1' : '0' }, signal);
  return rows.map((row) => mapThreadRow(row, true)).filter((thread): thread is HomeThread => thread !== null);
}

export async function fetchHomeFeedPage({
  includeText = true,
  limit = 15,
  previous = null,
  signal,
}: {
  includeText?: boolean;
  limit?: number;
  previous?: HomeFeedSnapshot | null;
  signal?: AbortSignal;
}): Promise<HomeFeedPage> {
  if (previous) {
    const visibleCount = Math.min(limit, previous.total);
    if (previous.items.length >= visibleCount) {
      return snapshotPage(previous, limit);
    }

    try {
      const fullSnapshot = await requestSnapshot(previous.fullUrl, {
        expectedGeneration: previous.generation,
        signal,
      });
      return snapshotPage(fullSnapshot, limit);
    } catch (error) {
      if (isAbortError(error)) throw error;
    }
  }

  const publicSnapshotUrl = homeApiSiblingUrl(
    includeText ? 'cache/home-hot/hot-15.json' : 'cache/home-hot/hot-30-compact.json',
  );
  try {
    const snapshot = await loadPublicSnapshot(publicSnapshotUrl, limit, signal);
    if (snapshot.dirty || snapshot.expiresAt <= Math.floor(Date.now() / 1000)) triggerSnapshotRefresh();
    return snapshotPage(snapshot, limit);
  } catch (error) {
    if (isAbortError(error)) throw error;
  }

  try {
    await requestSnapshotRefresh(signal);
    const snapshot = await waitForPublicSnapshot(publicSnapshotUrl, limit, signal);
    return snapshotPage(snapshot, limit);
  } catch (error) {
    if (isAbortError(error)) throw error;
  }

  const items = await fetchHomeFeed(limit, signal, includeText);
  triggerSnapshotRefresh();
  return {
    hasMore: items.length >= limit,
    items,
    snapshot: null,
  };
}

function snapshotPage(snapshot: HomeFeedSnapshot, limit: number): HomeFeedPage {
  const items = snapshot.items.slice(0, limit);
  return {
    hasMore: items.length < snapshot.total,
    items,
    snapshot,
  };
}

async function loadPublicSnapshot(url: string, limit: number, signal?: AbortSignal) {
  const snapshot = await requestSnapshot(url, { signal });
  if (snapshot.items.length >= Math.min(limit, snapshot.total)) return snapshot;
  return requestSnapshot(snapshot.fullUrl, {
    expectedGeneration: snapshot.generation,
    signal,
  });
}

async function requestSnapshot(
  url: string,
  {
    expectedGeneration,
    signal,
  }: {
    expectedGeneration?: string;
    signal?: AbortSignal;
  },
): Promise<HomeFeedSnapshot> {
  const response = await fetch(safeSnapshotUrl(url), {
    cache: expectedGeneration ? 'force-cache' : 'no-store',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) throw new HomeApiError('热帖快照加载失败。');

  const payload = await response.json() as ApiEnvelope;
  const meta = isApiRow(payload.meta) ? payload.meta : {};
  const kind = plainSnapshotString(meta.kind);
  const generation = plainSnapshotString(meta.generation);
  compareForumIndexVersion(plainSnapshotString(meta.indexVersion));
  if (payload.code !== 0 || !isSnapshotGeneration(generation)
    || (expectedGeneration && generation !== expectedGeneration) || !Array.isArray(payload.data)) {
    throw new HomeApiError('热帖快照数据无效。');
  }
  const items = payload.data
    .filter(isApiRow)
    .map((row) => mapThreadRow(row, true))
    .filter((thread): thread is HomeThread => thread !== null);
  const total = kind === 'full' ? items.length : toNumber(meta.total);
  return {
    dirty: meta.dirty === true,
    expiresAt: toNumber(meta.expiresAt),
    fullUrl: homeSnapshotFullUrl(generation),
    generation,
    items,
    total: Math.max(items.length, total),
  };
}

function homeSnapshotFullUrl(generation: string) {
  if (!isSnapshotGeneration(generation)) throw new HomeApiError('热帖快照版本无效。');
  return safeSnapshotUrl(homeApiSiblingUrl(`cache/home-hot/snapshots/${generation}/hot-100.json`));
}

function triggerSnapshotRefresh() {
  void requestSnapshotRefresh().catch(() => undefined);
}

async function requestSnapshotRefresh(signal?: AbortSignal) {
  const response = await fetch(homeApiSiblingUrl('home-hot-refresh.php'), {
    cache: 'no-store',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    method: 'POST',
    signal,
  });
  if (!response.ok) throw new HomeApiError('热帖快照初始化失败。');
}

async function waitForPublicSnapshot(url: string, limit: number, signal?: AbortSignal) {
  const delays = [0, 100, 250, 500, 1_000, 2_000];
  let lastError: unknown = new HomeApiError('热帖快照尚未初始化。');
  for (const delay of delays) {
    if (delay) await abortableDelay(delay, signal);
    try {
      return await loadPublicSnapshot(url, limit, signal);
    } catch (error) {
      if (isAbortError(error)) throw error;
      lastError = error;
    }
  }
  throw lastError;
}

function abortableDelay(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const handleAbort = () => {
      window.clearTimeout(timeout);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timeout = window.setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort);
      resolve();
    }, milliseconds);
    signal?.addEventListener('abort', handleAbort, { once: true });
  });
}

function homeApiSiblingUrl(path: string) {
  return new URL(path, new URL(HOME_API_URL, window.location.origin)).href;
}

function safeSnapshotUrl(value: string) {
  const apiUrl = new URL(HOME_API_URL, window.location.origin);
  const url = new URL(value, apiUrl);
  if (url.origin !== apiUrl.origin || !url.pathname.startsWith('/api/cache/home-hot/')) {
    throw new HomeApiError('热帖快照地址无效。');
  }
  return url.href;
}

function plainSnapshotString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isSnapshotGeneration(value: string) {
  return /^\d{14}-[a-f0-9]{10}$/.test(value);
}

export async function fetchGlobalPinnedThreads(signal?: AbortSignal) {
  const rows = await requestRows({ ask: 'global_top' }, signal);
  return rows.map((row) => mapThreadRow(row)).filter((thread): thread is HomeThread => thread !== null);
}

export async function fetchHomeSignupActivities(limit = 5, signal?: AbortSignal) {
  const rows = await requestRows({ ask: 'activity_signup_list', limit }, signal);
  return rows
    .map(mapSignupActivityRow)
    .filter((activity): activity is HomeSignupActivity => activity !== null);
}

type CalendarRequest = {
  endDate?: string;
  full?: boolean;
  startDate?: string;
};

export async function fetchHomeCalendar(signal?: AbortSignal, request: CalendarRequest = {}) {
  const url = new URL(HOME_CALENDAR_API_URL, window.location.origin);
  if (request.full) {
    url.searchParams.set('full', '1');
  } else {
    if (request.startDate) url.searchParams.set('start_date', request.startDate);
    if (request.endDate) url.searchParams.set('end_date', request.endDate);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new HomeApiError('暂时无法连接日历服务，请稍后重试。');
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new HomeApiError('日历服务返回了无法识别的数据。');
  }

  if (!response.ok || !Array.isArray(payload)) {
    throw new HomeApiError('日历数据加载失败，请稍后重试。');
  }

  return payload
    .map(mapCalendarRow)
    .filter((event): event is HomeCalendarEvent => event !== null)
    .sort((left, right) => `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`));
}

async function requestRows(params: Record<string, string | number>, signal?: AbortSignal) {
  const body = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => body.set(key, String(value)));

  let response: Response;
  try {
    response = await fetch(HOME_API_URL, {
      body,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new HomeApiError('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new HomeApiError('论坛服务返回了无法识别的数据。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new HomeApiError(payload.message?.trim() || '论坛数据加载失败，请稍后重试。');
  }

  const rows = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];
  return rows.filter(isApiRow);
}

function mapThreadRow(row: ApiRow, linkToLatestFloor = false): HomeThread | null {
  const bid = toNumber(row.bid);
  const tid = toNumber(row.tid);
  const title = plainText(row.title);

  if (bid <= 0 || tid <= 0 || !title) return null;

  const author = plainText(row.replyer) || plainText(row.author) || '匿名用户';
  const replies = toNumber(row.reply);
  const targetFloor = replies + 1;
  const timestamp = toTimestamp(row.timestamp ?? row.postdate);
  const rawSummary = typeof row.text === 'string' ? row.text : null;
  const textSummary = rawSummary === null ? '' : excerptText(maskActivitySignupSummary(rawSummary));
  const summary = textSummary || (
    rawSummary !== null && rawSummary.trim()
      ? '【非文字内容】'
      : bid === 1
        ? '该版块的回复摘要仅对登录用户可见。'
        : '暂无可显示的回复摘要。'
  );

  return {
    author,
    authorHref: getPublicProfilePath(author),
    avatar: normalizeLegacyAvatar(row.icon),
    bid,
    href: linkToLatestFloor
      ? `/?bid=${bid}&tid=${tid}#${targetFloor}`
      : `/?bid=${bid}&tid=${tid}&p=1`,
    id: `${bid}-${tid}`,
    replies,
    summary,
    tid,
    timeLabel: formatRelativeTime(timestamp),
    timestamp,
    title,
    views: toNumber(row.click),
  };
}

function mapCalendarRow(value: unknown, index: number): HomeCalendarEvent | null {
  if (!isApiRow(value)) return null;

  const rawDate = typeof value.date === 'string' ? value.date.trim() : '';
  const match = rawDate.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::\d{2})?$/,
  );
  if (!match) return null;

  const [, year, month, day, hour, minute] = match;
  const dateParts = [year, month, day, hour, minute].map(Number);
  const [numericYear, numericMonth, numericDay, numericHour, numericMinute] = dateParts;
  const calendarDate = new Date(numericYear, numericMonth - 1, numericDay);
  const hasValidDate = calendarDate.getFullYear() === numericYear
    && calendarDate.getMonth() === numericMonth - 1
    && calendarDate.getDate() === numericDay;
  if (!hasValidDate || numericHour > 23 || numericMinute > 59) return null;

  const title = plainText(value.title);
  if (!title) return null;

  const date = `${year}-${month}-${day}`;
  const time = `${hour}:${minute}`;
  return {
    date,
    description: plainText(value.description),
    id: `${date}-${time}-${title}-${index}`,
    time,
    title,
    url: normalizeCalendarUrl(value.url),
  };
}

function mapSignupActivityRow(row: ApiRow): HomeSignupActivity | null {
  const activityId = toNumber(row.activity_id);
  const bid = toNumber(row.bid);
  const tid = toNumber(row.tid);
  const title = plainText(row.name);
  const startsAt = toTimestamp(row.starts_at);
  const endsAt = toTimestamp(row.ends_at);
  const activityStartsOn = toDateOnly(row.activity_starts_on);
  const activityEndsOn = toDateOnly(row.activity_ends_on);

  if (!activityId || !bid || !tid || !title || !startsAt || !endsAt
    || !activityStartsOn || !activityEndsOn) return null;

  return {
    activityEndsOn,
    activityStartsOn,
    endsAt,
    href: `/?bid=${bid}&tid=${tid}&p=1`,
    id: String(activityId),
    signupCount: toNumber(row.signup_count),
    startsAt,
    title,
  };
}

function toDateOnly(value: unknown) {
  if (typeof value !== 'string') return '';
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
    ? value
    : '';
}

function normalizeCalendarUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return '';

  try {
    const parsedUrl = new URL(value.trim(), window.location.origin);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') return '';
    return parsedUrl.origin === window.location.origin
      ? `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
      : parsedUrl.href;
  } catch {
    return '';
  }
}

function excerptText(value: string) {
  if (!value.trim()) return '';

  const withoutQuotedContent = value
    .replace(/\[quote(?:=[^\]]*)?\][\s\S]*?\[\/quote\]/gi, ' ')
    .replace(/\[img(?:=[^\]]*)?\][\s\S]*?\[\/img\]/gi, ' ')
    .replace(/<(?:script|style|blockquote)\b[^>]*>[\s\S]*?<\/(?:script|style|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(?:div|p|li)>/gi, ' ');

  const parser = new DOMParser();
  const document = parser.parseFromString(withoutQuotedContent, 'text/html');
  return (document.body.textContent ?? '')
    .replace(/\[(?:\/?[a-z][^\]]*)\]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function plainText(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  const parser = new DOMParser();
  const document = parser.parseFromString(String(value), 'text/html');
  return (document.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function toTimestamp(value: unknown) {
  const numericValue = Number(value);
  if (Number.isFinite(numericValue) && numericValue > 0) {
    const milliseconds = numericValue > 10_000_000_000 ? numericValue : numericValue * 1000;
    return new Date(milliseconds).toISOString();
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  return '';
}

function formatRelativeTime(timestamp: string) {
  if (!timestamp) return '时间未知';

  const date = new Date(timestamp);
  const difference = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(difference / 60_000);
  const hours = Math.floor(difference / 3_600_000);
  const days = Math.floor(difference / 86_400_000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;

  return new Intl.DateTimeFormat('zh-CN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  }).format(date);
}

function isApiRow(value: unknown): value is ApiRow {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
