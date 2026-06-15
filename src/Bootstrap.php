<?php

require_once __DIR__ . '/Support/LegacyResultAdapter.php';
require_once __DIR__ . '/Repository/UserSigRepository.php';
require_once __DIR__ . '/Repository/UserRepository.php';
require_once __DIR__ . '/Repository/BoardRepository.php';
require_once __DIR__ . '/Repository/SignRepository.php';
require_once __DIR__ . '/Repository/ThreadRepository.php';
require_once __DIR__ . '/Repository/PostRepository.php';
require_once __DIR__ . '/Repository/NestedReplyRepository.php';
require_once __DIR__ . '/Repository/FavoriteRepository.php';
require_once __DIR__ . '/Repository/ThreadViewRepository.php';
require_once __DIR__ . '/Repository/MessageRepository.php';
require_once __DIR__ . '/Repository/AttachmentRepository.php';
require_once __DIR__ . '/Repository/EditHistoryRepository.php';
require_once __DIR__ . '/Repository/TrashRepository.php';
require_once __DIR__ . '/Repository/ActivityRepository.php';
require_once __DIR__ . '/Service/PermissionService.php';
require_once __DIR__ . '/Service/UserService.php';
require_once __DIR__ . '/Service/AuthService.php';
require_once __DIR__ . '/Service/ThreadReadService.php';
require_once __DIR__ . '/Service/PostService.php';
require_once __DIR__ . '/Service/NestedReplyService.php';
require_once __DIR__ . '/Service/FavoriteService.php';
require_once __DIR__ . '/Service/MessageService.php';
require_once __DIR__ . '/Service/AttachmentService.php';
require_once __DIR__ . '/Service/NotificationService.php';
require_once __DIR__ . '/Service/EditHistoryService.php';
require_once __DIR__ . '/Service/TrashService.php';

function capubbs_user_sig_repository($con) {
    return new CapubbsUserSigRepository($con);
}

function capubbs_user_repository($con) {
    return new CapubbsUserRepository($con, capubbs_user_sig_repository($con));
}

function capubbs_board_repository($con) {
    return new CapubbsBoardRepository($con);
}

function capubbs_sign_repository($con) {
    return new CapubbsSignRepository($con);
}

function capubbs_thread_repository($con) {
    return new CapubbsThreadRepository($con);
}

function capubbs_post_repository($con) {
    return new CapubbsPostRepository($con);
}

function capubbs_nested_reply_repository($con) {
    return new CapubbsNestedReplyRepository($con);
}

function capubbs_favorite_repository($con) {
    return new CapubbsFavoriteRepository($con);
}

function capubbs_thread_view_repository($con) {
    return new CapubbsThreadViewRepository($con);
}

function capubbs_message_repository($con) {
    return new CapubbsMessageRepository($con);
}

function capubbs_attachment_repository($con) {
    return new CapubbsAttachmentRepository($con);
}

function capubbs_edit_history_repository($con) {
    return new CapubbsEditHistoryRepository($con);
}

function capubbs_trash_repository($con) {
    return new CapubbsTrashRepository($con);
}

function capubbs_activity_repository($con) {
    return new CapubbsActivityRepository($con);
}

function capubbs_permission_service($con) {
    return new CapubbsPermissionService(
        capubbs_user_repository($con),
        capubbs_board_repository($con)
    );
}

function capubbs_user_service($con) {
    return new CapubbsUserService(
        capubbs_user_repository($con),
        capubbs_permission_service($con)
    );
}

function capubbs_auth_service($con) {
    return new CapubbsAuthService(
        capubbs_user_repository($con),
        capubbs_sign_repository($con)
    );
}

function capubbs_notification_service($con) {
    return new CapubbsNotificationService(
        capubbs_message_repository($con),
        capubbs_user_repository($con)
    );
}

function capubbs_thread_read_service($con) {
    return new CapubbsThreadReadService(
        capubbs_thread_repository($con),
        capubbs_post_repository($con),
        capubbs_user_repository($con),
        capubbs_thread_view_repository($con)
    );
}

function capubbs_post_service($con) {
    return new CapubbsPostService(
        capubbs_board_repository($con),
        capubbs_thread_repository($con),
        capubbs_post_repository($con),
        capubbs_user_repository($con),
        capubbs_message_repository($con),
        capubbs_attachment_repository($con),
        capubbs_edit_history_repository($con),
        capubbs_trash_repository($con),
        capubbs_activity_repository($con),
        capubbs_permission_service($con),
        capubbs_notification_service($con)
    );
}

function capubbs_nested_reply_service($con) {
    return new CapubbsNestedReplyService(
        capubbs_nested_reply_repository($con),
        capubbs_post_repository($con),
        capubbs_thread_repository($con),
        capubbs_user_repository($con),
        capubbs_message_repository($con),
        capubbs_board_repository($con),
        capubbs_notification_service($con)
    );
}

function capubbs_favorite_service($con) {
    return new CapubbsFavoriteService(
        capubbs_favorite_repository($con),
        capubbs_user_repository($con)
    );
}

function capubbs_message_service($con) {
    return new CapubbsMessageService(
        capubbs_message_repository($con),
        capubbs_user_repository($con),
        capubbs_permission_service($con)
    );
}

function capubbs_attachment_service($con) {
    $attachRoot = isset($GLOBALS['attachroot']) ? $GLOBALS['attachroot'] : (__DIR__ . '/../bbs/attachment/');
    return new CapubbsAttachmentService(
        capubbs_attachment_repository($con),
        capubbs_user_repository($con),
        $attachRoot
    );
}

function capubbs_edit_history_service($con) {
    return new CapubbsEditHistoryService(
        capubbs_edit_history_repository($con),
        capubbs_post_repository($con),
        capubbs_thread_repository($con),
        capubbs_permission_service($con)
    );
}

function capubbs_trash_service($con) {
    return new CapubbsTrashService(
        capubbs_trash_repository($con),
        capubbs_thread_repository($con),
        capubbs_post_repository($con),
        capubbs_board_repository($con),
        capubbs_user_repository($con),
        capubbs_permission_service($con)
    );
}
