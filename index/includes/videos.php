<?php
require_once __DIR__.'/../../api/lib/HomepageVideos.php';
$homepageVideosError = false;
try {
    $homepageVideos = (new HomepageVideosStore())->read();
} catch (Exception $error) {
    $homepageVideos = array('videos' => array(), 'moreUrl' => '');
    $homepageVideosError = true;
} catch (Throwable $error) {
    $homepageVideos = array('videos' => array(), 'moreUrl' => '');
    $homepageVideosError = true;
}
