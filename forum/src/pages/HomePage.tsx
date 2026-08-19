import { ArrowRight, Bike } from 'lucide-react';
import { FeedSection } from '../components/home/FeedSection';
import { HomeAside } from '../components/home/HomeAside';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';

export function HomePage() {
  return (
    <div className="relative min-h-screen pb-10">
      <TopBar />

      <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-4 px-4 pt-4 lg:grid-cols-[248px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)_288px]">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <main className="min-w-0 space-y-4">
          <section className="welcome-card animate-enter">
            <div className="relative z-10 max-w-xl">
              <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lake">
                <span className="h-px w-6 bg-lake/60" /> CAPU CYCLING COMMUNITY
              </p>
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
                在路上，也在这里。
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-moss sm:text-[15px]">
                一个围绕骑行、装备和校园生活展开的交流空间。首页先从清晰的结构开始。
              </p>
              <button className="welcome-action" type="button">
                浏览社区 <ArrowRight aria-hidden="true" size={15} />
              </button>
            </div>

            <div className="welcome-wheel" aria-hidden="true">
              <span className="wheel-hub"><Bike size={42} strokeWidth={1.2} /></span>
            </div>
          </section>

          <FeedSection />
        </main>

        <div className="xl:block">
          <HomeAside />
        </div>
      </div>
    </div>
  );
}
