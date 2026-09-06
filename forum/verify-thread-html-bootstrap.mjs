import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { buildEditorGalleryHtml } from './src/components/editor/RichTextEditor.gallery.ts';

const bootstrap = readFileSync(new URL('./src/components/thread/threadHtmlBootstrap.html', import.meta.url), 'utf8');
const code = bootstrap.match(/<script>([\s\S]*?)<\/script>/)[1];
const listeners = new Set();
const requests = [];
const writes = [];
const parent = { postMessage: (message, origin) => requests.push({ message, origin }) };
const frameId = 'floor-36';
const token = 'current-document';
const source = 'capubbs-thread-html-frame';
const window = {
  parent,
  location: { hash: `#${new URLSearchParams({ frameId, token })}` },
  addEventListener: (_, listener) => listeners.add(listener),
  removeEventListener: (_, listener) => listeners.delete(listener),
};
let opens = 0;
let closes = 0;
runInNewContext(code, {
  window, URLSearchParams,
  document: {
    open() { opens += 1; },
    write(html) { writes.push(html); },
    close() { closes += 1; },
  },
});
assert.equal(requests[0].message.type, 'document-request');
assert.equal(requests[0].message.frameId, frameId);
assert.equal(requests[0].message.token, token);
const gallery = buildEditorGalleryHtml('图廊', [{ alt: '图片', caption: '图注', url: '/local.jpg' }], 448);
const html = `<!doctype html><html><head><style>p{color:red}</style></head><body><p>楼层正文</p>${gallery}</body></html>`;
const response = { source, type: 'document-response', frameId, token, html };
const dispatch = (data, sender = parent) => [...listeners].forEach(listener => listener({ data, source: sender }));
dispatch(response, {});
dispatch({ ...response, token: 'old-document' });
dispatch({ ...response, frameId: 'floor-35' });
dispatch({ ...response, html: null });
assert.equal(opens, 0, 'unrelated windows, stale documents and malformed messages cannot write the frame');
dispatch(response);
assert.equal(writes[0], html, 'full document, gallery styles and scripts pass through unchanged');
assert.equal(opens, 1);
assert.equal(closes, 1);
dispatch(response);
assert.equal(opens, 1, 'load-event retries must not reset an already loaded document');

const component = readFileSync(new URL('./src/components/thread/ThreadHtmlContent.tsx', import.meta.url), 'utf8');
assert.match(component, /threadHtmlBootstrap\.html\?url&no-inline/, 'bootstrap must remain a normal URL after building');
assert.match(component, /sandbox="allow-scripts allow-downloads"/, 'same-site bootstrap must retain an opaque sandbox origin');
assert.match(component, /key=\{documentToken\}/, 'content changes must create a fresh bootstrap document');
assert.doesNotMatch(component, /data:text\/html/, 'signatures and floors must both use the normal HTML bootstrap');
console.log('Thread HTML bootstrap verification passed (12 assertions)');
