---
status: complete
priority: p1
issue_id: "001"
tags: [forum, react, ui, profile]
dependencies: []
---

# 实现个人中心与个人主页

## Problem Statement

当前 `forum/` 新版界面只有首页、版面页和帖子页；Navbar 的个人中心仍跳转旧版 PHP 页面，也没有新版公开个人主页。已确认的个人资料与内容工作台设计需要转化为可交互的 React 页面。

## Findings

- 当前应用使用轻量 `window.location` 分发，无 React Router。
- Navbar、背景、分页、主题 token 和响应式模式可复用。
- `BBS new` 已有完整资料层级和页面语义，可作为只读实现参考。
- 本次没有修改 API 的授权，首版必须使用演示数据。
- 前端没有测试运行器，类型检查、构建和本地 PHP 服务检查是现有可用验证手段。

## Proposed Solutions

### Option 1: 在当前架构中模块化移植

**Approach:** 新增共享 profile 组件、两个页面、演示数据和独立样式文件，继续使用现有 pathname 分发。

**Pros:** 不引入依赖；与当前项目结构一致；后续可替换数据层。

**Cons:** 路由和本地状态需要自行管理。

**Effort:** 中等

**Risk:** 低

### Option 2: 直接复制 BBS new 页面

**Approach:** 连同 React Router、数据 Context 和旧样式整体迁入。

**Pros:** 功能覆盖最完整。

**Cons:** 与当前精简架构冲突；会引入大量未授权 API 边界和技术债。

**Effort:** 高

**Risk:** 高

## Recommended Action

采用 Option 1。按 `docs/plans/2026-08-20-001-feat-personal-profile-pages-plan.md` 实施，保持 API 零修改，并将数据访问边界留作后续任务。

## Technical Details

**Affected files:**

- `forum/src/App.tsx`
- `forum/src/components/layout/TopBar.tsx`
- `forum/src/components/profile/*`
- `forum/src/pages/UserCenterPage.tsx`
- `forum/src/pages/PublicProfilePage.tsx`
- `forum/src/data/profileDemo.ts`
- `forum/src/styles/profile.css`
- `forum/src/styles/index.css`

**Database changes:** 无。

## Resources

- `docs/brainstorms/2026-08-20-personal-center-ui-brainstorm.md`
- `docs/plans/2026-08-20-001-feat-personal-profile-pages-plan.md`
- `/Users/mac/Code/CAPUBBS-bbs-new-reference/bbs-new/app/src/routes/UserCenterRoute.tsx`
- `/Users/mac/Code/CAPUBBS-bbs-new-reference/bbs-new/app/src/routes/PublicProfileRoute.tsx`

## Acceptance Criteria

- [x] 个人中心与个人主页均可通过设计路由进入。
- [x] 资料、档案、Tab、筛选、分页和隐私分支均按设计实现。
- [x] 本地编辑与对话框交互可用且不误导为真实持久化。
- [x] 响应式与深色模式规则完整。
- [x] 类型检查、构建和本地 PHP 验证通过。
- [x] 未修改 API。
- [x] Git 提交准确且最终状态干净。

## Work Log

### 2026-08-20 - 计划与本地研究

**By:** Codex

**Actions:**

- 读取个人中心与个人主页 brainstorm。
- 核对当前 React、路由、Navbar、样式拆分与分页模式。
- 核对 `BBS new` 个人中心与公开主页参考实现。
- 选择在当前轻量架构中模块化移植，不引入新依赖或 API 修改。

**Learnings:**

- 当前代码库足以支持纯前端演示实现。
- 个人主页权限必须由页面显式 props/数据控制，不能依赖空数组模拟隐私。

### 2026-08-20 - 实现与验证完成

**By:** Codex

**Actions:**

- 新增共享资料概览、内容工作区、筛选分页与对话框组件。
- 新增个人中心和公开个人主页，并接入 pathname、Tab 查询参数与 Navbar 入口。
- 新增独立 `profile.css`，覆盖浅色、深色、桌面、窄桌面和移动端。
- 执行 `npm run typecheck` 与 `npm run build`，均通过。
- 使用 PHP 8.5.9 本地服务检查构建首页、JS 和 CSS，均返回 HTTP 200。
- 遵循仓库规定未执行截图或视觉验收，未修改 `api/`。

**Learnings:**

- 当前无路由库的 pathname 分发足以承载演示页；生产深链接仍需要服务器 rewrite。
- 共享组件通过显式 `readOnly`、`allowedTabs` 和 `isOwnPublicProfile` 保持隐私分支清晰。
