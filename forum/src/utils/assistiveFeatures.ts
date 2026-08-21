export const BACK_TO_TOP_ENABLED_STORAGE_KEY = 'capubbs-back-to-top-enabled';
export const SIGNATURE_TOGGLE_ENABLED_STORAGE_KEY = 'capubbs-signature-toggle-enabled';
export const SIGNATURES_HIDDEN_STORAGE_KEY = 'capubbs-signatures-hidden';
export const WATERFALL_FEED_ENABLED_STORAGE_KEY = 'capubbs-waterfall-feed-enabled';
export const ASSISTIVE_FEATURES_CHANGE_EVENT = 'capubbs-assistive-features-change';

function readBoolean(key: string) {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(key) === 'true';
  } catch {
    return false;
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
  return readBoolean(BACK_TO_TOP_ENABLED_STORAGE_KEY);
}

export function saveBackToTopEnabled(enabled: boolean) {
  return saveBoolean(BACK_TO_TOP_ENABLED_STORAGE_KEY, enabled);
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

export function subscribeAssistiveFeatures(listener: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === BACK_TO_TOP_ENABLED_STORAGE_KEY
      || event.key === SIGNATURE_TOGGLE_ENABLED_STORAGE_KEY
      || event.key === SIGNATURES_HIDDEN_STORAGE_KEY
      || event.key === WATERFALL_FEED_ENABLED_STORAGE_KEY
    ) listener();
  };

  window.addEventListener(ASSISTIVE_FEATURES_CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(ASSISTIVE_FEATURES_CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}
