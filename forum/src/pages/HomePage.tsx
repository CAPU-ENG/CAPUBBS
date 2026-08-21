import { FeedSection } from '../components/home/FeedSection';
import { DesktopHomeAside } from '../components/home/HomeAside';
import { MobileActivityBar } from '../components/home/MobileActivityBar';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import { useWaterfallFeedEnabled } from '../hooks/useAssistiveFeatures';
import { useCompactMode } from '../hooks/useCompactMode';
import { useHomeData } from '../hooks/useHomeData';
import { useReadThreadIds } from '../hooks/useReadThreadIds';

export function HomePage() {
  const { viewer } = useAuth();
  const compactMode = useCompactMode();
  const waterfallFeedEnabled = useWaterfallFeedEnabled();
  const { calendar, feed, feedHasMore, loadMore, pinned, retry, signup } = useHomeData(compactMode);
  const readThreadIds = useReadThreadIds(viewer?.username);

  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar />
      <MobileActivityBar
        calendarError={calendar.error}
        calendarItems={calendar.items}
        calendarStatus={calendar.status}
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
            items={pinned.items}
            readThreadIds={readThreadIds}
            signupItems={signup.items}
          />
        </div>
      </main>
    </div>
  );
}
