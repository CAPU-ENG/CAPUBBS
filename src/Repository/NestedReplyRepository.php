<?php

class CapubbsNestedReplyRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function findVisibleByFid($fid) {
        $fid = intval($fid);
        return $this->fetchAll("select * from lzl where fid=$fid && visible=1 order by id");
    }

    public function findVisibleByFids($fids) {
        $normalized = array();
        foreach ($fids as $fid) {
            $fid = intval($fid);
            if ($fid > 0) {
                $normalized[$fid] = $fid;
            }
        }

        if (count($normalized) === 0) {
            return array();
        }

        return $this->fetchAll("select * from lzl where visible=1 and fid in (" . implode(',', $normalized) . ") order by fid, id");
    }

    public function countAllByFid($fid) {
        $fid = intval($fid);
        $row = $this->fetchOne("select count(*) as num from lzl where fid=$fid");
        if (!$row) {
            return 0;
        }
        return intval($row['num']);
    }

    public function findById($id) {
        $id = intval($id);
        return $this->fetchOne("select * from lzl where id=$id limit 1");
    }

    public function insert($fid, $author, $text, $time) {
        $fid = intval($fid);
        $time = intval($time);
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        $textEscaped = mysqli_real_escape_string($this->con, $text);
        $statement = "insert into lzl (fid,author,text,time) values ($fid, '$authorEscaped', '$textEscaped', $time)";
        return mysqli_query($this->con, $statement);
    }

    public function hideById($id) {
        $id = intval($id);
        return mysqli_query($this->con, "update lzl set visible=0 where id=$id limit 1");
    }

    public function lastError() {
        return mysqli_error($this->con);
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
            return false;
        }
        $rows = array();
        while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
            $rows[] = $row;
        }
        mysqli_free_result($result);
        return $rows;
    }
}
