import { getBoardById } from '../data/boards';
import { getPublicProfilePath } from '../utils/userRoutes';

const DATA_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

type ApiRow = Record<string, unknown>;

export type DataDisplayPanel = 'checkin-ranking' | 'checkins' | 'online' | 'punishments';

export type OnlineUser = {
  boardId: number | null;
  href: string;
  location: string;
  loginType: string;
  recentActiveAt: string;
  username: string;
};

export type CheckinRecord = {
  href: string;
  rank: number;
  username: string;
};

export type CheckinRankingRecord = CheckinRecord & {
  totalCheckins: number;
};

export type PunishmentRecord = {
  addition: boolean;
  distance: string;
  endDate: string;
  href: string;
  id: string;
  isComplete: boolean;
  name: string;
  reason: string;
  startDate: string;
  username: string;
};

export type DataDisplayResult = {
  checkinRankingRecords: CheckinRankingRecord[];
  checkinRecords: CheckinRecord[];
  onlineUsers: OnlineUser[];
  punishmentRecords: PunishmentRecord[];
};

export class DataDisplayApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataDisplayApiError';
  }
}

export async function fetchDataDisplayPanel(
  panel: DataDisplayPanel,
  signal?: AbortSignal,
): Promise<DataDisplayResult> {
  const result: DataDisplayResult = {
    checkinRankingRecords: [],
    checkinRecords: [],
    onlineUsers: [],
    punishmentRecords: [],
  };

  if (panel === 'online') {
    const rows = await requestRows({ ask: 'online' }, signal);
    result.onlineUsers = rows.map(mapOnlineUser).filter((row): row is OnlineUser => row !== null);
  } else if (panel === 'checkins') {
    const rows = await requestRows({ ask: 'sign_today' }, signal);
    result.checkinRecords = mapCheckinRecords(rows);
  } else if (panel === 'checkin-ranking') {
    const rows = await requestRows({ ask: 'sign_user' }, signal);
    result.checkinRankingRecords = rows
      .map(mapCheckinRankingRecord)
      .filter((row): row is CheckinRankingRecord => row !== null);
  } else {
    result.punishmentRecords = await requestPunishmentRecords(signal);
  }

  return result;
}

async function requestRows(params: Record<string, string>, signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(DATA_API_URL, {
      body: new URLSearchParams(params),
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new DataDisplayApiError('暂时无法连接数据服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new DataDisplayApiError('数据服务返回了无法识别的内容。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new DataDisplayApiError(payload.message?.trim() || '数据加载失败，请稍后重试。');
  }

  return asRows(payload.data);
}

async function requestPunishmentRecords(signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetch('/api/bbs/punishment/get/', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new DataDisplayApiError('暂时无法连接罚跑记录服务，请稍后重试。');
  }

  let payload: { result?: unknown };
  try {
    payload = await response.json() as { result?: unknown };
  } catch {
    throw new DataDisplayApiError('罚跑记录服务返回了无法识别的内容。');
  }

  if (!response.ok) throw new DataDisplayApiError('罚跑记录加载失败，请稍后重试。');

  return asRows(payload.result)
    .map(mapPunishmentRecord)
    .filter((row): row is PunishmentRecord => row !== null)
    .sort((left, right) => compareDates(right.startDate, left.startDate));
}

function mapOnlineUser(row: ApiRow): OnlineUser | null {
  const username = stringValue(row.username);
  if (!username) return null;

  const boardId = positiveInteger(row.nowboard);
  return {
    boardId,
    href: getPublicProfilePath(username),
    location: boardId ? getBoardById(boardId)?.label ?? `版面 ${boardId}` : '论坛在线',
    loginType: formatLoginType(row.onlinetype),
    recentActiveAt: formatOnlineTime(row.tokentime),
    username,
  };
}

function mapCheckinRecords(rows: ApiRow[]) {
  const usernames = new Set<string>();
  const records: CheckinRecord[] = [];

  rows.forEach((row) => {
    const username = stringValue(row.username);
    const key = username.toLocaleLowerCase();
    if (!username || usernames.has(key)) return;

    usernames.add(key);
    records.push({
      href: getPublicProfilePath(username),
      rank: records.length + 1,
      username,
    });
  });

  return records;
}

function mapCheckinRankingRecord(row: ApiRow, index: number): CheckinRankingRecord | null {
  const username = stringValue(row.username);
  if (!username) return null;

  return {
    href: getPublicProfilePath(username),
    rank: positiveInteger(row.number) ?? index + 1,
    totalCheckins: nonNegativeInteger(row.times),
    username,
  };
}

function mapPunishmentRecord(row: ApiRow): PunishmentRecord | null {
  const id = stringValue(row.id);
  const username = stringValue(row.username);
  if (!id && !username) return null;

  return {
    addition: stringValue(row.addition) === '1',
    distance: stringValue(row.distance),
    endDate: stringValue(row.end_date),
    href: getPublicProfilePath(username),
    id: id || username,
    isComplete: stringValue(row.is_end) === '1',
    name: stringValue(row.name),
    reason: stringValue(row.reason),
    startDate: stringValue(row.start_date),
    username,
  };
}

function asRows(value: unknown): ApiRow[] {
  if (Array.isArray(value)) return value.filter(isRow);
  return isRow(value) ? [value] : [];
}

function isRow(value: unknown): value is ApiRow {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function positiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function nonNegativeInteger(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function formatLoginType(value: unknown) {
  const type = stringValue(value).toLocaleLowerCase();
  if (type === 'web') return '网页版';
  if (type === 'android') return 'Android 客户端';
  if (type === 'ios') return 'iOS 客户端';
  return type || '未知';
}

function formatOnlineTime(value: unknown) {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '—';

  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp * 1000));
}

function compareDates(left: string, right: string) {
  const difference = Date.parse(left) - Date.parse(right);
  return Number.isFinite(difference) ? difference : 0;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
