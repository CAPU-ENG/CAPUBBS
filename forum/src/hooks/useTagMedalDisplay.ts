import { useSyncExternalStore } from 'react';
import { readTagMedalDisplayEnabled, subscribeTagMedalDisplay } from '../utils/tagMedalDisplay';

export function useTagMedalDisplayEnabled() {
  return useSyncExternalStore(
    subscribeTagMedalDisplay,
    readTagMedalDisplayEnabled,
    () => true,
  );
}
