/** Canonical page URLs for the new UI. Public profiles and action URLs are out of scope. */
export function canonicalizeForumPageRoute(route: string) {
  if (!route.startsWith('/') || route.startsWith('//')) return route;
  const url = new URL(route, 'http://capubbs.local');
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const params = url.searchParams;
  let destination: string;
  if (path === '/bbs' || path === '/bbs/index' || path === '/bbs/index/index.php') {
    if (path !== '/bbs') destination = '/bbs/index/';
    else if (params.has('tid') || params.has('thread')) destination = '/bbs/content/';
    else if (params.has('bid') || params.has('board')) destination = '/bbs/main/';
    else destination = '/bbs/index/';
  } else if (path === '/bbs/main' || path === '/bbs/main/index.php') {
    destination = '/bbs/main/';
  } else if (path === '/bbs/content' || path === '/bbs/content/index.php' || path === '/bbs/thread.php') {
    destination = '/bbs/content/';
  } else {
    return route;
  }

  const aliases = destination === '/bbs/main/'
    ? [['board', 'bid'], ['page', 'p'], ['digest', 'extr']]
    : destination === '/bbs/content/'
      ? [['board', 'bid'], ['thread', 'tid'], ['page', 'p']]
      : [];
  let changedParams = false;
  for (const [alias, canonical] of aliases) {
    if (!params.has(alias)) continue;
    if (!params.has(canonical)) params.set(canonical, params.get(alias)!);
    params.delete(alias);
    changedParams = true;
  }
  // Preserve existing query encoding and unknown parameters whenever possible.
  const search = changedParams ? (params.size ? `?${params.toString()}` : '') : url.search;
  return `${destination}${search}${url.hash}`;
}

/** Replace aliases without adding an extra entry to the back-button history. */
export function replaceAliasedForumLocation(
  location: { pathname: string; search: string; hash: string },
  history: { state: unknown; replaceState(data: unknown, unused: string, url: string): void },
) {
  const current = `${location.pathname}${location.search}${location.hash}`;
  const canonical = canonicalizeForumPageRoute(current);
  if (canonical !== current) history.replaceState(history.state, '', canonical);
}
