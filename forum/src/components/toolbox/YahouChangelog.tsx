import { useId, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
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

export function YahouChangelog({ log, onClose }: { log: YahouLogEntry[]; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

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
      <div className="yahou-changelog-body">
        {log.length ? (
          <ol className="yahou-changelog-list">
            {log.map((entry, index) => (
              <li key={`${entry.time}-${index}`}>
                <time dateTime={formatDate(entry.time)}>{formatDate(entry.time)}</time>
                <span className="yahou-log-text">{describe(entry)}</span>
              </li>
            )).reverse()}
          </ol>
        ) : <p className="yahou-empty">暂无记录</p>}
      </div>
    </DialogNativeLayer>, document.body,
  );
}
