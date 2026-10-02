import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ComponentPropsWithRef, type ReactNode, type Ref, type RefObject } from 'react';

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

export function DialogLayer({ onDismiss, ref, ...props }: ComponentPropsWithRef<'div'> & { onDismiss?: () => void }) {
  const { closing, mobileSize } = useContext(DialogContext);
  const layerRef = useRef<HTMLDivElement | null>(null);
  useModalFocus(layerRef, { active: !closing, onDismiss });
  const setRef = useCallback((node: HTMLDivElement | null) => {
    layerRef.current = node;
    assignRef(ref, node);
  }, [ref]);
  return (
    <div
      {...props}
      ref={setRef}
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

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const modalStack: symbol[] = [];

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as RefObject<T | null>).current = value;
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => !element.closest('[inert]') && element.getClientRects().length > 0);
}

/**
 * Modal keyboard behaviour shared by every forum dialog: focus moves into the dialog,
 * Tab stays inside it, Escape dismisses the topmost dialog and focus returns to the trigger.
 */
export function useModalFocus(containerRef: RefObject<HTMLElement | null>, { active = true, onDismiss }: { active?: boolean; onDismiss?: () => void }) {
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;
    const id = Symbol('forum-modal');
    modalStack.push(id);
    const isTopmost = () => modalStack[modalStack.length - 1] === id;
    const returnFocusTo = document.activeElement instanceof HTMLElement && !container.contains(document.activeElement)
      ? document.activeElement
      : null;

    if (!container.contains(document.activeElement)) {
      const target = container.querySelector<HTMLElement>('[data-autofocus], [autofocus]')
        ?? container.querySelector<HTMLElement>('[role="dialog"], [role="alertdialog"]')
        ?? container;
      if (!target.hasAttribute('tabindex') && !target.matches(FOCUSABLE_SELECTOR)) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !isTopmost()) return;
      if (event.key === 'Escape' && dismissRef.current) {
        event.preventDefault();
        dismissRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      if (!container.contains(current)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const index = modalStack.indexOf(id);
      if (index >= 0) modalStack.splice(index, 1);
      const focusIsLost = !document.activeElement || document.activeElement === document.body || container.contains(document.activeElement);
      if (returnFocusTo?.isConnected && focusIsLost) returnFocusTo.focus({ preventScroll: true });
    };
  }, [active, containerRef]);
}
