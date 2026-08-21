<?php
require_once '../../../lib.php';
require_once("activityService.php");
require_once("../../lib/mainfunc.php");

$user = getuser();
$username = $user["username"];
$rights = isset($user["rights"]) ? intval($user["rights"]) : -1;
$bid = isset($_GET["bid"]) ? intval($_GET["bid"]) : 0;
$tid = isset($_GET["tid"]) ? intval($_GET["tid"]) : 0;

$activity = getActivity($bid, $tid);
$legacy_managers = array("网络组", "组织部", "文体部", "主席团", "理事会");
if (!$activity || (
        $activity["leader_username"] != $username
        && $rights < 3
        && !in_array($username, $legacy_managers, true)
    )
) {
    echo "error: ";
    echo $username;
    exit();
}
$activity_id = $activity["activity_id"];
$join_value = get_activity_join($activity_id);

function activity_export_option_value($option, $option_values) {
    $option_id = intval($option["option_id"]);
    $stored_value = isset($option_values[$option_id]) ? $option_values[$option_id] : "";
    $type_id = intval($option["type_id"]);

    if ($type_id === 1) {
        foreach ($option["cases"] as $case) {
            if (intval($stored_value) === intval($case["case_id"])) {
                return $case["case_name"];
            }
        }
        return "";
    }

    if ($type_id === 3) {
        $selected_ids = array_filter(explode(",", strval($stored_value)), "strlen");
        $selected_names = array();
        foreach ($selected_ids as $selected_id) {
            foreach ($option["cases"] as $case) {
                if (intval($selected_id) === intval($case["case_id"])) {
                    $selected_names[] = $case["case_name"];
                    break;
                }
            }
        }
        return implode("、", $selected_names);
    }

    return strval($stored_value);
}

function activity_export_write_csv_row($output, $row) {
    fputcsv($output, $row, ",", '"', "\\");
}

$download_name = "拉练名单.csv";
header("Content-Type: text/csv; charset=UTF-8");
header("Content-Disposition: attachment; filename=\"activity-" . $bid . "-" . $tid . ".csv\"; filename*=UTF-8''" . rawurlencode($download_name));
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: public");

$output = fopen("php://output", "w");
fwrite($output, "\xEF\xBB\xBF");

$header_row = array("用户名", "是否有罚跑");
for ($option_idx=0; $option_idx < count(@$activity["options"]); $option_idx++){
    $option = $activity["options"][$option_idx];
    $header_row[] = $option["option_name"];
}
activity_export_write_csv_row($output, $header_row);

for ($user_idx = 0; $user_idx < count(@$join_value); $user_idx++){
    $_username = $join_value[$user_idx]['username'];
    $_has_punishment = $join_value[$user_idx]['has_punishment'];
    $_option_value = $join_value[$user_idx]['option_value'];
    $cancel = $join_value[$user_idx]['cancel'];
    if ($cancel)
        continue;

    $row = array($_username, $_has_punishment == 1 ? "是" : "");
    for ($option_idx=0; $option_idx < count(@$activity["options"]); $option_idx++){
        $option = $activity["options"][$option_idx];
        $row[] = activity_export_option_value($option, $_option_value);
    }
    activity_export_write_csv_row($output, $row);
}

fclose($output);
exit;
