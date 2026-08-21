const RANDOM_THREAD_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

export type RandomThreadTarget = {
  bid: number;
  tid: number;
};

export class RandomThreadApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RandomThreadApiError';
  }
}

export async function fetchRandomThread(): Promise<RandomThreadTarget> {
  const body = new URLSearchParams({ ask: 'random_thread' });
  let response: Response;

  try {
    response = await fetch(RANDOM_THREAD_API_URL, {
      body,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
    });
  } catch {
    throw new RandomThreadApiError('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new RandomThreadApiError('论坛服务返回了无法识别的数据。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new RandomThreadApiError(payload.message?.trim() || '随机帖子加载失败，请稍后重试。');
  }

  if (!isRecord(payload.data)) {
    throw new RandomThreadApiError('论坛服务没有返回有效的帖子。');
  }

  const bid = toPositiveInteger(payload.data.bid);
  const tid = toPositiveInteger(payload.data.tid);
  if (!bid || !tid) {
    throw new RandomThreadApiError('论坛服务没有返回有效的帖子。');
  }

  return { bid, tid };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toPositiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : 0;
}
