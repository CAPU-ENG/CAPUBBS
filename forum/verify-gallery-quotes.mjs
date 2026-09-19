import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { appendGalleryImageQuote, ensureGalleryQuoteControls } from './src/utils/galleryQuote.ts';
import { renderMarkdownToHtml } from './src/components/editor/RichTextEditor.markdownRender.ts';

for (const mode of ['rich', 'html', 'markdown']) {
  for (const [title, caption, expected] of [
    ['相册', '第一张', '【相册-第一张】'],
    ['相册', '', '【相册】'], ['', '第一张', '【第一张】'], ['', '', ''],
    ['<标题>', '*图注* & [文字]', '【&lt;标题&gt;-*图注* &amp; [文字]】'],
  ]) {
    const next = appendGalleryImageQuote({ mode, content: '已有内容' }, { src: 'https://example.com/a(b).jpg?a=1&b=2', title, caption });
    const html = mode === 'markdown' ? renderMarkdownToHtml(next.content) : next.content;
    assert.ok(html.includes('已有内容'));
    assert.match(html, /<img src="https:\/\/example.com\/a\(b\).jpg\?a=1&amp;b=2"/);
    assert.ok(html.includes(expected));
    if (expected) assert.ok(html.indexOf(expected) > html.indexOf('<img'));
    else assert.ok(!html.includes('【'));
    assert.equal(next.mode, mode);
  }
}
const current = { mode: 'rich', content: '保留' };
for (const src of ['javascript:alert(1)', 'blob:https://example.com/local']) {
  assert.equal(appendGalleryImageQuote(current, { src, title: '', caption: '' }), current);
}

// Exercise both direct rendering and the serialized isolated-frame function.
for (const install of [ensureGalleryQuoteControls, runInNewContext(`(${ensureGalleryQuoteControls.toString()})`, { URL })]) {
  let active = 0;
  const controls = [];
  const images = [0, 1].map((index) => ({
    baseURI: 'https://example.com/bbs/content/',
    getAttribute: (key) => key === 'data-capubbs-image-resource-src' ? `../images/${index}.jpg` : 'blob:temporary-preview',
  }));
  const slides = images.map((image, index) => ({
    getAttribute: () => index === active ? 'true' : 'false',
    querySelector: () => image,
  }));
  const stage = { querySelector: () => controls[0], appendChild: (button) => controls.push(button) };
  const gallery = {
    ownerDocument: { createElement: () => ({ setAttribute() {}, addEventListener(type, listener) { this[type] = listener; } }) },
    querySelector: (selector) => selector === '.capubbs-gallery-stage' ? stage : { textContent: ' 总标题 ' },
    querySelectorAll: (selector) => selector.includes('slide') ? slides : [{ textContent: ' 图一 ' }, { textContent: ' 图二 ' }],
  };
  const container = { querySelectorAll: () => [gallery] };
  const quoted = [];
  install(container, (image) => quoted.push(image));
  install(container, (image) => quoted.push(image));
  assert.equal(controls.length, 1);
  let prevented = 0;
  const click = { preventDefault: () => prevented++, stopPropagation: () => prevented++ };
  controls[0].click(click);
  active = 1;
  controls[0].click(click);
  assert.equal(prevented, 4);
  assert.equal(quoted[0].src, 'https://example.com/bbs/images/0.jpg');
  assert.equal(quoted[1].src, 'https://example.com/bbs/images/1.jpg');
  assert.equal(quoted[1].title, '总标题');
  assert.equal(quoted[1].caption, '图二');
}
console.log('Gallery quote verification passed: editor modes, captions, active slides, original URLs, frame serialization.');
