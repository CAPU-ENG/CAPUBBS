import { useEffect, useReducer } from 'react';
import { HomePage } from './pages/HomePage';
import { BoardPage } from './pages/BoardPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { ThreadPage } from './pages/ThreadPage';
import { UserCenterPage } from './pages/UserCenterPage';
import { LoginPage } from './pages/LoginPage';
import { FORUM_LOCATION_CHANGE_EVENT } from './utils/authRoutes';
import { getPublicProfileNameFromLocation } from './utils/userRoutes';

export function App() {
  const [, refreshLocation] = useReducer((revision: number) => revision + 1, 0);

  useEffect(() => {
    const refresh = () => refreshLocation();
    window.addEventListener('popstate', refresh);
    window.addEventListener(FORUM_LOCATION_CHANGE_EVENT, refresh);
    return () => {
      window.removeEventListener('popstate', refresh);
      window.removeEventListener(FORUM_LOCATION_CHANGE_EVENT, refresh);
    };
  }, []);

  const pathname = normalizePathname(window.location.pathname);
  const params = new URLSearchParams(window.location.search);
  if (pathname === '/login') return <LoginPage />;
  if (pathname === '/user-center') return <UserCenterPage />;
  if (pathname === '/users' || pathname.startsWith('/users/')) {
    return <PublicProfilePage profileName={getPublicProfileNameFromLocation(pathname, window.location.search)} />;
  }
  const threadId = Number(params.get('tid') ?? params.get('thread'));
  if (Number.isFinite(threadId) && threadId > 0) return <ThreadPage />;
  const boardId = Number(params.get('bid') ?? params.get('board'));
  if (Number.isInteger(boardId) && boardId > 0) return <BoardPage boardId={boardId} />;
  return <HomePage />;
}

function normalizePathname(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}
