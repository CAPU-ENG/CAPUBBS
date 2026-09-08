import type { HomeCalendarEvent } from '../api/home';

const CALENDAR_MANAGEMENT_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

type ApiEnvelope = {
  code: number;
  message?: string;
};

export function canManageCalendar(
  username: string | null | undefined,
  rights: number | null | undefined,
) {
  return username?.trim() === '组织部' || (rights ?? 0) >= 3;
}

export async function saveCalendarEventsForDate(
  date: string,
  events: HomeCalendarEvent[],
  signal?: AbortSignal,
) {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error('请选择有效日期。');

  let response: Response;
  try {
    response = await fetch(CALENDAR_MANAGEMENT_API_URL, {
      body: new URLSearchParams({
        ask: 'savecalendar',
        content: JSON.stringify(events.map((event) => ({
          content: event.description,
          time: event.time,
          title: event.title,
        }))),
        day: match[3],
        month: match[2],
        year: match[1],
      }),
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new Error('暂时无法连接日历服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new Error('日历服务返回了无法识别的数据。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.message?.trim() || '日历保存失败，请稍后重试。');
  }
}
