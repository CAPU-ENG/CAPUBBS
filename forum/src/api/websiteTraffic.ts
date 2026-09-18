import { parseWebsiteTraffic, type TrafficPeriod, type WebsiteTraffic } from '../utils/websiteTraffic';

const TRAFFIC_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

export async function fetchWebsiteTraffic(period: TrafficPeriod, signal?: AbortSignal): Promise<WebsiteTraffic> {
  let response: Response;
  try {
    response = await fetch(TRAFFIC_API_URL, {
      method: 'POST',
      body: new URLSearchParams({ ask: 'website_traffic', period }),
      cache: 'no-store',
      credentials: 'include',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('暂时无法连接论坛服务，请稍后重试。');
  }
  let payload: { code?: number; message?: string; data?: unknown } | null;
  try {
    payload = await response.json();
  } catch {
    throw new Error('论坛服务返回了无法识别的数据。');
  }
  if (!response.ok || payload?.code !== 0) {
    throw new Error(typeof payload?.message === 'string' ? payload.message : '网站流量读取失败，请稍后重试。');
  }
  return parseWebsiteTraffic(payload.data, period);
}
