import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FocusEvent, PointerEvent } from 'react';
import { createPortal } from 'react-dom';

const tooltipSelector = '[data-toolbar-tooltip]';
const viewportGutter = 8;

type ToolbarTooltipState = { anchor: HTMLElement; label: string };

function getTooltipAnchor(target: EventTarget | null) {
  return target instanceof Element ? target.closest<HTMLElement>(tooltipSelector) : null;
}

export function useToolbarTooltip() {
  const [tooltip, setTooltip] = useState<ToolbarTooltipState | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const show = useCallback((anchor: HTMLElement | null) => {
    const label = anchor?.dataset.toolbarTooltip;
    setTooltip(anchor && label ? { anchor, label } : null);
  }, []);
  const hide = useCallback(() => setTooltip(null), []);

  const handlers = {
    onPointerOver: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== 'mouse') return;
      show(getTooltipAnchor(event.target));
    },
    onPointerLeave: hide,
    onPointerDown: hide,
    onFocus: (event: FocusEvent<HTMLElement>) => {
      const anchor = getTooltipAnchor(event.target);
      if (anchor?.matches(':focus-visible')) show(anchor);
    },
    onBlur: hide,
  };

  useLayoutEffect(() => {
    const element = tooltipRef.current;
    if (!tooltip || !element) return;
    const anchorRect = tooltip.anchor.getBoundingClientRect();
    const tooltipRect = element.getBoundingClientRect();
    const maxLeft = window.innerWidth - tooltipRect.width - viewportGutter;
    const left = Math.min(Math.max(anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2, viewportGutter), maxLeft);
    const below = anchorRect.bottom + 6;
    const top = below + tooltipRect.height > window.innerHeight - viewportGutter
      ? anchorRect.top - tooltipRect.height - 6
      : below;
    element.style.left = `${Math.round(left)}px`;
    element.style.top = `${Math.round(top)}px`;
    element.dataset.ready = 'true';
  }, [tooltip]);

  useEffect(() => {
    if (!tooltip) return undefined;
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, [hide, tooltip]);

  const element = tooltip
    ? createPortal(
      <div ref={tooltipRef} className="capubbs-toolbar-tooltip" role="tooltip">
        {tooltip.label}
      </div>,
      document.body,
    )
    : null;

  return { handlers, element };
}
