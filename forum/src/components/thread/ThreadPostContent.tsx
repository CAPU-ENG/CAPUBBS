import type { ReactNode } from 'react';
import type { ForumMarkupImage } from './ForumMarkup';
import { ThreadHtmlContent } from './ThreadHtmlContent';

export function ThreadPostContent({
  bodyClassName = 'thread-floor-body',
  bodyFallback = null,
  bodyHtml,
  floor,
  onImageOpen,
  signatureClassName = 'thread-signature',
  signatureHtml,
  signatureText,
}: {
  bodyClassName?: string;
  bodyFallback?: ReactNode;
  bodyHtml?: string;
  floor: number;
  onImageOpen?: (image: ForumMarkupImage, trigger: HTMLImageElement) => void;
  signatureClassName?: string;
  signatureHtml?: string;
  signatureText?: string;
}) {
  return (
    <>
      {bodyHtml ? (
        <ThreadHtmlContent
          className={bodyClassName}
          floor={floor}
          html={bodyHtml}
          onImageOpen={onImageOpen}
          variant="floor"
        />
      ) : bodyFallback}

      {signatureHtml ? (
        <ThreadHtmlContent
          className={signatureClassName}
          floor={floor}
          html={signatureHtml}
          onImageOpen={onImageOpen}
          variant="signature"
        />
      ) : signatureText ? (
        <footer className={signatureClassName}>
          <p>{signatureText}</p>
        </footer>
      ) : null}
    </>
  );
}
