export const COMPACT_MODE_STORAGE_KEY = 'capubbs-compact-mode';
export const COMPACT_MODE_CHANGE_EVENT = 'capubbs-compact-mode-change';

export function readCompactMode() {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(COMPACT_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveCompactMode(compactMode: boolean) {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(COMPACT_MODE_STORAGE_KEY, String(compactMode));
  } catch {
    return false;
  }

  window.dispatchEvent(new Event(COMPACT_MODE_CHANGE_EVENT));
  return true;
}

export function subscribeCompactMode(listener: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === COMPACT_MODE_STORAGE_KEY) listener();
  };

  window.addEventListener(COMPACT_MODE_CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(COMPACT_MODE_CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}
