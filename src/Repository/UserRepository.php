<?php

class CapubbsUserRepository {
    private $con;
    private $userSigRepository;

    public function __construct($con, $userSigRepository) {
        $this->con = $con;
        $this->userSigRepository = $userSigRepository;
    }

    public function findByToken($token) {
        return $this->findRowByValidToken($token, 'username,score,star,mail,email_visible,verified');
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

    public function findResetPasswordSearchUser($username) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $statement = "select username, rights, regdate, lastdate, mail, star
            from userinfo
            where username='$usernameEscaped'
            limit 1";
        $results = mysqli_query($this->con, $statement);
        if (!$results || mysqli_num_rows($results) == 0) {
            return null;
        }
        return mysqli_fetch_array($results, MYSQLI_ASSOC);
    }

    public function existsByUsername($username) {
        return $this->findRawUserByUsername($username) !== null;
    }

    public function legacyUserExistsCode($username) {
        if (strstr($username, "'") != "") {
            return '2';
        }
        return $this->existsByUsername($username) ? '1' : '0';
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

    public function findPasswordByToken($token) {
        $row = $this->findRowByValidToken($token, 'password');
        if (!$row) {
            return null;
        }
        return isset($row['password']) ? $row['password'] : null;
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

    public function touchPostingActivity($username, $time) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $time = intval($time);
        return mysqli_query($this->con, "update userinfo set lastpost=$time, tokentime=$time where username='$usernameEscaped'");
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

    public function insertRegisteredUser($data) {
        $usernameEscaped = mysqli_real_escape_string($this->con, isset($data['username']) ? $data['username'] : '');
        $passwordEscaped = mysqli_real_escape_string($this->con, isset($data['password']) ? $data['password'] : '');
        $tokenEscaped = mysqli_real_escape_string($this->con, isset($data['token']) ? $data['token'] : '');
        $time = intval(isset($data['time']) ? $data['time'] : 0);
        $sexEscaped = mysqli_real_escape_string($this->con, isset($data['sex']) ? $data['sex'] : '');
        $iconEscaped = mysqli_real_escape_string($this->con, isset($data['icon']) ? $data['icon'] : '');
        $introEscaped = mysqli_real_escape_string($this->con, isset($data['intro']) ? $data['intro'] : '');
        $sig1Escaped = mysqli_real_escape_string($this->con, isset($data['sig1']) ? $data['sig1'] : '');
        $sig2Escaped = mysqli_real_escape_string($this->con, isset($data['sig2']) ? $data['sig2'] : '');
        $sig3Escaped = mysqli_real_escape_string($this->con, isset($data['sig3']) ? $data['sig3'] : '');
        $hobbyEscaped = mysqli_real_escape_string($this->con, isset($data['hobby']) ? $data['hobby'] : '');
        $qqValue = intval(isset($data['qq']) ? $data['qq'] : 0);
        $mailEscaped = mysqli_real_escape_string($this->con, isset($data['mail']) ? $data['mail'] : '');
        $placeEscaped = mysqli_real_escape_string($this->con, isset($data['place']) ? $data['place'] : '');
        $regdateEscaped = mysqli_real_escape_string($this->con, isset($data['regdate']) ? $data['regdate'] : '');
        $lastdateEscaped = mysqli_real_escape_string($this->con, isset($data['lastdate']) ? $data['lastdate'] : '');
        $lastipEscaped = mysqli_real_escape_string($this->con, isset($data['lastip']) ? $data['lastip'] : '');
        $onlinetypeEscaped = mysqli_real_escape_string($this->con, isset($data['onlinetype']) ? $data['onlinetype'] : '');
        $logininfoEscaped = mysqli_real_escape_string($this->con, isset($data['logininfo']) ? $data['logininfo'] : '');
        $verified = intval(isset($data['verified']) ? $data['verified'] : 0);
        $emailVisible = intval(isset($data['email_visible']) ? $data['email_visible'] : 0);

        $statement = "insert into userinfo values (
            '$usernameEscaped','$passwordEscaped','$tokenEscaped',$time,'$sexEscaped','$iconEscaped','$introEscaped',
            '$sig1Escaped','$sig2Escaped','$sig3Escaped','$hobbyEscaped','$qqValue','$mailEscaped',
            '$placeEscaped','$regdateEscaped','$lastdateEscaped','$lastipEscaped',
            1,0,0,0,0,0,0,0,0,NULL,NULL,'$onlinetypeEscaped','$logininfoEscaped',
            null,null,null,null,null,null,null,$verified,$emailVisible
        )";

        return mysqli_query($this->con, $statement);
    }

    public function updateUserProfileByUsername($username, $data) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $time = intval(isset($data['tokentime']) ? $data['tokentime'] : 0);
        $sexEscaped = mysqli_real_escape_string($this->con, isset($data['sex']) ? $data['sex'] : '');
        $ipEscaped = mysqli_real_escape_string($this->con, isset($data['lastip']) ? $data['lastip'] : '');
        $iconEscaped = mysqli_real_escape_string($this->con, isset($data['icon']) ? $data['icon'] : '');
        $mailEscaped = mysqli_real_escape_string($this->con, isset($data['mail']) ? $data['mail'] : '');
        $emailVisible = intval(isset($data['email_visible']) ? $data['email_visible'] : 0);
        $qqEscaped = mysqli_real_escape_string($this->con, isset($data['qq']) ? $data['qq'] : '');
        $introEscaped = mysqli_real_escape_string($this->con, isset($data['intro']) ? $data['intro'] : '');
        $placeEscaped = mysqli_real_escape_string($this->con, isset($data['place']) ? $data['place'] : '');
        $hobbyEscaped = mysqli_real_escape_string($this->con, isset($data['hobby']) ? $data['hobby'] : '');
        $sig1Escaped = mysqli_real_escape_string($this->con, isset($data['sig1']) ? $data['sig1'] : '');
        $sig2Escaped = mysqli_real_escape_string($this->con, isset($data['sig2']) ? $data['sig2'] : '');
        $sig3Escaped = mysqli_real_escape_string($this->con, isset($data['sig3']) ? $data['sig3'] : '');

        $statement = "update userinfo set tokentime=$time, sex='$sexEscaped',
            lastip='$ipEscaped', icon='$iconEscaped', mail='$mailEscaped', email_visible=$emailVisible,
            qq='$qqEscaped', intro='$introEscaped', place='$placeEscaped',
            hobby='$hobbyEscaped', sig1='$sig1Escaped', sig2='$sig2Escaped', sig3='$sig3Escaped'
            where username='$usernameEscaped'";
        return mysqli_query($this->con, $statement);
    }

    public function updatePasswordAndTokenByToken($token, $passwordHash, $newToken) {
        $tokenEscaped = mysqli_real_escape_string($this->con, $token);
        $passwordEscaped = mysqli_real_escape_string($this->con, $passwordHash);
        $newTokenEscaped = mysqli_real_escape_string($this->con, $newToken);
        return mysqli_query($this->con, "update userinfo set password='$passwordEscaped',token='$newTokenEscaped' where token='$tokenEscaped' limit 1");
    }

    public function updatePasswordTokenAndTimeByUsername($username, $passwordHash, $token, $tokenTime) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $passwordEscaped = mysqli_real_escape_string($this->con, $passwordHash);
        $tokenEscaped = mysqli_real_escape_string($this->con, $token);
        $tokenTime = intval($tokenTime);
        return mysqli_query($this->con, "update userinfo set password='$passwordEscaped', token='$tokenEscaped', tokentime='$tokenTime' where username='$usernameEscaped' limit 1");
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

    public function countOnlineUsers($secondsWindow) {
        $cutoff = time() - intval($secondsWindow);
        $row = $this->fetchOne("select count(*) as num from userinfo where tokentime >= $cutoff");
        if (!$row) {
            return 0;
        }
        return intval($row['num']);
    }

    public function findOnlineUsers($secondsWindow) {
        $cutoff = time() - intval($secondsWindow);
        $statement = "select username, nowboard, tokentime, lastip, onlinetype, logininfo from userinfo where tokentime >= $cutoff";
        return $this->fetchAll($statement);
    }

    public function ensureDailyOnlineMax($onlineNum, $time) {
        $record = $this->fetchOne("select field1, field2 from mainpage where id=-2 limit 1");
        $maxNum = $record ? intval(isset($record['field1']) ? $record['field1'] : 0) : 0;
        $thatTime = $record ? intval(isset($record['field2']) ? $record['field2'] : 0) : 0;

        if ($onlineNum > $maxNum) {
            $maxNum = intval($onlineNum);
            $thatTime = intval($time);
            mysqli_query($this->con, "update mainpage set field1='$maxNum', field2='$thatTime' where id=-2");
        }

        return array(
            'maxnum' => $maxNum,
            'time' => $thatTime,
        );
    }

    public function countByEmail($email) {
        $emailEscaped = mysqli_real_escape_string($this->con, $email);
        $row = $this->fetchOne("select count(*) as cnt from userinfo where mail='$emailEscaped'");
        if (!$row) {
            return 0;
        }
        return intval($row['cnt']);
    }

    public function findVerifiedUserByEmail($email) {
        $emailEscaped = mysqli_real_escape_string($this->con, $email);
        return $this->fetchOne("select username from userinfo where mail='$emailEscaped' and verified=1 limit 1");
    }

    public function updateVerifiedByUsername($username) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        return mysqli_query($this->con, "update userinfo set verified=1 where username='$usernameEscaped'");
    }

    public function updateEmailAndVerified($username, $email) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $emailEscaped = mysqli_real_escape_string($this->con, $email);
        return mysqli_query($this->con, "update userinfo set mail='$emailEscaped', verified=1 where username='$usernameEscaped'");
    }

    public function updatePasswordAndTokenTimeByUsername($username, $passwordHash, $tokenTime) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $passwordEscaped = mysqli_real_escape_string($this->con, $passwordHash);
        $tokenTime = intval($tokenTime);
        return mysqli_query($this->con, "update userinfo set password='$passwordEscaped', tokentime=$tokenTime where username='$usernameEscaped'");
    }

    public function updateEmailVisible($username, $emailVisible) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        $emailVisible = intval($emailVisible);
        return mysqli_query($this->con, "update userinfo set email_visible=$emailVisible where username='$usernameEscaped'");
    }

    public function countVerifiedUsers() {
        $row = $this->fetchOne("select count(*) as cnt from userinfo where verified=1");
        if (!$row) {
            return 0;
        }
        return intval($row['cnt']);
    }

    public function lastError() {
        return mysqli_error($this->con);
    }

    public function lastErrno() {
        return mysqli_errno($this->con);
    }

    public function affectedRows() {
        return mysqli_affected_rows($this->con);
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
