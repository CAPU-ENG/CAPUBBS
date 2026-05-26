/**
 * /assets/js/api.js — Unified API client for CAPUBBS.
 *
 * Dependencies: jQuery (available on all pages).
 *
 * Usage:
 *   API.call('login', { username: '...', password: '...' })
 *     .done(function(resp) { console.log(resp.data); })
 *     .fail(function(err) { alert(err.message); });
 *
 *   API.silent('favorite_check', { bid: 1, tid: 100 })
 *     .done(function(resp) { ... });
 *
 *   API.call('post', { bid: 1, text: '...' }, {
 *     loading: function() { $('#submit').prop('disabled', true); }
 *   }).always(function() { $('#submit').prop('disabled', false); });
 */
(function($, window) {
    'use strict';

    var API = {
        endpoint: '/api/api.php',

        /**
         * Make an AJAX call to the unified API.
         *
         * @param  {string}   ask     - Operation name (e.g. 'login', 'post', 'bbsinfo')
         * @param  {Object}   params  - Extra POST parameters (bid, tid, text, etc.)
         * @param  {Object}   options - Optional. { silent, loading, timeout }
         * @return {jQuery.Promise}
         *   .done(function(response) {})  - fired when code === 0
         *   .fail(function(error) {})     - fired when code !== 0 or network error
         *   .loading(function() {})       - fired when request starts
         */
        call: function(ask, params, options) {
            options = options || {};
            var dfd = $.Deferred();
            var $loading = options.loading || $.noop;

            $loading();

            $.ajax({
                url: this.endpoint,
                type: 'POST',
                dataType: 'json',
                data: $.extend({ ask: ask }, params),
                timeout: options.timeout || 30000
            })
            .done(function(resp) {
                if (resp && resp.code === 0) {
                    dfd.resolve(resp);
                } else if (resp && resp.code !== undefined) {
                    var err = {
                        code: resp.code,
                        message: resp.message || 'Unknown error',
                        response: resp
                    };
                    if (!options.silent && !options.noAlert) {
                        API._showError(err.message);
                    }
                    dfd.reject(err);
                } else {
                    var err2 = { code: -1, message: 'Invalid server response', response: resp };
                    if (!options.silent && !options.noAlert) {
                        API._showError(err2.message);
                    }
                    dfd.reject(err2);
                }
            })
            .fail(function(jqXHR, textStatus) {
                var err = {
                    code: 4000,
                    message: textStatus === 'timeout' ? 'Request timeout' : 'Network error',
                    response: null
                };
                if (!options.silent && !options.noAlert) {
                    API._showError(err.message);
                }
                dfd.reject(err);
            });

            return dfd.promise();
        },

        /**
         * Silent call — no error alert on failure.
         */
        silent: function(ask, params, options) {
            options = options || {};
            options.silent = true;
            return this.call(ask, params, options);
        },

        /**
         * Internal: display an error message.
         * Replace with a toast/notification system when available.
         */
        _showError: function(message) {
            alert(message);
        }
    };

    window.API = API;

})(jQuery, window);
