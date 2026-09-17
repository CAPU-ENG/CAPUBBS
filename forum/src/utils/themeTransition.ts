import { flushSync } from 'react-dom';

let finishActiveTransition: (() => void) | null = null;

export function runThemeTransition(update: () => void, origin?: { x: number; y: number }) {
  // Commit a pending toggle before accepting another one, even before its snapshot is ready.
  finishActiveTransition?.();

  const media = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
  if (!media.matches || typeof document.startViewTransition !== 'function') {
    update();
    return;
  }

  const root = document.documentElement;
  const x = Math.max(0, Math.min(window.innerWidth, origin?.x ?? window.innerWidth / 2));
  const y = Math.max(0, Math.min(window.innerHeight, origin?.y ?? window.innerHeight / 2));
  // Reach the farthest viewport corner, with a pixel to spare for the clipped edge.
  const radius = Math.ceil(Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  )) + 1;
  let applied = false;
  let transition: ViewTransition | undefined;
  const applyOnce = () => {
    if (applied) return;
    applied = true;
    // Include React theme icons and decorations in the new snapshot.
    flushSync(update);
  };
  const cleanup = () => {
    media.removeEventListener('change', onMotionChange);
    window.removeEventListener('resize', finish);
    if (finishActiveTransition !== finish) return;
    finishActiveTransition = null;
    delete root.dataset.forumThemeTransition;
    root.style.removeProperty('--forum-theme-origin-x');
    root.style.removeProperty('--forum-theme-origin-y');
    root.style.removeProperty('--forum-theme-radius');
  };
  const finish = () => {
    transition?.skipTransition();
    applyOnce();
    cleanup();
  };
  const onMotionChange = () => {
    if (!media.matches) finish();
  };

  finishActiveTransition = finish;
  root.style.setProperty('--forum-theme-origin-x', `${x}px`);
  root.style.setProperty('--forum-theme-origin-y', `${y}px`);
  root.style.setProperty('--forum-theme-radius', `${radius}px`);
  root.dataset.forumThemeTransition = 'true';
  media.addEventListener('change', onMotionChange);
  window.addEventListener('resize', finish);

  try {
    transition = document.startViewTransition(applyOnce);
  } catch {
    finish();
    return;
  }

  // Skipped/unsupported snapshots must not leave an unhandled rejection or a stale marker.
  void transition.ready.catch(() => {});
  void transition.finished.then(cleanup, cleanup);
}
