<?php
/** JSON-backed Yahou lineage. Authentication/rights are enforced by dispatch. */

class YahouLineageStore {
    private $path;
    private $backupPath;

    public function __construct($path = null) {
        $this->path = $path === null ? __DIR__.'/../../forum/data/yahou-lineage.json' : $path;
        $this->backupPath = substr($this->path, 0, -5).'.backup.json';
    }

    public function read() {
        $lock = $this->lock(LOCK_SH);
        try {
            return self::decode($this->readBytes($this->path));
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    public function mutate($revision, $mutation) {
        $lock = $this->lock(LOCK_EX);
        try {
            $before = $this->readBytes($this->path);
            $document = self::decode($before);
            if ($revision !== $document['revision']) {
                throw new InvalidArgumentException('谱系已被其他人更新，请刷新后重试。');
            }
            $next = self::apply($document, $mutation);
            if ($next === $document) return $document;
            if ($document['revision'] >= 9007199254740991) {
                throw new RuntimeException('谱系版本号已达上限。');
            }
            $next['revision'] = $document['revision'] + 1;
            self::validate($next);
            $encoded = json_encode($next, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
            if ($encoded === false) throw new RuntimeException('谱系编码失败。');
            $this->commit($before, $encoded."\n");
            return $next;
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    public static function decode($bytes) {
        $data = json_decode($bytes, true);
        if (json_last_error() !== JSON_ERROR_NONE) throw new RuntimeException('押后谱系 JSON 无法读取，请联系管理员。');
        self::validate($data);
        return $data;
    }

    public static function validate($data) {
        if (!is_array($data) || !isset($data['schemaVersion'], $data['revision'], $data['root'], $data['nodes'])
            || $data['schemaVersion'] !== 1 || $data['root'] !== '实践部'
            || !is_int($data['revision']) || $data['revision'] < 1 || $data['revision'] > 9007199254740991
            || !is_array($data['nodes']) || count($data['nodes']) > 20000
            || (!empty($data['nodes']) && array_keys($data['nodes']) !== range(0, count($data['nodes']) - 1))) {
            throw new RuntimeException('押后谱系数据格式错误。');
        }
        $members = array();
        $children = array();
        $queue = array();
        foreach ($data['nodes'] as $node) {
            if (!is_array($node) || !isset($node['id'], $node['status']) || !array_key_exists('parentId', $node)
                || !self::validId($node['id']) || !self::validStatus($node['status'])
                || ($node['parentId'] !== null && !self::validId($node['parentId']))
                || isset($members['#'.$node['id']])) {
                throw new RuntimeException('谱系中存在无效或重复的 ID。');
            }
            $members['#'.$node['id']] = $node;
            if ($node['parentId'] === null) {
                $queue[] = $node['id'];
            } else {
                $key = '#'.$node['parentId'];
                if (!isset($children[$key])) $children[$key] = array();
                $children[$key][] = $node['id'];
            }
        }
        foreach ($data['nodes'] as $node) {
            if ($node['parentId'] === null) continue;
            $key = '#'.$node['parentId'];
            if (!isset($members[$key])) throw new RuntimeException('谱系中存在找不到师傅的 ID。');
            if ($members[$key]['status'] !== 'qualified') throw new RuntimeException('已有后代的 ID 必须具备收徒资格。');
        }
        for ($i = 0; $i < count($queue); $i++) {
            $key = '#'.$queue[$i];
            if (isset($children[$key])) {
                foreach ($children[$key] as $child) $queue[] = $child;
            }
        }
        if (count($queue) !== count($members)) throw new RuntimeException('师徒关系存在循环。');
    }

    public static function validId($id) {
        return is_string($id) && $id !== '' && trim($id) === $id && strlen($id) <= 400
            && preg_match('/[\x00-\x1f\x7f]/u', $id) === 0;
    }

    private static function validStatus($status) {
        return in_array($status, array('pending', 'passed', 'qualified'), true);
    }

    private static function apply($data, $mutation) {
        if (!is_array($mutation) || !isset($mutation['action'], $mutation['id'], $mutation['status'])
            || !self::validId($mutation['id']) || !self::validStatus($mutation['status'])) {
            throw new InvalidArgumentException('ID 或押后状态无效。');
        }
        $positions = array();
        $hasChildren = array();
        foreach ($data['nodes'] as $position => $node) {
            $positions['#'.$node['id']] = $position;
            if ($node['parentId'] !== null) $hasChildren['#'.$node['parentId']] = true;
        }
        $key = '#'.$mutation['id'];
        if ($mutation['action'] === 'add') {
            if (isset($positions[$key])) throw new InvalidArgumentException('这个 ID 已在谱系中，不能重复添加或更换师傅。');
            if (count($data['nodes']) >= 20000) throw new InvalidArgumentException('谱系人数已达上限。');
            if (!array_key_exists('parentId', $mutation)) throw new InvalidArgumentException('请选择师傅。');
            $parentId = $mutation['parentId'];
            if ($parentId !== null) {
                if (!self::validId($parentId) || !isset($positions['#'.$parentId])) throw new InvalidArgumentException('师傅不在谱系中。');
                $parent = $data['nodes'][$positions['#'.$parentId]];
                if ($parent['status'] !== 'qualified') throw new InvalidArgumentException('师傅尚不具备收徒资格。');
            }
            $data['nodes'][] = array('id' => $mutation['id'], 'parentId' => $parentId, 'status' => $mutation['status']);
        } elseif ($mutation['action'] === 'status') {
            if (array_key_exists('parentId', $mutation)) throw new InvalidArgumentException('不允许更换师傅。');
            if (!isset($positions[$key])) throw new InvalidArgumentException('这个 ID 不在谱系中。');
            if (isset($hasChildren[$key]) && $mutation['status'] !== 'qualified') {
                throw new InvalidArgumentException('已有后代的 ID 必须保持收徒资格。');
            }
            $data['nodes'][$positions[$key]]['status'] = $mutation['status'];
        } else {
            throw new InvalidArgumentException('不支持此操作。');
        }
        return $data;
    }

    private function lock($mode) {
        $lock = @fopen(substr($this->path, 0, -5).'.lock', 'c');
        if ($lock === false) throw new RuntimeException('无法锁定谱系文件，请检查数据目录权限。');
        if (!flock($lock, $mode)) {
            fclose($lock);
            throw new RuntimeException('谱系文件繁忙，请重试。');
        }
        return $lock;
    }

    private function readBytes($path) {
        $bytes = @file_get_contents($path);
        if ($bytes === false || strlen($bytes) > 16777216) throw new RuntimeException('无法读取谱系文件，请联系管理员。');
        return $bytes;
    }

    /** Complete both staged writes before replacing either persistent file. */
    private function commit($before, $after) {
        if (is_link($this->path) || is_link($this->backupPath)) throw new RuntimeException('谱系文件不能是符号链接。');
        $currentStage = null;
        $backupStage = null;
        $rollbackStage = null;
        $backupExisted = file_exists($this->backupPath);
        try {
            // A failed main-file rename can restore the previous backup verbatim.
            if ($backupExisted) $rollbackStage = $this->stage($this->readBytes($this->backupPath));
            $currentStage = $this->stage($after);
            $backupStage = $this->stage($before);
            if (!@rename($backupStage, $this->backupPath)) throw new RuntimeException('备份保存失败，未更新谱系。');
            $backupStage = null;
            if (!@rename($currentStage, $this->path)) {
                $restored = $backupExisted ? @rename($rollbackStage, $this->backupPath) : @unlink($this->backupPath);
                if ($restored) $rollbackStage = null;
                throw new RuntimeException($restored ? '谱系保存失败，原数据已保留。' : '谱系保存失败，需管理员检查备份。');
            }
            $currentStage = null;
        } finally {
            foreach (array($currentStage, $backupStage, $rollbackStage) as $temporary) {
                if ($temporary !== null && is_file($temporary)) @unlink($temporary);
            }
        }
    }

    private function stage($bytes) {
        $directory = dirname($this->path);
        $temporary = @tempnam($directory, '.yahou-');
        if ($temporary === false) throw new RuntimeException('无法创建谱系临时文件。');
        if (realpath(dirname($temporary)) !== realpath($directory)) {
            @unlink($temporary);
            throw new RuntimeException('谱系数据目录不可写。');
        }
        $handle = @fopen($temporary, 'wb');
        if ($handle === false) {
            @unlink($temporary);
            throw new RuntimeException('无法写入谱系临时文件。');
        }
        try {
            $offset = 0;
            $length = strlen($bytes);
            while ($offset < $length) {
                $written = fwrite($handle, substr($bytes, $offset));
                if ($written === false || $written === 0) throw new RuntimeException('谱系文件写入不完整。');
                $offset += $written;
            }
            if (!fflush($handle) || (function_exists('fsync') && !fsync($handle))) throw new RuntimeException('谱系文件同步失败。');
            if (!@chmod($temporary, 0600)) throw new RuntimeException('无法设置谱系文件权限。');
        } catch (Throwable $error) {
            @unlink($temporary);
            throw $error;
        } finally {
            fclose($handle);
        }
        return $temporary;
    }
}

function jiekoufunc_yahou_lineage($con, $params) {
    header('Cache-Control: no-store');
    try {
        $store = new YahouLineageStore();
        return array(array('code' => '0', 'count' => '1'), $store->read());
    } catch (Throwable $error) {
        return array(array('code' => '4000', 'msg' => '押后谱系读取失败，请联系管理员检查数据文件。'));
    }
}

function jiekoufunc_yahou_lineage_add($con, $params) {
    return jiekoufunc_yahou_lineage_write($con, $params, 'add');
}

function jiekoufunc_yahou_lineage_status($con, $params) {
    return jiekoufunc_yahou_lineage_write($con, $params, 'status');
}

function jiekoufunc_yahou_lineage_write($con, $params, $action) {
    header('Cache-Control: no-store');
    if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
        return array(array('code' => '3000', 'msg' => '保存操作必须使用 POST。'));
    }
    if (!yahou_lineage_origin_allowed()) return array(array('code' => '5', 'msg' => '不允许跨站修改谱系。'));
    try {
        $revision = isset($params['revision']) ? filter_var($params['revision'], FILTER_VALIDATE_INT) : false;
        $id = isset($params['id']) && is_string($params['id']) ? trim($params['id']) : '';
        if ($revision === false || $revision < 1 || !YahouLineageStore::validId($id)) {
            throw new InvalidArgumentException('缺少有效的 ID 或谱系版本。');
        }
        $mutation = array('action' => $action, 'id' => $id, 'status' => isset($params['status']) ? $params['status'] : null);
        if ($action === 'add') {
            if (!isset($params['parent_id']) || !is_string($params['parent_id'])) throw new InvalidArgumentException('请选择师傅。');
            $mutation['parentId'] = $params['parent_id'] === '' ? null : $params['parent_id'];
            $statement = mysqli_prepare($con, 'SELECT username FROM userinfo WHERE username=? LIMIT 1');
            if (!$statement) throw new RuntimeException('无法验证会员 ID。');
            try {
                mysqli_stmt_bind_param($statement, 's', $id);
                if (!mysqli_stmt_execute($statement)) throw new RuntimeException('无法验证会员 ID。');
                mysqli_stmt_bind_result($statement, $canonicalId);
                if (!mysqli_stmt_fetch($statement)) throw new InvalidArgumentException('用户 ID 不存在。');
                // Preserve the canonical spelling and prevent case-variant duplicates.
                $mutation['id'] = $canonicalId;
            } finally {
                mysqli_stmt_close($statement);
            }
        } elseif (array_key_exists('parent_id', $params) || array_key_exists('parentId', $params)) {
            throw new InvalidArgumentException('不允许更换师傅。');
        }
        $store = new YahouLineageStore();
        return array(array('code' => '0', 'count' => '1'), $store->mutate($revision, $mutation));
    } catch (InvalidArgumentException $error) {
        return array(array('code' => '2100', 'msg' => $error->getMessage()));
    } catch (Throwable $error) {
        return array(array('code' => '4000', 'msg' => '谱系保存失败，请联系管理员检查数据和目录权限。'));
    }
}

function yahou_lineage_origin_allowed() {
    if (!isset($_SERVER['HTTP_ORIGIN'])) return true;
    $origin = parse_url($_SERVER['HTTP_ORIGIN']);
    $scheme = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http';
    $target = parse_url($scheme.'://'.(isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : ''));
    if (!$origin || !$target || !isset($origin['scheme'], $origin['host'], $target['host'])) return false;
    if (!in_array($origin['scheme'], array('http', 'https'), true)) return false;
    if (PHP_SAPI === 'cli-server' && in_array($origin['host'], array('localhost', '127.0.0.1'), true)
        && in_array($target['host'], array('localhost', '127.0.0.1'), true)) return true;
    $originPort = isset($origin['port']) ? $origin['port'] : ($origin['scheme'] === 'https' ? 443 : 80);
    $targetPort = isset($target['port']) ? $target['port'] : ($scheme === 'https' ? 443 : 80);
    return strtolower($origin['host']) === strtolower($target['host']) && $originPort === $targetPort && $origin['scheme'] === $scheme;
}
