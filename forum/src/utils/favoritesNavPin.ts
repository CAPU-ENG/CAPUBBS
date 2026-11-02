export const FAVORITES_NAV_PIN_STORAGE_KEY = 'capubbs-favorites-nav-pinned';
export const FAVORITES_NAV_PIN_CHANGE_EVENT = 'capubbs-favorites-nav-pin-change';

export function readFavoritesNavPinned() {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(FAVORITES_NAV_PIN_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveFavoritesNavPinned(pinned: boolean) {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(FAVORITES_NAV_PIN_STORAGE_KEY, String(pinned));
  } catch {
    return false;
  }

  window.dispatchEvent(new Event(FAVORITES_NAV_PIN_CHANGE_EVENT));
  return true;
}

export function subscribeFavoritesNavPinned(listener: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === FAVORITES_NAV_PIN_STORAGE_KEY) listener();
  };

  window.addEventListener(FAVORITES_NAV_PIN_CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(FAVORITES_NAV_PIN_CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}
