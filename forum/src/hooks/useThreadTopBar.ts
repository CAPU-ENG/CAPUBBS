import { useEffect, useState, type RefObject } from 'react';

const SCROLL_DIRECTION_THRESHOLD = 8;

type ThreadTopBarState = {
  hidden: boolean;
  showContextTitle: boolean;
};

export function useThreadTopBar(
  targetRef: RefObject<HTMLElement | null>,
  autoHideEnabled: boolean,
) {
  const [state, setState] = useState<ThreadTopBarState>({
    hidden: false,
    showContextTitle: false,
  });

  useEffect(() => {
    let frame = 0;
    let lastScrollY = Math.max(0, window.scrollY);
    let direction = 0;
    let directionDistance = 0;

    function updateTopBar() {
      frame = 0;
      const currentScrollY = Math.max(0, window.scrollY);
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      const topBarHeight = Number.parseFloat(
        window.getComputedStyle(document.documentElement).getPropertyValue('--topbar-height'),
      ) || 64;
      const showContextTitle = (
        targetRef.current?.getBoundingClientRect().bottom ?? Infinity
      ) <= topBarHeight + 8;
      const nextDirection = Math.sign(scrollDelta);

      if (nextDirection !== 0) {
        if (nextDirection !== direction) {
          direction = nextDirection;
          directionDistance = 0;
        }
        directionDistance += Math.abs(scrollDelta);
      }

      setState((current) => {
        let hidden = current.hidden;

        if (!autoHideEnabled || currentScrollY <= topBarHeight + 8) {
          hidden = false;
        } else if (directionDistance >= SCROLL_DIRECTION_THRESHOLD) {
          hidden = direction > 0;
        }

        if (hidden === current.hidden && showContextTitle === current.showContextTitle) return current;
        return { hidden, showContextTitle };
      });
    }

    function scheduleTopBarUpdate() {
      if (frame) return;
      frame = window.requestAnimationFrame(updateTopBar);
    }

    window.addEventListener('scroll', scheduleTopBarUpdate, { passive: true });
    window.addEventListener('resize', scheduleTopBarUpdate);
    scheduleTopBarUpdate();

    return () => {
      window.removeEventListener('scroll', scheduleTopBarUpdate);
      window.removeEventListener('resize', scheduleTopBarUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [autoHideEnabled, targetRef]);

  return state;
}
