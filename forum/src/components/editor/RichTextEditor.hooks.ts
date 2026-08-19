import { useEffect, useState } from 'react';
import { mobileViewportQuery } from './RichTextEditor.constants';

export function useIsMobileViewport() {
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }

    return window.matchMedia(mobileViewportQuery).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(mobileViewportQuery);
    const handleChange = () => setIsMobileViewport(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobileViewport;
}

export function useIsDarkTheme() {
  const [isDarkTheme, setIsDarkTheme] = useState(() => getCurrentDarkTheme());

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const root = document.documentElement;
    const updateTheme = () => setIsDarkTheme(getCurrentDarkTheme());

    updateTheme();

    if (typeof MutationObserver === 'undefined') {
      return undefined;
    }

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, {
      attributeFilter: ['class', 'data-theme'],
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  return isDarkTheme;
}

function getCurrentDarkTheme() {
  if (typeof document === 'undefined') {
    return false;
  }

  const root = document.documentElement;

  return root.classList.contains('dark') || root.dataset.theme === 'dark';
}
