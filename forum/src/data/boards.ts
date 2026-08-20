export type ForumBoard = {
  id: number;
  label: string;
};

export const PRIMARY_BOARDS: ForumBoard[] = [
  { id: 1, label: '车协工作区' },
  { id: 2, label: '行者足音' },
  { id: 3, label: '车友宝典' },
  { id: 4, label: '纯净水' },
  { id: 5, label: '考察与社会' },
  { id: 6, label: '五湖四海' },
  { id: 7, label: '一技之长' },
  { id: 9, label: '竞赛竞技' },
  { id: 28, label: '网站维护' },
];

// 参考 bbs-new 静态版面目录；主要版面之后的项目统一放在第二层。
export const SECONDARY_BOARDS: ForumBoard[] = [
  { id: 8, label: '历史笔记' },
  { id: 10, label: '资料整理' },
  { id: 11, label: '回收' },
  { id: 12, label: '公告栏' },
  { id: 13, label: '新闻发布' },
  { id: 16, label: '剧组工作' },
  { id: 20, label: '游记' },
  { id: 30, label: '测试' },
  { id: 31, label: '精品集合' },
];

export const ALL_BOARDS = [...PRIMARY_BOARDS, ...SECONDARY_BOARDS];

export function getBoardById(id: number) {
  return ALL_BOARDS.find((board) => board.id === id);
}
