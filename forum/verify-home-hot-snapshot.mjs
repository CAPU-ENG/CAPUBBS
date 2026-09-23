import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { buildSync } from 'esbuild';
import { JSDOM } from 'jsdom';

const forumDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(forumDirectory, '..');
const snapshotDirectory = mkdtempSync(join(tmpdir(), 'capubbs-home-hot-'));
const phpBinary = process.env.CAPUBBS_PHP_BIN || 'php';

const phpTest = String.raw`
require 'lib.php';
require 'api/lib/HomeHotSnapshot.php';

$rows = array();
for ($index = 1; $index <= 100; $index++) {
    $rows[] = array(
        'bid' => '2',
        'tid' => strval($index),
        'title' => 'thread-' . $index,
        'text' => 'summary-' . $index,
    );
}
if (!home_hot_snapshot_publish($rows, false)) exit(10);

$manifest = home_hot_snapshot_read_json(home_hot_snapshot_manifest_path());
if (!$manifest || intval($manifest['count']) !== 100) exit(11);
$generationDirectory = home_hot_snapshot_root() . '/snapshots/' . $manifest['generation'];
$standard = home_hot_snapshot_read_json($generationDirectory . '/hot-15.json');
$compact = home_hot_snapshot_read_json($generationDirectory . '/hot-30-compact.json');
$full = home_hot_snapshot_read_json($generationDirectory . '/hot-100.json');
if (count($standard['data']) !== 15 || count($compact['data']) !== 30 || count($full['data']) !== 100) exit(12);
if (isset($compact['data'][0]['text']) || !isset($full['data'][0]['text'])) exit(13);
$publicStandard = home_hot_snapshot_read_json(home_hot_snapshot_root() . '/hot-15.json');
$publicCompact = home_hot_snapshot_read_json(home_hot_snapshot_root() . '/hot-30-compact.json');
if ($publicStandard['meta']['generation'] !== $manifest['generation'] || count($publicCompact['data']) !== 30) exit(14);

home_hot_snapshot_mark_dirty();
$dirtyManifest = home_hot_snapshot_read_json(home_hot_snapshot_manifest_path());
if (empty($dirtyManifest['dirty'])) exit(15);
$dirtyStandard = home_hot_snapshot_read_json(home_hot_snapshot_root() . '/hot-15.json');
if (empty($dirtyStandard['meta']['dirty'])) exit(16);

$lock = fopen(home_hot_snapshot_root() . '/hot.lock', 'c');
flock($lock, LOCK_EX);
$busy = home_hot_snapshot_refresh();
if ($busy['status'] !== 'busy') exit(17);
`;

try {
  const result = spawnSync(phpBinary, ['-r', phpTest], {
    cwd: repositoryDirectory,
    encoding: 'utf8',
    env: {
      ...process.env,
      CAPUBBS_HOME_HOT_CACHE_DIR: snapshotDirectory,
    },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout || 'PHP snapshot verification failed.');

  const homeApi = readFileSync(join(forumDirectory, 'src/api/home.ts'), 'utf8');
  const homeData = readFileSync(join(forumDirectory, 'src/hooks/useHomeData.ts'), 'utf8');
  const homePage = readFileSync(join(forumDirectory, 'src/pages/HomePage.tsx'), 'utf8');
  const homePreload = readFileSync(join(forumDirectory, 'src/hooks/useHomeThreadPreload.ts'), 'utf8');
  const cacheHtaccess = readFileSync(join(repositoryDirectory, 'api/cache/home-hot/.htaccess'), 'utf8');
  const snapshotBackend = readFileSync(join(repositoryDirectory, 'api/lib/HomeHotSnapshot.php'), 'utf8');
  assert.match(homeApi, /cache\/home-hot\/hot-15\.json/);
  assert.doesNotMatch(homeApi, /requestSnapshotManifest/);
  assert.match(homeApi, /hot-100\.json/);
  assert.match(homeData, /feedSnapshotRef/);
  assert.match(homeData, /fetchHomeFeedPage/);
  assert.match(homePage, /enabled: feed\.status === 'ready'/);
  assert.match(homePreload, /if \(!enabled \|\| !scope\) return/);
  assert.match(cacheHtaccess, /SetOutputFilter DEFLATE/);
  assert.match(snapshotBackend, /\(\$latestText\) as text/);
  assert.doesNotMatch(snapshotBackend, /recent_threads\.bid=1 then null/);

  const cases = [
    ['long attributes before the first text', `<p style="${'--tw-shadow: none;'.repeat(300)}"></p><p style="${'color: black;'.repeat(300)}"><b>后记</b></p><p>骑行正文</p>`, '后记 骑行正文'],
    ['quoted angle brackets in attributes', '<p title="a > b" data-value=\'c > d\'>正常文字</p>', '正常文字'],
    ['long HTML quote', `<blockquote>${'引用'.repeat(3000)}</blockquote><p>自己的回复</p>`, '自己的回复'],
    ['nested HTML quotes', '<blockquote>外层<blockquote>内层</blockquote>外层尾部</blockquote>回复', '回复'],
    ['long BBCode quote and image', `[quote=用户]${'引用'.repeat(3000)}[/quote][img]photo.jpg[/img][b]自己的回复[/b]`, '自己的回复'],
    ['scripts and styles before text', `<style>${'body { color: red; }'.repeat(300)}</style><script>const x = "<p>代码</p>";</script><p>可见正文</p>`, '可见正文'],
    ['gallery script with angle-bracket comparisons', '<figure class="capubbs-gallery"><script>for(var i=0;i<items.length;i++) { x="</figure>"; }</script></figure><p>图廊后的正文</p>', '图廊后的正文'],
    ['nested gallery', `<figure class="extra capubbs-gallery"><header>相册标题</header><figure><img src="x"><figcaption>${'图注'.repeat(3000)}</figcaption></figure>控制文字</figure><p>图廊后的正文</p>`, '图廊后的正文'],
    ['unquoted gallery class', '<div class=capubbs-gallery><div>隐藏图注</div></div>正文', '正文'],
    ['encoded gallery class', '<figure class="capubbs&#45;gallery">隐藏图注</figure>正文', '正文'],
    ['class-like text inside another attribute', '<div title=\' class="capubbs-gallery"\'>正文</div>', '正文'],
    ['inert nodes and comments', '<!-- 不显示 --><template><p>模板</p></template><noscript>备用</noscript><p>正文</p>', '正文'],
    ['non-text-only content', '<img src="x"><blockquote>引用</blockquote>', '【非文本内容】'],
    ['unclosed script', '<script>未结束的脚本', '【非文本内容】'],
    ['unclosed gallery', '<figure class="capubbs-gallery"><figcaption>图注', '【非文本内容】'],
    ['empty text', '  \n', '暂无可显示的回复摘要。'],
    ['unicode whitespace', '\u00a0\u3000\ufeff', '暂无可显示的回复摘要。'],
    ['absent text', null, '暂无可显示的回复摘要。'],
    ['mentions and formatting', '[at] 用户[/at]<br>[b]回复[/b]<div>下一段</div>', '@用户 回复 下一段'],
    ['signup phone field', '<div>联系电话：123 456 789</div><div>姓名：测试</div>', '联系电话：*********** 姓名：测试'],
    ['plain phone field', '手机：13800138000 姓名：测试', '手机：*********** 姓名：测试'],
    ['literal HTML and entities', '<p>&lt;script&gt;示例&lt;/script&gt; &amp; &amp;lt;b&amp;gt;</p>', '<script>示例</script> & &lt;b&gt;'],
    ['unicode limit', `<p>${'骑🚲'.repeat(2100)}</p>`, '骑🚲'.repeat(2000)],
    ['entity on the limit', `${'字'.repeat(3999)}&amp;末尾`, `${'字'.repeat(3999)}&`],
    ['formatting after limit', `${'字'.repeat(3999)}[b]尾巴[/b]`, '字'.repeat(3999)],
  ];
  const rows = cases.map(([, text], index) => ({ bid: '2', tid: String(index + 1), title: '标题', text }));
  // Namespace the actual backend source so mysqli stand-ins cannot contact a
  // database, including on runtimes with mysqli compiled in rather than shared.
  const excerptResult = spawnSync(phpBinary, ['-n', '-r', String.raw`
namespace HomeSnapshotTest;
eval('namespace HomeSnapshotTest;' . substr(file_get_contents('api/lib/HomeHotSnapshot.php'), 5));
function mysqli_query($connection, $query) { return true; }
function mysqli_fetch_assoc($result) { return array_shift($GLOBALS['fixtureRows']); }
function mysqli_free_result($result) {}
$GLOBALS['fixtureRows'] = json_decode(file_get_contents('php://stdin'), true);
$rows = home_hot_snapshot_query_rows(true, count($GLOBALS['fixtureRows']));
if (!home_hot_snapshot_publish($rows, false)) exit(20);
echo json_encode(home_hot_snapshot_read_json(home_hot_snapshot_root() . '/hot-15.json'));
echo "\n";
echo json_encode($rows);
`], {
    cwd: repositoryDirectory,
    encoding: 'utf8',
    input: JSON.stringify(rows),
    env: { ...process.env, CAPUBBS_HOME_HOT_CACHE_DIR: snapshotDirectory },
  });
  assert.equal(excerptResult.status, 0, excerptResult.stderr || excerptResult.stdout);
  assert.equal(excerptResult.stderr, '');
  const [published, extracted] = excerptResult.stdout.trim().split('\n').map((line) => JSON.parse(line));
  assert.deepEqual(published.data, extracted.slice(0, 15));

  const { window } = new JSDOM('', { url: 'http://localhost/' });
  try {
    const module = { exports: {} };
    const { outputFiles } = buildSync({
      entryPoints: [join(forumDirectory, 'src/api/home.ts')],
      bundle: true, write: false, format: 'cjs', platform: 'node', define: { 'import.meta.env': '{}' },
    });
    runInNewContext(outputFiles[0].text, {
      module, exports: module.exports, window, DOMParser: window.DOMParser, URL, URLSearchParams,
      fetch: async () => ({ ok: true, json: async () => ({ code: 0, data: extracted }) }),
    });
    const threads = await module.exports.fetchHomeFeed();
    cases.forEach(([label, , expected], index) => {
      assert.equal(threads[index].summary, expected, label);
    });
  } finally {
    window.close();
  }
} finally {
  rmSync(snapshotDirectory, { force: true, recursive: true });
}

console.log('Homepage hot snapshot verification passed.');
