import { useSyncExternalStore } from 'react';
import { readAuthorProfileEnabled, subscribeAuthorProfile } from '../utils/authorProfile';

export function useAuthorProfileEnabled() {
  return useSyncExternalStore(subscribeAuthorProfile, readAuthorProfileEnabled, () => true);
}
