export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'capubbs-theme';
export const THEME_FOLLOWS_SYSTEM_STORAGE_KEY = 'capubbs-theme-follows-system';
export const THEME_PREFERENCE_CHANGE_EVENT = 'capubbs-theme-preference-change';

export type ThemeSnapshot = {
  followsSystem: boolean;
  theme: Theme;
};

export function readThemeSnapshot(): ThemeSnapshot {
  const followsSystem = readThemeFollowsSystem();
  return {
    followsSystem,
    theme: followsSystem ? readSystemTheme() : readStoredTheme(),
  };
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

export function saveThemeFollowsSystem(followsSystem: boolean) {
  if (typeof window === 'undefined') return false;

  try {
    if (followsSystem) {
      window.localStorage.setItem(THEME_FOLLOWS_SYSTEM_STORAGE_KEY, 'true');
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, readThemeSnapshot().theme);
      window.localStorage.setItem(THEME_FOLLOWS_SYSTEM_STORAGE_KEY, 'false');
    }
  } catch {
    return false;
  }

  notifyThemePreferenceChange();
  return true;
}

export function saveExplicitTheme(theme: Theme) {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(THEME_FOLLOWS_SYSTEM_STORAGE_KEY, 'false');
  } catch {
    return false;
  }

  applyTheme(theme);
  notifyThemePreferenceChange();
  return true;
}

export function subscribeThemePreference(listener: () => void) {
  if (typeof window === 'undefined') return () => {};

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === THEME_FOLLOWS_SYSTEM_STORAGE_KEY) listener();
  };
  const handleSystemThemeChange = () => {
    if (readThemeFollowsSystem()) listener();
  };

  window.addEventListener(THEME_PREFERENCE_CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);
  systemTheme.addEventListener('change', handleSystemThemeChange);

  return () => {
    window.removeEventListener(THEME_PREFERENCE_CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
    systemTheme.removeEventListener('change', handleSystemThemeChange);
  };
}

function readThemeFollowsSystem() {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(THEME_FOLLOWS_SYSTEM_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function readStoredTheme(): Theme {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // Fall through to the system preference when storage is unavailable.
    }
  }
  return readSystemTheme();
}

function readSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function notifyThemePreferenceChange() {
  window.dispatchEvent(new Event(THEME_PREFERENCE_CHANGE_EVENT));
}
