<?php
require_once "../../../../bbs/lib/mainfunc.php";

$bid = @$_GET['bid'];
$tid = @$_GET['tid'];
$fid = @$_GET['fid'];
$pid = @$_GET['pid'];

if (is_null($bid) || is_null($tid)) {
    echo "error";
    exit;
}
if (is_null($fid) && is_null($pid)) {
    echo "error";
    exit;
}

if (!is_null($fid)) {
    $floor_data = mainfunc(array("bid" => $bid, "tid" => $tid, "fid" => $fid));
} else {
    $floor_data = mainfunc(array("bid" => $bid, "tid" => $tid, "pid" => $pid));
}

if (count($floor_data) == 0) {
    echo "error";
    exit;
}
$floor = $floor_data[0];
$translated = translate($floor['text'], $floor['ishtml'] == "YES");
$translatedforquote = translateforquote($floor['text'], $floor['ishtml'] == "YES");
echo $translated;