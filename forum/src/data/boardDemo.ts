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

export const demoBoard = {
  id: 3,
  moderators: ['灵车漂移', '清风拂山岗', '大橘为重'],
  name: '车友宝典',
  perPage: 8,
  stats: {
    online: 38,
    replies: 12846,
    today: 76,
    topics: 2341,
  },
};

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
