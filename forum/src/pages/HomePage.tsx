import { FeedSection } from '../components/home/FeedSection';
import { DesktopHomeAside } from '../components/home/HomeAside';
import { MobileActivityBar } from '../components/home/MobileActivityBar';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';

export function HomePage() {
  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
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
