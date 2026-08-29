import { toForumHref } from './forumBasePath.ts';

export type SignatureFloorReference = {
  bid: number;
  pid: number;
  tid: number;
};

export type SignatureFloorMarker = SignatureFloorReference & {
  marker: string;
};

const signatureFloorMarkerPattern = /\[post(?:\s|&nbsp;|&#160;|\u00a0)+(.*?)\]/gi;
const legacySignatureScriptPattern = /<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi;
const legacySignatureGetPattern = /\$\s*\.\s*get\s*\(\s*(["'])(.*?)\1/gi;
const legacySignatureFindFloorPattern = /\.\s*find\s*\(\s*(["'])#floor(\d+)\1\s*\)/i;
const legacyThreadPageSize = 12;

export function replaceLegacySignatureFloorScripts(value: string) {
  return value.replace(legacySignatureScriptPattern, (script, body: string) => {
    const requests = Array.from(body.matchAll(legacySignatureGetPattern));
    const references = requests
      .map((match, index) => {
        const requestEnd = (match.index ?? 0) + match[0].length;
        const nextRequestStart = requests[index + 1]?.index ?? body.length;
        const requestBody = body.slice(requestEnd, nextRequestStart);
        const pageFloorIndex = parseNonNegativeInteger(
          requestBody.match(legacySignatureFindFloorPattern)?.[2],
        );

        return parseLegacySignatureFloorRequest(match[2] ?? '', pageFloorIndex);
      })
      .filter((reference): reference is SignatureFloorReference => reference !== null);

    if (references.length === 0) return script;

    return Array.from(new Map(references.map((reference) => [
      `${reference.bid}:${reference.tid}:${reference.pid}`,
      reference,
    ])).values()).map(buildSignatureFloorMarker).join('');
  });
}

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
  return toForumHref(`/?bid=${reference.bid}&tid=${reference.tid}&p=${page}#${reference.pid}`);
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

function parseLegacySignatureFloorRequest(
  value: string,
  preferredPageFloorIndex: number | null = null,
): SignatureFloorReference | null {
  const decoded = decodeBasicHtmlEntities(value).replace(/\\\//g, '/').trim();
  if (!decoded) return null;

  const normalizedRelativePath = decoded.replace(
    /^(?:\.\.\/)+bbs\/content(?=\/|\?|#|$)/i,
    '/bbs/content',
  );
  const normalizedUrl = /^[\w.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(normalizedRelativePath)
    ? `https://${normalizedRelativePath}`
    : normalizedRelativePath;

  try {
    const localOrigin = window.location.origin;
    const url = new URL(normalizedUrl, `${localOrigin}/bbs/content/`);
    const hostname = url.hostname.toLowerCase();
    const trustedHost = url.origin === localOrigin
      || hostname === 'chexie.net'
      || hostname.endsWith('.chexie.net');
    const pathname = url.pathname.replace(/\/{2,}/g, '/');
    const legacyFloorPath = /^\/(?:api\/)?bbs\/content(?:\/floor)?(?:\/index\.php)?\/?$/i.test(pathname);

    if (!trustedHost || !legacyFloorPath) return null;

    const page = parsePositiveInteger(url.searchParams.get('p') ?? url.searchParams.get('page')) ?? 1;
    const preferredPid = preferredPageFloorIndex === null
      ? null
      : String(((page - 1) * legacyThreadPageSize) + preferredPageFloorIndex + 1);
    return createReference(
      url.searchParams.get('bid'),
      url.searchParams.get('tid'),
      preferredPid
        ?? url.searchParams.get('pid')
        ?? url.searchParams.get('floor')
        ?? getLegacySignaturePidFromHash(url.hash, page),
    );
  } catch {
    return null;
  }
}

function getLegacySignaturePidFromHash(hash: string, page: number) {
  const target = hash.replace(/^#/, '').trim();
  const explicitPid = target.match(/^(?:pid|floor-)(\d+)\b/i)?.[1];
  if (explicitPid) return explicitPid;

  const pageFloorIndex = parseNonNegativeInteger(target.match(/^floor(\d+)\b/i)?.[1]);
  if (pageFloorIndex !== null) {
    return String(((page - 1) * legacyThreadPageSize) + pageFloorIndex + 1);
  }

  const legacyReplyFloor = parseNonNegativeInteger(target.match(/^(\d+)\b/)?.[1]);
  return legacyReplyFloor === null ? null : String(legacyReplyFloor + 1);
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

function parseNonNegativeInteger(value: string | null | undefined) {
  const number = Number.parseInt(value?.trim() ?? '', 10);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function decodeBasicHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'");
}
