import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { canonicalizeForumPageRoute, replaceAliasedForumLocation } from './src/utils/forumCanonicalRoute.ts';
import { toForumHref } from './src/utils/forumBasePath.ts';
import { resolveForumAppRoute } from './src/utils/forumNavigation.ts';

const cases = [
  ['/bbs/', '/bbs/index/'],
  ['/bbs', '/bbs/index/'],
  ['/bbs/index/index.php', '/bbs/index/'],
  ['/bbs/?bid=4&p=2', '/bbs/main/?bid=4&p=2'],
  ['/bbs/?bid=4&digest=1', '/bbs/main/?bid=4&extr=1'],
  ['/bbs/main?bid=4&extr=0&digest=1', '/bbs/main/?bid=4&extr=0'],
  ['/bbs/?bid=4&tid=99&p=2#13', '/bbs/content/?bid=4&tid=99&p=2#13'],
  ['/bbs/content/index.php?bid=4&tid=99&see_lz=1#reply-editor', '/bbs/content/?bid=4&tid=99&see_lz=1#reply-editor'],
  ['/bbs/?board=4&thread=99&page=2', '/bbs/content/?bid=4&tid=99&p=2'],
  ['/bbs/?bid=4&tid=99&custom=a%20b&custom=c%26d', '/bbs/content/?bid=4&tid=99&custom=a%20b&custom=c%26d'],
  ['/bbs/?tid=invalid', '/bbs/content/?tid=invalid'],
  ['/bbs/users/%E4%B9%82%E4%BA%95', '/bbs/users/%E4%B9%82%E4%BA%95'],
  ['/bbs/user/?name=test', '/bbs/user/?name=test'],
  ['/bbs/home?tab=bookmarks', '/bbs/home?tab=bookmarks'],
  ['/bbs/post?bid=4', '/bbs/post?bid=4'],
  ['/bbs/content/test.php', '/bbs/content/test.php'],
  ['/bbs/download/?bid=4&tid=99', '/bbs/download/?bid=4&tid=99'],
];

const phpHelper = fileURLToPath(new URL('./canonical-route.php', import.meta.url));
const phpResults = JSON.parse(execFileSync('php', ['-r',
  'require $argv[1]; echo json_encode(array_map("capubbs_new_forum_canonical_route", json_decode(stream_get_contents(STDIN), true)));',
  phpHelper,
], { input: JSON.stringify(cases.map(([input]) => input)), encoding: 'utf8' }));
for (const [index, [input, expected]] of cases.entries()) {
  assert.equal(canonicalizeForumPageRoute(input), expected, input);
  assert.equal(phpResults[index], expected, `PHP: ${input}`);
  assert.equal(canonicalizeForumPageRoute(expected), expected, `idempotent: ${expected}`);
}
assert.equal(toForumHref('/'), '/bbs/index/');
assert.equal(toForumHref('/?bid=4&digest=1'), '/bbs/main/?bid=4&extr=1');
const history = { state: { preserved: true }, calls: [], replaceState(...args) { this.calls.push(args); } };
replaceAliasedForumLocation({ pathname: '/bbs/', search: '?bid=4&tid=99', hash: '#13' }, history);
assert.deepEqual(history.calls, [[history.state, '', '/bbs/content/?bid=4&tid=99#13']]);
replaceAliasedForumLocation({ pathname: '/bbs/content/', search: '?bid=4&tid=99', hash: '#13' }, history);
assert.equal(history.calls.length, 1);

const base = 'https://chexie.net/bbs/content/';
for (const input of [
  '../content/?bid=4&amp;tid=99&amp;p=2#13',
  '/bbs/?bid=4&tid=99&p=2#13',
  'https://chexie.net/bbs/content/?bid=4&tid=99&p=2#13',
]) assert.equal(resolveForumAppRoute(input, base), '/bbs/content/?bid=4&tid=99&p=2#13');
assert.equal(resolveForumAppRoute('../content/?bid=4&tid=99&p=2&see_lz=1&custom=keep#reply-editor', base),
  '/bbs/content/?bid=4&tid=99&p=2&see_lz=1&custom=keep#reply-editor');
assert.equal(resolveForumAppRoute('https://example.com/bbs/?bid=4&tid=99', base), null);
assert.equal(resolveForumAppRoute('#inside', base), null, 'local anchors are not page navigation');
assert.equal(resolveForumAppRoute('', base), null);

// Run against an already started local PHP server when requested.
const origin = process.env.CAPUBBS_PHP_ORIGIN;
if (origin) {
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname));
  for (const method of ['GET', 'HEAD']) {
    for (const [input, expected] of cases.slice(0, 11)) {
      const response = await fetch(new URL(input, origin), { method, redirect: 'manual', headers: { Cookie: 'capubbs_forum_mode=new' } });
      assert.equal(response.status, 308, `${method} ${input}`);
      assert.equal(response.headers.get('location'), expected.split('#')[0]);
      assert.match(response.headers.get('vary'), /Cookie/i);
      const final = await fetch(new URL(expected, origin), { method, redirect: 'manual' });
      assert.equal(final.status, 200, `no redirect loop: ${expected}`);
    }
  }
  const legacy = await fetch(new URL('/bbs/', origin), { method: 'HEAD', redirect: 'manual', headers: { Cookie: 'capubbs_forum_mode=legacy' } });
  assert.equal(legacy.status, 200, 'legacy home remains served directly');
  const post = await fetch(new URL('/bbs/?bid=4', origin), { method: 'POST', redirect: 'manual' });
  assert.notEqual(post.status, 308, 'POST must not be redirected');
}
console.log(`canonical forum route verification passed (${cases.length} PHP/TS parity cases${origin ? ', HTTP redirects checked' : ''})`);
