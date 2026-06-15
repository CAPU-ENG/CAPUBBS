<?php

require_once __DIR__ . '/../../src/Bootstrap.php';

/**
 * Dispatch table for mainpage-specific ask values.
 * Returns a dispatch-format array.
 */
function mainpage_dispatch($con, $params) {
    $ask = isset($params['ask']) ? $params['ask'] : '';

    if ($ask === 'getfilesize')    return mainpage_getfilesize($con, $params);
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

function mainpage_service($con) {
    return capubbs_mainpage_service($con);
}

function mainpage_getfilesize($con, $params) {
    return mainpage_service($con)->legacyGetFilesize($params);
}

function mainpage_loadcalendar($con, $params) {
    return mainpage_service($con)->legacyLoadCalendar($params);
}

function mainpage_savecalendar($con, $params) {
    $token = isset($params['token']) ? $params['token'] : (isset($_COOKIE['token']) ? $_COOKIE['token'] : '');
    return mainpage_service($con)->legacySaveCalendar($token, $params);
}

function mainpage_addinform($con, $params) {
    $token = isset($params['token']) ? $params['token'] : (isset($_COOKIE['token']) ? $_COOKIE['token'] : '');
    return mainpage_service($con)->legacyAddInform($token, $params);
}

function mainpage_delinform($con, $params) {
    $token = isset($params['token']) ? $params['token'] : (isset($_COOKIE['token']) ? $_COOKIE['token'] : '');
    return mainpage_service($con)->legacyDeleteInform($token, $params);
}

function mainpage_saveimg($con, $params) {
    $token = isset($params['token']) ? $params['token'] : (isset($_COOKIE['token']) ? $_COOKIE['token'] : '');
    return mainpage_service($con)->legacySaveImages($token, $params);
}

function mainpage_add_download($con, $params) {
    $token = isset($params['token']) ? $params['token'] : (isset($_COOKIE['token']) ? $_COOKIE['token'] : '');
    return mainpage_service($con)->legacyAddDownload($token, $params);
}

function mainpage_edit_download($con, $params) {
    $token = isset($params['token']) ? $params['token'] : (isset($_COOKIE['token']) ? $_COOKIE['token'] : '');
    return mainpage_service($con)->legacyEditDownload($token, $params);
}

function mainpage_del_download($con, $params) {
    $token = isset($params['token']) ? $params['token'] : (isset($_COOKIE['token']) ? $_COOKIE['token'] : '');
    return mainpage_service($con)->legacyDeleteDownload($token, $params);
}
