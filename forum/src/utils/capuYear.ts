/** CAPU years run from Sep 1; the year is named after the summer it ends in (2026-10-03 → 2027). */
export function getCapuYear(date: Date) {
  return date.getMonth() >= 8 ? date.getFullYear() + 1 : date.getFullYear();
}

function getCapuYearStart(date: Date) {
  return new Date(getCapuYear(date) - 1, 8, 1);
}

/** Parses the API's local "YYYY-MM-DD HH:mm:ss" timestamp; returns null when absent or malformed. */
export function parseForumTimestamp(value: string | undefined) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec((value ?? '').trim());
  if (!match) return null;
  const [, year, month, day, hour = '0', minute = '0', second = '0'] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isBeforeCurrentCapuYear(value: string | undefined, now = new Date()) {
  const date = parseForumTimestamp(value);
  return date !== null && date < getCapuYearStart(now);
}
