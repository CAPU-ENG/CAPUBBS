<?php

class CapubbsThreadViewRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function recordView($username, $date, $bid, $tid, $ip) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $dateEscaped = mysqli_real_escape_string($this->con, $date);
        $ipEscaped = mysqli_real_escape_string($this->con, $ip);
        $bid = intval($bid);
        $tid = intval($tid);

        $statement = "insert ignore into username_view (username, date, bid, tid, ip)
            values ('$usernameEscaped', '$dateEscaped', $bid, $tid, '$ipEscaped')";
        return mysqli_query($this->con, $statement);
    }
}
