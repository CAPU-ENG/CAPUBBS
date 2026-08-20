const BOARD_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

export const BOARD_THREADS_PER_PAGE = 25;

export type BoardThreadAction = 'delete' | 'extr' | 'lock' | 'top';

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

type ApiRow = Record<string, unknown>;

export type BoardInfo = {
  id: number;
  moderators: string[];
  name: string;
  requiredStars: number;
  stats: {
    online: number | null;
    replies: number;
    today: number;
    topics: number;
  };
};

export type BoardThreadData = {
  author: string;
  bid: number;
  createdAt: string;
  id: number;
  lastReplyAt: string;
  lastReplyBy: string;
  replies: number;
  status: {
    digest: boolean;
    locked: boolean;
    pinned: boolean;
    top: boolean;
  };
  title: string;
  views: number;
};

export type BoardPageData = {
  board: BoardInfo;
  currentPage: number;
  pageCount: number;
  threads: BoardThreadData[];
};

export class BoardApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BoardApiError';
  }
}

export async function manageBoardThread(
  boardId: number,
  threadId: number,
  action: BoardThreadAction,
) {
  const params: Record<string, string | number> = {
    ask: action,
    bid: boardId,
    tid: threadId,
  };

  if (action === 'delete') params.pid = 0;
  await requestRows(params);
}

export async function fetchBoardPage(
  boardId: number,
  requestedPage: number,
  digestOnly: boolean,
  signal?: AbortSignal,
): Promise<BoardPageData> {
  const infoRows = await requestRows({ ask: 'bbsinfo', bid: boardId }, signal);
  const info = mapBoardInfo(infoRows[0], boardId);
  const totalThreads = digestOnly ? toNumber(infoRows[0]?.extr) : info.stats.topics;
  const pageCount = Math.max(1, Math.ceil(totalThreads / BOARD_THREADS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, requestedPage), pageCount);
  const threadParams: Record<string, string | number> = { bid: boardId, p: currentPage };

  if (digestOnly) threadParams.extr = 1;

  const [threadRows, online] = await Promise.all([
    requestRows(threadParams, signal, true),
    fetchBoardOnlineCount(boardId, signal),
  ]);

  return {
    board: {
      ...info,
      stats: { ...info.stats, online },
    },
    currentPage,
    pageCount,
    threads: threadRows
      .map((row) => mapThreadRow(row, boardId))
      .filter((thread): thread is BoardThreadData => thread !== null),
  };
}

async function fetchBoardOnlineCount(boardId: number, signal?: AbortSignal) {
  try {
    const rows = await requestRows({ ask: 'online' }, signal, true);
    return rows.filter((row) => toNumber(row.nowboard) === boardId).length;
  } catch (error) {
    if (isAbortError(error)) throw error;
    return null;
  }
}

async function requestRows(
  params: Record<string, string | number>,
  signal?: AbortSignal,
  allowEmpty = false,
) {
  const body = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => body.set(key, String(value)));

  let response: Response;
  try {
    response = await fetch(BOARD_API_URL, {
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
    throw new BoardApiError('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new BoardApiError('论坛服务返回了无法识别的数据。');
  }

  if (allowEmpty && payload.code === 2006) return [];

  if (!response.ok || payload.code !== 0) {
    throw new BoardApiError(payload.message?.trim() || '版面数据加载失败，请稍后重试。');
  }

  const rows = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];
  return rows.filter(isApiRow);
}

function mapBoardInfo(row: ApiRow | undefined, boardId: number): BoardInfo {
  const id = toNumber(row?.bid);
  const name = plainText(row?.bbstitle);

  if (!row || id !== boardId || !name) {
    throw new BoardApiError('版面不存在或已被删除。');
  }

  const moderators = [row.m1, row.m2, row.m3, row.m4]
    .map(plainText)
    .filter((moderator, index, values) => moderator && values.indexOf(moderator) === index);

  return {
    id,
    moderators,
    name,
    requiredStars: toNumber(row.need),
    stats: {
      online: null,
      replies: toNumber(row.replies),
      today: toNumber(row.newreply),
      topics: toNumber(row.topics),
    },
  };
}

function mapThreadRow(row: ApiRow, boardId: number): BoardThreadData | null {
  const bid = toNumber(row.bid);
  const id = toNumber(row.tid);
  const title = plainText(row.title);

  if (bid !== boardId || id <= 0 || !title) return null;

  const author = plainText(row.author) || '匿名用户';
  const top = toNumber(row.top) > 0;

  return {
    author,
    bid,
    createdAt: formatExactTimestamp(row.created_at, row.postdate),
    id,
    lastReplyAt: formatExactTimestamp(row.timestamp),
    lastReplyBy: plainText(row.replyer) || author,
    replies: toNumber(row.reply),
    status: {
      digest: toNumber(row.extr) > 0,
      locked: toNumber(row.locked) > 0,
      pinned: top || toNumber(row.global_top) > 0,
      top,
    },
    title,
    views: toNumber(row.click),
  };
}

function formatExactTimestamp(value: unknown, fallbackDate?: unknown) {
  const numericValue = Number(value);
  if (Number.isFinite(numericValue) && numericValue > 0) {
    const milliseconds = numericValue > 10_000_000_000 ? numericValue : numericValue * 1000;
    const parts = new Intl.DateTimeFormat('zh-CN', {
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
      minute: '2-digit',
      month: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
    }).formatToParts(new Date(milliseconds));
    const part = (type: Intl.DateTimeFormatPartTypes) => (
      parts.find((item) => item.type === type)?.value ?? ''
    );

    return `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')}:${part('second')}`;
  }

  const date = plainText(fallbackDate);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date} 时间未知` : '时间未知';
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

function isApiRow(value: unknown): value is ApiRow {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
