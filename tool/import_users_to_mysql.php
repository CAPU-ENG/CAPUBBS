#!/usr/bin/env php
<?php
/**
 * Import archived CAPUBBS user profiles into capubbs.userinfo.
 *
 * The default mode is read-only validation. Pass --apply to write data.
 * Existing users are preserved by default. Pass --update-existing to refresh
 * profile fields and signatures without changing passwords or session fields.
 * Only username/userid identity collisions are conflicts.
 */

declare(strict_types=1);

const USERINFO_COLUMNS = [
    'username', 'password', 'token', 'tokentime', 'sex', 'icon', 'intro',
    'sig1', 'sig2', 'sig3', 'hobby', 'qq', 'mail', 'place', 'regdate',
    'lastdate', 'lastip', 'star', 'score', 'post', 'reply', 'water', 'sign',
    'rights', 'newmsg', 'extr', 'lastpost', 'nowboard', 'onlinetype',
    'logininfo', 'code', 'other2', 'other3', 'other4', 'other5', 'other6',
    'userid', 'verified', 'email_visible',
];

const PROFILE_COMPARE_COLUMNS = [
    'username', 'sex', 'icon', 'intro', 'sig1', 'sig2', 'sig3', 'hobby', 'qq',
    'mail', 'place', 'regdate', 'lastdate', 'lastip', 'star', 'score', 'post',
    'reply', 'water', 'sign', 'rights', 'newmsg', 'extr', 'onlinetype',
    'logininfo', 'code', 'other2', 'other3', 'other4', 'other5', 'other6',
    'userid', 'verified', 'email_visible',
];

const PROFILE_STRING_LIMITS = [
    'username' => 30,
    'sex' => 2,
    'intro' => 500,
    'sig1' => 1000,
    'sig2' => 1000,
    'sig3' => 1000,
    'hobby' => 50,
    'qq' => 12,
    'mail' => 50,
    'place' => 50,
    'regdate' => 12,
    'lastdate' => 12,
    'lastip' => 60,
    'onlinetype' => 10,
    'logininfo' => 500,
    'code' => 10,
];

function usage(): void
{
    $text = <<<'TEXT'
用法：
  php tool/import_users_to_mysql.php [选项]

默认只校验用户归档和数据库结构，不写入数据。正式导入必须添加 --apply。

选项：
  --apply                 执行数据库写入
  --update-existing       更新已有用户的资料与签名（不修改密码和会话字段）
  --profiles-dir=PATH     用户 profile 目录（默认 tool/output/users/profiles）
  --usernames=PATH        用户名汇总文件（默认 tool/output/users/usernames.json）
  --report=PATH           导入报告（默认 tool/output/users/import-users-report.json）
  --host=HOST             MySQL 主机（默认 localhost）
  --port=PORT             MySQL 端口（默认 3306）
  --socket=PATH           可选 MySQL Unix socket
  --database=NAME         数据库名（默认 capubbs）
  --user=NAME             数据库用户（默认 root）
  --password-env=NAME     密码环境变量（默认 CAPUBBS_DB_PASSWORD；未设置即空密码）
  --help                  显示帮助

示例：
  php tool/import_users_to_mysql.php
  php tool/import_users_to_mysql.php --apply
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

function nullableString(mixed $value): ?string
{
    return $value === null ? null : (string) $value;
}

function constrainedString(
    mixed $value,
    string $field,
    string $username,
    array &$report,
    bool $allowTruncate = false
): ?string {
    if ($value === null) {
        return null;
    }
    $string = (string) $value;
    $limit = PROFILE_STRING_LIMITS[$field] ?? null;
    if ($limit === null) {
        return $string;
    }
    $length = mb_strlen($string, 'UTF-8');
    if ($length <= $limit) {
        return $string;
    }
    if (!$allowTruncate) {
        throw new RuntimeException(
            "用户 {$username} 的 {$field} 长度 {$length} 超过数据库上限 {$limit}"
        );
    }
    $report['truncations'][] = [
        'username' => $username,
        'field' => $field,
        'originalLength' => $length,
        'storedLength' => $limit,
    ];
    return mb_substr($string, 0, $limit, 'UTF-8');
}

function defaultUserPasswordHash(): string
{
    // Matches jiekoufunc_admin_reset_password() and the web client's MD5 login flow.
    return strtoupper(md5('123456'));
}

function initializeReport(
    bool $apply,
    bool $updateExisting,
    string $profilesDir,
    array $connectionMeta
): array
{
    return [
        'meta' => [
            'mode' => $apply ? 'apply' : 'dry-run',
            'updateExisting' => $updateExisting,
            'status' => 'running',
            'startedAt' => nowIso(),
            'updatedAt' => nowIso(),
            'finishedAt' => null,
            'profilesDir' => $profilesDir,
            'database' => $connectionMeta,
        ],
        'counts' => [
            'discoveredUsernames' => 0,
            'profileFiles' => 0,
            'scanned' => 0,
            'inserted' => 0,
            'updated' => 0,
            'skipped' => 0,
            'preserved' => 0,
            'conflicts' => 0,
            'missingProfiles' => 0,
            'passwordsSet' => 0,
            'errors' => 0,
            'signaturesInserted' => 0,
            'signaturesUpdated' => 0,
        ],
        'storageEngine' => null,
        'unavailableFields' => [
            'password' => '仅新增用户设置为 123456 的大写 MD5；已有用户密码始终保留',
            'token' => 'API 不返回；写入 NULL',
            'tokentime' => 'API 不返回；写入 NULL',
            'lastpost' => 'API 不返回；写入 NULL',
            'nowboard' => 'API 不返回；写入 NULL',
        ],
        'ignoredProfileFields' => [],
        'warnings' => [],
        'truncations' => [],
        'missingProfiles' => [],
        'preservedDifferences' => [],
        'preservedSignatureDifferences' => [],
        'updatedDifferences' => [],
        'updatedSignatureDifferences' => [],
        'conflicts' => [],
        'errors' => [],
    ];
}

function checkpointReport(string $path, array &$report, ?string $status = null): void
{
    $report['counts']['errors'] = count($report['errors']);
    $report['counts']['conflicts'] = count($report['conflicts']);
    $report['counts']['missingProfiles'] = count($report['missingProfiles']);
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
    $connection->real_connect(
        $config['host'],
        $config['user'],
        $config['password'],
        $config['database'],
        $config['port'],
        $config['socket'] !== '' ? $config['socket'] : null
    );
    $connection->set_charset('utf8mb4');
    return $connection;
}

function validateSchema(mysqli $database, array &$report): void
{
    $requiredTables = [
        'userinfo' => USERINFO_COLUMNS,
        'user_sig' => ['username', 'sig_num', 'sig', 'sig_type'],
    ];
    foreach ($requiredTables as $table => $requiredColumns) {
        $result = $database->query("SHOW COLUMNS FROM `{$table}`");
        $actualColumns = [];
        while ($row = $result->fetch_assoc()) {
            $actualColumns[] = $row['Field'];
        }
        $missing = array_values(array_diff($requiredColumns, $actualColumns));
        if ($missing !== []) {
            throw new RuntimeException("{$table} 缺少字段：" . implode(', ', $missing));
        }
    }
    $statusResult = $database->query("SHOW TABLE STATUS WHERE Name='userinfo'");
    $status = $statusResult->fetch_assoc();
    $engine = $status['Engine'] ?? 'UNKNOWN';
    $report['storageEngine'] = $engine;
    if (strtoupper($engine) !== 'INNODB') {
        $report['warnings'][] =
            "userinfo 使用 {$engine}，不支持事务回滚；脚本使用幂等写入保证可重跑";
    }
}

function userRow(array $wrapper, string $path, array &$report): array
{
    $profile = $wrapper['profile'] ?? null;
    if (!is_array($profile) || array_is_list($profile)) {
        throw new RuntimeException("{$path}: 缺少 profile 对象");
    }
    $username = trim((string) ($profile['username'] ?? ''));
    $wrapperUsername = trim((string) ($wrapper['username'] ?? ''));
    if ($username === '') {
        throw new RuntimeException("{$path}: username 为空");
    }
    if ($wrapperUsername !== '' && $wrapperUsername !== $username) {
        throw new RuntimeException("{$path}: wrapper username 与 profile username 不一致");
    }
    $userid = intValue($profile['userid'] ?? null, "{$path}: userid");
    if ($userid <= 0) {
        throw new RuntimeException("{$path}: userid 必须大于 0");
    }

    return [
        'username' => constrainedString($username, 'username', $username, $report),
        'password' => defaultUserPasswordHash(),
        'token' => null,
        'tokentime' => null,
        'sex' => constrainedString($profile['sex'] ?? '', 'sex', $username, $report),
        'icon' => nullableString($profile['icon'] ?? null),
        'intro' => constrainedString($profile['intro'] ?? null, 'intro', $username, $report),
        'sig1' => constrainedString($profile['sig1'] ?? null, 'sig1', $username, $report, true),
        'sig2' => constrainedString($profile['sig2'] ?? null, 'sig2', $username, $report, true),
        'sig3' => constrainedString($profile['sig3'] ?? null, 'sig3', $username, $report, true),
        'hobby' => constrainedString($profile['hobby'] ?? null, 'hobby', $username, $report),
        'qq' => constrainedString($profile['qq'] ?? null, 'qq', $username, $report),
        'mail' => constrainedString($profile['mail'] ?? null, 'mail', $username, $report),
        'place' => constrainedString($profile['place'] ?? null, 'place', $username, $report),
        'regdate' => constrainedString($profile['regdate'] ?? null, 'regdate', $username, $report),
        'lastdate' => constrainedString($profile['lastdate'] ?? null, 'lastdate', $username, $report),
        'lastip' => constrainedString($profile['lastip'] ?? null, 'lastip', $username, $report),
        'star' => intValue($profile['star'] ?? 0, "{$path}: star"),
        'score' => intValue($profile['score'] ?? 0, "{$path}: score"),
        'post' => intValue($profile['post'] ?? 0, "{$path}: post"),
        'reply' => intValue($profile['reply'] ?? 0, "{$path}: reply"),
        'water' => intValue($profile['water'] ?? 0, "{$path}: water"),
        'sign' => intValue($profile['sign'] ?? 0, "{$path}: sign"),
        'rights' => intValue($profile['rights'] ?? 0, "{$path}: rights"),
        'newmsg' => intValue($profile['newmsg'] ?? 0, "{$path}: newmsg"),
        'extr' => intValue($profile['extr'] ?? 0, "{$path}: extr"),
        'lastpost' => null,
        'nowboard' => null,
        'onlinetype' => constrainedString(
            $profile['onlinetype'] ?? null,
            'onlinetype',
            $username,
            $report
        ),
        'logininfo' => constrainedString(
            $profile['logininfo'] ?? null,
            'logininfo',
            $username,
            $report
        ),
        'code' => constrainedString($profile['code'] ?? null, 'code', $username, $report),
        'other2' => nullableString($profile['other2'] ?? null),
        'other3' => nullableString($profile['other3'] ?? null),
        'other4' => nullableString($profile['other4'] ?? null),
        'other5' => nullableString($profile['other5'] ?? null),
        'other6' => nullableString($profile['other6'] ?? null),
        'userid' => $userid,
        'verified' => intValue($profile['verified'] ?? 0, "{$path}: verified"),
        'email_visible' => intValue($profile['email_visible'] ?? 0, "{$path}: email_visible"),
        '__signatures' => array_map(
            static function (int $number) use ($profile, $username, $path): array {
                $type = (string) ($profile["sig{$number}_type"] ?? 'null');
                if (!in_array($type, ['null', 'raw', 'html'], true)) {
                    throw new RuntimeException("{$path}: sig{$number}_type 类型无效");
                }
                return [
                    'username' => $username,
                    'sig_num' => $number,
                    'sig' => (string) ($profile["sig{$number}"] ?? ''),
                    'sig_type' => $type,
                ];
            },
            [1, 2, 3]
        ),
    ];
}

final class UserWriter
{
    private mysqli $database;
    private array $report;
    private mysqli_stmt $selectByUsername;
    private mysqli_stmt $selectByUserid;
    private mysqli_stmt $selectSignature;
    private mysqli_stmt $insert;
    private mysqli_stmt $insertSignature;
    private mysqli_stmt $update;
    private mysqli_stmt $updateSignature;
    private bool $updateExisting;

    public function __construct(mysqli $database, array &$report, bool $updateExisting)
    {
        $this->database = $database;
        $this->report =& $report;
        $this->updateExisting = $updateExisting;
        $this->selectByUsername = $database->prepare(
            'SELECT * FROM `userinfo` WHERE `username` = ? LIMIT 1'
        );
        $this->selectByUserid = $database->prepare(
            'SELECT * FROM `userinfo` WHERE `userid` = ? LIMIT 1'
        );
        $this->selectSignature = $database->prepare(
            'SELECT `sig`, `sig_type` FROM `user_sig` '
            . 'WHERE `username` = ? AND `sig_num` = ? LIMIT 1'
        );
        $columnSql = implode(', ', array_map(
            static fn (string $column): string => "`{$column}`",
            USERINFO_COLUMNS
        ));
        $placeholders = implode(', ', array_fill(0, count(USERINFO_COLUMNS), '?'));
        $this->insert = $database->prepare(
            "INSERT INTO `userinfo` ({$columnSql}) VALUES ({$placeholders})"
        );
        $this->insertSignature = $database->prepare(
            'INSERT INTO `user_sig` (`username`, `sig_num`, `sig`, `sig_type`) VALUES (?, ?, ?, ?)'
        );
        $updateColumns = array_values(array_filter(
            PROFILE_COMPARE_COLUMNS,
            static fn (string $column): bool => !in_array($column, ['username', 'userid'], true)
        ));
        $updateSql = implode(', ', array_map(
            static fn (string $column): string => "`{$column}` = ?",
            $updateColumns
        ));
        $this->update = $database->prepare(
            "UPDATE `userinfo` SET {$updateSql} WHERE `username` = ? AND `userid` = ? LIMIT 1"
        );
        $this->updateSignature = $database->prepare(
            'UPDATE `user_sig` SET `sig` = ?, `sig_type` = ? '
            . 'WHERE `username` = ? AND `sig_num` = ? LIMIT 1'
        );
    }

    public function acquireLock(): void
    {
        $statement = $this->database->prepare('SELECT GET_LOCK(?, 0) AS acquired');
        $statement->execute(['capubbs_archive_user_import']);
        $row = $statement->get_result()->fetch_assoc();
        if ((int) ($row['acquired'] ?? 0) !== 1) {
            throw new RuntimeException('另一个用户导入进程正在运行');
        }
    }

    public function releaseLock(): void
    {
        try {
            $statement = $this->database->prepare('SELECT RELEASE_LOCK(?)');
            $statement->execute(['capubbs_archive_user_import']);
        } catch (Throwable) {
            // Closing the connection also releases the advisory lock.
        }
    }

    public function import(array $row): string
    {
        $byUsername = $this->find($this->selectByUsername, [$row['username']]);
        $byUserid = $this->find($this->selectByUserid, [$row['userid']]);
        $existing = $byUsername ?? $byUserid;
        if ($existing !== null) {
            if ($byUsername !== null && (int) $byUsername['userid'] !== (int) $row['userid']) {
                $this->recordConflict($row, $byUsername, ['username', 'userid']);
                return 'conflict';
            }
            if ($byUserid !== null && (string) $byUserid['username'] !== (string) $row['username']) {
                $this->recordConflict($row, $byUserid, ['userid', 'username']);
                return 'conflict';
            }
            $this->syncSignatures($row);
            $differences = $this->profileDifferences($existing, $row);
            if ($differences === []) {
                $this->report['counts']['skipped']++;
                return 'skipped';
            }
            if ($this->updateExisting) {
                $this->updateProfile($row);
                $this->report['counts']['updated']++;
                $this->report['updatedDifferences'][] = [
                    'username' => $row['username'],
                    'userid' => $row['userid'],
                    'differingColumns' => $differences,
                ];
                return 'updated';
            }
            $this->report['counts']['preserved']++;
            $this->report['preservedDifferences'][] = [
                'username' => $row['username'],
                'userid' => $row['userid'],
                'differingColumns' => $differences,
            ];
            return 'preserved';
        }

        $values = [];
        foreach (USERINFO_COLUMNS as $column) {
            $values[] = $row[$column];
        }
        $this->insert->execute($values);
        $this->syncSignatures($row);
        $this->report['counts']['inserted']++;
        $this->report['counts']['passwordsSet']++;
        return 'inserted';
    }

    private function syncSignatures(array $row): void
    {
        foreach ($row['__signatures'] ?? [] as $signature) {
            $existing = $this->find($this->selectSignature, [
                $signature['username'],
                $signature['sig_num'],
            ]);
            if ($existing !== null) {
                if ((string) $existing['sig'] !== (string) $signature['sig']
                    || (string) $existing['sig_type'] !== (string) $signature['sig_type']
                ) {
                    if ($this->updateExisting) {
                        $this->updateSignature->execute([
                            $signature['sig'],
                            $signature['sig_type'],
                            $signature['username'],
                            $signature['sig_num'],
                        ]);
                        $this->report['counts']['signaturesUpdated']++;
                        $this->report['updatedSignatureDifferences'][] = [
                            'username' => $signature['username'],
                            'sigNum' => $signature['sig_num'],
                        ];
                        continue;
                    }
                    $this->report['preservedSignatureDifferences'][] = [
                        'username' => $signature['username'],
                        'sigNum' => $signature['sig_num'],
                    ];
                }
                continue;
            }
            $this->insertSignature->execute([
                $signature['username'],
                $signature['sig_num'],
                $signature['sig'],
                $signature['sig_type'],
            ]);
            $this->report['counts']['signaturesInserted']++;
        }
    }

    private function updateProfile(array $row): void
    {
        $values = [];
        foreach (PROFILE_COMPARE_COLUMNS as $column) {
            if (in_array($column, ['username', 'userid'], true)) {
                continue;
            }
            $values[] = $row[$column];
        }
        $values[] = $row['username'];
        $values[] = $row['userid'];
        $this->update->execute($values);
    }

    private function find(mysqli_stmt $statement, array $params): ?array
    {
        $statement->execute($params);
        $result = $statement->get_result();
        $row = $result->fetch_assoc();
        $result->free();
        return $row ?: null;
    }

    private function profileDifferences(array $existing, array $incoming): array
    {
        $differences = [];
        foreach (PROFILE_COMPARE_COLUMNS as $column) {
            $stored = $existing[$column] ?? null;
            $value = $incoming[$column] ?? null;
            if (($stored === null && $value !== null)
                || ($stored !== null && $value === null)
                || ($stored !== null && $value !== null && (string) $stored !== (string) $value)
            ) {
                $differences[] = $column;
            }
        }
        return $differences;
    }

    private function recordConflict(array $incoming, array $existing, array $columns): void
    {
        $this->report['conflicts'][] = [
            'username' => $incoming['username'],
            'incomingUserid' => $incoming['userid'],
            'existingUsername' => $existing['username'] ?? null,
            'existingUserid' => isset($existing['userid']) ? (int) $existing['userid'] : null,
            'differingColumns' => array_values(array_unique($columns)),
        ];
    }
}

function discoveredUsernames(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    $payload = readJsonObject($path);
    $users = $payload['users'] ?? [];
    return is_array($users) ? array_keys($users) : [];
}

$options = getopt('', [
    'apply', 'update-existing', 'profiles-dir:', 'usernames:', 'report:', 'host:', 'port:',
    'socket:', 'database:', 'user:', 'password-env:', 'help',
]);
if (isset($options['help'])) {
    usage();
    exit(0);
}

$apply = isset($options['apply']);
$updateExisting = isset($options['update-existing']);
if ($updateExisting && !$apply) {
    abortImport('--update-existing 必须与 --apply 一起使用');
}
$defaultUsersDir = __DIR__ . '/output/users';
$profilesDir = realpath((string) ($options['profiles-dir'] ?? ($defaultUsersDir . '/profiles')));
if ($profilesDir === false || !is_dir($profilesDir)) {
    abortImport('找不到用户 profiles 目录');
}
$usernamesPath = (string) ($options['usernames'] ?? ($defaultUsersDir . '/usernames.json'));
$reportPath = (string) ($options['report'] ?? ($defaultUsersDir . '/import-users-report.json'));
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

$report = initializeReport($apply, $updateExisting, $profilesDir, [
    'host' => $config['host'],
    'port' => $config['port'],
    'socket' => $config['socket'] !== '' ? $config['socket'] : null,
    'database' => $config['database'],
    'user' => $config['user'],
]);
$knownUsernames = discoveredUsernames($usernamesPath);
$report['counts']['discoveredUsernames'] = count($knownUsernames);
checkpointReport($reportPath, $report);

$database = null;
$writer = null;
try {
    $database = connectDatabase($config);
    validateSchema($database, $report);
    if ($apply) {
        $writer = new UserWriter($database, $report, $updateExisting);
        $writer->acquireLock();
    }

    $profileFiles = glob($profilesDir . '/*.json') ?: [];
    sort($profileFiles, SORT_NATURAL);
    $report['counts']['profileFiles'] = count($profileFiles);
    $archivedUsernames = [];
    $total = count($profileFiles);
    foreach ($profileFiles as $index => $profileFile) {
        try {
            $wrapper = readJsonObject($profileFile);
            $row = userRow($wrapper, $profileFile, $report);
            $username = (string) $row['username'];
            $archivedUsernames[$username] = true;
            $report['counts']['scanned']++;
            fwrite(STDERR, sprintf('[%d/%d] %s', $index + 1, $total, $username) . PHP_EOL);
            if ($apply) {
                $result = $writer->import($row);
                fwrite(STDERR, "  {$result}" . PHP_EOL);
            }
        } catch (Throwable $exception) {
            $report['errors'][] = [
                'file' => $profileFile,
                'error' => $exception->getMessage(),
            ];
            fwrite(STDERR, '  失败：' . $exception->getMessage() . PHP_EOL);
        }
        checkpointReport($reportPath, $report);
    }

    foreach ($knownUsernames as $username) {
        if (!isset($archivedUsernames[$username])) {
            $report['missingProfiles'][] = $username;
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
            "%s完成：扫描 %d 个用户，写入 %d，更新 %d，跳过 %d，保留差异 %d，"
            . "新增密码 %d，新增签名 %d，缺少 profile %d，"
            . "截断字段 %d，错误 %d，身份冲突 %d。\n报告：%s\n",
            $mode,
            $report['counts']['scanned'],
            $report['counts']['inserted'],
            $report['counts']['updated'],
            $report['counts']['skipped'],
            $report['counts']['preserved'],
            $report['counts']['passwordsSet'],
            $report['counts']['signaturesInserted'],
            count($report['missingProfiles']),
            count($report['truncations']),
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
    fwrite(STDERR, '用户导入工具失败：' . $exception->getMessage() . PHP_EOL);
    exit(1);
} finally {
    if ($writer instanceof UserWriter) {
        $writer->releaseLock();
    }
    if ($database instanceof mysqli) {
        $database->close();
    }
}
