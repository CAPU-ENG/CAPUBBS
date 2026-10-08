# 统计快照

数据展示页的“网站流量”与“活跃排行”均读取后台任务预先生成的静态快照，页面请求不会实时查询数据库。两项任务的脚本存放于本地 `tool/` 目录，不纳入 Git，部署时单独上传。

## 网站流量每日快照

### 数据口径

网站流量页面读取 `api/cache/website-traffic/current.json` 所指向的周、月、年静态 JSON 文件，分别统计截至昨日的 7、30、365 个上海时区自然日；每份文件同时包含浏览次数与签到人数的逐日数据。页面访问与兼容接口均不触发实时汇总；结算失败时继续提供上一次成功发布的数据。

旧版快照仍可用于显示浏览次数；缺少签到字段时，页面显示“签到数据暂不可用”。结算脚本更新后，首次运行会自动补齐过去一年的签到数据，随后恢复按日增量结算。

### 部署步骤

1. 单独上传本地脚本 `tool/refresh-website-traffic.php`（按仓库规范不纳入 Git），并先上传 `api/lib/WebsiteTrafficSnapshot.php`。
2. 以将来执行定时任务的用户身份，在项目根目录初始化历史数据：

   ```bash
   php tool/refresh-website-traffic.php --initialize
   ```

3. 初始化成功后，再部署其余接口与前端改动。
4. 确保缓存目录对任务用户可写、对 Web 服务可读。

该过程不修改数据库表或索引。首次初始化查询最近 365 个已结束日期；日常任务仅查询前一日，漏跑后一次性补齐缺失日期。原始明细缺少日期索引时，后台结算可能扫描较多记录，但不会由访客请求触发。`--initialize` 也可用于手动重建历史快照，重建期间现有结果仍可读取。

### 定时任务

在 cron 使用 **Asia/Shanghai** 时区的服务器上，配置每日 0:00 执行（替换项目、PHP 与日志的绝对路径）：

```cron
0 0 * * * cd /path/to/CAPUBBS && /usr/bin/php tool/refresh-website-traffic.php >> /path/to/website-traffic.log 2>&1
```

若 cron 使用 UTC，改为 `0 16 * * *`，对应上海时区次日 0:00。脚本始终按上海日期结算；同日重复运行将直接跳过，并以文件锁防止任务重叠。

### Web 服务器配置

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

## 活跃排行每日快照

### 数据口径

数据展示页的“活跃排行”读取 `api/cache/activity-ranking/current.json`。快照统计最近 90 个已结束的上海时区自然日：每位用户每日的 `username_view.view_times` 合计最多计 50 分，按累计分数降序取前 100 名。快照仅由后台任务生成，页面请求不会实时查询数据库。

### 部署步骤

1. 单独上传本地脚本 `tool/refresh-activity-ranking.php`（按仓库规范不纳入 Git），并先上传 `api/lib/ActivityRankingSnapshot.php` 及缓存目录规则。
2. 首次运行与每日更新使用同一命令：

   ```bash
   php tool/refresh-activity-ranking.php
   ```

3. 确保缓存目录对任务用户可写、对 Web 服务可读。

### 定时任务

在 cron 使用 **Asia/Shanghai** 时区的服务器上，配置每日 0:00 执行：

```cron
0 0 * * * cd /path/to/CAPUBBS && /usr/bin/php tool/refresh-activity-ranking.php >> /path/to/activity-ranking.log 2>&1
```

若 cron 使用 UTC，改为 `0 16 * * *`。任务以文件锁防止并发运行，并通过临时文件原子替换 `current.json`；统计失败时保留上一次成功的快照。

### Web 服务器配置

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
