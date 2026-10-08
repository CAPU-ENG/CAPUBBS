<?php
// The loading page is retired; old links (archive room, homepage) go straight to the issue.
$year = isset($_GET['year']) && is_string($_GET['year']) ? $_GET['year'] : '';
if (preg_match('/^[0-9]{4}$/D', $year) && is_file(__DIR__ . '/' . $year . '/index.html')) {
    header('Location: /annual/' . $year . '/', true, 301);
} else {
    header('Location: /annual/', true, 302);
}
