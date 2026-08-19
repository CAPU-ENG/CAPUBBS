import { ArrowUpRight, CalendarDays, ChevronRight, Pin } from 'lucide-react';

const weekdays = [
  { day: '一', date: 17 },
  { day: '二', date: 18 },
  { day: '三', date: 19, current: true },
  { day: '四', date: 20 },
  { day: '五', date: 21 },
  { day: '六', date: 22 },
  { day: '日', date: 23 },
];

export function HomeAside() {
  return (
    <aside className="space-y-4">
      <section className="surface aside-card">
        <div className="aside-heading">
          <div>
            <p className="section-kicker">PINNED</p>
            <h2 className="section-title text-xl">全局置顶</h2>
          </div>
          <Pin aria-hidden="true" className="text-clay" size={18} strokeWidth={1.7} />
        </div>
        <div className="mt-4 space-y-1">
          {['论坛使用与发帖说明', '社区版规与反馈入口', '车协活动安全须知'].map((item) => (
            <a className="aside-link" href="#main-feed" key={item}>
              <span>{item}</span>
              <ChevronRight aria-hidden="true" size={14} />
            </a>
          ))}
        </div>
      </section>

      <section className="surface aside-card">
        <div className="aside-heading">
          <div>
            <p className="section-kicker">THIS WEEK</p>
            <h2 className="section-title text-xl">社区日历</h2>
          </div>
          <CalendarDays aria-hidden="true" className="text-lake" size={19} strokeWidth={1.7} />
        </div>

        <div className="calendar-strip mt-5">
          {weekdays.map((item) => (
            <div className={item.current ? 'calendar-day calendar-day-current' : 'calendar-day'} key={item.day}>
              <span>{item.day}</span>
              <strong>{item.date}</strong>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-ink/[0.045] p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-clay">SAT · 08:30</p>
          <div className="mt-1.5 flex items-start justify-between gap-3">
            <p className="font-display text-sm font-bold leading-5 text-ink">周末短途骑行</p>
            <ArrowUpRight aria-hidden="true" className="mt-0.5 shrink-0 text-lake" size={14} />
          </div>
        </div>
      </section>

      <section className="surface aside-card">
        <p className="section-kicker">AT A GLANCE</p>
        <h2 className="section-title text-xl">社区一览</h2>
        <dl className="mt-5 grid grid-cols-3 gap-2">
          <div className="metric-cell"><dt>主题</dt><dd>12.8k</dd></div>
          <div className="metric-cell"><dt>成员</dt><dd>4.2k</dd></div>
          <div className="metric-cell"><dt>在线</dt><dd>86</dd></div>
        </dl>
      </section>
    </aside>
  );
}
