import { useEffect, useState } from 'react';
import {
  PINNED_BOARDS_CHANGE_EVENT,
  PINNED_BOARDS_STORAGE_KEY,
  readPinnedBoardIds,
} from '../utils/localSettings';

export function usePinnedBoardIds() {
  const [boardIds, setBoardIds] = useState(readPinnedBoardIds);

  useEffect(() => {
    const refresh = () => setBoardIds(readPinnedBoardIds());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === PINNED_BOARDS_STORAGE_KEY) refresh();
    };

    window.addEventListener(PINNED_BOARDS_CHANGE_EVENT, refresh);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(PINNED_BOARDS_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return boardIds;
}
