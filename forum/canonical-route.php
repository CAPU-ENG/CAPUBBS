<?php
// Shared new-forum entry helper. Never redirect legacy-mode or action requests.
function capubbs_new_forum_canonical_route($uri) {
    $parts = parse_url($uri);
    if ($parts === false || isset($parts['host']) || !isset($parts['path'])) return $uri;
    $path = rtrim($parts['path'], '/');
    $query = isset($parts['query']) ? $parts['query'] : '';
    parse_str($query, $params);
    if ($path === '/bbs') {
        if (isset($params['tid']) || isset($params['thread'])) $destination = '/bbs/content/';
        elseif (isset($params['bid']) || isset($params['board'])) $destination = '/bbs/main/';
        else $destination = '/bbs/index/';
    } elseif ($path === '/bbs/index' || $path === '/bbs/index/index.php') {
        $destination = '/bbs/index/';
    } elseif ($path === '/bbs/main' || $path === '/bbs/main/index.php') {
        $destination = '/bbs/main/';
    } elseif ($path === '/bbs/content' || $path === '/bbs/content/index.php' || $path === '/bbs/thread.php') {
        $destination = '/bbs/content/';
    } else {
        return $uri;
    }
    $aliases = $destination === '/bbs/main/'
        ? array('board' => 'bid', 'page' => 'p', 'digest' => 'extr')
        : ($destination === '/bbs/content/' ? array('board' => 'bid', 'thread' => 'tid', 'page' => 'p') : array());
    // Rewrite only known query keys; preserve repeated/unknown parameters and their encoding.
    $pairs = $query === '' ? array() : explode('&', $query);
    foreach ($aliases as $alias => $canonical) {
        $canonicalExists = false;
        foreach ($pairs as $pair) {
            if (urldecode(explode('=', $pair, 2)[0]) === $canonical) $canonicalExists = true;
        }
        $rewritten = array();
        $aliasValue = null;
        foreach ($pairs as $pair) {
            $item = explode('=', $pair, 2);
            if (urldecode($item[0]) !== $alias) $rewritten[] = $pair;
            elseif ($aliasValue === null) $aliasValue = isset($item[1]) ? $item[1] : '';
        }
        if (!$canonicalExists && $aliasValue !== null) $rewritten[] = $canonical.'='.$aliasValue;
        $pairs = $rewritten;
    }
    $query = implode('&', $pairs);
    return $destination.($query !== '' ? '?'.$query : '').(isset($parts['fragment']) ? '#'.$parts['fragment'] : '');
}

function capubbs_redirect_new_forum_alias() {
    if (@$_COOKIE['capubbs_forum_mode'] === 'legacy') return;
    if (!in_array(@$_SERVER['REQUEST_METHOD'], array('GET', 'HEAD'), true)) return;
    $uri = @$_SERVER['REQUEST_URI'];
    if (!is_string($uri)) return;
    $canonical = capubbs_new_forum_canonical_route($uri);
    if ($canonical === $uri) return;
    header('Cache-Control: private, no-store');
    header('Vary: Cookie');
    header('Location: '.$canonical, true, 308);
    exit;
}
