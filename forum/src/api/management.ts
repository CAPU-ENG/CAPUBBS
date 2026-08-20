import { getBoardById } from '../data/boards';
import { normalizeLegacyAvatar } from '../utils/legacyAssets';

const MANAGEMENT_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

type ApiRow = Record<string, unknown>;

export type ManagementThread = {
  author: string;
  board: string;
  boardId: number;
  id: number;
  title: string;
  url: string;
};

export type ManagementMember = {
  avatar: string;
  email: string;
  id: string;
  joinedAt: string;
  muted: boolean;
  relatedIds: string[];
  rights: number;
  summary: string;
};

export type ManagementMute = {
  createdAt: number;
  email: string;
  ids: string[];
  mutedBy: string;
  reason: string;
};

export class ManagementApiError extends Error {
  code: number;

  constructor(message: string, code = 0) {
    super(message);
    this.name = 'ManagementApiError';
    this.code = code;
  }
}

export async function fetchGlobalPins(signal?: AbortSignal) {
  const payload = await requestManagementApi({ ask: 'global_top' }, signal);
  return asRows(payload.data)
    .map(mapThread)
    .filter((thread): thread is ManagementThread => thread !== null);
}

export async function fetchManagementThread(threadUrl: string, signal?: AbortSignal) {
  const location = parseThreadUrl(threadUrl);
  const payload = await requestManagementApi({
    ask: 'tidinfo',
    bid: location.boardId,
    tid: location.threadId,
  }, signal);
  const thread = asRows(payload.data)
    .map(mapThread)
    .find((item) => item?.boardId === location.boardId && item.id === location.threadId);

  if (!thread) throw new ManagementApiError('没有找到这个帖子，请检查链接后重试。');
  return thread;
}

export async function toggleGlobalPin(thread: ManagementThread) {
  await requestManagementApi({
    ask: 'global_top_action',
    bid: thread.boardId,
    tid: thread.id,
  });
}

export async function moveManagementThread(thread: ManagementThread, targetBoardId: number) {
  const payload = await requestManagementApi({
    ask: 'move',
    bid: thread.boardId,
    tid: thread.id,
    to: targetBoardId,
  });
  const result = asRow(payload.data);
  const boardId = positiveInteger(result.bid);
  const threadId = positiveInteger(result.tid);

  if (!boardId || !threadId) throw new ManagementApiError('帖子已迁移，但接口没有返回新的帖子地址。');
  return { boardId, threadId, url: `/?bid=${boardId}&tid=${threadId}` };
}

export async function fetchManagementMember(username: string, signal?: AbortSignal) {
  const normalizedUsername = username.trim();
  if (!normalizedUsername) throw new ManagementApiError('请输入会员 ID。');

  const payload = await requestManagementApi({
    ask: 'management_member_lookup',
    username: normalizedUsername,
  }, signal);
  const row = asRows(payload.data)[0];
  if (!row) throw new ManagementApiError('没有找到这个会员 ID，请检查后重试。');

  const id = textValue(row.username);
  if (!id) throw new ManagementApiError('会员资料缺少有效 ID。');

  return {
    avatar: normalizeLegacyAvatar(row.icon),
    email: textValue(row.mail),
    id,
    joinedAt: textValue(row.regdate),
    muted: booleanValue(row.muted),
    relatedIds: stringList(row.related_ids, id),
    rights: numberValue(row.rights),
    summary: textValue(row.intro),
  } satisfies ManagementMember;
}

export async function fetchManagementMutes(signal?: AbortSignal) {
  let payload: ApiEnvelope;
  try {
    payload = await requestManagementApi({ ask: 'listEmailMutes' }, signal);
  } catch (error) {
    if (error instanceof ManagementApiError && error.code === 2006) return [];
    throw error;
  }
  return asRows(payload.data)
    .map((row): ManagementMute | null => {
      const email = textValue(row.email);
      if (!email) return null;
      return {
        createdAt: numberValue(row.created_at),
        email,
        ids: stringList(row.usernames),
        mutedBy: textValue(row.muted_by),
        reason: textValue(row.reason),
      };
    })
    .filter((mute): mute is ManagementMute => mute !== null);
}

export async function setManagementEmailMute(email: string, muted: boolean) {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) throw new ManagementApiError('该会员没有可用于禁言的邮箱。');
  await requestManagementApi({
    ask: muted ? 'muteEmail' : 'unmuteEmail',
    email: normalizedEmail,
  });
}

async function requestManagementApi(
  params: Record<string, string | number>,
  signal?: AbortSignal,
) {
  const body = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => body.set(key, String(value)));

  let response: Response;
  try {
    response = await fetch(MANAGEMENT_API_URL, {
      body,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ManagementApiError('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new ManagementApiError('论坛服务返回了无法识别的数据。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new ManagementApiError(payload.message?.trim() || '管理操作失败，请稍后重试。', payload.code || response.status);
  }

  return payload;
}

function parseThreadUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new ManagementApiError('请输入帖子链接。');

  try {
    const url = new URL(trimmed, window.location.origin);
    const boardId = positiveInteger(url.searchParams.get('bid') ?? url.searchParams.get('board'));
    const threadId = positiveInteger(url.searchParams.get('tid') ?? url.searchParams.get('thread'));
    if (!boardId || !threadId) throw new Error('missing thread identifiers');
    return { boardId, threadId };
  } catch {
    throw new ManagementApiError('未识别到有效帖子链接，请检查链接中的版块和帖子编号。');
  }
}

function mapThread(row: ApiRow): ManagementThread | null {
  const boardId = positiveInteger(row.bid);
  const id = positiveInteger(row.tid);
  const title = textValue(row.title);
  if (!boardId || !id || !title) return null;

  return {
    author: textValue(row.author) || '匿名用户',
    board: getBoardById(boardId)?.label ?? `版块 ${boardId}`,
    boardId,
    id,
    title,
    url: `/?bid=${boardId}&tid=${id}`,
  };
}

function positiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : 0;
}

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function booleanValue(value: unknown) {
  return value === true || value === 1 || value === '1';
}

function stringList(value: unknown, fallback = '') {
  const values = Array.isArray(value)
    ? value.map(textValue)
    : textValue(value).split(/\r?\n/).map((item) => item.trim());
  const uniqueValues = Array.from(new Set(values.filter(Boolean)));
  if (uniqueValues.length > 0) return uniqueValues;
  return fallback ? [fallback] : [];
}

function textValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function asRow(value: unknown): ApiRow {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ApiRow : {};
}

function asRows(value: unknown) {
  if (Array.isArray(value)) return value.map(asRow).filter((row) => Object.keys(row).length > 0);
  const row = asRow(value);
  return Object.keys(row).length > 0 ? [row] : [];
}
