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
import { refreshClientConfig } from '../api/clientConfig';

type AuthStatus = 'authenticated' | 'guest' | 'loading' | 'restoring';
const SESSION_VIEWER_COOKIE_KEY = 'capubbs-session-viewer';
const LEGACY_SESSION_VIEWER_STORAGE_KEY = 'capubbs-session-viewer';
const LEGACY_SESSION_VIEWER_REFRESHED_AT_STORAGE_KEY = 'capubbs-session-viewer-refreshed-at';
const SESSION_VIEWER_COOKIE_MAX_AGE_SECONDS = 999999;
const PRODUCTION_COOKIE_DOMAIN = 'chexie.net';
const UNREAD_MESSAGE_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

type AuthState = {
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
    void refreshUnreadMessagesFor(activeUsername);
    const interval = window.setInterval(() => {
      void refreshUnreadMessagesFor(activeUsername);
    }, UNREAD_MESSAGE_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [activeUsername, refreshUnreadMessagesFor]);

  useEffect(() => {
    if (auth.status !== 'loading' && auth.status !== 'restoring') return;

    const controller = new AbortController();
    void fetchSessionViewer(controller.signal).then(
      (sessionViewer) => {
        if (sessionViewer) {
          cacheViewer(sessionViewer, true);
          setAuth({ status: 'authenticated', viewer: sessionViewer });
        } else {
          clearCachedViewer();
          setAuth({ status: 'guest', viewer: null });
        }
      },
      (error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (auth.viewer) {
          setAuth({ status: 'authenticated', viewer: auth.viewer });
          return;
        }
        clearCachedViewer();
        setAuth({ status: 'guest', viewer: null });
      },
    );

    return () => controller.abort();
  }, [auth.status, auth.viewer]);

  useEffect(() => {
    const syncViewerFromCookie = () => {
      const viewer = readCachedViewer();
      setAuth((current) => {
        if (!hasTokenCookie()) {
          return current.status === 'guest' && !current.viewer
            ? current
            : { status: 'guest', viewer: null };
        }
        if (!viewer) return current.status === 'loading' ? current : { status: 'loading', viewer: null };
        if (current.status === 'authenticated' && sameViewer(current.viewer, viewer)) return current;
        return { status: 'authenticated', viewer };
      });
    };
    const syncVisibleViewer = () => {
      if (document.visibilityState === 'visible') syncViewerFromCookie();
    };

    window.addEventListener('focus', syncViewerFromCookie);
    window.addEventListener('pageshow', syncViewerFromCookie);
    document.addEventListener('visibilitychange', syncVisibleViewer);
    return () => {
      window.removeEventListener('focus', syncViewerFromCookie);
      window.removeEventListener('pageshow', syncViewerFromCookie);
      document.removeEventListener('visibilitychange', syncVisibleViewer);
    };
  }, []);

  const login = useCallback(async (username: string, passwordHash: string) => {
    const sessionViewer = await loginSession(username, passwordHash);
    cacheViewer(sessionViewer, true);
    setAuth({ status: 'authenticated', viewer: sessionViewer });
    void refreshClientConfig().catch(() => undefined);
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

  const refreshViewer = useCallback(() => {
    setAuth((current) => current.viewer ? { ...current, status: 'restoring' } : current);
  }, []);

  const register = useCallback(async (draft: RegisterDraft) => {
    const sessionViewer = await registerSession(draft);
    cacheViewer(sessionViewer, true);
    setAuth({ status: 'authenticated', viewer: sessionViewer });
    void refreshClientConfig().catch(() => undefined);
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
    return { status: 'guest', viewer: null };
  }

  const viewer = readCachedViewer();
  return viewer ? { status: 'authenticated', viewer } : { status: 'loading', viewer: null };
}

function cacheViewer(viewer: SessionViewer, replaceIdentity = false) {
  const cachedViewer = readCachedViewer();
  if (!replaceIdentity && cachedViewer && cachedViewer.username !== viewer.username) return;

  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    const domain = sharedCookieDomain();
    const attributes = `path=/; max-age=${SESSION_VIEWER_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
    document.cookie = `${SESSION_VIEWER_COOKIE_KEY}=${encodeURIComponent(JSON.stringify(viewer))}; ${attributes}${domain ? `; domain=${domain}` : ''}`;
    clearLegacyViewerStorage();
  } catch {
    // A missing cache falls back to session verification on the next page load.
  }
}

function clearCachedViewer() {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  expireViewerCookie('', secure);
  const domain = sharedCookieDomain();
  if (domain) expireViewerCookie(domain, secure);
  clearLegacyViewerStorage();
}

function readCachedViewer(): SessionViewer | null {
  try {
    const cookie = document.cookie.split(';').find((item) => item.trim().startsWith(`${SESSION_VIEWER_COOKIE_KEY}=`));
    if (!cookie) return null;
    const value = cookie.trim().slice(SESSION_VIEWER_COOKIE_KEY.length + 1);
    const viewer = JSON.parse(decodeURIComponent(value)) as Partial<SessionViewer>;
    if (
      typeof viewer.username !== 'string'
      || typeof viewer.avatar !== 'string'
      || typeof viewer.rights !== 'number'
      || typeof viewer.stars !== 'number'
      || typeof viewer.unreadMessages !== 'number'
    ) return null;
    return viewer as SessionViewer;
  } catch {
    return null;
  }
}

function clearLegacyViewerStorage() {
  try {
    window.localStorage.removeItem(LEGACY_SESSION_VIEWER_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_SESSION_VIEWER_REFRESHED_AT_STORAGE_KEY);
  } catch {
    // Ignore storage restrictions; the shared cookie remains authoritative.
  }
}

function expireViewerCookie(domain: string, secure: string) {
  document.cookie = `${SESSION_VIEWER_COOKIE_KEY}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure}${domain ? `; domain=${domain}` : ''}`;
}

function sharedCookieDomain() {
  const configuredDomain = import.meta.env.VITE_COOKIE_DOMAIN?.trim().replace(/^\./, '');
  const hostname = window.location.hostname.toLowerCase();
  const domain = configuredDomain || PRODUCTION_COOKIE_DOMAIN;
  return hostname === domain || hostname.endsWith(`.${domain}`) ? domain : '';
}

function sameViewer(left: SessionViewer | null, right: SessionViewer) {
  return Boolean(left)
    && left?.username === right.username
    && left.avatar === right.avatar
    && left.rights === right.rights
    && left.stars === right.stars
    && left.unreadMessages === right.unreadMessages;
}

function hasTokenCookie() {
  return document.cookie.split(';').some((cookie) => {
    const [name, value = ''] = cookie.trim().split('=', 2);
    return name === 'token' && Boolean(value) && value !== 'invalid';
  });
}
