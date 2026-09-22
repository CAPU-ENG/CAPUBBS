<?php
require_once __DIR__.'/../../api/lib/HomepageContacts.php';
$homepageContactsError = false;
try {
    $homepageContacts = (new HomepageContactsStore())->read();
} catch (Exception $error) {
    $homepageContacts = array('text' => '');
    $homepageContactsError = true;
} catch (Throwable $error) {
    $homepageContacts = array('text' => '');
    $homepageContactsError = true;
}
