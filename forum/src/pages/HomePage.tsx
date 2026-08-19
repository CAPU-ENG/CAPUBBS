import { FeedSection } from '../components/home/FeedSection';
import { DesktopHomeAside } from '../components/home/HomeAside';
import { MobileActivityBar } from '../components/home/MobileActivityBar';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { useHomeData } from '../hooks/useHomeData';

export function HomePage() {
  const { feed, pinned, retry } = useHomeData();

  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar />
      <MobileActivityBar
        onRetryPinned={retry}
        pinnedError={pinned.error}
        pinnedItems={pinned.items}
        pinnedStatus={pinned.status}
      />

      <main className="page-shell">
        <FeedSection
          error={feed.error}
          items={feed.items}
          onRetry={retry}
          status={feed.status}
        />
        <div className="hidden lg:block">
          <DesktopHomeAside
            error={pinned.error}
            items={pinned.items}
            onRetry={retry}
            status={pinned.status}
          />
        </div>
      </main>
    </div>
  );
}
