<?php

class CapubbsMaintenanceRepository {
    private $con;
    private $lastError = '';

    public function __construct($con) {
        $this->con = $con;
    }

    public function countPostsByFilters($filters) {
        $statement = "SELECT COUNT(*) AS cnt FROM posts" . $this->buildPostWhereClause($filters);
        $row = $this->fetchOne($statement);
        if (!$row) {
            return 0;
        }
        return intval($row['cnt']);
    }

    public function findDirtyPostRowsByByte($filters, $byteValue) {
        $byteValue = intval($byteValue);
        if ($byteValue < 0 || $byteValue > 255) {
            return array();
        }

        $char = chr($byteValue);
        $escaped = mysqli_real_escape_string($this->con, $char);
        $statement = "SELECT fid, bid, tid, pid, author, LEFT(text, 80) AS preview FROM posts" . $this->buildPostWhereClause($filters);
        $statement .= (count($this->normalizePostFilters($filters)) > 0 ? " AND" : " WHERE") . " text LIKE BINARY '%{$escaped}%'";
        return $this->fetchAll($statement);
    }

    public function lastError() {
        return $this->lastError;
    }

    private function buildPostWhereClause($filters) {
        $clauses = array();
        $normalized = $this->normalizePostFilters($filters);
        if (isset($normalized['fid'])) {
            $clauses[] = "fid = " . intval($normalized['fid']);
        }
        if (isset($normalized['bid'])) {
            $clauses[] = "bid = " . intval($normalized['bid']);
        }
        if (isset($normalized['tid'])) {
            $clauses[] = "tid = " . intval($normalized['tid']);
        }
        if (isset($normalized['pid'])) {
            $clauses[] = "pid = " . intval($normalized['pid']);
        }
        if (count($clauses) === 0) {
            return '';
        }
        return " WHERE " . implode(' AND ', $clauses);
    }

    private function normalizePostFilters($filters) {
        $normalized = array();
        foreach (array('fid', 'bid', 'tid', 'pid') as $key) {
            if (!isset($filters[$key])) {
                continue;
            }
            $value = intval($filters[$key]);
            if ($value > 0) {
                $normalized[$key] = $value;
            }
        }
        return $normalized;
    }

    private function fetchOne($statement) {
        $this->lastError = '';
        $result = mysqli_query($this->con, $statement);
        if (!$result) {
            $this->lastError = mysqli_error($this->con);
            return false;
        }
        $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
        mysqli_free_result($result);
        return $row ? $row : null;
    }

    private function fetchAll($statement) {
        $this->lastError = '';
        $result = mysqli_query($this->con, $statement);
        if (!$result) {
            $this->lastError = mysqli_error($this->con);
            return false;
        }

        $rows = array();
        while (($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) !== null) {
            $rows[] = $row;
        }
        mysqli_free_result($result);
        return $rows;
    }
}
