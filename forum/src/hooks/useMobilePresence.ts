import { useLayoutEffect, useState } from 'react';

const MOBILE_MOTION = '(max-width: 1023px) and (prefers-reduced-motion: no-preference)';

export function useMobilePresence(open: boolean, exitDuration: number) {
  const [present, setPresent] = useState(open);

  useLayoutEffect(() => {
    if (open) {
      setPresent(true);
      return;
    }
    if (!present) return;

    const media = window.matchMedia(MOBILE_MOTION);
    const finish = () => setPresent(false);
    if (!media.matches) {
      finish();
      return;
    }

    const timer = window.setTimeout(finish, exitDuration);
    const onMotionChange = () => { if (!media.matches) finish(); };
    media.addEventListener('change', onMotionChange);
    return () => {
      window.clearTimeout(timer);
      media.removeEventListener('change', onMotionChange);
    };
  }, [exitDuration, open, present]);

  return { present: open || present, closing: !open && present };
}
