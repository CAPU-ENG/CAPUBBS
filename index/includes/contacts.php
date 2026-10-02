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

// Keep in sync with assets/js/home-contacts-format.js.
function homepage_contact_parse($text) {
    $normalized = trim(str_replace(array("\r\n", "\r"), "\n", strval($text)));
    $parts = preg_split('/\n[ \t]*\n/u', $normalized, 2);
    $notes = isset($parts[1]) ? array(trim($parts[1])) : array();
    $rows = array();
    $loose = array();
    foreach (explode("\n", $parts[0]) as $line) {
        if (preg_match('/^([^：\n]{1,16})：(.*)$/u', $line, $match) === 1 && trim($match[1]) !== '') {
            $rows[] = array('label' => trim($match[1]), 'value' => trim($match[2]));
        } elseif (count($rows) > 0) {
            $rows[count($rows) - 1]['value'] .= "\n".trim($line);
        } elseif (trim($line) !== '') {
            $loose[] = trim($line);
        }
    }
    if (count($loose) > 0) array_unshift($notes, implode("\n", $loose));
    return array('rows' => $rows, 'notes' => implode("\n\n", array_filter($notes, 'strlen')));
}
$homepageContactView = homepage_contact_parse($homepageContacts['text']);
