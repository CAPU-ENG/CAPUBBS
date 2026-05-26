<?php
/**
 * Unified API error codes.
 * 0 = success. Non-zero = error, grouped by category.
 */
class ApiError {
    const SUCCESS = 0;

    // === Auth (1000-1099) ===
    const NOT_LOGGED_IN       = 1000;
    const SESSION_EXPIRED     = 1001;
    const INVALID_CREDENTIALS = 1002;
    const USER_NOT_FOUND      = 1003;
    const REGISTRATION_FAILED = 1004;
    const BID1_LOGIN_REQUIRED = 1005;

    // === Permission (1100-1199) ===
    const FORBIDDEN           = 1100;
    const RIGHTS_INSUFFICIENT = 1101;
    const THREAD_LOCKED       = 1102;
    const CANNOT_DELETE       = 1103;
    const CANNOT_EDIT         = 1104;
    const CANNOT_MOVE         = 1105;
    const NOT_OWNER           = 1106;

    // === Resource (2000-2099) ===
    const NOT_FOUND           = 2000;
    const THREAD_NOT_FOUND    = 2001;
    const POST_NOT_FOUND      = 2002;
    const ATTACHMENT_NOT_FOUND = 2003;
    const BOARD_NOT_FOUND     = 2004;
    const ALREADY_EXISTS      = 2005;
    const EMPTY_RESULT        = 2006;

    // === Validation (2100-2199) ===
    const VALIDATION_ERROR    = 2100;
    const MISSING_FIELD       = 2101;
    const FIELD_TOO_LONG      = 2102;
    const INVALID_CHARACTERS  = 2103;
    const INVALID_FILE_TYPE   = 2104;
    const FILE_TOO_LARGE      = 2105;

    // === Request (3000-3099) ===
    const BAD_REQUEST         = 3000;
    const INVALID_ACTION      = 3001;
    const RATE_LIMITED        = 3002;
    const ILLEGAL_PARAMETER   = 3003;

    // === Server (4000-4099) ===
    const INTERNAL_ERROR      = 4000;
    const DATABASE_ERROR      = 4001;
    const UPLOAD_FAILED       = 4002;
    const SERVICE_UNAVAILABLE = 4003;

    // === Application (9000-9099) ===
    const ACTION_FAILED       = 9000;

    /**
     * Map an error code to the appropriate HTTP status code.
     */
    public static function httpStatus($code) {
        if ($code === 0)   return 200;
        if ($code >= 1000 && $code < 1100) return 401;
        if ($code >= 1100 && $code < 1200) return 403;
        if ($code >= 2000 && $code < 2100) return ($code === 2005) ? 409 : 404;
        if ($code >= 2100 && $code < 2200) return 422;
        if ($code >= 3000 && $code < 3100) return ($code === 3002) ? 429 : 400;
        if ($code >= 4000 && $code < 4100) return 500;
        return 400;
    }

    /**
     * Map legacy numeric error codes (from jiekoufunc_report) to new codes.
     */
    public static function fromLegacy($legacyCode) {
        $legacyCode = intval($legacyCode);
        $map = [
            0   => self::SUCCESS,
            -1  => self::BAD_REQUEST,
            -2  => self::NOT_LOGGED_IN,
            -18 => self::NOT_LOGGED_IN,
            1   => self::SESSION_EXPIRED,
            2   => self::RATE_LIMITED,
            3   => self::NOT_FOUND,
            4   => self::RATE_LIMITED,
            5   => self::FORBIDDEN,
            6   => self::INVALID_ACTION,
            7   => self::CANNOT_EDIT,
            8   => self::DATABASE_ERROR,
            9   => self::REGISTRATION_FAILED,
            10  => self::CANNOT_DELETE,
            14  => self::INVALID_ACTION,
            -25 => self::NOT_LOGGED_IN,
        ];
        return isset($map[$legacyCode]) ? $map[$legacyCode] : self::INTERNAL_ERROR;
    }
}
