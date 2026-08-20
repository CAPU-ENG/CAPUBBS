const LEGACY_CONTENT_BASE_URL = 'https://chexie.net/bbs/content/';
const LEGACY_THREAD_PAGE_SIZE = 12;
const KNOWN_FORUM_MOUNT_PREFIXES = ['/bbs-new', '/capubbs-new'];
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
  return `/?${params.toString()}${floor ? `#${floor}` : ''}`;
}

function getLegacyContentTarget(searchParams: URLSearchParams) {
  const bid = getPositiveInteger(searchParams.get('bid'));
  const tid = getPositiveInteger(searchParams.get('tid'));
  return bid && tid ? { bid, tid } : null;
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

function isTrustedForumUrl(url: URL, baseUrl: URL) {
  if (url.origin === baseUrl.origin) return true;
  const hostname = url.hostname.toLowerCase();
  return hostname === 'chexie.net' || hostname.endsWith('.chexie.net');
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
