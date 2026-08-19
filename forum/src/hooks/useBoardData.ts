import { useCallback, useEffect, useState } from 'react';
import {
  fetchBoardPage,
  isAbortError,
  type BoardPageData,
} from '../api/board';

export type BoardDataStatus = 'error' | 'loading' | 'ready';

type BoardDataState = {
  data: BoardPageData | null;
  error: string;
  status: BoardDataStatus;
};

const initialState: BoardDataState = {
  data: null,
  error: '',
  status: 'loading',
};

export function useBoardData(boardId: number, page: number, digestOnly: boolean) {
  const [state, setState] = useState<BoardDataState>(initialState);
  const [requestVersion, setRequestVersion] = useState(0);
  const retry = useCallback(() => setRequestVersion((version) => version + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, error: '', status: 'loading' }));

    void fetchBoardPage(boardId, page, digestOnly, controller.signal).then(
      (data) => setState({ data, error: '', status: 'ready' }),
      (error: unknown) => {
        if (isAbortError(error)) return;
        setState((current) => ({
          ...current,
          error: error instanceof Error ? error.message : '版面加载失败，请稍后重试。',
          status: 'error',
        }));
      },
    );

    return () => controller.abort();
  }, [boardId, digestOnly, page, requestVersion]);

  return { ...state, retry };
}
