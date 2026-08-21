import { ALL_BOARDS } from '../data/boards';
import {
  readClientDatabaseValue,
  requestPersistentClientStorage,
  writeClientDatabaseValue,
} from './clientDatabase';

export const MAX_PINNED_BOARDS = 3;
export const DEFAULT_PINNED_BOARD_IDS = [1, 2];
export const PINNED_BOARDS_STORAGE_KEY = 'capubbs-pinned-boards:v1';
export const PINNED_BOARDS_CHANGE_EVENT = 'capubbs-pinned-boards-change';

const PINNED_BOARDS_DATABASE_KEY = 'settings:pinned-boards:v1';
const PINNED_BOARDS_BROADCAST_CHANNEL = 'capubbs-pinned-boards';
const availableBoardIds = new Set(ALL_BOARDS.map((board) => board.id));

export async function readPinnedBoardIds() {
  const legacyBoardIds = readLegacyPinnedBoardIds();

  try {
    const storedValue = await readClientDatabaseValue<unknown>(PINNED_BOARDS_DATABASE_KEY);
    if (typeof storedValue !== 'undefined') return normalizePinnedBoardIds(storedValue);

    if (typeof legacyBoardIds !== 'undefined') {
      await writeClientDatabaseValue(PINNED_BOARDS_DATABASE_KEY, legacyBoardIds);
      removeLegacyPinnedBoardIds();
      return legacyBoardIds;
    }
    return DEFAULT_PINNED_BOARD_IDS;
  } catch {
    return legacyBoardIds ?? DEFAULT_PINNED_BOARD_IDS;
  }
}

export async function savePinnedBoardIds(boardIds: number[]) {
  const normalized = normalizePinnedBoardIds(boardIds);
  void requestPersistentClientStorage();

  try {
    await writeClientDatabaseValue(PINNED_BOARDS_DATABASE_KEY, normalized);
    removeLegacyPinnedBoardIds();
  } catch {
    if (!writeLegacyPinnedBoardIds(normalized)) {
      return { boardIds: await readPinnedBoardIds(), saved: false };
    }
  }

  notifyPinnedBoardIdsChange(normalized);
  return { boardIds: normalized, saved: true };
}

export function subscribePinnedBoardIds(listener: () => void) {
  if (typeof window === 'undefined') return () => {};
  const channel = createPinnedBoardsBroadcastChannel();

  const handleStorage = (event: StorageEvent) => {
    if (event.key === PINNED_BOARDS_STORAGE_KEY) listener();
  };
  const handleChange = () => listener();
  const handleBroadcast = () => listener();

  if (channel) channel.onmessage = handleBroadcast;
  window.addEventListener(PINNED_BOARDS_CHANGE_EVENT, handleChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    channel?.close();
    window.removeEventListener(PINNED_BOARDS_CHANGE_EVENT, handleChange);
    window.removeEventListener('storage', handleStorage);
  };
}

function normalizePinnedBoardIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  const normalized: number[] = [];
  value.forEach((candidate) => {
    const boardId = Number(candidate);
    if (
      Number.isInteger(boardId)
      && availableBoardIds.has(boardId)
      && !normalized.includes(boardId)
      && normalized.length < MAX_PINNED_BOARDS
    ) {
      normalized.push(boardId);
    }
  });
  return normalized;
}

function readLegacyPinnedBoardIds() {
  if (typeof window === 'undefined') return undefined;

  try {
    const stored = window.localStorage.getItem(PINNED_BOARDS_STORAGE_KEY);
    return stored === null ? undefined : normalizePinnedBoardIds(JSON.parse(stored) as unknown);
  } catch {
    return undefined;
  }
}

function writeLegacyPinnedBoardIds(boardIds: number[]) {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(PINNED_BOARDS_STORAGE_KEY, JSON.stringify(boardIds));
    return true;
  } catch {
    return false;
  }
}

function removeLegacyPinnedBoardIds() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(PINNED_BOARDS_STORAGE_KEY);
  } catch {
    // The IndexedDB copy is already durable; stale legacy data can be ignored.
  }
}

function notifyPinnedBoardIdsChange(boardIds: number[]) {
  try {
    window.dispatchEvent(new CustomEvent(PINNED_BOARDS_CHANGE_EVENT, { detail: boardIds }));
  } catch {
    // BroadcastChannel keeps other tabs in sync when custom events are unavailable.
  }

  const channel = createPinnedBoardsBroadcastChannel();
  if (channel) {
    channel.postMessage(boardIds);
    channel.close();
  }
}

function createPinnedBoardsBroadcastChannel() {
  if (typeof BroadcastChannel === 'undefined') return null;
  try {
    return new BroadcastChannel(PINNED_BOARDS_BROADCAST_CHANNEL);
  } catch {
    return null;
  }
}
