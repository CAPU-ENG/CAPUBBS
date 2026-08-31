import { useCallback, useEffect, useState } from 'react';
import {
  fetchThreadDetail,
  isAbortError,
  type ThreadDetail,
} from '../api/thread';

export type ThreadDataStatus = 'error' | 'loading' | 'ready';

export function useThreadData({
  authorOnly,
  bid,
  decoration,
  page,
  tagMedalDisplay = true,
  tid,
}: {
  authorOnly: boolean;
  bid: number;
  decoration: boolean;
  page: number;
  tagMedalDisplay?: boolean;
  tid: number;
}) {
  const [data, setData] = useState<ThreadDetail | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<ThreadDataStatus>('loading');
  const [requestVersion, setRequestVersion] = useState(0);
  const retry = useCallback(() => setRequestVersion((version) => version + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError('');
    setStatus('loading');

    if (bid <= 0 || tid <= 0) {
      setError('帖子地址缺少有效的版块或主题编号。');
      setStatus('error');
      return () => controller.abort();
    }

    void fetchThreadDetail({
      authorOnly,
      bid,
      decoration,
      page,
      signal: controller.signal,
      tagMedalDisplay,
      tid,
    }).then(
      (detail) => {
        setData(detail);
        setStatus('ready');
      },
      (requestError: unknown) => {
        if (isAbortError(requestError)) return;
        setError(requestError instanceof Error ? requestError.message : '帖子加载失败，请稍后重试。');
        setStatus('error');
      },
    );

    return () => controller.abort();
  }, [authorOnly, bid, decoration, page, requestVersion, tagMedalDisplay, tid]);

  return { data, error, retry, status };
}
