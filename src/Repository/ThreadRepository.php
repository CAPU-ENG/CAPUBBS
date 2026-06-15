<?php

class CapubbsThreadRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function findByBidTid($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        return $this->fetchOne("select * from threads where bid=$bid && tid=$tid limit 1");
    }

    public function findDetailedByBidTid($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        $statement = "
            select
                threads.bid, threads.tid, threads.title, threads.author, threads.replyer,
                threads.click, threads.reply, threads.extr, threads.top, threads.locked,
                threads.timestamp, threads.postdate,
                case when thread_global_top.bid is null then 0 else 1 end as global_top,
                season_threads_activity.activity_id
            from threads
            left join thread_global_top
                on threads.bid=thread_global_top.bid and threads.tid=thread_global_top.tid
            left join season_threads_activity
                on threads.bid=season_threads_activity.bid and threads.tid=season_threads_activity.tid
            where threads.bid=$bid and threads.tid=$tid
            limit 1";
        return $this->fetchOne($statement);
    }

    public function countByBid($bid) {
        $bid = intval($bid);
        $row = $this->fetchOne("select count(*) as num from threads where bid=$bid");
        if (!$row) {
            return 0;
        }
        return intval($row['num']);
    }

    public function incrementClick($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        return mysqli_query($this->con, "update threads set click=click+1 where bid=$bid && tid=$tid");
    }

    public function findMaxTidIncludingTrash($bid) {
        $bid = intval($bid);
        $statement = "
            select max(tid) as m from (
                select tid from threads where bid=$bid
                union
                select tid from posts where bid=$bid
                union
                select tid from trash_threads where bid=$bid
                union
                select tid from trash_posts where bid=$bid
            ) as t";
        $row = $this->fetchOne($statement);
        if (!$row || $row['m'] === null) {
            return 0;
        }
        return intval($row['m']);
    }

    public function insertThread($bid, $tid, $title, $author, $timestamp, $postdate) {
        $bid = intval($bid);
        $tid = intval($tid);
        $timestamp = intval($timestamp);
        $titleEscaped = mysqli_real_escape_string($this->con, $title);
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        $postdateEscaped = mysqli_real_escape_string($this->con, $postdate);

        $statement = "insert into threads values ($bid,$tid,'$titleEscaped','$authorEscaped',null,0,0,1,0,0,0,$timestamp,'$postdateEscaped')";
        return mysqli_query($this->con, $statement);
    }

    public function incrementReply($bid, $tid, $replyer, $timestamp) {
        $bid = intval($bid);
        $tid = intval($tid);
        $timestamp = intval($timestamp);
        $replyerEscaped = mysqli_real_escape_string($this->con, $replyer);
        $statement = "update threads set reply=reply+1, replyer='$replyerEscaped', timestamp=$timestamp where bid=$bid && tid=$tid";
        return mysqli_query($this->con, $statement);
    }

    public function updateTitleAndAuthor($bid, $tid, $title, $author) {
        $bid = intval($bid);
        $tid = intval($tid);
        $titleEscaped = mysqli_real_escape_string($this->con, $title);
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        $statement = "update threads set title='$titleEscaped', author='$authorEscaped' where bid=$bid && tid=$tid";
        return mysqli_query($this->con, $statement);
    }

    public function updateReplyer($bid, $tid, $replyer) {
        $bid = intval($bid);
        $tid = intval($tid);
        $replyerEscaped = mysqli_real_escape_string($this->con, $replyer);
        $statement = "update threads set replyer='$replyerEscaped' where bid=$bid && tid=$tid";
        return mysqli_query($this->con, $statement);
    }

    public function updateAuthor($bid, $tid, $author) {
        $bid = intval($bid);
        $tid = intval($tid);
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        return mysqli_query($this->con, "update threads set author='$authorEscaped' where bid=$bid && tid=$tid");
    }

    public function updateReplyCount($bid, $tid, $reply) {
        $bid = intval($bid);
        $tid = intval($tid);
        $reply = intval($reply);
        $statement = "update threads set reply=$reply where bid=$bid && tid=$tid";
        return mysqli_query($this->con, $statement);
    }

    public function updateAfterDeletingFirstPost($bid, $tid, $title, $author, $reply) {
        $bid = intval($bid);
        $tid = intval($tid);
        $reply = intval($reply);
        $titleEscaped = mysqli_real_escape_string($this->con, $title);
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        $statement = "update threads set title='$titleEscaped', author='$authorEscaped', reply=$reply where bid=$bid && tid=$tid";
        return mysqli_query($this->con, $statement);
    }

    public function updateAfterDeletingLastPost($bid, $tid, $reply, $replyer, $timestamp) {
        $bid = intval($bid);
        $tid = intval($tid);
        $reply = intval($reply);
        $timestamp = intval($timestamp);
        if ($replyer === null) {
            $statement = "update threads set replyer=null,timestamp=$timestamp, reply=$reply where bid=$bid && tid=$tid";
        } else {
            $replyerEscaped = mysqli_real_escape_string($this->con, $replyer);
            $statement = "update threads set replyer='$replyerEscaped',timestamp=$timestamp, reply=$reply where bid=$bid && tid=$tid";
        }
        return mysqli_query($this->con, $statement);
    }

    public function toggleField($bid, $tid, $field) {
        $bid = intval($bid);
        $tid = intval($tid);
        if (!in_array($field, array('locked', 'top', 'extr'), true)) {
            return false;
        }
        return mysqli_query($this->con, "update threads set $field=1-$field where bid=$bid && tid=$tid");
    }

    public function isGlobalTop($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        $row = $this->fetchOne("select bid, tid from thread_global_top where bid=$bid and tid=$tid limit 1");
        return $row !== null;
    }

    public function addGlobalTop($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        return mysqli_query($this->con, "insert into thread_global_top (bid,tid) values ($bid,$tid)");
    }

    public function removeGlobalTop($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        return mysqli_query($this->con, "delete from thread_global_top where bid=$bid and tid=$tid");
    }

    public function moveThread($bid, $tid, $toBid, $toTid) {
        $bid = intval($bid);
        $tid = intval($tid);
        $toBid = intval($toBid);
        $toTid = intval($toTid);
        return mysqli_query($this->con, "update threads set bid=$toBid, tid=$toTid where bid=$bid && tid=$tid");
    }

    public function deleteByBidTid($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        return mysqli_query($this->con, "delete from threads where bid=$bid && tid=$tid");
    }

    public function insertRestoredThread($thread) {
        $bid = intval(isset($thread['bid']) ? $thread['bid'] : 0);
        $tid = intval(isset($thread['tid']) ? $thread['tid'] : 0);
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

        $statement = "insert into threads
            (bid, tid, title, author, replyer, click, reply, guesture,
             extr, top, locked, timestamp, postdate)
            values ($bid, $tid, '$titleEscaped', '$authorEscaped', $replyerSql,
                    $click, $reply, $guesture, $extr, $top, $locked, $timestamp, $postdateSql)";
        return mysqli_query($this->con, $statement);
    }

    public function lastAffectedRows() {
        return mysqli_affected_rows($this->con);
    }

    public function lastError() {
        return mysqli_error($this->con);
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
}
