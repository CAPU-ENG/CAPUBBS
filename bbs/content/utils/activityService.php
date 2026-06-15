<?php

require_once __DIR__ . '/../../../lib.php';
require_once __DIR__ . '/../../../src/Bootstrap.php';

function capubbs_activity_legacy_service() {
    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");
    return capubbs_activity_service($con);
}

function get_joint($username, $activity_id) {
    return capubbs_activity_legacy_service()->hasJoined($username, $activity_id);
}

function get_activity_join($activity_id) {
    return capubbs_activity_legacy_service()->getActivityJoin($activity_id);
}

function get_activity_join_remind($activity_id) {
    return capubbs_activity_legacy_service()->getActivityJoinRemind($activity_id);
}

function get_canceled($username, $activity_id) {
    return capubbs_activity_legacy_service()->isCanceled($username, $activity_id);
}

function createActivity($username, $bid, $title, $text, $options, $sig, $attachs = '') {
    return capubbs_activity_legacy_service()->createActivity($username, $bid, $title, $text, $options, $sig, $attachs);
}

function getUsernameOptionValue($username, $activity_id) {
    return capubbs_activity_legacy_service()->getUsernameOptionValue($username, $activity_id);
}

function getActivity($bid, $tid) {
    return capubbs_activity_legacy_service()->getActivity($bid, $tid);
}

function get_floor_num_1($username, $activity_id) {
    return capubbs_activity_legacy_service()->getFloorNumInActivity($username, $activity_id);
}

function get_floor_num_2($username, $bid, $tid) {
    return capubbs_activity_legacy_service()->getFloorNumInThread($username, $bid, $tid);
}
