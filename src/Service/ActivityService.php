<?php

class CapubbsActivityService {
    private $threadRepository;
    private $postRepository;
    private $userRepository;
    private $activityRepository;
    private $notificationService;
    private $punishmentRepository;
    private $con;

    public function __construct(
        $threadRepository,
        $postRepository,
        $userRepository,
        $activityRepository,
        $notificationService,
        $punishmentRepository,
        $con
    ) {
        $this->threadRepository = $threadRepository;
        $this->postRepository = $postRepository;
        $this->userRepository = $userRepository;
        $this->activityRepository = $activityRepository;
        $this->notificationService = $notificationService;
        $this->punishmentRepository = $punishmentRepository;
        $this->con = $con;
    }

    public function getThreadState($bid, $tid) {
        return $this->threadRepository->findByBidTid($bid, $tid);
    }

    public function getActivity($bid, $tid) {
        return $this->activityRepository->findThreadActivityDetail($bid, $tid);
    }

    public function hasJoined($username, $activityId) {
        return $this->activityRepository->findJoinByActivityAndUsername($activityId, $username) !== null;
    }

    public function isCanceled($username, $activityId) {
        $join = $this->activityRepository->findJoinByActivityAndUsername($activityId, $username);
        if (!$join) {
            return false;
        }
        return intval(isset($join['cancel']) ? $join['cancel'] : 0) === 1;
    }

    public function getActivityJoinRemind($activityId) {
        return $this->activityRepository->findJoinRemind($activityId);
    }

    public function createActivity($username, $bid, $title, $text, $options, $sig, $attachs) {
        $bid = intval($bid);
        $sig = intval($sig);
        $seasonId = -1;
        $time = time();
        $tid = $this->threadRepository->findMaxTidIncludingTrash($bid) + 1;
        $title = html_entity_decode($title);
        $text = html_entity_decode($text);
        if (mb_strlen($title, 'utf-8') >= 43) {
            $title = mb_substr($title, 0, 40, 'utf-8') . "...";
        }
        $postdate = date('Y-m-d');
        $type = 'web';
        $ip = '*';
        $activityId = 0;

        $this->runInTransaction(function() use ($bid, $tid, $title, $text, $attachs, $time, $sig, $ip, $type, $username, $seasonId, $options, $postdate, &$activityId) {
            if (!$this->threadRepository->insertThread($bid, $tid, $title, $username, $time, $postdate)) {
                throw new RuntimeException('insert thread failed');
            }

            $fid = $this->postRepository->insertPost($bid, $tid, 1, $title, $username, $text, 'YES', $attachs, $time, $time, $sig, $ip, $type, 0);
            if ($fid === false) {
                throw new RuntimeException('insert post failed: ' . $this->postRepository->lastError());
            }

            if (!$this->userRepository->incrementPostStats($username, $bid, $time)) {
                throw new RuntimeException('update user post stats failed');
            }
            if (!$this->userRepository->recalculateStar($username)) {
                throw new RuntimeException('update user star failed');
            }

            $activityId = $this->activityRepository->insertThreadActivity($bid, $tid, $seasonId, $title, $username);
            if (!$activityId) {
                throw new RuntimeException('insert activity failed');
            }

            foreach ($options as $option) {
                $typeId = intval(isset($option['type_id']) ? $option['type_id'] : 0);
                $optionName = isset($option['option_name']) ? $option['option_name'] : '';
                $required = intval(isset($option['required']) ? $option['required'] : 0);
                $comment = isset($option['comment']) ? $option['comment'] : '';
                $hidden = intval(isset($option['hiden']) ? $option['hiden'] : 0);

                $optionId = $this->activityRepository->insertOption($activityId, $typeId, $optionName, $required, $comment, $hidden);
                if (!$optionId) {
                    throw new RuntimeException('insert activity option failed');
                }

                if (($typeId === 1 || $typeId === 3) && isset($option['cases']) && is_array($option['cases'])) {
                    foreach ($option['cases'] as $case) {
                        $caseName = isset($case['case_name']) ? $case['case_name'] : '';
                        $caseComment = isset($case['comment']) ? $case['comment'] : '';
                        $needValue = intval(isset($case['need_value']) ? $case['need_value'] : 0);
                        if ($this->activityRepository->insertOptionCase($optionId, $caseName, $caseComment, $needValue) === false) {
                            throw new RuntimeException('insert activity option case failed');
                        }
                    }
                }
            }

            $this->notificationService->notifyMentionsAndQuotes($text, $bid, $tid, 1, $username, $title);
        });

        return array(
            'bid' => $bid,
            'tid' => $tid,
            'activity_id' => $activityId,
        );
    }

    public function getUsernameOptionValue($username, $activityId) {
        $activityId = intval($activityId);
        $ret = array();
        $join = $this->activityRepository->findJoinByActivityAndUsername($activityId, $username);
        if (!$join) {
            return $ret;
        }

        $joinId = intval(isset($join['join_id']) ? $join['join_id'] : 0);
        $postFid = intval(isset($join['post_fid']) ? $join['post_fid'] : 0);
        if ($joinId <= 0) {
            return $ret;
        }

        $ret = $this->activityRepository->findJoinOptionValues($joinId);
        if ($postFid > 0) {
            $post = $this->postRepository->findByFid($postFid);
            if ($post && isset($post['sig'])) {
                $ret['sign'] = $post['sig'];
            }
        }
        if (!isset($ret['sign'])) {
            $ret['sign'] = 0;
        }
        return $ret;
    }

    public function getActivityJoin($activityId) {
        $activityId = intval($activityId);
        $joins = $this->activityRepository->findJoinsByActivity($activityId, 'join_id');
        $joinIds = array();
        foreach ($joins as $join) {
            $joinIds[] = intval($join['join_id']);
        }
        $valuesByJoinId = $this->activityRepository->findJoinOptionValuesByJoinIds($joinIds);
        $punishedUsers = array_flip($this->punishmentRepository->findActivePunishmentUsernames());

        $rows = array();
        foreach ($joins as $join) {
            $joinId = intval($join['join_id']);
            $username = isset($join['username']) ? $join['username'] : '';
            $optionValues = isset($valuesByJoinId[$joinId]) ? $valuesByJoinId[$joinId] : array();
            $postFid = intval(isset($join['post_fid']) ? $join['post_fid'] : 0);
            if ($postFid > 0) {
                $post = $this->postRepository->findByFid($postFid);
                $optionValues['sign'] = ($post && isset($post['sig'])) ? $post['sig'] : 0;
            } else {
                $optionValues['sign'] = 0;
            }
            $rows[] = array(
                'username' => $username,
                'option_value' => $optionValues,
                'cancel' => isset($join['cancel']) ? $join['cancel'] : 0,
                'has_punishment' => isset($punishedUsers[$username]) ? 1 : 0,
            );
        }

        return $rows;
    }

    public function isLeader($username, $activity) {
        if (!is_array($activity)) {
            return false;
        }
        $leaderUsername = isset($activity['leader_username']) ? $activity['leader_username'] : '';
        return $username === $leaderUsername
            || $username === '网络组'
            || $username === '组织部'
            || $username === '文体部'
            || $username === '主席团'
            || $username === '理事会';
    }

    public function getFloorNumInActivity($username, $activityId) {
        $joins = $this->activityRepository->findJoinsByActivity($activityId, 'post_fid');
        $rank = 2;
        foreach ($joins as $join) {
            if (isset($join['username']) && $join['username'] === $username) {
                return $rank;
            }
            $rank++;
        }
        return -1;
    }

    public function getFloorNumInThread($username, $bid, $tid) {
        $posts = $this->postRepository->findAllByThreadOrdered($bid, $tid);
        $rank = 0;
        foreach ($posts as $post) {
            $rank++;
            if (isset($post['author']) && $post['author'] === $username) {
                return $rank;
            }
        }
        return -1;
    }

    public function joinActivityByContent($token, $bid, $tid, $username, $optionValues, $title, $sig, $type, $ip) {
        if (empty($bid) || empty($tid) || empty($username) || empty($optionValues)) {
            return array('code' => -1, 'msg' => 'param empty');
        }

        $activity = $this->getActivity($bid, $tid);
        if (!$activity) {
            return array('code' => -1, 'msg' => 'activity not found');
        }

        $session = $this->userRepository->findThreadReadSessionByToken($token);
        $sessionUsername = $session && isset($session['username']) ? $session['username'] : '';
        if ($sessionUsername !== $username) {
            return array('code' => -1, 'msg' => 'user error 13 ' . $sessionUsername . ' ' . $username);
        }

        if ($this->hasJoined($username, $activity['activity_id'])) {
            return array('code' => -1, 'msg' => '已报名或报名失败');
        }

        $requiredError = $this->validateRequiredOptions($activity, $optionValues);
        if ($requiredError !== null) {
            return $requiredError;
        }

        $thread = $this->threadRepository->findByBidTid($bid, $tid);
        if (!$thread) {
            return array('code' => -1, 'msg' => '主题不存在！');
        }
        if (intval(isset($thread['locked']) ? $thread['locked'] : 0) === 1) {
            return array('code' => -1, 'msg' => '主题已锁定。');
        }

        $time = time();
        $title = html_entity_decode($title);
        $pid = $this->postRepository->findLastPidInThread($bid, $tid);
        if ($pid === null) {
            return array('code' => -1, 'msg' => '主题不存在！');
        }
        $pid = intval($pid) + 1;
        $text = $this->buildJoinPostText($activity, $optionValues, false);
        $fid = 0;
        $joinId = 0;
        $threadAuthor = isset($thread['author']) ? $thread['author'] : '';
        $threadTitle = isset($thread['title']) ? $thread['title'] : '';
        $sig = intval($sig);

        try {
            $this->runInTransaction(function() use ($activity, $username, &$joinId, $time, $bid, $tid, $pid, $title, $text, $sig, $ip, $type, &$fid, $threadAuthor, $threadTitle, $optionValues) {
                $joinId = $this->activityRepository->insertJoin($activity['activity_id'], $username, -1);
                if (!$joinId) {
                    throw new RuntimeException('insert join failed');
                }

                $this->notificationService->notifyMentionsAndQuotes($text, $bid, $tid, $pid, $username, $title);

                $fid = $this->postRepository->insertPost($bid, $tid, $pid, $title, $username, $text, 'YES', '', $time, $time, $sig, $ip, $type, 0);
                if ($fid === false) {
                    throw new RuntimeException('insert activity post failed: ' . $this->postRepository->lastError());
                }

                if (!$this->threadRepository->incrementReply($bid, $tid, $username, $time)) {
                    throw new RuntimeException('increment thread reply failed');
                }
                if (!$this->userRepository->incrementReplyStats($username, $bid, $time)) {
                    throw new RuntimeException('increment user reply failed');
                }
                if (!$this->userRepository->recalculateStar($username)) {
                    throw new RuntimeException('recalculate user star failed');
                }

                if ($threadAuthor !== $username) {
                    $this->notificationService->notifyThreadReply($threadAuthor, $username, $bid, $tid, $pid, $threadTitle);
                }

                if (!$this->activityRepository->updateJoinPostFid($joinId, $fid)) {
                    throw new RuntimeException('update join post fid failed');
                }

                foreach ($activity['options'] as $option) {
                    $optionId = intval($option['option_id']);
                    if (!$this->hasProvidedOptionValue($optionValues, $optionId)) {
                        continue;
                    }
                    if ($this->activityRepository->insertJoinOptionValue($joinId, $optionId, $optionValues[$optionId]) === false) {
                        throw new RuntimeException('insert join option value failed');
                    }
                }
            });
        } catch (Exception $e) {
            return array('code' => -1, 'msg' => strpos($e->getMessage(), 'activity post failed: ') !== false ? '>error:' . $this->postRepository->lastError() : '已报名或报名失败');
        }

        return array('code' => 0, 'msg' => 'success');
    }

    public function modifyJoinActivityByContent($token, $bid, $tid, $username, $optionValues, $title, $sig, $type, $ip) {
        if (empty($bid) || empty($tid) || empty($username) || empty($optionValues)) {
            return array('code' => -1, 'msg' => 'param empty');
        }

        $activity = $this->getActivity($bid, $tid);
        if (!$activity) {
            return array('code' => -1, 'msg' => 'activity not found');
        }

        $join = $this->activityRepository->findJoinByActivityAndUsername($activity['activity_id'], $username);
        if (!$join) {
            return array('code' => -1, 'msg' => '未报名');
        }

        $requiredError = $this->validateRequiredOptions($activity, $optionValues);
        if ($requiredError !== null) {
            return $requiredError;
        }

        $session = $this->userRepository->findThreadReadSessionByToken($token);
        $sessionUsername = $session && isset($session['username']) ? $session['username'] : '';
        if ($sessionUsername !== $username) {
            return array('code' => -1, 'msg' => 'user error');
        }

        $thread = $this->threadRepository->findByBidTid($bid, $tid);
        if (!$thread) {
            return array('code' => -1, 'msg' => '主题不存在！');
        }
        if (intval(isset($thread['locked']) ? $thread['locked'] : 0) === 1) {
            return array('code' => -1, 'msg' => '主题已锁定。');
        }

        $postFid = intval(isset($join['post_fid']) ? $join['post_fid'] : 0);
        $post = $this->postRepository->findByFid($postFid);
        if (!$post) {
            return array('code' => -1, 'msg' => '主题不存在！');
        }

        $time = time();
        $title = html_entity_decode($title);
        $text = $this->buildJoinPostText($activity, $optionValues, false);
        $joinId = intval(isset($join['join_id']) ? $join['join_id'] : 0);
        $existingValues = $this->activityRepository->findJoinOptionValues($joinId);
        $attachs = isset($post['attachs']) ? $post['attachs'] : '';
        $pid = intval(isset($post['pid']) ? $post['pid'] : 0);

        try {
            $this->runInTransaction(function() use ($activity, $joinId, $optionValues, $existingValues, $bid, $tid, $pid, $username, $title, $text, $sig, $ip, $type, $attachs, $time) {
                foreach ($activity['options'] as $option) {
                    $optionId = intval($option['option_id']);
                    if (!$this->hasProvidedOptionValue($optionValues, $optionId)) {
                        continue;
                    }
                    if (array_key_exists($optionId, $existingValues)) {
                        if ($this->activityRepository->updateJoinOptionValue($joinId, $optionId, $optionValues[$optionId]) === false) {
                            throw new RuntimeException('update join option value failed');
                        }
                    } else {
                        if ($this->activityRepository->insertJoinOptionValue($joinId, $optionId, $optionValues[$optionId]) === false) {
                            throw new RuntimeException('insert join option value failed');
                        }
                    }
                }

                $this->notificationService->notifyMentionsAndQuotes($text, $bid, $tid, $pid, $username, $title);

                if (!$this->postRepository->updatePostContent($bid, $tid, $pid, $title, $username, $text, intval($sig), $ip, $type, $attachs, $time)) {
                    throw new RuntimeException('update activity post failed');
                }
            });
        } catch (Exception $e) {
            return array('code' => -1, 'msg' => 'error');
        }

        return array('code' => 0, 'msg' => 'success');
    }

    public function cancelJoinActivityByContent($token, $bid, $tid, $username, $title, $sig, $type, $ip, $cancel) {
        if (empty($bid) || empty($tid) || empty($username)) {
            return array('code' => -1, 'msg' => 'param empty');
        }

        $activity = $this->getActivity($bid, $tid);
        if (!$activity) {
            return array('code' => -1, 'msg' => 'activity not found');
        }

        $join = $this->activityRepository->findJoinByActivityAndUsername($activity['activity_id'], $username);
        if (!$join) {
            return array('code' => -1, 'msg' => '未报名');
        }

        $session = $this->userRepository->findThreadReadSessionByToken($token);
        $sessionUsername = $session && isset($session['username']) ? $session['username'] : '';
        if ($sessionUsername !== $username) {
            return array('code' => -1, 'msg' => 'user error');
        }

        $thread = $this->threadRepository->findByBidTid($bid, $tid);
        if (!$thread) {
            return array('code' => -1, 'msg' => '主题不存在！');
        }
        if (intval(isset($thread['locked']) ? $thread['locked'] : 0) === 1) {
            return array('code' => -1, 'msg' => '主题已锁定。');
        }

        $postFid = intval(isset($join['post_fid']) ? $join['post_fid'] : 0);
        $post = $this->postRepository->findByFid($postFid);
        if (!$post) {
            return array('code' => -1, 'msg' => '主题不存在！');
        }

        $optionValues = $this->getUsernameOptionValue($username, $activity['activity_id']);
        if (empty($optionValues)) {
            return array('code' => -1, 'msg' => 'param empty');
        }

        $time = time();
        $existingTitle = isset($post['title']) ? $post['title'] : html_entity_decode($title);
        $attachs = isset($post['attachs']) ? $post['attachs'] : '';
        $pid = intval(isset($post['pid']) ? $post['pid'] : 0);
        $text = $this->buildJoinPostText($activity, $optionValues, $cancel);
        $sig = intval($sig);

        try {
            $this->runInTransaction(function() use ($activity, $username, $cancel, $bid, $tid, $pid, $existingTitle, $text, $sig, $ip, $type, $attachs, $time) {
                if (!$this->activityRepository->updateJoinCancel($activity['activity_id'], $username, $cancel)) {
                    throw new RuntimeException('update join cancel failed');
                }

                $this->notificationService->notifyMentionsAndQuotes($text, $bid, $tid, $pid, $username, $existingTitle);

                if (!$this->postRepository->updatePostContent($bid, $tid, $pid, $existingTitle, $username, $text, $sig, $ip, $type, $attachs, $time)) {
                    throw new RuntimeException('update canceled post failed');
                }
            });
        } catch (Exception $e) {
            return array('code' => -1, 'msg' => 'error');
        }

        return array('code' => 0, 'msg' => 'success');
    }

    private function validateRequiredOptions($activity, $optionValues) {
        foreach ($activity['options'] as $option) {
            $optionId = intval($option['option_id']);
            $required = intval(isset($option['required']) ? $option['required'] : 0);
            if ($required !== 1) {
                continue;
            }
            $value = null;
            if (array_key_exists($optionId, $optionValues)) {
                $value = $optionValues[$optionId];
            }
            if ($value === null || $value === '') {
                return array('code' => -1, 'msg' => 'option(#' . $optionId . ') not found');
            }
        }
        return null;
    }

    private function hasProvidedOptionValue($optionValues, $optionId) {
        return array_key_exists($optionId, $optionValues) && $optionValues[$optionId] !== null;
    }

    private function buildJoinPostText($activity, $optionValues, $cancel) {
        $text = '';
        foreach ($activity['options'] as $option) {
            $optionId = intval($option['option_id']);
            $text .= '<div>';
            $text .= $option['option_name'] . '：';
            if (intval(isset($option['hiden']) ? $option['hiden'] : 0) === 1) {
                $text .= '已隐藏';
            } elseif ($this->hasProvidedOptionValue($optionValues, $optionId)) {
                $text .= $this->renderOptionValue($option, $optionValues[$optionId]);
            } else {
                $text .= '未知';
            }
            $text .= '</div>';
        }

        if ($cancel) {
            $text = '<strike>' . $text . '</strike>';
        }
        return $text;
    }

    private function renderOptionValue($option, $value) {
        $typeId = intval(isset($option['type_id']) ? $option['type_id'] : 0);
        if ($typeId === 1) {
            $needle = intval($value);
            if (isset($option['cases']) && is_array($option['cases'])) {
                foreach ($option['cases'] as $case) {
                    if (intval($case['case_id']) === $needle) {
                        return htmlspecialchars(isset($case['case_name']) ? $case['case_name'] : '');
                    }
                }
            }
            return '';
        }

        if ($typeId === 3) {
            $caseIds = explode(',', strval($value));
            $names = array();
            if (isset($option['cases']) && is_array($option['cases'])) {
                foreach ($caseIds as $caseId) {
                    $needle = intval($caseId);
                    foreach ($option['cases'] as $case) {
                        if (intval($case['case_id']) === $needle) {
                            $names[] = isset($case['case_name']) ? $case['case_name'] : '';
                            break;
                        }
                    }
                }
            }
            return htmlspecialchars(implode('、', $names));
        }

        if ($typeId === 6) {
            return htmlspecialchars($value);
        }

        return htmlspecialchars($value);
    }

    private function runInTransaction($callback) {
        // CAPUBBS 的核心发帖表（threads/posts/userinfo/messages）当前仍是 MyISAM，
        // 这里保留统一执行入口，但不对 mixed-engine 写入启用事务回滚，
        // 以避免只回滚 InnoDB 活动表而让主帖/回帖状态与报名状态分离。
        $callback();
    }
}
