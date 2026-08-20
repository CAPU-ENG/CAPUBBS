import { ALL_BOARDS } from '../data/boards';

export const MAX_PINNED_BOARDS = 3;
export const PINNED_BOARDS_STORAGE_KEY = 'capubbs-pinned-boards:v1';
export const PINNED_BOARDS_CHANGE_EVENT = 'capubbs-pinned-boards-change';

const availableBoardIds = new Set(ALL_BOARDS.map((board) => board.id));

export function readPinnedBoardIds() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(PINNED_BOARDS_STORAGE_KEY);
    if (!stored) return [];
    return normalizePinnedBoardIds(JSON.parse(stored));
  } catch {
    return [];
  }
}

export function savePinnedBoardIds(boardIds: number[]) {
  const normalized = normalizePinnedBoardIds(boardIds);
  if (typeof window === 'undefined') return normalized;

  try {
    window.localStorage.setItem(PINNED_BOARDS_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    return readPinnedBoardIds();
  }

  window.dispatchEvent(new CustomEvent(PINNED_BOARDS_CHANGE_EVENT, { detail: normalized }));
  return normalized;
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
