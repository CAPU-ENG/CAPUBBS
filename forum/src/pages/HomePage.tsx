import { FeedSection } from '../components/home/FeedSection';
import { DesktopHomeAside } from '../components/home/HomeAside';
import { MobileActivityBar } from '../components/home/MobileActivityBar';
import { TopBar } from '../components/layout/TopBar';

export function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--page)] text-[var(--text)] transition-colors duration-200">
      <TopBar />
      <MobileActivityBar />

      <main className="page-shell">
        <FeedSection />
        <div className="hidden lg:block">
          <DesktopHomeAside />
        </div>
      </main>
    </div>
  );
}
