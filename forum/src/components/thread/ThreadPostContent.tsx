import type { ReactNode } from 'react';
import type { ForumMarkupImageOpenHandler } from './ForumMarkup';
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
  onImageOpen?: ForumMarkupImageOpenHandler;
  signatureClassName?: string;
  signatureHtml?: string;
  signatureText?: string;
}) {
  const openSignatureImage: ForumMarkupImageOpenHandler | undefined = onImageOpen
    ? (images, imageIndex, trigger) => {
        const image = images[imageIndex];
        if (image) onImageOpen([image], 0, trigger);
      }
    : undefined;

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
          onImageOpen={openSignatureImage}
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
