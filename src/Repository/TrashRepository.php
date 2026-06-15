<?php

class CapubbsTrashRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function insertThreadSnapshot($bid, $tid, $thread, $deleter, $deletetime, $deleteip) {
        $bid = intval($bid);
        $tid = intval($tid);
        $deletetime = intval($deletetime);

        $titleEscaped = mysqli_real_escape_string($this->con, isset($thread['title']) ? $thread['title'] : '');
        $authorEscaped = mysqli_real_escape_string($this->con, isset($thread['author']) ? $thread['author'] : '');
        $replyerSql = isset($thread['replyer']) ? "'" . mysqli_real_escape_string($this->con, $thread['replyer']) . "'" : "NULL";
        $click = intval(isset($thread['click']) ? $thread['click'] : 0);
        $reply = intval(isset($thread['reply']) ? $thread['reply'] : 0);
        $guesture = intval(isset($thread['guesture']) ? $thread['guesture'] : 0);
        $extr = intval(isset($thread['extr']) ? $thread['extr'] : 0);
        $top = intval(isset($thread['top']) ? $thread['top'] : 0);
        $locked = intval(isset($thread['locked']) ? $thread['locked'] : 0);
        $timestamp = intval(isset($thread['timestamp']) ? $thread['timestamp'] : 0);
        $postdateSql = isset($thread['postdate']) ? "'" . mysqli_real_escape_string($this->con, $thread['postdate']) . "'" : "NULL";
        $deleterEscaped = mysqli_real_escape_string($this->con, $deleter);
        $deleteIpEscaped = mysqli_real_escape_string($this->con, $deleteip);

        $statement = "insert into trash_threads
            (bid, tid, title, author, replyer, click, reply, guesture,
             extr, top, locked, timestamp, postdate, deleter, deletetime, deleteip)
            values ($bid, $tid, '$titleEscaped', '$authorEscaped', $replyerSql, $click,
                    $reply, $guesture, $extr, $top, $locked,
                    $timestamp, $postdateSql, '$deleterEscaped', $deletetime, '$deleteIpEscaped')";
        return mysqli_query($this->con, $statement);
    }

    public function insertPostSnapshot($bid, $tid, $pid, $post, $deleter, $deletetime, $deleteip) {
        $bid = intval($bid);
        $tid = intval($tid);
        $pid = intval($pid);
        $deletetime = intval($deletetime);

        $fid = intval(isset($post['fid']) ? $post['fid'] : 0);
        $titleEscaped = mysqli_real_escape_string($this->con, isset($post['title']) ? $post['title'] : '');
        $authorEscaped = mysqli_real_escape_string($this->con, isset($post['author']) ? $post['author'] : '');
        $textEscaped = mysqli_real_escape_string($this->con, isset($post['text']) ? $post['text'] : '');
        $ishtmlEscaped = mysqli_real_escape_string($this->con, isset($post['ishtml']) ? $post['ishtml'] : '');
        $attachsEscaped = mysqli_real_escape_string($this->con, isset($post['attachs']) ? $post['attachs'] : '');
        $replytime = intval(isset($post['replytime']) ? $post['replytime'] : 0);
        $updatetime = intval(isset($post['updatetime']) ? $post['updatetime'] : 0);
        $sig = intval(isset($post['sig']) ? $post['sig'] : 0);
        $typeEscaped = mysqli_real_escape_string($this->con, isset($post['type']) ? $post['type'] : '');
        $ipEscaped = mysqli_real_escape_string($this->con, isset($post['ip']) ? $post['ip'] : '');
        $lzl = intval(isset($post['lzl']) ? $post['lzl'] : 0);
        $deleterEscaped = mysqli_real_escape_string($this->con, $deleter);
        $deleteIpEscaped = mysqli_real_escape_string($this->con, $deleteip);

        $statement = "insert into trash_posts
            (bid, tid, pid, fid, title, author, text, ishtml, attachs,
             replytime, updatetime, sig, type, ip, lzl,
             deleter, deletetime, deleteip)
            values ($bid, $tid, $pid, $fid,
                    '$titleEscaped', '$authorEscaped', '$textEscaped', '$ishtmlEscaped', '$attachsEscaped',
                    $replytime, $updatetime, $sig, '$typeEscaped', '$ipEscaped', $lzl,
                    '$deleterEscaped', $deletetime, '$deleteIpEscaped')";
        return mysqli_query($this->con, $statement);
    }

    public function findItems($bid, $allowedBids, $page, $limit, $type) {
        $bid = intval($bid);
        $page = max(1, intval($page));
        $limit = max(1, min(100, intval($limit)));
        $offset = ($page - 1) * $limit;

        $where = '';
        if ($bid > 0) {
            $where = "where bid=$bid";
        }

        if (is_array($allowedBids)) {
            if (count($allowedBids) === 0) {
                $allowedBids = array(-1);
            }

            $bidList = array();
            foreach ($allowedBids as $allowedBid) {
                $bidList[] = intval($allowedBid);
            }
            $where .= ($where ? ' and' : 'where') . " bid in (" . implode(',', $bidList) . ")";
        }

        $parts = array();
        if ($type === 'all' || $type === 'post') {
            $parts[] = "select trash_id, bid, tid, pid, fid, title, text, author, deleter, deletetime, 'post' as trash_type from trash_posts $where";
        }
        if ($type === 'all' || $type === 'thread') {
            $parts[] = "select trash_id, bid, tid, 0 as pid, 0 as fid, title, '' as text, author, deleter, deletetime, 'thread' as trash_type from trash_threads $where";
        }

        if (count($parts) === 0) {
            return array();
        }

        $statement = "select * from (" . implode(' union all ', $parts) . ") as t order by deletetime desc limit $offset, $limit";
        return $this->fetchAll($statement);
    }

    public function findThreadSnapshot($trashId, $bid, $tid) {
        $trashId = intval($trashId);
        $bid = intval($bid);
        $tid = intval($tid);
        return $this->fetchOne("select * from trash_threads where trash_id=$trashId and bid=$bid and tid=$tid limit 1");
    }

    public function findPostSnapshot($trashId, $bid, $tid, $pid) {
        $trashId = intval($trashId);
        $bid = intval($bid);
        $tid = intval($tid);
        $pid = intval($pid);
        return $this->fetchOne("select * from trash_posts where trash_id=$trashId and bid=$bid and tid=$tid and pid=$pid limit 1");
    }

    public function findPostSnapshotsByThread($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        return $this->fetchAll("select * from trash_posts where bid=$bid and tid=$tid order by pid");
    }

    public function deletePostSnapshotsByThread($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        return mysqli_query($this->con, "delete from trash_posts where bid=$bid and tid=$tid");
    }

    public function deleteThreadSnapshotById($trashId) {
        $trashId = intval($trashId);
        return mysqli_query($this->con, "delete from trash_threads where trash_id=$trashId");
    }

    public function deletePostSnapshotById($trashId) {
        $trashId = intval($trashId);
        return mysqli_query($this->con, "delete from trash_posts where trash_id=$trashId");
    }

    public function deletePostSnapshotsOlderThan($cutoff) {
        $cutoff = intval($cutoff);
        mysqli_query($this->con, "delete from trash_posts where deletetime < $cutoff");
        return mysqli_affected_rows($this->con);
    }

    public function deleteThreadSnapshotsOlderThan($cutoff) {
        $cutoff = intval($cutoff);
        mysqli_query($this->con, "delete from trash_threads where deletetime < $cutoff");
        return mysqli_affected_rows($this->con);
    }

    private function fetchOne($statement) {
        $result = mysqli_query($this->con, $statement);
        if (!$result) {
            return false;
        }
        $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
        mysqli_free_result($result);
        return $row ? $row : null;
    }

    private function fetchAll($statement) {
        $result = mysqli_query($this->con, $statement);
        if (!$result) {
            return array();
        }

        $rows = array();
        while (($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) !== null) {
            $rows[] = $row;
        }
        mysqli_free_result($result);
        return $rows;
    }
}
