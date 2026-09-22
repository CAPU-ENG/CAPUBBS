'use strict';

(async function () {
    const request = JSON.parse(document.getElementById('annual-request').textContent);
    let manifest;
    const panel = document.querySelector('.annual-loading');
    const status = document.getElementById('loading-status');
    const progress = document.getElementById('loading-progress');
    const percent = document.getElementById('loading-percent');
    const size = document.getElementById('loading-size');
    const retry = document.getElementById('loading-retry');
    let channel;
    let finished = false;
    let timeout;

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

    function showProgress(loaded, complete) {
        const value = complete ? 100 : Math.min(99, Math.floor(loaded / Math.max(1, manifest.totalBytes) * 100));
        progress.value = value;
        percent.textContent = value + '%';
        size.textContent = formatBytes(Math.min(loaded, manifest.totalBytes)) + ' / ' + formatBytes(manifest.totalBytes);
    }

    function withTimeout(promise, milliseconds) {
        return new Promise(function (resolve, reject) {
            const timer = setTimeout(function () { reject(loadingError('加载超时，请重试。')); }, milliseconds);
            promise.then(resolve, reject).finally(function () { clearTimeout(timer); });
        });
    }

    retry.addEventListener('click', function () { window.location.reload(); });
    window.addEventListener('pagehide', function () {
        clearTimeout(timeout);
        if (channel && !finished) channel.port1.postMessage({ type: 'CANCEL' });
        if (channel) channel.port1.close();
    });

    // A BFCache return cannot reuse a cancelled worker subscription.
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) window.location.reload();
    });

    try {
        if (!('serviceWorker' in navigator) || !window.isSecureContext) {
            throw loadingError('当前浏览器无法预加载年刊，请使用支持此功能的浏览器及 HTTPS 地址。');
        }
        // Render the loading page before the server hashes a potentially large annual.
        const manifestResponse = await withTimeout(fetch('/annual/read.php?year=' + encodeURIComponent(request.year) + '&manifest=1', { cache: 'no-store' }), 60000);
        if (!manifestResponse.ok) throw loadingError('年刊暂时无法读取，请重试。');
        manifest = await withTimeout(manifestResponse.json(), 60000);
        showProgress(0, false);
        await withTimeout(navigator.serviceWorker.register('/annual/sw.js', { scope: '/annual/', updateViaCache: 'none' }), 30000);
        const registration = await withTimeout(navigator.serviceWorker.ready, 30000);

        // This identifies the exact prepared edition to the worker on navigation.
        // The annual's own URL and HTML remain unchanged.
        const loaderUrl = new URL(window.location.href);
        loaderUrl.searchParams.set('v', manifest.version);
        window.history.replaceState(null, '', loaderUrl.href);

        status.textContent = '正在加载';
        channel = new MessageChannel();
        await new Promise(function (resolve, reject) {
            function resetTimeout() {
                clearTimeout(timeout);
                timeout = setTimeout(function () { reject(loadingError('加载超时，请重试。')); }, 90000);
            }
            resetTimeout();
            channel.port1.onmessage = function (event) {
                resetTimeout();
                const message = event.data;
                if (message.type === 'PROGRESS') showProgress(message.loadedBytes, false);
                if (message.type === 'READY') resolve();
                if (message.type === 'ERROR') reject(loadingError('加载失败，请重试。'));
            };
            registration.active.postMessage({ type: 'PRELOAD', manifest: manifest }, [channel.port2]);
        });
        clearTimeout(timeout);
        finished = true;
        showProgress(manifest.totalBytes, true);
        status.textContent = '加载完成';
        panel.setAttribute('aria-busy', 'false');
        window.location.replace(manifest.entry);
    } catch (error) {
        clearTimeout(timeout);
        finished = true;
        panel.setAttribute('aria-busy', 'false');
        status.textContent = error.userMessage || '加载失败，请重试。';
        retry.hidden = false;
        if (channel) {
            channel.port1.postMessage({ type: 'CANCEL' });
            channel.port1.close();
        }
    }
}());
