import { lazy, Suspense, useEffect, useReducer } from 'react';
import { AuthProvider } from './context/AuthContext';
import { BrowserRecommendationDialog } from './components/browser/BrowserRecommendationDialog';
import { HomePage } from './pages/HomePage';
import { FORUM_LOCATION_CHANGE_EVENT } from './utils/authRoutes';
import { resolveForumAppRoute } from './utils/forumNavigation';
import { translateLegacyForumThreadHref } from './utils/legacyForumRoutes';
import { getThreadFloorElement, getThreadFloorFromHash } from './utils/threadRoutes';
import { getPublicProfileNameFromLocation, USER_CENTER_PATH } from './utils/userRoutes';

const loadActivityManagementPage = () => import('./pages/ActivityManagementPage');
const loadArchiveRoomPage = () => import('./pages/ArchiveRoomPage');
const loadBoardPage = () => import('./pages/BoardPage');
const loadCalendarAdminPage = () => import('./pages/CalendarAdminPage');
const loadDataDisplayPage = () => import('./pages/DataDisplayPage');
const loadLoginPage = () => import('./pages/LoginPage');
const loadManagementPage = () => import('./pages/ManagementPage');
const loadPublicProfilePage = () => import('./pages/PublicProfilePage');
const loadRegisterPage = () => import('./pages/RegisterPage');
const loadSearchPage = () => import('./pages/SearchPage');
const loadSettingsPage = () => import('./pages/SettingsPage');
const loadThreadComposePage = () => import('./pages/ThreadComposePage');
const loadThreadEditPage = () => import('./pages/ThreadEditPage');
const loadThreadPage = () => import('./pages/ThreadPage');
const loadUserCenterPage = () => import('./pages/UserCenterPage');

const forumPageLoaders = [
  loadActivityManagementPage,
  loadArchiveRoomPage,
  loadBoardPage,
  loadCalendarAdminPage,
  loadDataDisplayPage,
  loadLoginPage,
  loadManagementPage,
  loadPublicProfilePage,
  loadRegisterPage,
  loadSearchPage,
  loadSettingsPage,
  loadThreadComposePage,
  loadThreadEditPage,
  loadThreadPage,
  loadUserCenterPage,
] as const;

let pagePreloadPromise: Promise<void> | undefined;

const ActivityManagementPage = lazy(() => loadActivityManagementPage()
  .then((module) => ({ default: module.ActivityManagementPage })));
const ArchiveRoomPage = lazy(() => loadArchiveRoomPage()
  .then((module) => ({ default: module.ArchiveRoomPage })));
const BoardPage = lazy(() => loadBoardPage()
  .then((module) => ({ default: module.BoardPage })));
const CalendarAdminPage = lazy(() => loadCalendarAdminPage()
  .then((module) => ({ default: module.CalendarAdminPage })));
const DataDisplayPage = lazy(() => loadDataDisplayPage()
  .then((module) => ({ default: module.DataDisplayPage })));
const LoginPage = lazy(() => loadLoginPage()
  .then((module) => ({ default: module.LoginPage })));
const ManagementPage = lazy(() => loadManagementPage()
  .then((module) => ({ default: module.ManagementPage })));
const PublicProfilePage = lazy(() => loadPublicProfilePage()
  .then((module) => ({ default: module.PublicProfilePage })));
const RegisterPage = lazy(() => loadRegisterPage()
  .then((module) => ({ default: module.RegisterPage })));
const SearchPage = lazy(() => loadSearchPage()
  .then((module) => ({ default: module.SearchPage })));
const SettingsPage = lazy(() => loadSettingsPage()
  .then((module) => ({ default: module.SettingsPage })));
const ThreadComposePage = lazy(() => loadThreadComposePage()
  .then((module) => ({ default: module.ThreadComposePage })));
const ThreadEditPage = lazy(() => loadThreadEditPage()
  .then((module) => ({ default: module.ThreadEditPage })));
const ThreadPage = lazy(() => loadThreadPage()
  .then((module) => ({ default: module.ThreadPage })));
const UserCenterPage = lazy(() => loadUserCenterPage()
  .then((module) => ({ default: module.UserCenterPage })));

export function App() {
  return (
    <AuthProvider>
      <BrowserRecommendationDialog />
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

      const route = resolveForumAppRoute(href, window.location.href);
      if (!route) return;
      const url = new URL(route, window.location.origin);
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
  if (pathname === '/archive-room') return <ArchiveRoomPage />;
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
  return <HomeRoute />;
}

function HomeRoute() {
  useEffect(() => {
    const preloadPages = () => {
      pagePreloadPromise ??= Promise.allSettled(
        forumPageLoaders.map((loadPage) => loadPage()),
      ).then(() => undefined);
    };

    if (document.readyState === 'complete') {
      preloadPages();
      return;
    }

    window.addEventListener('load', preloadPages, { once: true });
    return () => window.removeEventListener('load', preloadPages);
  }, []);

  return <HomePage />;
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
