import type { HomeCalendarEvent } from '../api/home';

export function calendarEventOccursOn(event: HomeCalendarEvent, date: string) {
  return event.date <= date && date <= (event.end ? event.end.slice(0, 10) : event.date);
}

export function calendarEventTimeLabel(event: HomeCalendarEvent) {
  if (!event.end) return event.time;
  const endDate = event.end.slice(0, 10);
  const endTime = event.end.slice(11, 16);
  return endDate === event.date
    ? `${event.time} – ${endTime}`
    : `${event.date} ${event.time} – ${endDate} ${endTime}`;
}
