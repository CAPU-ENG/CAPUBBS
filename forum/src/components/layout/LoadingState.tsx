import { AppBackground } from './AppBackground';
import { LoadingSpinner } from './LoadingSpinner';
import { TopBar } from './TopBar';

type LoadingStateProps = {
  ariaLabel?: string;
  className?: string;
  id?: string;
  label: string;
  variant?: 'page' | 'panel';
};

export function LoadingState({ ariaLabel, className = '', id, label, variant = 'page' }: LoadingStateProps) {
  const variantClassName = variant === 'page'
    ? 'forum-loading-state-page'
    : 'forum-loading-state-panel';
  const classes = `forum-loading-state forum-loading-state-card ${variantClassName}${className ? ` ${className}` : ''}`;

  return (
    <section aria-busy="true" aria-label={ariaLabel} aria-live="polite" className={classes} id={id} role="status">
      <span aria-hidden="true" className="forum-loading-visual">
        <LoadingSpinner size={variant === 'page' ? 40 : 34} />
      </span>
      {variant === 'page' ? <h1>{label}</h1> : <p>{label}</p>}
    </section>
  );
}

export function RouteLoadingPage({ label = '正在打开页面' }: { label?: string }) {
  return (
    <div className="forum-route-loading-page relative text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar />
      <main className="forum-route-loading-shell">
        <LoadingState label={label} />
      </main>
    </div>
  );
}
