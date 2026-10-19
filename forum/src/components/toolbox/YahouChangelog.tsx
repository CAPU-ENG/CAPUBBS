import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { YAHOU_STATUS_LABELS, type YahouLogEntry, type YahouStatus } from '../../data/yahouLineage';
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
  { key: 'week', label: '七天内' },
  { key: 'month', label: '一月内' },
  { key: 'year', label: '一年内' },
  { key: 'all', label: '不限' },
  { key: 'custom', label: '自定义' },
] as const;
type RangeKey = typeof RANGES[number]['key'];

function rangeStart(range: RangeKey, startDate: string) {
  if (range === 'all') return '';
  if (range === 'custom') return startDate;
  const date = new Date();
  if (range === 'week') date.setDate(date.getDate() - 7);
  else if (range === 'month') date.setMonth(date.getMonth() - 1);
  else date.setFullYear(date.getFullYear() - 1);
  return formatDate(date.getTime() / 1000);
}

// An exact ID shows only that member's entries; otherwise match any ID containing the text.
function matchesMember(entry: YahouLogEntry, query: string, exact: boolean) {
  const ids = [entry.id, entry.action === 'add' ? entry.parentId : null]
    .filter((id): id is string => id !== null)
    .map((id) => id.toLocaleLowerCase());
  return ids.some((id) => (exact ? id === query : id.includes(query)));
}

// Dates are local YYYY-MM-DD strings, so plain string comparison orders them.
function groupByDate(log: YahouLogEntry[], from: string, to: string, member: string) {
  const query = member.trim().toLocaleLowerCase();
  const exact = Boolean(query) && log.some((entry) => matchesMember(entry, query, true));
  const groups: { date: string; entries: YahouLogEntry[] }[] = [];
  for (let index = log.length - 1; index >= 0; index -= 1) {
    const entry = log[index];
    const date = formatDate(entry.time);
    if ((from && date < from) || (to && date > to)) continue;
    if (query && !matchesMember(entry, query, exact)) continue;
    const last = groups[groups.length - 1];
    if (last?.date === date) last.entries.push(entry); else groups.push({ date, entries: [entry] });
  }
  return groups;
}

export function YahouChangelog({ log, onClose }: { log: YahouLogEntry[]; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [range, setRange] = useState<RangeKey>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [member, setMember] = useState('');
  const memberIds = useMemo(() => [...new Set(log.flatMap((entry) => (
    entry.action === 'add' && entry.parentId !== null ? [entry.id, entry.parentId] : [entry.id]
  )))].sort(), [log]);
  const groups = useMemo(
    () => groupByDate(log, rangeStart(range, startDate), range === 'custom' ? endDate : '', member),
    [log, range, startDate, endDate, member],
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
            {groups.map((group) => (
              <li key={group.date}>
                <time dateTime={group.date}>{group.date.split('-').join('/')}</time>
                <ul>{group.entries.map((entry, index) => <li key={`${entry.time}-${index}`}>{describe(entry)}</li>)}</ul>
              </li>
            ))}
          </ol>
        ) : <p className="yahou-empty">暂无记录</p>}
      </div>
    </DialogNativeLayer>, document.body,
  );
}
