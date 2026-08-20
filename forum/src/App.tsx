import { lazy, Suspense, useEffect, useReducer } from 'react';
import { AuthProvider } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { FORUM_LOCATION_CHANGE_EVENT } from './utils/authRoutes';
import { translateLegacyForumThreadHref } from './utils/legacyForumRoutes';
import { getThreadFloorElement, getThreadFloorFromHash } from './utils/threadRoutes';
import { getPublicProfileNameFromLocation, USER_CENTER_PATH } from './utils/userRoutes';

const ActivityManagementPage = lazy(() => import('./pages/ActivityManagementPage')
  .then((module) => ({ default: module.ActivityManagementPage })));
const BoardPage = lazy(() => import('./pages/BoardPage')
  .then((module) => ({ default: module.BoardPage })));
const CalendarAdminPage = lazy(() => import('./pages/CalendarAdminPage')
  .then((module) => ({ default: module.CalendarAdminPage })));
const DataDisplayPage = lazy(() => import('./pages/DataDisplayPage')
  .then((module) => ({ default: module.DataDisplayPage })));
const LoginPage = lazy(() => import('./pages/LoginPage')
  .then((module) => ({ default: module.LoginPage })));
const ManagementPage = lazy(() => import('./pages/ManagementPage')
  .then((module) => ({ default: module.ManagementPage })));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage')
  .then((module) => ({ default: module.PublicProfilePage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage')
  .then((module) => ({ default: module.RegisterPage })));
const SearchPage = lazy(() => import('./pages/SearchPage')
  .then((module) => ({ default: module.SearchPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage')
  .then((module) => ({ default: module.SettingsPage })));
const ThreadComposePage = lazy(() => import('./pages/ThreadComposePage')
  .then((module) => ({ default: module.ThreadComposePage })));
const ThreadEditPage = lazy(() => import('./pages/ThreadEditPage')
  .then((module) => ({ default: module.ThreadEditPage })));
const ThreadPage = lazy(() => import('./pages/ThreadPage')
  .then((module) => ({ default: module.ThreadPage })));
const UserCenterPage = lazy(() => import('./pages/UserCenterPage')
  .then((module) => ({ default: module.UserCenterPage })));

export function App() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <ForumRouter />
      </Suspense>
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
        const floor = getThreadFloorFromHash(url.hash);
        if (!floor) return;

        event.preventDefault();
        window.history.pushState(null, '', `${url.pathname}${url.search}#${floor}`);
        getThreadFloorElement(floor)?.scrollIntoView({ block: 'start' });
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
  if (pathname === '/calendar-admin') return <CalendarAdminPage />;
  if (pathname === '/manage') return <ManagementPage />;
  if (pathname === '/data') return <DataDisplayPage />;
  if (pathname === '/activity-management') return <ActivityManagementPage />;
  if (isThreadComposePath(pathname)) return <ThreadComposePage />;
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
    || normalizedPath === '/calendar-admin'
    || normalizedPath === '/manage'
    || normalizedPath === '/data'
    || normalizedPath === '/activity-management'
    || isThreadComposePath(normalizedPath)
    || isThreadEditPath(normalizedPath)
    || normalizedPath === USER_CENTER_PATH
    || normalizedPath === '/users'
    || normalizedPath.startsWith('/users/');
}

function isThreadComposePath(pathname: string) {
  return pathname === '/post'
    || pathname === '/bbs/post'
    || pathname === '/bbs/post/index.php';
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
