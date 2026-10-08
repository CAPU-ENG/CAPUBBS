import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const loader = read('./src/utils/threadContentLoader.ts');
const cache = read('./src/utils/threadContentCache.ts');
const homePage = read('./src/pages/HomePage.tsx');
const threadHook = read('./src/hooks/useThreadData.ts');
const server = read('../api/lib/ThreadDetailQuery.php');
const dispatch = read('../api/dispatch.php');
const detailPayload = server.slice(
  server.indexOf('    $payload = array('),
  server.indexOf("    return array(array('code' => '0'), $payload);"),
);

assert.match(loader, /const detailTasks = new Map<string, DetailTask>\(\);/, 'detail requests must share an in-flight registry');
assert.match(loader, /function promoteTaskToForeground[\s\S]*?if \(!task\.started\)[\s\S]*?startTask\(task, false\)/, 'a queued preload must become a foreground request without duplication');
assert.match(loader, /else if \(task\.prefetchSent\)[\s\S]*?recordTaskView\(task\)/, 'an active preload must register a view after foreground promotion');
assert.match(loader, /if \(backgroundRunning\) return;/, 'background detail concurrency must be limited to one');
assert.doesNotMatch(loader, /preloadThreadCandidates|cancelQueuedHomeThreadPreloads|'hot'|'pinned'/, 'the loader must not keep homepage warming (removed 2026-10-08)');
assert.doesNotMatch(loader, /fetchThreadRevisions|thread_revisions|revisionQueue/, 'the client loader must not perform revision checks');
assert.match(loader, /recordThreadView\(request\.bid, request\.tid\)/, 'cached navigation must register a view without loading the body');
assert.match(threadHook, /onCached:[\s\S]*?setData\(detail\)[\s\S]*?setStatus\('ready'\)/, 'cached content must render immediately');
assert.match(cache, /CACHE_MAX_ENTRIES = 24/, 'the persistent cache must have an entry cap');
assert.match(cache, /CACHE_MAX_BYTES = 20 \* 1024 \* 1024/, 'the persistent cache must have a byte budget');
assert.match(cache, /return data\.bid !== 1 && !data\.isActivity;/, 'restricted and activity details must stay out of persistent storage');
assert.doesNotMatch(cache, /record\.revision|data\.revision/, 'cached content must not depend on a revision token');
assert.ok(!existsSync(new URL('./src/hooks/useHomeThreadPreload.ts', import.meta.url)), 'the homepage thread preload hook must stay removed');
assert.doesNotMatch(homePage, /useHomeThreadPreload|preloadThread/, 'the homepage must not preload thread details');
assert.match(server, /if \(!\$prefetch\) \{[\s\S]*?thread_detail_query_record_view/, 'prefetch details must not increment views');
assert.match(server, /function jiekoufunc_thread_view[\s\S]*?thread_detail_query_record_view/, 'cached navigation must have a lightweight view endpoint');
assert.match(dispatch, /'thread_view'[\s\S]*?'jiekoufunc_thread_view'/, 'the lightweight view endpoint must be registered');
assert.doesNotMatch(detailPayload, /'revision'/, 'full thread responses must not compute revision tokens');
assert.doesNotMatch(server, /thread_revisions|thread_detail_query_revision/, 'the legacy revision handler and helpers must be removed');
assert.doesNotMatch(dispatch, /thread_revisions|jiekoufunc_thread_revisions/, 'the legacy revision route must be removed');

console.log('thread content cache verification passed (20 assertions)');

function read(relativePath) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}
