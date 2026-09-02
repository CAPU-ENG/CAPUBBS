import { useCallback, useEffect, useRef, useState } from 'react';
import type { ThreadDetail } from '../api/thread';
import { openThreadContent } from '../utils/threadContentLoader';
import type { ThreadCacheScope } from '../utils/threadContentCache';

export type ThreadDataStatus = 'error' | 'loading' | 'ready';

export function useThreadData({
  authorOnly,
  bid,
  cacheScope,
  decoration,
  page,
  tagMedalDisplay = true,
  tid,
}: {
  authorOnly: boolean;
  bid: number;
  cacheScope: ThreadCacheScope | null;
  decoration: boolean;
  page: number;
  tagMedalDisplay?: boolean;
  tid: number;
}) {
  const [data, setData] = useState<ThreadDetail | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<ThreadDataStatus>('loading');
  const [requestVersion, setRequestVersion] = useState(0);
  const handledRequestVersionRef = useRef(0);
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
    if (!cacheScope) return () => { active = false; };

    const force = requestVersion > handledRequestVersionRef.current;
    handledRequestVersionRef.current = requestVersion;
    void openThreadContent({
      force,
      onCached: (detail) => {
        if (!active) return;
        setData(detail);
        setStatus('ready');
      },
      request: { authorOnly, bid, decoration, page, tagMedalDisplay, tid },
      scope: cacheScope,
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

    return () => { active = false; };
  }, [authorOnly, bid, cacheScope, decoration, page, requestVersion, tagMedalDisplay, tid]);

  return { data, error, retry, status };
}
