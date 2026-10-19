export interface YahouChangelogEntry {
  date: string;
  items: string[];
}

export const YAHOU_CHANGELOG: YahouChangelogEntry[] = [
  { date: '2026-10-02', items: ['加载失败时可直接重试，网络离线时显示提示'] },
  { date: '2026-09-21', items: ['师门分支默认收起，打开页面更清爽'] },
  { date: '2026-09-19', items: [
    '新增谱系总览：可缩放拖动的师徒关系网络，随论坛主题切换配色',
    '总览支持输入多个 ID 对比，累计高亮各自的师承路径，连线沿师徒方向流动',
    '谱系总览仅在桌面端提供',
  ] },
  { date: '2026-09-19', items: [
    '押后谱系上线：按师门查看师父、押后、学徒的师承关系',
    '支持搜索 ID、聚焦单个师门，并可跳转到个人主页',
    '有权限的管理员可更新状态、添加徒弟',
  ] },
];
