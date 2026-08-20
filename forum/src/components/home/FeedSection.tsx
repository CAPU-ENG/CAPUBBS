import { ArrowDown, Eye, LoaderCircle, MessageCircle, RefreshCw } from 'lucide-react';
import defaultAvatar from '../../assets/avatar/default-avatar.avif';
import type { HomeThread } from '../../api/home';
import type { HomeDataStatus } from '../../hooks/useHomeData';

function FeedItem({ compactMode, item }: { compactMode: boolean; item: HomeThread }) {
  function useDefaultAvatar(event: React.SyntheticEvent<HTMLImageElement>) {
    if (event.currentTarget.src !== defaultAvatar) event.currentTarget.src = defaultAvatar;
  }

  if (compactMode) {
    return (
      <article className="feed-item feed-item-compact">
        <a className="feed-item-compact-link" href={item.href}>
          <h2>{item.title}</h2>
          <span className="feed-item-compact-meta">
            <span>{item.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={item.timestamp}>{item.timeLabel}</time>
          </span>
        </a>
      </article>
    );
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
  compactMode: boolean;
  error: string;
  hasMore: boolean;
  items: HomeThread[];
  onLoadMore: () => void;
  onRetry: () => void;
  status: HomeDataStatus;
};

export function FeedSection({ compactMode, error, hasMore, items, onLoadMore, onRetry, status }: FeedSectionProps) {
  const loadingMore = status === 'loading' && items.length > 0;
  const loadMoreFailed = status === 'error' && items.length > 0;

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
          {items.map((item) => <FeedItem compactMode={compactMode} item={item} key={item.id} />)}
        </div>
      )}

      {items.length > 0 && hasMore && (
        <button
          className="load-more"
          disabled={loadingMore}
          onClick={loadMoreFailed ? onRetry : onLoadMore}
          type="button"
        >
          {loadingMore ? (
            <><LoaderCircle className="animate-spin" size={16} />正在加载…</>
          ) : loadMoreFailed ? (
            <><RefreshCw size={15} />加载失败，重试</>
          ) : (
            <>加载更多 <ArrowDown size={16} /></>
          )}
        </button>
      )}
    </section>
  );
}
