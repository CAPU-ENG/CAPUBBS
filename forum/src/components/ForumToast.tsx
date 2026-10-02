import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/** Short-lived notice pinned to the bottom of the viewport; rendered into body so transformed ancestors cannot trap it. */
export function ForumToast({ message, onClose, tone = 'info', duration = 4000 }: {
  message: string | null;
  onClose: () => void;
  tone?: 'info' | 'error';
  duration?: number;
}) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, message, onClose]);

  if (!message) return null;
  return createPortal(
    <div className={`forum-toast forum-toast-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {message}
    </div>,
    document.body,
  );
}
