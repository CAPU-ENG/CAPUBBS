(function registerForumShellPreload(global) {
    'use strict';

    var WORKER_URL = '/bbs/index-worker.js';
    var WORKER_SCOPE = '/bbs/';
    var PREPARE_TIMEOUT_MS = 30000;
    var registrationPromise = null;

    function withTimeout(promise, timeoutMs, message) {
        return new Promise(function (resolve, reject) {
            var timeoutId = global.setTimeout(function () {
                reject(new Error(message));
            }, timeoutMs);
            promise.then(function (value) {
                global.clearTimeout(timeoutId);
                resolve(value);
            }, function (error) {
                global.clearTimeout(timeoutId);
                reject(error);
            });
        });
    }

    function waitForInstallingWorker(registration) {
        var worker = registration.installing || registration.waiting;
        if (!worker || worker.state === 'activated') return Promise.resolve();
        return withTimeout(new Promise(function (resolve, reject) {
            function handleStateChange() {
                if (worker.state === 'activated') {
                    worker.removeEventListener('statechange', handleStateChange);
                    resolve();
                } else if (worker.state === 'redundant') {
                    worker.removeEventListener('statechange', handleStateChange);
                    reject(new Error('论坛入口缓存安装失败。'));
                }
            }
            worker.addEventListener('statechange', handleStateChange);
            handleStateChange();
        }), PREPARE_TIMEOUT_MS, '论坛入口缓存安装超时。');
    }

    function registerWorker() {
        if (registrationPromise) return registrationPromise;
        registrationPromise = navigator.serviceWorker.register(WORKER_URL, {
            scope: WORKER_SCOPE,
            updateViaCache: 'none'
        }).then(function (registration) {
            return waitForInstallingWorker(registration).then(function () {
                return registration;
            });
        });
        return registrationPromise;
    }

    function requestPreparation(registration, mode) {
        var worker = registration.active || navigator.serviceWorker.controller;
        if (!worker || typeof MessageChannel === 'undefined') return Promise.resolve(false);
        return withTimeout(new Promise(function (resolve, reject) {
            var channel = new MessageChannel();
            channel.port1.onmessage = function (event) {
                channel.port1.close();
                if (event.data && event.data.ok) resolve(true);
                else reject(new Error(event.data && event.data.error || '论坛入口缓存准备失败。'));
            };
            worker.postMessage({ type: 'PREPARE_FORUM_SHELL', mode: mode }, [channel.port2]);
        }), PREPARE_TIMEOUT_MS, '论坛入口缓存准备超时。');
    }

    function prepareForumShell(mode) {
        if (!('serviceWorker' in navigator) || !global.isSecureContext) return Promise.resolve(false);
        return registerWorker().then(function (registration) {
            return requestPreparation(registration, mode);
        });
    }

    global.capubbsPrepareForumShell = prepareForumShell;
    prepareForumShell().catch(function (error) {
        if (global.console && typeof global.console.error === 'function') {
            global.console.error('[CAPUBBS] 论坛入口预缓存失败。', error);
        }
    });
}(window));
