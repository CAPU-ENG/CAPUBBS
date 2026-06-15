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
}
