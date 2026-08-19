import { useCallback, useEffect, useState } from 'react';
import {
  fetchPublicProfile,
  fetchUserCenterProfile,
  isProfileAbortError,
  type LoadedPublicProfile,
} from '../api/profile';
import type { ProfileViewData } from '../data/profileDemo';

type ProfileLoadState<T> = {
  data: T | null;
  error: string;
  status: 'error' | 'loading' | 'ready';
};

const initialUserCenterState: ProfileLoadState<ProfileViewData> = {
  data: null,
  error: '',
  status: 'loading',
};

const initialPublicProfileState: ProfileLoadState<LoadedPublicProfile> = {
  data: null,
  error: '',
  status: 'loading',
};

export function useUserCenterProfile() {
  const [state, setState] = useState(initialUserCenterState);
  const [requestVersion, setRequestVersion] = useState(0);
  const reload = useCallback(() => setRequestVersion((version) => version + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, error: '', status: 'loading' }));
    void fetchUserCenterProfile(controller.signal).then(
      (data) => setState({ data, error: '', status: 'ready' }),
      (error: unknown) => {
        if (!isProfileAbortError(error)) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : '个人资料加载失败，请稍后重试。',
            status: 'error',
          });
        }
      },
    );
    return () => controller.abort();
  }, [requestVersion]);

  const replace = useCallback((data: ProfileViewData) => {
    setState({ data, error: '', status: 'ready' });
  }, []);

  return { ...state, reload, replace };
}

export function usePublicProfile(profileName: string | null) {
  const [state, setState] = useState(initialPublicProfileState);
  const [requestVersion, setRequestVersion] = useState(0);
  const reload = useCallback(() => setRequestVersion((version) => version + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    if (!profileName?.trim()) {
      setState({ data: null, error: '用户不存在。', status: 'error' });
      return () => controller.abort();
    }

    setState((current) => ({ ...current, error: '', status: 'loading' }));
    void fetchPublicProfile(profileName, controller.signal).then(
      (data) => setState({ data, error: '', status: 'ready' }),
      (error: unknown) => {
        if (!isProfileAbortError(error)) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : '个人主页加载失败，请稍后重试。',
            status: 'error',
          });
        }
      },
    );
    return () => controller.abort();
  }, [profileName, requestVersion]);

  return { ...state, reload };
}
