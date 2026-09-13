<?php
/**
 * Handler functions for mainpage admin operations originally in
 * /assets/api/main.php. These mirror the original behaviour but
 * return dispatch-format arrays so api.php can wrap them in the
 * standard JSON envelope via ApiResponse::fromDispatchResult().
 *
 * The original /assets/api/main.php remains untouched and continues
 * to work for legacy callers.
 */

/**
 * Dispatch table for mainpage-specific ask values.
 * Returns a dispatch-format array.
 */
function mainpage_dispatch($con, $params) {
    $ask = isset($params['ask']) ? $params['ask'] : '';

    if ($ask === 'getfilesize')    return mainpage_getfilesize($params);
    if ($ask === 'loadcalendar')   return mainpage_loadcalendar($con, $params);
    if ($ask === 'savecalendar')   return mainpage_savecalendar($con, $params);
    if ($ask === 'addinform')      return mainpage_addinform($con, $params);
    if ($ask === 'delinform')      return mainpage_delinform($con, $params);
    if ($ask === 'saveimg')        return mainpage_saveimg($con, $params);
    if ($ask === 'add_download')   return mainpage_add_download($con, $params);
    if ($ask === 'edit_download')  return mainpage_edit_download($con, $params);
    if ($ask === 'del_download')   return mainpage_del_download($con, $params);

    return array(array('code' => '14', 'msg' => 'Unknown mainpage ask'));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check login + rights. Returns the rights level on success,
 * or a dispatch error array on failure.
 */
function mainpage_check_auth($con) {
    $res = checkuser_con($con);
    $rights = (int)$res[1];
    if ($rights === 0) {
        return array(array('code' => '-18', 'msg' => '请先登录'));
    }
    return $rights;
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

function mainpage_getfilesize($params) {
    $url = isset($params['url']) ? $params['url'] : '';
    if (empty($url)) {
        return array(array('code' => '6', 'msg' => 'Missing url'));
    }
    $info = @get_headers($url, true);
    $size = ($info && isset($info['Content-Length'])) ? intval($info['Content-Length']) : 0;
    return array(
        array('code' => '0'),
        array('size' => $size)
    );
}

function mainpage_loadcalendar($con, $params) {
    require_once __DIR__ . '/Calendar.php';
    try {
        $date = calendar_request_date($params);
    } catch (InvalidArgumentException $error) {
        return array(array('code' => '6', 'msg' => $error->getMessage()));
    }
    $year = intval(substr($date, 0, 4));
    $month = intval(substr($date, 5, 2));
    $day = intval(substr($date, 8, 2));
    $statement = "SELECT * FROM capubbs.calendar WHERE year=$year AND month=$month AND day=$day ORDER BY time,id";
    $results = mysqli_query($con, $statement);

    $rows = array();
    while ($res = mysqli_fetch_array($results, MYSQLI_ASSOC)) {
        $row = array();
        foreach ($res as $key => $value) {
            if (is_long($key)) continue;
            $row[$key] = $value;
        }
        $rows[] = $row;
    }
    return $rows;
}

function mainpage_savecalendar($con, $params) {
    $auth = mainpage_check_auth($con);
    if (is_array($auth)) return $auth; // error array

    require_once __DIR__ . '/Calendar.php';
    try {
        return calendar_save($con, $params);
    } catch (InvalidArgumentException $error) {
        return array(array('code' => '6', 'msg' => $error->getMessage()));
    } catch (Exception $error) {
        return array(array('code' => '8', 'msg' => '日历保存失败，请稍后重试。'));
    }
}

function mainpage_addinform($con, $params) {
    $auth = mainpage_check_auth($con);
    if (is_array($auth)) return $auth;

    $title = mysqli_real_escape_string($con, isset($params['title']) ? $params['title'] : '');
    $url   = mysqli_real_escape_string($con, isset($params['url'])   ? $params['url']   : '');
    $time  = time();

    $statement = "INSERT INTO capubbs.mainpage VALUES (null, 1, '$title', '$url', '$time', '', '')";
    mysqli_query($con, $statement);
    mysqli_query($con, "ALTER TABLE capubbs.mainpage ORDER BY number");

    $errno = mysqli_errno($con);
    if ($errno !== 0) {
        return array(array('code' => '8', 'msg' => 'Database error: ' . $errno));
    }
    return array(array('code' => '0'));
}

function mainpage_delinform($con, $params) {
    $auth = mainpage_check_auth($con);
    if (is_array($auth)) return $auth;

    $time = intval(isset($params['time']) ? $params['time'] : 0);
    mysqli_query($con, "DELETE FROM capubbs.mainpage WHERE id=1 AND field3='$time'");
    mysqli_query($con, "ALTER TABLE capubbs.mainpage ORDER BY number");

    $errno = mysqli_errno($con);
    if ($errno !== 0) {
        return array(array('code' => '8', 'msg' => 'Database error: ' . $errno));
    }
    return array(array('code' => '0'));
}

function mainpage_saveimg($con, $params) {
    $auth = mainpage_check_auth($con);
    if (is_array($auth)) return $auth;

    mysqli_query($con, "DELETE FROM capubbs.mainpage WHERE id=0");

    $json = isset($params['json']) ? $params['json'] : '';
    $images = json_decode($json, true);
    if (is_array($images)) {
        // Sort by id (matching legacy behaviour)
        usort($images, function($a, $b) {
            $al = (int)(isset($a['id']) ? $a['id'] : 0);
            $bl = (int)(isset($b['id']) ? $b['id'] : 0);
            return ($al > $bl) ? 1 : -1;
        });
        foreach ($images as $img) {
            $fld1 = mysqli_real_escape_string($con, isset($img['img'])      ? $img['img']      : '');
            $fld2 = mysqli_real_escape_string($con, isset($img['imgthumb']) ? $img['imgthumb'] : '');
            $fld3 = mysqli_real_escape_string($con, isset($img['title'])    ? $img['title']    : '');
            mysqli_query($con, "INSERT INTO capubbs.mainpage VALUES (null, 0, '$fld1', '$fld2', '$fld3', '', '')");
        }
    }

    mysqli_query($con, "ALTER TABLE capubbs.mainpage ORDER BY number");

    $errno = mysqli_errno($con);
    if ($errno !== 0) {
        return array(array('code' => '8', 'msg' => 'Database error: ' . $errno));
    }
    return array(array('code' => '0'));
}

function mainpage_add_download($con, $params) {
    $auth = mainpage_check_auth($con);
    if (is_array($auth)) return $auth;

    $title = mysqli_real_escape_string($con, isset($params['title']) ? $params['title'] : '');
    $url   = mysqli_real_escape_string($con, isset($params['url'])   ? $params['url']   : '');

    $statement = "INSERT INTO capubbs.downloads VALUES (null, '$title', '$url', 0)";
    mysqli_query($con, $statement);

    $errno = mysqli_errno($con);
    if ($errno !== 0) {
        return array(array('code' => '8', 'msg' => 'Database error: ' . $errno));
    }
    return array(array('code' => '0'));
}

function mainpage_edit_download($con, $params) {
    $auth = mainpage_check_auth($con);
    if (is_array($auth)) return $auth;

    $title = mysqli_real_escape_string($con, isset($params['title']) ? $params['title'] : '');
    $url   = mysqli_real_escape_string($con, isset($params['url'])   ? $params['url']   : '');
    $id    = (int)(isset($params['id']) ? $params['id'] : 0);

    $statement = "UPDATE capubbs.downloads SET name='$title', url='$url' WHERE id=$id";
    mysqli_query($con, $statement);

    $errno = mysqli_errno($con);
    if ($errno !== 0) {
        return array(array('code' => '8', 'msg' => 'Database error: ' . $errno));
    }
    return array(array('code' => '0'));
}

function mainpage_del_download($con, $params) {
    $auth = mainpage_check_auth($con);
    if (is_array($auth)) return $auth;

    $id = (int)(isset($params['id']) ? $params['id'] : 0);
    $statement = "DELETE FROM capubbs.downloads WHERE id=$id";
    mysqli_query($con, $statement);

    $errno = mysqli_errno($con);
    if ($errno !== 0) {
        return array(array('code' => '8', 'msg' => 'Database error: ' . $errno));
    }
    return array(array('code' => '0'));
}
