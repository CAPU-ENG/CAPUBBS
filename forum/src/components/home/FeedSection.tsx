import { Check, ChevronRight, Eye, MessageSquare } from 'lucide-react';
import defaultAvatar from '../../assets/avatar/default-avatar.avif';

const feedItems = [
  {
    author: "蓝色车架",
    board: "行者足音",
    title: "端午活动报名说明",
    summary: "集合时间、路线安排与报名注意事项汇总。",
    time: "05.20 11:48",
    replies: 18,
    views: 126,
  },
  {
    author: "阿北",
    board: "车友宝典",
    title: "雨天骑行挡泥板推荐",
    summary: "从覆盖范围、安装方式和日常维护聊聊实际体验。",
    time: "05.20 10:12",
    replies: 9,
    views: 84,
  },
  {
    author: "南门修车铺",
    board: "一技之长",
    title: "公路车变速系统基础调试",
    summary: "异响、跳齿和换挡不顺时可以先检查这些位置。",
    time: "05.19 21:36",
    replies: 12,
    views: 203,
  },
  {
    author: "小白杨",
    board: "考察与社会",
    title: "暑期长途路线资料整理",
    summary: "沿途补给点、住宿和路况信息持续更新中。",
    time: "05.19 18:20",
    replies: 24,
    views: 318,
  },
  {
    author: "蓝色车架",
    board: "车协工作区",
    title: "活动室本周开放时间",
    summary: "工具借用和车辆维护请提前在帖子内登记。",
    time: "05.19 15:02",
    replies: 6,
    views: 96,
  },
  {
    author: "阿北",
    board: "五湖四海",
    title: "毕业骑行照片征集",
    summary: "欢迎补充原图、路线记录以及途中故事。",
    time: "05.19 12:47",
    replies: 15,
    views: 172,
  },
  {
    author: "蓝色车架",
    board: "行者足音",
    title: "端午活动报名说明",
    summary: "集合时间、路线安排与报名注意事项汇总。",
    time: "05.20 11:48",
    replies: 18,
    views: 126,
  },
  {
    author: "阿北",
    board: "车友宝典",
    title: "雨天骑行挡泥板推荐",
    summary: "从覆盖范围、安装方式和日常维护聊聊实际体验。",
    time: "05.20 10:12",
    replies: 9,
    views: 84,
  },
  {
    author: "南门修车铺",
    board: "一技之长",
    title: "公路车变速系统基础调试",
    summary: "异响、跳齿和换挡不顺时可以先检查这些位置。",
    time: "05.19 21:36",
    replies: 12,
    views: 203,
  },
  {
    author: "小白杨",
    board: "考察与社会",
    title: "暑期长途路线资料整理",
    summary: "沿途补给点、住宿和路况信息持续更新中。",
    time: "05.19 18:20",
    replies: 24,
    views: 318,
  },
  {
    author: "蓝色车架",
    board: "车协工作区",
    title: "活动室本周开放时间",
    summary: "工具借用和车辆维护请提前在帖子内登记。",
    time: "05.19 15:02",
    replies: 6,
    views: 96,
  },
  {
    author: "阿北",
    board: "五湖四海",
    title: "毕业骑行照片征集",
    summary: "欢迎补充原图、路线记录以及途中故事。",
    time: "05.19 12:47",
    replies: 15,
    views: 172,
  },
];


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

function MobileFeedCard({ item }: { item: (typeof feedItems)[number] }) {
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

function DesktopFeedRow({ item }: { item: (typeof feedItems)[number] }) {
  return (
    <article className="group grid cursor-default grid-cols-[48px_minmax(0,1fr)_150px] items-center gap-4 px-5 py-4 transition-colors hover:bg-white/45">
      <img src={defaultAvatar} alt="" className="h-12 w-12 rounded-full border border-white/70 object-cover shadow-sm" />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <span className="truncate font-semibold text-[#875A41]">{item.author}</span>
          <span className="text-zinc-300">·</span>
          <span className="shrink-0 text-zinc-500">回复于 {item.time}</span>
          <span className="text-zinc-300">·</span>
          <span className="truncate font-medium text-emerald-800/80">{item.board}</span>
        </div>
        <h2 className="capubbs-title-wrap mt-1.5 text-[16px] font-semibold leading-[1.35] text-[#385772] transition-colors group-hover:text-[#28465f]">{item.title}</h2>
        <p className="mt-1 truncate text-xs leading-5 text-zinc-500">{item.summary}</p>
      </div>
      <div className="flex items-center justify-end gap-4 text-xs text-zinc-500">
        <span className="inline-flex min-w-10 items-center justify-center gap-1.5" title="回复数"><MessageSquare size={14} />{item.replies}</span>
        <span className="inline-flex min-w-11 items-center justify-center gap-1.5" title="浏览数"><Eye size={15} />{item.views}</span>
        <ChevronRight size={17} className="ml-1 text-teal-700 transition-transform group-hover:translate-x-0.5" />
      </div>
    </article>
  );
}

function DesktopFeed() {
  return (
    <section
      className="card-surface overflow-hidden rounded-lg border border-zinc-200 shadow-panel"
      aria-labelledby="desktop-feed-title"
    >
      <div className="divide-y divide-zinc-200/80">
        {feedItems.map((item, index) => (
          <DesktopFeedRow key={`${item.author}-${index}`} item={item} />
        ))}
      </div>
      <button
        type="button"
        className="flex h-12 w-full items-center justify-center gap-1.5 border-t border-zinc-200/80 text-sm font-semibold text-[#385772] transition-colors hover:bg-white/45"
      >
        查看全部讨论 <ChevronRight size={16} />
      </button>
    </section>
  );
}

export function FeedSection() {
  return (
    <section className="min-w-0" id="feed">
      <div className="hidden lg:block">
        <DesktopFeed />
      </div>
      <div className="space-y-4 lg:hidden">
        <FeedToolbar />
        <div className="space-y-3">
          {feedItems.map((item, index) => (
            <MobileFeedCard key={`${item.author}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
