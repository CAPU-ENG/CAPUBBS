import { FeedSection } from '../components/home/FeedSection';
import { DesktopHomeAside } from '../components/home/HomeAside';
import { MobileActivityBar } from '../components/home/MobileActivityBar';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { useHomeData } from '../hooks/useHomeData';

export function HomePage() {
  const { feed, feedHasMore, loadMore, pinned, retry } = useHomeData();

  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar />
      <MobileActivityBar pinnedItems={pinned.items} />

      <main className="page-shell">
        <FeedSection
          error={feed.error}
          hasMore={feedHasMore}
          items={feed.items}
          onLoadMore={loadMore}
          onRetry={retry}
          status={feed.status}
        />
        <div className="hidden lg:block">
          <DesktopHomeAside
            items={pinned.items}
          />
        </div>
      </main>
    </div>
  );
}
