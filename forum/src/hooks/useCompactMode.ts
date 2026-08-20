import { useSyncExternalStore } from 'react';
import { readCompactMode, subscribeCompactMode } from '../utils/compactMode';

export function useCompactMode() {
  return useSyncExternalStore(subscribeCompactMode, readCompactMode, () => false);
}
