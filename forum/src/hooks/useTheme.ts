import { useCallback, useEffect, useState } from 'react';
import {
  applyTheme,
  readThemeSnapshot,
  saveExplicitTheme,
  subscribeThemePreference,
} from '../utils/theme';
import { runThemeTransition } from '../utils/themeTransition';

export function useTheme() {
  const [snapshot, setSnapshot] = useState(readThemeSnapshot);

  useEffect(() => {
    const refresh = () => {
      const nextSnapshot = readThemeSnapshot();
      applyTheme(nextSnapshot.theme);
      setSnapshot(nextSnapshot);
    };

    refresh();
    return subscribeThemePreference(refresh);
  }, []);

  const toggleTheme = useCallback(() => {
    const scrollPosition = { left: window.scrollX, top: window.scrollY };
    runThemeTransition(() => {
      const currentTheme = readThemeSnapshot().theme;
      if (!saveExplicitTheme(currentTheme === 'light' ? 'dark' : 'light')) return;

      window.scrollTo(scrollPosition);
      window.requestAnimationFrame(() => {
        window.scrollTo(scrollPosition);
        window.requestAnimationFrame(() => window.scrollTo(scrollPosition));
      });
    });
  }, []);

  return { ...snapshot, toggleTheme };
}
