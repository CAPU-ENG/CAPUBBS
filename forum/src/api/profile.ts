import defaultAvatar from '../assets/avatar/default-avatar.avif';
import type {
  ProfileDetail,
  ProfileRecord,
  ProfileRecordMap,
  ProfileViewData,
} from '../data/profileDemo';
import { md5LegacyStringHex } from '../utils/md5';

const PROFILE_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';
const AVATAR_UPLOAD_URL = import.meta.env.VITE_AVATAR_UPLOAD_URL?.trim() || '/bbs/utils/icon_upload.php';
const PUBLIC_ASSET_ORIGIN = 'https://chexie.net';

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
  icon?: string;
  signatures?: ProfileRecord[];
};

export type LoadedPublicProfile = {
  isOwnProfile: boolean;
  profile: ProfileViewData;
};

export class ProfileApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileApiError';
  }
}

export async function fetchUserCenterProfile(signal?: AbortSignal) {
  const profileRow = await fetchCurrentUserRow(signal);
  const username = stringValue(profileRow.username);
  const [postRows, replyRows, favoriteRows] = await Promise.all([
    requestRows({ ask: 'recentpost', limit: 'all', view: username }, signal),
    requestRows({ ask: 'recentreply', limit: 'all', view: username }, signal),
    requestRows({ ask: 'favorite_list', limit: 'all' }, signal),
  ]);

  return mapProfile(profileRow, {
    favoriteRows,
    includeSignatures: true,
    postRows,
    replyRows,
  });
}

export async function fetchPublicProfile(profileName: string, signal?: AbortSignal): Promise<LoadedPublicProfile> {
  const username = profileName.trim();
  if (!username) throw new ProfileApiError('用户不存在。');

  const [profileRows, viewerRows] = await Promise.all([
    requestRows({ ask: 'user_profile', username }, signal),
    requestRows({ ask: 'getuser' }, signal),
  ]);
  const profileRow = profileRows[0];
  if (!profileRow || !stringValue(profileRow.username)) throw new ProfileApiError('用户不存在。');

  const resolvedUsername = stringValue(profileRow.username);
  const isOwnProfile = resolvedUsername === stringValue(viewerRows[0]?.username);
  const [postRows, replyRows, favoriteRows] = await Promise.all([
    requestRows({ ask: 'recentpost', limit: 'all', view: resolvedUsername }, signal),
    requestRows({ ask: 'recentreply', limit: 'all', view: resolvedUsername }, signal),
    isOwnProfile ? requestRows({ ask: 'favorite_list', limit: 'all' }, signal) : Promise.resolve([]),
  ]);

  return {
    isOwnProfile,
    profile: mapProfile(profileRow, {
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

export async function updateProfileSignatures(signatures: ProfileRecord[]) {
  const row = await fetchCurrentUserRow();
  await editUser(row, { signatures });
}

export async function updateProfileAvatar(avatarSrc: string) {
  const row = await fetchCurrentUserRow();
  let icon = stringValue(row.icon);

  if (avatarSrc === defaultAvatar || !avatarSrc.trim()) {
    icon = '';
  } else if (avatarSrc.startsWith('data:image/')) {
    icon = await uploadAvatarDataUrl(avatarSrc);
  }

  await editUser(row, { icon });
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
  const rows = await requestRows({ ask: 'currentUserInfo' }, signal);
  const row = rows[0];
  if (!row || !stringValue(row.username)) throw new ProfileApiError('请先登录后查看个人中心。');
  return row;
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

  await requestData({
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
  });
}

async function uploadAvatarDataUrl(dataUrl: string) {
  const blob = await fetch(dataUrl).then((response) => response.blob());
  const body = new FormData();
  body.set('file', new File([blob], 'avatar.png', { type: 'image/png' }));

  let response: Response;
  try {
    response = await fetch(AVATAR_UPLOAD_URL, {
      body,
      credentials: 'include',
      method: 'POST',
    });
  } catch {
    throw new ProfileApiError('头像上传失败，请稍后重试。');
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ProfileApiError('头像上传服务返回了无法识别的数据。');
  }

  if (!response.ok || !isApiRow(payload) || Number(payload.code) !== 0 || !stringValue(payload.url)) {
    throw new ProfileApiError(isApiRow(payload) ? stringValue(payload.msg) || '头像上传失败。' : '头像上传失败。');
  }

  return stringValue(payload.url);
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
    favoriteRows,
    includeSignatures,
    postRows,
    replyRows,
  }: {
    favoriteRows: ApiRow[];
    includeSignatures: boolean;
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
  const signatures = includeSignatures ? mapSignatures(row) : [];
  const records: ProfileRecordMap = {
    activities: [],
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

  return {
    avatarSrc: normalizeAvatar(row.icon),
    counts: {
      activities: 0,
      bookmarks: bookmarks.length,
      drafts: 0,
      posts: posts.length,
      replies: replies.length,
      signatures: signatures.filter((signature) => signature.excerpt.trim()).length,
    },
    details,
    emailVerified: truthyFlag(row.verified),
    emailVisible: truthyFlag(row.email_visible),
    id: username,
    intro: stringValue(row.intro),
    rating: Math.max(0, Math.min(5, numberValue(row.star))),
    records,
    slug: username,
    stats: [
      { label: '发帖数', value: numberValue(row.post) },
      { label: '签到数', value: numberValue(row.sign) },
      { label: '上次在线', value: formatProfileDate(row.lastdate) },
      { label: '权限值', value: numberValue(row.rights) },
      { label: '回复数', value: numberValue(row.reply) },
      { label: '灌水数', value: numberValue(row.water) },
      { label: '注册时间', value: formatProfileDate(row.regdate) },
      { label: '精品数', value: numberValue(row.extr ?? row.digest ?? row.digests) },
    ],
  };
}

function mapRecord(row: ApiRow, kind: 'bookmark' | 'post' | 'reply'): ProfileRecord | null {
  const bid = numberValue(row.bid);
  const tid = numberValue(row.tid);
  const pid = numberValue(row.pid);
  const title = plainText(row.title);
  if (!bid || !tid || !title) return null;

  const floor = kind === 'reply' && pid > 0 ? pid : null;
  const page = floor ? Math.max(1, Math.ceil(floor / 12)) : 1;
  const floorHash = floor ? `#floor-${floor}` : '';
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
  const avatar = stringValue(value);
  if (!avatar) return defaultAvatar;
  if (/^(?:data:image\/|https?:\/\/)/i.test(avatar)) return avatar;
  if (avatar.startsWith('//')) return `https:${avatar}`;
  if (avatar.includes('user_upload_by_day/')) {
    return avatar.startsWith('/bbsimg/') ? avatar : `/bbsimg/icons/${avatar.replace(/^\.?\//, '')}`;
  }
  if (avatar.startsWith('/')) return `${PUBLIC_ASSET_ORIGIN}${avatar}`;
  if (/^\d+$/.test(avatar)) return `${PUBLIC_ASSET_ORIGIN}/bbsimg/i/${avatar}.gif`;
  return `${PUBLIC_ASSET_ORIGIN}/bbsimg/icons/${avatar.replace(/^\.?\//, '')}`;
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
