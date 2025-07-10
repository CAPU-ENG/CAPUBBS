<?php
require_once "../../../../bbs/lib/mainfunc.php";
require_once '../../../../lib.php';

$con = dbconnect_mysqli();
$user = checkuser_con($con);
$username = $user["username"];

$year = @$_GET['year'];
$history = intval(@$_GET['history']);
// $is_end = @$_GET['is_end'];

if (is_null($year)) {
    // 如果不带年份参数，返回所有的信息
    $statement = "select id, username, name, reason, distance, addition, start_date, end_date, is_end
        from punishment where is_deleted=0 order by start_date, id";
} else {
    $end_year = intval($year);
    $start_year = $end_year - 1;
    $year_start_date = "$start_year-09-01";
    $year_end_date = "$end_year-08-31";

    if ($history == 0) {
        // history=1，返回开始时间位于{year-1}-09-01至{year}-08-31的罚跑
        $statement = "select id, username, name, reason, distance, addition, start_date, end_date, is_end
            from punishment 
            where 
                is_deleted = 0
                and start_date >= '$year_start_date' and start_date <= '$year_end_date'
            order by start_date, id";
    } else {
        // 如果带年数，history=1，返回
        // （1）非本年度未完成的
        // （2）非本年度完成年度在本年度的
        $statement = "select id, username, name, reason, distance, addition, start_date, end_date, is_end from punishment 
        where
            is_deleted = 0
            and start_date < '$year_start_date'
            and (
                is_end = 0 
                or (
                    is_end = 1
                    and end_date >= '$year_start_date' and end_date <= '$year_end_date'
                )
            )
        order by start_date, id
        ";
    }
}

header('Content-Type:application/json; charset=utf-8');

$result = mysqli_query($con, $statement);
$punishment = mysqli_fetch_all($result, MYSQLI_ASSOC);

$ret = array(
    "result" => $punishment,
    "debug" => $statement,
);

echo json_encode($ret);
mysqli_free_result($result);
mysqli_close($con);
