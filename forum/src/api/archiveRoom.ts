const ARCHIVE_API_URL = import.meta.env.VITE_ARCHIVE_API_URL?.trim() || '/api/archive.php';

type ApiEnvelope<T> = {
  code: number;
  data?: T;
  message?: string;
};

export type ArchiveEntry = {
  entryKey: string;
  entryType: 'file' | 'folder';
  name: string;
  mimeType: string | null;
  byteSize: number;
  uploader: string;
  createdAt: number;
  updatedAt: number;
  items?: number;
};

export type ArchiveBreadcrumb = {
  entryKey: string | null;
  name: string;
};

export type ArchiveListing = {
  entries: ArchiveEntry[];
  breadcrumbs: ArchiveBreadcrumb[];
  canManage: boolean;
};

export class ArchiveApiError extends Error {
  code: number;

  constructor(message: string, code = 0) {
    super(message);
    this.name = 'ArchiveApiError';
    this.code = code;
  }
}

export function archiveDownloadUrl(entryKey: string) {
  return `${ARCHIVE_API_URL}?ask=download&entry_key=${encodeURIComponent(entryKey)}`;
}

export async function fetchArchiveListing(parentKey: string | null, signal?: AbortSignal) {
  const payload = await requestArchiveApi<ArchiveListing>({
    ask: 'list',
    ...(parentKey ? { parent_key: parentKey } : {}),
  }, signal);
  return mapListing(payload.data);
}

export async function uploadArchiveFile({
  file,
  name,
  parentKey,
  signal,
}: {
  file: File;
  name: string;
  parentKey: string | null;
  signal?: AbortSignal;
}) {
  const form = new FormData();
  form.set('ask', 'upload');
  form.set('name', name);
  if (parentKey) form.set('parent_key', parentKey);
  form.set('file', file, file.name);
  const payload = await requestArchiveForm<ArchiveEntry>(form, signal);
  return mapEntry(payload.data);
}

export async function createArchiveFolder(name: string, parentKey: string | null) {
  const payload = await requestArchiveApi<ArchiveEntry>({
    ask: 'mkdir',
    name,
    ...(parentKey ? { parent_key: parentKey } : {}),
  });
  return mapEntry(payload.data);
}

export async function renameArchiveEntry(entryKey: string, name: string) {
  const payload = await requestArchiveApi<ArchiveEntry>({ ask: 'rename', entry_key: entryKey, name });
  return mapEntry(payload.data);
}

export async function moveArchiveEntry(entryKey: string, targetParentKey: string | null) {
  const payload = await requestArchiveApi<ArchiveEntry>({
    ask: 'move',
    entry_key: entryKey,
    ...(targetParentKey ? { target_parent_key: targetParentKey } : {}),
  });
  return mapEntry(payload.data);
}

export async function maskArchiveEntry(entryKey: string) {
  const payload = await requestArchiveApi<{ entry_key: string }>({ ask: 'mask', entry_key: entryKey });
  return payload.data;
}

async function requestArchiveApi<T>(params: Record<string, string>, signal?: AbortSignal) {
  const body = new URLSearchParams(params);
  return requestEnvelope<T>(body, 'application/x-www-form-urlencoded; charset=UTF-8', signal);
}

async function requestArchiveForm<T>(form: FormData, signal?: AbortSignal) {
  return requestEnvelope<T>(form, undefined, signal);
}

async function requestEnvelope<T>(body: BodyInit, contentType: string | undefined, signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(ARCHIVE_API_URL, {
      body,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(contentType ? { 'Content-Type': contentType } : {}),
      },
      method: 'POST',
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ArchiveApiError('暂时无法连接档案室服务，请稍后重试。');
  }

  let payload: ApiEnvelope<T>;
  try {
    payload = await response.json() as ApiEnvelope<T>;
  } catch {
    throw new ArchiveApiError('档案室服务返回了无法识别的数据。', response.status || 4000);
  }
  if (!response.ok || payload.code !== 0) {
    throw new ArchiveApiError(payload.message?.trim() || '档案室操作失败，请稍后重试。', payload.code || response.status);
  }
  return payload;
}

function mapListing(value: unknown): ArchiveListing {
  const row = asRecord(value);
  return {
    canManage: Boolean(row.can_manage),
    breadcrumbs: Array.isArray(row.breadcrumbs)
      ? row.breadcrumbs.map(mapBreadcrumb).filter((item): item is ArchiveBreadcrumb => item !== null)
      : [],
    entries: Array.isArray(row.entries)
      ? row.entries.map(mapEntry).filter((item): item is ArchiveEntry => item !== null)
      : [],
  };
}

function mapEntry(value: unknown): ArchiveEntry | null {
  const row = asRecord(value);
  const entryKey = text(row.entry_key);
  const entryType = row.entry_type === 'folder' || row.entry_type === 'file' ? row.entry_type : null;
  if (!entryKey || !entryType) return null;
  return {
    byteSize: number(row.byte_size),
    createdAt: number(row.created_at),
    entryKey,
    entryType,
    items: row.items === undefined ? undefined : number(row.items),
    mimeType: text(row.mime_type) || null,
    name: text(row.name),
    updatedAt: number(row.updated_at),
    uploader: text(row.uploader),
  };
}

function mapBreadcrumb(value: unknown): ArchiveBreadcrumb | null {
  const row = asRecord(value);
  const name = text(row.name);
  if (!name) return null;
  return { entryKey: text(row.entry_key) || null, name };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}
