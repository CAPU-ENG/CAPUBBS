import { useCallback, useEffect, useState } from 'react';
import {
  fetchGlobalPinnedThreads,
  fetchHomeFeed,
  isAbortError,
  type HomeThread,
} from '../api/home';

export type HomeDataStatus = 'error' | 'loading' | 'ready';

type CollectionState = {
  error: string;
  items: HomeThread[];
  status: HomeDataStatus;
};

const initialCollection: CollectionState = {
  error: '',
  items: [],
  status: 'loading',
};

export function useHomeData() {
  const [feed, setFeed] = useState<CollectionState>(initialCollection);
  const [pinned, setPinned] = useState<CollectionState>(initialCollection);
  const [requestVersion, setRequestVersion] = useState(0);

  const retry = useCallback(() => setRequestVersion((version) => version + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setFeed((current) => ({ ...current, error: '', status: 'loading' }));
    setPinned((current) => ({ ...current, error: '', status: 'loading' }));

    void fetchHomeFeed(controller.signal).then(
      (items) => setFeed({ error: '', items, status: 'ready' }),
      (error: unknown) => {
        if (!isAbortError(error)) {
          setFeed((current) => ({
            ...current,
            error: error instanceof Error ? error.message : '帖子加载失败，请稍后重试。',
            status: 'error',
          }));
        }
      },
    );

    void fetchGlobalPinnedThreads(controller.signal).then(
      (items) => setPinned({ error: '', items, status: 'ready' }),
      (error: unknown) => {
        if (!isAbortError(error)) {
          setPinned((current) => ({
            ...current,
            error: error instanceof Error ? error.message : '置顶内容加载失败，请稍后重试。',
            status: 'error',
          }));
        }
      },
    );

    return () => controller.abort();
  }, [requestVersion]);

  return { feed, pinned, retry };
}
