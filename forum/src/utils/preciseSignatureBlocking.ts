import type { ThreadFloorData } from '../data/thread';

export const BLOCKED_SIGNATURES_STORAGE_KEY = 'capubbs-blocked-signatures';
const CHANGE_EVENT = 'capubbs-blocked-signatures-change';

export function getSignatureBlockKey(floor: ThreadFloorData | undefined): string | null {
  if (!floor || (!floor.signatureHtml && !floor.signature)) return null;
  const index = floor.signatureIndex;
  if (!floor.author.name || !Number.isInteger(index) || !index || index < 1 || index > 3) return null;
  return JSON.stringify([floor.author.name, index]);
}

export function readBlockedSignaturesSnapshot(): string {
  try {
    return window.localStorage.getItem(BLOCKED_SIGNATURES_STORAGE_KEY) ?? '[]';
  } catch {
    return '[]';
  }
}

export function parseBlockedSignatures(snapshot: string): ReadonlySet<string> {
  try {
    const value: unknown = JSON.parse(snapshot);
    return new Set(Array.isArray(value) ? value.filter((key): key is string => typeof key === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveSignatureBlocked(key: string, blocked: boolean): boolean {
  const keys = new Set(parseBlockedSignatures(readBlockedSignaturesSnapshot()));
  if (blocked) keys.add(key);
  else keys.delete(key);
  try {
    window.localStorage.setItem(BLOCKED_SIGNATURES_STORAGE_KEY, JSON.stringify([...keys]));
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return true;
}

export function subscribeBlockedSignatures(listener: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === null || event.key === BLOCKED_SIGNATURES_STORAGE_KEY) listener();
  }
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}
