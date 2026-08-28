import { LoaderCircle } from 'lucide-react';

type LoadingSpinnerProps = {
  'aria-label'?: string;
  className?: string;
  label?: string;
  size?: number;
};

export function LoadingSpinner({
  'aria-label': ariaLabel,
  className = '',
  label,
  size = 20,
}: LoadingSpinnerProps) {
  const accessibleLabel = label ?? ariaLabel;

  return (
    <LoaderCircle
      aria-hidden={accessibleLabel ? undefined : true}
      aria-label={accessibleLabel}
      className={`forum-loading-spinner${className ? ` ${className}` : ''}`}
      role={accessibleLabel ? 'img' : undefined}
      size={size}
    />
  );
}
