import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  addPunishmentRecord,
  finishPunishmentRecord,
  type PunishmentDraft,
  type PunishmentRecord,
} from '../../api/dataDisplay';
import { useAuth } from '../../context/AuthContext';
import { getForumNavigationHref } from '../../utils/forumNavigation';

type AcademicYearGroup = {
  key: string;
  records: PunishmentRecord[];
  startYear: number | null;
  title: string;
};

type PendingFinish = {
  date: string;
  error: string;
  recordId: string;
  submitting: boolean;
};

type PunishmentFormState = {
  addition: boolean;
  distance: string;
  name: string;
  reason: string;
  startDate: string;
  username: string;
};

type SortMode = 'name' | 'time';

const DISTANCE_OPTIONS = ['3', '4', '5'];
const nameCollator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });

export function PunishmentRecords({
  onReload,
  records,
}: {
  onReload: () => void;
  records: PunishmentRecord[];
}) {
  const { status: authStatus, viewer } = useAuth();
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [managementActive, setManagementActive] = useState(false);
  const [pendingFinish, setPendingFinish] = useState<PendingFinish | null>(null);
  const [showOnlyUnfinished, setShowOnlyUnfinished] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('time');
  const canManage = authStatus === 'authenticated' && viewer?.username.trim() === '组织部';
  const groups = useMemo(() => buildAcademicYearGroups(records), [records]);
  const safeGroupIndex = Math.min(activeGroupIndex, Math.max(0, groups.length - 1));
  const activeGroup = groups[safeGroupIndex] ?? null;
  const visibleRecords = useMemo(
    () => getVisibleRecords(activeGroup?.records ?? [], showOnlyUnfinished, sortMode),
    [activeGroup, showOnlyUnfinished, sortMode],
  );

  useEffect(() => {
    setActiveGroupIndex(0);
    setPendingFinish(null);
  }, [records]);

  useEffect(() => {
    setPendingFinish(null);
  }, [safeGroupIndex, showOnlyUnfinished, sortMode]);

  useEffect(() => {
    if (canManage) return;
    setManagementActive(false);
    setAddDialogOpen(false);
  }, [canManage]);

  function toggleManagement() {
    setManagementActive((active) => {
      if (active) {
        setAddDialogOpen(false);
        setPendingFinish(null);
      }
      return !active;
    });
  }

  async function addRecord(draft: PunishmentDraft) {
    await addPunishmentRecord(draft);
    setAddDialogOpen(false);
    onReload();
  }

  async function confirmFinish(record: PunishmentRecord) {
    if (!pendingFinish || pendingFinish.recordId !== record.id || pendingFinish.submitting) return;
    if (!pendingFinish.date) {
      setPendingFinish({ ...pendingFinish, error: '请选择完成日期' });
      return;
    }

    setPendingFinish({ ...pendingFinish, error: '', submitting: true });
    try {
      await finishPunishmentRecord(record.id, pendingFinish.date);
      setPendingFinish(null);
      onReload();
    } catch (error) {
      setPendingFinish({
        ...pendingFinish,
        error: errorMessage(error),
        submitting: false,
      });
    }
  }

  return (
    <section className="data-display-card data-display-card-danger punishment-card">
      <header className="data-display-card-header punishment-card-header">
        <span className="data-display-card-icon"><AlertCircle size={17} /></span>
        <h1>{activeGroup ? `${activeGroup.title} 罚跑记录` : '罚跑记录'}</h1>
        <div className="punishment-controls">
          {canManage && (
            <button
              aria-pressed={managementActive}
              className={`punishment-control punishment-manage-toggle ${managementActive ? 'punishment-control-active' : ''}`}
              onClick={toggleManagement}
              type="button"
            >
              <ShieldCheck size={14} /> 管理罚跑
            </button>
          )}
          <label className="punishment-control">
            <input
              checked={showOnlyUnfinished}
              onChange={(event) => setShowOnlyUnfinished(event.target.checked)}
              type="checkbox"
            />
            <span className="punishment-checkbox-mark" aria-hidden="true"><Check size={14} /></span>
            只看未完成
          </label>
          <label className="punishment-control">
            排序
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value === 'name' ? 'name' : 'time')}>
              <option value="time">按时间</option>
              <option value="name">按姓名</option>
            </select>
          </label>
          <span className="data-display-card-count">{visibleRecords.length} 条</span>
        </div>
      </header>

      {canManage && managementActive && (
        <div className="punishment-management-bar">
          <button onClick={() => setAddDialogOpen(true)} type="button">
            <Plus size={15} /> 添加罚跑记录
          </button>
        </div>
      )}

      <div className="data-table-scroll">
        <table className="data-table data-table-punishments">
          <thead>
            <tr>
              <th>姓名</th><th>ID</th><th>原因</th><th>长度</th><th>职务加罚</th>
              <th>开始时间</th><th>结束时间</th><th>完成情况</th>
            </tr>
          </thead>
          <tbody>
            {visibleRecords.map((record) => {
              const activePending = pendingFinish?.recordId === record.id ? pendingFinish : null;
              return (
                <tr key={record.id}>
                  <td>{record.name || '—'}</td>
                  <td>{record.username ? <a href={getForumNavigationHref(record.href, window.location.href)}>{record.username}</a> : '—'}</td>
                  <td>{record.reason || '—'}</td>
                  <td>{formatDistance(record.distance)}</td>
                  <td>{record.addition ? '是' : '否'}</td>
                  <td>{formatDate(record.startDate)}</td>
                  <td>{formatDate(activePending?.date || record.endDate)}</td>
                  <td>
                    {canManage && managementActive && !record.isComplete ? (
                      <FinishRecordAction
                        pending={activePending}
                        onCancel={() => setPendingFinish(null)}
                        onConfirm={() => void confirmFinish(record)}
                        onDateChange={(date) => setPendingFinish((current) => current ? { ...current, date, error: '' } : null)}
                        onStart={() => setPendingFinish({
                          date: getTodayDate(),
                          error: '',
                          recordId: record.id,
                          submitting: false,
                        })}
                      />
                    ) : (
                      <StatusBadge complete={record.isComplete} />
                    )}
                  </td>
                </tr>
              );
            })}
            {visibleRecords.length === 0 && (
              <tr>
                <td className="data-table-empty" colSpan={8}>暂无罚跑记录</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {groups.length > 1 && (
        <nav aria-label="罚跑记录学年" className="punishment-year-pagination">
          <button
            aria-label="上一学年"
            disabled={safeGroupIndex === 0}
            onClick={() => setActiveGroupIndex((index) => Math.max(0, index - 1))}
            type="button"
          >
            <ChevronLeft size={16} />
          </button>
          <span>{safeGroupIndex + 1} / {groups.length}</span>
          <button
            aria-label="下一学年"
            disabled={safeGroupIndex === groups.length - 1}
            onClick={() => setActiveGroupIndex((index) => Math.min(groups.length - 1, index + 1))}
            type="button"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}

      <AddPunishmentDialog onCancel={() => setAddDialogOpen(false)} onSubmit={addRecord} open={addDialogOpen} />
    </section>
  );
}

function FinishRecordAction({
  onCancel,
  onConfirm,
  onDateChange,
  onStart,
  pending,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  onDateChange: (date: string) => void;
  onStart: () => void;
  pending: PendingFinish | null;
}) {
  if (!pending) {
    return (
      <button className="punishment-finish-trigger" onClick={onStart} type="button">
        <CheckCircle2 size={14} /> 记录完成
      </button>
    );
  }

  return (
    <div className="punishment-finish-form">
      <input
        aria-label="完成日期"
        disabled={pending.submitting}
        onChange={(event) => onDateChange(event.target.value)}
        type="date"
        value={pending.date}
      />
      <div>
        <button disabled={pending.submitting} onClick={onConfirm} type="button">
          {pending.submitting ? '提交中' : '确认'}
        </button>
        <button disabled={pending.submitting} onClick={onCancel} type="button">取消</button>
      </div>
      {pending.error && <p>{pending.error}</p>}
    </div>
  );
}

function AddPunishmentDialog({
  onCancel,
  onSubmit,
  open,
}: {
  onCancel: () => void;
  onSubmit: (draft: PunishmentDraft) => Promise<void>;
  open: boolean;
}) {
  const [draft, setDraft] = useState<PunishmentFormState>(createDefaultForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onCancel();
    };
    document.body.classList.add('punishment-dialog-open');
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('punishment-dialog-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onCancel, open, submitting]);

  useEffect(() => {
    if (open) return;
    setDraft(createDefaultForm());
    setError('');
    setSubmitting(false);
  }, [open]);

  if (!open) return null;

  function updateDraft<Key extends keyof PunishmentFormState>(key: Key, value: PunishmentFormState[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeForm(draft);
    if (!normalized) {
      setError('请完整填写姓名、ID、原因、长度和开始时间');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSubmit(normalized);
    } catch (submitError) {
      setError(errorMessage(submitError));
      setSubmitting(false);
    }
  }

  return (
    <div className="punishment-dialog-backdrop" onMouseDown={submitting ? undefined : onCancel} role="presentation">
      <section
        aria-labelledby="punishment-dialog-title"
        aria-modal="true"
        className="punishment-dialog"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header>
          <span><Plus size={17} /></span>
          <h2 id="punishment-dialog-title">添加罚跑记录</h2>
          <button aria-label="关闭" disabled={submitting} onClick={onCancel} type="button"><X size={17} /></button>
        </header>

        <form onSubmit={(event) => void submit(event)}>
          <div className="punishment-dialog-body">
            <div className="punishment-form-row punishment-form-row-two">
              <PunishmentField label="姓名">
                <input autoComplete="off" disabled={submitting} onChange={(event) => updateDraft('name', event.target.value)} value={draft.name} />
              </PunishmentField>
              <PunishmentField label="ID">
                <input autoComplete="off" disabled={submitting} onChange={(event) => updateDraft('username', event.target.value)} value={draft.username} />
              </PunishmentField>
            </div>
            <PunishmentField label="原因">
              <textarea disabled={submitting} onChange={(event) => updateDraft('reason', event.target.value)} value={draft.reason} />
            </PunishmentField>
            <div className="punishment-form-row punishment-form-row-three">
              <PunishmentField label="长度">
                <select disabled={submitting} onChange={(event) => updateDraft('distance', event.target.value)} value={draft.distance}>
                  {DISTANCE_OPTIONS.map((distance) => <option key={distance} value={distance}>{distance} km</option>)}
                </select>
              </PunishmentField>
              <PunishmentField label="开始时间">
                <input disabled={submitting} onChange={(event) => updateDraft('startDate', event.target.value)} type="date" value={draft.startDate} />
              </PunishmentField>
              <PunishmentField label="职务加罚">
                <label className="punishment-checkbox-field">
                  <input checked={draft.addition} disabled={submitting} onChange={(event) => updateDraft('addition', event.target.checked)} type="checkbox" /> 是
                </label>
              </PunishmentField>
            </div>
            {error && <p className="punishment-form-error">{error}</p>}
          </div>
          <footer>
            <button disabled={submitting} onClick={onCancel} type="button">取消</button>
            <button className="punishment-submit-button" disabled={submitting} type="submit">
              {submitting ? '提交中…' : '确认添加'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function PunishmentField({ children, label }: { children: React.ReactNode; label: string }) {
  return <label className="punishment-field"><span>{label}</span>{children}</label>;
}

function StatusBadge({ complete }: { complete: boolean }) {
  return <span className={`data-status ${complete ? 'data-status-complete' : ''}`}>{complete ? '已完成' : '进行中'}</span>;
}

function buildAcademicYearGroups(records: PunishmentRecord[]) {
  const groups = new Map<string, AcademicYearGroup>();
  records.forEach((record) => {
    const startYear = getAcademicStartYear(record.startDate);
    const key = startYear === null ? 'unknown' : String(startYear);
    const group = groups.get(key);
    if (group) {
      group.records.push(record);
    } else {
      groups.set(key, {
        key,
        records: [record],
        startYear,
        title: startYear === null ? '时间未明' : `${startYear}-${startYear + 1} 学年`,
      });
    }
  });

  return Array.from(groups.values())
    .map((group) => ({ ...group, records: [...group.records].sort(compareByNewest) }))
    .sort((left, right) => {
      if (left.startYear === null) return 1;
      if (right.startYear === null) return -1;
      return right.startYear - left.startYear;
    });
}

function getVisibleRecords(records: PunishmentRecord[], unfinishedOnly: boolean, sortMode: SortMode) {
  const filtered = unfinishedOnly ? records.filter((record) => !record.isComplete) : records;
  return [...filtered].sort(sortMode === 'name' ? compareByName : compareByNewest);
}

function compareByName(left: PunishmentRecord, right: PunishmentRecord) {
  const nameDifference = nameCollator.compare(left.name || left.username, right.name || right.username);
  if (nameDifference !== 0) return nameDifference;
  return nameCollator.compare(left.username, right.username) || compareByNewest(left, right);
}

function compareByNewest(left: PunishmentRecord, right: PunishmentRecord) {
  const dateDifference = Date.parse(right.startDate) - Date.parse(left.startDate);
  if (Number.isFinite(dateDifference) && dateDifference !== 0) return dateDifference;
  return Number(right.id) - Number(left.id);
}

function getAcademicStartYear(value: string) {
  const match = value.match(/^(\d{4})-(\d{1,2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || month < 1 || month > 12) return null;
  return month >= 9 ? year : year - 1;
}

function createDefaultForm(): PunishmentFormState {
  return {
    addition: false,
    distance: DISTANCE_OPTIONS[0],
    name: '',
    reason: '',
    startDate: getTodayDate(),
    username: '',
  };
}

function normalizeForm(draft: PunishmentFormState): PunishmentDraft | null {
  const name = draft.name.trim();
  const username = draft.username.trim();
  const reason = draft.reason.trim();
  const startDate = draft.startDate.trim();
  if (!name || !username || !reason || !startDate || !DISTANCE_OPTIONS.includes(draft.distance)) return null;
  return { ...draft, name, reason, startDate, username };
}

function getTodayDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatDate(value: string) {
  if (!value || value === '0000-00-00') return '—';
  return value.replaceAll('-', '.');
}

function formatDistance(value: string) {
  if (!value) return '—';
  return /公里|km/i.test(value) ? value : `${value} km`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : '操作失败，请稍后重试。';
}
