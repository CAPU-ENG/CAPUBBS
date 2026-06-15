<?php

class CapubbsSignRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function ensureSignedToday($username) {
        $time = time();
        $year = date("Y", $time);
        $month = date("m", $time);
        $day = date("d", $time);
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);

        $statement = "select * from capubbs.sign where year=$year && month=$month && day=$day && username='$usernameEscaped'";
        $result = mysqli_query($this->con, $statement);
        if ($result && mysqli_num_rows($result) == 0) {
            $hour = date("H", $time);
            $minute = date("i", $time);
            $second = date("s", $time);
            $week = date("N", $time);
            $statement = "insert into capubbs.sign values ($year,$month,$day,$hour,$minute,$second,$week,'$usernameEscaped')";
            mysqli_query($this->con, $statement);
            $statement = "update capubbs.userinfo set sign=sign+1 where username='$usernameEscaped'";
            mysqli_query($this->con, $statement);
        }
    }

    public function countToday() {
        $time = time();
        return $this->countByDateParts(
            intval(date("Y", $time)),
            intval(date("m", $time)),
            intval(date("d", $time))
        );
    }

    public function countByDateParts($year, $month, $day) {
        $year = intval($year);
        $month = intval($month);
        $day = intval($day);
        $row = $this->fetchOne("select count(*) as num from capubbs.sign where year=$year && month=$month && day=$day");
        if (!$row) {
            return 0;
        }
        return intval($row['num']);
    }

    public function findByDay($year, $month, $day) {
        $year = intval($year);
        $month = intval($month);
        $day = intval($day);
        return $this->fetchAll("select username from capubbs.sign where year=$year && month=$month && day=$day order by hour, minute, second");
    }

    public function findByYear($year) {
        $year = intval($year);
        return $this->fetchAll("select * from capubbs.sign where year=$year order by month, day");
    }

    public function findTopUsers($limit) {
        $limit = max(1, intval($limit));
        return $this->fetchAll("select username,sign from capubbs.userinfo order by sign desc,username limit 0,$limit");
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
