# CAPUBBS

CAPUBBS 是车协论坛的服务端接口与 Web 前端仓库，包含 PHP 接口、旧论坛、新论坛前端以及电子年刊等独立站点。

## 目录

1. [主要功能](#主要功能)
2. [仓库结构](#仓库结构)
3. [运行环境](#运行环境)
4. [本地开发](#本地开发)
5. [构建与部署](#构建与部署)
6. [协作规范](#协作规范)

## 主要功能

### 站点主页

根路径 `/` 为车协主页，依次展示宣传图、协会介绍、年刊、视频资料与联系方式，并与论坛共用登录会话。宣传图、公告、日历、视频与联系方式由权限值不低于 3 的会员维护。详见 [index/README.md](index/README.md)。

### 论坛

`/bbs/` 为论坛统一入口，按用户选择加载新论坛或旧论坛，两者共用同一账号体系与数据库。新论坛位于 `forum/`，提供以下功能：

| 模块 | 功能 |
| --- | --- |
| 首页 | 全局置顶、热门帖子、活动日历与近期活动 |
| 版面与帖子 | 版面帖子列表、帖子阅读、楼层引用与楼中楼回复、图片灯箱、音视频嵌入 |
| 发帖与编辑 | 富文本与 Markdown 编辑、图片粘贴与图廊、HTML 片段、活动报名表 |
| 搜索 | 按标题、正文或用户搜索帖子 |
| 账号 | 注册、登录、找回密码、多账号切换 |
| 个人中心 | 个人资料与头像、公开主页、签名档、收藏、浏览记录、站内消息与私信、偏好设置 |
| 活动 | 帖内活动报名、报名管理、活动日历维护 |
| 标签与勋章 | 用户标签、勋章展示与设计 |
| 档案室 | 车协历史资料的浏览、文件夹上传与帖子关联 |
| 数据展示 | 当前在线、今日签到、签到排行、活跃排行、网站流量、罚跑记录 |
| 工具箱 | 表格转 VCF、标签查询、押后谱系 |
| 论坛管理 | 全局置顶、帖子挪版、会员管理、版主管理、标签管理、勋章管理 |

旧论坛位于 `bbs/`，保持原有实现，供选择旧版界面的用户继续使用。

### 电子年刊

`/annual/` 按年份倒序列出车协年刊的网页版。每份年刊均为独立运行的静态网站，目录不注入任何布局或脚本。详见 [annual/README.md](annual/README.md)。

### 接口

`api/` 提供论坛、主页与各项功能共用的 PHP 接口，统一入口为 `/api/api.php`。

### 专题文档

| 文档 | 内容 |
| --- | --- |
| [forum/README.md](forum/README.md) | 新论坛前端开发说明 |
| [forum/docs/yahou-lineage.md](forum/docs/yahou-lineage.md) | 押后谱系的数据模型、写入机制、部署与验证 |
| [forum/docs/statistics-snapshots.md](forum/docs/statistics-snapshots.md) | 网站流量与活跃排行快照的口径、定时任务与服务器配置 |
| [SERVER_DEPLOYMENT.md](SERVER_DEPLOYMENT.md) | 新论坛正式上线手册 |

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
| `forum/docs/` | 新论坛专题文档 |
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

### 定时任务

网站流量与活跃排行依赖每日执行的后台结算脚本，首次部署时须先初始化快照并配置 cron，步骤见 [forum/docs/statistics-snapshots.md](forum/docs/statistics-snapshots.md)。

### 新旧论坛路由

`/bbs/` 是新旧论坛的统一路由根。未设置模式 Cookie 时，持有登录 `token` 的用户初始化为旧论坛，其余用户默认进入新论坛；切换模式时写入浏览器 Cookie。此后首页、版面、帖子、搜索、用户中心等 `/bbs/...` 请求均按 Cookie 加载对应实现，不跳转目录，也不附加模式参数。新论坛生成的链接仅使用 `/bbs`。

生产环境须在 Nginx 的 `http` 作用域内根据 Cookie 生成模式变量，并在站点中配置 `/bbs` 分流。核心规则如下，完整配置见 [SERVER_DEPLOYMENT.md](SERVER_DEPLOYMENT.md)：

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

## 协作规范

- 日常开发在 `new` 分支进行；电子年刊相关工作在 `annual` 分支进行。
- 一次性维护脚本与数据处理脚本存放于 `tool/` 目录，不纳入 Git 跟踪，部署时单独上传。
- 修改 PHP 文件后，须使用 PHP 5.6 解释器进行语法检查与兼容性回归。
- 新论坛相关改动限定在 `forum/` 目录；除非明确需要，不修改旧论坛 `bbs/`。

完整规范见 [AGENTS.md](AGENTS.md)。
