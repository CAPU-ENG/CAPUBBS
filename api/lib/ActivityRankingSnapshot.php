<?php
/** Daily active-user ranking snapshots. Only the CLI job may generate them. */

function activity_ranking_snapshot_root() {
    $override = getenv('CAPUBBS_ACTIVITY_RANKING_CACHE_DIR');
    return $override !== false && trim($override) !== ''
        ? rtrim($override, '/\\') : dirname(__DIR__) . '/cache/activity-ranking';
}

function activity_ranking_snapshot_timezone() {
    return new DateTimeZone('Asia/Shanghai');
}

function activity_ranking_snapshot_read_json($path) {
    if (!is_file($path) || @filesize($path) > 4194304) return null;
    $contents = @file_get_contents($path);
    if ($contents === false || $contents === '') return null;
    $value = json_decode($contents, true);
    return is_array($value) ? $value : null;
}

function activity_ranking_snapshot_date($value) {
    if (!is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}$/D', $value)) return null;
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value, activity_ranking_snapshot_timezone());
    return $date && $date->format('Y-m-d') === $value ? $date : null;
}

function activity_ranking_snapshot_expected_dates($now) {
    $today = (new DateTimeImmutable('@' . intval($now)))
        ->setTimezone(activity_ranking_snapshot_timezone())->setTime(0, 0, 0);
    $end = $today->modify('-1 day');
    return array($end->modify('-89 days'), $end);
}

function activity_ranking_snapshot_valid($snapshot) {
    if (!is_array($snapshot) || !isset($snapshot['version'], $snapshot['generatedAt'], $snapshot['startDate'],
        $snapshot['endDate'], $snapshot['records']) || $snapshot['version'] !== 1
        || !is_int($snapshot['generatedAt']) || !is_array($snapshot['records'])) return false;

    $start = activity_ranking_snapshot_date($snapshot['startDate']);
    $end = activity_ranking_snapshot_date($snapshot['endDate']);
    if (!$start || !$end || $start->modify('+89 days')->format('Y-m-d') !== $snapshot['endDate']
        || count($snapshot['records']) > 100) return false;

    $last_activity = null;
    $expected_rank = 0;
    $seen_usernames = array();
    foreach ($snapshot['records'] as $index => $record) {
        if (!is_array($record) || !isset($record['rank'], $record['username'], $record['activity'])
            || !is_int($record['rank']) || $record['rank'] < 1 || $record['rank'] > 100
            || !is_string($record['username']) || $record['username'] === ''
            || !is_int($record['activity']) || $record['activity'] < 0 || $record['activity'] > 4500) return false;
        $username_key = strtolower($record['username']);
        if (isset($seen_usernames[$username_key])) return false;
        $seen_usernames[$username_key] = true;
        if ($last_activity === null || $record['activity'] !== $last_activity) $expected_rank = $index + 1;
        if ($record['rank'] !== $expected_rank) return false;
        if ($last_activity !== null && $record['activity'] > $last_activity) return false;
        $last_activity = $record['activity'];
    }
    return true;
}

function activity_ranking_snapshot_query($con, $sql) {
    $result = mysqli_query($con, $sql);
    if (!$result) throw new RuntimeException('读取活跃排行数据失败。');
    return $result;
}

function activity_ranking_snapshot_build($con, $start, $end, $now) {
    $start_value = mysqli_real_escape_string($con, $start->format('Y-m-d'));
    $end_value = mysqli_real_escape_string($con, $end->format('Y-m-d'));
    $result = activity_ranking_snapshot_query($con, "
        SELECT daily.username, SUM(LEAST(daily.daily_activity, 50)) AS activity
        FROM (
            SELECT username, date, SUM(view_times) AS daily_activity
            FROM username_view
            WHERE username <> '' AND date >= '$start_value' AND date <= '$end_value'
            GROUP BY username, date
        ) AS daily
        INNER JOIN userinfo ON userinfo.username = daily.username
        GROUP BY daily.username
        ORDER BY activity DESC, daily.username ASC
        LIMIT 100");

    $records = array();
    $last_activity = null;
    $rank = 0;
    $position = 0;
    while (($row = mysqli_fetch_assoc($result)) !== null) {
        $position++;
        $activity = intval($row['activity']);
        if ($last_activity === null || $activity !== $last_activity) $rank = $position;
        $records[] = array(
            'rank' => $rank,
            'username' => strval($row['username']),
            'activity' => $activity,
        );
        $last_activity = $activity;
    }
    mysqli_free_result($result);

    $snapshot = array(
        'version' => 1,
        'generatedAt' => intval($now),
        'startDate' => $start->format('Y-m-d'),
        'endDate' => $end->format('Y-m-d'),
        'records' => $records,
    );
    if (!activity_ranking_snapshot_valid($snapshot)) throw new RuntimeException('活跃排行快照校验失败。');
    return $snapshot;
}

function activity_ranking_snapshot_write($path, $snapshot) {
    $json = json_encode($snapshot, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || strlen($json) > 4194304) throw new RuntimeException('活跃排行快照编码失败。');
    $temporary = $path . '.tmp-' . getmypid() . '-' . uniqid('', true);
    if (@file_put_contents($temporary, $json, LOCK_EX) !== strlen($json) || !@rename($temporary, $path)) {
        @unlink($temporary);
        throw new RuntimeException('无法发布活跃排行快照文件。');
    }
}

function activity_ranking_snapshot_refresh($now = null, $con = null) {
    if (PHP_SAPI !== 'cli') return array('status' => 'error', 'message' => '活跃排行结算仅允许命令行执行。');
    $now = $now === null ? time() : intval($now);
    $dates = activity_ranking_snapshot_expected_dates($now);
    $start = $dates[0];
    $end = $dates[1];
    $root = activity_ranking_snapshot_root();
    if (!is_dir($root) && !@mkdir($root, 0775, true)) {
        return array('status' => 'error', 'message' => '无法创建活跃排行快照目录。');
    }

    $lock = @fopen($root . '/refresh.lock', 'c');
    if (!$lock) return array('status' => 'error', 'message' => '无法打开活跃排行结算锁。');
    if (!@flock($lock, LOCK_EX | LOCK_NB)) {
        fclose($lock);
        return array('status' => 'busy');
    }

    $owns_connection = false;
    try {
        $path = $root . '/current.json';
        $previous = activity_ranking_snapshot_read_json($path);
        if ($previous && activity_ranking_snapshot_valid($previous)
            && $previous['endDate'] === $end->format('Y-m-d')) {
            return array('status' => 'fresh', 'endDate' => $previous['endDate']);
        }
        if ($previous && activity_ranking_snapshot_valid($previous)
            && $previous['endDate'] > $end->format('Y-m-d')) {
            throw new RuntimeException('已有活跃排行快照晚于结算日期，请检查服务器时间。');
        }
        if (!$con) {
            require_once dirname(dirname(__DIR__)) . '/lib.php';
            $con = dbconnect_mysqli();
            $owns_connection = true;
        }
        if (!$con) throw new RuntimeException('无法连接活跃排行数据库。');
        $snapshot = activity_ranking_snapshot_build($con, $start, $end, $now);
        activity_ranking_snapshot_write($path, $snapshot);
        return array('status' => 'refreshed', 'startDate' => $snapshot['startDate'],
            'endDate' => $snapshot['endDate'], 'count' => count($snapshot['records']));
    } catch (Exception $error) {
        return array('status' => 'error', 'message' => $error->getMessage());
    } finally {
        if ($owns_connection && $con) mysqli_close($con);
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}
