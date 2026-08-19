import activityCover from '../assets/activity/activity.avif';
import { FeedSection } from '../components/home/FeedSection';
import { CalendarPanel, DesktopHomeAside, PinnedPanel } from '../components/home/HomeAside';
import { AppBackground } from '../components/layout/AppBackground';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';

function ActivityBanner() {
  return (
    <section className="overflow-hidden rounded-lg bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-200 p-[1px] shadow-panel">
      <div className="relative min-h-[200px] overflow-hidden rounded-[7px] md:min-h-[110px]">
        <img
          src={activityCover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <div className="relative min-h-screen">
      <AppBackground />
      <TopBar />

      <main className="relative z-10 mx-auto hidden max-w-[1480px] items-start gap-4 px-4 pb-4 pt-20 lg:grid lg:grid-cols-[224px_minmax(0,1fr)_272px]">
        <div className="sticky top-20"><Sidebar /></div>
        <FeedSection />
        <div className="sticky top-20"><DesktopHomeAside /></div>
      </main>

      <main className="scrollbar-none relative z-10 mx-auto min-h-screen max-w-[1480px] space-y-4 overflow-y-auto px-4 pb-4 pt-[var(--capubbs-mobile-topbar-offset)] lg:hidden">
        <ActivityBanner />
        <PinnedPanel />
        <FeedSection />
        <CalendarPanel />
      </main>
    </div>
  );
}
