import { CalendarDays, ChevronLeft, ChevronRight, Pin } from 'lucide-react';

const pinnedThreads = ['端午骑行报名说明', '关于周末骑行路线的临时调整', '新人装备避坑清单', '新人入门路线建议集中帖'];
const calendarRows = [
  ['27', '28', '29', '30', '31', '1', '2'],
  ['3', '4', '5', '6', '7', '8', '9'],
  ['10', '11', '12', '13', '14', '15', '16'],
  ['17', '18', '19', '20', '21', '22', '23'],
  ['24', '25', '26', '27', '28', '29', '30'],
  ['31', '1', '2', '3', '4', '5', '6'],
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

export function HomeAside() {
  return <aside className="space-y-4"><PinnedPanel /><CalendarPanel /></aside>;
}
