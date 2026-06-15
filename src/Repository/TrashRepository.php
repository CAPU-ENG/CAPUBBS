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
}
