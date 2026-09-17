import { useLayoutEffect, useRef } from 'react';
import { staggerEntrance } from '../utils/staggerEntrance';

export function useStaggerEntrance<T extends HTMLElement>(selector: string) {
  const containerRef = useRef<T>(null);

  // Check each commit so async results and newly expanded rows enter once.
  // Existing rows keep their marker and never replay on form input or selection.
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    staggerEntrance(containerRef.current.querySelectorAll<HTMLElement>(selector));
  });

  return containerRef;
}
