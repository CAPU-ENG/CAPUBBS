const THREAD_API_URL = import.meta.env?.VITE_API_URL?.trim() || '/api/api.php';
const DEFAULT_PUBLISH_TIMEOUT_MS = 15_000;

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

type ApiRow = Record<string, unknown>;

export type ThreadPublicationRequest = {
  attachments: string;
  author: string;
  bid: number;
  signatureIndex: number;
  text: string;
  tid: number | null;
  title: string;
};

export type PublishedThreadResult = {
  bid: number;
  pid: number | null;
  tid: number | null;
};

type ThreadPublishingOptions = {
  publishTimeoutMs?: number;
};

export class ThreadPublishingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThreadPublishingError';
  }
}

class PublishTransportError extends Error {
  constructor(kind: 'invalid_response' | 'network' | 'timeout') {
    super(kind);
    this.name = 'PublishTransportError';
  }
}

export async function publishThreadContent(
  request: ThreadPublicationRequest,
  options: ThreadPublishingOptions = {},
): Promise<PublishedThreadResult> {
  if (request.text.length > 100_000) {
    throw new ThreadPublishingError('正文超过 10 万字符，请精简内容或检查是否粘贴了过大的图片。');
  }
  const action = request.tid ? 'reply' : 'post';
  const body = new URLSearchParams({
    ask: action,
    attachs: request.attachments,
    bid: String(request.bid),
    sig: String(request.signatureIndex),
    text: request.text,
    title: request.title,
    ...(request.tid ? { tid: String(request.tid) } : {}),
    type: 'web',
  });

  try {
    const payload = await requestPublish(
      body,
      options.publishTimeoutMs ?? DEFAULT_PUBLISH_TIMEOUT_MS,
      request.tid ? '回复发布失败，请稍后重试。' : '主题发表失败，请稍后重试。',
      !request.tid,
    );
    if (!payload) {
      return {
        bid: request.bid,
        pid: null,
        tid: request.tid,
      };
    }
    return mapPublishedResult(payload.data, request);
  } catch (error) {
    if (!(error instanceof PublishTransportError)) throw error;
    throw new ThreadPublishingError(
      '发布结果暂时无法确认，请刷新帖子检查是否已经发布，避免重复提交。',
    );
  }
}

async function requestPublish(
  body: URLSearchParams,
  timeoutMs: number,
  fallbackMessage: string,
  readSuccessPayload: boolean,
) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(THREAD_API_URL, {
      body,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
      signal: controller.signal,
    });

    if (response.ok && !readSuccessPayload) {
      if (response.body) void response.body.cancel().catch(() => undefined);
      return null;
    }

    let payload: ApiEnvelope;
    try {
      payload = await response.json() as ApiEnvelope;
    } catch {
      throw new PublishTransportError(timedOut ? 'timeout' : 'invalid_response');
    }

    if (!response.ok || payload.code !== 0) {
      throw new ThreadPublishingError(payload.message?.trim() || fallbackMessage);
    }
    return payload;
  } catch (error) {
    if (error instanceof ThreadPublishingError || error instanceof PublishTransportError) throw error;
    throw new PublishTransportError(timedOut ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }
}

function mapPublishedResult(data: unknown, request: ThreadPublicationRequest): PublishedThreadResult {
  const row = Array.isArray(data)
    ? data.map(asRow).find((item) => Object.keys(item).length > 0) ?? {}
    : asRow(data);
  return {
    bid: positiveInteger(row.bid) || request.bid,
    pid: positiveInteger(row.pid ?? row.floor) || null,
    tid: positiveInteger(row.tid) || request.tid,
  };
}

function asRow(value: unknown): ApiRow {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as ApiRow
    : {};
}

function positiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}
