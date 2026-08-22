<?php
/**
 * Archive room filesystem and metadata service.
 *
 * The HTTP entry point stays deliberately small. This service owns the
 * relative-path checks, directory-tree rules, filesystem mutations, and
 * download logging so the same rules can later be reused by server scripts.
 */

class ArchiveServiceException extends Exception
{
    public $apiCode;

    public function __construct($apiCode, $message)
    {
        $this->apiCode = $apiCode;
        parent::__construct($message, intval($apiCode));
    }
}

class ArchiveService
{
    private $con;
    private $userid;
    private $username;
    private $rights;
    private $root;
    private $idSecret;
    private $maxBytes;

    public function __construct($con, $userid, $username, $rights)
    {
        $this->con = $con;
        $this->userid = intval($userid);
        $this->username = strval($username);
        $this->rights = intval($rights);

        if (!defined('CAPUBBS_ARCHIVE_ROOT') || trim(CAPUBBS_ARCHIVE_ROOT) === '') {
            $this->fail(ApiError::SERVICE_UNAVAILABLE, '档案室存储路径尚未配置。');
        }
        $root = realpath(CAPUBBS_ARCHIVE_ROOT);
        if ($root === false || !is_dir($root)) {
            $this->fail(ApiError::SERVICE_UNAVAILABLE, '档案室存储目录不可用。');
        }
        $this->root = rtrim(str_replace('\\', '/', $root), '/');

        $this->idSecret = defined('CAPUBBS_ARCHIVE_ID_SECRET')
            ? strval(CAPUBBS_ARCHIVE_ID_SECRET)
            : '';
        if ($this->idSecret === '') {
            $this->fail(ApiError::SERVICE_UNAVAILABLE, '档案室 ID 密钥尚未配置。');
        }
        $this->maxBytes = defined('CAPUBBS_ARCHIVE_MAX_BYTES')
            ? intval(CAPUBBS_ARCHIVE_MAX_BYTES)
            : 500 * 1024 * 1024;
        if ($this->maxBytes <= 0) {
            $this->fail(ApiError::SERVICE_UNAVAILABLE, '档案室上传大小限制配置不合法。');
        }
    }

    public function listEntries($parentKey)
    {
        $parent = $this->getParent($parentKey);
        $where = $parent === null
            ? 'parent_key IS NULL'
            : "parent_key=" . $this->sql($parent['entry_key']);
        $result = $this->query(
            "SELECT archive_entries.*, "
            . "(SELECT COUNT(*) FROM archive_downloads ad "
            . "WHERE ad.entry_key=archive_entries.entry_key AND ad.status='completed') AS download_count "
            . "FROM archive_entries WHERE {$where} "
            . "AND masked_at IS NULL AND purged_at IS NULL "
            . "ORDER BY (entry_type='folder') DESC, name ASC"
        );

        $entries = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $item = $this->publicEntry($row);
            if ($row['entry_type'] === 'folder') {
                $item['items'] = $this->countVisibleChildren($row['entry_key']);
            }
            $entries[] = $item;
        }

        return array(
            'entries' => $entries,
            'breadcrumbs' => $this->breadcrumbs($parent),
            'can_manage' => $this->rights > 2,
        );
    }

    public function createFolder($parentKey, $name)
    {
        $this->requireManager();
        $parent = $this->getParent($parentKey);
        $name = $this->normalizeName($name);
        $relativePath = $this->joinPath($parent ? $parent['relative_path'] : '', $name);
        $this->ensureAvailableName($parent, $name);
        $absolutePath = $this->safePath($relativePath, false);
        if (file_exists($absolutePath) || is_link($absolutePath)) {
            $this->fail(ApiError::ALREADY_EXISTS, '目标文件夹已经存在。');
        }
        if (!mkdir($absolutePath, 0755, false)) {
            $this->fail(ApiError::INTERNAL_ERROR, '无法创建档案室文件夹。');
        }

        $now = $this->nowMicros();
        $entryKey = $this->uniqueKey($now . ':' . $this->randomHex(16));
        try {
            $this->insertEntry(array(
                'entry_key' => $entryKey,
                'parent_key' => $parent ? $parent['entry_key'] : null,
                'entry_type' => 'folder',
                'name' => $name,
                'relative_path' => $relativePath,
                'mime_type' => null,
                'byte_size' => 0,
                'content_hash' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ));
        } catch (Exception $error) {
            @rmdir($absolutePath);
            throw $error;
        }

        return $this->publicEntry($this->getEntry($entryKey));
    }

    public function upload($parentKey, $name, $file)
    {
        $this->requireManager();
        if (!is_array($file) || !isset($file['error'], $file['tmp_name'])) {
            $contentLength = isset($_SERVER['CONTENT_LENGTH']) ? intval($_SERVER['CONTENT_LENGTH']) : 0;
            if ($contentLength > $this->maxBytes + 1024 * 1024) {
                $this->fail(ApiError::FILE_TOO_LARGE, $this->tooLargeMessage());
            }
            $this->fail(ApiError::MISSING_FIELD, '未收到上传文件。');
        }
        if (in_array(intval($file['error']), array(UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE), true)) {
            $this->fail(ApiError::FILE_TOO_LARGE, $this->tooLargeMessage());
        }
        if (intval($file['error']) !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
            $this->fail(ApiError::UPLOAD_FAILED, '上传文件未通过校验。');
        }
        $uploadedSize = isset($file['size']) ? intval($file['size']) : 0;
        if ($uploadedSize > $this->maxBytes) {
            $this->fail(ApiError::FILE_TOO_LARGE, $this->tooLargeMessage());
        }

        $parent = $this->getParent($parentKey);
        $name = trim(strval($name));
        if ($name === '' && isset($file['name'])) {
            $name = strval($file['name']);
        }
        $name = $this->normalizeName($name);
        $this->ensureAvailableName($parent, $name);

        $relativePath = $this->joinPath($parent ? $parent['relative_path'] : '', $name);
        $absolutePath = $this->safePath($relativePath, false);
        if (file_exists($absolutePath) || is_link($absolutePath)) {
            $this->fail(ApiError::ALREADY_EXISTS, '目标文件已经存在。');
        }
        $hash = @hash_file('sha256', $file['tmp_name']);
        if (!$hash) {
            $this->fail(ApiError::UPLOAD_FAILED, '无法计算上传文件校验值。');
        }
        $size = @filesize($file['tmp_name']);
        if ($size === false) {
            $this->fail(ApiError::UPLOAD_FAILED, '无法读取上传文件大小。');
        }
        if ($size > $this->maxBytes) {
            $this->fail(ApiError::FILE_TOO_LARGE, $this->tooLargeMessage());
        }
        $mimeType = $this->detectMimeType($file['tmp_name']);
        $now = $this->nowMicros();
        $entryKey = $this->uniqueKey($now . ':' . $hash);

        if (!move_uploaded_file($file['tmp_name'], $absolutePath)) {
            $this->fail(ApiError::UPLOAD_FAILED, '无法保存上传文件。');
        }
        try {
            $this->insertEntry(array(
                'entry_key' => $entryKey,
                'parent_key' => $parent ? $parent['entry_key'] : null,
                'entry_type' => 'file',
                'name' => $name,
                'relative_path' => $relativePath,
                'mime_type' => $mimeType,
                'byte_size' => intval($size),
                'content_hash' => $hash,
                'created_at' => $now,
                'updated_at' => $now,
            ));
        } catch (Exception $error) {
            @unlink($absolutePath);
            throw $error;
        }

        return $this->publicEntry($this->getEntry($entryKey));
    }

    public function renameEntry($entryKey, $name)
    {
        $this->requireManager();
        $entry = $this->getEntry($entryKey);
        $this->ensureActive($entry);
        $name = $this->normalizeName($name);
        if ($name === $entry['name']) {
            return $this->publicEntry($entry);
        }
        $parent = $this->getParent($entry['parent_key']);
        $this->ensureAvailableName($parent, $name, $entry['entry_key']);
        $oldRelative = $entry['relative_path'];
        $newRelative = $this->joinPath($parent ? $parent['relative_path'] : '', $name);
        $oldAbsolute = $this->safePath($oldRelative, true);
        $newAbsolute = $this->safePath($newRelative, false);
        if (file_exists($newAbsolute) || is_link($newAbsolute)) {
            $this->fail(ApiError::ALREADY_EXISTS, '目标名称已经存在。');
        }
        return $this->renameTree($entry, $oldRelative, $newRelative, $oldAbsolute, $newAbsolute, $name, null, false);
    }

    public function moveEntry($entryKey, $targetParentKey)
    {
        $this->requireManager();
        $entry = $this->getEntry($entryKey);
        $this->ensureActive($entry);
        $targetParent = $this->getParent($targetParentKey);
        if ($targetParent !== null && $targetParent['entry_key'] === $entry['entry_key']) {
            $this->fail(ApiError::VALIDATION_ERROR, '不能将项目移动到自身内部。');
        }
        if ($targetParent !== null && $entry['entry_type'] === 'folder') {
            $this->ensureNotDescendant($targetParent['entry_key'], $entry['entry_key']);
        }
        $currentParentKey = $entry['parent_key'] === null ? null : $entry['parent_key'];
        $targetKey = $targetParent ? $targetParent['entry_key'] : null;
        if ($currentParentKey === $targetKey) {
            return $this->publicEntry($entry);
        }
        $this->ensureAvailableName($targetParent, $entry['name'], $entry['entry_key']);
        $oldRelative = $entry['relative_path'];
        $newRelative = $this->joinPath($targetParent ? $targetParent['relative_path'] : '', $entry['name']);
        $oldAbsolute = $this->safePath($oldRelative, true);
        $newAbsolute = $this->safePath($newRelative, false);
        if (file_exists($newAbsolute) || is_link($newAbsolute)) {
            $this->fail(ApiError::ALREADY_EXISTS, '目标目录中已经存在同名项目。');
        }
        return $this->renameTree($entry, $oldRelative, $newRelative, $oldAbsolute, $newAbsolute, null, $targetKey, true);
    }

    public function maskEntry($entryKey)
    {
        $this->requireManager();
        $entry = $this->getEntry($entryKey);
        $this->ensureActive($entry);
        $now = $this->nowMicros();
        $sql = "UPDATE archive_entries SET masked_at={$now}, "
            . "masked_by_userid={$this->userid}, "
            . "masked_by_username={$this->sql($this->username)}, updated_at={$now} "
            . "WHERE entry_key={$this->sql($entry['entry_key'])}";
        $this->query($sql);
        return array('entry_key' => $entry['entry_key'], 'masked_at' => $now);
    }

    public function streamDownload($entryKey, $ip, $userAgent)
    {
        $entry = $this->getEntry($entryKey);
        $this->ensureActive($entry);
        if ($entry['entry_type'] !== 'file') {
            $this->fail(ApiError::VALIDATION_ERROR, '文件夹不能直接下载。');
        }
        $absolutePath = $this->safePath($entry['relative_path'], true);
        if (!is_file($absolutePath) || !is_readable($absolutePath)) {
            $this->fail(ApiError::NOT_FOUND, '文件不存在。');
        }

        $now = $this->nowMicros();
        $this->query(
            "INSERT INTO archive_downloads "
            . "(entry_key,userid,username,downloaded_at,ip,user_agent,byte_size,status) VALUES ("
            . $this->sql($entry['entry_key']) . ",{$this->userid},"
            . $this->sql($this->username) . ",{$now},"
            . $this->sql(substr(strval($ip), 0, 60)) . ","
            . $this->sql(substr(strval($userAgent), 0, 512)) . ","
            . intval($entry['byte_size']) . ",'started')"
        );
        $downloadId = mysqli_insert_id($this->con);

        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        $mime = $entry['mime_type'] ? $entry['mime_type'] : 'application/octet-stream';
        $fallbackName = preg_replace('/[^A-Za-z0-9._-]/', '_', $entry['name']);
        if ($fallbackName === '') $fallbackName = 'download';
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . intval($entry['byte_size']));
        header('Content-Disposition: attachment; filename="' . $fallbackName . '"; filename*=UTF-8\'\'' . rawurlencode($entry['name']));
        header('X-Content-Type-Options: nosniff');
        $bytes = @readfile($absolutePath);
        if ($bytes !== false) {
            $this->query("UPDATE archive_downloads SET status='completed' WHERE download_id=" . intval($downloadId));
        }
        exit;
    }

    public function downloadStats($entryKey, $limit)
    {
        $this->requireManager();
        $entryKey = $this->validateKey($entryKey);
        $limit = max(1, min(100, intval($limit)));
        $where = "entry_key={$this->sql($entryKey)}";
        $total = mysqli_fetch_assoc($this->query("SELECT COUNT(*) AS total FROM archive_downloads WHERE {$where}"));
        $result = $this->query(
            "SELECT entry_key,userid,username,downloaded_at,ip,user_agent,byte_size,status "
            . "FROM archive_downloads WHERE {$where} ORDER BY downloaded_at DESC LIMIT {$limit}"
        );
        $records = array();
        while ($row = mysqli_fetch_assoc($result)) $records[] = $row;
        return array('total' => intval($total['total']), 'records' => $records);
    }

    private function renameTree($entry, $oldRelative, $newRelative, $oldAbsolute, $newAbsolute, $newName, $newParentKey, $updateParent)
    {
        if (!@rename($oldAbsolute, $newAbsolute)) {
            $this->fail(ApiError::ACTION_FAILED, '无法移动档案项。');
        }
        $now = $this->nowMicros();
        try {
            $this->con->begin_transaction();
            $rows = $this->pathRows($oldRelative);
            foreach ($rows as $row) {
                $suffix = substr($row['relative_path'], strlen($oldRelative));
                $nextPath = $newRelative . $suffix;
                $this->query(
                    "UPDATE archive_entries SET relative_path={$this->sql($nextPath)}, "
                    . "updated_at={$now} WHERE entry_key={$this->sql($row['entry_key'])}"
                );
            }
            $updates = array("updated_at={$now}");
            if ($newName !== null) $updates[] = "name={$this->sql($newName)}";
            if ($updateParent) {
                $updates[] = $newParentKey === null
                    ? 'parent_key=NULL'
                    : "parent_key={$this->sql($newParentKey)}";
            }
            $this->query(
                "UPDATE archive_entries SET " . implode(',', $updates)
                . " WHERE entry_key={$this->sql($entry['entry_key'])}"
            );
            $this->con->commit();
        } catch (Exception $error) {
            $this->con->rollback();
            @rename($newAbsolute, $oldAbsolute);
            throw $error;
        }
        return $this->publicEntry($this->getEntry($entry['entry_key']));
    }

    private function pathRows($oldRelative)
    {
        $escaped = $this->sql($oldRelative);
        $prefix = $this->sql($oldRelative . '/');
        $result = $this->query(
            "SELECT entry_key,relative_path FROM archive_entries WHERE relative_path={$escaped} "
            . "OR LEFT(relative_path,LENGTH({$prefix}))={$prefix}"
        );
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) $rows[] = $row;
        return $rows;
    }

    private function getParent($parentKey)
    {
        if ($parentKey === null || trim(strval($parentKey)) === '') return null;
        $parent = $this->getEntry($parentKey);
        $this->ensureActive($parent);
        if ($parent['entry_type'] !== 'folder') {
            $this->fail(ApiError::VALIDATION_ERROR, '目标父级不是文件夹。');
        }
        return $parent;
    }

    private function getEntry($entryKey)
    {
        $entryKey = $this->validateKey($entryKey);
        $result = $this->query("SELECT * FROM archive_entries WHERE entry_key={$this->sql($entryKey)} LIMIT 1");
        $row = mysqli_fetch_assoc($result);
        if (!$row) $this->fail(ApiError::NOT_FOUND, '档案项不存在。');
        return $row;
    }

    private function ensureActive($entry)
    {
        if ($entry['masked_at'] !== null || $entry['purged_at'] !== null) {
            $this->fail(ApiError::NOT_FOUND, '档案项不存在。');
        }
        $seen = array();
        $parentKey = $entry['parent_key'];
        while ($parentKey !== null && $parentKey !== '') {
            if (isset($seen[$parentKey])) $this->fail(ApiError::INTERNAL_ERROR, '档案目录存在循环引用。');
            $seen[$parentKey] = true;
            $parent = $this->getEntry($parentKey);
            if ($parent['masked_at'] !== null || $parent['purged_at'] !== null) {
                $this->fail(ApiError::NOT_FOUND, '档案项不存在。');
            }
            $parentKey = $parent['parent_key'];
        }
    }

    private function ensureNotDescendant($candidateKey, $ancestorKey)
    {
        $seen = array();
        $current = $this->getEntry($candidateKey);
        while ($current['parent_key'] !== null && $current['parent_key'] !== '') {
            if ($current['parent_key'] === $ancestorKey) {
                $this->fail(ApiError::VALIDATION_ERROR, '不能将文件夹移动到自己的子目录。');
            }
            if (isset($seen[$current['parent_key']])) {
                $this->fail(ApiError::INTERNAL_ERROR, '档案目录存在循环引用。');
            }
            $seen[$current['parent_key']] = true;
            $current = $this->getEntry($current['parent_key']);
        }
    }

    private function ensureAvailableName($parent, $name, $excludeKey = null)
    {
        $where = $parent === null ? 'parent_key IS NULL' : "parent_key={$this->sql($parent['entry_key'])}";
        $where .= " AND name={$this->sql($name)} AND purged_at IS NULL";
        if ($excludeKey !== null) $where .= " AND entry_key<>" . $this->sql($excludeKey);
        $result = $this->query("SELECT entry_key FROM archive_entries WHERE {$where} LIMIT 1");
        if (mysqli_fetch_assoc($result)) {
            $this->fail(ApiError::ALREADY_EXISTS, '目标目录中已经存在同名项目。');
        }
    }

    private function insertEntry($entry)
    {
        $columns = array('entry_key','parent_key','entry_type','name','relative_path','mime_type','byte_size','content_hash','created_at','updated_at','uploader_userid','uploader_username');
        $values = array(
            $this->sql($entry['entry_key']),
            $entry['parent_key'] === null ? 'NULL' : $this->sql($entry['parent_key']),
            $this->sql($entry['entry_type']),
            $this->sql($entry['name']),
            $this->sql($entry['relative_path']),
            $entry['mime_type'] === null ? 'NULL' : $this->sql($entry['mime_type']),
            intval($entry['byte_size']),
            $entry['content_hash'] === null ? 'NULL' : $this->sql($entry['content_hash']),
            intval($entry['created_at']),
            intval($entry['updated_at']),
            $this->userid,
            $this->sql($this->username),
        );
        $this->query("INSERT INTO archive_entries (" . implode(',', $columns) . ") VALUES (" . implode(',', $values) . ")");
    }

    private function publicEntry($row)
    {
        return array(
            'entry_key' => $row['entry_key'],
            'entry_type' => $row['entry_type'],
            'name' => $row['name'],
            'mime_type' => $row['mime_type'],
            'byte_size' => intval($row['byte_size']),
            'uploader' => $row['uploader_username'],
            'created_at' => intval($row['created_at']),
            'updated_at' => intval($row['updated_at']),
            'download_count' => intval(isset($row['download_count']) ? $row['download_count'] : 0),
        );
    }

    private function breadcrumbs($parent)
    {
        $items = array(array('entry_key' => null, 'name' => 'pan'));
        $stack = array();
        $current = $parent;
        while ($current !== null) {
            $stack[] = array('entry_key' => $current['entry_key'], 'name' => $current['name']);
            $current = $current['parent_key'] === null ? null : $this->getEntry($current['parent_key']);
        }
        for ($i = count($stack) - 1; $i >= 0; $i--) $items[] = $stack[$i];
        return $items;
    }

    private function countVisibleChildren($parentKey)
    {
        $result = $this->query(
            "SELECT COUNT(*) AS total FROM archive_entries WHERE parent_key={$this->sql($parentKey)} "
            . "AND masked_at IS NULL AND purged_at IS NULL"
        );
        $row = mysqli_fetch_assoc($result);
        return intval($row['total']);
    }

    private function safePath($relativePath, $mustExist)
    {
        $relativePath = strval($relativePath);
        if ($relativePath === '' || $relativePath[0] === '/' || strpos($relativePath, '\\') !== false
            || preg_match('#(^|/)\.\.?($|/)#', $relativePath)) {
            $this->fail(ApiError::INVALID_CHARACTERS, '档案路径不合法。');
        }
        $candidate = $this->root . '/' . $relativePath;
        $parent = realpath(dirname($candidate));
        if ($parent === false || !$this->insideRoot($parent)) {
            $this->fail(ApiError::FORBIDDEN, '档案路径超出存储根目录。');
        }
        if ($mustExist) {
            $resolved = realpath($candidate);
            if ($resolved === false || !$this->insideRoot($resolved) || is_link($candidate)) {
                $this->fail(ApiError::NOT_FOUND, '档案文件不存在。');
            }
            return $resolved;
        }
        return $candidate;
    }

    private function insideRoot($path)
    {
        $path = rtrim(str_replace('\\', '/', $path), '/');
        return $path === $this->root || strpos($path, $this->root . '/') === 0;
    }

    private function normalizeName($name)
    {
        $name = trim(strval($name));
        if ($name === '' || $name === '.' || $name === '..' || strlen($name) > 255
            || strpos($name, '/') !== false || strpos($name, '\\') !== false
            || preg_match('/[\x00-\x1F\x7F]/', $name)) {
            $this->fail(ApiError::INVALID_CHARACTERS, '文件名不合法。');
        }
        return $name;
    }

    private function joinPath($parent, $name)
    {
        return $parent === '' ? $name : rtrim($parent, '/') . '/' . $name;
    }

    private function validateKey($key)
    {
        $key = strtolower(trim(strval($key)));
        if (!preg_match('/^[a-f0-9]{64}$/', $key)) {
            $this->fail(ApiError::VALIDATION_ERROR, '档案项 ID 不合法。');
        }
        return $key;
    }

    private function uniqueKey($seed)
    {
        $key = hash_hmac('sha256', $seed, $this->idSecret);
        $suffix = 0;
        while (true) {
            $result = $this->query("SELECT entry_key FROM archive_entries WHERE entry_key={$this->sql($key)} LIMIT 1");
            if (!mysqli_fetch_assoc($result)) return $key;
            $suffix++;
            $key = hash_hmac('sha256', $seed . ':' . $suffix, $this->idSecret);
        }
    }

    private function randomHex($length)
    {
        if (function_exists('random_bytes')) return bin2hex(random_bytes($length));
        return sha1(uniqid('', true) . mt_rand());
    }

    private function detectMimeType($path)
    {
        if (function_exists('finfo_open')) {
            $info = finfo_open(FILEINFO_MIME_TYPE);
            if ($info) {
                $mime = finfo_file($info, $path);
                finfo_close($info);
                if ($mime) return substr($mime, 0, 255);
            }
        }
        return 'application/octet-stream';
    }

    private function tooLargeMessage()
    {
        return '文件超过 500 MB，请压缩或拆分后再上传。';
    }

    private function requireManager()
    {
        if ($this->rights <= 2) $this->fail(ApiError::RIGHTS_INSUFFICIENT, '权限不足。');
    }

    private function nowMicros()
    {
        return intval(round(microtime(true) * 1000000));
    }

    private function sql($value)
    {
        return "'" . mysqli_real_escape_string($this->con, strval($value)) . "'";
    }

    private function query($sql)
    {
        $result = mysqli_query($this->con, $sql);
        if ($result === false) $this->fail(ApiError::DATABASE_ERROR, '档案室数据库操作失败。');
        return $result;
    }

    private function fail($code, $message)
    {
        throw new ArchiveServiceException($code, $message);
    }
}
