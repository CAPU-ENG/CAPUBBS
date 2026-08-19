import { LoaderCircle, LockKeyhole, PenLine, RefreshCw, Settings2, Sparkles } from 'lucide-react';
import { AppBackground } from '../components/layout/AppBackground';
import { Pagination } from '../components/layout/Pagination';
import { TopBar } from '../components/layout/TopBar';
import { getBoardCoverImage } from '../data/boardCovers';
import type { BoardThreadData } from '../api/board';
import type { DemoBoardId } from '../data/boardDemo';
import { useBoardData } from '../hooks/useBoardData';
import { useScrollContextTitle } from '../hooks/useScrollContextTitle';
import { useRef } from 'react';

function getRequestedPage() {
  const value = Number(new URLSearchParams(window.location.search).get('page') ?? '1');
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function getDigestOnly() {
  return new URLSearchParams(window.location.search).get('digest') === '1';
}

function boardPageHref(boardId: DemoBoardId, page: number, digestOnly: boolean) {
  const params = new URLSearchParams();
  params.set('board', String(boardId));
  if (page > 1) params.set('page', String(page));
  if (digestOnly) params.set('digest', '1');
  return `/?${params.toString()}`;
}

function threadHref(thread: BoardThreadData) {
  const params = new URLSearchParams({
    bid: String(thread.bid),
    page: '1',
    thread: String(thread.id),
  });
  return `/?${params.toString()}`;
}

function authorHref(author: string) {
  return `/bbs/home/?user=${encodeURIComponent(author)}`;
}

function ExactTime({ label, value }: { label: string; value: string }) {
  const [date, time] = value.split(' ');
  return (
    <span className="board-thread-time">
      <span className="board-thread-time-label">{label}</span>
      <time dateTime={time?.includes(':') ? value.replace(' ', 'T') : undefined}>
        <span>{date}</span>
        {time ? <span>{time}</span> : null}
      </time>
    </span>
  );
}

function PinnedStatus({ thread }: { thread: BoardThreadData }) {
  if (!thread.status?.pinned) return null;

  return <span className="board-status board-status-pinned">置顶</span>;
}

function TrailingThreadStatuses({ thread }: { thread: BoardThreadData }) {
  if (!thread.status?.digest && !thread.status?.locked) return null;

  return (
    <span className="board-thread-statuses" aria-label="主题状态">
      {thread.status?.digest ? <span className="board-status board-status-digest"><Sparkles size={11} />精品</span> : null}
      {thread.status?.locked ? <span className="board-status"><LockKeyhole size={11} />锁定</span> : null}
    </span>
  );
}

function ThreadRow({ thread }: { thread: BoardThreadData }) {
  return (
    <tr className="board-thread-row">
      <td className="board-thread-title-cell">
        <div className="board-thread-title-line">
          <PinnedStatus thread={thread} />
          <a href={threadHref(thread)}>{thread.title}</a>
          <TrailingThreadStatuses thread={thread} />
        </div>
      </td>
      <td className="board-thread-author-cell">
        <a className="board-thread-user" href={authorHref(thread.author)}>{thread.author}</a>
        <ExactTime label="发布时间" value={thread.createdAt} />
      </td>
      <td className="board-thread-last-cell">
        <a className="board-thread-user" href={authorHref(thread.lastReplyBy)}>{thread.lastReplyBy}</a>
        <ExactTime label="最后回复时间" value={thread.lastReplyAt} />
      </td>
      <td className="board-thread-counts">
        <span>{thread.replies}</span>
        <i aria-hidden="true">/</i>
        <span>{thread.views}</span>
      </td>
    </tr>
  );
}

export function BoardPage({ boardId }: { boardId: DemoBoardId }) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const digestOnly = getDigestOnly();
  const requestedPage = getRequestedPage();
  const { data, error, retry, status } = useBoardData(boardId, requestedPage, digestOnly);
  const showTitleInTopBar = useScrollContextTitle(titleRef);
  const boardCover = getBoardCoverImage(boardId);

  function toggleDigestOnly() {
    window.location.href = boardPageHref(boardId, 1, !digestOnly);
  }

  if (!data) {
    return (
      <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
        <AppBackground />
        <TopBar />
        <main className="board-page-shell">
          <section className="board-data-state" aria-live="polite">
            {status === 'loading' ? (
              <>
                <LoaderCircle className="animate-spin" size={22} />
                <h1>正在读取版面</h1>
                <p>版面信息和最新回复正在载入。</p>
              </>
            ) : (
              <>
                <h1>版面暂时无法打开</h1>
                <p>{error}</p>
                <button onClick={retry} type="button"><RefreshCw size={15} />重新加载</button>
              </>
            )}
          </section>
        </main>
      </div>
    );
  }

  const { board, currentPage, pageCount, threads } = data;

  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar
        contextHref="#board-title"
        contextTitle={board.name}
        showContextTitle={showTitleInTopBar}
      />

      <main className="board-page-shell">
        <header className="board-title-card">
          <div aria-hidden="true" className="board-title-artwork">
            <img alt="" src={boardCover} />
          </div>
          <div className="board-title-content">
            <div className="board-title-copy">
              <h1 id="board-title" ref={titleRef}>{board.name}</h1>
              <div className="board-moderators">
                <span>版主</span>
                {board.moderators.map((moderator) => (
                  <a href={authorHref(moderator)} key={moderator}>{moderator}</a>
                ))}
                {board.moderators.length === 0 ? <small>暂无</small> : null}
              </div>
            </div>

            <div className="board-title-side">
              <dl className="board-stat-grid">
                <div><dt>主题</dt><dd>{board.stats.topics.toLocaleString()}</dd></div>
                <div><dt>回复</dt><dd>{board.stats.replies.toLocaleString()}</dd></div>
                <div><dt>今日</dt><dd>{board.stats.today.toLocaleString()}</dd></div>
                <div><dt>在线</dt><dd>{board.stats.online?.toLocaleString() ?? '—'}</dd></div>
              </dl>
              <div className="board-title-actions">
                <button
                  aria-pressed={digestOnly}
                  className={`board-secondary-action ${digestOnly ? 'board-digest-action-active' : ''}`}
                  onClick={toggleDigestOnly}
                  type="button"
                >
                  <Sparkles size={15} />{digestOnly ? '取消筛选' : '只看精品'}
                </button>
                <a className="board-secondary-action" href={`/bbs/manage/?bid=${board.id}`}>
                  <Settings2 size={15} />管理版面
                </a>
                <a className="board-primary-action" href={`/bbs/post/?bid=${board.id}`}>
                  <PenLine size={15} />发表主题
                </a>
              </div>
            </div>
          </div>
        </header>

        <section className="board-thread-section" aria-label="主题列表">
          <div className="board-thread-table-wrap">
            <table className="board-thread-table">
              <colgroup>
                <col className="board-thread-title-column" />
                <col className="board-thread-author-column" />
                <col className="board-thread-last-column" />
                <col className="board-thread-count-column" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">主题</th>
                  <th scope="col">作者</th>
                  <th scope="col">最后回复</th>
                  <th scope="col">回复/浏览</th>
                </tr>
              </thead>
              <tbody>
                {threads.map((thread) => <ThreadRow key={thread.id} thread={thread} />)}
              </tbody>
            </table>
            {threads.length === 0 ? (
              <div className="board-thread-empty">{digestOnly ? '这个版面暂时没有精品主题。' : '这个版面暂时还没有主题。'}</div>
            ) : null}
          </div>

          <footer className="board-pagination-footer">
            <Pagination
              ariaLabel="版面分页"
              currentPage={currentPage}
              pageCount={pageCount}
              pageHref={(page) => boardPageHref(boardId, page, digestOnly)}
            />
          </footer>
        </section>
      </main>
    </div>
  );
}
