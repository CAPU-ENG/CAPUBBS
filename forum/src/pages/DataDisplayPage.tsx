import {
  AlertCircle,
  CalendarCheck2,
  LoaderCircle,
  RefreshCw,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import {
  fetchDataDisplayPanel,
  type CheckinRankingRecord,
  type CheckinRecord,
  type DataDisplayPanel,
  type DataDisplayResult,
  type OnlineUser,
  type PunishmentRecord,
} from '../api/dataDisplay';
import activityCover from '../assets/activity/activity.avif';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';

type LoadState = {
  data: DataDisplayResult | null;
  error: string;
  status: 'error' | 'loading' | 'ready';
};

const PANEL_ITEMS: Array<{
  icon: LucideIcon;
  id: DataDisplayPanel;
  label: string;
}> = [
  { icon: Users, id: 'online', label: '当前在线' },
  { icon: CalendarCheck2, id: 'checkins', label: '今日签到' },
  { icon: Trophy, id: 'checkin-ranking', label: '签到排行' },
  { icon: AlertCircle, id: 'punishments', label: '罚跑记录' },
];

export function DataDisplayPage() {
  const [activePanel, setActivePanel] = useState<DataDisplayPanel>(readPanelFromLocation);
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<LoadState>({ data: null, error: '', status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, error: '', status: 'loading' });

    void fetchDataDisplayPanel(activePanel, controller.signal).then(
      (data) => setState({ data, error: '', status: 'ready' }),
      (error: unknown) => {
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

  function selectPanel(panel: DataDisplayPanel) {
    if (panel === activePanel) return;
    setActivePanel(panel);
    const url = new URL(window.location.href);
    url.searchParams.set('panel', panel);
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  }

  return (
    <div className="data-display-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#data-display" contextTitle="数据展示" />

      <main className="data-display-shell" id="data-display">
        <section aria-hidden="true" className="data-display-cover">
          <img alt="" src={activityCover} />
        </section>

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
          <DataState icon={<LoaderCircle className="animate-spin" size={20} />}>正在加载数据</DataState>
        ) : state.status === 'error' ? (
          <DataState icon={<AlertCircle size={20} />}>
            <span>{state.error}</span>
            <button onClick={() => setReloadToken((token) => token + 1)} type="button">
              <RefreshCw size={15} /> 重试
            </button>
          </DataState>
        ) : activePanel === 'online' ? (
          <OnlineTable records={state.data?.onlineUsers ?? []} />
        ) : activePanel === 'checkins' ? (
          <CheckinTable records={state.data?.checkinRecords ?? []} />
        ) : activePanel === 'checkin-ranking' ? (
          <RankingTable records={state.data?.checkinRankingRecords ?? []} />
        ) : (
          <PunishmentTable records={state.data?.punishmentRecords ?? []} />
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
              <td><a href={record.href}>{record.username}</a></td>
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

function CheckinTable({ records }: { records: CheckinRecord[] }) {
  return (
    <DataTable count={`${records.length} 人`} icon={<CalendarCheck2 size={17} />} title="今日签到">
      <table className="data-table data-table-checkins">
        <thead><tr><th>今日顺序</th><th>ID</th></tr></thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.username}>
              <td><RankNumber rank={record.rank} /></td>
              <td><a href={record.href}>{record.username}</a></td>
            </tr>
          ))}
          {records.length === 0 && <EmptyRow columns={2}>暂无签到记录</EmptyRow>}
        </tbody>
      </table>
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
              <td><a href={record.href}>{record.username}</a></td>
              <td>{record.totalCheckins} 次</td>
            </tr>
          ))}
          {records.length === 0 && <EmptyRow columns={3}>暂无签到排行</EmptyRow>}
        </tbody>
      </table>
    </DataTable>
  );
}

function PunishmentTable({ records }: { records: PunishmentRecord[] }) {
  return (
    <DataTable count={`${records.length} 条`} icon={<AlertCircle size={17} />} title="罚跑记录" tone="danger">
      <table className="data-table data-table-punishments">
        <thead>
          <tr>
            <th>姓名</th><th>ID</th><th>原因</th><th>长度</th><th>职务加罚</th>
            <th>开始时间</th><th>结束时间</th><th>完成情况</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.name || '—'}</td>
              <td>{record.username ? <a href={record.href}>{record.username}</a> : '—'}</td>
              <td>{record.reason || '—'}</td>
              <td>{formatDistance(record.distance)}</td>
              <td>{record.addition ? '是' : '否'}</td>
              <td>{formatDate(record.startDate)}</td>
              <td>{formatDate(record.endDate)}</td>
              <td><StatusBadge complete={record.isComplete} /></td>
            </tr>
          ))}
          {records.length === 0 && <EmptyRow columns={8}>暂无罚跑记录</EmptyRow>}
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
  return (
    <section className={`data-display-card ${tone === 'danger' ? 'data-display-card-danger' : ''}`}>
      <header className="data-display-card-header">
        <span className="data-display-card-icon">{icon}</span>
        <h1>{title}</h1>
        <span className="data-display-card-count">{count}</span>
      </header>
      <div className="data-table-scroll">{children}</div>
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

function StatusBadge({ complete }: { complete: boolean }) {
  return <span className={`data-status ${complete ? 'data-status-complete' : ''}`}>{complete ? '已完成' : '进行中'}</span>;
}

function readPanelFromLocation(): DataDisplayPanel {
  const panel = new URLSearchParams(window.location.search).get('panel');
  if (panel === 'checkins' || panel === 'checkin-ranking' || panel === 'punishments') return panel;
  return 'online';
}

function formatDate(value: string) {
  if (!value || value === '0000-00-00') return '—';
  return value.replaceAll('-', '.');
}

function formatDistance(value: string) {
  if (!value) return '—';
  return /公里|km/i.test(value) ? value : `${value} km`;
}
