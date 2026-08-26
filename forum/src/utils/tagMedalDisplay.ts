export const TAG_MEDAL_DISPLAY_ENABLED_STORAGE_KEY = 'capubbs-tag-medal-display-enabled';
export const TAG_MEDAL_DISPLAY_CHANGE_EVENT = 'capubbs-tag-medal-display-change';

export function readTagMedalDisplayEnabled() {
  if (typeof window === 'undefined') return true;

  try {
    const value = window.localStorage.getItem(TAG_MEDAL_DISPLAY_ENABLED_STORAGE_KEY);
    return value === null ? true : value === 'true';
  } catch {
    return true;
  }
}

export function saveTagMedalDisplayEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(TAG_MEDAL_DISPLAY_ENABLED_STORAGE_KEY, String(enabled));
  } catch {
    return false;
  }

  window.dispatchEvent(new Event(TAG_MEDAL_DISPLAY_CHANGE_EVENT));
  return true;
}

export function subscribeTagMedalDisplay(listener: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === TAG_MEDAL_DISPLAY_ENABLED_STORAGE_KEY) listener();
  };

  window.addEventListener(TAG_MEDAL_DISPLAY_CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(TAG_MEDAL_DISPLAY_CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}
