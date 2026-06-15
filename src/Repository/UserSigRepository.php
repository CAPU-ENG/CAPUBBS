<?php

class CapubbsUserSigRepository {
    private $con;
    private $cache;

    public function __construct($con) {
        $this->con = $con;
        $this->cache = array();
    }

    public function getByUsername($username) {
        if (isset($this->cache[$username])) {
            return $this->cache[$username];
        }

        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $statement = "SELECT sig_num, sig, sig_type FROM user_sig WHERE username='$usernameEscaped'";
        $results = mysqli_query($this->con, $statement);

        $rows = array();
        if ($results) {
            while ($sigRow = mysqli_fetch_array($results)) {
                $sigNum = intval($sigRow['sig_num']);
                if ($sigNum >= 1 && $sigNum <= 3) {
                    $rows[$sigNum] = array(
                        'sig' => $sigRow['sig'],
                        'sig_type' => $sigRow['sig_type'],
                    );
                }
            }
        }

        $this->cache[$username] = $rows;
        return $rows;
    }

    public function applyToUserInfo($username, &$info) {
        $rows = $this->getByUsername($username);
        for ($sigNum = 1; $sigNum <= 3; $sigNum++) {
            if (isset($rows[$sigNum])) {
                $info['sig' . $sigNum] = $rows[$sigNum]['sig'];
                $info['sig' . $sigNum . '_type'] = $rows[$sigNum]['sig_type'];
            } elseif (!isset($info['sig' . $sigNum . '_type'])) {
                $info['sig' . $sigNum . '_type'] = 'null';
            }
        }
    }
}
