import type { ThreadImagePriority } from './threadImagePriority';

const MAX_THREAD_IMAGE_BYTES = 64 * 1024 * 1024;
const MAX_ACTIVE_REQUESTS = 6;
const MAX_BACKGROUND_REQUESTS = 2;

type ThreadImageResource = {
  blob: Blob;
  objectUrl: string;
  sourceUrl: string;
};

const resourcePromises = new Map<string, Promise<ThreadImageResource>>();
const resolvedResources = new Map<string, ThreadImageResource>();
type ImagePriority = 'high' | 'low';
type ImagePriorityReader = () => ThreadImagePriority | null;
type QueuedImage = {
  priorities: ImagePriorityReader[];
  reject: (reason: unknown) => void;
  resolve: (resource: ThreadImageResource) => void;
};
type ActiveImage = {
  request: QueuedImage;
  controller: AbortController;
  preempted: boolean;
};
const queuedResources = new Map<string, QueuedImage>();
const activeResources = new Map<string, ActiveImage>();
let queueScheduled = false;

function readRequestPriority(request: QueuedImage): ThreadImagePriority | null {
  const priorities = request.priorities.map((read) => read());
  if (priorities.includes('high')) return 'high';
  if (priorities.includes('low')) return 'low';
  return priorities.includes('deferred') ? 'deferred' : null;
}

// Re-read queued AND active consumers: old foreground requests can become
// background work after a jump, and a lightbox can promote an active preload.
export function refreshThreadImagePriorities() {
  if (queueScheduled || (!queuedResources.size && !activeResources.size)) return;
  queueScheduled = true;
  setTimeout(() => {
    queueScheduled = false;
    const waiting: Array<{ source: string; request: QueuedImage; priority: ImagePriority }> = [];
    queuedResources.forEach((request, source) => {
      const priority = readRequestPriority(request);
      if (priority === null) {
        queuedResources.delete(source);
        resourcePromises.delete(source);
        request.reject(new DOMException('图片所在内容已卸载', 'AbortError'));
        return;
      }
      // A mounted gallery may be offscreen or on another slide. Keep its
      // request pending so scrolling/switching can resume it without a retry.
      if (priority !== 'deferred') {
        waiting.push({ source, request, priority });
      }
    });
    waiting.sort((a, b) => Number(b.priority === 'high') - Number(a.priority === 'high'));

    const active = Array.from(activeResources.values(), (download) => ({
      download, priority: readRequestPriority(download.request),
    }));
    active.forEach(({ download, priority }) => {
      if (priority === null) download.controller.abort();
    });
    const releasing = active.filter(({ download }) => download.controller.signal.aborted).length;
    let slotsNeeded = waiting.filter(({ priority }) => priority === 'high').length
      - (MAX_ACTIVE_REQUESTS - activeResources.size + releasing);
    const preemptible = active
      .filter(({ download, priority }) => priority !== 'high' && !download.controller.signal.aborted)
      .sort((a, b) => Number(b.priority === 'deferred') - Number(a.priority === 'deferred'));
    for (const { download } of preemptible) {
      if (slotsNeeded <= 0) break;
      slotsNeeded -= 1;
      download.preempted = true;
      download.controller.abort();
    }

    // Count today's priorities, rather than the priority at request creation.
    let backgroundRequests = active.filter(({ priority }) => priority !== 'high').length;
    for (const { source, request, priority } of waiting) {
      if (activeResources.size >= MAX_ACTIVE_REQUESTS) break;
      if (priority === 'low' && backgroundRequests >= MAX_BACKGROUND_REQUESTS) continue;
      queuedResources.delete(source);
      if (priority === 'low') backgroundRequests += 1;
      startImageRequest(source, request, priority);
    }
  }, 0);
}

function startImageRequest(source: string, request: QueuedImage, priority: ImagePriority) {
  const download: ActiveImage = { request, controller: new AbortController(), preempted: false };
  activeResources.set(source, download);
  void fetchThreadImageResource(source, priority, download.controller.signal).then((blob) => {
    // Abort can race the last response chunk. Never cache a canceled attempt.
    download.controller.signal.throwIfAborted();
    const resource = { blob, objectUrl: URL.createObjectURL(blob), sourceUrl: source };
    resolvedResources.set(source, resource);
    request.resolve(resource);
  }).catch((error: unknown) => {
    if (download.preempted || (download.controller.signal.aborted && readRequestPriority(request) !== null)) {
      // Preserve the shared promise: preemption is scheduling, not a load error
      // that should make the frame start an uncontrolled native fallback.
      queuedResources.set(source, request);
    } else {
      resourcePromises.delete(source);
      request.reject(error);
    }
  }).finally(() => {
    // Wait for the aborted fetch/body reader to settle before reusing its slot.
    activeResources.delete(source);
    refreshThreadImagePriorities();
  });
}

export function resolveThreadImageUrl(source: string) {
  return new URL(source, new URL('/bbs/content/', window.location.origin)).href;
}

export function loadThreadImageResource(source: string, getPriority: ImagePriorityReader = () => 'high') {
  const sourceUrl = resolveThreadImageUrl(source);
  const cached = resourcePromises.get(sourceUrl);
  if (cached) {
    const request = queuedResources.get(sourceUrl) ?? activeResources.get(sourceUrl)?.request;
    request?.priorities.push(getPriority);
    refreshThreadImagePriorities();
    return cached;
  }

  const pending = new Promise<ThreadImageResource>((resolve, reject) => {
    queuedResources.set(sourceUrl, { priorities: [getPriority], reject, resolve });
  });
  resourcePromises.set(sourceUrl, pending);
  refreshThreadImagePriorities();
  return pending;
}

function fetchThreadImageResource(sourceUrl: string, priority: ImagePriority, signal: AbortSignal) {
  // Defer native fallbacks too: an external gallery image must not start just
  // because the broker cannot fetch its origin.
  const url = new URL(sourceUrl);
  if (
    url.origin !== window.location.origin
    || (!url.pathname.startsWith('/bbs/images/') && !url.pathname.startsWith('/bbsimg/'))
  ) {
    return Promise.reject(new Error('仅代理论坛图片目录'));
  }
  return fetch(sourceUrl, {
    credentials: 'same-origin',
    referrerPolicy: 'no-referrer',
    priority,
    signal,
  }).then(async (response) => {
    if (!response.ok) throw new Error(`图片加载失败：${response.status}`);
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (!contentType.startsWith('image/')) throw new Error('图片响应类型无效');

    const declaredLength = Number.parseInt(response.headers.get('content-length') ?? '', 10);
    if (Number.isFinite(declaredLength) && declaredLength > MAX_THREAD_IMAGE_BYTES) {
      throw new Error('图片大小超出限制');
    }

    const blob = await response.blob();
    if (blob.size > MAX_THREAD_IMAGE_BYTES) throw new Error('图片大小超出限制');
    return blob;
  });
}

export function getCachedThreadImageObjectUrl(source: string) {
  try {
    return resolvedResources.get(resolveThreadImageUrl(source))?.objectUrl;
  } catch {
    return undefined;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', refreshThreadImagePriorities, { passive: true, capture: true });
  window.addEventListener('resize', refreshThreadImagePriorities);
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    resolvedResources.forEach((resource) => URL.revokeObjectURL(resource.objectUrl));
    resolvedResources.clear();
    resourcePromises.clear();
  });
}
