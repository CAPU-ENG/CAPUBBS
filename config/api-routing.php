<?php
/**
 * Dynamic routing config for jiekou API.
 *
 * Maps each operation to 'new' (direct PHP function call via jiekoufunc.php)
 * or 'old' (HTTP cURL call to jiekouapi.php).
 *
 * Toggle individual operations to 'new' after verification.
 * All operations start as 'old' for safety.
 */
return array(
    // -- Authentication --
    'login'             => 'old',
    'logout'            => 'old',
    'register'          => 'old',

    // -- Content operations --
    'post'              => 'old',
    'reply'             => 'old',
    'edit'              => 'old',
    'delete'            => 'old',
    'move'              => 'old',
    'lzl'               => 'old',

    // -- Board / thread read operations --
    'bbsinfo'           => 'old',
    'tidinfo'           => 'old',
    'getpages'          => 'old',
    'getlznum'          => 'old',
    'getnum'            => 'old',
    'hot'               => 'old',
    'global_top'        => 'old',
    'online'            => 'old',
    'search'            => 'old',

    // -- User operations --
    'getuser'           => 'old',
    'userexists'        => 'old',
    'rights'            => 'old',
    'recentpost'        => 'old',
    'recentreply'       => 'old',
    'currentUserInfo'   => 'old',
    'edituser'          => 'old',
    'changepsd'         => 'old',
    'update'            => 'old',
    'editpreview'       => 'old',

    // -- Messaging --
    'msg'               => 'old',
    'sendmsg'           => 'old',
    'boardcast'         => 'old',

    // -- Attachments --
    'attach'            => 'old',
    'attachdl'          => 'old',
    'attachinfo'        => 'old',
    'unusedattachinfo'  => 'old',
    'delattach'         => 'old',

    // -- Admin actions --
    'admin_reset_password' => 'new',
    'lock'              => 'old',
    'extr'              => 'old',
    'top'               => 'old',
    'global_top_action' => 'old',
    'news'              => 'old',

    // -- Sign --
    'sign_today'        => 'new',
    'sign_year'         => 'new',
    'sign_user'         => 'new',

    // -- Special paths (no $ask) --
    '__view'            => 'old',
    '__bbs_default'     => 'old',
    '__tid_default'     => 'old',
);
