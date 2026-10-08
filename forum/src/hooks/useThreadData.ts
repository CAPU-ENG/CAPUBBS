import { useCallback, useEffect, useState } from 'react';
import { fetchThreadDetail, type ThreadDetail } from '../api/thread';

export type ThreadDataStatus = 'error' | 'loading' | 'ready';

export function useThreadData({
  authorOnly,
  authReady,
  bid,
  decoration,
  page,
  tagMedalDisplay = true,
  tid,
}: {
  authorOnly: boolean;
  authReady: boolean;
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
    let active = true;
    setData(null);
    setError('');
    setStatus('loading');

    if (bid <= 0 || tid <= 0) {
      setError('帖子地址缺少有效的版块或主题编号。');
      setStatus('error');
      return () => { active = false; };
    }
    // Thread details depend on the viewer, so wait until the session is known.
    if (!authReady) return () => { active = false; };

    const controller = new AbortController();
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
        if (!active) return;
        setData(detail);
        setStatus('ready');
      },
      (requestError: unknown) => {
        if (!active) return;
        setData(null);
        setError(requestError instanceof Error ? requestError.message : '帖子加载失败，请稍后重试。');
        setStatus('error');
      },
    );

    return () => {
      active = false;
      controller.abort();
    };
  }, [authorOnly, authReady, bid, decoration, page, requestVersion, tagMedalDisplay, tid]);

  return { data, error, retry, status };
}
