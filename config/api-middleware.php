<?php
/**
 * Middleware configuration for jiekoufunc.
 *
 * Each entry maps an ask operation to its middleware requirements:
 *   check_login      — true: reject if not logged in
 *   require_rights   — minimum global rights level (0=any, 1=mod, 2=admin, 3=super, 10=root)
 *   check_board_mod  — true: allow if user is board moderator (m1-m4)
 *   check_bid1       — true: if bid==1, require login (special board restriction)
 *
 * Entries are sorted by increasing middleware strictness.
 */
return array(
    // ================================================================
    // Group 1: Public — no login required
    // ================================================================
    'bbsinfo'     => array('check_login' => false, 'require_rights' => 0),
    'hot'         => array('check_login' => false, 'require_rights' => 0),
    'global_top'  => array('check_login' => false, 'require_rights' => 0),
    'tidinfo'     => array('check_login' => false, 'require_rights' => 0),
    'getpages'    => array('check_login' => false, 'require_rights' => 0),
    'getlznum'    => array('check_login' => false, 'require_rights' => 0),
    'getnum'      => array('check_login' => false, 'require_rights' => 0),
    'online'      => array('check_login' => false, 'require_rights' => 0),
    'search'      => array('check_login' => false, 'require_rights' => 0),
    'sign_today'  => array('check_login' => false, 'require_rights' => 0),
    'sign_year'   => array('check_login' => false, 'require_rights' => 0),
    'sign_user'   => array('check_login' => false, 'require_rights' => 0),
    'getuser'     => array('check_login' => false, 'require_rights' => 0),
    'userexists'  => array('check_login' => false, 'require_rights' => 0),
    'rights'      => array('check_login' => false, 'require_rights' => 0),
    'recentpost'  => array('check_login' => false, 'require_rights' => 0),
    'recentreply' => array('check_login' => false, 'require_rights' => 0),
    'lzl'         => array('check_login' => false, 'require_rights' => 0),
    'calendar'    => array('check_login' => false, 'require_rights' => 0),
    '__view'      => array('check_login' => false, 'require_rights' => 0),

    // ================================================================
    // Group 2: Login required — any authenticated user
    // ================================================================
    'post'              => array('check_login' => true, 'require_rights' => 0),
    'reply'             => array('check_login' => true, 'require_rights' => 0),
    'sendmsg'           => array('check_login' => true, 'require_rights' => 0),
    'edituser'          => array('check_login' => true, 'require_rights' => 0),
    'changepsd'         => array('check_login' => true, 'require_rights' => 0),
    'currentUserInfo'   => array('check_login' => true, 'require_rights' => 0),
    'editpreview'       => array('check_login' => true, 'require_rights' => 0),
    'msg'               => array('check_login' => true, 'require_rights' => 0),
    'attach'            => array('check_login' => true, 'require_rights' => 0),
    'attachdl'          => array('check_login' => true, 'require_rights' => 0),
    'unusedattachinfo'  => array('check_login' => true, 'require_rights' => 0),
    'delattach'         => array('check_login' => true, 'require_rights' => 0),
    'favorite_add'      => array('check_login' => true, 'require_rights' => 0),
    'favorite_remove'   => array('check_login' => true, 'require_rights' => 0),
    'favorite_list'     => array('check_login' => true, 'require_rights' => 0),
    'favorite_sort'     => array('check_login' => true, 'require_rights' => 0),
    'favorite_count'    => array('check_login' => true, 'require_rights' => 0),
    'favorite_check'    => array('check_login' => true, 'require_rights' => 0),

    // ================================================================
    // Group 3: Login required + board moderator OR self-service
    //          (function-level auth for author vs mod)
    // ================================================================
    'edit'        => array('check_login' => true, 'require_rights' => 0, 'check_board_mod' => true),
    'delete'      => array('check_login' => true, 'require_rights' => 0, 'check_board_mod' => true),

    // ================================================================
    // Group 4: Login required + board moderator OR rights >= 1
    // ================================================================
    'lock'        => array('check_login' => true, 'require_rights' => 1, 'check_board_mod' => true),
    'extr'        => array('check_login' => true, 'require_rights' => 1, 'check_board_mod' => true),
    'top'         => array('check_login' => true, 'require_rights' => 1, 'check_board_mod' => true),

    // ================================================================
    // Group 5: Login required + specific rights level (admin only)
    // ================================================================
    'move'                => array('check_login' => true, 'require_rights' => 2),
    'global_top_action'   => array('check_login' => true, 'require_rights' => 2),
    'boardcast'           => array('check_login' => true, 'require_rights' => 3),
    'admin_reset_password' => array('check_login' => true, 'require_rights' => 10),

    // ================================================================
    // Group 6: Auth operations — handle login/session themselves
    // ================================================================
    'login'       => array('check_login' => false, 'require_rights' => 0),
    'logout'      => array('check_login' => false, 'require_rights' => 0),
    'register'    => array('check_login' => false, 'require_rights' => 0),

    // ================================================================
    // Group 7: Special paths — conditional login (bid=1)
    // ================================================================
    '__bbs_default' => array('check_login' => false, 'require_rights' => 0, 'check_bid1' => true),
    '__tid_default' => array('check_login' => false, 'require_rights' => 0, 'check_bid1' => true),

    // ================================================================
    // Fallback — safe default
    // ================================================================
    '_default'    => array('check_login' => false, 'require_rights' => 0),
);
