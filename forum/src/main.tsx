import { createRoot } from 'react-dom/client';
import { App } from './App';
import { applyForumContentFontSize, readForumContentFontSize } from './utils/forumFontSize';
import { applyTheme, readThemeSnapshot } from './utils/theme';
import './styles/index.css';

applyTheme(readThemeSnapshot().theme);
applyForumContentFontSize(readForumContentFontSize());

createRoot(document.getElementById('root')!).render(
  <App />,
);
