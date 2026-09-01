import { Download, Paperclip } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ThreadAttachment } from '../../data/thread';
import type {
  ForumMarkupImageChangeHandler,
  ForumMarkupImageOpenHandler,
} from './ForumMarkup';
import { ThreadHtmlContent } from './ThreadHtmlContent';

export function ThreadPostContent({
  attachments = [],
  bodyClassName = 'thread-floor-body',
  bodyFallback = null,
  bodyHtml,
  floor,
  isActivitySignupCanceled = false,
  onImageOpen,
  onIsolatedTextSelection,
  signatureClassName = 'thread-signature',
  signatureHtml,
  signatureText,
}: {
  attachments?: readonly ThreadAttachment[];
  bodyClassName?: string;
  bodyFallback?: ReactNode;
  bodyHtml?: string;
  floor: number;
  isActivitySignupCanceled?: boolean;
  onImageOpen?: ForumMarkupImageOpenHandler;
  onIsolatedTextSelection?: (text: string) => void;
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
          onIsolatedTextSelection={onIsolatedTextSelection}
          variant="floor"
        />
      ) : bodyFallback}

      <ThreadAttachments attachments={attachments} />

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

function ThreadAttachments({ attachments }: { attachments: readonly ThreadAttachment[] }) {
  if (attachments.length === 0) return null;

  return (
    <section aria-label="附件" className="thread-attachments">
      <header className="thread-attachments-heading">
        <Paperclip aria-hidden="true" size={14} />
        <span>附件</span>
        <small>{attachments.length}</small>
      </header>
      <ul>
        {attachments.map((attachment) => {
          const content = (
            <>
              <span className="thread-attachment-name">{attachment.name}</span>
              <small>{formatAttachmentDetails(attachment)}</small>
              {attachment.exists !== false && <Download aria-hidden="true" size={15} />}
            </>
          );

          return (
            <li key={attachment.id}>
              {attachment.exists === false ? (
                <div aria-disabled="true" className="thread-attachment-link is-unavailable">{content}</div>
              ) : (
                <a
                  className="thread-attachment-link"
                  download={attachment.name}
                  href={attachment.downloadHref || `/bbs/download/?id=${encodeURIComponent(attachment.id)}`}
                >
                  {content}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function formatAttachmentDetails(attachment: ThreadAttachment) {
  if (attachment.exists === false) return '文件不可用';

  const details = [
    formatAttachmentSize(attachment.size),
    (attachment.price ?? 0) > 0 ? '付费附件' : '免费',
  ];
  if (attachment.downloadCount !== undefined) details.push(`下载 ${attachment.downloadCount} 次`);
  return details.join(' · ');
}

function formatAttachmentSize(bytes: number) {
  if (bytes <= 0) return '大小未知';
  if (bytes < 1024) return `${bytes} B`;

  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = -1;
  do {
    value /= 1024;
    unitIndex += 1;
  } while (value >= 1024 && unitIndex < units.length - 1);

  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}
