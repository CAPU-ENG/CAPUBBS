import { createRoot } from 'react-dom/client';
import { App } from './App';
import { replaceAliasedForumLocation } from './utils/forumCanonicalRoute';
import { applyForumContentFontSize, readForumContentFontSize } from './utils/forumFontSize';
import { applyTheme, readThemeSnapshot } from './utils/theme';
import './styles/index.css';

replaceAliasedForumLocation(window.location, window.history);
applyTheme(readThemeSnapshot().theme);
applyForumContentFontSize(readForumContentFontSize());

createRoot(document.getElementById('root')!).render(
  <App />,
);
