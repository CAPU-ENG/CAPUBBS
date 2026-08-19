import { useEffect, useState } from 'react';
import { ArrowDown, Eye, LoaderCircle, MessageCircle, RefreshCw } from 'lucide-react';
import defaultAvatar from '../../assets/avatar/default-avatar.avif';
import type { HomeThread } from '../../api/home';
import type { HomeDataStatus } from '../../hooks/useHomeData';

function FeedItem({ item }: { item: HomeThread }) {
  function useDefaultAvatar(event: React.SyntheticEvent<HTMLImageElement>) {
    if (event.currentTarget.src !== defaultAvatar) event.currentTarget.src = defaultAvatar;
  }

  return (
    <article className="feed-item">
      <a className="feed-item-content" href={item.href}>
        <h2>{item.title}</h2>
        <p>{item.summary}</p>
      </a>
      <div className="feed-item-meta">
        <a className="feed-author" href={item.authorHref}>
          <img
            src={item.avatar || defaultAvatar}
            alt=""
            decoding="async"
            loading="lazy"
            onError={useDefaultAvatar}
          />
          <strong>{item.author}</strong>
        </a>
        <span className="feed-meta-separator">·</span>
        <time dateTime={item.timestamp}>{item.timeLabel}</time>
        <span className="feed-stats">
          <span title={`${item.replies} 条评论`}><MessageCircle size={15} />{item.replies}</span>
          <span title={`${item.views} 次浏览`}><Eye size={16} />{item.views}</span>
        </span>
      </div>
    </article>
  );
}

type FeedSectionProps = {
  error: string;
  items: HomeThread[];
  onRetry: () => void;
  status: HomeDataStatus;
};

export function FeedSection({ error, items, onRetry, status }: FeedSectionProps) {
  const [visibleCount, setVisibleCount] = useState(6);
  const hasMore = visibleCount < items.length;

  useEffect(() => setVisibleCount(6), [items]);

  return (
    <section className="feed-section" id="feed" aria-label="论坛帖子">
      {status === 'loading' && items.length === 0 ? (
        <div className="home-data-state" aria-live="polite">
          <LoaderCircle className="animate-spin" size={20} />
          <span>正在加载最新回复…</span>
        </div>
      ) : status === 'error' && items.length === 0 ? (
        <div className="home-data-state home-data-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={onRetry}><RefreshCw size={14} />重新加载</button>
        </div>
      ) : items.length === 0 ? (
        <div className="home-data-state"><span>暂时还没有帖子。</span></div>
      ) : (
        <div className="divide-y divide-[var(--line)]">
          {items.slice(0, visibleCount).map((item) => <FeedItem item={item} key={item.id} />)}
        </div>
      )}

      {hasMore && (
        <button className="load-more" type="button" onClick={() => setVisibleCount(items.length)}>
          加载更多帖子 <ArrowDown size={16} />
        </button>
      )}
    </section>
  );
}
