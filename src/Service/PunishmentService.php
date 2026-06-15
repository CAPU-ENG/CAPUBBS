<?php

class CapubbsPunishmentService {
    private $punishmentRepository;

    public function __construct($punishmentRepository) {
        $this->punishmentRepository = $punishmentRepository;
    }

    public function canManage($username) {
        return $username === '组织部';
    }

    public function legacyList($params) {
        $year = isset($params['year']) ? $params['year'] : null;
        $history = intval(isset($params['history']) ? $params['history'] : 0);

        if ($year === null || $year === '') {
            $rows = $this->punishmentRepository->findVisibleAll();
            return array(
                'result' => $rows,
                'debug' => "select id, username, name, reason, distance, addition, start_date, end_date, is_end\n        from punishment where is_deleted=0 order by start_date, id",
            );
        }

        $endYear = intval($year);
        $startYear = $endYear - 1;
        $lastYear = $startYear - 1;
        $yearStartDate = sprintf('%d-09-01', $startYear);
        $yearEndDate = sprintf('%d-08-31', $endYear);
        $lastYearStartDate = sprintf('%d-09-01', $lastYear);
        $lastYearEndDate = sprintf('%d-08-31', $startYear);

        if ($history === 0) {
            $rows = $this->punishmentRepository->findVisibleByStartDateRange($yearStartDate, $yearEndDate);
            return array(
                'result' => $rows,
                'debug' => "select id, username, name, reason, distance, addition, start_date, end_date, is_end\n            from punishment \n            where \n                is_deleted = 0\n                and start_date >= '$yearStartDate' and start_date <= '$yearEndDate'\n            order by start_date, id",
            );
        }

        $rows = $this->punishmentRepository->findHistoryCarryOver($lastYearStartDate, $lastYearEndDate, $yearStartDate);
        return array(
            'result' => $rows,
            'debug' => "select id, username, name, reason, distance, addition, start_date, end_date, is_end from punishment \n        where\n            is_deleted = 0\n            and (start_date >= '$lastYearStartDate' and start_date <= '$lastYearEndDate')\n            and (\n                is_end = 0 \n                or (\n                    is_end = 1\n                    and end_date >= '$yearStartDate'\n                )\n            )\n        order by start_date, id\n        ",
        );
    }

    public function legacyAdd($operatorUsername, $params, $requestData) {
        if (!$this->canManage($operatorUsername)) {
            return null;
        }

        $action = isset($params['action']) ? $params['action'] : '';
        if ($action !== 'add') {
            return array(
                'result' => array(),
                'debug' => 'noop',
                '_POST' => isset($requestData['_POST']) ? $requestData['_POST'] : array(),
                '_GET' => isset($requestData['_GET']) ? $requestData['_GET'] : array(),
            );
        }

        $username = isset($params['username']) ? $params['username'] : '';
        $name = isset($params['name']) ? $params['name'] : '';
        $reason = isset($params['reason']) ? $params['reason'] : '';
        $distance = isset($params['distance']) ? $params['distance'] : '';
        $addition = isset($params['addition']) ? $params['addition'] : '';
        $startDate = isset($params['start_date']) ? $params['start_date'] : '';
        $debug = "insert into punishment (username, name, reason, distance, addition, start_date) \n        values ('$username', '$name', '$reason', '$distance', '$addition', '$startDate')";

        $ok = $this->punishmentRepository->insertPunishment($username, $name, $reason, $distance, $addition, $startDate);
        return array(
            'result' => $ok ? array() : array(),
            'debug' => $debug,
            '_POST' => isset($requestData['_POST']) ? $requestData['_POST'] : array(),
            '_GET' => isset($requestData['_GET']) ? $requestData['_GET'] : array(),
        );
    }

    public function legacyUpdate($operatorUsername, $params, $requestData) {
        if (!$this->canManage($operatorUsername)) {
            return null;
        }

        $punishmentId = isset($params['punishment_id']) ? intval($params['punishment_id']) : 0;
        $action = isset($params['action']) ? $params['action'] : '';
        $debug = '';
        $ok = false;

        if ($punishmentId <= 0) {
            $debug = 'punishment_id is null';
        } elseif ($action === 'finish') {
            $endDate = isset($params['end_date']) ? $params['end_date'] : '';
            $debug = "update punishment set is_end=1, end_date='$endDate' where id=$punishmentId";
            $ok = $this->punishmentRepository->markFinished($punishmentId, $endDate);
        } elseif ($action === 'cancel_finish') {
            $debug = "update punishment set is_end=0 where id=$punishmentId";
            $ok = $this->punishmentRepository->cancelFinish($punishmentId);
        } elseif ($action === 'delete') {
            $debug = "update punishment set is_deleted=1 where id=$punishmentId";
            $ok = $this->punishmentRepository->softDelete($punishmentId);
        } else {
            $debug = '';
        }

        return array(
            'result' => array(),
            'debug' => $debug,
            '_POST' => isset($requestData['_POST']) ? $requestData['_POST'] : array(),
            '_GET' => isset($requestData['_GET']) ? $requestData['_GET'] : array(),
        );
    }
}
