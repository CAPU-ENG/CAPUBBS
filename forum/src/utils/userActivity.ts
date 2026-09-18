export type ActivityDay = { date: string; viewTimes: number };

export type UserActivity = {
  username: string;
  startDate: string;
  endDate: string;
  days: ActivityDay[];
};

export function activityDate(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value
    ? timestamp : null;
}

export function activityLevel(viewTimes: number) {
  if (viewTimes === 0) return 0;
  if (viewTimes < 10) return 1;
  if (viewTimes < 30) return 2;
  if (viewTimes < 60) return 3;
  return 4;
}

export function buildActivityCalendar(activity: UserActivity) {
  const start = activityDate(activity.startDate);
  const end = activityDate(activity.endDate);
  if (start === null || end === null || end < start || end - start > 364 * 86400000) {
    throw new Error('无效的活跃度日期范围');
  }
  const counts = new Map(activity.days.map((day) => [day.date, day.viewTimes]));
  const days: ActivityDay[] = [];
  const cells: Array<ActivityDay | null> = Array(new Date(start).getUTCDay()).fill(null);
  for (let timestamp = start; timestamp <= end; timestamp += 86400000) {
    const date = new Date(timestamp).toISOString().slice(0, 10);
    const day = { date, viewTimes: counts.get(date) ?? 0 };
    days.push(day);
    cells.push(day);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Array<Array<ActivityDay | null>> = [];
  const months: Array<{ column: number; label: string; key: string }> = [];
  let previousMonth = '';
  for (let index = 0; index < cells.length; index += 7) {
    const week = cells.slice(index, index + 7);
    const firstDay = week.find((day) => day !== null);
    if (firstDay && firstDay.date.slice(0, 7) !== previousMonth) {
      previousMonth = firstDay.date.slice(0, 7);
      // Avoid a partial first month colliding with the next month's label.
      if (months.length && weeks.length - months[months.length - 1].column < 2) months.pop();
      months.push({ column: weeks.length, label: `${Number(firstDay.date.slice(5, 7))}月`, key: previousMonth });
    }
    weeks.push(week);
  }
  return { days, months, weeks };
}
