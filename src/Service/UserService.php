<?php

class CapubbsUserService {
    private $userRepository;
    private $permissionService;

    public function __construct($userRepository, $permissionService) {
        $this->userRepository = $userRepository;
        $this->permissionService = $permissionService;
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
}
