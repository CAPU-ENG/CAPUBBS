import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'neutral' | 'primary' | 'danger';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: boolean;
  hoverDanger?: boolean;
};

const variantClassNames: Record<ButtonVariant, string> = {
  neutral: '',
  primary: 'forum-button-primary',
  danger: 'forum-button-danger',
};

export function getButtonClassName({ className, hoverDanger = false, icon = false, variant = 'neutral' }: Pick<ButtonProps, 'className' | 'hoverDanger' | 'icon' | 'variant'> = {}) {
  return [
    'forum-button',
    variantClassNames[variant],
    icon ? 'forum-button-icon' : '',
    hoverDanger ? 'forum-button-hover-danger' : '',
    className ?? '',
  ].filter(Boolean).join(' ');
}

export function Button({ className, hoverDanger, icon, type = 'button', variant, ...props }: ButtonProps) {
  return <button {...props} className={getButtonClassName({ className, hoverDanger, icon, variant })} type={type} />;
}
