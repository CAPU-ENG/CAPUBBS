import { HomePage } from './pages/HomePage';
import { BoardPage } from './pages/BoardPage';
import { ThreadPage } from './pages/ThreadPage';

export function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('thread') === '102') return <ThreadPage />;
  if (params.get('board') === '3') return <BoardPage />;
  return <HomePage />;
}
