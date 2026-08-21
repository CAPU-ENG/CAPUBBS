export type EditorGalleryImage = {
  alt: string;
  caption: string;
  url: string;
};

export function buildEditorGalleryHtml(title: string, images: EditorGalleryImage[]) {
  const normalizedTitle = title.trim();
  const galleryLabel = normalizedTitle ? `图廊：${normalizedTitle}` : '图廊';

  return [
    `<figure class="capubbs-gallery" contenteditable="false" data-capubbs-gallery-index="0" role="region" tabindex="0" aria-label="${escapeGalleryAttribute(galleryLabel)}">`,
    '<header class="capubbs-gallery-header">',
    normalizedTitle
      ? `<figcaption class="capubbs-gallery-title">${escapeGalleryHtml(normalizedTitle)}</figcaption>`
      : '',
    `<span class="capubbs-gallery-count" data-capubbs-gallery-total="${images.length}" aria-label="共 ${images.length} 张图片"></span>`,
    '</header>',
    '<div class="capubbs-gallery-stage">',
    ...images.map((image, index) => [
      `<figure class="capubbs-gallery-slide" data-capubbs-gallery-slide="true" data-capubbs-gallery-active="${index === 0 ? 'true' : 'false'}" aria-hidden="${index === 0 ? 'false' : 'true'}">`,
      `<img src="${escapeGalleryAttribute(image.url)}" alt="${escapeGalleryAttribute(image.alt)}">`,
      image.caption.trim()
        ? `<figcaption class="capubbs-gallery-caption">${escapeGalleryHtml(image.caption.trim())}</figcaption>`
        : '',
      '</figure>',
    ].join('')),
    '</div>',
    '<span class="capubbs-gallery-nav capubbs-gallery-nav-prev" data-capubbs-gallery-action="prev" role="button" tabindex="0" aria-label="上一张图片"></span>',
    '<span class="capubbs-gallery-nav capubbs-gallery-nav-next" data-capubbs-gallery-action="next" role="button" tabindex="0" aria-label="下一张图片"></span>',
    '</figure>',
  ].join('');
}

export function moveEditorGallery(target: Element, direction: 'next' | 'prev') {
  const gallery = target.closest<HTMLElement>('.capubbs-gallery');
  if (!gallery) return false;

  const slides = Array.from(gallery.querySelectorAll<HTMLElement>('[data-capubbs-gallery-slide="true"]'));
  if (slides.length < 2) return false;

  const storedIndex = Number.parseInt(gallery.dataset.capubbsGalleryIndex ?? '0', 10);
  const activeIndex = slides.findIndex((slide) => slide.dataset.capubbsGalleryActive === 'true');
  const currentIndex = activeIndex >= 0
    ? activeIndex
    : Number.isSafeInteger(storedIndex) && storedIndex >= 0 && storedIndex < slides.length
      ? storedIndex
      : 0;
  const offset = direction === 'next' ? 1 : -1;
  const nextIndex = (currentIndex + offset + slides.length) % slides.length;

  gallery.dataset.capubbsGalleryIndex = String(nextIndex);
  slides.forEach((slide, index) => {
    const isActive = index === nextIndex;
    slide.dataset.capubbsGalleryActive = isActive ? 'true' : 'false';
    slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  });

  return true;
}

export function getEditorGalleryAction(target: EventTarget | null): 'next' | 'prev' | null {
  if (!(target instanceof Element)) return null;
  const button = target.closest<HTMLElement>('[data-capubbs-gallery-action]');
  const action = button?.dataset.capubbsGalleryAction;
  return action === 'next' || action === 'prev' ? action : null;
}

function escapeGalleryHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeGalleryAttribute(value: string) {
  return escapeGalleryHtml(value).replace(/`/g, '&#096;');
}
