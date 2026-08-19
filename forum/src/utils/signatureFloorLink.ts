export type SignatureFloorReference = {
  bid: number;
  pid: number;
  tid: number;
};

const signatureFloorMarkerPattern = /\[post\s+bid=(\d+)\s+tid=(\d+)\s+pid=(\d+)\]/i;
const legacyThreadPageSize = 12;

export function parseSignatureFloorLink(value: string): SignatureFloorReference | null {
  const input = value.trim();
  const markerMatch = input.match(signatureFloorMarkerPattern);

  if (markerMatch) {
    return createReference(markerMatch[1], markerMatch[2], markerMatch[3]);
  }

  if (!input) return null;

  try {
    const normalizedInput = /^[\w.-]+\.[a-z]{2,}\//i.test(input) ? `https://${input}` : input;
    const url = new URL(normalizedInput, window.location.origin);
    const newRouteMatch = url.pathname.match(/\/threads\/(\d+)-(\d+)/i);
    const bid = url.searchParams.get('bid') ?? newRouteMatch?.[1];
    const tid = url.searchParams.get('tid') ?? newRouteMatch?.[2];
    const pid = url.searchParams.get('pid')
      ?? url.searchParams.get('floor')
      ?? getFloorFromHash(url.hash);

    return createReference(bid, tid, pid);
  } catch {
    return null;
  }
}

export function buildSignatureFloorMarker(reference: SignatureFloorReference) {
  return `[post bid=${reference.bid} tid=${reference.tid} pid=${reference.pid}]`;
}

export function buildSignatureFloorHref(reference: SignatureFloorReference) {
  const page = Math.max(1, Math.ceil(reference.pid / legacyThreadPageSize));
  return `/bbs/content/?bid=${reference.bid}&tid=${reference.tid}&p=${page}#pid${reference.pid}`;
}

function getFloorFromHash(hash: string) {
  return hash.match(/#?(?:floor-|pid)?(\d+)\b/i)?.[1] ?? null;
}

function createReference(bidValue: string | null | undefined, tidValue: string | null | undefined, pidValue: string | null | undefined) {
  const bid = parsePositiveInteger(bidValue);
  const tid = parsePositiveInteger(tidValue);
  const pid = parsePositiveInteger(pidValue);

  return bid && tid && pid ? { bid, pid, tid } : null;
}

function parsePositiveInteger(value: string | null | undefined) {
  const number = Number.parseInt(value?.trim() ?? '', 10);
  return Number.isInteger(number) && number > 0 ? number : null;
}
