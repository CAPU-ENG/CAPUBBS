<?php
    require_once '../lib.php';
    require_once '../src/Bootstrap.php';
    $id=intval(@$_GET['d']);
    if ($id=="") exit;
    $con = dbconnect_mysqli();
    $url = capubbs_mainpage_service($con)->resolveDownloadUrl($id);
    if (!$url) exit;
    header("Location: $url");
    exit;
?>
