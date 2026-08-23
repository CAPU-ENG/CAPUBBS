export const AUTHOR_PROFILE_ENABLED_STORAGE_KEY = 'capubbs-author-profile-enabled';
export const AUTHOR_PROFILE_CHANGE_EVENT = 'capubbs-author-profile-change';

export function readAuthorProfileEnabled() {
  if (typeof window === 'undefined') return true;

  try {
    const value = window.localStorage.getItem(AUTHOR_PROFILE_ENABLED_STORAGE_KEY);
    return value === null ? true : value === 'true';
  } catch {
    return true;
  }
}

export function saveAuthorProfileEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(AUTHOR_PROFILE_ENABLED_STORAGE_KEY, String(enabled));
  } catch {
    return false;
  }

  window.dispatchEvent(new Event(AUTHOR_PROFILE_CHANGE_EVENT));
  return true;
}

export function subscribeAuthorProfile(listener: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === AUTHOR_PROFILE_ENABLED_STORAGE_KEY) listener();
  };

  window.addEventListener(AUTHOR_PROFILE_CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(AUTHOR_PROFILE_CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}
