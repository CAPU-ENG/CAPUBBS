import {
  ArrowLeft,
  ClipboardList,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  Save,
  ShieldAlert,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchThreadDetail,
  isAbortError,
  type ThreadActivityQuestion,
} from '../api/thread';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { ActivitySignupEditor, ActivitySignupSchedule } from '../components/thread/ActivitySignupEditor';
import { useAuth } from '../context/AuthContext';
import type { ThreadFloorData } from '../data/threadDemo';
import { useThreadData } from '../hooks/useThreadData';
import {
  createEditableActivitySettings,
  getActivityRecordValue,
  getActivitySignupRecords,
  type ActivitySignupRecord,
} from '../utils/activityManagement';
import {
  validateActivitySignupSettings,
  type ActivitySignupSettings,
} from '../utils/activitySignup';

type ActivityManagementTab = 'questionnaire' | 'summary';

export function ActivityManagementPage() {
  const request = useMemo(getActivityRequest, []);
  const { status: authStatus, viewer } = useAuth();
  const { data, error, retry, status } = useThreadData({
    authorOnly: false,
    bid: request.bid,
    page: 1,
    tid: request.tid,
  });
  const [activeTab, setActiveTab] = useState<ActivityManagementTab>(readTabFromLocation);
  const [allFloors, setAllFloors] = useState<ThreadFloorData[]>([]);
  const [signupLoadStatus, setSignupLoadStatus] = useState<'error' | 'loading' | 'ready'>('loading');
  const [questionnaire, setQuestionnaire] = useState<ActivitySignupSettings | null>(null);
  const [questionnaireNotice, setQuestionnaireNotice] = useState<{ error: boolean; text: string } | null>(null);
  const authPending = authStatus === 'loading' || authStatus === 'restoring';
  const isAuthorized = Boolean(
    data
    && viewer
    && (viewer.rights >= 3 || viewer.username === data.authorName),
  );

  useEffect(() => {
    if (!data?.activity) {
      setQuestionnaire(null);
      return;
    }
    setQuestionnaire(createEditableActivitySettings(data.activity));
    setQuestionnaireNotice(null);
  }, [data?.activity]);

  useEffect(() => {
    if (!data || !data.activity || !isAuthorized) {
      setAllFloors([]);
      setSignupLoadStatus('loading');
      return;
    }

    const controller = new AbortController();
    setAllFloors(data.floors);
    if (data.pageCount <= 1) {
      setSignupLoadStatus('ready');
      return () => controller.abort();
    }

    setSignupLoadStatus('loading');
    void Promise.all(
      Array.from({ length: data.pageCount - 1 }, (_, index) => fetchThreadDetail({
        authorOnly: false,
        bid: data.bid,
        page: index + 2,
        signal: controller.signal,
        tid: data.tid,
      })),
    ).then(
      (pages) => {
        const floors = deduplicateFloors([data, ...pages].flatMap((page) => page.floors));
        setAllFloors(floors);
        setSignupLoadStatus('ready');
      },
      (loadError: unknown) => {
        if (isAbortError(loadError)) return;
        setSignupLoadStatus('error');
      },
    );

    return () => controller.abort();
  }, [data, isAuthorized]);

  function selectTab(tab: ActivityManagementTab) {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  }

  function saveQuestionnaire() {
    if (!questionnaire || !validateActivitySignupSettings(questionnaire)) {
      setQuestionnaireNotice({ error: true, text: '请检查报名时间与问卷字段。' });
      return;
    }
    setQuestionnaireNotice({ error: true, text: '问卷更新接口尚未接入，当前修改未提交。' });
  }

  const threadHref = request.bid > 0 && request.tid > 0
    ? `/?${new URLSearchParams({ bid: String(request.bid), p: '1', tid: String(request.tid) }).toString()}#1`
    : '/';
  const records = useMemo(
    () => getActivitySignupRecords(allFloors, data?.activity?.questions ?? []),
    [allFloors, data?.activity?.questions],
  );

  return (
    <div className="activity-management-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#activity-management-title" contextTitle="活动管理" />

      <main className="activity-management-shell">
        {authPending || status === 'loading' ? (
          <ActivityManagementState icon={<LoaderCircle className="activity-management-spinner" size={22} />} title="正在读取活动">
            正在确认活动信息与管理权限。
          </ActivityManagementState>
        ) : status === 'error' || !data ? (
          <ActivityManagementState action={<button onClick={retry} type="button">重新加载</button>} title="活动暂时无法打开">
            {error || '没有找到对应的活动帖。'}
          </ActivityManagementState>
        ) : !data.isActivity || !data.activity ? (
          <ActivityManagementState action={<a href={threadHref}>返回原帖</a>} title="这不是活动帖">
            活动管理仅用于带报名问卷的活动帖。
          </ActivityManagementState>
        ) : !isAuthorized ? (
          <ActivityManagementState action={<a href={threadHref}>返回原帖</a>} icon={<ShieldAlert size={22} />} title="无法进入活动管理">
            此页面仅对楼主本人或权限值大于等于 3 的用户开放。
          </ActivityManagementState>
        ) : (
          <section className="activity-management-workspace" aria-labelledby="activity-management-title">
            <header className="activity-management-heading">
              <a aria-label="返回活动帖" className="activity-management-back" href={threadHref}><ArrowLeft size={19} /></a>
              <div>
                <h1 id="activity-management-title">活动管理：{data.title}</h1>
              </div>
              <ActivityStatus status={data.activity.status} />
            </header>

            <div className="activity-management-metrics">
              <ActivityMetric label="报名总数" value={records.length} />
              <ActivityMetric label="有效报名" tone="success" value={records.filter((record) => record.status === '有效').length} />
              <ActivityMetric label="异常记录" tone="warning" value={records.filter((record) => record.status === '异常').length} />
              <ActivityMetric label="报名截止" value={formatActivityTime(data.activity.endsAt)} />
            </div>

            <nav aria-label="活动管理功能" className="activity-management-tabs">
              <button
                aria-pressed={activeTab === 'questionnaire'}
                className={activeTab === 'questionnaire' ? 'activity-management-tab-active' : ''}
                onClick={() => selectTab('questionnaire')}
                type="button"
              ><ClipboardList size={16} />修改问卷</button>
              <button
                aria-pressed={activeTab === 'summary'}
                className={activeTab === 'summary' ? 'activity-management-tab-active' : ''}
                onClick={() => selectTab('summary')}
                type="button"
              ><FileSpreadsheet size={16} />报名汇总</button>
            </nav>

            <div className="activity-management-tabpanel">
              {activeTab === 'questionnaire' && questionnaire ? (
                <QuestionnairePanel
                  notice={questionnaireNotice}
                  onChange={(value) => {
                    setQuestionnaire(value);
                    setQuestionnaireNotice(null);
                  }}
                  onSave={saveQuestionnaire}
                  value={questionnaire}
                />
              ) : activeTab === 'summary' ? (
                <SignupSummaryPanel
                  loadStatus={signupLoadStatus}
                  questions={data.activity.questions}
                  records={records}
                  threadTitle={data.title}
                  tid={data.tid}
                />
              ) : null}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function QuestionnairePanel({
  notice,
  onChange,
  onSave,
  value,
}: {
  notice: { error: boolean; text: string } | null;
  onChange: (value: ActivitySignupSettings) => void;
  onSave: () => void;
  value: ActivitySignupSettings;
}) {
  return (
    <section className="activity-management-panel activity-management-questionnaire" aria-label="修改问卷">
      <header className="activity-management-panel-heading">
        <h2>报名问卷</h2>
        <div>
          {notice && <span className={notice.error ? 'activity-management-notice-error' : ''} role={notice.error ? 'alert' : 'status'}>{notice.text}</span>}
          <button onClick={onSave} type="button"><Save size={15} />保存修改</button>
        </div>
      </header>
      <ActivitySignupSchedule onChange={onChange} value={value} />
      <ActivitySignupEditor onChange={onChange} value={value} />
    </section>
  );
}

function SignupSummaryPanel({
  loadStatus,
  questions,
  records,
  threadTitle,
  tid,
}: {
  loadStatus: 'error' | 'loading' | 'ready';
  questions: ThreadActivityQuestion[];
  records: ActivitySignupRecord[];
  threadTitle: string;
  tid: number;
}) {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const selectedRecord = records.find((record) => record.floor.floor === selectedFloor) ?? null;

  return (
    <section className="activity-management-panel activity-summary-panel" aria-label="报名汇总">
      <header className="activity-management-panel-heading">
        <h2>报名信息</h2>
        <button
          disabled={loadStatus !== 'ready' || records.length === 0}
          onClick={() => downloadSignupCsv(threadTitle, tid, questions, records)}
          type="button"
        ><Download size={15} />导出 CSV</button>
      </header>

      {loadStatus === 'loading' ? (
        <div className="activity-summary-state"><LoaderCircle className="activity-management-spinner" size={20} />正在汇总全部报名</div>
      ) : loadStatus === 'error' ? (
        <div className="activity-summary-state activity-management-notice-error">部分报名页读取失败，请刷新后重试。</div>
      ) : records.length === 0 ? (
        <div className="activity-summary-state">暂无报名信息</div>
      ) : (
        <>
          <div className="activity-summary-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>报名时间</th>
                  <th>状态</th>
                  {questions.slice(0, 5).map((question) => <th key={question.id}>{question.label}</th>)}
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr className={selectedFloor === record.floor.floor ? 'activity-summary-row-selected' : ''} key={record.floor.id}>
                    <td><strong>{record.floor.author.name}</strong></td>
                    <td>{record.floor.publishedAt}</td>
                    <td><ActivityRecordStatus status={record.status} /></td>
                    {questions.slice(0, 5).map((question) => (
                      <td key={question.id}>{getActivityRecordValue(record, question)}</td>
                    ))}
                    <td><button onClick={() => setSelectedFloor(record.floor.floor)} type="button">查看</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedRecord && (
            <div className="activity-summary-detail">
              <header>
                <h3>{selectedRecord.floor.author.name} 的报名详情</h3>
                <span>#{selectedRecord.floor.floor}</span>
              </header>
              <div>
                {questions.map((question) => (
                  <p key={question.id}><strong>{question.label}</strong><span>{getActivityRecordValue(selectedRecord, question)}</span></p>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ActivityMetric({
  label,
  tone = 'default',
  value,
}: {
  label: string;
  tone?: 'default' | 'success' | 'warning';
  value: number | string;
}) {
  return <div data-tone={tone}><span>{label}</span><strong>{value}</strong></div>;
}

function ActivityStatus({ status }: { status: 'closed' | 'not_started' | 'open' | null }) {
  const label = status === 'open' ? '报名进行中' : status === 'not_started' ? '报名未开始' : status === 'closed' ? '报名已截止' : '状态未知';
  return <span className="activity-management-status" data-status={status ?? 'unknown'}>{label}</span>;
}

function ActivityRecordStatus({ status }: { status: ActivitySignupRecord['status'] }) {
  return <span className="activity-record-status" data-status={status}>{status}</span>;
}

function ActivityManagementState({
  action,
  children,
  icon,
  title,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  title: string;
}) {
  return (
    <section className="activity-management-state">
      {icon}
      <h1>{title}</h1>
      <p>{children}</p>
      {action && <div>{action}</div>}
    </section>
  );
}

function downloadSignupCsv(
  threadTitle: string,
  tid: number,
  questions: ThreadActivityQuestion[],
  records: ActivitySignupRecord[],
) {
  const rows = [
    ['ID', '报名时间', '状态', ...questions.map((question) => question.label)],
    ...records.map((record) => [
      record.floor.author.name,
      record.floor.publishedAt,
      record.status,
      ...questions.map((question) => getActivityRecordValue(record, question)),
    ]),
  ];
  const content = `\ufeff${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeFileName(threadTitle) || `activity-${tid}`}-报名汇总.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function safeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, '-').trim();
}

function deduplicateFloors(floors: ThreadFloorData[]) {
  return Array.from(new Map(floors.map((floor) => [floor.fid || floor.floor, floor])).values())
    .sort((left, right) => left.floor - right.floor);
}

function formatActivityTime(timestamp: number) {
  if (!timestamp) return '-';
  return new Intl.DateTimeFormat('zh-CN', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(timestamp * 1000));
}

function getActivityRequest() {
  const params = new URLSearchParams(window.location.search);
  return {
    bid: positiveInteger(params.get('bid')),
    tid: positiveInteger(params.get('tid') ?? params.get('thread')),
  };
}

function readTabFromLocation(): ActivityManagementTab {
  return new URLSearchParams(window.location.search).get('tab') === 'summary' ? 'summary' : 'questionnaire';
}

function positiveInteger(value: string | null) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}
