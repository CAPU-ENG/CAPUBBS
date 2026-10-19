import {
  deleteClientDatabaseValue,
  readClientDatabaseValue,
  requestPersistentClientStorage,
  writeClientDatabaseValue,
} from './clientDatabase';

export type StoredActivitySignupDraft = {
  activityId: number;
  bid: number;
  board: string;
  excerpt: string;
  id: string;
  signatureIndex: number;
  threadTitle: string;
  tid: number;
  updatedAt: string;
  values: Record<string, string | string[]>;
};

const ACTIVITY_SIGNUP_DRAFT_DATABASE_KEY_PREFIX = 'activity-signup-drafts:v1';
const ACTIVITY_SIGNUP_DRAFT_CHANGE_EVENT = 'capubbs-activity-signup-drafts-change';
const ACTIVITY_SIGNUP_DRAFT_BROADCAST_CHANNEL = 'capubbs-activity-signup-drafts';
const MAX_STORED_ACTIVITY_SIGNUP_DRAFTS = 50;

export async function readStoredActivitySignupDrafts(ownerKey: string | null | undefined) {
  const databaseKey = getDatabaseKey(ownerKey);
  if (!databaseKey) return [];

  try {
    return sanitizeDrafts(await readClientDatabaseValue<unknown>(databaseKey));
  } catch {
    return [];
  }
}

export async function readStoredActivitySignupDraft(
  bid: number,
  tid: number,
  activityId: number,
  ownerKey: string | null | undefined,
) {
  return (await readStoredActivitySignupDrafts(ownerKey)).find((draft) => (
    draft.bid === bid && draft.tid === tid && draft.activityId === activityId
  )) ?? null;
}

export async function saveStoredActivitySignupDraft(
  draft: Omit<StoredActivitySignupDraft, 'id' | 'updatedAt'>,
  ownerKey: string | null | undefined,
) {
  const databaseKey = getDatabaseKey(ownerKey);
  if (!databaseKey) return false;

  void requestPersistentClientStorage();

  const updatedDraft: StoredActivitySignupDraft = {
    ...draft,
    id: createDraftId(draft.bid, draft.tid),
    updatedAt: new Date().toISOString(),
  };
  const nextDrafts = [
    updatedDraft,
    ...(await readStoredActivitySignupDrafts(ownerKey)).filter((storedDraft) => (
      storedDraft.bid !== draft.bid || storedDraft.tid !== draft.tid
    )),
  ].slice(0, MAX_STORED_ACTIVITY_SIGNUP_DRAFTS);

  try {
    await writeClientDatabaseValue(databaseKey, nextDrafts);
  } catch {
    return false;
  }
  notifyDraftChange(ownerKey);
  return true;
}

export async function deleteStoredActivitySignupDraft(
  bid: number,
  tid: number,
  ownerKey: string | null | undefined,
) {
  const databaseKey = getDatabaseKey(ownerKey);
  if (!databaseKey) return;

  const storedDrafts = await readStoredActivitySignupDrafts(ownerKey);
  const nextDrafts = storedDrafts.filter((draft) => draft.bid !== bid || draft.tid !== tid);
  if (nextDrafts.length === storedDrafts.length) return;

  if (nextDrafts.length > 0) await writeClientDatabaseValue(databaseKey, nextDrafts);
  else await deleteClientDatabaseValue(databaseKey);
  notifyDraftChange(ownerKey);
}

export function subscribeStoredActivitySignupDrafts(listener: () => void, ownerKey: string | null | undefined) {
  const normalizedOwnerKey = normalizeOwnerKey(ownerKey);
  if (!normalizedOwnerKey || typeof window === 'undefined') return () => {};
  const channel = createBroadcastChannel();

  const handleDraftChange = (event: Event) => {
    if ((event as CustomEvent<{ ownerKey?: string }>).detail?.ownerKey === normalizedOwnerKey) listener();
  };
  const handleBroadcast = (event: MessageEvent<{ ownerKey?: string }>) => {
    if (event.data?.ownerKey === normalizedOwnerKey) listener();
  };

  if (channel) channel.onmessage = handleBroadcast;
  window.addEventListener(ACTIVITY_SIGNUP_DRAFT_CHANGE_EVENT, handleDraftChange);

  return () => {
    window.removeEventListener(ACTIVITY_SIGNUP_DRAFT_CHANGE_EVENT, handleDraftChange);
    channel?.close();
  };
}

function getDatabaseKey(ownerKey: string | null | undefined) {
  const normalizedOwnerKey = normalizeOwnerKey(ownerKey);
  return normalizedOwnerKey
    ? `${ACTIVITY_SIGNUP_DRAFT_DATABASE_KEY_PREFIX}:${encodeURIComponent(normalizedOwnerKey)}`
    : null;
}

function normalizeOwnerKey(ownerKey: string | null | undefined) {
  return ownerKey?.trim() || null;
}

function createDraftId(bid: number, tid: number) {
  return `activity-signup-${bid}-${tid}`;
}

function sanitizeDrafts(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isStoredDraft)
    .sort((firstDraft, secondDraft) => secondDraft.updatedAt.localeCompare(firstDraft.updatedAt));
}

function isStoredDraft(value: unknown): value is StoredActivitySignupDraft {
  if (!isObjectRecord(value) || !isObjectRecord(value.values)) return false;

  return (
    typeof value.activityId === 'number'
    && isPositiveInteger(value.bid)
    && typeof value.board === 'string'
    && typeof value.excerpt === 'string'
    && typeof value.id === 'string'
    && typeof value.signatureIndex === 'number'
    && typeof value.threadTitle === 'string'
    && isPositiveInteger(value.tid)
    && typeof value.updatedAt === 'string'
    && Object.values(value.values).every((answer) => (
      typeof answer === 'string'
      || (Array.isArray(answer) && answer.every((item) => typeof item === 'string'))
    ))
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function notifyDraftChange(ownerKey: string | null | undefined) {
  const normalizedOwnerKey = normalizeOwnerKey(ownerKey);
  if (!normalizedOwnerKey) return;

  try {
    window.dispatchEvent(new CustomEvent(ACTIVITY_SIGNUP_DRAFT_CHANGE_EVENT, {
      detail: { ownerKey: normalizedOwnerKey },
    }));
  } catch {
    // BroadcastChannel still keeps other pages in sync when custom events are unavailable.
  }

  const channel = createBroadcastChannel();
  if (channel) {
    channel.postMessage({ ownerKey: normalizedOwnerKey });
    channel.close();
  }
}

function createBroadcastChannel() {
  if (typeof BroadcastChannel === 'undefined') return null;
  try {
    return new BroadcastChannel(ACTIVITY_SIGNUP_DRAFT_BROADCAST_CHANNEL);
  } catch {
    return null;
  }
}
