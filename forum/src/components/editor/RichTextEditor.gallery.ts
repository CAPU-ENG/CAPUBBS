export type EditorGalleryImage = {
  alt: string;
  caption: string;
  url: string;
};

export type EditorGallerySnapshot = {
  images: EditorGalleryImage[];
  title: string;
};

const LEGACY_GALLERY_COMPAT_STYLE = `<style data-capubbs-gallery-compat="true">
.capubbs-gallery{display:block;width:100%;margin:15px 0;border:1px solid #d4d4d8;background:#fff;color:#3f3f46;box-sizing:border-box;overflow:hidden;font-family:Arial,sans-serif}
.capubbs-gallery-header{display:block;min-height:42px;padding:10px 12px;border-bottom:1px solid #e4e4e7;background:#fafafa;box-sizing:border-box}
.capubbs-gallery-title{display:block;font-size:15px;font-weight:bold;line-height:22px;overflow-wrap:anywhere}
.capubbs-gallery-stage{position:relative;display:block;height:420px;overflow:hidden;background:#f4f4f5}
.capubbs-gallery-slide{display:none;width:100%;height:100%;margin:0;text-align:center;box-sizing:border-box}
.capubbs-gallery-slide[data-capubbs-gallery-active="true"]{display:block}
.capubbs-gallery-slide>img{display:block;width:auto;height:auto;max-width:100%;max-height:100%;margin:0 auto;object-fit:contain}
.capubbs-gallery-nav{position:absolute;top:50%;z-index:2;display:block;width:42px;height:58px;margin-top:-29px;border:0;background:#000;color:#fff;cursor:pointer;opacity:.55;text-align:center;font:bold 30px/58px Arial,sans-serif}
.capubbs-gallery-nav:hover{opacity:.82}
.capubbs-gallery-nav-prev{left:8px}.capubbs-gallery-nav-next{right:8px}
.capubbs-gallery-nav-prev:before{content:'<'} .capubbs-gallery-nav-next:before{content:'>'}
.capubbs-gallery-footer{display:block;min-height:38px;padding:8px 12px;box-sizing:border-box;border-top:1px solid #e4e4e7;background:#fafafa;line-height:22px;font-size:13px}
.capubbs-gallery-captions{display:inline}.capubbs-gallery-caption{display:none}.capubbs-gallery-caption[data-capubbs-gallery-active="true"]{display:inline}
.capubbs-gallery-count{float:right;color:#71717a}.capubbs-gallery-count:before{content:attr(data-capubbs-gallery-current) '/' attr(data-capubbs-gallery-total)}
@media (max-width:600px){.capubbs-gallery-stage{height:280px}.capubbs-gallery-nav{width:34px;height:48px;margin-top:-24px;font-size:24px;line-height:48px}}
</style>`;

const LEGACY_GALLERY_COMPAT_SCRIPT = `<script>(function(){
var scripts=document.getElementsByTagName('script'),script=document.currentScript||scripts[scripts.length-1],gallery=script&&script.parentNode;
while(gallery&&(!gallery.className||(' '+gallery.className+' ').indexOf(' capubbs-gallery ')<0)){gallery=gallery.parentNode;}
if(!gallery||gallery.getAttribute('data-capubbs-gallery-compat-ready')==='true'){return;}
gallery.setAttribute('data-capubbs-gallery-compat-ready','true');
function slides(){return gallery.querySelectorAll('[data-capubbs-gallery-slide="true"]');}
function move(direction){
var items=slides(),current=-1,i,next,item;
for(i=0;i<items.length;i++){item=items.item(i);if(item.getAttribute('data-capubbs-gallery-active')==='true'){current=i;break;}}
if(items.length<2){return;}
if(current<0){current=0;}
next=(current+(direction==='next'?1:-1)+items.length)%items.length;
gallery.setAttribute('data-capubbs-gallery-index',String(next));
for(i=0;i<items.length;i++){
var active=i===next;
item=items.item(i);
item.setAttribute('data-capubbs-gallery-active',active?'true':'false');
item.setAttribute('aria-hidden',active?'false':'true');
}
var captions=gallery.querySelectorAll('[data-capubbs-gallery-caption="true"]');
for(i=0;i<captions.length;i++){item=captions.item(i);item.setAttribute('data-capubbs-gallery-active',i===next?'true':'false');item.setAttribute('aria-hidden',i===next?'false':'true');}
var count=gallery.querySelector('.capubbs-gallery-count');
if(count){
count.setAttribute('data-capubbs-gallery-current',String(next+1));
count.setAttribute('aria-label','第 '+(next+1)+' 张，共 '+items.length+' 张图片');
}
}
gallery.onclick=function(event){
event=event||window.event;var target=event.target||event.srcElement;
while(target&&target!==gallery&&(!target.getAttribute||!target.getAttribute('data-capubbs-gallery-action'))){target=target.parentNode;}
if(!target||target===gallery){return;}
if(event.preventDefault){event.preventDefault();}else{event.returnValue=false;}
move(target.getAttribute('data-capubbs-gallery-action'));
};
gallery.onkeydown=function(event){
event=event||window.event;var key=event.key||event.keyCode;
if(key==='ArrowLeft'||key===37||key==='ArrowRight'||key===39){
if(event.preventDefault){event.preventDefault();}else{event.returnValue=false;}
move(key==='ArrowLeft'||key===37?'prev':'next');
}
};
})();</script>`;

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
    LEGACY_GALLERY_COMPAT_STYLE,
    LEGACY_GALLERY_COMPAT_SCRIPT,
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
