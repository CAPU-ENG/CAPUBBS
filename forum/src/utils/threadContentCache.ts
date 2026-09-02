import type { ThreadDetail, ThreadDetailRequest } from '../api/thread';
import {
  deleteClientDatabaseValue,
  readClientDatabaseValue,
  requestPersistentClientStorage,
  writeClientDatabaseValue,
} from './clientDatabase';

export type ThreadCacheScope = `guest` | `user:${string}`;

export type CachedThreadContent = {
  cachedAt: number;
  data: ThreadDetail;
  key: string;
  lastAccessedAt: number;
  request: ThreadDetailRequest;
  revision: string;
  size: number;
};

type ThreadCacheIndexItem = {
  bid: number;
  key: string;
  lastAccessedAt: number;
  size: number;
  tid: number;
};

const CACHE_PREFIX = 'thread-content:v1';
const CACHE_MAX_AGE_MS = 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 24;
const CACHE_MAX_BYTES = 20 * 1024 * 1024;
const memoryCache = new Map<string, CachedThreadContent>();
let indexMutation = Promise.resolve();

export function getThreadCacheScope(username?: string | null): ThreadCacheScope {
  const normalized = username?.trim().toLocaleLowerCase();
  return normalized ? `user:${normalized}` : 'guest';
}

export function getThreadContentCacheKey(request: ThreadDetailRequest, scope: ThreadCacheScope) {
  return [
    scope,
    request.bid,
    request.tid,
    request.page,
    request.authorOnly ? 1 : 0,
    request.decoration ? 1 : 0,
    request.tagMedalDisplay ? 1 : 0,
  ].join(':');
}

export async function readCachedThreadContent(request: ThreadDetailRequest, scope: ThreadCacheScope) {
  const key = getThreadContentCacheKey(request, scope);
  const memoryValue = memoryCache.get(key);
  if (memoryValue) {
    if (isExpired(memoryValue)) {
      memoryCache.delete(key);
    } else {
      memoryValue.lastAccessedAt = Date.now();
      return memoryValue;
    }
  }

  if (!canPersistRequest(request)) return null;
  try {
    const stored = await readClientDatabaseValue<unknown>(databaseEntryKey(scope, key));
    if (!isCachedThreadContent(stored) || stored.key !== key || isExpired(stored)) {
      await deleteCachedThreadContent(request, scope);
      return null;
    }
    stored.lastAccessedAt = Date.now();
    memoryCache.set(key, stored);
    trimMemoryCache();
    return stored;
  } catch {
    return null;
  }
}

export async function writeCachedThreadContent(
  request: ThreadDetailRequest,
  scope: ThreadCacheScope,
  data: ThreadDetail,
) {
  if (!data.revision) return;
  const key = getThreadContentCacheKey(request, scope);
  const now = Date.now();
  const record: CachedThreadContent = {
    cachedAt: now,
    data,
    key,
    lastAccessedAt: now,
    request,
    revision: data.revision,
    size: estimateSize(data),
  };
  memoryCache.set(key, record);
  trimMemoryCache();

  if (!canPersistDetail(data)) return;
  void requestPersistentClientStorage();
  await mutatePersistentIndex(scope, async (index) => {
    await writeClientDatabaseValue(databaseEntryKey(scope, key), record);
    const next = index.filter((item) => item.key !== key);
    next.push({ bid: request.bid, key, lastAccessedAt: now, size: record.size, tid: request.tid });
    return trimPersistentIndex(scope, next);
  });
}

export async function deleteCachedThreadContent(request: ThreadDetailRequest, scope: ThreadCacheScope) {
  const key = getThreadContentCacheKey(request, scope);
  memoryCache.delete(key);
  if (!canPersistRequest(request)) return;

  await mutatePersistentIndex(scope, async (index) => {
    await safelyDelete(databaseEntryKey(scope, key));
    return index.filter((item) => item.key !== key);
  });
}

export async function invalidateThreadContent(scope: ThreadCacheScope, bid: number, tid: number) {
  for (const [key, record] of memoryCache) {
    if (key.startsWith(`${scope}:`) && record.request.bid === bid && record.request.tid === tid) {
      memoryCache.delete(key);
    }
  }

  await mutatePersistentIndex(scope, async (index) => {
    const removed = index.filter((item) => item.bid === bid && item.tid === tid);
    await Promise.all(removed.map((item) => safelyDelete(databaseEntryKey(scope, item.key))));
    return index.filter((item) => item.bid !== bid || item.tid !== tid);
  });
}

function canPersistRequest(request: ThreadDetailRequest) {
  return request.bid !== 1;
}

function canPersistDetail(data: ThreadDetail) {
  return data.bid !== 1 && !data.isActivity;
}

function isExpired(record: CachedThreadContent) {
  return Date.now() - record.cachedAt > CACHE_MAX_AGE_MS;
}

function estimateSize(data: ThreadDetail) {
  try {
    return JSON.stringify(data).length * 2;
  } catch {
    return CACHE_MAX_BYTES;
  }
}

function trimMemoryCache() {
  const records = [...memoryCache.values()].sort((left, right) => right.lastAccessedAt - left.lastAccessedAt);
  let total = 0;
  records.forEach((record, index) => {
    if (index >= CACHE_MAX_ENTRIES || total + record.size > CACHE_MAX_BYTES || isExpired(record)) {
      memoryCache.delete(record.key);
    } else {
      total += record.size;
    }
  });
}

async function trimPersistentIndex(scope: ThreadCacheScope, index: ThreadCacheIndexItem[]) {
  const sorted = [...index].sort((left, right) => right.lastAccessedAt - left.lastAccessedAt);
  const kept: ThreadCacheIndexItem[] = [];
  const removed: ThreadCacheIndexItem[] = [];
  let total = 0;
  sorted.forEach((item) => {
    if (kept.length >= CACHE_MAX_ENTRIES || total + item.size > CACHE_MAX_BYTES) removed.push(item);
    else {
      total += item.size;
      kept.push(item);
    }
  });
  await Promise.all(removed.map((item) => safelyDelete(databaseEntryKey(scope, item.key))));
  return kept;
}

function mutatePersistentIndex(
  scope: ThreadCacheScope,
  mutation: (index: ThreadCacheIndexItem[]) => Promise<ThreadCacheIndexItem[]>,
) {
  const operation = indexMutation.then(async () => {
    try {
      const stored = await readClientDatabaseValue<unknown>(databaseIndexKey(scope));
      const index = isThreadCacheIndex(stored) ? stored : [];
      const next = await mutation(index);
      await writeClientDatabaseValue(databaseIndexKey(scope), next);
    } catch {
      // Thread caching is optional and must never block navigation or mutations.
    }
  });
  indexMutation = operation.catch(() => undefined);
  return operation;
}

function databaseEntryKey(scope: ThreadCacheScope, key: string) {
  return `${CACHE_PREFIX}:entry:${encodeURIComponent(scope)}:${key}`;
}

function databaseIndexKey(scope: ThreadCacheScope) {
  return `${CACHE_PREFIX}:index:${encodeURIComponent(scope)}`;
}

async function safelyDelete(key: string) {
  try {
    await deleteClientDatabaseValue(key);
  } catch {
    // Missing or unavailable storage is equivalent to a cache miss.
  }
}

function isCachedThreadContent(value: unknown): value is CachedThreadContent {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<CachedThreadContent>;
  return typeof record.cachedAt === 'number'
    && Boolean(record.data && typeof record.data === 'object')
    && typeof record.key === 'string'
    && typeof record.lastAccessedAt === 'number'
    && Boolean(record.request && typeof record.request === 'object')
    && typeof record.revision === 'string'
    && typeof record.size === 'number';
}

function isThreadCacheIndex(value: unknown): value is ThreadCacheIndexItem[] {
  return Array.isArray(value) && value.every((item) => (
    item
    && typeof item === 'object'
    && typeof item.bid === 'number'
    && typeof item.key === 'string'
    && typeof item.lastAccessedAt === 'number'
    && typeof item.size === 'number'
    && typeof item.tid === 'number'
  ));
}
