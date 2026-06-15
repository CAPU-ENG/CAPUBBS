<?php

require_once __DIR__ . '/Support/LegacyResultAdapter.php';
require_once __DIR__ . '/Repository/UserSigRepository.php';
require_once __DIR__ . '/Repository/UserRepository.php';
require_once __DIR__ . '/Repository/BoardRepository.php';
require_once __DIR__ . '/Repository/SignRepository.php';
require_once __DIR__ . '/Service/PermissionService.php';
require_once __DIR__ . '/Service/UserService.php';
require_once __DIR__ . '/Service/AuthService.php';

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
