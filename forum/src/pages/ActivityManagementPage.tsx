import {
  ArrowLeft,
  Check,
  ChevronDown,
  ClipboardList,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  Save,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  fetchActivitySignupSummary,
  isAbortError,
  updateActivityConfiguration,
  type ActivitySignupSummary,
  type ThreadActivity,
  type ThreadActivityQuestion,
} from '../api/thread';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import {
  ActivityDateSchedule,
  ActivitySignupEditor,
  ActivitySignupSchedule,
} from '../components/thread/ActivitySignupEditor';
import { useAuth } from '../context/AuthContext';
import { useThreadData } from '../hooks/useThreadData';
import { getLoginPathWithReturnTo, getRegisterPathWithReturnTo } from '../utils/authRoutes';
import {
  createEditableActivitySettings,
  buildActivityUpdateOptions,
  createActivityQuestionCaseIds,
  createEditableActivityDateRange,
  getActivityRecordValue,
  reconcileActivityQuestionCaseIds,
  validateManagedActivityDateRange,
  type ActivityQuestionCaseIds,
  type ActivitySignupRecord,
} from '../utils/activityManagement';
import {
  activitySignupDateTimeToUnixSeconds,
  validateActivitySignupSettings,
  type ActivityDateRange,
  type ActivitySignupSettings,
} from '../utils/activitySignup';

type ActivityManagementTab = 'questionnaire' | 'summary';
type ActivitySignupFilter = 'all' | 'canceled' | 'effective';
type ActivitySignupSort = 'id' | 'joinedAt';
type ActivitySignupSortDirection = 'asc' | 'desc';
type ActivitySummaryControl = 'direction' | 'filter' | 'sort';

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
  const [signupSummary, setSignupSummary] = useState<ActivitySignupSummary | null>(null);
  const [signupRefreshKey, setSignupRefreshKey] = useState(0);
  const [signupLoadStatus, setSignupLoadStatus] = useState<'error' | 'loading' | 'ready'>('loading');
  const [managedActivity, setManagedActivity] = useState<ThreadActivity | null>(null);
  const [questionnaire, setQuestionnaire] = useState<ActivitySignupSettings | null>(null);
  const [activityDateRange, setActivityDateRange] = useState<ActivityDateRange>({ endsOn: '', startsOn: '' });
  const [questionCaseIds, setQuestionCaseIds] = useState<ActivityQuestionCaseIds>({});
  const [questionnaireNotice, setQuestionnaireNotice] = useState<{ error: boolean; text: string } | null>(null);
  const [isSavingQuestionnaire, setIsSavingQuestionnaire] = useState(false);
  const authPending = authStatus === 'loading' || authStatus === 'restoring';
  const isAuthorized = Boolean(
    data
    && viewer
    && (viewer.rights >= 3 || viewer.username === data.authorName),
  );

  useEffect(() => {
    if (!data?.activity) {
      setManagedActivity(null);
      setQuestionnaire(null);
      return;
    }
    setManagedActivity(data.activity);
    setQuestionnaire(createEditableActivitySettings(data.activity));
    setActivityDateRange(createEditableActivityDateRange(data.activity));
    setQuestionCaseIds(createActivityQuestionCaseIds(data.activity.questions));
    setQuestionnaireNotice(null);
  }, [data?.activity]);

  useEffect(() => {
    if (!data || !data.activity || !isAuthorized) {
      setSignupSummary(null);
      setSignupLoadStatus('loading');
      return;
    }

    const controller = new AbortController();
    setSignupLoadStatus('loading');
    void fetchActivitySignupSummary({
      bid: data.bid,
      signal: controller.signal,
      tid: data.tid,
    }).then(
      (summary) => {
        setSignupSummary(summary);
        setSignupLoadStatus('ready');
      },
      (loadError: unknown) => {
        if (isAbortError(loadError)) return;
        setSignupLoadStatus('error');
      },
    );

    return () => controller.abort();
  }, [data, isAuthorized, signupRefreshKey]);

  function selectTab(tab: ActivityManagementTab) {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  }

  async function saveQuestionnaire() {
    if (!data || !questionnaire || !managedActivity || isSavingQuestionnaire) return;
    if (!validateManagedActivityDateRange(activityDateRange)) {
      setQuestionnaireNotice({ error: true, text: '请检查活动开始和结束日期。' });
      return;
    }
    if (!validateActivitySignupSettings(questionnaire)) {
      setQuestionnaireNotice({ error: true, text: '请检查报名时间与问卷字段。' });
      return;
    }

    setIsSavingQuestionnaire(true);
    setQuestionnaireNotice({ error: false, text: '正在保存' });
    try {
      const updatedActivity = await updateActivityConfiguration({
        activityEndsOn: activityDateRange.endsOn,
        activityStartsOn: activityDateRange.startsOn,
        bid: data.bid,
        options: buildActivityUpdateOptions(questionnaire, questionCaseIds),
        signupEndsAt: activitySignupDateTimeToUnixSeconds(questionnaire.endsAt),
        signupStartsAt: activitySignupDateTimeToUnixSeconds(questionnaire.startsAt),
        tid: data.tid,
      });
      setManagedActivity(updatedActivity);
      setQuestionnaire(createEditableActivitySettings(updatedActivity));
      setActivityDateRange(createEditableActivityDateRange(updatedActivity));
      setQuestionCaseIds(createActivityQuestionCaseIds(updatedActivity.questions));
      setSignupRefreshKey((current) => current + 1);
      setQuestionnaireNotice({ error: false, text: '已保存' });
    } catch (saveError) {
      setQuestionnaireNotice({
        error: true,
        text: saveError instanceof Error ? saveError.message : '活动保存失败，请稍后重试。',
      });
    } finally {
      setIsSavingQuestionnaire(false);
    }
  }

  const threadHref = request.bid > 0 && request.tid > 0
    ? `/?${new URLSearchParams({ bid: String(request.bid), p: '1', tid: String(request.tid) }).toString()}#1`
    : '/';
  const records = signupSummary?.records ?? [];

  return (
    <div className="activity-management-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#activity-management-title" contextTitle="活动管理" />

      <main className="activity-management-shell">
        {authPending || status === 'loading' ? (
          <ActivityManagementState icon={<LoaderCircle className="activity-management-spinner" size={22} />} title="正在读取活动" />
        ) : status === 'error' || !data ? (
          <ActivityManagementState action={<button onClick={retry} type="button">重新加载</button>} title="活动暂时无法打开">
            {error || '没有找到对应的活动帖。'}
          </ActivityManagementState>
        ) : !data.isActivity || !data.activity ? (
          <ActivityManagementState action={<a href={threadHref}>返回原帖</a>} title="这不是活动帖">
            活动管理仅用于带报名问卷的活动帖。
          </ActivityManagementState>
        ) : !managedActivity ? (
          <ActivityManagementState icon={<LoaderCircle className="activity-management-spinner" size={22} />} title="正在准备活动管理" />
        ) : !isAuthorized ? (
          <ActivityManagementState
            action={(
              <div className="activity-management-state-actions">
                <a href={threadHref}>返回原帖</a>
                {authStatus === 'guest' && <a href={getLoginPathWithReturnTo()}>前往登录</a>}
                {authStatus === 'guest' && <a href={getRegisterPathWithReturnTo()}>注册账号</a>}
              </div>
            )}
            icon={<ShieldAlert size={22} />}
            title="无法进入活动管理"
          >
            此页面仅对楼主本人或权限值大于等于 3 的用户开放。
          </ActivityManagementState>
        ) : (
          <section className="activity-management-workspace" aria-labelledby="activity-management-title">
            <header className="activity-management-heading">
              <a aria-label="返回活动帖" className="activity-management-back" href={threadHref}><ArrowLeft size={19} /></a>
              <div>
                <h1 id="activity-management-title">活动管理：{data.title}</h1>
              </div>
              <ActivityStatus status={managedActivity.status} />
            </header>

            <div className="activity-management-metrics">
              <ActivityMetric label="报名总数" value={signupSummary?.totals.total ?? '-'} />
              <ActivityMetric label="有效报名" tone="success" value={signupSummary?.totals.effective ?? '-'} />
              <ActivityMetric label="取消报名" tone="warning" value={signupSummary?.totals.canceled ?? '-'} />
              <ActivityMetric label="报名截止" value={formatActivityTime(managedActivity.endsAt)} />
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
                  activityDateRange={activityDateRange}
                  isSaving={isSavingQuestionnaire}
                  notice={questionnaireNotice}
                  onChange={(value) => {
                    setQuestionCaseIds((current) => reconcileActivityQuestionCaseIds(questionnaire, value, current));
                    setQuestionnaire(value);
                    setQuestionnaireNotice(null);
                  }}
                  onActivityDateRangeChange={(value) => {
                    setActivityDateRange(value);
                    setQuestionnaireNotice(null);
                  }}
                  onSave={() => { void saveQuestionnaire(); }}
                  value={questionnaire}
                />
              ) : activeTab === 'summary' ? (
                <SignupSummaryPanel
                  loadStatus={signupLoadStatus}
                  questions={managedActivity.questions}
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
  activityDateRange,
  isSaving,
  notice,
  onActivityDateRangeChange,
  onChange,
  onSave,
  value,
}: {
  activityDateRange: ActivityDateRange;
  isSaving: boolean;
  notice: { error: boolean; text: string } | null;
  onActivityDateRangeChange: (value: ActivityDateRange) => void;
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
          <button disabled={isSaving} onClick={onSave} type="button">
            {isSaving ? <LoaderCircle className="activity-management-spinner" size={15} /> : <Save size={15} />}
            {isSaving ? '保存中' : '保存修改'}
          </button>
        </div>
      </header>
      <ActivityDateSchedule onChange={onActivityDateRangeChange} value={activityDateRange} />
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
  const [expandedValue, setExpandedValue] = useState<{ label: string; value: string } | null>(null);
  const [isTableScrolled, setIsTableScrolled] = useState(false);
  const [openControl, setOpenControl] = useState<ActivitySummaryControl | null>(null);
  const [recordFilter, setRecordFilter] = useState<ActivitySignupFilter>('all');
  const [sortBy, setSortBy] = useState<ActivitySignupSort>('joinedAt');
  const [sortDirection, setSortDirection] = useState<ActivitySignupSortDirection>('asc');
  const controlsRef = useRef<HTMLDivElement>(null);
  const displayedQuestions = useMemo(
    () => questions.filter((question) => question.label.trim().toLocaleUpperCase() !== 'ID'),
    [questions],
  );
  const displayedRecords = useMemo(
    () => sortActivitySignupRecords(
      records.filter((record) => recordFilter === 'all'
        || (recordFilter === 'effective' && record.status === '有效')
        || (recordFilter === 'canceled' && record.status === '已取消')),
      sortBy,
      sortDirection,
    ),
    [recordFilter, records, sortBy, sortDirection],
  );

  useEffect(() => {
    if (!expandedValue) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpandedValue(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [expandedValue]);

  useEffect(() => {
    if (!openControl) return;

    const closeControl = (event: PointerEvent) => {
      if (!controlsRef.current?.contains(event.target as Node)) setOpenControl(null);
    };
    const closeControlOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenControl(null);
    };
    document.addEventListener('pointerdown', closeControl);
    window.addEventListener('keydown', closeControlOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeControl);
      window.removeEventListener('keydown', closeControlOnEscape);
    };
  }, [openControl]);

  return (
    <section className="activity-management-panel activity-summary-panel" aria-label="报名汇总">
      <header className="activity-management-panel-heading">
        <h2>报名信息</h2>
        <div className="activity-summary-controls" ref={controlsRef}>
          {loadStatus === 'ready' && records.length > 0 && (
            <>
              <ActivitySummarySelect
                control="filter"
                isOpen={openControl === 'filter'}
                label="报名状态筛选"
                onChange={setRecordFilter}
                onToggle={() => setOpenControl((current) => current === 'filter' ? null : 'filter')}
                options={[
                  { label: '全部报名', value: 'all' },
                  { label: '只看有效报名', value: 'effective' },
                  { label: '只看已取消', value: 'canceled' },
                ]}
                value={recordFilter}
              />
              <ActivitySummarySelect
                control="sort"
                isOpen={openControl === 'sort'}
                label="报名信息排序字段"
                onChange={setSortBy}
                onToggle={() => setOpenControl((current) => current === 'sort' ? null : 'sort')}
                options={[
                  { label: '按 ID', value: 'id' },
                  { label: '按报名时间', value: 'joinedAt' },
                ]}
                value={sortBy}
              />
              <ActivitySummarySelect
                control="direction"
                isOpen={openControl === 'direction'}
                label="报名信息排序方向"
                onChange={setSortDirection}
                onToggle={() => setOpenControl((current) => current === 'direction' ? null : 'direction')}
                options={[
                  { label: '升序', value: 'asc' },
                  { label: '降序', value: 'desc' },
                ]}
                value={sortDirection}
              />
            </>
          )}
          <button
            disabled={loadStatus !== 'ready' || records.length === 0}
            onClick={() => downloadSignupCsv(
              threadTitle,
              tid,
              displayedQuestions,
              displayedRecords,
            )}
            type="button"
          ><Download size={15} />导出表格</button>
        </div>
      </header>

      {loadStatus === 'loading' ? (
        <div className="activity-summary-state"><LoaderCircle className="activity-management-spinner" size={20} />正在汇总全部报名</div>
      ) : loadStatus === 'error' ? (
        <div className="activity-summary-state activity-management-notice-error">报名信息读取失败，请刷新后重试。</div>
      ) : records.length === 0 ? (
        <div className="activity-summary-state">暂无报名信息</div>
      ) : displayedRecords.length === 0 ? (
        <div className="activity-summary-state">没有符合筛选条件的报名信息</div>
      ) : (
        <>
          <div
            className={`activity-summary-table-wrap${isTableScrolled ? ' activity-summary-table-wrap-scrolled' : ''}`}
            onScroll={(event) => setIsTableScrolled(event.currentTarget.scrollLeft > 0)}
          >
            <table>
              <thead>
                <tr>
                  <th className="activity-summary-id-column">ID</th>
                  <th className="activity-summary-time-column">报名时间</th>
                  <th>是否有未完成的罚跑</th>
                  <th className="activity-summary-status-column">状态</th>
                  {displayedQuestions.map((question) => <th key={question.id}>{question.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {displayedRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="activity-summary-id-column"><strong>{record.username}</strong></td>
                    <td className="activity-summary-time-column">{formatActivityRecordTime(record.joinedAt)}</td>
                    <td>{record.hasUnfinishedPunishment ? '是' : '否'}</td>
                    <td className="activity-summary-status-column"><ActivityRecordStatus status={record.status} /></td>
                    {displayedQuestions.map((question) => {
                      const value = getActivityRecordValue(record, question);
                      const expandable = isExpandableSummaryValue(value);
                      return (
                        <td key={question.id}>
                          {expandable ? (
                            <button
                              aria-label={`查看${question.label}完整内容`}
                              className="activity-summary-expand-button"
                              onClick={() => setExpandedValue({ label: question.label, value })}
                              type="button"
                            >
                              <span>{value}</span>
                            </button>
                          ) : (
                            <span className="activity-summary-cell-content">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {expandedValue && (
            <div
              className="activity-summary-value-overlay"
              onClick={() => setExpandedValue(null)}
              role="presentation"
            >
              <section
                aria-labelledby="activity-summary-value-title"
                aria-modal="true"
                className="activity-summary-value-dialog"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
              >
                <header>
                  <h3 id="activity-summary-value-title">{expandedValue.label}</h3>
                  <button autoFocus aria-label="关闭完整内容" onClick={() => setExpandedValue(null)} type="button">
                    <X size={18} />
                  </button>
                </header>
                <div>{expandedValue.value}</div>
              </section>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ActivitySummarySelect<Value extends string>({
  control,
  isOpen,
  label,
  onChange,
  onToggle,
  options,
  value,
}: {
  control: ActivitySummaryControl;
  isOpen: boolean;
  label: string;
  onChange: (value: Value) => void;
  onToggle: () => void;
  options: { label: string; value: Value }[];
  value: Value;
}) {
  const listboxId = useId();
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="activity-summary-select" data-control={control}>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${label}：${selectedOption.label}`}
        className="activity-summary-select-trigger"
        onClick={onToggle}
        type="button"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown aria-hidden="true" size={14} />
      </button>
      {isOpen ? (
        <div aria-label={label} className="activity-summary-select-menu" id={listboxId} role="listbox">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                aria-selected={selected}
                className="activity-summary-select-option"
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  onToggle();
                }}
                role="option"
                type="button"
              >
                <span>{option.label}</span>
                {selected ? <Check aria-hidden="true" size={14} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function isExpandableSummaryValue(value: string) {
  return value !== '-' && (value.includes('\n') || value.length > 40);
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
  children?: React.ReactNode;
  icon?: React.ReactNode;
  title: string;
}) {
  return (
    <section className="activity-management-state">
      {icon}
      <h1>{title}</h1>
      {children ? <p>{children}</p> : null}
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
    ['ID', '报名时间', '是否有未完成的罚跑', '状态', ...questions.map((question) => question.label)],
    ...records.map((record) => [
      record.username,
      formatActivityRecordTime(record.joinedAt),
      record.hasUnfinishedPunishment ? '是' : '否',
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

function sortActivitySignupRecords(
  records: ActivitySignupRecord[],
  sortBy: ActivitySignupSort,
  direction: ActivitySignupSortDirection,
) {
  const directionFactor = direction === 'asc' ? 1 : -1;
  return [...records].sort((left, right) => {
    const result = sortBy === 'id'
      ? left.username.localeCompare(right.username, 'zh-CN', { numeric: true, sensitivity: 'base' })
      : left.joinedAt - right.joinedAt;
    return (result || left.id - right.id) * directionFactor;
  });
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function safeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, '-').trim();
}

function formatActivityRecordTime(timestamp: number) {
  if (!timestamp) return '-';
  return new Intl.DateTimeFormat('zh-CN', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(timestamp * 1000));
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
