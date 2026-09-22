import type { HomeCalendarEvent } from '../api/home';

const CALENDAR_MANAGEMENT_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

type ApiEnvelope = {
  code: number;
  message?: string;
  data?: { id?: string };
};

export function canManageCalendar(
  _username: string | null | undefined,
  rights: number | null | undefined,
) {
  return (rights ?? 0) >= 3;
}

export async function saveCalendarEvent(event: HomeCalendarEvent, existingId?: string) {
  const [year, month, day] = event.date.split('-');
  const result = await calendarRequest({
    action: 'save', id: existingId ?? '', year, month, day,
    title: event.title, content: event.description, time: event.time,
    url: event.url, end: event.end,
  });
  const id = result.data?.id;
  if (!id) throw new Error('日历服务未返回活动标识，请刷新后重试。');
  return String(id);
}

export async function deleteCalendarEvent(id: string) {
  await calendarRequest({ action: 'delete', id });
}

async function calendarRequest(params: Record<string, string>) {
  let response: Response;
  try {
    response = await fetch(CALENDAR_MANAGEMENT_API_URL, {
      body: new URLSearchParams({ ask: 'savecalendar', ...params }),
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
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
  return payload;
}
