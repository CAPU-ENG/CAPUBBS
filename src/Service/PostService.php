<?php

class CapubbsPostService {
    private $boardRepository;
    private $threadRepository;
    private $postRepository;
    private $userRepository;
    private $messageRepository;
    private $attachmentRepository;
    private $editHistoryRepository;
    private $trashRepository;
    private $activityRepository;
    private $permissionService;
    private $notificationService;

    public function __construct(
        $boardRepository,
        $threadRepository,
        $postRepository,
        $userRepository,
        $messageRepository,
        $attachmentRepository,
        $editHistoryRepository,
        $trashRepository,
        $activityRepository,
        $permissionService,
        $notificationService
    ) {
        $this->boardRepository = $boardRepository;
        $this->threadRepository = $threadRepository;
        $this->postRepository = $postRepository;
        $this->userRepository = $userRepository;
        $this->messageRepository = $messageRepository;
        $this->attachmentRepository = $attachmentRepository;
        $this->editHistoryRepository = $editHistoryRepository;
        $this->trashRepository = $trashRepository;
        $this->activityRepository = $activityRepository;
        $this->permissionService = $permissionService;
        $this->notificationService = $notificationService;
    }

    public function legacyPost($token, $bid, $ip, $attachs, $params) {
        if (!$this->isValidPostingBoard($bid)) {
            return CapubbsLegacyResultAdapter::report('15', '版块不存在。');
        }

        $time = time();
        $session = $this->userRepository->findThreadReadSessionByToken($token);
        if (!$session || !isset($session['username'])) {
            return CapubbsLegacyResultAdapter::report('1', '超时，请重新登录。');
        }

        $delayError = $this->checkDelay($time, $session, $ip);
        if ($delayError !== null) {
            return $delayError;
        }

        $username = $session['username'];
        $mutedReason = $this->userRepository->findMuteReason($username, $bid);
        if ($mutedReason) {
            return CapubbsLegacyResultAdapter::report(strval(ApiError::USER_MUTED), '您暂时不能发帖（' . $mutedReason . '）。请先验证邮箱或联系管理员。');
        }

        $titleRaw = isset($params['title']) ? $params['title'] : '';
        if (mb_strlen($titleRaw, 'utf-8') >= 43) {
            $titleRaw = mb_substr($titleRaw, 0, 40, 'utf-8') . "...";
        }
        $title = html_entity_decode($titleRaw);
        $text = html_entity_decode(isset($params['text']) ? $params['text'] : '');
        $type = isset($params['type']) ? $params['type'] : '';
        $sig = isset($params['sig']) ? intval($params['sig']) : 0;

        $tid = $this->threadRepository->findMaxTidIncludingTrash($bid) + 1;
        $pid = 1;
        $postdate = date('Y-m-d');

        $this->notificationService->notifyMentionsAndQuotes($text, $bid, $tid, $pid, $username, $title);

        $this->threadRepository->insertThread($bid, $tid, $title, $username, $time, $postdate);
        $fid = $this->postRepository->insertPost($bid, $tid, $pid, $title, $username, $text, 'YES', $attachs, $time, $time, $sig, $ip, $type, 0);
        $this->userRepository->incrementPostStats($username, $bid, $time);
        $this->userRepository->recalculateStar($username);

        return array(array(
            'code' => '0',
            'bid' => strval($bid),
            'tid' => strval($tid),
            'pid' => strval($pid),
            'fid' => strval($fid),
        ));
    }

    public function legacyReply($token, $bid, $tid, $ip, $attachs, $params) {
        if (!$this->isValidPostingBoard($bid)) {
            return CapubbsLegacyResultAdapter::report('15', '版块不存在。');
        }

        $time = time();
        $session = $this->userRepository->findThreadReadSessionByToken($token);
        if (!$session || !isset($session['username'])) {
            return CapubbsLegacyResultAdapter::report('1', '超时，请重新登录。');
        }

        $delayError = $this->checkDelay($time, $session, $ip);
        if ($delayError !== null) {
            return $delayError;
        }

        $username = $session['username'];
        $mutedReason = $this->userRepository->findMuteReason($username, $bid);
        if ($mutedReason) {
            return CapubbsLegacyResultAdapter::report(strval(ApiError::USER_MUTED), '您暂时不能发帖（' . $mutedReason . '）。请先验证邮箱或联系管理员。');
        }

        $activity = $this->activityRepository->findThreadActivity($bid, $tid);
        if ($activity) {
            return CapubbsLegacyResultAdapter::report('3', '禁止直接回复报名帖！');
        }

        $lastPid = $this->postRepository->findLastPidInThread($bid, $tid);
        if ($lastPid === null) {
            return CapubbsLegacyResultAdapter::report('3', '主题不存在！');
        }
        $pid = $lastPid + 1;

        $thread = $this->threadRepository->findByBidTid($bid, $tid);
        if (!$thread) {
            return CapubbsLegacyResultAdapter::report('3', '主题不存在！');
        }
        if (intval($thread['locked']) === 1) {
            return CapubbsLegacyResultAdapter::report('4', '主题已锁定。');
        }

        $title = html_entity_decode(isset($params['title']) ? $params['title'] : '');
        $text = html_entity_decode(isset($params['text']) ? $params['text'] : '');
        $type = isset($params['type']) ? $params['type'] : '';
        $sig = isset($params['sig']) ? intval($params['sig']) : 0;

        $this->notificationService->notifyMentionsAndQuotes($text, $bid, $tid, $pid, $username, $title);

        $fid = $this->postRepository->insertPost($bid, $tid, $pid, $title, $username, $text, 'YES', $attachs, $time, $time, $sig, $ip, $type, 0);
        if ($fid === false) {
            return array(array('code' => '8', 'msg' => 'error:' . $this->postRepository->lastError()));
        }

        $this->attachmentRepository->incrementRefsByAttachString($attachs);
        $this->threadRepository->incrementReply($bid, $tid, $username, $time);
        $this->userRepository->incrementReplyStats($username, $bid, $time);
        $this->userRepository->recalculateStar($username);

        $threadAuthor = isset($thread['author']) ? $thread['author'] : '';
        $this->notificationService->notifyThreadReply(
            $threadAuthor,
            $username,
            $bid,
            $tid,
            $pid,
            isset($thread['title']) ? $thread['title'] : ''
        );

        return array(array(
            'code' => '0',
            'bid' => strval($bid),
            'tid' => strval($tid),
            'pid' => strval($pid),
            'fid' => strval($fid),
        ));
    }

    public function legacyEdit($token, $bid, $tid, $pid, $ip, $attachs, $params) {
        if (!$this->isValidPostingBoard($bid)) {
            return CapubbsLegacyResultAdapter::report('15', '版块不存在。');
        }

        $time = time();
        $rights = $this->permissionService->getLegacyRightsTuple($bid, $token);
        if ($rights[0] == -1) {
            return CapubbsLegacyResultAdapter::report('1', '超时，请重新登录。');
        }

        $post = $this->postRepository->findByBidTidPid($bid, $tid, $pid);
        if (!$post) {
            return CapubbsLegacyResultAdapter::report('3', '主题不存在！');
        }

        $author = isset($post['author']) ? $post['author'] : '';
        $fid = intval(isset($post['fid']) ? $post['fid'] : 0);
        $oldText = isset($post['text']) ? $post['text'] : '';
        $username = $rights[1];
        if ($rights[0] == 0 && $username != $author) {
            return CapubbsLegacyResultAdapter::report('5', '权限不足！');
        }

        if ($rights[0] == 0 && $username == $author) {
            $mutedReason = $this->userRepository->findMuteReason($username, $bid);
            if ($mutedReason) {
                return CapubbsLegacyResultAdapter::report(strval(ApiError::USER_MUTED), '您暂时不能编辑帖子（' . $mutedReason . '）。请先验证邮箱或联系管理员。');
            }
        }

        $thread = $this->threadRepository->findByBidTid($bid, $tid);
        if (!$thread) {
            return CapubbsLegacyResultAdapter::report('3', '主题不存在！');
        }
        if (intval($thread['locked']) === 1) {
            return CapubbsLegacyResultAdapter::report('4', '主题已锁定。');
        }

        $activity = $this->activityRepository->findThreadActivity($bid, $tid);
        if ($activity) {
            if ($activity['leader_username'] != $username || intval($pid) != 1) {
                return CapubbsLegacyResultAdapter::report('5', '禁止编辑报名帖！');
            }
        }

        $parentId = $this->editHistoryRepository->findLatestVersionIdByFid($fid);
        $this->editHistoryRepository->insertVersion($fid, $bid, $tid, $pid, $parentId, $oldText, $author, 'edit', $time, $username, $ip);

        $title = html_entity_decode(isset($params['title']) ? $params['title'] : '');
        $text = html_entity_decode(isset($params['text']) ? $params['text'] : '');
        $type = isset($params['type']) ? $params['type'] : '';
        $sig = isset($params['sig']) ? intval($params['sig']) : 0;

        $this->postRepository->updatePostContent($bid, $tid, $pid, $title, $username, $text, $sig, $ip, $type, $attachs, $time);
        if (intval($pid) === 1) {
            $this->threadRepository->updateTitleAndAuthor($bid, $tid, $title, $username);
        }

        $number = $this->postRepository->countInThread($bid, $tid);
        if (intval($pid) === intval($number)) {
            $this->threadRepository->updateReplyer($bid, $tid, $username);
        }

        return array(array(
            'code' => '0',
            'bid' => strval($bid),
            'tid' => strval($tid),
            'pid' => strval($pid),
        ));
    }

    public function legacyThreadsAction($token, $bid, $tid, $action) {
        if (!$this->isValidPostingBoard($bid)) {
            return CapubbsLegacyResultAdapter::report('15', '版块不存在。');
        }

        $rights = $this->permissionService->getLegacyRightsTuple($bid, $token);
        if ($rights[0] == -1) {
            return CapubbsLegacyResultAdapter::report('1', '超时，请重新登录。');
        }
        if ($rights[0] == 0) {
            return CapubbsLegacyResultAdapter::report('5', '权限不足！');
        }

        $thread = $this->threadRepository->findByBidTid($bid, $tid);
        if (!$thread) {
            return CapubbsLegacyResultAdapter::report('3', '主题不存在！');
        }

        if ($action == 'global_top_action') {
            if ($this->threadRepository->isGlobalTop($bid, $tid)) {
                $this->threadRepository->removeGlobalTop($bid, $tid);
            } else {
                $this->threadRepository->addGlobalTop($bid, $tid);
            }
            return array(array('code' => '0'));
        }

        $fieldMap = array(
            'lock' => 'locked',
            'top' => 'top',
            'extr' => 'extr',
        );
        if (!isset($fieldMap[$action])) {
            return CapubbsLegacyResultAdapter::report('14', '未知操作');
        }

        $this->threadRepository->toggleField($bid, $tid, $fieldMap[$action]);
        $error = $this->threadRepository->lastError();
        if ($error) {
            return array(array('code' => '2', 'error' => $error));
        }

        if ($action == 'extr') {
            $updatedThread = $this->threadRepository->findByBidTid($bid, $tid);
            if ($updatedThread) {
                $delta = intval($updatedThread['extr']) === 1 ? 1 : -1;
                $author = isset($updatedThread['author']) ? $updatedThread['author'] : '';
                if ($author !== '') {
                    $this->userRepository->adjustExtrCount($author, $delta);
                }
            }
        }

        return array(array('code' => '0'));
    }

    public function legacyDelete($token, $bid, $tid, $pid) {
        if (!$this->isValidPostingBoard($bid)) {
            return CapubbsLegacyResultAdapter::report('15', '版块不存在。');
        }

        $time = time();
        $rights = $this->permissionService->getLegacyRightsTuple($bid, $token);
        if ($rights[0] == -1) {
            return CapubbsLegacyResultAdapter::report('1', '超时，请重新登录。');
        }

        $username = $rights[1];
        $ip = $rights[2];
        if ($rights[0] == 0) {
            $mutedReason = $this->userRepository->findMuteReason($username, $bid);
            if ($mutedReason) {
                return CapubbsLegacyResultAdapter::report(strval(ApiError::USER_MUTED), '您暂时不能删除帖子（' . $mutedReason . '）。请先验证邮箱或联系管理员。');
            }
        }

        if (intval($pid) == 0) {
            return $this->legacyDeleteThread($rights, $username, $ip, $bid, $tid, $time);
        }

        return $this->legacyDeleteSinglePost($rights, $username, $ip, $bid, $tid, $pid, $time, $token);
    }

    public function legacyMove($token, $bid, $tid, $to) {
        if (!$this->isValidPostingBoard($bid)) {
            return CapubbsLegacyResultAdapter::report('15', '版块不存在。');
        }
        if (!$this->isValidPostingBoard($to)) {
            return CapubbsLegacyResultAdapter::report('15', '目标版块不存在。');
        }

        $rights = $this->permissionService->getLegacyRightsTuple($bid, $token);
        if ($rights[0] != 2) {
            return CapubbsLegacyResultAdapter::report('5', '权限不足！');
        }

        $thread = $this->threadRepository->findByBidTid($bid, $tid);
        if (!$thread) {
            return CapubbsLegacyResultAdapter::report('3', '主题不存在！');
        }

        $toTid = $this->threadRepository->findMaxTidIncludingTrash($to) + 1;
        $this->threadRepository->moveThread($bid, $tid, $to, $toTid);
        $this->postRepository->moveThreadPosts($bid, $tid, $to, $toTid);

        return array(array(
            'code' => '0',
            'bid' => strval($to),
            'tid' => strval($toTid),
        ));
    }

    public function legacyEditPreview($token, $bid, $tid, $pid) {
        $user = $this->userRepository->findByToken($token);
        if (!$user) {
            return CapubbsLegacyResultAdapter::report('1', '尚未登录');
        }

        $post = $this->postRepository->findByBidTidPid($bid, $tid, $pid);
        if (!$post) {
            return CapubbsLegacyResultAdapter::report('4', '贴子不存在');
        }

        if ($post['author'] != $user['username']) {
            $rights = $this->permissionService->getLegacyRightsTuple($bid, $token);
            if ($rights[0] < 1) {
                return CapubbsLegacyResultAdapter::report('2', '无权编辑');
            }
        }

        $infos = array();
        $infos[] = array('code' => '0');
        $infos[] = $this->buildUserInfoRow($user);
        $infos[] = $this->buildAssocRow($post);
        return $infos;
    }

    private function legacyDeleteThread($rights, $username, $ip, $bid, $tid, $time) {
        $thread = $this->threadRepository->findByBidTid($bid, $tid);
        if (!$thread) {
            return CapubbsLegacyResultAdapter::report('3', '主题不存在！');
        }

        $author = isset($thread['author']) ? $thread['author'] : '';
        $replyNum = intval(isset($thread['reply']) ? $thread['reply'] : 0);
        if ($rights[0] == 0 && ($username != $author || $replyNum != 0)) {
            return CapubbsLegacyResultAdapter::report('5', '权限不足！');
        }

        $activity = $this->activityRepository->findThreadActivity($bid, $tid);
        if ($activity) {
            $this->activityRepository->deleteThreadActivityCascade($activity['activity_id'], $bid, $tid);
        }

        $this->trashRepository->insertThreadSnapshot($bid, $tid, $thread, $username, $time, $ip);
        $posts = $this->postRepository->findAllByThreadOrdered($bid, $tid);
        if ($posts !== false) {
            foreach ($posts as $post) {
                $this->trashRepository->insertPostSnapshot($bid, $tid, intval($post['pid']), $post, $username, $time, $ip);
            }
        }

        $this->postRepository->deleteByBidTid($bid, $tid);
        $this->threadRepository->deleteByBidTid($bid, $tid);

        return array(array('code' => '0'));
    }

    private function legacyDeleteSinglePost($rights, $username, $ip, $bid, $tid, $pid, $time, $token) {
        $number = $this->postRepository->findLastPidInThread($bid, $tid);
        $pid = intval($pid);
        if ($number === null || $pid <= 0 || $pid > $number) {
            return CapubbsLegacyResultAdapter::report('3', '帖子不存在！');
        }
        if ($number == 1) {
            return $this->legacyDelete($token, $bid, $tid, 0);
        }

        $post = $this->postRepository->findByBidTidPid($bid, $tid, $pid);
        if (!$post) {
            return CapubbsLegacyResultAdapter::report('3', '帖子不存在！');
        }

        $postAuthor = isset($post['author']) ? $post['author'] : '';
        if ($rights[0] == 0 && $username != $postAuthor) {
            return CapubbsLegacyResultAdapter::report('5', '权限不足！');
        }

        $this->trashRepository->insertPostSnapshot($bid, $tid, $pid, $post, $username, $time, $ip);

        $joinId = $this->activityRepository->findJoinIdByPostFid($post['fid']);
        if ($joinId !== null) {
            $this->activityRepository->deleteJoinCascade($joinId);
        }

        $this->postRepository->deleteByBidTidPid($bid, $tid, $pid);
        $this->postRepository->decrementPidAfter($bid, $tid, $pid);

        $newReply = $number - 2;
        if ($pid == 1) {
            $newFirstPost = $this->postRepository->findByBidTidPid($bid, $tid, 1);
            if ($newFirstPost) {
                $this->threadRepository->updateAfterDeletingFirstPost(
                    $bid,
                    $tid,
                    isset($newFirstPost['title']) ? $newFirstPost['title'] : '',
                    isset($newFirstPost['author']) ? $newFirstPost['author'] : '',
                    $newReply
                );
            }
            return array(array('code' => '0'));
        }

        if ($pid == $number) {
            $newPid = $pid - 1;
            $lastPost = $this->postRepository->findByBidTidPid($bid, $tid, $newPid);
            if ($lastPost) {
                if ($newPid != 1) {
                    $this->threadRepository->updateAfterDeletingLastPost(
                        $bid,
                        $tid,
                        $newReply,
                        isset($lastPost['author']) ? $lastPost['author'] : null,
                        isset($lastPost['updatetime']) ? $lastPost['updatetime'] : 0
                    );
                } else {
                    $this->threadRepository->updateAfterDeletingLastPost(
                        $bid,
                        $tid,
                        $newReply,
                        null,
                        isset($lastPost['updatetime']) ? $lastPost['updatetime'] : 0
                    );
                }
            }
            return array(array('code' => '0'));
        }

        $this->threadRepository->updateReplyCount($bid, $tid, $newReply);
        return array(array('code' => '0'));
    }

    private function isValidPostingBoard($bid) {
        $bid = intval($bid);
        if ($bid <= 0) {
            return false;
        }
        $board = $this->boardRepository->findByBid($bid);
        return $board !== null && $board !== false;
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

    private function buildUserInfoRow($user) {
        $userInfo = array();
        foreach ($user as $key => $value) {
            if (is_long($key)) continue;
            if ($key == 'password') continue;
            if ($key == 'token') continue;
            if ($key == 'tokentime') continue;
            if ($key == 'lastpost') continue;
            if ($key == 'nowboard') continue;
            $userInfo[$key] = $value;
        }
        return $userInfo;
    }

    private function buildAssocRow($row) {
        $info = array();
        foreach ($row as $key => $value) {
            if (is_long($key)) continue;
            $info[$key] = $value;
        }
        return $info;
    }
}
