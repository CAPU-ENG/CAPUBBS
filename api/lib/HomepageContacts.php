<?php
/** Plain-text homepage contacts, stored independently of the forum database. */
class HomepageContactsConflict extends RuntimeException {}

class HomepageContactsStore {
    private $path;
    private $seed;

    public function __construct($path = null, $seed = null) {
        $this->path = $path === null ? __DIR__.'/../../index/data/contacts.json' : $path;
        $this->seed = $seed === null ? __DIR__.'/../../index/data/contacts.default.json' : $seed;
    }

    public function read() {
        // Atomic replacements let public readers work without write access.
        return self::decode($this->readBytes(file_exists($this->path) ? $this->path : $this->seed));
    }

    public function save($revision, $text) {
        $next = self::text($text);
        if (!is_int($revision) || $revision < 1 || $revision > 2147483646) {
            throw new InvalidArgumentException('联系方式版本无效，请重新加载后重试。');
        }
        $lock = @fopen($this->path.'.lock', 'c');
        if ($lock === false) throw new RuntimeException('联系方式目录不可写。');
        try {
            if (!flock($lock, LOCK_EX)) throw new RuntimeException('联系方式文件繁忙。');
            $before = $this->readBytes(file_exists($this->path) ? $this->path : $this->seed);
            $current = self::decode($before);
            if ($revision !== $current['revision']) throw new HomepageContactsConflict('联系方式已被其他人更新，请保留修改并重新加载后编辑。');
            if ($next === $current['text']) return $current;
            if ($revision >= 2147483646) throw new RuntimeException('联系方式版本号已达上限。');
            $document = array('schemaVersion' => 1, 'revision' => $revision + 1, 'text' => $next);
            $bytes = json_encode($document, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
            if ($bytes === false) throw new RuntimeException('联系方式编码失败。');
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
            || !isset($document['schemaVersion'], $document['revision'], $document['text']) || $document['schemaVersion'] !== 1
            || !is_int($document['revision']) || $document['revision'] < 1 || $document['revision'] > 2147483646) {
            throw new RuntimeException('联系方式数据文件格式错误。');
        }
        try {
            $text = self::text($document['text']);
        } catch (InvalidArgumentException $error) {
            throw new RuntimeException('联系方式数据文件内容无效。');
        }
        return array('schemaVersion' => 1, 'revision' => $document['revision'], 'text' => $text);
    }

    private static function text($value) {
        if (!is_string($value) || strlen($value) > 20000
            || preg_match('/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/u', $value) !== 0) {
            throw new InvalidArgumentException('联系方式须为有效的纯文本，不能包含控制字符。');
        }
        $value = trim(str_replace(array("\r\n", "\r"), "\n", $value));
        if (preg_match('/\A.{1,5000}\z/us', $value) !== 1) {
            throw new InvalidArgumentException('联系方式须为 1–5000 个字符。');
        }
        return $value;
    }

    private function readBytes($path) {
        $bytes = @file_get_contents($path, false, null, 0, 65537);
        if ($bytes === false || strlen($bytes) > 65536) throw new RuntimeException('无法读取联系方式文件。');
        return $bytes;
    }

    private function commit($before, $after) {
        $backup = $this->path.'.backup';
        if (is_link($this->path) || is_link($backup)) throw new RuntimeException('联系方式文件不能是符号链接。');
        $staged = null;
        $backupStage = null;
        $rollback = null;
        $hadBackup = file_exists($backup);
        try {
            if ($hadBackup) $rollback = $this->stage($this->readBytes($backup));
            $staged = $this->stage($after);
            $backupStage = $this->stage($before);
            if (!@rename($backupStage, $backup)) throw new RuntimeException('联系方式备份保存失败。');
            $backupStage = null;
            if (!@rename($staged, $this->path)) {
                $restored = $hadBackup ? @rename($rollback, $backup) : @unlink($backup);
                if ($restored) $rollback = null;
                throw new RuntimeException('联系方式保存失败，原数据未改动。');
            }
            $staged = null;
        } finally {
            foreach (array($staged, $backupStage, $rollback) as $temporary) {
                if ($temporary !== null && is_file($temporary)) @unlink($temporary);
            }
        }
    }

    private function stage($bytes) {
        $temporary = @tempnam(dirname($this->path), '.home-contacts-');
        if ($temporary === false) throw new RuntimeException('无法创建联系方式临时文件。');
        $complete = false;
        try {
            if (realpath(dirname($temporary)) !== realpath(dirname($this->path))) throw new RuntimeException('联系方式目录不可写。');
            if (@file_put_contents($temporary, $bytes) !== strlen($bytes) || !@chmod($temporary, 0600)) {
                throw new RuntimeException('联系方式文件写入失败。');
            }
            $complete = true;
            return $temporary;
        } finally {
            if (!$complete) @unlink($temporary);
        }
    }
}

function homepage_contacts_origin_allowed() {
    // Reject cross-site form submissions, including those without an Origin header.
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

function homepage_contacts_response($ask, $params) {
    header('Cache-Control: no-store');
    try {
        $store = new HomepageContactsStore();
        if ($ask === 'homepage_contacts') return ApiResponse::success($store->read());
        if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
            return ApiResponse::error(ApiError::BAD_REQUEST, '保存操作必须使用 POST。');
        }
        if (!homepage_contacts_origin_allowed()) return ApiResponse::error(ApiError::FORBIDDEN, '不允许跨站修改联系方式。');
        if (!isset($_COOKIE['token']) || !is_string($_COOKIE['token'])
            || preg_match('/^[a-z0-9_-]{1,256}$/iD', $_COOKIE['token']) !== 1) return ApiResponse::error(ApiError::NOT_LOGGED_IN);
        $identity = checkuser_con(dbconnect_mysqli());
        if ($identity[0] === '') return ApiResponse::error(ApiError::NOT_LOGGED_IN);
        if ((int)$identity[1] < 3) return ApiResponse::error(ApiError::RIGHTS_INSUFFICIENT);
        $revision = isset($params['revision']) ? filter_var($params['revision'], FILTER_VALIDATE_INT) : false;
        if ($revision === false) throw new InvalidArgumentException('联系方式版本无效，请重新加载后重试。');
        $text = isset($params['text']) ? $params['text'] : null;
        return ApiResponse::success($store->save($revision, $text));
    } catch (HomepageContactsConflict $error) {
        return ApiResponse::error(ApiError::ALREADY_EXISTS, $error->getMessage());
    } catch (InvalidArgumentException $error) {
        return ApiResponse::error(ApiError::VALIDATION_ERROR, $error->getMessage());
    } catch (Exception $error) {
        return ApiResponse::error(ApiError::INTERNAL_ERROR, '联系方式暂不可用，请联系管理员检查文件和目录权限。');
    } catch (Throwable $error) {
        return ApiResponse::error(ApiError::INTERNAL_ERROR, '联系方式暂不可用，请联系管理员检查文件和目录权限。');
    }
}
