<?php
require_once '../../../lib.php';
require_once("activityService.php");
require_once("../../../third/PHPExcel/Classes/PHPExcel.php");
require_once("../../lib/mainfunc.php");

$user = getuser();
$username = $user["username"];
$bid = $_GET["bid"];
$tid = $_GET["tid"];
// $activity_id = $_GET["activity_id"];

$INDEX = array("A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P");

$activity = getActivity($bid, $tid);
// if (!$activity || ($activity["leader_username"] != $username && "网络组" != $username)) {
//     echo "error: ";
//     echo $username;
//     exit();
// }
$activity_id = $activity["activity_id"];
$join_value = get_activity_join($activity_id);

// Create new PHPExcel object
$objPHPExcel = new PHPExcel();

// Set document properties
$objPHPExcel->getProperties()->setCreator("CAPUBBS")
							 ->setLastModifiedBy("CAPUBBS")
							 ->setTitle("Office 2007 XLSX Test Document")
							 ->setSubject("Office 2007 XLSX Test Document")
							 ->setDescription("Test document for Office 2007 XLSX, generated using PHP classes.")
							 ->setKeywords("office 2007 openxml php")
							 ->setCategory("Test result file");

$objPHPExcel->setActiveSheetIndex(0)->setCellValue("A1", "用户名");
for ($option_idx=0; $option_idx < count(@$activity["options"]); $option_idx++){
    $option = $activity["options"][$option_idx];
    $objPHPExcel->setActiveSheetIndex(0)->setCellValue(($INDEX[$option_idx+1])."1", $option["option_name"]);
}

$line_idx = 1;
for ($user_idx = 0; $user_idx < count(@$join_value); $user_idx++){
    $_username = $join_value[$user_idx]['username'];
    $_option_value = $join_value[$user_idx]['option_value'];
    $cancel = $join_value[$user_idx]['cancel'];
    if ($cancel)
        continue;
    
    $line_idx++;
    $objPHPExcel->setActiveSheetIndex(0)->setCellValue("A".($line_idx), $_username);
    for ($option_idx=0; $option_idx < count(@$activity["options"]); $option_idx++){
        $option = $activity["options"][$option_idx];
        if ($option["option_name"] == "想说的话")
            break;
        $objPHPExcel->setActiveSheetIndex(0)->setCellValue(($INDEX[$option_idx+1]).($line_idx), ($_option_value[$option["option_id"]]));
    }
}

// Rename worksheet
$objPHPExcel->getActiveSheet()->setTitle('名单');

// Set active sheet index to the first sheet, so Excel opens this as the first sheet
$objPHPExcel->setActiveSheetIndex(0);

// Redirect output to a client’s web browser (Excel5)
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="拉练名单.xlsx"');
header('Cache-Control: max-age=0');
// If you're serving to IE 9, then the following may be needed
header('Cache-Control: max-age=1');

// If you're serving to IE over SSL, then the following may be needed
header ('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past
header ('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT'); // always modified
header ('Cache-Control: cache, must-revalidate'); // HTTP/1.1
header ('Pragma: public'); // HTTP/1.0

$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
$objWriter->save('php://output');
exit;