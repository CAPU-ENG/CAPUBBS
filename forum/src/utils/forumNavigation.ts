import {
  isTrustedForumUrl,
  translateLegacyForumPageHref,
  translateLegacyForumThreadHref,
} from './legacyForumRoutes.ts';
import { USER_CENTER_PATH } from './userRoutes.ts';

export const FORUM_APP_EXACT_PATHS = [
  '/',
  '/login',
  '/register',
  '/search',
  '/settings',
  '/calendar-admin',
  '/manage',
  '/data',
  '/activity-management',
  '/archive-room',
  '/post',
  '/bbs/post',
  '/bbs/post/index.php',
  '/editpid',
  '/bbs/editpid',
  '/bbs/editpid/index.php',
  USER_CENTER_PATH,
  '/users',
] as const;

export const FORUM_APP_PATH_PREFIXES = ['/users/'] as const;

export const LEGACY_FORUM_EXACT_PATHS = [
  '/thread.php',
  '/bbs/content',
  '/bbs/content/index.php',
  '/cgi-bin/bbs.pl',
  '/bbs',
  '/bbs/index',
  '/bbs/index/index.php',
  '/bbs/main',
  '/bbs/main/index.php',
  '/bbs/user',
  '/bbs/user/index.php',
  '/bbs/home',
  '/bbs/home/index.php',
  '/bbs/favorite',
  '/bbs/favorite/index.php',
  '/bbs/search',
  '/bbs/search/index.php',
  '/bbs/login',
  '/bbs/login/index.php',
  '/bbs/register',
  '/bbs/register/index.php',
  '/bbs/manage',
  '/bbs/manage/index.php',
  '/bbs/data',
  '/bbs/data/index.php',
  '/bbs/settings',
  '/bbs/settings/index.php',
] as const;

export const LEGACY_FORUM_PATH_PATTERNS = ['^/threads/\\d+-\\d+$'] as const;

export function resolveForumAppRoute(value: string, currentUrl: string) {
  const legacyThreadRoute = translateLegacyForumThreadHref(value, currentUrl);
  if (legacyThreadRoute) return legacyThreadRoute;

  const legacyPageRoute = translateLegacyForumPageHref(value, currentUrl);
  if (legacyPageRoute) return legacyPageRoute;

  let url: URL;
  let baseUrl: URL;
  try {
    baseUrl = new URL(currentUrl);
    url = new URL(value.trim().replace(/&amp;/gi, '&'), baseUrl);
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(url.protocol) || !isTrustedForumUrl(url, baseUrl)) return null;
  const pathname = stripKnownForumMountPrefix(normalizePathname(url.pathname));
  if (!isForumAppPath(pathname)) return null;
  return `${pathname}${url.search}${url.hash}`;
}

export function isForumAppPath(pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  return FORUM_APP_EXACT_PATHS.some((path) => path === normalizedPath)
    || FORUM_APP_PATH_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix));
}

function stripKnownForumMountPrefix(pathname: string) {
  for (const prefix of ['/bbs-new', '/capubbs-new']) {
    if (pathname === prefix) return '/';
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  }
  return pathname;
}

function normalizePathname(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
}
