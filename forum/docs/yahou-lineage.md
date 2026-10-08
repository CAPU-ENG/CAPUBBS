# 押后谱系

## 功能概述

新论坛工具箱入口为 `/bbs/toolbox?tab=yahou-lineage`。所有用户均可查看、搜索和聚焦师门；权限值不低于 3 的登录会员可选中节点添加徒弟或更新状态，选中“实践部”可添加直属 ID。页面与接口均不提供删除关系或更换师傅的操作。

## 谱系总览

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

## 数据模型

唯一主数据文件为 `forum/data/yahou-lineage.json`：

| 字段 / 值 | 含义 |
| --- | --- |
| `parentId: null` | 直属“实践部” |
| `parentId: <ID>` | 师傅 ID |
| `pending` | 学徒：未过押后 |
| `passed` | 押后：已过押后 |
| `qualified` | 师父：已过押后且具备收徒资格 |

已有后代的 ID 必须保持 `qualified`。初始 734 个 ID 及其关系来自[师徒制谱系首楼](https://chexie.net/bbs/content/?bid=5&p=1&tid=1533#1)：无状态标记的 ID 视为已过押后，所有已有后代的 ID 及原帖明确标记的师傅视为具备收徒资格。

## 写入与备份

- 每次成功修改前，将原文件写入唯一的 `yahou-lineage.backup.json`；无变化或失败的请求不滚动备份。
- 运行时通过 `yahou-lineage.lock` 串行化修改，并以同目录临时文件原子替换，避免写出不完整的 JSON。
- 客户端版本过期时拒绝覆盖，用户须刷新后重试。
- 备份、锁和临时文件均不纳入 Git。

## 部署与维护

1. 首次部署时上传主 JSON，并授予 PHP 运行用户对 `forum/data/` 的读写权限；后续部署须保留服务器上已维护的主文件。
2. 数据仅通过 `/api/api.php` 读取，不得直接公开数据目录。Apache 使用该目录内的 `.htaccess`；Nginx 在站点配置中加入 `location ^~ /forum/data/ { return 404; }`，该规则不影响 `/bbs/` 入口。
3. 人工修正关系须在服务器上进行，并与 Web 写入共用 `yahou-lineage.lock` 排他锁。修改后递增 `revision`，并保证 ID 唯一、师傅存在、关系无环、已有后代者具备收徒资格。直接恢复备份时同样须递增版本。
4. 主文件缺失或损坏时接口直接报错，不会以初始数据自动覆盖。

## 依赖补丁

`forum/patches/@relation-graph+react+3.1.2.patch` 修正该版本 TypeScript 源类型中两处缺少 `import type` 的声明，避免与项目启用的 `verbatimModuleSyntax` 冲突。`npm install` / `npm ci` 的 `postinstall` 会自动应用该补丁；升级该依赖时须确认补丁是否仍有必要。

## 验证

| 命令 | 前提 | 检查内容 |
| --- | --- | --- |
| `npm --prefix forum run verify:yahou-lineage` | 本地 PHP 服务已启动 | 树结构、资格约束、祖先定位与搜索 |
| `npm --prefix forum run verify:yahou-overview` | — | 全量节点与关系、源数据隔离、ID 命名空间、四项力度效果、拖动固定与释放、暂停与清理、标签避让、SVG 转义及昼夜配色 |
| `npm --prefix forum run verify:yahou-overview-dom` | 已构建；PHP 服务以 `php -c php.ini -S 127.0.0.1:8081 router.php` 启动 | 无浏览器 DOM 回归：图形组件挂载、节点与连线数量、弹窗打开后测量、关闭清理、模块加载与渲染异常隔离，以及资源实际内容与 JS/CSS MIME |
| `npm --prefix forum run verify:yahou-overview-dev` | Vite 开发服务已启动 | 5173 端口实际返回的总览模块及其全部依赖 |

`verify:yahou-overview-dom` 默认连接 `http://127.0.0.1:8081`，可通过 `CAPUBBS_PHP_ORIGIN` 指定其他地址；`verify:yahou-overview-dev` 可通过 `CAPUBBS_VITE_ORIGIN` 指定开发服务地址。

安装或重装依赖后，须以 `npm --prefix forum run dev -- --force` 重启正在运行的 Vite 服务并刷新已打开的页面，以免旧的预构建缓存导致 `504 Outdated Optimize Dep`。relation-graph 与 D3 已加入启动预构建。
