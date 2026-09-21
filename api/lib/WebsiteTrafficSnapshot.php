<?php
/** Daily public traffic snapshots. Only the CLI job may generate them. */

function website_traffic_snapshot_root() {
    $override = getenv('CAPUBBS_WEBSITE_TRAFFIC_CACHE_DIR');
    return $override !== false && trim($override) !== ''
        ? rtrim($override, '/\\') : dirname(__DIR__) . '/cache/website-traffic';
}

function website_traffic_snapshot_periods() {
    return array('week' => 7, 'month' => 30, 'year' => 365);
}

function website_traffic_snapshot_date($value) {
    if (!is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}$/D', $value)) return null;
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value, new DateTimeZone('Asia/Shanghai'));
    return $date && $date->format('Y-m-d') === $value ? $date : null;
}

function website_traffic_snapshot_read_json($path) {
    if (!is_file($path) || @filesize($path) > 4194304) return null;
    $contents = @file_get_contents($path);
    if ($contents === false || $contents === '') return null;
    $value = json_decode($contents, true);
    return is_array($value) ? $value : null;
}

function website_traffic_snapshot_manifest() {
    $value = website_traffic_snapshot_read_json(website_traffic_snapshot_root() . '/current.json');
    if (!is_array($value) || !isset($value['version'], $value['generation'], $value['endDate'], $value['generatedAt'])
        || $value['version'] !== 1 || !is_string($value['generation'])
        || !preg_match('/^\d{14}-[a-f0-9]{10}$/D', $value['generation'])
        || !website_traffic_snapshot_date($value['endDate']) || !is_int($value['generatedAt'])) return null;
    return $value;
}

function website_traffic_snapshot_valid_data($data, $period) {
    $periods = website_traffic_snapshot_periods();
    if (!isset($periods[$period]) || !is_array($data)
        || !isset($data['period'], $data['startDate'], $data['endDate'], $data['dates'], $data['total'], $data['boards'])
        || $data['period'] !== $period) return false;
    $start = website_traffic_snapshot_date($data['startDate']);
    $end = website_traffic_snapshot_date($data['endDate']);
    $length = $periods[$period];
    if (!$start || !$end || $start->modify('+' . ($length - 1) . ' days')->format('Y-m-d') !== $data['endDate']
        || !is_array($data['dates']) || !is_array($data['total']) || !is_array($data['boards'])
        || count($data['dates']) !== $length || count($data['total']) !== $length) return false;
    // Older generations did not contain check-in totals. They remain readable
    // so the first post-deploy refresh can rebuild the full year in one pass.
    $has_checkins = array_key_exists('checkins', $data);
    if ($has_checkins && (!is_array($data['checkins']) || count($data['checkins']) !== $length)) return false;
    $totals = array_fill(0, $length, 0);
    $seen = array();
    foreach ($data['boards'] as $board) {
        if (!is_array($board) || !isset($board['bid'], $board['name'], $board['views'])
            || !is_int($board['bid']) || $board['bid'] < 0 || isset($seen[$board['bid']])
            || !is_string($board['name']) || !is_array($board['views']) || count($board['views']) !== $length) return false;
        $seen[$board['bid']] = true;
        for ($index = 0; $index < $length; $index++) {
            if (!isset($board['views'][$index]) || !is_int($board['views'][$index]) || $board['views'][$index] < 0) return false;
            $totals[$index] += $board['views'][$index];
            if ($totals[$index] > 9007199254740991) return false;
        }
    }
    for ($index = 0; $index < $length; $index++) {
        if (!isset($data['dates'][$index], $data['total'][$index])
            || $data['dates'][$index] !== $start->modify('+' . $index . ' days')->format('Y-m-d')
            || !is_int($data['total'][$index]) || $data['total'][$index] !== $totals[$index]) return false;
        if ($has_checkins && (!isset($data['checkins'][$index]) || !is_int($data['checkins'][$index])
            || $data['checkins'][$index] < 0 || $data['checkins'][$index] > 9007199254740991)) return false;
    }
    return true;
}

function website_traffic_snapshot_read($period, $manifest = null) {
    $periods = website_traffic_snapshot_periods();
    if (!is_string($period) || !isset($periods[$period])) return null;
    if ($manifest === null) $manifest = website_traffic_snapshot_manifest();
    if (!$manifest) return null;
    $document = website_traffic_snapshot_read_json(
        website_traffic_snapshot_root() . '/snapshots/' . $manifest['generation'] . '/' . $period . '.json'
    );
    if (!is_array($document) || !isset($document['code'], $document['data'], $document['meta']['generation'])
        || $document['code'] !== 0 || $document['meta']['generation'] !== $manifest['generation']
        || !website_traffic_snapshot_valid_data($document['data'], $period)
        || $document['data']['endDate'] !== $manifest['endDate']) return null;
    return $document['data'];
}

function website_traffic_snapshot_write_json($path, $value) {
    $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || strlen($json) > 4194304) throw new RuntimeException('流量快照编码失败或超过大小限制。');
    $temporary = $path . '.tmp-' . getmypid() . '-' . uniqid('', true);
    if (@file_put_contents($temporary, $json, LOCK_EX) !== strlen($json) || !@rename($temporary, $path)) {
        @unlink($temporary);
        throw new RuntimeException('无法发布流量快照文件。');
    }
}

function website_traffic_snapshot_query($con, $sql) {
    $result = mysqli_query($con, $sql);
    if (!$result) throw new RuntimeException('读取流量结算数据失败。');
    return $result;
}

/** Retain settled days and query only the missing, completed days. */
function website_traffic_snapshot_build_year($con, $previous, $start, $end, $query_start) {
    $dates = array();
    for ($index = 0; $index < 365; $index++) $dates[] = $start->modify('+' . $index . ' days')->format('Y-m-d');
    $indexes = array_flip($dates);
    $boards = array();
    $checkins = array_fill(0, 365, 0);
    if ($previous) {
        foreach ($previous['boards'] as $board) {
            $values = array_fill(0, 365, 0);
            foreach ($previous['dates'] as $index => $date) {
                if (isset($indexes[$date]) && $date < $query_start->format('Y-m-d')) $values[$indexes[$date]] = $board['views'][$index];
            }
            $boards[$board['bid']] = array('bid' => $board['bid'], 'name' => $board['name'], 'views' => $values);
        }
        if (isset($previous['checkins']) && is_array($previous['checkins'])) {
            foreach ($previous['dates'] as $index => $date) {
                if (isset($indexes[$date]) && $date < $query_start->format('Y-m-d')) $checkins[$indexes[$date]] = $previous['checkins'][$index];
            }
        }
    }
    if ($query_start <= $end) {
        $known = array();
        $result = website_traffic_snapshot_query($con, 'SELECT bid, name FROM boardinfo WHERE bid>0 ORDER BY bid');
        while ($row = mysqli_fetch_assoc($result)) {
            $bid = intval($row['bid']);
            $known[$bid] = true;
            if (!isset($boards[$bid])) $boards[$bid] = array('bid' => $bid, 'views' => array_fill(0, 365, 0));
            $boards[$bid]['name'] = strval($row['name']);
        }
        mysqli_free_result($result);
        $from = $query_start->format('Y-m-d');
        $through = $end->format('Y-m-d');
        // The fixed settlement dates never come from HTTP parameters.
        $result = website_traffic_snapshot_query($con, "SELECT date, bid, SUM(view_times) AS view_times
            FROM username_view WHERE date>='$from' AND date<='$through' GROUP BY date,bid ORDER BY date,bid");
        while ($row = mysqli_fetch_assoc($result)) {
            if (!isset($indexes[$row['date']])) continue;
            $bid = max(0, intval($row['bid']));
            if (!isset($boards[$bid])) $boards[$bid] = array('bid' => $bid,
                'name' => $bid > 0 ? '版块 ' . $bid : '未归属版块', 'views' => array_fill(0, 365, 0));
            $count = $row['view_times'];
            if (!is_numeric($count) || $count < 0 || $count > 9007199254740991 || floor(floatval($count)) != $count) {
                throw new RuntimeException('流量计数超出有效范围。');
            }
            $boards[$bid]['views'][$indexes[$row['date']]] += intval($count);
        }
        mysqli_free_result($result);
        $from_key = intval($query_start->format('Ymd'));
        $through_key = intval($end->format('Ymd'));
        $result = website_traffic_snapshot_query($con, "SELECT year, month, day, COUNT(*) AS checkins
            FROM capubbs.sign
            WHERE (year * 10000 + month * 100 + day)>=$from_key
              AND (year * 10000 + month * 100 + day)<=$through_key
            GROUP BY year, month, day ORDER BY year, month, day");
        while ($row = mysqli_fetch_assoc($result)) {
            $date = sprintf('%04d-%02d-%02d', intval($row['year']), intval($row['month']), intval($row['day']));
            if (!isset($indexes[$date])) continue;
            $count = $row['checkins'];
            if (!is_numeric($count) || $count < 0 || $count > 9007199254740991 || floor(floatval($count)) != $count) {
                throw new RuntimeException('签到人数超出有效范围。');
            }
            $checkins[$indexes[$date]] = intval($count);
        }
        mysqli_free_result($result);
        foreach ($boards as $bid => $board) {
            if (!isset($known[$bid]) && array_sum($board['views']) === 0) unset($boards[$bid]);
        }
    }
    ksort($boards, SORT_NUMERIC);
    $total = array_fill(0, 365, 0);
    foreach ($boards as $board) foreach ($board['views'] as $index => $count) $total[$index] += $count;
    return array('period' => 'year', 'startDate' => $dates[0], 'endDate' => $dates[364],
        'dates' => $dates, 'total' => $total, 'checkins' => $checkins, 'boards' => array_values($boards));
}

function website_traffic_snapshot_publish($year, $now) {
    if (!website_traffic_snapshot_valid_data($year, 'year')) throw new RuntimeException('流量结算结果校验失败。');
    $root = website_traffic_snapshot_root();
    $generation = gmdate('YmdHis', $now) . '-' . substr(hash('sha256', uniqid('', true)), 0, 10);
    $directory = $root . '/snapshots/' . $generation;
    if (!@mkdir($directory, 0775, true) && !is_dir($directory)) throw new RuntimeException('无法创建流量快照目录。');
    foreach (website_traffic_snapshot_periods() as $period => $length) {
        $data = array('period' => $period, 'startDate' => $year['dates'][365 - $length], 'endDate' => $year['endDate'],
            'dates' => array_slice($year['dates'], -$length), 'total' => array_slice($year['total'], -$length),
            'checkins' => array_slice($year['checkins'], -$length), 'boards' => array());
        foreach ($year['boards'] as $board) {
            $data['boards'][] = array('bid' => $board['bid'], 'name' => $board['name'], 'views' => array_slice($board['views'], -$length));
        }
        website_traffic_snapshot_write_json($directory . '/' . $period . '.json', array(
            'code' => 0, 'message' => 'success', 'data' => $data,
            'meta' => array('generation' => $generation, 'generatedAt' => $now),
        ));
    }
    // Publish the pointer only after all three immutable documents are complete.
    website_traffic_snapshot_write_json($root . '/current.json', array(
        'version' => 1, 'generation' => $generation, 'generatedAt' => $now, 'endDate' => $year['endDate'],
    ));
    website_traffic_snapshot_cleanup($generation);
    return $generation;
}

function website_traffic_snapshot_cleanup($current) {
    $root = website_traffic_snapshot_root() . '/snapshots';
    $entries = @scandir($root, SCANDIR_SORT_DESCENDING);
    if ($entries === false) return;
    $kept = 0;
    foreach ($entries as $entry) {
        if (!preg_match('/^\d{14}-[a-f0-9]{10}$/D', $entry) || !is_dir($root . '/' . $entry)) continue;
        if (++$kept <= 7 || $entry === $current) continue;
        foreach (array('week', 'month', 'year') as $period) @unlink($root . '/' . $entry . '/' . $period . '.json');
        @rmdir($root . '/' . $entry);
    }
}

function website_traffic_snapshot_refresh($initialize = false, $now = null, $con = null) {
    if (PHP_SAPI !== 'cli') return array('status' => 'error', 'message' => '流量结算仅允许命令行执行。');
    $now = $now === null ? time() : $now;
    $today = (new DateTimeImmutable('@' . $now))->setTimezone(new DateTimeZone('Asia/Shanghai'))->setTime(0, 0);
    $end = $today->modify('-1 day');
    $start = $end->modify('-364 days');
    $root = website_traffic_snapshot_root();
    if (!is_dir($root) && !@mkdir($root, 0775, true)) return array('status' => 'error', 'message' => '无法创建流量快照目录。');
    $lock = @fopen($root . '/refresh.lock', 'c');
    if (!$lock) return array('status' => 'error', 'message' => '无法打开流量结算锁。');
    if (!@flock($lock, LOCK_EX | LOCK_NB)) { fclose($lock); return array('status' => 'busy'); }
    $owns_connection = false;
    try {
        $manifest = website_traffic_snapshot_manifest();
        $previous = website_traffic_snapshot_read('year', $manifest);
        if (!$previous && !$initialize) throw new RuntimeException('请先执行 --initialize 生成历史快照。');
        if ($previous && $previous['endDate'] > $end->format('Y-m-d')) throw new RuntimeException('已有快照晚于结算日期，请检查服务器时间。');
        $needs_checkin_rebuild = $previous && !isset($previous['checkins']);
        if (!$initialize && !$needs_checkin_rebuild && $previous['endDate'] === $end->format('Y-m-d')
            && website_traffic_snapshot_has_checkins('week', $manifest)
            && website_traffic_snapshot_has_checkins('month', $manifest)) {
            return array('status' => 'fresh', 'endDate' => $previous['endDate']);
        }
        $query_start = !$initialize && $previous && !$needs_checkin_rebuild
            ? website_traffic_snapshot_date($previous['endDate'])->modify('+1 day') : $start;
        if ($query_start < $start) $query_start = $start;
        if ($query_start <= $end && !$con) { $con = dbconnect_mysqli(); $owns_connection = true; }
        if ($query_start <= $end && !$con) throw new RuntimeException('无法连接流量结算数据库。');
        $year = website_traffic_snapshot_build_year($con, $initialize || $needs_checkin_rebuild ? null : $previous, $start, $end, $query_start);
        $generation = website_traffic_snapshot_publish($year, $now);
        return array('status' => 'refreshed', 'endDate' => $year['endDate'], 'generation' => $generation,
            'queryStart' => $query_start <= $end ? $query_start->format('Y-m-d') : null);
    } catch (Exception $error) {
        return array('status' => 'error', 'message' => $error->getMessage());
    } catch (Throwable $error) {
        return array('status' => 'error', 'message' => $error->getMessage());
    } finally {
        if ($owns_connection && $con) mysqli_close($con);
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function website_traffic_snapshot_has_checkins($period, $manifest) {
    $data = website_traffic_snapshot_read($period, $manifest);
    return $data !== null && isset($data['checkins']) && is_array($data['checkins']);
}
