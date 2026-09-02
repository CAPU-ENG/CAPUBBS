import defaultAvatar from '../assets/avatar/default-avatar.svg';
import type {
  ProfileDetail,
  ProfileRecord,
  ProfileRecordMap,
  ProfileViewData,
} from '../data/profile';
import type { UserTag } from '../data/tags';
import type { UserMedal } from '../data/medals';
import type { FloorDecorationPaths, FloorDecorationVariant } from '../data/floorDecoration';
import { fetchSelfMedals, mapUserMedals, updateMedalPreferences } from './medals';
import { normalizeLegacyAvatar } from '../utils/legacyAssets';
import { md5LegacyStringHex } from '../utils/md5';

const PROFILE_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

type ApiRow = Record<string, unknown>;

type EditUserOverrides = {
  details?: {
    hobby: string;
    intro: string;
    location: string;
    qq: string;
  };
  displayTagIds?: string[];
  icon?: string;
  signatures?: ProfileRecord[];
};

export type LoadedPublicProfile = {
  canViewActivities: boolean;
  isOwnProfile: boolean;
  profile: ProfileViewData;
};

export class ProfileApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileApiError';
  }
}

export async function fetchUserCenterProfile(signal?: AbortSignal, knownUsername?: string) {
  const username = knownUsername?.trim();
  if (!username) {
    const medalsPromise = fetchSelfMedals(signal);
    const profileRow = await fetchCurrentUserRow(signal);
    return fetchUserCenterProfileForUsername(
      stringValue(profileRow.username),
      signal,
      Promise.resolve(profileRow),
      medalsPromise,
    );
  }
  return fetchUserCenterProfileForUsername(username, signal);
}

async function fetchUserCenterProfileForUsername(
  username: string,
  signal?: AbortSignal,
  existingProfileRow?: Promise<ApiRow>,
  existingMedals?: Promise<UserMedal[]>,
) {
  const profileRowPromise = existingProfileRow
    ?? requestRows({ ask: 'user_profile', tag: 1, username }, signal).then((rows) => {
      const row = rows[0];
      if (!row || !stringValue(row.username)) {
        throw new ProfileApiError('个人资料加载失败，请稍后重试。');
      }
      return row;
    });
  const [profileRow, medals, postRows, replyRows, activityRows, favoriteRows] = await Promise.all([
    profileRowPromise,
    existingMedals ?? fetchSelfMedals(signal),
    requestRows({ ask: 'recentpost', limit: 'all', view: username }, signal),
    requestRows({ ask: 'recentreply', limit: 'all', view: username }, signal),
    requestRows({ ask: 'activity_signup_history', username }, signal),
    requestRows({ ask: 'favorite_list', limit: 'all' }, signal),
  ]);

  return mapProfile(profileRow, {
    activityRows,
    favoriteRows,
    includeSignatures: true,
    medals,
    postRows,
    replyRows,
  });
}

export async function fetchPublicProfile(profileName: string, signal?: AbortSignal): Promise<LoadedPublicProfile> {
  const username = profileName.trim();
  if (!username) throw new ProfileApiError('用户不存在。');

  const [profileRows, viewerRows] = await Promise.all([
    requestRows({ ask: 'user_profile', medal: 1, tag: 1, username }, signal),
    requestRows({ ask: 'getuser' }, signal),
  ]);
  const profileRow = profileRows[0];
  if (!profileRow || !stringValue(profileRow.username)) throw new ProfileApiError('用户不存在。');

  const resolvedUsername = stringValue(profileRow.username);
  const viewerUsername = stringValue(viewerRows[0]?.username);
  const canViewActivities = Boolean(viewerUsername);
  const isOwnProfile = resolvedUsername === viewerUsername;
  const [postRows, replyRows, activityRows, favoriteRows] = await Promise.all([
    requestRows({ ask: 'recentpost', limit: 'all', view: resolvedUsername }, signal),
    requestRows({ ask: 'recentreply', limit: 'all', view: resolvedUsername }, signal),
    canViewActivities
      ? requestRows({ ask: 'activity_signup_history', username: resolvedUsername }, signal)
      : Promise.resolve([]),
    isOwnProfile ? requestRows({ ask: 'favorite_list', limit: 'all' }, signal) : Promise.resolve([]),
  ]);

  return {
    canViewActivities,
    isOwnProfile,
    profile: mapProfile(profileRow, {
      activityRows,
      favoriteRows,
      includeSignatures: false,
      postRows,
      replyRows,
    }),
  };
}

export async function updateProfileDetails(details: EditUserOverrides['details']) {
  const row = await fetchCurrentUserRow();
  await editUser(row, { details });
  return fetchUserCenterProfile();
}

export async function updateProfilePersonalization(
  displayTagIds: string[],
  displayMedalIds: string[],
  hiddenMedalIds: string[],
) {
  const row = await fetchCurrentUserRow();
  await Promise.all([
    editUser(row, { displayTagIds }),
    updateMedalPreferences(displayMedalIds, hiddenMedalIds),
  ]);
  return fetchUserCenterProfile();
}

export async function uploadProfileFloorDecoration(file: File, variant: FloorDecorationVariant) {
  const body = new FormData();
  body.set('ask', 'floor_decoration_upload');
  body.set('variant', variant);
  body.set('file', file);
  const data = await requestMultipartData(body);
  return mapFloorDecoration(isApiRow(data) ? data.floorDecoration : null);
}

export async function deleteProfileFloorDecoration(variant: FloorDecorationVariant) {
  const data = await requestData({ ask: 'floor_decoration_delete', variant });
  return mapFloorDecoration(isApiRow(data) ? data.floorDecoration : null);
}

export async function updateProfileSignatures(signatures: ProfileRecord[]) {
  const row = await fetchCurrentUserRow();
  await editUser(row, { signatures });
  return fetchUserCenterProfile();
}

export async function updateProfileAvatar(avatarSrc: string) {
  const body = new FormData();
  body.set('ask', 'avatar_update');
  if (avatarSrc === defaultAvatar || !avatarSrc.trim()) {
    body.set('use_default', '1');
  } else if (avatarSrc.startsWith('data:image/')) {
    const blob = await fetch(avatarSrc).then((response) => response.blob());
    body.set('file', new File([blob], 'avatar.png', { type: 'image/png' }));
  } else {
    return fetchUserCenterProfile();
  }
  await requestMultipartData(body);
  return fetchUserCenterProfile();
}

export async function sendProfileEmailCode(newEmail: string) {
  await requestData({ ask: 'sendVerifyCode', new_email: newEmail.trim(), type: 'change_email' });
}

export async function verifyProfileEmail(code: string) {
  await requestData({ ask: 'verifyEmail', code: code.trim(), type: 'change_email' });
  return fetchUserCenterProfile();
}

export async function updateProfileEmailVisibility(emailVisible: boolean) {
  await requestData({ ask: 'toggleEmailVisible', email_visible: emailVisible ? 1 : 0 });
}

export async function updateProfilePassword(oldPassword: string, newPassword: string) {
  await requestData({
    ask: 'changepsd',
    new: md5LegacyStringHex(newPassword),
    old: md5LegacyStringHex(oldPassword),
  });
}

export async function sendProfilePrivateMessage(recipient: string, text: string) {
  await requestData({ ask: 'sendmsg', text: text.trim(), to: recipient });
}

export function isProfileAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

async function fetchCurrentUserRow(signal?: AbortSignal) {
  const identityRows = await requestRows({ ask: 'getuser' }, signal);
  const username = stringValue(identityRows[0]?.username);
  if (!username) throw new ProfileApiError('请先登录后查看个人中心。');

  // currentUserInfo can expose the profile's own `code` column as the first
  // row, which the unified API wrapper may mistake for a legacy status code.
  const profileRows = await requestRows({ ask: 'user_profile', tag: 1, username }, signal);
  const profileRow = profileRows[0];
  if (!profileRow || !stringValue(profileRow.username)) {
    throw new ProfileApiError('个人资料加载失败，请稍后重试。');
  }
  return profileRow;
}

async function editUser(row: ApiRow, overrides: EditUserOverrides) {
  const details = overrides.details;
  const signatures = overrides.signatures;
  const signatureValues = signatures?.map((record) => record.excerpt) ?? [
    stringValue(row.sig1),
    stringValue(row.sig2),
    stringValue(row.sig3),
  ];
  const signatureTypes = signatures?.map((record) => getSignatureType(record)) ?? [
    normalizeSignatureType(row.sig1_type),
    normalizeSignatureType(row.sig2_type),
    normalizeSignatureType(row.sig3_type),
  ];

  const params: Record<string, string | number> = {
    ask: 'edituser',
    hobby: details?.hobby ?? stringValue(row.hobby),
    icon: overrides.icon ?? stringValue(row.icon),
    intro: details?.intro ?? stringValue(row.intro),
    mail: stringValue(row.mail),
    place: details?.location ?? stringValue(row.place),
    qq: details?.qq ?? stringValue(row.qq),
    sex: stringValue(row.sex),
    sig1: signatureValues[0] ?? '',
    sig1_type: signatureTypes[0] ?? 'null',
    sig2: signatureValues[1] ?? '',
    sig2_type: signatureTypes[1] ?? 'null',
    sig3: signatureValues[2] ?? '',
    sig3_type: signatureTypes[2] ?? 'null',
  };
  if (overrides.displayTagIds) params.display_tag_ids = overrides.displayTagIds.join(',');
  await requestData(params);
}

async function requestMultipartData(body: FormData, signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(PROFILE_API_URL, {
      body,
      credentials: 'include',
      method: 'POST',
      signal,
    });
  } catch (error) {
    if (isProfileAbortError(error)) throw error;
    throw new ProfileApiError('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new ProfileApiError('论坛服务返回了无法识别的数据。');
  }
  if (!response.ok || payload.code !== 0) {
    throw new ProfileApiError(payload.message?.trim() || '装饰图片上传失败。');
  }
  return payload.data;
}

async function requestRows(params: Record<string, string | number>, signal?: AbortSignal) {
  const data = await requestData(params, signal);
  const rows = Array.isArray(data) ? data : data ? [data] : [];
  return rows.filter(isApiRow);
}

async function requestData(params: Record<string, string | number>, signal?: AbortSignal) {
  const body = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => body.set(key, String(value)));

  let response: Response;
  try {
    response = await fetch(PROFILE_API_URL, {
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
    if (isProfileAbortError(error)) throw error;
    throw new ProfileApiError('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new ProfileApiError('论坛服务返回了无法识别的数据。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new ProfileApiError(payload.message?.trim() || '操作失败，请稍后重试。');
  }

  return payload.data;
}

function mapProfile(
  row: ApiRow,
  {
    activityRows,
    favoriteRows,
    includeSignatures,
    medals,
    postRows,
    replyRows,
  }: {
    activityRows: ApiRow[];
    favoriteRows: ApiRow[];
    includeSignatures: boolean;
    medals?: UserMedal[];
    postRows: ApiRow[];
    replyRows: ApiRow[];
  },
): ProfileViewData {
  const posts = postRows.map((record) => mapRecord(record, 'post')).filter(isProfileRecord);
  const replies = replyRows
    .filter((record) => numberValue(record.pid) > 1)
    .map((record) => mapRecord(record, 'reply'))
    .filter(isProfileRecord);
  const bookmarks = favoriteRows.map((record) => mapRecord(record, 'bookmark')).filter(isProfileRecord);
  const activities = activityRows.map(mapActivityRecord).filter(isProfileRecord);
  const signatures = includeSignatures ? mapSignatures(row) : [];
  const records: ProfileRecordMap = {
    activities,
    bookmarks,
    drafts: [],
    posts,
    replies,
    signatures,
  };
  const details: ProfileDetail[] = [
    { key: 'hobby', label: '爱好', value: stringValue(row.hobby) },
    { key: 'qq', label: 'QQ', value: stringValue(row.qq) },
    { key: 'email', label: 'Email', value: stringValue(row.mail ?? row.email) },
    { key: 'location', label: '地点', value: stringValue(row.place ?? row.location) },
  ];
  const username = stringValue(row.username);
  const postCount = numberValue(row.post);
  const replyCount = numberValue(row.reply);

  return {
    avatarSrc: normalizeAvatar(row.icon),
    counts: {
      activities: activities.length,
      bookmarks: bookmarks.length,
      drafts: 0,
      posts: posts.length,
      replies: replies.length,
      signatures: signatures.filter((signature) => signature.excerpt.trim()).length,
    },
    details,
    emailVerified: truthyFlag(row.verified),
    emailVisible: truthyFlag(row.email_visible),
    floorDecoration: mapFloorDecoration(row.floorDecoration),
    id: username,
    intro: stringValue(row.intro),
    medals: medals ?? (Array.isArray(row.medals) ? mapUserMedals(row.medals) : undefined),
    rating: Math.max(0, Math.min(9, numberValue(row.star))),
    starPostReplyCount: postCount + replyCount,
    records,
    slug: username,
    stats: [
      { label: '发帖数', value: postCount },
      { label: '签到数', value: numberValue(row.sign) },
      { label: '上次在线', value: formatProfileDate(row.lastdate) },
      { label: '权限值', value: numberValue(row.rights) },
      { label: '回复数', value: replyCount },
      { label: '灌水数', value: numberValue(row.water) },
      { label: '注册时间', value: formatProfileDate(row.regdate) },
      { label: '精品数', value: numberValue(row.extr ?? row.digest ?? row.digests) },
    ],
    tags: Array.isArray(row.tags) ? mapProfileTags(row.tags) : undefined,
  };
}

function mapFloorDecoration(value: unknown): FloorDecorationPaths {
  const decoration = isApiRow(value) ? value : {};
  return {
    darkImagePath: stringValue(decoration.darkImagePath) || null,
    lightImagePath: stringValue(decoration.lightImagePath) || null,
  };
}

function mapProfileTags(value: unknown): UserTag[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): UserTag | null => {
      if (!isApiRow(item)) return null;
      const id = stringValue(item.id);
      const name = plainText(item.name);
      if (!id || !name) return null;

      const addedAt = timestampToIso(item.added_at);
      const displayOrder = numberValue(item.display_order);
      return {
        addedAt: addedAt || undefined,
        color: stringValue(item.color) || '#69747c',
        displayOrder: displayOrder === 1 || displayOrder === 2 ? displayOrder : undefined,
        id,
        name,
      };
    })
    .filter((tag): tag is UserTag => tag !== null);
}

function mapRecord(row: ApiRow, kind: 'bookmark' | 'post' | 'reply'): ProfileRecord | null {
  const bid = numberValue(row.bid);
  const tid = numberValue(row.tid);
  const pid = numberValue(row.pid);
  const title = plainText(row.title);
  if (!bid || !tid || !title) return null;

  const floor = kind === 'reply' && pid > 0 ? pid : null;
  const page = floor ? Math.max(1, Math.ceil(floor / 12)) : 1;
  const floorHash = floor ? `#${floor}` : '';
  return {
    author: stringValue(row.author),
    board: stringValue(row.board ?? row.boardname) || `版块 ${bid}`,
    date: formatRecordDate(
      kind === 'bookmark'
        ? row.fav_timestamp ?? row.timestamp ?? row.postdate
        : row.timestamp ?? row.replytime ?? row.updatetime ?? row.postdate,
    ),
    excerpt: '',
    href: `/?bid=${bid}&tid=${tid}&p=${page}${floorHash}`,
    id: `${kind}-${bid}-${tid}-${pid || 0}`,
    title,
  };
}

function mapActivityRecord(row: ApiRow): ProfileRecord | null {
  const bid = numberValue(row.bid);
  const tid = numberValue(row.tid);
  const pid = numberValue(row.pid);
  const title = plainText(row.title);
  if (!bid || !tid || !title) return null;

  const page = pid > 0 ? Math.max(1, Math.ceil(pid / 12)) : 1;
  return {
    board: stringValue(row.board) || `版块 ${bid}`,
    date: formatRecordDate(row.joined_at),
    excerpt: '',
    href: `/?bid=${bid}&tid=${tid}&p=${page}${pid > 0 ? `#${pid}` : ''}`,
    id: `activity-${numberValue(row.join_id) || `${bid}-${tid}`}`,
    status: numberValue(row.cancel) === 1 ? '已取消报名' : '已报名',
    title,
  };
}

function mapSignatures(row: ApiRow): ProfileRecord[] {
  return [1, 2, 3].map((index) => {
    const content = stringValue(row[`sig${index}`]);
    const signatureType = normalizeSignatureType(row[`sig${index}_type`]);
    return {
      board: '签名档',
      contentMode: signatureType === 'html' ? 'html' : 'rich',
      date: '',
      excerpt: content,
      href: `#signature-${index}`,
      id: `signature-${index}`,
      title: `签名档 ${index}`,
    };
  });
}

function getSignatureType(record: ProfileRecord) {
  if (/^\[post\s+bid=\d+\s+tid=\d+\s+pid=\d+\]$/i.test(record.excerpt.trim())) return 'raw';
  return record.contentMode === 'markdown' ? 'raw' : 'html';
}

function normalizeSignatureType(value: unknown) {
  const type = stringValue(value).toLowerCase();
  return type === 'html' || type === 'raw' ? type : 'null';
}

function normalizeAvatar(value: unknown) {
  return normalizeLegacyAvatar(value) || defaultAvatar;
}

function formatRecordDate(value: unknown) {
  const date = dateValue(value);
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatProfileDate(value: unknown) {
  const date = dateValue(value);
  if (!date) return '未知';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
}

function timestampToIso(value: unknown) {
  const date = dateValue(value);
  return date ? date.toISOString() : '';
}

function dateValue(value: unknown) {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return new Date(numeric > 10_000_000_000 ? numeric : numeric * 1000);
  }
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function plainText(value: unknown) {
  const text = stringValue(value);
  if (!text) return '';
  const documentValue = new DOMParser().parseFromString(text, 'text/html');
  return (documentValue.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function stringValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function truthyFlag(value: unknown) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function isApiRow(value: unknown): value is ApiRow {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isProfileRecord(value: ProfileRecord | null): value is ProfileRecord {
  return value !== null;
}
