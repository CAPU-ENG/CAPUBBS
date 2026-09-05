// Keep native lazy loading as a fallback, but start nearby images early enough
// to download while the reader is still scrolling towards them.
const pendingImages = new Map<Element, Set<HTMLImageElement>>();
let observer: IntersectionObserver | undefined;
let preloadMargin = 0;

function loadImages(target: Element) {
  pendingImages.get(target)?.forEach((image) => { image.loading = 'eager'; });
  pendingImages.delete(target);
  observer?.unobserve(target);
}

export function preloadNearbyImages(container: HTMLElement) {
  const images = Array.from(container.querySelectorAll<HTMLImageElement>('img[loading="lazy"]'));
  if (!images.length) return () => {};

  if (typeof IntersectionObserver === 'undefined') {
    images.forEach((image) => { image.loading = 'eager'; });
    return () => {};
  }

  if (!observer) {
    preloadMargin = Math.max(1600, window.innerHeight * 2);
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) loadImages(entry.target);
      });
    }, { rootMargin: `${preloadMargin}px 0px`, threshold: 0 });
  }

  const targets = new Set<Element>();
  images.forEach((image) => {
    if (image.complete && image.naturalWidth > 0) return;
    // Hidden slides cannot intersect the viewport; preload the whole gallery
    // when its visible container approaches instead.
    const target = image.closest('.capubbs-gallery') ?? image;
    const pending = pendingImages.get(target) ?? new Set<HTMLImageElement>();
    pending.add(image);
    pendingImages.set(target, pending);
    targets.add(target);
  });

  targets.forEach((target) => {
    const bounds = target.getBoundingClientRect();
    if (
      (bounds.width > 0 || bounds.height > 0)
      && bounds.bottom >= -preloadMargin
      && bounds.top <= window.innerHeight + preloadMargin
      && bounds.right >= 0
      && bounds.left <= window.innerWidth
    ) {
      loadImages(target);
    } else {
      observer?.observe(target);
    }
  });

  return () => {
    targets.forEach((target) => {
      pendingImages.delete(target);
      observer?.unobserve(target);
    });
    if (!pendingImages.size) {
      observer?.disconnect();
      observer = undefined;
    }
  };
}
