import { FORUM_MODE_COOKIE_NAME, saveForumMode } from './forumMode';

const WORKER_URL = '/bbs/index-worker.js';

export async function registerForumIndexCache() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  if (!document.cookie.split(';').some((part) => part.trim().startsWith(`${FORUM_MODE_COOKIE_NAME}=`))) {
    saveForumMode('new');
  }

  try {
    await navigator.serviceWorker.register(WORKER_URL, { scope: '/bbs/', updateViaCache: 'all' });
    const registration = await navigator.serviceWorker.ready;
    (navigator.serviceWorker.controller ?? registration.active)?.postMessage({ type: 'CACHE_CURRENT_INDEX' });
  } catch {
    // Navigation continues normally when the browser or server rejects registration.
  }
}

export function compareForumIndexVersion(version: string) {
  if (!/^[a-f0-9]{64}$/.test(version) || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.controller?.postMessage({ type: 'COMPARE_INDEX_VERSION', version });
}
