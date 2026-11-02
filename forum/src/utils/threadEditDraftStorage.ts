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
  editor: RichTextEditorValue;
  excerpt: string;
  signatureIndex: number;
  title: string;
  updatedAt: string;
};

const THREAD_EDIT_DATABASE_KEY_PREFIX = 'thread-edit-drafts:v1';

export async function readStoredThreadEditDraft(
  target: ThreadEditDraftTarget,
  ownerKey: string | null | undefined,
) {
  const databaseKey = getDatabaseKey(target, ownerKey);
  if (!databaseKey) return null;

  const value = await readClientDatabaseValue<unknown>(databaseKey);
  return isStoredDraft(value) && targetsSameFloor(value, target) ? value : null;
}

export async function saveStoredThreadEditDraft(
  draft: Omit<StoredThreadEditDraft, 'updatedAt'>,
  ownerKey: string | null | undefined,
) {
  const databaseKey = getDatabaseKey(draft, ownerKey);
  if (!databaseKey) return null;

  void requestPersistentClientStorage();
  const storedDraft: StoredThreadEditDraft = { ...draft, updatedAt: new Date().toISOString() };
  await writeClientDatabaseValue(databaseKey, storedDraft);
  return storedDraft;
}

export async function deleteStoredThreadEditDraft(
  target: ThreadEditDraftTarget,
  ownerKey: string | null | undefined,
) {
  const databaseKey = getDatabaseKey(target, ownerKey);
  if (databaseKey) await deleteClientDatabaseValue(databaseKey);
}

function getDatabaseKey(target: ThreadEditDraftTarget, ownerKey: string | null | undefined) {
  const normalizedOwnerKey = ownerKey?.trim();
  return normalizedOwnerKey
    ? `${THREAD_EDIT_DATABASE_KEY_PREFIX}:${encodeURIComponent(normalizedOwnerKey)}:${target.bid}-${target.tid}-${target.pid}`
    : null;
}

function targetsSameFloor(first: ThreadEditDraftTarget, second: ThreadEditDraftTarget) {
  return first.bid === second.bid && first.tid === second.tid && first.pid === second.pid;
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
    && isEditorValue(draft.editor)
    && typeof draft.excerpt === 'string'
    && Number.isSafeInteger(draft.signatureIndex)
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
