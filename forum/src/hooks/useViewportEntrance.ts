import { useEffect, useRef } from 'react';

const DESKTOP_MOTION = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

export function useViewportEntrance<T extends HTMLElement>() {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    const media = window.matchMedia?.(DESKTOP_MOTION);
    if (!element || !media || typeof IntersectionObserver === 'undefined') return;

    let entered = Boolean(element.dataset.forumViewportEntrance);
    const observer = new IntersectionObserver((entries) => {
      if (entered || !media.matches || !entries.some((entry) => entry.isIntersecting)) return;
      entered = true;
      element.dataset.forumViewportEntrance = 'entering';
      observer.disconnect();
    }, { rootMargin: '0px', threshold: 0 });

    const finishAnimation = (event: AnimationEvent) => {
      if (event.target === element && entered) element.dataset.forumViewportEntrance = 'done';
    };

    const syncMotion = () => {
      observer.disconnect();
      if (entered) {
        // Keep the one-time marker after motion/viewport changes without restarting the animation.
        element.dataset.forumViewportEntrance = 'done';
      } else if (media.matches) {
        // Any intersection works even for a floor taller than the viewport.
        observer.observe(element);
      }
    };

    syncMotion();
    media.addEventListener('change', syncMotion);
    element.addEventListener('animationend', finishAnimation);

    return () => {
      observer.disconnect();
      media.removeEventListener('change', syncMotion);
      element.removeEventListener('animationend', finishAnimation);
    };
  }, []);

  return elementRef;
}
