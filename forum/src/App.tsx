import { lazy, Suspense, useEffect, useReducer } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrowserRecommendationDialog } from './components/browser/BrowserRecommendationDialog';
import { ThreadIntentPreloader } from './components/thread/ThreadIntentPreloader';
import { AppBackground } from './components/layout/AppBackground';
import { LoadingState, RouteLoadingPage } from './components/layout/LoadingState';
import { TopBar } from './components/layout/TopBar';
import { useForumContentFontSize } from './hooks/useForumContentFontSize';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { ToolboxPage } from './pages/ToolboxPage';
import { FORUM_LOCATION_CHANGE_EVENT } from './utils/authRoutes';
import { consumeQueuedLocalDraftCleanups } from './utils/draftCleanup';
import { stripForumBasePath } from './utils/forumBasePath';
import { applyForumContentFontSize } from './utils/forumFontSize';
import {
  isBoardRoutePath,
  isHomeRoutePath,
  isThreadRoutePath,
} from './utils/forumRouteMatch';
import { resolveForumAppRoute } from './utils/forumNavigation';
import { translateLegacyForumThreadHref } from './utils/legacyForumRoutes';
import { getThreadFloorElement, getThreadFloorFromHash } from './utils/threadRoutes';
import { getPublicProfileNameFromLocation, USER_CENTER_PATH } from './utils/userRoutes';

const loadActivityManagementPage = () => import('./pages/ActivityManagementPage');
const loadArchiveRoomPage = () => import('./pages/ArchiveRoomPage');
const loadBoardPage = () => import('./pages/BoardPage');
const loadCalendarAdminPage = () => import('./pages/CalendarAdminPage');
const loadDataDisplayPage = () => import('./pages/DataDisplayPage');
const loadForgotPasswordPage = () => import('./pages/ForgotPasswordPage');
const loadLoginPage = () => import('./pages/LoginPage');
const loadManagementPage = () => import('./pages/ManagementPage');
const loadPublicProfilePage = () => import('./pages/PublicProfilePage');
const loadRegisterPage = () => import('./pages/RegisterPage');
const loadThreadComposePage = () => import('./pages/ThreadComposePage');
const loadThreadEditPage = () => import('./pages/ThreadEditPage');
const loadThreadPage = () => import('./pages/ThreadPage');
const loadUserCenterPage = () => import('./pages/UserCenterPage');

const remainingForumPageLoaders = [
  loadActivityManagementPage,
  loadArchiveRoomPage,
  loadBoardPage,
  loadCalendarAdminPage,
  loadDataDisplayPage,
  loadForgotPasswordPage,
  loadLoginPage,
  loadManagementPage,
  loadPublicProfilePage,
  loadRegisterPage,
  loadThreadComposePage,
  loadThreadEditPage,
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
const ForgotPasswordPage = lazy(() => loadForgotPasswordPage()
  .then((module) => ({ default: module.ForgotPasswordPage })));
const LoginPage = lazy(() => loadLoginPage()
  .then((module) => ({ default: module.LoginPage })));
const ManagementPage = lazy(() => loadManagementPage()
  .then((module) => ({ default: module.ManagementPage })));
const PublicProfilePage = lazy(() => loadPublicProfilePage()
  .then((module) => ({ default: module.PublicProfilePage })));
const RegisterPage = lazy(() => loadRegisterPage()
  .then((module) => ({ default: module.RegisterPage })));
const ThreadComposePage = lazy(() => loadThreadComposePage()
  .then((module) => ({ default: module.ThreadComposePage })));
const ThreadEditPage = lazy(() => loadThreadEditPage()
  .then((module) => ({ default: module.ThreadEditPage })));
const ThreadPage = lazy(() => loadThreadPage()
  .then((module) => ({ default: module.ThreadPage })));
const UserCenterPage = lazy(() => loadUserCenterPage()
  .then((module) => ({ default: module.UserCenterPage })));

export function App() {
  const forumContentFontSize = useForumContentFontSize();

  useEffect(() => {
    applyForumContentFontSize(forumContentFontSize);
  }, [forumContentFontSize]);

  return (
    <AuthProvider>
      <PendingDraftCleanup />
      <ThreadIntentPreloader />
      <BrowserRecommendationDialog />
      <Suspense fallback={<RouteLoadingPage />}>
        <ForumRouter />
      </Suspense>
    </AuthProvider>
  );
}

function PendingDraftCleanup() {
  const { status, viewer } = useAuth();
  const ownerKey = viewer?.username ?? '';

  useEffect(() => {
    if (status !== 'authenticated' || !ownerKey) return;
    void consumeQueuedLocalDraftCleanups(ownerKey);
  }, [ownerKey, status]);

  return null;
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
      if (target.dataset.forumEntryReload === 'true') return;

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

  const pathname = normalizePathname(stripForumBasePath(window.location.pathname));
  const params = new URLSearchParams(window.location.search);
  if (matchesPagePath(pathname, '/forgot-password')) return <ForgotPasswordPage />;
  if (matchesPagePath(pathname, '/login')) return <LoginPage />;
  if (matchesPagePath(pathname, '/register')) return <RegisterPage />;
  if (matchesPagePath(pathname, '/search')) return <SearchPage />;
  if (matchesPagePath(pathname, '/settings')) return <SettingsPage />;
  if (matchesPagePath(pathname, '/calendar-admin')) return <CalendarAdminPage />;
  if (matchesPagePath(pathname, '/manage')) return <ManagementPage />;
  if (matchesPagePath(pathname, '/data')) {
    return (
      <Suspense fallback={<DataDisplayRouteLoading />}>
        <DataDisplayPage />
      </Suspense>
    );
  }
  if (pathname === '/activity-management') return <ActivityManagementPage />;
  if (pathname === '/archive-room') {
    return (
      <Suspense fallback={<ArchiveRoomRouteLoading />}>
        <ArchiveRoomPage />
      </Suspense>
    );
  }
  if (pathname === '/toolbox') return <ToolboxPage />;
  if (isThreadComposePath(pathname)) return <ThreadComposePage />;
  if (isThreadEditPath(pathname)) return <ThreadEditPage />;
  if (
    matchesPagePath(pathname, USER_CENTER_PATH)
    || matchesPagePath(pathname, '/favorite')
  ) return <UserCenterPage />;
  if (matchesPagePath(pathname, '/user')) {
    return <PublicProfilePage profileName={params.get('name') ?? params.get('user') ?? params.get('view')} />;
  }
  if (pathname === '/users' || pathname.startsWith('/users/')) {
    return <PublicProfilePage profileName={getPublicProfileNameFromLocation(pathname, window.location.search)} />;
  }
  const threadId = Number(params.get('tid') ?? params.get('thread'));
  if (isThreadRoutePath(pathname) && Number.isFinite(threadId) && threadId > 0) {
    return <ThreadPage />;
  }
  const boardId = Number(params.get('bid') ?? params.get('board'));
  if (isBoardRoutePath(pathname) && Number.isInteger(boardId) && boardId > 0) {
    return <BoardPage boardId={boardId} />;
  }
  if (isHomeRoutePath(pathname)) return <HomeRoute />;
  return <NotFoundPage />;
}

function HomeRoute() {
  useEffect(() => {
    pagePreloadPromise ??= loadThreadPage()
      .then(() => undefined, () => undefined)
      .then(() => Promise.allSettled(
        remainingForumPageLoaders.map((loadPage) => loadPage()),
      ))
      .then(() => undefined);
  }, []);

  return <HomePage />;
}

function DataDisplayRouteLoading() {
  return (
    <div className="data-display-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#data-display" contextTitle="数据展示" />
      <main className="data-display-shell" id="data-display">
        <LoadingState className="data-display-state" label="正在打开数据展示" variant="panel" />
      </main>
    </div>
  );
}

function ArchiveRoomRouteLoading() {
  return (
    <div className="archive-room-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#archive-room-title" contextTitle="档案室" />
      <main className="archive-room-shell" id="archive-room-title">
        <LoadingState label="正在打开档案室" variant="panel" />
      </main>
    </div>
  );
}

function isThreadComposePath(pathname: string) {
  return pathname === '/post'
    || pathname === '/post/index.php';
}

function isThreadEditPath(pathname: string) {
  return pathname === '/editpid'
    || pathname === '/editpid/index.php';
}

function matchesPagePath(pathname: string, pagePath: string) {
  return pathname === pagePath || pathname === `${pagePath}/index.php`;
}

function normalizePathname(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}
