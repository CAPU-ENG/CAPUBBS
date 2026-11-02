import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const DAY_SECONDS = 24 * 60 * 60;
const BEIJING_OFFSET_SECONDS = 8 * 60 * 60;

/** Seconds until the next Beijing midnight, when the daily view limit lifts. */
function secondsUntilReset() {
  const beijingSeconds = Math.floor(Date.now() / 1000) + BEIJING_OFFSET_SECONDS;
  return DAY_SECONDS - (beijingSeconds % DAY_SECONDS);
}

function formatCountdown(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export function ThreadViewLimitCountdown({ onElapsed }: { onElapsed: () => void }) {
  const [remaining, setRemaining] = useState(secondsUntilReset);

  useEffect(() => {
    let previous = secondsUntilReset();
    const timer = window.setInterval(() => {
      const next = secondsUntilReset();
      // Wrapping back to a full day means midnight has passed.
      if (next > previous) {
        window.clearInterval(timer);
        onElapsed();
        return;
      }
      previous = next;
      setRemaining(next);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [onElapsed]);

  return (
    <span className="thread-request-countdown" role="timer">
      <Clock size={15} />
      <time>{formatCountdown(remaining)}</time>
    </span>
  );
}
