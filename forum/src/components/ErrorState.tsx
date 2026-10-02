import { RefreshCw } from 'lucide-react';
import { Button } from './Button';

/** Load failure with a way out: the message and a button that retries only the failed request. */
export function ErrorState({ className = '', message, onRetry, retryLabel = '重新加载' }: {
  className?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className={`forum-error-state ${className}`.trim()} role="alert">
      <p>{message}</p>
      {onRetry ? <Button onClick={onRetry}><RefreshCw aria-hidden="true" size={15} />{retryLabel}</Button> : null}
    </div>
  );
}
