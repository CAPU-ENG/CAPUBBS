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
}
