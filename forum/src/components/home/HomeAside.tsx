import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Pin, Users } from 'lucide-react';
import activityCover from '../../assets/activity/activity.avif';

const pinnedThreads = ['端午骑行报名说明', '关于周末骑行路线的临时调整', '新人装备避坑清单', '新人入门路线建议集中帖'];
const calendarRows = [
  ['27', '28', '29', '30', '31', '1', '2'],
  ['3', '4', '5', '6', '7', '8', '9'],
  ['10', '11', '12', '13', '14', '15', '16'],
  ['17', '18', '19', '20', '21', '22', '23'],
  ['24', '25', '26', '27', '28', '29', '30'],
  ['31', '1', '2', '3', '4', '5', '6'],
];
const activities = [
  { title: '周末轻骑开放报名', time: '周六 08:30', people: '24 人', position: 'center 22%' },
  { title: '夜骑安全训练', time: '周三 19:00', people: '12 人', position: 'center 72%' },
];
const weekDays = [
  { weekday: '一', date: 17 },
  { weekday: '二', date: 18 },
  { weekday: '三', date: 19, current: true },
  { weekday: '四', date: 20 },
  { weekday: '五', date: 21 },
  { weekday: '六', date: 22, weekend: true },
  { weekday: '日', date: 23, weekend: true },
];

export function PinnedPanel() {
  return (
    <section className="card-surface rounded-lg border border-zinc-200 p-4 shadow-panel">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
        <Pin size={15} className="text-emerald-700/80" />
        <span>全局置顶</span>
      </h2>
      <ul className="mt-3 space-y-2">
        {pinnedThreads.map((thread) => (
          <li className="card-option flex min-h-9 items-center gap-2 rounded-md px-2 text-sm text-zinc-600" key={thread}>
            <span className="-ml-1 inline-flex w-5 shrink-0 items-center justify-center text-xs font-bold leading-none text-red-600">[新]</span>
            <span className="capubbs-title-wrap min-w-0 flex-1">{thread}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DesktopActivityBanners() {
  return (
    <section className="space-y-2" aria-label="近期活动">
      {activities.map((activity) => (
        <article className="group relative min-h-[84px] overflow-hidden rounded-lg border border-white/60 shadow-panel" key={activity.title}>
          <img src={activityCover} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" style={{ objectPosition: activity.position }} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.86)_60%,rgba(255,255,255,0.18)_100%)]" />
          <div className="relative z-10 flex min-h-[84px] flex-col justify-center px-4 pr-9">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#875A41]">近期活动</p>
            <h2 className="mt-1 truncate text-sm font-semibold text-zinc-950">{activity.title}</h2>
            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-zinc-600">
              <span className="inline-flex items-center gap-1"><Clock3 size={12} className="text-emerald-700/80" />{activity.time}</span>
              <span className="inline-flex items-center gap-1"><Users size={12} className="text-emerald-700/80" />{activity.people}</span>
            </div>
          </div>
          <ChevronRight size={17} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-teal-700 transition-transform group-hover:translate-x-0.5" />
        </article>
      ))}
    </section>
  );
}

function WeekCalendarPanel() {
  return (
    <section className="card-surface rounded-lg border border-zinc-200 p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
          <CalendarDays size={15} className="text-emerald-700/80" />
          <span>活动日历</span>
        </h2>
        <span className="text-[11px] font-medium text-zinc-500">8月17日—23日</span>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div className={`flex h-[50px] flex-col items-center justify-center rounded-md border text-center ${day.current ? 'border-emerald-300 bg-teal-50 text-teal-800 shadow-sm' : 'border-white/45 bg-white/35 text-zinc-600'}`} key={day.date}>
            <span className={`text-[10px] ${day.weekend && !day.current ? 'text-rose-400' : ''}`}>{day.weekday}</span>
            <span className="mt-1 text-xs font-semibold">{day.date}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-md border border-zinc-200/80 bg-white/35 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
          <p className="min-w-0 truncate text-xs font-semibold text-[#385772]">周末轻骑开放报名</p>
        </div>
        <p className="mt-1 pl-4 text-[11px] text-zinc-500">周六 · 08:30</p>
      </div>
    </section>
  );
}

export function CalendarPanel() {
  return (
    <section className="card-surface rounded-lg border border-zinc-200 p-3 shadow-panel">
      <div className="grid grid-cols-[1fr_auto] items-start gap-2.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
          <CalendarDays size={15} className="text-emerald-700/80" />
          <span>活动日历</span>
        </h2>
        <span className="rounded-md border border-white/25 bg-white/[0.38] px-2.5 py-1 text-xs font-semibold text-zinc-700 shadow-sm">2026</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-white/25 bg-white/[0.38] text-zinc-700"><ChevronLeft size={16} /></button>
        <div className="min-w-0 flex-1 text-center text-sm font-semibold text-zinc-950">08月</div>
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-white/25 bg-white/[0.38] text-zinc-700"><ChevronRight size={16} /></button>
      </div>

      <div className="mt-3 grid grid-cols-[22px_repeat(7,minmax(0,1fr))] gap-y-1 text-center text-[11px] text-zinc-600">
        <span />
        {['一', '二', '三', '四', '五', '六', '日'].map((day) => <span className={day === '六' || day === '日' ? 'text-rose-400' : ''} key={day}>{day}</span>)}
        {calendarRows.map((row, rowIndex) => (
          <div className="contents" key={rowIndex}>
            <span className="flex h-7 items-center justify-center rounded-full border border-zinc-200 text-[9px] text-zinc-500">{31 + rowIndex}</span>
            {row.map((date, dateIndex) => {
              const inCurrentWeek = rowIndex === 3;
              const isToday = inCurrentWeek && date === '19';
              const muted = rowIndex === 0 || (rowIndex === 5 && date !== '31');
              return (
                <span
                  key={`${rowIndex}-${dateIndex}`}
                  className={`flex h-7 items-center justify-center rounded-md border ${isToday ? 'border-emerald-300 bg-teal-50 text-teal-800' : inCurrentWeek ? 'border-[#A4C1AC]/70 bg-[#A4C1AC]/20 text-zinc-700' : 'border-transparent'} ${muted ? 'text-zinc-400' : ''}`}
                >
                  {date}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <p className="mt-3 text-sm font-semibold text-zinc-950">第34周 · 2026-08-17 - 2026-08-23</p>
      <div className="mt-2 rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-500">当天暂无活动</div>
    </section>
  );
}

export function DesktopHomeAside() {
  return <aside className="space-y-4"><PinnedPanel /><DesktopActivityBanners /><WeekCalendarPanel /></aside>;
}
