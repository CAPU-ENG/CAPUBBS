import defaultAvatar from '../assets/bg/bicycle.svg';
import type { MedalDisplayState, MedalTextureId, UserMedal } from '../data/medals';
import { normalizeLegacyAvatar } from '../utils/legacyAssets';
import { getPublicProfilePath } from '../utils/userRoutes';

const MEDAL_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';
const MEDAL_PAGE_SIZE = 100;

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

type ApiRow = Record<string, unknown>;

export type MedalDefinition = {
  createdAt: number;
  createdBy: string;
  id: string;
  largeImagePath: string;
  name: string;
  smallImagePath: string;
  textureId: MedalTextureId;
  updatedAt: number;
  updatedBy: string;
};

export type MedalMember = {
  awardedAt: number;
  awardedBy: string;
  avatar: string;
  href: string;
  role: string;
  state: MedalDisplayState;
  username: string;
};

export type MedalAssignmentInput = {
  role: string;
  username: string;
};

export type MedalMemberCheck = MedalAssignmentInput & {
  awardedAt: number | null;
  member: {
    avatar: string;
    href: string;
    username: string;
  } | null;
  state: 'already_owned' | 'available' | 'not_found';
};

export type MedalGrantResult = MedalAssignmentInput & {
  awardedAt: number | null;
  status: 'added' | 'already_owned' | 'not_found';
};

export class MedalsApiError extends Error {
  code: number;

  constructor(message: string, code = 0) {
    super(message);
    this.name = 'MedalsApiError';
    this.code = code;
  }
}

export async function fetchMedalDefinitions(signal?: AbortSignal): Promise<MedalDefinition[]> {
  const data = await requestMedalData({ ask: 'management_medal_list' }, signal);
  return itemsFrom(data).map(mapMedalDefinition).filter(isPresent);
}

export async function createMedalDefinition({
  image,
  name,
  textureId,
}: {
  image: File;
  name: string;
  textureId: MedalTextureId;
}) {
  const body = new FormData();
  body.set('ask', 'management_medal_create');
  body.set('file', image);
  body.set('name', name.trim());
  body.set('texture_id', textureId);
  const medal = mapMedalDefinition(await requestMedalMultipartData(body));
  if (!medal) throw new MedalsApiError('勋章已创建，但接口没有返回勋章资料。');
  return medal;
}

export async function updateMedalDefinition(
  medalId: string,
  changes: { image?: File; name?: string; textureId?: MedalTextureId },
) {
  const body = new FormData();
  body.set('ask', 'management_medal_update');
  body.set('medal_id', medalId);
  if (changes.image) body.set('file', changes.image);
  if (changes.name !== undefined) body.set('name', changes.name.trim());
  if (changes.textureId !== undefined) body.set('texture_id', changes.textureId);
  const medal = mapMedalDefinition(await requestMedalMultipartData(body));
  if (!medal) throw new MedalsApiError('勋章已更新，但接口没有返回勋章资料。');
  return medal;
}

export async function deleteMedalDefinition(medalId: string) {
  await requestMedalData({ ask: 'management_medal_delete', medal_id: medalId });
}

export async function fetchMedalMembers(medalId: string, signal?: AbortSignal) {
  const members: MedalMember[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (members.length < total) {
    const data = await requestMedalData({
      ask: 'management_medal_members',
      medal_id: medalId,
      page,
      page_size: MEDAL_PAGE_SIZE,
    }, signal);
    const payload = asRow(data);
    const pageItems = itemsFrom(data).map(mapMedalMember).filter(isPresent);
    total = nonNegativeInteger(payload.total, members.length + pageItems.length);
    members.push(...pageItems);
    if (pageItems.length === 0 || members.length >= total || page >= 100) break;
    page += 1;
  }

  return members;
}

export async function checkMedalMembers(
  medalId: string,
  assignments: MedalAssignmentInput[],
  signal?: AbortSignal,
): Promise<MedalMemberCheck[]> {
  const data = await requestMedalData({
    ask: 'management_medal_members_check',
    assignments: JSON.stringify(assignments),
    medal_id: medalId,
  }, signal);
  return itemsFrom(data).map(mapMedalMemberCheck).filter(isPresent);
}

export async function grantMedalMembers(
  medalId: string,
  assignments: MedalAssignmentInput[],
): Promise<MedalGrantResult[]> {
  const data = await requestMedalData({
    ask: 'management_medal_members_add',
    assignments: JSON.stringify(assignments),
    medal_id: medalId,
  });
  return itemsFrom(asRow(data).results).map(mapMedalGrantResult).filter(isPresent);
}

export async function removeMedalMember(medalId: string, username: string) {
  await requestMedalData({
    ask: 'management_medal_member_remove',
    medal_id: medalId,
    username: username.trim(),
  });
}

export async function fetchSelfMedals(signal?: AbortSignal): Promise<UserMedal[]> {
  const data = await requestMedalData({ ask: 'medal_self_settings' }, signal);
  return itemsFrom(data).map(mapUserMedal).filter(isPresent);
}

export async function fetchPublicUserMedals(username: string, signal?: AbortSignal): Promise<UserMedal[]> {
  const data = await requestMedalData({
    ask: 'user_profile',
    medal: 1,
    username: username.trim(),
  }, signal);
  const profile = asRow(Array.isArray(data) ? data[0] : data);
  return mapUserMedals(profile.medals);
}

export async function updateMedalPreferences(
  displayMedalIds: string[],
  hiddenMedalIds: string[],
) {
  const data = await requestMedalData({
    ask: 'medal_preferences_update',
    display_medal_ids: displayMedalIds.join(','),
    hidden_medal_ids: hiddenMedalIds.join(','),
  });
  return itemsFrom(data).map(mapUserMedal).filter(isPresent);
}

export function mapUserMedals(value: unknown): UserMedal[] {
  return Array.isArray(value) ? value.map(mapUserMedal).filter(isPresent) : [];
}

async function requestMedalData(
  params: Record<string, string | number>,
  signal?: AbortSignal,
) {
  const body = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => body.set(key, String(value)));
  return requestMedal(body, signal);
}

async function requestMedalMultipartData(body: FormData, signal?: AbortSignal) {
  return requestMedal(body, signal);
}

async function requestMedal(body: FormData | URLSearchParams, signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(MEDAL_API_URL, {
      body,
      credentials: 'include',
      headers: body instanceof URLSearchParams ? {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      } : { Accept: 'application/json' },
      method: 'POST',
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new MedalsApiError('暂时无法连接勋章服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new MedalsApiError('勋章服务返回了无法识别的内容。');
  }

  if (!response.ok || Number(payload.code) !== 0) {
    throw new MedalsApiError(payload.message?.trim() || '勋章操作失败，请稍后重试。', Number(payload.code) || response.status);
  }
  return payload.data;
}

function mapMedalDefinition(value: unknown): MedalDefinition | null {
  const row = asRow(value);
  const id = positiveInteger(row.id);
  const name = textValue(row.name);
  const textureId = medalTexture(row.texture_id);
  const largeImagePath = textValue(row.large_image_path);
  const smallImagePath = textValue(row.small_image_path);
  if (!id || !name || !textureId || !largeImagePath || !smallImagePath) return null;
  return {
    createdAt: nonNegativeInteger(row.created_at),
    createdBy: textValue(row.created_by),
    id: String(id),
    largeImagePath,
    name,
    smallImagePath,
    textureId,
    updatedAt: nonNegativeInteger(row.updated_at),
    updatedBy: textValue(row.updated_by),
  };
}

function mapMedalMember(value: unknown): MedalMember | null {
  const row = asRow(value);
  const username = textValue(row.username);
  const state = medalState(row.state);
  if (!username || !state) return null;
  return {
    awardedAt: nonNegativeInteger(row.awarded_at),
    awardedBy: textValue(row.awarded_by),
    avatar: normalizeAvatar(row.avatar),
    href: textValue(row.profile_url) || getPublicProfilePath(username),
    role: textValue(row.role),
    state,
    username,
  };
}

function mapMedalMemberCheck(value: unknown): MedalMemberCheck | null {
  const row = asRow(value);
  const username = textValue(row.username);
  const role = textValue(row.role);
  const state = textValue(row.state);
  if (!username || (state !== 'available' && state !== 'already_owned' && state !== 'not_found')) return null;
  const member = asRow(row.member);
  const memberUsername = textValue(member.username);
  return {
    awardedAt: nullablePositiveInteger(row.awarded_at),
    member: memberUsername ? {
      avatar: normalizeAvatar(member.avatar),
      href: textValue(member.profile_url) || getPublicProfilePath(memberUsername),
      username: memberUsername,
    } : null,
    role,
    state,
    username,
  };
}

function mapMedalGrantResult(value: unknown): MedalGrantResult | null {
  const row = asRow(value);
  const username = textValue(row.username);
  const role = textValue(row.role);
  const status = textValue(row.status);
  if (!username || (status !== 'added' && status !== 'already_owned' && status !== 'not_found')) return null;
  return { awardedAt: nullablePositiveInteger(row.awarded_at), role, status, username };
}

function mapUserMedal(value: unknown): UserMedal | null {
  const row = asRow(value);
  const id = positiveInteger(row.id);
  const name = textValue(row.name);
  const smallImagePath = textValue(row.small_image_path);
  if (!id || !name || !smallImagePath) return null;
  const state = medalState(row.state);
  const textureId = medalTexture(row.texture_id);
  return {
    awardedAt: nonNegativeInteger(row.awarded_at),
    id: String(id),
    largeImagePath: textValue(row.large_image_path) || undefined,
    name,
    role: textValue(row.role),
    smallImagePath,
    ...(state ? { state } : {}),
    ...(textureId ? { textureId } : {}),
  };
}

function itemsFrom(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const row = asRow(value);
  return Array.isArray(row.items) ? row.items : [];
}

function medalState(value: unknown): MedalDisplayState | null {
  const state = textValue(value);
  return state === 'display' || state === 'retain' || state === 'hidden' ? state : null;
}

function medalTexture(value: unknown): MedalTextureId | null {
  const texture = textValue(value);
  return texture === 'carbon'
    || texture === 'geometric'
    || texture === 'halftone'
    || texture === 'interlaced'
    || texture === 'pixel'
    || texture === 'scale'
    || texture === 'swirl'
    ? texture
    : null;
}

function normalizeAvatar(value: unknown) {
  return normalizeLegacyAvatar(value) || defaultAvatar;
}

function positiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : 0;
}

function nullablePositiveInteger(value: unknown) {
  const number = positiveInteger(value);
  return number || null;
}

function nonNegativeInteger(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
}

function textValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function asRow(value: unknown): ApiRow {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ApiRow : {};
}

function isPresent<T>(value: T | null): value is T {
  return value !== null;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
