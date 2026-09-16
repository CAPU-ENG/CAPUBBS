import { useSyncExternalStore } from 'react';
import {
  FORUM_CONTENT_FONT_SIZE_OPTIONS,
  FORUM_DEFAULT_FONT_SIZE_PIXELS,
  readForumContentFontSize,
  readForumContentFontSizeOptions,
  subscribeForumContentFontSize,
} from '../utils/forumFontSize';

export function useForumContentFontSize() {
  return useSyncExternalStore(
    subscribeForumContentFontSize,
    readForumContentFontSize,
    () => FORUM_DEFAULT_FONT_SIZE_PIXELS,
  );
}

export function useForumContentFontSizeOptions() {
  return useSyncExternalStore(
    subscribeForumContentFontSize,
    readForumContentFontSizeOptions,
    () => FORUM_CONTENT_FONT_SIZE_OPTIONS,
  );
}
