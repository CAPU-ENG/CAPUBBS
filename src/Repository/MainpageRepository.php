<?php

class CapubbsMainpageRepository {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function findRowsById($id, $orderBy, $limit) {
        $id = intval($id);
        $statement = "select * from capubbs.mainpage where id=$id";
        $orderBy = $this->normalizeOrderBy($orderBy);
        if ($orderBy !== '') {
            $statement .= " order by $orderBy";
        }
        if ($limit !== null) {
            $statement .= " limit 0," . intval($limit);
        }
        return $this->fetchAll($statement);
    }

    public function findLegacyRowsById($id, $orderBy, $limit) {
        $id = intval($id);
        $statement = "select * from capubbs.mainpage where id=$id";
        $orderBy = $this->normalizeOrderBy($orderBy);
        if ($orderBy !== '') {
            $statement .= " order by $orderBy";
        }
        if ($limit !== null) {
            $statement .= " limit 0," . intval($limit);
        }
        return $this->fetchAllLegacy($statement);
    }

    public function findUpdateBanner() {
        return $this->fetchOne("select * from capubbs.mainpage where id=-1 limit 1");
    }

    public function clearRowsById($id) {
        $id = intval($id);
        return mysqli_query($this->con, "delete from capubbs.mainpage where id=$id");
    }

    public function insertRow($id, $field1, $field2, $field3, $field4, $field5) {
        $id = intval($id);
        $field1Escaped = mysqli_real_escape_string($this->con, $field1);
        $field2Escaped = mysqli_real_escape_string($this->con, $field2);
        $field3Escaped = mysqli_real_escape_string($this->con, $field3);
        $field4Escaped = mysqli_real_escape_string($this->con, $field4);
        $field5Escaped = mysqli_real_escape_string($this->con, $field5);
        $statement = "insert into capubbs.mainpage values (null, $id, '$field1Escaped', '$field2Escaped', '$field3Escaped', '$field4Escaped', '$field5Escaped')";
        return mysqli_query($this->con, $statement);
    }

    public function deleteAnnouncementByTime($time) {
        $timeEscaped = mysqli_real_escape_string($this->con, strval($time));
        return mysqli_query($this->con, "delete from capubbs.mainpage where id=1 and field3='$timeEscaped'");
    }

    public function reorderRows() {
        return mysqli_query($this->con, "alter table capubbs.mainpage order by number");
    }

    public function findAllCalendar() {
        return $this->fetchAll("select * from capubbs.calendar");
    }

    public function findAllCalendarLegacy() {
        return $this->fetchAllLegacy("select * from capubbs.calendar");
    }

    public function findCalendarByDate($year, $month, $day) {
        $yearEscaped = mysqli_real_escape_string($this->con, $year);
        $monthEscaped = mysqli_real_escape_string($this->con, $month);
        $dayEscaped = mysqli_real_escape_string($this->con, $day);
        return $this->fetchAll("select * from capubbs.calendar where year='$yearEscaped' and month='$monthEscaped' and day='$dayEscaped'");
    }

    public function clearCalendarByDate($year, $month, $day) {
        $yearEscaped = mysqli_real_escape_string($this->con, $year);
        $monthEscaped = mysqli_real_escape_string($this->con, $month);
        $dayEscaped = mysqli_real_escape_string($this->con, $day);
        return mysqli_query($this->con, "delete from capubbs.calendar where year='$yearEscaped' and month='$monthEscaped' and day='$dayEscaped'");
    }

    public function insertCalendarEntry($year, $month, $day, $time, $title, $content) {
        $yearEscaped = mysqli_real_escape_string($this->con, $year);
        $monthEscaped = mysqli_real_escape_string($this->con, $month);
        $dayEscaped = mysqli_real_escape_string($this->con, $day);
        $timeEscaped = mysqli_real_escape_string($this->con, $time);
        $titleEscaped = mysqli_real_escape_string($this->con, $title);
        $contentEscaped = mysqli_real_escape_string($this->con, $content);
        $statement = "insert into capubbs.calendar values ('$yearEscaped','$monthEscaped','$dayEscaped','$timeEscaped','$titleEscaped','$contentEscaped')";
        return mysqli_query($this->con, $statement);
    }

    public function findDownloads($limit) {
        $statement = "select * from capubbs.downloads where name!='' order by id desc";
        if ($limit !== null) {
            $statement .= " limit 0," . intval($limit);
        }
        return $this->fetchAll($statement);
    }

    public function insertDownload($title, $url) {
        $titleEscaped = mysqli_real_escape_string($this->con, $title);
        $urlEscaped = mysqli_real_escape_string($this->con, $url);
        return mysqli_query($this->con, "insert into capubbs.downloads values (null, '$titleEscaped', '$urlEscaped', 0)");
    }

    public function updateDownload($id, $title, $url) {
        $id = intval($id);
        $titleEscaped = mysqli_real_escape_string($this->con, $title);
        $urlEscaped = mysqli_real_escape_string($this->con, $url);
        return mysqli_query($this->con, "update capubbs.downloads set name='$titleEscaped', url='$urlEscaped' where id=$id");
    }

    public function deleteDownload($id) {
        $id = intval($id);
        return mysqli_query($this->con, "delete from capubbs.downloads where id=$id");
    }

    public function findDownloadById($id) {
        $id = intval($id);
        return $this->fetchOne("select * from capubbs.downloads where id=$id limit 1");
    }

    public function incrementDownloadTimes($id) {
        $id = intval($id);
        return mysqli_query($this->con, "update capubbs.downloads set times=times+1 where id=$id");
    }

    public function lastError() {
        return mysqli_error($this->con);
    }

    public function lastErrno() {
        return mysqli_errno($this->con);
    }

    private function normalizeOrderBy($orderBy) {
        $allowed = array(
            '',
            'field3 desc',
            'field3 asc',
            'number desc',
            'number asc',
            'number',
        );
        return in_array($orderBy, $allowed, true) ? $orderBy : '';
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

    private function fetchAllLegacy($statement) {
        $result = mysqli_query($this->con, $statement);
        if (!$result) {
            return array();
        }

        $rows = array();
        while (($row = mysqli_fetch_array($result)) !== null) {
            $rows[] = $row;
        }
        mysqli_free_result($result);
        return $rows;
    }
}
