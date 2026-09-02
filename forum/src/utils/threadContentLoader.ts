import {
  fetchThreadDetail,
  fetchThreadRevisions,
  ThreadApiError,
  type ThreadDetail,
  type ThreadDetailRequest,
  type ThreadRevisionRequest,
  type ThreadRevisionStatus,
} from '../api/thread';
import { resolveForumAppRoute } from './forumNavigation';
import { getThreadFloorFromHash, getThreadPageForFloor } from './threadRoutes';
import {
  deleteCachedThreadContent,
  getThreadContentCacheKey,
  invalidateThreadContent,
  readCachedThreadContent,
  writeCachedThreadContent,
  type CachedThreadContent,
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

type RevisionTask = {
  key: string;
  promise: Promise<ThreadRevisionStatus | null>;
  reject: (reason?: unknown) => void;
  request: ThreadRevisionRequest;
  resolve: (status: ThreadRevisionStatus | null) => void;
};

const PRIORITY = { intent: 1, hot: 2, pinned: 3, activity: 4 } as const;
const REVISION_BATCH_DELAY_MS = 80;
const detailTasks = new Map<string, DetailTask>();
const backgroundQueue: DetailTask[] = [];
const revisionTasks = new Map<string, RevisionTask>();
const revisionQueue: RevisionTask[] = [];
let backgroundRunning = false;
let revisionRunning = false;
let revisionTimer: ReturnType<typeof setTimeout> | null = null;

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
  let status;
  try {
    [status] = await fetchThreadRevisions([
      {
        authorOnly: request.authorOnly,
        bid: request.bid,
        page: request.page,
        revision: cached.revision,
        tid: request.tid,
      },
    ], { recordView: true });
  } catch {
    return cached.data;
  }

  if (!status || status.state === 'fresh') {
    return status?.views ? { ...cached.data, views: status.views } : cached.data;
  }
  if (status.state === 'forbidden' || status.state === 'gone') {
    await deleteCachedThreadContent(request, scope);
    throw new ThreadApiError(status.state === 'forbidden' ? '当前账号无权查看这个帖子。' : '主题不存在。');
  }

  await deleteCachedThreadContent(request, scope);
  return startForegroundTask(request, scope, true);
}

export async function preloadThreadContent(
  request: ThreadDetailRequest,
  scope: ThreadCacheScope,
  priority: ThreadPreloadPriority,
) {
  const key = getThreadContentCacheKey(request, scope);
  const existing = detailTasks.get(key);
  if (existing) {
    existing.priority = Math.min(existing.priority, PRIORITY[priority]);
    sortBackgroundQueue();
    return existing.promise;
  }
  if (await readCachedThreadContent(request, scope)) return null;
  if (detailTasks.has(key)) return detailTasks.get(key)!.promise;

  const task = createTask(request, scope, PRIORITY[priority], true);
  backgroundQueue.push(task);
  sortBackgroundQueue();
  runBackgroundQueue();
  return task.promise;
}

export async function preloadThreadCandidates(candidates: ThreadPreloadCandidate[], scope: ThreadCacheScope) {
  const uniqueCandidates = deduplicateCandidates(candidates);
  const cached = await Promise.all(uniqueCandidates.map(async (candidate) => ({
    candidate,
    record: await readCachedThreadContent(candidate.request, scope),
  })));
  const missing = cached.filter((item) => !item.record);
  const cachedByThread = groupCachedByThread(cached.filter(
    (item): item is { candidate: ThreadPreloadCandidate; record: CachedThreadContent } => item.record !== null,
  ));

  const changedKeys = new Set<string>();
  const removedKeys = new Set<string>();
  const checks = [...cachedByThread.values()].slice(0, 10).map((items) => ({
    authorOnly: items[0].candidate.request.authorOnly,
    bid: items[0].candidate.request.bid,
    page: items[0].candidate.request.page,
    revision: items[0].record.revision,
    tid: items[0].candidate.request.tid,
  }));
  if (checks.length > 0) {
    try {
      const statuses = await fetchBackgroundThreadRevisions(checks);
      statuses.forEach((status) => {
        const threadKey = `${status.bid}:${status.tid}`;
        if (status.state === 'changed') changedKeys.add(threadKey);
        if (status.state === 'forbidden' || status.state === 'gone') removedKeys.add(threadKey);
      });
    } catch {
      // A cached page remains useful when an optional background validation fails.
    }
  }

  await Promise.all([...removedKeys].flatMap((threadKey) => (
    (cachedByThread.get(threadKey) ?? []).map(({ candidate }) => (
      deleteCachedThreadContent(candidate.request, scope)
    ))
  )));

  const toLoad = [
    ...missing.map(({ candidate }) => candidate),
    ...[...changedKeys].flatMap((threadKey) => (
      (cachedByThread.get(threadKey) ?? []).map(({ candidate }) => candidate)
    )),
  ].sort((left, right) => PRIORITY[left.priority] - PRIORITY[right.priority]);

  toLoad.forEach(({ priority, request }) => {
    void preloadThreadContent(request, scope, priority).catch(() => undefined);
  });
}

function fetchBackgroundThreadRevisions(requests: ThreadRevisionRequest[]) {
  return Promise.all(requests.map(queueBackgroundThreadRevision)).then((statuses) => (
    statuses.filter((status): status is ThreadRevisionStatus => status !== null)
  ));
}

function queueBackgroundThreadRevision(request: ThreadRevisionRequest) {
  const key = [
    request.bid,
    request.tid,
    request.page ?? 1,
    request.authorOnly ? 1 : 0,
    request.revision ?? '',
  ].join(':');
  const existing = revisionTasks.get(key);
  if (existing) return existing.promise;

  let resolve!: (status: ThreadRevisionStatus | null) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<ThreadRevisionStatus | null>((taskResolve, taskReject) => {
    resolve = taskResolve;
    reject = taskReject;
  });
  const task = { key, promise, reject, request, resolve } satisfies RevisionTask;
  revisionTasks.set(key, task);
  revisionQueue.push(task);
  scheduleRevisionBatch();
  return promise;
}

function scheduleRevisionBatch() {
  if (revisionRunning || revisionTimer !== null || revisionQueue.length === 0) return;
  revisionTimer = setTimeout(() => {
    revisionTimer = null;
    runRevisionBatch();
  }, REVISION_BATCH_DELAY_MS);
}

function runRevisionBatch() {
  if (revisionRunning) return;
  const batch = revisionQueue.splice(0, 10);
  if (batch.length === 0) return;
  revisionRunning = true;
  void fetchThreadRevisions(batch.map((task) => task.request)).then((statuses) => {
    batch.forEach((task, index) => task.resolve(statuses[index] ?? null));
  }, (error) => {
    batch.forEach((task) => task.reject(error));
  }).finally(() => {
    batch.forEach((task) => {
      if (revisionTasks.get(task.key) === task) revisionTasks.delete(task.key);
    });
    revisionRunning = false;
    scheduleRevisionBatch();
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
  task.viewPromise = fetchThreadRevisions(
    [{
      authorOnly: task.request.authorOnly,
      bid: task.request.bid,
      page: task.request.page,
      tid: task.request.tid,
    }],
    { recordView: true },
  ).then(([status]) => {
    task.viewRecorded = true;
    return status?.views ?? null;
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

function groupCachedByThread(items: Array<{ candidate: ThreadPreloadCandidate; record: CachedThreadContent }>) {
  const grouped = new Map<string, Array<{ candidate: ThreadPreloadCandidate; record: CachedThreadContent }>>();
  items.forEach((item) => {
    const key = `${item.candidate.request.bid}:${item.candidate.request.tid}`;
    const group = grouped.get(key) ?? [];
    group.push(item);
    grouped.set(key, group);
  });
  return grouped;
}

function positiveInteger(value: string | null) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}
