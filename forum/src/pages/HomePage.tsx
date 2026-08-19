import activityCover from '../assets/activity/activity.avif';
import { ArrowRight, Clock3, Users } from 'lucide-react';
import { FeedSection } from '../components/home/FeedSection';
import { CalendarPanel, HomeAside, PinnedPanel } from '../components/home/HomeAside';
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
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-between gap-6 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.82)_46%,rgba(255,255,255,0.08)_100%)] px-6 lg:flex">
          <div>
            <p className="text-xs font-semibold text-[#875A41]">本周活动</p>
            <h1 className="mt-1 text-xl font-semibold text-zinc-950">周末轻骑开放报名</h1>
            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-600">
              <span className="inline-flex items-center gap-1.5"><Clock3 size={14} className="text-emerald-700/80" />周六 08:30</span>
              <span className="inline-flex items-center gap-1.5"><Users size={14} className="text-emerald-700/80" />24 人参加</span>
            </div>
          </div>
          <button type="button" className="pointer-events-auto inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-white/45 bg-white/55 px-4 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur-md transition hover:bg-white/75">
            查看活动 <ArrowRight size={15} />
          </button>
        </div>
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
        <section className="min-w-0 space-y-4">
          <ActivityBanner />
          <FeedSection />
        </section>
        <div className="sticky top-20"><HomeAside /></div>
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
