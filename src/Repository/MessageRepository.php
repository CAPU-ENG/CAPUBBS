<?php

class CapubbsMessageRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function insert($from, $to, $text, $bid, $tid, $pid, $ruser, $rmsg, $time = null) {
        if ($time === null) {
            $time = time();
        }
        $time = intval($time);
        $bid = intval($bid);
        $tid = intval($tid);
        $pid = intval($pid);

        $fromEscaped = mysqli_real_escape_string($this->con, $from);
        $toEscaped = mysqli_real_escape_string($this->con, $to);
        $textEscaped = mysqli_real_escape_string($this->con, $text);
        $ruserEscaped = mysqli_real_escape_string($this->con, $ruser);
        $rmsgEscaped = mysqli_real_escape_string($this->con, $rmsg);

        $statement = "insert into messages (sender,receiver,text,time,rbid,rtid,rpid,ruser,rmsg)
            values('$fromEscaped','$toEscaped','$textEscaped',$time,$bid,$tid,$pid,'$ruserEscaped','$rmsgEscaped')";
        if (!mysqli_query($this->con, $statement)) {
            return false;
        }

        mysqli_query($this->con, "update userinfo set newmsg=newmsg+1 where username='$toEscaped' limit 1");
        return true;
    }

    public function countSystemUnread($username) {
        return $this->countByStatement(
            "select count(1) as c from messages where receiver='" . $this->escape($username) . "' and sender='system' and hasread=0"
        );
    }

    public function countSystemTotal($username) {
        return $this->countByStatement(
            "select count(1) as c from messages where receiver='" . $this->escape($username) . "' and sender='system'"
        );
    }

    public function countPrivateUnread($username, $excludedSender) {
        $usernameEscaped = $this->escape($username);
        if ($excludedSender !== null && $excludedSender !== '') {
            $excludedSenderEscaped = $this->escape($excludedSender);
            $statement = "select count(1) as c from messages where receiver='$usernameEscaped' and sender!='system' and sender!='$excludedSenderEscaped' and hasread=0";
        } else {
            $statement = "select count(1) as c from messages where receiver='$usernameEscaped' and sender!='system' and hasread=0";
        }
        return $this->countByStatement($statement);
    }

    public function findSystemMessages($username, $offset, $limit) {
        $usernameEscaped = $this->escape($username);
        $offset = max(0, intval($offset));
        $limit = max(1, intval($limit));
        return $this->fetchAll(
            "select * from messages where receiver='$usernameEscaped' and sender='system' order by hasread,time desc limit $offset,$limit"
        );
    }

    public function markSystemRead($username) {
        $usernameEscaped = $this->escape($username);
        return mysqli_query($this->con, "update messages set hasread=1 where receiver='$usernameEscaped' and sender='system' and hasread=0");
    }

    public function findReceivedPrivateGroups($username) {
        $usernameEscaped = $this->escape($username);
        return $this->fetchAll(
            "select sender,group_concat(time order by time desc) as times,group_concat(hasread) as hasreads
             from messages
             where receiver='$usernameEscaped' and sender!='system'
             group by sender
             order by hasread,time desc"
        );
    }

    public function findSentPrivateGroupsExcluding($username, $excludedUsernames) {
        $usernameEscaped = $this->escape($username);
        $statement = "select receiver,group_concat(time order by time desc) as times
                      from messages
                      where sender='$usernameEscaped'";
        if (count($excludedUsernames) > 0) {
            $escaped = array();
            foreach ($excludedUsernames as $excludedUsername) {
                $escaped[] = "'" . $this->escape($excludedUsername) . "'";
            }
            $statement .= " and receiver not in (" . implode(',', $escaped) . ")";
        }
        $statement .= " group by receiver order by hasread,time desc";
        return $this->fetchAll($statement);
    }

    public function findLatestConversationMessage($username, $peer) {
        $usernameEscaped = $this->escape($username);
        $peerEscaped = $this->escape($peer);
        return $this->fetchOne(
            "select text,time from messages
             where (receiver='$usernameEscaped' and sender='$peerEscaped')
                or (receiver='$peerEscaped' and sender='$usernameEscaped')
             order by time desc limit 1"
        );
    }

    public function countConversationMessages($username, $peer) {
        $usernameEscaped = $this->escape($username);
        $peerEscaped = $this->escape($peer);
        return $this->countByStatement(
            "select count(1) as c from messages
             where (receiver='$usernameEscaped' and sender='$peerEscaped')
                or (receiver='$peerEscaped' and sender='$usernameEscaped')"
        );
    }

    public function findConversationMessages($username, $peer) {
        $usernameEscaped = $this->escape($username);
        $peerEscaped = $this->escape($peer);
        return $this->fetchAll(
            "select * from messages
             where (receiver='$usernameEscaped' and sender='$peerEscaped')
                or (sender='$usernameEscaped' and receiver='$peerEscaped')
             order by time"
        );
    }

    public function markConversationRead($username, $peer) {
        $usernameEscaped = $this->escape($username);
        $peerEscaped = $this->escape($peer);
        return mysqli_query($this->con, "update messages set hasread=1 where receiver='$usernameEscaped' and sender='$peerEscaped' and hasread=0");
    }

    public function countUnreadTotal($username) {
        return $this->countByStatement(
            "select count(1) as c from messages where hasread=0 and receiver='" . $this->escape($username) . "'"
        );
    }

    public function syncUnreadCount($username, $count) {
        $usernameEscaped = $this->escape($username);
        $count = intval($count);
        return mysqli_query($this->con, "update userinfo set newmsg=$count where username='$usernameEscaped' limit 1");
    }

    public function findAllUsernames() {
        $result = mysqli_query($this->con, "select username from userinfo");
        if (!$result) {
            return array();
        }

        $rows = array();
        while (($row = mysqli_fetch_row($result)) !== null) {
            $rows[] = $row[0];
        }
        mysqli_free_result($result);
        return $rows;
    }

    private function countByStatement($statement) {
        $row = $this->fetchOne($statement);
        if (!$row || !isset($row['c'])) {
            return 0;
        }
        return intval($row['c']);
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

    private function escape($value) {
        return mysqli_real_escape_string($this->con, $value);
    }
}
