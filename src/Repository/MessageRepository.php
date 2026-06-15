<?php

class CapubbsMessageRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function insert($from, $to, $text, $bid, $tid, $pid, $ruser, $rmsg) {
        $time = time();
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
}
