import { Component, lazy, Suspense, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { YahouLineage } from '../../data/yahouLineage';
import { DialogNativeLayer } from '../layout/DialogPresence';
import { LoadingSpinner } from '../layout/LoadingSpinner';

const YahouLineageNetwork = lazy(() => import('./YahouLineageNetwork').then((module) => ({ default: module.YahouLineageNetwork })));

// Keep both the modal shell and this boundary outside the lazy graph module.
// Import failures and renderer errors must leave the forum and close button usable.
export class YahouOverviewErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="yahou-overview-failure" role="alert">
      <p>总览加载失败</p>
      <button className="toolbox-secondary-button" onClick={() => window.location.reload()} type="button">刷新页面</button>
    </div>;
    return this.props.children;
  }
}

export function YahouLineageOverview({ data, onClose }: { data: YahouLineage; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [opened, setOpened] = useState(false);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    // The graph measures its viewport during mount; only mount it inside an open modal.
    setOpened(true);
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
  }, []);

  return createPortal(
    <DialogNativeLayer aria-labelledby={titleId} className="yahou-workspace yahou-overview-dialog"
      onCancel={(event) => { event.preventDefault(); onClose(); }} ref={dialogRef}>
      <header className="yahou-overview-header">
        <h2 id={titleId}>谱系总览</h2>
        <button aria-label="关闭谱系总览" autoFocus className="toolbox-icon-button" onClick={onClose} type="button"><X size={19} /></button>
      </header>
      <YahouOverviewErrorBoundary key={data.revision}>
        <Suspense fallback={<p className="yahou-load-state" role="status"><LoadingSpinner size={18} />正在加载总览</p>}>
          {opened ? <YahouLineageNetwork data={data} /> : null}
        </Suspense>
      </YahouOverviewErrorBoundary>
    </DialogNativeLayer>, document.body,
  );
}
