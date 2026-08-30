export const FORUM_BASE_PATH = '/bbs';
export const FORUM_BASE_URL = `${FORUM_BASE_PATH}/`;
const LEGACY_FORUM_BASE_PATH = '/forum';

export function toForumHref(route: string) {
  let value = route.trim();
  if (!value) return FORUM_BASE_URL;
  if (value.startsWith('#')) return value;
  if (!value.startsWith('/') || value.startsWith('//')) return value;
  if (
    value === LEGACY_FORUM_BASE_PATH
    || value.startsWith(`${LEGACY_FORUM_BASE_PATH}/`)
    || value.startsWith(`${LEGACY_FORUM_BASE_PATH}?`)
    || value.startsWith(`${LEGACY_FORUM_BASE_PATH}#`)
  ) {
    value = value.slice(LEGACY_FORUM_BASE_PATH.length) || '/';
  }
  if (
    value === FORUM_BASE_PATH
    || value.startsWith(`${FORUM_BASE_PATH}/`)
    || value.startsWith(`${FORUM_BASE_PATH}?`)
    || value.startsWith(`${FORUM_BASE_PATH}#`)
  ) return value;

  return value === '/' ? FORUM_BASE_URL : `${FORUM_BASE_PATH}${value}`;
}

export function stripForumBasePath(pathname: string) {
  if (pathname === FORUM_BASE_PATH || pathname === FORUM_BASE_URL) return '/';
  if (pathname.startsWith(`${FORUM_BASE_PATH}/`)) {
    return pathname.slice(FORUM_BASE_PATH.length) || '/';
  }
  if (pathname === LEGACY_FORUM_BASE_PATH || pathname === `${LEGACY_FORUM_BASE_PATH}/`) return '/';
  if (pathname.startsWith(`${LEGACY_FORUM_BASE_PATH}/`)) {
    return pathname.slice(LEGACY_FORUM_BASE_PATH.length) || '/';
  }
  return pathname;
}
