import { CalendarPlus, LoaderCircle, LockKeyhole, PenLine, RefreshCw, Settings2, Sparkles } from 'lucide-react';
import { AppBackground } from '../components/layout/AppBackground';
import { Pagination } from '../components/layout/Pagination';
import { TopBar } from '../components/layout/TopBar';
import { getBoardCoverImage } from '../data/boardCovers';
import { SECONDARY_BOARDS } from '../data/boards';
import {
  manageBoardThread,
  type BoardThreadAction,
  type BoardThreadData,
} from '../api/board';
import { useAuth } from '../context/AuthContext';
import { useBoardData } from '../hooks/useBoardData';
import { useScrollContextTitle } from '../hooks/useScrollContextTitle';
import { getPublicProfilePath } from '../utils/userRoutes';
import { getThreadComposeHref } from '../utils/threadRoutes';
import { getThreadTitleClassName } from '../utils/threadTitleTypography';
import { useEffect, useRef, useState } from 'react';

function getRequestedPage() {
  const params = new URLSearchParams(window.location.search);
  const value = Number(params.get('p') ?? params.get('page') ?? '1');
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function getDigestOnly() {
  return new URLSearchParams(window.location.search).get('digest') === '1';
}

function boardPageHref(boardId: number, page: number, digestOnly: boolean) {
  const params = new URLSearchParams();
  params.set('bid', String(boardId));
  if (page > 1) params.set('p', String(page));
  if (digestOnly) params.set('digest', '1');
  return `/?${params.toString()}`;
}

function threadHref(thread: BoardThreadData) {
  const params = new URLSearchParams({
    bid: String(thread.bid),
    p: '1',
    tid: String(thread.id),
  });
  return `/?${params.toString()}`;
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
  if (!thread.status?.top) return null;

  return <span className="board-status board-status-pinned">置顶</span>;
}

function TrailingThreadStatuses({ thread }: { thread: BoardThreadData }) {
  const globallyPinned = thread.status?.pinned && !thread.status?.top;
  if (!globallyPinned && !thread.status?.digest && !thread.status?.locked) return null;

  return (
    <span className="board-thread-statuses" aria-label="主题状态">
      {globallyPinned ? <span className="board-status">全局置顶</span> : null}
      {thread.status?.digest ? <span className="board-status board-status-digest"><Sparkles size={11} />精品</span> : null}
      {thread.status?.locked ? <span className="board-status"><LockKeyhole size={11} />锁定</span> : null}
    </span>
  );
}

function ThreadManagementActions({
  busyAction,
  onAction,
  thread,
}: {
  busyAction: string | null;
  onAction: (thread: BoardThreadData, action: BoardThreadAction) => void;
  thread: BoardThreadData;
}) {
  const actions: Array<{ action: BoardThreadAction; danger?: boolean; label: string }> = [
    { action: 'extr', label: thread.status.digest ? '取消加精' : '加精' },
    { action: 'top', label: thread.status.top ? '取消置顶' : '置顶' },
    { action: 'lock', label: thread.status.locked ? '解锁' : '锁定' },
    { action: 'delete', danger: true, label: '删除' },
  ];

  return (
    <td className="board-thread-management-cell">
      <div className="board-thread-management-actions">
        {actions.map(({ action, danger, label }) => {
          const actionKey = `${thread.id}-${action}`;
          const pending = busyAction === actionKey;
          return (
            <button
              aria-label={`${label}主题：${thread.title}`}
              className={danger ? 'board-thread-management-danger' : undefined}
              disabled={busyAction !== null}
              key={action}
              onClick={() => onAction(thread, action)}
              type="button"
            >
              {pending ? '处理中' : label}
            </button>
          );
        })}
      </div>
    </td>
  );
}

function ThreadRow({
  busyAction,
  managementMode,
  onManage,
  thread,
}: {
  busyAction: string | null;
  managementMode: boolean;
  onManage: (thread: BoardThreadData, action: BoardThreadAction) => void;
  thread: BoardThreadData;
}) {
  return (
    <tr className="board-thread-row">
      <td className="board-thread-title-cell">
        <div className="board-thread-title-line">
          <PinnedStatus thread={thread} />
          <a className={getThreadTitleClassName(thread.title)} href={threadHref(thread)}>{thread.title}</a>
          <TrailingThreadStatuses thread={thread} />
        </div>
      </td>
      <td className="board-thread-author-cell">
        <a className="board-thread-user" href={getPublicProfilePath(thread.author)}>{thread.author}</a>
        <span aria-hidden="true" className="board-thread-author-separator">·</span>
        <ExactTime label="发布时间" value={thread.createdAt} />
      </td>
      <td className="board-thread-last-cell">
        <a className="board-thread-user" href={getPublicProfilePath(thread.lastReplyBy)}>{thread.lastReplyBy}</a>
        <ExactTime label="最后回复时间" value={thread.lastReplyAt} />
      </td>
      <td className="board-thread-counts">
        <span>{thread.replies}</span>
        <i aria-hidden="true">/</i>
        <span>{thread.views}</span>
      </td>
      {managementMode ? (
        <ThreadManagementActions busyAction={busyAction} onAction={onManage} thread={thread} />
      ) : null}
    </tr>
  );
}

export function BoardPage({ boardId }: { boardId: number }) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const digestOnly = getDigestOnly();
  const requestedPage = getRequestedPage();
  const { data, error, retry, status } = useBoardData(boardId, requestedPage, digestOnly);
  const { status: authStatus, viewer } = useAuth();
  const [managementMode, setManagementMode] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [managementFeedback, setManagementFeedback] = useState<{
    kind: 'error' | 'success';
    text: string;
  } | null>(null);
  const showTitleInTopBar = useScrollContextTitle(titleRef);
  const boardCover = getBoardCoverImage(boardId);
  const isSecondaryBoard = SECONDARY_BOARDS.some((board) => board.id === boardId);
  const canManage = Boolean(
    data
    && authStatus === 'authenticated'
    && viewer
    && (viewer.rights >= 3 || data.board.moderators.includes(viewer.username)),
  );
  const canCreateActivity = Boolean(
    data
    && data.board.id === 1
    && authStatus === 'authenticated'
    && (viewer?.rights ?? 0) >= 2,
  );
  const starRestricted = Boolean(
    data
    && authStatus === 'authenticated'
    && viewer
    && viewer.rights <= 1
    && viewer.stars < data.board.requiredStars,
  );

  useEffect(() => {
    if (!canManage) setManagementMode(false);
  }, [canManage]);

  function toggleDigestOnly() {
    window.location.href = boardPageHref(boardId, 1, !digestOnly);
  }

  async function handleThreadAction(thread: BoardThreadData, action: BoardThreadAction) {
    if (!canManage || busyAction) return;
    if (action === 'delete' && !window.confirm(`确定删除主题“${thread.title}”吗？删除后可在回收站恢复。`)) {
      return;
    }

    const actionKey = `${thread.id}-${action}`;
    const actionLabel = {
      delete: '删除',
      extr: thread.status.digest ? '取消加精' : '加精',
      lock: thread.status.locked ? '解锁' : '锁定',
      top: thread.status.top ? '取消置顶' : '置顶',
    }[action];

    setBusyAction(actionKey);
    setManagementFeedback(null);
    try {
      await manageBoardThread(boardId, thread.id, action);
      setManagementFeedback({ kind: 'success', text: `“${thread.title}”已${actionLabel}。` });
      retry();
    } catch (actionError) {
      setManagementFeedback({
        kind: 'error',
        text: actionError instanceof Error ? actionError.message : '管理操作失败，请稍后重试。',
      });
    } finally {
      setBusyAction(null);
    }
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
        <header className={`board-title-card ${isSecondaryBoard ? 'board-title-card-secondary' : ''}`}>
          {!isSecondaryBoard ? (
            <div aria-hidden="true" className="board-title-artwork">
              <img alt="" src={boardCover} />
            </div>
          ) : null}
          <div className="board-title-content">
            <div className="board-title-copy">
              <h1 id="board-title" ref={titleRef}>{board.name}</h1>
              <div className="board-moderators">
                <span>版主</span>
                {board.moderators.map((moderator) => (
                  <a href={getPublicProfilePath(moderator)} key={moderator}>{moderator}</a>
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
                {canManage ? (
                  <button
                    aria-pressed={managementMode}
                    className={`board-secondary-action ${managementMode ? 'board-management-action-active' : ''}`}
                    onClick={() => {
                      setManagementMode((current) => !current);
                      setManagementFeedback(null);
                    }}
                    type="button"
                  >
                    <Settings2 size={15} />{managementMode ? '退出管理' : '管理版面'}
                  </button>
                ) : null}
                {canCreateActivity ? (
                  <a className="board-activity-action" href={getThreadComposeHref(board.id, undefined, 'activity')}>
                    <CalendarPlus size={15} />发起活动
                  </a>
                ) : null}
                {authStatus === 'authenticated' && starRestricted ? (
                  <button
                    className="board-primary-action"
                    disabled
                    title={`在本版发帖或回复至少需要 ${board.requiredStars} 星`}
                    type="button"
                  >
                    <PenLine size={15} />至少 {board.requiredStars} 星
                  </button>
                ) : authStatus === 'authenticated' ? (
                  <a className="board-primary-action" href={getThreadComposeHref(board.id)}>
                    <PenLine size={15} />发表主题
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <section className="board-thread-section" aria-label="主题列表">
          {managementMode && managementFeedback ? (
            <div
              className={`board-management-feedback board-management-feedback-${managementFeedback.kind}`}
              role={managementFeedback.kind === 'error' ? 'alert' : 'status'}
            >
              {managementFeedback.text}
            </div>
          ) : null}
          <div className="board-thread-table-wrap">
            <table className={`board-thread-table ${managementMode ? 'board-thread-table-managing' : ''}`}>
              <colgroup>
                <col className="board-thread-title-column" />
                <col className="board-thread-author-column" />
                <col className="board-thread-last-column" />
                <col className="board-thread-count-column" />
                {managementMode ? <col className="board-thread-management-column" /> : null}
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">主题</th>
                  <th scope="col">作者</th>
                  <th scope="col">最后回复</th>
                  <th scope="col">回复/浏览</th>
                  {managementMode ? <th scope="col">管理</th> : null}
                </tr>
              </thead>
              <tbody>
                {threads.map((thread) => (
                  <ThreadRow
                    busyAction={busyAction}
                    key={thread.id}
                    managementMode={managementMode}
                    onManage={handleThreadAction}
                    thread={thread}
                  />
                ))}
              </tbody>
            </table>
            {threads.length === 0 ? (
              <div className="board-thread-empty">{digestOnly ? '这个版面暂时没有精品主题。' : '这个版面暂时还没有主题。'}</div>
            ) : null}
          </div>

          <footer className="board-pagination-footer forum-pagination-card">
            <Pagination
              ariaLabel="版面分页"
              currentPage={currentPage}
              pageCount={pageCount}
              pageHref={(page) => boardPageHref(boardId, page, digestOnly)}
              showPageJump
            />
          </footer>
        </section>
      </main>
    </div>
  );
}
