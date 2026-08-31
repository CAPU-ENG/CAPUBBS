<?php
/**
 * Global shared lib for CAPUBBS.
 */
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/config.php';

// Database connector (mysqli).
function dbconnect_mysqli() {
    $con = @mysqli_connect(CAPUBBS_DB_HOSTNAME, CAPUBBS_DB_USERNAME,
        CAPUBBS_DB_PASSWORD, "capubbs") or die("Cannot connect to database !!!");
    if (mysqli_connect_errno()) {
        echo "连接 MySQL 失败: " . mysqli_connect_error();
        return null;
    }

    // Set to `utf8mb4` in order to support emoji
    mysqli_query($con, "SET NAMES 'utf8mb4'");

    // Allow insert null while the column is defined with not null
    mysqli_query($con, "SET sql_mode = ''");

    return $con;
}

// Return cryptographically secure random bytes on both PHP 5.6 and newer PHP.
// PHP did not provide random_bytes() until PHP 7.0.
function capubbs_random_bytes($length) {
    $length = intval($length);
    if ($length < 1) {
        throw new InvalidArgumentException('Random byte length must be positive.');
    }

    if (function_exists('random_bytes')) {
        return random_bytes($length);
    }

    if (function_exists('openssl_random_pseudo_bytes')) {
        $strong = false;
        $bytes = openssl_random_pseudo_bytes($length, $strong);
        if ($bytes !== false && strlen($bytes) === $length && $strong) {
            return $bytes;
        }
    }

    $handle = @fopen('/dev/urandom', 'rb');
    if ($handle !== false) {
        $bytes = '';
        while (strlen($bytes) < $length && !feof($handle)) {
            $chunk = fread($handle, $length - strlen($bytes));
            if ($chunk === false || $chunk === '') {
                break;
            }
            $bytes .= $chunk;
        }
        fclose($handle);
        if (strlen($bytes) === $length) {
            return $bytes;
        }
    }

    throw new Exception('Unable to obtain secure random bytes.');
}

// Read image dimensions on PHP 5.6 and newer. PHP only added WebP support to
// getimagesize() in PHP 7.1, so older production runtimes need a RIFF fallback.
function capubbs_get_image_size($path) {
    $info = @getimagesize($path);
    if ($info && intval($info[0]) > 0 && intval($info[1]) > 0) {
        return $info;
    }
    if (PHP_VERSION_ID >= 70100) {
        return false;
    }
    return capubbs_get_webp_image_size($path);
}

function capubbs_detect_image_mime($path) {
    $detected = '';
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $mime = finfo_file($finfo, $path);
            if (PHP_VERSION_ID < 80500) {
                finfo_close($finfo);
            }
            if (is_string($mime)) {
                $detected = strtolower(trim($mime));
                if (in_array($detected, array('image/gif', 'image/jpeg', 'image/png', 'image/webp'), true)) {
                    return $detected;
                }
            }
        }
    }

    $info = capubbs_get_image_size($path);
    if ($info && isset($info['mime'])) {
        return strtolower(strval($info['mime']));
    }
    return $detected;
}

function capubbs_get_webp_image_size($path) {
    $file_size = @filesize($path);
    if ($file_size === false || $file_size < 20) {
        return false;
    }

    $handle = @fopen($path, 'rb');
    if ($handle === false) {
        return false;
    }

    $header = fread($handle, 12);
    if (strlen($header) !== 12 || substr($header, 0, 4) !== 'RIFF' || substr($header, 8, 4) !== 'WEBP') {
        fclose($handle);
        return false;
    }

    $riff_size = capubbs_unpack_uint32_le(substr($header, 4, 4));
    $riff_end = 8 + $riff_size;
    if ($riff_size < 12 || $riff_end > $file_size) {
        fclose($handle);
        return false;
    }

    $offset = 12;
    while ($offset <= $riff_end - 8) {
        if (fseek($handle, $offset) !== 0) {
            break;
        }
        $chunk_header = fread($handle, 8);
        if (strlen($chunk_header) !== 8) {
            break;
        }

        $chunk_type = substr($chunk_header, 0, 4);
        $chunk_size = capubbs_unpack_uint32_le(substr($chunk_header, 4, 4));
        $payload_offset = $offset + 8;
        if ($chunk_size > $riff_end - $payload_offset) {
            break;
        }

        $required = $chunk_type === 'VP8X' ? 10 : ($chunk_type === 'VP8 ' ? 10 : ($chunk_type === 'VP8L' ? 5 : 0));
        if ($required > 0 && $chunk_size >= $required) {
            $payload = fread($handle, $required);
            if (strlen($payload) !== $required) {
                break;
            }
            $dimensions = capubbs_webp_chunk_dimensions($chunk_type, $payload);
            if ($dimensions !== false) {
                fclose($handle);
                return array(
                    0 => $dimensions[0],
                    1 => $dimensions[1],
                    2 => 18,
                    3 => 'width="' . $dimensions[0] . '" height="' . $dimensions[1] . '"',
                    'mime' => 'image/webp',
                );
            }
        }

        $offset = $payload_offset + $chunk_size + ($chunk_size % 2);
    }

    fclose($handle);
    return false;
}

function capubbs_webp_chunk_dimensions($chunk_type, $payload) {
    if ($chunk_type === 'VP8X') {
        $width = 1 + capubbs_unpack_uint24_le(substr($payload, 4, 3));
        $height = 1 + capubbs_unpack_uint24_le(substr($payload, 7, 3));
    } elseif ($chunk_type === 'VP8 ') {
        if (substr($payload, 3, 3) !== "\x9d\x01\x2a") {
            return false;
        }
        $width = (ord($payload[6]) | (ord($payload[7]) << 8)) & 0x3fff;
        $height = (ord($payload[8]) | (ord($payload[9]) << 8)) & 0x3fff;
    } elseif ($chunk_type === 'VP8L') {
        if (ord($payload[0]) !== 0x2f) {
            return false;
        }
        $byte_1 = ord($payload[1]);
        $byte_2 = ord($payload[2]);
        $byte_3 = ord($payload[3]);
        $byte_4 = ord($payload[4]);
        $width = 1 + $byte_1 + (($byte_2 & 0x3f) << 8);
        $height = 1 + (($byte_2 & 0xc0) >> 6) + ($byte_3 << 2) + (($byte_4 & 0x0f) << 10);
    } else {
        return false;
    }

    return $width > 0 && $height > 0 ? array($width, $height) : false;
}

function capubbs_unpack_uint24_le($bytes) {
    return ord($bytes[0]) + (ord($bytes[1]) << 8) + (ord($bytes[2]) << 16);
}

function capubbs_unpack_uint32_le($bytes) {
    return ord($bytes[0])
        + (ord($bytes[1]) << 8)
        + (ord($bytes[2]) << 16)
        + (ord($bytes[3]) * 16777216);
}

function checkuser_mysqli() {
    $token = @$_COOKIE['token'];
    if ($token == "") return array("", 0);
    $con = dbconnect_mysqli();
    $time = time();
    $statement = "select username, rights from capubbs.userinfo where token='$token' && $time-tokentime<=60*60*24*7";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) == 0) return array("", 0);
    $res = mysqli_fetch_array($results);
    return $res;
}

function checkuser_con($con) {
    $token = @$_COOKIE['token'];
    if ($token == "") return array("", 0);
    $time = time();
    $statement = "select username, rights from capubbs.userinfo where token='$token' && $time-tokentime<=60*60*24*7";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) == 0) return array("", 0);
    $res = mysqli_fetch_array($results);
    return $res;
}

// Shared routing key resolver used by both mainfunc.php and client.php.
function _jiekoufunc_resolve_route_key($posts) {
    $ask = isset($posts['ask']) ? $posts['ask'] : '';
    if ($ask) {
        return $ask;
    }
    if (isset($posts['view']) && $posts['view'] != '') return '__view';
    if (intval(isset($posts['bid']) ? $posts['bid'] : 0) != 0) {
        if (intval(isset($posts['tid']) ? $posts['tid'] : 0) != 0) return '__tid_default';
        return '__bbs_default';
    }
    return '';
}

// Shared API routing loader used by both mainfunc.php and client.php.
function _jiekoufunc_get_api_routing() {
    static $routing = null;
    if ($routing === null) {
        $routing = require __DIR__ . '/config/api-routing.php';
    }
    return $routing;
}

// Sanitize string for XML 1.0 compliance: strip control characters that are
// illegal even inside CDATA sections (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F).
function sanitize_xml($str) {
    if ($str === null || $str === '') return $str;
    return preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $str);
}

// Enrich user info array with signature data from user_sig table.
// Prefers user_sig values over any existing sig1/sig2/sig3 in $info.
// $username must already be SQL-escaped.
function enrich_user_sigs($con, $username, &$info) {
    $sig_statement = "SELECT sig_num, sig, sig_type FROM user_sig WHERE username='$username'";
    $sig_results = mysqli_query($con, $sig_statement);
    while ($sig_row = mysqli_fetch_array($sig_results)) {
        $n = intval($sig_row['sig_num']);
        if ($n >= 1 && $n <= 3) {
            $info['sig' . $n] = $sig_row['sig'];
            $info['sig' . $n . '_type'] = $sig_row['sig_type'];
        }
    }
    for ($n = 1; $n <= 3; $n++) {
        if (!isset($info['sig' . $n . '_type'])) {
            $info['sig' . $n . '_type'] = 'null';
        }
    }
}

// Upsert signature content and type into user_sig table.
// $username must already be SQL-escaped.
// $sigs and $sig_types are arrays indexed by sig_num (1, 2, 3).
// Values must already be SQL-escaped.
// Returns null on success, or the error message string on failure.
function upsert_user_sigs($con, $username, $sigs, $sig_types) {
    for ($n = 1; $n <= 3; $n++) {
        $sig_val = $sigs[$n];
        $sig_type_val = $sig_types[$n];
        $upsert = "INSERT INTO user_sig (username, sig_num, sig, sig_type) VALUES ('$username', $n, '$sig_val', '$sig_type_val') ON DUPLICATE KEY UPDATE sig='$sig_val', sig_type='$sig_type_val'";
        mysqli_query($con, $upsert);
        if (mysqli_error($con)) {
            return mysqli_error($con);
        }
    }
    return null;
}

// Parse the 'limit' parameter for recentpost/recentrely APIs.
// Returns: 10 (default), null (no limit), or positive int N.
function _parse_limit($raw, $default=10) {
    if ($raw === null || $raw === '' || $raw === '0') return $default;
    if ($raw === '-1' || strtolower($raw) === 'all') return null;
    $limit = intval($raw);
    if ($limit <= 0) return $default;
    return $limit;
}
?>
