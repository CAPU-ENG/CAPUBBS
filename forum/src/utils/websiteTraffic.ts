import { getBoardById } from '../data/boards.ts';
import { activityDate } from './userActivity.ts';

export const TRAFFIC_PERIODS = [
  { id: 'week', label: '一周', days: 7 },
  { id: 'month', label: '一月', days: 30 },
  { id: 'year', label: '一年', days: 365 },
] as const;

export type TrafficPeriod = typeof TRAFFIC_PERIODS[number]['id'];
export type TrafficSeries = { id: string; label: string; bid: number | null; values: number[] };
export type WebsiteTraffic = {
  period: TrafficPeriod;
  startDate: string;
  endDate: string;
  dates: string[];
  series: TrafficSeries[];
};

const INVALID_DATA = '流量数据格式不正确，请稍后重试。';

export function parseWebsiteTraffic(value: unknown, period: TrafficPeriod): WebsiteTraffic {
  const data = asRow(value);
  const start = activityDate(data.startDate);
  const end = activityDate(data.endDate);
  const length = TRAFFIC_PERIODS.find((item) => item.id === period)!.days;
  if (data.period !== period || start === null || end === null || end - start !== (length - 1) * 86400000
    || !Array.isArray(data.dates) || data.dates.length !== length || !Array.isArray(data.boards)) {
    throw new Error(INVALID_DATA);
  }
  const dates = data.dates.map((date, index) => {
    if (activityDate(date) !== start + index * 86400000) throw new Error(INVALID_DATA);
    return date as string;
  });
  const readValues = (values: unknown): number[] => {
    if (!Array.isArray(values) || values.length !== length
      || values.some((count) => typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0)) {
      throw new Error(INVALID_DATA);
    }
    return values as number[];
  };
  const total = readValues(data.total);
  const seen = new Set<number>();
  const boards = data.boards.map((value): TrafficSeries => {
    const board = asRow(value);
    if (typeof board.bid !== 'number' || !Number.isSafeInteger(board.bid) || board.bid < 0 || seen.has(board.bid)) {
      throw new Error(INVALID_DATA);
    }
    seen.add(board.bid);
    return {
      id: `board-${board.bid}`,
      bid: board.bid,
      label: getBoardById(board.bid)?.label ?? (typeof board.name === 'string' && board.name ? board.name : `版块 ${board.bid}`),
      values: readValues(board.views),
    };
  });
  for (let index = 0; index < length; index++) {
    const sum = boards.reduce((value, board) => value + board.values[index], 0);
    if (!Number.isSafeInteger(sum) || sum !== total[index]) throw new Error(INVALID_DATA);
  }
  return {
    period, startDate: data.startDate as string, endDate: data.endDate as string, dates,
    series: [{ id: 'total', label: '全站', bid: null, values: total }, ...boards],
  };
}

export function trafficAxis(series: TrafficSeries[]) {
  const maximum = series.reduce((peak, item) => item.values.reduce((value, count) => Math.max(value, count), peak), 0);
  const rawStep = Math.max(1, maximum / 4);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const factor = [1, 2, 5, 10].find((value) => value * magnitude >= rawStep)!;
  const step = factor * magnitude;
  return { maximum: step * 4, ticks: [0, step, step * 2, step * 3, step * 4] };
}

export function trafficDateTicks(length: number, width: number) {
  const intervals = Math.min(length - 1, Math.max(2, Math.floor(width / 100)));
  return Array.from({ length: intervals + 1 }, (_, index) => Math.round(index * (length - 1) / intervals));
}

function asRow(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
