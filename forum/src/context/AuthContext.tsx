import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  fetchSessionViewer,
  loginSession,
  logoutSession,
  type SessionViewer,
} from '../api/auth';

type AuthStatus = 'authenticated' | 'guest' | 'loading';

type AuthContextValue = {
  login: (username: string, passwordHash: string) => Promise<SessionViewer>;
  logout: () => Promise<void>;
  status: AuthStatus;
  updateViewerAvatar: (avatar: string) => void;
  viewer: SessionViewer | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<SessionViewer | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const controller = new AbortController();

    void fetchSessionViewer(controller.signal).then(
      (sessionViewer) => {
        setViewer(sessionViewer);
        setStatus(sessionViewer ? 'authenticated' : 'guest');
      },
      (error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setViewer(null);
        setStatus('guest');
      },
    );

    return () => controller.abort();
  }, []);

  const login = useCallback(async (username: string, passwordHash: string) => {
    const sessionViewer = await loginSession(username, passwordHash);
    setViewer(sessionViewer);
    setStatus('authenticated');
    return sessionViewer;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutSession();
    } finally {
      setViewer(null);
      setStatus('guest');
    }
  }, []);

  const updateViewerAvatar = useCallback((avatar: string) => {
    setViewer((current) => current ? { ...current, avatar } : current);
  }, []);

  const value = useMemo(
    () => ({ login, logout, status, updateViewerAvatar, viewer }),
    [login, logout, status, updateViewerAvatar, viewer],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
