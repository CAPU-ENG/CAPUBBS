<?php
// /bbs/manage/index.php — 管理工具汇总页
include("../lib/mainfunc.php");

$users = getuser();
$username = $users['username'];
$rights = intval($users['rights']);

$can_access = ($username != '' && $rights >= 1);
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <title>管理工具 - CAPUBBS</title>
    <link rel="stylesheet" type="text/css" href="../lib/general.css">
    <link rel="stylesheet" type="text/css" href="../main/style.css">
    <link rel="shortcut icon" href="/assets/images/capu.jpg">
    <style>
        .manage-container { max-width: 600px; margin: 40px auto; font-family: "Microsoft YaHei", sans-serif; }
        .manage-header { background: #337ab7; color: #fff; padding: 14px 20px;
                         border-radius: 4px 4px 0 0; font-size: 16px; }
        .manage-list { border: 1px solid #ddd; border-top: none; }
        .manage-item { display: flex; align-items: center; padding: 14px 20px;
                       border-bottom: 1px solid #eee; text-decoration: none; color: #333; }
        .manage-item:hover { background: #f5f5f5; }
        .manage-item-icon { font-size: 20px; margin-right: 14px; width: 28px; text-align: center; }
        .manage-item-title { font-weight: bold; }
        .manage-item-desc { font-size: 12px; color: #999; margin-top: 2px; }
        .manage-item-arrow { margin-left: auto; color: #ccc; font-size: 18px; }
        .no-access { text-align: center; padding: 60px; color: #999; font-size: 14px; }
        .no-access a { color: #337ab7; }
        .back-link { display: inline-block; margin: 0 20px 10px; color: #337ab7; text-decoration: none; font-size: 13px; }
        .back-link:hover { text-decoration: underline; }
    </style>
</head>
<body>

<div class="manage-container">

<a class="back-link" href="../main/">&larr; 返回论坛</a>

<?php if (!$can_access): ?>
    <?php if ($username == ""): ?>
        <div class="no-access">请先<a href="../index/">登录</a>。</div>
    <?php else: ?>
        <div class="no-access">权限不足：仅限版主或管理员访问此页面。</div>
    <?php endif; ?>
<?php else: ?>

    <div class="manage-header">管理工具</div>

    <div class="manage-list">

        <?php if ($rights >= 5): ?>
            <a class="manage-item" href="trash/">
            <span class="manage-item-icon">&#128465;</span>
            <span>
                <div class="manage-item-title">回收站管理</div>
                <div class="manage-item-desc">查看、恢复或永久删除被删帖子和主题</div>
            </span>
            <span class="manage-item-arrow">&rsaquo;</span>
            </a>
        <?php endif; ?>

        <?php if ($rights >= 1): ?>
        <a class="manage-item" href="post_activity/">
            <span class="manage-item-icon">&#128221;</span>
            <span>
                <div class="manage-item-title">报名帖发布</div>
                <div class="manage-item-desc">创建和管理活动报名帖</div>
            </span>
            <span class="manage-item-arrow">&rsaquo;</span>
        </a>
        <?php endif; ?>

        <?php if (CAPUBBS_ENABLE_EMAIL_MUTE && $rights >= 1): ?>
        <a class="manage-item" href="email_mute/">
            <span class="manage-item-icon">&#128231;</span>
            <span>
                <div class="manage-item-title">邮箱禁言管理</div>
                <div class="manage-item-desc">按邮箱地址设置禁言，该邮箱下所有账号将被限制发言</div>
            </span>
            <span class="manage-item-arrow">&rsaquo;</span>
        </a>
        <?php endif; ?>

        <?php if ($rights >= 10): ?>
        <a class="manage-item" href="reset_password/">
            <span class="manage-item-icon">&#128273;</span>
            <span>
                <div class="manage-item-title">重置密码</div>
                <div class="manage-item-desc">重置用户密码（超级管理员）</div>
            </span>
            <span class="manage-item-arrow">&rsaquo;</span>
        </a>
        <?php endif; ?>

    </div>

<?php endif; ?>

</div>

</body>
</html>
