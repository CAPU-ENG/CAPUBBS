export type SignatureFloorReference = {
  bid: number;
  pid: number;
  tid: number;
};

export type SignatureFloorMarker = SignatureFloorReference & {
  marker: string;
};

const signatureFloorMarkerPattern = /\[post(?:\s|&nbsp;|&#160;|\u00a0)+(.*?)\]/gi;
const legacyThreadPageSize = 12;

export function parseSignatureFloorLink(value: string): SignatureFloorReference | null {
  const input = value.trim();
  const markerMatch = findSignatureFloorMarkers(input)[0];

  if (markerMatch) {
    return markerMatch;
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
  return `/?bid=${reference.bid}&tid=${reference.tid}&p=${page}#floor-${reference.pid}`;
}

export function findSignatureFloorMarkers(value: string): SignatureFloorMarker[] {
  const markers: SignatureFloorMarker[] = [];

  for (const match of value.matchAll(signatureFloorMarkerPattern)) {
    const attributes = match[1]
      .replace(/(?:&nbsp;|&#160;|\u00a0)/gi, ' ');
    const matches = Array.from(attributes.matchAll(/\b(bid|tid|pid)=(\d+)\b/gi));
    if (matches.length !== 3) continue;

    const values = new Map<string, string>();
    matches.forEach((attribute) => values.set(attribute[1].toLowerCase(), attribute[2]));
    if (values.size !== 3) continue;

    const reference = createReference(values.get('bid'), values.get('tid'), values.get('pid'));
    if (reference) markers.push({ ...reference, marker: match[0] });
  }

  return markers;
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
