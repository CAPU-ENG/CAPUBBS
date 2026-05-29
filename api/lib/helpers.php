<?php
/**
 * helpers.php — Pure utility functions (no DB, no I/O, no side effects).
 *
 * Extracted from jiekoufunc.php.  Used by both the legacy XML API and the
 * new JSON API paths.  Keep these functions stateless and side-effect free.
 */

function jiekoufunc_trans($data) {
    $data = str_replace("]]>", "]]]]><![CDATA[>", $data);
    return "<![CDATA[" . $data . "]]>";
}

function jiekoufunc_sanitize_xml($str) {
    // Strip characters illegal in XML 1.0
    $str = preg_replace('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/', '', $str);
    $str = str_replace("\xE2\x80\xA8", "", $str); // LINE SEPARATOR
    $str = str_replace("\xE2\x80\xA9", "", $str); // PARAGRAPH SEPARATOR
    return $str;
}

function jiekoufunc_islegal($num) {
    return strlen(strval($num)) == 0 || is_numeric($num);
}

function jiekoufunc_packBool($bool) {
    if ($bool) return "YES";
    return "NO";
}

function jiekoufunc_comp($a, $b) {
    if (intval($a[1]) > intval($b[1])) {
        return -1;
    } elseif (intval($a[1]) == intval($b[1])) {
        return 0;
    } else {
        return 1;
    }
}

function jiekoufunc_getdays($year, $month) {
    $days = array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
    if ($month != 2) return $days[$month - 1];
    if ($year % 4 != 0) return 28;
    if ($year % 100 == 0 && $year % 400 != 0) return 28;
    return 29;
}
