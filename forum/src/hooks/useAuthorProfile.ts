import { useSyncExternalStore } from 'react';
import { readAuthorProfileEnabled, subscribeAuthorProfile } from '../utils/authorProfile';

const AUTHOR_PROFILE_DESKTOP_QUERY = '(min-width: 1024px)';

function readResponsiveAuthorProfileEnabled() {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia(AUTHOR_PROFILE_DESKTOP_QUERY).matches && readAuthorProfileEnabled();
}

function subscribeResponsiveAuthorProfile(listener: () => void) {
  const unsubscribeAuthorProfile = subscribeAuthorProfile(listener);
  if (typeof window === 'undefined' || !window.matchMedia) return unsubscribeAuthorProfile;

  const desktopViewport = window.matchMedia(AUTHOR_PROFILE_DESKTOP_QUERY);
  desktopViewport.addEventListener('change', listener);

  return () => {
    unsubscribeAuthorProfile();
    desktopViewport.removeEventListener('change', listener);
  };
}

export function useAuthorProfileEnabled() {
  return useSyncExternalStore(
    subscribeResponsiveAuthorProfile,
    readResponsiveAuthorProfileEnabled,
    () => false,
  );
}
