<?php

class CapubbsTrashService {
    private $trashRepository;
    private $threadRepository;
    private $postRepository;
    private $boardRepository;
    private $userRepository;
    private $permissionService;

    public function __construct(
        $trashRepository,
        $threadRepository,
        $postRepository,
        $boardRepository,
        $userRepository,
        $permissionService
    ) {
        $this->trashRepository = $trashRepository;
        $this->threadRepository = $threadRepository;
        $this->postRepository = $postRepository;
        $this->boardRepository = $boardRepository;
        $this->userRepository = $userRepository;
        $this->permissionService = $permissionService;
    }

    public function legacyList($token, $bid, $page, $limit, $type) {
        $session = $this->userRepository->findUsernameAndRightsByToken($token);
        if (!$session) {
            return CapubbsLegacyResultAdapter::report('1', '尚未登录。');
        }

        $allowedBids = null;
        $rights = intval(isset($session['rights']) ? $session['rights'] : 0);
        if ($rights < 2) {
            $allowedBids = $this->boardRepository->findModeratorBids($session['username']);
        }

        $rows = $this->trashRepository->findItems($bid, $allowedBids, $page, $limit, $type);
        if (count($rows) === 0) {
            return array(array('code' => '0', 'msg' => '回收站为空', 'items' => '0'));
        }

        $items = array();
        foreach ($rows as $row) {
            $item = array();
            foreach ($row as $key => $value) {
                $item[$key] = is_null($value) ? '' : strval($value);
            }
            $items[] = $item;
        }
        return $items;
    }

    public function legacyRestore($token, $type, $bid, $tid, $pid, $trashId) {
        $rights = $this->permissionService->getLegacyRightsTuple($bid, $token);
        if ($rights[0] <= 0) {
            return CapubbsLegacyResultAdapter::report('5', '权限不足！仅版主或管理员可恢复帖子。');
        }

        if ($type === 'thread') {
            return $this->legacyRestoreThread($bid, $tid, $trashId);
        }
        if ($type === 'post') {
            return $this->legacyRestorePost($bid, $tid, $pid, $trashId);
        }

        return CapubbsLegacyResultAdapter::report('14', 'type 参数无效，请使用 post 或 thread。');
    }

    public function legacyDelete($token, $type, $bid, $tid, $pid, $trashId) {
        $rights = $this->permissionService->getLegacyRightsTuple($bid, $token);
        if ($rights[0] < 2) {
            return CapubbsLegacyResultAdapter::report('5', '权限不足！仅管理员可永久删除。');
        }

        if ($type === 'thread') {
            $this->trashRepository->deletePostSnapshotsByThread($bid, $tid);
            $this->trashRepository->deleteThreadSnapshotById($trashId);
            return CapubbsLegacyResultAdapter::report('0', '');
        }

        if ($type === 'post') {
            $this->trashRepository->deletePostSnapshotById($trashId);
            return CapubbsLegacyResultAdapter::report('0', '');
        }

        return CapubbsLegacyResultAdapter::report('14', 'type 参数无效。');
    }

    public function legacyClean($token, $days) {
        $rights = $this->permissionService->getLegacyRightsTuple(0, $token);
        if ($rights[0] < 2) {
            return CapubbsLegacyResultAdapter::report('5', '权限不足！仅管理员可执行批量清理。');
        }

        $days = max(1, intval($days ? $days : 90));
        $cutoff = time() - $days * 86400;

        $deletedPosts = $this->trashRepository->deletePostSnapshotsOlderThan($cutoff);
        $deletedThreads = $this->trashRepository->deleteThreadSnapshotsOlderThan($cutoff);

        return array(array(
            'code' => '0',
            'msg' => 'ok',
            'deleted_posts' => strval($deletedPosts + $deletedThreads),
        ));
    }

    private function legacyRestoreThread($bid, $tid, $trashId) {
        $thread = $this->trashRepository->findThreadSnapshot($trashId, $bid, $tid);
        if (!$thread) {
            return CapubbsLegacyResultAdapter::report('3', '回收站中未找到该主题。');
        }

        if ($this->threadRepository->findByBidTid($bid, $tid)) {
            return CapubbsLegacyResultAdapter::report('4', '目标版块已存在相同 tid 的主题。');
        }

        $this->threadRepository->insertRestoredThread($thread);
        $posts = $this->trashRepository->findPostSnapshotsByThread($bid, $tid);
        $restoredCount = 0;
        foreach ($posts as $post) {
            $this->postRepository->insertRestoredPost($post, intval($post['pid']));
            if ($this->postRepository->lastAffectedRows() > 0) {
                $restoredCount++;
            }
        }

        $this->trashRepository->deletePostSnapshotsByThread($bid, $tid);
        $this->trashRepository->deleteThreadSnapshotById($trashId);

        return array(array(
            'code' => '0',
            'msg' => 'ok',
            'restored' => strval($restoredCount),
        ));
    }

    private function legacyRestorePost($bid, $tid, $pid, $trashId) {
        $post = $this->trashRepository->findPostSnapshot($trashId, $bid, $tid, $pid);
        if (!$post) {
            return CapubbsLegacyResultAdapter::report('3', '回收站中未找到该帖子。');
        }

        $thread = $this->threadRepository->findByBidTid($bid, $tid);
        if (!$thread) {
            return CapubbsLegacyResultAdapter::report('4', '父主题不存在，无法恢复回帖。请先恢复主题。');
        }

        $currentReply = intval(isset($thread['reply']) ? $thread['reply'] : 0);
        $myReplyTime = intval(isset($post['replytime']) ? $post['replytime'] : 0);
        $maxPid = $this->postRepository->findLastPidInThread($bid, $tid);
        if ($maxPid === null) {
            $maxPid = 0;
        }

        $restorePid = 1;
        if ($maxPid > 0) {
            $positions = $this->postRepository->findAllByThreadOrdered($bid, $tid);
            foreach ($positions as $position) {
                if ($myReplyTime < intval($position['replytime'])) {
                    break;
                }
                $restorePid = intval($position['pid']) + 1;
            }
        }

        if ($restorePid > $maxPid + 1) {
            $restorePid = $maxPid + 1;
        }
        if ($restorePid <= 0) {
            $restorePid = 1;
        }

        if ($restorePid <= $maxPid) {
            $this->postRepository->incrementPidFrom($bid, $tid, $restorePid);
        }

        $this->postRepository->insertRestoredPost($post, $restorePid);

        $newReply = $currentReply + 1;
        if ($restorePid == 1) {
            $this->threadRepository->updateAfterDeletingFirstPost(
                $bid,
                $tid,
                isset($post['title']) ? $post['title'] : '',
                isset($post['author']) ? $post['author'] : '',
                $newReply
            );
        } else {
            $this->threadRepository->updateReplyCount($bid, $tid, $newReply);
        }

        $this->trashRepository->deletePostSnapshotById($trashId);

        return array(array(
            'code' => '0',
            'msg' => 'ok',
            'restored' => '1',
            'new_pid' => strval($restorePid),
        ));
    }
}
