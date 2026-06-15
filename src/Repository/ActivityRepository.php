<?php

class CapubbsActivityRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function findThreadActivity($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        return $this->fetchOne("select activity_id, bid, tid, season_id, name, leader_username from season_threads_activity where bid=$bid and tid=$tid limit 1");
    }

    public function findActivityById($activityId) {
        $activityId = intval($activityId);
        return $this->fetchOne("select activity_id, bid, tid, season_id, name, leader_username from season_threads_activity where activity_id=$activityId limit 1");
    }

    public function findThreadActivityDetail($bid, $tid) {
        $activity = $this->findThreadActivity($bid, $tid);
        if (!$activity) {
            return null;
        }
        return $this->buildActivityDetail($activity);
    }

    public function findActivityDetailById($activityId) {
        $activity = $this->findActivityById($activityId);
        if (!$activity) {
            return null;
        }
        return $this->buildActivityDetail($activity);
    }

    public function insertThreadActivity($bid, $tid, $seasonId, $name, $leaderUsername) {
        $bid = intval($bid);
        $tid = intval($tid);
        $seasonId = intval($seasonId);
        $nameEscaped = $this->escape($name);
        $leaderEscaped = $this->escape($leaderUsername);

        $statement = "insert into season_threads_activity (bid,tid,season_id,name,leader_username)
            values ($bid,$tid,$seasonId,'$nameEscaped','$leaderEscaped')";
        if (!mysqli_query($this->con, $statement)) {
            return false;
        }
        return mysqli_insert_id($this->con);
    }

    public function insertOption($activityId, $typeId, $optionName, $required, $comment, $hidden) {
        $activityId = intval($activityId);
        $typeId = intval($typeId);
        $required = intval($required);
        $hidden = intval($hidden);
        $optionNameEscaped = $this->escape($optionName);
        $commentEscaped = $this->escape($comment);

        $statement = "insert into season_activity_option (activity_id, type_id, option_name, required, comment, hiden)
            values ($activityId, $typeId, '$optionNameEscaped', $required, '$commentEscaped', $hidden)";
        if (!mysqli_query($this->con, $statement)) {
            return false;
        }
        return mysqli_insert_id($this->con);
    }

    public function insertOptionCase($optionId, $caseName, $comment, $needValue) {
        $optionId = intval($optionId);
        $needValue = intval($needValue);
        $caseNameEscaped = $this->escape($caseName);
        $commentEscaped = $this->escape($comment);

        $statement = "insert into season_option_case (option_id, case_name, comment, need_value)
            values ($optionId, '$caseNameEscaped', '$commentEscaped', $needValue)";
        if (!mysqli_query($this->con, $statement)) {
            return false;
        }
        return mysqli_insert_id($this->con);
    }

    public function findOptionsByActivityId($activityId) {
        $activityId = intval($activityId);
        return $this->fetchAll("select id, type_id, option_name, required, comment, hiden from season_activity_option where activity_id=$activityId order by id");
    }

    public function findCasesByOptionIds($optionIds) {
        if (!is_array($optionIds) || count($optionIds) == 0) {
            return array();
        }

        $ids = array();
        foreach ($optionIds as $optionId) {
            $ids[] = intval($optionId);
        }

        $statement = "select case_id, option_id, case_name, comment, need_value
            from season_option_case
            where option_id in (" . implode(',', $ids) . ")
            order by case_id";
        $rows = $this->fetchAll($statement);
        $grouped = array();
        foreach ($rows as $row) {
            $optionId = intval($row['option_id']);
            if (!isset($grouped[$optionId])) {
                $grouped[$optionId] = array();
            }
            $grouped[$optionId][] = array(
                'case_id' => $row['case_id'],
                'case_name' => $row['case_name'],
                'comment' => $row['comment'],
                'need_value' => $row['need_value'],
            );
        }
        return $grouped;
    }

    public function findJoinByActivityAndUsername($activityId, $username) {
        $activityId = intval($activityId);
        $usernameEscaped = $this->escape($username);
        return $this->fetchOne("select * from season_activity_join where activity_id=$activityId and username='$usernameEscaped' limit 1");
    }

    public function findJoinsByActivity($activityId, $orderBy) {
        $activityId = intval($activityId);
        if ($orderBy !== 'post_fid') {
            $orderBy = 'join_id';
        }
        return $this->fetchAll("select join_id, activity_id, username, post_fid, cancel, attendance from season_activity_join where activity_id=$activityId order by $orderBy");
    }

    public function insertJoin($activityId, $username, $postFid) {
        $activityId = intval($activityId);
        $postFid = intval($postFid);
        $usernameEscaped = $this->escape($username);
        $statement = "insert into season_activity_join (activity_id, username, post_fid) values ($activityId, '$usernameEscaped', $postFid)";
        if (!mysqli_query($this->con, $statement)) {
            return false;
        }
        return mysqli_insert_id($this->con);
    }

    public function updateJoinPostFid($joinId, $postFid) {
        $joinId = intval($joinId);
        $postFid = intval($postFid);
        return mysqli_query($this->con, "update season_activity_join set post_fid=$postFid where join_id=$joinId");
    }

    public function updateJoinCancel($activityId, $username, $cancel) {
        $activityId = intval($activityId);
        $cancel = intval($cancel ? 1 : 0);
        $usernameEscaped = $this->escape($username);
        return mysqli_query($this->con, "update season_activity_join set cancel=$cancel where activity_id=$activityId and username='$usernameEscaped'");
    }

    public function findJoinOptionValues($joinId) {
        $joinId = intval($joinId);
        $rows = $this->fetchAll("select option_id, value from season_join_option_value where join_id=$joinId");
        $values = array();
        foreach ($rows as $row) {
            $values[$row['option_id']] = $row['value'];
        }
        return $values;
    }

    public function findJoinOptionValuesByJoinIds($joinIds) {
        if (!is_array($joinIds) || count($joinIds) == 0) {
            return array();
        }

        $ids = array();
        foreach ($joinIds as $joinId) {
            $ids[] = intval($joinId);
        }

        $rows = $this->fetchAll("select join_id, option_id, value from season_join_option_value where join_id in (" . implode(',', $ids) . ")");
        $grouped = array();
        foreach ($rows as $row) {
            $joinId = intval($row['join_id']);
            if (!isset($grouped[$joinId])) {
                $grouped[$joinId] = array();
            }
            $grouped[$joinId][$row['option_id']] = $row['value'];
        }
        return $grouped;
    }

    public function insertJoinOptionValue($joinId, $optionId, $value) {
        $joinId = intval($joinId);
        $optionId = intval($optionId);
        $valueEscaped = $this->escape($value);
        return mysqli_query($this->con, "insert into season_join_option_value (join_id, option_id, value) values ($joinId, $optionId, '$valueEscaped')");
    }

    public function updateJoinOptionValue($joinId, $optionId, $value) {
        $joinId = intval($joinId);
        $optionId = intval($optionId);
        $valueEscaped = $this->escape($value);
        return mysqli_query($this->con, "update season_join_option_value set value='$valueEscaped' where join_id=$joinId and option_id=$optionId");
    }

    public function findJoinRemind($activityId) {
        $activityId = intval($activityId);
        $row = $this->fetchOne("select text from activity_join_remind where activity_id=$activityId limit 1");
        if (!$row || !isset($row['text'])) {
            return null;
        }
        return $row['text'];
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

    private function buildActivityDetail($activityRow) {
        $activityId = intval($activityRow['activity_id']);
        $optionRows = $this->findOptionsByActivityId($activityId);
        $optionIds = array();
        foreach ($optionRows as $optionRow) {
            $optionIds[] = $optionRow['id'];
        }
        $casesByOptionId = $this->findCasesByOptionIds($optionIds);

        $options = array();
        foreach ($optionRows as $optionRow) {
            $optionId = intval($optionRow['id']);
            $option = array(
                'option_id' => $optionRow['id'],
                'type_id' => $optionRow['type_id'],
                'option_name' => $optionRow['option_name'],
                'required' => $optionRow['required'],
                'comment' => $optionRow['comment'],
                'hiden' => $optionRow['hiden'],
            );
            if (isset($casesByOptionId[$optionId])) {
                $option['cases'] = $casesByOptionId[$optionId];
            }
            $options[] = $option;
        }

        return array(
            'activity_id' => $activityRow['activity_id'],
            'bid' => $activityRow['bid'],
            'tid' => $activityRow['tid'],
            'season_id' => $activityRow['season_id'],
            'name' => $activityRow['name'],
            'leader_username' => $activityRow['leader_username'],
            'options' => $options,
        );
    }

    private function fetchOne($statement) {
        $result = mysqli_query($this->con, $statement);
        if (!$result || mysqli_num_rows($result) == 0) {
            return null;
        }
        $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
        mysqli_free_result($result);
        return $row ? $row : null;
    }

    private function fetchAll($statement) {
        $result = mysqli_query($this->con, $statement);
        if (!$result) {
            return array();
        }

        $rows = array();
        while (($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) !== null) {
            $rows[] = $row;
        }
        mysqli_free_result($result);
        return $rows;
    }

    private function escape($value) {
        return mysqli_real_escape_string($this->con, strval($value));
    }
}
