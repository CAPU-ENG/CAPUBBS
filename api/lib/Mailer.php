<?php
/**
 * Mailer.php — SMTP 邮件发送工具类。
 *
 * 从 scripts/test_aliyun_mail.php 提取 SMTP 逻辑，封装为静态工具类。
 * SMTP 配置从 config.php 常量读取。
 */

class Mailer {

    public static function generateCode() {
        $code = '';
        for ($i = 0; $i < 6; $i++) {
            $code .= '' . mt_rand(0, 9);
        }
        return $code;
    }

    public static function sendVerifyCode($toEmail, $code) {
        $expire = CAPUBBS_VERIFY_CODE_EXPIRE;
        $subject = "【" . CAPUBBS_SMTP_FROM_NAME . "】邮箱验证码";
        $htmlBody = self::buildHtmlBody(CAPUBBS_SMTP_FROM_NAME, $code, $expire);
        $textBody = self::buildTextBody(CAPUBBS_SMTP_FROM_NAME, $code, $expire);
        return self::sendMail($toEmail, $subject, $htmlBody, $textBody);
    }

    public static function sendPasswordResetNotice($toEmail, $username, $newPassword) {
        $subject = "【" . CAPUBBS_SMTP_FROM_NAME . "】密码重置通知";
        $htmlBody = <<<HTML
<div style="max-width:520px;margin:0 auto;font-family:'Microsoft YaHei','PingFang SC',Arial,sans-serif;color:#333;background:#fff;">
    <div style="background:#e74c3c;padding:24px 20px;text-align:center;border-radius:8px 8px 0 0;">
        <h1 style="color:#fff;font-size:22px;margin:0;">密码重置通知</h1>
    </div>
    <div style="border:1px solid #e0e0e0;border-top:none;padding:30px 24px;border-radius:0 0 8px 8px;">
        <p style="font-size:15px;line-height:1.8;">您好，用户 <strong>{$username}</strong>，</p>
        <p style="font-size:15px;line-height:1.8;">您的密码已被重置为 <strong style="color:#e74c3c;">{$newPassword}</strong>。</p>
        <p style="font-size:14px;line-height:1.8;">请尽快登录并修改密码，避免账号被盗。</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0 12px;" />
        <p style="text-align:center;font-size:11px;color:#bbb;">此邮件由系统自动发送，请勿回复。</p>
    </div>
</div>
HTML;
        $textBody = "【密码重置通知】\n\n"
            . "您好，用户 {$username}，\n"
            . "您的密码已被重置为 {$newPassword}。\n"
            . "请尽快登录并修改密码。\n\n"
            . "此邮件由系统自动发送，请勿回复。\n";
        return self::sendMail($toEmail, $subject, $htmlBody, $textBody);
    }

    private static function sendMail($toEmail, $subject, $htmlBody, $textBody) {
        $smtp  = CAPUBBS_SMTP_SERVER;
        $port  = CAPUBBS_SMTP_PORT;
        $user  = CAPUBBS_SMTP_USER;
        $pass  = CAPUBBS_SMTP_PASS;
        $from  = CAPUBBS_SMTP_FROM_NAME;

        $boundary = '----=_NextPart_' . md5(uniqid((string) mt_rand(), true));

        $mime  = "From: =?UTF-8?B?" . base64_encode($from) . "?= <{$user}>\r\n";
        $mime .= "To: {$toEmail}\r\n";
        $mime .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
        $mime .= "MIME-Version: 1.0\r\n";
        $mime .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
        $mime .= "\r\n";
        $mime .= "--{$boundary}\r\n";
        $mime .= "Content-Type: text/plain; charset=utf-8\r\n";
        $mime .= "Content-Transfer-Encoding: base64\r\n";
        $mime .= "\r\n";
        $mime .= chunk_split(base64_encode($textBody));
        $mime .= "--{$boundary}\r\n";
        $mime .= "Content-Type: text/html; charset=utf-8\r\n";
        $mime .= "Content-Transfer-Encoding: base64\r\n";
        $mime .= "\r\n";
        $mime .= chunk_split(base64_encode($htmlBody));
        $mime .= "--{$boundary}--\r\n";

        $errno = 0;
        $errstr = '';
        $fp = fsockopen('ssl://' . $smtp, $port, $errno, $errstr, 10);
        if (!$fp) {
            return ['success' => false, 'message' => "连接 SMTP 失败: {$errstr} (errno={$errno})"];
        }

        $resp = self::smtpRead($fp);
        if (substr($resp, 0, 3) !== '220') {
            fclose($fp);
            return ['success' => false, 'message' => "SMTP 连接异常 (期望 220): {$resp}"];
        }

        self::smtpWrite($fp, "EHLO localhost\r\n");
        $resp = self::smtpRead($fp);
        if (substr($resp, 0, 3) !== '250') {
            fclose($fp);
            return ['success' => false, 'message' => "EHLO 失败 (期望 250): {$resp}"];
        }

        self::smtpWrite($fp, "AUTH LOGIN\r\n");
        $resp = self::smtpRead($fp);
        if (substr($resp, 0, 3) !== '334') {
            fclose($fp);
            return ['success' => false, 'message' => "AUTH LOGIN 失败 (期望 334): {$resp}"];
        }

        self::smtpWrite($fp, base64_encode($user) . "\r\n");
        $resp = self::smtpRead($fp);
        if (substr($resp, 0, 3) !== '334') {
            fclose($fp);
            return ['success' => false, 'message' => "用户名验证失败 (期望 334): {$resp}"];
        }

        self::smtpWrite($fp, base64_encode($pass) . "\r\n");
        $resp = self::smtpRead($fp);
        if (substr($resp, 0, 3) !== '235') {
            fclose($fp);
            return ['success' => false, 'message' => "密码验证失败 (期望 235): {$resp}。请检查 SMTP 密码是否正确。"];
        }

        self::smtpWrite($fp, "MAIL FROM: <{$user}>\r\n");
        $resp = self::smtpRead($fp);
        if (substr($resp, 0, 3) !== '250') {
            fclose($fp);
            return ['success' => false, 'message' => "MAIL FROM 失败 (期望 250): {$resp}"];
        }

        self::smtpWrite($fp, "RCPT TO: <{$toEmail}>\r\n");
        $resp = self::smtpRead($fp);
        if (substr($resp, 0, 3) !== '250') {
            fclose($fp);
            return ['success' => false, 'message' => "RCPT TO 失败 (期望 250): {$resp}。收件地址可能被拒绝。"];
        }

        self::smtpWrite($fp, "DATA\r\n");
        $resp = self::smtpRead($fp);
        if (substr($resp, 0, 3) !== '354') {
            fclose($fp);
            return ['success' => false, 'message' => "DATA 失败 (期望 354): {$resp}"];
        }

        self::smtpWrite($fp, $mime . "\r\n.\r\n");
        $resp = self::smtpRead($fp);
        if (substr($resp, 0, 3) !== '250') {
            fclose($fp);
            return ['success' => false, 'message' => "邮件发送失败 (期望 250): {$resp}"];
        }

        self::smtpWrite($fp, "QUIT\r\n");
        fclose($fp);

        return ['success' => true, 'message' => '邮件发送成功'];
    }

    private static function smtpRead($fp) {
        $response = fgets($fp, 512);
        while ($response && isset($response[3]) && $response[3] === '-') {
            $response = fgets($fp, 512);
        }
        return $response ? trim($response) : '';
    }

    private static function smtpWrite($fp, $cmd) {
        fputs($fp, $cmd);
    }

    private static function buildHtmlBody($fromName, $code, $expireMinutes) {
        return <<<HTML
<div style="max-width:520px;margin:0 auto;font-family:'Microsoft YaHei','PingFang SC',Arial,sans-serif;color:#333;background:#fff;">
    <div style="background:#1a73e8;padding:24px 20px;text-align:center;border-radius:8px 8px 0 0;">
        <h1 style="color:#fff;font-size:22px;margin:0;">{$fromName} 验证码</h1>
    </div>
    <div style="border:1px solid #e0e0e0;border-top:none;padding:30px 24px;border-radius:0 0 8px 8px;">
        <p style="font-size:15px;line-height:1.8;">您好，您正在进行邮箱验证操作。</p>
        <div style="background:#f5f7fa;border-radius:8px;padding:20px;text-align:center;margin:24px 0;">
            <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1a73e8;font-family:'Courier New',monospace;">{$code}</span>
        </div>
        <p style="font-size:14px;line-height:1.8;">
            验证码有效期为 <strong style="color:#e74c3c;">{$expireMinutes} 分钟</strong>。<br/>
            请勿将验证码泄露给他人，避免账号被盗。
        </p>
        <p style="font-size:12px;color:#999;margin-top:20px;">如果这不是您本人操作，请忽略此邮件，验证码不会生效。</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0 12px;" />
        <p style="text-align:center;font-size:11px;color:#bbb;">此邮件由系统自动发送，请勿回复。</p>
    </div>
</div>
HTML;
    }

    private static function buildTextBody($fromName, $code, $expireMinutes) {
        return "【{$fromName}】邮箱验证码\n\n"
            . "您好，您正在进行邮箱验证操作。\n\n"
            . "您的验证码是：{$code}\n"
            . "验证码有效期为 {$expireMinutes} 分钟。\n"
            . "请勿将验证码泄露给他人。\n\n"
            . "如果这不是您本人操作，请忽略此邮件。\n\n"
            . "此邮件由系统自动发送，请勿回复。\n";
    }
}
