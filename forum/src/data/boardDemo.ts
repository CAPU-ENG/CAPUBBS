export type BoardThreadData = {
  author: string;
  createdAt: string;
  id: number;
  lastReplyAt: string;
  lastReplyBy: string;
  replies: number;
  status?: {
    digest?: boolean;
    locked?: boolean;
    pinned?: boolean;
  };
  title: string;
  views: number;
};

export type DemoBoardData = {
  id: number;
  moderators: string[];
  name: string;
  perPage: number;
  stats: {
    online: number;
    replies: number;
    today: number;
    topics: number;
  };
};

export const demoBoardIds = [1, 2, 3, 4, 5, 6, 7, 9, 28] as const;
export type DemoBoardId = (typeof demoBoardIds)[number];

export const demoBoards: Record<DemoBoardId, DemoBoardData> = {
  1: {
    id: 1,
    moderators: ['会长团', '网站维护'],
    name: '车协工作区',
    perPage: 8,
    stats: { online: 42, replies: 2864, today: 9, topics: 318 },
  },
  2: {
    id: 2,
    moderators: ['阿北', '小林'],
    name: '行者足音',
    perPage: 8,
    stats: { online: 56, replies: 9832, today: 24, topics: 1324 },
  },
  3: {
    id: 3,
    moderators: ['灵车漂移', '清风拂山岗', '大橘为重'],
    name: '车友宝典',
    perPage: 8,
    stats: { online: 38, replies: 12846, today: 76, topics: 2341 },
  },
  4: {
    id: 4,
    moderators: ['小白', '蓝色车架'],
    name: '纯净水',
    perPage: 8,
    stats: { online: 64, replies: 18562, today: 31, topics: 2110 },
  },
  5: {
    id: 5,
    moderators: ['小林', '阿北'],
    name: '考察与社会',
    perPage: 8,
    stats: { online: 21, replies: 1428, today: 6, topics: 246 },
  },
  6: {
    id: 6,
    moderators: ['蓝色车架', '小白'],
    name: '五湖四海',
    perPage: 8,
    stats: { online: 29, replies: 3084, today: 7, topics: 412 },
  },
  7: {
    id: 7,
    moderators: ['阿北', '网站维护'],
    name: '一技之长',
    perPage: 8,
    stats: { online: 33, replies: 2240, today: 8, topics: 368 },
  },
  9: {
    id: 9,
    moderators: ['小林', '蓝色车架'],
    name: '竞赛竞技',
    perPage: 8,
    stats: { online: 26, replies: 1986, today: 5, topics: 286 },
  },
  28: {
    id: 28,
    moderators: ['网站维护', '会长团'],
    name: '网站维护',
    perPage: 8,
    stats: { online: 18, replies: 916, today: 4, topics: 154 },
  },
};

const boardThreadTitlePools: Record<DemoBoardId, string[]> = {
  1: ['值班表更新', '器材借用记录', '报名数据复核', '社团仓库整理'],
  2: ['周末路线确认', '夜骑集合提醒', '新人骑行回顾', '补给点同步'],
  3: ['通勤装备问答', '轮胎选择记录', '刹车调校心得', '雨天维护建议'],
  4: ['今日骑车碎碎念', '晚霞照片接龙', '临时问答小楼', '校园路况闲聊'],
  5: ['考察路线纪要', '实践报名确认', '资料记录格式', '观察点整理'],
  6: ['外地路线咨询', '长途补给复盘', '城市骑行记录', '目的地问答'],
  7: ['维修技巧记录', '地图工具教程', '摄影机位分享', '训练数据整理'],
  9: ['间歇训练安排', '比赛报名提醒', '赛后复盘记录', '队伍配速讨论'],
  28: ['新版反馈收集', '接口联调记录', '页面空态检查', '迁移问题追踪'],
};

export function isDemoBoardId(boardId: number): boardId is DemoBoardId {
  return (demoBoardIds as readonly number[]).includes(boardId);
}

export function getDemoBoard(boardId: DemoBoardId) {
  return demoBoards[boardId];
}

export const demoBoardThreads: BoardThreadData[] = [
  {
    author: '清风拂山岗',
    createdAt: '2026-08-18 09:28:14',
    id: 102,
    lastReplyAt: '2026-08-20 21:46:32',
    lastReplyBy: '山城小齿轮',
    replies: 48,
    status: { digest: true, pinned: true },
    title: '新生骑行入门：从选车、设定到第一次夜骑',
    views: 1683,
  },
  {
    author: '大橘为重',
    createdAt: '2026-07-30 17:05:26',
    id: 117,
    lastReplyAt: '2026-08-20 20:51:09',
    lastReplyBy: '老王修车摊',
    replies: 92,
    status: { pinned: true },
    title: '车友宝典版规与常用资料索引',
    views: 5238,
  },
  {
    author: '山城小齿轮',
    createdAt: '2026-08-20 14:12:09',
    id: 131,
    lastReplyAt: '2026-08-20 22:13:45',
    lastReplyBy: '桥下看风景',
    replies: 26,
    title: '长途骑行如何分配补给？分享一份两百公里实测清单',
    views: 936,
  },
  {
    author: '桥下看风景',
    createdAt: '2026-08-20 11:37:52',
    id: 132,
    lastReplyAt: '2026-08-20 21:34:18',
    lastReplyBy: '北门修补匠',
    replies: 17,
    status: { digest: true },
    title: '雨天通勤之后，传动系统应该怎么清洁和保养？',
    views: 742,
  },
  {
    author: '北门修补匠',
    createdAt: '2026-08-19 19:08:31',
    id: 133,
    lastReplyAt: '2026-08-20 19:42:03',
    lastReplyBy: '风从东门来',
    replies: 31,
    title: '预算三千，二手公路车选购时最容易忽略哪些问题',
    views: 1104,
  },
  {
    author: '风从东门来',
    createdAt: '2026-08-19 15:22:17',
    id: 134,
    lastReplyAt: '2026-08-20 18:29:56',
    lastReplyBy: '夏夜慢骑',
    replies: 12,
    status: { digest: true },
    title: '把位高度与手麻：一次从错误设定到舒适骑姿的调整记录',
    views: 689,
  },
  {
    author: '夏夜慢骑',
    createdAt: '2026-08-19 10:42:08',
    id: 135,
    lastReplyAt: '2026-08-20 16:08:27',
    lastReplyBy: '二号线末班车',
    replies: 8,
    title: '夜骑灯光怎么配才不会晃到对向行人？',
    views: 421,
  },
  {
    author: '二号线末班车',
    createdAt: '2026-08-18 22:31:49',
    id: 136,
    lastReplyAt: '2026-08-20 13:47:11',
    lastReplyBy: '灵车漂移',
    replies: 44,
    title: '折叠车带上地铁的尺寸与收纳经验汇总',
    views: 1872,
  },
  {
    author: '灵车漂移',
    createdAt: '2026-08-18 16:20:33',
    id: 137,
    lastReplyAt: '2026-08-20 10:11:38',
    lastReplyBy: '南湖一圈',
    replies: 19,
    status: { digest: true },
    title: '不同胎压下的滚阻与舒适度：一周通勤对比',
    views: 958,
  },
  {
    author: '南湖一圈',
    createdAt: '2026-08-17 20:03:14',
    id: 138,
    lastReplyAt: '2026-08-19 23:55:06',
    lastReplyBy: '城北爬坡王',
    replies: 23,
    title: '新手第一次补胎，需要随车携带哪些工具？',
    views: 803,
  },
  {
    author: '城北爬坡王',
    createdAt: '2026-08-17 12:46:02',
    id: 139,
    lastReplyAt: '2026-08-19 21:09:43',
    lastReplyBy: '大橘为重',
    replies: 36,
    status: { locked: true },
    title: '本周末环湖拉练报名与注意事项',
    views: 1430,
  },
  {
    author: '老王修车摊',
    createdAt: '2026-08-16 08:51:28',
    id: 140,
    lastReplyAt: '2026-08-19 18:33:20',
    lastReplyBy: '清风拂山岗',
    replies: 15,
    status: { digest: true },
    title: '机械碟刹异响的排查顺序与常见误区',
    views: 775,
  },
];

export function getDemoBoardThreads(boardId: DemoBoardId) {
  if (boardId === 3) return demoBoardThreads;

  const board = getDemoBoard(boardId);
  const titlePool = boardThreadTitlePools[boardId];
  if (!board || !titlePool) return [];

  return demoBoardThreads.map((thread, index) => {
    const title = index === 0
      ? `${board.name}版规与常用资料索引`
      : `${titlePool[(index - 1) % titlePool.length]} ${String(index).padStart(3, '0')}`;

    return {
      ...thread,
      id: boardId * 1000 + index + 1,
      title,
    };
  });
}
