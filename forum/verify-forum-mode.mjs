import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  createForumModeCookie,
  FORUM_MODE_COOKIE_MAX_AGE,
  FORUM_MODE_COOKIE_NAME,
  getForumModeFromCookieHeader,
  resolveForumMode,
  saveForumMode,
  SHARED_FORUM_ENTRY_PATH,
  shouldInitializeLegacyForum,
} from './src/utils/forumMode.ts';
import { stripForumBasePath } from './src/utils/forumBasePath.ts';

const forumDirectory = dirname(fileURLToPath(import.meta.url));
const gatewaySource = readFileSync(resolve(forumDirectory, '../bbs/index.php'), 'utf8');
const legacyContentSource = readFileSync(resolve(forumDirectory, '../bbs/content/index.php'), 'utf8');
const legacyLoginSource = readFileSync(resolve(forumDirectory, '../bbs/login/index.php'), 'utf8');
const legacyMainSource = readFileSync(resolve(forumDirectory, '../bbs/main/index.php'), 'utf8');
const routerSource = readFileSync(resolve(forumDirectory, '../router.php'), 'utf8');
const viteConfigSource = readFileSync(resolve(forumDirectory, 'vite.config.ts'), 'utf8');

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
assert.equal(getForumModeFromCookieHeader('token=abc; capubbs_forum_mode=legacy'), 'legacy');
assert.equal(getForumModeFromCookieHeader('capubbs_forum_mode=new; token=abc'), 'new');
assert.equal(getForumModeFromCookieHeader('capubbs_forum_mode=invalid'), null);
assert.equal(shouldInitializeLegacyForum('token=abc'), true);
assert.equal(shouldInitializeLegacyForum('token='), false);
assert.equal(shouldInitializeLegacyForum('capubbs_forum_mode=new; token=abc'), false);
assert.equal(shouldInitializeLegacyForum('capubbs_forum_mode=invalid; token=abc'), false);
assert.equal(resolveForumMode('token=abc'), 'legacy');
assert.equal(resolveForumMode(undefined), 'new');
assert.equal(resolveForumMode('capubbs_forum_mode=new; token=abc'), 'new');

globalThis.window = { location: { protocol: 'http:' } };
globalThis.document = { cookie: '' };
saveForumMode('legacy');
assert.equal(
  globalThis.document.cookie,
  'capubbs_forum_mode=legacy; Path=/; Max-Age=31536000; SameSite=Lax',
);
globalThis.window.location.protocol = 'https:';
saveForumMode('new');
assert.equal(
  globalThis.document.cookie,
  'capubbs_forum_mode=new; Path=/; Max-Age=31536000; SameSite=Lax; Secure',
);
delete globalThis.window;
delete globalThis.document;
assert.match(gatewaySource, /\$_COOKIE\['capubbs_forum_mode'\]/);
assert.match(gatewaySource, /trim\(\(string\)@\$_COOKIE\['token'\]\) !== ''/);
assert.match(gatewaySource, /setcookie\('capubbs_forum_mode', 'legacy'/);
assert.match(gatewaySource, /\$mode === 'legacy'/);
assert.match(gatewaySource, /intval\(@\$_GET\['bid'\]\) > 0 && intval\(@\$_GET\['tid'\]\) > 0/);
assert.match(gatewaySource, /\$legacyDirectory = 'content'/);
assert.match(gatewaySource, /\$legacyDirectory = 'main'/);
assert.match(gatewaySource, /\^\/bbs\/users\/\(\[\^\/\]\+\)\$/);
assert.match(legacyContentSource, /<base href="\/bbs\/content\/">/);
assert.match(legacyLoginSource, /<base href="\/bbs\/login\/">/);
assert.match(legacyMainSource, /<base href="\/bbs\/main\/">/);
assert.match(gatewaySource, /forum\/dist\/index\.html/);
assert.match(gatewaySource, /Cache-Control: private, no-store/);
assert.match(gatewaySource, /Vary: Cookie/);
assert.match(gatewaySource, /\$requestPath === '\/bbs\/register\/userexists\.php'/);
assert.match(gatewaySource, /require \$registerDirectory\.'\/userexists\.php'/);
assert.doesNotMatch(gatewaySource, /header\('Location:/);
assert.match(routerSource, /serve_new_forum_file\(\$requestPath, '\/bbs\/new-assets\/'/);
assert.match(routerSource, /\$forumMode === 'legacy'/);
assert.match(routerSource, /trim\(\(string\)@\$_COOKIE\['token'\]\) !== ''/);
assert.match(routerSource, /setcookie\('capubbs_forum_mode', 'legacy'/);
assert.match(routerSource, /'\/bbs\/register\/userexists\.php'/);
assert.match(routerSource, /require __DIR__\.'\/bbs\/index\.php'/);
assert.match(viteConfigSource, /assetsDir: 'new-assets'/);
assert.match(viteConfigSource, /legacy-forum-cookie-proxy/);
assert.match(viteConfigSource, /resolveForumMode\(request\.headers\.cookie\) !== 'legacy'/);
assert.match(viteConfigSource, /shouldInitializeLegacyForum\(request\.headers\.cookie\)/);
assert.match(viteConfigSource, /'\/bbs\/register\/userexists\.php'/);

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

console.log('forum mode verification passed (56 cases)');
