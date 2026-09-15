import type { ProfileTab } from '../data/profile';
import { stripForumBasePath, toForumHref } from './forumBasePath.ts';

export const PUBLIC_PROFILE_PATH = '/users';
export const USER_CENTER_PATH = '/home';
export const USER_CENTER_HREF = toForumHref(USER_CENTER_PATH);

export function getProfileTabHref(overviewHref: string, tab: ProfileTab) {
  const url = new URL(overviewHref, 'http://capubbs.local');
  url.searchParams.set('tab', tab);
  url.searchParams.delete('page');
  return `${url.pathname}${url.search}`;
}

export function getProfileTabFromLocation(pathname: string, search: string, allowedTabs: ProfileTab[]) {
  const requested = new URLSearchParams(search).get('tab') as ProfileTab | null;
  if (requested) return allowedTabs.includes(requested) ? requested : null;
  const path = stripForumBasePath(pathname).replace(/\/+$/, '');
  return (path === '/favorite' || path === '/favorite/index.php') && allowedTabs.includes('bookmarks')
    ? 'bookmarks' : null;
}

export function getPublicProfilePath(userId: string | null | undefined) {
  const normalizedUserId = normalizeProfileName(userId);

  if (!normalizedUserId) {
    return toForumHref(PUBLIC_PROFILE_PATH);
  }

  return toForumHref(`${PUBLIC_PROFILE_PATH}/${encodeURIComponent(normalizedUserId)}`);
}

export function getPublicProfileAppPath(userId: string | null | undefined) {
  return getPublicProfilePath(userId);
}

export function getPublicProfileNameFromLocation(pathname: string, search: string) {
  if (!isPublicProfilePath(pathname)) {
    return null;
  }

  const name = normalizeProfileName(new URLSearchParams(search).get('name'));

  if (name) {
    return name;
  }

  if (pathname.startsWith(`${PUBLIC_PROFILE_PATH}/`)) {
    const userSlug = pathname.slice(`${PUBLIC_PROFILE_PATH}/`.length).split('/')[0];
    if (!userSlug) return null;
    try {
      return decodeURIComponent(userSlug);
    } catch {
      return null;
    }
  }

  return null;
}

function isPublicProfilePath(pathname: string) {
  return (
    pathname === PUBLIC_PROFILE_PATH ||
    pathname.startsWith(`${PUBLIC_PROFILE_PATH}/`)
  );
}

function normalizeProfileName(userId: string | null | undefined) {
  return userId?.trim() ?? '';
}
