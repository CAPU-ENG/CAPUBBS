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
}
