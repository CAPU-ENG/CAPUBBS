import { HomePage } from './pages/HomePage';
import { ThreadPage } from './pages/ThreadPage';

export function App() {
  const threadId = new URLSearchParams(window.location.search).get('thread');
  return threadId === '102' ? <ThreadPage /> : <HomePage />;
}
