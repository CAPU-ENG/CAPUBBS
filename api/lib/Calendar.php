<?php
// Shared persistence for the new and legacy calendar editors.
function calendar_query($con, $sql) {
    $result = mysqli_query($con, $sql);
    if ($result === false) throw new RuntimeException('日历数据库操作失败。');
    return $result;
}

function calendar_quote($con, $value) {
    return $value === null ? 'NULL' : "'" . mysqli_real_escape_string($con, $value) . "'";
}

function calendar_valid_date($date) {
    return is_string($date) && preg_match('/^(\d{4})-(\d{2})-(\d{2})$/D', $date, $m)
        && intval($m[1]) >= 1000 && checkdate(intval($m[2]), intval($m[3]), intval($m[1]));
}

function calendar_request_date($params) {
    $date = sprintf('%04d-%02d-%02d', intval(isset($params['year']) ? $params['year'] : 0),
        intval(isset($params['month']) ? $params['month'] : 0), intval(isset($params['day']) ? $params['day'] : 0));
    if (!calendar_valid_date($date)) throw new InvalidArgumentException('请选择有效日期。');
    return $date;
}

function calendar_validate_event($event, $date, $previous = array()) {
    if (!is_array($event)) throw new InvalidArgumentException('活动数据无效。');
    $time = isset($event['time']) ? $event['time'] : '';
    if (!is_string($time) || !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/D', $time)) {
        throw new InvalidArgumentException('请选择有效活动时间。');
    }
    $title = isset($event['title']) && is_string($event['title']) ? trim($event['title']) : '';
    $content = isset($event['content']) ? $event['content'] : '';
    // Respect the existing table widths; never silently truncate user input.
    if ($title === '' || mb_strlen($title, 'UTF-8') > 20 || !is_string($content) || mb_strlen($content, 'UTF-8') > 40) {
        throw new InvalidArgumentException('活动标题最多 20 字，描述最多 40 字。');
    }
    $end = array_key_exists('end', $event) ? $event['end'] : (isset($previous['end']) ? $previous['end'] : null);
    if ($end === '') $end = null;
    if ($end !== null) {
        if (!is_string($end)) throw new InvalidArgumentException('结束时间无效。');
        $end = str_replace('T', ' ', $end);
        if (!preg_match('/^(\d{4}-\d{2}-\d{2}) ([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/D', $end, $m)
            || !calendar_valid_date($m[1])) throw new InvalidArgumentException('结束时间无效。');
        if (strlen($end) === 16) $end .= ':00';
        if ($end <= $date . ' ' . $time . ':00') throw new InvalidArgumentException('结束时间必须晚于开始时间。');
    }
    $url = array_key_exists('url', $event) ? $event['url'] : (isset($previous['url']) ? $previous['url'] : null);
    if ($url !== null && !is_string($url)) throw new InvalidArgumentException('帖子链接无效。');
    $url = $url === null ? null : trim($url);
    if ($url === '') $url = null;
    if ($url !== null && (mb_strlen($url, 'UTF-8') > 2048 || preg_match('/[\x00-\x20\\\\]/', $url)
        || !(filter_var($url, FILTER_VALIDATE_URL) && preg_match('#^https?://#i', $url)
            || preg_match('#^/(?!/)#', $url) || substr($url, 0, 1) === '?'))) {
        throw new InvalidArgumentException('请填写有效的 HTTP(S) 或站内帖子链接。');
    }
    return array('year' => substr($date, 0, 4), 'month' => substr($date, 5, 2), 'day' => substr($date, 8, 2),
        'time' => $time, 'title' => $title, 'content' => $content, 'url' => $url, 'end' => $end);
}

function calendar_event_id($event) {
    if (!isset($event['id']) || $event['id'] === '') return '';
    if (!is_scalar($event['id']) || !preg_match('/^[1-9]\d*$/D', strval($event['id']))) {
        throw new InvalidArgumentException('活动标识无效。');
    }
    return strval($event['id']);
}

function calendar_write_event($con, $event, $id) {
    $assignments = array();
    foreach ($event as $key => $value) $assignments[] = '`' . $key . '`=' . calendar_quote($con, $value);
    if ($id !== '') {
        calendar_query($con, 'UPDATE capubbs.calendar SET ' . implode(',', $assignments) . ' WHERE id=' . calendar_quote($con, $id));
    } else {
        calendar_query($con, 'INSERT INTO capubbs.calendar SET ' . implode(',', $assignments));
        $id = strval(mysqli_insert_id($con));
    }
    return $id;
}

function calendar_save($con, $params) {
    // The original table is MyISAM. A table lock serializes both editors;
    // validate the complete request before writing anything.
    calendar_query($con, 'LOCK TABLES capubbs.calendar WRITE');
    try {
        $action = isset($params['action']) ? $params['action'] : '';
        if ($action !== '') {
            if ($action !== 'save' && $action !== 'delete') throw new InvalidArgumentException('日历操作无效。');
            $id = calendar_event_id($params);
            $previous = array();
            if ($id !== '') {
                $previous = mysqli_fetch_assoc(calendar_query($con, 'SELECT * FROM capubbs.calendar WHERE id=' . calendar_quote($con, $id)));
                if (!$previous) throw new InvalidArgumentException('活动已删除，请刷新日历。');
            }
            if ($action === 'delete') {
                if ($id === '') throw new InvalidArgumentException('活动标识无效。');
                calendar_query($con, 'DELETE FROM capubbs.calendar WHERE id=' . calendar_quote($con, $id));
                return array(array('code' => '0'));
            }
            $event = calendar_validate_event($params, calendar_request_date($params), $previous);
            $id = calendar_write_event($con, $event, $id);
            return array(array('code' => '0'), array('id' => $id));
        }
        // Legacy editor submits all events starting on one day.
        $date = calendar_request_date($params);
        $events = json_decode(isset($params['content']) ? $params['content'] : '', true);
        if (!is_array($events) || array_values($events) !== $events) throw new InvalidArgumentException('日历数据无效。');
        $existing = array();
        $result = calendar_query($con, "SELECT * FROM capubbs.calendar WHERE year=" . intval(substr($date, 0, 4))
            . ' AND month=' . intval(substr($date, 5, 2)) . ' AND day=' . intval(substr($date, 8, 2)) . ' ORDER BY id');
        while ($row = mysqli_fetch_assoc($result)) $existing[strval($row['id'])] = $row;
        $used = array();
        $prepared = array();
        foreach ($events as $event) {
            if (!is_array($event)) throw new InvalidArgumentException('活动数据无效。');
            $id = calendar_event_id($event);
            // Old cached clients may omit IDs. Match unchanged events once.
            if ($id === '') {
                foreach ($existing as $candidateId => $candidate) {
                    if (!isset($used[$candidateId]) && $candidate['time'] === (isset($event['time']) ? $event['time'] : '')
                        && $candidate['title'] === (isset($event['title']) ? $event['title'] : '')
                        && strval($candidate['content']) === strval(isset($event['content']) ? $event['content'] : '')) {
                        $id = strval($candidateId);
                        break;
                    }
                }
            }
            if ($id !== '' && (!isset($existing[$id]) || isset($used[$id]))) throw new InvalidArgumentException('活动已变更，请刷新日历。');
            $prepared[] = array('id' => $id, 'event' => calendar_validate_event($event, $date, $id !== '' ? $existing[$id] : array()));
            if ($id !== '') $used[$id] = true;
        }
        foreach ($prepared as $item) calendar_write_event($con, $item['event'], $item['id']);
        $deleted = array();
        foreach ($existing as $id => $row) if (!isset($used[$id])) $deleted[] = calendar_quote($con, strval($id));
        if ($deleted) calendar_query($con, 'DELETE FROM capubbs.calendar WHERE id IN (' . implode(',', $deleted) . ')');
        return array(array('code' => '0'));
    } finally {
        calendar_query($con, 'UNLOCK TABLES');
    }
}
