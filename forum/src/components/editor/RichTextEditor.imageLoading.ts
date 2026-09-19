// The editor uses the same image skeleton styles as post content, but its DOM
// also changes outside React (uploads, paste, and gallery replacement).
export function observeEditorImageLoading(editor: HTMLElement) {
  const hasSource = (image: HTMLImageElement) => Boolean(
    image.getAttribute('src') || image.getAttribute('srcset'),
  );
  const syncImage = (image: HTMLImageElement) => {
    if (image.complete && hasSource(image)) {
      image.dataset.capubbsImageLoaded = 'true';
    } else {
      image.removeAttribute('data-capubbs-image-loaded');
    }
  };
  const syncImages = (root: Element) => {
    if (root instanceof HTMLImageElement) syncImage(root);
    root.querySelectorAll('img').forEach(syncImage);
  };
  const handleSettled = (event: Event) => {
    const image = event.target;
    if (image instanceof HTMLImageElement && hasSource(image)) {
      image.dataset.capubbsImageLoaded = 'true';
    }
  };

  // Image load/error events do not bubble; capture also covers later insertions.
  editor.addEventListener('load', handleSettled, true);
  editor.addEventListener('error', handleSettled, true);
  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.type === 'attributes' && record.target instanceof HTMLImageElement) {
        syncImage(record.target);
      }
      record.addedNodes.forEach((node) => {
        if (node instanceof Element) syncImages(node);
      });
    });
  });
  observer.observe(editor, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset'],
  });
  // Cached and restored images may have finished before listeners were attached.
  syncImages(editor);

  return () => {
    observer.disconnect();
    editor.removeEventListener('load', handleSettled, true);
    editor.removeEventListener('error', handleSettled, true);
  };
}
