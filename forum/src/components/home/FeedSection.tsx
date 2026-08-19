import { useState } from 'react';
import { ArrowDown, Eye, MessageCircle } from 'lucide-react';
import defaultAvatar from '../../assets/avatar/default-avatar.avif';

const feedItems = [
  {
    id: 101,
    author: '蓝色车架',
    title: '端午活动报名说明：集合时间、路线与补给安排',
    summary: '本次路线将经过滨江绿道与西山缓坡，全程约 62 公里。请参加者提前检查车辆、准备基础补给，并在出发前完成签到。',
    time: '2 小时前',
    replies: 18,
    views: 126,
  },
  {
    id: 102,
    author: '阿北',
    title: '雨天骑行挡泥板应该怎么选？聊聊几种常见方案',
    summary: '从覆盖范围、安装方式和日常维护三个角度记录实际体验。短挡泥板更轻便，但在连续降雨和多人编队时仍有明显局限。',
    time: '4 小时前',
    replies: 9,
    views: 84,
  },
  {
    id: 103,
    author: '南门修车铺',
    title: '公路车变速系统基础调试：从异响到换挡顺畅',
    summary: '异响、跳齿和换挡不顺时，可以先从尾钩、限位螺丝以及线张力开始排查。本文按操作顺序整理了一套基础检查流程。',
    time: '昨天 21:36',
    replies: 12,
    views: 203,
  },
  {
    id: 104,
    author: '小白杨',
    title: '暑期长途路线资料整理：补给、住宿与近期路况',
    summary: '计划沿太行山一线完成暑期长途，目前把沿途补给点、可携车住宿和近期施工路段整理在一起，欢迎走过的车友继续补充。',
    time: '昨天 18:20',
    replies: 24,
    views: 318,
  },
  {
    id: 105,
    author: '蓝色车架',
    title: '活动室本周开放时间与工具借用说明',
    summary: '本周二、四晚与周六下午开放。常用维修工具可以现场登记借用，需要长时间占用工作台的车辆请提前在帖内说明。',
    time: '昨天 15:02',
    replies: 6,
    views: 96,
  },
  {
    id: 106,
    author: '阿北',
    title: '毕业骑行照片征集：把路上的故事留在论坛',
    summary: '欢迎补充毕业骑行的原图、路线记录以及途中故事。后续会挑选部分内容制作车协年度影像，提交前请保留原始尺寸。',
    time: '昨天 12:47',
    replies: 15,
    views: 172,
  },
  {
    id: 107,
    author: '灰鲸',
    title: '新生第一次夜骑，需要提前准备哪些东西？',
    summary: '除了前后车灯和头盔，还想了解编队手势、补胎工具与衣物选择。希望大家分享第一次参加夜骑时真正派上用场的装备。',
    time: '前天 22:15',
    replies: 31,
    views: 452,
  },
  {
    id: 108,
    author: '树影',
    title: '妙峰山清晨训练记录，以及几个容易忽略的节奏问题',
    summary: '这次尝试用更稳定的功率完成前半程，最后五公里的体感明显好于以往。记录气温、补水和几个坡段的节奏变化供参考。',
    time: '前天 19:40',
    replies: 20,
    views: 279,
  },
  {
    id: 109,
    author: '慢慢骑',
    title: '校园通勤车的日常保养清单，一个月十分钟就够了',
    summary: '把链条清洁、胎压检查、刹车块磨损和螺丝复紧做成一张简短清单。频率不必过高，但能避免大多数突然出现的小故障。',
    time: '3 天前',
    replies: 8,
    views: 141,
  },
];

function FeedItem({ item }: { item: (typeof feedItems)[number] }) {
  return (
    <article className="feed-item">
      <a className="feed-item-content" href={`#thread-${item.id}`}>
        <h2>{item.title}</h2>
        <p>{item.summary}</p>
      </a>
      <div className="feed-item-meta">
        <a className="feed-author" href={`#author-${item.author}`}>
          <img src={defaultAvatar} alt="" />
          <strong>{item.author}</strong>
        </a>
        <span className="feed-meta-separator">·</span>
        <time>{item.time}</time>
        <span className="feed-stats">
          <span title={`${item.replies} 条评论`}><MessageCircle size={15} />{item.replies}</span>
          <span title={`${item.views} 次浏览`}><Eye size={16} />{item.views}</span>
        </span>
      </div>
    </article>
  );
}

export function FeedSection() {
  const [visibleCount, setVisibleCount] = useState(6);
  const hasMore = visibleCount < feedItems.length;

  return (
    <section className="feed-section" id="feed" aria-labelledby="recent-replies-title">
      <header className="feed-header">
        <div>
          <p className="eyebrow">RECENT CONVERSATIONS</p>
          <h1 id="recent-replies-title" className="section-title">最近回复</h1>
        </div>
        <span className="feed-order-note">按最后回复时间排序</span>
      </header>

      <div className="divide-y divide-[var(--line)]">
        {feedItems.slice(0, visibleCount).map((item) => <FeedItem item={item} key={item.id} />)}
      </div>

      {hasMore && (
        <button className="load-more" type="button" onClick={() => setVisibleCount(feedItems.length)}>
          加载更多帖子 <ArrowDown size={16} />
        </button>
      )}
    </section>
  );
}
