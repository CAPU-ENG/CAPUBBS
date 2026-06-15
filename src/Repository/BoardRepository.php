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

    public function findAll() {
        return $this->fetchAll("select * from boardinfo where bid!=0 order by bid");
    }

    public function findAllBidMap() {
        $results = mysqli_query($this->con, "select bid from boardinfo where bid!=0");
        if (!$results) {
            return array();
        }

        $bids = array();
        while (($row = mysqli_fetch_row($results)) !== null) {
            $bids[intval($row[0])] = true;
        }
        mysqli_free_result($results);
        return $bids;
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

    public function findModeratorBids($username) {
        if ($username === '') {
            return array();
        }

        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $statement = "select bid from boardinfo
            where m1='$usernameEscaped' or m2='$usernameEscaped' or m3='$usernameEscaped' or m4='$usernameEscaped'";
        $results = mysqli_query($this->con, $statement);
        if (!$results) {
            return array();
        }

        $bids = array();
        while (($row = mysqli_fetch_row($results)) !== null) {
            $bids[] = intval($row[0]);
        }
        mysqli_free_result($results);
        return $bids;
    }

    private function fetchAll($statement) {
        $results = mysqli_query($this->con, $statement);
        if (!$results) {
            return array();
        }

        $rows = array();
        while (($row = mysqli_fetch_array($results, MYSQLI_ASSOC)) !== null) {
            $rows[] = $row;
        }
        mysqli_free_result($results);
        return $rows;
    }
}
