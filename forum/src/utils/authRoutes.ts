import { FORUM_BASE_URL, stripForumBasePath, toForumHref } from './forumBasePath.ts';

const LOCAL_ORIGIN = 'http://capubbs.local';
export const FORUM_LOCATION_CHANGE_EVENT = 'capubbs:location-change';

export function getLoginPathWithReturnTo() {
  const returnTo = getSafeReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);
  const loginPath = toForumHref('/login');
  return returnTo === FORUM_BASE_URL ? loginPath : `${loginPath}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function getRegisterPathWithReturnTo() {
  const returnTo = getSafeReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);
  return getAuthPathWithReturnTo('/register', returnTo);
}

export function getAuthPathWithReturnTo(path: '/login' | '/register', returnTo: string) {
  const safeReturnTo = getSafeReturnTo(returnTo);
  const authPath = toForumHref(path);
  return safeReturnTo === FORUM_BASE_URL ? authPath : `${authPath}?returnTo=${encodeURIComponent(safeReturnTo)}`;
}

export function getAuthReturnTo(search: string) {
  return getSafeReturnTo(new URLSearchParams(search).get('returnTo'));
}

export function replaceForumLocation(href: string) {
  window.history.replaceState(null, '', getSafeReturnTo(href));
  window.dispatchEvent(new Event(FORUM_LOCATION_CHANGE_EVENT));
}

function getSafeReturnTo(value: string | null | undefined) {
  if (!value?.startsWith('/') || value.startsWith('//')) return FORUM_BASE_URL;

  try {
    const url = new URL(value, LOCAL_ORIGIN);
    const pathname = stripForumBasePath(url.pathname);
    if (url.origin !== LOCAL_ORIGIN || pathname === '/login' || pathname === '/register') return FORUM_BASE_URL;
    return toForumHref(`${pathname}${url.search}${url.hash}`);
  } catch {
    return FORUM_BASE_URL;
  }
}
