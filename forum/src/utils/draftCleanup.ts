import { deleteStoredReplyDraftForThread } from './replyDraftStorage';
import {
  deleteStoredThreadComposeDraft,
  type ThreadComposeDraftKind,
} from './threadComposeDraftStorage';

type LocalDraftCleanupRequest = {
  bid: number;
  ownerKey: string;
} & (
  | { tid: number; type: 'reply' }
  | { draftKind: ThreadComposeDraftKind; type: 'thread-compose' }
);

type QueuedLocalDraftCleanup = LocalDraftCleanupRequest & {
  id: string;
  queuedAt: number;
};

const DRAFT_CLEANUP_QUEUE_KEY = 'capubbs-pending-draft-cleanups:v1';
const MAX_QUEUED_DRAFT_CLEANUPS = 10;
const cleanupRuns = new Map<string, Promise<void>>();

export function queueLocalDraftCleanup(request: LocalDraftCleanupRequest) {
  if (typeof window === 'undefined') return false;
  const ownerKey = request.ownerKey.trim();
  if (!ownerKey || !isPositiveInteger(request.bid)) return false;
  if (request.type === 'reply' && !isPositiveInteger(request.tid)) return false;

  const queuedCleanup: QueuedLocalDraftCleanup = {
    ...request,
    id: createCleanupId(),
    ownerKey,
    queuedAt: Date.now(),
  };

  try {
    const queue = readCleanupQueue();
    const nextQueue = [
      ...queue.filter((cleanup) => !targetsSameDraft(cleanup, queuedCleanup)),
      queuedCleanup,
    ].slice(-MAX_QUEUED_DRAFT_CLEANUPS);
    writeCleanupQueue(nextQueue);
    return true;
  } catch {
    void runCleanup(queuedCleanup).catch(() => undefined);
    return false;
  }
}

export function consumeQueuedLocalDraftCleanups(ownerKey: string) {
  const normalizedOwnerKey = ownerKey.trim();
  if (!normalizedOwnerKey || typeof window === 'undefined') return Promise.resolve();

  const activeRun = cleanupRuns.get(normalizedOwnerKey);
  if (activeRun) return activeRun;

  const cleanupRun = consumeCleanupQueue(normalizedOwnerKey).finally(() => {
    if (cleanupRuns.get(normalizedOwnerKey) === cleanupRun) {
      cleanupRuns.delete(normalizedOwnerKey);
    }
  });
  cleanupRuns.set(normalizedOwnerKey, cleanupRun);
  return cleanupRun;
}

async function consumeCleanupQueue(ownerKey: string) {
  let queuedCleanups: QueuedLocalDraftCleanup[];
  try {
    queuedCleanups = readCleanupQueue().filter((cleanup) => cleanup.ownerKey === ownerKey);
  } catch {
    return;
  }
  if (queuedCleanups.length === 0) return;

  const completedIds = new Set<string>();
  for (const cleanup of queuedCleanups) {
    try {
      await runCleanup(cleanup);
      completedIds.add(cleanup.id);
    } catch {
      // Keep failed tasks in session storage so a later page load can retry them.
    }
  }
  if (completedIds.size === 0) return;

  try {
    writeCleanupQueue(readCleanupQueue().filter((cleanup) => !completedIds.has(cleanup.id)));
  } catch {
    // A completed cleanup is harmless to retry after the next page load.
  }
}

function runCleanup(cleanup: QueuedLocalDraftCleanup) {
  const updatedBefore = new Date(cleanup.queuedAt).toISOString();
  return cleanup.type === 'reply'
    ? deleteStoredReplyDraftForThread(cleanup.bid, cleanup.tid, cleanup.ownerKey, updatedBefore)
    : deleteStoredThreadComposeDraft(
      cleanup.bid,
      cleanup.ownerKey,
      cleanup.draftKind,
      updatedBefore,
    );
}

function readCleanupQueue() {
  const rawQueue = window.sessionStorage.getItem(DRAFT_CLEANUP_QUEUE_KEY);
  if (!rawQueue) return [];

  try {
    const value = JSON.parse(rawQueue) as unknown;
    return Array.isArray(value) ? value.filter(isQueuedCleanup) : [];
  } catch {
    return [];
  }
}

function writeCleanupQueue(queue: QueuedLocalDraftCleanup[]) {
  if (queue.length > 0) {
    window.sessionStorage.setItem(DRAFT_CLEANUP_QUEUE_KEY, JSON.stringify(queue));
  } else {
    window.sessionStorage.removeItem(DRAFT_CLEANUP_QUEUE_KEY);
  }
}

function isQueuedCleanup(value: unknown): value is QueuedLocalDraftCleanup {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const cleanup = value as Partial<QueuedLocalDraftCleanup>;
  return typeof cleanup.id === 'string'
    && cleanup.id.length > 0
    && typeof cleanup.ownerKey === 'string'
    && cleanup.ownerKey.length > 0
    && isPositiveInteger(cleanup.bid)
    && isPositiveInteger(cleanup.queuedAt)
    && (
      (cleanup.type === 'reply' && isPositiveInteger(cleanup.tid))
      || (
        cleanup.type === 'thread-compose'
        && (cleanup.draftKind === 'activity' || cleanup.draftKind === 'thread')
      )
    );
}

function targetsSameDraft(first: QueuedLocalDraftCleanup, second: QueuedLocalDraftCleanup) {
  if (
    first.ownerKey !== second.ownerKey
    || first.bid !== second.bid
    || first.type !== second.type
  ) return false;

  if (first.type === 'reply' && second.type === 'reply') return first.tid === second.tid;
  return first.type === 'thread-compose'
    && second.type === 'thread-compose'
    && first.draftKind === second.draftKind;
}

function createCleanupId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
