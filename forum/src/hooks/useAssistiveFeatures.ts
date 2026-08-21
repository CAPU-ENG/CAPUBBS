import { useSyncExternalStore } from 'react';
import {
  readBackToTopEnabled,
  readSignaturesHidden,
  readSignatureToggleEnabled,
  subscribeAssistiveFeatures,
} from '../utils/assistiveFeatures';

export function useBackToTopEnabled() {
  return useSyncExternalStore(subscribeAssistiveFeatures, readBackToTopEnabled, () => false);
}

export function useSignatureToggleEnabled() {
  return useSyncExternalStore(subscribeAssistiveFeatures, readSignatureToggleEnabled, () => false);
}

export function useSignaturesHidden() {
  return useSyncExternalStore(subscribeAssistiveFeatures, readSignaturesHidden, () => false);
}
