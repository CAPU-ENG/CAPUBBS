import assert from 'node:assert/strict';
import { resolveForumAppRoute } from './src/utils/forumNavigation.ts';
import {
  translateLegacyForumPageHref,
  translateLegacyForumThreadHref,
} from './src/utils/legacyForumRoutes.ts';
import {
  getThreadComposeHref,
  getThreadEditHref,
  getThreadFloorHref,
} from './src/utils/threadRoutes.ts';

const cases = [
  [
    'https://www.chexie.net/bbs/content/?p=4&bid=4&tid=19989#41，',
    '/?bid=4&tid=19989&p=4#41',
  ],
  [
    'http://chexie.net/bbs/content/index.php?bid=3&amp;tid=8&amp;pid=17&amp;see_lz=1',
    '/?bid=3&tid=8&p=2&see_lz=1#17',
  ],
  [
    '../content/?bid=2&tid=6205&p=1',
    '/?bid=2&tid=6205&p=1',
  ],
  [
    '?bid=7&tid=99&floor=25',
    '/?bid=7&tid=99&p=3#25',
  ],
  [
    'https://www.chexie.net/cgi-bin/bbs.pl?id=water&see=aaaa&p=2#pid5',
    '/?bid=4&tid=1&p=2#5',
  ],
  [
    'www.chexie.net/thread.php?bid=9&tid=42&page=3#floor-31',
    '/?bid=9&tid=42&p=3#31',
  ],
  [
    'https://chexie.net/capubbs-new/threads/4-19989?page=4#floor-41',
    '/?bid=4&tid=19989&p=4#41',
  ],
  [
    '/bbs-new/thread.php?bid=5&tid=72#9',
    '/?bid=5&tid=72&p=1#9',
  ],
];

for (const [legacyHref, expectedRoute] of cases) {
  assert.equal(translateLegacyForumThreadHref(legacyHref), expectedRoute, legacyHref);
}

for (const href of [
  'https://example.com/bbs/content/?bid=4&tid=19989',
  'javascript:alert(1)',
  '/bbs/content/?bid=4',
  '/bbs/main/?bid=4',
]) {
  assert.equal(translateLegacyForumThreadHref(href), null, href);
}

const legacyPageCases = [
  ['../index/', '/'],
  ['../main/?bid=4&p=3&extr=1', '/?bid=4&p=3&digest=1'],
  ['../user/?name=%E4%B9%82%E4%BA%95', '/users/%E4%B9%82%E4%BA%95'],
  ['https://www.chexie.net/bbs/home/', '/home'],
  ['https://chexie.net/bbs/favorite/', '/home?tab=bookmarks'],
  ['/bbs/search/?keyword=test', '/search?keyword=test'],
  ['/bbs/manage/', '/manage'],
  ['/bbs/data/?panel=records', '/data?panel=records'],
  ['/bbs/settings/', '/settings'],
];

for (const [legacyHref, expectedRoute] of legacyPageCases) {
  assert.equal(translateLegacyForumPageHref(legacyHref), expectedRoute, legacyHref);
}

const frameBaseUrl = 'http://localhost:5173/bbs/content/';
const appRouteCases = [
  ['/users/%E4%B9%82%E4%BA%95', '/users/%E4%B9%82%E4%BA%95'],
  ['/?bid=4&p=2', '/?bid=4&p=2'],
  ['/data?panel=records', '/data?panel=records'],
  ['/settings', '/settings'],
  ['/home?tab=posts', '/home?tab=posts'],
  ['../main/?bid=4&p=2&extr=1', '/?bid=4&p=2&digest=1'],
  ['https://www.chexie.net/bbs/user/?name=test', '/users/test'],
  ['https://chexie.net/bbs/content/?bid=4&tid=19989#41', '/?bid=4&tid=19989&p=4#41'],
];

for (const [href, expectedRoute] of appRouteCases) {
  assert.equal(resolveForumAppRoute(href, frameBaseUrl), expectedRoute, href);
}

for (const href of [
  'https://example.com/users/test',
  '/assets/images/capu.jpg',
  '/bbs/logout',
  'javascript:alert(1)',
]) {
  assert.equal(resolveForumAppRoute(href, frameBaseUrl), null, href);
}

assert.equal(getThreadEditHref(4, 19989, 13), '/editpid?bid=4&pid=13&tid=19989');
assert.equal(getThreadFloorHref(4, 19989, 13), '/?bid=4&p=2&tid=19989#13');
assert.equal(getThreadComposeHref(4), '/post?bid=4');
assert.equal(
  getThreadComposeHref(4, 19853),
  '/post?bid=4&tid=19853',
);

console.log(`legacy forum route verification passed (${cases.length + legacyPageCases.length + appRouteCases.length + 12} cases)`);
