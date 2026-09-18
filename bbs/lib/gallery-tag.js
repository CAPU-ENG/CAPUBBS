// Shared by the new forum bundle and the legacy forum's module entry.
// Only declarative gallery data is stored; controls are built at render time.
export function galleryHeight(value) {
    const text = String(value ?? '').trim();
    return /^\d+(?:\.\d+)?$/.test(text) && Number(text) > 0 && Number.isFinite(Number(text))
        ? Math.round(Number(text)) || undefined : undefined;
}

export function readGalleryTag(tag) {
    if (tag.closest('pre, code, textarea, template') || tag.querySelector('gallery')) return null;
    // Reject unexpected content rather than deleting it or absorbing following prose.
    if (Array.from(tag.childNodes).some(node => node.nodeType === 3 ? node.textContent.trim()
        : node.nodeType === 8 ? false : !['IMG', 'BR'].includes(node.nodeName))) return null;
    const images = Array.from(tag.children).filter(node => node.tagName === 'IMG').flatMap(image => {
        const url = (image.getAttribute('src') || '').trim();
        if (!url || /^(?:javascript|vbscript):/i.test(url.replace(/[\s\u0000-\u001f]/g, ''))) return [];
        return [{ url, alt: image.getAttribute('alt') || '', caption: image.getAttribute('caption') || '' }];
    });
    if (!images.length) return null;
    return { title: (tag.getAttribute('title') || '').trim(), height: galleryHeight(tag.getAttribute('height')), images };
}

function escapeHtml(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function buildGalleryHtml(spec) {
    const title = escapeHtml(spec.title);
    const height = galleryHeight(spec.height);
    const controls = spec.images.length > 1 ? ['prev', 'next'].map(direction =>
        `<span class="capubbs-gallery-nav capubbs-gallery-nav-${direction}" data-capubbs-gallery-action="${direction}" role="button" tabindex="0" aria-label="${direction === 'prev' ? '上一张图片' : '下一张图片'}"></span>`).join('') : '';
    const slides = spec.images.map((image, index) =>
        `<figure class="capubbs-gallery-slide" data-capubbs-gallery-slide="true" data-capubbs-gallery-active="${index === 0}" aria-hidden="${index !== 0}"><img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt)}"></figure>`).join('');
    const captions = spec.images.map((image, index) =>
        `<span class="capubbs-gallery-caption" data-capubbs-gallery-caption="true" data-capubbs-gallery-active="${index === 0}" aria-hidden="${index !== 0}">${escapeHtml(image.caption)}</span>`).join('');
    return `<figure class="capubbs-gallery" data-capubbs-gallery-tag="true" data-capubbs-gallery-index="0" contenteditable="false" role="region" tabindex="0" aria-label="${title ? '图廊：' + title : '图廊'}"${height ? ` style="--capubbs-gallery-image-height: ${height}px"` : ''}>`
        + `<header class="capubbs-gallery-header"><figcaption class="capubbs-gallery-title">${title}</figcaption></header>`
        + `<div class="capubbs-gallery-stage">${slides}${controls}</div>`
        + `<footer class="capubbs-gallery-footer"><div class="capubbs-gallery-captions">${captions}</div>`
        + `<span class="capubbs-gallery-count" data-capubbs-gallery-current="1" data-capubbs-gallery-total="${spec.images.length}" aria-label="第 1 张，共 ${spec.images.length} 张图片"></span></footer></figure>`;
}

export function createGalleryElement(spec, doc = document) {
    const template = doc.createElement('template');
    template.innerHTML = buildGalleryHtml(spec);
    return template.content.firstElementChild;
}

export function createGalleryTag(spec, doc = document) {
    const tag = doc.createElement('gallery');
    if (spec.title) tag.setAttribute('title', spec.title);
    const height = galleryHeight(spec.height);
    if (height) tag.setAttribute('height', String(height));
    spec.images.forEach(image => {
        const img = doc.createElement('img');
        img.setAttribute('src', image.url);
        if (image.caption) img.setAttribute('caption', image.caption);
        if (image.alt) img.setAttribute('alt', image.alt);
        tag.appendChild(img);
    });
    return tag;
}

export function expandGalleryTags(html) {
    if (!/<gallery\b/i.test(html)) return html;
    // Tokenize quoted attributes and skip literal examples/raw-text elements. Replace
    // only explicitly closed, non-nested galleries; leave all surrounding bytes alone.
    const tokens = /<!--[\s\S]*?-->|<(?:[^"'<>]|"[^"]*"|'[^']*')*>/g;
    let match, start = -1, depth = 0, nested = false, cursor = 0, result = '';
    while ((match = tokens.exec(html))) {
        const name = /^<(\/)?\s*([\w:-]+)/.exec(match[0]);
        if (!name) continue;
        const closing = Boolean(name[1]);
        const tagName = name[2].toLowerCase();
        if (!closing && /^(script|style|textarea|title|pre|code|template)$/.test(tagName)) {
            const end = new RegExp('</' + tagName + '\\s*>', 'ig');
            end.lastIndex = tokens.lastIndex;
            const found = end.exec(html);
            tokens.lastIndex = found ? end.lastIndex : html.length;
            continue;
        }
        if (tagName !== 'gallery') continue;
        if (!closing) {
            if (depth === 0) { start = match.index; nested = false; }
            else nested = true;
            depth++;
        } else if (depth > 0 && --depth === 0 && !nested) {
            const template = document.createElement('template');
            template.innerHTML = html.slice(start, tokens.lastIndex);
            const tag = template.content.firstElementChild;
            const spec = tag?.tagName === 'GALLERY' ? readGalleryTag(tag) : null;
            if (!spec) continue;
            result += html.slice(cursor, start) + createGalleryElement(spec).outerHTML;
            cursor = tokens.lastIndex;
        }
    }
    return result + html.slice(cursor);
}

export function serializeGalleryTags(html) {
    if (!html.includes('data-capubbs-gallery-tag')) return html;
    const template = document.createElement('template');
    template.innerHTML = html;
    template.content.querySelectorAll('.capubbs-gallery[data-capubbs-gallery-tag="true"]').forEach(gallery => {
        if (gallery.closest('pre, code')) return;
        const captions = gallery.querySelectorAll('[data-capubbs-gallery-caption="true"]');
        const images = Array.from(gallery.querySelectorAll('[data-capubbs-gallery-slide="true"] img')).map((image, index) => ({
            url: image.getAttribute('src') || image.getAttribute('data-capubbs-gallery-src') || '',
            alt: image.getAttribute('alt') || '',
            caption: captions[index]?.textContent || '',
        }));
        if (!images.length || images.some(image => !image.url)) return;
        gallery.replaceWith(createGalleryTag({
            title: gallery.querySelector('.capubbs-gallery-title')?.textContent || '',
            height: gallery.style.getPropertyValue('--capubbs-gallery-image-height').replace(/px$/, ''),
            images,
        }));
    });
    return template.innerHTML;
}
