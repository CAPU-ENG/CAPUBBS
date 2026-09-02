import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  fetchSessionViewer,
  loginSession,
  logoutSession,
  registerSession,
  type RegisterDraft,
  type SessionViewer,
} from '../api/auth';
import { fetchMessageSummary } from '../api/messages';

type AuthStatus = 'authenticated' | 'guest' | 'loading' | 'restoring';
const SESSION_VIEWER_STORAGE_KEY = 'capubbs-session-viewer';
const SESSION_VIEWER_REFRESHED_AT_STORAGE_KEY = 'capubbs-session-viewer-refreshed-at';
const SESSION_VIEWER_REFRESH_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_VIEWER_RETRY_INTERVAL_MS = 5 * 60 * 1000;
const UNREAD_MESSAGE_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

type AuthState = {
  refreshAt: number;
  status: AuthStatus;
  viewer: SessionViewer | null;
};

type AuthContextValue = {
  login: (username: string, passwordHash: string) => Promise<SessionViewer>;
  logout: () => Promise<void>;
  refreshUnreadMessages: () => Promise<void>;
  refreshViewer: () => void;
  register: (draft: RegisterDraft) => Promise<SessionViewer>;
  status: AuthStatus;
  updateViewerAvatar: (avatar: string) => void;
  updateViewerUnreadMessages: (count: number) => void;
  viewer: SessionViewer | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(restoreCachedAuth);
  const unreadRequestRef = useRef<{ promise: Promise<void>; username: string } | null>(null);
  const activeUsername = auth.status === 'authenticated' ? auth.viewer?.username ?? null : null;

  const refreshUnreadMessagesFor = useCallback((username: string) => {
    const activeRequest = unreadRequestRef.current;
    if (activeRequest?.username === username) return activeRequest.promise;

    const promise = fetchMessageSummary()
      .then((summary) => {
        setAuth((current) => {
          if (current.status !== 'authenticated' || current.viewer?.username !== username) return current;
          const unreadMessages = summary.unread.total;
          if (current.viewer.unreadMessages === unreadMessages) return current;
          const viewer = { ...current.viewer, unreadMessages };
          cacheViewer(viewer);
          return { ...current, viewer };
        });
      })
      .catch(() => {
        // Keep the last known count when the background refresh is unavailable.
      })
      .finally(() => {
        if (unreadRequestRef.current?.promise === promise) unreadRequestRef.current = null;
      });

    unreadRequestRef.current = { promise, username };
    return promise;
  }, []);

  const refreshUnreadMessages = useCallback(() => {
    if (!activeUsername) return Promise.resolve();
    return refreshUnreadMessagesFor(activeUsername);
  }, [activeUsername, refreshUnreadMessagesFor]);

  useEffect(() => {
    if (!activeUsername) return;
    const interval = window.setInterval(() => {
      void refreshUnreadMessagesFor(activeUsername);
    }, UNREAD_MESSAGE_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [activeUsername, refreshUnreadMessagesFor]);

  useEffect(() => {
    if (auth.status === 'guest') return;

    let controller: AbortController | null = null;
    const timeout = window.setTimeout(() => {
      controller = new AbortController();
      void fetchSessionViewer(controller.signal).then(
        (sessionViewer) => {
          if (sessionViewer) {
            const refreshedAt = Date.now();
            cacheViewer(sessionViewer);
            cacheViewerRefreshedAt(refreshedAt);
            setAuth({
              refreshAt: refreshedAt + SESSION_VIEWER_REFRESH_INTERVAL_MS,
              status: 'authenticated',
              viewer: sessionViewer,
            });
          } else {
            clearCachedViewer();
            setAuth({ refreshAt: 0, status: 'guest', viewer: null });
          }
        },
        (error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          if (auth.viewer) {
            setAuth((current) => current.viewer ? {
              ...current,
              refreshAt: Date.now() + SESSION_VIEWER_RETRY_INTERVAL_MS,
              status: 'authenticated',
            } : current);
            return;
          }
          clearCachedViewer();
          setAuth({ refreshAt: 0, status: 'guest', viewer: null });
        },
      );
    }, Math.max(0, auth.refreshAt - Date.now()));

    return () => {
      window.clearTimeout(timeout);
      controller?.abort();
    };
  }, [auth.refreshAt, auth.status, auth.viewer]);

  const login = useCallback(async (username: string, passwordHash: string) => {
    const sessionViewer = await loginSession(username, passwordHash);
    const refreshedAt = Date.now();
    cacheViewer(sessionViewer);
    cacheViewerRefreshedAt(refreshedAt);
    setAuth({
      refreshAt: refreshedAt + SESSION_VIEWER_REFRESH_INTERVAL_MS,
      status: 'authenticated',
      viewer: sessionViewer,
    });
    void refreshUnreadMessagesFor(sessionViewer.username);
    return sessionViewer;
  }, [refreshUnreadMessagesFor]);

  const logout = useCallback(async () => {
    try {
      await logoutSession();
    } finally {
      clearCachedViewer();
      setAuth({ refreshAt: 0, status: 'guest', viewer: null });
    }
  }, []);

  const refreshViewer = useCallback(() => {
    setAuth((current) => current.viewer ? { ...current, refreshAt: Date.now() } : current);
  }, []);

  const register = useCallback(async (draft: RegisterDraft) => {
    const sessionViewer = await registerSession(draft);
    const refreshedAt = Date.now();
    cacheViewer(sessionViewer);
    cacheViewerRefreshedAt(refreshedAt);
    setAuth({
      refreshAt: refreshedAt + SESSION_VIEWER_REFRESH_INTERVAL_MS,
      status: 'authenticated',
      viewer: sessionViewer,
    });
    void refreshUnreadMessagesFor(sessionViewer.username);
    return sessionViewer;
  }, [refreshUnreadMessagesFor]);

  const updateViewerAvatar = useCallback((avatar: string) => {
    setAuth((current) => {
      if (!current.viewer) return current;
      const viewer = { ...current.viewer, avatar };
      cacheViewer(viewer);
      return { ...current, viewer };
    });
  }, []);

  const updateViewerUnreadMessages = useCallback((count: number) => {
    setAuth((current) => {
      if (!current.viewer) return current;
      const viewer = { ...current.viewer, unreadMessages: Math.max(0, Math.floor(count)) };
      cacheViewer(viewer);
      return { ...current, viewer };
    });
  }, []);

  const value = useMemo(
    () => ({
      login,
      logout,
      refreshUnreadMessages,
      refreshViewer,
      register,
      status: auth.status,
      updateViewerAvatar,
      updateViewerUnreadMessages,
      viewer: auth.viewer,
    }),
    [auth.status, auth.viewer, login, logout, refreshUnreadMessages, refreshViewer, register, updateViewerAvatar, updateViewerUnreadMessages],
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
    return { refreshAt: 0, status: 'guest', viewer: null };
  }

  try {
    const value = window.localStorage.getItem(SESSION_VIEWER_STORAGE_KEY);
    if (!value) return { refreshAt: 0, status: 'loading', viewer: null };
    const viewer = JSON.parse(value) as Partial<SessionViewer>;
    if (
      typeof viewer.username !== 'string'
      || typeof viewer.avatar !== 'string'
      || typeof viewer.rights !== 'number'
      || typeof viewer.stars !== 'number'
      || typeof viewer.unreadMessages !== 'number'
    ) {
      clearCachedViewer();
      return { refreshAt: 0, status: 'loading', viewer: null };
    }
    const refreshedAt = readCachedViewerRefreshedAt();
    const refreshAt = refreshedAt + SESSION_VIEWER_REFRESH_INTERVAL_MS;
    return {
      refreshAt,
      status: refreshAt > Date.now() ? 'authenticated' : 'restoring',
      viewer: viewer as SessionViewer,
    };
  } catch {
    clearCachedViewer();
    return { refreshAt: 0, status: 'loading', viewer: null };
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
    window.localStorage.removeItem(SESSION_VIEWER_REFRESHED_AT_STORAGE_KEY);
  } catch {
    // Ignore storage restrictions; logout still clears the authentication cookie.
  }
}

function cacheViewerRefreshedAt(refreshedAt: number) {
  try {
    window.localStorage.setItem(SESSION_VIEWER_REFRESHED_AT_STORAGE_KEY, String(refreshedAt));
  } catch {
    // The in-memory refresh schedule still applies when storage is unavailable.
  }
}

function readCachedViewerRefreshedAt() {
  const value = Number(window.localStorage.getItem(SESSION_VIEWER_REFRESHED_AT_STORAGE_KEY));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function hasTokenCookie() {
  return document.cookie.split(';').some((cookie) => {
    const [name, value = ''] = cookie.trim().split('=', 2);
    return name === 'token' && Boolean(value) && value !== 'invalid';
  });
}
