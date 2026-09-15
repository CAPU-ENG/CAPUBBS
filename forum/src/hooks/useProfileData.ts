import { useCallback, useEffect, useState } from 'react';
import {
  fetchPublicProfile,
  fetchUserCenterProfile,
  isProfileAbortError,
  type LoadedPublicProfile,
} from '../api/profile';
import type { ProfileViewData } from '../data/profile';

type ProfileLoadState<T> = {
  data: T | null;
  error: string;
  ownerKey: string | null;
  status: 'error' | 'loading' | 'ready';
};

const initialUserCenterState: ProfileLoadState<ProfileViewData> = {
  data: null,
  error: '',
  ownerKey: null,
  status: 'loading',
};

const initialPublicProfileState: ProfileLoadState<LoadedPublicProfile> = {
  data: null,
  error: '',
  ownerKey: null,
  status: 'loading',
};

export function useUserCenterProfile(username: string | null) {
  const [state, setState] = useState(initialUserCenterState);
  const [requestVersion, setRequestVersion] = useState(0);
  const reload = useCallback(() => setRequestVersion((version) => version + 1), []);

  useEffect(() => {
    if (!username) {
      setState(initialUserCenterState);
      return;
    }

    const controller = new AbortController();
    setState({ data: null, error: '', ownerKey: username, status: 'loading' });
    void fetchUserCenterProfile(controller.signal, username).then(
      (data) => {
        if (!controller.signal.aborted) setState({ data, error: '', ownerKey: username, status: 'ready' });
      },
      (error: unknown) => {
        if (!controller.signal.aborted && !isProfileAbortError(error)) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : '个人资料加载失败，请稍后重试。',
            ownerKey: username,
            status: 'error',
          });
        }
      },
    );
    return () => controller.abort();
  }, [requestVersion, username]);

  const replace = useCallback((data: ProfileViewData) => {
    setState({ data, error: '', ownerKey: username, status: 'ready' });
  }, [username]);

  return { ...(state.ownerKey === username ? state : initialUserCenterState), reload, replace };
}

export function usePublicProfile(profileName: string | null) {
  const [state, setState] = useState(initialPublicProfileState);
  const [requestVersion, setRequestVersion] = useState(0);
  const reload = useCallback(() => setRequestVersion((version) => version + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    if (!profileName?.trim()) {
      setState({ data: null, error: '用户不存在。', ownerKey: profileName, status: 'error' });
      return () => controller.abort();
    }

    setState({ data: null, error: '', ownerKey: profileName, status: 'loading' });
    void fetchPublicProfile(profileName, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ data, error: '', ownerKey: profileName, status: 'ready' });
      },
      (error: unknown) => {
        if (!controller.signal.aborted && !isProfileAbortError(error)) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : '个人主页加载失败，请稍后重试。',
            ownerKey: profileName,
            status: 'error',
          });
        }
      },
    );
    return () => controller.abort();
  }, [profileName, requestVersion]);

  return { ...(state.ownerKey === profileName ? state : initialPublicProfileState), reload };
}
