import { useCallback, useEffect, useState } from 'react';

const SEARCH_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

type ApiRow = Record<string, unknown>;

export type SearchField = 'body' | 'title';

export type SearchRequest = {
  author: string;
  boardId: number | null;
  endDate: string;
  field: SearchField;
  keyword: string;
  requestKey: number;
  startDate: string;
};

export type SearchResult = {
  author: string;
  bid: number;
  id: string;
  pid: number;
  tid: number;
  timestamp: string;
  title: string;
};

type SearchState = {
  error: string;
  results: SearchResult[];
  status: 'error' | 'idle' | 'loading' | 'ready';
};

const idleState: SearchState = { error: '', results: [], status: 'idle' };

export function useSearchData(request: SearchRequest) {
  const [state, setState] = useState<SearchState>(idleState);
  const [retryKey, setRetryKey] = useState(0);
  const retry = useCallback(() => setRetryKey((key) => key + 1), []);

  useEffect(() => {
    if (!request.keyword.trim()) {
      setState(idleState);
      return;
    }

    const controller = new AbortController();
    setState((current) => ({ ...current, error: '', status: 'loading' }));

    void fetchSearchResults(request, controller.signal).then(
      (results) => setState({ error: '', results, status: 'ready' }),
      (error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState({
          error: error instanceof Error ? error.message : '搜索失败，请稍后重试。',
          results: [],
          status: 'error',
        });
      },
    );

    return () => controller.abort();
  }, [request, retryKey]);

  return { ...state, retry };
}

async function fetchSearchResults(request: SearchRequest, signal: AbortSignal) {
  const body = new URLSearchParams({
    ask: 'search',
    author: request.author.trim(),
    bid: String(request.boardId ?? -1),
    endtime: request.endDate,
    keyword: request.keyword.trim(),
    starttime: request.startDate,
    type: request.field === 'body' ? 'post' : 'thread',
  });

  let response: Response;
  try {
    response = await fetch(SEARCH_API_URL, {
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
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new Error('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new Error('论坛服务返回了无法识别的数据。');
  }

  if (payload.code === 2006) return [];
  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.message?.trim() || '搜索失败，请稍后重试。');
  }

  const rows = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];
  return rows
    .filter(isApiRow)
    .map((row) => mapSearchResult(row, request.field))
    .filter((result): result is SearchResult => result !== null);
}

function mapSearchResult(row: ApiRow, field: SearchField): SearchResult | null {
  const bid = positiveInteger(row.bid);
  const tid = positiveInteger(row.tid);
  const title = plainText(row.title);

  if (!bid || !tid || !title) return null;

  const pid = field === 'body' ? positiveInteger(row.pid) || 1 : 1;
  const rawTimestamp = Number(row.updatetime ?? row.replytime ?? row.timestamp ?? row.postdate);
  const timestamp = Number.isFinite(rawTimestamp) && rawTimestamp > 0
    ? new Date(rawTimestamp > 10_000_000_000 ? rawTimestamp : rawTimestamp * 1000).toISOString()
    : '';

  return {
    author: plainText(row.author) || '匿名用户',
    bid,
    id: `${field}-${bid}-${tid}-${pid}`,
    pid,
    tid,
    timestamp,
    title,
  };
}

function positiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function plainText(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  const parser = new DOMParser();
  const document = parser.parseFromString(String(value), 'text/html');
  return (document.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function isApiRow(value: unknown): value is ApiRow {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
