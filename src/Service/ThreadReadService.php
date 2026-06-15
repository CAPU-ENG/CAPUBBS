<?php

class CapubbsThreadReadService {
    private $boardRepository;
    private $threadRepository;
    private $postRepository;
    private $userRepository;
    private $threadViewRepository;

    public function __construct($boardRepository, $threadRepository, $postRepository, $userRepository, $threadViewRepository) {
        $this->boardRepository = $boardRepository;
        $this->threadRepository = $threadRepository;
        $this->postRepository = $postRepository;
        $this->userRepository = $userRepository;
        $this->threadViewRepository = $threadViewRepository;
    }

    public function legacyBbsInfo($bid, $name) {
        $bid = intval($bid);
        if ($bid != 0) {
            $board = $this->boardRepository->findByBid($bid);
            if (!$board) {
                return array();
            }
            $info = $board;
            $date = date("Y-m-d");
            $time1 = strtotime($date . " 00:00:00");
            $time2 = strtotime($date . " 23:59:59");
            $info['topics'] = $this->threadRepository->countByBid($bid);
            $info['extr'] = $this->threadRepository->countExtrByBid($bid);
            $info['newpost'] = $this->threadRepository->countByBidAndPostdate($bid, $date);
            $info['newreply'] = $this->postRepository->countByBidReplyTimeRange($bid, $time1, $time2);
            return array($info);
        }

        return $this->boardRepository->findAll();
    }

    public function legacyHot($token, $params) {
        $hotnum = 10;
        if (isset($params['hotnum']) && $params['hotnum']) {
            $hotnum = intval($params['hotnum']);
        }
        if ($hotnum <= 0) {
            $hotnum = 10;
        }

        $infos = array();
        $user = $this->userRepository->findUsernameByValidToken($token);
        $infos[] = array('nowuser' => $user && isset($user['username']) ? $user['username'] : '');

        $rows = $this->threadRepository->findHotList($hotnum, false);
        foreach ($rows as $row) {
            $infos[] = $row;
        }
        return $infos;
    }

    public function legacyGlobalTop($token) {
        $infos = array();
        $user = $this->userRepository->findUsernameByValidToken($token);
        $infos[] = array('nowuser' => $user && isset($user['username']) ? $user['username'] : '');

        $rows = $this->threadRepository->findHotList(null, true);
        foreach ($rows as $row) {
            $infos[] = $row;
        }
        return $infos;
    }

    public function legacyGetTidInfo($bid, $tid) {
        $row = $this->threadRepository->findByBidTid($bid, $tid);
        if (!$row) {
            return array();
        }
        return array($row);
    }

    public function legacyRecentPost($view, $limitRaw) {
        $limit = $this->parseLimit($limitRaw, 10);
        $rows = $this->postRepository->findRecentThreadPostsByAuthor($view, $limit);
        if ($rows === false) {
            $rows = array();
        }

        $infos = array();
        $infos[] = array('nowuser' => '');
        foreach ($rows as $row) {
            $infos[] = $row;
        }
        return $infos;
    }

    public function legacyRecentReply($view, $limitRaw) {
        $limit = $this->parseLimit($limitRaw, 10);
        $rows = $this->postRepository->findRecentRepliesByAuthor($view, $limit);
        if ($rows === false) {
            $rows = array();
        }

        $infos = array();
        $infos[] = array('nowuser' => '');
        foreach ($rows as $row) {
            $infos[] = $row;
        }
        return $infos;
    }

    public function legacyGetPages($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        if ($tid == 0) {
            $num = $this->threadRepository->countByBid($bid);
            $pages = ceil($num / 25);
        } else {
            $thread = $this->threadRepository->findByBidTid($bid, $tid);
            $num = $thread ? intval($thread['reply']) : 0;
            $pages = ceil(($num + 1) / 12);
        }

        return array(array(
            'code' => '0',
            'pages' => strval($pages),
        ));
    }

    public function legacyGetLzNum($bid, $tid) {
        $thread = $this->threadRepository->findByBidTid($bid, $tid);
        if (!$thread || !isset($thread['author']) || $thread['author'] === '') {
            return array(array('num' => '0'));
        }

        $num = $this->postRepository->countByAuthorInThread($bid, $tid, $thread['author']);
        return array(array('num' => strval($num)));
    }

    public function legacySearchByKeyword($keyword, $type, $bid, $params) {
        $starttime = isset($params['starttime']) ? $params['starttime'] : '';
        $endtime = isset($params['endtime']) ? $params['endtime'] : '';
        $author = isset($params['author']) ? $params['author'] : '';

        $start = strtotime($starttime . " 00:00:00");
        $end = strtotime($endtime . " 23:59:59");
        if ($start == false || $start == -1) {
            $start = strtotime("2001-01-01 00:00:00");
        }
        if ($end == false || $end == -1) {
            $end = time();
        }

        if ($type == "thread") {
            return $this->postRepository->searchThreadsByKeyword($keyword, $bid, $start, $end, $author, 100);
        }
        if ($type == "post") {
            return $this->postRepository->searchPostsByKeyword($keyword, $bid, $start, $end, $author, 100);
        }

        return CapubbsLegacyResultAdapter::report('6', '缺少搜索类型参数（thread 或 post）');
    }

    public function legacyRecentThreads($params) {
        $limit = isset($params['limit']) ? intval($params['limit']) : 10;
        if ($limit <= 0) {
            $limit = 10;
        }
        if ($limit > 100) {
            $limit = 100;
        }
        $bid = isset($params['bid']) ? intval($params['bid']) : 0;
        return $this->threadRepository->findRecentThreads($limit, $bid);
    }

    public function legacyHotThreads($params) {
        $limit = isset($params['limit']) ? intval($params['limit']) : 10;
        $bid = isset($params['bid']) ? intval($params['bid']) : 0;
        $method = isset($params['method']) ? $params['method'] : 'composite';
        $days = isset($params['days']) ? intval($params['days']) : 7;
        $minReplies = isset($params['min_replies']) ? intval($params['min_replies']) : 0;

        if ($limit <= 0) {
            $limit = 10;
        }
        if ($limit > 100) {
            $limit = 100;
        }
        if ($days <= 0) {
            $days = 7;
        }

        return $this->threadRepository->findHotThreads($limit, $bid, $method, $days, $minReplies);
    }

    public function legacyGetOnePage($bid, $tid, $page, $seeLz, $ip, $token) {
        $username = '';
        if ($token !== '') {
            $user = $this->userRepository->findUsernameByValidToken($token);
            if ($user && isset($user['username'])) {
                $username = $user['username'];
                $this->userRepository->updateReadBoardSession($username, time(), $ip, $bid);
            }
        }

        $author = '';
        if ($seeLz !== '') {
            $thread = $this->threadRepository->findByBidTid($bid, $tid);
            if ($thread && isset($thread['author'])) {
                $author = $thread['author'];
            }
        }

        $this->recordThreadView($bid, $tid, $username, $ip, false);

        $rows = $this->postRepository->findByThreadPage($bid, $tid, $page, 12, $author);
        if ($rows === false) {
            return array();
        }
        return $rows;
    }

    public function recordThreadView($bid, $tid, $username, $ip, $updateUserSession) {
        if ($updateUserSession && $username !== '') {
            $this->userRepository->updateReadBoardSession($username, time(), $ip, $bid);
        }
        $this->threadViewRepository->recordView($username, date("Y-m-d"), $bid, $tid, $ip);
        $this->threadRepository->incrementClick($bid, $tid);
    }

    private function parseLimit($raw, $default) {
        if ($raw === null || $raw === '' || $raw === '0') {
            return $default;
        }
        if ($raw === '-1' || strtolower($raw) === 'all') {
            return null;
        }
        $limit = intval($raw);
        if ($limit <= 0) {
            return $default;
        }
        return $limit;
    }
}
