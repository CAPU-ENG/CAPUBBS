export type ForumClientType = 'web' | 'pwa';

export const PWA_DISPLAY_MODE_QUERY = '(display-mode: standalone)';
export const FORUM_PRESENCE_CHANGE_EVENT = 'capubbs:presence-change';

export function getForumClientType(): ForumClientType {
  const standalone = window.matchMedia?.(PWA_DISPLAY_MODE_QUERY).matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standalone ? 'pwa' : 'web';
}
