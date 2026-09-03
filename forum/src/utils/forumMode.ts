import { createForumModeCookie, type ForumMode } from './forumModeCookie.ts';

export const SHARED_FORUM_ENTRY_PATH = '/bbs/';
export {
  createForumModeCookie,
  FORUM_MODE_COOKIE_MAX_AGE,
  FORUM_MODE_COOKIE_NAME,
  getForumModeFromCookieHeader,
  resolveForumMode,
  shouldInitializeLegacyForum,
  type ForumMode,
} from './forumModeCookie.ts';

export function saveForumMode(mode: ForumMode) {
  document.cookie = createForumModeCookie(mode, window.location.protocol === 'https:');
}
