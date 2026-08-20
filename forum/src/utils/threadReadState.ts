const THREAD_READ_STORAGE_PREFIX = 'capubbs-read-threads:v1:';
const THREAD_READ_CHANGE_EVENT = 'capubbs-thread-read-change';
const MAX_READ_THREAD_IDS = 500;

export function readThreadIds(username?: string | null) {
  if (typeof window === 'undefined') return new Set<string>();

  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey(username)) ?? '[]');
    return new Set(normalizeThreadIds(value));
  } catch {
    return new Set<string>();
  }
}

export function markThreadRead(threadId: string, username?: string | null) {
  if (typeof window === 'undefined' || !isThreadId(threadId)) return;

  const key = storageKey(username);
  const current = [...readThreadIds(username)];
  if (current.includes(threadId)) return;

  const next = [...current, threadId].slice(-MAX_READ_THREAD_IDS);
  try {
    window.localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(THREAD_READ_CHANGE_EVENT, { detail: key }));
  } catch {
    // Reading the thread must still work when browser storage is unavailable.
  }
}

export function subscribeThreadReadState(username: string | null | undefined, listener: () => void) {
  if (typeof window === 'undefined') return () => {};

  const key = storageKey(username);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === key) listener();
  };
  const handleLocalChange = (event: Event) => {
    if (event instanceof CustomEvent && event.detail === key) listener();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(THREAD_READ_CHANGE_EVENT, handleLocalChange);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(THREAD_READ_CHANGE_EVENT, handleLocalChange);
  };
}

function storageKey(username?: string | null) {
  const owner = username?.trim() || 'guest';
  return `${THREAD_READ_STORAGE_PREFIX}${encodeURIComponent(owner)}`;
}

function normalizeThreadIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  const threadIds: string[] = [];
  value.forEach((candidate) => {
    if (typeof candidate !== 'string' || !isThreadId(candidate) || threadIds.includes(candidate)) return;
    threadIds.push(candidate);
  });
  return threadIds.slice(-MAX_READ_THREAD_IDS);
}

function isThreadId(value: string) {
  return /^\d+-\d+$/.test(value);
}
