import { createContext, useContext, useLayoutEffect, useRef, useState, type ComponentPropsWithRef, type ReactNode } from 'react';

type MobileDialogSize = 'regular' | 'compact';
const DialogContext = createContext({ closing: false, mobileSize: 'regular' as MobileDialogSize });
// Keep these in sync with utilities.css and mobile-motion.css.
const DESKTOP_EXIT_DURATION = 140;
const MOBILE_EXIT_DURATION = { regular: 160, compact: 120 };
const MOTION = '(prefers-reduced-motion: no-preference)';
const DESKTOP_VIEWPORT = '(min-width: 1024px)';

export function DialogPresence({ children, mobileSize = 'regular' }: {
  children: ReactNode;
  mobileSize?: MobileDialogSize;
}) {
  const open = Boolean(children);
  const [present, setPresent] = useState(open);
  // Retain the mounted subtree so forms, portals and embedded content stay intact during exit.
  const retainedChildren = useRef(children);
  const { closing: parentClosing } = useContext(DialogContext);

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
    const media = window.matchMedia?.(MOTION);
    if (!media?.matches) {
      finish();
      return;
    }

    const viewport = window.matchMedia(DESKTOP_VIEWPORT);
    const exitDuration = viewport.matches ? DESKTOP_EXIT_DURATION : MOBILE_EXIT_DURATION[mobileSize];
    const timer = window.setTimeout(finish, exitDuration);
    const onMotionChange = () => { if (!media.matches) finish(); };
    media.addEventListener('change', onMotionChange);
    viewport.addEventListener('change', finish);
    return () => {
      window.clearTimeout(timer);
      media.removeEventListener('change', onMotionChange);
      viewport.removeEventListener('change', finish);
    };
  }, [children, mobileSize, open, present]);

  return (
    <DialogContext.Provider value={{ closing: parentClosing || (!open && present), mobileSize }}>
      {open ? children : present ? retainedChildren.current : null}
    </DialogContext.Provider>
  );
}

export function DialogLayer(props: ComponentPropsWithRef<'div'>) {
  const { closing, mobileSize } = useContext(DialogContext);
  return (
    <div
      {...props}
      aria-hidden={closing || props['aria-hidden']}
      data-forum-dialog-layer="true"
      data-forum-closing={closing || undefined}
      data-forum-mobile-dialog={mobileSize}
      inert={closing || props.inert}
    />
  );
}

export function DialogNativeLayer(props: ComponentPropsWithRef<'dialog'>) {
  const { closing, mobileSize } = useContext(DialogContext);
  return (
    <dialog
      {...props}
      aria-hidden={closing || props['aria-hidden']}
      data-forum-closing={closing || undefined}
      data-forum-mobile-dialog={mobileSize}
      inert={closing || props.inert}
    />
  );
}
