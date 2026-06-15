<?php

class CapubbsSignService {
    private $signRepository;
    private $userRepository;

    public function __construct($signRepository, $userRepository) {
        $this->signRepository = $signRepository;
        $this->userRepository = $userRepository;
    }

    public function legacyGetNum() {
        $signNum = $this->signRepository->countToday();
        $onlineNum = $this->userRepository->countOnlineUsers(600);
        $maxOnline = $this->userRepository->ensureDailyOnlineMax($onlineNum, time());

        return array(array(
            'sign' => strval($signNum),
            'online' => strval($onlineNum),
            'maxnum' => strval($maxOnline['maxnum']),
            'time' => date("Y-m-d", intval($maxOnline['time'])),
        ));
    }

    public function legacyToday($params) {
        $date = isset($params['view']) ? $params['view'] : '';
        $time = strtotime($date . " 00:00:00");
        if ($time == false || $time == -1) {
            $time = time();
        }

        $rows = $this->signRepository->findByDay(
            intval(date("Y", $time)),
            intval(date("m", $time)),
            intval(date("d", $time))
        );

        $infos = array();
        foreach ($rows as $row) {
            $infos[] = array('username' => $row['username']);
        }
        return $infos;
    }

    public function legacyYear() {
        $year = intval(date("Y", time()));
        $rows = $this->signRepository->findByYear($year);

        $datas = array();
        foreach ($rows as $row) {
            $month = intval(isset($row['month']) ? $row['month'] : 0);
            $dateKey = intval(isset($row['year']) ? $row['year'] : $year) . "-" . str_pad(strval($month), 2, '0', STR_PAD_LEFT);
            $day = intval(isset($row['day']) ? $row['day'] : 0);
            if (!isset($datas[$dateKey])) {
                $datas[$dateKey] = array();
            }
            if (!isset($datas[$dateKey][$day])) {
                $datas[$dateKey][$day] = 0;
            }
            $datas[$dateKey][$day] = intval($datas[$dateKey][$day]) + 1;
        }

        $infos = array();
        foreach ($datas as $key => $value) {
            $yearValue = intval(substr($key, 0, 4));
            $monthValue = intval(substr($key, 5, 2));
            $dataItems = array();
            for ($i = 1; $i <= jiekoufunc_getdays($yearValue, $monthValue); $i++) {
                $dataItems[] = array(
                    'day' => $i,
                    'number' => isset($value[$i]) ? intval($value[$i]) : 0,
                );
            }
            $infos[] = array(
                'month' => $key,
                'data' => $dataItems,
            );
        }
        return $infos;
    }

    public function legacyUserRank() {
        $rows = $this->signRepository->findTopUsers(100);
        $infos = array();
        $i = 1;
        $j = 1;
        $last = 0;
        foreach ($rows as $row) {
            $sign = intval(isset($row['sign']) ? $row['sign'] : 0);
            if ($sign != $last) {
                $j = $i;
            }
            $infos[] = array(
                'number' => strval($j),
                'username' => isset($row['username']) ? $row['username'] : '',
                'times' => strval($sign),
            );
            $last = $sign;
            $i++;
        }
        return $infos;
    }

    public function legacyViewOnline() {
        $rows = $this->userRepository->findOnlineUsers(600);
        $infos = array();
        foreach ($rows as $row) {
            $info = array();
            foreach ($row as $key => $value) {
                $info[$key] = $value;
            }
            $infos[] = $info;
        }
        return $infos;
    }

    public function legacyAutoSign($username) {
        $this->signRepository->ensureSignedToday($username);
    }
}
