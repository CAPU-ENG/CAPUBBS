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
    saveExplicitTheme(snapshot.theme === 'light' ? 'dark' : 'light');
  }, [snapshot.theme]);

  return { ...snapshot, toggleTheme };
}
