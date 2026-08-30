<?php
    $mode = @$_COOKIE['capubbs_forum_mode'];

    header('Cache-Control: private, no-store');
    header('Vary: Cookie');
    header('Content-Type: text/html; charset=UTF-8');

    if ($mode === 'legacy') {
        if (!chdir(__DIR__.'/index')) {
            http_response_code(500);
            echo 'Internal Server Error';
            exit;
        }
        require __DIR__.'/index/index.php';
        exit;
    }

    $indexCandidates = array(
        __DIR__.'/../forum/index.html',
        __DIR__.'/../forum/dist/index.html'
    );
    $indexContents = false;
    foreach ($indexCandidates as $indexCandidate) {
        if (!is_readable($indexCandidate)) continue;
        $candidateContents = file_get_contents($indexCandidate);
        if ($candidateContents === false || strpos($candidateContents, '/src/main.tsx') !== false) continue;
        $indexContents = $candidateContents;
        break;
    }

    if ($indexContents === false) {
        http_response_code(503);
        echo 'Service Unavailable';
        exit;
    }

    echo $indexContents;
    exit;
?>
