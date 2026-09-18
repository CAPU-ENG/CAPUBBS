import { buildGalleryHtml } from '../../utils/galleryTag.ts';

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
  return buildGalleryHtml({ title: title.trim(), images, height: imageHeight });
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
    if (header) header.hidden = false;
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

  return setEditorGalleryIndex(gallery, nextIndex);
}

export function setEditorGalleryIndex(gallery: HTMLElement, nextIndex: number) {
  const slides = Array.from(gallery.querySelectorAll<HTMLElement>('[data-capubbs-gallery-slide="true"]'));
  if (
    slides.length < 2
    || !Number.isSafeInteger(nextIndex)
    || nextIndex < 0
    || nextIndex >= slides.length
  ) return false;

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

export function ensureGalleryDisplayControls(container: ParentNode) {
  container.querySelectorAll<HTMLElement>('.capubbs-gallery').forEach((gallery) => {
    const stage = gallery.querySelector<HTMLElement>('.capubbs-gallery-stage');
    const slides = Array.from(gallery.querySelectorAll<HTMLElement>('[data-capubbs-gallery-slide="true"]'));
    if (!stage || slides.length === 0) return;

    let header = gallery.querySelector<HTMLElement>('.capubbs-gallery-header');
    if (!header) {
      header = document.createElement('header');
      header.className = 'capubbs-gallery-header';
      gallery.insertBefore(header, stage);
    }
    if (!header.querySelector('.capubbs-gallery-title')) {
      const title = document.createElement('figcaption');
      title.className = 'capubbs-gallery-title';
      header.append(title);
    }

    if (slides.length > 1 && !stage.querySelector('[data-capubbs-gallery-action="prev"]')) {
      stage.append(createGalleryNavigationControl('prev', '上一张图片'));
    }
    if (slides.length > 1 && !stage.querySelector('[data-capubbs-gallery-action="next"]')) {
      stage.append(createGalleryNavigationControl('next', '下一张图片'));
    }

    let footer = gallery.querySelector<HTMLElement>('.capubbs-gallery-footer');
    if (!footer) {
      footer = document.createElement('footer');
      footer.className = 'capubbs-gallery-footer';
      gallery.append(footer);
    }

    let captionsContainer = footer.querySelector<HTMLElement>('.capubbs-gallery-captions');
    if (!captionsContainer) {
      captionsContainer = document.createElement('div');
      captionsContainer.className = 'capubbs-gallery-captions';
      footer.prepend(captionsContainer);
    }
    const captions = Array.from(
      captionsContainer.querySelectorAll<HTMLElement>('[data-capubbs-gallery-caption="true"]'),
    );
    while (captions.length < slides.length) {
      const caption = document.createElement('span');
      caption.className = 'capubbs-gallery-caption';
      caption.dataset.capubbsGalleryCaption = 'true';
      captionsContainer.append(caption);
      captions.push(caption);
    }

    let count = footer.querySelector<HTMLElement>('.capubbs-gallery-count');
    if (!count) {
      count = document.createElement('span');
      count.className = 'capubbs-gallery-count';
      footer.append(count);
    }

    const storedIndex = Number.parseInt(gallery.dataset.capubbsGalleryIndex ?? '', 10);
    const activeIndex = slides.findIndex((slide) => slide.dataset.capubbsGalleryActive === 'true');
    const normalizedIndex = activeIndex >= 0
      ? activeIndex
      : Number.isSafeInteger(storedIndex) && storedIndex >= 0 && storedIndex < slides.length
        ? storedIndex
        : 0;
    gallery.dataset.capubbsGalleryIndex = String(normalizedIndex);
    gallery.setAttribute('role', 'region');
    gallery.setAttribute('tabindex', '0');
    if (!gallery.getAttribute('aria-label')) gallery.setAttribute('aria-label', '图廊');
    slides.forEach((slide, index) => setGalleryItemActive(slide, index === normalizedIndex));
    captions.forEach((caption, index) => setGalleryItemActive(caption, index === normalizedIndex));
    count.dataset.capubbsGalleryCurrent = String(normalizedIndex + 1);
    count.dataset.capubbsGalleryTotal = String(slides.length);
    count.setAttribute('aria-label', `第 ${normalizedIndex + 1} 张，共 ${slides.length} 张图片`);
  });
}

function setGalleryItemActive(item: HTMLElement, active: boolean) {
  item.dataset.capubbsGalleryActive = active ? 'true' : 'false';
  item.setAttribute('aria-hidden', active ? 'false' : 'true');
}

function createGalleryNavigationControl(direction: 'next' | 'prev', label: string) {
  const control = document.createElement('span');
  control.className = `capubbs-gallery-nav capubbs-gallery-nav-${direction}`;
  control.dataset.capubbsGalleryAction = direction;
  control.setAttribute('aria-label', label);
  control.setAttribute('role', 'button');
  control.setAttribute('tabindex', '0');
  return control;
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
