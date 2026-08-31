import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const forumDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(forumDirectory, '..');
const readRepositoryFile = (relativePath) => readFileSync(resolve(repositoryRoot, relativePath), 'utf8');

const legacyPageBaseCases = [
  ['bbs/boardcast/index.php', '/bbs/boardcast/'],
  ['bbs/content/index.php', '/bbs/content/'],
  ['bbs/editpid/index.php', '/bbs/editpid/'],
  ['bbs/edituser/index.php', '/bbs/edituser/'],
  ['bbs/favorite/index.php', '/bbs/favorite/'],
  ['bbs/home/index.php', '/bbs/home/'],
  ['bbs/index/index.php', '/bbs/index/'],
  ['bbs/login/index.php', '/bbs/login/'],
  ['bbs/main/index.php', '/bbs/main/'],
  ['bbs/manage/index.php', '/bbs/manage/'],
  ['bbs/manage/email_mute/index.php', '/bbs/manage/email_mute/'],
  ['bbs/manage/post_activity/index.php', '/bbs/manage/post_activity/'],
  ['bbs/manage/reset_password/index.php', '/bbs/manage/reset_password/'],
  ['bbs/manage/trash/index.php', '/bbs/manage/trash/'],
  ['bbs/online/index.php', '/bbs/online/'],
  ['bbs/register/index.php', '/bbs/register/'],
  ['bbs/search/index.php', '/bbs/search/'],
  ['bbs/user/index.php', '/bbs/user/'],
];

for (const [relativePath, expectedBasePath] of legacyPageBaseCases) {
  const source = readRepositoryFile(relativePath);
  assert.match(source, new RegExp(`<base\\s+href=["']${escapeRegExp(expectedBasePath)}["']`, 'i'), relativePath);
}

const legacyGatewaySource = readRepositoryFile('bbs/index.php');
const legacyGatewayRouteCases = [
  ['/bbs/attach', 'attach'],
  ['/bbs/boardcast', 'boardcast'],
  ['/bbs/content', 'content'],
  ['/bbs/delattach', 'delattach'],
  ['/bbs/delete', 'delete'],
  ['/bbs/deletelzl', 'deletelzl'],
  ['/bbs/download', 'download'],
  ['/bbs/editpid', 'editpid'],
  ['/bbs/edituser', 'edituser'],
  ['/bbs/favorite', 'favorite'],
  ['/bbs/home', 'home'],
  ['/bbs/index', 'index'],
  ['/bbs/login', 'login'],
  ['/bbs/logout', 'logout'],
  ['/bbs/main', 'main'],
  ['/bbs/manage', 'manage'],
  ['/bbs/manage/email_mute', 'manage/email_mute'],
  ['/bbs/manage/post_activity', 'manage/post_activity'],
  ['/bbs/manage/reset_password', 'manage/reset_password'],
  ['/bbs/manage/trash', 'manage/trash'],
  ['/bbs/message', 'message'],
  ['/bbs/move', 'move'],
  ['/bbs/online', 'online'],
  ['/bbs/post', 'post'],
  ['/bbs/postlzl', 'postlzl'],
  ['/bbs/register', 'register'],
  ['/bbs/search', 'search'],
  ['/bbs/settid', 'settid'],
  ['/bbs/sign', 'sign'],
  ['/bbs/user', 'user'],
];

for (const [requestPath, directory] of legacyGatewayRouteCases) {
  assert.match(
    legacyGatewaySource,
    new RegExp(`${escapeRegExp(`'${requestPath}'`)}\\s*=>\\s*${escapeRegExp(`'${directory}'`)}`),
    requestPath,
  );
}

for (const relativePath of [
  'bbs/content/index.php',
  'bbs/favorite/index.php',
  'bbs/home/index.php',
  'bbs/main/index.php',
]) {
  const source = readRepositoryFile(relativePath);
  assert.match(source, /\$_SERVER\["REQUEST_URI"\]/, relativePath);
  assert.doesNotMatch(source, /\$_SERVER\["PHP_SELF"\]/, relativePath);
}

assert.match(readRepositoryFile('bbs/favorite/index.php'), /Location: \/bbs\/login\?from=\$nowurl/);
assert.match(readRepositoryFile('bbs/favorite/index.php'), /Location: \/bbs\/favorite\//);
assert.match(readRepositoryFile('bbs/edituser/action.php'), /Location: \/bbs\/home/);
assert.match(readRepositoryFile('bbs/move/index.php'), /Location: \/bbs\/content\//);
assert.match(readRepositoryFile('bbs/settid/index.php'), /Location: \/bbs\/main\//);
assert.match(readRepositoryFile('bbs/logout/index.php'), /\^\/bbs\(\?:\/\|\$\|\\\?\)/);

const relativeResolutionCases = [
  ['bbs/register/index.php', 'http://forum.local/bbs/register', '../lib/jquery.min.js', '/bbs/lib/jquery.min.js'],
  ['bbs/register/index.php', 'http://forum.local/bbs/register', 'action.php', '/bbs/register/action.php'],
  ['bbs/register/index.php', 'http://forum.local/bbs/register', 'userexists.php', '/bbs/register/userexists.php'],
  ['bbs/home/index.php', 'http://forum.local/bbs/home', 'information.php', '/bbs/home/information.php'],
  ['bbs/editpid/index.php', 'http://forum.local/bbs/editpid?pid=1', 'action.php', '/bbs/editpid/action.php'],
  ['bbs/manage/index.php', 'http://forum.local/bbs/manage', 'trash/', '/bbs/manage/trash/'],
  ['bbs/search/index.php', 'http://forum.local/bbs/search', '../content/?bid=2', '/bbs/content/'],
  ['bbs/user/index.php', 'http://forum.local/bbs/users/example', 'icons/boy.png', '/bbs/user/icons/boy.png'],
];

for (const [relativePath, documentUrl, reference, expectedPath] of relativeResolutionCases) {
  const source = readRepositoryFile(relativePath);
  const basePath = source.match(/<base\s+href=["']([^"']+)/i)?.[1];
  assert.ok(basePath, relativePath);
  const resolved = new URL(reference, new URL(basePath, documentUrl));
  assert.equal(resolved.pathname, expectedPath, `${relativePath}: ${reference}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const verificationCount = legacyPageBaseCases.length
  + legacyGatewayRouteCases.length
  + 8
  + 6
  + relativeResolutionCases.length;
console.log(`legacy gateway verification passed (${verificationCount} cases)`);
