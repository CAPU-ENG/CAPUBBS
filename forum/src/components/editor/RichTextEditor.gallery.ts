export type EditorGalleryImage = {
  alt: string;
  caption: string;
  url: string;
};

export type EditorGallerySnapshot = {
  images: EditorGalleryImage[];
  title: string;
};

export function buildEditorGalleryHtml(title: string, images: EditorGalleryImage[], imageHeight?: number) {
  const normalizedTitle = title.trim();
  const galleryLabel = normalizedTitle ? `图廊：${normalizedTitle}` : '图廊';
  const heightStyle = imageHeight && Number.isFinite(imageHeight)
    ? ` style="--capubbs-gallery-image-height: ${Math.round(imageHeight)}px"`
    : '';

  return [
    `<figure class="capubbs-gallery"${heightStyle} contenteditable="false" data-capubbs-gallery-index="0" role="region" tabindex="0" aria-label="${escapeGalleryAttribute(galleryLabel)}">`,
    '<header class="capubbs-gallery-header">',
    `<figcaption class="capubbs-gallery-title">${escapeGalleryHtml(normalizedTitle)}</figcaption>`,
    '</header>',
    '<div class="capubbs-gallery-stage">',
    ...images.map((image, index) => [
      `<figure class="capubbs-gallery-slide" data-capubbs-gallery-slide="true" data-capubbs-gallery-active="${index === 0 ? 'true' : 'false'}" aria-hidden="${index === 0 ? 'false' : 'true'}">`,
      `<img src="${escapeGalleryAttribute(image.url)}" alt="${escapeGalleryAttribute(image.alt)}">`,
      '</figure>',
    ].join('')),
    '<span class="capubbs-gallery-nav capubbs-gallery-nav-prev" data-capubbs-gallery-action="prev" role="button" tabindex="0" aria-label="上一张图片"></span>',
    '<span class="capubbs-gallery-nav capubbs-gallery-nav-next" data-capubbs-gallery-action="next" role="button" tabindex="0" aria-label="下一张图片"></span>',
    '</div>',
    '<footer class="capubbs-gallery-footer">',
    '<div class="capubbs-gallery-captions">',
    ...images.map((image, index) => (
      `<span class="capubbs-gallery-caption" data-capubbs-gallery-caption="true" data-capubbs-gallery-active="${index === 0 ? 'true' : 'false'}" aria-hidden="${index === 0 ? 'false' : 'true'}">${escapeGalleryHtml(image.caption.trim())}</span>`
    )),
    '</div>',
    `<span class="capubbs-gallery-count" data-capubbs-gallery-current="1" data-capubbs-gallery-total="${images.length}" aria-label="第 1 张，共 ${images.length} 张图片"></span>`,
    '</footer>',
    '</figure>',
  ].join('');
}

export function readEditorGallery(gallery: HTMLElement): EditorGallerySnapshot {
  const title = gallery.querySelector<HTMLElement>('.capubbs-gallery-title')?.textContent?.trim() ?? '';
  const slides = Array.from(gallery.querySelectorAll<HTMLElement>('[data-capubbs-gallery-slide="true"]'));
  const footerCaptions = Array.from(
    gallery.querySelectorAll<HTMLElement>('[data-capubbs-gallery-caption="true"]'),
  );

  return {
    images: slides.flatMap((slide, index) => {
      const image = slide.querySelector<HTMLImageElement>('img');
      if (!image?.getAttribute('src')) return [];

      const caption = footerCaptions[index]?.textContent
        ?? slide.querySelector<HTMLElement>('.capubbs-gallery-caption')?.textContent
        ?? '';

      return [{
        alt: image.getAttribute('alt')?.trim() || '图片',
        caption: caption.trim(),
        url: image.getAttribute('src') ?? '',
      }];
    }),
    title,
  };
}

export function ensureEditorGalleryEditControls(container: HTMLElement) {
  container.querySelectorAll<HTMLElement>('.capubbs-gallery').forEach((gallery) => {
    const header = gallery.querySelector<HTMLElement>('.capubbs-gallery-header');
    if (header && !gallery.querySelector('[data-capubbs-gallery-edit="true"]')) {
      const editControl = document.createElement('span');
      editControl.className = 'capubbs-gallery-edit capubbs-gallery-editor-control';
      editControl.dataset.capubbsGalleryEdit = 'true';
      editControl.setAttribute('aria-label', '编辑图廊');
      editControl.setAttribute('role', 'button');
      editControl.setAttribute('tabindex', '0');
      header.append(editControl);
    }

    if (!gallery.querySelector('[data-capubbs-gallery-resize="true"]')) {
      const resizeControl = document.createElement('span');
      resizeControl.className = 'capubbs-gallery-resize capubbs-gallery-editor-control';
      resizeControl.dataset.capubbsGalleryResize = 'true';
      resizeControl.setAttribute('aria-label', '调整图廊高度');
      resizeControl.setAttribute('aria-orientation', 'horizontal');
      resizeControl.setAttribute('role', 'separator');
      resizeControl.setAttribute('tabindex', '0');
      gallery.append(resizeControl);
    }
  });
}

export function stripEditorGalleryEditControls(html: string) {
  if (!html.includes('capubbs-gallery-editor-control') && !html.includes('capubbs-gallery-edit')) return html;
  const container = document.createElement('div');
  container.innerHTML = html;
  container.querySelectorAll('.capubbs-gallery-editor-control, .capubbs-gallery-edit').forEach((control) => control.remove());
  return container.innerHTML;
}

export function getEditorGalleryImageHeight(gallery: HTMLElement) {
  const value = Number.parseFloat(gallery.style.getPropertyValue('--capubbs-gallery-image-height'));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export function getEditorGalleryResizeTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const resizeControl = target.closest<HTMLElement>('[data-capubbs-gallery-resize="true"]');
  const gallery = resizeControl?.closest<HTMLElement>('.capubbs-gallery');
  return resizeControl && gallery ? { gallery, resizeControl } : null;
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
  const captions = Array.from(
    gallery.querySelectorAll<HTMLElement>('[data-capubbs-gallery-caption="true"]'),
  );
  captions.forEach((caption, index) => {
    const isActive = index === nextIndex;
    caption.dataset.capubbsGalleryActive = isActive ? 'true' : 'false';
    caption.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  });
  const count = gallery.querySelector<HTMLElement>('.capubbs-gallery-count');
  if (count) {
    count.dataset.capubbsGalleryCurrent = String(nextIndex + 1);
    count.setAttribute('aria-label', `第 ${nextIndex + 1} 张，共 ${slides.length} 张图片`);
  }

  return true;
}

export function getEditorGalleryEditTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const editControl = target.closest<HTMLElement>('[data-capubbs-gallery-edit="true"]');
  return editControl?.closest<HTMLElement>('.capubbs-gallery') ?? null;
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
