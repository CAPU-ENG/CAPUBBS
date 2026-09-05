const MAX_THREAD_IMAGE_BYTES = 64 * 1024 * 1024;

type ThreadImageResource = {
  blob: Blob;
  objectUrl: string;
  sourceUrl: string;
};

const resourcePromises = new Map<string, Promise<ThreadImageResource>>();
const resolvedResources = new Map<string, ThreadImageResource>();
type ImagePriority = 'high' | 'low';
type ImagePriorityReader = () => ImagePriority | null;
type QueuedImage = {
  priorities: ImagePriorityReader[];
  reject: (reason: Error) => void;
  start: (priority: ImagePriority) => void;
};
const queuedResources = new Map<string, QueuedImage>();
let activeRequests = 0;
let activeBackgroundRequests = 0;
let queueScheduled = false;

// Reserve capacity for images at the new scroll position, even when older
// background downloads are still running. Never restart an in-flight fetch.
export function refreshThreadImagePriorities() {
  if (queueScheduled || !queuedResources.size) return;
  queueScheduled = true;
  setTimeout(() => {
    queueScheduled = false;
    const waiting: Array<{ source: string; request: QueuedImage; priority: ImagePriority }> = [];
    queuedResources.forEach((request, source) => {
      const priorities = request.priorities.map((read) => read());
      if (priorities.every((priority) => priority === null)) {
        queuedResources.delete(source);
        resourcePromises.delete(source);
        request.reject(new DOMException('图片所在内容已卸载', 'AbortError'));
        return;
      }
      waiting.push({ source, request, priority: priorities.includes('high') ? 'high' : 'low' });
    });
    waiting.sort((a, b) => Number(b.priority === 'high') - Number(a.priority === 'high'));
    for (const { source, request, priority } of waiting) {
      if (activeRequests >= 6) break;
      if (priority === 'low' && activeBackgroundRequests >= 2) continue;
      queuedResources.delete(source);
      activeRequests += 1;
      if (priority === 'low') activeBackgroundRequests += 1;
      request.start(priority);
    }
  }, 0);
}

export function resolveThreadImageUrl(source: string) {
  return new URL(source, new URL('/bbs/content/', window.location.origin)).href;
}

export function loadThreadImageResource(source: string, getPriority: ImagePriorityReader = () => 'high') {
  const sourceUrl = resolveThreadImageUrl(source);
  const url = new URL(sourceUrl);
  if (
    url.origin !== window.location.origin
    || (!url.pathname.startsWith('/bbs/images/') && !url.pathname.startsWith('/bbsimg/'))
  ) {
    return Promise.reject(new Error('仅代理论坛图片目录'));
  }
  const cached = resourcePromises.get(sourceUrl);
  if (cached) {
    queuedResources.get(sourceUrl)?.priorities.push(getPriority);
    refreshThreadImagePriorities();
    return cached;
  }

  const pending = new Promise<ThreadImageResource>((resolve, reject) => {
    queuedResources.set(sourceUrl, {
      priorities: [getPriority],
      reject,
      start: (priority) => {
        void fetchThreadImageResource(sourceUrl, priority).then(resolve, reject).finally(() => {
          activeRequests -= 1;
          if (priority === 'low') activeBackgroundRequests -= 1;
          refreshThreadImagePriorities();
        });
      },
    });
  });
  resourcePromises.set(sourceUrl, pending);
  refreshThreadImagePriorities();
  return pending;
}

function fetchThreadImageResource(sourceUrl: string, priority: ImagePriority) {
  return fetch(sourceUrl, {
    credentials: 'same-origin',
    referrerPolicy: 'no-referrer',
    priority,
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
    const resource = {
      blob,
      objectUrl: URL.createObjectURL(blob),
      sourceUrl,
    };
    resolvedResources.set(sourceUrl, resource);
    return resource;
  }).catch((error) => {
    resourcePromises.delete(sourceUrl);
    throw error;
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
  window.addEventListener('scroll', refreshThreadImagePriorities, { passive: true });
  window.addEventListener('resize', refreshThreadImagePriorities);
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    resolvedResources.forEach((resource) => URL.revokeObjectURL(resource.objectUrl));
    resolvedResources.clear();
    resourcePromises.clear();
  });
}
