<?php
/** Homepage video metadata. Files are independent of the forum database. */
class HomepageVideosConflict extends RuntimeException {}

class HomepageVideosStore {
    private $path;
    private $seed;

    public function __construct($path = null, $seed = null) {
        $this->path = $path === null ? __DIR__.'/../../index/data/videos.json' : $path;
        $this->seed = $seed === null ? __DIR__.'/../../index/data/videos.default.json' : $seed;
    }

    public function read() {
        // Writers replace the complete file atomically; readers need no write access.
        return self::decode($this->readBytes(file_exists($this->path) ? $this->path : $this->seed));
    }

    public function save($revision, $content) {
        $next = self::content($content);
        if (!is_int($revision) || $revision < 1) throw new InvalidArgumentException('视频版本无效，请刷新后重试。');
        $lock = @fopen($this->path.'.lock', 'c');
        if ($lock === false) throw new RuntimeException('视频目录不可写。');
        try {
            if (!flock($lock, LOCK_EX)) throw new RuntimeException('视频列表繁忙。');
            $before = $this->readBytes(file_exists($this->path) ? $this->path : $this->seed);
            $current = self::decode($before);
            if ($revision !== $current['revision']) throw new HomepageVideosConflict('视频列表已被其他人更新，请重新加载后编辑。');
            if ($next['videos'] === $current['videos'] && $next['moreUrl'] === $current['moreUrl']) return $current;
            if ($revision >= 2147483646) throw new RuntimeException('视频版本号已达上限。');
            $document = array('schemaVersion' => 1, 'revision' => $revision + 1, 'videos' => $next['videos'], 'moreUrl' => $next['moreUrl']);
            $bytes = json_encode($document, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
            if ($bytes === false) throw new RuntimeException('视频数据编码失败。');
            $this->commit($before, $bytes."\n");
            return $document;
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    public static function decode($bytes) {
        $document = json_decode($bytes, true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($document)
            || !isset($document['schemaVersion'], $document['revision']) || $document['schemaVersion'] !== 1
            || !is_int($document['revision']) || $document['revision'] < 1 || $document['revision'] > 2147483646) {
            throw new RuntimeException('视频数据文件格式错误。');
        }
        try {
            $content = self::content($document);
        } catch (InvalidArgumentException $error) {
            throw new RuntimeException('视频数据文件内容无效。');
        }
        return array('schemaVersion' => 1, 'revision' => $document['revision'], 'videos' => $content['videos'], 'moreUrl' => $content['moreUrl']);
    }

    private static function content($content) {
        if (!is_array($content) || !isset($content['videos'], $content['moreUrl']) || !is_array($content['videos'])
            || array_values($content['videos']) !== $content['videos'] || count($content['videos']) > 30) {
            throw new InvalidArgumentException('视频列表格式无效，最多保存 30 项。');
        }
        $videos = array();
        foreach ($content['videos'] as $video) {
            if (!is_array($video) || !isset($video['title'], $video['url']) || !is_string($video['title'])) {
                throw new InvalidArgumentException('请填写视频标题和链接。');
            }
            $title = trim($video['title']);
            if (preg_match('/^.{1,80}$/us', $title) !== 1 || preg_match('/[\x00-\x1f\x7f]/u', $title) !== 0) {
                throw new InvalidArgumentException('视频标题须为 1–80 个字符，不能包含控制字符。');
            }
            $videos[] = array('title' => $title, 'url' => self::url($video['url'], false));
        }
        return array('videos' => $videos, 'moreUrl' => self::url($content['moreUrl'], true));
    }

    private static function url($value, $optional) {
        if (!is_string($value)) throw new InvalidArgumentException('视频链接无效。');
        $value = trim($value);
        if ($optional && $value === '') return '';
        $url = parse_url($value);
        if (strlen($value) > 2048 || !filter_var($value, FILTER_VALIDATE_URL) || !$url
            || !isset($url['scheme'], $url['host']) || !in_array(strtolower($url['scheme']), array('http', 'https'), true)
            || isset($url['user']) || isset($url['pass']) || preg_match('/[\x00-\x20\x7f]/', $value)) {
            throw new InvalidArgumentException('视频链接须为完整的 HTTP 或 HTTPS 地址。');
        }
        return $value;
    }

    private function readBytes($path) {
        $bytes = @file_get_contents($path, false, null, 0, 262145);
        if ($bytes === false || strlen($bytes) > 262144) throw new RuntimeException('无法读取视频数据文件。');
        return $bytes;
    }

    private function commit($before, $after) {
        $backup = $this->path.'.backup';
        if (is_link($this->path) || is_link($backup)) throw new RuntimeException('视频数据文件不能是符号链接。');
        $staged = null;
        $backupStage = null;
        $rollback = null;
        $hadBackup = file_exists($backup);
        try {
            if ($hadBackup) $rollback = $this->stage($this->readBytes($backup));
            $staged = $this->stage($after);
            $backupStage = $this->stage($before);
            if (!@rename($backupStage, $backup)) throw new RuntimeException('视频备份保存失败。');
            $backupStage = null;
            if (!@rename($staged, $this->path)) {
                $restored = $hadBackup ? @rename($rollback, $backup) : @unlink($backup);
                if ($restored) $rollback = null;
                throw new RuntimeException('视频保存失败，原数据未改动。');
            }
            $staged = null;
        } finally {
            foreach (array($staged, $backupStage, $rollback) as $temporary) {
                if ($temporary !== null && is_file($temporary)) @unlink($temporary);
            }
        }
    }

    private function stage($bytes) {
        $temporary = @tempnam(dirname($this->path), '.home-videos-');
        if ($temporary === false) throw new RuntimeException('无法创建视频临时文件。');
        $complete = false;
        try {
            if (realpath(dirname($temporary)) !== realpath(dirname($this->path))) throw new RuntimeException('视频目录不可写。');
            if (@file_put_contents($temporary, $bytes) !== strlen($bytes) || !@chmod($temporary, 0600)) {
                throw new RuntimeException('视频文件写入失败。');
            }
            $complete = true;
            return $temporary;
        } finally {
            if (!$complete) @unlink($temporary);
        }
    }
}

function homepage_videos_origin_allowed() {
    // A non-simple request header blocks cross-site HTML form submissions, even without Origin.
    if (!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || $_SERVER['HTTP_X_REQUESTED_WITH'] !== 'XMLHttpRequest') return false;
    if (!isset($_SERVER['HTTP_ORIGIN'])) return true;
    $scheme = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http';
    $origin = parse_url($_SERVER['HTTP_ORIGIN']);
    $target = parse_url($scheme.'://'.(isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : ''));
    if (!$origin || !$target || !isset($origin['scheme'], $origin['host'], $target['host'])) return false;
    $originPort = isset($origin['port']) ? $origin['port'] : ($origin['scheme'] === 'https' ? 443 : 80);
    $targetPort = isset($target['port']) ? $target['port'] : ($scheme === 'https' ? 443 : 80);
    return $origin['scheme'] === $scheme && strtolower($origin['host']) === strtolower($target['host']) && $originPort === $targetPort;
}

function homepage_videos_response($ask, $params) {
    header('Cache-Control: no-store');
    try {
        $store = new HomepageVideosStore();
        if ($ask === 'homepage_videos') return ApiResponse::success($store->read());
        if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
            return ApiResponse::error(ApiError::BAD_REQUEST, '保存操作必须使用 POST。');
        }
        if (!homepage_videos_origin_allowed()) return ApiResponse::error(ApiError::FORBIDDEN, '不允许跨站修改视频。');
        if (!isset($_COOKIE['token']) || !is_string($_COOKIE['token'])
            || preg_match('/^[a-z0-9_-]{1,256}$/iD', $_COOKIE['token']) !== 1) return ApiResponse::error(ApiError::NOT_LOGGED_IN);
        $identity = checkuser_con(dbconnect_mysqli());
        if ($identity[0] === '') return ApiResponse::error(ApiError::NOT_LOGGED_IN);
        if ((int)$identity[1] < 3) return ApiResponse::error(ApiError::RIGHTS_INSUFFICIENT);
        $revision = isset($params['revision']) ? filter_var($params['revision'], FILTER_VALIDATE_INT) : false;
        $json = isset($params['document']) && is_string($params['document']) ? $params['document'] : '';
        if ($revision === false || strlen($json) > 262144) throw new InvalidArgumentException('视频版本或列表无效。');
        $content = json_decode($json, true);
        if (json_last_error() !== JSON_ERROR_NONE) throw new InvalidArgumentException('视频列表 JSON 无效。');
        return ApiResponse::success($store->save($revision, $content));
    } catch (HomepageVideosConflict $error) {
        return ApiResponse::error(ApiError::ALREADY_EXISTS, $error->getMessage());
    } catch (InvalidArgumentException $error) {
        return ApiResponse::error(ApiError::VALIDATION_ERROR, $error->getMessage());
    } catch (Exception $error) {
        return ApiResponse::error(ApiError::INTERNAL_ERROR, '视频数据暂不可用，请联系管理员检查文件和目录权限。');
    } catch (Throwable $error) {
        return ApiResponse::error(ApiError::INTERNAL_ERROR, '视频数据暂不可用，请联系管理员检查文件和目录权限。');
    }
}
