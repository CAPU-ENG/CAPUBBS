<?php

class CapubbsUserService {
    private $userRepository;
    private $permissionService;
    private $userSigRepository;

    public function __construct($userRepository, $permissionService, $userSigRepository) {
        $this->userRepository = $userRepository;
        $this->permissionService = $permissionService;
        $this->userSigRepository = $userSigRepository;
    }

    public function legacyGetUser($token) {
        if ($token === '') {
            return array(array('username' => '', 'rights' => '0'));
        }

        $row = $this->userRepository->findUsernameAndRightsByToken($token);
        if (!$row) {
            return array(array('username' => '', 'rights' => '0'));
        }

        return array(array(
            'username' => $row['username'],
            'rights' => $row['rights'],
        ));
    }

    public function legacyUserProfile($params) {
        $username = '';
        foreach (array('username', 'user', 'view') as $key) {
            if (isset($params[$key]) && trim($params[$key]) !== '') {
                $username = trim($params[$key]);
                break;
            }
        }

        if ($username === '') {
            return CapubbsLegacyResultAdapter::report('14', '缺少用户名。');
        }

        $viewer = '';
        if (isset($params['token']) && $params['token'] !== '') {
            $viewerUser = $this->userRepository->findByToken($params['token']);
            if ($viewerUser) {
                $viewer = $viewerUser['username'];
            }
        }

        $rows = $this->userRepository->findPublicProfiles($username, $viewer);
        if (count($rows) === 0) {
            return CapubbsLegacyResultAdapter::report('3', '用户不存在。');
        }

        return CapubbsLegacyResultAdapter::withCodeAndCount($rows, '0');
    }

    public function legacyCurrentUserInfo($token) {
        $user = $this->userRepository->findByToken($token);
        if (!$user) {
            return CapubbsLegacyResultAdapter::emptyRow();
        }

        return $this->userRepository->findPublicProfiles($user['username'], $user['username']);
    }

    public function legacyUserExists($params) {
        $user = isset($params['user']) ? $params['user'] : '';
        return array(array('code' => $this->userRepository->legacyUserExistsCode($user)));
    }

    public function legacyEditProfile($token, $ip, $params) {
        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return array(array('code' => '1', 'msg' => '超时，请重新登录。'));
        }

        $username = $user['username'];
        $sig1 = isset($params['sig1']) ? sanitize_xml($params['sig1']) : '';
        $sig2 = isset($params['sig2']) ? sanitize_xml($params['sig2']) : '';
        $sig3 = isset($params['sig3']) ? sanitize_xml($params['sig3']) : '';
        $intro = isset($params['intro']) ? sanitize_xml($params['intro']) : '';
        $mail = isset($params['mail']) ? sanitize_xml($params['mail']) : '';
        $place = isset($params['place']) ? sanitize_xml($params['place']) : '';
        $hobby = isset($params['hobby']) ? sanitize_xml($params['hobby']) : '';
        $qq = isset($params['qq']) ? sanitize_xml($params['qq']) : '';
        $icon = isset($params['icon']) ? sanitize_xml($params['icon']) : '';
        $sex = isset($params['sex']) ? sanitize_xml($params['sex']) : '';
        $emailVisible = isset($params['email_visible']) ? intval($params['email_visible']) : (isset($user['email_visible']) ? intval($user['email_visible']) : 0);

        $currentMail = isset($user['mail']) ? $user['mail'] : '';
        if ($mail !== $currentMail) {
            $mail = $currentMail;
        }

        $ok = $this->userRepository->updateUserProfileByUsername($username, array(
            'tokentime' => time(),
            'sex' => $sex,
            'lastip' => $ip,
            'icon' => $icon,
            'mail' => $mail,
            'email_visible' => $emailVisible,
            'qq' => $qq,
            'intro' => $intro,
            'place' => $place,
            'hobby' => $hobby,
            'sig1' => $sig1,
            'sig2' => $sig2,
            'sig3' => $sig3,
        ));
        if (!$ok) {
            return array(array('code' => '1', 'error' => $this->userRepository->lastError()));
        }

        $sig1Type = isset($params['sig1_type']) ? $params['sig1_type'] : 'null';
        $sig2Type = isset($params['sig2_type']) ? $params['sig2_type'] : 'null';
        $sig3Type = isset($params['sig3_type']) ? $params['sig3_type'] : 'null';
        $upsertErr = $this->userSigRepository->upsertAll($username, array(
            1 => $sig1,
            2 => $sig2,
            3 => $sig3,
        ), array(
            1 => $sig1Type,
            2 => $sig2Type,
            3 => $sig3Type,
        ));
        if ($upsertErr !== null) {
            return array(array('code' => '1', 'error' => '保存签名档失败: ' . $upsertErr));
        }

        return array(array('code' => '0', 'username' => $username));
    }

    public function findAdminResetPasswordSearchUser($username) {
        $username = trim(strval($username));
        if ($username === '') {
            return null;
        }
        return $this->userRepository->findResetPasswordSearchUser($username);
    }
}
