<?php
// /bbs/manage/email_mute/index.php — 邮箱禁言管理
include("../../lib/mainfunc.php");
include_once "../../../config.php";

if (!CAPUBBS_ENABLE_EMAIL_MUTE) {
    echo '<html><head><meta charset="utf-8"><link rel="stylesheet" href="../../lib/general.css"></head><body>';
    echo '<p style="text-align:center;color:#999;margin-top:100px;">管理员已关闭邮箱禁言功能。</p>';
    echo '</body></html>';
    exit;
}

$users = getuser();
$username = $users['username'];
$rights = intval($users['rights']);

if ($username == '' || $rights < 1) {
    echo '<html><head><meta charset="utf-8"><link rel="stylesheet" href="../../lib/general.css"></head><body>';
    echo '<p style="text-align:center;color:#999;margin-top:100px;">权限不足：仅限版主或管理员访问。</p>';
    echo '</body></html>';
    exit;
}

$mutes_result = mainfunc(array("ask" => "listEmailMutes"));
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <title>邮箱禁言管理 - CAPUBBS</title>
    <link rel="stylesheet" type="text/css" href="../../lib/general.css">
    <link rel="stylesheet" type="text/css" href="../../main/style.css">
    <link rel="shortcut icon" href="/assets/images/capu.jpg">
    <script src="../../lib/jquery.min.js"></script>
    <script src="/assets/js/api.js"></script>
    <style>
        .mute-container { max-width: 700px; margin: 40px auto; font-family: "Microsoft YaHei", sans-serif; }
        .mute-header { font-size: 18px; color: #333; margin-bottom: 20px; }
        .back-link { display: inline-block; margin-bottom: 15px; color: #337ab7; text-decoration: none; font-size: 13px; }
        .back-link:hover { text-decoration: underline; }
        .add-form { background: #fff; padding: 20px; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); margin-bottom: 25px; }
        .add-form input[type="text"] { padding: 6px 10px; border: 1px solid #ddd; border-radius: 3px; font-size: 13px; width: 220px; }
        .add-form button { padding: 6px 16px; background: #337ab7; color: #fff; border: none; border-radius: 3px; cursor: pointer; font-size: 13px; }
        .add-form button:hover { background: #286090; }
        .mute-table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
        .mute-table th { background: #f5f5f5; padding: 10px 12px; text-align: left; font-size: 13px; color: #555; border-bottom: 2px solid #ddd; }
        .mute-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #eee; }
        .mute-table .btn-unmute { padding: 4px 12px; background: #d9534f; color: #fff; border: none; border-radius: 3px; cursor: pointer; font-size: 12px; }
        .mute-table .btn-unmute:hover { background: #c9302c; }
        .msg { margin: 10px 0; font-size: 13px; }
        .msg-success { color: #4CAF50; }
        .msg-error { color: #f44336; }
        .empty-msg { text-align: center; color: #999; padding: 40px; }
    </style>
</head>
<body>

<div class="mute-container">
    <a class="back-link" href="../../main/">&larr; 返回论坛</a> |
    <a class="back-link" href="../">&larr; 管理工具</a>

    <div class="mute-header">邮箱禁言管理</div>

    <div class="add-form">
        <input type="text" id="muteEmail" placeholder="输入PKU邮箱地址">
        <input type="text" id="muteReason" placeholder="禁言原因（可选）" style="margin-left:8px;">
        <button onclick="addMute()" style="margin-left:8px;">添加禁言</button>
        <div class="msg" id="addMsg"></div>
    </div>

    <?php
    $mutes = array();
    if (!empty($mutes_result)) {
        $first = $mutes_result[0];
        if (isset($first['code']) && $first['code'] !== '0') {
            $mutes = array();
        } else {
            $mutes = $mutes_result;
        }
    }
    ?>

    <?php if (empty($mutes)): ?>
        <div class="empty-msg">当前没有被禁言的邮箱。</div>
    <?php else: ?>
        <table class="mute-table">
        <tr>
            <th>邮箱</th>
            <th>操作人</th>
            <th>原因</th>
            <th>禁言时间</th>
            <th>操作</th>
        </tr>
        <?php foreach ($mutes as $m): ?>
        <?php
            $email_addr = isset($m['email']) ? htmlspecialchars($m['email']) : '';
            $muted_by = isset($m['muted_by']) ? htmlspecialchars($m['muted_by']) : '';
            $reason = isset($m['reason']) ? htmlspecialchars($m['reason']) : '';
            $created = isset($m['created_at']) ? date('Y-m-d H:i', intval($m['created_at'])) : '';
        ?>
        <tr>
            <td><?php echo $email_addr; ?></td>
            <td><?php echo $muted_by; ?></td>
            <td><?php echo $reason ?: '-'; ?></td>
            <td><?php echo $created; ?></td>
            <td><button class="btn-unmute" data-email="<?php echo htmlspecialchars($email_addr, ENT_QUOTES, 'UTF-8'); ?>" onclick="removeMute(this.getAttribute('data-email'))">取消禁言</button></td>
        </tr>
        <?php endforeach; ?>
        </table>
    <?php endif; ?>
</div>

<script>
function addMute() {
    var email = $('#muteEmail').val().trim();
    if (!email) { $('#addMsg').removeClass('msg-success').addClass('msg-error').text('请输入邮箱地址。'); return; }

    var reason = $('#muteReason').val().trim();
    $('#addMsg').removeClass('msg-error msg-success').text('处理中...');

    API.call('muteEmail', { email: email, reason: reason })
        .done(function(resp) {
            if (resp.code === 0) {
                $('#addMsg').addClass('msg-success').text(resp.message || '操作成功');
                setTimeout(function() { location.reload(); }, 1000);
            } else {
                $('#addMsg').addClass('msg-error').text(resp.message || '操作失败');
            }
        })
        .fail(function(err) {
            $('#addMsg').addClass('msg-error').text(err.message || '网络错误，请重试。');
        });
}

function removeMute(email) {
    if (!confirm('确定要取消禁言 ' + email + ' 吗？')) return;

    API.call('unmuteEmail', { email: email })
        .done(function(resp) {
            if (resp.code === 0) {
                location.reload();
            } else {
                alert(resp.message || '操作失败');
            }
        })
        .fail(function(err) {
            alert(err.message || '网络错误，请重试。');
        });
}
</script>
</body>
</html>
