import { getPublicProfilePath } from '../utils/userRoutes';
import { normalizeLegacyAvatar } from '../utils/legacyAssets';

const HOME_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';
const avatarCache = new Map<string, string>();
const avatarRequests = new Map<string, Promise<string>>();

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

type ApiRow = Record<string, unknown>;

export type HomeThread = {
  author: string;
  authorHref: string;
  avatar: string;
  bid: number;
  href: string;
  id: string;
  isRecent: boolean;
  replies: number;
  summary: string;
  tid: number;
  timeLabel: string;
  timestamp: string;
  title: string;
  views: number;
};

export class HomeApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HomeApiError';
  }
}

export async function fetchHomeFeed(signal?: AbortSignal) {
  const rows = await requestRows({ ask: 'hot', hotnum: 15, text: 'true' }, signal);
  return rows.map(mapThreadRow).filter((thread): thread is HomeThread => thread !== null);
}

export async function fetchGlobalPinnedThreads(signal?: AbortSignal) {
  const rows = await requestRows({ ask: 'global_top' }, signal);
  return rows.map(mapThreadRow).filter((thread): thread is HomeThread => thread !== null);
}

export async function hydrateHomeThreadAvatars(threads: HomeThread[], signal?: AbortSignal) {
  throwIfAborted(signal);
  const authors = Array.from(new Set(threads.map((thread) => thread.author).filter(Boolean)));
  const avatars = new Map<string, string>();
  let nextAuthorIndex = 0;

  async function loadNextAvatar() {
    while (nextAuthorIndex < authors.length) {
      const author = authors[nextAuthorIndex];
      nextAuthorIndex += 1;
      avatars.set(author, await fetchUserAvatar(author));
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(4, authors.length) }, () => loadNextAvatar()),
  );
  throwIfAborted(signal);

  return threads.map((thread) => ({
    ...thread,
    avatar: avatars.get(thread.author) ?? '',
  }));
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

function mapThreadRow(row: ApiRow): HomeThread | null {
  const bid = toNumber(row.bid);
  const tid = toNumber(row.tid);
  const title = plainText(row.title);

  if (bid <= 0 || tid <= 0 || !title) return null;

  const author = plainText(row.replyer) || plainText(row.author) || '匿名用户';
  const timestamp = toTimestamp(row.timestamp ?? row.postdate);
  const rawSummary = typeof row.text === 'string' ? row.text : '';
  const summary = excerptText(rawSummary) || (
    bid === 1
      ? '该版块的回复摘要仅对登录用户可见。'
      : '暂无可显示的回复摘要。'
  );

  return {
    author,
    authorHref: getPublicProfilePath(author),
    avatar: '',
    bid,
    href: `/?bid=${bid}&tid=${tid}&p=1`,
    id: `${bid}-${tid}`,
    isRecent: timestamp ? Date.now() - new Date(timestamp).getTime() < 24 * 60 * 60 * 1000 : false,
    replies: toNumber(row.reply),
    summary,
    tid,
    timeLabel: formatRelativeTime(timestamp),
    timestamp,
    title,
    views: toNumber(row.click),
  };
}

async function fetchUserAvatar(username: string) {
  const cachedAvatar = avatarCache.get(username);
  if (cachedAvatar !== undefined) return cachedAvatar;

  const pendingRequest = avatarRequests.get(username);
  if (pendingRequest) return pendingRequest;

  const request = requestRows({ ask: 'user_profile', username })
    .then((rows) => normalizeLegacyAvatar(rows[0]?.icon))
    .catch(() => '')
    .then((avatar) => {
      avatarCache.set(username, avatar);
      return avatar;
    })
    .finally(() => avatarRequests.delete(username));

  avatarRequests.set(username, request);
  return request;
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
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
