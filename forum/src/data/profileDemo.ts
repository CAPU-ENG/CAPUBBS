import defaultAvatar from '../assets/bg/bicycle.svg';
import type { FloorDecorationPaths } from './floorDecoration';
import type { UserMedal } from './medals';
import type { UserTag } from './tags';

export type ProfileTab = 'posts' | 'replies' | 'activities' | 'bookmarks' | 'drafts' | 'signatures';

export type ProfileDetailKey = 'hobby' | 'qq' | 'email' | 'location';

export type ProfileDetail = {
  key: ProfileDetailKey;
  label: string;
  value: string;
};

export type ProfileStat = {
  label: string;
  value: string | number;
};

export type ProfileRecord = {
  author?: string;
  board: string;
  contentMode?: 'html' | 'markdown' | 'rich';
  date: string;
  draftHref?: string;
  excerpt: string;
  href: string;
  id: string;
  metrics?: Array<{ label: string; value: number }>;
  status?: string;
  title: string;
};

export type ProfileRecordMap = Record<ProfileTab, ProfileRecord[]>;

export type ProfileViewData = {
  avatarSrc: string;
  counts: Partial<Record<ProfileTab, number>>;
  details: ProfileDetail[];
  emailVerified: boolean;
  emailVisible: boolean;
  floorDecoration?: FloorDecorationPaths;
  id: string;
  intro: string;
  medals?: UserMedal[];
  rating: number;
  starPostReplyCount: number;
  records: ProfileRecordMap;
  slug: string;
  stats: ProfileStat[];
  tags?: UserTag[];
};

export const profileTabs: Array<{ key: ProfileTab; label: string }> = [
  { key: 'posts', label: '发帖' },
  { key: 'replies', label: '回复' },
  { key: 'activities', label: '报名' },
  { key: 'bookmarks', label: '收藏' },
  { key: 'drafts', label: '草稿箱' },
  { key: 'signatures', label: '签名档' },
];

const currentRecords: ProfileRecordMap = {
  posts: [
    createPost('current-post-1', '端午活动报名说明', '行者足音', '端午活动的集合点、路线、补给和报名注意事项整理。', '2026-08-20', 18, 126, 7),
    createPost('current-post-2', '雨天骑行挡泥板应该怎么选？', '车友宝典', '从覆盖范围、安装方式和日常维护聊聊几种挡泥板的实际体验。', '2026-08-18', 9, 84, 2),
    createPost('current-post-3', '夜骑灯光角度记录', '一技之长', '不同角度下的照明范围、对向眩光和路面识别情况。', '2026-08-12', 12, 203, 5),
    createPost('current-post-4', '北线晨骑补给点复核', '行者足音', '把沿途便利店、饮水点和临时维修点重新走了一遍。', '2026-08-05', 6, 91, 3),
    createPost('current-post-5', '长途骑行前的车辆检查表', '车友宝典', '从轮胎、刹车到传动系统，整理一份出发前十分钟检查表。', '2026-07-26', 22, 318, 16),
    createPost('current-post-6', '校园周边骑行路线记录方法', '资料整理', '用统一格式记录路况、补给点、危险路口和适合人群。', '2026-07-11', 15, 246, 11),
  ],
  replies: [
    createReply('current-reply-1', '周末路线临时调整', '行者足音', '备用路线可以走南门，那边车流少一些。', '2026-08-20'),
    createReply('current-reply-2', '新手头盔尺码讨论', '车友宝典', '头围卡在两个尺码之间的话，建议先试戴再决定。', '2026-08-19'),
    createReply('current-reply-3', '雨后链条保养', '一技之长', '擦干以后再补油，别把泥水直接封在链节里。', '2026-08-13'),
    createReply('current-reply-4', '论坛搜索体验反馈', '网站维护', '关键词命中摘要时最好能保留上下文片段。', '2026-07-29'),
  ],
  activities: [
    createActivity('current-activity-1', '端午环湖骑行', '行者足音', '2026-08-20', '已报名'),
    createActivity('current-activity-2', '新生装备体验日', '车友宝典', '2026-08-16', '候补中'),
    createActivity('current-activity-3', '八月维修小课堂', '一技之长', '2026-08-09', '已取消'),
  ],
  bookmarks: [
    createBookmark('current-bookmark-1', '新人入门路线建议集中帖', '车友宝典', '小林', '通勤、短途、夜骑路线整理。', '2026-08-20'),
    createBookmark('current-bookmark-2', '机械碟刹异响排查顺序', '一技之长', '老王修车摊', '从来令片、碟片到夹器位置逐步排查。', '2026-08-18'),
    createBookmark('current-bookmark-3', '折叠车带上地铁的收纳经验', '车友宝典', '二号线末班车', '不同时段与车型的折叠、装袋和乘车经验。', '2026-08-11'),
    createBookmark('current-bookmark-4', '夏季长途补水和电解质计划', '行者足音', '城北爬坡王', '按温度、强度和里程安排补水量。', '2026-07-31'),
  ],
  drafts: [
    createDraft('current-draft-1', '秋季骑行路线征集', '行者足音', '发帖草稿', '准备向大家征集适合新人的秋季路线。', '2026-08-20'),
    createDraft('current-draft-2', '回复：通勤胎压设置', '车友宝典', '回帖草稿', '我的体重和外胎宽度接近，可以从这个区间开始试。', '2026-08-18'),
    createDraft('current-draft-3', '仓库工具借用规则', '车协工作区', '发帖草稿', '工具借出与归还都需要记录日期和负责人。', '2026-08-10'),
  ],
  signatures: [
    createSignature('current-signature-1', '签名档 1', '在路上认真看风景，也认真把每一次骑行安全带回家。'),
    createSignature('current-signature-2', '签名档 2', '路线记录比记忆可靠。'),
    createSignature('current-signature-3', '签名档 3', '队伍里最重要的速度，是所有人都能跟上的速度。'),
  ],
};

export const currentProfile: ProfileViewData = {
  avatarSrc: defaultAvatar,
  counts: {
    activities: 16,
    bookmarks: 27,
    drafts: 3,
    posts: 36,
    replies: 128,
    signatures: 3,
  },
  details: [
    { key: 'hobby', label: '爱好', value: '长途骑行、路线记录、装备整理' },
    { key: 'qq', label: 'QQ', value: '1008610010' },
    { key: 'email', label: 'Email', value: 'blueframe@example.com' },
    { key: 'location', label: '地点', value: '北京' },
  ],
  emailVerified: true,
  emailVisible: false,
  id: '蓝色车架',
  intro: '总有一天要把学校周边的路线都骑一遍。',
  rating: 3,
  starPostReplyCount: 164,
  records: currentRecords,
  slug: 'blue-frame',
  stats: [
    { label: '发帖数', value: 36 },
    { label: '签到数', value: 42 },
    { label: '上次在线', value: '08.20 22:18' },
    { label: '权限值', value: 1 },
    { label: '回复数', value: 128 },
    { label: '灌水数', value: 19 },
    { label: '注册时间', value: '2015.09.17' },
    { label: '精品数', value: 3 },
  ],
};

const xiaolinRecords: ProfileRecordMap = {
  posts: [
    createPost('xiaolin-post-1', '新人入门路线建议集中帖', '车友宝典', '把通勤、短途、夜骑路线整理到一起，方便新人按强度选择。', '2026-08-20', 12, 246, 18),
    createPost('xiaolin-post-2', '毕业季骑行照片征集', '新闻发布', '可以按路线和年份整理，后面做活动回顾会方便一点。', '2026-08-15', 6, 120, 5),
    createPost('xiaolin-post-3', '从东门出发的三条通勤路线', '行者足音', '分别适合赶时间、避开车流和顺路拍照。', '2026-08-03', 15, 302, 21),
    createPost('xiaolin-post-4', '新手第一次夜骑需要准备什么', '车友宝典', '灯光、反光装备、路线选择和编队手势的基础清单。', '2026-07-22', 23, 418, 32),
  ],
  replies: [
    createReply('xiaolin-reply-1', '端午活动报名说明', '行者足音', '八点前还好，晚一点就需要补灯。', '2026-08-20'),
    createReply('xiaolin-reply-2', '雨后链条保养', '一技之长', '擦干以后再补油，别把泥水直接封在链节里。', '2026-08-17'),
    createReply('xiaolin-reply-3', '校园通勤车怎么选', '车友宝典', '先确认每天是否需要搬楼，再决定重量优先级。', '2026-08-04'),
  ],
  activities: [
    createActivity('xiaolin-activity-1', '新生装备体验日', '车友宝典', '2026-08-18', '候补中'),
  ],
  bookmarks: [
    createBookmark('xiaolin-bookmark-1', '端午活动报名说明', '行者足音', '蓝色车架', '集合点、路线、补给和报名注意事项整理。', '2026-08-20'),
    createBookmark('xiaolin-bookmark-2', '雨天骑行挡泥板应该怎么选？', '车友宝典', '蓝色车架', '几种挡泥板的安装方式和雨天体验。', '2026-08-18'),
  ],
  drafts: [],
  signatures: [],
};

const xiaolinProfile: ProfileViewData = {
  avatarSrc: defaultAvatar,
  counts: { activities: 1, bookmarks: 2, posts: 58, replies: 211 },
  details: [
    { key: 'hobby', label: '爱好', value: '新人路线、通勤优化、摄影' },
    { key: 'qq', label: 'QQ', value: '1024102410' },
    { key: 'email', label: 'Email', value: 'xiaolin@example.com' },
    { key: 'location', label: '地点', value: '北京' },
  ],
  emailVerified: true,
  emailVisible: false,
  id: '小林',
  intro: '喜欢把复杂路线整理成新人也能放心出发的说明。',
  rating: 3,
  starPostReplyCount: 269,
  records: xiaolinRecords,
  slug: 'xiaolin',
  stats: [
    { label: '上次在线', value: '08.20 21:12' },
    { label: '权限值', value: 1 },
    { label: '发帖', value: 58 },
    { label: '回复', value: 211 },
    { label: '注册', value: '2024.09.06' },
    { label: '精品', value: 7 },
    { label: '签到', value: 87 },
    { label: '灌水', value: 26 },
  ],
};

export const publicProfiles = [currentProfile, xiaolinProfile];

export function findPublicProfile(identifier: string | null) {
  const normalized = identifier?.trim().toLocaleLowerCase();
  if (!normalized) return null;
  return publicProfiles.find((profile) =>
    profile.slug.toLocaleLowerCase() === normalized || profile.id.toLocaleLowerCase() === normalized,
  ) ?? null;
}

function createPost(
  id: string,
  title: string,
  board: string,
  excerpt: string,
  date: string,
  replies: number,
  views: number,
  bookmarks: number,
): ProfileRecord {
  return {
    board,
    date,
    excerpt,
    href: '/?thread=102',
    id,
    metrics: [
      { label: '回复', value: replies },
      { label: '浏览', value: views },
      { label: '收藏', value: bookmarks },
    ],
    title,
  };
}

function createReply(id: string, title: string, board: string, excerpt: string, date: string): ProfileRecord {
  return { board, date, excerpt, href: '/?thread=102', id, status: '直达回复', title };
}

function createActivity(id: string, title: string, board: string, date: string, status: string): ProfileRecord {
  return { board, date, excerpt: '查看活动时间、集合地点与报名说明。', href: '/?thread=102', id, status, title };
}

function createBookmark(
  id: string,
  title: string,
  board: string,
  author: string,
  excerpt: string,
  date: string,
): ProfileRecord {
  return { author, board, date, excerpt, href: '/?thread=102', id, status: '已收藏', title };
}

function createDraft(
  id: string,
  title: string,
  board: string,
  status: string,
  excerpt: string,
  date: string,
): ProfileRecord {
  return { board, date, excerpt, href: '#continue-draft', id, status, title };
}

function createSignature(id: string, title: string, excerpt: string): ProfileRecord {
  return { board: '签名档', date: '2026-08-20', excerpt, href: '#signature-editor', id, status: 'HTML', title };
}
