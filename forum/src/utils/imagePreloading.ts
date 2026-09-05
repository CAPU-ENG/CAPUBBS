// Keep native lazy loading as a fallback, but start nearby images early enough
// to download while the reader is still scrolling towards them.
const pendingImages = new Map<Element, Set<HTMLImageElement>>();
let observer: IntersectionObserver | undefined;
let viewportObserver: IntersectionObserver | undefined;
const trackedImages = new Set<HTMLImageElement>();
let preloadMargin = 0;

function setImagePriority(image: HTMLImageElement, visible: boolean) {
  image.fetchPriority = visible ? 'high' : 'low';
  if (visible) image.loading = 'eager';
}

function loadImages(target: Element) {
  pendingImages.get(target)?.forEach((image) => { image.loading = 'eager'; });
  pendingImages.delete(target);
  observer?.unobserve(target);
}

export function preloadNearbyImages(container: HTMLElement) {
  // Include images already promoted to eager on earlier renders: they still
  // need priority updates after a jump or a feed refresh.
  const images = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
  if (!images.length) return () => {};

  if (typeof IntersectionObserver === 'undefined') {
    images.forEach((image) => {
      setImagePriority(image, isInViewport(image.getBoundingClientRect()));
      image.loading = 'eager';
    });
    return () => {};
  }

  if (!observer) {
    // Images take about 3 seconds to load. Four screens leave roughly one
    // second of headroom at one screen per second; keep that runway on mobile.
    preloadMargin = Math.max(3600, window.innerHeight * 4);
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) loadImages(entry.target);
      });
    }, { rootMargin: `${preloadMargin}px 0px`, threshold: 0 });
    viewportObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const image = entry.target as HTMLImageElement;
        if (trackedImages.has(image)) setImagePriority(image, entry.isIntersecting);
      });
    }, { rootMargin: '0px', threshold: 0 });
  }

  const targets = new Set<Element>();
  // Assign priority before releasing any nearby lazy requests. Observe each
  // slide separately so hidden gallery images never inherit high priority.
  images.forEach((image) => {
    setImagePriority(image, isInViewport(image.getBoundingClientRect()));
    trackedImages.add(image);
    viewportObserver?.observe(image);
  });
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
    images.forEach((image) => {
      trackedImages.delete(image);
      viewportObserver?.unobserve(image);
    });
    targets.forEach((target) => {
      pendingImages.delete(target);
      observer?.unobserve(target);
    });
    if (!trackedImages.size) {
      observer?.disconnect();
      viewportObserver?.disconnect();
      observer = undefined;
      viewportObserver = undefined;
    }
  };
}

function isInViewport(bounds: DOMRectReadOnly) {
  return bounds.width > 0 && bounds.height > 0
    && bounds.bottom > 0 && bounds.top < window.innerHeight
    && bounds.right > 0 && bounds.left < window.innerWidth;
}
