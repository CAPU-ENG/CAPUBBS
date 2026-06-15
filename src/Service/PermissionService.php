<?php

class CapubbsPermissionService {
    private $userRepository;
    private $boardRepository;

    public function __construct($userRepository, $boardRepository) {
        $this->userRepository = $userRepository;
        $this->boardRepository = $boardRepository;
    }

    public function getLegacyRightsTuple($bid, $token) {
        $user = $this->userRepository->findSessionUserByToken($token);
        if (!$user) {
            return array(-1, "", "", 0);
        }

        $username = $user['username'];
        $rights = intval($user['rights']);
        $ip = isset($user['lastip']) ? $user['lastip'] : '';

        if ($rights >= 3) {
            return array(2, $username, $ip, $rights);
        }

        $able = 0;
        if (intval($bid) > 0 && $this->boardRepository->isModerator($bid, $username)) {
            $able = 1;
        }

        return array($able, $username, $ip, $rights);
    }

    public function getLegacyRightsRow($bid, $token) {
        $tuple = $this->getLegacyRightsTuple($bid, $token);
        return array(array(
            'username' => $tuple[1],
            'code' => strval($tuple[0]),
        ));
    }
}
