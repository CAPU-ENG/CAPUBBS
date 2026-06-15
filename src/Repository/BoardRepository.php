<?php

class CapubbsBoardRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function findByBid($bid) {
        $bid = intval($bid);
        $results = mysqli_query($this->con, "select * from boardinfo where bid=$bid limit 1");
        if (!$results) {
            return false;
        }
        $row = mysqli_fetch_array($results, MYSQLI_ASSOC);
        return $row ? $row : null;
    }

    public function isModerator($bid, $username) {
        $bid = intval($bid);
        if ($bid <= 0 || $username === '') {
            return false;
        }

        $statement = "select m1,m2,m3,m4 from boardinfo where bid=$bid";
        $results = mysqli_query($this->con, $statement);
        if (!$results) {
            return false;
        }

        $row = mysqli_fetch_array($results);
        if (!$row) {
            return false;
        }

        for ($i = 0; $i <= 3; $i++) {
            if ($row[$i] == $username) {
                return true;
            }
        }

        return false;
    }
}
