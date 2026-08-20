import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus, RotateCcw, X } from 'lucide-react';
import type { ForumMarkupImage } from './ForumMarkup';

const MIN_IMAGE_SCALE = 1;
const MAX_IMAGE_SCALE = 4;
const IMAGE_SCALE_STEP = 0.25;

function clampImageScale(scale: number) {
  return Math.min(MAX_IMAGE_SCALE, Math.max(MIN_IMAGE_SCALE, scale));
}

function getPointerDistance(
  points: Map<number, { x: number; y: number }>,
) {
  const [first, second] = [...points.values()];
  if (!first || !second) return null;
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function ThreadImageLightbox({
  image,
  onClose,
}: {
  image: ForumMarkupImage;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(MIN_IMAGE_SCALE);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const scaleRef = useRef(MIN_IMAGE_SCALE);
  const touchPointsRef = useRef(
    new Map<number, { x: number; y: number }>(),
  );
  const pinchDistanceRef = useRef<number | null>(null);
  const gestureStartScaleRef = useRef(MIN_IMAGE_SCALE);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  function updateScale(nextScale: number) {
    const clampedScale = Math.round(clampImageScale(nextScale) * 100) / 100;
    scaleRef.current = clampedScale;
    setScale(clampedScale);
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement;
    const backdrop = backdropRef.current;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        event.stopPropagation();
        updateScale(scaleRef.current + IMAGE_SCALE_STEP);
        return;
      }

      if (event.key === '-') {
        event.preventDefault();
        event.stopPropagation();
        updateScale(scaleRef.current - IMAGE_SCALE_STEP);
        return;
      }

      if (event.key === '0') {
        event.preventDefault();
        event.stopPropagation();
        updateScale(MIN_IMAGE_SCALE);
        return;
      }

      if (event.key === 'Tab') {
        const controls = dialogRef.current?.querySelectorAll<HTMLButtonElement>(
          'button:not(:disabled)',
        );
        if (!controls?.length) return;

        const firstControl = controls[0];
        const lastControl = controls[controls.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey && activeElement === firstControl) {
          event.preventDefault();
          lastControl.focus();
          return;
        }

        if (!event.shiftKey && activeElement === lastControl) {
          event.preventDefault();
          firstControl.focus();
          return;
        }

        if (!dialogRef.current?.contains(activeElement)) {
          event.preventDefault();
          firstControl.focus();
        }
      }
    }

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      event.stopPropagation();

      if (event.deltaY === 0) return;
      const zoomSensitivity = event.ctrlKey ? 0.01 : 0.002;
      updateScale(
        scaleRef.current * Math.exp(-event.deltaY * zoomSensitivity),
      );
    }

    function handleGestureStart(event: Event) {
      event.preventDefault();
      event.stopPropagation();
      gestureStartScaleRef.current = scaleRef.current;
    }

    function handleGestureChange(event: Event) {
      event.preventDefault();
      event.stopPropagation();

      if (touchPointsRef.current.size >= 2) return;
      const gestureScale = (event as Event & { scale?: number }).scale;
      if (typeof gestureScale === 'number') {
        updateScale(gestureStartScaleRef.current * gestureScale);
      }
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    backdrop?.addEventListener('wheel', handleWheel, { passive: false });
    backdrop?.addEventListener('gesturestart', handleGestureStart, {
      passive: false,
    });
    backdrop?.addEventListener('gesturechange', handleGestureChange, {
      passive: false,
    });
    backdrop?.addEventListener('gestureend', handleGestureChange, {
      passive: false,
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      backdrop?.removeEventListener('wheel', handleWheel);
      backdrop?.removeEventListener('gesturestart', handleGestureStart);
      backdrop?.removeEventListener('gesturechange', handleGestureChange);
      backdrop?.removeEventListener('gestureend', handleGestureChange);
      document.body.style.overflow = previousOverflow;

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, []);

  function handleTouchPointerDown(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (event.pointerType !== 'touch') return;
    if (
      event.target instanceof Element &&
      event.target.closest('.thread-image-lightbox-controls')
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    touchPointsRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (touchPointsRef.current.size === 2) {
      pinchDistanceRef.current = getPointerDistance(touchPointsRef.current);
    }
  }

  function handleTouchPointerMove(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (!touchPointsRef.current.has(event.pointerId)) return;

    event.preventDefault();
    event.stopPropagation();
    touchPointsRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (touchPointsRef.current.size !== 2) return;
    const nextDistance = getPointerDistance(touchPointsRef.current);
    const previousDistance = pinchDistanceRef.current;
    if (!nextDistance || !previousDistance) {
      pinchDistanceRef.current = nextDistance;
      return;
    }

    updateScale(scaleRef.current * (nextDistance / previousDistance));
    pinchDistanceRef.current = nextDistance;
  }

  function handleTouchPointerEnd(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (!touchPointsRef.current.has(event.pointerId)) return;

    touchPointsRef.current.delete(event.pointerId);
    pinchDistanceRef.current =
      touchPointsRef.current.size === 2
        ? getPointerDistance(touchPointsRef.current)
        : null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const scalePercent = Math.round(scale * 100);

  return createPortal(
    <div
      className="thread-image-lightbox-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onPointerCancel={handleTouchPointerEnd}
      onPointerDown={handleTouchPointerDown}
      onPointerMove={handleTouchPointerMove}
      onPointerUp={handleTouchPointerEnd}
      ref={backdropRef}
      role="presentation"
    >
      <figure
        aria-label={image.alt ? `图片预览：${image.alt}` : '图片预览'}
        aria-modal="true"
        className="thread-image-lightbox"
        ref={dialogRef}
        role="dialog"
      >
        <button
          aria-label="关闭图片预览"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          <X size={20} />
        </button>
        <img
          alt={image.alt}
          draggable="false"
          src={image.src}
          style={{ transform: `scale(${scale})` }}
        />
        {image.alt && <figcaption>{image.alt}</figcaption>}
        <div
          aria-label="图片缩放"
          className="thread-image-lightbox-controls"
          role="toolbar"
        >
          <button
            aria-label="缩小图片"
            disabled={scale <= MIN_IMAGE_SCALE}
            onClick={() => updateScale(scale - IMAGE_SCALE_STEP)}
            title="缩小（-）"
            type="button"
          >
            <Minus size={18} />
          </button>
          <output aria-label="当前缩放比例" aria-live="polite">
            {scalePercent}%
          </output>
          <button
            aria-label="放大图片"
            disabled={scale >= MAX_IMAGE_SCALE}
            onClick={() => updateScale(scale + IMAGE_SCALE_STEP)}
            title="放大（+）"
            type="button"
          >
            <Plus size={18} />
          </button>
          <button
            aria-label="恢复原始大小"
            disabled={scale === MIN_IMAGE_SCALE}
            onClick={() => updateScale(MIN_IMAGE_SCALE)}
            title="恢复原始大小（0）"
            type="button"
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </figure>
    </div>,
    document.body,
  );
}
