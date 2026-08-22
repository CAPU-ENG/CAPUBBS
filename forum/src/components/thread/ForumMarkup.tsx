import type { SafeForumHtml } from '../../utils/forumMarkup';
import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from 'react';
import {
  getEditorGalleryAction,
  moveEditorGallery,
} from '../editor/RichTextEditor.gallery';

type ForumMarkupVariant = 'floor' | 'nested' | 'signature';
export type ForumMarkupImage = { alt: string; src: string };
export type ForumMarkupImageOpenHandler = (
  images: ForumMarkupImage[],
  imageIndex: number,
  trigger: HTMLElement,
) => void;

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

    const imageElements = Array.from(container.querySelectorAll('img'));
    const imageIndex = imageElements.indexOf(image);
    if (imageIndex < 0) return;

    onImageOpen(
      imageElements.map((candidate) => ({
        alt: candidate.alt.trim(),
        src: candidate.currentSrc || candidate.src,
      })),
      imageIndex,
      image,
    );
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
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    />
  );
}
