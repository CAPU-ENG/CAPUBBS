import { parseYahouLineage, type YahouMutation } from '../data/yahouLineage';

const API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

export function fetchYahouLineage(signal: AbortSignal) {
  return request({ ask: 'yahou_lineage' }, signal);
}

export function saveYahouLineage(revision: number, mutation: YahouMutation) {
  const params: Record<string, string> = {
    ask: mutation.action === 'add' ? 'yahou_lineage_add' : 'yahou_lineage_status',
    revision: String(revision),
    id: mutation.id,
    status: mutation.status,
  };
  if (mutation.action === 'add') params.parent_id = mutation.parentId ?? '';
  return request(params);
}

async function request(params: Record<string, string>, signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: new URLSearchParams(params),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('暂时无法连接论坛服务，请稍后重试。');
  }
  let payload: { code: number; message?: string; data?: unknown };
  try {
    payload = await response.json();
  } catch {
    throw new Error('论坛服务返回了无法识别的数据。');
  }
  if (!payload || typeof payload !== 'object') throw new Error('论坛服务返回了无法识别的数据。');
  if (!response.ok || payload.code !== 0) throw new Error(typeof payload.message === 'string' ? payload.message : '押后谱系操作失败。');
  return parseYahouLineage(payload.data);
}
