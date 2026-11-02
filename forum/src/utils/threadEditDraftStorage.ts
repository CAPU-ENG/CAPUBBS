import {
  deleteClientDatabaseValue,
  readClientDatabaseValue,
  requestPersistentClientStorage,
  writeClientDatabaseValue,
} from './clientDatabase';
import type { RichTextEditorValue } from '../components/editor/RichTextEditor';
import type { ThreadAttachmentInfo } from '../api/thread';

export type ThreadEditDraftTarget = {
  bid: number;
  pid: number;
  tid: number;
};

export type StoredThreadEditDraft = ThreadEditDraftTarget & {
  attachments: ThreadAttachmentInfo[];
  board: string;
  editor: RichTextEditorValue;
  excerpt: string;
  id: string;
  signatureIndex: number;
  threadTitle: string;
  title: string;
  updatedAt: string;
};

const THREAD_EDIT_DATABASE_KEY_PREFIX = 'thread-edit-drafts:v1';
const THREAD_EDIT_CHANGE_EVENT = 'capubbs-thread-edit-drafts-change';
const THREAD_EDIT_BROADCAST_CHANNEL = 'capubbs-thread-edit-drafts';

export function getThreadEditDraftKey(target: ThreadEditDraftTarget) {
  return `bid=${target.bid} · tid=${target.tid} · pid=${target.pid}`;
}

export async function readStoredThreadEditDrafts(ownerKey: string | null | undefined) {
  const databaseKey = getDatabaseKey(ownerKey);
  if (!databaseKey) return [];

  try {
    return sanitizeDrafts(await readClientDatabaseValue<unknown>(databaseKey));
  } catch {
    return [];
  }
}

export async function readStoredThreadEditDraft(
  target: ThreadEditDraftTarget,
  ownerKey: string | null | undefined,
) {
  return (await readStoredThreadEditDrafts(ownerKey)).find((draft) => targetsSameFloor(draft, target)) ?? null;
}

export async function saveStoredThreadEditDraft(
  draft: Omit<StoredThreadEditDraft, 'id' | 'updatedAt'>,
  ownerKey: string | null | undefined,
) {
  const databaseKey = getDatabaseKey(ownerKey);
  if (!databaseKey) return null;

  void requestPersistentClientStorage();
  const storedDraft: StoredThreadEditDraft = {
    ...draft,
    id: `thread-edit-${draft.bid}-${draft.tid}-${draft.pid}`,
    updatedAt: new Date().toISOString(),
  };
  const drafts = [
    storedDraft,
    ...(await readStoredThreadEditDrafts(ownerKey)).filter((candidate) => !targetsSameFloor(candidate, draft)),
  ];

  await writeClientDatabaseValue(databaseKey, drafts);
  notifyChange(ownerKey);
  return storedDraft;
}

export async function deleteStoredThreadEditDraft(
  target: ThreadEditDraftTarget,
  ownerKey: string | null | undefined,
) {
  const databaseKey = getDatabaseKey(ownerKey);
  if (!databaseKey) return;

  const drafts = (await readStoredThreadEditDrafts(ownerKey)).filter((draft) => !targetsSameFloor(draft, target));
  if (drafts.length > 0) {
    await writeClientDatabaseValue(databaseKey, drafts);
  } else {
    await deleteClientDatabaseValue(databaseKey);
  }
  notifyChange(ownerKey);
}

export function subscribeStoredThreadEditDrafts(
  listener: () => void,
  ownerKey: string | null | undefined,
) {
  const normalizedOwnerKey = normalizeOwnerKey(ownerKey);
  if (!normalizedOwnerKey || typeof window === 'undefined') return () => {};
  const channel = createBroadcastChannel();

  const handleChange = (event: Event) => {
    const draftEvent = event as CustomEvent<{ ownerKey?: string }>;
    if (draftEvent.detail?.ownerKey === normalizedOwnerKey) listener();
  };
  const handleBroadcast = (event: MessageEvent<{ ownerKey?: string }>) => {
    if (event.data?.ownerKey === normalizedOwnerKey) listener();
  };

  if (channel) channel.onmessage = handleBroadcast;
  window.addEventListener(THREAD_EDIT_CHANGE_EVENT, handleChange);
  return () => {
    window.removeEventListener(THREAD_EDIT_CHANGE_EVENT, handleChange);
    channel?.close();
  };
}

function getDatabaseKey(ownerKey: string | null | undefined) {
  const normalizedOwnerKey = normalizeOwnerKey(ownerKey);
  return normalizedOwnerKey
    ? `${THREAD_EDIT_DATABASE_KEY_PREFIX}:${encodeURIComponent(normalizedOwnerKey)}`
    : null;
}

function normalizeOwnerKey(ownerKey: string | null | undefined) {
  return ownerKey?.trim() || null;
}

function targetsSameFloor(first: ThreadEditDraftTarget, second: ThreadEditDraftTarget) {
  return first.bid === second.bid && first.tid === second.tid && first.pid === second.pid;
}

function sanitizeDrafts(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isStoredDraft)
    .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
}

function isStoredDraft(value: unknown): value is StoredThreadEditDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const draft = value as Partial<StoredThreadEditDraft>;
  return Array.isArray(draft.attachments)
    && draft.attachments.every((attachment) => (
      Boolean(attachment)
      && typeof attachment === 'object'
      && typeof attachment.id === 'string'
      && typeof attachment.name === 'string'
      && typeof attachment.size === 'number'
    ))
    && isPositiveInteger(draft.bid)
    && isPositiveInteger(draft.tid)
    && isPositiveInteger(draft.pid)
    && typeof draft.board === 'string'
    && isEditorValue(draft.editor)
    && typeof draft.excerpt === 'string'
    && typeof draft.id === 'string'
    && Number.isSafeInteger(draft.signatureIndex)
    && typeof draft.threadTitle === 'string'
    && typeof draft.title === 'string'
    && typeof draft.updatedAt === 'string';
}

function isEditorValue(value: unknown): value is RichTextEditorValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const editor = value as Partial<RichTextEditorValue>;
  return typeof editor.content === 'string'
    && (editor.mode === 'rich' || editor.mode === 'markdown' || editor.mode === 'html');
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function notifyChange(ownerKey: string | null | undefined) {
  const normalizedOwnerKey = normalizeOwnerKey(ownerKey);
  if (!normalizedOwnerKey || typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent(THREAD_EDIT_CHANGE_EVENT, {
    detail: { ownerKey: normalizedOwnerKey },
  }));

  const channel = createBroadcastChannel();
  if (channel) {
    channel.postMessage({ ownerKey: normalizedOwnerKey });
    channel.close();
  }
}

function createBroadcastChannel() {
  if (typeof BroadcastChannel === 'undefined') return null;
  try {
    return new BroadcastChannel(THREAD_EDIT_BROADCAST_CHANNEL);
  } catch {
    return null;
  }
}
