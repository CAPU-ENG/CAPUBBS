import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { preloadMedalTextures } from './components/management/medalDesign';
import { applyForumContentFontSize, readForumContentFontSize } from './utils/forumFontSize';
import { applyTheme, readThemeSnapshot } from './utils/theme';
import './styles/index.css';

applyTheme(readThemeSnapshot().theme);
applyForumContentFontSize(readForumContentFontSize());
preloadMedalTextures();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
