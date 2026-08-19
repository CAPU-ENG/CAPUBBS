#!/usr/bin/env php
<?php
/**
 * Import archived CAPUBBS thread JSON into the schema defined by capubbs.sql.
 *
 * The default mode is read-only validation. Pass --apply to write data.
 * Existing rows are never overwritten: identical rows are skipped, source
 * changes are reported as preserved differences, and only identity-key
 * collisions are treated as conflicts.
 */

declare(strict_types=1);

const IMPORT_TABLE_COLUMNS = [
    'boardinfo' => ['bid', 'name', 'bbstitle', 'hide', 'm1', 'm2', 'm3', 'm4', 'need'],
    'threads' => [
        'bid', 'tid', 'title', 'author', 'replyer', 'click', 'reply', 'guesture',
        'extr', 'top', 'locked', 'timestamp', 'postdate',
    ],
    'posts' => [
        'bid', 'tid', 'pid', 'fid', 'title', 'author', 'text', 'ishtml',
        'attachs', 'replytime', 'updatetime', 'sig', 'type', 'ip', 'lzl',
    ],
    'lzl' => ['id', 'fid', 'author', 'text', 'time', 'visible'],
    'attachments' => [
        'id', 'name', 'path', 'size', 'uploader', 'ref', 'count', 'price', 'auth', 'time',
    ],
    'thread_global_top' => ['bid', 'tid'],
    'season_threads_activity' => [
        'activity_id', 'bid', 'tid', 'season_id', 'name', 'leader_username',
    ],
    'season_activity_option' => [
        'id', 'activity_id', 'type_id', 'option_name', 'required', 'hiden', 'comment',
    ],
    'season_option_case' => [
        'case_id', 'option_id', 'case_name', 'comment', 'need_value',
    ],
];

function usage(): void
{
    $text = <<<'TEXT'
用法：
  php tool/import_posts_to_mysql.php [选项]

默认只校验归档和数据库结构，不写入数据。正式导入必须添加 --apply。

选项：
  --apply                 执行数据库写入
  --archive-dir=PATH      主题归档目录（默认 tool/output）
  --report=PATH           导入报告路径（默认 <archive-dir>/import-report.json）
  --host=HOST             MySQL 主机（默认 localhost）
  --port=PORT             MySQL 端口（默认 3306）
  --socket=PATH           可选 MySQL Unix socket
  --database=NAME         数据库名（默认 capubbs）
  --user=NAME             数据库用户（默认 root）
  --password-env=NAME     密码环境变量（默认 CAPUBBS_DB_PASSWORD；未设置即空密码）
  --help                  显示帮助

示例：
  php tool/import_posts_to_mysql.php
  php tool/import_posts_to_mysql.php --apply
TEXT;
    fwrite(STDOUT, $text . PHP_EOL);
}

function abortImport(string $message, int $code = 2): never
{
    fwrite(STDERR, "错误：{$message}" . PHP_EOL);
    exit($code);
}

function nowIso(): string
{
    return (new DateTimeImmutable('now'))->format(DateTimeInterface::ATOM);
}

function readJsonObject(string $path): array
{
    $raw = @file_get_contents($path);
    if ($raw === false) {
        throw new RuntimeException("无法读取文件：{$path}");
    }
    try {
        $value = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $exception) {
        throw new RuntimeException("JSON 无效：{$path}: {$exception->getMessage()}", 0, $exception);
    }
    if (!is_array($value) || array_is_list($value)) {
        throw new RuntimeException("JSON 顶层不是对象：{$path}");
    }
    return $value;
}

function writeJsonAtomically(string $path, array $payload): void
{
    $directory = dirname($path);
    if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
        throw new RuntimeException("无法创建目录：{$directory}");
    }
    $temporary = $directory . '/.' . basename($path) . '.tmp';
    $json = json_encode(
        $payload,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR
    ) . PHP_EOL;
    $handle = fopen($temporary, 'wb');
    if ($handle === false) {
        throw new RuntimeException("无法写入临时文件：{$temporary}");
    }
    try {
        if (fwrite($handle, $json) === false || !fflush($handle)) {
            throw new RuntimeException("写入报告失败：{$temporary}");
        }
        if (function_exists('fsync')) {
            fsync($handle);
        }
    } finally {
        fclose($handle);
    }
    if (!rename($temporary, $path)) {
        @unlink($temporary);
        throw new RuntimeException("无法原子替换报告：{$path}");
    }
}

function intValue(mixed $value, string $field): int
{
    if ($value === null || $value === '' || filter_var($value, FILTER_VALIDATE_INT) === false) {
        throw new RuntimeException("字段 {$field} 不是有效整数");
    }
    return (int) $value;
}

function nullableInt(mixed $value, string $field): ?int
{
    if ($value === null || $value === '') {
        return null;
    }
    return intValue($value, $field);
}

function nullableString(mixed $value): ?string
{
    return $value === null ? null : (string) $value;
}

function initializeReport(bool $apply, string $archiveDir, array $connectionMeta): array
{
    $counts = [];
    foreach (array_keys(IMPORT_TABLE_COLUMNS) as $table) {
        $counts[$table] = [
            'scanned' => 0,
            'inserted' => 0,
            'skipped' => 0,
            'preserved' => 0,
            'conflicts' => 0,
        ];
    }
    return [
        'meta' => [
            'mode' => $apply ? 'apply' : 'dry-run',
            'status' => 'running',
            'startedAt' => nowIso(),
            'updatedAt' => nowIso(),
            'finishedAt' => null,
            'archiveDir' => $archiveDir,
            'database' => $connectionMeta,
        ],
        'counts' => $counts,
        'sourceMismatches' => [
            'threadReplyCounters' => 0,
            'postNestedReplyCounters' => 0,
        ],
        'fallbacks' => [
            'attachmentFieldsInferred' => 0,
            'missingAttachmentReferences' => 0,
        ],
        'storageEngines' => [],
        'warnings' => [],
        'preservedDifferences' => [],
        'conflicts' => [],
        'errors' => [],
    ];
}

function checkpointReport(string $path, array &$report, ?string $status = null): void
{
    $report['meta']['updatedAt'] = nowIso();
    if ($status !== null) {
        $report['meta']['status'] = $status;
        if ($status === 'finished' || $status === 'finished_with_errors') {
            $report['meta']['finishedAt'] = nowIso();
        }
    }
    writeJsonAtomically($path, $report);
}

function connectDatabase(array $config): mysqli
{
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $connection = mysqli_init();
    $socket = $config['socket'] !== '' ? $config['socket'] : null;
    $connection->real_connect(
        $config['host'],
        $config['user'],
        $config['password'],
        $config['database'],
        $config['port'],
        $socket
    );
    $connection->set_charset('utf8mb4');
    return $connection;
}

function validateSchema(mysqli $database, array &$report): void
{
    foreach (IMPORT_TABLE_COLUMNS as $table => $requiredColumns) {
        $result = $database->query("SHOW COLUMNS FROM `{$table}`");
        $actualColumns = [];
        while ($row = $result->fetch_assoc()) {
            $actualColumns[] = $row['Field'];
        }
        $missing = array_values(array_diff($requiredColumns, $actualColumns));
        if ($missing !== []) {
            throw new RuntimeException(
                "表 {$table} 缺少字段：" . implode(', ', $missing)
            );
        }

        $escapedTable = $database->real_escape_string($table);
        $statusResult = $database->query("SHOW TABLE STATUS WHERE Name='{$escapedTable}'");
        $status = $statusResult->fetch_assoc();
        $engine = $status['Engine'] ?? 'UNKNOWN';
        $report['storageEngines'][$table] = $engine;
    }

    $nonTransactional = array_keys(array_filter(
        $report['storageEngines'],
        static fn (string $engine): bool => strtoupper($engine) !== 'INNODB'
    ));
    if ($nonTransactional !== []) {
        $report['warnings'][] =
            '以下表不支持事务回滚，脚本使用幂等写入保证可重跑：' . implode(', ', $nonTransactional);
    }
}

final class DatabaseWriter
{
    private mysqli $database;
    private array $statements = [];
    private array $report;

    public function __construct(mysqli $database, array &$report)
    {
        $this->database = $database;
        $this->report =& $report;
    }

    public function acquireLock(): void
    {
        $statement = $this->database->prepare('SELECT GET_LOCK(?, 0) AS acquired');
        $name = 'capubbs_archive_post_import';
        $statement->execute([$name]);
        $row = $statement->get_result()->fetch_assoc();
        if ((int) ($row['acquired'] ?? 0) !== 1) {
            throw new RuntimeException('另一个帖子导入进程正在运行');
        }
    }

    public function releaseLock(): void
    {
        try {
            $statement = $this->database->prepare('SELECT RELEASE_LOCK(?)');
            $statement->execute(['capubbs_archive_post_import']);
        } catch (Throwable) {
            // The connection closing also releases the advisory lock.
        }
    }

    public function insertUnique(
        string $table,
        array $row,
        array $keyCandidates
    ): string {
        $identityColumns = [];
        foreach ($keyCandidates as $where) {
            foreach (array_keys($where) as $column) {
                $identityColumns[$column] = true;
            }
        }

        foreach ($keyCandidates as $where) {
            $existing = $this->findOne($table, $where);
            if ($existing !== null) {
                foreach (array_keys($identityColumns) as $column) {
                    if (!$this->valuesEquivalent($existing[$column] ?? null, $row[$column] ?? null)) {
                        $this->recordConflict($table, $where, $row, $existing);
                        return 'conflict';
                    }
                }
                if ($this->rowsEquivalent($existing, $row)) {
                    $this->report['counts'][$table]['skipped']++;
                    return 'skipped';
                }
                $this->recordPreservedDifference($table, $where, $row, $existing);
                return 'preserved';
            }
        }

        $columns = array_keys($row);
        $cacheKey = 'insert:' . $table;
        if (!isset($this->statements[$cacheKey])) {
            $columnSql = implode(', ', array_map(
                static fn (string $column): string => "`{$column}`",
                $columns
            ));
            $placeholders = implode(', ', array_fill(0, count($columns), '?'));
            $this->statements[$cacheKey] = $this->database->prepare(
                "INSERT INTO `{$table}` ({$columnSql}) VALUES ({$placeholders})"
            );
        }
        $this->statements[$cacheKey]->execute(array_values($row));
        $this->report['counts'][$table]['inserted']++;
        return 'inserted';
    }

    public function postMatches(array $post): bool
    {
        $existing = $this->findOne('posts', ['fid' => $post['fid']]);
        if ($existing === null) {
            return false;
        }
        return (int) $existing['bid'] === (int) $post['bid']
            && (int) $existing['tid'] === (int) $post['tid']
            && (int) $existing['pid'] === (int) $post['pid'];
    }

    private function findOne(string $table, array $where): ?array
    {
        $columns = array_keys($where);
        $cacheKey = 'select:' . $table . ':' . implode(',', $columns);
        if (!isset($this->statements[$cacheKey])) {
            $whereSql = implode(' AND ', array_map(
                static fn (string $column): string => "`{$column}` = ?",
                $columns
            ));
            $this->statements[$cacheKey] = $this->database->prepare(
                "SELECT * FROM `{$table}` WHERE {$whereSql} LIMIT 1"
            );
        }
        $statement = $this->statements[$cacheKey];
        $statement->execute(array_values($where));
        $result = $statement->get_result();
        $row = $result->fetch_assoc();
        $result->free();
        return $row ?: null;
    }

    private function valuesEquivalent(mixed $stored, mixed $incoming): bool
    {
        if ($stored === null || $incoming === null) {
            return $stored === null && $incoming === null;
        }
        return (string) $stored === (string) $incoming;
    }

    private function rowsEquivalent(array $existing, array $incoming): bool
    {
        foreach ($incoming as $column => $value) {
            $stored = $existing[$column] ?? null;
            if (!$this->valuesEquivalent($stored, $value)) {
                return false;
            }
        }
        return true;
    }

    private function rowDifferences(array $incoming, array $existing): array
    {
        $differences = [];
        foreach ($incoming as $column => $value) {
            $stored = $existing[$column] ?? null;
            if (!$this->valuesEquivalent($stored, $value)) {
                $differences[$column] = ['existing' => $stored, 'incoming' => $value];
            }
        }
        return $differences;
    }

    private function recordPreservedDifference(
        string $table,
        array $key,
        array $incoming,
        array $existing
    ): void {
        $this->report['counts'][$table]['preserved']++;
        $this->report['preservedDifferences'][] = [
            'table' => $table,
            'key' => $key,
            'differences' => $this->rowDifferences($incoming, $existing),
        ];
    }

    private function recordConflict(
        string $table,
        array $key,
        array $incoming,
        array $existing
    ): void {
        $this->report['counts'][$table]['conflicts']++;
        $this->report['conflicts'][] = [
            'table' => $table,
            'key' => $key,
            'differences' => $this->rowDifferences($incoming, $existing),
        ];
    }
}

function boardRow(array $raw, string $path): array
{
    $bid = intValue($raw['bid'] ?? null, "{$path}: boardinfo.bid");
    if ($bid <= 0) {
        throw new RuntimeException("{$path}: boardinfo.bid 必须大于 0");
    }
    return [
        'bid' => $bid,
        'name' => nullableString($raw['name'] ?? null),
        'bbstitle' => nullableString($raw['bbstitle'] ?? null),
        'hide' => intValue($raw['hide'] ?? 0, "{$path}: boardinfo.hide"),
        'm1' => nullableString($raw['m1'] ?? null),
        'm2' => nullableString($raw['m2'] ?? null),
        'm3' => nullableString($raw['m3'] ?? null),
        'm4' => nullableString($raw['m4'] ?? null),
        'need' => nullableInt($raw['need'] ?? null, "{$path}: boardinfo.need"),
    ];
}

function postRow(array $floor, string $path): array
{
    $raw = $floor['raw'] ?? null;
    if (!is_array($raw)) {
        throw new RuntimeException("{$path}: 楼层缺少 raw 数据");
    }
    $bid = intValue($raw['bid'] ?? null, "{$path}: posts.bid");
    $tid = intValue($raw['tid'] ?? null, "{$path}: posts.tid");
    $pid = intValue($raw['pid'] ?? null, "{$path}: posts.pid");
    $fid = intValue($raw['fid'] ?? null, "{$path}: posts.fid");
    if ($bid <= 0 || $tid <= 0 || $pid <= 0 || $fid <= 0) {
        throw new RuntimeException("{$path}: posts 的 bid/tid/pid/fid 必须大于 0");
    }
    return [
        'bid' => $bid,
        'tid' => $tid,
        'pid' => $pid,
        'fid' => $fid,
        'title' => nullableString($raw['title'] ?? null),
        'author' => nullableString($raw['author'] ?? null),
        'text' => nullableString($raw['text'] ?? null),
        'ishtml' => (string) ($raw['ishtml'] ?? ''),
        'attachs' => (string) ($raw['attachs'] ?? ''),
        'replytime' => nullableInt($raw['replytime'] ?? null, "{$path}: posts.replytime"),
        'updatetime' => nullableInt($raw['updatetime'] ?? null, "{$path}: posts.updatetime"),
        'sig' => nullableInt($raw['sig'] ?? null, "{$path}: posts.sig"),
        'type' => nullableString($raw['type'] ?? null),
        'ip' => nullableString($raw['ip'] ?? null),
        'lzl' => intValue($raw['lzl'] ?? 0, "{$path}: posts.lzl"),
    ];
}

function nestedReplyRow(array $reply, string $path): array
{
    $raw = isset($reply['raw']) && is_array($reply['raw']) ? $reply['raw'] : $reply;
    $id = intValue($raw['id'] ?? null, "{$path}: lzl.id");
    $fid = intValue($raw['fid'] ?? null, "{$path}: lzl.fid");
    if ($id <= 0 || $fid <= 0) {
        throw new RuntimeException("{$path}: lzl.id/fid 必须大于 0");
    }
    return [
        'id' => $id,
        'fid' => $fid,
        'author' => (string) ($raw['author'] ?? ''),
        'text' => (string) ($raw['text'] ?? $reply['content'] ?? ''),
        'time' => intValue($raw['time'] ?? 0, "{$path}: lzl.time"),
        'visible' => intValue($raw['visible'] ?? 1, "{$path}: lzl.visible"),
    ];
}

function activityRows(array $activity, int $bid, int $tid, string $path): array
{
    $activityId = intValue($activity['activity_id'] ?? null, "{$path}: activity.activity_id");
    if ($activityId <= 0) {
        throw new RuntimeException("{$path}: activity.activity_id 必须大于 0");
    }

    $options = [];
    $cases = [];
    foreach (($activity['options'] ?? []) as $option) {
        if (!is_array($option)) {
            continue;
        }
        $optionId = intValue($option['option_id'] ?? null, "{$path}: activity.option_id");
        if ($optionId <= 0) {
            throw new RuntimeException("{$path}: activity.option_id 必须大于 0");
        }
        $options[] = [
            'id' => $optionId,
            'activity_id' => $activityId,
            'type_id' => intValue($option['type_id'] ?? 0, "{$path}: activity.type_id"),
            'option_name' => (string) ($option['option_name'] ?? ''),
            'required' => intValue($option['required'] ?? 0, "{$path}: activity.required"),
            'hiden' => intValue($option['hiden'] ?? 0, "{$path}: activity.hiden"),
            'comment' => (string) ($option['comment'] ?? ''),
        ];
        foreach (($option['cases'] ?? []) as $case) {
            if (!is_array($case)) {
                continue;
            }
            $caseId = intValue($case['case_id'] ?? null, "{$path}: activity.case_id");
            if ($caseId <= 0) {
                throw new RuntimeException("{$path}: activity.case_id 必须大于 0");
            }
            $cases[] = [
                'case_id' => $caseId,
                'option_id' => $optionId,
                'case_name' => (string) ($case['case_name'] ?? ''),
                'comment' => (string) ($case['comment'] ?? ''),
                'need_value' => intValue(
                    $case['need_value'] ?? 0,
                    "{$path}: activity.need_value"
                ),
            ];
        }
    }

    return [
        'activity' => [
            'activity_id' => $activityId,
            'bid' => $bid,
            'tid' => $tid,
            'season_id' => intValue(
                $activity['season_id'] ?? -1,
                "{$path}: activity.season_id"
            ),
            'name' => (string) ($activity['name'] ?? ''),
            'leader_username' => (string) ($activity['leader_username'] ?? ''),
        ],
        'options' => $options,
        'cases' => $cases,
    ];
}

function attachmentRecord(
    array $attachment,
    array $post,
    string $path,
    array &$report
): array {
    $id = intValue($attachment['id'] ?? 0, "{$path}: attachments.id");
    $raw = isset($attachment['raw']) && is_array($attachment['raw'])
        ? $attachment['raw']
        : null;
    $required = IMPORT_TABLE_COLUMNS['attachments'];
    if ($raw !== null && array_diff($required, array_keys($raw)) === []) {
        $rawId = intValue($raw['id'], "{$path}: attachments.raw.id");
        if ($rawId !== $id) {
            throw new RuntimeException("{$path}: 附件展示 ID 与 raw.id 不一致");
        }
        return [
            'exact' => true,
            'row' => [
                'id' => $rawId,
                'name' => (string) $raw['name'],
                'path' => (string) $raw['path'],
                'size' => intValue($raw['size'], "{$path}: attachments.size"),
                'uploader' => (string) $raw['uploader'],
                'ref' => intValue($raw['ref'], "{$path}: attachments.ref"),
                'count' => intValue($raw['count'], "{$path}: attachments.count"),
                'price' => intValue($raw['price'], "{$path}: attachments.price"),
                'auth' => intValue($raw['auth'], "{$path}: attachments.auth"),
                'time' => intValue($raw['time'], "{$path}: attachments.time"),
            ],
        ];
    }

    $report['fallbacks']['attachmentFieldsInferred']++;
    return [
        'exact' => false,
        'row' => [
            'id' => $id,
            'name' => (string) ($attachment['name'] ?? ''),
            'path' => (string) ($attachment['rawPath'] ?? $attachment['path'] ?? ''),
            'size' => intValue($attachment['size'] ?? 0, "{$path}: attachments.size"),
            'uploader' => (string) ($post['author'] ?? ''),
            'ref' => 1,
            'count' => intValue($attachment['count'] ?? 0, "{$path}: attachments.count"),
            'price' => intValue($attachment['price'] ?? 0, "{$path}: attachments.price"),
            'auth' => intValue($attachment['auth'] ?? 0, "{$path}: attachments.auth"),
            'time' => (int) ($post['replytime'] ?? 0),
        ],
    ];
}

function threadRecords(
    array $payload,
    string $path,
    array &$report,
    array &$attachments
): array {
    $summary = $payload['summary'] ?? null;
    if (!is_array($summary)) {
        throw new RuntimeException("{$path}: 缺少 summary");
    }
    $detail = isset($payload['thread']['raw']) && is_array($payload['thread']['raw'])
        ? $payload['thread']['raw']
        : [];
    $bid = intValue($detail['bid'] ?? $summary['bid'] ?? null, "{$path}: threads.bid");
    $tid = intValue($detail['tid'] ?? $summary['tid'] ?? null, "{$path}: threads.tid");
    if ($bid <= 0 || $tid <= 0) {
        throw new RuntimeException("{$path}: threads.bid/tid 必须大于 0");
    }

    $floors = [];
    if (isset($payload['mainPost']) && is_array($payload['mainPost'])) {
        $floors[] = $payload['mainPost'];
    }
    foreach (($payload['floors'] ?? []) as $floor) {
        if (is_array($floor)) {
            $floors[] = $floor;
        }
    }
    if ($floors === []) {
        throw new RuntimeException("{$path}: 主题没有任何楼层");
    }

    $posts = [];
    $nestedRows = [];
    foreach ($floors as $floor) {
        $post = postRow($floor, $path);
        if ($post['bid'] !== $bid || $post['tid'] !== $tid) {
            throw new RuntimeException("{$path}: 楼层与主题的 bid/tid 不一致");
        }
        $nested = is_array($floor['nestedReplies'] ?? null) ? $floor['nestedReplies'] : [];
        if ($post['lzl'] !== count($nested)) {
            $report['sourceMismatches']['postNestedReplyCounters']++;
        }
        $posts[] = $post;

        foreach ($nested as $reply) {
            if (!is_array($reply)) {
                continue;
            }
            $nestedRow = nestedReplyRow($reply, $path);
            if ($nestedRow['fid'] !== $post['fid']) {
                throw new RuntimeException("{$path}: 楼中楼 fid 与父楼层不一致");
            }
            $nestedRows[] = ['row' => $nestedRow, 'parent' => $post];
        }

        foreach (($floor['attachments'] ?? []) as $attachment) {
            if (!is_array($attachment)) {
                continue;
            }
            $id = intValue($attachment['id'] ?? 0, "{$path}: attachments.id");
            if ($id <= 0 || (($attachment['exists'] ?? true) === false)) {
                $report['fallbacks']['missingAttachmentReferences']++;
                continue;
            }
            mergeAttachmentMaps(
                $attachments,
                [$id => attachmentRecord($attachment, $post, $path, $report)],
                $report
            );
        }
    }

    $sourceReplyCount = intValue(
        $detail['reply'] ?? $summary['reply'] ?? 0,
        "{$path}: threads.reply"
    );
    $actualReplyCount = max(0, count($posts) - 1);
    if ($sourceReplyCount !== $actualReplyCount) {
        $report['sourceMismatches']['threadReplyCounters']++;
    }

    $thread = [
        'bid' => $bid,
        'tid' => $tid,
        'title' => nullableString($detail['title'] ?? $summary['title'] ?? null),
        'author' => nullableString($detail['author'] ?? $summary['author'] ?? null),
        'replyer' => nullableString($detail['replyer'] ?? $summary['replyer'] ?? null),
        'click' => nullableInt($detail['click'] ?? $summary['click'] ?? null, "{$path}: threads.click"),
        'reply' => $sourceReplyCount,
        'guesture' => nullableInt($detail['guesture'] ?? null, "{$path}: threads.guesture"),
        'extr' => nullableInt($detail['extr'] ?? $summary['extr'] ?? null, "{$path}: threads.extr"),
        'top' => nullableInt($detail['top'] ?? $summary['top'] ?? null, "{$path}: threads.top"),
        'locked' => nullableInt($detail['locked'] ?? $summary['locked'] ?? null, "{$path}: threads.locked"),
        'timestamp' => nullableInt(
            $detail['timestamp'] ?? $summary['timestamp'] ?? null,
            "{$path}: threads.timestamp"
        ),
        'postdate' => nullableString($detail['postdate'] ?? $summary['postdate'] ?? null),
    ];
    $globalTop = (bool) ($payload['thread']['globalPinned'] ?? false)
        || (int) ($detail['global_top'] ?? 0) === 1;
    $activity = isset($payload['activity']) && is_array($payload['activity'])
        ? activityRows($payload['activity'], $bid, $tid, $path)
        : null;

    return [
        'thread' => $thread,
        'posts' => $posts,
        'nestedRows' => $nestedRows,
        'globalTop' => $globalTop,
        'activity' => $activity,
    ];
}

function recordScanned(array &$report, string $table, int $amount = 1): void
{
    $report['counts'][$table]['scanned'] += $amount;
}

function mergeAttachmentMaps(array &$target, array $source, array &$report): void
{
    foreach ($source as $id => $attachment) {
        if (!isset($target[$id])) {
            $target[$id] = $attachment;
            continue;
        }
        $existing = $target[$id];
        if ($existing['exact'] && !$attachment['exact']) {
            continue;
        }
        if (!$existing['exact'] && $attachment['exact']) {
            $target[$id] = $attachment;
            continue;
        }
        foreach (['name', 'path', 'size', 'count', 'price', 'auth'] as $field) {
            if ((string) $existing['row'][$field] !== (string) $attachment['row'][$field]) {
                $report['errors'][] = [
                    'stage' => 'attachment_merge',
                    'attachmentId' => $id,
                    'error' => "同一附件的 {$field} 元数据不一致",
                ];
                continue 2;
            }
        }
        if (!$existing['exact']) {
            $target[$id]['row']['ref'] += $attachment['row']['ref'];
        }
    }
}

$options = getopt('', [
    'apply', 'archive-dir:', 'report:', 'host:', 'port:', 'socket:',
    'database:', 'user:', 'password-env:', 'help',
]);
if (isset($options['help'])) {
    usage();
    exit(0);
}

$apply = isset($options['apply']);
$archiveDir = realpath((string) ($options['archive-dir'] ?? (__DIR__ . '/output')));
if ($archiveDir === false || !is_dir($archiveDir . '/boards')) {
    abortImport('找不到归档目录中的 boards/');
}
$reportPath = (string) ($options['report'] ?? ($archiveDir . '/import-report.json'));
$databaseName = (string) ($options['database'] ?? 'capubbs');
if (!preg_match('/^[A-Za-z0-9_]+$/', $databaseName)) {
    abortImport('数据库名只能包含字母、数字和下划线');
}
$passwordEnv = (string) ($options['password-env'] ?? 'CAPUBBS_DB_PASSWORD');
$passwordValue = getenv($passwordEnv);
$config = [
    'host' => (string) ($options['host'] ?? 'localhost'),
    'port' => (int) ($options['port'] ?? 3306),
    'socket' => (string) ($options['socket'] ?? ''),
    'database' => $databaseName,
    'user' => (string) ($options['user'] ?? 'root'),
    'password' => $passwordValue === false ? '' : $passwordValue,
];
if ($config['port'] <= 0 || $config['port'] > 65535) {
    abortImport('MySQL 端口无效');
}

$report = initializeReport($apply, $archiveDir, [
    'host' => $config['host'],
    'port' => $config['port'],
    'socket' => $config['socket'] !== '' ? $config['socket'] : null,
    'database' => $config['database'],
    'user' => $config['user'],
]);
checkpointReport($reportPath, $report);

$database = null;
$writer = null;
try {
    $database = connectDatabase($config);
    validateSchema($database, $report);
    if ($apply) {
        $writer = new DatabaseWriter($database, $report);
        $writer->acquireLock();
    }

    $boardFiles = glob($archiveDir . '/boards/*/board.json') ?: [];
    sort($boardFiles, SORT_NATURAL);
    foreach ($boardFiles as $boardFile) {
        try {
            $board = boardRow(readJsonObject($boardFile), $boardFile);
            recordScanned($report, 'boardinfo');
            if ($apply) {
                $writer->insertUnique('boardinfo', $board, [['bid' => $board['bid']]]);
            }
        } catch (Throwable $exception) {
            $report['errors'][] = ['file' => $boardFile, 'error' => $exception->getMessage()];
        }
    }

    $attachments = [];
    $threadFiles = glob($archiveDir . '/boards/*/threads/*.json') ?: [];
    sort($threadFiles, SORT_NATURAL);
    $totalThreads = count($threadFiles);
    foreach ($threadFiles as $index => $threadFile) {
        fwrite(STDERR, sprintf('[%d/%d] %s', $index + 1, $totalThreads, $threadFile) . PHP_EOL);
        try {
            $threadAttachments = [];
            $records = threadRecords(
                readJsonObject($threadFile),
                $threadFile,
                $report,
                $threadAttachments
            );
            recordScanned($report, 'threads');
            recordScanned($report, 'posts', count($records['posts']));
            recordScanned($report, 'lzl', count($records['nestedRows']));
            if ($records['globalTop']) {
                recordScanned($report, 'thread_global_top');
            }
            if ($records['activity'] !== null) {
                recordScanned($report, 'season_threads_activity');
                recordScanned(
                    $report,
                    'season_activity_option',
                    count($records['activity']['options'])
                );
                recordScanned(
                    $report,
                    'season_option_case',
                    count($records['activity']['cases'])
                );
            }

            if ($apply) {
                $thread = $records['thread'];
                $threadResult = $writer->insertUnique('threads', $thread, [[
                    'bid' => $thread['bid'],
                    'tid' => $thread['tid'],
                ]]);
                if ($threadResult !== 'conflict') {
                    foreach ($records['posts'] as $post) {
                        $writer->insertUnique('posts', $post, [
                            ['fid' => $post['fid']],
                            ['bid' => $post['bid'], 'tid' => $post['tid'], 'pid' => $post['pid']],
                        ]);
                    }
                    foreach ($records['nestedRows'] as $nested) {
                        if (!$writer->postMatches($nested['parent'])) {
                            $report['errors'][] = [
                                'file' => $threadFile,
                                'error' => '跳过楼中楼：父楼层 fid 冲突或不存在',
                                'lzlId' => $nested['row']['id'],
                                'fid' => $nested['row']['fid'],
                            ];
                            continue;
                        }
                        $writer->insertUnique('lzl', $nested['row'], [[
                            'id' => $nested['row']['id'],
                        ], [
                            'id' => $nested['row']['id'],
                            'fid' => $nested['row']['fid'],
                        ]]);
                    }
                    if ($records['globalTop']) {
                        $writer->insertUnique('thread_global_top', [
                            'bid' => $thread['bid'],
                            'tid' => $thread['tid'],
                        ], [[
                            'bid' => $thread['bid'],
                            'tid' => $thread['tid'],
                        ]]);
                    }
                    if ($records['activity'] !== null) {
                        $activity = $records['activity'];
                        $activityResult = $writer->insertUnique(
                            'season_threads_activity',
                            $activity['activity'],
                            [
                                ['activity_id' => $activity['activity']['activity_id']],
                                [
                                    'bid' => $activity['activity']['bid'],
                                    'tid' => $activity['activity']['tid'],
                                ],
                            ]
                        );
                        $validOptions = [];
                        foreach ($activity['options'] as $option) {
                            if ($activityResult === 'conflict') {
                                break;
                            }
                            $optionResult = $writer->insertUnique(
                                'season_activity_option',
                                $option,
                                [
                                    ['id' => $option['id']],
                                    [
                                        'id' => $option['id'],
                                        'activity_id' => $option['activity_id'],
                                    ],
                                ]
                            );
                            if ($optionResult !== 'conflict') {
                                $validOptions[$option['id']] = true;
                            }
                        }
                        foreach ($activity['cases'] as $case) {
                            if (!isset($validOptions[$case['option_id']])) {
                                continue;
                            }
                            $writer->insertUnique('season_option_case', $case, [
                                ['case_id' => $case['case_id']],
                                [
                                    'case_id' => $case['case_id'],
                                    'option_id' => $case['option_id'],
                                ],
                            ]);
                        }
                    }
                }
                if ($threadResult !== 'conflict') {
                    mergeAttachmentMaps($attachments, $threadAttachments, $report);
                }
            } else {
                mergeAttachmentMaps($attachments, $threadAttachments, $report);
            }
        } catch (Throwable $exception) {
            $report['errors'][] = ['file' => $threadFile, 'error' => $exception->getMessage()];
            fwrite(STDERR, '  失败：' . $exception->getMessage() . PHP_EOL);
        }
        checkpointReport($reportPath, $report);
    }

    ksort($attachments, SORT_NUMERIC);
    foreach ($attachments as $attachmentRecord) {
        $attachment = $attachmentRecord['row'];
        recordScanned($report, 'attachments');
        if ($apply) {
            $writer->insertUnique('attachments', $attachment, [[
                'id' => $attachment['id'],
            ]]);
        }
    }

    $hasProblems = $report['errors'] !== [] || $report['conflicts'] !== [];
    checkpointReport(
        $reportPath,
        $report,
        $hasProblems ? 'finished_with_errors' : 'finished'
    );
    $mode = $apply ? '导入' : '校验';
    fwrite(
        STDERR,
        sprintf(
            "%s完成：%d 个主题，%d 个楼层，%d 条楼中楼，%d 个附件；"
            . "保留 %d 条已有差异，%d 个错误，%d 个身份冲突。\n报告：%s\n",
            $mode,
            $report['counts']['threads']['scanned'],
            $report['counts']['posts']['scanned'],
            $report['counts']['lzl']['scanned'],
            $report['counts']['attachments']['scanned'],
            count($report['preservedDifferences']),
            count($report['errors']),
            count($report['conflicts']),
            $reportPath
        )
    );
    exit($hasProblems ? 3 : 0);
} catch (Throwable $exception) {
    $report['errors'][] = ['stage' => 'fatal', 'error' => $exception->getMessage()];
    try {
        checkpointReport($reportPath, $report, 'failed');
    } catch (Throwable) {
        // Preserve the original error below.
    }
    fwrite(STDERR, '导入工具失败：' . $exception->getMessage() . PHP_EOL);
    exit(1);
} finally {
    if ($writer instanceof DatabaseWriter) {
        $writer->releaseLock();
    }
    if ($database instanceof mysqli) {
        $database->close();
    }
}
