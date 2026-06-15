<?php

class CapubbsAttachmentService {
    private $attachmentRepository;
    private $userRepository;
    private $attachRoot;

    public function __construct($attachmentRepository, $userRepository, $attachRoot) {
        $this->attachmentRepository = $attachmentRepository;
        $this->userRepository = $userRepository;
        $this->attachRoot = rtrim($attachRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    }

    public function legacyUpload($token, $path, $filename) {
        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return CapubbsLegacyResultAdapter::report('3', 'unauthorized');
        }

        if (strpos($path, "'") !== false) {
            return CapubbsLegacyResultAdapter::report('1', 'illegal');
        }

        $filename = str_replace('&', '&amp;', $filename);
        $fullPath = $this->attachRoot . $path;
        if (!file_exists($fullPath)) {
            return CapubbsLegacyResultAdapter::report('2', 'error: file not found');
        }

        $size = intval(@filesize($fullPath));
        $insertId = $this->attachmentRepository->create($filename, $path, $size, $user['username'], 0, 0, time());
        if ($insertId === false) {
            return CapubbsLegacyResultAdapter::report('2', 'error:' . $this->attachmentRepository->lastError());
        }

        return CapubbsLegacyResultAdapter::report('0', strval($insertId));
    }

    public function legacyDownload($token, $id) {
        $user = $this->userRepository->findByToken($token);
        if (!$user) {
            return CapubbsLegacyResultAdapter::report('3', 'unauthorized');
        }

        $id = intval($id);
        $attachment = $this->attachmentRepository->findById($id);
        if (!$attachment) {
            return CapubbsLegacyResultAdapter::report('6', 'attachment not found');
        }

        $this->attachmentRepository->incrementDownloadCount($id);
        return array(array(
            'code' => '0',
            'aid' => strval($id),
            'path' => isset($attachment['path']) ? $attachment['path'] : '',
            'name' => isset($attachment['name']) ? $attachment['name'] : '',
        ));
    }

    public function legacyInfo($id, $token) {
        $attachment = $this->attachmentRepository->findById($id);
        if (!$attachment) {
            return array(array('exist' => 'NO'));
        }

        $isAuthor = false;
        $user = $this->userRepository->findByToken($token);
        if ($user && isset($user['username']) && isset($attachment['uploader']) && $user['username'] == $attachment['uploader']) {
            $isAuthor = true;
        }

        $info = array('exist' => 'YES', 'isAuthor' => $isAuthor ? 'YES' : 'NO');
        foreach ($attachment as $key => $value) {
            $info[$key] = $value;
        }

        return array($info);
    }

    public function legacyUnusedInfo($token) {
        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return array(array('code' => '1'));
        }

        $rows = $this->attachmentRepository->findUnusedByUploader($user['username']);
        $infos = array(array('code' => '0'));
        foreach ($rows as $row) {
            $info = array();
            foreach ($row as $key => $value) {
                $info[$key] = $value;
            }
            $infos[] = $info;
        }
        return $infos;
    }

    public function legacyDelete($token, $id) {
        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return array(array('code' => '1', 'msg' => '超时，请重新登录。'));
        }

        $id = intval($id);
        $attachment = $this->attachmentRepository->findById($id);
        if (!$attachment) {
            return array(array('code' => '6', 'msg' => '找不到该附件'));
        }

        if (!isset($attachment['uploader']) || $attachment['uploader'] != $user['username']) {
            return array(array('code' => '2', 'msg' => '无权删除'));
        }

        if (!isset($attachment['path']) || $attachment['path'] === '') {
            return array(array('code' => '5', 'msg' => '数据库错误'));
        }

        $fullPath = $this->attachRoot . $attachment['path'];
        if (!file_exists($fullPath) || true) {
            if ($this->attachmentRepository->markDeletedById($id)) {
                return array(array('code' => '0'));
            }
            return array(array('code' => '3', 'msg' => $this->attachmentRepository->lastError()));
        }

        return array(array('code' => '4', 'msg' => '无法删除附件'));
    }
}
