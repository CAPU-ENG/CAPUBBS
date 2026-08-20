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

const REPLY_DRAFT_STORAGE_KEY_PREFIX = 'capubbs-reply-drafts:v1';
const REPLY_DRAFT_CHANGE_EVENT = 'capubbs-reply-drafts-change';
const MAX_STORED_REPLY_DRAFTS = 30;

export function readStoredReplyDrafts(ownerKey: string | null | undefined) {
  const storageKey = getReplyDraftStorageKey(ownerKey);
  if (!storageKey || typeof window === 'undefined') return [];

  try {
    const rawDrafts = window.localStorage.getItem(storageKey);
    if (!rawDrafts) return [];

    const parsedDrafts: unknown = JSON.parse(rawDrafts);
    if (!Array.isArray(parsedDrafts)) return [];

    return parsedDrafts
      .filter(isStoredReplyDraft)
      .sort((firstDraft, secondDraft) => secondDraft.updatedAt.localeCompare(firstDraft.updatedAt));
  } catch {
    return [];
  }
}

export function readStoredReplyDraft(draftId: string | null, ownerKey: string | null | undefined) {
  if (!draftId) return null;
  return readStoredReplyDrafts(ownerKey).find((draft) => draft.id === draftId) ?? null;
}

export function saveStoredReplyDraft(
  draft: Omit<StoredReplyDraft, 'id' | 'updatedAt'> & { id?: string },
  ownerKey: string | null | undefined,
) {
  const storageKey = getReplyDraftStorageKey(ownerKey);
  if (!storageKey) return null;

  const updatedDraft: StoredReplyDraft = {
    ...draft,
    id: draft.id || createReplyDraftId(draft.bid, draft.tid),
    updatedAt: new Date().toISOString(),
  };
  const nextDrafts = [
    updatedDraft,
    ...readStoredReplyDrafts(ownerKey).filter((storedDraft) => storedDraft.id !== updatedDraft.id),
  ].slice(0, MAX_STORED_REPLY_DRAFTS);

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(nextDrafts));
  } catch {
    return null;
  }

  window.dispatchEvent(new CustomEvent(REPLY_DRAFT_CHANGE_EVENT, { detail: { storageKey } }));
  return updatedDraft;
}

export function subscribeStoredReplyDrafts(listener: () => void, ownerKey: string | null | undefined) {
  const storageKey = getReplyDraftStorageKey(ownerKey);
  if (!storageKey || typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey) listener();
  };
  const handleDraftChange = (event: Event) => {
    const draftEvent = event as CustomEvent<{ storageKey?: string }>;
    if (draftEvent.detail?.storageKey === storageKey) listener();
  };

  window.addEventListener(REPLY_DRAFT_CHANGE_EVENT, handleDraftChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(REPLY_DRAFT_CHANGE_EVENT, handleDraftChange);
    window.removeEventListener('storage', handleStorage);
  };
}

function getReplyDraftStorageKey(ownerKey: string | null | undefined) {
  const normalizedOwnerKey = ownerKey?.trim();
  return normalizedOwnerKey
    ? `${REPLY_DRAFT_STORAGE_KEY_PREFIX}:${encodeURIComponent(normalizedOwnerKey)}`
    : null;
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
