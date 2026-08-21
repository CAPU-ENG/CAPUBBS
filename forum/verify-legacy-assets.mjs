import assert from 'node:assert/strict';
import { localizeChexieImageRequests } from './src/utils/legacyAssets.ts';

const cases = [
  [
    '<img src="https://www.chexie.net/bbs/images/2026/07/example.jpeg">',
    '<img src="/bbs/images/2026/07/example.jpeg">',
  ],
  [
    "<img src='http://chexie.net/bbsimg/upload/example.gif?size=2#preview'>",
    "<img src='/bbsimg/upload/example.gif?size=2#preview'>",
  ],
  [
    '<source srcset="//static.chexie.net/bbs/images/a.webp 1x, https://chexie.net/bbs/images/b.webp 2x">',
    '<source srcset="/bbs/images/a.webp 1x, /bbs/images/b.webp 2x">',
  ],
  [
    '<div style="background-image:url(https://www.chexie.net/bbs/images/background.jpg)"></div>',
    '<div style="background-image:url(/bbs/images/background.jpg)"></div>',
  ],
  [
    '<style>.signature{background:url(//chexie.net/bbs/images/signature.png)}</style>',
    '<style>.signature{background:url(/bbs/images/signature.png)}</style>',
  ],
];

for (const [source, expected] of cases) {
  assert.equal(localizeChexieImageRequests(source), expected, source);
}

for (const source of [
  '<img src="https://example.com/image.jpg">',
  '<a href="https://www.chexie.net/bbs/content/?bid=3">帖子链接</a>',
]) {
  assert.equal(localizeChexieImageRequests(source), source);
}

console.log(`legacy asset verification passed (${cases.length + 2} cases)`);
