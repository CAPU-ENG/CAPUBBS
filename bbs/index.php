<?php
    $mode = @$_COOKIE['capubbs_forum_mode'];
    $destination = $mode === 'legacy' ? '/bbs/index/' : '/forum/';

    header('Cache-Control: private, no-store');
    header('Vary: Cookie');
    header('Location: '.$destination, true, 302);
    exit;
?>
