import type { RichTextEditorValue } from '../components/editor/RichTextEditor';

export type GalleryImageQuote = { src: string; title: string; caption: string };

// Self-contained so the isolated HTML bridge can use exactly the same controls.
export function ensureGalleryQuoteControls(container: ParentNode, onQuote: (image: GalleryImageQuote) => void) {
  container.querySelectorAll<HTMLElement>('.capubbs-gallery').forEach((gallery) => {
    const stage = gallery.querySelector('.capubbs-gallery-stage');
    if (!stage || stage.querySelector('.capubbs-gallery-quote')) return;
    const button = gallery.ownerDocument.createElement('button');
    button.type = 'button';
    button.className = 'capubbs-gallery-quote';
    button.textContent = '引用';
    button.setAttribute('aria-label', '引用图片');
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const slides = Array.from(gallery.querySelectorAll('[data-capubbs-gallery-slide="true"]'));
      const activeIndex = slides.findIndex((slide) => slide.getAttribute('data-capubbs-gallery-active') === 'true');
      const index = activeIndex >= 0 ? activeIndex : 0;
      const image = slides[index]?.querySelector('img');
      if (!image) return;
      const source = image.getAttribute('data-capubbs-image-resource-src')
        || image.getAttribute('data-capubbs-gallery-src') || image.getAttribute('src');
      if (!source) return;
      let url: URL;
      try { url = new URL(source, image.baseURI); } catch { return; }
      if (!['http:', 'https:'].includes(url.protocol)) return;
      const captions = gallery.querySelectorAll('[data-capubbs-gallery-caption="true"]');
      onQuote({
        src: url.href,
        title: gallery.querySelector('.capubbs-gallery-title')?.textContent?.trim() ?? '',
        caption: captions[index]?.textContent?.trim() ?? '',
      });
    });
    stage.appendChild(button);
  });
}

export function appendGalleryImageQuote(current: RichTextEditorValue, image: GalleryImageQuote): RichTextEditorValue {
  let url: URL;
  try { url = new URL(image.src); } catch { return current; }
  if (!['http:', 'https:'].includes(url.protocol)) return current;
  const label = [image.title.trim(), image.caption.trim()].filter(Boolean).join('-');
  const text = label ? `【${label}】` : '';
  const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const markup = `<p><img src="${escapeHtml(url.href)}" alt=""></p>${text ? `<p>${escapeHtml(text)}</p>` : ''}`;
  if (current.mode === 'markdown') {
    const source = url.href.replace(/[<>\\]/g, (character) => encodeURIComponent(character));
    const caption = text.replace(/([\\`*_{}\[\]()#+.!|>~-])/g, '\\$1');
    const separator = current.content.trim() ? '\n\n' : '';
    return { ...current, content: `${current.content}${separator}![](<${source}>)${caption ? `\n\n${caption}` : ''}\n\n` };
  }
  const suffix = current.mode === 'rich' ? '<p><br></p>' : '\n\n';
  const separator = current.content.trim() ? suffix : '';
  return { ...current, content: `${current.content}${separator}${markup}${suffix}` };
}
