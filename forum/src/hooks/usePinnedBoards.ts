import { useEffect, useState } from 'react';
import {
  readPinnedBoardIds,
  subscribePinnedBoardIds,
} from '../utils/localSettings';

export function usePinnedBoardIds() {
  const [boardIds, setBoardIds] = useState<number[]>([]);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void readPinnedBoardIds().then((storedBoardIds) => {
        if (active) setBoardIds(storedBoardIds);
      });
    };

    refresh();
    const unsubscribe = subscribePinnedBoardIds(refresh);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return boardIds;
}
