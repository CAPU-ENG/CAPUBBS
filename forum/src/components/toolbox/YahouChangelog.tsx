import { useId, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { YAHOU_STATUS_LABELS, type YahouLogEntry } from '../../data/yahouLineage';
import { DialogNativeLayer } from '../layout/DialogPresence';
import { Button } from '../Button';

function formatTime(seconds: number) {
  const date = new Date(seconds * 1000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function describe(entry: YahouLogEntry) {
  if (entry.action === 'add') {
    return `添加 ${entry.id}（${YAHOU_STATUS_LABELS[entry.status]}），师父 ${entry.parentId ?? '实践部'}`;
  }
  return `将 ${entry.id} 由 ${YAHOU_STATUS_LABELS[entry.from]} 改为 ${YAHOU_STATUS_LABELS[entry.status]}`;
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
                <time dateTime={new Date(entry.time * 1000).toISOString()}>{formatTime(entry.time)}</time>
                <span><strong>{entry.operator}</strong> {describe(entry)}</span>
              </li>
            )).reverse()}
          </ol>
        ) : <p className="yahou-empty">暂无记录</p>}
      </div>
    </DialogNativeLayer>, document.body,
  );
}
