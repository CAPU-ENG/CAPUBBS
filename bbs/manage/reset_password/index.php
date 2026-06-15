<?php
include("../../lib/mainfunc.php");
include_once "../../../config.php";
date_default_timezone_set('Asia/Shanghai');

$users = getuser();
$admin_username = $users['username'];
$admin_rights = intval($users['rights']);

$can_access = ($admin_username != '' && $admin_rights >= 10);

$message = '';
$message_type = '';
$search_result = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {

    if ($_POST['action'] === 'search') {
        $con = dbconnect_mysqli();
        $search_username = trim($_POST['search_username']);
        if ($search_username === '') {
            $message = '请输入要查询的用户名';
            $message_type = 'error';
        } else {
            $row = capubbs_user_service($con)->findAdminResetPasswordSearchUser($search_username);
            if ($row) {
                $search_result = $row;
            } else {
                $message = '用户 "' . htmlspecialchars($search_username, ENT_QUOTES, 'UTF-8') . '" 不存在';
                $message_type = 'error';
            }
        }
        mysqli_close($con);
    }

    if ($_POST['action'] === 'reset') {
        $reset_username = trim($_POST['reset_username']);
        if ($reset_username === '') {
            $message = '参数错误';
            $message_type = 'error';
        } else {
            $result = mainfunc(array(
                "ask" => "admin_reset_password",
                "target_username" => $reset_username
            ));
            $result = $result[0];
            if ($result['code'] === '0') {
                $message = '用户 "' . htmlspecialchars($reset_username, ENT_QUOTES, 'UTF-8') . '" 的密码已成功重置为 123456。该用户的所有登录会话已失效。';
                $message_type = 'success';
            } else {
                $message = '重置失败：' . htmlspecialchars($result['msg'], ENT_QUOTES, 'UTF-8');
                $message_type = 'error';
            }
        }
    }
}

$nowurl = urlencode($_SERVER["PHP_SELF"] . "?" . $_SERVER["QUERY_STRING"]);
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="apple-itunes-app" content="app-id=826386033">
<title>密码重置 - 管理员工具</title>
<script src="../../lib/jquery.min.js"></script>
<script src="../../lib/general.js"></script>
<link rel="stylesheet" href="../../lib/general.css">
<link rel="stylesheet" href="../../main/style.css">
<link rel="shortcut icon" href="/assets/images/capu.jpg">
<style>
body {
    color: #444;
    font-family: "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
}
.container {
    max-width: 640px;
    margin: 0 auto;
    padding: 0 16px;
}
.form-group {
    margin-bottom: 16px;
}
.form-group label {
    display: block;
    margin-bottom: 4px;
    font-weight: bold;
    font-size: 14px;
}
.form-group input[type="text"] {
    width: 100%;
    padding: 8px 12px;
    font-size: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}
.form-group input[type="text"]:focus {
    border-color: #66afe9;
    outline: none;
    box-shadow: 0 0 6px rgba(102,175,233,0.4);
}
.btn {
    display: inline-block;
    padding: 8px 20px;
    font-size: 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s, opacity 0.2s;
}
.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.btn-primary {
    background: #337ab7;
    color: #fff;
}
.btn-primary:hover:not(:disabled) {
    background: #286090;
}
.btn-danger {
    background: #d9534f;
    color: #fff;
}
.btn-danger:hover:not(:disabled) {
    background: #c9302c;
}
.alert {
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 14px;
}
.alert-success {
    background: #dff0d8;
    color: #3c763d;
    border: 1px solid #d6e9c6;
}
.alert-error {
    background: #f2dede;
    color: #a94442;
    border: 1px solid #ebccd1;
}
.user-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
    font-size: 14px;
}
.user-table th, .user-table td {
    padding: 8px 12px;
    border: 1px solid #ddd;
    text-align: left;
}
.user-table th {
    background: #f5f5f5;
    width: 120px;
    font-weight: bold;
}
.confirm-section {
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
}
.confirm-section label {
    font-size: 14px;
    cursor: pointer;
    user-select: none;
}
.confirm-section input[type="checkbox"] {
    margin-right: 8px;
    transform: scale(1.3);
}
.tool-header {
    border-bottom: 2px solid #d9534f;
    margin-bottom: 24px;
    padding-bottom: 8px;
}
.tool-header h2 {
    color: #d9534f;
    margin: 0;
    font-size: 20px;
}
.tool-header .badge {
    background: #d9534f;
    color: #fff;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    margin-left: 8px;
    vertical-align: middle;
}
.back-link {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #eee;
    font-size: 13px;
}
</style>
</head>
<body>

<div class="header">
<br>
<div class="user">
<?php
if ($admin_username != "") {
    $userinfo = mainfunc(array("view" => $admin_username));
    $userinfo = $userinfo[0];
    $msg = intval($userinfo['newmsg']);
    $icon = translateicon($userinfo['icon']);
    $star = intval($userinfo['star']);
    echo("<img src='$icon' class='usericon'></img>");
    echo("<div class='userinfo'>");
    echo("<a href='/bbs/user/?name=$admin_username' target='_blank'>$admin_username</a>");
    echo("&nbsp;等级：$star");
    if ($msg == 0) {
        echo("&nbsp;<a href='/bbs/home' target='_blank'>个人中心</a>");
    } else {
        echo("<br><a href='/bbs/home?pos=message' target='_blank'>您有 $msg 条未读消息</a>");
    }
    echo("<br><a href='/bbs/logout?from=$nowurl'>注销</a>");
    echo("</div>");
} else {
    echo("<span class='guest'>欢迎您，游客！<a href='/bbs/login?from=$nowurl'>登录</a></span>");
}
?>
</div>
</div>
<br>

<div class="container">

<div class="tool-header">
    <h2>密码重置 <span class="badge">管理员工具</span></h2>
</div>

<?php if (!$can_access): ?>
    <?php if ($admin_username == ""): ?>
        <div class="editip" id="editip">
            <span class="editip">您需要&nbsp;<a href="../../login?from=<?php echo $nowurl; ?>">登录</a>&nbsp;后才能访问此页面；没有账号？&nbsp;<a href="/bbs/register">现在注册</a></span>
        </div>
    <?php else: ?>
        <div class="editip" id="editip">
            <span class="editip">权限不足：仅限 rights >= 10 的管理员访问此页面。</span>
        </div>
    <?php endif; ?>
<?php else: ?>

    <?php if ($message !== ''): ?>
        <div class="alert alert-<?php echo $message_type === 'success' ? 'success' : 'error'; ?>">
            <?php echo $message; ?>
        </div>
    <?php endif; ?>

    <form method="post" id="search-form" onsubmit="return onSearchSubmit();">
        <input type="hidden" name="action" value="search">
        <div class="form-group">
            <label for="search_username">请输入要重置密码的用户名</label>
            <input type="text" name="search_username" id="search_username"
                   placeholder="输入用户名后点击查询"
                   value="<?php echo isset($_POST['search_username']) ? htmlspecialchars($_POST['search_username'], ENT_QUOTES, 'UTF-8') : ''; ?>"
                   autocomplete="off">
        </div>
        <button type="submit" class="btn btn-primary" id="search-btn">查询用户</button>
    </form>

    <?php if ($search_result !== null): ?>
        <br>
        <table class="user-table">
            <tr><th>用户名</th><td><?php echo htmlspecialchars($search_result['username'], ENT_QUOTES, 'UTF-8'); ?></td></tr>
            <tr><th>权限等级</th><td><?php echo intval($search_result['rights']); ?></td></tr>
            <tr><th>等级</th><td><?php echo intval($search_result['star']); ?></td></tr>
            <tr><th>邮箱</th><td><?php echo htmlspecialchars($search_result['mail'], ENT_QUOTES, 'UTF-8'); ?></td></tr>
            <tr><th>注册时间</th><td><?php echo htmlspecialchars($search_result['regdate'], ENT_QUOTES, 'UTF-8'); ?></td></tr>
            <tr><th>最后登录</th><td><?php echo htmlspecialchars($search_result['lastdate'], ENT_QUOTES, 'UTF-8'); ?></td></tr>
        </table>

        <div class="confirm-section">
            <label>
                <input type="checkbox" id="confirm-checkbox" onchange="onConfirmCheckChange();">
                我确认要将用户 <strong><?php echo htmlspecialchars($search_result['username'], ENT_QUOTES, 'UTF-8'); ?></strong> 的密码重置为 <strong>123456</strong>，并强制其重新登录。
            </label>
        </div>

        <form method="post" id="reset-form" onsubmit="return onResetSubmit();">
            <input type="hidden" name="action" value="reset">
            <input type="hidden" name="reset_username" value="<?php echo htmlspecialchars($search_result['username'], ENT_QUOTES, 'UTF-8'); ?>">
            <button type="submit" class="btn btn-danger" id="reset-btn" disabled>重置密码</button>
            <span id="reset-hint" style="margin-left:10px;font-size:13px;color:#999;"></span>
        </form>
    <?php endif; ?>

<?php endif; ?>

<div class="back-link">
    <a href="/bbs/">返回论坛首页</a>
</div>

</div>

<div class="footer"></div>

<script>
var searchDebounceTimer = null;
var SEARCH_COOLDOWN = 2000;
var resetStep = 0;
var RESET_COOLDOWN = 3;
var resetCooldownTimer = null;

function onSearchSubmit() {
    var username = document.getElementById('search_username').value.trim();
    if (username === '') {
        alert('请输入用户名');
        return false;
    }
    if (searchDebounceTimer) {
        return false;
    }
    var btn = document.getElementById('search-btn');
    btn.disabled = true;
    searchDebounceTimer = setTimeout(function() {
        searchDebounceTimer = null;
        if (btn) btn.disabled = false;
    }, SEARCH_COOLDOWN);
    return true;
}

function onConfirmCheckChange() {
    var checked = document.getElementById('confirm-checkbox').checked;
    var btn = document.getElementById('reset-btn');
    var hint = document.getElementById('reset-hint');

    if (!checked) {
        btn.disabled = true;
        btn.textContent = '重置密码';
        hint.textContent = '';
        resetStep = 0;
        if (resetCooldownTimer) {
            clearInterval(resetCooldownTimer);
            resetCooldownTimer = null;
        }
    } else {
        btn.disabled = (resetCooldownTimer !== null);
        if (!btn.disabled) {
            btn.textContent = '重置密码';
            hint.textContent = '';
        }
    }
}

function onResetSubmit() {
    var btn = document.getElementById('reset-btn');
    var hint = document.getElementById('reset-hint');

    if (resetStep === 0) {
        var confirmed = confirm('确定要将该用户的密码重置为 123456 吗？\n\n此操作将同时强制该用户重新登录。');
        if (!confirmed) {
            return false;
        }

        resetStep = 1;
        btn.disabled = true;
        var remaining = RESET_COOLDOWN;
        btn.textContent = '再次确认重置 (' + remaining + 's)';
        hint.textContent = '防误触冷却中，请等待 ' + remaining + ' 秒后再次点击';

        resetCooldownTimer = setInterval(function() {
            remaining--;
            if (remaining <= 0) {
                clearInterval(resetCooldownTimer);
                resetCooldownTimer = null;
                btn.disabled = false;
                btn.textContent = '再次确认重置';
                hint.textContent = '请再次点击按钮以完成重置';
            } else {
                btn.textContent = '再次确认重置 (' + remaining + 's)';
                hint.textContent = '防误触冷却中，请等待 ' + remaining + ' 秒';
            }
        }, 1000);

        return false;
    }

    if (resetStep === 1) {
        if (resetCooldownTimer) {
            alert('请等待冷却时间结束');
            return false;
        }

        var confirmedAgain = confirm('【最终确认】此操作不可撤销！\n\n再次确认要重置密码吗？');
        if (!confirmedAgain) {
            resetStep = 0;
            btn.textContent = '重置密码';
            hint.textContent = '';
            return false;
        }

        btn.disabled = true;
        btn.textContent = '正在执行...';
        hint.textContent = '';
        return true;
    }

    return false;
}

(function() {
    var searchInput = document.getElementById('search_username');
    if (searchInput) {
        searchInput.focus();
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('search-btn').click();
            }
        });
    }
})();
</script>

</body>
</html>
