import defaultAvatar from '../assets/avatar/default-avatar.avif';
import type { SafeForumHtml } from '../utils/forumMarkup';

export type ThreadAuthor = {
  name: string;
  role: string;
  stars: number;
  topics: number;
  replies: number;
  checkins: number;
  lastSeen: string;
  avatar: string;
};

export type NestedReply = {
  id: string;
  author: ThreadAuthor;
  canDelete?: boolean;
  publishedAt: string;
  content: string;
  contentHtml?: SafeForumHtml;
  target?: string;
};

export type ThreadFloorData = {
  id: string;
  fid: number;
  floor: number;
  author: ThreadAuthor;
  publishedAt: string;
  editedAt?: string;
  paragraphs: string[];
  signature?: string;
  contentHtml?: SafeForumHtml;
  quoteText?: string;
  signatureHtml?: SafeForumHtml;
  nestedReplies?: NestedReply[];
  isOwn?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

const authors = {
  aBei: {
    name: '阿北',
    role: '正式会员',
    stars: 4,
    topics: 24,
    replies: 128,
    checkins: 36,
    lastSeen: '今天 14:08',
    avatar: defaultAvatar,
  },
  blueFrame: {
    name: '蓝色车架',
    role: '车协成员',
    stars: 6,
    topics: 41,
    replies: 236,
    checkins: 89,
    lastSeen: '今天 15:21',
    avatar: defaultAvatar,
  },
  poplar: {
    name: '小白杨',
    role: '活跃会员',
    stars: 3,
    topics: 12,
    replies: 76,
    checkins: 22,
    lastSeen: '今天 13:42',
    avatar: defaultAvatar,
  },
  repair: {
    name: '南门修车铺',
    role: '技术组',
    stars: 7,
    topics: 56,
    replies: 305,
    checkins: 118,
    lastSeen: '昨天 22:17',
    avatar: defaultAvatar,
  },
  whale: {
    name: '灰鲸',
    role: '普通会员',
    stars: 2,
    topics: 8,
    replies: 54,
    checkins: 17,
    lastSeen: '今天 09:03',
    avatar: defaultAvatar,
  },
} satisfies Record<string, ThreadAuthor>;

export const demoThread = {
  id: 102,
  board: '车友宝典',
  boardHref: '/bbs/index.php?bid=3',
  title: '雨天骑行挡泥板应该怎么选？聊聊几种常见方案',
  views: 84,
  perPage: 4,
  authorName: authors.aBei.name,
  floors: [
    {
      id: 'floor-1',
      fid: 1,
      floor: 1,
      author: authors.aBei,
      publishedAt: '2026年08月20日 10时12分35秒',
      editedAt: '2026年08月20日 10时18分02秒',
      paragraphs: [
        '最近连续下了几场雨，通勤时重新试了三种常见的挡泥板：短款快拆、全包围长款和座管安装款。它们的差别不只在重量，更重要的是覆盖范围、安装稳定性和清洁成本。',
        '短挡泥板确实最轻便，临时装卸也快，但后轮甩水会直接影响跟骑的人。全包围款保护最好，更适合固定通勤车；如果车辆经常搬运或需要拆轮，安装和维护会麻烦一些。',
        '我把这段时间的实际体验整理在这里，也想听听大家在编队骑行、长途和校园通勤中的选择。',
      ],
      signature: '人在路上，车在风里。',
      nestedReplies: [
        {
          id: 'nested-1-1',
          author: authors.poplar,
          publishedAt: '2026年08月20日 10时26分18秒',
          content: '全包围款遇到泥沙路面会不会更容易卡异物？',
        },
      ],
    },
    {
      id: 'floor-2',
      fid: 2,
      floor: 2,
      author: authors.blueFrame,
      publishedAt: '2026年08月20日 12时06分11秒',
      paragraphs: [
        '我更建议优先考虑挡水覆盖范围。单人骑行时，短款能解决大部分后背甩水；但编队里最需要照顾的是后方车友，挡泥板尾端最好能低于轮轴连线。',
        '快拆款在颠簸路面是否松动，主要看座管夹具和支撑臂刚性。装好后先用手左右摆动检查，再短距离试骑一次，比只看产品标称更可靠。',
      ],
      signature: '行则将至，骑则必达。',
      nestedReplies: [
        {
          id: 'nested-2-1',
          author: authors.poplar,
          publishedAt: '2026年08月20日 13时02分08秒',
          content: '请问快拆款在颠簸路面会不会松动？',
        },
        {
          id: 'nested-2-2',
          author: authors.blueFrame,
          publishedAt: '2026年08月20日 13时14分52秒',
          content: '夹具拧紧并加一层防滑垫后会稳定很多，第一次骑完记得复紧。',
        },
      ],
      isOwn: true,
    },
    {
      id: 'floor-3',
      fid: 3,
      floor: 3,
      author: authors.repair,
      publishedAt: '2026年08月20日 13时38分44秒',
      paragraphs: [
        '安装前先确认车架是否预留挡泥板孔位。没有孔位时尽量选择双支撑结构，单点固定在湿滑路面容易发生偏转，蹭到外胎后会持续异响。',
      ],
      signature: '南门活动室，每周二、四晚开放。',
    },
    {
      id: 'floor-4',
      fid: 4,
      floor: 4,
      author: authors.whale,
      publishedAt: '2026年08月20日 14时11分09秒',
      paragraphs: [
        '折叠车可以考虑软尾延长片，收车时不必拆下。缺点是大风里会摆动，最好选稍厚一点的材质。',
      ],
    },
    {
      id: 'floor-5',
      fid: 5,
      floor: 5,
      author: authors.poplar,
      publishedAt: '2026年08月20日 14时42分33秒',
      editedAt: '2026年08月20日 14时45分10秒',
      paragraphs: [
        '补充一个新手容易忽略的问题：买之前量一下轮胎实际宽度，不要只按车型搜索。我的 35C 外胎装窄版挡泥板时两侧还是会甩水。',
      ],
      signature: '慢一点，也是在前进。',
    },
    {
      id: 'floor-6',
      fid: 6,
      floor: 6,
      author: authors.aBei,
      publishedAt: '2026年08月20日 15时03分27秒',
      paragraphs: [
        '这个提醒很重要。挡泥板内宽最好比外胎实际宽度多留一些余量，也要考虑轮胎带起的小石子是否有足够空间排出。',
      ],
      signature: '人在路上，车在风里。',
    },
    {
      id: 'floor-7',
      fid: 7,
      floor: 7,
      author: authors.blueFrame,
      publishedAt: '2026年08月20日 15时26分41秒',
      paragraphs: [
        '如果只是偶尔下雨才骑，我会选快拆款；如果每天通勤，直接上全包围更省心。需求频率比重量差异更值得优先考虑。',
      ],
      isOwn: true,
    },
    {
      id: 'floor-8',
      fid: 8,
      floor: 8,
      author: authors.repair,
      publishedAt: '2026年08月20日 16时09分18秒',
      paragraphs: [
        '安装后检查轮胎与挡泥板之间至少有均匀间隙，尤其是前叉冠和后下叉位置。间隙忽大忽小通常说明支撑杆还没调正。',
      ],
      signature: '南门活动室，每周二、四晚开放。',
    },
    {
      id: 'floor-9',
      fid: 9,
      floor: 9,
      author: authors.whale,
      publishedAt: '2026年08月20日 17时22分06秒',
      paragraphs: [
        '看完准备把通勤车那副短挡泥板换掉了。编队时确实不能只考虑自己不湿背。',
      ],
    },
    {
      id: 'floor-10',
      fid: 10,
      floor: 10,
      author: authors.aBei,
      publishedAt: '2026年08月20日 18时04分39秒',
      paragraphs: [
        '感谢大家补充。我会把轮胎宽度、安装孔位和编队使用这三点整理进主楼，之后也欢迎继续分享长期使用情况。',
      ],
      signature: '人在路上，车在风里。',
    },
  ] satisfies ThreadFloorData[],
};
