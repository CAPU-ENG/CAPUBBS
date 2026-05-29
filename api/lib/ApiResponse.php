<?php
/**
 * Unified JSON response builder.
 *
 * Usage:
 *   ApiResponse::success($data, $meta)->send();
 *   ApiResponse::error(ApiError::NOT_LOGGED_IN)->send();
 *   ApiResponse::fromDispatchResult($result)->send();
 */
class ApiResponse {
    private $code;
    private $message;
    private $data;
    private $meta;

    private function __construct($code, $message, $data = null, $meta = null) {
        $this->code    = $code;
        $this->message = $message;
        $this->data    = $data;
        $this->meta    = $meta;
    }

    public static function success($data = null, $meta = null) {
        return new self(ApiError::SUCCESS, 'success', $data, $meta);
    }

    public static function error($code, $message = null) {
        if ($message === null) {
            $message = self::defaultMessage($code);
        }
        return new self($code, $message);
    }

    /**
     * Convert a jiekoufunc_dispatch() result array into an ApiResponse.
     *
     * Input format:
     *   $result[0]   = ['code' => '0', 'msg' => '...']  -- status block
     *   $result[1..N] = data rows (assoc arrays)
     */
    public static function fromDispatchResult(array $result) {
        if (empty($result)) {
            return self::error(ApiError::EMPTY_RESULT, '没有数据');
        }

        $first = $result[0];

        // Some functions (e.g. jiekoufunc_calendar) don't prepend a status
        // block. When $first lacks a 'code' key, all rows are data.
        if (!isset($first['code'])) {
            return self::success(
                count($result) === 1 ? $result[0] : $result,
                ['count' => count($result)]
            );
        }

        $legacyCode = $first['code'];
        $msg = isset($first['msg']) ? $first['msg'] : '';

        // Extract meta keys from the status block
        $meta = [];
        foreach (['count', 'items', 'pages', 'page', 'total'] as $key) {
            if (array_key_exists($key, $first)) {
                $meta[$key] = intval($first[$key]);
            }
        }

        // Error path
        if ($legacyCode !== '0' && $legacyCode !== 0) {
            $newCode = ApiError::fromLegacy($legacyCode);
            return self::error($newCode, $msg ?: self::defaultMessage($newCode));
        }

        // Success — collect data rows (positions 1..N)
        $dataRows = array_slice($result, 1);

        if (count($dataRows) === 1) {
            // Unwrap single-row responses (e.g. getUser)
            $dataRows = $dataRows[0];
        } elseif (count($dataRows) === 0) {
            // No data rows — extract extra fields from the status block
            // (e.g. login returns token/username in the first row).
            $extra = array();
            foreach ($first as $key => $value) {
                if ($key !== 'code' && $key !== 'msg' &&
                    !in_array($key, array('count', 'items', 'pages', 'page', 'total'), true)) {
                    $extra[$key] = $value;
                }
            }
            if (!empty($extra)) {
                $dataRows = $extra;
            } elseif (!empty($meta)) {
                $dataRows = $meta;
                $meta = array();
            } else {
                $dataRows = null;
            }
        }

        if (is_array($dataRows)) {
            if (!isset($meta['count'])) {
                $meta['count'] = count($dataRows);
            }
        }

        return self::success($dataRows, !empty($meta) ? $meta : null);
    }

    /**
     * Send the JSON response and exit.
     */
    public function send() {
        http_response_code(ApiError::httpStatus($this->code));
        header('Content-Type: application/json; charset=utf-8');

        $body = [
            'code'    => $this->code,
            'message' => $this->message,
        ];

        if ($this->data !== null) {
            $body['data'] = $this->data;
        }

        if ($this->meta !== null && !empty($this->meta)) {
            $body['meta'] = $this->meta;
        }

        echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    private static function defaultMessage($code) {
        $messages = [
            0    => 'success',
            1000 => '请先登录',
            1001 => '会话超时，请重新登录',
            1002 => '用户名或密码错误',
            1003 => '用户不存在',
            1004 => '注册失败',
            1005 => '本版块需要登录后才能查看',
            1100 => '权限不足',
            1101 => '您的权限不足以执行此操作',
            1102 => '主题已锁定',
            1103 => '权限不足，无法删除',
            1104 => '权限不足，无法编辑',
            1105 => '权限不足，无法移动',
            1106 => '您不是此内容的作者',
            2000 => '请求的资源不存在',
            2001 => '主题不存在',
            2002 => '帖子不存在',
            2003 => '附件不存在',
            2004 => '版块不存在',
            2005 => '资源已存在',
            2006 => '没有数据',
            2100 => '输入验证失败',
            2101 => '缺少必填字段',
            2102 => '内容超出长度限制',
            2103 => '内容包含无效字符',
            2104 => '不支持的文件类型',
            2105 => '文件太大',
            3000 => '请求参数错误',
            3001 => '未知的操作类型',
            3002 => '操作太频繁，请稍后再试',
            3003 => '非法参数',
            4000 => '服务器内部错误',
            4001 => '数据库错误',
            4002 => '文件上传失败',
            4003 => '服务暂时不可用',
            9000 => '操作失败',
        ];
        return isset($messages[$code]) ? $messages[$code] : '未知错误';
    }
}
