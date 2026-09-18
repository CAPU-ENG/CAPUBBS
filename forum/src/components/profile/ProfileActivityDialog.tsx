import { Activity, RefreshCw, X } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { fetchUserActivity } from '../../api/userActivity';
import { activityLevel, buildActivityCalendar, type UserActivity } from '../../utils/userActivity';
import { DialogNativeLayer } from '../layout/DialogPresence';
import { LoadingState } from '../layout/LoadingState';

export function ProfileActivityDialog({ username, onClose }: { username: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ data: UserActivity | null; error: string }>({ data: null, error: '' });

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, error: '' });
    void fetchUserActivity(username, controller.signal).then((data) => {
      if (!controller.signal.aborted) setState({ data, error: '' });
    }, (error: unknown) => {
      if (!controller.signal.aborted) {
        setState({ data: null, error: error instanceof Error ? error.message : '活跃度读取失败，请稍后重试。' });
      }
    });
    return () => controller.abort();
  }, [username, revision]);

  return createPortal(
    <DialogNativeLayer
      aria-labelledby={titleId}
      className="profile-dialog profile-activity-dialog"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
      ref={dialogRef}
    >
      <header>
        <span><Activity aria-hidden="true" size={18} /></span>
        <h2 id={titleId}>{username}的活跃度</h2>
        <button aria-label="关闭活跃度" autoFocus onClick={onClose} type="button"><X size={18} /></button>
      </header>
      <div className="profile-dialog-body profile-activity-body">
        {state.error ? (
          <div className="profile-activity-state" role="alert">
            <p>{state.error}</p>
            <button className="profile-secondary-action" onClick={() => setRevision((value) => value + 1)} type="button">
              <RefreshCw aria-hidden="true" size={15} />重试
            </button>
          </div>
        ) : state.data ? <ActivityHeatmap activity={state.data} /> : (
          <LoadingState label="正在读取活跃度" variant="panel" />
        )}
      </div>
    </DialogNativeLayer>,
    document.body,
  );
}

const levelLabels = ['0 次', '1–9 次', '10–29 次', '30–59 次', '60 次及以上'];

function ActivityHeatmap({ activity }: { activity: UserActivity }) {
  const calendar = useMemo(() => buildActivityCalendar(activity), [activity]);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
  const [focusDate, setFocusDate] = useState(activity.endDate);
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0, visible: false });
  const chartRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const activeDate = hoveredDate ?? focusedDate;
  const activeDay = calendar.days.find((day) => day.date === activeDate);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  }, []);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !activeDate) return;
    function positionTooltip() {
      const chart = chartRef.current;
      const tooltip = tooltipRef.current;
      const cell = scroller?.querySelector<HTMLButtonElement>(`button[data-date="${activeDate}"]`);
      if (!chart || !tooltip || !cell || !scroller) return;
      const chartBounds = chart.getBoundingClientRect();
      const cellBounds = cell.getBoundingClientRect();
      const scrollBounds = scroller.getBoundingClientRect();
      const halfWidth = tooltip.getBoundingClientRect().width / 2;
      setTooltipPosition({
        left: Math.max(halfWidth, Math.min(chartBounds.width - halfWidth, cellBounds.left + cellBounds.width / 2 - chartBounds.left)),
        top: cellBounds.top - chartBounds.top - 6,
        visible: cellBounds.right > scrollBounds.left && cellBounds.left < scrollBounds.right,
      });
    }
    positionTooltip();
    scroller.addEventListener('scroll', positionTooltip, { passive: true });
    window.addEventListener('resize', positionTooltip);
    return () => {
      scroller.removeEventListener('scroll', positionTooltip);
      window.removeEventListener('resize', positionTooltip);
    };
  }, [activeDate]);

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, date: string) {
    const index = calendar.days.findIndex((day) => day.date === date);
    const offsets: Record<string, number> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 };
    let next = index;
    if (event.key in offsets) next += offsets[event.key];
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = calendar.days.length - 1;
    else return;
    event.preventDefault();
    const target = calendar.days[Math.max(0, Math.min(calendar.days.length - 1, next))];
    setFocusDate(target.date);
    scrollerRef.current?.querySelector<HTMLButtonElement>(`button[data-date="${target.date}"]`)?.focus();
  }

  return (
    <>
      <div className="profile-activity-chart" ref={chartRef}>
        <div className="profile-activity-scroller" ref={scrollerRef}>
          <div className="profile-activity-calendar" style={{ '--activity-weeks': calendar.weeks.length } as CSSProperties}>
            <div aria-hidden="true" className="profile-activity-months">
              {calendar.months.map((month) => <span key={month.key} style={{ gridColumn: month.column + 1 }}>{month.label}</span>)}
            </div>
            <div aria-label="每日活跃度" className="profile-activity-grid" role="group">
              {calendar.weeks.map((week, index) => (
                <div className="profile-activity-week" key={index}>
                  {week.map((day, weekday) => day ? (
                    <button
                      aria-label={`${day.date}，活跃度 ${day.viewTimes}`}
                      className="profile-activity-cell"
                      data-date={day.date}
                      data-level={activityLevel(day.viewTimes)}
                      key={day.date}
                      onBlur={() => setFocusedDate(null)}
                      onClick={(event) => event.currentTarget.focus()}
                      onFocus={() => { setFocusedDate(day.date); setFocusDate(day.date); }}
                      onKeyDown={(event) => moveFocus(event, day.date)}
                      onMouseEnter={() => setHoveredDate(day.date)}
                      onMouseLeave={() => setHoveredDate(null)}
                      tabIndex={focusDate === day.date ? 0 : -1}
                      type="button"
                    />
                  ) : <span aria-hidden="true" className="profile-activity-blank" key={weekday} />)}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="profile-activity-weekdays">
          {'SMTWTFS'.split('').map((label, index) => <span key={index}>{label}</span>)}
        </div>
        {activeDay && (
          <div
            aria-hidden="true"
            className="profile-activity-tooltip"
            ref={tooltipRef}
            style={{ left: tooltipPosition.left, top: tooltipPosition.top, visibility: tooltipPosition.visible ? 'visible' : 'hidden' }}
          >{activeDay.viewTimes}</div>
        )}
      </div>
      <div className="profile-activity-footer">
        <span>活跃度=每日帖子访问累计次数</span>
        <div aria-label="活跃度颜色：0 次、1 至 9 次、10 至 29 次、30 至 59 次、60 次及以上" className="profile-activity-legend">
          <span>少</span>
          {levelLabels.map((label, level) => <span aria-hidden="true" className="profile-activity-cell" data-level={level} key={level} title={label} />)}
          <span>多</span>
        </div>
      </div>
    </>
  );
}
