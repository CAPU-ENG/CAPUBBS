import assert from 'node:assert/strict';

let fetchCount = 0;
globalThis.window = {
  addEventListener() {},
  location: { origin: 'https://www.chexie.net' },
};
globalThis.fetch = async () => {
  fetchCount += 1;
  return new Response(new Blob(['shared-image-bytes'], { type: 'image/jpeg' }), {
    headers: {
      'content-length': '18',
      'content-type': 'image/jpeg',
    },
    status: 200,
  });
};

const {
  getCachedThreadImageObjectUrl,
  loadThreadImageResource,
  resolveThreadImageUrl,
} = await import('./src/components/thread/threadImageResourceCache.ts');

const source = '../images/shared.jpg';
const absoluteSource = 'https://www.chexie.net/bbs/images/shared.jpg';
const [first, second] = await Promise.all([
  loadThreadImageResource(source),
  loadThreadImageResource(absoluteSource),
]);

assert.equal(resolveThreadImageUrl(source), absoluteSource, 'relative image URLs must use the legacy content base');
assert.equal(fetchCount, 1, 'concurrent equivalent URLs must share one network request');
assert.equal(first, second, 'concurrent callers must receive the same resource record');
assert.equal(first.blob, second.blob, 'the cached resource must share one Blob');
assert.equal(
  getCachedThreadImageObjectUrl(source),
  first.objectUrl,
  'the lightbox lookup must reuse the parent object URL',
);
await assert.rejects(
  loadThreadImageResource('https://images.example.com/external.jpg'),
  /仅代理论坛图片目录/,
  'cross-origin images must safely fall back without a duplicate broker fetch',
);
await assert.rejects(
  loadThreadImageResource('/api/private-image-response'),
  /仅代理论坛图片目录/,
  'sandbox scripts must not use the broker outside public image directories',
);
assert.equal(fetchCount, 1, 'broker fallbacks must not consume another network request');

URL.revokeObjectURL(first.objectUrl);
console.log('thread image resource verification passed (8 assertions)');
