'use strict';

(async function () {
    const request = JSON.parse(document.getElementById('annual-request').textContent);
    const remoteManifestPaths = {
        '2023': '/annual/remote-manifests/2023.json'
    };
    let manifest;
    const panel = document.querySelector('.annual-loading');
    const status = document.getElementById('loading-status');
    const progress = document.getElementById('loading-progress');
    const percent = document.getElementById('loading-percent');
    const size = document.getElementById('loading-size');
    const retry = document.getElementById('loading-retry');
    const activeRequests = new Set();
    let leaving = false;
    let loadedBytes = 0;
    let lastProgress = 0;

    function loadingError(message) {
        const error = new Error(message);
        error.userMessage = message;
        return error;
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function showProgress(complete) {
        progress.value = complete ? 100 : Math.min(99, Math.floor(loadedBytes / Math.max(1, manifest.totalBytes) * 100));
        percent.textContent = progress.value + '%';
        size.textContent = formatBytes(Math.min(loadedBytes, manifest.totalBytes)) + ' / ' + formatBytes(manifest.totalBytes);
        lastProgress = Date.now();
    }

    function abortRequests() {
        for (const controller of activeRequests) controller.abort();
    }

    async function fetchResource(url, cache, consume) {
        if (leaving) throw new Error('Cancelled');
        const controller = new AbortController();
        activeRequests.add(controller);
        let timer;
        let timedOut = false;
        function keepAlive() {
            clearTimeout(timer);
            timer = setTimeout(function () { timedOut = true; controller.abort(); }, 60000);
        }
        keepAlive();
        try {
            const response = await fetch(url, { cache: cache, credentials: 'same-origin', redirect: 'error', signal: controller.signal });
            if (!response.ok) throw loadingError('加载失败，请重试。');
            keepAlive();
            return await consume(response, keepAlive);
        } catch (error) {
            if (timedOut) throw loadingError('加载超时，请重试。');
            throw error;
        } finally {
            clearTimeout(timer);
            controller.abort();
            activeRequests.delete(controller);
        }
    }

    function validateManifest() {
        const prefix = '/annual/' + request.year + '/';
        if (!manifest || manifest.year !== request.year || manifest.entry !== prefix
            || !Array.isArray(manifest.files) || manifest.files.length === 0) throw new Error('Invalid manifest');
        const seen = new Set();
        let total = 0;
        for (const file of manifest.files) {
            const url = new URL(file.url, window.location.origin);
            if (url.origin !== window.location.origin || !url.pathname.startsWith(prefix)
                || url.search || url.hash || seen.has(url.href)
                || !Number.isSafeInteger(file.size) || file.size < 0) throw new Error('Invalid annual resource');
            seen.add(url.href);
            total += file.size;
        }
        if (!Number.isSafeInteger(total) || total !== manifest.totalBytes
            || !seen.has(window.location.origin + prefix + 'index.html')) throw new Error('Incomplete manifest');
    }

    function validateRemoteManifest(remoteManifest) {
        if (!remoteManifest || remoteManifest.year !== request.year
            || typeof remoteManifest.prefix !== 'string'
            || !remoteManifest.prefix.endsWith('/')
            || !Array.isArray(remoteManifest.files) || remoteManifest.files.length === 0) {
            throw new Error('Invalid remote manifest');
        }
        const prefix = new URL(remoteManifest.prefix);
        if (prefix.href !== 'https://chexie-1342390402.cos.ap-beijing.myqcloud.com/annual/2023/assets/') {
            throw new Error('Invalid remote prefix');
        }
        const seen = new Set();
        let total = 0;
        const files = remoteManifest.files.map(function (file) {
            if (!file || typeof file.path !== 'string' || file.path === ''
                || file.path.charAt(0) === '/' || file.path.indexOf('..') !== -1
                || !Number.isSafeInteger(file.size) || file.size < 0) {
                throw new Error('Invalid remote resource');
            }
            const url = new URL(file.path, prefix.href);
            if (url.origin !== prefix.origin || !url.pathname.startsWith(prefix.pathname)
                || url.search || url.hash || seen.has(url.href)) {
                throw new Error('Invalid remote resource');
            }
            seen.add(url.href);
            total += file.size;
            return { url: url.href, size: file.size, cache: 'default' };
        });
        if (!Number.isSafeInteger(total) || total !== remoteManifest.totalBytes) {
            throw new Error('Incomplete remote manifest');
        }
        return files;
    }

    async function downloadFile(file) {
        // Revalidate local files and reuse normal HTTP cache entries for COS assets.
        await fetchResource(file.url, file.cache || 'no-cache', async function (response, keepAlive) {
            let received = 0;
            function countBytes(bytes) {
                received += bytes;
                if (received > file.size) throw loadingError('年刊文件已更新，请重新加载。');
                loadedBytes += bytes;
                if (Date.now() - lastProgress > 100) showProgress(false);
            }
            if (response.body && typeof response.body.getReader === 'function') {
                const reader = response.body.getReader();
                try {
                    while (true) {
                        const chunk = await reader.read();
                        if (chunk.done) break;
                        keepAlive();
                        countBytes(chunk.value.byteLength);
                    }
                } finally {
                    reader.releaseLock();
                }
            } else {
                countBytes((await response.arrayBuffer()).byteLength);
            }
            if (received !== file.size) throw loadingError('年刊文件未完整下载，请重试。');
            showProgress(false);
        });
    }

    retry.addEventListener('click', function () { window.location.reload(); });
    window.addEventListener('pagehide', function () { leaving = true; abortRequests(); });
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) window.location.reload();
    });

    try {
        manifest = await fetchResource('/annual/read.php?year=' + encodeURIComponent(request.year) + '&manifest=1', 'no-store', function (response) {
            return response.json();
        });
        validateManifest();
        if (remoteManifestPaths[request.year]) {
            status.textContent = '正在准备资源';
            const remoteManifest = await fetchResource(remoteManifestPaths[request.year], 'no-store', function (response) {
                return response.json();
            });
            const localUrls = new Set(manifest.files.map(function (file) { return file.url; }));
            const remoteFiles = validateRemoteManifest(remoteManifest);
            for (const file of remoteFiles) {
                if (localUrls.has(file.url)) throw new Error('Duplicate annual resource');
            }
            manifest.files = manifest.files.concat(remoteFiles);
            manifest.totalBytes += remoteManifest.totalBytes;
        }
        showProgress(false);
        status.textContent = '正在加载';
        let next = 0;
        let failure;
        async function downloadNext() {
            try {
                while (!leaving && !failure && next < manifest.files.length) {
                    await downloadFile(manifest.files[next++]);
                }
            } catch (error) {
                if (!failure) failure = error;
                abortRequests();
            }
        }
        await Promise.all(Array.from({ length: Math.min(4, manifest.files.length) }, downloadNext));
        if (leaving) return;
        if (failure) throw failure;
        showProgress(true);
        status.textContent = '加载完成';
        panel.setAttribute('aria-busy', 'false');
        window.location.replace(manifest.entry);
    } catch (error) {
        abortRequests();
        if (leaving) return;
        panel.setAttribute('aria-busy', 'false');
        status.textContent = error.userMessage || '加载失败，请重试。';
        retry.hidden = false;
    }
}());
