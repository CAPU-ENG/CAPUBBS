<?php

class CapubbsEditHistoryRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function findLatestVersionIdByFid($fid) {
        $fid = intval($fid);
        $result = mysqli_query($this->con, "select version_id from post_edit_history where fid=$fid order by version_id desc limit 1");
        if (!$result || mysqli_num_rows($result) == 0) {
            return null;
        }
        $row = mysqli_fetch_row($result);
        mysqli_free_result($result);
        return $row[0] === null ? null : intval($row[0]);
    }

    public function insertVersion($fid, $bid, $tid, $pid, $parentId, $text, $author, $source, $editTime, $editBy, $editIp) {
        $fid = intval($fid);
        $bid = intval($bid);
        $tid = intval($tid);
        $pid = intval($pid);
        $editTime = intval($editTime);

        $parentSql = ($parentId === null) ? "NULL" : intval($parentId);
        $textEscaped = mysqli_real_escape_string($this->con, $text);
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        $sourceEscaped = mysqli_real_escape_string($this->con, $source);
        $editByEscaped = mysqli_real_escape_string($this->con, $editBy);
        $editIpEscaped = mysqli_real_escape_string($this->con, $editIp);

        $statement = "insert into post_edit_history
            (fid, bid, tid, pid, parent_id, text, author, source, edit_time, edit_by, edit_ip)
            values ($fid, $bid, $tid, $pid, $parentSql, '$textEscaped', '$authorEscaped', '$sourceEscaped', $editTime, '$editByEscaped', '$editIpEscaped')";
        return mysqli_query($this->con, $statement);
    }

    public function findMaxOwnVersionId($fid, $username) {
        $fid = intval($fid);
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $row = $this->fetchOne(
            "select max(version_id) as max_version_id from post_edit_history where fid=$fid and edit_by='$usernameEscaped'"
        );
        if (!$row || $row['max_version_id'] === null) {
            return 0;
        }
        return intval($row['max_version_id']);
    }

    public function findNextOtherEditorVersionId($fid, $username, $afterVersionId) {
        $fid = intval($fid);
        $afterVersionId = intval($afterVersionId);
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $row = $this->fetchOne(
            "select min(version_id) as next_version_id from post_edit_history
             where fid=$fid and edit_by!='$usernameEscaped' and version_id > $afterVersionId"
        );
        if (!$row || $row['next_version_id'] === null) {
            return 0;
        }
        return intval($row['next_version_id']);
    }

    public function findByVersionIdAndVisibility($fid, $versionId, $visibleCondition) {
        $fid = intval($fid);
        $versionId = intval($versionId);
        return $this->fetchOne(
            "select * from post_edit_history where version_id=$versionId and fid=$fid and $visibleCondition"
        );
    }

    public function findListByVisibility($fid, $visibleCondition) {
        $fid = intval($fid);
        return $this->fetchAll(
            "select version_id, fid, bid, tid, pid, parent_id, source, edit_time, edit_by, edit_ip
             from post_edit_history
             where fid=$fid and $visibleCondition
             order by version_id asc"
        );
    }

    public function findByVersionId($fid, $versionId) {
        $fid = intval($fid);
        $versionId = intval($versionId);
        return $this->fetchOne("select * from post_edit_history where version_id=$versionId and fid=$fid");
    }

    public function buildVisibleConditionForAuthor($username) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        return "edit_by='$usernameEscaped'";
    }

    public function buildVisibleConditionForAuthorWithTakeover($username, $nextVersionId) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $nextVersionId = intval($nextVersionId);
        if ($nextVersionId > 0) {
            return "(edit_by='$usernameEscaped' or version_id=$nextVersionId)";
        }
        return "edit_by='$usernameEscaped'";
    }

    private function fetchOne($statement) {
        $result = mysqli_query($this->con, $statement);
        if (!$result) {
            return false;
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
}
