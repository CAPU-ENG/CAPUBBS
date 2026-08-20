import { useEffect, useMemo, useState } from 'react';
import { Bike, CalendarDays, ChevronLeft, ChevronRight, Clock3, Info, Pin, Settings } from 'lucide-react';
import type { HomeCalendarEvent, HomeThread } from '../../api/home';
import { useAuth } from '../../context/AuthContext';
import type { HomeDataStatus } from '../../hooks/useHomeData';
import { canManageCalendar } from '../../utils/calendarManagement';
import { signupActivities } from './homeData';

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

type PinnedProps = {
  items: HomeThread[];
};

type CalendarProps = {
  compact?: boolean;
  error: string;
  items: HomeCalendarEvent[];
  status: HomeDataStatus;
};

type DesktopHomeAsideProps = PinnedProps & {
  calendarError: string;
  calendarItems: HomeCalendarEvent[];
  calendarStatus: HomeDataStatus;
};

function PinnedPanel({ items }: PinnedProps) {
  return (
    <section className="aside-card" aria-labelledby="pinned-title">
      <header className="aside-card-header">
        <span className="aside-card-icon"><Pin size={15} /></span>
        <h2 id="pinned-title">全局置顶</h2>
      </header>
      <ul className="pinned-list">
        {items.map((thread) => (
          <li key={thread.id}>
            <a href={thread.href}>
              {thread.isRecent && <span>新</span>}
              <strong>{thread.title}</strong>
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

export function ActivityCalendar({ compact = false, error, items, status }: CalendarProps) {
  const { status: authStatus, viewer } = useAuth();
  const [today] = useState(() => new Date());
  const [monthCursor, setMonthCursor] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));
  const [selectedKey, setSelectedKey] = useState(() => (
    dateKey(today.getFullYear(), today.getMonth(), today.getDate())
  ));
  const { year, month } = monthCursor;
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

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

  const activitiesByDate = useMemo(() => {
    const groupedActivities = new Map<string, HomeCalendarEvent[]>();
    items.forEach((activity) => {
      const dateActivities = groupedActivities.get(activity.date) ?? [];
      dateActivities.push(activity);
      groupedActivities.set(activity.date, dateActivities);
    });
    return groupedActivities;
  }, [items]);
  const selectedActivities = activitiesByDate.get(selectedKey) ?? [];

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
          {authStatus === 'authenticated' && canManageCalendar(viewer?.username) ? (
            <a className="calendar-manage-link" href="/calendar-admin">
              <Settings size={13} />管理
            </a>
          ) : null}
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
          const hasActivity = activitiesByDate.has(cellKey);
          const selected = selectedKey === cellKey;
          const isToday = cellKey === todayKey;

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
        {status === 'loading' ? (
          <p>活动加载中…</p>
        ) : status === 'error' ? (
          <p>{error}</p>
        ) : selectedActivities.length > 0 ? selectedActivities.map((activity) => {
          const content = (
            <>
              <strong>{activity.title}</strong>
              <span><Clock3 size={13} />{activity.time}</span>
              {activity.description && <span><Info size={13} />{activity.description}</span>}
            </>
          );
          return activity.url ? (
            <a href={activity.url} key={activity.id}>{content}</a>
          ) : (
            <article key={activity.id}>{content}</article>
          );
        }) : (
          <p>当天暂无活动</p>
        )}
      </div>
    </section>
  );
}

export function DesktopHomeAside({
  calendarError,
  calendarItems,
  calendarStatus,
  items,
}: DesktopHomeAsideProps) {
  return (
    <aside className="home-aside">
      {items.length > 0 && <PinnedPanel items={items} />}
      {signupActivities.length > 0 && <ActivitySignupPanel />}
      <ActivityCalendar
        error={calendarError}
        items={calendarItems}
        status={calendarStatus}
      />
    </aside>
  );
}
