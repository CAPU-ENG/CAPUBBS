export const TOP_BAR_AUTO_HIDE_STORAGE_KEY = 'capubbs-top-bar-auto-hide-enabled';
export const TOP_BAR_AUTO_HIDE_CHANGE_EVENT = 'capubbs-top-bar-auto-hide-change';

export function readTopBarAutoHideEnabled() {
  if (typeof window === 'undefined') return true;

  try {
    const value = window.localStorage.getItem(TOP_BAR_AUTO_HIDE_STORAGE_KEY);
    return value === null ? true : value === 'true';
  } catch {
    return true;
  }
}

export function saveTopBarAutoHideEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(TOP_BAR_AUTO_HIDE_STORAGE_KEY, String(enabled));
  } catch {
    return false;
  }

  window.dispatchEvent(new Event(TOP_BAR_AUTO_HIDE_CHANGE_EVENT));
  return true;
}

export function subscribeTopBarAutoHide(listener: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === TOP_BAR_AUTO_HIDE_STORAGE_KEY) listener();
  };

  window.addEventListener(TOP_BAR_AUTO_HIDE_CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(TOP_BAR_AUTO_HIDE_CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}
