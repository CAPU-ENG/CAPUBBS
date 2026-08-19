import { Check, ChevronRight, Eye, MessageSquare, SlidersHorizontal } from 'lucide-react';
import defaultAvatar from '../../assets/avatar/default-avatar.avif';

const feedItems = [
  { author: '蓝色车架', board: '行者足音', title: '端午活动报名说明', summary: '集合时间、路线安排与报名注意事项汇总。', time: '05.20 11:48', replies: 18, views: 126 },
  { author: '阿北', board: '车友宝典', title: '雨天骑行挡泥板推荐', summary: '从覆盖范围、安装方式和日常维护聊聊实际体验。', time: '05.20 10:12', replies: 9, views: 84 },
  { author: '南门修车铺', board: '一技之长', title: '公路车变速系统基础调试', summary: '异响、跳齿和换挡不顺时可以先检查这些位置。', time: '05.19 21:36', replies: 12, views: 203 },
  { author: '小白杨', board: '考察与社会', title: '暑期长途路线资料整理', summary: '沿途补给点、住宿和路况信息持续更新中。', time: '05.19 18:20', replies: 24, views: 318 },
  { author: '蓝色车架', board: '车协工作区', title: '活动室本周开放时间', summary: '工具借用和车辆维护请提前在帖子内登记。', time: '05.19 15:02', replies: 6, views: 96 },
  { author: '阿北', board: '五湖四海', title: '毕业骑行照片征集', summary: '欢迎补充原图、路线记录以及途中故事。', time: '05.19 12:47', replies: 15, views: 172 },
];

function FeedTabs() {
  return (
    <div className="segmented-tabs-surface flex gap-1 rounded-lg border p-1 shadow-sm">
      <button type="button" className="card-surface flex h-10 flex-1 items-center justify-center rounded-md border border-zinc-200/80 px-3 text-sm font-semibold text-zinc-950 shadow-sm">最新回帖</button>
      <button type="button" className="flex h-10 flex-1 items-center justify-center rounded-md border border-transparent px-3 text-sm font-semibold text-zinc-700">最新主题</button>
      <button type="button" className="hidden h-10 shrink-0 items-center gap-2 rounded-md border border-transparent px-3 text-sm font-semibold text-[#385772] transition hover:bg-white/45 lg:flex" aria-label="显示设置">
        <SlidersHorizontal size={16} />
        <span>显示</span>
      </button>
    </div>
  );
}

function FeedToolbar() {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 lg:hidden">
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

function MobileFeedCard({ item }: { item: (typeof feedItems)[number] }) {
  return (
    <article className="card-surface cursor-default rounded-lg border border-zinc-200 p-4 shadow-panel transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500/35 hover:bg-white/[0.96] hover:shadow-lg lg:hidden">
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

function DesktopFeedCard({ item }: { item: (typeof feedItems)[number] }) {
  return (
    <article className="card-surface group hidden cursor-default rounded-lg border border-zinc-200 p-4 shadow-panel transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500/35 hover:bg-white/[0.97] hover:shadow-lg lg:grid lg:grid-cols-[44px_minmax(0,1fr)_auto] lg:items-center lg:gap-3">
      <img src={defaultAvatar} alt="" className="h-11 w-11 rounded-full object-cover" />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <span className="truncate font-semibold text-[#875A41]">{item.author}</span>
          <span className="text-zinc-300">·</span>
          <span className="shrink-0 text-zinc-500">{item.time}</span>
        </div>
        <h2 className="capubbs-title-wrap mt-1 text-base font-semibold leading-[1.4] text-[#385772] transition group-hover:text-[#28465f]">{item.title}</h2>
        <p className="mt-1 truncate text-xs text-zinc-500">{item.summary}</p>
      </div>
      <div className="flex min-w-[8.75rem] items-center justify-end gap-3 text-xs text-zinc-500">
        <span className="rounded-md bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800">{item.board}</span>
        <span className="inline-flex items-center gap-1"><MessageSquare size={14} />{item.replies}</span>
        <span className="inline-flex items-center gap-1"><Eye size={15} />{item.views}</span>
        <ChevronRight size={16} className="text-teal-700 transition-transform group-hover:translate-x-0.5" />
      </div>
    </article>
  );
}

function FeedCard({ item }: { item: (typeof feedItems)[number] }) {
  return <><MobileFeedCard item={item} /><DesktopFeedCard item={item} /></>;
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
