<?php
    include "../../bbs/lib/mainfunc.php";

    header('Content-type: text/json');
    echo '[';
    $params = array("ask" => "calendar");
    if (isset($_GET['start_date'])) $params['start_date'] = $_GET['start_date'];
    if (isset($_GET['end_date'])) $params['end_date'] = $_GET['end_date'];
    if (isset($_GET['full'])) $params['full'] = $_GET['full'];
    $results = mainfunc($params);
    $x = 1;
    foreach ($results as $res) {
        if ($x == 0) echo ',';

        $year  = $res[0];
        $month = $res[1];
        $day   = $res[2];
        $time  = $res[3];
        $title = $res[4];
        $text  = $res[5];

        echo '{ "date":"' . $year . '-' . $month . '-' . $day . ' ' . $time . ':00","type":"meeting","title":"' . $title . '","description":"' . $text . '","url":""}';
        $x = 0;
    }
    echo ']';
?>
