<?php
require_once __DIR__.'/../../lib.php';
header('Cache-Control: private, no-store');
$homepageSession = isset($_COOKIE['token']) && is_string($_COOKIE['token'])
    && preg_match('/^[a-z0-9_-]{1,256}$/iD', $_COOKIE['token']) === 1
    ? checkuser_mysqli() : array('', 0);
$username = strval($homepageSession[0]);
$rights = (int)$homepageSession[1];

function homepage_escape($value) {
    return htmlspecialchars(strval($value), ENT_QUOTES, 'UTF-8');
}
