<?php

class CapubbsUserRepository {
    private $con;
    private $userSigRepository;

    public function __construct($con, $userSigRepository) {
        $this->con = $con;
        $this->userSigRepository = $userSigRepository;
    }

    public function findByToken($token) {
        return $this->findRowByValidToken($token, 'username,score,star,mail');
    }

    public function findUsernameAndRightsByToken($token) {
        return $this->findRowByValidToken($token, 'username,rights');
    }

    public function findSessionUserByToken($token) {
        return $this->findRowByValidToken($token, 'username,rights,lastip');
    }

    public function findThreadReadSessionByToken($token) {
        return $this->findRowByValidToken($token, 'username,star,rights,lastpost');
    }

    public function findUsernameByValidToken($token) {
        return $this->findRowByValidToken($token, 'username');
    }

    public function findRawUserByUsername($username) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $statement = "select * from userinfo where username='$usernameEscaped' limit 1";
        $results = mysqli_query($this->con, $statement);
        if (!$results || mysqli_num_rows($results) == 0) {
            return null;
        }
        return mysqli_fetch_array($results, MYSQLI_ASSOC);
    }

    public function existsByUsername($username) {
        return $this->findRawUserByUsername($username) !== null;
    }

    public function findRawUsersByUsernames($usernames) {
        if (count($usernames) == 0) {
            return array();
        }

        $escaped = array();
        foreach ($usernames as $username) {
            $escaped[] = "'" . mysqli_real_escape_string($this->con, $username) . "'";
        }

        $statement = "select * from userinfo where username in (" . implode(',', $escaped) . ")";
        $results = mysqli_query($this->con, $statement);
        if (!$results) {
            return array();
        }

        $rows = array();
        while ($row = mysqli_fetch_array($results, MYSQLI_ASSOC)) {
            $rows[$row['username']] = $row;
        }
        return $rows;
    }

    public function findForLogin($username) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $statement = "select username,password from userinfo where username='$usernameEscaped'";
        $results = mysqli_query($this->con, $statement);
        if (!$results || mysqli_num_rows($results) == 0) {
            return null;
        }
        return mysqli_fetch_array($results);
    }

    public function findValidTokenByUsername($username, $nowtime) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $statement = "select token from userinfo where username='$usernameEscaped' && $nowtime<=tokentime+" . $this->getValidTime();
        $results = mysqli_query($this->con, $statement);
        if (!$results || mysqli_num_rows($results) == 0) {
            return null;
        }
        $row = mysqli_fetch_array($results);
        if (!$row || is_null($row[0]) || $row[0] === '') {
            return null;
        }
        return $row[0];
    }

    public function updateLoginSession($username, $token, $nowtime, $ip, $today, $onlinetype, $logininfo) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $tokenEscaped = mysqli_real_escape_string($this->con, $token);
        $ipEscaped = mysqli_real_escape_string($this->con, $ip);
        $onlineTypeEscaped = mysqli_real_escape_string($this->con, $onlinetype);
        $loginInfoEscaped = mysqli_real_escape_string($this->con, $logininfo);

        if ($ip !== '') {
            $statement = "update userinfo set tokentime=$nowtime, token='$tokenEscaped', nowboard=null, lastip='$ipEscaped',lastdate='$today',onlinetype='$onlineTypeEscaped',logininfo='$loginInfoEscaped' where username='$usernameEscaped'";
        } else {
            $statement = "update userinfo set tokentime=$nowtime, token='$tokenEscaped', nowboard=null, lastdate='$today',onlinetype='$onlineTypeEscaped',logininfo='$loginInfoEscaped' where username='$usernameEscaped'";
        }

        return mysqli_query($this->con, $statement);
    }

    public function updateLogoutSessionByToken($token, $ip, $today) {
        $tokenEscaped = mysqli_real_escape_string($this->con, $token);
        $ipEscaped = mysqli_real_escape_string($this->con, $ip);
        $statement = "update userinfo set nowboard=null, lastip='$ipEscaped',lastdate='$today' where token='$tokenEscaped'";
        return mysqli_query($this->con, $statement);
    }

    public function touchTokenByUsername($username, $ip, $time) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $ipEscaped = mysqli_real_escape_string($this->con, $ip);

        if ($ip !== '') {
            $statement = "update userinfo set tokentime=$time, lastip='$ipEscaped' where username='$usernameEscaped'";
        } else {
            $statement = "update userinfo set tokentime=$time where username='$usernameEscaped'";
        }
        return mysqli_query($this->con, $statement);
    }

    public function insertUsernameLastIp($username, $ip) {
        if ($username === '' || $ip === '') {
            return false;
        }

        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $ipEscaped = mysqli_real_escape_string($this->con, $ip);
        $statement = "insert ignore into username_lastip (username, lastip) values ('$usernameEscaped', '$ipEscaped')";
        return mysqli_query($this->con, $statement);
    }

    public function incrementPostStats($username, $bid, $time) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $bid = intval($bid);
        $time = intval($time);

        if ($bid != 4) {
            $statement = "update userinfo set post=post+1, lastpost=$time, tokentime=$time where username='$usernameEscaped'";
        } else {
            $statement = "update userinfo set water=water+1, lastpost=$time, tokentime=$time where username='$usernameEscaped'";
        }

        return mysqli_query($this->con, $statement);
    }

    public function incrementReplyStats($username, $bid, $time) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $bid = intval($bid);
        $time = intval($time);

        if ($bid != 4) {
            $statement = "update userinfo set reply=reply+1, lastpost=$time, tokentime=$time where username='$usernameEscaped'";
        } else {
            $statement = "update userinfo set water=water+1, lastpost=$time, tokentime=$time where username='$usernameEscaped'";
        }

        return mysqli_query($this->con, $statement);
    }

    public function adjustExtrCount($username, $delta) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $delta = intval($delta);
        return mysqli_query($this->con, "update userinfo set extr=extr+($delta) where username='$usernameEscaped'");
    }

    public function recalculateStar($username) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $statement = "select post,reply,other2 from userinfo where username='$usernameEscaped'";
        $results = mysqli_query($this->con, $statement);
        if (!$results || mysqli_num_rows($results) == 0) {
            return false;
        }

        $res = mysqli_fetch_array($results, MYSQLI_ASSOC);
        $post = intval(isset($res['post']) ? $res['post'] : 0);
        $reply = intval(isset($res['reply']) ? $res['reply'] : 0);
        $total = $post + $reply;
        $star = 1;
        if ($total < 20) $star = 1;
        elseif ($total < 109) $star = 2;
        elseif ($total < 317) $star = 3;
        elseif ($total < 675) $star = 4;
        elseif ($total < 1278) $star = 5;
        elseif ($total < 2303) $star = 6;
        elseif ($total < 3550) $star = 7;
        elseif ($total < 4885) $star = 8;
        else $star = 9;

        $ss = intval(isset($res['other2']) ? $res['other2'] : 0);
        if ($ss != "" && $ss >= 1 && $ss <= 9) $star = $ss;

        $statement = "update userinfo set star=$star where username='$usernameEscaped'";
        return mysqli_query($this->con, $statement);
    }

    public function findMuteReason($username, $bid) {
        $postControlEnabled = defined('CAPUBBS_ENABLE_POST_CONTROL') ? CAPUBBS_ENABLE_POST_CONTROL : true;
        if (!$postControlEnabled) {
            return false;
        }

        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $statement = "select verified, post, reply, mail from userinfo where username='$usernameEscaped' limit 1";
        $results = mysqli_query($this->con, $statement);
        if (!$results || mysqli_num_rows($results) == 0) {
            return false;
        }

        $result = mysqli_fetch_array($results, MYSQLI_ASSOC);
        if (isset($result['verified']) && intval($result['verified']) === 0) {
            if ((intval(isset($result['post']) ? $result['post'] : 0) + intval(isset($result['reply']) ? $result['reply'] : 0)) <= 20) {
                if (intval($bid) !== 28) {
                    return '邮箱未验证';
                }
            }
        }

        $emailMuteEnabled = defined('CAPUBBS_ENABLE_EMAIL_MUTE') ? CAPUBBS_ENABLE_EMAIL_MUTE : false;
        if ($emailMuteEnabled) {
            $mail = isset($result['mail']) ? $result['mail'] : '';
            if ($mail !== null && $mail !== '') {
                $mailEscaped = mysqli_real_escape_string($this->con, $mail);
                $muteCheck = mysqli_query($this->con, "select count(*) as cnt from email_mutes where email='$mailEscaped' and active=1");
                if ($muteCheck) {
                    $muteRow = mysqli_fetch_array($muteCheck, MYSQLI_ASSOC);
                    if ($muteRow && intval($muteRow['cnt']) > 0) {
                        return '邮箱已被管理员禁言';
                    }
                }
            }
        }

        return false;
    }

    public function refreshValidatedSession($username, $token, $nowtime, $ip, $today, $onlinetype, $logininfo) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $tokenEscaped = mysqli_real_escape_string($this->con, $token);
        $ipEscaped = mysqli_real_escape_string($this->con, $ip);
        $onlineTypeEscaped = mysqli_real_escape_string($this->con, $onlinetype);
        $loginInfoEscaped = mysqli_real_escape_string($this->con, $logininfo);

        if ($ip !== '') {
            $statement = "update userinfo set tokentime=$nowtime, token='$tokenEscaped', lastip='$ipEscaped',lastdate='$today',onlinetype='$onlineTypeEscaped',logininfo='$loginInfoEscaped' where username='$usernameEscaped'";
        } else {
            $statement = "update userinfo set tokentime=$nowtime, token='$tokenEscaped', lastdate='$today',onlinetype='$onlineTypeEscaped',logininfo='$loginInfoEscaped' where username='$usernameEscaped'";
        }

        return mysqli_query($this->con, $statement);
    }

    public function updateReadBoardSession($username, $nowtime, $ip, $bid) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $ipEscaped = mysqli_real_escape_string($this->con, $ip);
        $bid = intval($bid);

        if ($ip !== '') {
            $statement = "update userinfo set tokentime=$nowtime, nowboard=$bid, lastip='$ipEscaped' where username='$usernameEscaped'";
        } else {
            $statement = "update userinfo set tokentime=$nowtime, nowboard=$bid where username='$usernameEscaped'";
        }

        return mysqli_query($this->con, $statement);
    }

    public function findPublicProfiles($username, $viewer) {
        static $cache = array();

        if (isset($cache[$username])) {
            $result = $this->copyRows($cache[$username]);
        } else {
            $usernameEscaped = mysqli_real_escape_string($this->con, $username);
            $statement = "select * from userinfo where username='$usernameEscaped'";
            $results = mysqli_query($this->con, $statement);

            $infos = array();
            if ($results) {
                while ($res = mysqli_fetch_array($results)) {
                    $info = array();
                    foreach ($res as $key => $value) {
                        if (is_long($key)) continue;
                        if ($key == "password") continue;
                        if ($key == "token") continue;
                        if ($key == "tokentime") continue;
                        if ($key == "lastpost") continue;
                        if ($key == "nowboard") continue;
                        $info[$key] = $value;
                    }
                    $this->userSigRepository->applyToUserInfo($username, $info);
                    $infos[] = $info;
                }
            }

            $cache[$username] = $infos;
            $result = $this->copyRows($infos);
        }

        if ($viewer !== null && $viewer !== $username && !empty($result)) {
            foreach ($result as &$info) {
                if (isset($info['email_visible']) && intval($info['email_visible']) === 0) {
                    $info['mail'] = '';
                }
            }
            unset($info);
        }

        return $result;
    }

    private function findRowByValidToken($token, $fields) {
        $nowtime = time();
        if (!$token) return null;
        if (strstr($token, "'") != "") return null;

        $tokenEscaped = mysqli_real_escape_string($this->con, $token);
        $statement = "select $fields from userinfo where token='$tokenEscaped' && $nowtime<=tokentime+" . $this->getValidTime();
        $results = mysqli_query($this->con, $statement);
        if (!$results || mysqli_num_rows($results) == 0) {
            return null;
        }
        return mysqli_fetch_array($results);
    }

    private function getValidTime() {
        if (isset($GLOBALS['validtime'])) {
            return intval($GLOBALS['validtime']);
        }
        return 60 * 60 * 24 * 7;
    }

    private function copyRows($rows) {
        $copy = array();
        foreach ($rows as $row) {
            $copy[] = $row;
        }
        return $copy;
    }
}
