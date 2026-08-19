import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { ForumMarkupImage } from './ForumMarkup';

export function ThreadImageLightbox({
  image,
  onClose,
}: {
  image: ForumMarkupImage;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key === 'Tab') {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <div
      className="thread-image-lightbox-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <figure
        aria-label={image.alt ? `图片预览：${image.alt}` : '图片预览'}
        aria-modal="true"
        className="thread-image-lightbox"
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
        <img alt={image.alt} src={image.src} />
        {image.alt && <figcaption>{image.alt}</figcaption>}
      </figure>
    </div>,
    document.body,
  );
}
