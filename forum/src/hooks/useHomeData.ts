import { useCallback, useEffect, useState } from 'react';
import {
  fetchGlobalPinnedThreads,
  fetchHomeCalendar,
  fetchHomeFeed,
  fetchHomeSignupActivities,
  hydrateHomeThreadAvatars,
  isAbortError,
  type HomeCalendarEvent,
  type HomeSignupActivity,
  type HomeThread,
} from '../api/home';

export type HomeDataStatus = 'error' | 'loading' | 'ready';

type CollectionState = {
  error: string;
  items: HomeThread[];
  status: HomeDataStatus;
};

type CalendarState = {
  error: string;
  items: HomeCalendarEvent[];
  status: HomeDataStatus;
};

type SignupState = {
  error: string;
  items: HomeSignupActivity[];
  status: HomeDataStatus;
};

const initialCollection: CollectionState = {
  error: '',
  items: [],
  status: 'loading',
};

const initialCalendar: CalendarState = {
  error: '',
  items: [],
  status: 'loading',
};

const initialSignup: SignupState = {
  error: '',
  items: [],
  status: 'loading',
};

const HOME_FEED_BATCH_SIZE = 15;
const COMPACT_HOME_FEED_BATCH_SIZE = 30;

export function useHomeData(compactMode = false) {
  const [feed, setFeed] = useState<CollectionState>(initialCollection);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [feedLimit, setFeedLimit] = useState(HOME_FEED_BATCH_SIZE);
  const [compactFeedLimit, setCompactFeedLimit] = useState(COMPACT_HOME_FEED_BATCH_SIZE);
  const [pinned, setPinned] = useState<CollectionState>(initialCollection);
  const [calendar, setCalendar] = useState<CalendarState>(initialCalendar);
  const [signup, setSignup] = useState<SignupState>(initialSignup);
  const [requestVersion, setRequestVersion] = useState(0);
  const activeFeedLimit = compactMode ? compactFeedLimit : feedLimit;

  const retry = useCallback(() => setRequestVersion((version) => version + 1), []);
  const loadMore = useCallback(() => {
    if (compactMode) {
      setCompactFeedLimit((limit) => limit + COMPACT_HOME_FEED_BATCH_SIZE);
      return;
    }
    setFeedLimit((limit) => limit + HOME_FEED_BATCH_SIZE);
  }, [compactMode]);

  useEffect(() => {
    const controller = new AbortController();
    setFeed((current) => ({ ...current, error: '', status: 'loading' }));

    void fetchHomeFeed(activeFeedLimit, controller.signal, !compactMode).then(
      async (items) => {
        setFeedHasMore(items.length >= activeFeedLimit);
        setFeed({ error: '', items, status: 'ready' });
        if (compactMode) return;
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
  }, [activeFeedLimit, compactMode, requestVersion]);

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

  useEffect(() => {
    const controller = new AbortController();
    setCalendar((current) => ({ ...current, error: '', status: 'loading' }));

    void fetchHomeCalendar(controller.signal).then(
      (items) => setCalendar({ error: '', items, status: 'ready' }),
      (error: unknown) => {
        if (!isAbortError(error)) {
          setCalendar((current) => ({
            ...current,
            error: error instanceof Error ? error.message : '日历加载失败，请稍后重试。',
            status: 'error',
          }));
        }
      },
    );

    return () => controller.abort();
  }, [requestVersion]);

  useEffect(() => {
    const controller = new AbortController();
    setSignup((current) => ({ ...current, error: '', status: 'loading' }));

    void fetchHomeSignupActivities(5, controller.signal).then(
      (items) => setSignup({ error: '', items, status: 'ready' }),
      (error: unknown) => {
        if (!isAbortError(error)) {
          setSignup((current) => ({
            ...current,
            error: error instanceof Error ? error.message : '活动报名加载失败，请稍后重试。',
            status: 'error',
          }));
        }
      },
    );

    return () => controller.abort();
  }, [requestVersion]);

  return { calendar, feed, feedHasMore, loadMore, pinned, retry, signup };
}
