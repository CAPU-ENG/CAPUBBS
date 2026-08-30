import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  createForumModeCookie,
  FORUM_MODE_COOKIE_MAX_AGE,
  FORUM_MODE_COOKIE_NAME,
  SHARED_FORUM_ENTRY_PATH,
} from './src/utils/forumMode.ts';
import { stripForumBasePath } from './src/utils/forumBasePath.ts';

const forumDirectory = dirname(fileURLToPath(import.meta.url));
const gatewaySource = readFileSync(resolve(forumDirectory, '../bbs/index.php'), 'utf8');

assert.equal(SHARED_FORUM_ENTRY_PATH, '/bbs/');
assert.equal(stripForumBasePath('/bbs'), '/');
assert.equal(stripForumBasePath('/bbs/'), '/');
assert.equal(FORUM_MODE_COOKIE_NAME, 'capubbs_forum_mode');
assert.equal(FORUM_MODE_COOKIE_MAX_AGE, 31_536_000);
assert.equal(
  createForumModeCookie('new', false),
  'capubbs_forum_mode=new; Path=/; Max-Age=31536000; SameSite=Lax',
);
assert.equal(
  createForumModeCookie('legacy', true),
  'capubbs_forum_mode=legacy; Path=/; Max-Age=31536000; SameSite=Lax; Secure',
);
assert.match(gatewaySource, /\$_COOKIE\['capubbs_forum_mode'\]/);
assert.match(gatewaySource, /\$mode === 'legacy'/);
assert.match(gatewaySource, /chdir\(__DIR__\.'\/index'\)/);
assert.match(gatewaySource, /require __DIR__\.'\/index\/index\.php'/);
assert.match(gatewaySource, /forum\/dist\/index\.html/);
assert.match(gatewaySource, /str_ends_with\(\$indexCandidate, '\/dist\/index\.html'\)/);
assert.match(gatewaySource, /str_replace\('"\/forum\/', '"\/forum\/dist\/'/);
assert.match(gatewaySource, /Cache-Control: private, no-store/);
assert.match(gatewaySource, /Vary: Cookie/);
assert.doesNotMatch(gatewaySource, /header\('Location:/);

const oldForumSource = readFileSync(resolve(forumDirectory, '../bbs/index/index.php'), 'utf8');
const siteHomeSource = readFileSync(resolve(forumDirectory, '../index.php'), 'utf8');
const topBarSource = readFileSync(resolve(forumDirectory, 'src/components/layout/TopBar.tsx'), 'utf8');
const boardNavigationSource = readFileSync(
  resolve(forumDirectory, 'src/components/layout/BoardNavigation.tsx'),
  'utf8',
);
const appSource = readFileSync(resolve(forumDirectory, 'src/App.tsx'), 'utf8');

assert.match(oldForumSource, /href='\/bbs\/'/);
assert.match(oldForumSource, /saveForumMode\('new'\)/);
assert.match(oldForumSource, /<base href="\/bbs\/index\/">/);
assert.match(siteHomeSource, /href="\/bbs\/"/);
assert.match(topBarSource, /saveForumMode\('legacy'\)/);
assert.match(boardNavigationSource, /saveForumMode\('legacy'\)/);
assert.match(topBarSource, /data-forum-entry-reload="true"/);
assert.match(boardNavigationSource, /data-forum-entry-reload="true"/);
assert.match(appSource, /target\.dataset\.forumEntryReload === 'true'/);

console.log('forum mode verification passed (26 cases)');
