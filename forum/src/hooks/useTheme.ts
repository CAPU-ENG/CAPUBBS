import { useCallback, useEffect, useState, type MouseEvent } from 'react';
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

  const toggleTheme = useCallback((event?: MouseEvent<HTMLElement>) => {
    const scrollPosition = { left: window.scrollX, top: window.scrollY };
    const bounds = event?.currentTarget.getBoundingClientRect();
    const origin = bounds ? { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 } : undefined;
    runThemeTransition(() => {
      const currentTheme = readThemeSnapshot().theme;
      if (!saveExplicitTheme(currentTheme === 'light' ? 'dark' : 'light')) return;

      window.scrollTo(scrollPosition);
      window.requestAnimationFrame(() => {
        window.scrollTo(scrollPosition);
        window.requestAnimationFrame(() => window.scrollTo(scrollPosition));
      });
    }, origin);
  }, []);

  return { ...snapshot, toggleTheme };
}
