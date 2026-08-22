import defaultAvatar from '../assets/bg/bicycle.svg';
import type { TagDefinition } from '../data/tags';
import { normalizeLegacyAvatar } from '../utils/legacyAssets';
import { getPublicProfilePath } from '../utils/userRoutes';

const TAG_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';
const TAG_PAGE_SIZE = 100;

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

type ApiRow = Record<string, unknown>;

export type TagMember = {
  addedAt: number;
  avatar: string;
  href: string;
  username: string;
};

export type TagMemberCheck = {
  addedAt: number | null;
  member: Pick<TagMember, 'avatar' | 'username'> | null;
  state: 'already_added' | 'available' | 'not_found';
  username: string;
};

export type TagMemberAddResult = {
  addedAt: number | null;
  status: 'added' | 'already_added' | 'not_found';
  username: string;
};

export type TagSummaryMember = TagMember;

export class TagsApiError extends Error {
  code: number;

  constructor(message: string, code = 0) {
    super(message);
    this.name = 'TagsApiError';
    this.code = code;
  }
}

export async function fetchTagDefinitions(signal?: AbortSignal): Promise<TagDefinition[]> {
  const data = await requestTagApi({ ask: 'tag_list' }, signal);
  return itemsFrom(data)
    .map(mapTagDefinition)
    .filter((tag): tag is TagDefinition => tag !== null);
}

export async function createTagDefinition(name: string, color: string): Promise<TagDefinition> {
  const data = await requestTagApi({ ask: 'management_tag_create', color, name }, undefined);
  const tag = mapTagDefinition(firstRow(data));
  if (!tag) throw new TagsApiError('标签已创建，但接口没有返回标签资料。');
  return tag;
}

export async function updateTagDefinition(
  tagId: string,
  changes: { color?: string; name?: string },
): Promise<TagDefinition> {
  const params: Record<string, string | number> = { ask: 'management_tag_update', tag_id: tagId };
  if (changes.name !== undefined) params.name = changes.name;
  if (changes.color !== undefined) params.color = changes.color;
  const data = await requestTagApi(params, undefined);
  const tag = mapTagDefinition(firstRow(data));
  if (!tag) throw new TagsApiError('标签已更新，但接口没有返回标签资料。');
  return tag;
}

export async function deleteTagDefinition(tagId: string) {
  await requestTagApi({ ask: 'management_tag_delete', tag_id: tagId }, undefined);
}

export async function fetchTagMembers(tagId: string, signal?: AbortSignal): Promise<TagMember[]> {
  const members: TagMember[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (members.length < total) {
    const data = await requestTagApi({
      ask: 'management_tag_members',
      page,
      page_size: TAG_PAGE_SIZE,
      tag_id: tagId,
    }, signal);
    const pageItems = itemsFrom(data)
      .map(mapTagMember)
      .filter((member): member is TagMember => member !== null);
    const payload = asRow(data);
    total = numberValue(payload.total, members.length + pageItems.length);
    members.push(...pageItems);
    if (pageItems.length === 0 || members.length >= total || page >= 100) break;
    page += 1;
  }

  return members;
}

export async function checkTagMember(tagId: string, username: string, signal?: AbortSignal): Promise<TagMemberCheck> {
  const data = await requestTagApi({
    ask: 'management_tag_member_check',
    tag_id: tagId,
    username: username.trim(),
  }, signal);
  const row = asRow(data);
  const state = textValue(row.state);
  return {
    addedAt: nullableNumber(row.added_at),
    member: asRow(row.member).username ? {
      avatar: normalizeAvatar(asRow(row.member).avatar),
      username: textValue(asRow(row.member).username),
    } : null,
    state: state === 'available' || state === 'already_added' ? state : 'not_found',
    username: textValue(row.username),
  };
}

export async function addTagMembers(tagId: string, usernames: string[]): Promise<TagMemberAddResult[]> {
  const data = await requestTagApi({
    ask: 'management_tag_members_add',
    tag_id: tagId,
    usernames: usernames.join(','),
  }, undefined);
  return itemsFrom(asRow(data).results)
    .map(mapTagMemberAddResult)
    .filter((result): result is TagMemberAddResult => result !== null);
}

export async function removeTagMember(tagId: string, username: string) {
  await requestTagApi({
    ask: 'management_tag_member_remove',
    tag_id: tagId,
    username: username.trim(),
  }, undefined);
}

export async function fetchTagSummary(
  includeTagIds: string[],
  excludeTagIds: string[],
  signal?: AbortSignal,
): Promise<TagSummaryMember[]> {
  const data = await requestTagApi({
    ask: 'tag_summary',
    exclude_tag_ids: excludeTagIds.join(','),
    include_tag_ids: includeTagIds.join(','),
  }, signal);
  return itemsFrom(data)
    .map(mapTagMember)
    .filter((member): member is TagMember => member !== null);
}

async function requestTagApi(
  params: Record<string, string | number>,
  signal?: AbortSignal,
) {
  const body = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => body.set(key, String(value)));

  let response: Response;
  try {
    response = await fetch(TAG_API_URL, {
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
    if (isAbortError(error)) throw error;
    throw new TagsApiError('暂时无法连接标签服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new TagsApiError('标签服务返回了无法识别的内容。');
  }

  if (!response.ok || Number(payload.code) !== 0) {
    throw new TagsApiError(payload.message?.trim() || '标签操作失败，请稍后重试。', Number(payload.code) || response.status);
  }
  return payload.data;
}

function mapTagDefinition(value: unknown): TagDefinition | null {
  const row = asRow(value);
  const id = positiveInteger(row.id);
  const name = textValue(row.name);
  const color = textValue(row.color);
  if (!id || !name || !color) return null;
  return {
    addedAt: timestampToIso(row.created_at),
    color,
    id: String(id),
    name,
  };
}

function mapTagMember(value: unknown): TagMember | null {
  const row = asRow(value);
  const username = textValue(row.username);
  if (!username) return null;
  return {
    addedAt: numberValue(row.added_at),
    avatar: normalizeAvatar(row.avatar),
    href: textValue(row.profile_url) || getPublicProfilePath(username),
    username,
  };
}

function mapTagMemberAddResult(value: unknown): TagMemberAddResult | null {
  const row = asRow(value);
  const username = textValue(row.username);
  const status = textValue(row.status);
  if (!username || (status !== 'added' && status !== 'already_added' && status !== 'not_found')) return null;
  return { addedAt: nullableNumber(row.added_at), status, username };
}

function itemsFrom(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const row = asRow(value);
  return Array.isArray(row.items) ? row.items : [];
}

function firstRow(value: unknown) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function asRow(value: unknown): ApiRow {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ApiRow : {};
}

function normalizeAvatar(value: unknown) {
  return normalizeLegacyAvatar(value) || defaultAvatar;
}

function timestampToIso(value: unknown) {
  const timestamp = numberValue(value);
  return timestamp > 0 ? new Date(timestamp * 1000).toISOString() : undefined;
}

function nullableNumber(value: unknown) {
  const timestamp = numberValue(value);
  return timestamp > 0 ? timestamp : null;
}

function positiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : 0;
}

function numberValue(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
}

function textValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
