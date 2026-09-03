<?php
/**
 * Public homepage hot-thread snapshots.
 *
 * Snapshots are published as versioned static JSON files so homepage reads do
 * not need a PHP worker or a database connection. Runtime files live under
 * api/cache/home-hot and are intentionally excluded from Git.
 */

define('CAPUBBS_HOME_HOT_SNAPSHOT_TTL', 10);
define('CAPUBBS_HOME_HOT_SNAPSHOT_LIMIT', 100);
define('CAPUBBS_HOME_HOT_SNAPSHOT_VERSIONS_TO_KEEP', 64);

function home_hot_snapshot_root() {
    $override = getenv('CAPUBBS_HOME_HOT_CACHE_DIR');
    return $override !== false && trim($override) !== ''
        ? rtrim($override, '/\\')
        : dirname(__DIR__) . '/cache/home-hot';
}

function home_hot_snapshot_manifest_path() {
    return home_hot_snapshot_root() . '/current.json';
}

function home_hot_snapshot_ensure_directory($path) {
    return is_dir($path) || @mkdir($path, 0775, true);
}

function home_hot_snapshot_read_json($path) {
    if (!is_file($path)) return null;
    $contents = @file_get_contents($path);
    if ($contents === false || $contents === '') return null;
    $decoded = json_decode($contents, true);
    return is_array($decoded) ? $decoded : null;
}

function home_hot_snapshot_write_json_atomic($path, $value) {
    $directory = dirname($path);
    if (!home_hot_snapshot_ensure_directory($directory)) return false;

    $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) return false;

    $temporary = $path . '.tmp-' . getmypid() . '-' . uniqid('', true);
    if (@file_put_contents($temporary, $json, LOCK_EX) === false) return false;
    if (@rename($temporary, $path)) return true;
    @unlink($temporary);
    return false;
}

function home_hot_snapshot_dirty_path() {
    return home_hot_snapshot_root() . '/hot.dirty';
}

function home_hot_snapshot_mark_dirty() {
    $root = home_hot_snapshot_root();
    if (!home_hot_snapshot_ensure_directory($root)) return false;

    $token = sprintf('%.6f-%s-%s', microtime(true), getmypid(), uniqid('', true));
    if (@file_put_contents(home_hot_snapshot_dirty_path(), $token, LOCK_EX) === false) return false;

    $manifest = home_hot_snapshot_read_json(home_hot_snapshot_manifest_path());
    if (is_array($manifest)) {
        $manifest['dirty'] = true;
        home_hot_snapshot_write_json_atomic(home_hot_snapshot_manifest_path(), $manifest);
    }
    home_hot_snapshot_mark_public_documents_dirty();
    return true;
}

function home_hot_snapshot_mark_public_documents_dirty() {
    foreach (array('hot-15.json', 'hot-30-compact.json') as $filename) {
        $path = home_hot_snapshot_root() . '/' . $filename;
        $document = home_hot_snapshot_read_json($path);
        if (!is_array($document) || !isset($document['meta']) || !is_array($document['meta'])) continue;
        $document['meta']['dirty'] = true;
        home_hot_snapshot_write_json_atomic($path, $document);
    }
}

function home_hot_snapshot_should_mark_dirty($ask, $result) {
    static $mutations = array(
        'post', 'reply', 'edit', 'delete', 'move', 'threads_action', 'avatar_update'
    );
    if (!in_array(strval($ask), $mutations, true) || !is_array($result) || empty($result)) return false;
    $first = $result[0];
    return is_array($first)
        && isset($first['code'])
        && ($first['code'] === 0 || $first['code'] === '0');
}

function home_hot_snapshot_needs_refresh() {
    if (is_file(home_hot_snapshot_dirty_path())) return true;
    foreach (array('hot-15.json', 'hot-30-compact.json') as $filename) {
        if (!is_file(home_hot_snapshot_root() . '/' . $filename)) return true;
    }

    $manifest = home_hot_snapshot_read_json(home_hot_snapshot_manifest_path());
    if (!is_array($manifest) || empty($manifest['generation']) || empty($manifest['expiresAt'])) return true;
    if (!empty($manifest['dirty']) || intval($manifest['expiresAt']) <= time()) return true;

    foreach (array('standard', 'compact', 'full') as $key) {
        if (empty($manifest['files'][$key])) return true;
        $relative = ltrim(strval($manifest['files'][$key]), '/');
        $prefix = 'api/cache/home-hot/';
        if (strpos($relative, $prefix) !== 0) return true;
        $cacheRelative = substr($relative, strlen($prefix));
        if (!is_file(home_hot_snapshot_root() . '/' . $cacheRelative)) return true;
    }
    return false;
}

function home_hot_snapshot_refresh() {
    if (!home_hot_snapshot_needs_refresh()) return array('status' => 'fresh');

    $root = home_hot_snapshot_root();
    if (!home_hot_snapshot_ensure_directory($root)) {
        return array('status' => 'error', 'message' => '无法创建热帖快照目录。');
    }

    $lock = @fopen($root . '/hot.lock', 'c');
    if ($lock === false) return array('status' => 'error', 'message' => '无法打开热帖快照锁。');
    if (!@flock($lock, LOCK_EX | LOCK_NB)) {
        fclose($lock);
        return array('status' => 'busy');
    }

    if (!home_hot_snapshot_needs_refresh()) {
        flock($lock, LOCK_UN);
        fclose($lock);
        return array('status' => 'fresh');
    }

    $attemptPath = $root . '/last-attempt';
    $lastAttempt = @filemtime($attemptPath);
    if ($lastAttempt !== false && time() - $lastAttempt < 5) {
        flock($lock, LOCK_UN);
        fclose($lock);
        return array('status' => 'cooldown');
    }
    @touch($attemptPath);

    $dirtyAtStart = @file_get_contents(home_hot_snapshot_dirty_path());
    $connection = dbconnect_mysqli();
    $rows = home_hot_snapshot_query_rows($connection, CAPUBBS_HOME_HOT_SNAPSHOT_LIMIT);
    if ($connection) @mysqli_close($connection);

    $published = $rows !== false && home_hot_snapshot_publish($rows, $dirtyAtStart);
    flock($lock, LOCK_UN);
    fclose($lock);

    return $published
        ? array('status' => 'refreshed', 'count' => count($rows))
        : array('status' => 'error', 'message' => '热帖快照生成失败。');
}

function home_hot_snapshot_query_rows($connection, $limit) {
    if (!$connection) return false;
    $limit = max(1, min(CAPUBBS_HOME_HOT_SNAPSHOT_LIMIT, intval($limit)));

    $latestText = "
        select latest_post.text
        from posts as latest_post force index (unique_btp_id)
        where latest_post.bid=recent_threads.bid and latest_post.tid=recent_threads.tid
        order by latest_post.pid desc
        limit 1";
    $recentThreads = "
        select threads.bid,threads.tid,threads.title,threads.author,threads.replyer,
        threads.click,threads.reply,threads.extr,threads.top,threads.locked,
        threads.timestamp,threads.postdate
        from threads left join thread_global_top
            on threads.bid=thread_global_top.bid and threads.tid=thread_global_top.tid
        where thread_global_top.bid is null
        order by threads.timestamp desc
        limit 0,$limit";
    $query = "
        select recent_threads.bid,recent_threads.tid,recent_threads.title,recent_threads.author,
        recent_threads.replyer,recent_threads.click,recent_threads.reply,recent_threads.extr,
        recent_threads.top,recent_threads.locked,recent_threads.timestamp,recent_threads.postdate,
        home_author.icon,
        ($latestText) as text,
        0 as global_top
        from ($recentThreads) as recent_threads
        left join userinfo as home_author
            on home_author.username=coalesce(nullif(recent_threads.replyer,''),recent_threads.author)
        order by recent_threads.timestamp desc";

    $result = @mysqli_query($connection, $query);
    if ($result === false) return false;

    $rows = array();
    while ($row = mysqli_fetch_assoc($result)) {
        if (isset($row['text']) && is_string($row['text']) && mb_strlen($row['text'], 'UTF-8') > 4000) {
            $row['text'] = mb_substr($row['text'], 0, 4000, 'UTF-8');
        }
        $rows[] = $row;
    }
    mysqli_free_result($result);
    return $rows;
}

function home_hot_snapshot_publish($rows, $dirtyAtStart) {
    $root = home_hot_snapshot_root();
    $generation = gmdate('YmdHis') . '-' . substr(md5(uniqid('', true)), 0, 10);
    $generationDirectory = $root . '/snapshots/' . $generation;
    if (!home_hot_snapshot_ensure_directory($generationDirectory)) return false;

    $compactRows = array_slice($rows, 0, 30);
    foreach ($compactRows as &$row) unset($row['text']);
    unset($row);

    $currentDirty = @file_get_contents(home_hot_snapshot_dirty_path());
    if ($dirtyAtStart !== false && $currentDirty !== false && $dirtyAtStart === $currentDirty) {
        @unlink(home_hot_snapshot_dirty_path());
    }
    $stillDirty = is_file(home_hot_snapshot_dirty_path());
    $generatedAt = time();
    $expiresAt = $generatedAt + CAPUBBS_HOME_HOT_SNAPSHOT_TTL;
    $indexVersion = home_hot_snapshot_index_version();
    $baseUrl = '/api/cache/home-hot/snapshots/' . $generation . '/';
    $documents = array(
        'hot-15.json' => home_hot_snapshot_document(
            array_slice($rows, 0, 15), $generation, 'standard', count($rows), $generatedAt, $expiresAt, $stillDirty, $indexVersion
        ),
        'hot-30-compact.json' => home_hot_snapshot_document(
            $compactRows, $generation, 'compact', count($rows), $generatedAt, $expiresAt, $stillDirty, $indexVersion
        ),
        'hot-100.json' => home_hot_snapshot_document(
            $rows, $generation, 'full', count($rows), $generatedAt, $expiresAt, $stillDirty, $indexVersion
        ),
    );
    foreach ($documents as $filename => $document) {
        if (!home_hot_snapshot_write_json_atomic($generationDirectory . '/' . $filename, $document)) return false;
    }
    foreach (array('hot-15.json', 'hot-30-compact.json') as $filename) {
        if (!home_hot_snapshot_write_json_atomic($root . '/' . $filename, $documents[$filename])) return false;
    }

    if (!$stillDirty && is_file(home_hot_snapshot_dirty_path())) {
        $stillDirty = true;
        home_hot_snapshot_mark_public_documents_dirty();
    }
    $manifest = array(
        'version' => 1,
        'generation' => $generation,
        'generatedAt' => $generatedAt,
        'expiresAt' => $expiresAt,
        'dirty' => $stillDirty,
        'count' => count($rows),
        'files' => array(
            'standard' => '/api/cache/home-hot/hot-15.json',
            'compact' => '/api/cache/home-hot/hot-30-compact.json',
            'full' => $baseUrl . 'hot-100.json',
        ),
    );
    if (!home_hot_snapshot_write_json_atomic(home_hot_snapshot_manifest_path(), $manifest)) return false;
    home_hot_snapshot_cleanup_versions($generation);
    return true;
}

function home_hot_snapshot_index_version() {
    $override = getenv('CAPUBBS_FORUM_INDEX_PATH');
    $candidates = array();
    if ($override !== false && trim($override) !== '') $candidates[] = $override;
    $candidates[] = dirname(__DIR__, 2) . '/forum/index.html';
    $candidates[] = dirname(__DIR__, 2) . '/forum/dist/index.html';

    foreach ($candidates as $path) {
        if (!is_readable($path)) continue;
        $contents = @file_get_contents($path);
        if ($contents === false || strpos($contents, '/src/main.tsx') !== false) continue;
        $version = @hash_file('sha256', $path);
        if (is_string($version) && preg_match('/^[a-f0-9]{64}$/', $version)) return $version;
    }
    return '';
}

function home_hot_snapshot_document($rows, $generation, $kind, $total, $generatedAt, $expiresAt, $dirty, $indexVersion = '') {
    return array(
        'code' => 0,
        'message' => 'success',
        'data' => array_values($rows),
        'meta' => array(
            'generation' => $generation,
            'kind' => $kind,
            'count' => count($rows),
            'total' => intval($total),
            'generatedAt' => intval($generatedAt),
            'expiresAt' => intval($expiresAt),
            'dirty' => !!$dirty,
            'indexVersion' => strval($indexVersion),
        ),
    );
}

function home_hot_snapshot_cleanup_versions($currentGeneration) {
    $directory = home_hot_snapshot_root() . '/snapshots';
    $entries = @scandir($directory, SCANDIR_SORT_DESCENDING);
    if ($entries === false) return;

    $versions = array();
    foreach ($entries as $entry) {
        if ($entry === '.' || $entry === '..' || !preg_match('/^[0-9]{14}-[a-f0-9]{10}$/', $entry)) continue;
        if (is_dir($directory . '/' . $entry)) $versions[] = $entry;
    }
    $remove = array_slice($versions, CAPUBBS_HOME_HOT_SNAPSHOT_VERSIONS_TO_KEEP);
    foreach ($remove as $version) {
        if ($version === $currentGeneration) continue;
        $versionDirectory = $directory . '/' . $version;
        foreach (array('hot-15.json', 'hot-30-compact.json', 'hot-100.json') as $filename) {
            @unlink($versionDirectory . '/' . $filename);
        }
        @rmdir($versionDirectory);
    }
}
