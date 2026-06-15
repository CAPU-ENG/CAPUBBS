<?php

class CapubbsMainpageService {
    private $mainpageRepository;
    private $userRepository;
    private $permissionService;

    public function __construct($mainpageRepository, $userRepository, $permissionService) {
        $this->mainpageRepository = $mainpageRepository;
        $this->userRepository = $userRepository;
        $this->permissionService = $permissionService;
    }

    public function legacyNews($token, $params) {
        $rights = $this->permissionService->getLegacyRightsTuple(0, $token);
        if (intval(isset($rights[3]) ? $rights[3] : 0) < 1) {
            return array(array('code' => '-1', 'msg' => '您的权限不足！'));
        }

        $method = isset($params['method']) ? $params['method'] : '';
        if ($method === 'delete') {
            $time = isset($params['time']) ? $params['time'] : '';
            $this->mainpageRepository->deleteAnnouncementByTime($time);
            $this->mainpageRepository->reorderRows();
            return array(array('code' => '0'));
        }

        if ($method === 'add') {
            $title = isset($params['text']) ? sanitize_xml($params['text']) : '';
            $url = isset($params['url']) ? sanitize_xml($params['url']) : '';
            if (strlen($title) == 0) {
                return array(array('code' => '-1', 'msg' => '您未填写公告内容！'));
            }
            if (strlen($url) == 0) {
                $url = 'javascript:void(0)';
            }
            $time = time();
            $this->mainpageRepository->insertRow(1, $title, $url, strval($time), '', '');
            $this->mainpageRepository->reorderRows();
            return array(array('code' => '0'));
        }

        return array(array('code' => '-1', 'msg' => '错误操作！'));
    }

    public function legacyCalendarRows() {
        return $this->mainpageRepository->findAllCalendarLegacy();
    }

    public function legacyGetFilesize($params) {
        $url = isset($params['url']) ? $params['url'] : '';
        if (empty($url)) {
            return array(array('code' => '6', 'msg' => 'Missing url'));
        }

        $info = @get_headers($url, true);
        $size = ($info && isset($info['Content-Length'])) ? intval($info['Content-Length']) : 0;
        return array(
            array('code' => '0'),
            array('size' => $size)
        );
    }

    public function legacyLoadCalendar($params) {
        $year = isset($params['year']) ? strval($params['year']) : '';
        $month = isset($params['month']) ? strval($params['month']) : '';
        $day = isset($params['day']) ? strval($params['day']) : '';
        return $this->mainpageRepository->findCalendarByDate($year, $month, $day);
    }

    public function legacySaveCalendar($token, $params) {
        $authError = $this->requireEditorToken($token);
        if ($authError !== null) {
            return $authError;
        }

        $year = isset($params['year']) ? strval($params['year']) : '';
        $month = isset($params['month']) ? strval($params['month']) : '';
        $day = isset($params['day']) ? strval($params['day']) : '';
        $content = isset($params['content']) ? $params['content'] : '';

        $this->mainpageRepository->clearCalendarByDate($year, $month, $day);
        $events = json_decode($content, true);
        if (is_array($events)) {
            foreach ($events as $event) {
                $time = isset($event['time']) ? $event['time'] : '';
                $title = isset($event['title']) ? $event['title'] : '';
                $text = isset($event['content']) ? $event['content'] : '';
                $this->mainpageRepository->insertCalendarEntry($year, $month, $day, $time, $title, $text);
            }
        }

        if ($this->mainpageRepository->lastErrno() !== 0) {
            return array(array('code' => '8', 'msg' => 'Database error: ' . $this->mainpageRepository->lastErrno()));
        }
        return array(array('code' => '0'));
    }

    public function legacyAddInform($token, $params) {
        $authError = $this->requireEditorToken($token);
        if ($authError !== null) {
            return $authError;
        }

        $title = isset($params['title']) ? $params['title'] : '';
        $url = isset($params['url']) ? $params['url'] : '';
        $this->mainpageRepository->insertRow(1, $title, $url, strval(time()), '', '');
        $this->mainpageRepository->reorderRows();

        if ($this->mainpageRepository->lastErrno() !== 0) {
            return array(array('code' => '8', 'msg' => 'Database error: ' . $this->mainpageRepository->lastErrno()));
        }
        return array(array('code' => '0'));
    }

    public function legacyDeleteInform($token, $params) {
        $authError = $this->requireEditorToken($token);
        if ($authError !== null) {
            return $authError;
        }

        $time = isset($params['time']) ? $params['time'] : 0;
        $this->mainpageRepository->deleteAnnouncementByTime($time);
        $this->mainpageRepository->reorderRows();
        if ($this->mainpageRepository->lastErrno() !== 0) {
            return array(array('code' => '8', 'msg' => 'Database error: ' . $this->mainpageRepository->lastErrno()));
        }
        return array(array('code' => '0'));
    }

    public function legacySaveImages($token, $params) {
        $authError = $this->requireEditorToken($token);
        if ($authError !== null) {
            return $authError;
        }

        $this->mainpageRepository->clearRowsById(0);
        $images = json_decode(isset($params['json']) ? $params['json'] : '', true);
        if (is_array($images)) {
            usort($images, function($a, $b) {
                $aId = intval(isset($a['id']) ? $a['id'] : 0);
                $bId = intval(isset($b['id']) ? $b['id'] : 0);
                if ($aId == $bId) return 0;
                return ($aId < $bId) ? -1 : 1;
            });
            foreach ($images as $image) {
                $img = isset($image['img']) ? $image['img'] : '';
                $thumb = isset($image['imgthumb']) ? $image['imgthumb'] : '';
                $title = isset($image['title']) ? $image['title'] : '';
                $this->mainpageRepository->insertRow(0, $img, $thumb, $title, '', '');
            }
        }

        $this->mainpageRepository->reorderRows();
        if ($this->mainpageRepository->lastErrno() !== 0) {
            return array(array('code' => '8', 'msg' => 'Database error: ' . $this->mainpageRepository->lastErrno()));
        }
        return array(array('code' => '0'));
    }

    public function legacyAddDownload($token, $params) {
        $authError = $this->requireEditorToken($token);
        if ($authError !== null) {
            return $authError;
        }

        $title = isset($params['title']) ? $params['title'] : '';
        $url = isset($params['url']) ? $params['url'] : '';
        $this->mainpageRepository->insertDownload($title, $url);
        if ($this->mainpageRepository->lastErrno() !== 0) {
            return array(array('code' => '8', 'msg' => 'Database error: ' . $this->mainpageRepository->lastErrno()));
        }
        return array(array('code' => '0'));
    }

    public function legacyEditDownload($token, $params) {
        $authError = $this->requireEditorToken($token);
        if ($authError !== null) {
            return $authError;
        }

        $id = isset($params['id']) ? intval($params['id']) : 0;
        $title = isset($params['title']) ? $params['title'] : '';
        $url = isset($params['url']) ? $params['url'] : '';
        $this->mainpageRepository->updateDownload($id, $title, $url);
        if ($this->mainpageRepository->lastErrno() !== 0) {
            return array(array('code' => '8', 'msg' => 'Database error: ' . $this->mainpageRepository->lastErrno()));
        }
        return array(array('code' => '0'));
    }

    public function legacyDeleteDownload($token, $params) {
        $authError = $this->requireEditorToken($token);
        if ($authError !== null) {
            return $authError;
        }

        $id = isset($params['id']) ? intval($params['id']) : 0;
        $this->mainpageRepository->deleteDownload($id);
        if ($this->mainpageRepository->lastErrno() !== 0) {
            return array(array('code' => '8', 'msg' => 'Database error: ' . $this->mainpageRepository->lastErrno()));
        }
        return array(array('code' => '0'));
    }

    public function getHomepageSections($informLimit) {
        return array(
            'images' => $this->mainpageRepository->findRowsById(0, '', null),
            'announcements' => $this->mainpageRepository->findRowsById(1, 'field3 desc', $informLimit),
            'videos' => $this->mainpageRepository->findRowsById(2, '', null),
        );
    }

    public function getClientHomepagePayload($moreInfo) {
        return array(
            'update' => $this->mainpageRepository->findUpdateBanner(),
            'announcements' => $this->mainpageRepository->findRowsById(1, 'number desc', $moreInfo ? 20 : 6),
        );
    }

    public function getDownloads($limit) {
        return $this->mainpageRepository->findDownloads($limit);
    }

    public function resolveDownloadUrl($id) {
        $row = $this->mainpageRepository->findDownloadById($id);
        if (!$row || !isset($row['url'])) {
            return null;
        }
        $this->mainpageRepository->incrementDownloadTimes($id);
        return $row['url'];
    }

    private function requireEditorToken($token) {
        $user = $this->userRepository->findUsernameAndRightsByToken($token);
        if (!$user || intval(isset($user['rights']) ? $user['rights'] : 0) === 0) {
            return array(array('code' => '-18', 'msg' => '请先登录'));
        }
        return null;
    }
}
