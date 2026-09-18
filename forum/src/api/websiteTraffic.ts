import { activityDate } from '../utils/userActivity';
import { parseWebsiteTraffic, type TrafficPeriod, type WebsiteTraffic } from '../utils/websiteTraffic';

const TRAFFIC_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';
const lastSuccessful = new Map<TrafficPeriod, WebsiteTraffic>();
const UNAVAILABLE = '网站流量数据暂不可用，请稍后重试。';

type TrafficManifest = { version: 1; generation: string; endDate: string; generatedAt: number };

export async function fetchWebsiteTraffic(period: TrafficPeriod, signal?: AbortSignal): Promise<WebsiteTraffic> {
  const root = new URL('cache/website-traffic/', new URL(TRAFFIC_API_URL, window.location.origin));
  let failure: unknown;
  // A retained generation can disappear between requests after scheduled cleanup.
  // Retry the manifest once; never fall back to a live aggregation endpoint.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const manifest = parseManifest(await requestJson(new URL('current.json', root), signal, 'no-cache'));
      const payload = asRow(await requestJson(new URL(`snapshots/${manifest.generation}/${period}.json`, root), signal, 'force-cache'));
      const meta = asRow(payload.meta);
      if (payload.code !== 0 || meta.generation !== manifest.generation) throw new Error(UNAVAILABLE);
      const data = parseWebsiteTraffic(payload.data, period);
      if (data.endDate !== manifest.endDate) throw new Error(UNAVAILABLE);
      lastSuccessful.set(period, data);
      return data;
    } catch (error) {
      if (signal?.aborted) throw error;
      failure = error;
    }
  }
  const previous = lastSuccessful.get(period);
  if (previous) return previous;
  throw failure instanceof Error ? failure : new Error(UNAVAILABLE);
}

async function requestJson(url: URL, signal: AbortSignal | undefined, cache: RequestCache): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url.href, { method: 'GET', cache, credentials: 'omit', headers: { Accept: 'application/json' }, signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('暂时无法连接论坛服务，请稍后重试。');
  }
  if (!response.ok) throw new Error(UNAVAILABLE);
  try {
    return await response.json();
  } catch {
    throw new Error(UNAVAILABLE);
  }
}

function parseManifest(value: unknown): TrafficManifest {
  const row = asRow(value);
  if (row.version !== 1 || typeof row.generation !== 'string' || !/^\d{14}-[a-f0-9]{10}$/.test(row.generation)
    || activityDate(row.endDate) === null || typeof row.generatedAt !== 'number' || !Number.isSafeInteger(row.generatedAt)) {
    throw new Error(UNAVAILABLE);
  }
  return row as TrafficManifest;
}

function asRow(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
