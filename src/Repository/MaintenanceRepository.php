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

    public function findUserPostCounterMismatches() {
        return $this->fetchAll("SELECT u.username, u.post AS stored_count,
               COALESCE(t.actual, 0) AS actual_count,
               CAST(u.post AS SIGNED) - COALESCE(t.actual, 0) AS diff
        FROM userinfo u
        LEFT JOIN (
            SELECT author, COUNT(*) AS actual
            FROM threads
            WHERE bid != 4
            GROUP BY author
        ) t ON u.username COLLATE utf8mb4_general_ci = t.author COLLATE utf8mb4_general_ci
        HAVING diff != 0
        ORDER BY ABS(diff) DESC");
    }

    public function findUserReplyCounterMismatches() {
        return $this->fetchAll("SELECT u.username, u.reply AS stored_count,
               COALESCE(p.actual, 0) AS actual_count,
               CAST(u.reply AS SIGNED) - COALESCE(p.actual, 0) AS diff
        FROM userinfo u
        LEFT JOIN (
            SELECT author, COUNT(*) AS actual
            FROM posts
            WHERE pid != 1 AND bid != 4
            GROUP BY author
        ) p ON u.username COLLATE utf8mb4_general_ci = p.author COLLATE utf8mb4_general_ci
        HAVING diff != 0
        ORDER BY ABS(diff) DESC");
    }

    public function findUserWaterCounterMismatches() {
        return $this->fetchAll("SELECT u.username, u.water AS stored_count,
               COALESCE(w.actual, 0) AS actual_count,
               CAST(u.water AS SIGNED) - COALESCE(w.actual, 0) AS diff
        FROM userinfo u
        LEFT JOIN (
            SELECT author, SUM(cnt) AS actual
            FROM (
                SELECT author, COUNT(*) AS cnt FROM threads WHERE bid = 4 GROUP BY author
                UNION ALL
                SELECT author, COUNT(*) AS cnt FROM posts WHERE bid = 4 AND pid != 1 GROUP BY author
            ) combined
            GROUP BY author
        ) w ON u.username COLLATE utf8mb4_general_ci = w.author COLLATE utf8mb4_general_ci
        HAVING diff != 0
        ORDER BY ABS(diff) DESC");
    }

    public function findUserExtrCounterMismatches() {
        return $this->fetchAll("SELECT u.username, u.extr AS stored_count,
               COALESCE(t.actual, 0) AS actual_count,
               CAST(u.extr AS SIGNED) - COALESCE(t.actual, 0) AS diff
        FROM userinfo u
        LEFT JOIN (
            SELECT author, COUNT(*) AS actual
            FROM threads
            WHERE extr = 1
            GROUP BY author
        ) t ON u.username COLLATE utf8mb4_general_ci = t.author COLLATE utf8mb4_general_ci
        HAVING diff != 0
        ORDER BY ABS(diff) DESC");
    }

    public function findUserSignCounterMismatches() {
        return $this->fetchAll("SELECT u.username, u.sign AS stored_count,
               COALESCE(s.actual, 0) AS actual_count,
               CAST(u.sign AS SIGNED) - COALESCE(s.actual, 0) AS diff
        FROM userinfo u
        LEFT JOIN (
            SELECT username, COUNT(*) AS actual
            FROM sign
            GROUP BY username
        ) s ON u.username COLLATE utf8mb4_general_ci = s.username COLLATE utf8mb4_general_ci
        HAVING diff != 0
        ORDER BY ABS(diff) DESC");
    }

    public function findUserNewMessageCounterMismatches() {
        return $this->fetchAll("SELECT u.username, u.newmsg AS stored_count,
               COALESCE(m.actual, 0) AS actual_count,
               CAST(u.newmsg AS SIGNED) - COALESCE(m.actual, 0) AS diff
        FROM userinfo u
        LEFT JOIN (
            SELECT receiver, COUNT(*) AS actual
            FROM messages
            WHERE hasread = 0
            GROUP BY receiver
        ) m ON u.username COLLATE utf8mb4_general_ci = m.receiver COLLATE utf8mb4_general_ci
        HAVING diff != 0
        ORDER BY ABS(diff) DESC");
    }

    public function findThreadReplyCounterMismatches($limit) {
        $limit = max(1, intval($limit));
        return $this->fetchAll("SELECT t.bid, t.tid, t.title, t.reply AS stored_count,
               COALESCE(p.actual, 0) AS actual_posts,
               COALESCE(p.actual, 0) - 1 AS expected_reply,
               CAST(t.reply AS SIGNED) - (COALESCE(p.actual, 0) - 1) AS diff
        FROM threads t
        LEFT JOIN (
            SELECT bid, tid, COUNT(*) AS actual
            FROM posts
            GROUP BY bid, tid
        ) p ON t.bid = p.bid AND t.tid = p.tid
        HAVING diff != 0
        ORDER BY ABS(diff) DESC
        LIMIT $limit");
    }

    public function countThreadReplyCounterMismatches() {
        $row = $this->fetchOne("SELECT COUNT(*) AS cnt FROM (
            SELECT CAST(t.reply AS SIGNED) - (COALESCE(p.actual, 0) - 1) AS diff
            FROM threads t
            LEFT JOIN (SELECT bid, tid, COUNT(*) AS actual FROM posts GROUP BY bid, tid) p
              ON t.bid = p.bid AND t.tid = p.tid
        ) sub WHERE sub.diff != 0");
        return $row ? intval($row['cnt']) : 0;
    }

    public function findThreadReplyerMismatches($limit) {
        $limit = max(1, intval($limit));
        return $this->fetchAll("SELECT t.bid, t.tid, t.title, t.replyer AS stored_replyer,
               p.last_author AS actual_last_author
        FROM threads t
        INNER JOIN (
            SELECT p1.bid, p1.tid, p1.author AS last_author
            FROM posts p1
            INNER JOIN (
                SELECT bid, tid, MAX(pid) AS max_pid
                FROM posts
                GROUP BY bid, tid
            ) p2 ON p1.bid = p2.bid AND p1.tid = p2.tid AND p1.pid = p2.max_pid
            WHERE p1.pid != 1
        ) p ON t.bid = p.bid AND t.tid = p.tid
        WHERE t.replyer COLLATE utf8mb4_general_ci != p.last_author COLLATE utf8mb4_general_ci
           OR (t.replyer IS NULL AND p.last_author IS NOT NULL)
           OR (t.replyer IS NOT NULL AND p.last_author IS NULL)
        ORDER BY t.bid, t.tid
        LIMIT $limit");
    }

    public function countThreadReplyerMismatches() {
        $row = $this->fetchOne("SELECT COUNT(*) AS cnt FROM (
            SELECT 1 FROM threads t
            INNER JOIN (
                SELECT p1.bid, p1.tid, p1.author AS last_author
                FROM posts p1
                INNER JOIN (
                    SELECT bid, tid, MAX(pid) AS max_pid FROM posts GROUP BY bid, tid
                ) p2 ON p1.bid = p2.bid AND p1.tid = p2.tid AND p1.pid = p2.max_pid
                WHERE p1.pid != 1
            ) p ON t.bid = p.bid AND t.tid = p.tid
            WHERE t.replyer COLLATE utf8mb4_general_ci != p.last_author COLLATE utf8mb4_general_ci
               OR (t.replyer IS NULL AND p.last_author IS NOT NULL)
               OR (t.replyer IS NOT NULL AND p.last_author IS NULL)
        ) sub");
        return $row ? intval($row['cnt']) : 0;
    }

    public function findAllUserStarRows() {
        return $this->fetchAll("SELECT username, post, reply, star, other2,
               CAST(post AS SIGNED) + CAST(reply AS SIGNED) AS total
        FROM userinfo
        WHERE 1=1");
    }

    public function findThreadPidContinuityMismatches($limit) {
        $limit = max(1, intval($limit));
        return $this->fetchAll("SELECT p.bid, p.tid, MIN(p.pid) AS min_pid, MAX(p.pid) AS max_pid,
               COUNT(*) AS cnt, COUNT(DISTINCT p.pid) AS distinct_pids
        FROM posts p
        GROUP BY p.bid, p.tid
        HAVING MAX(p.pid) != COUNT(*)
            OR MIN(p.pid) != 1
            OR COUNT(DISTINCT p.pid) != COUNT(*)
        ORDER BY p.bid, p.tid
        LIMIT $limit");
    }

    public function countThreadPidContinuityMismatches() {
        $row = $this->fetchOne("SELECT COUNT(*) AS cnt FROM (
            SELECT p.bid, p.tid, MIN(p.pid) AS min_pid, COUNT(*) AS cnt2, COUNT(DISTINCT p.pid) AS distinct_pids
            FROM posts p
            GROUP BY p.bid, p.tid
            HAVING MAX(p.pid) != COUNT(*) OR MIN(p.pid) != 1 OR COUNT(DISTINCT p.pid) != COUNT(*)
        ) sub");
        return $row ? intval($row['cnt']) : 0;
    }

    public function findThreadTimestampMismatches($limit) {
        $limit = max(1, intval($limit));
        return $this->fetchAll("SELECT t.bid, t.tid, t.title, t.timestamp AS stored_ts,
               p.last_replytime AS actual_replytime
        FROM threads t
        INNER JOIN (
            SELECT p1.bid, p1.tid, p1.replytime AS last_replytime
            FROM posts p1
            INNER JOIN (
                SELECT bid, tid, MAX(pid) AS max_pid
                FROM posts
                GROUP BY bid, tid
            ) p2 ON p1.bid = p2.bid AND p1.tid = p2.tid AND p1.pid = p2.max_pid
            WHERE p1.pid != 1
        ) p ON t.bid = p.bid AND t.tid = p.tid
        WHERE CAST(t.timestamp AS SIGNED) != CAST(p.last_replytime AS SIGNED)
        ORDER BY ABS(CAST(t.timestamp AS SIGNED) - CAST(p.last_replytime AS SIGNED)) DESC
        LIMIT $limit");
    }

    public function countThreadTimestampMismatches() {
        $row = $this->fetchOne("SELECT COUNT(*) AS cnt FROM (
            SELECT 1 FROM threads t
            INNER JOIN (
                SELECT p1.bid, p1.tid, p1.replytime AS last_replytime
                FROM posts p1
                INNER JOIN (
                    SELECT bid, tid, MAX(pid) AS max_pid FROM posts GROUP BY bid, tid
                ) p2 ON p1.bid = p2.bid AND p1.tid = p2.tid AND p1.pid = p2.max_pid
                WHERE p1.pid != 1
            ) p ON t.bid = p.bid AND t.tid = p.tid
            WHERE CAST(t.timestamp AS SIGNED) != CAST(p.last_replytime AS SIGNED)
        ) sub");
        return $row ? intval($row['cnt']) : 0;
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
