import {
  AlertCircle,
  CalendarCheck2,
  RefreshCw,
  Tags,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import {
  fetchDataDisplayPanel,
  type CheckinRankingRecord,
  type CheckinRecord,
  type DataDisplayPanel,
  type DataDisplayResult,
  type OnlineUser,
} from '../api/dataDisplay';
import { PunishmentRecords } from '../components/data/PunishmentRecords';
import { TagSummaryPanel } from '../components/data/TagSummaryPanel';
import { AppBackground } from '../components/layout/AppBackground';
import { LoadingState } from '../components/layout/LoadingState';
import { TopBar } from '../components/layout/TopBar';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { FORUM_LOCATION_CHANGE_EVENT, replaceForumLocation } from '../utils/authRoutes';
import { FORUM_PRESENCE_CHANGE_EVENT } from '../utils/forumClientType';
import { getForumNavigationHref } from '../utils/forumNavigation';
import { staggerEntrance } from '../utils/staggerEntrance';

type LoadState = {
  data: DataDisplayResult | null;
  error: string;
  status: 'error' | 'loading' | 'ready';
};

type DisplayPanel = DataDisplayPanel | 'tags';

const PANEL_ITEMS: Array<{
  icon: LucideIcon;
  id: DisplayPanel;
  label: string;
}> = [
  { icon: Users, id: 'online', label: '当前在线' },
  { icon: CalendarCheck2, id: 'checkins', label: '今日签到' },
  { icon: Trophy, id: 'checkin-ranking', label: '签到排行' },
  { icon: Tags, id: 'tags', label: '标签查询' },
  { icon: AlertCircle, id: 'punishments', label: '罚跑记录' },
] satisfies Array<{ icon: LucideIcon; id: DisplayPanel; label: string }>;

export function DataDisplayPage() {
  const activePanel = useSyncExternalStore<DisplayPanel>(subscribeLocation, readPanelFromLocation, () => 'online');
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<LoadState>({ data: null, error: '', status: 'loading' });
  useDocumentTitle(PANEL_ITEMS.find((panel) => panel.id === activePanel)?.label ?? '数据展示');

  useEffect(() => {
    if (activePanel !== 'online') return;
    const refreshPresence = () => setReloadToken((token) => token + 1);
    window.addEventListener(FORUM_PRESENCE_CHANGE_EVENT, refreshPresence);
    return () => window.removeEventListener(FORUM_PRESENCE_CHANGE_EVENT, refreshPresence);
  }, [activePanel]);

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, error: '', status: 'loading' });

    if (activePanel === 'tags') {
      setState({ data: null, error: '', status: 'ready' });
      return () => controller.abort();
    }

    void fetchDataDisplayPanel(activePanel, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ data, error: '', status: 'ready' });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState({
          data: null,
          error: error instanceof Error ? error.message : '数据加载失败，请稍后重试。',
          status: 'error',
        });
      },
    );

    return () => controller.abort();
  }, [activePanel, reloadToken]);

  function selectPanel(panel: DisplayPanel) {
    if (panel === activePanel) return;
    const url = new URL(window.location.href);
    url.searchParams.set('panel', panel);
    replaceForumLocation(`${url.pathname}${url.search}${url.hash}`);
  }

  return (
    <div className="data-display-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#data-display" contextTitle="数据展示" />

      <main className="data-display-shell" id="data-display">
        <nav aria-label="数据展示类型" className="data-display-tabs">
          {PANEL_ITEMS.map(({ icon: Icon, id, label }) => (
            <button
              aria-pressed={activePanel === id}
              className={activePanel === id ? 'data-display-tab-active' : ''}
              key={id}
              onClick={() => selectPanel(id)}
              type="button"
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {state.status === 'loading' ? (
          <LoadingState className="data-display-state" label="正在加载数据" variant="panel" />
        ) : state.status === 'error' ? (
          <DataState icon={<AlertCircle size={20} />}>
            <span>{state.error}</span>
            <button onClick={() => setReloadToken((token) => token + 1)} type="button">
              <RefreshCw size={15} /> 重试
            </button>
          </DataState>
        ) : activePanel === 'tags' ? (
          <TagSummaryPanel />
        ) : activePanel === 'online' ? (
          <OnlineTable records={state.data?.onlineUsers ?? []} />
        ) : activePanel === 'checkins' ? (
          <CheckinList records={state.data?.checkinRecords ?? []} />
        ) : activePanel === 'checkin-ranking' ? (
          <RankingTable records={state.data?.checkinRankingRecords ?? []} />
        ) : (
          <PunishmentRecords
            onReload={() => setReloadToken((token) => token + 1)}
            records={state.data?.punishmentRecords ?? []}
          />
        )}
      </main>
    </div>
  );
}

function OnlineTable({ records }: { records: OnlineUser[] }) {
  return (
    <DataTable count={`${records.length} 人`} icon={<Users size={17} />} title="当前在线">
      <table className="data-table data-table-online">
        <thead><tr><th>ID</th><th>所在版面</th><th>登录方式</th><th>最近活动</th></tr></thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.username}>
              <td><a href={getForumNavigationHref(record.href, window.location.href)}>{record.username}</a></td>
              <td>{record.location}</td>
              <td>{record.loginType}</td>
              <td>{record.recentActiveAt}</td>
            </tr>
          ))}
          {records.length === 0 && <EmptyRow columns={4}>暂无在线记录</EmptyRow>}
        </tbody>
      </table>
    </DataTable>
  );
}

function CheckinList({ records }: { records: CheckinRecord[] }) {
  return (
    <DataTable count={`${records.length} 人`} icon={<CalendarCheck2 size={17} />} title="今日签到">
      {records.length === 0 ? (
        <div className="data-checkin-empty">暂无签到记录</div>
      ) : (
        <ol aria-label="今日签到顺序" className="data-checkin-list" role="list">
          {records.map((record) => (
            <li key={record.username}>
              <a className="data-checkin-member" href={getForumNavigationHref(record.href, window.location.href)}>
                <RankNumber rank={record.rank} />
                <span className="data-checkin-details">
                  <span className="data-checkin-username">{record.username}</span>
                  {record.checkinTime && (
                    <time className="data-checkin-time" dateTime={record.checkinTime}>{record.checkinTime}</time>
                  )}
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </DataTable>
  );
}

function RankingTable({ records }: { records: CheckinRankingRecord[] }) {
  return (
    <DataTable count={`${records.length} 人`} icon={<Trophy size={17} />} title="签到排行">
      <table className="data-table data-table-ranking">
        <thead><tr><th>排名</th><th>ID</th><th>累计签到</th></tr></thead>
        <tbody>
          {records.map((record) => (
            <tr key={`${record.rank}-${record.username}`}>
              <td><RankNumber rank={record.rank} /></td>
              <td><a href={getForumNavigationHref(record.href, window.location.href)}>{record.username}</a></td>
              <td>{record.totalCheckins} 次</td>
            </tr>
          ))}
          {records.length === 0 && <EmptyRow columns={3}>暂无签到排行</EmptyRow>}
        </tbody>
      </table>
    </DataTable>
  );
}

function DataTable({
  children,
  count,
  icon,
  title,
  tone = 'default',
}: {
  children: ReactNode;
  count: string;
  icon: ReactNode;
  title: string;
  tone?: 'danger' | 'default';
}) {
  const tableRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const rows = tableRef.current?.querySelectorAll<HTMLElement>('.data-table > tbody > tr, .data-checkin-list > li');
    if (rows) staggerEntrance(rows);
  }, [children]);

  return (
    <section className={`data-display-card ${tone === 'danger' ? 'data-display-card-danger' : ''}`}>
      <header className="data-display-card-header">
        <span className="data-display-card-icon">{icon}</span>
        <h1>{title}</h1>
        <span className="data-display-card-count">{count}</span>
      </header>
      <div className="data-table-scroll" ref={tableRef}>{children}</div>
    </section>
  );
}

function DataState({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return <section className="data-display-state">{icon}<div>{children}</div></section>;
}

function EmptyRow({ children, columns }: { children: ReactNode; columns: number }) {
  return <tr><td className="data-table-empty" colSpan={columns}>{children}</td></tr>;
}

function RankNumber({ rank }: { rank: number }) {
  return <span className={rank <= 3 ? `data-rank data-rank-${rank}` : 'data-rank'}>#{rank}</span>;
}

function readPanelFromLocation(): DisplayPanel {
  const panel = new URLSearchParams(window.location.search).get('panel');
  if (panel === 'checkins' || panel === 'checkin-ranking' || panel === 'punishments' || panel === 'tags') return panel;
  return 'online';
}

function subscribeLocation(listener: () => void) {
  window.addEventListener('popstate', listener);
  window.addEventListener(FORUM_LOCATION_CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener(FORUM_LOCATION_CHANGE_EVENT, listener);
  };
}
