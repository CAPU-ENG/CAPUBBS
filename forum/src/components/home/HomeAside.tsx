import { useEffect, useMemo, useState } from 'react';
import { Bike, CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Pin } from 'lucide-react';
import { activities, pinnedThreads, signupActivities } from './homeData';

function formatCountdown(deadline: string, now: number) {
  const remaining = new Date(deadline).getTime() - now;
  if (remaining <= 0) return '报名已截止';

  const totalMinutes = Math.floor(remaining / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return `${days} 天 ${hours} 小时 ${minutes} 分钟`;
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function PinnedPanel() {
  return (
    <section className="aside-card" aria-labelledby="pinned-title">
      <header className="aside-card-header">
        <span className="aside-card-icon"><Pin size={15} /></span>
        <h2 id="pinned-title">全局置顶</h2>
      </header>
      <ul className="pinned-list">
        {pinnedThreads.map((thread, index) => (
          <li key={thread}>
            <a href={`#pinned-${index}`}>
              {index < 2 && <span>新</span>}
              <strong>{thread}</strong>
              <ChevronRight size={14} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ActivitySignupList({ className = '' }: { className?: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className={`signup-list ${className}`}>
      {signupActivities.map((activity) => (
        <a className="signup-activity-card" href={`#signup-${activity.title}`} key={activity.title}>
          <div className="signup-card-topline">
            <span>{activity.date}</span>
            <em>报名中</em>
          </div>
          <h3>{activity.title}</h3>
          <div className="signup-card-footer">
            <time className="signup-card-countdown" dateTime={activity.deadline}>
              <Clock3 size={13} />
              <strong>{formatCountdown(activity.deadline, now)}</strong>
            </time>
            <span className="signup-card-count">{activity.signupCount} 人报名</span>
          </div>
        </a>
      ))}
    </div>
  );
}

function ActivitySignupPanel() {
  return (
    <section className="aside-card" aria-labelledby="signup-title">
      <header className="aside-card-header">
        <span className="aside-card-icon"><Bike size={16} /></span>
        <h2 id="signup-title">活动报名</h2>
      </header>
      <ActivitySignupList />
    </section>
  );
}

export function ActivityCalendar({ compact = false }: { compact?: boolean }) {
  const [monthCursor, setMonthCursor] = useState({ year: 2026, month: 7 });
  const [selectedKey, setSelectedKey] = useState('2026-08-23');
  const { year, month } = monthCursor;

  const cells = useMemo(() => {
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();

    return Array.from({ length: 42 }, (_, index) => {
      const calendarDay = index - firstWeekday + 1;
      if (calendarDay < 1) {
        return { day: previousMonthDays + calendarDay, offset: -1 };
      }
      if (calendarDay > daysInMonth) {
        return { day: calendarDay - daysInMonth, offset: 1 };
      }
      return { day: calendarDay, offset: 0 };
    });
  }, [month, year]);

  const selectedActivities = activities.filter((activity) => activity.date === selectedKey);

  function moveMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setMonthCursor({ year: next.getFullYear(), month: next.getMonth() });
    setSelectedKey(dateKey(next.getFullYear(), next.getMonth(), 1));
  }

  return (
    <section
      className={`aside-card activity-calendar ${compact ? 'activity-calendar-compact' : ''}`}
      id={compact ? 'mobile-activity-calendar' : 'activity-calendar'}
      aria-label={compact ? '活动日历' : undefined}
      aria-labelledby={compact ? undefined : 'calendar-title'}
    >
      {!compact && (
        <header className="aside-card-header">
          <span className="aside-card-icon"><CalendarDays size={15} /></span>
          <h2 id="calendar-title">活动日历</h2>
        </header>
      )}

      <div className="calendar-month-nav">
        <button type="button" aria-label="上个月" onClick={() => moveMonth(-1)}><ChevronLeft size={16} /></button>
        <strong>{year} 年 {month + 1} 月</strong>
        <button type="button" aria-label="下个月" onClick={() => moveMonth(1)}><ChevronRight size={16} /></button>
      </div>

      <div className="calendar-grid calendar-weekdays" aria-hidden="true">
        {['一', '二', '三', '四', '五', '六', '日'].map((weekday) => <span key={weekday}>{weekday}</span>)}
      </div>
      <div className="calendar-grid">
        {cells.map(({ day, offset }, index) => {
          const cellDate = new Date(year, month + offset, day);
          const cellKey = dateKey(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
          const hasActivity = activities.some((activity) => activity.date === cellKey);
          const selected = selectedKey === cellKey;
          const isToday = cellKey === '2026-08-20';

          return (
            <button
              type="button"
              className={`${offset !== 0 ? 'calendar-day-muted' : ''} ${selected ? 'calendar-day-selected' : ''} ${isToday ? 'calendar-day-today' : ''}`}
              aria-label={`${cellDate.getFullYear()} 年 ${cellDate.getMonth() + 1} 月 ${cellDate.getDate()} 日${hasActivity ? '，有活动' : ''}`}
              onClick={() => {
                setSelectedKey(cellKey);
                if (offset !== 0) setMonthCursor({ year: cellDate.getFullYear(), month: cellDate.getMonth() });
              }}
              key={`${cellKey}-${index}`}
            >
              {day}
              {hasActivity && <span className="calendar-event-dot" />}
            </button>
          );
        })}
      </div>

      <div className="calendar-agenda">
        {selectedActivities.length > 0 ? selectedActivities.map((activity) => (
          <a href={`#activity-${activity.date}`} key={`${activity.date}-${activity.title}`}>
            <strong>{activity.title}</strong>
            <span><Clock3 size={13} />{activity.time}</span>
            <span><MapPin size={13} />{activity.place}</span>
          </a>
        )) : (
          <p>当天暂无活动</p>
        )}
      </div>
    </section>
  );
}

export function DesktopHomeAside() {
  return (
    <aside className="home-aside">
      <PinnedPanel />
      <ActivitySignupPanel />
      <ActivityCalendar />
    </aside>
  );
}
