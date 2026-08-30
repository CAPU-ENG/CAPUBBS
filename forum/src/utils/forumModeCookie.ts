export const FORUM_MODE_COOKIE_NAME = 'capubbs_forum_mode';
export const FORUM_MODE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ForumMode = 'new' | 'legacy';

export function createForumModeCookie(mode: ForumMode, secure: boolean) {
  const secureAttribute = secure ? '; Secure' : '';
  return `${FORUM_MODE_COOKIE_NAME}=${mode}; Path=/; Max-Age=${FORUM_MODE_COOKIE_MAX_AGE}; SameSite=Lax${secureAttribute}`;
}

export function getForumModeFromCookieHeader(cookieHeader: string | undefined): ForumMode | null {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex < 0) continue;
    const name = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (name === FORUM_MODE_COOKIE_NAME && (value === 'new' || value === 'legacy')) return value;
  }

  return null;
}
