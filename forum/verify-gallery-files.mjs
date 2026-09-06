import assert from 'node:assert/strict';
import { snapshotGalleryImageFile } from './src/components/editor/GalleryDialog.files.ts';

const originalBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
let readable = true;
let reads = 0;
const source = {
  name: 'clipboard.jpg',
  type: 'image/jpeg',
  lastModified: 1234,
  async arrayBuffer() {
    reads += 1;
    if (!readable) throw new DOMException('Source is no longer readable', 'NotReadableError');
    return originalBytes.slice().buffer;
  },
};

const pending = snapshotGalleryImageFile(source);
assert.equal(reads, 1, 'reading starts immediately when the image is added');
const snapshot = await pending;
readable = false;
await assert.rejects(source.arrayBuffer(), { name: 'NotReadableError' });
assert.equal(snapshot.name, source.name);
assert.equal(snapshot.type, source.type);
assert.equal(snapshot.lastModified, source.lastModified);
assert.deepEqual(new Uint8Array(await snapshot.arrayBuffer()), originalBytes);
assert.deepEqual(new Uint8Array(await snapshot.arrayBuffer()), originalBytes, 'retry remains independent of the original file');

const results = await Promise.allSettled([
  snapshotGalleryImageFile(source),
  snapshotGalleryImageFile(new File([originalBytes], 'local.jpg', { type: 'image/jpeg' })),
]);
assert.equal(results[0].status, 'rejected');
assert.match(results[0].reason.message, /无法读取图片“clipboard.jpg”.*重新复制粘贴/);
assert.equal(results[1].status, 'fulfilled', 'an unreadable image does not prevent another image from being prepared');
assert.deepEqual(new Uint8Array(await results[1].value.arrayBuffer()), originalBytes);
console.log('Gallery file snapshot verification passed (11 assertions)');
