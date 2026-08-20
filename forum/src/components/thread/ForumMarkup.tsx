import type { SafeForumHtml } from '../../utils/forumMarkup';
import type { KeyboardEvent, MouseEvent } from 'react';

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
    if (!onImageOpen || !(event.target instanceof HTMLImageElement)) return;
    event.preventDefault();
    openImage(event.target, event.currentTarget);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!onImageOpen || !(event.target instanceof HTMLImageElement) || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    openImage(event.target, event.currentTarget);
  }

  return (
    <div
      className={`forum-markup forum-markup-${variant} ${className}`.trim()}
      data-forum-markup={variant}
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    />
  );
}
