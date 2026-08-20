import { useCallback, useEffect, useState } from 'react';
import {
  fetchGlobalPinnedThreads,
  fetchHomeFeed,
  hydrateHomeThreadAvatars,
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

const HOME_FEED_BATCH_SIZE = 15;

export function useHomeData() {
  const [feed, setFeed] = useState<CollectionState>(initialCollection);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [feedLimit, setFeedLimit] = useState(HOME_FEED_BATCH_SIZE);
  const [pinned, setPinned] = useState<CollectionState>(initialCollection);
  const [requestVersion, setRequestVersion] = useState(0);

  const retry = useCallback(() => setRequestVersion((version) => version + 1), []);
  const loadMore = useCallback(() => {
    setFeedLimit((limit) => limit + HOME_FEED_BATCH_SIZE);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setFeed((current) => ({ ...current, error: '', status: 'loading' }));

    void fetchHomeFeed(feedLimit, controller.signal).then(
      async (items) => {
        setFeedHasMore(items.length >= feedLimit);
        setFeed({ error: '', items, status: 'ready' });
        try {
          const hydratedItems = await hydrateHomeThreadAvatars(items, controller.signal);
          setFeed({ error: '', items: hydratedItems, status: 'ready' });
        } catch (error) {
          if (isAbortError(error)) return;
        }
      },
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

    return () => controller.abort();
  }, [feedLimit, requestVersion]);

  useEffect(() => {
    const controller = new AbortController();
    setPinned((current) => ({ ...current, error: '', status: 'loading' }));

    void fetchGlobalPinnedThreads(controller.signal).then(
      async (items) => {
        setPinned({ error: '', items, status: 'ready' });
        try {
          const hydratedItems = await hydrateHomeThreadAvatars(items, controller.signal);
          setPinned({ error: '', items: hydratedItems, status: 'ready' });
        } catch (error) {
          if (isAbortError(error)) return;
        }
      },
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

  return { feed, feedHasMore, loadMore, pinned, retry };
}
