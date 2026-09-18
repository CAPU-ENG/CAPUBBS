import { activityDate, type ActivityDay, type UserActivity } from '../utils/userActivity';

const ACTIVITY_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

export async function fetchUserActivity(username: string, signal?: AbortSignal): Promise<UserActivity> {
  let response: Response;
  try {
    response = await fetch(ACTIVITY_API_URL, {
      method: 'POST',
      body: new URLSearchParams({ ask: 'user_activity', username }),
      cache: 'no-store',
      credentials: 'include',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('暂时无法连接论坛服务，请稍后重试。');
  }
  let payload: Record<string, unknown>;
  try {
    payload = asRow(await response.json());
  } catch {
    throw new Error('论坛服务返回了无法识别的数据。');
  }
  if (!response.ok || payload.code !== 0) {
    throw new Error(typeof payload.message === 'string' ? payload.message : '活跃度读取失败，请稍后重试。');
  }
  const data = asRow(payload.data);
  const start = activityDate(data.startDate);
  const end = activityDate(data.endDate);
  if (typeof data.username !== 'string' || !data.username || start === null || end === null
    || end - start !== 364 * 86400000 || !Array.isArray(data.days) || data.days.length > 365) {
    throw new Error('论坛服务返回了无法识别的数据。');
  }
  const seen = new Set<string>();
  const days = data.days.map((value): ActivityDay => {
    const row = asRow(value);
    const date = activityDate(row.date);
    if (date === null || date < start || date > end || typeof row.viewTimes !== 'number'
      || !Number.isSafeInteger(row.viewTimes) || row.viewTimes < 0 || seen.has(row.date as string)) {
      throw new Error('论坛服务返回了无法识别的数据。');
    }
    seen.add(row.date as string);
    return { date: row.date as string, viewTimes: row.viewTimes };
  });
  return { username: data.username, startDate: data.startDate as string, endDate: data.endDate as string, days };
}

function asRow(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
