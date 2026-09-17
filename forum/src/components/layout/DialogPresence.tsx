import { createContext, useContext, useLayoutEffect, useRef, useState, type ComponentPropsWithRef, type ReactNode } from 'react';

const DialogClosingContext = createContext(false);
// Keep this in sync with forum-dialog-exit in utilities.css.
const EXIT_DURATION = 140;
const DESKTOP_MOTION = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

export function DialogPresence({ children }: { children: ReactNode }) {
  const open = Boolean(children);
  const [present, setPresent] = useState(open);
  // Retain the mounted subtree so forms, portals and embedded content stay intact during exit.
  const retainedChildren = useRef(children);
  const parentClosing = useContext(DialogClosingContext);

  useLayoutEffect(() => {
    if (open) {
      retainedChildren.current = children;
      if (!present) setPresent(true);
      return;
    }
    if (!present) return;

    const finish = () => {
      retainedChildren.current = null;
      setPresent(false);
    };
    const media = window.matchMedia?.(DESKTOP_MOTION);
    if (!media?.matches) {
      finish();
      return;
    }

    const timer = window.setTimeout(finish, EXIT_DURATION);
    const onMotionChange = () => { if (!media.matches) finish(); };
    media.addEventListener('change', onMotionChange);
    return () => {
      window.clearTimeout(timer);
      media.removeEventListener('change', onMotionChange);
    };
  }, [children, open, present]);

  return (
    <DialogClosingContext.Provider value={parentClosing || (!open && present)}>
      {open ? children : present ? retainedChildren.current : null}
    </DialogClosingContext.Provider>
  );
}

export function DialogLayer(props: ComponentPropsWithRef<'div'>) {
  const closing = useContext(DialogClosingContext);
  return (
    <div
      {...props}
      aria-hidden={closing || props['aria-hidden']}
      data-forum-dialog-layer="true"
      data-forum-closing={closing || undefined}
      inert={closing || props.inert}
    />
  );
}

export function DialogNativeLayer(props: ComponentPropsWithRef<'dialog'>) {
  const closing = useContext(DialogClosingContext);
  return (
    <dialog
      {...props}
      aria-hidden={closing || props['aria-hidden']}
      data-forum-closing={closing || undefined}
      inert={closing || props.inert}
    />
  );
}
