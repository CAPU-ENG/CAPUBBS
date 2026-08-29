export const FORUM_BASE_PATH = '/forum';
export const FORUM_BASE_URL = `${FORUM_BASE_PATH}/`;

export function toForumHref(route: string) {
  const value = route.trim();
  if (!value) return FORUM_BASE_URL;
  if (value.startsWith('#')) return value;
  if (!value.startsWith('/') || value.startsWith('//')) return value;
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
  return pathname;
}
