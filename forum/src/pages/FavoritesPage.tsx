import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bookmark, BookmarkX, LogIn, RefreshCw, Search } from 'lucide-react';
import {
  FavoriteApiError,
  fetchFavoriteThreads,
  setThreadBookmarked,
  type FavoriteThread,
} from '../api/favorite';
import { useConfirmDialog } from '../components/ConfirmDialog';
import { ForumToast } from '../components/ForumToast';
import { AppBackground } from '../components/layout/AppBackground';
import { LoadingState } from '../components/layout/LoadingState';
import { TopBar } from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useStaggerEntrance } from '../hooks/useStaggerEntrance';
import { getLoginPathWithReturnTo } from '../utils/authRoutes';
import { getThreadHref } from '../utils/threadRoutes';
import { getTitleIndentationClassName } from '../utils/titleIndentation';

type FavoritesState = {
  error: string;
  loading: boolean;
  loginRequired: boolean;
  owner: string;
  threads: FavoriteThread[];
};

type FavoriteSort = 'favorited' | 'replied';

const SORT_OPTIONS: { key: FavoriteSort; label: string }[] = [
  { key: 'favorited', label: '收藏时间' },
  { key: 'replied', label: '最新回复' },
];

export function FavoritesPage() {
  useDocumentTitle('收藏');
  const listRef = useStaggerEntrance<HTMLElement>('.favorites-list > li');
  const { status, viewer } = useAuth();
  const username = status === 'authenticated' ? viewer?.username ?? '' : '';
  const { confirm, confirmDialog } = useConfirmDialog();
  const [revision, setRevision] = useState(0);
  const [boardFilter, setBoardFilter] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<FavoriteSort>('favorited');
  const [removingKey, setRemovingKey] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const closeToast = useCallback(() => setToast(null), []);
  const [state, setState] = useState<FavoritesState>({
    error: '', loading: true, loginRequired: false, owner: '', threads: [],
  });

  useEffect(() => {
    if (!username) return;
    const controller = new AbortController();
    setState({ error: '', loading: true, loginRequired: false, owner: username, threads: [] });
    void fetchFavoriteThreads(controller.signal).then((threads) => {
      if (controller.signal.aborted) return;
      setState({ error: '', loading: false, loginRequired: false, owner: username, threads });
    }, (error: unknown) => {
      if (controller.signal.aborted) return;
      setState({
        error: error instanceof Error ? error.message : '收藏读取失败，请稍后重试。',
        loading: false,
        loginRequired: error instanceof FavoriteApiError && error.loginRequired,
        owner: username,
        threads: [],
      });
    });
    return () => controller.abort();
  }, [revision, username]);

  const belongsToViewer = Boolean(username) && state.owner === username;
  const loginRequired = status === 'guest' || (belongsToViewer && state.loginRequired);
  const loading = !loginRequired && (!belongsToViewer || state.loading);
  const threads = useMemo(() => (belongsToViewer ? state.threads : []), [belongsToViewer, state.threads]);
  const retry = () => setRevision((value) => value + 1);

  const boards = useMemo(() => {
    const counts = new Map<number, { bid: number; count: number; label: string }>();
    threads.forEach((thread) => {
      const entry = counts.get(thread.bid);
      if (entry) entry.count += 1;
      else counts.set(thread.bid, { bid: thread.bid, count: 1, label: thread.board });
    });
    return [...counts.values()].sort((left, right) => right.count - left.count || left.bid - right.bid);
  }, [threads]);
  const activeBoard = boardFilter !== null && boards.some((board) => board.bid === boardFilter) ? boardFilter : null;

  const visibleThreads = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const filtered = threads.filter((thread) => (
      (activeBoard === null || thread.bid === activeBoard)
      && (!keyword || thread.title.toLowerCase().includes(keyword) || thread.author.toLowerCase().includes(keyword))
    ));
    if (sort === 'replied') {
      return [...filtered].sort((left, right) => (right.lastReplyAt ?? 0) - (left.lastReplyAt ?? 0));
    }
    return filtered;
  }, [activeBoard, query, sort, threads]);

  async function removeFavorite(thread: FavoriteThread) {
    const label = thread.deleted ? '已删除的帖子' : `“${thread.title}”`;
    if (!(await confirm({ title: '取消收藏', message: `确认取消收藏${label}？`, confirmLabel: '取消收藏', danger: true }))) return;

    const key = favoriteKey(thread);
    setRemovingKey(key);
    try {
      await setThreadBookmarked({ bid: thread.bid, bookmarked: false, tid: thread.tid });
      setState((current) => ({
        ...current,
        threads: current.threads.filter((candidate) => favoriteKey(candidate) !== key),
      }));
    } catch (error) {
      setToast(error instanceof Error ? error.message : '取消收藏失败，请稍后重试。');
    } finally {
      setRemovingKey('');
    }
  }

  return (
    <div className="favorites-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#favorites" contextTitle="收藏" />
      <main className="favorites-shell" id="favorites" ref={listRef}>
        <section aria-labelledby="favorites-title" className="forum-card favorites-panel">
          <header className="favorites-heading">
            <div className="favorites-title">
              <span aria-hidden="true" className="favorites-title-icon"><Bookmark size={20} /></span>
              <h1 id="favorites-title">收藏</h1>
              {!loading && !loginRequired && !state.error && (
                <span className="favorites-total" aria-label={`共 ${threads.length} 个收藏`}>{threads.length}</span>
              )}
            </div>
            <div className="favorites-tools">
              {username && !loginRequired && (
                <button aria-label="刷新收藏" className="icon-button" disabled={loading} onClick={retry} title="刷新收藏" type="button">
                  <RefreshCw size={16} />
                </button>
              )}
            </div>
          </header>

          {loginRequired ? (
            <div className="favorites-state" role="status">
              <Bookmark aria-hidden="true" size={28} />
              <p>登录后查看收藏</p>
              <a className="topbar-login-link" href={getLoginPathWithReturnTo()}><LogIn size={15} />登录</a>
            </div>
          ) : loading ? (
            <LoadingState className="favorites-loading" label="正在读取收藏" variant="panel" />
          ) : state.error ? (
            <div className="favorites-state" role="alert">
              <p>{state.error}</p>
              <button className="favorites-retry" onClick={retry} type="button"><RefreshCw size={15} />重新加载</button>
            </div>
          ) : threads.length === 0 ? (
            <div className="favorites-state" role="status">
              <Bookmark aria-hidden="true" size={28} />
              <p>暂无收藏</p>
            </div>
          ) : (
            <div className="favorites-body">
              <aside aria-label="按版块筛选" className="favorites-boards">
                <button
                  aria-pressed={activeBoard === null}
                  className="favorites-board-filter"
                  onClick={() => setBoardFilter(null)}
                  type="button"
                >
                  <span>全部</span><span className="favorites-board-count">{threads.length}</span>
                </button>
                {boards.map((board) => (
                  <button
                    aria-pressed={activeBoard === board.bid}
                    className="favorites-board-filter"
                    key={board.bid}
                    onClick={() => setBoardFilter(board.bid)}
                    type="button"
                  >
                    <span>{board.label}</span><span className="favorites-board-count">{board.count}</span>
                  </button>
                ))}
              </aside>

              <div className="favorites-main">
                <div className="favorites-toolbar">
                  <label className="favorites-search">
                    <Search aria-hidden="true" size={15} />
                    <input
                      aria-label="搜索收藏"
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="搜索标题或作者"
                      type="search"
                      value={query}
                    />
                  </label>
                  <div aria-label="排序" className="favorites-sort" role="group">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        aria-pressed={sort === option.key}
                        key={option.key}
                        onClick={() => setSort(option.key)}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {visibleThreads.length > 0 ? (
                  <ul className="favorites-list">
                    {visibleThreads.map((thread) => (
                      <FavoriteItem
                        key={favoriteKey(thread)}
                        onRemove={() => void removeFavorite(thread)}
                        removing={removingKey === favoriteKey(thread)}
                        thread={thread}
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="favorites-state favorites-state-compact" role="status">
                    <p>没有匹配的收藏</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
      {confirmDialog}
      <ForumToast message={toast} onClose={closeToast} tone="error" />
    </div>
  );
}

function FavoriteItem({
  onRemove,
  removing,
  thread,
}: {
  onRemove: () => void;
  removing: boolean;
  thread: FavoriteThread;
}) {
  const favoritedDate = formatDate(thread.favoritedAt);
  const repliedDate = formatDate(thread.lastReplyAt);

  return (
    <li className="favorites-item" data-deleted={thread.deleted || undefined}>
      {thread.deleted ? (
        <div className="favorites-thread">
          <span className="favorites-thread-title favorites-thread-deleted">帖子已删除</span>
          <span className="favorites-thread-meta">
            <span className="favorites-board">{thread.board}</span>
            {favoritedDate && <span>收藏于 {favoritedDate}</span>}
          </span>
        </div>
      ) : (
        <a className="favorites-thread" href={getThreadHref(thread.bid, thread.tid)}>
          <span className={getTitleIndentationClassName(thread.title, 'favorites-thread-title')}>{thread.title}</span>
          <span className="favorites-thread-meta">
            <span className="favorites-board">{thread.board}</span>
            {thread.author && <span>{thread.author}</span>}
            <span className="favorites-number">回复 {thread.replies}</span>
            <span className="favorites-number">浏览 {thread.clicks}</span>
            {repliedDate && <span className="favorites-number">最新回复 {repliedDate}</span>}
            {favoritedDate && <span className="favorites-number">收藏于 {favoritedDate}</span>}
          </span>
        </a>
      )}
      <button
        aria-label={thread.deleted ? '取消收藏已删除的帖子' : `取消收藏${thread.title}`}
        className="favorites-remove"
        disabled={removing}
        onClick={onRemove}
        title="取消收藏"
        type="button"
      >
        <BookmarkX size={16} />
      </button>
    </li>
  );
}

function favoriteKey(thread: FavoriteThread) {
  return `${thread.bid}-${thread.tid}`;
}

function formatDate(timestamp: number | null) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
