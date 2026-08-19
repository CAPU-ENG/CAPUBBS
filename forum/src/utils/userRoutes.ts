export const PUBLIC_PROFILE_PATH = '/users';

export function getPublicProfilePath(userId: string | null | undefined) {
  const normalizedUserId = normalizeProfileName(userId);

  if (!normalizedUserId) {
    return PUBLIC_PROFILE_PATH;
  }

  return `${PUBLIC_PROFILE_PATH}/${encodeURIComponent(normalizedUserId)}`;
}

export function getPublicProfileAppPath(userId: string | null | undefined, baseUrl = import.meta.env.BASE_URL) {
  return `${normalizeBasePath(baseUrl)}${getPublicProfilePath(userId)}`;
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

function normalizeBasePath(baseUrl: string) {
  if (!baseUrl || baseUrl === '/') {
    return '';
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}
