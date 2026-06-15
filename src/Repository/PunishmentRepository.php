<?php

class CapubbsPunishmentRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function findVisibleAll() {
        return $this->fetchAll("select id, username, name, reason, distance, addition, start_date, end_date, is_end
            from punishment where is_deleted=0 order by start_date, id");
    }

    public function findVisibleByStartDateRange($startDate, $endDate) {
        $startEscaped = mysqli_real_escape_string($this->con, $startDate);
        $endEscaped = mysqli_real_escape_string($this->con, $endDate);
        return $this->fetchAll("select id, username, name, reason, distance, addition, start_date, end_date, is_end
            from punishment
            where is_deleted=0
                and start_date >= '$startEscaped' and start_date <= '$endEscaped'
            order by start_date, id");
    }

    public function findHistoryCarryOver($lastYearStartDate, $lastYearEndDate, $yearStartDate) {
        $lastYearStartEscaped = mysqli_real_escape_string($this->con, $lastYearStartDate);
        $lastYearEndEscaped = mysqli_real_escape_string($this->con, $lastYearEndDate);
        $yearStartEscaped = mysqli_real_escape_string($this->con, $yearStartDate);
        return $this->fetchAll("select id, username, name, reason, distance, addition, start_date, end_date, is_end
            from punishment
            where
                is_deleted = 0
                and (start_date >= '$lastYearStartEscaped' and start_date <= '$lastYearEndEscaped')
                and (
                    is_end = 0
                    or (
                        is_end = 1
                        and end_date >= '$yearStartEscaped'
                    )
                )
            order by start_date, id");
    }

    public function insertPunishment($username, $name, $reason, $distance, $addition, $startDate) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $nameEscaped = mysqli_real_escape_string($this->con, $name);
        $reasonEscaped = mysqli_real_escape_string($this->con, $reason);
        $distance = floatval($distance);
        $addition = intval($addition);
        $startDateEscaped = mysqli_real_escape_string($this->con, $startDate);

        return mysqli_query($this->con, "insert into punishment (username, name, reason, distance, addition, start_date)
            values ('$usernameEscaped', '$nameEscaped', '$reasonEscaped', '$distance', '$addition', '$startDateEscaped')");
    }

    public function markFinished($punishmentId, $endDate) {
        $punishmentId = intval($punishmentId);
        $endDateEscaped = mysqli_real_escape_string($this->con, $endDate);
        return mysqli_query($this->con, "update punishment set is_end=1, end_date='$endDateEscaped' where id=$punishmentId");
    }

    public function cancelFinish($punishmentId) {
        $punishmentId = intval($punishmentId);
        return mysqli_query($this->con, "update punishment set is_end=0 where id=$punishmentId");
    }

    public function softDelete($punishmentId) {
        $punishmentId = intval($punishmentId);
        return mysqli_query($this->con, "update punishment set is_deleted=1 where id=$punishmentId");
    }

    public function findActivePunishmentUsernames() {
        $rows = $this->fetchAll("select username
            from punishment
            where is_end=0 and is_deleted=0
            group by username");

        $usernames = array();
        foreach ($rows as $row) {
            if (isset($row['username'])) {
                $usernames[] = $row['username'];
            }
        }
        return $usernames;
    }

    public function hasActivePunishment($username) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $row = $this->fetchOne("select count(*) as cnt
            from punishment
            where is_end=0 and is_deleted=0 and username='$usernameEscaped'");
        return $row && intval($row['cnt']) > 0;
    }

    public function lastError() {
        return mysqli_error($this->con);
    }

    public function lastErrno() {
        return mysqli_errno($this->con);
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
