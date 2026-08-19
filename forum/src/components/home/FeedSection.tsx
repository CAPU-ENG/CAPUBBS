import { ArrowUpRight, Clock3, Eye, MessageSquare } from 'lucide-react';

const feedItems = [
  {
    board: '骑行与路线',
    title: '周末短途骑行路线讨论与集合说明',
    summary: '从校园出发的轻量路线，欢迎第一次参加活动的同学。',
    author: '山脚下的风',
    time: '12 分钟前',
    replies: 18,
    views: 126,
  },
  {
    board: '装备与维修',
    title: '新同学自行车选购：先从使用场景开始',
    summary: '通勤、长途和训练的需求不同，这里先整理一份基础清单。',
    author: '扳手同学',
    time: '38 分钟前',
    replies: 9,
    views: 84,
  },
  {
    board: '校园生活',
    title: '本周车协活动与工具借用时间',
    summary: '活动室开放时段及常用维修工具登记方式。',
    author: 'CAPU 车协',
    time: '1 小时前',
    replies: 6,
    views: 203,
  },
];

export function FeedSection() {
  return (
    <section className="surface overflow-hidden" id="main-feed">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 px-5 pb-4 pt-5 sm:px-6">
        <div>
          <p className="section-kicker">COMMUNITY FEED</p>
          <h2 className="section-title">社区正在发生</h2>
        </div>
        <div className="feed-tabs" aria-label="帖子筛选">
          <button className="feed-tab feed-tab-active" type="button">最近热门</button>
          <button className="feed-tab" type="button">最新回复</button>
          <button className="feed-tab" type="button">最新主题</button>
        </div>
      </div>

      <div className="divide-y divide-ink/[0.08]">
        {feedItems.map((item, index) => (
          <article className="feed-row group" key={item.title} style={{ animationDelay: `${160 + index * 70}ms` }}>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2.5">
                <span className="board-tag">{item.board}</span>
                <span className="flex items-center gap-1 text-[11px] text-moss/80">
                  <Clock3 aria-hidden="true" size={12} /> {item.time}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <h3 className="font-display text-[19px] font-bold leading-snug text-ink transition-colors group-hover:text-lake sm:text-xl">
                  {item.title}
                </h3>
                <ArrowUpRight className="mt-1.5 shrink-0 text-lake opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" aria-hidden="true" size={15} />
              </div>
              <p className="mt-2 text-sm leading-6 text-moss">{item.summary}</p>
              <p className="mt-3 text-xs font-semibold text-clay">{item.author}</p>
            </div>

            <div className="hidden shrink-0 items-center gap-4 self-end pb-0.5 text-xs font-semibold text-moss/80 sm:flex">
              <span className="flex items-center gap-1.5"><MessageSquare aria-hidden="true" size={14} />{item.replies}</span>
              <span className="flex items-center gap-1.5"><Eye aria-hidden="true" size={15} />{item.views}</span>
            </div>
          </article>
        ))}
      </div>

      <button className="load-more" type="button">查看全部讨论</button>
    </section>
  );
}
