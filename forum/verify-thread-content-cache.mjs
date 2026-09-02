import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const loader = read('./src/utils/threadContentLoader.ts');
const cache = read('./src/utils/threadContentCache.ts');
const homePreload = read('./src/hooks/useHomeThreadPreload.ts');
const threadHook = read('./src/hooks/useThreadData.ts');
const server = read('../api/lib/ThreadDetailQuery.php');

assert.match(loader, /const detailTasks = new Map<string, DetailTask>\(\);/, 'detail requests must share an in-flight registry');
assert.match(loader, /function promoteTaskToForeground[\s\S]*?if \(!task\.started\)[\s\S]*?startTask\(task, false\)/, 'a queued preload must become a foreground request without duplication');
assert.match(loader, /else if \(task\.prefetchSent\)[\s\S]*?recordTaskView\(task\)/, 'an active preload must register a view after foreground promotion');
assert.match(loader, /if \(backgroundRunning\) return;/, 'background detail concurrency must be limited to one');
assert.match(loader, /fetchThreadRevisions\(checks\)/, 'cached homepage candidates must use a batched revision check');
assert.match(threadHook, /onCached:[\s\S]*?setData\(detail\)[\s\S]*?setStatus\('ready'\)/, 'cached content must render before revalidation finishes');
assert.match(cache, /CACHE_MAX_ENTRIES = 24/, 'the persistent cache must have an entry cap');
assert.match(cache, /CACHE_MAX_BYTES = 20 \* 1024 \* 1024/, 'the persistent cache must have a byte budget');
assert.match(cache, /return data\.bid !== 1 && !data\.isActivity;/, 'restricted and activity details must stay out of persistent storage');
assert.match(homePreload, /feed\.slice\(0, 5\)[\s\S]*?'hot'[\s\S]*?pinned\.slice\(0, 2\)[\s\S]*?'pinned'[\s\S]*?signup\.slice\(0, 1\)[\s\S]*?'activity'/, 'homepage warming must prioritize hot threads before pinned and activity threads');
assert.match(server, /if \(!\$prefetch\) \{[\s\S]*?thread_detail_query_record_view/, 'prefetch details must not increment views');
assert.match(server, /count\(\$items\) > 10/, 'revision batches must be capped at ten threads');

console.log('thread content cache verification passed (12 assertions)');

function read(relativePath) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}
