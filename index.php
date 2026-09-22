<?php
if (isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST'] === 'bbs.chexie.net') {
    header('Location: https://www.chexie.net/bbs/', true, 302);
    exit;
}
require __DIR__.'/index/includes/homepage.php';
