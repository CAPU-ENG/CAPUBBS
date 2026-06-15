<?php

class CapubbsEmailMuteRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function findByEmail($email) {
        $emailEscaped = mysqli_real_escape_string($this->con, $email);
        return $this->fetchOne("select * from email_mutes where email='$emailEscaped' limit 1");
    }

    public function create($email, $mutedBy, $reason, $createdAt) {
        $emailEscaped = mysqli_real_escape_string($this->con, $email);
        $mutedByEscaped = mysqli_real_escape_string($this->con, $mutedBy);
        $reasonEscaped = mysqli_real_escape_string($this->con, $reason);
        $createdAt = intval($createdAt);

        return mysqli_query($this->con, "insert into email_mutes (email, muted_by, reason, created_at)
            values ('$emailEscaped', '$mutedByEscaped', '$reasonEscaped', $createdAt)");
    }

    public function reactivate($id, $mutedBy, $reason, $createdAt) {
        $id = intval($id);
        $mutedByEscaped = mysqli_real_escape_string($this->con, $mutedBy);
        $reasonEscaped = mysqli_real_escape_string($this->con, $reason);
        $createdAt = intval($createdAt);

        return mysqli_query($this->con, "update email_mutes
            set muted_by='$mutedByEscaped', reason='$reasonEscaped', created_at=$createdAt, active=1
            where id=$id");
    }

    public function deactivateActiveByEmail($email) {
        $emailEscaped = mysqli_real_escape_string($this->con, $email);
        return mysqli_query($this->con, "update email_mutes set active=0 where email='$emailEscaped' and active=1");
    }

    public function affectedRows() {
        return mysqli_affected_rows($this->con);
    }

    public function findActiveList() {
        return $this->fetchAll("select * from email_mutes where active=1 order by created_at desc");
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
