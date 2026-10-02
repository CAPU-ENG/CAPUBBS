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

// Assets are cached for days; the file time in the URL makes each deploy fetch fresh copies.
function homepage_asset($path) {
    $time = @filemtime(__DIR__.'/../..'.$path);
    return homepage_escape($time === false ? $path : $path.'?v='.$time);
}
