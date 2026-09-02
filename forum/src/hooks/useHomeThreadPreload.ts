import { useEffect } from 'react';
import type { HomeSignupActivity, HomeThread } from '../api/home';
import type { ThreadDetailRequest } from '../api/thread';
import {
  cancelQueuedHomeThreadPreloads,
  preloadThreadCandidates,
  threadRequestFromHref,
  type ThreadPreloadCandidate,
} from '../utils/threadContentLoader';
import type { ThreadCacheScope } from '../utils/threadContentCache';

type ConnectionInfo = {
  effectiveType?: string;
  saveData?: boolean;
};

export function useHomeThreadPreload({
  decoration,
  feed,
  pinned,
  scope,
  signup,
  tagMedalDisplay,
}: {
  decoration: boolean;
  feed: HomeThread[];
  pinned: HomeThread[];
  scope: ThreadCacheScope | null;
  signup: HomeSignupActivity[];
  tagMedalDisplay: boolean;
}) {
  useEffect(() => {
    if (!scope) return;
    let canceled = false;
    let cancelScheduled = () => {};

    const schedule = () => {
      cancelScheduled();
      cancelScheduled = scheduleWhenIdle(() => {
        if (canceled || !allowsBackgroundPreload()) return;
        const display = { decoration, tagMedalDisplay };
        const candidates: ThreadPreloadCandidate[] = [
          ...feed.slice(0, 5).flatMap((thread) => candidate(thread.href, display, 'hot')),
          ...pinned.slice(0, 2).flatMap((thread) => candidate(thread.href, display, 'pinned')),
          ...signup.slice(0, 1).flatMap((activity) => candidate(activity.href, display, 'activity')),
        ];
        void preloadThreadCandidates(candidates, scope);
      });
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') schedule();
    };
    schedule();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      canceled = true;
      cancelScheduled();
      cancelQueuedHomeThreadPreloads();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [decoration, feed, pinned, scope, signup, tagMedalDisplay]);
}

function candidate(
  href: string,
  display: Pick<ThreadDetailRequest, 'decoration' | 'tagMedalDisplay'>,
  priority: ThreadPreloadCandidate['priority'],
) {
  const request = threadRequestFromHref(href, display);
  return request ? [{ priority, request }] : [];
}

function allowsBackgroundPreload() {
  if (document.visibilityState !== 'visible' || !navigator.onLine) return false;
  const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection;
  return !connection?.saveData && connection?.effectiveType !== 'slow-2g' && connection?.effectiveType !== '2g';
}

function scheduleWhenIdle(callback: () => void) {
  const idleWindow = window as unknown as {
    cancelIdleCallback?: (id: number) => void;
    requestIdleCallback?: (callback: () => void, options: { timeout: number }) => number;
  };
  if (typeof idleWindow.requestIdleCallback === 'function') {
    const id = idleWindow.requestIdleCallback(callback, { timeout: 1_500 });
    return () => idleWindow.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(callback, 700);
  return () => window.clearTimeout(id);
}
