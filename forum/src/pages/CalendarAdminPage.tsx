import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  Pencil,
  Save,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { fetchHomeCalendar, type HomeCalendarEvent } from '../api/home';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import { canManageCalendar, saveCalendarEventsForDate } from '../utils/calendarManagement';

type CalendarFormState = {
  date: string;
  description: string;
  time: string;
  title: string;
};

type LoadStatus = 'error' | 'loading' | 'ready';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export function CalendarAdminPage() {
  const { status: authStatus, viewer } = useAuth();
  const [today] = useState(() => startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(today));
  const [events, setEvents] = useState<HomeCalendarEvent[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading');
  const [feedback, setFeedback] = useState('选择日期后，可新增或修改首页日历活动。');
  const [feedbackKind, setFeedbackKind] = useState<'error' | 'info' | 'success'>('info');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState<CalendarFormState>(() => emptyForm(today));
  const authPending = authStatus === 'loading' || authStatus === 'restoring';
  const isAuthorized = authStatus === 'authenticated' && canManageCalendar(viewer?.username);
  const selectedDateKey = formatDateKey(selectedDate);

  useEffect(() => {
    if (!isAuthorized) return;

    const controller = new AbortController();
    setLoadStatus('loading');

    void fetchHomeCalendar(controller.signal).then(
      (items) => {
        setEvents(items);
        setLoadStatus('ready');
      },
      (error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setLoadStatus('error');
        setFeedbackKind('error');
        setFeedback(error instanceof Error ? error.message : '日历加载失败，请稍后重试。');
      },
    );

    return () => controller.abort();
  }, [isAuthorized]);

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, HomeCalendarEvent[]>();
    events.forEach((event) => {
      const dateEvents = grouped.get(event.date) ?? [];
      dateEvents.push(event);
      grouped.set(event.date, dateEvents);
    });
    return grouped;
  }, [events]);
  const selectedEvents = eventsByDate.get(selectedDateKey) ?? [];
  const monthCells = useMemo(() => buildMonthCells(visibleMonth), [visibleMonth]);

  function selectDate(date: Date) {
    setSelectedDate(date);
    setVisibleMonth(startOfMonth(date));
    setEditingId(null);
    setFormState(emptyForm(date));
    setFeedbackKind('info');
    setFeedback('已切换日期，可新增活动或从左侧列表选择编辑。');
  }

  function moveMonth(delta: number) {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + delta, 1);
    selectDate(nextMonth);
  }

  function startCreate() {
    setEditingId(null);
    setFormState(emptyForm(selectedDate));
    setFeedbackKind('info');
    setFeedback(`正在为 ${formatDateLabel(selectedDate)} 新增活动。`);
  }

  function startEdit(event: HomeCalendarEvent) {
    const date = parseDateKey(event.date);
    setSelectedDate(date);
    setVisibleMonth(startOfMonth(date));
    setEditingId(event.id);
    setFormState({
      date: event.date,
      description: event.description,
      time: event.time,
      title: event.title,
    });
    setFeedbackKind('info');
    setFeedback(`正在编辑“${event.title}”。`);
  }

  async function submitForm() {
    if (isSaving) return;
    const title = formState.title.trim();
    const date = formState.date.trim();
    const time = formState.time.trim();

    if (!title) return showError('请填写活动标题。');
    if (!isValidDateKey(date)) return showError('请选择有效日期。');
    if (!isValidTime(time)) return showError('请选择有效活动时间。');

    const previousEvent = editingId ? events.find((event) => event.id === editingId) ?? null : null;
    const nextEvent: HomeCalendarEvent = {
      date,
      description: formState.description.trim(),
      id: previousEvent?.id ?? `calendar-${date}-${time}-${Date.now()}`,
      time,
      title,
      url: '',
    };
    const nextEvents = previousEvent
      ? events.map((event) => event.id === previousEvent.id ? nextEvent : event)
      : [...events, nextEvent];
    const changedDates = Array.from(new Set([previousEvent?.date, nextEvent.date].filter(Boolean))) as string[];

    setIsSaving(true);
    setFeedbackKind('info');
    setFeedback('正在保存日历活动…');

    try {
      for (const changedDate of changedDates) {
        await saveCalendarEventsForDate(
          changedDate,
          sortEvents(nextEvents.filter((event) => event.date === changedDate)),
        );
      }
      const sortedEvents = sortEvents(nextEvents);
      const nextSelectedDate = parseDateKey(nextEvent.date);
      setEvents(sortedEvents);
      setSelectedDate(nextSelectedDate);
      setVisibleMonth(startOfMonth(nextSelectedDate));
      setEditingId(nextEvent.id);
      setFeedbackKind('success');
      setFeedback(`“${nextEvent.title}”已保存，首页日历将显示最新内容。`);
    } catch (error) {
      showError(error instanceof Error ? error.message : '日历保存失败，请稍后重试。');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteEvent(event: HomeCalendarEvent) {
    if (isSaving) return;
    const nextEvents = events.filter((item) => item.id !== event.id);
    setIsSaving(true);
    setFeedbackKind('info');
    setFeedback(`正在删除“${event.title}”…`);

    try {
      await saveCalendarEventsForDate(
        event.date,
        sortEvents(nextEvents.filter((item) => item.date === event.date)),
      );
      setEvents(sortEvents(nextEvents));
      if (editingId === event.id) startCreate();
      setFeedbackKind('success');
      setFeedback(`“${event.title}”已从日历中删除。`);
    } catch (error) {
      showError(error instanceof Error ? error.message : '活动删除失败，请稍后重试。');
    } finally {
      setIsSaving(false);
    }
  }

  function updateFormField(field: keyof CalendarFormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormState((current) => ({ ...current, [field]: value }));

      if (field === 'date' && isValidDateKey(value)) {
        const date = parseDateKey(value);
        setSelectedDate(date);
        setVisibleMonth(startOfMonth(date));
      }
    };
  }

  function showError(message: string) {
    setFeedbackKind('error');
    setFeedback(message);
  }

  return (
    <div className="calendar-admin-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar />

      <main className="calendar-admin-shell">
        {authPending ? (
          <CalendarAdminState icon={<LoaderCircle className="animate-spin" size={22} />} title="正在确认管理权限" />
        ) : !isAuthorized ? (
          <CalendarAdminState icon={<ShieldAlert size={22} />} title="无法进入日历管理">
            此页面仅供 ID 为“组织部”的会员使用。
          </CalendarAdminState>
        ) : (
          <section className="calendar-admin-panel" aria-labelledby="calendar-admin-title">
            <header className="calendar-admin-heading">
              <div>
                <div className="calendar-admin-title-line">
                  <span className="calendar-admin-title-icon"><CalendarDays size={19} /></span>
                  <h1 id="calendar-admin-title">日历管理</h1>
                  <em>组织部</em>
                </div>
              </div>
              <div className="calendar-admin-heading-actions">
                <a href="/"><ArrowLeft size={15} />返回首页</a>
              </div>
            </header>

            <div className="calendar-admin-content">
              <div className="calendar-admin-overview">
                <section className="calendar-admin-calendar" aria-label="选择活动日期">
                  <div className="calendar-admin-month-nav">
                    <button aria-label="上个月" onClick={() => moveMonth(-1)} type="button"><ChevronLeft size={17} /></button>
                    <strong>{visibleMonth.getFullYear()} 年 {visibleMonth.getMonth() + 1} 月</strong>
                    <button aria-label="下个月" onClick={() => moveMonth(1)} type="button"><ChevronRight size={17} /></button>
                  </div>

                  <div className="calendar-admin-weekdays" aria-hidden="true">
                    {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
                  </div>
                  <div className="calendar-admin-grid">
                    {monthCells.map((date) => {
                      const key = formatDateKey(date);
                      const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
                      const isSelected = key === selectedDateKey;
                      const isToday = key === formatDateKey(today);
                      const hasEvent = eventsByDate.has(key);
                      return (
                        <button
                          aria-label={`${formatDateLabel(date)}${hasEvent ? '，有活动' : ''}`}
                          aria-pressed={isSelected}
                          className={`${!isCurrentMonth ? 'calendar-admin-day-muted' : ''} ${isSelected ? 'calendar-admin-day-selected' : ''} ${isToday ? 'calendar-admin-day-today' : ''}`}
                          key={key}
                          onClick={() => selectDate(date)}
                          type="button"
                        >
                          {date.getDate()}
                          {hasEvent ? <span aria-hidden="true" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="calendar-admin-day-events" aria-labelledby="calendar-admin-day-title">
                  <header>
                    <h2 id="calendar-admin-day-title"><CalendarDays size={16} />{formatDateLabel(selectedDate)}</h2>
                    <span>{loadStatus === 'loading' ? '读取中' : `${selectedEvents.length} 项`}</span>
                  </header>
                  <div className="calendar-admin-event-list">
                    {loadStatus === 'loading' ? (
                      <p className="calendar-admin-empty"><LoaderCircle className="animate-spin" size={17} />正在读取活动…</p>
                    ) : loadStatus === 'error' && events.length === 0 ? (
                      <p className="calendar-admin-empty">暂时无法显示活动，请稍后刷新重试。</p>
                    ) : selectedEvents.length === 0 ? (
                      <p className="calendar-admin-empty">当天暂无活动</p>
                    ) : selectedEvents.map((event) => (
                      <article className={editingId === event.id ? 'calendar-admin-event-editing' : ''} key={event.id}>
                        <div>
                          <strong>{event.title}</strong>
                          <span><Clock3 size={13} />{event.time}</span>
                          {event.description ? <p>{event.description}</p> : null}
                        </div>
                        <div className="calendar-admin-event-actions">
                          <button aria-label={`编辑${event.title}`} disabled={isSaving} onClick={() => startEdit(event)} type="button"><Pencil size={14} /></button>
                          <button aria-label={`删除${event.title}`} className="calendar-admin-delete" disabled={isSaving} onClick={() => void deleteEvent(event)} type="button"><Trash2 size={14} /></button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <section className="calendar-admin-form" aria-label="日历活动表单">
                <div className="calendar-admin-form-fields">
                  <label>
                    <span>活动标题</span>
                    <input maxLength={40} onChange={updateFormField('title')} placeholder="请输入活动名称" value={formState.title} />
                  </label>
                  <div className="calendar-admin-form-row">
                    <label>
                      <span>活动日期</span>
                      <input onChange={updateFormField('date')} type="date" value={formState.date} />
                    </label>
                    <label>
                      <span>活动时间</span>
                      <input onChange={updateFormField('time')} step={300} type="time" value={formState.time} />
                    </label>
                  </div>
                  <label>
                    <span>显示说明 <small>选填</small></span>
                    <textarea maxLength={120} onChange={updateFormField('description')} placeholder="地点、集合信息或简短备注" rows={5} value={formState.description} />
                  </label>
                </div>

                <p className="sr-only" aria-live="polite" role={feedbackKind === 'error' ? 'alert' : 'status'}>
                  {feedback}
                </p>
                <footer>
                  <button className="calendar-admin-save" disabled={isSaving || loadStatus === 'loading'} onClick={() => void submitForm()} type="button">
                    {isSaving ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}
                    {isSaving ? '保存中' : '保存活动'}
                  </button>
                  <button disabled={isSaving} onClick={startCreate} type="button">重置</button>
                </footer>
              </section>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function CalendarAdminState({
  children,
  icon,
  title,
}: {
  children?: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <section className="calendar-admin-state">
      <span>{icon}</span>
      <h1>{title}</h1>
      {children ? <p>{children}</p> : null}
      <a href="/"><ArrowLeft size={15} />返回首页</a>
    </section>
  );
}

function emptyForm(date: Date): CalendarFormState {
  return {
    date: formatDateKey(date),
    description: '',
    time: '09:00',
    title: '',
  };
}

function buildMonthCells(month: Date) {
  const firstWeekday = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_item, index) => (
    startOfDay(new Date(month.getFullYear(), month.getMonth(), index - firstWeekday + 1))
  ));
}

function sortEvents(events: HomeCalendarEvent[]) {
  return [...events].sort((left, right) => (
    `${left.date} ${left.time} ${left.title}`.localeCompare(`${right.date} ${right.time} ${right.title}`)
  ));
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(date: Date) {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return startOfDay(new Date(year, month - 1, day));
}

function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = parseDateKey(value);
  return formatDateKey(date) === value;
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
