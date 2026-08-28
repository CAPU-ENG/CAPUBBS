const THREAD_API_URL = import.meta.env?.VITE_API_URL?.trim() || '/api/api.php';
const THREAD_PAGE_SIZE = 12;
const DEFAULT_PUBLISH_TIMEOUT_MS = 15_000;
const DEFAULT_RECOVERY_TIMEOUT_MS = 8_000;
const DEFAULT_RECOVERY_DELAY_MS = 250;

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
  recoveryDelayMs?: number;
  recoveryTimeoutMs?: number;
};

export class ThreadPublishingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThreadPublishingError';
  }
}

class PublishTransportError extends Error {
  constructor(kind: 'network' | 'timeout') {
    super(kind);
    this.name = 'PublishTransportError';
  }
}

export async function publishThreadContent(
  request: ThreadPublicationRequest,
  options: ThreadPublishingOptions = {},
): Promise<PublishedThreadResult> {
  const publishMarker = createPublishMarker();
  const storedText = `${request.text}${publishMarker}`;
  if (storedText.length > 100_000) {
    throw new ThreadPublishingError('正文超过 10 万字符，请精简内容或检查是否粘贴了过大的图片。');
  }
  const action = request.tid ? 'reply' : 'post';
  const body = new URLSearchParams({
    ask: action,
    attachs: request.attachments,
    bid: String(request.bid),
    sig: String(request.signatureIndex),
    text: storedText,
    title: request.title,
    ...(request.tid ? { tid: String(request.tid) } : {}),
    type: 'web',
  });

  try {
    await requestPublish(
      body,
      options.publishTimeoutMs ?? DEFAULT_PUBLISH_TIMEOUT_MS,
      request.tid ? '回复发布失败，请稍后重试。' : '主题发表失败，请稍后重试。',
    );
    return {
      bid: request.bid,
      pid: null,
      tid: request.tid,
    };
  } catch (error) {
    if (!(error instanceof PublishTransportError)) throw error;

    const recovered = await recoverPublishedResult(request, publishMarker, {
      delayMs: options.recoveryDelayMs ?? DEFAULT_RECOVERY_DELAY_MS,
      timeoutMs: options.recoveryTimeoutMs ?? DEFAULT_RECOVERY_TIMEOUT_MS,
    });
    if (recovered) return recovered;

    throw new ThreadPublishingError(
      '发布结果暂时无法确认，请刷新帖子检查是否已经发布，避免重复提交。',
    );
  }
}

async function requestPublish(body: URLSearchParams, timeoutMs: number, fallbackMessage: string) {
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

    if (response.status >= 200 && response.status < 300) {
      if (response.body) void response.body.cancel().catch(() => undefined);
      return;
    }

    let payload: ApiEnvelope | null = null;
    try {
      payload = await response.json() as ApiEnvelope;
    } catch {
      if (timedOut) throw new PublishTransportError('timeout');
    }

    throw new ThreadPublishingError(payload?.message?.trim() || fallbackMessage);
  } catch (error) {
    if (error instanceof ThreadPublishingError || error instanceof PublishTransportError) throw error;
    throw new PublishTransportError(timedOut ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }
}

async function recoverPublishedResult(
  request: ThreadPublicationRequest,
  publishMarker: string,
  { delayMs, timeoutMs }: { delayMs: number; timeoutMs: number },
) {
  if (!request.author.trim()) return null;
  if (delayMs > 0) await delay(delayMs);

  const deadline = Date.now() + timeoutMs;
  const recentBody = new URLSearchParams({
    ask: request.tid ? 'recentreply' : 'recentpost',
    limit: '5',
    view: request.author,
  });
  let recentPayload: ApiEnvelope | null = null;
  while (!recentPayload && Date.now() < deadline) {
    recentPayload = await requestRecovery(recentBody, deadline);
    if (!recentPayload && Date.now() < deadline) await delay(150);
  }
  if (!recentPayload || recentPayload.code !== 0) return null;

  const candidates = asRows(recentPayload.data)
    .filter((row) => positiveInteger(row.bid) === request.bid)
    .filter((row) => !request.tid || positiveInteger(row.tid) === request.tid)
    .filter((row) => positiveInteger(row.pid) > 0)
    .slice(0, 3);

  for (const candidate of candidates) {
    if (Date.now() >= deadline) return null;
    const tid = positiveInteger(candidate.tid);
    const pid = positiveInteger(candidate.pid);
    const detailPayload = await requestRecovery(new URLSearchParams({
      ask: 'thread_detail',
      bid: String(request.bid),
      page: String(Math.max(1, Math.ceil(pid / THREAD_PAGE_SIZE))),
      render: 'raw',
      tid: String(tid),
    }), deadline);
    if (!detailPayload || detailPayload.code !== 0) continue;

    const data = asRow(detailPayload.data);
    const floorsPage = asRow(data.floorsPage);
    const floors = [asRow(data.mainPost), ...asRows(floorsPage.items)];
    const publishedFloor = floors.find((floor) => (
      positiveInteger(floor.pid) === pid
      && stringValue(floor.rawText).includes(publishMarker)
    ));
    if (publishedFloor) return { bid: request.bid, pid, tid };
  }

  return null;
}

async function requestRecovery(body: URLSearchParams, deadline: number) {
  const remainingMs = deadline - Date.now();
  if (remainingMs <= 0) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(4_000, remainingMs));
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
    const payload = await response.json() as ApiEnvelope;
    return response.ok ? payload : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function createPublishMarker() {
  const id = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `<!--capubbs:publish:${id}-->`;
}

function asRow(value: unknown): ApiRow {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as ApiRow
    : {};
}

function asRows(value: unknown) {
  return Array.isArray(value) ? value.map(asRow) : [asRow(value)];
}

function positiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}
