import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchGlobalPinnedThreads,
  fetchHomeCalendar,
  fetchHomeFeedPage,
  fetchHomeSignupActivities,
  isAbortError,
  type HomeCalendarEvent,
  type HomeFeedSnapshot,
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

function calendarDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function useHomeData(compactMode = false) {
  const [feed, setFeed] = useState<CollectionState>(initialCollection);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [feedLimit, setFeedLimit] = useState(HOME_FEED_BATCH_SIZE);
  const [compactFeedLimit, setCompactFeedLimit] = useState(COMPACT_HOME_FEED_BATCH_SIZE);
  const [pinned, setPinned] = useState<CollectionState>(initialCollection);
  const [calendar, setCalendar] = useState<CalendarState>(initialCalendar);
  const [signup, setSignup] = useState<SignupState>(initialSignup);
  const [requestVersion, setRequestVersion] = useState(0);
  const feedSnapshotRef = useRef<HomeFeedSnapshot | null>(null);
  const [calendarRange] = useState(() => {
    const currentYear = new Date().getFullYear();
    return {
      end: calendarDateKey(currentYear + 1, 12, 31),
      start: calendarDateKey(currentYear - 1, 1, 1),
    };
  });
  const calendarFullRequestedRef = useRef(false);
  const activeFeedLimit = compactMode ? compactFeedLimit : feedLimit;

  const retry = useCallback(() => setRequestVersion((version) => version + 1), []);
  const loadMore = useCallback(() => {
    if (compactMode) {
      setCompactFeedLimit((limit) => limit + COMPACT_HOME_FEED_BATCH_SIZE);
      return;
    }
    setFeedLimit((limit) => limit + HOME_FEED_BATCH_SIZE);
  }, [compactMode]);
  const loadFullCalendarForDate = useCallback((date: string) => {
    if (date >= calendarRange.start && date <= calendarRange.end) return;
    if (calendarFullRequestedRef.current) return;

    calendarFullRequestedRef.current = true;
    const controller = new AbortController();
    setCalendar((current) => ({ ...current, error: '', status: 'loading' }));
    void fetchHomeCalendar(controller.signal, { full: true }).then(
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
  }, [calendarRange]);

  useEffect(() => {
    const controller = new AbortController();
    setFeed((current) => ({ ...current, error: '', status: 'loading' }));

    void fetchHomeFeedPage({
      includeText: !compactMode,
      limit: activeFeedLimit,
      previous: feedSnapshotRef.current,
      signal: controller.signal,
    }).then(
      (page) => {
        feedSnapshotRef.current = page.snapshot;
        setFeedHasMore(page.hasMore);
        setFeed({ error: '', items: page.items, status: 'ready' });
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
      (items) => {
        setPinned({ error: '', items, status: 'ready' });
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
    calendarFullRequestedRef.current = false;
    setCalendar((current) => ({ ...current, error: '', status: 'loading' }));

    void fetchHomeCalendar(controller.signal, {
      endDate: calendarRange.end,
      startDate: calendarRange.start,
    }).then(
      (items) => {
        if (!calendarFullRequestedRef.current) setCalendar({ error: '', items, status: 'ready' });
      },
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
  }, [calendarRange, requestVersion]);

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

  return { calendar, feed, feedHasMore, loadFullCalendarForDate, loadMore, pinned, retry, signup };
}
