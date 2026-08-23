import { useSyncExternalStore } from 'react';
import { readTopBarAutoHideEnabled, subscribeTopBarAutoHide } from '../utils/topBarAutoHide';

export function useTopBarAutoHideEnabled() {
  return useSyncExternalStore(subscribeTopBarAutoHide, readTopBarAutoHideEnabled, () => true);
}
