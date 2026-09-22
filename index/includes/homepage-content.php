<?php
$homepageContent = require __DIR__.'/../homepage-content.php';
$homepageMedia = json_decode(file_get_contents(__DIR__.'/../data/homepage-media.default.json'), true);
$homepageContacts = json_decode(file_get_contents(__DIR__.'/../data/contacts.default.json'), true);

// This pass ships saved media only. Fetching new covers is deferred to the API work.
function homepage_video_cover($url, $covers) {
    $parts = parse_url($url);
    if (!is_array($parts) || !isset($parts['host']) || !isset($parts['path'])
        || !in_array(strtolower($parts['host']), array('bilibili.com', 'www.bilibili.com', 'm.bilibili.com'), true)) {
        return '';
    }
    if (preg_match('~^/video/(BV[a-zA-Z0-9]{10})/?$~D', $parts['path'], $matches) !== 1) return '';
    return isset($covers[$matches[1]]['image']) ? $covers[$matches[1]]['image'] : '';
}
