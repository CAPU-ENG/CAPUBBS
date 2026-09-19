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

## 首次进入时的资源加载

`index.html` 内嵌独立加载界面和样式，`bootstrap/startup.js` 由 `build/startupLoading.ts` 内联到构建后的 HTML；加载界面不依赖 React、外部 CSS、图片或字体。构建时生成公共模块与各路由模块的依赖、文件大小清单，并移除自动插入的外部样式和入口脚本标签，避免它们阻塞加载界面的显示。

首次打开任意新论坛页面时，最多并行下载四个公共或当前页面所需的 JS/CSS 文件，按收到的解压后字节数显示进度。下载完成后从原始 URL 应用样式、启动入口模块，利用带内容哈希文件的 HTTP 缓存复用下载结果；静态资源服务器需继续保留现有长期缓存策略。页面组件首次提交后移除加载界面，站内导航不再显示它；刷新或新开页面仍经过同一入口，缓存命中时无需人为等待。接口数据、用户图片、附件与后续按需资源不计入这个启动进度。

资源请求失败或连续 60 秒没有进展时提供重新加载按钮。开发模式显示不带百分比的加载状态，因为源码模块没有构建后的固定字节清单。增加或修改 `App.tsx` 中的懒加载页面时，同步维护 `build/startupLoading.ts` 的 `pageRoutes`；使用内层 Suspense 的页面需在该边界内保留 `StartupReady`，以免加载界面过早退出。

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

## 正文图廊标签

新旧论坛正文均支持以下声明式 HTML；新论坛富文本编辑器创建图廊后，也会以此格式保存或切换到 HTML 源码：

```html
<gallery title="秋季拉练" height="420">
  <img src="/bbs/images/first.jpg" caption="集合出发" alt="队员在校门口集合">
  <img src="/bbs/images/second.jpg" caption="抵达山顶">
</gallery>
```

`title`、`height`、`caption` 和 `alt` 均可省略；`height` 为正数像素高度，移动端会限制展示高度。图廊宽度跟随正文，图片保持比例完整显示。未填写标题时保留空白标题栏；单张图片隐藏切图箭头，不自动播放。同一正文内多个图廊独立切换，图片可点击放大。

必须使用结束标签 `</gallery>`，内部只写 `img`，允许空白、换行和 `br`。属性包含引号、`&`、`<` 等字符时使用 HTML 实体。嵌套图廊或包含其他正文节点的标签不展开，以保留原内容。空图片地址不会成为图廊项目。历史 `.capubbs-gallery` HTML 继续兼容；新图廊保存时不会附带控件、样式或脚本。

解析与结构生成在 `../bbs/lib/gallery-tag.js` 共用，新论坛通过 `src/utils/galleryTag.ts` 引入；旧论坛普通帖、活动帖通过 `gallery-tag-legacy.js` 初始化。编辑器在简洁标签和现有图廊编辑控件之间转换，不修改 API 或数据库结构。
