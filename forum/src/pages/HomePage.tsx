import { useEffect } from 'react';
import { FeedSection } from '../components/home/FeedSection';
import { DesktopHomeAside } from '../components/home/HomeAside';
import { MobileActivityBar } from '../components/home/MobileActivityBar';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import { useFloorDecorationEnabled, useWaterfallFeedEnabled } from '../hooks/useAssistiveFeatures';
import { useCompactMode } from '../hooks/useCompactMode';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useHomeData } from '../hooks/useHomeData';
import { useHomeThreadPreload } from '../hooks/useHomeThreadPreload';
import { useReadThreadIds } from '../hooks/useReadThreadIds';
import { useTagMedalDisplayEnabled } from '../hooks/useTagMedalDisplay';
import { getThreadCacheScope } from '../utils/threadContentCache';

export function HomePage() {
  useDocumentTitle('车协论坛');
  const { refreshUnreadMessages, status: authStatus, viewer } = useAuth();
  const compactMode = useCompactMode();
  const floorDecorationEnabled = useFloorDecorationEnabled();
  const tagMedalDisplayEnabled = useTagMedalDisplayEnabled();
  const waterfallFeedEnabled = useWaterfallFeedEnabled();
  const { calendar, feed, feedHasMore, loadFullCalendarForDate, loadMore, pinned, retry, signup } = useHomeData(compactMode);
  const readThreadIds = useReadThreadIds(viewer?.username);
  useHomeThreadPreload({
    decoration: floorDecorationEnabled,
    feed: feed.items,
    pinned: pinned.items,
    scope: authStatus === 'loading' ? null : getThreadCacheScope(viewer?.username),
    signup: viewer ? signup.items : [],
    tagMedalDisplay: tagMedalDisplayEnabled,
  });

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    void refreshUnreadMessages();
  }, [authStatus, refreshUnreadMessages, viewer?.username]);

  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar />
      <MobileActivityBar
        calendarError={calendar.error}
        calendarItems={calendar.items}
        calendarStatus={calendar.status}
        onCalendarVisibleDateChange={loadFullCalendarForDate}
        pinnedItems={pinned.items}
        readThreadIds={readThreadIds}
        signupItems={signup.items}
      />

      <main className="page-shell">
        <FeedSection
          autoLoadMore={waterfallFeedEnabled}
          compactMode={compactMode}
          error={feed.error}
          hasMore={feedHasMore}
          items={feed.items}
          onLoadMore={loadMore}
          onRetry={retry}
          status={feed.status}
        />
        <div className="home-aside-column hidden lg:block">
          <DesktopHomeAside
            calendarError={calendar.error}
            calendarItems={calendar.items}
            calendarStatus={calendar.status}
            onCalendarVisibleDateChange={loadFullCalendarForDate}
            items={pinned.items}
            readThreadIds={readThreadIds}
            signupItems={signup.items}
          />
        </div>
      </main>
    </div>
  );
}
