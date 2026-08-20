import { useEffect, useReducer } from 'react';
import { AuthProvider } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { BoardPage } from './pages/BoardPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { ThreadPage } from './pages/ThreadPage';
import { UserCenterPage } from './pages/UserCenterPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { ThreadEditPage } from './pages/ThreadEditPage';
import { FORUM_LOCATION_CHANGE_EVENT } from './utils/authRoutes';
import { translateLegacyForumThreadHref } from './utils/legacyForumRoutes';
import { getPublicProfileNameFromLocation, USER_CENTER_PATH } from './utils/userRoutes';

export function App() {
  return (
    <AuthProvider>
      <ForumRouter />
    </AuthProvider>
  );
}

function ForumRouter() {
  const [, refreshLocation] = useReducer((revision: number) => revision + 1, 0);

  useEffect(() => {
    const refresh = () => refreshLocation();
    const navigateInsideForum = (event: MouseEvent) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
      ) return;

      const target = event.target instanceof Element ? event.target.closest('a') : null;
      if (!(target instanceof HTMLAnchorElement) || target.download) return;

      const href = target.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const legacyThreadHref = translateLegacyForumThreadHref(href, window.location.href);
      if (target.target && target.target !== '_self' && !legacyThreadHref) return;

      const url = new URL(legacyThreadHref ?? href, window.location.href);
      if (url.origin !== window.location.origin || !isForumAppPath(url.pathname)) return;
      if (
        url.pathname === window.location.pathname
        && url.search === window.location.search
        && url.hash !== window.location.hash
      ) {
        const floor = url.hash.match(/^#(?:floor-)?(\d+)$/)?.[1];
        if (!floor) return;

        event.preventDefault();
        window.history.pushState(null, '', `${url.pathname}${url.search}#${floor}`);
        document.getElementById(`floor-${floor}`)?.scrollIntoView({ block: 'start' });
        return;
      }

      event.preventDefault();
      window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
      refresh();
      if (!url.hash) window.scrollTo({ left: 0, top: 0 });
    };

    window.addEventListener('popstate', refresh);
    window.addEventListener(FORUM_LOCATION_CHANGE_EVENT, refresh);
    document.addEventListener('click', navigateInsideForum);
    return () => {
      window.removeEventListener('popstate', refresh);
      window.removeEventListener(FORUM_LOCATION_CHANGE_EVENT, refresh);
      document.removeEventListener('click', navigateInsideForum);
    };
  }, []);

  const pathname = normalizePathname(window.location.pathname);
  const params = new URLSearchParams(window.location.search);
  if (pathname === '/login') return <LoginPage />;
  if (pathname === '/register') return <RegisterPage />;
  if (pathname === '/search') return <SearchPage />;
  if (pathname === '/settings') return <SettingsPage />;
  if (isThreadEditPath(pathname)) return <ThreadEditPage />;
  if (pathname === USER_CENTER_PATH) return <UserCenterPage />;
  if (pathname === '/users' || pathname.startsWith('/users/')) {
    return <PublicProfilePage profileName={getPublicProfileNameFromLocation(pathname, window.location.search)} />;
  }
  const threadId = Number(params.get('tid') ?? params.get('thread'));
  if (Number.isFinite(threadId) && threadId > 0) return <ThreadPage />;
  const boardId = Number(params.get('bid') ?? params.get('board'));
  if (Number.isInteger(boardId) && boardId > 0) return <BoardPage boardId={boardId} />;
  return <HomePage />;
}

function isForumAppPath(pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  return normalizedPath === '/'
    || normalizedPath === '/login'
    || normalizedPath === '/register'
    || normalizedPath === '/search'
    || normalizedPath === '/settings'
    || isThreadEditPath(normalizedPath)
    || normalizedPath === USER_CENTER_PATH
    || normalizedPath === '/users'
    || normalizedPath.startsWith('/users/');
}

function isThreadEditPath(pathname: string) {
  return pathname === '/editpid'
    || pathname === '/bbs/editpid'
    || pathname === '/bbs/editpid/index.php';
}

function normalizePathname(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}
