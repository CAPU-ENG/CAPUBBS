<?php
// /bbs/manage/trash/index.php — 回收站管理页面

include("../../lib/mainfunc.php");

$users = getuser();
$username = $users['username'];
$rights = intval($users['rights']);

// 版主及以上可访问
$can_access = ($username != '' && $rights >= 5);

// 获取版块列表（用于筛选下拉）
$all_boards_raw = mainfunc(array("ask" => "bbsinfo"));
$all_boards = array();
if (!empty($all_boards_raw)) {
    foreach ($all_boards_raw as $b) {
        if (isset($b['bid']) && isset($b['name'])) {
            $all_boards[] = $b;
        }
    }
}

// 获取筛选参数
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$bid  = isset($_GET['bid'])  ? intval($_GET['bid'])  : 0;
$type = isset($_GET['type']) ? $_GET['type']         : 'all';
if ($page < 1) $page = 1;

// 校验版块是否存在（bid=0 表示全部版块，合法）
if ($bid > 0) {
    $bid_valid = false;
    foreach ($all_boards as $b) {
        if (intval($b['bid']) === $bid) { $bid_valid = true; break; }
    }
    if (!$bid_valid) {
        echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>版块不存在</title>';
        echo '</head><body style="text-align:center;padding-top:80px;font-family:sans-serif;">';
        echo '<h2 style="color:#c33;">版块不存在</h2>';
        echo '<p>该版块 ID 无效或已被删除。</p>';
        echo '<p><a href="./">返回回收站</a></p>';
        echo '</body></html>';
        exit;
    }
}

// 获取回收站列表
$trash = array();
if ($can_access) {
    $trash = mainfunc(array(
        "ask"   => "trash_list",
        "bid"   => $bid,
        "page"  => $page,
        "limit" => 20,
        "type"  => $type
    ));
}
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>回收站管理 - CAPUBBS</title>
    <link rel="stylesheet" type="text/css" href="../../lib/general.css">
    <link rel="stylesheet" type="text/css" href="../../main/style.css">
    <script type="text/javascript" src="../../lib/jquery.min.js"></script>
    <script type="text/javascript" src="../../lib/general.js"></script>
    <style>
        .trash-container { max-width: 960px; margin: 20px auto; font-family: "Microsoft YaHei", sans-serif; }
        .trash-header { background: #d9534f; color: #fff; padding: 12px 20px;
                        border-radius: 4px 4px 0 0; font-size: 16px; }
        .trash-header .badge { background: #fff; color: #d9534f; padding: 2px 8px;
                               border-radius: 10px; font-size: 12px; margin-left: 8px; }
        .trash-toolbar { background: #f9f9f9; border: 1px solid #ddd; border-top: none;
                         padding: 10px 20px; display: flex; gap: 10px; align-items: center;
                         flex-wrap: wrap; }
        .trash-toolbar select, .trash-toolbar button {
            padding: 6px 12px; border: 1px solid #ccc; border-radius: 3px; font-size: 13px; }
        .trash-toolbar button { cursor: pointer; }
        .trash-toolbar .btn-danger { background: #d9534f; color: #fff; border-color: #d43f3a; }
        .trash-list { border: 1px solid #ddd; border-top: none; }
        .trash-item { padding: 12px 20px; border-bottom: 1px solid #eee;
                      display: flex; align-items: center; gap: 12px; }
        .trash-item:hover { background: #fafafa; }
        .trash-type-tag { font-size: 11px; padding: 2px 6px; border-radius: 3px;
                          white-space: nowrap; font-weight: bold; }
        .trash-type-thread { background: #5bc0de; color: #fff; }
        .trash-type-post { background: #f0ad4e; color: #fff; }
        .trash-info { flex: 1; min-width: 0; }
        .trash-title { font-weight: bold; margin-bottom: 2px;
                       overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .trash-meta { font-size: 12px; color: #999; }
        .trash-actions { white-space: nowrap; }
        .trash-actions button { margin-left: 4px; padding: 4px 10px; border-radius: 3px;
                                border: 1px solid #ccc; cursor: pointer; font-size: 12px; }
        .btn-restore { background: #5cb85c; color: #fff; border-color: #4cae4c; }
        .btn-perm-del { background: #d9534f; color: #fff; border-color: #d43f3a; }
        .trash-pagination { text-align: center; padding: 16px; }
        .trash-pagination a, .trash-pagination span {
            display: inline-block; padding: 6px 12px; margin: 0 2px;
            border: 1px solid #ddd; border-radius: 3px; text-decoration: none; color: #333; }
        .trash-pagination .current { background: #337ab7; color: #fff; border-color: #2e6da4; }
        .empty-msg { text-align: center; padding: 40px; color: #999; font-size: 14px; }
        .no-access { text-align: center; padding: 40px; color: #999; font-size: 14px; }
        .back-link { display: inline-block; margin: 0 20px 10px; color: #337ab7; text-decoration: none; font-size: 13px; }
        .back-link:hover { text-decoration: underline; }
    </style>
</head>
<body>

<div class="trash-container">

<a class="back-link" href="../../main/">&larr; 返回论坛</a>

<?php if (!$can_access): ?>
    <?php if ($username == ""): ?>
        <div class="no-access">请先<a href="../../index/">登录</a>。</div>
    <?php else: ?>
        <div class="no-access">权限不足：仅限版主或管理员访问此页面。</div>
    <?php endif; ?>
<?php else: ?>

    <div class="trash-header">
        回收站管理
        <span class="badge">管理员工具</span>
    </div>

    <div class="trash-toolbar">
        <label>版块:</label>
        <select id="filter_bid" onchange="applyFilter()">
            <option value="0" <?php if ($bid == 0) echo 'selected'; ?>>全部版块</option>
            <?php foreach ($all_boards as $b): ?>
                <option value="<?php echo $b['bid']; ?>" <?php if ($bid == $b['bid']) echo 'selected'; ?>>
                    <?php echo htmlspecialchars($b['name']); ?>
                </option>
            <?php endforeach; ?>
        </select>

        <label>类型:</label>
        <select id="filter_type" onchange="applyFilter()">
            <option value="all"    <?php if ($type == 'all')    echo 'selected'; ?>>全部</option>
            <option value="thread" <?php if ($type == 'thread') echo 'selected'; ?>>主题</option>
            <option value="post"   <?php if ($type == 'post')   echo 'selected'; ?>>回帖</option>
        </select>

        <button onclick="applyFilter()">筛选</button>

        <span style="flex:1;"></span>

        <?php if ($rights >= 2): ?>
        <button class="btn-danger" onclick="cleanTrash()">清理 90 天前记录</button>
        <?php endif; ?>
    </div>

    <div class="trash-list">
    <?php
    $has_rows = false;
    $items = $trash;

    if (!empty($items)) {
        foreach ($items as $item) {
            if (!isset($item['trash_type'])) continue;
            $has_rows = true;
            $is_thread  = ($item['trash_type'] == 'thread');
            $type_label = $is_thread ? '主题' : '回帖';
            $type_class = $is_thread ? 'trash-type-thread' : 'trash-type-post';
            $trash_id   = isset($item['trash_id']) ? intval($item['trash_id']) : 0;
            $item_bid   = isset($item['bid']) ? intval($item['bid']) : 0;
            $item_tid   = isset($item['tid']) ? intval($item['tid']) : 0;
            $item_pid   = $is_thread ? 0 : (isset($item['pid']) ? intval($item['pid']) : 0);
            $item_type  = $item['trash_type'];

            // 展示被删帖子的 title，为空时回退到 text 摘要
            $title = isset($item['title']) ? trim($item['title']) : '';
            $raw = ($title !== '') ? $title : (isset($item['text']) ? $item['text'] : '');
            $summary = strip_tags(strval($raw));
            if (mb_strlen($summary) > 60) {
                $summary = mb_substr($summary, 0, 60) . '...';
            }
            if ($summary === '' || $summary === null) $summary = '(无文字内容)';

            // 格式化时间
            $del_time = isset($item['deletetime']) ? intval($item['deletetime']) : 0;
            $time_str = $del_time > 0 ? date('Y-m-d H:i', $del_time) : '未知';

            // 版块名
            $board_name = '';
            foreach ($all_boards as $b) {
                if (intval($b['bid']) == $item_bid) { $board_name = $b['name']; break; }
            }
            if ($board_name == '') $board_name = '版块#' . $item_bid;

            $author  = isset($item['author'])  ? htmlspecialchars($item['author'])  : '未知';
            $deleter = isset($item['deleter']) ? htmlspecialchars($item['deleter']) : '未知';

            // fid：回帖有值（用于排查），主题为 0
            $item_fid = isset($item['fid']) ? intval($item['fid']) : 0;
    ?>
        <div class="trash-item" id="trash-<?php echo $trash_id; ?>">
            <span class="trash-type-tag <?php echo $type_class; ?>"><?php echo $type_label; ?></span>
            <div class="trash-info">
                <div class="trash-title"><?php echo htmlspecialchars($summary); ?></div>
                <div class="trash-meta">
                    bid:<?php echo $item_bid; ?>/tid:<?php echo $item_tid; ?>
                    <?php if ($item_fid > 0): ?>/fid:<?php echo $item_fid; ?><?php endif; ?> |
                    作者: <?php echo $author; ?> |
                    删除人: <?php echo $deleter; ?> |
                    <?php echo $time_str; ?>
                </div>
            </div>
            <div class="trash-actions">
                <button class="btn-restore" onclick="restoreItem('<?php echo $item_type; ?>', <?php echo $item_bid; ?>, <?php echo $item_tid; ?>, <?php echo $item_pid; ?>, <?php echo $trash_id; ?>)">恢复</button>
                <?php if ($rights >= 2): ?>
                <button class="btn-perm-del" onclick="permDeleteItem('<?php echo $item_type; ?>', <?php echo $item_bid; ?>, <?php echo $item_tid; ?>, <?php echo $item_pid; ?>, <?php echo $trash_id; ?>)">永久删除</button>
                <?php endif; ?>
            </div>
        </div>
    <?php
        }
    }

    if (!$has_rows) {
        echo '<div class="empty-msg">回收站为空。</div>';
    }
    ?>
    </div>

    <?php if ($has_rows): ?>
    <div class="trash-pagination">
        <?php if ($page > 1): ?>
            <a href="?bid=<?php echo $bid; ?>&type=<?php echo urlencode($type); ?>&page=<?php echo $page - 1; ?>">&larr; 上一页</a>
        <?php endif; ?>
        <span class="current">第 <?php echo $page; ?> 页</span>
        <?php if (count($items) >= 20): ?>
            <a href="?bid=<?php echo $bid; ?>&type=<?php echo urlencode($type); ?>&page=<?php echo $page + 1; ?>">下一页 &rarr;</a>
        <?php endif; ?>
    </div>
    <?php endif; ?>

<?php endif; ?>

</div>

<script>
function applyFilter() {
    var bid  = document.getElementById('filter_bid').value;
    var type = document.getElementById('filter_type').value;
    window.location.href = '?bid=' + bid + '&type=' + type;
}

function restoreItem(type, bid, tid, pid, trashId) {
    var msg = (type == 'thread')
        ? '确定恢复该主题及其所有回帖吗？'
        : '确定恢复该回帖吗？';
    if (!confirm(msg)) return;

    $.post('../../lib/ajax_trash.php', {
        ask: 'trash_restore',
        type: type,
        bid: bid,
        tid: tid,
        pid: pid,
        trash_id: trashId
    }, function(data) {
        if (data.code == 0) {
            if (type == 'thread') {
                alert('成功恢复 ' + data.restored + ' 个帖子。');
            } else {
                alert('恢复成功。');
            }
            location.reload();
        } else {
            alert('恢复失败：' + (data.msg || '未知错误'));
        }
    }, 'json').fail(function() {
        alert('请求失败，请检查网络。');
    });
}

function permDeleteItem(type, bid, tid, pid, trashId) {
    if (!confirm('确定永久删除吗？此操作不可撤销！')) return;

    $.post('../../lib/ajax_trash.php', {
        ask: 'trash_delete',
        type: type,
        bid: bid,
        tid: tid,
        pid: pid,
        trash_id: trashId
    }, function(data) {
        if (data.code == 0) {
            alert('已永久删除。');
            $('#trash-' + trashId).remove();
        } else {
            alert('删除失败：' + (data.msg || '未知错误'));
        }
    }, 'json').fail(function() {
        alert('请求失败，请检查网络。');
    });
}

function cleanTrash() {
    var days = prompt('清理多少天之前的记录？\n（默认 90 天，建议至少保留 30 天）', '90');
    if (days === null) return;
    days = parseInt(days);
    if (isNaN(days) || days < 1) return;

    if (!confirm('确定永久删除 ' + days + ' 天之前的所有回收站记录吗？\n此操作不可撤销！')) return;

    $.post('../../lib/ajax_trash.php', {
        ask: 'trash_clean',
        days: days
    }, function(data) {
        if (data.code == 0) {
            alert('已清理 ' + data.deleted_posts + ' 条记录。');
            location.reload();
        } else {
            alert('清理失败：' + (data.msg || '未知错误'));
        }
    }, 'json').fail(function() {
        alert('请求失败，请检查网络。');
    });
}
</script>

</body>
</html>
