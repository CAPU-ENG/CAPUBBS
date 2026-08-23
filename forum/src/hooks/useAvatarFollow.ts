import { useSyncExternalStore } from 'react';
import {
  readAvatarFollowDisabled,
  readAvatarFollowEnabled,
  subscribeAvatarFollow,
} from '../utils/avatarFollow';

export function useAvatarFollowEnabled() {
  return useSyncExternalStore(subscribeAvatarFollow, readAvatarFollowEnabled, () => false);
}

export function useAvatarFollowDisabled() {
  return useSyncExternalStore(subscribeAvatarFollow, readAvatarFollowDisabled, () => true);
}
