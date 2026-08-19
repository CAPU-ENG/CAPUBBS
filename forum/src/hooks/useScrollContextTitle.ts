import { useEffect, useState, type RefObject } from 'react';

export function useScrollContextTitle(targetRef: RefObject<HTMLElement | null>) {
  const [showContextTitle, setShowContextTitle] = useState(false);

  useEffect(() => {
    let frame = 0;
    let lastScrollY = Math.max(0, window.scrollY);

    function updateContextTitle() {
      frame = 0;
      const currentScrollY = Math.max(0, window.scrollY);
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      const topBarHeight = Number.parseFloat(
        window.getComputedStyle(document.documentElement).getPropertyValue('--topbar-height'),
      ) || 64;
      const targetIsCovered = (targetRef.current?.getBoundingClientRect().bottom ?? Infinity) <= topBarHeight + 8;

      if (!targetIsCovered) {
        setShowContextTitle(false);
        return;
      }

      if (scrollDelta > 1) {
        setShowContextTitle(true);
      } else if (scrollDelta < -1) {
        setShowContextTitle(false);
      }
    }

    function scheduleContextTitleUpdate() {
      if (frame) return;
      frame = window.requestAnimationFrame(updateContextTitle);
    }

    window.addEventListener('scroll', scheduleContextTitleUpdate, { passive: true });
    window.addEventListener('resize', scheduleContextTitleUpdate);
    scheduleContextTitleUpdate();

    return () => {
      window.removeEventListener('scroll', scheduleContextTitleUpdate);
      window.removeEventListener('resize', scheduleContextTitleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [targetRef]);

  return showContextTitle;
}
