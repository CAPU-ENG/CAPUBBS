<?php
$homepageContent = require __DIR__.'/../homepage-content.php';
$homepageMedia = json_decode(file_get_contents(__DIR__.'/../data/homepage-media.default.json'), true);
require __DIR__.'/contacts.php';

// Opening paragraph of a static article, reused as its homepage summary.
function homepage_article_lead($file) {
    $html = file_get_contents(__DIR__.'/../content/'.$file);
    return preg_match('/<p class="about-lead">\s*(.*?)\s*<\/p>/su', $html, $match) === 1 ? $match[1] : '';
}
