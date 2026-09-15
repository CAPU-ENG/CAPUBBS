import { Filter, X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function ProfileFilterDialog({ children, invalidRange, onClose, onReset }: {
  children: ReactNode;
  invalidRange: boolean;
  onClose: () => void;
  onReset: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <dialog
      aria-labelledby={titleId}
      className="profile-dialog profile-filter-dialog"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      ref={dialogRef}
    >
      <header>
        <span><Filter aria-hidden="true" size={18} /></span>
        <h2 id={titleId}>筛选</h2>
        <button aria-label="关闭筛选" onClick={onClose} type="button"><X size={18} /></button>
      </header>
      {children}
      <footer className="profile-dialog-footer">
        <button className="profile-dialog-cancel" onClick={onReset} type="button">重置</button>
        <button className="profile-dialog-confirm" disabled={invalidRange} onClick={onClose} type="button">查看结果</button>
      </footer>
    </dialog>,
    document.body,
  );
}
