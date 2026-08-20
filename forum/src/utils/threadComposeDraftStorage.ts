import {
  deleteClientDatabaseValue,
  readClientDatabaseValue,
  requestPersistentClientStorage,
  writeClientDatabaseValue,
} from './clientDatabase';
import type { RichTextEditorValue } from '../components/editor/RichTextEditor';
import type { PostEditorAttachment } from '../components/thread/PostEditor';
import type { ActivitySignupSettings } from './activitySignup';

export type ThreadComposeDraftKind = 'activity' | 'thread';

export type StoredThreadComposeDraft = {
  activitySignup?: ActivitySignupSettings;
  attachments: PostEditorAttachment[];
  bid: number;
  board: string;
  boardHref: string;
  editor: RichTextEditorValue;
  excerpt: string;
  id: string;
  kind?: ThreadComposeDraftKind;
  signatureIndex: number;
  title: string;
  updatedAt: string;
};

const THREAD_COMPOSE_DATABASE_KEY_PREFIX = 'thread-compose-drafts:v1';
const THREAD_COMPOSE_CHANGE_EVENT = 'capubbs-thread-compose-drafts-change';
const THREAD_COMPOSE_BROADCAST_CHANNEL = 'capubbs-thread-compose-drafts';

export async function readStoredThreadComposeDrafts(ownerKey: string | null | undefined) {
  const databaseKey = getDatabaseKey(ownerKey);
  if (!databaseKey) return [];

  try {
    return sanitizeDrafts(await readClientDatabaseValue<unknown>(databaseKey));
  } catch {
    return [];
  }
}

export async function readStoredThreadComposeDraft(
  bid: number,
  ownerKey: string | null | undefined,
  kind: ThreadComposeDraftKind = 'thread',
) {
  return (await readStoredThreadComposeDrafts(ownerKey)).find((draft) => (
    draft.bid === bid && (draft.kind ?? 'thread') === kind
  )) ?? null;
}

export async function saveStoredThreadComposeDraft(
  draft: Omit<StoredThreadComposeDraft, 'id' | 'updatedAt'>,
  ownerKey: string | null | undefined,
) {
  const databaseKey = getDatabaseKey(ownerKey);
  if (!databaseKey) return null;

  void requestPersistentClientStorage();
  const storedDraft: StoredThreadComposeDraft = {
    ...draft,
    id: `thread-compose-${draft.bid}-${draft.kind ?? 'thread'}`,
    updatedAt: new Date().toISOString(),
  };
  const drafts = [
    storedDraft,
    ...(await readStoredThreadComposeDrafts(ownerKey)).filter((candidate) => (
      candidate.bid !== draft.bid || (candidate.kind ?? 'thread') !== (draft.kind ?? 'thread')
    )),
  ];

  await writeClientDatabaseValue(databaseKey, drafts);
  notifyChange(ownerKey);
  return storedDraft;
}

export async function deleteStoredThreadComposeDraft(
  bid: number,
  ownerKey: string | null | undefined,
  kind: ThreadComposeDraftKind = 'thread',
) {
  const databaseKey = getDatabaseKey(ownerKey);
  if (!databaseKey) return;

  const drafts = (await readStoredThreadComposeDrafts(ownerKey)).filter((draft) => (
    draft.bid !== bid || (draft.kind ?? 'thread') !== kind
  ));
  if (drafts.length > 0) {
    await writeClientDatabaseValue(databaseKey, drafts);
  } else {
    await deleteClientDatabaseValue(databaseKey);
  }
  notifyChange(ownerKey);
}

export function subscribeStoredThreadComposeDrafts(
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
  window.addEventListener(THREAD_COMPOSE_CHANGE_EVENT, handleChange);
  return () => {
    window.removeEventListener(THREAD_COMPOSE_CHANGE_EVENT, handleChange);
    channel?.close();
  };
}

function getDatabaseKey(ownerKey: string | null | undefined) {
  const normalizedOwnerKey = normalizeOwnerKey(ownerKey);
  return normalizedOwnerKey
    ? `${THREAD_COMPOSE_DATABASE_KEY_PREFIX}:${encodeURIComponent(normalizedOwnerKey)}`
    : null;
}

function normalizeOwnerKey(ownerKey: string | null | undefined) {
  return ownerKey?.trim() || null;
}

function sanitizeDrafts(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isStoredDraft)
    .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
}

function isStoredDraft(value: unknown): value is StoredThreadComposeDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const draft = value as Partial<StoredThreadComposeDraft>;
  return Array.isArray(draft.attachments)
    && (draft.activitySignup === undefined || isActivitySignupSettings(draft.activitySignup))
    && Number.isSafeInteger(draft.bid)
    && Number(draft.bid) > 0
    && typeof draft.board === 'string'
    && typeof draft.boardHref === 'string'
    && isEditorValue(draft.editor)
    && typeof draft.excerpt === 'string'
    && typeof draft.id === 'string'
    && (draft.kind === undefined || draft.kind === 'activity' || draft.kind === 'thread')
    && Number.isSafeInteger(draft.signatureIndex)
    && typeof draft.title === 'string'
    && typeof draft.updatedAt === 'string';
}

function isActivitySignupSettings(value: unknown): value is ActivitySignupSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const settings = value as Partial<ActivitySignupSettings>;
  return typeof settings.startsAt === 'string'
    && typeof settings.endsAt === 'string'
    && Array.isArray(settings.questions)
    && settings.questions.every((question) => (
      Boolean(question)
      && typeof question === 'object'
      && !Array.isArray(question)
      && typeof question.id === 'string'
      && typeof question.label === 'string'
      && typeof question.required === 'boolean'
      && typeof question.type === 'string'
    ));
}

function isEditorValue(value: unknown): value is RichTextEditorValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const editor = value as Partial<RichTextEditorValue>;
  return typeof editor.content === 'string'
    && (editor.mode === 'rich' || editor.mode === 'markdown' || editor.mode === 'html');
}

function notifyChange(ownerKey: string | null | undefined) {
  const normalizedOwnerKey = normalizeOwnerKey(ownerKey);
  if (!normalizedOwnerKey || typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent(THREAD_COMPOSE_CHANGE_EVENT, {
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
    return new BroadcastChannel(THREAD_COMPOSE_BROADCAST_CHANNEL);
  } catch {
    return null;
  }
}
