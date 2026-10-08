<?php
/**
 * Object storage for user files (Tencent COS), write-through.
 *
 * CAPUBBS_STORAGE = 'local' (default, or undefined): nothing changes, every helper below is a no-op.
 * CAPUBBS_STORAGE = 'cos': files are still saved to the local folders exactly as before; each new, moved or
 * removed file is mirrored to COS under the key that mirrors its URL path, pictures are read from COS
 * (Apache redirect / CAPUBBS_CDN_URL / the forum's asset base), and attachment and archive downloads redirect
 * to short-lived signed COS URLs.
 *
 * Local folder                      COS key
 *   bbs/images/<rel>                bbs/images/<rel>              public
 *   bbsimg/<rel>                    bbsimg/<rel>                  public
 *   assets/images/posters/<rel>     assets/images/posters/<rel>   public
 *   bbs/attachment/<rel>            private/attachment/<rel>      signed URLs only
 *   CAPUBBS_ARCHIVE_ROOT/<rel>      private/archive/<rel>         signed URLs only
 *
 * Keep this file PHP 5.6 compatible (production still runs 5.6 until the new server takes over).
 */

function capubbs_storage_enabled() {
    return defined('CAPUBBS_STORAGE') && CAPUBBS_STORAGE === 'cos' && function_exists('curl_init')
        && defined('CAPUBBS_COS_BUCKET') && defined('CAPUBBS_COS_REGION')
        && defined('CAPUBBS_COS_SECRET_ID') && defined('CAPUBBS_COS_SECRET_KEY');
}

function capubbs_storage_host() {
    return CAPUBBS_COS_BUCKET . '.cos.' . CAPUBBS_COS_REGION . '.myqcloud.com';
}

// Public base for the public prefixes, e.g. https://chexie-1342390402.cos.ap-beijing.myqcloud.com (no trailing slash).
function capubbs_storage_public_base() {
    if (!capubbs_storage_enabled()) return '';
    if (defined('CAPUBBS_COS_PUBLIC_BASE') && CAPUBBS_COS_PUBLIC_BASE !== '') return rtrim(CAPUBBS_COS_PUBLIC_BASE, '/');
    return 'https://' . capubbs_storage_host();
}

function capubbs_storage_log($message) {
    error_log('[capubbs-storage] ' . $message);
}

// Managed local roots, most specific first: array(real local directory, COS prefix).
function capubbs_storage_roots() {
    static $roots = null;
    if ($roots !== null) return $roots;
    $roots = array();
    $candidates = array(
        array(__DIR__ . '/assets/images/posters', 'assets/images/posters'),
        array(__DIR__ . '/bbs/images', 'bbs/images'),
        array(__DIR__ . '/bbs/attachment', 'private/attachment'),
        array(__DIR__ . '/bbsimg', 'bbsimg'),
    );
    if (defined('CAPUBBS_ARCHIVE_ROOT') && CAPUBBS_ARCHIVE_ROOT !== '') {
        $candidates[] = array(CAPUBBS_ARCHIVE_ROOT, 'private/archive');
    }
    foreach ($candidates as $candidate) {
        $real = realpath($candidate[0]);   // follows the symlinks to /data/capubbs/* on the new server
        if ($real !== false) $roots[] = array(rtrim($real, '/'), $candidate[1]);
    }
    return $roots;
}

// Resolve a local path (relative or absolute; the file itself need not exist any more) to a real absolute path.
function capubbs_storage_real_path($localPath) {
    $real = realpath($localPath);
    if ($real !== false) return $real;
    $dir = realpath(dirname($localPath));
    return $dir === false ? false : $dir . '/' . basename($localPath);
}

// COS key for a local file, or null when the file is not in a managed folder.
function capubbs_storage_key($localPath) {
    $real = capubbs_storage_real_path($localPath);
    return $real === false ? null : capubbs_storage_key_from_real($real);
}

// COS key for an absolute, already resolved path (no filesystem access; used for paths that no longer exist).
function capubbs_storage_key_from_real($real) {
    foreach (capubbs_storage_roots() as $root) {
        if (strpos($real, $root[0] . '/') === 0) {
            $relative = substr($real, strlen($root[0]) + 1);
            if ($relative === '' || strpos('/' . $relative . '/', '/../') !== false) return null;
            $prefix = defined('CAPUBBS_COS_KEY_PREFIX') ? CAPUBBS_COS_KEY_PREFIX : '';
            return $prefix . $root[1] . '/' . $relative;
        }
    }
    return null;
}

function capubbs_storage_encode_path($key) {
    return '/' . str_replace('%2F', '/', rawurlencode($key));
}

// COS XML API signature (q-sign-algorithm=sha1). $params and $headers are name => value.
function capubbs_storage_authorization($method, $key, $params, $headers, $ttl) {
    $now = time() - 60;
    $keyTime = $now . ';' . ($now + 60 + $ttl);
    $signKey = hash_hmac('sha1', $keyTime, CAPUBBS_COS_SECRET_KEY);

    $encode = function ($pairs) {
        $out = array();
        foreach ($pairs as $name => $value) $out[strtolower(rawurlencode($name))] = rawurlencode($value);
        ksort($out);
        $joined = array();
        foreach ($out as $name => $value) $joined[] = $name . '=' . $value;
        return array(implode(';', array_keys($out)), implode('&', $joined));
    };
    list($paramList, $httpParams) = $encode($params);
    list($headerList, $httpHeaders) = $encode($headers);

    $httpString = strtolower($method) . "\n/" . $key . "\n" . $httpParams . "\n" . $httpHeaders . "\n";
    $stringToSign = "sha1\n" . $keyTime . "\n" . sha1($httpString) . "\n";
    $signature = hash_hmac('sha1', $stringToSign, $signKey);

    return 'q-sign-algorithm=sha1&q-ak=' . CAPUBBS_COS_SECRET_ID
        . '&q-sign-time=' . $keyTime . '&q-key-time=' . $keyTime
        . '&q-header-list=' . $headerList . '&q-url-param-list=' . $paramList
        . '&q-signature=' . $signature;
}

// One signed request. $body is null, a string, or array('file' => path). Returns array(status, body).
function capubbs_storage_request($method, $key, $headers, $body, $timeout) {
    $host = capubbs_storage_host();
    $signed = array('host' => $host);
    foreach ($headers as $name => $value) {
        if (in_array(strtolower($name), array('content-md5', 'x-cos-copy-source'), true)) $signed[$name] = $value;
    }
    $lines = array('Authorization: ' . capubbs_storage_authorization($method, $key, array(), $signed, 600));
    foreach ($headers as $name => $value) $lines[] = $name . ': ' . $value;

    $ch = curl_init('https://' . $host . capubbs_storage_encode_path($key));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    $handle = null;
    if (is_array($body) && isset($body['file'])) {
        $handle = fopen($body['file'], 'rb');
        if ($handle === false) return array(0, 'cannot open ' . $body['file']);
        curl_setopt($ch, CURLOPT_UPLOAD, true);
        curl_setopt($ch, CURLOPT_INFILE, $handle);
        curl_setopt($ch, CURLOPT_INFILESIZE, filesize($body['file']));
        $lines[] = 'Expect:';
    } else {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        if ($method === 'PUT' && $body === null) $lines[] = 'Content-Length: 0';
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $lines);
    $response = curl_exec($ch);
    $status = intval(curl_getinfo($ch, CURLINFO_HTTP_CODE));
    $error = curl_error($ch);
    if (PHP_VERSION_ID < 80000) curl_close($ch);
    if ($handle) fclose($handle);
    return array($status, $response === false ? $error : $response);
}

function capubbs_storage_content_type($localPath) {
    $types = array('jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif',
        'webp' => 'image/webp', 'bmp' => 'image/bmp', 'svg' => 'image/svg+xml', 'pdf' => 'application/pdf');
    $extension = strtolower(pathinfo($localPath, PATHINFO_EXTENSION));
    return isset($types[$extension]) ? $types[$extension] : 'application/octet-stream';
}

function capubbs_storage_cache_control($key) {
    $prefix = defined('CAPUBBS_COS_KEY_PREFIX') ? CAPUBBS_COS_KEY_PREFIX : '';
    $key = substr($key, strlen($prefix));
    if (strpos($key, 'private/') === 0) return null;
    if (strpos($key, 'bbs/images/') === 0 || strpos($key, 'bbsimg/icons/user_upload') === 0) return 'public, max-age=31536000';
    return 'public, max-age=86400';
}

/**
 * Copy a just-written local file to COS. Returns true on success, and also when storage is off or the file is
 * not in a managed folder. On false the caller should treat the upload as failed (and remove the local file).
 */
function capubbs_storage_push($localPath, $contentType = null) {
    if (!capubbs_storage_enabled()) return true;
    $key = capubbs_storage_key($localPath);
    if ($key === null) return true;
    if (!is_file($localPath)) {
        capubbs_storage_log('push: missing local file ' . $localPath);
        return false;
    }
    $size = filesize($localPath);
    $headers = array(
        'Content-Type' => $contentType ? $contentType : capubbs_storage_content_type($localPath),
        'Content-MD5' => base64_encode(md5_file($localPath, true)),
    );
    $cache = capubbs_storage_cache_control($key);
    if ($cache !== null) $headers['Cache-Control'] = $cache;
    $timeout = 60 + intval($size / 1048576) * 2;
    if (function_exists('set_time_limit')) @set_time_limit($timeout + 60);

    for ($attempt = 1; $attempt <= 2; $attempt++) {
        list($status, $response) = capubbs_storage_request('PUT', $key, $headers, array('file' => $localPath), $timeout);
        if ($status === 200) return true;
        capubbs_storage_log("push $key attempt $attempt: HTTP $status " . substr(strval($response), 0, 300));
    }
    return false;
}

// Remove the COS copy of a local file (already deleted locally or about to be). Missing objects count as removed.
function capubbs_storage_remove($localPath) {
    if (!capubbs_storage_enabled()) return true;
    $key = capubbs_storage_key($localPath);
    if ($key === null) return true;
    list($status, $response) = capubbs_storage_request('DELETE', $key, array(), null, 30);
    if ($status === 204 || $status === 200 || $status === 404) return true;
    capubbs_storage_log("remove $key: HTTP $status " . substr(strval($response), 0, 300));
    return false;
}

/**
 * Mirror a local rename/move that has already happened ($newLocalPath exists now): copy every affected object
 * to its new key and delete the old one. Works for single files and whole folders.
 */
function capubbs_storage_move($oldLocalPath, $newLocalPath) {
    if (!capubbs_storage_enabled()) return true;
    $newReal = capubbs_storage_real_path($newLocalPath);
    $oldReal = rtrim(capubbs_storage_real_path($oldLocalPath), '/');
    if ($newReal === false || $oldReal === '') return false;

    $files = array();
    if (is_dir($newReal)) {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($newReal, FilesystemIterator::SKIP_DOTS));
        foreach ($iterator as $file) if ($file->isFile()) $files[] = realpath($file->getPathname());
    } elseif (is_file($newReal)) {
        $files[] = $newReal;
    }

    $ok = true;
    foreach ($files as $newFile) {
        $oldFile = $oldReal . substr($newFile, strlen(rtrim($newReal, '/')));
        $oldKey = capubbs_storage_key_from_real($oldFile);
        $newKey = capubbs_storage_key_from_real($newFile);
        if ($oldKey === null || $newKey === null) continue;
        $source = capubbs_storage_host() . capubbs_storage_encode_path($oldKey);
        list($status, $response) = capubbs_storage_request('PUT', $newKey, array('x-cos-copy-source' => $source), null, 120);
        if ($status !== 200) {
            // Old object missing (e.g. never mirrored): upload the local file instead.
            if (!capubbs_storage_push($newFile)) {
                capubbs_storage_log("move $oldKey -> $newKey: copy HTTP $status, push failed");
                $ok = false;
                continue;
            }
        }
        capubbs_storage_request('DELETE', $oldKey, array(), null, 30);
    }
    return $ok;
}

/**
 * Signed GET URL for a managed local file (used for attachments and archive files), or '' when storage is off.
 * $downloadName becomes the file name the browser saves.
 */
function capubbs_storage_signed_url($localPath, $downloadName = '', $ttl = null) {
    if (!capubbs_storage_enabled()) return '';
    $key = capubbs_storage_key($localPath);
    if ($key === null) return '';
    if ($ttl === null) $ttl = defined('CAPUBBS_COS_SIGNED_URL_TTL') ? intval(CAPUBBS_COS_SIGNED_URL_TTL) : 600;

    $params = array();
    if ($downloadName !== '') {
        $ascii = preg_replace('/[^\x20-\x7e]|["\\\\]/', '_', $downloadName);
        $params['response-content-disposition'] = 'attachment; filename="' . $ascii . '"; filename*=UTF-8\'\'' . rawurlencode($downloadName);
    }
    $auth = capubbs_storage_authorization('GET', $key, $params, array('host' => capubbs_storage_host()), $ttl);

    $query = array();
    foreach ($params as $name => $value) $query[] = rawurlencode($name) . '=' . rawurlencode($value);
    foreach (explode('&', $auth) as $pair) {
        list($name, $value) = explode('=', $pair, 2);
        $query[] = $name . '=' . rawurlencode($value);
    }
    return 'https://' . capubbs_storage_host() . capubbs_storage_encode_path($key) . '?' . implode('&', $query);
}
