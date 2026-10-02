import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Button } from './Button';
import { DialogLayer, DialogPresence } from './layout/DialogPresence';

export type ConfirmOptions = {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
};

type PendingConfirm = ConfirmOptions & { resolve: (confirmed: boolean) => void };

/** In-app replacement for window.confirm: `if (!(await confirm({ … }))) return;` */
export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const pendingRef = useRef<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => {
    pendingRef.current?.resolve(false);
    const next = { ...options, resolve };
    pendingRef.current = next;
    setPending(next);
  }), []);

  const settle = useCallback((confirmed: boolean) => {
    pendingRef.current?.resolve(confirmed);
    pendingRef.current = null;
    setPending(null);
  }, []);

  const confirmDialog = (
    <DialogPresence>{pending && (
      <DialogLayer className="management-dialog-backdrop" onDismiss={() => settle(false)} role="presentation">
        <section aria-describedby="forum-confirm-message" aria-labelledby="forum-confirm-title" aria-modal="true" className="management-dialog management-confirm-dialog" role="alertdialog">
          <header><h2 id="forum-confirm-title">{pending.title}</h2></header>
          <p className="management-dialog-copy" id="forum-confirm-message">{pending.message}</p>
          <footer>
            <Button data-autofocus onClick={() => settle(false)}>{pending.cancelLabel ?? '取消'}</Button>
            <Button onClick={() => settle(true)} variant={pending.danger ? 'danger' : 'primary'}>{pending.confirmLabel}</Button>
          </footer>
        </section>
      </DialogLayer>
    )}</DialogPresence>
  );

  return { confirm, confirmDialog };
}
