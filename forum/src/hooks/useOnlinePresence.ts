import { useEffect } from 'react';
import { syncOnlinePresence } from '../api/auth';
import { FORUM_PRESENCE_CHANGE_EVENT, getForumClientType } from '../utils/forumClientType';

export function useOnlinePresence(username: string | null) {
  useEffect(() => {
    if (!username) return;

    let disposed = false;
    let pending = false;
    let timer: number | null = null;
    let activeRequest: AbortController | null = null;
    const isForeground = () => document.visibilityState === 'visible' && document.hasFocus();

    async function flush() {
      timer = null;
      if (disposed || !pending || !isForeground()) return;
      pending = false;
      const controller = new AbortController();
      activeRequest = controller;
      try {
        await syncOnlinePresence(getForumClientType(), controller.signal);
        if (!disposed && !controller.signal.aborted) {
          window.dispatchEvent(new Event(FORUM_PRESENCE_CHANGE_EVENT));
        }
      } catch {
        // Presence reporting must not interrupt login or browsing.
      } finally {
        activeRequest = null;
        if (!disposed && pending) scheduleSync();
      }
    }

    function scheduleSync() {
      if (disposed || !isForeground()) return;
      pending = true;
      if (timer === null && !activeRequest) timer = window.setTimeout(() => void flush(), 0);
    }

    scheduleSync();
    window.addEventListener('focus', scheduleSync);
    window.addEventListener('pageshow', scheduleSync);
    document.addEventListener('visibilitychange', scheduleSync);

    return () => {
      disposed = true;
      if (timer !== null) window.clearTimeout(timer);
      activeRequest?.abort();
      window.removeEventListener('focus', scheduleSync);
      window.removeEventListener('pageshow', scheduleSync);
      document.removeEventListener('visibilitychange', scheduleSync);
    };
  }, [username]);
}
