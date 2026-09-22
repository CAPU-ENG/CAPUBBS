<?php
$homepageContent = require __DIR__.'/../homepage-content.php';
$homepageMedia = json_decode(file_get_contents(__DIR__.'/../data/homepage-media.default.json'), true);
$homepageContacts = json_decode(file_get_contents(__DIR__.'/../data/contacts.default.json'), true);
