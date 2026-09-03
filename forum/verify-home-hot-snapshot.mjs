import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const forumDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(forumDirectory, '..');
const snapshotDirectory = mkdtempSync(join(tmpdir(), 'capubbs-home-hot-'));

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
  const result = spawnSync('php', ['-r', phpTest], {
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
} finally {
  rmSync(snapshotDirectory, { force: true, recursive: true });
}

console.log('Homepage hot snapshot verification passed.');
