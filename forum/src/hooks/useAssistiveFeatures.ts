import { useSyncExternalStore } from 'react';
import {
  readAssistiveBarEnabled,
  readBackToTopEnabled,
  readSignaturesHidden,
  readSignatureToggleEnabled,
  readWaterfallFeedEnabled,
  subscribeAssistiveFeatures,
} from '../utils/assistiveFeatures';

export function useAssistiveBarEnabled() {
  return useSyncExternalStore(subscribeAssistiveFeatures, readAssistiveBarEnabled, () => true);
}

export function useBackToTopEnabled() {
  return useSyncExternalStore(subscribeAssistiveFeatures, readBackToTopEnabled, () => true);
}

export function useSignatureToggleEnabled() {
  return useSyncExternalStore(subscribeAssistiveFeatures, readSignatureToggleEnabled, () => false);
}

export function useSignaturesHidden() {
  return useSyncExternalStore(subscribeAssistiveFeatures, readSignaturesHidden, () => false);
}

export function useWaterfallFeedEnabled() {
  return useSyncExternalStore(subscribeAssistiveFeatures, readWaterfallFeedEnabled, () => false);
}
