import type { ReactNode } from 'react';
import type {
  ForumMarkupImageChangeHandler,
  ForumMarkupImageOpenHandler,
} from './ForumMarkup';
import { ThreadHtmlContent } from './ThreadHtmlContent';

export function ThreadPostContent({
  bodyClassName = 'thread-floor-body',
  bodyFallback = null,
  bodyHtml,
  floor,
  isActivitySignupCanceled = false,
  onImageOpen,
  signatureClassName = 'thread-signature',
  signatureHtml,
  signatureText,
}: {
  bodyClassName?: string;
  bodyFallback?: ReactNode;
  bodyHtml?: string;
  floor: number;
  isActivitySignupCanceled?: boolean;
  onImageOpen?: ForumMarkupImageOpenHandler;
  signatureClassName?: string;
  signatureHtml?: string;
  signatureText?: string;
}) {
  const openSignatureImage: ForumMarkupImageOpenHandler | undefined = onImageOpen
    ? (images, imageIndex, trigger, onImageChange) => {
        const image = images[imageIndex];
        if (image) {
          const syncSignatureImage: ForumMarkupImageChangeHandler | undefined = onImageChange
            ? () => onImageChange(imageIndex)
            : undefined;
          onImageOpen([image], 0, trigger, syncSignatureImage);
        }
      }
    : undefined;

  return (
    <>
      {bodyHtml ? (
        <ThreadHtmlContent
          className={bodyClassName}
          floor={floor}
          html={bodyHtml}
          isActivitySignupCanceled={isActivitySignupCanceled}
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
