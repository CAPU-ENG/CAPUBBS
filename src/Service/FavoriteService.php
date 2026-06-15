<?php

class CapubbsFavoriteService {
    private $favoriteRepository;
    private $userRepository;

    public function __construct($favoriteRepository, $userRepository) {
        $this->favoriteRepository = $favoriteRepository;
        $this->userRepository = $userRepository;
    }

    public function legacyAdd($token, $bid, $tid) {
        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return CapubbsLegacyResultAdapter::report('-2', '请先登录');
        }

        $now = time();
        if ($this->favoriteRepository->add($user['username'], $bid, $tid, $now, $now)) {
            return array(array('code' => '0', 'msg' => '收藏成功'));
        }

        if ($this->favoriteRepository->lastErrno() == 1062) {
            return array(array('code' => '1', 'msg' => '已经收藏过了'));
        }

        return array(array('code' => '2', 'msg' => $this->favoriteRepository->lastError()));
    }

    public function legacyRemove($token, $bid, $tid) {
        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return CapubbsLegacyResultAdapter::report('-2', '请先登录');
        }

        $this->favoriteRepository->remove($user['username'], $bid, $tid);
        return array(array('code' => '0', 'msg' => '已取消收藏'));
    }

    public function legacyList($token, $params) {
        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return CapubbsLegacyResultAdapter::report('-2', '请先登录');
        }

        $sort = isset($params['sort']) ? $params['sort'] : 'time';
        $limitRaw = isset($params['limit']) ? $params['limit'] : '';
        $rows = $this->favoriteRepository->findListByUsername($user['username'], $sort, $this->parseLimit($limitRaw, 50));
        if ($rows === false) {
            return array(array('code' => '2', 'msg' => $this->favoriteRepository->lastError()));
        }

        $infos = array(array('code' => '0'));
        foreach ($rows as $row) {
            $info = array();
            foreach ($row as $key => $value) {
                if (is_long($key)) continue;
                $info[$key] = $value;
            }
            $info['deleted'] = ($row['title'] === null) ? '1' : '0';
            $infos[] = $info;
        }
        return $infos;
    }

    public function legacySort($token, $bid, $tid, $params) {
        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return CapubbsLegacyResultAdapter::report('-2', '请先登录');
        }

        $sortOrder = isset($params['sort_order']) ? intval($params['sort_order']) : 0;
        $this->favoriteRepository->updateSortOrder($user['username'], $bid, $tid, $sortOrder);
        return array(array('code' => '0'));
    }

    public function legacyCount($bid, $tid) {
        return array(array(
            'code' => '0',
            'count' => strval($this->favoriteRepository->countByThread($bid, $tid)),
        ));
    }

    public function legacyCheck($token, $bid, $tid) {
        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return array(array('code' => '0', 'favorited' => 'false'));
        }

        return array(array(
            'code' => '0',
            'favorited' => $this->favoriteRepository->exists($user['username'], $bid, $tid) ? 'true' : 'false',
        ));
    }

    private function parseLimit($raw, $default) {
        if ($raw === null || $raw === '' || $raw === '0') return intval($default);
        if ($raw === '-1' || strtolower(strval($raw)) === 'all') return null;
        $limit = intval($raw);
        if ($limit <= 0) return intval($default);
        return $limit;
    }
}
