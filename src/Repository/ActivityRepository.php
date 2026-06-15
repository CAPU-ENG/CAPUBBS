<?php

class CapubbsActivityRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function findThreadActivity($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        $result = mysqli_query($this->con, "select activity_id, bid, tid, season_id, name, leader_username from season_threads_activity where bid=$bid and tid=$tid limit 1");
        if (!$result || mysqli_num_rows($result) == 0) {
            return null;
        }
        return mysqli_fetch_array($result, MYSQLI_ASSOC);
    }

    public function deleteThreadActivityCascade($activityId, $bid, $tid) {
        $activityId = intval($activityId);
        $bid = intval($bid);
        $tid = intval($tid);

        mysqli_query($this->con, "delete from season_threads_activity where bid=$bid and tid=$tid");
        mysqli_query($this->con, "delete from season_join_option_value where join_id in (select join_id from season_activity_join where activity_id=$activityId)");
        mysqli_query($this->con, "delete from season_activity_join where activity_id=$activityId");
        mysqli_query($this->con, "delete from season_option_case where option_id in (select id from season_activity_option where activity_id=$activityId)");
        mysqli_query($this->con, "delete from season_activity_option where activity_id=$activityId");
        mysqli_query($this->con, "delete from activity_join_remind where activity_id=$activityId");
        mysqli_query($this->con, "delete from thread_global_top where bid=$bid and tid=$tid");
        return true;
    }

    public function findJoinIdByPostFid($postFid) {
        $postFid = intval($postFid);
        $result = mysqli_query($this->con, "select join_id from season_activity_join where post_fid=$postFid limit 1");
        if (!$result || mysqli_num_rows($result) == 0) {
            return null;
        }
        $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
        return intval($row['join_id']);
    }

    public function deleteJoinCascade($joinId) {
        $joinId = intval($joinId);
        mysqli_query($this->con, "delete from season_join_option_value where join_id=$joinId");
        mysqli_query($this->con, "delete from season_activity_join where join_id=$joinId");
        return true;
    }
}
