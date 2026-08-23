import { useEffect, useState, type RefObject } from 'react';

const SCROLL_DIRECTION_THRESHOLD = 8;
const PRIMARY_NAV_RESTORE_THRESHOLD = 96;

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
    let hidden = false;
    let initialized = false;
    let restoreDistance = 0;
    let restoredWithContextTitle = false;
    let showContextTitle = false;

    function updateTopBar() {
      frame = 0;
      const currentScrollY = Math.max(0, window.scrollY);
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      const topBarHeight = Number.parseFloat(
        window.getComputedStyle(document.documentElement).getPropertyValue('--topbar-height'),
      ) || 64;
      const targetIsCovered = (
        targetRef.current?.getBoundingClientRect().bottom ?? Infinity
      ) <= topBarHeight + 8;
      const nextDirection = Math.sign(scrollDelta);

      if (!initialized) {
        initialized = true;
        showContextTitle = targetIsCovered;
      }

      if (nextDirection !== 0) {
        if (nextDirection !== direction) {
          direction = nextDirection;
          directionDistance = 0;
          restoreDistance = 0;
          restoredWithContextTitle = false;
        }
        directionDistance += Math.abs(scrollDelta);
      }

      if (!autoHideEnabled) {
        hidden = false;
        showContextTitle = targetIsCovered;
      } else if (currentScrollY <= topBarHeight + 8) {
        hidden = false;
        restoreDistance = 0;
        restoredWithContextTitle = false;
        showContextTitle = false;
      } else if (direction > 0) {
        showContextTitle = targetIsCovered;
        if (directionDistance >= SCROLL_DIRECTION_THRESHOLD) hidden = true;
      } else if (direction < 0 && hidden && directionDistance >= SCROLL_DIRECTION_THRESHOLD) {
        hidden = false;
        restoreDistance = 0;
        restoredWithContextTitle = targetIsCovered;
        showContextTitle = targetIsCovered;
      } else if (direction < 0 && restoredWithContextTitle) {
        restoreDistance += Math.abs(scrollDelta);
        showContextTitle = targetIsCovered && restoreDistance < PRIMARY_NAV_RESTORE_THRESHOLD;
      } else if (!targetIsCovered) {
        showContextTitle = false;
      }

      setState((current) => {
        if (hidden === current.hidden && showContextTitle === current.showContextTitle) {
          return current;
        }
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
