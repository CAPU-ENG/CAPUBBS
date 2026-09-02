import {
  fetchThreadDetail,
  recordThreadView,
  type ThreadDetail,
  type ThreadDetailRequest,
} from '../api/thread';
import { resolveForumAppRoute } from './forumNavigation';
import { getThreadFloorFromHash, getThreadPageForFloor } from './threadRoutes';
import {
  getThreadContentCacheKey,
  invalidateThreadContent,
  readCachedThreadContent,
  writeCachedThreadContent,
  type ThreadCacheScope,
} from './threadContentCache';

export type ThreadPreloadPriority = 'activity' | 'hot' | 'intent' | 'pinned';

export type ThreadPreloadCandidate = {
  priority: ThreadPreloadPriority;
  request: ThreadDetailRequest;
};

type DetailTask = {
  invalidated: boolean;
  key: string;
  prefetchSent: boolean;
  priority: number;
  promise: Promise<ThreadDetail>;
  reject: (reason?: unknown) => void;
  request: ThreadDetailRequest;
  resolve: (detail: ThreadDetail) => void;
  scope: ThreadCacheScope;
  started: boolean;
  viewPromise: Promise<number | null> | null;
  viewRecorded: boolean;
};

const PRIORITY = { intent: 1, hot: 2, pinned: 3, activity: 4 } as const;
const detailTasks = new Map<string, DetailTask>();
const backgroundQueue: DetailTask[] = [];
let backgroundRunning = false;

export async function openThreadContent({
  force = false,
  onCached,
  request,
  scope,
}: {
  force?: boolean;
  onCached: (detail: ThreadDetail) => void;
  request: ThreadDetailRequest;
  scope: ThreadCacheScope;
}) {
  const key = getThreadContentCacheKey(request, scope);
  const existing = detailTasks.get(key);
  if (existing) return promoteTaskToForeground(existing);

  const cached = force ? null : await readCachedThreadContent(request, scope);
  const racedTask = detailTasks.get(key);
  if (racedTask) return promoteTaskToForeground(racedTask);
  if (!cached) return startForegroundTask(request, scope, false);

  onCached(cached.data);
  try {
    const views = await recordThreadView(request.bid, request.tid);
    return { ...cached.data, views };
  } catch {
    return cached.data;
  }
}

export async function preloadThreadContent(
  request: ThreadDetailRequest,
  scope: ThreadCacheScope,
  priority: ThreadPreloadPriority,
  { refresh = false }: { refresh?: boolean } = {},
) {
  const key = getThreadContentCacheKey(request, scope);
  const existing = detailTasks.get(key);
  if (existing) {
    existing.priority = Math.min(existing.priority, PRIORITY[priority]);
    sortBackgroundQueue();
    return existing.promise;
  }
  if (!refresh && await readCachedThreadContent(request, scope)) return null;
  if (detailTasks.has(key)) return detailTasks.get(key)!.promise;

  const task = createTask(request, scope, PRIORITY[priority], true);
  backgroundQueue.push(task);
  sortBackgroundQueue();
  runBackgroundQueue();
  return task.promise;
}

export function preloadThreadCandidates(candidates: ThreadPreloadCandidate[], scope: ThreadCacheScope) {
  const uniqueCandidates = deduplicateCandidates(candidates);
  uniqueCandidates.sort((left, right) => PRIORITY[left.priority] - PRIORITY[right.priority]);
  uniqueCandidates.forEach(({ priority, request }) => {
    void preloadThreadContent(request, scope, priority, { refresh: true }).catch(() => undefined);
  });
}

export function invalidateLoadedThread(scope: ThreadCacheScope, bid: number, tid: number) {
  for (const [key, task] of detailTasks) {
    if (task.scope !== scope || task.request.bid !== bid || task.request.tid !== tid) continue;
    task.invalidated = true;
    detailTasks.delete(key);
    if (!task.started) {
      const index = backgroundQueue.indexOf(task);
      if (index >= 0) backgroundQueue.splice(index, 1);
      task.reject(new DOMException('Thread cache invalidated.', 'AbortError'));
    }
  }
  return invalidateThreadContent(scope, bid, tid);
}

export function cancelQueuedHomeThreadPreloads() {
  for (let index = backgroundQueue.length - 1; index >= 0; index -= 1) {
    const task = backgroundQueue[index];
    if (task.priority < PRIORITY.hot) continue;
    backgroundQueue.splice(index, 1);
    if (detailTasks.get(task.key) === task) detailTasks.delete(task.key);
    task.invalidated = true;
    task.reject(new DOMException('Homepage preload canceled.', 'AbortError'));
  }
}

export function threadRequestFromHref(
  href: string,
  display: Pick<ThreadDetailRequest, 'decoration' | 'tagMedalDisplay'>,
) {
  const route = resolveForumAppRoute(href, window.location.href);
  if (!route) return null;
  const url = new URL(route, window.location.origin);
  const bid = positiveInteger(url.searchParams.get('bid') ?? url.searchParams.get('board'));
  const tid = positiveInteger(url.searchParams.get('tid') ?? url.searchParams.get('thread'));
  if (!bid || !tid) return null;
  const authorOnly = url.searchParams.get('see_lz') === '1' || url.searchParams.get('author') === '1';
  const floor = getThreadFloorFromHash(url.hash);
  return {
    authorOnly,
    bid,
    decoration: display.decoration,
    page: !authorOnly && floor
      ? getThreadPageForFloor(floor)
      : positiveInteger(url.searchParams.get('p') ?? url.searchParams.get('page')) || 1,
    tagMedalDisplay: display.tagMedalDisplay,
    tid,
  } satisfies ThreadDetailRequest;
}

function startForegroundTask(request: ThreadDetailRequest, scope: ThreadCacheScope, viewRecorded: boolean) {
  const key = getThreadContentCacheKey(request, scope);
  const existing = detailTasks.get(key);
  if (existing) return promoteTaskToForeground(existing);
  const task = createTask(request, scope, 0, viewRecorded);
  task.viewRecorded = viewRecorded;
  startTask(task, viewRecorded);
  return task.promise;
}

function promoteTaskToForeground(task: DetailTask) {
  task.priority = 0;
  if (!task.started) {
    const index = backgroundQueue.indexOf(task);
    if (index >= 0) backgroundQueue.splice(index, 1);
    startTask(task, false);
    runBackgroundQueue();
  } else if (task.prefetchSent) {
    if (!task.viewRecorded) recordTaskView(task);
    return Promise.all([task.promise, task.viewPromise]).then(([detail, views]) => (
      views ? { ...detail, views } : detail
    ));
  }
  return task.promise;
}

function createTask(
  request: ThreadDetailRequest,
  scope: ThreadCacheScope,
  priority: number,
  prefetch: boolean,
) {
  const key = getThreadContentCacheKey(request, scope);
  let resolve!: (detail: ThreadDetail) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<ThreadDetail>((taskResolve, taskReject) => {
    resolve = taskResolve;
    reject = taskReject;
  });
  const task: DetailTask = {
    invalidated: false,
    key,
    prefetchSent: prefetch,
    priority,
    promise,
    reject,
    request,
    resolve,
    scope,
    started: false,
    viewPromise: null,
    viewRecorded: false,
  };
  detailTasks.set(key, task);
  return task;
}

function startTask(task: DetailTask, prefetch: boolean) {
  if (task.started) return;
  task.started = true;
  task.prefetchSent = prefetch;
  void fetchThreadDetail({ ...task.request, prefetch }).then((detail) => {
    if (!task.invalidated) void writeCachedThreadContent(task.request, task.scope, detail);
    task.resolve(detail);
  }, task.reject).finally(() => {
    if (detailTasks.get(task.key) === task) detailTasks.delete(task.key);
  });
}

function recordTaskView(task: DetailTask) {
  if (task.viewRecorded || task.viewPromise) return;
  task.viewPromise = recordThreadView(task.request.bid, task.request.tid).then((views) => {
    task.viewRecorded = true;
    return views;
  }, () => null);
}

function runBackgroundQueue() {
  if (backgroundRunning) return;
  if (!allowsQueuedBackgroundRequest()) {
    listenForBackgroundResume();
    return;
  }
  const task = backgroundQueue.shift();
  if (!task) return;
  backgroundRunning = true;
  startTask(task, true);
  void task.promise.catch(() => undefined).finally(() => {
    backgroundRunning = false;
    runBackgroundQueue();
  });
}

let listeningForBackgroundResume = false;

function listenForBackgroundResume() {
  if (listeningForBackgroundResume || typeof window === 'undefined') return;
  listeningForBackgroundResume = true;
  const resume = () => {
    if (!allowsQueuedBackgroundRequest()) return;
    window.removeEventListener('online', resume);
    document.removeEventListener('visibilitychange', resume);
    listeningForBackgroundResume = false;
    runBackgroundQueue();
  };
  window.addEventListener('online', resume);
  document.addEventListener('visibilitychange', resume);
}

function allowsQueuedBackgroundRequest() {
  return typeof document === 'undefined'
    || (document.visibilityState === 'visible' && (typeof navigator === 'undefined' || navigator.onLine));
}

function sortBackgroundQueue() {
  backgroundQueue.sort((left, right) => left.priority - right.priority);
}

function deduplicateCandidates(candidates: ThreadPreloadCandidate[]) {
  const unique = new Map<string, ThreadPreloadCandidate>();
  candidates.forEach((candidate) => {
    const key = [
      candidate.request.bid,
      candidate.request.tid,
      candidate.request.page,
      candidate.request.authorOnly ? 1 : 0,
      candidate.request.decoration ? 1 : 0,
      candidate.request.tagMedalDisplay ? 1 : 0,
    ].join(':');
    const current = unique.get(key);
    if (!current || PRIORITY[candidate.priority] < PRIORITY[current.priority]) unique.set(key, candidate);
  });
  return [...unique.values()];
}

function positiveInteger(value: string | null) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}
