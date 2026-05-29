<?php
// /bbs/lib/ajax_trash.php
// 供回收站管理页面 AJAX 调用的代理。
// 直接走 jiekoufunc 新路径，不经过 jiekouapi.php。

header('Content-Type: application/json; charset=utf-8');

require_once dirname(__DIR__) . '/../lib.php';
require_once dirname(__DIR__) . '/../api/dispatch.php';

$con = dbconnect_mysqli();

$params = array(
    'ask'        => isset($_POST['ask'])        ? $_POST['ask']        : '',
    'token'      => isset($_COOKIE['token'])    ? $_COOKIE['token']    : '',
    'ip'         => isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '',
    'bid'        => isset($_POST['bid'])        ? $_POST['bid']        : 0,
    'tid'        => isset($_POST['tid'])        ? $_POST['tid']        : 0,
    'pid'        => isset($_POST['pid'])        ? $_POST['pid']        : 0,
    'type'       => isset($_POST['type'])       ? $_POST['type']       : 'all',
    'trash_id'   => isset($_POST['trash_id'])   ? $_POST['trash_id']   : 0,
    'page'       => isset($_POST['page'])       ? $_POST['page']       : 1,
    'limit'      => isset($_POST['limit'])      ? $_POST['limit']      : 20,
    'days'       => isset($_POST['days'])       ? $_POST['days']       : 90,
);

$result = jiekoufunc_dispatch($con, $params);

$first = isset($result[0]) ? $result[0] : array('code' => '2', 'msg' => 'Empty response');

if (isset($first['code']) && $first['code'] != '0') {
    echo json_encode(array(
        'code' => intval($first['code']),
        'msg'  => isset($first['msg']) ? $first['msg'] : ''
    ));
} else {
    // Merge first row fields to top level so frontend can read data.restored etc.
    echo json_encode($first + array(
        'code'  => 0,
        'data'  => $result,
        'count' => count($result)
    ));
}
