import { createGalleryElement, readGalleryTag } from './gallery-tag.js';

export function prepareLegacyGalleryTags(root) {
    root.querySelectorAll('gallery').forEach(tag => {
        const spec = readGalleryTag(tag);
        if (!spec) return;
        const gallery = createGalleryElement(spec, tag.ownerDocument);
        tag.replaceWith(gallery);
        const slides = Array.from(gallery.querySelectorAll('[data-capubbs-gallery-slide]'));
        const captions = Array.from(gallery.querySelectorAll('[data-capubbs-gallery-caption]'));
        const count = gallery.querySelector('.capubbs-gallery-count');
        let index = 0;
        let lightbox = null;
        function move(direction) {
            index = (index + direction + slides.length) % slides.length;
            gallery.dataset.capubbsGalleryIndex = String(index);
            slides.forEach((slide, i) => {
                slide.dataset.capubbsGalleryActive = String(i === index);
                slide.setAttribute('aria-hidden', String(i !== index));
                captions[i].dataset.capubbsGalleryActive = String(i === index);
                captions[i].setAttribute('aria-hidden', String(i !== index));
            });
            count.dataset.capubbsGalleryCurrent = String(index + 1);
            count.setAttribute('aria-label', '第 ' + (index + 1) + ' 张，共 ' + slides.length + ' 张图片');
            syncLightbox();
        }
        function syncLightbox() {
            if (!lightbox) return;
            const image = lightbox.querySelector('img');
            image.src = spec.images[index].url;
            image.alt = spec.images[index].alt;
            lightbox.querySelector('figcaption').textContent = spec.images[index].caption;
        }
        function openLightbox() {
            if (lightbox) return;
            lightbox = document.createElement('dialog');
            lightbox.className = 'capubbs-gallery-lightbox';
            lightbox.setAttribute('aria-label', spec.title || '图廊');
            const close = document.createElement('button');
            close.type = 'button';
            close.className = 'capubbs-gallery-lightbox-close';
            close.setAttribute('aria-label', '关闭图片');
            close.textContent = '×';
            close.onclick = () => lightbox.close();
            lightbox.append(close, document.createElement('img'), document.createElement('figcaption'));
            if (slides.length > 1) [-1, 1].forEach(direction => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'capubbs-gallery-lightbox-' + (direction < 0 ? 'prev' : 'next');
                button.setAttribute('aria-label', direction < 0 ? '上一张图片' : '下一张图片');
                button.textContent = direction < 0 ? '‹' : '›';
                button.onclick = () => move(direction);
                lightbox.append(button);
            });
            lightbox.onkeydown = event => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    event.preventDefault();
                    move(event.key === 'ArrowLeft' ? -1 : 1);
                }
            };
            lightbox.onclose = () => {
                lightbox.remove();
                lightbox = null;
                gallery.focus();
            };
            lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
            document.body.append(lightbox);
            syncLightbox();
            lightbox.showModal();
        }
        gallery.addEventListener('click', event => {
            const action = event.target.closest('[data-capubbs-gallery-action]')?.dataset.capubbsGalleryAction;
            if (action) { event.preventDefault(); move(action === 'prev' ? -1 : 1); }
            else if (event.target.closest('.capubbs-gallery-slide > img')) openLightbox();
        });
        gallery.querySelectorAll('.capubbs-gallery-slide > img').forEach(image => {
            image.tabIndex = 0;
            image.setAttribute('role', 'button');
        });
        gallery.addEventListener('keydown', event => {
            const action = event.target.closest('[data-capubbs-gallery-action]')?.dataset.capubbsGalleryAction;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
            } else if (event.key === 'Enter' || event.key === ' ') {
                if (action) { event.preventDefault(); move(action === 'prev' ? -1 : 1); }
                else if (event.target.matches('.capubbs-gallery-slide > img')) { event.preventDefault(); openLightbox(); }
            }
        });
    });
}

function init() {
    document.querySelectorAll('.textblock').forEach(prepareLegacyGalleryTags);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
