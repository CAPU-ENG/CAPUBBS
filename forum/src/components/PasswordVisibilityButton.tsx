import { Eye, EyeOff } from 'lucide-react';

/** Toggle placed after a password input inside its flex wrapper. */
export function PasswordVisibilityButton({ onToggle, visible }: { onToggle: () => void; visible: boolean }) {
  return (
    <button
      aria-label={visible ? '隐藏密码' : '显示密码'}
      aria-pressed={visible}
      className="password-visibility-toggle"
      onClick={(event) => {
        event.preventDefault();
        onToggle();
      }}
      type="button"
    >
      {visible ? <EyeOff aria-hidden="true" size={17} /> : <Eye aria-hidden="true" size={17} />}
    </button>
  );
}
