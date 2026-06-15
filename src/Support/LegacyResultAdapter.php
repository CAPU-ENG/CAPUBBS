<?php

class CapubbsLegacyResultAdapter {
    public static function report($code, $msg) {
        return array(array(
            'code' => strval($code),
            'msg' => $msg,
        ));
    }

    public static function emptyRow() {
        return array(array());
    }

    public static function singleRow($row) {
        return array($row);
    }

    public static function withCodeAndCount($rows, $code) {
        return array_merge(
            array(array(
                'code' => strval($code),
                'count' => strval(count($rows)),
            )),
            $rows
        );
    }
}
