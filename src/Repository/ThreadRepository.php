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
