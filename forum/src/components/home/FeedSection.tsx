import { ArrowDown, Eye, MessageCircle, RefreshCw } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import defaultAvatar from '../../assets/avatar/default-avatar.svg';
import type { HomeThread } from '../../api/home';
import { getBoardById } from '../../data/boards';
import type { HomeDataStatus } from '../../hooks/useHomeData';
import { LoadingSpinner } from '../layout/LoadingSpinner';
import { LoadingState } from '../layout/LoadingState';
import { RandomThreadButton } from '../layout/RandomThreadButton';
import { getForumNavigationHref } from '../../utils/forumNavigation';
import { getThreadTitleClassName } from '../../utils/threadTitleTypography';
import { preloadNearbyImages } from '../../utils/imagePreloading';

function FeedItem({ compactMode, item }: { compactMode: boolean; item: HomeThread }) {
  const authorHref = getForumNavigationHref(item.authorHref, window.location.href);
  const boardHref = getForumNavigationHref(`/?bid=${item.bid}`, window.location.href);
  const boardName = getBoardById(item.bid)?.label ?? `版块 ${item.bid}`;
  const threadHref = getForumNavigationHref(item.href, window.location.href);

  function useDefaultAvatar(event: React.SyntheticEvent<HTMLImageElement>) {
    if (event.currentTarget.src !== defaultAvatar) event.currentTarget.src = defaultAvatar;
  }

  if (compactMode) {
    return (
      <article className="feed-item feed-item-compact">
        <div className="feed-item-compact-row">
          <h2>
            <a className={getThreadTitleClassName(item.title, 'feed-item-compact-title')} href={threadHref}>
              {item.title}
            </a>
          </h2>
          <span className="feed-item-compact-meta">
            <a
              aria-label={`查看 ${item.author} 的个人主页`}
              className="feed-item-compact-author"
              href={authorHref}
            >
              {item.author}
            </a>
            <span aria-hidden="true">·</span>
            <time dateTime={item.timestamp}>{item.timeLabel}</time>
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="feed-item">
      <a className="feed-item-content" href={threadHref}>
        <h2 className={getThreadTitleClassName(item.title)}>
          {item.title}
        </h2>
        <p>{item.summary}</p>
      </a>
      <div className="feed-item-meta">
        <a className="feed-author" href={authorHref}>
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
        <span className="feed-board-meta">
          <span className="feed-meta-separator" aria-hidden="true">·</span>
          <a className="feed-board-link" href={boardHref}>{boardName}</a>
        </span>
        <span className="feed-stats">
          <span title={`${item.replies} 条评论`}><MessageCircle size={15} />{item.replies}</span>
          <span title={`${item.views} 次浏览`}><Eye size={16} />{item.views}</span>
        </span>
      </div>
    </article>
  );
}

type FeedSectionProps = {
  autoLoadMore: boolean;
  compactMode: boolean;
  error: string;
  hasMore: boolean;
  items: HomeThread[];
  onLoadMore: () => void;
  onRetry: () => void;
  status: HomeDataStatus;
};

export function FeedSection({ autoLoadMore, compactMode, error, hasMore, items, onLoadMore, onRetry, status }: FeedSectionProps) {
  const feedRef = useRef<HTMLElement>(null);
  const loadingMore = status === 'loading' && items.length > 0;
  const loadMoreFailed = status === 'error' && items.length > 0;

  useLayoutEffect(() => {
    const container = feedRef.current;
    if (container) return preloadNearbyImages(container);
  }, [compactMode, items]);

  useEffect(() => {
    if (!autoLoadMore || !hasMore || loadingMore || loadMoreFailed) return;

    let triggered = false;
    let frame = 0;

    function checkPageBottom() {
      frame = 0;
      if (triggered) return;

      const viewportBottom = window.scrollY + window.innerHeight;
      const pageBottom = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      if (pageBottom - viewportBottom > 160) return;

      triggered = true;
      onLoadMore();
    }

    function schedulePageBottomCheck() {
      if (frame || triggered) return;
      frame = window.requestAnimationFrame(checkPageBottom);
    }

    window.addEventListener('scroll', schedulePageBottomCheck, { passive: true });
    window.addEventListener('resize', schedulePageBottomCheck);
    schedulePageBottomCheck();

    return () => {
      window.removeEventListener('scroll', schedulePageBottomCheck);
      window.removeEventListener('resize', schedulePageBottomCheck);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [autoLoadMore, hasMore, items.length, loadMoreFailed, loadingMore, onLoadMore]);

  if (status === 'loading' && items.length === 0) {
    return (
      <LoadingState
        ariaLabel="论坛帖子"
        className="home-data-state"
        id="feed"
        label="正在加载最新回复"
        variant="panel"
      />
    );
  }

  return (
    <section ref={feedRef} className="feed-section" id="feed" aria-label="论坛帖子">
      {status === 'error' && items.length === 0 ? (
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
            <><LoadingSpinner size={16} />正在加载…</>
          ) : loadMoreFailed ? (
            <><RefreshCw size={15} />加载失败，重试</>
          ) : (
            <>加载更多 <ArrowDown size={16} /></>
          )}
        </button>
      )}

      {status === 'ready' && !hasMore && items.length >= 100 && (
        <div className="feed-random-card">
          <span>想看更多？</span>
          <RandomThreadButton className="feed-random-button" />
        </div>
      )}
    </section>
  );
}
