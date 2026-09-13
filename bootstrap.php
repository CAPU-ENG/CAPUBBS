<?php
/**
 * Canonicalize directory-style index.php requests without relying on the web
 * server's DirectorySlash/rewrite behavior. A 308 keeps the original method
 * and request body intact for directory endpoints that accept POST requests.
 */
function capubbs_redirect_index_directory_to_trailing_slash() {
    if (PHP_SAPI === 'cli' || headers_sent()) {
        return;
    }

    $script_filename = isset($_SERVER['SCRIPT_FILENAME']) ? $_SERVER['SCRIPT_FILENAME'] : '';
    $script_name = isset($_SERVER['SCRIPT_NAME']) ? str_replace('\\', '/', $_SERVER['SCRIPT_NAME']) : '';
    $request_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
    $request_path = parse_url($request_uri, PHP_URL_PATH);

    if (basename($script_filename) !== 'index.php'
        || substr($script_name, -10) !== '/index.php'
        || !is_string($request_path)
        || $request_path === ''
        || substr($request_path, -1) === '/') {
        return;
    }

    $script_directory = rtrim(str_replace('\\', '/', dirname($script_name)), '/');
    if ($script_directory === '') {
        $script_directory = '/';
    }

    if (rtrim($request_path, '/') !== $script_directory) {
        return;
    }

    $query = isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== ''
        ? '?' . $_SERVER['QUERY_STRING']
        : '';
    header('Location: ' . $script_directory . '/' . $query, true, 308);
    exit;
}

capubbs_redirect_index_directory_to_trailing_slash();
