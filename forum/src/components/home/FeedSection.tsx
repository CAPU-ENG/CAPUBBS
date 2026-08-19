import { Check } from 'lucide-react';
import defaultAvatar from '../../assets/avatar/default-avatar.avif';

const feedItems = [
  { author: '蓝色车架', board: '行者足音', title: '端午活动报名说明', time: '05.20 11:48' },
  { author: '阿北', board: '车友宝典', title: '雨天骑行挡泥板推荐', time: '05.20 10:12' },
  { author: '蓝色车架', board: '行者足音', title: '端午活动报名说明', time: '05.20 11:48' },
  { author: '阿北', board: '车友宝典', title: '雨天骑行挡泥板推荐', time: '05.20 10:12' },
  { author: '蓝色车架', board: '行者足音', title: '端午活动报名说明', time: '05.20 11:48' },
  { author: '阿北', board: '车友宝典', title: '雨天骑行挡泥板推荐', time: '05.20 10:12' },
];

function FeedTabs() {
  return (
    <div className="segmented-tabs-surface flex gap-1 rounded-lg border p-1 shadow-sm">
      <button type="button" className="card-surface flex h-10 flex-1 items-center justify-center rounded-md border border-zinc-200/80 px-3 text-sm font-semibold text-zinc-950 shadow-sm">最新回帖</button>
      <button type="button" className="flex h-10 flex-1 items-center justify-center rounded-md border border-transparent px-3 text-sm font-semibold text-zinc-700">最新主题</button>
    </div>
  );
}

function FeedToolbar() {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3">
      <label className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white/65 px-3 text-sm font-semibold text-[#385772] shadow-sm backdrop-blur-[2px]">
        <input type="checkbox" className="sr-only" />
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-zinc-300 bg-white/70 text-transparent"><Check size={14} strokeWidth={3} /></span>
        <span>紧凑模式</span>
      </label>
      <div className="inline-flex h-9 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-white/65 p-1 shadow-sm backdrop-blur-[2px]">
        <button type="button" className="min-w-10 rounded-md bg-[#385772] px-2.5 text-sm font-bold text-white shadow-sm">10</button>
        <button type="button" className="min-w-10 rounded-md px-2.5 text-sm font-bold text-[#385772]">20</button>
        <button type="button" className="min-w-10 rounded-md px-2.5 text-sm font-bold text-[#385772]">50</button>
      </div>
    </div>
  );
}

function FeedCard({ item }: { item: (typeof feedItems)[number] }) {
  return (
    <article className="card-surface cursor-default rounded-lg border border-zinc-200 p-4 shadow-panel transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500/35 hover:bg-white/[0.96] hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="grid grid-cols-[44px_1fr] items-center gap-3">
          <img src={defaultAvatar} alt="" className="h-11 w-11 rounded-full object-cover" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[#875A41]">{item.author}</div>
            <div className="mt-1 text-xs text-amber-500">★★★★</div>
          </div>
        </div>
        <span className="shrink-0 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">{item.board}</span>
      </div>
      <h2 className="capubbs-title-wrap mt-4 text-base font-semibold leading-[1.4] text-[#385772]">{item.title}</h2>
      <div className="mt-4 flex items-center gap-4 text-sm leading-[1.7] text-[#875A41]">
        <span>回复时间：{item.time}</span>
        <span className="ml-auto font-semibold text-teal-700">&gt;&gt;</span>
      </div>
    </article>
  );
}

export function FeedSection() {
  return (
    <section className="min-w-0 space-y-4" id="feed">
      <FeedTabs />
      <FeedToolbar />
      <div className="space-y-3">
        {feedItems.map((item, index) => <FeedCard key={`${item.author}-${index}`} item={item} />)}
      </div>
    </section>
  );
}
