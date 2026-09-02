const MAX_THREAD_IMAGE_BYTES = 64 * 1024 * 1024;

type ThreadImageResource = {
  blob: Blob;
  objectUrl: string;
  sourceUrl: string;
};

const resourcePromises = new Map<string, Promise<ThreadImageResource>>();
const resolvedResources = new Map<string, ThreadImageResource>();

export function resolveThreadImageUrl(source: string) {
  return new URL(source, new URL('/bbs/content/', window.location.origin)).href;
}

export function loadThreadImageResource(source: string) {
  const sourceUrl = resolveThreadImageUrl(source);
  const url = new URL(sourceUrl);
  if (
    url.origin !== window.location.origin
    || (!url.pathname.startsWith('/bbs/images/') && !url.pathname.startsWith('/bbsimg/'))
  ) {
    return Promise.reject(new Error('仅代理论坛图片目录'));
  }
  const cached = resourcePromises.get(sourceUrl);
  if (cached) return cached;

  const pending = fetch(sourceUrl, {
    credentials: 'same-origin',
    referrerPolicy: 'no-referrer',
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

  resourcePromises.set(sourceUrl, pending);
  return pending;
}

export function getCachedThreadImageObjectUrl(source: string) {
  try {
    return resolvedResources.get(resolveThreadImageUrl(source))?.objectUrl;
  } catch {
    return undefined;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    resolvedResources.forEach((resource) => URL.revokeObjectURL(resource.objectUrl));
    resolvedResources.clear();
    resourcePromises.clear();
  });
}
