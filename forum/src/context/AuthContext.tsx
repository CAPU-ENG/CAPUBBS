import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  fetchSessionViewer,
  loginSession,
  logoutSession,
  registerSession,
  type RegisterDraft,
  type SessionViewer,
} from '../api/auth';

type AuthStatus = 'authenticated' | 'guest' | 'loading' | 'restoring';
const SESSION_VIEWER_STORAGE_KEY = 'capubbs-session-viewer';

type AuthState = {
  status: AuthStatus;
  viewer: SessionViewer | null;
};

type AuthContextValue = {
  login: (username: string, passwordHash: string) => Promise<SessionViewer>;
  logout: () => Promise<void>;
  register: (draft: RegisterDraft) => Promise<SessionViewer>;
  status: AuthStatus;
  updateViewerAvatar: (avatar: string) => void;
  viewer: SessionViewer | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(restoreCachedAuth);

  useEffect(() => {
    const controller = new AbortController();

    void fetchSessionViewer(controller.signal).then(
      (sessionViewer) => {
        if (sessionViewer) {
          cacheViewer(sessionViewer);
          setAuth({ status: 'authenticated', viewer: sessionViewer });
        } else {
          clearCachedViewer();
          setAuth({ status: 'guest', viewer: null });
        }
      },
      (error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        clearCachedViewer();
        setAuth({ status: 'guest', viewer: null });
      },
    );

    return () => controller.abort();
  }, []);

  const login = useCallback(async (username: string, passwordHash: string) => {
    const sessionViewer = await loginSession(username, passwordHash);
    cacheViewer(sessionViewer);
    setAuth({ status: 'authenticated', viewer: sessionViewer });
    return sessionViewer;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutSession();
    } finally {
      clearCachedViewer();
      setAuth({ status: 'guest', viewer: null });
    }
  }, []);

  const register = useCallback(async (draft: RegisterDraft) => {
    const sessionViewer = await registerSession(draft);
    cacheViewer(sessionViewer);
    setAuth({ status: 'authenticated', viewer: sessionViewer });
    return sessionViewer;
  }, []);

  const updateViewerAvatar = useCallback((avatar: string) => {
    setAuth((current) => {
      if (!current.viewer) return current;
      const viewer = { ...current.viewer, avatar };
      cacheViewer(viewer);
      return { ...current, viewer };
    });
  }, []);

  const value = useMemo(
    () => ({
      login,
      logout,
      register,
      status: auth.status,
      updateViewerAvatar,
      viewer: auth.viewer,
    }),
    [auth.status, auth.viewer, login, logout, register, updateViewerAvatar],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

function restoreCachedAuth(): AuthState {
  if (!hasTokenCookie()) {
    clearCachedViewer();
    return { status: 'loading', viewer: null };
  }

  try {
    const value = window.localStorage.getItem(SESSION_VIEWER_STORAGE_KEY);
    if (!value) return { status: 'loading', viewer: null };
    const viewer = JSON.parse(value) as Partial<SessionViewer>;
    if (
      typeof viewer.username !== 'string'
      || typeof viewer.avatar !== 'string'
      || typeof viewer.rights !== 'number'
      || typeof viewer.unreadMessages !== 'number'
    ) {
      clearCachedViewer();
      return { status: 'loading', viewer: null };
    }
    return { status: 'restoring', viewer: viewer as SessionViewer };
  } catch {
    clearCachedViewer();
    return { status: 'loading', viewer: null };
  }
}

function cacheViewer(viewer: SessionViewer) {
  try {
    window.localStorage.setItem(SESSION_VIEWER_STORAGE_KEY, JSON.stringify(viewer));
  } catch {
    // Cookie verification remains the source of truth when storage is unavailable.
  }
}

function clearCachedViewer() {
  try {
    window.localStorage.removeItem(SESSION_VIEWER_STORAGE_KEY);
  } catch {
    // Ignore storage restrictions; logout still clears the authentication cookie.
  }
}

function hasTokenCookie() {
  return document.cookie.split(';').some((cookie) => {
    const [name, value = ''] = cookie.trim().split('=', 2);
    return name === 'token' && Boolean(value) && value !== 'invalid';
  });
}
