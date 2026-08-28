export const DEFAULT_SIGNATURE_STORAGE_KEY_PREFIX = 'capubbs-default-signature:v1:';

export function readDefaultSignatureIndex(ownerKey: string | null | undefined) {
  const storageKey = getStorageKey(ownerKey);
  if (!storageKey || typeof window === 'undefined') return 0;

  try {
    return normalizeSignatureIndex(window.localStorage.getItem(storageKey));
  } catch {
    return 0;
  }
}

export function saveDefaultSignatureIndex(
  signatureIndex: number,
  ownerKey: string | null | undefined,
) {
  const storageKey = getStorageKey(ownerKey);
  if (!storageKey || typeof window === 'undefined' || !isSignatureIndex(signatureIndex)) return false;

  try {
    window.localStorage.setItem(storageKey, String(signatureIndex));
    return true;
  } catch {
    return false;
  }
}

export function normalizeSignatureIndex(value: unknown) {
  const signatureIndex = typeof value === 'number' ? value : Number(value);
  return isSignatureIndex(signatureIndex) ? signatureIndex : 0;
}

function getStorageKey(ownerKey: string | null | undefined) {
  const normalizedOwnerKey = ownerKey?.trim();
  return normalizedOwnerKey
    ? `${DEFAULT_SIGNATURE_STORAGE_KEY_PREFIX}${encodeURIComponent(normalizedOwnerKey)}`
    : null;
}

function isSignatureIndex(value: number) {
  return Number.isSafeInteger(value) && value >= 0 && value <= 3;
}
