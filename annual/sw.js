'use strict';

const META_CACHE = 'annual-preload-meta-v1';
const BUNDLE_PREFIX = 'annual-preload-bundle-v1-';
const jobs = new Map();

self.addEventListener('install', function (event) { event.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', function (event) { event.waitUntil(self.clients.claim()); });

function metadataUrl(path) { return self.location.origin + '/annual/_preload/' + path; }
function bundleName(manifest) { return BUNDLE_PREFIX + manifest.year + '-' + manifest.version; }
function readyKey(manifest) { return metadataUrl('ready/' + manifest.year + '/' + manifest.version); }

async function readMetadata(key) {
    const cache = await caches.open(META_CACHE);
    const response = await cache.match(key);
    return response ? response.json() : null;
}

async function writeMetadata(key, value) {
    const cache = await caches.open(META_CACHE);
    await cache.put(key, new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } }));
}

async function pruneOldBundles() {
    const metadata = await caches.open(META_CACHE);
    const clients = new Set((await self.clients.matchAll({ includeUncontrolled: true })).map(function (client) { return client.id; }));
    const keys = await metadata.keys();
    const inUse = new Set(jobs.keys());
    for (const key of keys) {
        const path = new URL(key.url).pathname;
        if (!path.startsWith('/annual/_preload/client/')) continue;
        const id = path.slice('/annual/_preload/client/'.length);
        if (!clients.has(id)) { await metadata.delete(key); continue; }
        const binding = await readMetadata(key);
        if (binding) inUse.add(binding.cacheName);
    }
    for (const key of keys) {
        if (!new URL(key.url).pathname.startsWith('/annual/_preload/ready/')) continue;
        const bundle = await readMetadata(key);
        // Keep recent entry tickets, plus every edition still being read.
        if (!bundle || inUse.has(bundle.cacheName) || Date.now() - bundle.createdAt < 86400000) continue;
        await caches.delete(bundle.cacheName);
        await metadata.delete(key);
    }
}

function validateManifest(manifest) {
    if (!manifest || !/^[0-9]{4}$/.test(manifest.year) || !/^[a-f0-9]{64}$/.test(manifest.version)
        || !Array.isArray(manifest.files) || manifest.files.length === 0) throw new Error('Invalid manifest');
    const prefix = '/annual/' + manifest.year + '/';
    const seen = new Set();
    let total = 0;
    for (const file of manifest.files) {
        const url = new URL(file.url, self.location.origin);
        if (url.origin !== self.location.origin || !url.pathname.startsWith(prefix)
            || url.search || url.hash || seen.has(url.href)
            || !Number.isSafeInteger(file.size) || file.size < 0 || !/^[a-f0-9]{64}$/.test(file.hash)) {
            throw new Error('Invalid annual resource');
        }
        seen.add(url.href);
        total += file.size;
    }
    if (manifest.entry !== prefix || total !== manifest.totalBytes
        || !seen.has(self.location.origin + prefix + 'index.html')) throw new Error('Incomplete manifest');
}

async function downloadFile(file, cache, signal, onBytes) {
    const controller = new AbortController();
    let timer;
    const abort = function () { controller.abort(); };
    const keepAlive = function () {
        clearTimeout(timer);
        timer = setTimeout(abort, 60000);
    };
    signal.addEventListener('abort', abort);
    if (signal.aborted) abort();
    keepAlive();
    try {
        const response = await fetch(file.url, { cache: 'no-store', credentials: 'same-origin', redirect: 'error', signal: controller.signal });
        if (!response.ok || !response.body) throw new Error('Failed download: ' + file.url);
        const reader = response.body.getReader();
        const chunks = [];
        let size = 0;
        while (true) {
            const result = await reader.read();
            if (result.done) break;
            keepAlive();
            size += result.value.byteLength;
            if (size > file.size) throw new Error('Annual changed while downloading');
            chunks.push(result.value);
            onBytes(result.value.byteLength);
        }
        if (size !== file.size) throw new Error('Truncated annual resource');
        const blob = new Blob(chunks);
        const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
        const hash = Array.from(new Uint8Array(digest), function (byte) { return byte.toString(16).padStart(2, '0'); }).join('');
        if (hash !== file.hash) throw new Error('Annual changed while downloading');
        if (signal.aborted) throw new Error('Cancelled');
        const headers = new Headers(response.headers);
        // Fetch has already decoded transfer compression; store the actual bytes.
        headers.delete('Content-Encoding');
        headers.set('Content-Length', String(size));
        await cache.put(file.url, new Response(blob, { status: 200, headers: headers }));
    } finally {
        clearTimeout(timer);
        signal.removeEventListener('abort', abort);
        controller.abort();
    }
}

async function prepareBundle(manifest, job) {
    const name = bundleName(manifest);
    const cache = await caches.open(name);
    const ready = await readMetadata(readyKey(manifest));
    if (ready) {
        let complete = true;
        for (const file of manifest.files) {
            if (!(await cache.match(file.url, { ignoreVary: true }))) { complete = false; break; }
        }
        if (complete) {
            await writeMetadata(readyKey(manifest), { cacheName: name, year: manifest.year, createdAt: Date.now() });
            job.notify(manifest.totalBytes);
            return;
        }
    }
    const metadata = await caches.open(META_CACHE);
    await metadata.delete(readyKey(manifest));
    let next = 0;
    let loaded = 0;
    let lastProgress = 0;
    const report = function (bytes) {
        loaded += bytes;
        if (Date.now() - lastProgress > 100) { job.notify(loaded); lastProgress = Date.now(); }
    };
    async function worker() {
        try {
            while (next < manifest.files.length && !job.controller.signal.aborted) {
                const file = manifest.files[next++];
                await downloadFile(file, cache, job.controller.signal, report);
                job.notify(loaded);
            }
        } catch (error) {
            job.controller.abort();
            throw error;
        }
    }
    // Wait for every worker to stop before deleting a failed partial cache.
    const results = await Promise.all(Array.from({ length: Math.min(4, manifest.files.length) }, function () {
        return worker().then(function () { return null; }, function (error) { return error; });
    }));
    if (job.controller.signal.aborted || results.some(Boolean)) {
        await caches.delete(name);
        throw new Error('Annual preparation failed');
    }
    await writeMetadata(readyKey(manifest), { cacheName: name, year: manifest.year, createdAt: Date.now() });
}

async function handlePreload(manifest, port) {
    let job;
    let observer;
    let cancelled = false;
    try {
        validateManifest(manifest);
        const name = bundleName(manifest);
        job = jobs.get(name);
        if (!job) {
            job = { controller: new AbortController(), observers: new Set(), loadedBytes: 0 };
            job.notify = function (bytes) {
                job.loadedBytes = bytes;
                for (const notify of job.observers) notify(bytes);
            };
            jobs.set(name, job);
            job.promise = prepareBundle(manifest, job).catch(async function (error) {
                await caches.delete(name);
                const metadata = await caches.open(META_CACHE);
                await metadata.delete(readyKey(manifest));
                throw error;
            }).finally(function () { jobs.delete(name); });
        }
        observer = function (bytes) { port.postMessage({ type: 'PROGRESS', loadedBytes: bytes }); };
        job.observers.add(observer);
        observer(job.loadedBytes);
        port.onmessage = function (event) {
            if (event.data.type !== 'CANCEL') return;
            cancelled = true;
            job.observers.delete(observer);
            if (job.observers.size === 0) job.controller.abort();
        };
        await job.promise;
        if (!cancelled) port.postMessage({ type: 'READY' });
        await pruneOldBundles().catch(function () {});
    } catch (error) {
        if (!cancelled) port.postMessage({ type: 'ERROR' });
    } finally {
        if (job && observer) job.observers.delete(observer);
        port.close();
    }
}

self.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'PRELOAD' && event.ports[0]) {
        event.waitUntil(handlePreload(event.data.manifest, event.ports[0]));
    }
});

async function rangeResponse(response, range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return null;
    const blob = await response.blob();
    const start = match[1] ? Number(match[1]) : Math.max(0, blob.size - Number(match[2]));
    const end = match[1] && match[2] ? Math.min(Number(match[2]), blob.size - 1) : blob.size - 1;
    if (start > end || start >= blob.size) {
        return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + blob.size } });
    }
    const headers = new Headers(response.headers);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + blob.size);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(blob.slice(start, end + 1), { status: 206, headers: headers });
}

async function serveAnnual(event, year) {
    const request = event.request;
    const url = new URL(request.url);
    let binding = null;
    if (request.mode === 'navigate') {
        // Only entry via our loading page opts into the prepared snapshot.
        // Direct links and an annual's own navigation keep normal network behavior.
        const referrer = request.referrer ? new URL(request.referrer) : null;
        if (referrer && referrer.origin === self.location.origin && referrer.pathname === '/annual/read.php'
            && referrer.searchParams.get('year') === year && /^[a-f0-9]{64}$/.test(referrer.searchParams.get('v') || '')) {
            binding = await readMetadata(readyKey({ year: year, version: referrer.searchParams.get('v') }));
        }
    } else if (event.clientId) {
        binding = await readMetadata(metadataUrl('client/' + event.clientId));
    }
    if (binding && binding.year === year) {
        const cache = await caches.open(binding.cacheName);
        const path = url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname;
        const response = await cache.match(self.location.origin + path, { ignoreVary: true });
        if (response) {
            if (request.mode === 'navigate' && event.resultingClientId) {
                await writeMetadata(metadataUrl('client/' + event.resultingClientId), binding);
            }
            const range = request.headers.get('Range');
            if (range) return (await rangeResponse(response, range)) || fetch(request);
            return response;
        }
    }
    return fetch(request);
}

self.addEventListener('fetch', function (event) {
    const url = new URL(event.request.url);
    const match = /^\/annual\/([0-9]{4})\//.exec(url.pathname);
    if (event.request.method === 'GET' && url.origin === self.location.origin && match) {
        event.respondWith(serveAnnual(event, match[1]).catch(function () { return fetch(event.request); }));
    }
});
