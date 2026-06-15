<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../api/jiekoufunc.php';
require_once __DIR__ . '/../api/lib/MainpageHandlers.php';

$con = dbconnect_mysqli();
if (!$con) {
    fwrite(STDERR, "db-connect-failed\n");
    exit(1);
}

function mainpage_domain_fail($msg) {
    fwrite(STDERR, $msg . "\n");
    exit(1);
}

function mainpage_domain_assert_true($cond, $msg) {
    if (!$cond) {
        mainpage_domain_fail($msg);
    }
}

function mainpage_domain_assert_code($result, $code, $msg) {
    $actual = isset($result[0]['code']) ? strval($result[0]['code']) : 'missing';
    if ($actual !== strval($code)) {
        mainpage_domain_fail($msg . ': expected code ' . $code . ', got ' . $actual . ' => ' . json_encode($result, JSON_UNESCAPED_UNICODE));
    }
}

$ts = time();
$username = 'mainpagesvc_' . $ts;
$token = md5($username . '_seed');
$date = date('Y-m-d');
$ip = '127.0.0.1';
$service = capubbs_mainpage_service($con);
$repo = capubbs_mainpage_repository($con);

$informTitle = 'mainpage-inform-' . $ts;
$informUrl = 'https://example.com/?bid=1&tid=1&ts=' . $ts;
$downloadTitle = 'mainpage-download-' . $ts;
$downloadUrl = 'https://example.com/download-' . $ts;
$downloadTitleEdited = $downloadTitle . '-edit';
$downloadUrlEdited = $downloadUrl . '/edit';
$year = '2099';
$month = '12';
$day = str_pad(strval(($ts % 27) + 1), 2, '0', STR_PAD_LEFT);
$calendarEvents = array(
    array('time' => '08:30', 'title' => 'event-a-' . $ts, 'content' => 'content-a-' . $ts),
    array('time' => '19:00', 'title' => 'event-b-' . $ts, 'content' => 'content-b-' . $ts),
);

$esc = function($value) use ($con) {
    return mysqli_real_escape_string($con, $value);
};

mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($username)}'");
mysqli_query($con, "INSERT INTO userinfo (username,password,token,tokentime,sex,icon,mail,verified,email_visible,place,regdate,lastdate,lastip,post,reply,extr,sign,water,star,onlinetype,rights)
    VALUES ('{$esc($username)}','" . strtoupper(md5('test123456')) . "','{$esc($token)}'," . (time() + 86400) . ",'男','/bbsimg/icons/default.jpg','{$esc($username)}@pku.edu.cn',1,0,'北京','$date','$date','$ip',0,0,0,0,0,9,'web',1)");
if (mysqli_errno($con)) {
    mainpage_domain_fail('insert admin-like user failed: ' . mysqli_error($con));
}

$downloadId = 0;
$informTime = '';

$imageRows = $repo->findRowsById(0, '', null);
$imagePayload = array();
foreach ($imageRows as $index => $row) {
    $imagePayload[] = array(
        'id' => strval($index),
        'img' => isset($row['field1']) ? $row['field1'] : '',
        'imgthumb' => isset($row['field2']) ? $row['field2'] : '',
        'title' => isset($row['field3']) ? $row['field3'] : '',
    );
}

$result = $service->legacyGetFilesize(array('url' => 'http://localhost/assets/images/capu.jpg'));
mainpage_domain_assert_code($result, 0, 'getfilesize');
mainpage_domain_assert_true(isset($result[1]['size']) && intval($result[1]['size']) > 0, 'getfilesize size invalid');

$result = jiekoufunc_news($con, $token, array(
    'method' => 'add',
    'text' => $informTitle,
    'url' => $informUrl,
));
mainpage_domain_assert_code($result, 0, 'news add');
$informRow = mysqli_fetch_array(mysqli_query($con, "SELECT field3 FROM capubbs.mainpage WHERE id=1 AND field1='{$esc($informTitle)}' LIMIT 1"), MYSQLI_ASSOC);
mainpage_domain_assert_true($informRow && isset($informRow['field3']), 'announcement row not inserted');
$informTime = $informRow['field3'];

$home = $service->getHomepageSections(20);
$foundInform = false;
foreach ($home['announcements'] as $row) {
    if (isset($row['field1']) && $row['field1'] === $informTitle) {
        $foundInform = true;
        break;
    }
}
mainpage_domain_assert_true($foundInform, 'announcement missing from homepage sections');

$result = $service->legacySaveCalendar($token, array(
    'year' => $year,
    'month' => $month,
    'day' => $day,
    'content' => json_encode($calendarEvents, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
));
mainpage_domain_assert_code($result, 0, 'savecalendar');

$calendarRows = $service->legacyLoadCalendar(array(
    'year' => $year,
    'month' => $month,
    'day' => $day,
));
mainpage_domain_assert_true(count($calendarRows) === 2, 'calendar row count mismatch');
mainpage_domain_assert_true($calendarRows[0]['title'] === $calendarEvents[0]['title'], 'calendar title mismatch');

$allCalendar = jiekoufunc_calendar($con);
$foundCalendar = false;
foreach ($allCalendar as $row) {
    if (isset($row[0]) && strval($row[0]) === $year && isset($row[4]) && $row[4] === $calendarEvents[0]['title']) {
        $foundCalendar = true;
        break;
    }
}
mainpage_domain_assert_true($foundCalendar, 'calendar rows not exposed via jiekoufunc_calendar');

$result = $service->legacySaveImages($token, array(
    'json' => json_encode($imagePayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
));
mainpage_domain_assert_code($result, 0, 'saveimg');
$imageRowsAfter = $repo->findRowsById(0, '', null);
mainpage_domain_assert_true(count($imageRowsAfter) === count($imagePayload), 'saveimg image count mismatch');

$result = $service->legacyAddDownload($token, array(
    'title' => $downloadTitle,
    'url' => $downloadUrl,
));
mainpage_domain_assert_code($result, 0, 'add_download');

$downloads = $service->getDownloads(50);
$foundDownload = false;
foreach ($downloads as $row) {
    if (isset($row['name']) && $row['name'] === $downloadTitle) {
        $foundDownload = true;
        $downloadId = intval($row['id']);
        break;
    }
}
mainpage_domain_assert_true($foundDownload && $downloadId > 0, 'download not inserted');

$result = $service->legacyEditDownload($token, array(
    'id' => $downloadId,
    'title' => $downloadTitleEdited,
    'url' => $downloadUrlEdited,
));
mainpage_domain_assert_code($result, 0, 'edit_download');
$downloadRow = mysqli_fetch_array(mysqli_query($con, "SELECT name, url, times FROM capubbs.downloads WHERE id=$downloadId LIMIT 1"), MYSQLI_ASSOC);
mainpage_domain_assert_true($downloadRow && $downloadRow['name'] === $downloadTitleEdited, 'download title not updated');
mainpage_domain_assert_true($downloadRow['url'] === $downloadUrlEdited, 'download url not updated');

$resolvedUrl = $service->resolveDownloadUrl($downloadId);
mainpage_domain_assert_true($resolvedUrl === $downloadUrlEdited, 'resolveDownloadUrl mismatch');
$downloadRow = mysqli_fetch_array(mysqli_query($con, "SELECT times FROM capubbs.downloads WHERE id=$downloadId LIMIT 1"), MYSQLI_ASSOC);
mainpage_domain_assert_true($downloadRow && intval($downloadRow['times']) >= 1, 'download times not incremented');

$result = $service->legacyDeleteDownload($token, array('id' => $downloadId));
mainpage_domain_assert_code($result, 0, 'del_download');
$downloadRow = mysqli_fetch_array(mysqli_query($con, "SELECT id FROM capubbs.downloads WHERE id=$downloadId LIMIT 1"), MYSQLI_ASSOC);
mainpage_domain_assert_true(!$downloadRow, 'download not deleted');

$result = jiekoufunc_news($con, $token, array(
    'method' => 'delete',
    'time' => $informTime,
));
mainpage_domain_assert_code($result, 0, 'news delete');
$informRow = mysqli_fetch_array(mysqli_query($con, "SELECT field3 FROM capubbs.mainpage WHERE id=1 AND field1='{$esc($informTitle)}' LIMIT 1"), MYSQLI_ASSOC);
mainpage_domain_assert_true(!$informRow, 'announcement not deleted');

$result = mainpage_dispatch($con, array(
    'ask' => 'loadcalendar',
    'year' => $year,
    'month' => $month,
    'day' => $day,
));
mainpage_domain_assert_true(count($result) === 2, 'mainpage dispatch loadcalendar mismatch');

mysqli_query($con, "DELETE FROM capubbs.mainpage WHERE id=1 AND field1='{$esc($informTitle)}'");
mysqli_query($con, "DELETE FROM capubbs.calendar WHERE year='{$esc($year)}' AND month='{$esc($month)}' AND day='{$esc($day)}'");
if ($downloadId > 0) {
    mysqli_query($con, "DELETE FROM capubbs.downloads WHERE id=$downloadId");
}
mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($username)}'");

echo "mainpage-domain-ok\n";
