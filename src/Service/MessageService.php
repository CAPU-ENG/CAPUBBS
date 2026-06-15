<?php

class CapubbsMessageService {
    private $messageRepository;
    private $userRepository;
    private $permissionService;

    public function __construct($messageRepository, $userRepository, $permissionService) {
        $this->messageRepository = $messageRepository;
        $this->userRepository = $userRepository;
        $this->permissionService = $permissionService;
    }

    public function legacySend($token, $to, $text) {
        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return CapubbsLegacyResultAdapter::report('1', '尚未登录');
        }

        $sender = $user['username'];
        if (!$this->userRepository->existsByUsername($to)) {
            return CapubbsLegacyResultAdapter::report('3', '留言的对象不存在！');
        }

        if ($this->messageRepository->insert($sender, $to, $text, 0, 0, 0, '', '')) {
            return CapubbsLegacyResultAdapter::report('0', 'success');
        }

        return CapubbsLegacyResultAdapter::report('4', 'Database Error');
    }

    public function legacyBroadcast($token, $text) {
        $rights = $this->permissionService->getLegacyRightsTuple(1, $token);
        $rightsValue = intval(isset($rights[3]) ? $rights[3] : 0);
        if ($rightsValue != 4) {
            return array(array('code' => '1', 'msg' => '权限不足'));
        }

        $users = $this->messageRepository->findAllUsernames();
        foreach ($users as $username) {
            $tmpText = '尊敬的 ' . $username . ' 用户您好，' . $text;
            $this->messageRepository->insert('admin', $username, $tmpText, 0, 0, 0, '', '');
        }

        return array(array('code' => '0'));
    }

    public function legacyList($token, $type, $params) {
        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return array(array('code' => '1', 'msg' => '尚未登录'));
        }

        $username = $user['username'];
        $excludedSender = isset($params['to']) ? $params['to'] : '';
        $systemUnread = $this->messageRepository->countSystemUnread($username);
        $systemTotal = $this->messageRepository->countSystemTotal($username);
        $privateUnread = $this->messageRepository->countPrivateUnread($username, $excludedSender);

        $infos = array();
        $infos[] = array(
            'code' => '0',
            'sysmsg' => strval($systemUnread),
            'prvmsg' => strval($privateUnread),
            'systotal' => strval($systemTotal),
        );

        if ($type == 'system') {
            $p = isset($params['p']) ? intval($params['p']) : 0;
            if ($p < 1) $p = 1;
            $limit = 10;
            $start = $limit * ($p - 1);
            $rows = $this->messageRepository->findSystemMessages($username, $start, $limit);
            foreach ($rows as $row) {
                $infos[] = $this->buildLegacySystemRow($row);
            }
            $this->messageRepository->markSystemRead($username);
        } elseif ($type == 'private') {
            $infos = array_merge($infos, $this->buildLegacyPrivateRows($username, $params));
        } elseif ($type == 'chat') {
            $to = isset($params['to']) ? $params['to'] : '';
            $rows = $this->messageRepository->findConversationMessages($username, $to);
            foreach ($rows as $row) {
                $infos[] = array(
                    'type' => ($row['sender'] == $username ? 'send' : 'get'),
                    'text' => $row['text'],
                    'time' => strval($row['time']),
                );
            }
            $this->messageRepository->markConversationRead($username, $to);
        }

        $unreadTotal = $this->messageRepository->countUnreadTotal($username);
        $this->messageRepository->syncUnreadCount($username, $unreadTotal);

        return $infos;
    }

    private function buildLegacySystemRow($row) {
        $username = isset($row['ruser']) ? $row['ruser'] : '';
        $msgType = isset($row['text']) ? $row['text'] : '';
        $title = isset($row['rmsg']) ? $row['rmsg'] : '';
        if ($msgType != 'reply' && $msgType != 'at' && $msgType != 'replylzl' && $msgType != 'replylzlreply' && $msgType != 'quote') {
            $title = $msgType;
            $msgType = 'plain';
        }

        $rpid = intval(isset($row['rpid']) ? $row['rpid'] : 0);
        $page = ceil($rpid / 12);
        if ($page < 1) $page = 1;
        $url = '/bbs/content/?bid=' . intval(isset($row['rbid']) ? $row['rbid'] : 0)
             . '&tid=' . intval(isset($row['rtid']) ? $row['rtid'] : 0)
             . '&p=' . $page . '#' . $rpid;

        return array(
            'username' => $username,
            'type' => $msgType,
            'title' => $title,
            'url' => $url,
            'time' => strval(isset($row['time']) ? $row['time'] : ''),
            'hasread' => strval(isset($row['hasread']) ? $row['hasread'] : '0'),
        );
    }

    private function buildLegacyPrivateRows($username, $params) {
        $ans = array();
        $senders = array();

        $receivedRows = $this->messageRepository->findReceivedPrivateGroups($username);
        foreach ($receivedRows as $row) {
            $ans[] = array(
                'username' => isset($row['sender']) ? $row['sender'] : '',
                'times' => isset($row['times']) ? $row['times'] : '',
                'hasreads' => isset($row['hasreads']) ? $row['hasreads'] : '',
            );
            $senders[] = isset($row['sender']) ? $row['sender'] : '';
        }

        $sentRows = $this->messageRepository->findSentPrivateGroupsExcluding($username, $senders);
        foreach ($sentRows as $row) {
            $ans[] = array(
                'username' => isset($row['receiver']) ? $row['receiver'] : '',
                'times' => isset($row['times']) ? $row['times'] : '',
                'hasreads' => '',
            );
        }

        foreach ($ans as &$row) {
            $times = explode(',', strval(isset($row['times']) ? $row['times'] : ''));
            $row['latest_time'] = isset($times[0]) ? intval($times[0]) : 0;
        }
        unset($row);

        usort($ans, array($this, 'sortPrivateRowByLatestTimeDesc'));

        $rows = array();
        foreach ($ans as $row) {
            $peer = $row['username'];
            if ($peer === '') {
                continue;
            }

            $hasread = isset($row['hasreads']) ? $row['hasreads'] : '';
            $unreadCount = substr_count($hasread, '0');
            $latest = $this->messageRepository->findLatestConversationMessage($username, $peer);
            $text = $latest && isset($latest['text']) ? $latest['text'] : '';
            $msgTime = $latest && isset($latest['time']) ? $latest['time'] : 0;
            $shrink = isset($params['shrink']) ? $params['shrink'] : '';
            if ($shrink != 'no' && mb_strlen($text, 'utf-8') > 30) {
                $text = mb_substr($text, 0, 30, 'utf-8') . '......';
            }

            $rows[] = array(
                'username' => $peer,
                'text' => $text,
                'time' => strval($msgTime),
                'number' => strval($unreadCount),
                'totalnum' => strval($this->messageRepository->countConversationMessages($username, $peer)),
            );
        }

        return $rows;
    }

    private function sortPrivateRowByLatestTimeDesc($a, $b) {
        $aTime = intval(isset($a['latest_time']) ? $a['latest_time'] : 0);
        $bTime = intval(isset($b['latest_time']) ? $b['latest_time'] : 0);
        if ($aTime == $bTime) {
            return 0;
        }
        return ($aTime < $bTime) ? 1 : -1;
    }
}
