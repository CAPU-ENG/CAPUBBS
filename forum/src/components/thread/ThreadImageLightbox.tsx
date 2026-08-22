import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from 'lucide-react';
import type { ForumMarkupImage } from './ForumMarkup';

const MIN_IMAGE_SCALE = 1;
const MAX_IMAGE_SCALE = 4;
const IMAGE_SCALE_STEP = 0.25;

type ImageOffset = { x: number; y: number };

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

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
  images,
  initialImageIndex,
  onImageChange,
  onClose,
}: {
  images: ForumMarkupImage[];
  initialImageIndex: number;
  onImageChange?: (imageIndex: number) => void;
  onClose: (imageIndex: number) => void;
}) {
  const normalizedInitialIndex = Math.min(
    Math.max(0, initialImageIndex),
    Math.max(0, images.length - 1),
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(normalizedInitialIndex);
  const [scale, setScale] = useState(MIN_IMAGE_SCALE);
  const [offset, setOffset] = useState<ImageOffset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const currentImageIndexRef = useRef(normalizedInitialIndex);
  const scaleRef = useRef(MIN_IMAGE_SCALE);
  const offsetRef = useRef<ImageOffset>({ x: 0, y: 0 });
  const dragRef = useRef<DragState | null>(null);
  const interactionMovedRef = useRef(false);
  const touchPointsRef = useRef(
    new Map<number, { x: number; y: number }>(),
  );
  const pinchDistanceRef = useRef<number | null>(null);
  const gestureStartScaleRef = useRef(MIN_IMAGE_SCALE);
  const onImageChangeRef = useRef(onImageChange);
  const onCloseRef = useRef(onClose);
  onImageChangeRef.current = onImageChange;
  onCloseRef.current = onClose;

  function clampOffset(nextOffset: ImageOffset, nextScale = scaleRef.current) {
    const backdrop = backdropRef.current;
    const imageElement = imageRef.current;
    if (!backdrop || !imageElement || nextScale <= MIN_IMAGE_SCALE) {
      return { x: 0, y: 0 };
    }

    const maxX = Math.max(
      0,
      (imageElement.clientWidth * nextScale - backdrop.clientWidth) / 2,
    );
    const maxY = Math.max(
      0,
      (imageElement.clientHeight * nextScale - backdrop.clientHeight) / 2,
    );

    return {
      x: Math.min(maxX, Math.max(-maxX, nextOffset.x)),
      y: Math.min(maxY, Math.max(-maxY, nextOffset.y)),
    };
  }

  function updateOffset(nextOffset: ImageOffset, nextScale = scaleRef.current) {
    const clampedOffset = clampOffset(nextOffset, nextScale);
    offsetRef.current = clampedOffset;
    setOffset(clampedOffset);
  }

  function updateScale(nextScale: number) {
    const clampedScale = Math.round(clampImageScale(nextScale) * 100) / 100;
    scaleRef.current = clampedScale;
    setScale(clampedScale);
    updateOffset(offsetRef.current, clampedScale);
  }

  function resetImageView() {
    scaleRef.current = MIN_IMAGE_SCALE;
    offsetRef.current = { x: 0, y: 0 };
    setScale(MIN_IMAGE_SCALE);
    setOffset({ x: 0, y: 0 });
  }

  function showImage(imageIndex: number) {
    const nextImageIndex = Math.min(Math.max(0, imageIndex), images.length - 1);
    if (nextImageIndex === currentImageIndexRef.current) return;

    currentImageIndexRef.current = nextImageIndex;
    setCurrentImageIndex(nextImageIndex);
    resetImageView();
    onImageChangeRef.current?.(nextImageIndex);
  }

  function closePreview() {
    onCloseRef.current(currentImageIndexRef.current);
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
        closePreview();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        event.stopPropagation();
        showImage(currentImageIndexRef.current - 1);
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        event.stopPropagation();
        showImage(currentImageIndexRef.current + 1);
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
        resetImageView();
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

    function keepImageWithinViewport() {
      updateOffset(offsetRef.current, scaleRef.current);
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('resize', keepImageWithinViewport);
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
      window.removeEventListener('resize', keepImageWithinViewport);
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

  useEffect(() => {
    [images[currentImageIndex - 1], images[currentImageIndex + 1]].forEach((candidate) => {
      if (!candidate) return;
      const preloadImage = new Image();
      preloadImage.src = candidate.src;
    });
  }, [currentImageIndex, images]);

  function startDragging(pointerId: number, clientX: number, clientY: number) {
    dragRef.current = {
      pointerId,
      startX: clientX,
      startY: clientY,
      originX: offsetRef.current.x,
      originY: offsetRef.current.y,
    };
    setIsDragging(true);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (
      event.target instanceof Element &&
      event.target.closest('button, .thread-image-lightbox-controls')
    ) {
      return;
    }

    const isTouch = event.pointerType === 'touch';
    const isPrimaryMouse = event.pointerType === 'mouse' && event.button === 0;
    if (!isTouch && !isPrimaryMouse) return;

    interactionMovedRef.current = false;

    if (!isTouch && scaleRef.current <= MIN_IMAGE_SCALE) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    if (isTouch) {
      touchPointsRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });

      if (touchPointsRef.current.size === 2) {
        pinchDistanceRef.current = getPointerDistance(touchPointsRef.current);
        dragRef.current = null;
        setIsDragging(false);
        return;
      }
    }

    if (scaleRef.current > MIN_IMAGE_SCALE) {
      startDragging(event.pointerId, event.clientX, event.clientY);
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const isTrackedTouch = touchPointsRef.current.has(event.pointerId);
    const dragState = dragRef.current;
    if (!isTrackedTouch && dragState?.pointerId !== event.pointerId) return;

    event.preventDefault();
    event.stopPropagation();

    if (isTrackedTouch) {
      touchPointsRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
    }

    if (touchPointsRef.current.size === 2) {
      const nextDistance = getPointerDistance(touchPointsRef.current);
      const previousDistance = pinchDistanceRef.current;
      if (!nextDistance || !previousDistance) {
        pinchDistanceRef.current = nextDistance;
        return;
      }

      if (Math.abs(nextDistance - previousDistance) > 1) {
        interactionMovedRef.current = true;
      }
      updateScale(scaleRef.current * (nextDistance / previousDistance));
      pinchDistanceRef.current = nextDistance;
      return;
    }

    if (!dragState || scaleRef.current <= MIN_IMAGE_SCALE) return;
    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    if (Math.hypot(deltaX, deltaY) > 3) {
      interactionMovedRef.current = true;
    }
    updateOffset({
      x: dragState.originX + deltaX,
      y: dragState.originY + deltaY,
    });
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const wasTrackedTouch = touchPointsRef.current.delete(event.pointerId);
    const wasDragging = dragRef.current?.pointerId === event.pointerId;
    if (!wasTrackedTouch && !wasDragging) return;

    pinchDistanceRef.current =
      touchPointsRef.current.size === 2
        ? getPointerDistance(touchPointsRef.current)
        : null;

    if (touchPointsRef.current.size === 1 && scaleRef.current > MIN_IMAGE_SCALE) {
      const [remainingPointer] = touchPointsRef.current.entries();
      if (remainingPointer) {
        const [pointerId, point] = remainingPointer;
        startDragging(pointerId, point.x, point.y);
      }
    } else {
      dragRef.current = null;
      setIsDragging(false);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const scalePercent = Math.round(scale * 100);
  const image = images[currentImageIndex] ?? images[0];

  if (!image) return null;

  return createPortal(
    <div
      className="thread-image-lightbox-backdrop"
      data-can-pan={scale > MIN_IMAGE_SCALE}
      data-dragging={isDragging}
      onClick={(event) => {
        if (
          event.target === event.currentTarget &&
          !interactionMovedRef.current
        ) {
          closePreview();
        }
      }}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      ref={backdropRef}
      role="presentation"
    >
      <figure
        aria-label={image.alt
          ? `图片预览：${image.alt}（${currentImageIndex + 1}/${images.length}）`
          : `图片预览（${currentImageIndex + 1}/${images.length}）`}
        aria-modal="true"
        className="thread-image-lightbox"
        ref={dialogRef}
        role="dialog"
      >
        <button
          aria-label="关闭图片预览"
          className="thread-image-lightbox-close"
          onClick={closePreview}
          ref={closeButtonRef}
          type="button"
        >
          <X size={20} />
        </button>
        {images.length > 1 && (
          <>
            <button
              aria-label="上一张图片"
              className="thread-image-lightbox-nav thread-image-lightbox-prev"
              disabled={currentImageIndex === 0}
              onClick={() => showImage(currentImageIndex - 1)}
              title="上一张（←）"
              type="button"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              aria-label="下一张图片"
              className="thread-image-lightbox-nav thread-image-lightbox-next"
              disabled={currentImageIndex === images.length - 1}
              onClick={() => showImage(currentImageIndex + 1)}
              title="下一张（→）"
              type="button"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
        <img
          alt={image.alt}
          draggable="false"
          onLoad={() => updateOffset(offsetRef.current, scaleRef.current)}
          ref={imageRef}
          src={image.src}
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
          }}
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
            onClick={resetImageView}
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
