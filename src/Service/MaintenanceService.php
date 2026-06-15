<?php

class CapubbsMaintenanceService {
    const INVALID_XML_CODEPOINTS = array(
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
        0x0B, 0x0C,
        0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
        0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F,
    );

    private $maintenanceRepository;

    public function __construct($maintenanceRepository) {
        $this->maintenanceRepository = $maintenanceRepository;
    }

    public function analyzeDirtyPosts($filters) {
        $rowCount = $this->maintenanceRepository->countPostsByFilters($filters);
        $resultsAll = array();
        $errors = array();

        foreach (self::INVALID_XML_CODEPOINTS as $codepoint) {
            $rows = $this->maintenanceRepository->findDirtyPostRowsByByte($filters, $codepoint);
            if ($rows === false) {
                $errors[] = array(
                    'codepoint' => $codepoint,
                    'error' => $this->maintenanceRepository->lastError(),
                );
                continue;
            }

            foreach ($rows as $row) {
                $fid = intval($row['fid']);
                if (!isset($resultsAll[$fid])) {
                    $resultsAll[$fid] = array(
                        'row' => $row,
                        'chars' => array(),
                    );
                }
                $resultsAll[$fid]['chars'][] = $codepoint;
            }
        }

        foreach ($resultsAll as $fid => $info) {
            $resultsAll[$fid]['chars'] = array_values(array_unique($info['chars']));
        }

        return array(
            'rowCount' => $rowCount,
            'matches' => $resultsAll,
            'errors' => $errors,
        );
    }

    public function analyzeCounterConsistency() {
        $report = array(
            'sections' => array(),
            'totalIssues' => 0,
        );

        $simpleSections = array(
            'userinfo_post' => array(
                'title' => 'userinfo.post vs 实际发帖数 (threads 中 bid!=4 的主题)',
                'rows' => $this->maintenanceRepository->findUserPostCounterMismatches(),
            ),
            'userinfo_reply' => array(
                'title' => 'userinfo.reply vs 实际回帖数 (posts 中 pid!=1 且 bid!=4)',
                'rows' => $this->maintenanceRepository->findUserReplyCounterMismatches(),
            ),
            'userinfo_water' => array(
                'title' => 'userinfo.water vs 实际水区(bid=4)发帖+回帖总数',
                'rows' => $this->maintenanceRepository->findUserWaterCounterMismatches(),
            ),
            'userinfo_extr' => array(
                'title' => 'userinfo.extr vs 实际精华帖数 (threads 中 extr=1)',
                'rows' => $this->maintenanceRepository->findUserExtrCounterMismatches(),
            ),
            'userinfo_sign' => array(
                'title' => 'userinfo.sign vs 实际签到记录 (sign 表)',
                'rows' => $this->maintenanceRepository->findUserSignCounterMismatches(),
            ),
            'userinfo_newmsg' => array(
                'title' => 'userinfo.newmsg vs 实际未读消息数 (messages 中 hasread=0)',
                'rows' => $this->maintenanceRepository->findUserNewMessageCounterMismatches(),
            ),
        );

        foreach ($simpleSections as $id => $section) {
            $rows = $section['rows'];
            if ($rows === false) {
                $rows = array();
            }
            $count = count($rows);
            $report['sections'][$id] = array(
                'title' => $section['title'],
                'rows' => $rows,
                'count' => $count,
            );
            $report['totalIssues'] += $count;
        }

        $threadReplyRows = $this->maintenanceRepository->findThreadReplyCounterMismatches(100);
        $threadReplyCount = $this->maintenanceRepository->countThreadReplyCounterMismatches();
        $report['sections']['thread_reply'] = array(
            'title' => 'threads.reply vs 实际回帖数 (posts 数 - 1)',
            'rows' => $threadReplyRows === false ? array() : $threadReplyRows,
            'count' => $threadReplyCount,
            'displayLimit' => 100,
        );
        $report['totalIssues'] += $threadReplyCount;

        $replyerRows = $this->maintenanceRepository->findThreadReplyerMismatches(50);
        $replyerCount = $this->maintenanceRepository->countThreadReplyerMismatches();
        $report['sections']['thread_replyer'] = array(
            'title' => 'threads.replyer 是否与实际最后一帖作者一致',
            'rows' => $replyerRows === false ? array() : $replyerRows,
            'count' => $replyerCount,
            'displayLimit' => 50,
        );
        $report['totalIssues'] += $replyerCount;

        $starRows = $this->analyzeUserStarMismatches();
        $report['sections']['userinfo_star'] = array(
            'title' => 'userinfo.star 等级计算是否正确',
            'rows' => $starRows,
            'count' => count($starRows),
        );
        $report['totalIssues'] += count($starRows);

        $pidRows = $this->maintenanceRepository->findThreadPidContinuityMismatches(50);
        $pidCount = $this->maintenanceRepository->countThreadPidContinuityMismatches();
        $report['sections']['thread_pid_continuity'] = array(
            'title' => 'posts 表中每个主题的 pid 是否连续从 1 开始且无重复',
            'rows' => $pidRows === false ? array() : $pidRows,
            'count' => $pidCount,
            'displayLimit' => 50,
        );
        $report['totalIssues'] += $pidCount;

        $timestampRows = $this->maintenanceRepository->findThreadTimestampMismatches(30);
        $timestampCount = $this->maintenanceRepository->countThreadTimestampMismatches();
        $report['sections']['thread_timestamp'] = array(
            'title' => 'threads.timestamp 是否与最后一帖 replytime 一致',
            'rows' => $timestampRows === false ? array() : $timestampRows,
            'count' => $timestampCount,
            'displayLimit' => 30,
        );
        $report['totalIssues'] += $timestampCount;

        return $report;
    }

    public function calculateExpectedStar($post, $reply, $other2) {
        $post = intval($post);
        $reply = intval($reply);
        $other2 = intval($other2);
        if ($other2 >= 1 && $other2 <= 9) {
            return $other2;
        }

        $total = $post + $reply;
        if ($total < 20) return 1;
        if ($total < 109) return 2;
        if ($total < 317) return 3;
        if ($total < 675) return 4;
        if ($total < 1278) return 5;
        if ($total < 2303) return 6;
        if ($total < 3550) return 7;
        if ($total < 4885) return 8;
        return 9;
    }

    public function repairCounters($scope) {
        $username = isset($scope['username']) ? trim(strval($scope['username'])) : '';
        $bid = isset($scope['bid']) ? intval($scope['bid']) : 0;
        $tid = isset($scope['tid']) ? intval($scope['tid']) : 0;

        $stats = array();
        $stats['userinfo_post'] = $this->normalizeAffected($this->maintenanceRepository->repairUserPostCounts($username));
        $stats['userinfo_reply'] = $this->normalizeAffected($this->maintenanceRepository->repairUserReplyCounts($username));
        $stats['userinfo_water'] = $this->normalizeAffected($this->maintenanceRepository->repairUserWaterCounts($username));
        $stats['userinfo_extr'] = $this->normalizeAffected($this->maintenanceRepository->repairUserExtrCounts($username));
        $stats['userinfo_sign'] = $this->normalizeAffected($this->maintenanceRepository->repairUserSignCounts($username));
        $stats['userinfo_newmsg'] = $this->normalizeAffected($this->maintenanceRepository->repairUserNewMessageCounts($username));
        $stats['userinfo_star'] = $this->normalizeAffected($this->maintenanceRepository->repairUserStar($username));
        $stats['thread_reply'] = $this->normalizeAffected($this->maintenanceRepository->repairThreadReplyCounts($bid, $tid));
        $stats['thread_replyer'] = $this->normalizeAffected($this->maintenanceRepository->repairThreadReplyer($bid, $tid));
        $stats['thread_timestamp'] = $this->normalizeAffected($this->maintenanceRepository->repairThreadTimestamp($bid, $tid));

        return array(
            'updated' => $stats,
            'summary' => array(
                'users' => $this->maintenanceRepository->countUsersTotal(),
                'threads' => $this->maintenanceRepository->countThreadsTotal(),
                'posts' => $this->maintenanceRepository->countPostsTotal(),
                'users_with_post' => $this->maintenanceRepository->countUsersWithPositiveField('post'),
                'users_with_reply' => $this->maintenanceRepository->countUsersWithPositiveField('reply'),
                'users_with_sign' => $this->maintenanceRepository->countUsersWithPositiveField('sign'),
            ),
        );
    }

    private function analyzeUserStarMismatches() {
        $rows = $this->maintenanceRepository->findAllUserStarRows();
        if ($rows === false) {
            return array();
        }

        $issues = array();
        foreach ($rows as $row) {
            $expected = $this->calculateExpectedStar(
                isset($row['post']) ? $row['post'] : 0,
                isset($row['reply']) ? $row['reply'] : 0,
                isset($row['other2']) ? $row['other2'] : 0
            );
            $stored = intval(isset($row['star']) ? $row['star'] : 0);
            if ($stored === $expected) {
                continue;
            }
            $row['expected_star'] = $expected;
            $issues[] = $row;
        }
        return $issues;
    }

    private function normalizeAffected($value) {
        if ($value === false || $value === null) {
            return 0;
        }
        return intval($value);
    }
}
