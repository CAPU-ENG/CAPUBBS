<?php

class CapubbsEmailVerificationRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function countRecentByUsernameEmailType($username, $email, $type, $since) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $emailEscaped = mysqli_real_escape_string($this->con, $email);
        $typeEscaped = mysqli_real_escape_string($this->con, $type);
        $since = intval($since);

        $row = $this->fetchOne("select count(*) as cnt from email_verification
            where username='$usernameEscaped' and email='$emailEscaped' and type='$typeEscaped' and created_at > $since");
        if (!$row) {
            return 0;
        }
        return intval($row['cnt']);
    }

    public function countRecentByEmailType($email, $type, $since) {
        $emailEscaped = mysqli_real_escape_string($this->con, $email);
        $typeEscaped = mysqli_real_escape_string($this->con, $type);
        $since = intval($since);

        $row = $this->fetchOne("select count(*) as cnt from email_verification
            where email='$emailEscaped' and type='$typeEscaped' and created_at > $since");
        if (!$row) {
            return 0;
        }
        return intval($row['cnt']);
    }

    public function invalidateByUsernameEmailType($username, $email, $type) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $emailEscaped = mysqli_real_escape_string($this->con, $email);
        $typeEscaped = mysqli_real_escape_string($this->con, $type);
        return mysqli_query($this->con, "update email_verification set used=1
            where username='$usernameEscaped' and email='$emailEscaped' and type='$typeEscaped' and used=0");
    }

    public function invalidateByEmailType($email, $type) {
        $emailEscaped = mysqli_real_escape_string($this->con, $email);
        $typeEscaped = mysqli_real_escape_string($this->con, $type);
        return mysqli_query($this->con, "update email_verification set used=1
            where email='$emailEscaped' and type='$typeEscaped' and used=0");
    }

    public function create($username, $email, $code, $type, $createdAt, $expiresAt) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $emailEscaped = mysqli_real_escape_string($this->con, $email);
        $codeEscaped = mysqli_real_escape_string($this->con, $code);
        $typeEscaped = mysqli_real_escape_string($this->con, $type);
        $createdAt = intval($createdAt);
        $expiresAt = intval($expiresAt);

        $statement = "insert into email_verification (username, email, code, type, created_at, expires_at)
            values ('$usernameEscaped', '$emailEscaped', '$codeEscaped', '$typeEscaped', $createdAt, $expiresAt)";
        return mysqli_query($this->con, $statement);
    }

    public function findLatestUsableByUsernameCodeType($username, $code, $type) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $codeEscaped = mysqli_real_escape_string($this->con, $code);
        $typeEscaped = mysqli_real_escape_string($this->con, $type);
        return $this->fetchOne("select * from email_verification
            where username='$usernameEscaped' and code='$codeEscaped' and type='$typeEscaped' and used=0
            order by id desc limit 1");
    }

    public function findLatestUsableByEmailCodeType($email, $code, $type) {
        $emailEscaped = mysqli_real_escape_string($this->con, $email);
        $codeEscaped = mysqli_real_escape_string($this->con, $code);
        $typeEscaped = mysqli_real_escape_string($this->con, $type);
        return $this->fetchOne("select * from email_verification
            where email='$emailEscaped' and code='$codeEscaped' and type='$typeEscaped' and used=0
            order by id desc limit 1");
    }

    public function markUsedById($id) {
        $id = intval($id);
        return mysqli_query($this->con, "update email_verification set used=1 where id=$id");
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
}
