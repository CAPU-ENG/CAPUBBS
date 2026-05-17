<?php
require_once __DIR__.'/../lib.php';

header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('Asia/Shanghai');

$params = array(
    'ask'   => isset($_REQUEST['ask'])   ? $_REQUEST['ask']   : '',
    'view'  => isset($_REQUEST['view'])  ? $_REQUEST['view']  : '',
    'limit' => isset($_REQUEST['limit']) ? $_REQUEST['limit'] : '',
    'bid'   => intval(isset($_REQUEST['bid']) ? $_REQUEST['bid'] : 0),
    'tid'   => intval(isset($_REQUEST['tid']) ? $_REQUEST['tid'] : 0),
    'pid'   => intval(isset($_REQUEST['pid']) ? $_REQUEST['pid'] : 0),
    'token' => isset($_COOKIE['token'])  ? $_COOKIE['token']  : '',
    'ip'    => $_SERVER['REMOTE_ADDR'],
);

$con = dbconnect_mysqli();
require_once __DIR__.'/jiekoufunc.php';
$result = jiekoufunc_dispatch($con, $params);

if (!empty($result[0]['code']) && $result[0]['code'] != '0') {
    echo json_encode(array(
        'code' => intval($result[0]['code']),
        'msg'  => $result[0]['msg'] ?? '未知错误'
    ));
    exit;
}

$data = array_slice($result, 1);
echo json_encode(array('code' => 0, 'data' => $data, 'count' => count($data)));
