<?php

class CapubbsAuthService {
    private $userRepository;
    private $signRepository;

    public function __construct($userRepository, $signRepository) {
        $this->userRepository = $userRepository;
        $this->signRepository = $signRepository;
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
