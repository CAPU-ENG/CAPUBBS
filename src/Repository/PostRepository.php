<?php

class CapubbsPostRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function findByThreadPage($bid, $tid, $page, $pageSize, $author) {
        $bid = intval($bid);
        $tid = intval($tid);
        $page = max(1, intval($page));
        $pageSize = max(1, intval($pageSize));
        $start = ($page - 1) * $pageSize;
        $whereAuthor = '';
        if ($author !== '') {
            $authorEscaped = mysqli_real_escape_string($this->con, $author);
            $whereAuthor = " && author='$authorEscaped'";
        }
        $statement = "select * from posts where bid=$bid && tid=$tid$whereAuthor order by pid limit $start, $pageSize";
        return $this->fetchAll($statement);
    }

    public function findByBidTidPid($bid, $tid, $pid) {
        $bid = intval($bid);
        $tid = intval($tid);
        $pid = intval($pid);
        return $this->fetchOne("select * from posts where bid=$bid and tid=$tid and pid=$pid limit 1");
    }

    public function countByAuthorInThread($bid, $tid, $author) {
        $bid = intval($bid);
        $tid = intval($tid);
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        $row = $this->fetchOne("select count(*) as num from posts where bid=$bid and tid=$tid and author='$authorEscaped'");
        if (!$row) {
            return 0;
        }
        return intval($row['num']);
    }

    public function findRecentThreadPostsByAuthor($author, $limit) {
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        $limitClause = $this->buildLimitClause($limit);
        $statement = "select bid,tid,pid,title,author,replytime as timestamp from posts where author='$authorEscaped' and pid=1 order by replytime desc$limitClause";
        return $this->fetchAll($statement);
    }

    public function findRecentRepliesByAuthor($author, $limit) {
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        $limitClause = $this->buildLimitClause($limit);
        $statement = "select title, bid, tid, pid, updatetime from posts where author='$authorEscaped' order by updatetime desc$limitClause";
        return $this->fetchAll($statement);
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
