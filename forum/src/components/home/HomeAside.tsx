import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Bike, CalendarDays, ChevronLeft, ChevronRight, Clock3, Info, Pin, Settings } from 'lucide-react';
import type { HomeCalendarEvent, HomeSignupActivity, HomeThread } from '../../api/home';
import { useAuth } from '../../context/AuthContext';
import type { HomeDataStatus } from '../../hooks/useHomeData';
import { canManageCalendar } from '../../utils/calendarManagement';
import { toForumHref } from '../../utils/forumBasePath';
import { getForumNavigationHref } from '../../utils/forumNavigation';

const HOME_CALENDAR_MIN_YEAR = 1995;
const HOME_CALENDAR_MONTHS = Array.from({ length: 12 }, (_item, month) => ({
  label: `${month + 1} 月`,
  value: month,
}));

function formatCountdown(deadline: string, now: number) {
  const remaining = new Date(deadline).getTime() - now;
  if (remaining <= 0) return '报名已截止';

  const totalMinutes = Math.floor(remaining / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return `${days} 天 ${hours} 小时 ${minutes} 分钟`;
}

function formatActivityDateRange(startsOn: string, endsOn: string) {
  const [startYear, startMonth, startDay] = startsOn.split('-').map(Number);
  const [, endMonth, endDay] = endsOn.split('-').map(Number);
  const startLabel = `${startMonth}月${startDay}日`;
  if (startsOn === endsOn) return startLabel;
  const endYear = Number(endsOn.slice(0, 4));
  if (startYear === endYear) return `${startLabel} – ${endMonth}月${endDay}日`;
  return `${startYear}年${startLabel} – ${endYear}年${endMonth}月${endDay}日`;
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

type PinnedProps = {
  items: HomeThread[];
  readThreadIds: ReadonlySet<string>;
};

type CalendarProps = {
  compact?: boolean;
  error: string;
  items: HomeCalendarEvent[];
  onVisibleDateChange: (date: string) => void;
  status: HomeDataStatus;
};

type DesktopHomeAsideProps = PinnedProps & {
  calendarError: string;
  calendarItems: HomeCalendarEvent[];
  calendarStatus: HomeDataStatus;
  onCalendarVisibleDateChange: (date: string) => void;
  signupItems: HomeSignupActivity[];
};

function PinnedPanel({ items, readThreadIds }: PinnedProps) {
  return (
    <section className="aside-card" aria-labelledby="pinned-title">
      <header className="aside-card-header">
        <span className="aside-card-icon"><Pin size={15} /></span>
        <h2 id="pinned-title">全局置顶</h2>
      </header>
      <ul className="pinned-list">
        {items.map((thread) => (
          <li key={thread.id}>
            <a href={getForumNavigationHref(thread.href, window.location.href)}>
              {!readThreadIds.has(thread.id) && <span>新</span>}
              <strong>{thread.title}</strong>
              <ChevronRight size={14} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ActivitySignupList({
  className = '',
  items,
}: {
  className?: string;
  items: HomeSignupActivity[];
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className={`signup-list ${className}`}>
      {items.filter((activity) => new Date(activity.endsAt).getTime() > now).map((activity) => {
        const upcoming = new Date(activity.startsAt).getTime() > now;
        const countdownTarget = upcoming ? activity.startsAt : activity.endsAt;
        return (
          <a className="signup-activity-card" href={getForumNavigationHref(activity.href, window.location.href)} key={activity.id}>
            <div className="signup-card-topline">
              <span>{formatActivityDateRange(activity.activityStartsOn, activity.activityEndsOn)}</span>
              <em>{upcoming ? '即将开始' : '报名中'}</em>
            </div>
            <h3>{activity.title}</h3>
            <div className="signup-card-footer">
              <time className="signup-card-countdown" dateTime={countdownTarget}>
                <Clock3 size={13} />
                <strong>{formatCountdown(countdownTarget, now)}</strong>
              </time>
              {!upcoming && (
                <span className="signup-card-count">{activity.signupCount} 人报名</span>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}

function ActivitySignupPanel({ items }: { items: HomeSignupActivity[] }) {
  return (
    <section className="aside-card" aria-labelledby="signup-title">
      <header className="aside-card-header">
        <span className="aside-card-icon"><Bike size={16} /></span>
        <h2 id="signup-title">活动报名</h2>
      </header>
      <ActivitySignupList items={items} />
    </section>
  );
}

export function ActivityCalendar({ compact = false, error, items, onVisibleDateChange, status }: CalendarProps) {
  const { status: authStatus, viewer } = useAuth();
  const periodPickerId = useId();
  const periodPickerRef = useRef<HTMLDivElement | null>(null);
  const [today] = useState(() => new Date());
  const [monthCursor, setMonthCursor] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));
  const [selectedKey, setSelectedKey] = useState(() => (
    dateKey(today.getFullYear(), today.getMonth(), today.getDate())
  ));
  const [openPeriodPicker, setOpenPeriodPicker] = useState<'month' | 'year' | null>(null);
  const { year, month } = monthCursor;
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const maxYear = today.getFullYear() + 1;
  const yearOptions = useMemo(
    () => Array.from(
      { length: maxYear - HOME_CALENDAR_MIN_YEAR + 1 },
      (_item, index) => maxYear - index,
    ),
    [maxYear],
  );
  const canMoveToPreviousMonth = year > HOME_CALENDAR_MIN_YEAR || month > 0;
  const canMoveToNextMonth = year < maxYear || month < 11;

  useEffect(() => {
    if (!openPeriodPicker) return;

    function closePickerOnOutsidePress(event: PointerEvent) {
      if (!periodPickerRef.current?.contains(event.target as Node)) setOpenPeriodPicker(null);
    }

    function closePickerOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenPeriodPicker(null);
    }

    document.addEventListener('pointerdown', closePickerOnOutsidePress);
    window.addEventListener('keydown', closePickerOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closePickerOnOutsidePress);
      window.removeEventListener('keydown', closePickerOnEscape);
    };
  }, [openPeriodPicker]);

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
    if (next.getFullYear() < HOME_CALENDAR_MIN_YEAR || next.getFullYear() > maxYear) return;
    selectMonth(next.getFullYear(), next.getMonth());
  }

  function selectMonth(nextYear: number, nextMonth: number) {
    setMonthCursor({ year: nextYear, month: nextMonth });
    setSelectedKey(dateKey(nextYear, nextMonth, 1));
    setOpenPeriodPicker(null);
    onVisibleDateChange(dateKey(nextYear, nextMonth, 1));
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
          {authStatus === 'authenticated' && canManageCalendar(viewer?.username, viewer?.rights) ? (
            <a className="calendar-manage-link" href={toForumHref('/calendar-admin')}>
              <Settings size={13} />管理
            </a>
          ) : null}
        </header>
      )}

      <div className="calendar-month-nav">
        <button className="calendar-month-arrow" type="button" aria-label="上个月" disabled={!canMoveToPreviousMonth} onClick={() => moveMonth(-1)}><ChevronLeft size={16} /></button>
        <div className="calendar-period-control" ref={periodPickerRef}>
          <div className="calendar-period-title">
            <button
              aria-controls={`${periodPickerId}-year`}
              aria-expanded={openPeriodPicker === 'year'}
              aria-haspopup="listbox"
              className="calendar-period-trigger"
              onClick={() => setOpenPeriodPicker((current) => current === 'year' ? null : 'year')}
              type="button"
            >
              {year}
            </button>
            <span>年</span>
            <button
              aria-controls={`${periodPickerId}-month`}
              aria-expanded={openPeriodPicker === 'month'}
              aria-haspopup="listbox"
              className="calendar-period-trigger"
              onClick={() => setOpenPeriodPicker((current) => current === 'month' ? null : 'month')}
              type="button"
            >
              {month + 1}
            </button>
            <span>月</span>
          </div>

          {openPeriodPicker === 'year' ? (
            <div aria-label="选择年份" className="calendar-period-popover calendar-year-picker" id={`${periodPickerId}-year`} role="listbox">
              {yearOptions.map((optionYear) => (
                <button
                  aria-selected={optionYear === year}
                  className={optionYear === year ? 'calendar-period-option-active' : ''}
                  key={optionYear}
                  onClick={() => selectMonth(optionYear, month)}
                  role="option"
                  type="button"
                >
                  {optionYear}
                </button>
              ))}
            </div>
          ) : null}

          {openPeriodPicker === 'month' ? (
            <div aria-label="选择月份" className="calendar-period-popover calendar-month-picker" id={`${periodPickerId}-month`} role="listbox">
              {HOME_CALENDAR_MONTHS.map((optionMonth) => (
                <button
                  aria-selected={optionMonth.value === month}
                  className={optionMonth.value === month ? 'calendar-period-option-active' : ''}
                  key={optionMonth.value}
                  onClick={() => selectMonth(year, optionMonth.value)}
                  role="option"
                  type="button"
                >
                  {optionMonth.value + 1} 月
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button className="calendar-month-arrow" type="button" aria-label="下个月" disabled={!canMoveToNextMonth} onClick={() => moveMonth(1)}><ChevronRight size={16} /></button>
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
          const isSelectable = cellDate.getFullYear() >= HOME_CALENDAR_MIN_YEAR
            && cellDate.getFullYear() <= maxYear;

          return (
            <button
              type="button"
              disabled={!isSelectable}
              className={`${offset !== 0 ? 'calendar-day-muted' : ''} ${selected ? 'calendar-day-selected' : ''} ${isToday ? 'calendar-day-today' : ''}`}
              aria-label={`${cellDate.getFullYear()} 年 ${cellDate.getMonth() + 1} 月 ${cellDate.getDate()} 日${hasActivity ? '，有活动' : ''}`}
              onClick={() => {
                if (!isSelectable) return;
                setSelectedKey(cellKey);
                if (offset !== 0) {
                  setMonthCursor({ year: cellDate.getFullYear(), month: cellDate.getMonth() });
                  onVisibleDateChange(cellKey);
                }
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
            <a href={getForumNavigationHref(activity.url, window.location.href)} key={activity.id}>{content}</a>
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
  onCalendarVisibleDateChange,
  readThreadIds,
  signupItems,
}: DesktopHomeAsideProps) {
  const asideRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const aside = asideRef.current;
    if (!aside) return;

    const desktopMedia = window.matchMedia('(min-width: 1024px)');
    let animationFrame = 0;
    let lastScrollY = Math.max(window.scrollY, 0);
    let stickyTop = 0;
    let minStickyTop = 0;
    let maxStickyTop = 0;

    const clampStickyTop = (value: number) => Math.min(maxStickyTop, Math.max(minStickyTop, value));

    const updateAsideBounds = (initialize = false) => {
      const asideHeight = aside.getBoundingClientRect().height;
      const rootStyle = window.getComputedStyle(document.documentElement);
      const shell = aside.closest<HTMLElement>('.page-shell');
      const shellStyle = shell ? window.getComputedStyle(shell) : null;
      const topBarHeight = Number.parseFloat(rootStyle.getPropertyValue('--topbar-height')) || 64;
      const bottomGap = Number.parseFloat(shellStyle?.getPropertyValue('--home-page-bottom-gap') ?? '') || 10;
      const wasAtTop = stickyTop >= maxStickyTop - 1;
      const wasAtBottom = stickyTop <= minStickyTop + 1;

      maxStickyTop = topBarHeight + 10;
      minStickyTop = Math.min(maxStickyTop, window.innerHeight - asideHeight - bottomGap);
      aside.style.setProperty('--home-aside-height', `${asideHeight}px`);

      if (initialize) {
        stickyTop = clampStickyTop(aside.getBoundingClientRect().top);
      } else if (wasAtBottom) {
        stickyTop = minStickyTop;
      } else if (wasAtTop) {
        stickyTop = maxStickyTop;
      } else {
        stickyTop = clampStickyTop(stickyTop);
      }

      if (desktopMedia.matches) {
        aside.style.setProperty('--home-aside-sticky-top', `${stickyTop}px`);
      }
    };

    const updateStickyPosition = () => {
      animationFrame = 0;
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (!desktopMedia.matches || scrollDelta === 0) return;
      stickyTop = clampStickyTop(stickyTop - scrollDelta);
      aside.style.setProperty('--home-aside-sticky-top', `${stickyTop}px`);
    };

    const scheduleStickyPositionUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateStickyPosition);
    };

    const handleViewportChange = () => {
      lastScrollY = Math.max(window.scrollY, 0);
      if (desktopMedia.matches) {
        updateAsideBounds(true);
      } else {
        aside.style.removeProperty('--home-aside-sticky-top');
      }
    };

    updateAsideBounds(true);
    window.addEventListener('scroll', scheduleStickyPositionUpdate, { passive: true });
    window.addEventListener('resize', handleViewportChange);
    desktopMedia.addEventListener('change', handleViewportChange);

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => updateAsideBounds());
    observer?.observe(aside);
    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      observer?.disconnect();
      window.removeEventListener('scroll', scheduleStickyPositionUpdate);
      window.removeEventListener('resize', handleViewportChange);
      desktopMedia.removeEventListener('change', handleViewportChange);
      aside.style.removeProperty('--home-aside-sticky-top');
      aside.style.removeProperty('--home-aside-height');
    };
  }, []);

  return (
    <aside className="home-aside" ref={asideRef}>
      {items.length > 0 && <PinnedPanel items={items} readThreadIds={readThreadIds} />}
      {signupItems.length > 0 && <ActivitySignupPanel items={signupItems} />}
      <ActivityCalendar
        error={calendarError}
        items={calendarItems}
        onVisibleDateChange={onCalendarVisibleDateChange}
        status={calendarStatus}
      />
    </aside>
  );
}
