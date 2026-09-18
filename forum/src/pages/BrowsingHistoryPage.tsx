import { useEffect, useState } from 'react';
import { ChevronRight, History, LogIn, RefreshCw } from 'lucide-react';
import {
  BrowsingHistoryApiError,
  fetchBrowsingHistory,
  type BrowsingHistory,
  type BrowsingHistoryDay,
} from '../api/browsingHistory';
import { AppBackground } from '../components/layout/AppBackground';
import { LoadingState } from '../components/layout/LoadingState';
import { TopBar } from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useStaggerEntrance } from '../hooks/useStaggerEntrance';
import { getLoginPathWithReturnTo } from '../utils/authRoutes';
import { getThreadHref } from '../utils/threadRoutes';
import { getTitleIndentationClassName } from '../utils/titleIndentation';

type HistoryState = {
  data: BrowsingHistory | null;
  error: string;
  loading: boolean;
  loginRequired: boolean;
  owner: string;
};

export function BrowsingHistoryPage() {
  useDocumentTitle('浏览记录');
  const historyRef = useStaggerEntrance<HTMLElement>('.browsing-history-day-heading, .browsing-history-list > li');
  const { status, viewer } = useAuth();
  const username = status === 'authenticated' ? viewer?.username ?? '' : '';
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<HistoryState>({
    data: null, error: '', loading: true, loginRequired: false, owner: '',
  });

  useEffect(() => {
    if (!username) return;
    const controller = new AbortController();
    setState({ data: null, error: '', loading: true, loginRequired: false, owner: username });
    void fetchBrowsingHistory(controller.signal).then((data) => {
      if (controller.signal.aborted) return;
      setState({ data, error: '', loading: false, loginRequired: false, owner: username });
    }, (error: unknown) => {
      if (controller.signal.aborted) return;
      setState({
        data: null,
        error: error instanceof Error ? error.message : '浏览记录读取失败，请稍后重试。',
        loading: false,
        loginRequired: error instanceof BrowsingHistoryApiError && error.loginRequired,
        owner: username,
      });
    });
    return () => controller.abort();
  }, [revision, username]);

  const belongsToViewer = Boolean(username) && state.owner === username;
  const loginRequired = status === 'guest' || (belongsToViewer && state.loginRequired);
  const loading = !loginRequired && (!belongsToViewer || state.loading);
  const data = belongsToViewer ? state.data : null;
  const retry = () => setRevision((value) => value + 1);

  return (
    <div className="browsing-history-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#browsing-history" contextTitle="浏览记录" />
      <main className="browsing-history-shell" id="browsing-history" ref={historyRef}>
        <section aria-labelledby="browsing-history-title" className="browsing-history-panel">
          <header className="browsing-history-heading">
            <div className="browsing-history-title">
              <span aria-hidden="true" className="browsing-history-title-icon"><History size={20} /></span>
              <h1 id="browsing-history-title">浏览记录</h1>
            </div>
            <div className="browsing-history-tools">
              <span className="browsing-history-range" title={data ? `${data.startDate} 至 ${data.endDate}` : undefined}>最近 7 天</span>
              {username && !loginRequired && (
                <button aria-label="刷新浏览记录" className="icon-button" disabled={loading} onClick={retry} title="刷新浏览记录" type="button">
                  <RefreshCw size={16} />
                </button>
              )}
            </div>
          </header>

          {loginRequired ? (
            <div className="browsing-history-state" role="status">
              <History aria-hidden="true" size={28} />
              <p>登录后查看浏览记录</p>
              <a className="topbar-login-link" href={getLoginPathWithReturnTo()}><LogIn size={15} />登录</a>
            </div>
          ) : loading ? (
            <LoadingState className="browsing-history-loading" label="正在读取浏览记录" variant="panel" />
          ) : state.error ? (
            <div className="browsing-history-state" role="alert">
              <p>{state.error}</p>
              <button className="browsing-history-retry" onClick={retry} type="button"><RefreshCw size={15} />重试</button>
            </div>
          ) : data?.days.length ? (
            <div className="browsing-history-days">
              {data.days.map((day) => <HistoryDay day={day} key={day.date} today={data.endDate} />)}
            </div>
          ) : (
            <div className="browsing-history-state" role="status">
              <History aria-hidden="true" size={28} />
              <p>最近 7 天暂无浏览记录</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function HistoryDay({ day, today }: { day: BrowsingHistoryDay; today: string }) {
  const yesterday = new Date(`${today}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const relativeDay = day.date === today ? '今天' : day.date === yesterday.toISOString().slice(0, 10) ? '昨天' : '';
  const headingId = `browsing-history-day-${day.date}`;

  return (
    <details aria-labelledby={headingId} className="browsing-history-day" open>
      <summary className="browsing-history-day-heading">
        <h2 id={headingId}>{relativeDay && <span>{relativeDay}</span>}<time dateTime={day.date}>{day.date}</time></h2>
        <span className="browsing-history-day-tools">
          <span>{day.threads.length} 帖</span>
          <ChevronRight aria-hidden="true" className="browsing-history-day-toggle" size={16} />
        </span>
      </summary>
      <ul className="browsing-history-list">
        {day.threads.map((thread) => (
          <li key={`${thread.bid}-${thread.tid}`}>
            <a className="browsing-history-thread" href={getThreadHref(thread.bid, thread.tid)}>
              <span className="browsing-history-thread-content">
                <span className={getTitleIndentationClassName(thread.title, 'browsing-history-thread-title')}>{thread.title}</span>
                <span className="browsing-history-thread-meta">
                  <span className="browsing-history-board">{thread.board}</span>
                  {thread.author && <span>{thread.author}</span>}
                  {thread.viewTimes !== null && <span className="browsing-history-view-times">浏览 {thread.viewTimes} 次</span>}
                </span>
              </span>
              <ChevronRight aria-hidden="true" className="browsing-history-thread-arrow" size={17} />
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
