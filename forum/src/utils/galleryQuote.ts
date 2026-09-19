import { appendFloorQuote, type FloorQuoteTarget } from './floorQuote.ts';
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
    button.innerHTML = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg><span>引用</span>';
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

export function appendGalleryImageQuote(
  current: RichTextEditorValue,
  image: GalleryImageQuote,
  target: FloorQuoteTarget,
): RichTextEditorValue {
  let url: URL;
  try { url = new URL(image.src); } catch { return current; }
  if (!['http:', 'https:'].includes(url.protocol)) return current;
  const label = [image.title.trim(), image.caption.trim()].filter(Boolean).join('-');
  const text = label ? `【${label}】` : '';
  const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const html = `<p class="capubbs-floor-quote-content"><img src="${escapeHtml(url.href)}" alt=""></p>${text ? `<p class="capubbs-floor-quote-content">${escapeHtml(text)}</p>` : ''}`;
  const source = url.href.replace(/[<>\\]/g, (character) => encodeURIComponent(character));
  const caption = text.replace(/([\\`*_{}\[\]()#+.!|>~-])/g, '\\$1');
  return appendFloorQuote(current, target, {
    html,
    markdown: `![](<${source}>)${caption ? `\n\n${caption}` : ''}`,
  });
}
