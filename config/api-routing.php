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
    'login'             => 'new',
    'logout'            => 'new',
    'register'          => 'new',

    // -- Content operations --
    'post'              => 'new',
    'reply'             => 'new',
    'edit'              => 'new',
    'delete'            => 'new',
    'move'              => 'new',
    'lzl'               => 'new',

    // -- Board / thread read operations --
    'bbsinfo'           => 'new',
    'tidinfo'           => 'new',
    'getpages'          => 'new',
    'getlznum'          => 'new',
    'getnum'            => 'new',
    'hot'               => 'new',
    'global_top'        => 'new',
    'online'            => 'new',
    'search'            => 'new',
    'calendar'          => 'new',

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
    'lock'              => 'new',
    'extr'              => 'new',
    'top'               => 'new',
    'global_top_action' => 'old',
    'news'              => 'old',

    // -- Sign --
    'sign_today'        => 'new',
    'sign_year'         => 'new',
    'sign_user'         => 'new',

    // -- Special paths (no $ask) --
    '__view'            => 'new',
    '__bbs_default'     => 'new',
    '__tid_default'     => 'new',
);
