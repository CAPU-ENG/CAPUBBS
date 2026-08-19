import { HomePage } from './pages/HomePage';
import { BoardPage } from './pages/BoardPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { ThreadPage } from './pages/ThreadPage';
import { UserCenterPage } from './pages/UserCenterPage';
import { isDemoBoardId } from './data/boardDemo';
import { getPublicProfileNameFromLocation } from './utils/userRoutes';

export function App() {
  const pathname = normalizePathname(window.location.pathname);
  const params = new URLSearchParams(window.location.search);
  if (pathname === '/user-center') return <UserCenterPage />;
  if (pathname === '/users' || pathname.startsWith('/users/')) {
    return <PublicProfilePage profileName={getPublicProfileNameFromLocation(pathname, window.location.search)} />;
  }
  if (params.get('thread') === '102') return <ThreadPage />;
  const boardId = Number(params.get('board'));
  if (isDemoBoardId(boardId)) return <BoardPage boardId={boardId} />;
  return <HomePage />;
}

function normalizePathname(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}
