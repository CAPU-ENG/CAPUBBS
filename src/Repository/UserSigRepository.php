<?php

class CapubbsUserSigRepository {
    private $con;
    private $cache;

    public function __construct($con) {
        $this->con = $con;
        $this->cache = array();
    }

    public function getByUsername($username) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        return $this->getByEscapedUsernameWithCacheKey($usernameEscaped, 'raw:' . $username);
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

    public function applyToEscapedUserInfo($usernameEscaped, &$info) {
        $rows = $this->getByEscapedUsernameWithCacheKey($usernameEscaped, 'escaped:' . $usernameEscaped);
        for ($sigNum = 1; $sigNum <= 3; $sigNum++) {
            if (isset($rows[$sigNum])) {
                $info['sig' . $sigNum] = $rows[$sigNum]['sig'];
                $info['sig' . $sigNum . '_type'] = $rows[$sigNum]['sig_type'];
            } elseif (!isset($info['sig' . $sigNum . '_type'])) {
                $info['sig' . $sigNum . '_type'] = 'null';
            }
        }
    }

    public function upsertAll($username, $sigs, $sigTypes) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        return $this->upsertAllEscaped($usernameEscaped, $sigs, $sigTypes);
    }

    public function upsertAllEscaped($usernameEscaped, $sigs, $sigTypes) {
        for ($sigNum = 1; $sigNum <= 3; $sigNum++) {
            $sigValue = isset($sigs[$sigNum]) ? $sigs[$sigNum] : '';
            $sigTypeValue = isset($sigTypes[$sigNum]) ? $sigTypes[$sigNum] : 'null';

            $sigEscaped = mysqli_real_escape_string($this->con, $sigValue);
            $sigTypeEscaped = mysqli_real_escape_string($this->con, $sigTypeValue);

            $statement = "insert into user_sig (username, sig_num, sig, sig_type)
                values ('$usernameEscaped', $sigNum, '$sigEscaped', '$sigTypeEscaped')
                on duplicate key update sig='$sigEscaped', sig_type='$sigTypeEscaped'";
            mysqli_query($this->con, $statement);
            if (mysqli_error($this->con)) {
                return mysqli_error($this->con);
            }
        }

        $this->cache = array();
        return null;
    }

    private function getByEscapedUsernameWithCacheKey($usernameEscaped, $cacheKey) {
        if (isset($this->cache[$cacheKey])) {
            return $this->cache[$cacheKey];
        }

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

        $this->cache[$cacheKey] = $rows;
        return $rows;
    }
}
