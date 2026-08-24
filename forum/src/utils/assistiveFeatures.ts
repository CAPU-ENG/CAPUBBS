export const BACK_TO_TOP_ENABLED_STORAGE_KEY = 'capubbs-back-to-top-enabled';
export const ASSISTIVE_BAR_ENABLED_STORAGE_KEY = 'capubbs-assistive-bar-enabled';
export const AUTO_SAVE_ENABLED_STORAGE_KEY = 'capubbs-auto-save-enabled';
export const SIGNATURE_TOGGLE_ENABLED_STORAGE_KEY = 'capubbs-signature-toggle-enabled';
export const SIGNATURES_HIDDEN_STORAGE_KEY = 'capubbs-signatures-hidden';
export const WATERFALL_FEED_ENABLED_STORAGE_KEY = 'capubbs-waterfall-feed-enabled';
export const FLOOR_DECORATION_ENABLED_STORAGE_KEY = 'capubbs-floor-decoration-enabled';
export const ASSISTIVE_FEATURES_CHANGE_EVENT = 'capubbs-assistive-features-change';

function readBoolean(key: string, defaultValue = false) {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const value = window.localStorage.getItem(key);
    return value === null ? defaultValue : value === 'true';
  } catch {
    return defaultValue;
  }
}

function saveBoolean(key: string, value: boolean) {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    return false;
  }

  window.dispatchEvent(new Event(ASSISTIVE_FEATURES_CHANGE_EVENT));
  return true;
}

export function readBackToTopEnabled() {
  return readBoolean(BACK_TO_TOP_ENABLED_STORAGE_KEY, true);
}

export function saveBackToTopEnabled(enabled: boolean) {
  return saveBoolean(BACK_TO_TOP_ENABLED_STORAGE_KEY, enabled);
}

export function readAssistiveBarEnabled() {
  return readBoolean(ASSISTIVE_BAR_ENABLED_STORAGE_KEY, true);
}

export function saveAssistiveBarEnabled(enabled: boolean) {
  return saveBoolean(ASSISTIVE_BAR_ENABLED_STORAGE_KEY, enabled);
}

export function readAutoSaveEnabled() {
  return readBoolean(AUTO_SAVE_ENABLED_STORAGE_KEY, true);
}

export function saveAutoSaveEnabled(enabled: boolean) {
  return saveBoolean(AUTO_SAVE_ENABLED_STORAGE_KEY, enabled);
}

export function readSignatureToggleEnabled() {
  return readBoolean(SIGNATURE_TOGGLE_ENABLED_STORAGE_KEY);
}

export function saveSignatureToggleEnabled(enabled: boolean) {
  return saveBoolean(SIGNATURE_TOGGLE_ENABLED_STORAGE_KEY, enabled);
}

export function readSignaturesHidden() {
  return readBoolean(SIGNATURES_HIDDEN_STORAGE_KEY);
}

export function saveSignaturesHidden(hidden: boolean) {
  return saveBoolean(SIGNATURES_HIDDEN_STORAGE_KEY, hidden);
}

export function readWaterfallFeedEnabled() {
  return readBoolean(WATERFALL_FEED_ENABLED_STORAGE_KEY);
}

export function saveWaterfallFeedEnabled(enabled: boolean) {
  return saveBoolean(WATERFALL_FEED_ENABLED_STORAGE_KEY, enabled);
}

export function readFloorDecorationEnabled() {
  return readBoolean(FLOOR_DECORATION_ENABLED_STORAGE_KEY, true);
}

export function saveFloorDecorationEnabled(enabled: boolean) {
  return saveBoolean(FLOOR_DECORATION_ENABLED_STORAGE_KEY, enabled);
}

export function subscribeAssistiveFeatures(listener: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === ASSISTIVE_BAR_ENABLED_STORAGE_KEY
      || event.key === AUTO_SAVE_ENABLED_STORAGE_KEY
      || event.key === BACK_TO_TOP_ENABLED_STORAGE_KEY
      || event.key === SIGNATURE_TOGGLE_ENABLED_STORAGE_KEY
      || event.key === SIGNATURES_HIDDEN_STORAGE_KEY
      || event.key === WATERFALL_FEED_ENABLED_STORAGE_KEY
      || event.key === FLOOR_DECORATION_ENABLED_STORAGE_KEY
    ) listener();
  };

  window.addEventListener(ASSISTIVE_FEATURES_CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(ASSISTIVE_FEATURES_CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}
