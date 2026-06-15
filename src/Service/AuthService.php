<?php

class CapubbsAuthService {
    private $userRepository;
    private $signRepository;
    private $userSigRepository;
    private $emailVerificationRepository;

    public function __construct($userRepository, $signRepository, $userSigRepository, $emailVerificationRepository) {
        $this->userRepository = $userRepository;
        $this->signRepository = $signRepository;
        $this->userSigRepository = $userSigRepository;
        $this->emailVerificationRepository = $emailVerificationRepository;
    }

    public function legacyLogin($usernameRaw, $password, $ip, $params) {
        if (isset($params['md5']) && $params['md5'] == "yes") {
            $password = md5($password);
        }

        $user = $this->userRepository->findForLogin($usernameRaw);
        if (!$user) {
            return CapubbsLegacyResultAdapter::report('1', '用户不存在。');
        }

        $passwordInDb = $user['password'];
        if (strtoupper($passwordInDb) != strtoupper($password)) {
            return CapubbsLegacyResultAdapter::report('2', '密码错误。');
        }

        $nowtime = time();
        $username = $user['username'];
        $token = md5($username . $nowtime);

        $currentToken = $this->userRepository->findValidTokenByUsername($username, $nowtime);
        if ($currentToken !== null && $currentToken !== '') {
            $token = $currentToken;
        }

        $today = date("Y-m-d");
        $onlinetype = isset($params['onlinetype']) ? $params['onlinetype'] : '';
        $browser = isset($params['browser']) ? $params['browser'] : '';
        $systemStr = isset($params['system']) ? $params['system'] : '';
        $logininfo = "";
        if ($onlinetype == "web") $logininfo = $browser;
        if ($onlinetype == "android" || $onlinetype == "ios") $logininfo = $systemStr;

        $this->userRepository->updateLoginSession(
            $username,
            $token,
            $nowtime,
            $ip,
            $today,
            $onlinetype,
            $logininfo
        );

        $this->signRepository->ensureSignedToday($username);

        return array(array(
            'code' => '0',
            'username' => $username,
            'token' => $token,
        ));
    }

    public function legacyLogout($token, $ip) {
        $today = date("Y-m-d");
        $this->userRepository->updateLogoutSessionByToken($token, $ip, $today);
        return array(array('code' => '0'));
    }

    public function legacyRegister($ip, $params) {
        $usernameRaw = isset($params['username']) ? $params['username'] : '';
        if (empty(trim($usernameRaw))) {
            return array(array('code' => '1', 'msg' => '用户名不能为空。'));
        }

        if ($this->userRepository->existsByUsername($usernameRaw)) {
            return array(array('code' => '1', 'msg' => '用户已存在。'));
        }

        $password = isset($params['password']) ? $params['password'] : '';
        if (isset($params['md5']) && $params['md5'] == "yes") {
            $password = md5($password);
        }

        $sex = isset($params['sex']) ? $params['sex'] : '';
        $icon = isset($params['icon']) ? $params['icon'] : '';
        $qqValue = isset($params['qq']) ? intval($params['qq']) : 0;
        $mailRaw = isset($params['mail']) ? trim($params['mail']) : '';
        $introRaw = isset($params['intro']) ? $params['intro'] : '';
        $placeRaw = isset($params['place']) ? $params['place'] : '';
        $hobbyRaw = isset($params['hobby']) ? $params['hobby'] : '';
        $sig1Raw = isset($params['sig1']) ? sanitize_xml($params['sig1']) : '';
        $sig2Raw = isset($params['sig2']) ? sanitize_xml($params['sig2']) : '';
        $sig3Raw = isset($params['sig3']) ? sanitize_xml($params['sig3']) : '';
        $sig1TypeRaw = isset($params['sig1_type']) ? $params['sig1_type'] : 'null';
        $sig2TypeRaw = isset($params['sig2_type']) ? $params['sig2_type'] : 'null';
        $sig3TypeRaw = isset($params['sig3_type']) ? $params['sig3_type'] : 'null';

        if (CAPUBBS_ENABLE_EMAIL_VERIFY) {
            if (!CapubbsEmailVerificationService::isPkuEmailAddress($mailRaw)) {
                return array(array(
                    'code' => strval(ApiError::INVALID_EMAIL_DOMAIN),
                    'msg' => '仅支持 学号@*.pku.edu.cn 或 学号@bjmu.edu.cn（学号为10位数字）。'
                ));
            }

            $verifyCode = isset($params['verify_code']) ? trim($params['verify_code']) : '';
            if ($verifyCode === '') {
                return array(array(
                    'code' => strval(ApiError::MISSING_FIELD),
                    'msg' => '请先验证邮箱，输入邮件中的验证码。'
                ));
            }

            $verification = $this->emailVerificationRepository->findLatestUsableByEmailCodeType($mailRaw, $verifyCode, 'register');
            if (!$verification) {
                return array(array(
                    'code' => strval(ApiError::VERIFY_CODE_INVALID),
                    'msg' => '验证码无效，请重新获取。'
                ));
            }

            if (intval(isset($verification['expires_at']) ? $verification['expires_at'] : 0) < time()) {
                return array(array(
                    'code' => strval(ApiError::VERIFY_CODE_EXPIRED),
                    'msg' => '验证码已过期，请重新获取。'
                ));
            }

            $this->emailVerificationRepository->markUsedById(intval($verification['id']));
        }

        $time = time();
        $token = md5($usernameRaw . $time);
        $date = date("Y-m-d");

        $onlinetype = isset($params['onlinetype']) ? $params['onlinetype'] : '';
        $browser = isset($params['browser']) ? $params['browser'] : '';
        $systemValue = isset($params['system']) ? $params['system'] : '';
        $logininfo = "";
        if ($onlinetype == "web") $logininfo = $browser;
        if ($onlinetype == "android" || $onlinetype == "ios") $logininfo = $systemValue;

        $sigs = array(
            1 => $sig1Raw,
            2 => $sig2Raw,
            3 => $sig3Raw,
        );
        $sigTypes = array(
            1 => $sig1TypeRaw,
            2 => $sig2TypeRaw,
            3 => $sig3TypeRaw,
        );

        $ok = $this->userRepository->insertRegisteredUser(array(
            'username' => $usernameRaw,
            'password' => $password,
            'token' => $token,
            'time' => $time,
            'sex' => $sex,
            'icon' => $icon,
            'intro' => sanitize_xml($introRaw),
            'sig1' => $sig1Raw,
            'sig2' => $sig2Raw,
            'sig3' => $sig3Raw,
            'hobby' => sanitize_xml($hobbyRaw),
            'qq' => $qqValue,
            'mail' => sanitize_xml($mailRaw),
            'place' => sanitize_xml($placeRaw),
            'regdate' => $date,
            'lastdate' => $date,
            'lastip' => $ip,
            'onlinetype' => $onlinetype,
            'logininfo' => $logininfo,
            'verified' => CAPUBBS_ENABLE_EMAIL_VERIFY ? 1 : 0,
            'email_visible' => 0,
        ));
        if (!$ok) {
            return array(array(
                'code' => strval($this->userRepository->lastErrno()),
                'msg' => $this->userRepository->lastError(),
            ));
        }

        $upsertErr = $this->userSigRepository->upsertAll($usernameRaw, $sigs, $sigTypes);
        if ($upsertErr !== null) {
            return array(array('code' => '1', 'msg' => '保存签名档失败: ' . $upsertErr));
        }

        return array(array(
            'code' => '0',
            'username' => $usernameRaw,
            'token' => $token,
        ));
    }

    public function legacyChangePassword($token, $params) {
        $oldPasswordHash = isset($params['old']) ? $params['old'] : '';
        $passwordInDb = $this->userRepository->findPasswordByToken($token);
        if ($passwordInDb === null) {
            return CapubbsLegacyResultAdapter::report('1', "会话超时，请重新<a href='../login'>登录</a>");
        }

        if (strtoupper($passwordInDb) != strtoupper($oldPasswordHash)) {
            return CapubbsLegacyResultAdapter::report('2', '旧密码不正确，请重新输入');
        }

        $nowtime = time();
        $newPasswordHash = strtoupper(isset($params['new']) ? $params['new'] : '');
        $newToken = md5($oldPasswordHash . $nowtime);

        if ($this->userRepository->updatePasswordAndTokenByToken($token, $newPasswordHash, $newToken)) {
            return array(array(
                'code' => '0',
                'msg' => $newToken,
                'token' => $newToken,
            ));
        }

        return CapubbsLegacyResultAdapter::report('3', $this->userRepository->lastError());
    }

    public function legacyAdminResetPassword($token, $params) {
        if (!$token) {
            return CapubbsLegacyResultAdapter::report('1', '尚未登录');
        }

        $caller = $this->userRepository->findSessionUserByToken($token);
        if (!$caller) {
            return CapubbsLegacyResultAdapter::report('1', '会话超时，请重新登录');
        }
        if (intval(isset($caller['rights']) ? $caller['rights'] : 0) < 10) {
            return CapubbsLegacyResultAdapter::report('2', '权限不足：仅限 rights >= 10 的管理员操作');
        }

        $targetUsername = isset($params['target_username']) ? trim($params['target_username']) : '';
        if ($targetUsername === '') {
            return CapubbsLegacyResultAdapter::report('3', '参数错误：缺少目标用户名');
        }

        $nowtime = time();
        $newPassword = strtoupper(md5('123456'));
        $newToken = md5($targetUsername . $nowtime);
        if ($this->userRepository->updatePasswordTokenAndTimeByUsername($targetUsername, $newPassword, $newToken, $nowtime)) {
            if ($this->userRepository->affectedRows() > 0) {
                return CapubbsLegacyResultAdapter::report('0', '密码已重置为 123456');
            }
            return CapubbsLegacyResultAdapter::report('4', '用户不存在');
        }

        return CapubbsLegacyResultAdapter::report('5', $this->userRepository->lastError());
    }

    public function legacyCheckUserAndSign($token, $ip, $params) {
        $user = $this->userRepository->findThreadReadSessionByToken($token);
        if (!$user || !isset($user['username'])) {
            return null;
        }

        $username = $user['username'];
        $nowtime = time();
        $today = date("Y-m-d");
        $onlinetype = "web";
        $browser = isset($params['browser']) ? $params['browser'] : '';
        $system = isset($params['system']) ? $params['system'] : '';
        $logininfo = "";
        if ($onlinetype == "web") $logininfo = $browser;
        if ($onlinetype == "android" || $onlinetype == "ios") $logininfo = $system;

        if ($ip != "") {
            $this->userRepository->insertUsernameLastIp($username, $ip);
        }

        $this->userRepository->refreshValidatedSession(
            $username,
            $token,
            $nowtime,
            $ip,
            $today,
            $onlinetype,
            $logininfo
        );

        $this->signRepository->ensureSignedToday($username);
        return $username;
    }

    public function legacyTouchSession($token, $ip) {
        $user = $this->userRepository->findUsernameByValidToken($token);
        if (!$user) {
            return CapubbsLegacyResultAdapter::report('1', '超时，请重新登录。');
        }

        $this->userRepository->touchTokenByUsername($user['username'], $ip, time());
        return array(array(
            'code' => '0',
            'username' => $user['username'],
        ));
    }
}
