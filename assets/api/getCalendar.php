<?php
require_once __DIR__ . '/../../bbs/lib/mainfunc.php';
header('Content-Type: application/json; charset=utf-8');
$params = array('ask' => 'calendar');
foreach (array('start_date', 'end_date', 'full') as $key) {
    if (isset($_GET[$key])) $params[$key] = $_GET[$key];
}
try {
    $rows = mainfunc($params);
    $events = array();
    foreach ($rows as $row) {
        $events[] = array(
            'id' => strval($row['id']),
            'date' => sprintf('%04d-%02d-%02d %s', $row['year'], $row['month'], $row['day'], $row['time']) . (strlen($row['time']) === 5 ? ':00' : ''),
            'type' => 'meeting', 'title' => $row['title'], 'description' => $row['content'],
            'url' => $row['url'] ?: '', 'end' => $row['end'],
        );
    }
    echo json_encode($events, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Exception $error) {
    http_response_code(500);
    echo json_encode(array('message' => '日历加载失败，请稍后重试。'), JSON_UNESCAPED_UNICODE);
}
