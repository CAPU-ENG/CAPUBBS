import type { SafeForumHtml } from '../../utils/forumMarkup';
import { useEffect, useLayoutEffect, useMemo, useRef, type KeyboardEvent, type MouseEvent } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { syncForumGrayscaleTextColors } from '../../utils/forumGrayscaleTextColor';
import { preloadNearbyImages } from '../../utils/imagePreloading';
import {
  ensureGalleryDisplayControls,
  getEditorGalleryAction,
  moveEditorGallery,
  setEditorGalleryIndex,
} from '../editor/RichTextEditor.gallery';

type ForumMarkupVariant = 'floor' | 'nested' | 'signature';
export type ForumMarkupImage = {
  alt: string;
  element?: HTMLImageElement;
  elementIndex?: number;
  galleryId?: number;
  galleryIndex?: number;
  src: string;
};
export type ForumMarkupImageChangeHandler = (imageIndex: number) => void;
export type ForumMarkupImageOpenHandler = (
  images: ForumMarkupImage[],
  imageIndex: number,
  trigger: HTMLElement,
  onImageChange?: ForumMarkupImageChangeHandler,
) => void;

type GalleryImageLocation = {
  gallery: HTMLElement;
  galleryId: number;
  galleryIndex: number;
};

export function ForumMarkup({
  className = '',
  html,
  onImageOpen,
  variant,
}: {
  className?: string;
  html: SafeForumHtml;
  onImageOpen?: ForumMarkupImageOpenHandler;
  variant: ForumMarkupVariant;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const dangerousHtml = useMemo(() => ({ __html: html }), [html]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container) {
      ensureGalleryDisplayControls(container);
      syncForumGrayscaleTextColors(container, theme);
    }
  }, [html, theme]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container) return preloadNearbyImages(container);
  }, [html]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const images = Array.from(container.querySelectorAll('img'));
    const markLoaded = (image: HTMLImageElement) => {
      image.dataset.capubbsImageLoaded = 'true';
    };
    const listeners = images.map((image) => {
      if (image.complete) {
        markLoaded(image);
        return null;
      }

      const handleLoad = () => markLoaded(image);
      image.addEventListener('load', handleLoad, { once: true });
      image.addEventListener('error', handleLoad, { once: true });
      return { handleLoad, image };
    });

    return () => {
      listeners.forEach((listener) => {
        if (!listener) return;
        listener.image.removeEventListener('load', listener.handleLoad);
        listener.image.removeEventListener('error', listener.handleLoad);
      });
    };
  }, [html]);

  if (!html) return null;

  function openImage(target: EventTarget | null, container: HTMLDivElement) {
    if (!onImageOpen || !(target instanceof Element)) return;
    const image = target.closest('img');
    if (!(image instanceof HTMLImageElement)) return;

    const gallery = image.closest<HTMLElement>('.capubbs-gallery');
    const imageElements = gallery
      ? Array.from(gallery.querySelectorAll<HTMLImageElement>('[data-capubbs-gallery-slide="true"] img'))
      : Array.from(container.querySelectorAll<HTMLImageElement>('img')).filter(
        (candidate) => !candidate.closest('.capubbs-gallery'),
      );
    const imageIndex = imageElements.indexOf(image);
    if (imageIndex < 0) return;

    const imageLocations = imageElements.map((candidate) => getGalleryImageLocation(candidate, container));
    const images = imageElements.map((candidate, candidateIndex) => {
      const location = imageLocations[candidateIndex];
      return {
        alt: candidate.alt.trim(),
        element: candidate,
        src: candidate.currentSrc || candidate.src,
        ...(location ? {
          galleryId: location.galleryId,
          galleryIndex: location.galleryIndex,
        } : {}),
      };
    });
    const onImageChange: ForumMarkupImageChangeHandler = (nextImageIndex) => {
      const nextLocation = imageLocations[nextImageIndex];
      if (!nextLocation) return;
      setEditorGalleryIndex(nextLocation.gallery, nextLocation.galleryIndex);
    };

    onImageOpen(images, imageIndex, image, onImageChange);
  }

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const galleryAction = getEditorGalleryAction(event.target);
    if (galleryAction && event.target instanceof Element) {
      event.preventDefault();
      event.stopPropagation();
      moveEditorGallery(event.target, galleryAction);
      return;
    }

    if (!onImageOpen || !(event.target instanceof HTMLImageElement)) return;
    event.preventDefault();
    openImage(event.target, event.currentTarget);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const galleryAction = getEditorGalleryAction(event.target);
    if (galleryAction && ['Enter', ' '].includes(event.key) && event.target instanceof Element) {
      event.preventDefault();
      moveEditorGallery(event.target, galleryAction);
      return;
    }

    if (
      ['ArrowLeft', 'ArrowRight'].includes(event.key)
      && event.target instanceof Element
      && event.target.closest('.capubbs-gallery')
    ) {
      event.preventDefault();
      moveEditorGallery(event.target, event.key === 'ArrowLeft' ? 'prev' : 'next');
      return;
    }

    if (!onImageOpen || !(event.target instanceof HTMLImageElement) || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    openImage(event.target, event.currentTarget);
  }

  return (
    <div
      ref={containerRef}
      className={`forum-markup forum-markup-${variant} ${className}`.trim()}
      data-forum-markup={variant}
      dangerouslySetInnerHTML={dangerousHtml}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    />
  );
}

function getGalleryImageLocation(
  image: HTMLImageElement,
  container: HTMLDivElement,
): GalleryImageLocation | null {
  const gallery = image.closest<HTMLElement>('.capubbs-gallery');
  if (!gallery || !container.contains(gallery)) return null;

  const galleries = Array.from(container.querySelectorAll<HTMLElement>('.capubbs-gallery'));
  const galleryId = galleries.indexOf(gallery);
  const galleryImages = Array.from(
    gallery.querySelectorAll<HTMLImageElement>('[data-capubbs-gallery-slide="true"] img'),
  );
  const galleryIndex = galleryImages.indexOf(image);
  return galleryId >= 0 && galleryIndex >= 0
    ? { gallery, galleryId, galleryIndex }
    : null;
}
