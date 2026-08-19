import { normalizeLegacyAvatar } from '../utils/legacyAssets';

const AUTH_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';
const TOKEN_MAX_AGE_SECONDS = 999999;
const PRODUCTION_COOKIE_DOMAIN = 'chexie.net';

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

type ApiRow = Record<string, unknown>;

export type SessionViewer = {
  avatar: string;
  rights: number;
  unreadMessages: number;
  username: string;
};

class AuthApiError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
  }
}

export async function fetchSessionViewer(signal?: AbortSignal): Promise<SessionViewer | null> {
  try {
    const data = await requestAuthApi({ ask: 'currentUserInfo' }, signal);
    const row = asRows(data)[0];
    return row ? mapViewer(row) : null;
  } catch (error) {
    if (error instanceof AuthApiError && (error.code === 1000 || error.code === 1001)) return null;
    throw error;
  }
}

export async function loginSession(username: string, passwordHash: string) {
  const data = await requestAuthApi({
    ask: 'login',
    browser: navigator.userAgent,
    onlinetype: 'web',
    password: passwordHash,
    username,
  });
  const loginRow = asRows(data)[0];
  const legacyCode = stringValue(loginRow?.code);

  if (legacyCode && legacyCode !== '0') {
    throw new AuthApiError(stringValue(loginRow?.msg) || 'ID 或密码不正确。', Number(legacyCode) || 4000);
  }

  const token = stringValue(loginRow?.token);

  if (!token) throw new AuthApiError('登录成功，但没有收到有效会话。', 4000);
  writeTokenCookie(token);

  const viewer = await fetchSessionViewer();
  if (viewer) return viewer;

  const fallbackUsername = stringValue(loginRow?.username) || username;

  return {
    avatar: await fetchPublicAvatar(fallbackUsername),
    rights: 0,
    unreadMessages: 0,
    username: fallbackUsername,
  };
}

export async function logoutSession() {
  try {
    await requestAuthApi({ ask: 'logout' });
  } finally {
    clearTokenCookie();
  }
}

async function requestAuthApi(params: Record<string, string>, signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(AUTH_API_URL, {
      body: new URLSearchParams(params),
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
    throw new AuthApiError('暂时无法连接登录服务，请稍后重试。', 4000);
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new AuthApiError('登录服务返回了无法识别的数据。', response.status || 4000);
  }

  if (!response.ok || payload.code !== 0) {
    throw new AuthApiError(payload.message?.trim() || '登录服务暂时不可用。', payload.code || response.status);
  }

  return payload.data;
}

async function fetchPublicAvatar(username: string) {
  try {
    const data = await requestAuthApi({ ask: 'user_profile', username });
    return normalizeLegacyAvatar(asRows(data)[0]?.icon);
  } catch {
    return '';
  }
}

function mapViewer(row: ApiRow): SessionViewer | null {
  const username = stringValue(row.username);
  if (!username) return null;

  return {
    avatar: normalizeLegacyAvatar(row.icon),
    rights: toNumber(row.rights),
    unreadMessages: toNumber(row.newmsg),
    username,
  };
}

function asRows(value: unknown): ApiRow[] {
  if (Array.isArray(value)) return value.filter(isRow);
  return isRow(value) ? [value] : [];
}

function isRow(value: unknown): value is ApiRow {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function writeTokenCookie(token: string) {
  const domain = sharedCookieDomain();
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const attributes = `path=/; max-age=${TOKEN_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;

  // Remove a host-only token left by an earlier frontend build before writing
  // the shared-domain cookie used by the legacy forum.
  expireTokenCookie('', secure);
  document.cookie = `token=${encodeURIComponent(token)}; ${attributes}${domain ? `; domain=${domain}` : ''}`;
}

function clearTokenCookie() {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  expireTokenCookie('', secure);

  const domain = sharedCookieDomain();
  if (domain) expireTokenCookie(domain, secure);
}

function expireTokenCookie(domain: string, secure: string) {
  document.cookie = `token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure}${domain ? `; domain=${domain}` : ''}`;
}

function sharedCookieDomain() {
  const configuredDomain = import.meta.env.VITE_COOKIE_DOMAIN?.trim().replace(/^\./, '');
  const hostname = window.location.hostname.toLowerCase();
  const domain = configuredDomain || PRODUCTION_COOKIE_DOMAIN;

  return hostname === domain || hostname.endsWith(`.${domain}`) ? domain : '';
}
