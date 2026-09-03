<?php
/**
 * Private snapshots for thread pages linked from the homepage.
 *
 * The files contain an anonymous, permission-neutral thread payload and live
 * outside the web root. Requests still pass through PHP so bid=1 access and
 * viewer-specific state are checked before the cached body is returned.
 */

if (!defined('CAPUBBS_HOME_THREAD_TARGET_TTL')) {
    define('CAPUBBS_HOME_THREAD_TARGET_TTL', 10);
}
if (!defined('CAPUBBS_HOME_THREAD_CONTENT_TTL')) {
    define('CAPUBBS_HOME_THREAD_CONTENT_TTL', 300);
}
if (!defined('CAPUBBS_HOME_THREAD_HOT_LIMIT')) {
    define('CAPUBBS_HOME_THREAD_HOT_LIMIT', 30);
}
if (!defined('CAPUBBS_HOME_THREAD_ACTIVITY_LIMIT')) {
    define('CAPUBBS_HOME_THREAD_ACTIVITY_LIMIT', 5);
}

function home_thread_snapshot_root() {
    $override = getenv('CAPUBBS_HOME_THREAD_CACHE_DIR');
    if ($override !== false && trim($override) !== '') {
        return rtrim($override, '/\\');
    }
    return rtrim(sys_get_temp_dir(), '/\\') . '/capubbs-home-thread';
}

function home_thread_snapshot_ensure_directory($path) {
    return is_dir($path) || @mkdir($path, 0770, true);
}

function home_thread_snapshot_read_json($path) {
    if (!is_file($path)) return null;
    $contents = @file_get_contents($path);
    if ($contents === false || $contents === '') return null;
    $decoded = json_decode($contents, true);
    return is_array($decoded) ? $decoded : null;
}

function home_thread_snapshot_write_json_atomic($path, $value) {
    if (!home_thread_snapshot_ensure_directory(dirname($path))) return false;
    $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) return false;
    $temporary = $path . '.tmp-' . getmypid() . '-' . uniqid('', true);
    if (@file_put_contents($temporary, $json, LOCK_EX) === false) return false;
    @chmod($temporary, 0660);
    if (@rename($temporary, $path)) return true;
    @unlink($temporary);
    return false;
}

function home_thread_snapshot_manifest_path() {
    return home_thread_snapshot_root() . '/targets.json';
}

function home_thread_snapshot_key($bid, $tid, $page) {
    return intval($bid) . '-' . intval($tid) . '-' . max(1, intval($page));
}

function home_thread_snapshot_page_path($bid, $tid, $page) {
    return home_thread_snapshot_root() . '/pages/' . home_thread_snapshot_key($bid, $tid, $page) . '.json';
}

function home_thread_snapshot_page_meta_path($bid, $tid, $page) {
    return home_thread_snapshot_root() . '/meta/' . home_thread_snapshot_key($bid, $tid, $page) . '.json';
}

function home_thread_snapshot_dirty_path($bid, $tid, $page) {
    return home_thread_snapshot_root() . '/dirty/' . home_thread_snapshot_key($bid, $tid, $page) . '.dirty';
}

function home_thread_snapshot_open_page_lock($bid, $tid, $page) {
    $directory = home_thread_snapshot_root() . '/locks';
    if (!home_thread_snapshot_ensure_directory($directory)) return false;
    return @fopen($directory . '/' . home_thread_snapshot_key($bid, $tid, $page) . '.lock', 'c');
}

function home_thread_snapshot_release_lock($lock) {
    if (!is_resource($lock)) return;
    @flock($lock, LOCK_UN);
    @fclose($lock);
}

function home_thread_snapshot_mark_thread_dirty($bid, $tid) {
    $bid = intval($bid);
    $tid = intval($tid);
    if ($bid <= 0 || $tid <= 0) return false;

    $manifest = home_thread_snapshot_read_json(home_thread_snapshot_manifest_path());
    if (!is_array($manifest) || empty($manifest['targets']) || !is_array($manifest['targets'])) {
        return true;
    }
    $dirtyDirectory = home_thread_snapshot_root() . '/dirty';
    if (!home_thread_snapshot_ensure_directory($dirtyDirectory)) return false;

    foreach ($manifest['targets'] as $target) {
        if (!is_array($target) || intval($target['bid']) !== $bid || intval($target['tid']) !== $tid) continue;
        @file_put_contents(
            home_thread_snapshot_dirty_path($bid, $tid, intval($target['page'])),
            sprintf('%.6f-%s', microtime(true), uniqid('', true)),
            LOCK_EX
        );
    }
    return true;
}

function home_thread_snapshot_mark_all_dirty() {
    $manifest = home_thread_snapshot_read_json(home_thread_snapshot_manifest_path());
    if (!is_array($manifest) || empty($manifest['targets']) || !is_array($manifest['targets'])) return true;
    $marked = true;
    foreach ($manifest['targets'] as $target) {
        if (!is_array($target)) continue;
        $dirtyDirectory = home_thread_snapshot_root() . '/dirty';
        if (!home_thread_snapshot_ensure_directory($dirtyDirectory)) return false;
        $written = @file_put_contents(
            home_thread_snapshot_dirty_path($target['bid'], $target['tid'], $target['page']),
            sprintf('%.6f-%s', microtime(true), uniqid('', true)),
            LOCK_EX
        );
        if ($written === false) $marked = false;
    }
    return $marked;
}

function home_thread_snapshot_result_succeeded($result) {
    return is_array($result) && !empty($result) && is_array($result[0])
        && isset($result[0]['code']) && ($result[0]['code'] === 0 || $result[0]['code'] === '0');
}

function home_thread_snapshot_mark_mutation($con, $params, $result) {
    if (!home_thread_snapshot_result_succeeded($result)) return false;
    $ask = isset($params['ask']) ? strval($params['ask']) : '';
    $profileMutations = array(
        'avatar_update', 'edituser', 'floor_decoration_upload', 'floor_decoration_delete',
        'medal_preferences_update', 'management_tag_members_add', 'management_tag_member_remove',
        'management_medal_members_add', 'management_medal_member_remove'
    );
    if (in_array($ask, $profileMutations, true)) return home_thread_snapshot_mark_all_dirty();
    $mutations = array(
        'post', 'reply', 'edit', 'delete', 'move', 'lock', 'extr', 'top',
        'global_top_action', 'lzl', 'activity_create', 'activity_update',
        'trash_restore', 'restore_version'
    );
    if (!in_array($ask, $mutations, true)) return false;

    $bid = intval(isset($params['bid']) ? $params['bid'] : 0);
    $tid = intval(isset($params['tid']) ? $params['tid'] : 0);
    if (($tid <= 0 || $bid <= 0) && isset($result[0]['tid'])) {
        $bid = intval(isset($result[0]['bid']) ? $result[0]['bid'] : $bid);
        $tid = intval($result[0]['tid']);
    }
    if ($ask === 'lzl' && ($bid <= 0 || $tid <= 0)) {
        $fid = intval(isset($params['fid']) ? $params['fid'] : 0);
        if ($fid > 0) {
            $row = thread_detail_query_fetch_one($con, "select bid, tid from posts where fid=$fid limit 1");
            if ($row && $row !== false) {
                $bid = intval($row['bid']);
                $tid = intval($row['tid']);
            }
        }
    }
    $marked = home_thread_snapshot_mark_thread_dirty($bid, $tid);

    if ($ask === 'move' && isset($result[0]['bid']) && isset($result[0]['tid'])) {
        home_thread_snapshot_mark_thread_dirty(intval($result[0]['bid']), intval($result[0]['tid']));
    }
    return $marked;
}

function home_thread_snapshot_refresh($timeBudgetSeconds = 8, $token = '') {
    $root = home_thread_snapshot_root();
    if (!home_thread_snapshot_ensure_directory($root)) {
        return array('status' => 'error', 'message' => '无法创建帖子快照目录。');
    }
    $existingManifest = home_thread_snapshot_read_json(home_thread_snapshot_manifest_path());
    if (home_thread_snapshot_manifest_is_usable($existingManifest, $token)) {
        return array('status' => 'fresh', 'targets' => count($existingManifest['targets']));
    }
    $lock = @fopen($root . '/refresh.lock', 'c');
    if ($lock === false) return array('status' => 'error', 'message' => '无法打开帖子快照锁。');
    if (!@flock($lock, LOCK_EX | LOCK_NB)) {
        fclose($lock);
        return array('status' => 'busy');
    }

    $startedAt = microtime(true);
    $connection = dbconnect_mysqli();
    if (!$connection) {
        flock($lock, LOCK_UN);
        fclose($lock);
        return array('status' => 'error', 'message' => '无法连接数据库。');
    }
    if ($token !== '' && thread_detail_query_current_username($connection, $token) === '') $token = '';

    $targets = home_thread_snapshot_query_targets($connection);
    if ($targets === false) {
        @mysqli_close($connection);
        flock($lock, LOCK_UN);
        fclose($lock);
        return array('status' => 'error', 'message' => '无法读取首页帖子目标。');
    }
    foreach ($targets as &$target) {
        $target['fingerprint'] = home_thread_snapshot_fingerprint($connection, $target);
        $key = home_thread_snapshot_key($target['bid'], $target['tid'], $target['page']);
        $previous = is_array($existingManifest) && isset($existingManifest['targets'][$key])
            ? $existingManifest['targets'][$key]
            : null;
        if (is_array($previous)
            && isset($previous['fingerprint'])
            && hash_equals(strval($previous['fingerprint']), strval($target['fingerprint']))
            && intval(isset($previous['unavailableUntil']) ? $previous['unavailableUntil'] : 0) > time()) {
            $target['unavailableUntil'] = intval($previous['unavailableUntil']);
        }
    }
    unset($target);

    $now = time();
    $manifest = array(
        'version' => 1,
        'generatedAt' => $now,
        'expiresAt' => $now + CAPUBBS_HOME_THREAD_TARGET_TTL,
        'targets' => $targets,
    );
    home_thread_snapshot_write_json_atomic(home_thread_snapshot_manifest_path(), $manifest);

    $built = 0;
    $fresh = 0;
    $remaining = 0;
    foreach ($targets as $key => $target) {
        $bid = intval($target['bid']);
        $tid = intval($target['tid']);
        $page = intval($target['page']);
        $fingerprint = strval($target['fingerprint']);
        $cachedMeta = home_thread_snapshot_read_json(home_thread_snapshot_page_meta_path($bid, $tid, $page));
        $dirtyPath = home_thread_snapshot_dirty_path($bid, $tid, $page);
        $dirtyAtStart = @file_get_contents($dirtyPath);
        $dirty = $dirtyAtStart !== false;
        $isFresh = !$dirty && home_thread_snapshot_metadata_is_fresh($cachedMeta, $fingerprint, $now);
        if ($isFresh) {
            $fresh++;
            continue;
        }
        if (microtime(true) - $startedAt >= max(1, intval($timeBudgetSeconds))) {
            $remaining++;
            continue;
        }
        if (intval(isset($target['unavailableUntil']) ? $target['unavailableUntil'] : 0) > $now) {
            $remaining++;
            continue;
        }
        // Restricted board snapshots require the normal user cookie. The
        // payload is neutralized before it is written, regardless of who
        // warmed it.
        if ($bid === 1 && $token === '') {
            $remaining++;
            continue;
        }
        $pageLock = home_thread_snapshot_open_page_lock($bid, $tid, $page);
        if ($pageLock === false || !@flock($pageLock, LOCK_EX | LOCK_NB)) {
            if (is_resource($pageLock)) fclose($pageLock);
            $remaining++;
            continue;
        }
        $cachedMeta = home_thread_snapshot_read_json(home_thread_snapshot_page_meta_path($bid, $tid, $page));
        $dirtyAtStart = @file_get_contents($dirtyPath);
        if ($dirtyAtStart === false && home_thread_snapshot_metadata_is_fresh($cachedMeta, $fingerprint, $now)) {
            home_thread_snapshot_release_lock($pageLock);
            $fresh++;
            continue;
        }
        $payload = home_thread_snapshot_build_anonymous_payload($connection, $bid, $tid, $page, $token);
        if (!$payload || !home_thread_snapshot_store_payload($bid, $tid, $page, $payload, $fingerprint, $dirtyAtStart)) {
            home_thread_snapshot_release_lock($pageLock);
            $targets[$key]['unavailableUntil'] = $now + 60;
            $remaining++;
            continue;
        }
        home_thread_snapshot_release_lock($pageLock);
        $built++;
    }

    $manifest['targets'] = $targets;
    home_thread_snapshot_write_json_atomic(home_thread_snapshot_manifest_path(), $manifest);

    @mysqli_close($connection);
    flock($lock, LOCK_UN);
    fclose($lock);
    return array(
        'status' => 'refreshed',
        'targets' => count($targets),
        'built' => $built,
        'fresh' => $fresh,
        'remaining' => $remaining,
    );
}

function home_thread_snapshot_manifest_is_usable($manifest, $token) {
    if (!is_array($manifest) || empty($manifest['targets']) || !is_array($manifest['targets'])) return false;
    $now = time();
    if (intval(isset($manifest['expiresAt']) ? $manifest['expiresAt'] : 0) <= $now) return false;
    foreach ($manifest['targets'] as $target) {
        if (!is_array($target)) return false;
        $bid = intval(isset($target['bid']) ? $target['bid'] : 0);
        $tid = intval(isset($target['tid']) ? $target['tid'] : 0);
        $page = intval(isset($target['page']) ? $target['page'] : 0);
        if ($bid === 1 && $token === '') continue;
        if (is_file(home_thread_snapshot_dirty_path($bid, $tid, $page))) return false;
        $metadata = home_thread_snapshot_read_json(home_thread_snapshot_page_meta_path($bid, $tid, $page));
        if (home_thread_snapshot_metadata_is_fresh(
            $metadata,
            isset($target['fingerprint']) ? $target['fingerprint'] : '',
            $now
        )) continue;
        if (intval(isset($target['unavailableUntil']) ? $target['unavailableUntil'] : 0) > $now) continue;
        return false;
    }
    return true;
}

function home_thread_snapshot_query_targets($con) {
    $targets = array();
    $hotLimit = intval(CAPUBBS_HOME_THREAD_HOT_LIMIT);
    $hot = thread_detail_query_fetch_all($con, "
        select threads.bid, threads.tid, threads.reply, threads.timestamp, threads.locked,
            threads.top, 0 as global_top, coalesce(season_threads_activity.activity_id, 0) as activity_id
        from threads
        left join thread_global_top
            on threads.bid=thread_global_top.bid and threads.tid=thread_global_top.tid
        left join season_threads_activity
            on threads.bid=season_threads_activity.bid and threads.tid=season_threads_activity.tid
        where thread_global_top.bid is null
        order by threads.timestamp desc
        limit $hotLimit");
    if ($hot === false) return false;
    foreach ($hot as $row) {
        $page = max(1, intval(ceil(max(1, intval($row['reply']) + 1) / THREAD_DETAIL_QUERY_PAGE_SIZE)));
        home_thread_snapshot_add_target($targets, $row, $page, 'hot');
    }

    $pinned = thread_detail_query_fetch_all($con, "
        select threads.bid, threads.tid, threads.reply, threads.timestamp, threads.locked,
            threads.top, 1 as global_top, coalesce(season_threads_activity.activity_id, 0) as activity_id
        from thread_global_top
        inner join threads on threads.bid=thread_global_top.bid and threads.tid=thread_global_top.tid
        left join season_threads_activity
            on threads.bid=season_threads_activity.bid and threads.tid=season_threads_activity.tid
        order by threads.timestamp desc");
    if ($pinned === false) return false;
    foreach ($pinned as $row) home_thread_snapshot_add_target($targets, $row, 1, 'pinned');

    $now = time();
    $activityLimit = intval(CAPUBBS_HOME_THREAD_ACTIVITY_LIMIT);
    $activities = thread_detail_query_fetch_all($con, "
        select threads.bid, threads.tid, threads.reply, threads.timestamp, threads.locked,
            threads.top, case when thread_global_top.bid is null then 0 else 1 end as global_top,
            activity.activity_id
        from season_activity_signup_window signup_window
        inner join season_threads_activity activity on activity.activity_id=signup_window.activity_id
        inner join season_activity_schedule schedule on schedule.activity_id=activity.activity_id
        inner join threads on threads.bid=activity.bid and threads.tid=activity.tid
        left join thread_global_top on threads.bid=thread_global_top.bid and threads.tid=thread_global_top.tid
        where signup_window.ends_at>$now and threads.locked=0
        order by schedule.starts_on asc, signup_window.ends_at asc
        limit $activityLimit");
    if ($activities === false) return false;
    foreach ($activities as $row) home_thread_snapshot_add_target($targets, $row, 1, 'activity');
    return $targets;
}

function home_thread_snapshot_add_target(&$targets, $row, $page, $reason) {
    $bid = intval($row['bid']);
    $tid = intval($row['tid']);
    $page = max(1, intval($page));
    if ($bid <= 0 || $tid <= 0) return;
    $key = home_thread_snapshot_key($bid, $tid, $page);
    if (isset($targets[$key])) {
        if (!in_array($reason, $targets[$key]['reasons'], true)) $targets[$key]['reasons'][] = $reason;
        return;
    }
    $targets[$key] = array(
        'bid' => $bid,
        'tid' => $tid,
        'page' => $page,
        'reply' => intval(isset($row['reply']) ? $row['reply'] : 0),
        'timestamp' => intval(isset($row['timestamp']) ? $row['timestamp'] : 0),
        'locked' => intval(isset($row['locked']) ? $row['locked'] : 0),
        'top' => intval(isset($row['top']) ? $row['top'] : 0),
        'globalTop' => intval(isset($row['global_top']) ? $row['global_top'] : 0),
        'activityId' => intval(isset($row['activity_id']) ? $row['activity_id'] : 0),
        'reasons' => array($reason),
    );
}

function home_thread_snapshot_fingerprint($con, $target) {
    $bid = intval($target['bid']);
    $tid = intval($target['tid']);
    $row = thread_detail_query_fetch_one($con, "
        select count(*) as post_count, coalesce(max(updatetime), 0) as latest_edit,
            coalesce(sum(lzl), 0) as nested_count, coalesce(max(fid), 0) as latest_fid
        from posts where bid=$bid and tid=$tid");
    $parts = array(
        $bid, $tid, intval($target['page']), intval($target['reply']), intval($target['timestamp']),
        intval($target['locked']), intval($target['top']), intval($target['globalTop']), intval($target['activityId']),
        $row && $row !== false ? intval($row['post_count']) : -1,
        $row && $row !== false ? intval($row['latest_edit']) : -1,
        $row && $row !== false ? intval($row['nested_count']) : -1,
        $row && $row !== false ? intval($row['latest_fid']) : -1,
    );
    return hash('sha256', implode(':', $parts));
}

function home_thread_snapshot_document_is_fresh($document, $fingerprint, $now) {
    return home_thread_snapshot_metadata_is_fresh($document, $fingerprint, $now)
        && isset($document['payload']) && is_array($document['payload']);
}

function home_thread_snapshot_metadata_is_fresh($metadata, $fingerprint, $now) {
    return is_array($metadata)
        && isset($metadata['fingerprint']) && hash_equals(strval($metadata['fingerprint']), strval($fingerprint))
        && isset($metadata['builtAt']) && intval($metadata['builtAt']) + CAPUBBS_HOME_THREAD_CONTENT_TTL > intval($now);
}

function home_thread_snapshot_build_anonymous_payload($con, $bid, $tid, $page, $token = '') {
    $params = array(
        'page' => intval($page), 'authorOnly' => 0, 'tag' => 1,
        'medal' => 1, 'decoration' => 1, 'prefetch' => 1, 'render' => 'raw'
    );
    $result = jiekoufunc_thread_detail($con, intval($bid), intval($tid), $params, $token, '127.0.0.1');
    if (!home_thread_snapshot_result_succeeded($result) || !isset($result[1]) || !is_array($result[1])) return null;
    return home_thread_snapshot_neutralize_payload($result[1]);
}

function home_thread_snapshot_neutralize_payload($payload) {
    $payload['viewer'] = null;
    if (isset($payload['viewerState']) && is_array($payload['viewerState'])) {
        $payload['viewerState']['bookmarked'] = false;
        $payload['viewerState']['canReply'] = false;
        $payload['viewerState']['canEdit'] = false;
        $payload['viewerState']['canGlobalPin'] = false;
        $payload['viewerState']['canModerate'] = false;
        $payload['viewerState']['rightsCode'] = -1;
    }
    if (isset($payload['mainPost']) && is_array($payload['mainPost'])) {
        home_thread_snapshot_neutralize_floor($payload['mainPost']);
    }
    if (isset($payload['floorsPage']['items']) && is_array($payload['floorsPage']['items'])) {
        foreach ($payload['floorsPage']['items'] as &$floor) home_thread_snapshot_neutralize_floor($floor);
        unset($floor);
    }
    return $payload;
}

function home_thread_snapshot_neutralize_floor(&$floor) {
    if (!is_array($floor)) return;
    $floor['ip'] = '*.*.*.*';
    $floor['canEdit'] = false;
    $floor['canDelete'] = false;
    if (isset($floor['nestedReplies']) && is_array($floor['nestedReplies'])) {
        foreach ($floor['nestedReplies'] as &$reply) {
            if (is_array($reply)) $reply['canDelete'] = false;
        }
        unset($reply);
    }
}

function home_thread_snapshot_store_payload($bid, $tid, $page, $payload, $fingerprint, $dirtyAtStart = false) {
    $builtAt = time();
    $document = array(
        'version' => 1,
        'builtAt' => $builtAt,
        'fingerprint' => strval($fingerprint),
        'payload' => home_thread_snapshot_neutralize_payload($payload),
    );
    $written = home_thread_snapshot_write_json_atomic(home_thread_snapshot_page_path($bid, $tid, $page), $document);
    if ($written) {
        $written = home_thread_snapshot_write_json_atomic(home_thread_snapshot_page_meta_path($bid, $tid, $page), array(
            'version' => 1,
            'builtAt' => $builtAt,
            'fingerprint' => strval($fingerprint),
        ));
    }
    if ($written) {
        $dirtyPath = home_thread_snapshot_dirty_path($bid, $tid, $page);
        $dirtyNow = @file_get_contents($dirtyPath);
        if ($dirtyAtStart !== false && $dirtyNow !== false && hash_equals(strval($dirtyAtStart), strval($dirtyNow))) {
            @unlink($dirtyPath);
        }
    }
    return $written;
}

function home_thread_snapshot_load_target($bid, $tid, $page) {
    $manifest = home_thread_snapshot_read_json(home_thread_snapshot_manifest_path());
    $key = home_thread_snapshot_key($bid, $tid, $page);
    if (!is_array($manifest) || empty($manifest['targets'][$key]) || !is_array($manifest['targets'][$key])) return null;
    if (is_file(home_thread_snapshot_dirty_path($bid, $tid, $page))) return null;
    $document = home_thread_snapshot_read_json(home_thread_snapshot_page_path($bid, $tid, $page));
    if (!is_array($document) || empty($document['payload']) || !is_array($document['payload'])) return null;
    if (empty($manifest['targets'][$key]['fingerprint']) || empty($document['fingerprint'])
        || !hash_equals(strval($manifest['targets'][$key]['fingerprint']), strval($document['fingerprint']))) return null;
    if (intval(isset($document['builtAt']) ? $document['builtAt'] : 0) + CAPUBBS_HOME_THREAD_CONTENT_TTL <= time()) return null;
    return array('document' => $document, 'target' => $manifest['targets'][$key]);
}

function home_thread_snapshot_dispatch_detail($con, $bid, $tid, $params, $token, $ip, &$cacheStatus) {
    $page = thread_detail_query_int_param($params, 'page', thread_detail_query_int_param($params, 'p', 1));
    $authorOnly = thread_detail_query_bool_param($params, 'authorOnly') || thread_detail_query_bool_param($params, 'see_lz');
    $render = thread_detail_query_render_param($params);
    if ($authorOnly || $render !== 'raw') {
        $cacheStatus = 'bypass';
        return jiekoufunc_thread_detail($con, $bid, $tid, $params, $token, $ip);
    }

    $cached = home_thread_snapshot_load_target($bid, $tid, $page);
    if ($cached) {
        $cachedResult = home_thread_snapshot_cached_result($con, $cached, $bid, $params, $token, $ip, $cacheStatus);
        if ($cachedResult !== null) return $cachedResult;
        return jiekoufunc_thread_detail($con, $bid, $tid, $params, $token, $ip);
    }

    $pageLock = home_thread_snapshot_open_page_lock($bid, $tid, $page);
    if ($pageLock !== false && @flock($pageLock, LOCK_EX | LOCK_NB)) {
        $cached = home_thread_snapshot_load_target($bid, $tid, $page);
        if ($cached) {
            $cachedResult = home_thread_snapshot_cached_result($con, $cached, $bid, $params, $token, $ip, $cacheStatus);
            home_thread_snapshot_release_lock($pageLock);
            if ($cachedResult !== null) return $cachedResult;
            return jiekoufunc_thread_detail($con, $bid, $tid, $params, $token, $ip);
        }
        $cacheStatus = 'miss';
        $dirtyAtStart = @file_get_contents(home_thread_snapshot_dirty_path($bid, $tid, $page));
        $result = jiekoufunc_thread_detail($con, $bid, $tid, $params, $token, $ip);
        home_thread_snapshot_store_fallback_result($con, $bid, $tid, $page, $params, $result, $dirtyAtStart);
        home_thread_snapshot_release_lock($pageLock);
        return $result;
    }
    if (is_resource($pageLock)) fclose($pageLock);

    $deadline = microtime(true) + 2;
    do {
        usleep(50000);
        $cached = home_thread_snapshot_load_target($bid, $tid, $page);
        if (!$cached) continue;
        $cachedResult = home_thread_snapshot_cached_result($con, $cached, $bid, $params, $token, $ip, $cacheStatus);
        if ($cachedResult !== null) {
            if ($cacheStatus === 'hit') $cacheStatus = 'coalesced-hit';
            return $cachedResult;
        }
        break;
    } while (microtime(true) < $deadline);

    $cacheStatus = 'coalesced-timeout';
    return jiekoufunc_thread_detail($con, $bid, $tid, $params, $token, $ip);
}

function home_thread_snapshot_cached_result($con, $cached, $bid, $params, $token, $ip, &$cacheStatus) {
    $currentUsername = thread_detail_query_current_username($con, $token);
    if (intval($bid) === 1 && $currentUsername === '') {
        $cacheStatus = 'denied';
        return jiekoufunc_report('-2', '本版块需要登录后才能查看');
    }
    $payload = home_thread_snapshot_personalize_payload($con, $cached['document']['payload'], $params, $currentUsername, $ip);
    if ($payload === null) {
        $cacheStatus = 'privileged-bypass';
        return jiekoufunc_thread_detail($con, $bid, $tid, $params, $token, $ip);
    }
    $cacheStatus = 'hit';
    return array(array('code' => '0'), $payload);
}

function home_thread_snapshot_store_fallback_result($con, $bid, $tid, $page, $params, $result, $dirtyAtStart = false) {
    if (!home_thread_snapshot_result_succeeded($result) || empty($result[1]) || !is_array($result[1])) return;
    if (!thread_detail_query_bool_param($params, 'tag')
        || !thread_detail_query_bool_param($params, 'medal')
        || !thread_detail_query_bool_param($params, 'decoration')) return;
    $manifest = home_thread_snapshot_read_json(home_thread_snapshot_manifest_path());
    $key = home_thread_snapshot_key($bid, $tid, $page);
    if (!is_array($manifest) || empty($manifest['targets'][$key])) return;
    $fingerprint = isset($manifest['targets'][$key]['fingerprint'])
        ? strval($manifest['targets'][$key]['fingerprint'])
        : home_thread_snapshot_fingerprint($con, $manifest['targets'][$key]);
    home_thread_snapshot_store_payload($bid, $tid, $page, $result[1], $fingerprint, $dirtyAtStart);
}

function home_thread_snapshot_personalize_payload($con, $payload, $params, $currentUsername, $ip) {
    $bid = intval($payload['request']['bid']);
    $tid = intval($payload['request']['tid']);
    $boardRow = thread_detail_query_get_board($con, $bid);
    if (!$boardRow || $boardRow === false) return null;

    $includeTags = thread_detail_query_bool_param($params, 'tag');
    $includeMedals = thread_detail_query_bool_param($params, 'medal');
    $includeDecoration = thread_detail_query_bool_param($params, 'decoration');
    $viewer = null;
    $rights = thread_detail_query_get_board_rights($boardRow, null);
    if ($currentUsername !== '') {
        $profiles = thread_detail_query_get_profiles_by_username($con, array($currentUsername), $includeTags, $includeMedals);
        if ($includeDecoration && !empty($profiles)) {
            $decorations = floor_decoration_query_by_usernames($con, array_keys($profiles));
            foreach ($profiles as $username => &$profile) {
                $profile['_floor_decoration'] = isset($decorations[$username]) ? $decorations[$username] : floor_decoration_empty();
            }
            unset($profile);
        }
        if (isset($profiles[$currentUsername])) $viewer = thread_detail_query_pack_profile($profiles[$currentUsername], true);
        $rights = thread_detail_query_get_board_rights($boardRow, $viewer);
        if (!empty($rights['canModerate'])) return null;
    }

    $bookmarked = $currentUsername !== '' ? thread_detail_query_is_favorite($con, $currentUsername, $bid, $tid) : false;
    $threadState = array('locked' => !empty($payload['thread']['locked']) ? 1 : 0);
    $payload['viewer'] = $viewer;
    $payload['viewerState'] = thread_detail_query_pack_viewer_state($threadState, $boardRow, $viewer, $rights, $bookmarked);
    $payload['request']['tag'] = $includeTags ? 1 : 0;
    $payload['request']['medal'] = $includeMedals ? 1 : 0;
    $payload['request']['decoration'] = $includeDecoration ? 1 : 0;

    $ownIps = $currentUsername !== '' ? home_thread_snapshot_query_own_ips($con, $bid, $tid, $currentUsername) : array();
    if (isset($payload['mainPost']) && is_array($payload['mainPost'])) {
        home_thread_snapshot_personalize_floor($payload['mainPost'], $currentUsername, $ownIps, $includeTags, $includeMedals, $includeDecoration);
    }
    if (isset($payload['floorsPage']['items']) && is_array($payload['floorsPage']['items'])) {
        foreach ($payload['floorsPage']['items'] as &$floor) {
            home_thread_snapshot_personalize_floor($floor, $currentUsername, $ownIps, $includeTags, $includeMedals, $includeDecoration);
        }
        unset($floor);
    }

    if (!thread_detail_query_bool_param($params, 'prefetch')) {
        thread_detail_query_record_view($con, $bid, $tid, $currentUsername, $ip);
        $viewRow = thread_detail_query_fetch_one($con, "select click from threads where bid=$bid and tid=$tid limit 1");
        if ($viewRow && $viewRow !== false) $payload['thread']['views'] = intval($viewRow['click']);
    }
    return $payload;
}

function home_thread_snapshot_query_own_ips($con, $bid, $tid, $username) {
    $usernameEscaped = mysqli_real_escape_string($con, $username);
    $rows = thread_detail_query_fetch_all($con, "select fid, ip from posts where bid=$bid and tid=$tid and author='$usernameEscaped'");
    $ips = array();
    if ($rows && $rows !== false) {
        foreach ($rows as $row) $ips[intval($row['fid'])] = strval($row['ip']);
    }
    return $ips;
}

function home_thread_snapshot_personalize_floor(&$floor, $currentUsername, $ownIps, $includeTags, $includeMedals, $includeDecoration) {
    if (!is_array($floor)) return;
    $isOwn = $currentUsername !== '' && isset($floor['author']) && $floor['author'] === $currentUsername;
    $floor['canEdit'] = $isOwn;
    $floor['canDelete'] = $isOwn;
    $fid = intval(isset($floor['fid']) ? $floor['fid'] : 0);
    $floor['ip'] = $isOwn && isset($ownIps[$fid]) ? $ownIps[$fid] : '*.*.*.*';
    if (isset($floor['authorProfile']) && is_array($floor['authorProfile'])) {
        if (!$includeTags) unset($floor['authorProfile']['tags']);
        if (!$includeMedals) unset($floor['authorProfile']['medals']);
        if (!$includeDecoration) unset($floor['authorProfile']['floorDecoration']);
    }
    if (isset($floor['nestedReplies']) && is_array($floor['nestedReplies'])) {
        foreach ($floor['nestedReplies'] as &$reply) {
            if (is_array($reply)) {
                $reply['canDelete'] = $currentUsername !== ''
                    && isset($reply['author']) && $reply['author'] === $currentUsername;
            }
        }
        unset($reply);
    }
}
