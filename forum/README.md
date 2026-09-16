# CAPUBBS Forum

Frontend built with React, TypeScript, Tailwind CSS, and Vite.

The homepage loads its latest-reply feed, author avatars, and global pinned threads from `/api/api.php`. Calendar events load from `/assets/api/getCalendar.php`; activity registration remains a local placeholder until a matching list API is available.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run typecheck
```

Vite proxies `/api`, `/assets`, `/bbs`, `/bbsimg`, and `/config` to that server; `/bbs/...` page requests carrying `capubbs_forum_mode=legacy` are sent to the legacy PHP forum, while `new` mode stays in the React app. When the mode Cookie is absent, all visitors default to the new forum regardless of their login `token` or device. An explicitly saved mode remains effective on all devices. Avatar and post image paths are always normalized to the local `/bbsimg` and `/bbs/images` directories. Set `CAPUBBS_PHP_ORIGIN` to use a different PHP origin, `VITE_API_URL` to override the browser forum API endpoint, or `VITE_CALENDAR_API_URL` to override the calendar endpoint. Change `CAPUBBS_BROWSER_DOWNLOAD_URL` in the repository root `config.php` to update the browser recommendation download link.

## 标题缩进

左对齐的标题统一使用“标题缩进”模组：[`src/utils/titleIndentation.ts`](src/utils/titleIndentation.ts) 负责判断首字符，[`src/styles/title-indentation.css`](src/styles/title-indentation.css) 负责偏移。以 `《`、`【`、`（`、`“` 开头时，仅第一行向左悬挂半个字宽，换行后的文字保持正常左对齐，偏移随标题字号变化；其他标题不添加缩进类，也不修改标题内容或空白。

默认调用 `getTitleIndentationClassName(title, baseClassName?)`，使用 `text-indent: -0.5em` 控制首行，并以相反的左外边距和左内边距为标点留出空间，避免被单行省略样式裁切。行内标题使用第三个参数 `'inline'`，仅通过行内元素首个片段的左外边距悬挂标点；首页紧凑列表和移动端版面列表使用此方式，版面列表桌面端保持单行显示。

同一标题只调用一次；带关键词高亮的标题传入原始字符串判断。标题元素的页面样式不要覆盖模组的左外边距、左内边距和首行缩进；重置上下外边距可使用 `margin-block`。详情页的复制标题按钮显式继承标题的 `text-indent`，使按钮内换行同样保持对齐。

当前共 18 处调用，集中在以下位置：

| 位置 | 组件 / 页面 | 覆盖范围 |
| --- | --- | --- |
| 首页帖子列表 | `FeedSection` | 普通、紧凑模式 |
| 首页全局置顶 | `HomeAside`、`MobileActivityBar` | 桌面、移动端展开列表 |
| 首页活动 | `HomeAside` | 报名卡片、日历活动标题；桌面与移动端共用 |
| 版面帖子列表 | `BoardPage` | 帖子标题链接 |
| 个人中心、公开主页 | `ProfileWorkspace` | 发帖、回复、报名、收藏、草稿记录 |
| 帖子详情 | `ThreadPage` | 标题卡片，保留标题按钮的复制链接功能 |
| 搜索结果 | `SearchPage` | 帖子标题，兼容关键词高亮 |
| 编辑、预览 | `ThreadEditPage`、`PostEditor` | 编辑页标题、内容预览弹窗标题 |
| 桌面顶栏 | `TopBar` | 滚动后显示的左对齐上下文标题 |
| 论坛管理 | `ManagementPage` | 全局置顶列表、帖子信息确认卡片 |
| 日历管理 | `CalendarAdminPage` | 活动列表标题 |
| 档案室 | `ArchiveRoomPage` | 列表、网格中的帖子条目名称 |

移动端顶栏采用居中标题，不应用左对齐补偿。标题输入框、签名档名称、档案室文件与文件夹名称，以及带“编辑：”“Re:”等前缀的文字，不额外调整内部标点。
