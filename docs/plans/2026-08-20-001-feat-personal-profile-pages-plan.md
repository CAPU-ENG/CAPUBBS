---
title: "feat: 实现个人中心与个人主页"
type: feat
status: active
date: 2026-08-20
origin: docs/brainstorms/2026-08-20-personal-center-ui-brainstorm.md
---

# feat: 实现个人中心与个人主页

## Overview

在当前 `forum/` React 前端中实现个人中心与公开个人主页。个人中心承载资料编辑和六类私有内容管理；个人主页展示公开资料、公开论坛活动与按访问者身份控制的操作。页面以现有论坛 Navbar、背景、色彩 token、锐角矩形和响应式规则为基础，不修改 `api/`，首版使用本地演示数据。（见 brainstorm：`docs/brainstorms/2026-08-20-personal-center-ui-brainstorm.md`）

## Local Research

- 当前应用使用 React 19 + TypeScript + Vite，无路由库；`forum/src/App.tsx` 直接读取 `window.location` 决定页面。
- `forum/src/components/layout/TopBar.tsx` 已提供头像菜单，但个人中心仍指向旧 `/bbs/home/`。
- `forum/src/components/layout/AppBackground.tsx`、`TopBar.tsx` 和 `Pagination.tsx` 可直接复用。
- 样式已按模块拆分，入口为 `forum/src/styles/index.css`；本功能应新增独立 `profile.css`，不把大量页面规则写回 `layout.css`。
- `BBS new` 参考实现位于 `/Users/mac/Code/CAPUBBS-bbs-new-reference/bbs-new/app/src/routes/UserCenterRoute.tsx` 与 `PublicProfileRoute.tsx`，可复用其数据分层和交互语义，不直接复制旧视觉。
- 仓库没有前端测试运行器；验证以 TypeScript 类型检查、Vite 构建和本地 PHP 静态服务检查为主。
- 本地上下文充分，未进行外部研究。

## Proposed Solution

### 1. 共享领域数据与视图组件

- 在 `forum/src/data/profileDemo.ts` 定义个人资料、论坛档案、六类记录与公开主页演示用户。
- 在 `forum/src/components/profile/` 建立共享组件：身份摘要、资料网格、论坛档案、内容 Tab、记录列表、筛选面板、空状态和对话框。
- 组件通过显式 props 区分私有中心与公开主页，不在组件内部猜测访问权限。

### 2. 个人中心

- 新增 `forum/src/pages/UserCenterPage.tsx`。
- 完整呈现身份摘要、爱好 / QQ / Email / 地点、八项论坛档案。
- 支持发帖、回复、报名、收藏、草稿箱、签名档六项切换。
- 支持关键词、开始日期、结束日期筛选和客户端分页。
- 支持本地资料编辑、邮箱管理、账号安全和头像预览对话框；本地保存仅用于演示交互，不伪装为服务端持久化。

### 3. 个人主页

- 新增 `forum/src/pages/PublicProfilePage.tsx`。
- 支持 `/users/:name` 读取演示用户；不存在用户显示明确的不存在状态。
- 他人主页显示“私信”，本人主页显示“进入个人中心”。
- 访客可见发帖、回复、公开报名；收藏只在本人查看自己的主页时出现。
- 未公开 Email 显示“未公开”，URL 请求无权查看的 `bookmarks` 时回退到 `posts`。

### 4. 路由、导航与样式

- 更新 `forum/src/App.tsx`，优先识别 `/user-center` 与 `/users/:name`，再保留现有 query 页面。
- 更新 `forum/src/components/layout/TopBar.tsx`，将“个人中心”指向 `/user-center`，并增加“个人主页”入口。
- 新增 `forum/src/styles/profile.css` 并在 `forum/src/styles/index.css` 导入。
- 使用现有 CSS token，同时覆盖浅色、深色、桌面、窄桌面与移动断点。

## System-Wide Impact

- **Interaction graph**：仅影响客户端页面分发、头像菜单链接和本地组件状态；不会触发 PHP、数据库或 API 调用。
- **Error propagation**：演示数据查找失败在页面内转为“用户不存在”；筛选参数非法时归一化为安全默认值。
- **State lifecycle**：资料编辑和对话框状态只存在当前页面会话，刷新恢复演示数据；界面会明确标注演示保存状态。
- **API surface parity**：不增加或修改 API；后续接入真实数据时应保持组件 props 契约。
- **Integration scenarios**：个人中心导航、公开主页路径、本人/他人隐私分支、Tab 查询参数和暗色模式共存。

## Acceptance Criteria

- [ ] `/user-center` 渲染个人中心，不影响首页、版面页和帖子页现有分发。
- [ ] `/users/:name` 渲染公开个人主页，不存在用户显示明确状态。
- [ ] 个人中心完整显示四项资料、八项论坛档案和六个内容 Tab。
- [ ] 个人中心支持资料编辑与头像、邮箱、账号安全对话框的本地交互。
- [ ] 两个页面均支持关键词、日期筛选、分页和 URL Tab 状态。
- [ ] 他人主页不显示收藏、草稿、签名档和真实私密 Email。
- [ ] 本人主页显示收藏与“进入个人中心”，不显示给自己发私信。
- [ ] 页面适配桌面、窄桌面和移动端，并兼容现有深色模式。
- [ ] 交互控件有可理解的标签、焦点状态和基础键盘支持。
- [ ] `npm run typecheck` 与 `npm run build` 通过。
- [ ] 通过本地 PHP 服务验证构建产物可加载；视觉验收留给用户。
- [ ] 未修改 `api/` 目录。

## Dependencies & Risks

- 当前没有真实用户中心数据接入；演示保存不会持久化，页面文案必须避免误导。
- 当前没有 React Router；深链接生产回退依赖后续服务器 rewrite，本实现只负责客户端 pathname 分发。
- 个人主页的公开报名与邮箱可见性由演示数据表达；后续真实 API 必须在服务端再次执行隐私过滤。
- `profile.css` 需保持选择器命名隔离，避免影响刚完成拆分的论坛其他页面样式。

## Implementation Tasks

- [ ] 建立演示数据、类型与共享资料组件。
- [ ] 实现个人中心页面和本地管理交互。
- [ ] 实现公开个人主页和隐私分支。
- [ ] 接入 App pathname 分发与 TopBar 入口。
- [ ] 完成独立 profile 样式与响应式规则。
- [ ] 执行类型检查、构建与本地 PHP 验证。
- [ ] 更新计划与 todo 状态并提交全部变更。

## Post-Deploy Monitoring & Validation

No additional operational monitoring required：本次仅新增使用演示数据的本地前端页面，不调用服务端接口，也不改变生产数据。

## Sources & References

- **Origin brainstorm:** `docs/brainstorms/2026-08-20-personal-center-ui-brainstorm.md`
- `forum/src/App.tsx`
- `forum/src/components/layout/TopBar.tsx`
- `forum/src/components/layout/Pagination.tsx`
- `/Users/mac/Code/CAPUBBS-bbs-new-reference/bbs-new/app/src/routes/UserCenterRoute.tsx`
- `/Users/mac/Code/CAPUBBS-bbs-new-reference/bbs-new/app/src/routes/PublicProfileRoute.tsx`

