import { useSyncExternalStore } from 'react';
import type { ProfileTab } from '../data/profile';
import { getProfileTabFromLocation } from '../utils/userRoutes';

const MOBILE_PROFILE_QUERY = '(max-width: 680px)';

function readMobileViewport() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(MOBILE_PROFILE_QUERY).matches);
}

function subscribeViewport(listener: () => void) {
  const query = window.matchMedia?.(MOBILE_PROFILE_QUERY);
  query?.addEventListener('change', listener);
  return () => query?.removeEventListener('change', listener);
}

export function useProfileContentNavigation(allowedTabs: ProfileTab[]) {
  const isMobile = useSyncExternalStore(subscribeViewport, readMobileViewport, () => false);
  const requestedTab = getProfileTabFromLocation(window.location.pathname, window.location.search, allowedTabs);
  return { isMobile, isContentPage: isMobile && requestedTab !== null, requestedTab };
}
