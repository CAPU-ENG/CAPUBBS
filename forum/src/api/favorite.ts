import { getBoardById } from '../data/boards';

const FAVORITE_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

export type FavoriteThread = {
  author: string;
  bid: number;
  board: string;
  clicks: number;
  deleted: boolean;
  favoritedAt: number | null;
  lastReplyAt: number | null;
  replies: number;
  tid: number;
  title: string;
};

export class FavoriteApiError extends Error {
  readonly loginRequired: boolean;

  constructor(message: string, loginRequired = false) {
    super(message);
    this.name = 'FavoriteApiError';
    this.loginRequired = loginRequired;
  }
}

export async function fetchFavoriteThreads(signal?: AbortSignal): Promise<FavoriteThread[]> {
  let response: Response;
  try {
    response = await fetch(FAVORITE_API_URL, {
      body: new URLSearchParams({ ask: 'favorite_list', limit: 'all' }),
      cache: 'no-store',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new FavoriteApiError('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new FavoriteApiError('论坛服务返回了无法识别的数据。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new FavoriteApiError(
      payload.message?.trim() || '收藏读取失败，请稍后重试。',
      response.status === 401,
    );
  }

  const rows = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];
  return rows.flatMap((value): FavoriteThread[] => {
    const row = asRow(value);
    const bid = Number(row.bid);
    const tid = Number(row.tid);
    if (!Number.isSafeInteger(bid) || bid <= 0 || !Number.isSafeInteger(tid) || tid <= 0) return [];
    const deleted = String(row.deleted) === '1';
    return [{
      author: plainText(row.author),
      bid,
      board: getBoardById(bid)?.label ?? `版块 ${bid}`,
      clicks: countValue(row.click),
      deleted,
      favoritedAt: timestampValue(row.fav_timestamp),
      lastReplyAt: timestampValue(row.timestamp),
      replies: countValue(row.reply),
      tid,
      title: deleted ? '' : plainText(row.title) || '无标题',
    }];
  });
}

export async function setThreadBookmarked({
  bid,
  bookmarked,
  tid,
}: {
  bid: number;
  bookmarked: boolean;
  tid: number;
}) {
  const body = new URLSearchParams({
    ask: bookmarked ? 'favorite_add' : 'favorite_remove',
    bid: String(bid),
    tid: String(tid),
  });

  let response: Response;
  try {
    response = await fetch(FAVORITE_API_URL, {
      body,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
    });
  } catch {
    throw new FavoriteApiError('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new FavoriteApiError('论坛服务返回了无法识别的数据。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new FavoriteApiError(payload.message?.trim() || (bookmarked ? '收藏失败，请稍后重试。' : '取消收藏失败，请稍后重试。'));
  }
}

function asRow(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function countValue(value: unknown) {
  const count = Number(value);
  return Number.isSafeInteger(count) && count > 0 ? count : 0;
}

function timestampValue(value: unknown) {
  const timestamp = Number(value);
  return Number.isSafeInteger(timestamp) && timestamp > 0 ? timestamp : null;
}

function plainText(value: unknown) {
  if (typeof value !== 'string') return '';
  const template = document.createElement('template');
  template.innerHTML = value;
  return (template.content.textContent ?? '').replace(/\s+/g, ' ').trim();
}
