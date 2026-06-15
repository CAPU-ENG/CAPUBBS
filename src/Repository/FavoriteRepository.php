<?php

class CapubbsFavoriteRepository {
    private $con;
    private $lastErrno = 0;
    private $lastError = '';

    public function __construct($con) {
        $this->con = $con;
    }

    public function add($username, $bid, $tid, $timestamp, $lastReadTime) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $bid = intval($bid);
        $tid = intval($tid);
        $timestamp = intval($timestamp);
        $lastReadTime = intval($lastReadTime);
        $statement = "insert into favorites (username, bid, tid, timestamp, last_read_time) values ('$usernameEscaped', $bid, $tid, $timestamp, $lastReadTime)";
        return $this->query($statement);
    }

    public function remove($username, $bid, $tid) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $bid = intval($bid);
        $tid = intval($tid);
        return $this->query("delete from favorites where username='$usernameEscaped' and bid=$bid and tid=$tid");
    }

    public function updateSortOrder($username, $bid, $tid, $sortOrder) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $bid = intval($bid);
        $tid = intval($tid);
        $sortOrder = intval($sortOrder);
        return $this->query("update favorites set sort_order=$sortOrder where username='$usernameEscaped' and bid=$bid and tid=$tid");
    }

    public function countByThread($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        $row = $this->fetchOne("select count(*) as c from favorites where bid=$bid and tid=$tid");
        if (!$row) {
            return 0;
        }
        return intval($row['c']);
    }

    public function exists($username, $bid, $tid) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $bid = intval($bid);
        $tid = intval($tid);
        $row = $this->fetchOne("select 1 as hit from favorites where username='$usernameEscaped' and bid=$bid and tid=$tid limit 1");
        return $row !== null && $row !== false;
    }

    public function findListByUsername($username, $sort, $limit) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        if ($sort === 'custom') {
            $order = "order by f.sort_order, f.timestamp desc";
        } else {
            $order = "order by f.timestamp desc";
        }

        $limitClause = $this->buildLimitClause($limit);
        $statement = "select f.id, f.bid, f.tid, f.timestamp as fav_timestamp, f.sort_order,
            t.title, t.author, t.click, t.reply, t.timestamp, t.postdate
            from favorites f
            left join threads t on f.bid=t.bid and f.tid=t.tid
            where f.username='$usernameEscaped'
            $order$limitClause";
        return $this->fetchAll($statement);
    }

    public function lastError() {
        if ($this->lastError !== '') {
            return $this->lastError;
        }
        return mysqli_error($this->con);
    }

    public function lastErrno() {
        if ($this->lastErrno !== 0) {
            return $this->lastErrno;
        }
        return mysqli_errno($this->con);
    }

    private function buildLimitClause($limit) {
        if ($limit === null) {
            return '';
        }
        $limit = intval($limit);
        if ($limit <= 0) {
            return '';
        }
        return " limit 0,$limit";
    }

    private function fetchOne($statement) {
        $result = $this->query($statement);
        if (!$result) {
            return false;
        }
        $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
        mysqli_free_result($result);
        return $row ? $row : null;
    }

    private function fetchAll($statement) {
        $result = $this->query($statement);
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

    private function query($statement) {
        $this->lastErrno = 0;
        $this->lastError = '';
        try {
            return mysqli_query($this->con, $statement);
        } catch (mysqli_sql_exception $e) {
            $this->lastErrno = intval($e->getCode());
            $this->lastError = $e->getMessage();
            return false;
        }
    }
}
