import { getBoardById, PRIMARY_BOARDS } from '../data/boards.ts';
import { activityDate } from './userActivity.ts';

export const TRAFFIC_PERIODS = [
  { id: 'week', label: '一周', days: 7 },
  { id: 'month', label: '一月', days: 30 },
  { id: 'year', label: '一年', days: 365 },
] as const;

export type TrafficPeriod = typeof TRAFFIC_PERIODS[number]['id'];
export type TrafficSeries = { id: string; label: string; bid: number | null; values: number[] };
export type TrafficBars = {
  total: TrafficSeries | undefined;
  layers: Array<{ series: TrafficSeries; starts: number[]; ends: number[] }>;
  maximum: number;
};
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

export function groupTrafficSeries(series: TrafficSeries[]) {
  const primaryIds = new Set(PRIMARY_BOARDS.map((board) => board.id));
  const total = series.find((item) => item.bid === null);
  const primary = PRIMARY_BOARDS.map((board) => series.find((item) => item.bid === board.id))
    .filter((item): item is TrafficSeries => item !== undefined);
  const secondary = series.filter((item) => item.bid !== null && !primaryIds.has(item.bid));
  return { primary: total ? [total, ...primary] : primary, secondary };
}

export function buildTrafficBars(series: TrafficSeries[]): TrafficBars {
  const total = series.find((item) => item.bid === null);
  const sums = Array<number>(series[0]?.values.length ?? 0).fill(0);
  const layers = series.filter((item) => item.bid !== null).map((item) => {
    const starts = [...sums];
    item.values.forEach((value, index) => { sums[index] += value; });
    return { series: item, starts, ends: [...sums] };
  });
  // The site total already includes every board; it is a backdrop, never an extra layer.
  const maximum = (total?.values ?? sums).reduce((peak, value) => Math.max(peak, value), 0);
  return { total, layers, maximum };
}

export function trafficAxis(series: TrafficSeries[]) {
  const { maximum } = buildTrafficBars(series);
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

export function trafficYearStart(endDate: string) {
  return new Date(activityDate(endDate)! - 364 * 86400000).toISOString().slice(0, 10);
}

export function trafficPeriodForDate(date: string, endDate: string, period: TrafficPeriod): TrafficPeriod | null {
  const timestamp = activityDate(date);
  const end = activityDate(endDate);
  if (timestamp === null || end === null || timestamp > end || end - timestamp > 364 * 86400000) return null;
  const days = TRAFFIC_PERIODS.find((item) => item.id === period)!.days;
  return end - timestamp < days * 86400000 ? period : 'year';
}

function asRow(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
