<?php
    $mode = @$_COOKIE['capubbs_forum_mode'];

    header('Cache-Control: private, no-store');
    header('Vary: Cookie');
    header('Content-Type: text/html; charset=UTF-8');

    if ($mode === 'legacy') {
        $requestPath = parse_url(@$_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $requestPath = is_string($requestPath) ? rtrim($requestPath, '/') : '/bbs';
        if ($requestPath === '') $requestPath = '/bbs';

        $legacyDirectory = 'index';
        if ($requestPath === '/bbs') {
            if (intval(@$_GET['bid']) > 0 && intval(@$_GET['tid']) > 0) {
                $legacyDirectory = 'content';
            } elseif (intval(@$_GET['bid']) > 0) {
                $legacyDirectory = 'main';
            }
        } elseif (preg_match('#^/bbs/users/([^/]+)$#', $requestPath, $matches)) {
            $_GET['name'] = rawurldecode($matches[1]);
            $_REQUEST['name'] = $_GET['name'];
            $legacyDirectory = 'user';
        } else {
            $legacyRouteDirectories = array(
                '/bbs/content' => 'content',
                '/bbs/editpid' => 'editpid',
                '/bbs/favorite' => 'favorite',
                '/bbs/forgot-password' => 'login',
                '/bbs/home' => 'home',
                '/bbs/index' => 'index',
                '/bbs/login' => 'login',
                '/bbs/main' => 'main',
                '/bbs/manage' => 'manage',
                '/bbs/post' => 'post',
                '/bbs/register' => 'register',
                '/bbs/search' => 'search',
                '/bbs/user' => 'user'
            );
            if (isset($legacyRouteDirectories[$requestPath])) {
                $legacyDirectory = $legacyRouteDirectories[$requestPath];
            }
        }

        $legacyPath = __DIR__.'/'.$legacyDirectory;
        if (!chdir($legacyPath)) {
            http_response_code(500);
            echo 'Internal Server Error';
            exit;
        }
        require $legacyPath.'/index.php';
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
