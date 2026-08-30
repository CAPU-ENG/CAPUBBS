export const FORUM_MODE_COOKIE_NAME = 'capubbs_forum_mode';
export const FORUM_MODE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ForumMode = 'new' | 'legacy';

export function createForumModeCookie(mode: ForumMode, secure: boolean) {
  const secureAttribute = secure ? '; Secure' : '';
  return `${FORUM_MODE_COOKIE_NAME}=${mode}; Path=/; Max-Age=${FORUM_MODE_COOKIE_MAX_AGE}; SameSite=Lax${secureAttribute}`;
}

export function getForumModeFromCookieHeader(cookieHeader: string | undefined): ForumMode | null {
  const value = getCookieValue(cookieHeader, FORUM_MODE_COOKIE_NAME);
  return value === 'new' || value === 'legacy' ? value : null;
}

export function shouldInitializeLegacyForum(cookieHeader: string | undefined) {
  return getCookieValue(cookieHeader, FORUM_MODE_COOKIE_NAME) === null
    && Boolean(getCookieValue(cookieHeader, 'token'));
}

export function resolveForumMode(cookieHeader: string | undefined): ForumMode {
  return getForumModeFromCookieHeader(cookieHeader)
    ?? (shouldInitializeLegacyForum(cookieHeader) ? 'legacy' : 'new');
}

function getCookieValue(cookieHeader: string | undefined, cookieName: string) {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex < 0) continue;
    const name = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (name === cookieName) return value;
  }

  return null;
}
