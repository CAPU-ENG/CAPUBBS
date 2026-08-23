export const AVATAR_FOLLOW_DISABLED_STORAGE_KEY = 'capubbs-avatar-follow-disabled';
export const AVATAR_FOLLOW_CHANGE_EVENT = 'capubbs-avatar-follow-change';

export function readAvatarFollowDisabled() {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(AVATAR_FOLLOW_DISABLED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveAvatarFollowDisabled(disabled: boolean) {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(AVATAR_FOLLOW_DISABLED_STORAGE_KEY, String(disabled));
  } catch {
    return false;
  }

  window.dispatchEvent(new Event(AVATAR_FOLLOW_CHANGE_EVENT));
  return true;
}

export function subscribeAvatarFollow(listener: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === AVATAR_FOLLOW_DISABLED_STORAGE_KEY) listener();
  };

  window.addEventListener(AVATAR_FOLLOW_CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(AVATAR_FOLLOW_CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}
