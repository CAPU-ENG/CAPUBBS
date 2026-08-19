const LOCAL_ORIGIN = 'http://capubbs.local';

export function getLoginPathWithReturnTo() {
  const returnTo = getSafeReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);
  return returnTo === '/' ? '/login' : `/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export function getAuthReturnTo(search: string) {
  return getSafeReturnTo(new URLSearchParams(search).get('returnTo'));
}

function getSafeReturnTo(value: string | null | undefined) {
  if (!value?.startsWith('/') || value.startsWith('//')) return '/';

  try {
    const url = new URL(value, LOCAL_ORIGIN);
    if (url.origin !== LOCAL_ORIGIN || url.pathname === '/login') return '/';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}
