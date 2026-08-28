import {
  deleteClientDatabaseValue,
  readClientDatabaseValue,
  requestPersistentClientStorage,
  writeClientDatabaseValue,
} from './clientDatabase';

export type StoredReplyEditorMode = 'rich' | 'markdown' | 'html';

export type StoredReplyEditorValue = {
  content: string;
  mode: StoredReplyEditorMode;
};

export type StoredReplyAttachment = {
  id: string;
  lastModified?: number;
  name: string;
  size: number;
  type: string;
};

export type StoredReplyDraft = {
  attachments: StoredReplyAttachment[];
  bid: number;
  board: string;
  boardHref: string;
  editor: StoredReplyEditorValue;
  excerpt: string;
  id: string;
  signatureIndex?: number;
  threadTitle: string;
  tid: number;
  updatedAt: string;
};

export type ReplyDraftSaveFailureReason = 'missing-owner' | 'quota' | 'unavailable' | 'unknown';

export type ReplyDraftSaveResult =
  | { discardedDraftCount: number; draft: StoredReplyDraft; ok: true }
  | { ok: false; reason: ReplyDraftSaveFailureReason };

const REPLY_DRAFT_DATABASE_KEY_PREFIX = 'reply-drafts:v1';
const LEGACY_REPLY_DRAFT_STORAGE_KEY_PREFIX = 'capubbs-reply-drafts:v1';
const REPLY_DRAFT_CHANGE_EVENT = 'capubbs-reply-drafts-change';
const REPLY_DRAFT_BROADCAST_CHANNEL = 'capubbs-reply-drafts';
const MAX_STORED_REPLY_DRAFTS = 100;

export async function readStoredReplyDrafts(ownerKey: string | null | undefined) {
  const databaseKey = getReplyDraftDatabaseKey(ownerKey);
  if (!databaseKey) return [];

  const legacyDrafts = readLegacyReplyDrafts(ownerKey);

  try {
    const storedValue = await readClientDatabaseValue<unknown>(databaseKey);
    if (typeof storedValue !== 'undefined') return sanitizeStoredReplyDrafts(storedValue);

    if (legacyDrafts.length > 0) {
      await writeClientDatabaseValue(databaseKey, legacyDrafts);
      removeLegacyReplyDrafts(ownerKey);
    }

    return legacyDrafts;
  } catch {
    return legacyDrafts;
  }
}

export async function readStoredReplyDraftForThread(
  bid: number,
  tid: number,
  ownerKey: string | null | undefined,
) {
  return (await readStoredReplyDrafts(ownerKey)).find((draft) => draft.bid === bid && draft.tid === tid) ?? null;
}

export async function saveStoredReplyDraft(
  draft: Omit<StoredReplyDraft, 'id' | 'updatedAt'> & { id?: string },
  ownerKey: string | null | undefined,
): Promise<ReplyDraftSaveResult> {
  const databaseKey = getReplyDraftDatabaseKey(ownerKey);
  if (!databaseKey) return { ok: false, reason: 'missing-owner' };

  void requestPersistentClientStorage();

  const updatedDraft: StoredReplyDraft = {
    ...draft,
    id: draft.id || createReplyDraftId(draft.bid, draft.tid),
    updatedAt: new Date().toISOString(),
  };
  const candidateDrafts = [
    updatedDraft,
    ...(await readStoredReplyDrafts(ownerKey)).filter((storedDraft) => (
      storedDraft.id !== updatedDraft.id
      && (storedDraft.bid !== updatedDraft.bid || storedDraft.tid !== updatedDraft.tid)
    )),
  ];
  const nextDrafts = candidateDrafts.slice(0, MAX_STORED_REPLY_DRAFTS);
  let discardedDraftCount = candidateDrafts.length - nextDrafts.length;

  while (nextDrafts.length > 0) {
    try {
      await writeClientDatabaseValue(databaseKey, nextDrafts);
    } catch (error) {
      if (isStorageUnavailableError(error) && writeLegacyReplyDrafts(ownerKey, nextDrafts)) {
        notifyReplyDraftChange(ownerKey);
        return { discardedDraftCount, draft: updatedDraft, ok: true };
      }

      if (!isStorageQuotaError(error)) {
        return { ok: false, reason: getStorageFailureReason(error) };
      }

      if (nextDrafts.length === 1) {
        return { ok: false, reason: 'quota' };
      }

      nextDrafts.pop();
      discardedDraftCount += 1;
      continue;
    }

    removeLegacyReplyDrafts(ownerKey);
    notifyReplyDraftChange(ownerKey);
    return { discardedDraftCount, draft: updatedDraft, ok: true };
  }

  return { ok: false, reason: 'unknown' };
}

export async function deleteStoredReplyDraftForThread(
  bid: number,
  tid: number,
  ownerKey: string | null | undefined,
  updatedBefore?: string,
) {
  const databaseKey = getReplyDraftDatabaseKey(ownerKey);
  if (!databaseKey) return;

  const nextDrafts = (await readStoredReplyDrafts(ownerKey)).filter((draft) => {
    const matchesDraft = draft.bid === bid && draft.tid === tid;
    return !matchesDraft || Boolean(updatedBefore && draft.updatedAt > updatedBefore);
  });

  try {
    if (nextDrafts.length > 0) await writeClientDatabaseValue(databaseKey, nextDrafts);
    else await deleteClientDatabaseValue(databaseKey);
    removeLegacyReplyDrafts(ownerKey);
  } catch (error) {
    if (!writeLegacyReplyDrafts(ownerKey, nextDrafts)) throw error;
  }

  notifyReplyDraftChange(ownerKey);
}

export function subscribeStoredReplyDrafts(listener: () => void, ownerKey: string | null | undefined) {
  const storageKey = getLegacyReplyDraftStorageKey(ownerKey);
  const normalizedOwnerKey = normalizeOwnerKey(ownerKey);
  if (!storageKey || !normalizedOwnerKey || typeof window === 'undefined') return () => {};
  const channel = createReplyDraftBroadcastChannel();

  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey) listener();
  };
  const handleDraftChange = (event: Event) => {
    const draftEvent = event as CustomEvent<{ storageKey?: string }>;
    if (draftEvent.detail?.storageKey === storageKey) listener();
  };
  const handleBroadcast = (event: MessageEvent<{ ownerKey?: string }>) => {
    if (event.data?.ownerKey === normalizedOwnerKey) listener();
  };

  if (channel) channel.onmessage = handleBroadcast;
  window.addEventListener(REPLY_DRAFT_CHANGE_EVENT, handleDraftChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(REPLY_DRAFT_CHANGE_EVENT, handleDraftChange);
    window.removeEventListener('storage', handleStorage);
    channel?.close();
  };
}

function getReplyDraftDatabaseKey(ownerKey: string | null | undefined) {
  const normalizedOwnerKey = normalizeOwnerKey(ownerKey);
  return normalizedOwnerKey
    ? `${REPLY_DRAFT_DATABASE_KEY_PREFIX}:${encodeURIComponent(normalizedOwnerKey)}`
    : null;
}

function getLegacyReplyDraftStorageKey(ownerKey: string | null | undefined) {
  const normalizedOwnerKey = normalizeOwnerKey(ownerKey);
  return normalizedOwnerKey
    ? `${LEGACY_REPLY_DRAFT_STORAGE_KEY_PREFIX}:${encodeURIComponent(normalizedOwnerKey)}`
    : null;
}

function normalizeOwnerKey(ownerKey: string | null | undefined) {
  return ownerKey?.trim() || null;
}

function createReplyDraftId(bid: number, tid: number) {
  return `reply-${bid}-${tid}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isStoredReplyDraft(value: unknown): value is StoredReplyDraft {
  if (!isObjectRecord(value) || !isStoredReplyEditorValue(value.editor)) return false;

  return (
    Array.isArray(value.attachments)
    && value.attachments.every(isStoredReplyAttachment)
    && isPositiveInteger(value.bid)
    && typeof value.board === 'string'
    && typeof value.boardHref === 'string'
    && typeof value.excerpt === 'string'
    && typeof value.id === 'string'
    && typeof value.threadTitle === 'string'
    && isPositiveInteger(value.tid)
    && typeof value.updatedAt === 'string'
    && (typeof value.signatureIndex === 'number' || typeof value.signatureIndex === 'undefined')
  );
}

function isStoredReplyEditorValue(value: unknown): value is StoredReplyEditorValue {
  return (
    isObjectRecord(value)
    && typeof value.content === 'string'
    && (value.mode === 'rich' || value.mode === 'markdown' || value.mode === 'html')
  );
}

function isStoredReplyAttachment(value: unknown): value is StoredReplyAttachment {
  return (
    isObjectRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.size === 'number'
    && typeof value.type === 'string'
    && (typeof value.lastModified === 'number' || typeof value.lastModified === 'undefined')
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function sanitizeStoredReplyDrafts(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seenThreads = new Set<string>();
  return value
    .filter(isStoredReplyDraft)
    .sort((firstDraft, secondDraft) => secondDraft.updatedAt.localeCompare(firstDraft.updatedAt))
    .filter((draft) => {
      const threadKey = `${draft.bid}:${draft.tid}`;
      if (seenThreads.has(threadKey)) return false;
      seenThreads.add(threadKey);
      return true;
    });
}

function readLegacyReplyDrafts(ownerKey: string | null | undefined) {
  const storageKey = getLegacyReplyDraftStorageKey(ownerKey);
  if (!storageKey || typeof window === 'undefined') return [];

  try {
    const rawDrafts = window.localStorage.getItem(storageKey);
    return rawDrafts ? sanitizeStoredReplyDrafts(JSON.parse(rawDrafts) as unknown) : [];
  } catch {
    return [];
  }
}

function writeLegacyReplyDrafts(ownerKey: string | null | undefined, drafts: StoredReplyDraft[]) {
  const storageKey = getLegacyReplyDraftStorageKey(ownerKey);
  if (!storageKey || typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(drafts));
    return true;
  } catch {
    return false;
  }
}

function removeLegacyReplyDrafts(ownerKey: string | null | undefined) {
  const storageKey = getLegacyReplyDraftStorageKey(ownerKey);
  if (!storageKey || typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // The IndexedDB copy is already durable; stale legacy data can be ignored.
  }
}

function isStorageQuotaError(error: unknown) {
  return error instanceof DOMException && (
    error.name === 'QuotaExceededError'
    || error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    || error.code === 22
    || error.code === 1014
  );
}

function getStorageFailureReason(error: unknown): ReplyDraftSaveFailureReason {
  if (isStorageUnavailableError(error)) return 'unavailable';
  return 'unknown';
}

function isStorageUnavailableError(error: unknown) {
  return error instanceof DOMException && (error.name === 'SecurityError' || error.name === 'InvalidStateError');
}

function notifyReplyDraftChange(ownerKey: string | null | undefined) {
  const storageKey = getLegacyReplyDraftStorageKey(ownerKey);
  const normalizedOwnerKey = normalizeOwnerKey(ownerKey);
  if (!storageKey || !normalizedOwnerKey) return;

  try {
    window.dispatchEvent(new CustomEvent(REPLY_DRAFT_CHANGE_EVENT, { detail: { storageKey } }));
  } catch {
    // BroadcastChannel still keeps other pages in sync when custom events are unavailable.
  }

  const channel = createReplyDraftBroadcastChannel();
  if (channel) {
    channel.postMessage({ ownerKey: normalizedOwnerKey });
    channel.close();
  }
}

function createReplyDraftBroadcastChannel() {
  if (typeof BroadcastChannel === 'undefined') return null;
  try {
    return new BroadcastChannel(REPLY_DRAFT_BROADCAST_CHANNEL);
  } catch {
    return null;
  }
}
