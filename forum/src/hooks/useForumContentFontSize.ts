import { useSyncExternalStore } from 'react';
import {
  FORUM_DEFAULT_FONT_SIZE_PIXELS,
  readForumContentFontSize,
  subscribeForumContentFontSize,
} from '../utils/forumFontSize';

export function useForumContentFontSize() {
  return useSyncExternalStore(
    subscribeForumContentFontSize,
    readForumContentFontSize,
    () => FORUM_DEFAULT_FONT_SIZE_PIXELS,
  );
}
