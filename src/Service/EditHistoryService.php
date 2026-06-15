<?php

class CapubbsEditHistoryService {
    private $editHistoryRepository;
    private $postRepository;
    private $threadRepository;
    private $permissionService;

    public function __construct($editHistoryRepository, $postRepository, $threadRepository, $permissionService) {
        $this->editHistoryRepository = $editHistoryRepository;
        $this->postRepository = $postRepository;
        $this->threadRepository = $threadRepository;
        $this->permissionService = $permissionService;
    }

    public function legacyHistory($token, $fid, $versionId) {
        $rights = $this->permissionService->getLegacyRightsTuple(0, $token);
        if ($rights[0] == -1) {
            return CapubbsLegacyResultAdapter::report('1', '超时，请重新登录。');
        }
        $username = $rights[1];

        $maxOwnId = $this->editHistoryRepository->findMaxOwnVersionId($fid, $username);
        $currentPost = $this->postRepository->findByFid($fid);
        $isCurrentAuthor = $currentPost && isset($currentPost['author']) && $currentPost['author'] == $username;

        if ($maxOwnId == 0 && !$isCurrentAuthor) {
            return CapubbsLegacyResultAdapter::report('5', '权限不足！');
        }
        if ($maxOwnId == 0 && $isCurrentAuthor) {
            return array(array('code' => '0', 'msg' => '无编辑历史', 'count' => '0'));
        }

        if ($isCurrentAuthor) {
            $visibleCondition = $this->editHistoryRepository->buildVisibleConditionForAuthor($username);
        } else {
            $nextId = $this->editHistoryRepository->findNextOtherEditorVersionId($fid, $username, $maxOwnId);
            $visibleCondition = $this->editHistoryRepository->buildVisibleConditionForAuthorWithTakeover($username, $nextId);
        }

        if (intval($versionId) > 0) {
            $row = $this->editHistoryRepository->findByVersionIdAndVisibility($fid, $versionId, $visibleCondition);
            if (!$row) {
                return CapubbsLegacyResultAdapter::report('3', '版本不存在。');
            }

            return array(array(
                'code' => '0',
                'version_id' => strval($versionId),
                'text' => isset($row['text']) ? $row['text'] : '',
                'edit_time' => strval(isset($row['edit_time']) ? $row['edit_time'] : ''),
                'edit_by' => isset($row['edit_by']) ? $row['edit_by'] : '',
                'parent_id' => strval(isset($row['parent_id']) && $row['parent_id'] !== null ? $row['parent_id'] : '0'),
                'source' => isset($row['source']) ? $row['source'] : '',
                'author' => isset($row['author']) ? $row['author'] : '',
                'fid' => strval(isset($row['fid']) ? $row['fid'] : 0),
                'bid' => strval(isset($row['bid']) ? $row['bid'] : 0),
                'tid' => strval(isset($row['tid']) ? $row['tid'] : 0),
                'pid' => strval(isset($row['pid']) ? $row['pid'] : 0),
            ));
        }

        $rows = $this->editHistoryRepository->findListByVisibility($fid, $visibleCondition);
        if (count($rows) == 0) {
            return array(array('code' => '0', 'msg' => '无编辑历史', 'count' => '0'));
        }

        $out = array();
        $out[] = array('code' => '0', 'count' => strval(count($rows)));
        foreach ($rows as $row) {
            $item = array();
            foreach ($row as $key => $value) {
                $item[$key] = is_null($value) ? '' : strval($value);
            }
            $out[] = $item;
        }
        return $out;
    }

    public function legacyRestore($token, $fid, $versionId) {
        $rights = $this->permissionService->getLegacyRightsTuple(0, $token);
        if ($rights[0] == -1) {
            return CapubbsLegacyResultAdapter::report('1', '超时，请重新登录。');
        }
        $username = $rights[1];
        $ip = $rights[2];
        $time = time();

        $history = $this->editHistoryRepository->findByVersionId($fid, $versionId);
        if (!$history) {
            return CapubbsLegacyResultAdapter::report('3', '版本不存在。');
        }

        $currentPost = $this->postRepository->findByFid($fid);
        if (!$currentPost) {
            return CapubbsLegacyResultAdapter::report('4', '目标帖子当前不存在（可能已被删除）。请先从回收站恢复。');
        }

        $currentAuthor = isset($currentPost['author']) ? $currentPost['author'] : '';
        if ($username != $currentAuthor) {
            return CapubbsLegacyResultAdapter::report('5', '权限不足！仅帖子作者可恢复。');
        }

        $restoredAuthor = isset($history['author']) && $history['author'] !== '' ? $history['author'] : $currentAuthor;
        $headId = $this->editHistoryRepository->findLatestVersionIdByFid($fid);

        $this->editHistoryRepository->insertVersion(
            $fid,
            intval(isset($currentPost['bid']) ? $currentPost['bid'] : 0),
            intval(isset($currentPost['tid']) ? $currentPost['tid'] : 0),
            intval(isset($currentPost['pid']) ? $currentPost['pid'] : 0),
            $headId,
            isset($currentPost['text']) ? $currentPost['text'] : '',
            $currentAuthor,
            'snapshot',
            $time,
            $username,
            $ip
        );

        $this->editHistoryRepository->insertVersion(
            $fid,
            intval(isset($currentPost['bid']) ? $currentPost['bid'] : 0),
            intval(isset($currentPost['tid']) ? $currentPost['tid'] : 0),
            intval(isset($currentPost['pid']) ? $currentPost['pid'] : 0),
            intval($versionId),
            isset($history['text']) ? $history['text'] : '',
            $restoredAuthor,
            'restore',
            $time,
            $username,
            $ip
        );

        $this->postRepository->updatePostTextAndAuthorByFid(
            $fid,
            isset($history['text']) ? $history['text'] : '',
            $restoredAuthor,
            $time
        );

        $currentPid = intval(isset($currentPost['pid']) ? $currentPost['pid'] : 0);
        if ($currentPid == 1) {
            $this->threadRepository->updateAuthor(
                intval(isset($currentPost['bid']) ? $currentPost['bid'] : 0),
                intval(isset($currentPost['tid']) ? $currentPost['tid'] : 0),
                $restoredAuthor
            );
        }

        return array(array(
            'code' => '0',
            'msg' => 'ok',
            'restored_from_version' => strval($versionId),
            'restored_author' => $restoredAuthor,
        ));
    }
}
