<?php
require_once "../../bbs/lib/mainfunc.php";
require_once '../../lib.php';

$con = dbconnect_mysqli();

$bid=@$_GET['bid'];
$tid=@$_GET['tid'];
$fid=@$_GET['fid'];
$pid=@$_GET['pid'];

if (is_null($bid) || is_null($tid)) {
    echo "error";
    exit;
}
if (is_null($fid) && is_null($pid)) {
    echo "error";
    exit;
}

if (!is_null($fid)) {
    $statement = "select bid, tid, fid, pid, text, ishtml from posts where bid=$bid and tid=$tid and fid=$fid";
} else {
    $statement = "select bid, tid, fid, pid, text, ishtml from posts where bid=$bid and tid=$tid and pid=$pid";
}
$result = mysqli_query($con, $statement);
if (is_null($result)) {
    echo "error";
    exit;
}
$floor = mysqli_fetch_array($result, MYSQLI_ASSOC);
$translated=translate($floor['text'],$floor['ishtml']=="YES");
$translatedforquote=translateforquote($floor['text'],$floor['ishtml']=="YES");
echo $translated;
mysqli_free_result($result);
mysqli_close($con);
