import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/** Persistent notice while the browser reports no network, so failed loads have a visible cause. */
export function OfflineNotice() {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine === false);

  useEffect(() => {
    const update = () => setOffline(navigator.onLine === false);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) return null;
  return createPortal(
    <div className="forum-toast forum-toast-error forum-offline-notice" role="status">网络已断开，恢复连接后可重新加载</div>,
    document.body,
  );
}
