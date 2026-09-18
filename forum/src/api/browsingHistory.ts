const HISTORY_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

export type BrowsingHistoryThread = {
  author: string;
  bid: number;
  board: string;
  tid: number;
  title: string;
};

export type BrowsingHistoryDay = {
  date: string;
  threads: BrowsingHistoryThread[];
};

export type BrowsingHistory = {
  days: BrowsingHistoryDay[];
  endDate: string;
  startDate: string;
};

export class BrowsingHistoryApiError extends Error {
  readonly loginRequired: boolean;

  constructor(message: string, loginRequired = false) {
    super(message);
    this.name = 'BrowsingHistoryApiError';
    this.loginRequired = loginRequired;
  }
}

export async function fetchBrowsingHistory(signal?: AbortSignal): Promise<BrowsingHistory> {
  let response: Response;
  try {
    response = await fetch(HISTORY_API_URL, {
      body: new URLSearchParams({ ask: 'browsing_history' }),
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
    throw new BrowsingHistoryApiError('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: Record<string, unknown>;
  try {
    payload = asRow(await response.json());
  } catch {
    throw new BrowsingHistoryApiError('论坛服务返回了无法识别的数据。');
  }
  if (!response.ok || payload.code !== 0) {
    throw new BrowsingHistoryApiError(
      typeof payload.message === 'string' ? payload.message : '浏览记录读取失败，请稍后重试。',
      response.status === 401,
    );
  }

  const data = asRow(payload.data);
  if (!isDate(data.startDate) || !isDate(data.endDate) || !Array.isArray(data.days)) {
    throw new BrowsingHistoryApiError('论坛服务返回了无法识别的数据。');
  }
  const days = data.days.map((value): BrowsingHistoryDay => {
    const day = asRow(value);
    if (!isDate(day.date) || !Array.isArray(day.threads)) {
      throw new BrowsingHistoryApiError('论坛服务返回了无法识别的数据。');
    }
    return {
      date: day.date,
      threads: day.threads.map((value): BrowsingHistoryThread => {
        const thread = asRow(value);
        const bid = Number(thread.bid);
        const tid = Number(thread.tid);
        if (!Number.isSafeInteger(bid) || bid <= 0 || !Number.isSafeInteger(tid) || tid <= 0) {
          throw new BrowsingHistoryApiError('论坛服务返回了无法识别的数据。');
        }
        return {
          author: plainText(thread.author),
          bid,
          board: plainText(thread.board) || `版块 ${bid}`,
          tid,
          title: plainText(thread.title) || '无标题',
        };
      }),
    };
  });
  return { days, endDate: data.endDate, startDate: data.startDate };
}

function asRow(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function isDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function plainText(value: unknown) {
  if (typeof value !== 'string') return '';
  const template = document.createElement('template');
  template.innerHTML = value;
  return (template.content.textContent ?? '').replace(/\s+/g, ' ').trim();
}
