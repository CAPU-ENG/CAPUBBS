import { useCallback, useEffect, useState } from 'react';
import {
  applyTheme,
  readThemeSnapshot,
  saveExplicitTheme,
  subscribeThemePreference,
} from '../utils/theme';

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
    if (!saveExplicitTheme(snapshot.theme === 'light' ? 'dark' : 'light')) return;

    window.requestAnimationFrame(() => {
      window.scrollTo(scrollPosition);
      window.requestAnimationFrame(() => window.scrollTo(scrollPosition));
    });
  }, [snapshot.theme]);

  return { ...snapshot, toggleTheme };
}
