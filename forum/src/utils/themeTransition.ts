import { flushSync } from 'react-dom';

let finishActiveTransition: (() => void) | null = null;

export function runThemeTransition(update: () => void) {
  // Commit a pending toggle before accepting another one, even before its snapshot is ready.
  finishActiveTransition?.();

  const media = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
  if (!media.matches || typeof document.startViewTransition !== 'function') {
    update();
    return;
  }

  const root = document.documentElement;
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
    if (finishActiveTransition !== finish) return;
    finishActiveTransition = null;
    delete root.dataset.forumThemeTransition;
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
  root.dataset.forumThemeTransition = 'true';
  media.addEventListener('change', onMotionChange);

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
