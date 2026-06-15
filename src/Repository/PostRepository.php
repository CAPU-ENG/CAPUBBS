<?php

class CapubbsPostRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function findByThreadPage($bid, $tid, $page, $pageSize, $author) {
        $bid = intval($bid);
        $tid = intval($tid);
        $page = max(1, intval($page));
        $pageSize = max(1, intval($pageSize));
        $start = ($page - 1) * $pageSize;
        $whereAuthor = '';
        if ($author !== '') {
            $authorEscaped = mysqli_real_escape_string($this->con, $author);
            $whereAuthor = " && author='$authorEscaped'";
        }
        $statement = "select * from posts where bid=$bid && tid=$tid$whereAuthor order by pid limit $start, $pageSize";
        return $this->fetchAll($statement);
    }

    public function findByBidTidPid($bid, $tid, $pid) {
        $bid = intval($bid);
        $tid = intval($tid);
        $pid = intval($pid);
        return $this->fetchOne("select * from posts where bid=$bid and tid=$tid and pid=$pid limit 1");
    }

    public function findByFid($fid) {
        $fid = intval($fid);
        return $this->fetchOne("select * from posts where fid=$fid limit 1");
    }

    public function countByAuthorInThread($bid, $tid, $author) {
        $bid = intval($bid);
        $tid = intval($tid);
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        $row = $this->fetchOne("select count(*) as num from posts where bid=$bid and tid=$tid and author='$authorEscaped'");
        if (!$row) {
            return 0;
        }
        return intval($row['num']);
    }

    public function findRecentThreadPostsByAuthor($author, $limit) {
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        $limitClause = $this->buildLimitClause($limit);
        $statement = "select bid,tid,pid,title,author,replytime as timestamp from posts where author='$authorEscaped' and pid=1 order by replytime desc$limitClause";
        return $this->fetchAll($statement);
    }

    public function findRecentRepliesByAuthor($author, $limit) {
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        $limitClause = $this->buildLimitClause($limit);
        $statement = "select title, bid, tid, pid, updatetime from posts where author='$authorEscaped' order by updatetime desc$limitClause";
        return $this->fetchAll($statement);
    }

    public function findLastPidInThread($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        $row = $this->fetchOne("select pid from posts where bid=$bid && tid=$tid order by pid desc limit 1");
        if (!$row) {
            return null;
        }
        return intval($row['pid']);
    }

    public function countInThread($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        $row = $this->fetchOne("select count(*) as num from posts where bid=$bid && tid=$tid");
        if (!$row) {
            return 0;
        }
        return intval($row['num']);
    }

    public function insertPost($bid, $tid, $pid, $title, $author, $text, $ishtml, $attachs, $replytime, $updatetime, $sig, $ip, $type, $lzl) {
        $bid = intval($bid);
        $tid = intval($tid);
        $pid = intval($pid);
        $replytime = intval($replytime);
        $updatetime = intval($updatetime);
        $sig = intval($sig);
        $lzl = intval($lzl);

        $titleEscaped = mysqli_real_escape_string($this->con, $title);
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        $textEscaped = mysqli_real_escape_string($this->con, $text);
        $ishtmlEscaped = mysqli_real_escape_string($this->con, $ishtml);
        $attachsEscaped = mysqli_real_escape_string($this->con, $attachs);
        $ipEscaped = mysqli_real_escape_string($this->con, $ip);
        $typeEscaped = mysqli_real_escape_string($this->con, $type);

        $statement = "insert into posts (bid,tid,pid,title,author,text,ishtml,attachs,replytime,updatetime,sig,ip,type,lzl)
            values ($bid,$tid,$pid,'$titleEscaped','$authorEscaped','$textEscaped','$ishtmlEscaped','$attachsEscaped',$replytime,$updatetime,$sig,'$ipEscaped','$typeEscaped',$lzl)";
        $ok = mysqli_query($this->con, $statement);
        if (!$ok) {
            return false;
        }
        return mysqli_insert_id($this->con);
    }

    public function updatePostContent($bid, $tid, $pid, $title, $author, $text, $sig, $ip, $type, $attachs, $updatetime) {
        $bid = intval($bid);
        $tid = intval($tid);
        $pid = intval($pid);
        $sig = intval($sig);
        $updatetime = intval($updatetime);

        $titleEscaped = mysqli_real_escape_string($this->con, $title);
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        $textEscaped = mysqli_real_escape_string($this->con, $text);
        $ipEscaped = mysqli_real_escape_string($this->con, $ip);
        $typeEscaped = mysqli_real_escape_string($this->con, $type);
        $attachsEscaped = mysqli_real_escape_string($this->con, $attachs);

        $statement = "update posts set title='$titleEscaped', author='$authorEscaped', text='$textEscaped', ishtml='YES', sig=$sig, ip='$ipEscaped', type='$typeEscaped', attachs='$attachsEscaped', updatetime=$updatetime where bid=$bid && tid=$tid && pid=$pid";
        return mysqli_query($this->con, $statement);
    }

    public function updatePostTextAndAuthorByFid($fid, $text, $author, $updatetime) {
        $fid = intval($fid);
        $updatetime = intval($updatetime);
        $textEscaped = mysqli_real_escape_string($this->con, $text);
        $authorEscaped = mysqli_real_escape_string($this->con, $author);
        return mysqli_query($this->con, "update posts set text='$textEscaped', author='$authorEscaped', updatetime=$updatetime where fid=$fid");
    }

    public function findAllByThreadOrdered($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        return $this->fetchAll("select * from posts where bid=$bid && tid=$tid order by pid");
    }

    public function deleteByBidTid($bid, $tid) {
        $bid = intval($bid);
        $tid = intval($tid);
        return mysqli_query($this->con, "delete from posts where bid=$bid && tid=$tid");
    }

    public function deleteByBidTidPid($bid, $tid, $pid) {
        $bid = intval($bid);
        $tid = intval($tid);
        $pid = intval($pid);
        return mysqli_query($this->con, "delete from posts where bid=$bid && tid=$tid && pid=$pid");
    }

    public function decrementPidAfter($bid, $tid, $pid) {
        $bid = intval($bid);
        $tid = intval($tid);
        $pid = intval($pid);
        return mysqli_query($this->con, "update posts set pid=pid-1 where bid=$bid && tid=$tid && pid>$pid");
    }

    public function incrementPidFrom($bid, $tid, $pid) {
        $bid = intval($bid);
        $tid = intval($tid);
        $pid = intval($pid);
        return mysqli_query($this->con, "update posts set pid=pid+1 where bid=$bid && tid=$tid && pid>=$pid");
    }

    public function incrementNestedReplyCountByFid($fid) {
        $fid = intval($fid);
        return mysqli_query($this->con, "update posts set lzl=lzl+1 where fid=$fid");
    }

    public function decrementNestedReplyCountByFid($fid) {
        $fid = intval($fid);
        return mysqli_query($this->con, "update posts set lzl=lzl-1 where fid=$fid");
    }

    public function moveThreadPosts($bid, $tid, $toBid, $toTid) {
        $bid = intval($bid);
        $tid = intval($tid);
        $toBid = intval($toBid);
        $toTid = intval($toTid);
        return mysqli_query($this->con, "update posts set bid=$toBid, tid=$toTid where bid=$bid && tid=$tid");
    }

    public function insertRestoredPost($post, $pidOverride) {
        $bid = intval(isset($post['bid']) ? $post['bid'] : 0);
        $tid = intval(isset($post['tid']) ? $post['tid'] : 0);
        $pid = intval($pidOverride);
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

        $statement = "insert ignore into posts
            (bid, tid, pid, fid, title, author, text, ishtml, attachs,
             replytime, updatetime, sig, type, ip, lzl)
            values ($bid, $tid, $pid, $fid,
                    '$titleEscaped', '$authorEscaped', '$textEscaped', '$ishtmlEscaped', '$attachsEscaped',
                    $replytime, $updatetime, $sig, '$typeEscaped', '$ipEscaped', $lzl)";
        return mysqli_query($this->con, $statement);
    }

    public function lastAffectedRows() {
        return mysqli_affected_rows($this->con);
    }

    public function lastError() {
        return mysqli_error($this->con);
    }

    private function buildLimitClause($limit) {
        if ($limit === null) {
            return '';
        }
        $limit = intval($limit);
        if ($limit <= 0) {
            return '';
        }
        return " limit 0,$limit";
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
            return false;
        }
        $rows = array();
        while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
            $rows[] = $row;
        }
        mysqli_free_result($result);
        return $rows;
    }
}
