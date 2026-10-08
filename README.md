# CAPUBBS

CAPUBBS 是车协论坛的服务端接口与 Web 前端仓库，包含 PHP 接口、旧论坛、新论坛前端以及电子年刊等独立站点。

## 目录

1. [仓库结构](#仓库结构)
2. [运行环境](#运行环境)
3. [本地开发](#本地开发)
4. [构建与部署](#构建与部署)
5. [功能模块](#功能模块)
   - [电子年刊](#电子年刊)
   - [押后谱系](#押后谱系)
   - [网站流量每日快照](#网站流量每日快照)
   - [活跃排行每日快照](#活跃排行每日快照)
6. [协作规范](#协作规范)

## 仓库结构

| 路径 | 说明 |
| --- | --- |
| `api/` | PHP 接口，入口为 `/api/api.php` |
| `bbs/` | 旧论坛（PHP） |
| `forum/` | 新论坛前端（React + TypeScript + Vite） |
| `annual/` | 电子年刊目录与各年份年刊 |
| `index/`、`index.php` | 站点首页 |
| `router.php` | 本地 PHP 开发服务器的路由脚本 |
| `php.ini` | 本地开发使用的 PHP 配置 |
| `*.sql` | 数据库结构及增量脚本 |
| `docs/` | 设计、计划与部署文档 |
| `SERVER_DEPLOYMENT.md` | 新论坛正式上线手册 |

## 运行环境

| 组件 | 要求 |
| --- | --- |
| PHP | 生产代码须兼容 PHP 5.6；本地可使用更高版本运行 |
| MySQL | 与生产数据库结构一致，见仓库根目录 `*.sql` |
| Node.js | 支持 `--experimental-strip-types` 的版本（22.6 及以上），用于构建与验证脚本 |
| Web 服务器 | 生产环境推荐 Nginx + PHP-FPM；Apache 需实现等价规则 |

## 本地开发

### 启动 PHP 服务

在仓库根目录启动 PHP 内置服务器。必须加载仓库内的 `php.ini`，否则档案室上传将受 PHP 默认的 2M/8M 限制：

```bash
php -c php.ini -S localhost:8080 router.php
```

### 启动新论坛前端

在另一终端中执行：

```bash
cd forum
npm install
npm run dev
```

Vite 默认通过 `http://localhost:8080` 访问 PHP 接口；如 PHP 服务使用其他地址，请设置环境变量 `CAPUBBS_PHP_ORIGIN`。

开发服务根据 `capubbs_forum_mode` Cookie 分流：值为 `legacy` 时请求转发至旧论坛，其余情况加载新论坛。未设置模式 Cookie 但持有登录 `token` 的用户首次访问时初始化为 `legacy`；两者均未设置的新用户默认进入新论坛。

### 验证统一入口

通过本地 PHP 服务验证统一入口 `/bbs/` 前，须先执行 `npm run build`。`router.php` 按 `capubbs_forum_mode` Cookie 对所有 `/bbs/...` 页面分流，并从 `/bbs/new-assets/` 提供本地构建资源。

### 验证脚本

`forum/package.json` 中以 `verify:` 开头的脚本为各功能的回归检查，运行方式如下：

```bash
npm --prefix forum run verify:<名称>
```

部分脚本依赖本地 PHP 服务或 Vite 开发服务，具体要求见各功能模块说明。

## 构建与部署

### PHP 配置

服务器实际加载的 `php.ini` 或 PHP-FPM 配置中须设置以下值，修改后重启相应服务：

```ini
upload_max_filesize = 500M
post_max_size = 520M
```

`post_max_size` 须大于 `upload_max_filesize`，以容纳 multipart 请求的额外内容。仓库根目录的 `php.ini` 仅用于本地开发。

### 构建前端

```bash
cd forum
npm ci
npm run build
```

将 `forum/dist` 的内容部署到服务器内部的新论坛静态目录。对外页面和资源统一使用 `/bbs/` 与 `/bbs/new-assets/`，不再公开 `/forum` 路径。`/api`、旧站 `/assets`、旧论坛文件和 `/bbsimg` 继续由 PHP 站点处理。部署 PHP 配置或前端文件后，应重启 PHP-FPM 或 Web 服务器并清理旧缓存。

### 新旧论坛路由

`/bbs/` 是新旧论坛的统一路由根。未设置模式 Cookie 时，持有登录 `token` 的用户初始化为旧论坛，其余用户默认进入新论坛；切换模式时写入浏览器 Cookie。此后首页、版面、帖子、搜索、用户中心等 `/bbs/...` 请求均按 Cookie 加载对应实现，不跳转目录，也不附加模式参数。新论坛生成的链接仅使用 `/bbs`。

生产环境须在 Nginx 的 `http` 作用域内根据 Cookie 生成模式变量，并在站点中配置 `/bbs` 分流。核心规则如下，完整配置见 [SERVER_DEPLOYMENT.md](SERVER_DEPLOYMENT.md) 与 [docs/deployment/](docs/deployment/)：

```nginx
map "$cookie_capubbs_forum_mode|$cookie_token" $capubbs_forum_mode {
    ~^legacy\| legacy;
    ~^new\| new;
    ~^\|.+ legacy;
    default new;
}

map "$cookie_capubbs_forum_mode|$cookie_token|$uri" $capubbs_forum_mode_cookie {
    ~^\|[^|]+\|/bbs(?:/|$) "capubbs_forum_mode=legacy; Path=/; Max-Age=31536000; SameSite=Lax; Secure";
    default "";
}

add_header Set-Cookie $capubbs_forum_mode_cookie always;

location = /bbs {
    return 308 /bbs/;
}

location /bbs/ {
    if ($capubbs_forum_mode = new) {
        rewrite ^ /__capubbs_new_forum last;
    }
    try_files $uri $uri/ /bbs/index.php?$query_string;
}
```

## 功能模块

### 电子年刊

入口为 `/annual/`，按年份倒序列出包含 `index.html` 的 `annual/<年份>/` 目录。目录链接直接打开对应年份的原始页面，不注入任何布局、样式或脚本；各年刊均为可独立运行的完整静态网站，页面结构、资源与导航由年刊自身决定。旧地址 `/annual/read.php?year=<年份>` 永久跳转至 `/annual/<年份>/`。

文件结构、标题配置与新增年刊的方法见 [annual/README.md](annual/README.md)。

### 押后谱系

#### 功能概述

新论坛工具箱入口为 `/bbs/toolbox?tab=yahou-lineage`。所有用户均可查看、搜索和聚焦师门；权限值不低于 3 的登录会员可选中节点添加徒弟或更新状态，选中“实践部”可添加直属 ID。页面与接口均不提供删除关系或更换师傅的操作。

#### 谱系总览

右上角“谱系总览”使用 relation-graph 展示可拖动、缩放的关系网络，由 D3 力导向模拟提供持续漂浮与节点碰撞避让，并支持以下操作：

- 调节中心力、排斥力、连线力度与连线长度，或恢复默认值；
- 暂停或继续漂浮，固定或释放“实践部”节点；
- 搜索定位 ID，选中节点后高亮相邻师徒及溯源至“实践部”的完整路径；
- 通过搜索或点击累计选择多个 ID，合并高亮各自的祖先路径与直属关系；右下方列表按选择顺序记录，可定位、逐个取消或清空，重复选择自动去重；
- 适应窗口，下载当前布局的 SVG；
- 键盘快捷键：加减键缩放，Home 适应窗口，空格暂停或继续。

显示规则：

- 高亮连线叠加由师父流向徒弟的光效，漂浮暂停或页面隐藏时随之暂停；
- 同代节点大小一致，越靠近根节点越大；标签按缩放与碰撞检测自动取舍，完整 ID 可通过悬停、搜索和选中查看；
- 画布、节点、文字与连线跟随论坛昼夜模式，下载的 SVG 保留当时配色；
- 系统偏好“减少动态效果”时默认暂停且不显示光效；
- 关闭总览即停止模拟，页面隐藏时暂停计算；
- 宽度小于 1024px 的移动端不提供总览入口，切换到该宽度时自动关闭总览。

总览直接使用当前 JSON 数据；拖动、力度调整与多选比较仅在本次总览内有效，不修改师徒关系，也不另存图形数据。

relation-graph、D3 及总览专用样式仅在打开总览时加载，不进入首屏资源清单；全站仅保留轻量的弹窗外壳与加载失败样式，确保加载中或出错时仍可关闭窗口。开发服务的依赖预构建仅准备服务端缓存，不会提前向浏览器发送图谱资源。

#### 数据模型

唯一主数据文件为 `forum/data/yahou-lineage.json`：

| 字段 / 值 | 含义 |
| --- | --- |
| `parentId: null` | 直属“实践部” |
| `parentId: <ID>` | 师傅 ID |
| `pending` | 学徒：未过押后 |
| `passed` | 押后：已过押后 |
| `qualified` | 师父：已过押后且具备收徒资格 |

已有后代的 ID 必须保持 `qualified`。初始 734 个 ID 及其关系来自[师徒制谱系首楼](https://chexie.net/bbs/content/?bid=5&p=1&tid=1533#1)：无状态标记的 ID 视为已过押后，所有已有后代的 ID 及原帖明确标记的师傅视为具备收徒资格。

#### 写入与备份

- 每次成功修改前，将原文件写入唯一的 `yahou-lineage.backup.json`；无变化或失败的请求不滚动备份。
- 运行时通过 `yahou-lineage.lock` 串行化修改，并以同目录临时文件原子替换，避免写出不完整的 JSON。
- 客户端版本过期时拒绝覆盖，用户须刷新后重试。
- 备份、锁和临时文件均不纳入 Git。

#### 部署与维护

1. 首次部署时上传主 JSON，并授予 PHP 运行用户对 `forum/data/` 的读写权限；后续部署须保留服务器上已维护的主文件。
2. 数据仅通过 `/api/api.php` 读取，不得直接公开数据目录。Apache 使用该目录内的 `.htaccess`；Nginx 在站点配置中加入 `location ^~ /forum/data/ { return 404; }`，该规则不影响 `/bbs/` 入口。
3. 人工修正关系须在服务器上进行，并与 Web 写入共用 `yahou-lineage.lock` 排他锁。修改后递增 `revision`，并保证 ID 唯一、师傅存在、关系无环、已有后代者具备收徒资格。直接恢复备份时同样须递增版本。
4. 主文件缺失或损坏时接口直接报错，不会以初始数据自动覆盖。

#### 依赖补丁

`forum/patches/@relation-graph+react+3.1.2.patch` 修正该版本 TypeScript 源类型中两处缺少 `import type` 的声明，避免与项目启用的 `verbatimModuleSyntax` 冲突。`npm install` / `npm ci` 的 `postinstall` 会自动应用该补丁；升级该依赖时须确认补丁是否仍有必要。

#### 验证

| 命令 | 前提 | 检查内容 |
| --- | --- | --- |
| `npm --prefix forum run verify:yahou-lineage` | 本地 PHP 服务已启动 | 树结构、资格约束、祖先定位与搜索 |
| `npm --prefix forum run verify:yahou-overview` | — | 全量节点与关系、源数据隔离、ID 命名空间、四项力度效果、拖动固定与释放、暂停与清理、标签避让、SVG 转义及昼夜配色 |
| `npm --prefix forum run verify:yahou-overview-dom` | 已构建；PHP 服务以 `php -c php.ini -S 127.0.0.1:8081 router.php` 启动 | 无浏览器 DOM 回归：图形组件挂载、节点与连线数量、弹窗打开后测量、关闭清理、模块加载与渲染异常隔离，以及资源实际内容与 JS/CSS MIME |
| `npm --prefix forum run verify:yahou-overview-dev` | Vite 开发服务已启动 | 5173 端口实际返回的总览模块及其全部依赖 |

`verify:yahou-overview-dom` 默认连接 `http://127.0.0.1:8081`，可通过 `CAPUBBS_PHP_ORIGIN` 指定其他地址；`verify:yahou-overview-dev` 可通过 `CAPUBBS_VITE_ORIGIN` 指定开发服务地址。

安装或重装依赖后，须以 `npm --prefix forum run dev -- --force` 重启正在运行的 Vite 服务并刷新已打开的页面，以免旧的预构建缓存导致 `504 Outdated Optimize Dep`。relation-graph 与 D3 已加入启动预构建。

### 网站流量每日快照

#### 数据口径

网站流量页面读取 `api/cache/website-traffic/current.json` 所指向的周、月、年静态 JSON 文件，分别统计截至昨日的 7、30、365 个上海时区自然日；每份文件同时包含浏览次数与签到人数的逐日数据。页面访问与兼容接口均不触发实时汇总；结算失败时继续提供上一次成功发布的数据。

旧版快照仍可用于显示浏览次数；缺少签到字段时，页面显示“签到数据暂不可用”。结算脚本更新后，首次运行会自动补齐过去一年的签到数据，随后恢复按日增量结算。

#### 部署步骤

1. 单独上传本地脚本 `tool/refresh-website-traffic.php`（按仓库规范不纳入 Git），并先上传 `api/lib/WebsiteTrafficSnapshot.php`。
2. 以将来执行定时任务的用户身份，在项目根目录初始化历史数据：

   ```bash
   php tool/refresh-website-traffic.php --initialize
   ```

3. 初始化成功后，再部署其余接口与前端改动。
4. 确保缓存目录对任务用户可写、对 Web 服务可读。

该过程不修改数据库表或索引。首次初始化查询最近 365 个已结束日期；日常任务仅查询前一日，漏跑后一次性补齐缺失日期。原始明细缺少日期索引时，后台结算可能扫描较多记录，但不会由访客请求触发。`--initialize` 也可用于手动重建历史快照，重建期间现有结果仍可读取。

#### 定时任务

在 cron 使用 **Asia/Shanghai** 时区的服务器上，配置每日 0:00 执行（替换项目、PHP 与日志的绝对路径）：

```cron
0 0 * * * cd /path/to/CAPUBBS && /usr/bin/php tool/refresh-website-traffic.php >> /path/to/website-traffic.log 2>&1
```

若 cron 使用 UTC，改为 `0 16 * * *`，对应上海时区次日 0:00。脚本始终按上海日期结算；同日重复运行将直接跳过，并以文件锁防止任务重叠。

#### Web 服务器配置

Apache 可使用缓存目录内的 `.htaccess`。Nginx 在站点配置中加入以下规则（缓存目录不应交由 PHP 处理）：

```nginx
location = /api/cache/website-traffic/current.json {
    add_header Cache-Control "no-cache, must-revalidate";
    try_files $uri =404;
}
location ~ "^/api/cache/website-traffic/snapshots/[0-9]{14}-[a-f0-9]{10}/(week|month|year)\\.json$" {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
}
location /api/cache/website-traffic/ {
    return 404;
}
```

页面刷新按钮仅重新读取已发布的版本。缺少初始快照时不会回退到数据库实时计算，也不提供公开的 HTTP 结算入口。

### 活跃排行每日快照

#### 数据口径

数据展示页的“活跃排行”读取 `api/cache/activity-ranking/current.json`。快照统计最近 90 个已结束的上海时区自然日：每位用户每日的 `username_view.view_times` 合计最多计 50 分，按累计分数降序取前 100 名。快照仅由后台任务生成，页面请求不会实时查询数据库。

#### 部署步骤

1. 单独上传本地脚本 `tool/refresh-activity-ranking.php`（按仓库规范不纳入 Git），并先上传 `api/lib/ActivityRankingSnapshot.php` 及缓存目录规则。
2. 首次运行与每日更新使用同一命令：

   ```bash
   php tool/refresh-activity-ranking.php
   ```

3. 确保缓存目录对任务用户可写、对 Web 服务可读。

#### 定时任务

在 cron 使用 **Asia/Shanghai** 时区的服务器上，配置每日 0:00 执行：

```cron
0 0 * * * cd /path/to/CAPUBBS && /usr/bin/php tool/refresh-activity-ranking.php >> /path/to/activity-ranking.log 2>&1
```

若 cron 使用 UTC，改为 `0 16 * * *`。任务以文件锁防止并发运行，并通过临时文件原子替换 `current.json`；统计失败时保留上一次成功的快照。

#### Web 服务器配置

Apache 可直接使用缓存目录内的 `.htaccess`。Nginx 加入以下规则，仅公开当前快照，并屏蔽锁文件、临时文件及目录中的其他文件：

```nginx
location = /api/cache/activity-ranking/current.json {
    add_header Cache-Control "no-cache, must-revalidate";
    try_files $uri =404;
}
location /api/cache/activity-ranking/ {
    return 404;
}
```

## 协作规范

- 日常开发在 `new` 分支进行；电子年刊相关工作在 `annual` 分支进行。
- 一次性维护脚本与数据处理脚本存放于 `tool/` 目录，不纳入 Git 跟踪，部署时单独上传。
- 修改 PHP 文件后，须使用 PHP 5.6 解释器进行语法检查与兼容性回归。
- 新论坛相关改动限定在 `forum/` 目录；除非明确需要，不修改旧论坛 `bbs/`。

完整规范见 [AGENTS.md](AGENTS.md)。
