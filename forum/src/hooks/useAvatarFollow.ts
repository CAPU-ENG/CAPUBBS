import { useSyncExternalStore } from 'react';
import { readAvatarFollowDisabled, subscribeAvatarFollow } from '../utils/avatarFollow';

export function useAvatarFollowDisabled() {
  return useSyncExternalStore(subscribeAvatarFollow, readAvatarFollowDisabled, () => false);
}
