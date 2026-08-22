const LOCAL_ORIGIN = 'http://capubbs.local';
export const FORUM_LOCATION_CHANGE_EVENT = 'capubbs:location-change';

export function getLoginPathWithReturnTo() {
  const returnTo = getSafeReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);
  return returnTo === '/' ? '/login' : `/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export function getRegisterPathWithReturnTo() {
  const returnTo = getSafeReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);
  return getAuthPathWithReturnTo('/register', returnTo);
}

export function getAuthPathWithReturnTo(path: '/login' | '/register', returnTo: string) {
  const safeReturnTo = getSafeReturnTo(returnTo);
  return safeReturnTo === '/' ? path : `${path}?returnTo=${encodeURIComponent(safeReturnTo)}`;
}

export function getAuthReturnTo(search: string) {
  return getSafeReturnTo(new URLSearchParams(search).get('returnTo'));
}

export function replaceForumLocation(href: string) {
  window.history.replaceState(null, '', getSafeReturnTo(href));
  window.dispatchEvent(new Event(FORUM_LOCATION_CHANGE_EVENT));
}

function getSafeReturnTo(value: string | null | undefined) {
  if (!value?.startsWith('/') || value.startsWith('//')) return '/';

  try {
    const url = new URL(value, LOCAL_ORIGIN);
    if (url.origin !== LOCAL_ORIGIN || url.pathname === '/login' || url.pathname === '/register') return '/';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}
