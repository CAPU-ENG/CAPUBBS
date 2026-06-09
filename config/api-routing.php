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
    'verifiedCount'     => 'new',
    'online'            => 'new',
    'search'            => 'new',
    'calendar'          => 'new',

    // -- User operations --
    'getuser'           => 'new',
    'userexists'        => 'new',
    'rights'            => 'new',
    'recentpost'        => 'new',
    'recentreply'       => 'new',
    'currentUserInfo'   => 'new',
    'edituser'          => 'new',
    'changepsd'         => 'new',
    'update'            => 'new',
    'editpreview'       => 'new',

    // -- Messaging --
    'msg'               => 'new',
    'sendmsg'           => 'new',
    'boardcast'         => 'new',

    // -- Attachments --
    'attach'            => 'new',
    'attachdl'          => 'new',
    'attachinfo'        => 'new',
    'unusedattachinfo'  => 'new',
    'delattach'         => 'new',

    // -- Admin actions --
    'admin_reset_password' => 'new',
    'lock'              => 'new',
    'extr'              => 'new',
    'top'               => 'new',
    'global_top_action' => 'new',
    'news'              => 'new',

    // -- Trash / restore --
    'trash_list'        => 'new',
    'trash_restore'     => 'new',
    'trash_delete'      => 'new',
    'trash_clean'       => 'new',

    // -- Edit history --
    'edit_history'      => 'new',
    'restore_version'   => 'new',

    // -- View user (explicit ask=view) --
    'view'              => 'new',

    // -- Sign --
    'sign_today'        => 'new',
    'sign_year'         => 'new',
    'sign_user'         => 'new',

    // -- Email verification --
    'sendVerifyCode'        => 'new',
    'verifyEmail'           => 'new',
    'sendRegisterCode'      => 'new',
    'sendResetPasswordCode' => 'new',
    'resetPasswordByEmail'  => 'new',
    'muteEmail'             => 'new',
    'unmuteEmail'           => 'new',
    'listEmailMutes'        => 'new',
    'toggleEmailVisible'    => 'new',

    // -- Special paths (no $ask) --
    '__view'            => 'new',
    '__bbs_default'     => 'new',
    '__tid_default'     => 'new',
);
