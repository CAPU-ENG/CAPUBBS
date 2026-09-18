const STORAGE_KEY = 'capubbs-website-traffic-series:v1';

export function readTrafficSeriesSelection(): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (Array.isArray(value) && value.every((id) => typeof id === 'string' && /^(total|board-\d+)$/.test(id))) {
      return [...new Set(value)];
    }
  } catch {
    // Storage can be disabled; the chart must still be usable.
  }
  return ['total'];
}

export function saveTrafficSeriesSelection(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Keep the current selection in React state if storage is unavailable.
  }
}
