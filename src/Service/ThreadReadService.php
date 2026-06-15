<?php

class CapubbsThreadReadService {
    private $threadRepository;
    private $postRepository;
    private $userRepository;
    private $threadViewRepository;

    public function __construct($threadRepository, $postRepository, $userRepository, $threadViewRepository) {
        $this->threadRepository = $threadRepository;
        $this->postRepository = $postRepository;
        $this->userRepository = $userRepository;
        $this->threadViewRepository = $threadViewRepository;
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
