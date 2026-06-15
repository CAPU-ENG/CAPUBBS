<?php

class CapubbsNestedReplyService {
    private $nestedReplyRepository;
    private $postRepository;
    private $threadRepository;
    private $userRepository;
    private $messageRepository;
    private $boardRepository;
    private $notificationService;

    public function __construct(
        $nestedReplyRepository,
        $postRepository,
        $threadRepository,
        $userRepository,
        $messageRepository,
        $boardRepository,
        $notificationService
    ) {
        $this->nestedReplyRepository = $nestedReplyRepository;
        $this->postRepository = $postRepository;
        $this->threadRepository = $threadRepository;
        $this->userRepository = $userRepository;
        $this->messageRepository = $messageRepository;
        $this->boardRepository = $boardRepository;
        $this->notificationService = $notificationService;
    }

    public function legacyList($fid) {
        $rows = $this->nestedReplyRepository->findVisibleByFid($fid);
        if ($rows === false) {
            return array();
        }
        return $rows;
    }

    public function groupVisibleByFids($fids) {
        $rows = $this->nestedReplyRepository->findVisibleByFids($fids);
        if ($rows === false) {
            return array();
        }

        $grouped = array();
        foreach ($rows as $row) {
            $fid = intval(isset($row['fid']) ? $row['fid'] : 0);
            if (!isset($grouped[$fid])) {
                $grouped[$fid] = array();
            }
            $grouped[$fid][] = $row;
        }
        return $grouped;
    }

    public function legacyPost($fid, $token, $ip, $params) {
        $fid = intval($fid);
        $time = time();
        $session = $this->userRepository->findThreadReadSessionByToken($token);
        if (!$session || !isset($session['username'])) {
            return CapubbsLegacyResultAdapter::report('1', '超时，请重新登录。');
        }

        $username = $session['username'];
        $parentPost = $this->postRepository->findByFid($fid);
        if (!$parentPost) {
            return CapubbsLegacyResultAdapter::report('3', '帖子不存在！');
        }

        $bid = intval(isset($parentPost['bid']) ? $parentPost['bid'] : 0);
        $mutedReason = $this->userRepository->findMuteReason($username, $bid);
        if ($mutedReason) {
            return CapubbsLegacyResultAdapter::report(
                strval(ApiError::USER_MUTED),
                '您暂时不能发帖（' . $mutedReason . '）。请先验证邮箱或联系管理员。'
            );
        }

        $delayError = $this->checkDelay($time, $session, $ip);
        if ($delayError !== null) {
            return $delayError;
        }

        $text = isset($params['text']) ? $params['text'] : '';
        if (trim($text) === '') {
            return CapubbsLegacyResultAdapter::report('11', '内容不能为空。');
        }

        if ($this->nestedReplyRepository->countAllByFid($fid) >= 100) {
            return CapubbsLegacyResultAdapter::report('10', '楼中楼数目已经达到上限。');
        }

        $tid = intval(isset($parentPost['tid']) ? $parentPost['tid'] : 0);
        $pid = intval(isset($parentPost['pid']) ? $parentPost['pid'] : 0);
        $postAuthor = isset($parentPost['author']) ? $parentPost['author'] : '';
        $thread = $this->threadRepository->findByBidTid($bid, $tid);
        if (!$thread) {
            return CapubbsLegacyResultAdapter::report('3', '帖子不存在！');
        }
        if (intval(isset($thread['locked']) ? $thread['locked'] : 0) === 1) {
            return CapubbsLegacyResultAdapter::report('3', '帖子已锁定。');
        }

        if (mb_strlen($text, 'utf-8') >= 503) {
            $text = mb_substr($text, 0, 500, 'utf-8') . "...";
        }

        if (!$this->nestedReplyRepository->insert($fid, $username, $text, $time)) {
            return array(array(
                'code' => '2',
                'msg' => $this->nestedReplyRepository->lastError(),
            ));
        }

        $this->postRepository->incrementNestedReplyCountByFid($fid);
        $this->userRepository->touchPostingActivity($username, $time);

        $threadAuthor = isset($thread['author']) ? $thread['author'] : '';
        $threadTitle = isset($thread['title']) ? $thread['title'] : '';
        $this->notificationService->notifyNestedReply($text, $bid, $tid, $pid, $username, $threadTitle, $threadAuthor, $postAuthor);

        return array(array('code' => '0'));
    }

    public function legacyDelete($fid, $token, $params) {
        $fid = intval($fid);
        $lzlId = isset($params['lzlid']) ? intval($params['lzlid']) : (isset($params['id']) ? intval($params['id']) : 0);
        if ($lzlId <= 0) {
            return CapubbsLegacyResultAdapter::report('3', '帖子不存在！');
        }

        $session = $this->userRepository->findUsernameAndRightsByToken($token);
        if (!$session || !isset($session['username'])) {
            return CapubbsLegacyResultAdapter::report('1', '超时，请重新登录。');
        }

        $nestedReply = $this->nestedReplyRepository->findById($lzlId);
        if (!$nestedReply) {
            return CapubbsLegacyResultAdapter::report('3', '帖子不存在！');
        }

        $parentPost = $this->postRepository->findByFid($fid);
        if (!$parentPost) {
            return CapubbsLegacyResultAdapter::report('3', '帖子不存在！');
        }

        $username = $session['username'];
        $rights = intval(isset($session['rights']) ? $session['rights'] : 0);
        $bid = intval(isset($parentPost['bid']) ? $parentPost['bid'] : 0);
        $nestedReplyAuthor = isset($nestedReply['author']) ? $nestedReply['author'] : '';

        if ($nestedReplyAuthor == $username) {
            $mutedReason = $this->userRepository->findMuteReason($username, $bid);
            if ($mutedReason) {
                return CapubbsLegacyResultAdapter::report(
                    strval(ApiError::USER_MUTED),
                    '您暂时不能删除帖子（' . $mutedReason . '）。请先验证邮箱或联系管理员。'
                );
            }
        }

        $able = $this->boardRepository->isModerator($bid, $username) ? 1 : 0;
        if (($rights + $able < 3) && $nestedReplyAuthor != $username) {
            return CapubbsLegacyResultAdapter::report('5', '权限不足！');
        }

        $this->nestedReplyRepository->hideById($lzlId);
        $this->postRepository->decrementNestedReplyCountByFid($fid);

        return array(array('code' => '0'));
    }

    private function checkDelay($time, $session, $ip) {
        $star = intval(isset($session['star']) ? $session['star'] : 0);
        $rights = intval(isset($session['rights']) ? $session['rights'] : 0);
        $lastpost = intval(isset($session['lastpost']) ? $session['lastpost'] : 0);

        $inschool = true;
        $delta = 180;
        if ($inschool || $rights >= 1 || $star >= 3) {
            $delta = 15;
        }
        if ($time - $lastpost >= 0 && $time - $lastpost <= $delta) {
            if ($inschool) {
                $msg = '两次发表/回复的时间间隔不能少于15秒';
            } else {
                $msg = '您的ip位于校外，两次发表/回复的时间间隔不能少于3分钟';
            }
            return array(array('code' => '2', 'msg' => $msg . '！'));
        }
        return null;
    }
}
