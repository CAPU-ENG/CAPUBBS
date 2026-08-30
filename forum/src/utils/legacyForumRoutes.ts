import { toForumHref } from './forumBasePath.ts';

const LEGACY_CONTENT_BASE_URL = 'https://chexie.net/bbs/content/';
const LEGACY_THREAD_PAGE_SIZE = 12;
const KNOWN_FORUM_MOUNT_PREFIXES = ['/forum', '/bbs-new', '/capubbs-new'];
const LEGACY_CGI_BOARD_IDS: Record<string, number> = {
  acad: 5,
  act: 1,
  asso: 6,
  bike: 3,
  capu: 2,
  race: 9,
  skill: 7,
  water: 4,
};

/**
 * Converts a trusted legacy CAPUBBS thread URL into the query route used by the
 * current forum app. Non-thread and untrusted external links return null.
 */
export function translateLegacyForumThreadHref(
  value: string,
  currentUrl = LEGACY_CONTENT_BASE_URL,
) {
  const href = value.trim().replace(/&amp;/gi, '&');
  if (!href) return null;

  const normalizedHref = /^(?:www\.)?chexie\.net\//i.test(href) ? `https://${href}` : href;
  const isRelativeHref = isRelativeNavigationHref(normalizedHref);

  let url: URL;
  let baseUrl: URL;
  try {
    baseUrl = new URL(currentUrl, LEGACY_CONTENT_BASE_URL);
    url = new URL(normalizedHref, baseUrl);
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(url.protocol)) return null;
  if (!isRelativeHref && !isTrustedForumUrl(url, baseUrl)) return null;

  const pathname = stripKnownForumMountPrefix(normalizePathname(url.pathname));
  const target = pathname === '/cgi-bin/bbs.pl'
    ? getLegacyCgiTarget(url.searchParams)
    : isLegacyThreadPath(pathname)
      ? getLegacyContentTarget(url.searchParams)
      : getThreadPathTarget(pathname);
  if (!target) return null;

  const floor = getPositiveInteger(url.searchParams.get('pid'))
    ?? getPositiveInteger(url.searchParams.get('floor'))
    ?? getLegacyFloorFromHash(url.hash);
  const requestedPage = getPositiveInteger(url.searchParams.get('p'))
    ?? getPositiveInteger(url.searchParams.get('page'));
  const page = requestedPage ?? (floor ? Math.ceil(floor / LEGACY_THREAD_PAGE_SIZE) : 1);
  const params = new URLSearchParams({
    bid: String(target.bid),
    tid: String(target.tid),
    p: String(page),
  });

  if (url.searchParams.get('see_lz')) params.set('see_lz', '1');
  return toForumHref(`/?${params.toString()}${floor ? `#${floor}` : ''}`);
}

/**
 * Converts trusted legacy CAPUBBS page URLs into their current forum routes.
 * Thread URLs remain the responsibility of translateLegacyForumThreadHref.
 */
export function translateLegacyForumPageHref(
  value: string,
  currentUrl = LEGACY_CONTENT_BASE_URL,
) {
  const href = value.trim().replace(/&amp;/gi, '&');
  if (!href) return null;

  const normalizedHref = /^(?:www\.)?chexie\.net\//i.test(href) ? `https://${href}` : href;
  const isRelativeHref = isRelativeNavigationHref(normalizedHref);

  let url: URL;
  let baseUrl: URL;
  try {
    baseUrl = new URL(currentUrl, LEGACY_CONTENT_BASE_URL);
    url = new URL(normalizedHref, baseUrl);
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(url.protocol)) return null;
  if (!isRelativeHref && !isTrustedForumUrl(url, baseUrl)) return null;

  const pathname = stripKnownForumMountPrefix(normalizePathname(url.pathname));
  if (isLegacyForumHomePath(pathname)) return toForumHref('/');
  if (isLegacyBoardPath(pathname)) return getLegacyBoardRoute(url.searchParams);
  if (isLegacyProfilePath(pathname)) return getLegacyProfileRoute(url.searchParams);
  if (isLegacyUserCenterPath(pathname)) return appendSearchAndHash('/home', url);
  if (isLegacyFavoritesPath(pathname)) return toForumHref('/home?tab=bookmarks');
  if (isLegacySearchPath(pathname)) return appendSearchAndHash('/search', url);
  if (isLegacyLoginPath(pathname)) return toForumHref('/login');
  if (isLegacyRegisterPath(pathname)) return toForumHref('/register');
  if (isLegacyManagementPath(pathname)) return toForumHref('/manage');
  if (isLegacyDataPath(pathname)) return appendSearchAndHash('/data', url);
  if (isLegacySettingsPath(pathname)) return appendSearchAndHash('/settings', url);
  return null;
}

export function isTrustedForumUrl(url: URL, baseUrl: URL) {
  if (url.origin === baseUrl.origin) return true;
  const hostname = url.hostname.toLowerCase();
  return hostname === 'chexie.net' || hostname.endsWith('.chexie.net');
}

function getLegacyContentTarget(searchParams: URLSearchParams) {
  const bid = getPositiveInteger(searchParams.get('bid'));
  const tid = getPositiveInteger(searchParams.get('tid'));
  return bid && tid ? { bid, tid } : null;
}

function getLegacyBoardRoute(searchParams: URLSearchParams) {
  const bid = getPositiveInteger(searchParams.get('bid') ?? searchParams.get('board'));
  if (!bid) return null;

  const params = new URLSearchParams({ bid: String(bid) });
  const page = getPositiveInteger(searchParams.get('p') ?? searchParams.get('page'));
  if (page && page > 1) params.set('p', String(page));
  if (searchParams.get('extr') === '1' || searchParams.get('digest') === '1') params.set('digest', '1');
  return toForumHref(`/?${params.toString()}`);
}

function getLegacyProfileRoute(searchParams: URLSearchParams) {
  const name = searchParams.get('name')?.trim()
    || searchParams.get('user')?.trim()
    || searchParams.get('view')?.trim();
  return toForumHref(name ? `/users/${encodeURIComponent(name)}` : '/users');
}

function getLegacyCgiTarget(searchParams: URLSearchParams) {
  const explicitBid = getPositiveInteger(searchParams.get('b'));
  const boardKey = searchParams.get('id')?.trim().toLowerCase() ?? '';
  const bid = explicitBid ?? LEGACY_CGI_BOARD_IDS[boardKey] ?? null;
  const tid = getLegacyCgiThreadId(searchParams.get('see'));
  return bid && tid ? { bid, tid } : null;
}

function getThreadPathTarget(pathname: string) {
  const match = pathname.match(/^\/threads\/(\d+)-(\d+)$/i);
  if (!match) return null;

  const bid = getPositiveInteger(match[1]);
  const tid = getPositiveInteger(match[2]);
  return bid && tid ? { bid, tid } : null;
}

function getLegacyCgiThreadId(value: string | null) {
  const see = value?.trim().toLowerCase() ?? '';
  if (!/^[a-z]{4}$/.test(see)) return null;

  return 1
    + getLetterOffset(see, 0) * 26 * 26 * 26
    + getLetterOffset(see, 1) * 26 * 26
    + getLetterOffset(see, 2) * 26
    + getLetterOffset(see, 3);
}

function getLetterOffset(value: string, index: number) {
  return value.charCodeAt(index) - 'a'.charCodeAt(0);
}

function getLegacyFloorFromHash(hash: string) {
  const decodedHash = safeDecodeURIComponent(hash.replace(/^#/, '').trim());
  const match = decodedHash.match(/^(?:floor-|pid)?(\d+)[\p{P}\s]*$/iu);
  return match ? getPositiveInteger(match[1]) : null;
}

function getPositiveInteger(value: string | null) {
  if (!value || !/^\d+$/.test(value.trim())) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function isLegacyThreadPath(pathname: string) {
  return pathname === '/thread.php'
    || pathname === '/bbs/content'
    || pathname === '/bbs/content/index.php';
}

function isLegacyForumHomePath(pathname: string) {
  return pathname === '/bbs/index'
    || pathname === '/bbs/index/index.php';
}

function isLegacyBoardPath(pathname: string) {
  return pathname === '/bbs/main'
    || pathname === '/bbs/main/index.php';
}

function isLegacyProfilePath(pathname: string) {
  return pathname === '/bbs/user'
    || pathname === '/bbs/user/index.php';
}

function isLegacyUserCenterPath(pathname: string) {
  return pathname === '/bbs/home'
    || pathname === '/bbs/home/index.php';
}

function isLegacyFavoritesPath(pathname: string) {
  return pathname === '/bbs/favorite'
    || pathname === '/bbs/favorite/index.php';
}

function isLegacySearchPath(pathname: string) {
  return pathname === '/bbs/search'
    || pathname === '/bbs/search/index.php';
}

function isLegacyLoginPath(pathname: string) {
  return pathname === '/bbs/login'
    || pathname === '/bbs/login/index.php';
}

function isLegacyRegisterPath(pathname: string) {
  return pathname === '/bbs/register'
    || pathname === '/bbs/register/index.php';
}

function isLegacyManagementPath(pathname: string) {
  return pathname === '/bbs/manage'
    || pathname === '/bbs/manage/index.php';
}

function isLegacyDataPath(pathname: string) {
  return pathname === '/bbs/data'
    || pathname === '/bbs/data/index.php';
}

function isLegacySettingsPath(pathname: string) {
  return pathname === '/bbs/settings'
    || pathname === '/bbs/settings/index.php';
}

function appendSearchAndHash(pathname: string, url: URL) {
  return toForumHref(`${pathname}${url.search}${url.hash}`);
}

function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/{2,}/g, '/');
  return normalized.length > 1 ? normalized.replace(/\/+$/, '') : normalized;
}

function stripKnownForumMountPrefix(pathname: string) {
  for (const prefix of KNOWN_FORUM_MOUNT_PREFIXES) {
    if (pathname === prefix) return '/';
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  }
  return pathname;
}

function isRelativeNavigationHref(href: string) {
  return !href.startsWith('//') && !/^[a-z][a-z\d+.-]*:/i.test(href);
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
