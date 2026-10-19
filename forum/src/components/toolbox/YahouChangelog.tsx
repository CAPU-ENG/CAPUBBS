import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Users, X } from 'lucide-react';
import { YAHOU_STATUSES, YAHOU_STATUS_LABELS, type YahouLogEntry, type YahouMember, type YahouStatus } from '../../data/yahouLineage';
import { getForumNavigationHref } from '../../utils/forumNavigation';
import { DialogNativeLayer } from '../layout/DialogPresence';
import { Button } from '../Button';

function formatDate(seconds: number) {
  const date = new Date(seconds * 1000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function Member({ id }: { id: string }) {
  return <a className="yahou-log-member" href={getForumNavigationHref(`/bbs/user?name=${encodeURIComponent(id)}`, window.location.href)}>{id}</a>;
}

function Status({ status }: { status: YahouStatus }) {
  return <span className={`yahou-log-status yahou-${status}`}>{YAHOU_STATUS_LABELS[status]}</span>;
}

function describe(entry: YahouLogEntry) {
  if (entry.action === 'status') return <><Member id={entry.id} /> 由 <Status status={entry.from} /> 成为了 <Status status={entry.status} /></>;
  // Direct members of 实践部 have no master to name.
  if (entry.parentId === null) return <><Member id={entry.id} /> 成为了 <Status status={entry.status} /></>;
  return <><Member id={entry.parentId} /> 收 <Member id={entry.id} /> 为徒弟</>;
}

const RANGES = [
  { key: 'capu-current', label: '本车协年' },
  { key: 'capu-last', label: '上一车协年' },
  { key: 'year', label: '一年内' },
  { key: 'all', label: '不限' },
  { key: 'custom', label: '自定义' },
] as const;
type RangeKey = typeof RANGES[number]['key'];

const TYPES = [
  { key: 'adopt', label: '收徒' },
  { key: 'passed', label: '成为押后' },
  { key: 'qualified', label: '成为师父' },
  { key: 'all', label: '不限' },
] as const;
type TypeKey = typeof TYPES[number]['key'];

/** A 车协年 starts on 1 September and is named after the year it ends in: 2026-11-01 is in 2027. */
function capuYear(date: Date) {
  return date.getMonth() >= 8 ? date.getFullYear() + 1 : date.getFullYear();
}

// Bounds are inclusive local YYYY-MM-DD strings; an empty string leaves that side open.
function rangeBounds(range: RangeKey, startDate: string, endDate: string) {
  if (range === 'all') return { from: '', to: '' };
  if (range === 'custom') return { from: startDate, to: endDate };
  const today = new Date();
  if (range === 'year') {
    today.setFullYear(today.getFullYear() - 1);
    return { from: formatDate(today.getTime() / 1000), to: '' };
  }
  const year = capuYear(today) - (range === 'capu-last' ? 1 : 0);
  return { from: `${year - 1}-09-01`, to: `${year}-08-31` };
}

function matchesType(entry: YahouLogEntry, type: TypeKey) {
  if (type === 'all') return true;
  if (type === 'adopt') return entry.action === 'add' && entry.parentId !== null;
  // A direct member of 实践部 is listed as becoming their initial status.
  const becomes = entry.action === 'status' || entry.parentId === null;
  return becomes && entry.status === type;
}

// An exact ID shows only that member's entries; otherwise match any ID containing the text.
function matchesMember(entry: YahouLogEntry, query: string, exact: boolean) {
  const ids = [entry.id, entry.action === 'add' ? entry.parentId : null]
    .filter((id): id is string => id !== null)
    .map((id) => id.toLocaleLowerCase());
  return ids.some((id) => (exact ? id === query : id.includes(query)));
}

type LogGroup = { key: string; master: string | null; entries: YahouLogEntry[] };

/** Newest first, grouped by day, or by master when listing apprenticeships. */
function groupLog(log: YahouLogEntry[], filters: { from: string; to: string; member: string; type: TypeKey; byMaster: boolean }) {
  const query = filters.member.trim().toLocaleLowerCase();
  const exact = Boolean(query) && log.some((entry) => matchesMember(entry, query, true));
  const groups: LogGroup[] = [];
  const masters = new Map<string, LogGroup>();
  for (let index = log.length - 1; index >= 0; index -= 1) {
    const entry = log[index];
    const date = formatDate(entry.time);
    if ((filters.from && date < filters.from) || (filters.to && date > filters.to)) continue;
    if (!matchesType(entry, filters.type) || (query && !matchesMember(entry, query, exact))) continue;
    if (filters.byMaster && entry.action === 'add' && entry.parentId !== null) {
      const group = masters.get(entry.parentId);
      if (group) group.entries.push(entry);
      else {
        const created = { key: entry.parentId, master: entry.parentId, entries: [entry] };
        masters.set(entry.parentId, created);
        groups.push(created);
      }
      continue;
    }
    const last = groups[groups.length - 1];
    if (last?.key === date) last.entries.push(entry); else groups.push({ key: date, master: null, entries: [entry] });
  }
  return groups;
}

type Milestone = { status: YahouStatus; time?: number };

/**
 * Every status up to the member's current one, each with the time the log saw it reached.
 * Statuses reached before the log existed are listed without a time.
 */
function statusMilestones(log: YahouLogEntry[], members: YahouMember[]) {
  const reachedAt = new Map<string, Partial<Record<YahouStatus, number>>>();
  const lastLogged = new Map<string, YahouStatus>();
  for (const entry of log) {
    reachedAt.set(entry.id, { ...reachedAt.get(entry.id), [entry.status]: entry.time });
    lastLogged.set(entry.id, entry.status);
  }
  const current = new Map(members.map((member) => [member.id, member.status]));
  return (id: string): Milestone[] => {
    const status = current.get(id) ?? lastLogged.get(id) ?? 'pending';
    const times = reachedAt.get(id) ?? {};
    return YAHOU_STATUSES.slice(0, YAHOU_STATUSES.indexOf(status) + 1).map((reached) => ({ status: reached, time: times[reached] }));
  };
}

function displayDate(date: string) {
  return date.split('-').join('/');
}

export function YahouChangelog({ log, members, onClose }: { log: YahouLogEntry[]; members: YahouMember[]; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [range, setRange] = useState<RangeKey>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<TypeKey>('all');
  const [byMaster, setByMaster] = useState(false);
  const [member, setMember] = useState('');
  const memberIds = useMemo(() => [...new Set(log.flatMap((entry) => (
    entry.action === 'add' && entry.parentId !== null ? [entry.id, entry.parentId] : [entry.id]
  )))].sort(), [log]);
  const grouped = type === 'adopt' && byMaster;
  const milestones = useMemo(() => statusMilestones(log, members), [log, members]);
  const groups = useMemo(
    () => groupLog(log, { ...rangeBounds(range, startDate, endDate), member, type, byMaster: grouped }),
    [log, range, startDate, endDate, member, type, grouped],
  );

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
  }, []);

  return createPortal(
    <DialogNativeLayer aria-labelledby={titleId} className="yahou-workspace yahou-overview-dialog yahou-changelog-dialog"
      onCancel={(event) => { event.preventDefault(); onClose(); }} ref={dialogRef}>
      <header className="yahou-overview-header">
        <h2 id={titleId}>更新记录</h2>
        <Button aria-label="关闭更新记录" autoFocus icon onClick={onClose} type="button"><X size={19} /></Button>
      </header>
      <div className="yahou-changelog-filters">
        <div aria-labelledby={`${titleId}-range`} className="yahou-changelog-filter" role="radiogroup">
          <span className="yahou-changelog-filter-label" id={`${titleId}-range`}>时间</span>
          <div className="search-range-options">
            {RANGES.map((item) => (
              <label className={`search-segmented-option ${range === item.key ? 'search-segmented-option-active' : ''}`} key={item.key}>
                <input checked={range === item.key} name={`${titleId}-range`} onChange={() => setRange(item.key)} type="radio" />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          {range === 'custom' ? (
            <div className="search-date-grid">
              <label><span>从</span><input max={endDate || undefined} onChange={(event) => setStartDate(event.target.value)} type="date" value={startDate} /></label>
              <label><span>至</span><input min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} type="date" value={endDate} /></label>
            </div>
          ) : null}
        </div>
        <div aria-labelledby={`${titleId}-type`} className="yahou-changelog-filter" role="radiogroup">
          <span className="yahou-changelog-filter-label" id={`${titleId}-type`}>类型</span>
          <div className="search-range-options">
            {TYPES.map((item) => (
              <label className={`search-segmented-option ${type === item.key ? 'search-segmented-option-active' : ''}`} key={item.key}>
                <input checked={type === item.key} name={`${titleId}-type`} onChange={() => setType(item.key)} type="radio" />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          {type === 'adopt' ? (
            <Button aria-pressed={byMaster} className="yahou-changelog-group" onClick={() => setByMaster((value) => !value)} variant={byMaster ? 'primary' : 'neutral'}><Users size={14} />按师父分组</Button>
          ) : null}
        </div>
        <div className="yahou-changelog-filter">
          <label className="yahou-changelog-filter-label" htmlFor={`${titleId}-member`}>ID</label>
          <span className="search-filter-input yahou-changelog-member">
            <Search size={14} />
            <input autoComplete="off" id={`${titleId}-member`} list={`${titleId}-members`} maxLength={100} onChange={(event) => setMember(event.target.value)} placeholder="不限 ID" type="search" value={member} />
          </span>
          <datalist id={`${titleId}-members`}>{memberIds.map((id) => <option key={id} value={id} />)}</datalist>
        </div>
      </div>
      <div className="yahou-changelog-body">
        {groups.length ? (
          <ol className="yahou-changelog-list">
            {groups.map((group) => group.master === null ? (
              <li key={group.key}>
                <time className="yahou-changelog-key" dateTime={group.key}>{displayDate(group.key)}</time>
                <ul>{group.entries.map((entry, index) => <li key={`${entry.time}-${index}`}>{describe(entry)}</li>)}</ul>
              </li>
            ) : (
              <li key={`master-${group.key}`}>
                <span className="yahou-changelog-key yahou-changelog-master"><Member id={group.master} /><span>{group.entries.length}</span></span>
                <ul>{group.entries.map((entry, index) => (
                  <li className="yahou-changelog-apprentice" key={`${entry.time}-${index}`}>
                    <Member id={entry.id} />
                    <span className="yahou-changelog-milestones">
                      {milestones(entry.id).map((milestone) => {
                        const date = milestone.time === undefined ? null : formatDate(milestone.time);
                        return (
                          <span className="yahou-changelog-milestone" key={milestone.status}>
                            <Status status={milestone.status} />
                            {date ? <time dateTime={date}>{displayDate(date)}</time> : null}
                          </span>
                        );
                      })}
                    </span>
                  </li>
                ))}</ul>
              </li>
            ))}
          </ol>
        ) : <p className="yahou-empty">暂无记录</p>}
      </div>
    </DialogNativeLayer>, document.body,
  );
}
