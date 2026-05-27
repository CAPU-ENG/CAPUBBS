# CAPUBBS 统一 API 接口文档

## 基础信息

| 项目 | 值 |
|------|-----|
| **入口地址** | `/api/api.php` |
| **请求方式** | `POST` |
| **Content-Type** | `application/x-www-form-urlencoded` |
| **编码** | `UTF-8` |
| **认证方式** | Cookie `token`（登录后由服务端 Set-Cookie） |

### 调用示例

```javascript
// 使用 API 辅助模块（推荐）
API.call('hot', {}).done(function(resp) { ... });

// 直接用 jQuery
$.post('/api/api.php', { ask: 'hot' }, function(resp) {
    if (resp.code === 0) {
        console.log(resp.data);
    }
}, 'json');

// 原生 fetch
const form = new URLSearchParams();
form.append('ask', 'hot');
const resp = await fetch('/api/api.php', { method: 'POST', body: form }).then(r => r.json());
if (resp.code === 0) { ... }
```

---

## 响应信封

所有响应均为 JSON，结构统一：

```json
{
    "code": 0,
    "message": "success",
    "data": { ... },
    "meta": { ... }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | `int` | **0** = 成功，非 0 = 错误（见错误码表） |
| `message` | `string` | 人类可读的消息，中文 |
| `data` | `any` | 成功时的业务数据，可能是对象、数组或 `null` |
| `meta` | `object?` | 可选。分页信息等元数据。`count` 表示本页条数 |

**成功示例**

```json
// 列表
{ "code": 0, "message": "success", "data": [...], "meta": { "count": 20 } }

// 对象
{ "code": 0, "message": "success", "data": { "username": "admin", "rights": 5 } }

// 空结果
{ "code": 2006, "message": "没有数据" }
```

**错误示例**

```json
{ "code": 1000, "message": "请先登录" }
{ "code": 2101, "message": "缺少必填字段" }
{ "code": 4000, "message": "服务器内部错误" }
```

- 错误时 **不返回 `data` 字段**
- HTTP 状态码与 `code` 对应：`200`=成功, `401`=未登录, `403`=权限不足, `422`=参数校验失败, `500`=服务端错误

---

## 错误码速查

| code | 含义 | HTTP |
|------|------|------|
| 0 | 成功 | 200 |
| 1000 | 请先登录 | 401 |
| 1001 | 会话超时，请重新登录 | 401 |
| 1002 | 用户名或密码错误 | 401 |
| 1003 | 用户不存在 | 401 |
| 1100 | 权限不足 | 403 |
| 1101 | 您的权限不足以执行此操作 | 403 |
| 1102 | 主题已锁定 | 403 |
| 1103 | 权限不足，无法删除 | 403 |
| 1104 | 权限不足，无法编辑 | 403 |
| 1105 | 权限不足，无法移动 | 403 |
| 1106 | 您不是此内容的作者 | 403 |
| 2000 | 请求的资源不存在 | 404 |
| 2001 | 主题不存在 | 404 |
| 2002 | 帖子不存在 | 404 |
| 2005 | 资源已存在 | 409 |
| 2006 | 没有数据 | 404 |
| 2100 | 输入验证失败 | 422 |
| 2101 | 缺少必填字段 | 422 |
| 2102 | 内容超出长度限制 | 422 |
| 3000 | 请求参数错误 | 400 |
| 3001 | 未知的操作类型 | 400 |
| 3002 | 操作太频繁，请稍后再试 | 429 |
| 3003 | 非法参数 | 400 |
| 4000 | 服务器内部错误 | 500 |
| 4001 | 数据库错误 | 500 |
| 4002 | 文件上传失败 | 500 |
| 9000 | 操作失败 | 200 |

---

## 通用参数

所有请求均可携带以下参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `ask` | `string` | **必填**。操作名称，如 `login`、`hot`、`post` 等 |
| `view` | `string` | 视图名称。当 `ask` 为空时用于查询用户信息 |
| `bid` | `int` | 版块 ID。0 表示全站 |
| `tid` | `int` | 主题 ID |
| `pid` | `int` | 帖子 ID（楼层号） |
| `limit` | `string` | 限制条数。`10`（默认）、`-1` 或 `all`（全部） |
| `page` | `int` | 页码（用于分页接口） |

`token` 从 Cookie 中自动读取，无需手动传递。

---

## API 操作速查表

### 一、公开操作（无需登录）

| ask 值 | 说明 | 额外参数 |
|--------|------|---------|
| `hot` | 热帖列表 | `bid`（可选） |
| `global_top` | 全站置顶帖 | — |
| `bbsinfo` | 版块信息 | `bid`（可选，0=全站） |
| `tidinfo` | 主题详情 | `bid`, `tid` |
| `getpages` | 帖子总页数 | `bid`, `tid` |
| `getlznum` | 楼主帖数 | `bid`, `tid` |
| `getnum` | 站点统计（今日帖数、总帖数等） | — |
| `online` | 在线用户列表 | — |
| `sign_today` | 今日签到列表 | — |
| `sign_year` | 年度签到统计 | — |
| `sign_user` | 用户签到排名 | — |
| `search` | 搜索 | `keyword`, `type`（`thread` 或 `post`），可选 `starttime`/`endtime`/`author` |
| `calendar` | 全部日历事件 | — |
| `loadcalendar` | 指定日期日历 | `year`, `month`, `day` |
| `recentpost` | 用户最近发帖 | `view`（用户名）, `limit` |
| `recentreply` | 用户最近回帖 | `view`（用户名）, `limit` |
| `userexists` | 检查用户名是否存在 | `user` |
| `favorite_count` | 收藏该主题的人数 | `bid`, `tid` |
| `rights` | 获取用户在指定版块的权限 | `bid` |
| `getuser` | 获取当前登录用户信息 | —（从 Cookie token 读取） |
| `news` | 获取首页公告 | `action`（可选，`del` 删除）, `id`（删除时）, `title`/`url`（新增时） |
| `lzl` | 楼中楼回复查看 | `fid`（楼层 ID） |
| `getfilesize` | 获取远程文件大小 | `url` |

### 二、账号操作

| ask 值 | 说明 | 参数 | 返回 |
|--------|------|------|------|
| `login` | 登录 | `username`, `password`（MD5 后） | `data: { token, username }`，同时 Set-Cookie |
| `logout` | 登出 | — | `code=0` |
| `register` | 注册 | `username`, `password`（MD5 后）, `md5=yes`, 可选 `sex`/`icon`/`intro`/`mail`/`qq`/`place`/`hobby`/`sig1`/`sig2`/`sig3` | `data: { token, username }` |

> **密码说明**：前端使用 `hex_md5(password)` 将明文 MD5 后提交。若传递 `md5=yes`，服务端会再次 MD5（双 MD5 存储）。

### 三、需登录操作

| ask 值 | 说明 | 必填参数 | 可选参数 |
|--------|------|---------|---------|
| `post` | 发新帖 | `bid`, `title`, `text` | `attachs`, `sig`, `icon` |
| `reply` | 回帖 | `bid`, `tid`, `text` | `title`, `attachs`, `sig`, `icon` |
| `edit` | 编辑帖子 | `bid`, `tid`, `pid`, `text` | `title`, `attachs`, `sig`, `icon` |
| `delete` | 删除帖子/主题 | `bid`, `tid` | `pid`（0=删主题, >0=删指定楼层） |
| `sendmsg` | 发私信 | `to`（收件人）, `text` | — |
| `msg` | 查看私信 | `type`（`received`/`sent`/`system`） | — |
| `edituser` | 编辑个人信息 | — | `intro`, `hobby`, `place`, `sig1`, `sig2`, `sig3`, `icon`, `mail`, `qq` |
| `changepsd` | 修改密码 | `old`（旧密码 MD5）, `new1`, `new2` | — |
| `currentUserInfo` | 当前用户完整信息 | — | — |
| `editpreview` | 编辑预览 | `bid`, `tid`, `pid` | — |
| `favorite_add` | 收藏主题 | `bid`, `tid` | — |
| `favorite_remove` | 取消收藏 | `bid`, `tid` | — |
| `favorite_list` | 收藏列表 | — | `page`, `limit` |
| `favorite_check` | 是否已收藏 | `bid`, `tid` | — |
| `favorite_sort` | 收藏排序 | `bid`, `tid` | `to`（目标位置） |
| `attach` | 上传附件 | `auth`（权限）, `price`（价格） | FormData: `file` |
| `attachdl` | 下载附件 | `id` | — |
| `attachinfo` | 附件信息 | `id` | — |
| `unusedattachinfo` | 未引用附件列表 | — | — |
| `delattach` | 删除附件 | `id` | — |
| `lzl` (method=post) | 发表楼中楼回复 | `fid`（楼层 ID）, `text` | — |
| `lzl` (method=delete) | 删除楼中楼回复 | `fid`（楼层 ID）, `id`（楼中楼 ID） | — |

> **频率限制**：发帖、回帖、楼中楼回复在 15 秒内不可重复操作。命中时返回 `3002`。

### 四、版主/管理员操作

| ask 值 | 说明 | 必填参数 | 权限 |
|--------|------|---------|------|
| `lock` | 锁定/解锁主题 | `bid`, `tid` | 版主 或 rights≥1 |
| `extr` | 精华/取消精华 | `bid`, `tid` | 版主 或 rights≥1 |
| `top` | 版块置顶/取消 | `bid`, `tid` | 版主 或 rights≥1 |
| `global_top_action` | 全局置顶管理 | `bid`, `tid` | rights≥2 |
| `move` | 移动主题 | `bid`, `tid`, `to`（目标版块 ID） | rights≥2 |
| `boardcast` | 全站广播 | `text` | rights≥3 |
| `admin_reset_password` | 管理员重置密码 | `username`, `new_password` | rights≥10 |

### 五、回收站操作（需登录，内置权限）

| ask 值 | 说明 | 参数 |
|--------|------|------|
| `trash_list` | 回收站列表 | `bid`, `page`, `limit`, `type`（`post`/`thread`/`all`） |
| `trash_restore` | 恢复帖子 | `type`, `bid`, `tid`, `pid`, `trash_id` |
| `trash_delete` | 永久删除 | `type`, `bid`, `tid`, `pid`, `trash_id` |
| `trash_clean` | 批量清理 | `days`（清理 N 天前的记录） |

### 六、编辑历史（需登录，内置权限）

| ask 值 | 说明 | 参数 |
|--------|------|------|
| `edit_history` | 查看编辑历史 | `fid`（楼层 ID），可选 `version_id` 查看特定版本 |
| `restore_version` | 回滚到历史版本 | `fid`, `version_id` |

### 七、首页管理操作（需登录 + rights>0）

| ask 值 | 说明 | 参数 |
|--------|------|------|
| `addinform` | 添加公告 | `title`, `url` |
| `delinform` | 删除公告 | `time`（公告时间戳） |
| `saveimg` | 保存轮播图 | `json`（JSON 数组，每个元素含 `img`/`imgthumb`/`title`/`id`） |
| `savecalendar` | 保存日历事件 | `year`, `month`, `day`, `content`（JSON 数组） |
| `add_download` | 添加下载链接 | `title`, `url` |
| `edit_download` | 编辑下载链接 | `id`, `title`, `url` |
| `del_download` | 删除下载链接 | `id` |

---

## 无 ask 参数的请求

当不传 `ask` 时，API 根据 `view` 或 `bid` 自动分发：

| 条件 | 行为 | 示例 |
|------|------|------|
| 有 `view` | 查询用户信息 | `view=admin` |
| 只有 `bid` | 获取版块帖子列表 | `bid=1` |
| `bid` + `tid` | 获取主题楼层列表 | `bid=1&tid=100` |

**版块/主题列表支持的额外参数**：`p`（页码）、`limit`（条数）、`sort`（排序方式）、`order`（升降序）。

---

## 前端辅助模块

`/assets/js/api.js` 挂载在 `window.API`，提供了标准化的调用封装：

```javascript
// 基本调用
API.call('ask名', { 参数对象 })
    .done(function(resp) {
        // resp.code === 0，resp.data 为业务数据
    })
    .fail(function(err) {
        // err.code 为错误码，err.message 为消息
    })
    .loading(function() {
        // 请求发出时调用，可在此禁用按钮
    });

// 静默调用（不弹出错误提示）
API.silent('ask名', { 参数 });

// 示例：收藏切换
function toggleFav(el) {
    var bid = $(el).data('bid');
    var tid = $(el).data('tid');
    var ask = $(el).hasClass('favd') ? 'favorite_remove' : 'favorite_add';
    API.silent(ask, { bid: bid, tid: tid })
        .done(function() { $(el).toggleClass('favd'); });
}

// 示例：登录
API.call('login', { username: user, password: hex_md5(pass) })
    .loading(function() { $('#loginBtn').prop('disabled', true); })
    .done(function(resp) { window.location.reload(); })
    .fail(function(err) { alert(err.message); })
    .always(function() { $('#loginBtn').prop('disabled', false); });
```

---

## 常见错误处理模式

```javascript
function handleApiError(err) {
    switch (err.code) {
        case 1000: // 未登录 → 跳转登录
            window.location.href = '/bbs/login/';
            break;
        case 1001: // 会话超时 → 提示重新登录
            alert('登录已过期，请重新登录');
            window.location.href = '/bbs/login/';
            break;
        case 1100: // 权限不足 → 提示
            alert('您没有权限执行此操作');
            break;
        case 3002: // 频率限制 → 提示稍候
            alert('操作太频繁，请稍后再试');
            break;
        case 4000: // 服务器错误 → 提示反馈
            alert('服务器错误，请联系管理员');
            break;
        default:
            alert(err.message || '未知错误');
    }
}
```
