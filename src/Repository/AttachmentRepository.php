<?php

class CapubbsAttachmentRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function incrementRefsByAttachString($attachs) {
        if ($attachs === null || $attachs === '') {
            return true;
        }

        $ids = array();
        foreach (array_filter(explode(' ', $attachs), 'strlen') as $rawId) {
            $id = intval($rawId);
            if ($id > 0) {
                $ids[] = $id;
            }
        }

        if (count($ids) === 0) {
            return true;
        }

        return mysqli_query($this->con, "update attachments set ref=ref+1 where id in (" . implode(',', $ids) . ")");
    }

    public function create($name, $path, $size, $uploader, $price, $auth, $time) {
        $nameEscaped = mysqli_real_escape_string($this->con, $name);
        $pathEscaped = mysqli_real_escape_string($this->con, $path);
        $uploaderEscaped = mysqli_real_escape_string($this->con, $uploader);
        $size = intval($size);
        $price = intval($price);
        $auth = intval($auth);
        $time = intval($time);

        $statement = "insert into attachments (name,path,size,uploader,price,auth,time)
            values('$nameEscaped','$pathEscaped',$size,'$uploaderEscaped',$price,$auth,$time)";
        if (!mysqli_query($this->con, $statement)) {
            return false;
        }
        return mysqli_insert_id($this->con);
    }

    public function findById($id) {
        $id = intval($id);
        return $this->fetchOne("select * from attachments where id=$id limit 1");
    }

    public function findByIds($ids) {
        $idList = array();
        foreach ($ids as $id) {
            $id = intval($id);
            if ($id > 0) {
                $idList[$id] = $id;
            }
        }

        if (count($idList) === 0) {
            return array();
        }

        return $this->fetchAll("select * from attachments where id in (" . implode(',', $idList) . ")");
    }

    public function findUnusedByUploader($username) {
        $usernameEscaped = mysqli_real_escape_string($this->con, $username);
        return $this->fetchAll("select * from attachments where uploader='$usernameEscaped' and ref=0");
    }

    public function incrementDownloadCount($id) {
        $id = intval($id);
        return mysqli_query($this->con, "update attachments set count=count+1 where id=$id limit 1");
    }

    public function markDeletedById($id) {
        $id = intval($id);
        return mysqli_query($this->con, "update attachments set uploader=concat(uploader, '|删除') where id=$id limit 1");
    }

    public function decrementRef($id) {
        $id = intval($id);
        return mysqli_query($this->con, "update attachments set ref=greatest(ref-1,0) where id=$id limit 1");
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
