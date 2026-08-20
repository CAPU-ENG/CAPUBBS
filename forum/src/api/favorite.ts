const FAVORITE_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

type ApiEnvelope = {
  code: number;
  message?: string;
};

export class FavoriteApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FavoriteApiError';
  }
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
