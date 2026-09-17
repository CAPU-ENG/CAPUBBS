export type GalleryImageRole = 'current' | 'adjacent' | 'deferred';

// Self-contained: the HTML frame bridge also embeds this function.
export function getGalleryImageState(image: HTMLImageElement): {
  gallery: HTMLElement;
  role: GalleryImageRole;
} | null {
  const gallery = image.closest<HTMLElement>('.capubbs-gallery');
  const slide = image.closest('[data-capubbs-gallery-slide="true"]');
  if (!gallery || !slide) return null;
  const slides = Array.from(gallery.querySelectorAll('[data-capubbs-gallery-slide="true"]'));
  const index = slides.indexOf(slide);
  if (index < 0) return null;
  const activeIndex = slides.findIndex((item) => item.getAttribute('data-capubbs-gallery-active') === 'true');
  const storedIndex = Number.parseInt(gallery.getAttribute('data-capubbs-gallery-index') ?? '0', 10);
  const currentIndex = activeIndex >= 0 ? activeIndex
    : Number.isSafeInteger(storedIndex) && storedIndex >= 0 && storedIndex < slides.length ? storedIndex : 0;
  const distance = Math.abs(index - currentIndex);
  return {
    gallery,
    role: distance === 0 ? 'current'
      : distance === 1 || distance === slides.length - 1 ? 'adjacent' : 'deferred',
  };
}

// Remove sources before inserting the markup; native lazy loading alone can
// still download every slide in a nearby gallery.
export function deferGalleryImageSources(html: string) {
  if (!html.includes('capubbs-gallery')) return html;
  const template = document.createElement('template');
  template.innerHTML = html;
  template.content.querySelectorAll<HTMLImageElement>('.capubbs-gallery img').forEach(deferGalleryImage);
  return template.innerHTML;
}

export function deferGalleryImage(image: HTMLImageElement) {
  if (!getGalleryImageState(image)) return;
  const src = image.getAttribute('src');
  if (src !== null) image.dataset.capubbsGallerySrc = src;
  image.removeAttribute('src');
  [image, ...Array.from(image.closest('picture')?.querySelectorAll('source') ?? [])].forEach((source) => {
    if (!source.hasAttribute('srcset')) return;
    source.setAttribute('data-capubbs-gallery-srcset', source.getAttribute('srcset') ?? '');
    source.removeAttribute('srcset');
  });
}

export function loadGalleryImage(image: HTMLImageElement, priority: 'high' | 'low' = 'high') {
  image.fetchPriority = priority;
  image.loading = 'eager';
  [image, ...Array.from(image.closest('picture')?.querySelectorAll('source') ?? [])].forEach((source) => {
    const srcset = source.getAttribute('data-capubbs-gallery-srcset');
    if (srcset !== null && !source.hasAttribute('srcset')) source.setAttribute('srcset', srcset);
  });
  const src = image.dataset.capubbsGallerySrc;
  if (src && !image.getAttribute('src')) image.setAttribute('src', src);
}

export function preloadVisibleGalleryImages(container: HTMLElement) {
  const galleries = Array.from(container.querySelectorAll<HTMLElement>('.capubbs-gallery'));
  if (!galleries.length) return () => {};
  let disposed = false;
  const refresh = () => {
    if (disposed) return;
    const current: HTMLImageElement[] = [];
    const adjacent: HTMLImageElement[] = [];
    galleries.forEach((gallery) => {
      const bounds = gallery.getBoundingClientRect();
      const visible = bounds.bottom > bounds.top && bounds.right > bounds.left
        && bounds.bottom > 0 && bounds.top < window.innerHeight
        && bounds.right > 0 && bounds.left < window.innerWidth;
      gallery.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
        image.fetchPriority = 'low';
        const state = getGalleryImageState(image);
        if (!visible || state?.role === 'deferred') {
          // Native gallery requests also need to yield when the viewport or
          // selected slide changes. Keep completed images for instant revisits.
          if (!image.complete && image.hasAttribute('src')) deferGalleryImage(image);
          return;
        }
        if (state?.role === 'current') current.push(image);
        else if (state?.role === 'adjacent') adjacent.push(image);
      });
    });
    current.forEach((image) => loadGalleryImage(image, 'high'));
    adjacent.forEach((image) => loadGalleryImage(image, 'low'));
  };
  const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(refresh);
  galleries.forEach((gallery) => observer?.observe(gallery));
  const mutations = new MutationObserver(refresh);
  mutations.observe(container, {
    subtree: true, childList: true, attributes: true,
    attributeFilter: ['data-capubbs-gallery-index', 'data-capubbs-gallery-active'],
  });
  if (!observer) window.addEventListener('scroll', refresh, { passive: true });
  window.addEventListener('resize', refresh);
  refresh();
  return () => {
    disposed = true;
    observer?.disconnect();
    mutations.disconnect();
    window.removeEventListener('scroll', refresh);
    window.removeEventListener('resize', refresh);
  };
}
