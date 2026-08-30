export const SHARED_FORUM_ENTRY_PATH = '/bbs/';
export const FORUM_MODE_COOKIE_NAME = 'capubbs_forum_mode';
export const FORUM_MODE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ForumMode = 'new' | 'legacy';

export function createForumModeCookie(mode: ForumMode, secure: boolean) {
  const secureAttribute = secure ? '; Secure' : '';
  return `${FORUM_MODE_COOKIE_NAME}=${mode}; Path=/; Max-Age=${FORUM_MODE_COOKIE_MAX_AGE}; SameSite=Lax${secureAttribute}`;
}

export function saveForumMode(mode: ForumMode) {
  document.cookie = createForumModeCookie(mode, window.location.protocol === 'https:');
}
