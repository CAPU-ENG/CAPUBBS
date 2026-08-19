import type { SafeForumHtml } from '../../utils/forumMarkup';
import type { KeyboardEvent, MouseEvent } from 'react';

type ForumMarkupVariant = 'floor' | 'nested' | 'signature';
export type ForumMarkupImage = { alt: string; src: string };

export function ForumMarkup({
  className = '',
  html,
  onImageOpen,
  variant,
}: {
  className?: string;
  html: SafeForumHtml;
  onImageOpen?: (image: ForumMarkupImage, trigger: HTMLImageElement) => void;
  variant: ForumMarkupVariant;
}) {
  if (!html) return null;

  function openImage(target: EventTarget | null) {
    if (!onImageOpen || !(target instanceof Element)) return;
    const image = target.closest('img');
    if (!(image instanceof HTMLImageElement)) return;
    onImageOpen({ alt: image.alt.trim(), src: image.currentSrc || image.src }, image);
  }

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (!(event.target instanceof HTMLImageElement)) return;
    event.preventDefault();
    openImage(event.target);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!(event.target instanceof HTMLImageElement) || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    openImage(event.target);
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
