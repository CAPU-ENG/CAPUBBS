<?php

class CapubbsEmailVerificationService {
    private $verificationRepository;
    private $muteRepository;
    private $userRepository;
    private $permissionService;
    private $generateCodeCallback;
    private $sendVerifyCodeCallback;
    private $sendResetNoticeCallback;

    public function __construct(
        $verificationRepository,
        $muteRepository,
        $userRepository,
        $permissionService,
        $generateCodeCallback,
        $sendVerifyCodeCallback,
        $sendResetNoticeCallback
    ) {
        $this->verificationRepository = $verificationRepository;
        $this->muteRepository = $muteRepository;
        $this->userRepository = $userRepository;
        $this->permissionService = $permissionService;
        $this->generateCodeCallback = $generateCodeCallback;
        $this->sendVerifyCodeCallback = $sendVerifyCodeCallback;
        $this->sendResetNoticeCallback = $sendResetNoticeCallback;
    }

    public static function isPkuEmailAddress($email) {
        if (preg_match('/^\d{10}@(.+\.)*pku\.edu\.cn$/i', $email)) return true;
        if (preg_match('/^\d{10}@bjmu\.edu\.cn$/i', $email)) return true;
        return false;
    }

    public function legacyIsMuted($username, $bid) {
        return $this->userRepository->findMuteReason($username, $bid);
    }

    public function canSendCode($username, $email, $type) {
        $since = time() - 60;
        return $this->verificationRepository->countRecentByUsernameEmailType($username, $email, $type, $since) === 0;
    }

    public function invalidateCodes($username, $email, $type) {
        $this->verificationRepository->invalidateByUsernameEmailType($username, $email, $type);
    }

    public function legacySendRegisterCode($params) {
        if (!CAPUBBS_ENABLE_EMAIL_VERIFY) {
            return array(array('code' => strval(ApiError::FEATURE_DISABLED), 'msg' => '邮箱验证功能已被管理员关闭。'));
        }

        $email = isset($params['email']) ? trim($params['email']) : '';
        if ($email === '') {
            return array(array('code' => strval(ApiError::MISSING_FIELD), 'msg' => '请输入邮箱地址。'));
        }

        if (!self::isPkuEmailAddress($email)) {
            return array(array('code' => strval(ApiError::INVALID_EMAIL_DOMAIN), 'msg' => '仅支持 学号@*.pku.edu.cn 或 学号@bjmu.edu.cn（学号为10位数字）。'));
        }

        if ($this->verificationRepository->countRecentByEmailType($email, 'register', time() - 60) > 0) {
            return array(array('code' => strval(ApiError::VERIFY_RATE_LIMITED), 'msg' => '发送过于频繁，请1分钟后再试。'));
        }

        $this->verificationRepository->invalidateByEmailType($email, 'register');
        $code = $this->generateCode();
        $now = time();
        $expires = $now + intval(CAPUBBS_VERIFY_CODE_EXPIRE) * 60;
        if (!$this->verificationRepository->create('', $email, $code, 'register', $now, $expires)) {
            return CapubbsLegacyResultAdapter::report('8', '数据库错误: ' . $this->verificationRepository->lastError());
        }

        $result = $this->sendVerifyCode($email, $code);
        if (!$this->isSendSuccess($result)) {
            return CapubbsLegacyResultAdapter::report('8', '邮件发送失败: ' . $this->extractSendMessage($result));
        }

        return array(array('code' => '0', 'msg' => '验证码已发送，请检查邮箱。'));
    }

    public function legacySendVerifyCode($token, $params) {
        if (!CAPUBBS_ENABLE_EMAIL_VERIFY) {
            return array(array('code' => strval(ApiError::FEATURE_DISABLED), 'msg' => '邮箱验证功能已被管理员关闭。'));
        }

        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return CapubbsLegacyResultAdapter::report('1', '会话超时，请重新登录。');
        }

        $username = $user['username'];
        $type = isset($params['type']) ? $params['type'] : 'verify_existing';
        if (!in_array($type, array('register', 'change_email', 'verify_existing'))) {
            return CapubbsLegacyResultAdapter::report('14', '无效的验证类型。');
        }

        if ($type === 'change_email') {
            $targetEmail = isset($params['new_email']) ? trim($params['new_email']) : '';
            if ($targetEmail === '') {
                return CapubbsLegacyResultAdapter::report('3', '缺少新邮箱地址。');
            }
            if (isset($user['mail']) && $targetEmail === $user['mail']) {
                return CapubbsLegacyResultAdapter::report('3', '新邮箱与当前邮箱相同，无需更换。');
            }
        } else {
            $targetEmail = isset($user['mail']) ? trim($user['mail']) : '';
            if ($targetEmail === '') {
                return CapubbsLegacyResultAdapter::report('3', '您尚未设置邮箱，请先在编辑资料页面设置邮箱。');
            }
        }

        if (!self::isPkuEmailAddress($targetEmail)) {
            return array(array('code' => strval(ApiError::INVALID_EMAIL_DOMAIN), 'msg' => '仅支持 学号@*.pku.edu.cn 或 学号@bjmu.edu.cn。'));
        }

        if (!$this->canSendCode($username, $targetEmail, $type)) {
            return array(array('code' => strval(ApiError::VERIFY_RATE_LIMITED), 'msg' => '发送过于频繁，请1分钟后再试。'));
        }

        $this->invalidateCodes($username, $targetEmail, $type);
        $code = $this->generateCode();
        $now = time();
        $expires = $now + intval(CAPUBBS_VERIFY_CODE_EXPIRE) * 60;
        if (!$this->verificationRepository->create($username, $targetEmail, $code, $type, $now, $expires)) {
            return CapubbsLegacyResultAdapter::report('8', '数据库错误: ' . $this->verificationRepository->lastError());
        }

        $result = $this->sendVerifyCode($targetEmail, $code);
        if (!$this->isSendSuccess($result)) {
            return CapubbsLegacyResultAdapter::report('8', '邮件发送失败: ' . $this->extractSendMessage($result));
        }

        return array(array('code' => '0', 'msg' => '验证码已发送，请检查邮箱。'));
    }

    public function legacyVerifyEmail($token, $params) {
        if (!CAPUBBS_ENABLE_EMAIL_VERIFY) {
            return array(array('code' => strval(ApiError::FEATURE_DISABLED), 'msg' => '邮箱验证功能已被管理员关闭。'));
        }

        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return CapubbsLegacyResultAdapter::report('1', '会话超时，请重新登录。');
        }

        $username = $user['username'];
        $code = isset($params['code']) ? trim($params['code']) : '';
        $type = isset($params['type']) ? $params['type'] : 'verify_existing';
        if ($code === '') {
            return CapubbsLegacyResultAdapter::report('3', '缺少验证码。');
        }

        $row = $this->verificationRepository->findLatestUsableByUsernameCodeType($username, $code, $type);
        if (!$row) {
            return array(array('code' => strval(ApiError::VERIFY_CODE_INVALID), 'msg' => '验证码无效。'));
        }
        if (intval(isset($row['expires_at']) ? $row['expires_at'] : 0) < time()) {
            return array(array('code' => strval(ApiError::VERIFY_CODE_EXPIRED), 'msg' => '验证码已过期，请重新发送。'));
        }

        $verificationId = intval(isset($row['id']) ? $row['id'] : 0);
        $this->verificationRepository->markUsedById($verificationId);
        $verifiedEmail = isset($row['email']) ? $row['email'] : '';

        if ($type === 'change_email') {
            $this->userRepository->updateEmailAndVerified($username, $verifiedEmail);
        } else {
            $this->userRepository->updateVerifiedByUsername($username);
        }

        return array(array('code' => '0', 'msg' => '邮箱验证成功。'));
    }

    public function legacySendResetPasswordCode($params) {
        if (!CAPUBBS_ENABLE_EMAIL_VERIFY) {
            return array(array('code' => strval(ApiError::FEATURE_DISABLED), 'msg' => '邮箱验证功能已被管理员关闭。'));
        }

        $email = isset($params['email']) ? trim($params['email']) : '';
        if ($email === '') {
            return CapubbsLegacyResultAdapter::report('3', '请输入邮箱地址。');
        }

        if (!self::isPkuEmailAddress($email)) {
            return array(array('code' => strval(ApiError::INVALID_EMAIL_DOMAIN), 'msg' => '仅支持 学号@*.pku.edu.cn 或 学号@bjmu.edu.cn。'));
        }

        $user = $this->userRepository->findVerifiedUserByEmail($email);
        if (!$user || !isset($user['username'])) {
            return array(array('code' => '0', 'msg' => '验证码已发送，请检查邮箱。'));
        }

        $username = $user['username'];
        $type = 'reset_password';
        if (!$this->canSendCode($username, $email, $type)) {
            return array(array('code' => strval(ApiError::VERIFY_RATE_LIMITED), 'msg' => '发送过于频繁，请1分钟后再试。'));
        }

        $this->invalidateCodes($username, $email, $type);
        $code = $this->generateCode();
        $now = time();
        $expires = $now + intval(CAPUBBS_VERIFY_CODE_EXPIRE) * 60;
        if (!$this->verificationRepository->create($username, $email, $code, $type, $now, $expires)) {
            return CapubbsLegacyResultAdapter::report('8', '数据库错误: ' . $this->verificationRepository->lastError());
        }

        $result = $this->sendVerifyCode($email, $code);
        if (!$this->isSendSuccess($result)) {
            return CapubbsLegacyResultAdapter::report('8', '邮件发送失败: ' . $this->extractSendMessage($result));
        }

        return array(array('code' => '0', 'msg' => '验证码已发送，请检查邮箱。'));
    }

    public function legacyResetPasswordByEmail($params) {
        if (!CAPUBBS_ENABLE_EMAIL_VERIFY) {
            return array(array('code' => strval(ApiError::FEATURE_DISABLED), 'msg' => '邮箱验证功能已被管理员关闭。'));
        }

        $email = isset($params['email']) ? trim($params['email']) : '';
        $code = isset($params['code']) ? trim($params['code']) : '';
        if ($email === '' || $code === '') {
            return CapubbsLegacyResultAdapter::report('3', '缺少参数。');
        }

        if (!self::isPkuEmailAddress($email)) {
            return array(array('code' => strval(ApiError::INVALID_EMAIL_DOMAIN), 'msg' => '仅支持 学号@*.pku.edu.cn 或 学号@bjmu.edu.cn。'));
        }

        $row = $this->verificationRepository->findLatestUsableByEmailCodeType($email, $code, 'reset_password');
        if (!$row) {
            return array(array('code' => strval(ApiError::VERIFY_CODE_INVALID), 'msg' => '验证码无效。'));
        }
        if (intval(isset($row['expires_at']) ? $row['expires_at'] : 0) < time()) {
            return array(array('code' => strval(ApiError::VERIFY_CODE_EXPIRED), 'msg' => '验证码已过期，请重新发送。'));
        }

        $verificationId = intval(isset($row['id']) ? $row['id'] : 0);
        $this->verificationRepository->markUsedById($verificationId);

        $username = isset($row['username']) ? $row['username'] : '';
        $newPassword = $this->generateResetPassword();
        $this->userRepository->updatePasswordAndTokenTimeByUsername($username, md5($newPassword), 0);
        $this->sendResetNotice($email, $username, $newPassword);

        return array(array('code' => '0', 'msg' => '密码已重置，新密码已发送至您的邮箱，请登录后尽快修改。'));
    }

    public function legacyMuteEmail($token, $params) {
        if (!CAPUBBS_ENABLE_EMAIL_MUTE) {
            return array(array('code' => strval(ApiError::FEATURE_DISABLED), 'msg' => '邮箱禁言功能已被管理员关闭。'));
        }

        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return CapubbsLegacyResultAdapter::report('1', '会话超时，请重新登录。');
        }

        $email = isset($params['email']) ? trim($params['email']) : '';
        if ($email === '') {
            return CapubbsLegacyResultAdapter::report('3', '缺少邮箱地址。');
        }
        if (!self::isPkuEmailAddress($email)) {
            return array(array('code' => strval(ApiError::INVALID_EMAIL_DOMAIN), 'msg' => '仅支持 学号@*.pku.edu.cn 或 学号@bjmu.edu.cn。'));
        }

        $reason = isset($params['reason']) ? $params['reason'] : '';
        $operator = $user['username'];
        $now = time();
        $existing = $this->muteRepository->findByEmail($email);
        if ($existing) {
            if (intval(isset($existing['active']) ? $existing['active'] : 0) === 1) {
                return array(array('code' => strval(ApiError::EMAIL_ALREADY_MUTED), 'msg' => '该邮箱已被禁言。'));
            }
            $this->muteRepository->reactivate(intval($existing['id']), $operator, $reason, $now);
            return array(array('code' => '0', 'msg' => '已禁言邮箱 ' . $email));
        }

        $this->muteRepository->create($email, $operator, $reason, $now);
        return array(array('code' => '0', 'msg' => '已禁言邮箱 ' . $email));
    }

    public function legacyUnmuteEmail($token, $params) {
        if (!CAPUBBS_ENABLE_EMAIL_MUTE) {
            return array(array('code' => strval(ApiError::FEATURE_DISABLED), 'msg' => '邮箱禁言功能已被管理员关闭。'));
        }

        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return CapubbsLegacyResultAdapter::report('1', '会话超时，请重新登录。');
        }

        $email = isset($params['email']) ? trim($params['email']) : '';
        if ($email === '') {
            return CapubbsLegacyResultAdapter::report('3', '缺少邮箱地址。');
        }

        $this->muteRepository->deactivateActiveByEmail($email);
        if ($this->muteRepository->affectedRows() === 0) {
            return array(array('code' => strval(ApiError::EMAIL_NOT_MUTED), 'msg' => '该邮箱未被禁言。'));
        }

        return array(array('code' => '0', 'msg' => '已取消禁言邮箱 ' . $email));
    }

    public function legacyListEmailMutes($token) {
        if (!CAPUBBS_ENABLE_EMAIL_MUTE) {
            return array(array('code' => strval(ApiError::FEATURE_DISABLED), 'msg' => '邮箱禁言功能已被管理员关闭。'));
        }

        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return CapubbsLegacyResultAdapter::report('1', '会话超时，请重新登录。');
        }

        return $this->muteRepository->findActiveList();
    }

    public function legacyToggleEmailVisible($token, $params) {
        $user = $this->userRepository->findByToken($token);
        if (!$user || !isset($user['username'])) {
            return array(array('code' => '1', 'msg' => '会话超时，请重新登录。'));
        }

        $emailVisible = isset($params['email_visible']) ? intval($params['email_visible']) : 0;
        $this->userRepository->updateEmailVisible($user['username'], $emailVisible);
        return array(array('code' => '0'));
    }

    public function legacyVerifiedCount() {
        if (!CAPUBBS_ENABLE_EMAIL_VERIFY) {
            return array(array('count' => '0'));
        }

        return array(array('count' => strval($this->userRepository->countVerifiedUsers())));
    }

    private function generateCode() {
        return call_user_func($this->generateCodeCallback);
    }

    private function sendVerifyCode($email, $code) {
        return call_user_func($this->sendVerifyCodeCallback, $email, $code);
    }

    private function sendResetNotice($email, $username, $newPassword) {
        return call_user_func($this->sendResetNoticeCallback, $email, $username, $newPassword);
    }

    private function isSendSuccess($result) {
        return is_array($result) && isset($result['success']) && $result['success'];
    }

    private function extractSendMessage($result) {
        if (is_array($result) && isset($result['message'])) {
            return $result['message'];
        }
        return 'unknown';
    }

    private function generateResetPassword() {
        $chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        $password = '';
        for ($i = 0; $i < 8; $i++) {
            $password .= $chars[mt_rand(0, strlen($chars) - 1)];
        }
        return $password;
    }
}
