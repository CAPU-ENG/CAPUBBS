import { CircleHelp } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

const EXPIRES_AT = Date.parse('2027-09-20T00:00:00+08:00');

export function StatisticsDataNotice() {
  const tooltipId = useId();
  const [visible, setVisible] = useState(() => Date.now() < EXPIRES_AT);

  useEffect(() => {
    let timer: number | undefined;
    function update() {
      window.clearTimeout(timer);
      const remaining = EXPIRES_AT - Date.now();
      setVisible(remaining > 0);
      // Recheck daily so a year-long delay cannot overflow the browser timer.
      if (remaining > 0) timer = window.setTimeout(update, Math.min(remaining, 86400000));
    }
    update();
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  if (!visible) return null;

  return (
    <span className="statistics-data-notice">
      <button aria-describedby={tooltipId} aria-label="历史数据说明" className="statistics-data-notice-trigger" type="button">
        <CircleHelp aria-hidden="true" size={15} />
      </button>
      <span className="statistics-data-notice-tooltip" id={tooltipId} role="tooltip">
        <span>2026 年 9 月 19 日前的数据有失真，仅供参考</span>
      </span>
    </span>
  );
}
