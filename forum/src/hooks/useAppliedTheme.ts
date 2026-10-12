import { useEffect, useState } from 'react';
import type { Theme } from '../utils/theme';

function readAppliedTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

// The theme currently applied to the page, which can differ from the saved preference (e.g. the post preview toggle).
export function useAppliedTheme() {
  const [theme, setTheme] = useState(readAppliedTheme);

  useEffect(() => {
    const update = () => setTheme(readAppliedTheme());
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributeFilter: ['class'], attributes: true });
    update();
    return () => observer.disconnect();
  }, []);

  return theme;
}
