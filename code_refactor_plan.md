# CAPUBBS Service / Repository 分层重构计划

> 目标：在 **不推倒重来、不一次性替换所有页面入口** 的前提下，逐步把当前项目迁移到 **Adapter → Service → Repository** 的分层结构。  
> 本文重点是 **渐进式落地方案**，优先处理：**用户 → 帖子内容读取 → 帖子写操作 → 楼中楼**。

---

## 1. 本次重构的范围与原则

## 1.1 目标

建立一套能与当前项目共存的分层结构，使核心业务逐步从：

- `api/jiekoufunc.php`
- `api/jiekoufunc_thread.php`
- `bbs/*` 页面内联逻辑
- `bbs/lib/mainfunc.new.php`
- `api/lib/ThreadDetailQuery.php`

迁移到：

```text
Adapter（旧入口/兼容层）
-> Service（业务逻辑）
-> Repository（数据库访问）
```

---

## 1.2 非目标

以下内容 **不是第一阶段目标**：

- 不先重写全站 Router
- 不先重写所有 `bbs/*` 页面
- 不先做前后端分离
- 不先消灭所有 `mysqli_*`
- 不先移除 `jiekoufunc_*`
- 不先处理所有管理后台和活动子系统

第一阶段只做一件事：

> **把核心业务从旧文件里抽出来，变成可复用的 Service / Repository。**

---

## 1.3 渐进式原则

### 原则 1：旧入口保留，内部改调新层

保留以下外壳：

- `bbs/*` 页面入口
- `bbs/lib/mainfunc.php`
- `api/dispatch.php`
- `api/jiekoufunc.php`
- `api/jiekoufunc_thread.php`

这些文件短期内继续存在，但逐步变成：

- 参数提取层
- 旧返回格式适配层
- 向后兼容层

### 原则 2：先迁“业务内核”，不先迁“页面壳”

即：

- 页面可继续用旧 URL
- 页面可继续调用 `mainfunc()`
- `mainfunc()` 可继续调 `dispatch.php`
- 但 `dispatch.php` / `jiekoufunc_*` 内部应逐步改调 Service

### 原则 3：每迁一块，都保持线上行为不变

验收标准不是“代码看起来更优雅”，而是：

- 旧页面还能跑
- 旧接口还能返回原格式
- 新逻辑结果与旧逻辑一致

---

## 2. 目标分层结构

## 2.1 第一阶段推荐目录

```text
src/
├── Bootstrap.php
├── Repository/
│   ├── UserRepository.php
│   ├── UserSigRepository.php
│   ├── BoardRepository.php
│   ├── SearchRepository.php
│   ├── ThreadRepository.php
│   ├── PostRepository.php
│   ├── NestedReplyRepository.php
│   ├── AttachmentRepository.php
│   ├── FavoriteRepository.php
│   ├── MessageRepository.php
│   ├── SignRepository.php
│   ├── EmailVerificationRepository.php
│   ├── EmailMuteRepository.php
│   ├── EditHistoryRepository.php
│   ├── TrashRepository.php
│   ├── MainpageRepository.php
│   ├── ActivityRepository.php
│   └── PunishmentRepository.php
├── Service/
│   ├── AuthService.php
│   ├── PermissionService.php
│   ├── UserService.php
│   ├── SearchService.php
│   ├── ThreadReadService.php
│   ├── PostService.php
│   ├── NestedReplyService.php
│   ├── ContentRenderService.php
│   ├── NotificationService.php
│   ├── PostingPolicyService.php
│   ├── CounterService.php
│   ├── FavoriteService.php
│   ├── AttachmentService.php
│   ├── SignService.php
│   ├── MessageService.php
│   ├── EmailVerificationService.php
│   ├── ModerationService.php
│   ├── TrashService.php
│   ├── MainpageService.php
│   ├── ActivityService.php
│   └── PunishmentService.php
└── Support/
    ├── DbConnection.php
    ├── RequestContext.php
    ├── TransactionRunner.php
    ├── LegacyResultAdapter.php
    └── ServiceException.php
```

---

## 2.2 各层职责

### Adapter 层（旧页面 / dispatch / jiekoufunc）

当前仍会存在于：

- `bbs/*`
- `bbs/lib/mainfunc.php`
- `api/dispatch.php`
- `api/jiekoufunc.php`
- `api/jiekoufunc_thread.php`

职责：

- 读取参数
- 调用 Service
- 把结果转成旧数组 / JSON / XML 兼容格式

不负责：

- SQL
- 核心业务流程
- 长事务逻辑

### Service 层

职责：

- 业务流程
- 权限校验
- 事务边界
- 参数语义校验
- 调用多个 Repository
- 触发通知与计数副作用

不负责：

- 直接读取 `$_GET` / `$_POST` / `$_COOKIE`
- 输出 HTML / JSON / XML
- 直接拼 SQL

### Repository 层

职责：

- 访问数据库
- 执行查询和更新
- 返回数组或简单对象

不负责：

- 权限判断
- 业务编排
- 输出渲染
- 调用外部 API

### Support 层

职责：

- 连接管理
- 事务执行器
- 当前请求上下文
- 旧结果适配

---

## 2.3 依赖方向

必须保持单向依赖：

```text
Adapter -> Service -> Repository -> Support
```

禁止：

- Repository 调 Service
- Service 读超全局
- 页面直接写 SQL
- Service 直接输出 HTML / JSON

---

## 3. 当前代码到目标分层的映射

## 3.1 当前热点文件

### 用户 / 认证

- `api/jiekoufunc.php`
- `api/lib/db.php`
- `bbs/lib/mainfunc.php`

### 帖子读取

- `bbs/lib/mainfunc.new.php`
- `bbs/content/index.php`
- `api/lib/ThreadDetailQuery.php`
- `api/jiekoufunc.php`

### 帖子写入

- `api/jiekoufunc_thread.php`
- `bbs/post/index.php`
- `bbs/editpid/action.php`
- `bbs/delete/index.php`
- `bbs/move/index.php`
- `bbs/settid/index.php`

### 楼中楼

- `api/jiekoufunc_thread.php` 中 `jiekoufunc_lzl()`
- `bbs/postlzl/index.php`
- `bbs/deletelzl/index.php`
- `bbs/content/index.php`

---

## 3.2 目标映射

| 当前来源 | 目标层 |
|----------|--------|
| `jiekoufunc_token2user()` / `getrights()` | `UserRepository` + `AuthService` + `PermissionService` |
| `jiekoufunc_login/logout/register/changepsd/edituser` | `AuthService` / `UserService` |
| `getOnePage()` / `ThreadDetailQuery` / `tidinfo/getpages/getlznum` | `ThreadReadService` |
| `jiekoufunc_post/reply/edit/delete/move` | `PostService` |
| `jiekoufunc_lzl()` | `NestedReplyService` |
| `translate()/translate_bbcode()/translateforquote()` | `ContentRenderService` |
| `insertmsg()` / at / quote / 回复提醒 | `NotificationService` |
| `userinfo.*` / `threads.*` 冗余计数维护 | `CounterService` |

---

## 4. 分层前置依赖

在迁移用户、帖子、楼中楼之前，必须先抽出一批基础能力。

---

## 4.1 当前用户上下文

### 现状来源

- `api/lib/db.php`
  - `jiekoufunc_token2user()`
  - `jiekoufunc_getrights()`
- `api/jiekoufunc.php`
  - `jiekoufunc_currentUserInfo()`
  - `jiekoufunc_getuser()`
- `bbs/lib/mainfunc.php`
  - `getuser()`

### 需要抽成

- `RequestContext`
- `UserRepository`
- `AuthService`
- `PermissionService`

### 目的

统一提供：

- 当前用户是谁
- token 是否有效
- 当前全局权限
- 当前版块权限
- 是否为版主

没有这层，后续 `PostService` 和 `NestedReplyService` 都会继续耦合旧函数。

---

## 4.2 发言策略与权限策略

### 现状来源

- `api/jiekoufunc_thread.php`
- `api/dispatch.php`
- `api/lib/db.php`
- `api/jiekoufunc.php`

### 需要抽成

- `PostingPolicyService`
- `PermissionService`

### 要统一的规则

- 是否登录
- 是否有权限发帖 / 编辑 / 删除
- 是否命中发帖频率限制
- 是否命中邮箱禁言
- 特殊版块规则（如 `bid=1`、`bid=28`）

---

## 4.3 内容渲染能力

### 现状来源

- `bbs/lib/mainfunc.php`
  - `translate()`
  - `translate_bbcode()`
  - `translateforquote()`
  - `translate_post_tag()`
- `api/lib/ThreadDetailQuery.php`
  - `thread_detail_query_translate*`

### 需要抽成

- `ContentRenderService`

### 目的

统一：

- 正文 raw/html 转换
- BBCode 渲染
- quote 渲染
- 签名渲染
- `[post]` 标签展开

否则读取链拆出来后，页面层和 API 层仍会各自维护一套渲染实现。

---

## 4.4 通知副作用

### 现状来源

- `api/lib/db.php`
  - `jiekoufunc_insertmsg()`
  - `jiekoufunc_search_replace_exec_at()`
- `api/jiekoufunc_thread.php`
  - 回帖提醒
  - 楼中楼提醒
  - at / quote 提醒

### 需要抽成

- `MessageRepository`
- `NotificationService`

### 目的

把这些副作用从帖子写入流程里拆出去：

- 回复楼主消息
- at 消息
- quote 消息
- 楼中楼回复消息

---

## 4.5 计数器与用户状态副作用

### 现状来源

- `api/jiekoufunc_thread.php`
- `api/lib/db.php`
- `api/jiekoufunc.php`
- `scripts/check_counters.php`
- `scripts/fix_counters.php`

### 需要抽成

- `CounterService`
- `SignService`

### 目的

统一维护：

- `userinfo.post/reply/water/extr/sign/newmsg`
- `threads.reply/click/timestamp/replyer`
- `posts.lzl`
- `userinfo.star`

---

## 4.6 事务执行器

### 现状

主业务流中显式事务很少，但发帖、回帖、楼中楼、注册本质上都是多表写入。

### 需要抽成

- `TransactionRunner`

### 典型事务场景

- 注册：`userinfo + user_sig + email_verification`
- 发主题：`threads + posts + userinfo + attachments + counters`
- 回帖：`posts + threads + userinfo + notifications`
- 楼中楼：`lzl + posts.lzl + userinfo + notifications`

---

## 5. 渐进式迁移路径

推荐顺序：

```text
P0 基础设施
-> P1 用户/认证
-> P2 帖子内容读取
-> P3 帖子写操作
-> P4 楼中楼
-> P5 收藏/附件/消息
-> P6 活动/回收站/管理工具
```

---

## 5.1 P0：基础设施

### 目标

给旧代码提供一个可以开始承接新分层代码的最小骨架。

### 任务

1. 新建 `src/Bootstrap.php`
2. 新建 `Support/DbConnection.php`
3. 新建 `Support/RequestContext.php`
4. 新建 `Support/TransactionRunner.php`
5. 新建 `Support/LegacyResultAdapter.php`
6. 定义 Repository / Service 的命名和依赖规则

### 产出

- 能在 `api/jiekoufunc.php` 中安全 `require` 新类
- 能通过 `LegacyResultAdapter` 返回旧格式结果

### 验收

- 不改页面，不改 URL
- 旧接口输出保持不变

---

## 5.2 P1：用户 / 认证域

### 推荐优先级

最高。因为后续所有域都依赖“当前用户是谁”。

### 主要迁移来源

- `api/jiekoufunc.php`
  - `jiekoufunc_getuser`
  - `jiekoufunc_user_profile`
  - `jiekoufunc_currentUserInfo`
  - `jiekoufunc_login`
  - `jiekoufunc_logout`
  - `jiekoufunc_register`
  - `jiekoufunc_edituser`
  - `jiekoufunc_changepsd`
- `api/lib/db.php`
  - `jiekoufunc_token2user`
  - `jiekoufunc_getrights`
  - `jiekoufunc_view_user_array`
- `bbs/lib/mainfunc.php`
  - `getuser()`

### 目标类

#### Repository

- `UserRepository`
- `UserSigRepository`
- `SignRepository`
- `EmailVerificationRepository`

#### Service

- `AuthService`
- `PermissionService`
- `UserService`

### 迁移顺序

1. `token2user()` -> `UserRepository::findByToken()`
2. `getrights()` -> `PermissionService`
3. `login/logout` -> `AuthService`
4. `currentUserInfo/getuser` -> `UserService`
5. `register/edituser/changepsd` -> `AuthService` / `UserService`

### 验收

- `jiekoufunc_login/logout/register/currentUserInfo/edituser/changepsd` 主要不再写 SQL
- `getuser()` 通过新 Service 获取当前用户

---

## 5.3 P2：帖子内容读取域

### 目标

先把读取链迁出来，优先得到一个统一的帖子读取服务。

### 主要迁移来源

- `bbs/lib/mainfunc.new.php`
  - `getTidInfo()`
  - `checkUserAndSign()`
  - `getOnePage()`
- `api/jiekoufunc.php`
  - `jiekoufunc_tidinfo`
  - `jiekoufunc_getpages`
  - `jiekoufunc_getlznum`
  - `recentpost`
  - `recentreply`
- `api/lib/ThreadDetailQuery.php`

### 目标类

#### Repository

- `BoardRepository`
- `ThreadRepository`
- `PostRepository`
- `NestedReplyRepository`（只读）
- `AttachmentRepository`
- `FavoriteRepository`
- `UserRepository`（批量 profile）

#### Service

- `ThreadReadService`
- `ContentRenderService`
- `FavoriteService`（先读）

### 核心策略

把 `api/lib/ThreadDetailQuery.php` 作为第一批拆分对象，因为它已经具备聚合读取结构。

### 目标接口建议

- `ThreadReadService::getBoard($bid)`
- `ThreadReadService::getThread($bid, $tid)`
- `ThreadReadService::getThreadPage($bid, $tid, $page, $authorOnly)`
- `ThreadReadService::getThreadDetailPayload($bid, $tid, $page, $viewer, $options)`
- `ThreadReadService::getRecentPosts($username, $limit)`
- `ThreadReadService::getRecentReplies($username, $limit)`

### 验收

- 帖子读取逻辑有一个明确的 `ThreadReadService`
- `ThreadDetailQuery` 中的大部分 SQL 搬入 Repository
- 页面或接口能复用统一读取服务

---

## 5.4 P3：帖子写操作域

### 目标

统一发帖、回帖、编辑、删除、移动、版务动作。

### 主要迁移来源

- `api/jiekoufunc_thread.php`
  - `jiekoufunc_post`
  - `jiekoufunc_reply`
  - `jiekoufunc_edit`
  - `jiekoufunc_delete`
  - `jiekoufunc_move`
  - `jiekoufunc_threads_action`
- `api/jiekoufunc.php`
  - `editpreview`
  - 编辑历史相关函数
- 页面入口
  - `bbs/post/index.php`
  - `bbs/editpid/action.php`
  - `bbs/delete/index.php`
  - `bbs/move/index.php`
  - `bbs/settid/index.php`

### 目标类

#### Repository

- `ThreadRepository`
- `PostRepository`
- `AttachmentRepository`
- `EditHistoryRepository`
- `TrashRepository`
- `MessageRepository`

#### Service

- `PostService`
- `NotificationService`
- `PostingPolicyService`
- `CounterService`

### 目标接口建议

- `PostService::createThread(...)`
- `PostService::replyThread(...)`
- `PostService::editPost(...)`
- `PostService::deletePost(...)`
- `PostService::moveThread(...)`
- `PostService::setThreadFlags(...)`
- `PostService::getEditPreview(...)`
- `PostService::getEditHistory(...)`
- `PostService::restoreVersion(...)`

### 强要求

P3 开始必须引入事务：

- 发帖
- 回帖
- 编辑
- 删除 / 恢复

### 验收

- `jiekoufunc_thread.php` 主要只做适配
- 核心 SQL 已迁到 Repository
- 发帖/回帖/编辑/删除事务边界清晰

---

## 5.5 P4：楼中楼域

### 目标

把 `jiekoufunc_lzl()` 从巨型流程函数中拆成独立域。

### 主要迁移来源

- `api/jiekoufunc_thread.php`
  - `jiekoufunc_lzl()`
- 页面入口
  - `bbs/postlzl/index.php`
  - `bbs/deletelzl/index.php`
- 读取展示
  - `bbs/content/index.php`
  - `api/lib/ThreadDetailQuery.php`

### 目标类

#### Repository

- `NestedReplyRepository`
- `PostRepository`
- `MessageRepository`

#### Service

- `NestedReplyService`
- `PostingPolicyService`
- `NotificationService`
- `CounterService`

### 目标接口建议

- `NestedReplyService::listByFloor($fid, $viewer)`
- `NestedReplyService::create($fid, $author, $text, $context)`
- `NestedReplyService::delete($fid, $lzlId, $actor, $context)`

### 注意

楼中楼不是小功能，它依赖：

- 当前用户
- 发言频率限制
- 邮箱禁言
- 父帖信息
- 主题锁定状态
- 通知副作用
- `posts.lzl` 计数

因此不建议在用户/帖子主干未稳定前先做楼中楼。

### 验收

- `jiekoufunc_lzl()` 成为薄适配层
- 楼中楼读写都通过 `NestedReplyService`

---

## 5.6 P5：收藏 / 附件 / 消息

### 目标

把帖子主干之外的高频配套功能收口。

### 主要目标类

- `FavoriteService`
- `AttachmentService`
- `NotificationService`
- `MessageService`（如果需要拆分）

### 迁移来源

- `api/jiekoufunc.php` 中 favorite / attach / msg 相关函数
- `bbs/favorite/index.php`
- `bbs/attach/index.php`
- `bbs/download/index.php`
- `bbs/delattach/index.php`
- `bbs/message/index.php`
- `bbs/home/message.php`

---

## 5.7 P6：活动 / 回收站 / 管理工具

### 目标

处理耦合最深、历史负担最重的模块。

### 迁移范围

- 活动报名：
  - `bbs/content/utils/activityService.php`
  - `bbs/content/utils/postActivity.php`
  - `bbs/content/utils/activity.php`
  - `api/bbs/activity/create/index.php`
- 回收站：
  - `bbs/manage/trash/index.php`
  - `bbs/lib/ajax_trash.php`
  - dispatch 中 trash 相关逻辑
- 管理工具：
  - email mute
  - reset password
  - punishment API

### 说明

这一阶段依赖前面所有基础服务已稳定，所以不建议提前做。

---

## 5.8 其他也适合做分层设计的功能域

除了“用户 / 帖子读取 / 帖子写入 / 楼中楼”主干之外，以下功能也适合纳入同一套 Service / Repository 体系。

### 5.8.1 版块与首页聚合

适合拆成：

- `BoardRepository`
- `MainpageRepository`
- `MainpageService`

可覆盖：

- 版块列表 / 单版块信息
- 首页公告
- 首页轮播图
- 下载区配置
- 校历 / 日历配置
- 热门帖 / 最新帖聚合

这类功能当前分散在：

- `api/jiekoufunc.php`
- `assets/api/main.php` 的演化逻辑
- 首页与论坛入口页面

### 5.8.2 搜索与发现

适合拆成：

- `SearchRepository`
- `SearchService`

可覆盖：

- 关键字搜索
- 按作者 / 标题 / 正文搜索
- 热门主题排序
- 最近主题
- 全站推荐流 / 发现页聚合

原因：

- SQL 查询条件复杂，适合集中收口
- 排序策略（时间、热度、互动）应放到 Service 层统一编排

### 5.8.3 在线状态 / 签到 / 会话保活

适合拆成：

- `SignRepository`
- `SignService`
- `AuthService`

可覆盖：

- 今日签到
- 年度签到
- 用户签到记录
- 在线人数
- session keepalive / token 续期

这部分虽然看起来是“小功能”，但实际上和“当前用户上下文”高度耦合，优先级高于一般边缘功能。

### 5.8.4 收藏 / 阅读追踪

适合拆成：

- `FavoriteRepository`
- `FavoriteService`

可覆盖：

- 收藏列表
- 收藏排序
- 收藏状态检查
- 收藏计数
- 最后阅读时间 / 未读回复数（如后续要补）

### 5.8.5 附件生命周期

适合拆成：

- `AttachmentRepository`
- `AttachmentService`

可覆盖：

- 上传登记
- 附件信息查询
- 下载计数
- 删除附件
- 无主附件 / 未使用附件清理

附件本质上是“文件元数据 + 权限 + 引用关系”的组合，很适合单独成域。

### 5.8.6 私信 / 系统消息 / 通知中心

适合拆成：

- `MessageRepository`
- `MessageService`
- `NotificationService`

可覆盖：

- 私信会话列表
- 聊天记录
- 系统消息
- 未读数维护
- 回复 / at / quote / 楼中楼提醒

建议：

- “消息存储与查询” 和 “业务通知触发” 逻辑分开
- Repository 只负责消息落库 / 查询
- Service 负责通知触发策略与未读数副作用

### 5.8.7 邮箱验证 / 邮箱禁言 / 可见性控制

适合拆成：

- `EmailVerificationRepository`
- `EmailMuteRepository`
- `EmailVerificationService`
- `PermissionService`

可覆盖：

- 注册验证码
- 找回密码验证码
- 绑定 / 验证邮箱
- 邮箱禁言
- 邮箱可见性切换
- 发帖前邮箱状态校验

这类功能天然跨越“用户域”和“发帖策略域”，适合通过独立 Service 收口。

### 5.8.8 编辑历史 / 版本恢复

适合拆成：

- `EditHistoryRepository`
- `PostService`
- `TrashService`（如恢复链路需要）

可覆盖：

- 版本列表
- 单版本详情
- 恢复历史版本
- 恢复后的计数和时间戳修正

### 5.8.9 回收站 / 彻底删除 / 恢复

适合拆成：

- `TrashRepository`
- `TrashService`
- `ModerationService`

可覆盖：

- 删除进入回收站
- 从回收站恢复
- 彻底删除
- 按天数清理
- 主题 / 帖子 / 附件联动恢复

### 5.8.10 版务动作与处罚体系

适合拆成：

- `ModerationService`
- `PunishmentRepository`
- `PunishmentService`

可覆盖：

- 锁帖 / 置顶 / 加精 / 全站置顶
- 移动帖子
- 板块广播
- 管理员重置密码
- 处罚记录 / 封禁 / 黑名单（如后续扩展）

### 5.8.11 活动子系统

适合拆成：

- `ActivityRepository`
- `ActivityService`

可覆盖：

- 活动贴解析
- 报名 / 取消报名
- 活动名单查询
- 活动状态同步到帖子展示

活动模块建议放在主干稳定后再迁，因为它依赖帖子、用户、通知三条链路。

### 5.8.12 统计、修复脚本与一致性校验

适合拆成：

- `CounterService`
- `MaintenanceService`（如后续需要）

可覆盖：

- 计数器校验
- 计数器修复
- 垃圾数据巡检
- 历史数据补偿任务

这类功能不一定先进入线上请求链，但应复用同一套 Repository，避免脚本继续直接散写 SQL。

---

## 5.9 分层实施优先级（从重要到不重要）

为了满足“渐进式重构 + 旧站不停机兼容”的目标，建议按下面的优先级做。

### S 级：主干依赖域，必须最先做

1. 用户 / 会话 / 认证
2. 权限 / 发言策略
3. 帖子读取链

原因：

- 所有写操作都依赖当前用户上下文
- 所有页面都依赖读取链
- 不先收口权限，后面每个域都会重复写一遍授权逻辑

### A 级：核心互动域

1. 发帖 / 回帖 / 编辑 / 删除
2. 楼中楼
3. 通知 / 未读数 / 计数器
4. 附件

原因：

- 这是论坛最核心的互动闭环
- 多表写入多，事务收益最高

### B 级：高频配套域

1. 收藏
2. 私信 / 系统消息
3. 搜索 / 热门 / 最近主题
4. 在线状态 / 签到 / token 保活

原因：

- 业务清晰，适合在主干稳定后逐步抽离
- 对用户体验影响大，但对主链路依赖小于发帖链

### C 级：中后台与治理域

1. 邮箱验证 / 邮箱禁言 / 邮箱可见性
2. 编辑历史 / 版本恢复
3. 回收站 / 恢复 / 清理
4. 版务动作 / 广播 / 重置密码
5. 首页公告 / 轮播 / 下载区 / 校历

### D 级：低频但复杂或边缘域

1. 活动子系统
2. 处罚体系扩展
3. 数据修复脚本体系化
4. 旧客户端 / XML 兼容清理

---

## 6. 旧入口如何适配新 Service

这是本次计划最关键的兼容策略。

## 6.1 `jiekoufunc_*` 保留为兼容层

例如：

```php
function jiekoufunc_login($con, $username, $password, $ip, $params) {
    $service = capubbs_auth_service($con);
    $result = $service->login($username, $password, $ip, $params);
    return LegacyResultAdapter::success($result);
}
```

同理：

- `jiekoufunc_currentUserInfo()` -> `UserService`
- `jiekoufunc_post()` -> `PostService`
- `jiekoufunc_reply()` -> `PostService`
- `jiekoufunc_edit()` -> `PostService`
- `jiekoufunc_lzl()` -> `NestedReplyService`

## 6.2 页面入口短期不改协议

例如：

- `bbs/post/index.php`
- `bbs/delete/index.php`
- `bbs/postlzl/index.php`

短期仍然：

- 读旧参数
- 调 `mainfunc()`

但 `mainfunc()` / `dispatch()` / `jiekoufunc_*` 内部已逐步改调新 Service。

---

## 7. 推荐的类边界

## 7.1 UserRepository

负责：

- 查用户
- 查 token
- 更新 token / tokentime / nowboard / lastip
- 更新资料
- 更新密码
- 更新 `userinfo` 统计字段

不负责：

- 生成 token
- 密码校验策略
- 板块权限判断

## 7.2 AuthService

负责：

- 登录
- 注销
- 注册
- 刷新会话
- 当前用户获取

依赖：

- `UserRepository`
- `SignRepository`
- `EmailVerificationRepository`

## 7.3 PermissionService

负责：

- 当前用户权限判断
- 版主权限判断
- 特殊版块访问规则
- 发帖/编辑/删除授权判断

## 7.4 ThreadReadService

负责：

- 版块列表
- 帖子详情
- 楼层分页
- 最近发帖 / 最近回复
- 详情聚合 payload

## 7.5 PostService

负责：

- 发主题
- 回帖
- 编辑
- 删除
- 移动
- 锁帖/置顶/加精
- 编辑历史

## 7.6 NestedReplyService

负责：

- 楼中楼读取
- 楼中楼发表
- 楼中楼删除

## 7.7 NotificationService

负责：

- 私信落库
- at / quote / reply / replylzl / replylzlreply 消息

## 7.8 CounterService

负责：

- `userinfo.post/reply/water/extr/sign/newmsg`
- `threads.reply/timestamp/replyer/click`
- `posts.lzl`
- `userinfo.star`

---

## 8. 迁移中的硬性规则

## 8.1 Repository 规则

- 不读取超全局
- 不输出 HTML / JSON
- 不写权限逻辑
- 不触发通知
- 不做复杂业务流程

## 8.2 Service 规则

- 不直接写 SQL
- 不读 `$_GET/$_POST/$_COOKIE`
- 不直接 `echo`
- 所有多表写入通过事务执行器

## 8.3 Adapter 规则

- 尽量只做参数转换
- 尽量不保留新业务逻辑
- 旧返回格式通过 `LegacyResultAdapter` 统一适配

---

## 9. 风险点与注意事项

## 9.1 最大风险：只是把长函数“搬家”

如果迁移方式只是：

- 从 `jiekoufunc.php` 复制代码到 `UserService`

但没有拆分 Repository / 副作用 / 事务边界，
那最终只是换文件名，不是分层。

## 9.2 第二风险：页面层仍偷偷写逻辑

重点关注：

- `bbs/content/index.php`
- `bbs/main/index.php`
- `bbs/home/message.php`
- `bbs/user/index.php`

这些页面有大量补充逻辑，迁移读取链时必须识别页面侧额外拼装。

## 9.3 第三风险：冗余字段漏更新

重构帖子与楼中楼时，一旦遗漏：

- `threads.reply`
- `posts.lzl`
- `userinfo.reply`
- `userinfo.newmsg`

就会产生现有脚本已经证明存在的数据漂移问题。

---

## 10. 验收方式

每阶段都必须做“兼容式验收”。

## 10.1 功能一致性

- 旧页面访问结果不变
- 旧 API 返回结构不变
- 关键错误码不变

## 10.2 输出一致性

重点比较：

- 用户信息字段
- 帖子详情页正文 / quote / 签名渲染
- 楼中楼列表顺序与字段
- 收藏 / 附件 / 消息数量

## 10.3 数据一致性

在帖子写入和楼中楼迁移后，建议跑：

- `scripts/check_counters.php`

确保冗余计数没有明显回归。

---

## 11. 推荐起步任务（第一轮）

如果要立刻开始，建议第一轮只做这些：

### 第一周

1. 建 `src/Bootstrap.php`
2. 建 `RequestContext`
3. 建 `LegacyResultAdapter`
4. 建 `TransactionRunner`
5. 建 `UserRepository`
6. 建 `AuthService`

### 第二周

7. 建 `PermissionService`
8. 建 `UserService`
9. 迁：
   - `jiekoufunc_getuser`
   - `jiekoufunc_currentUserInfo`
   - `jiekoufunc_login`
   - `jiekoufunc_logout`
   - `jiekoufunc_user_profile`

### 第三周

10. 开始拆 `ThreadDetailQuery.php`
11. 建 `ThreadReadService`
12. 建 `ContentRenderService`

---

## 12. 一句话总结

**CAPUBBS 的分层重构应采用“保留旧入口、先抽业务内核”的渐进路线，优先迁用户/认证，再迁帖子读取，再迁帖子写操作，最后迁楼中楼；第一阶段的关键不是 Router 或页面重写，而是建立稳定的 Service / Repository 业务主干。**
