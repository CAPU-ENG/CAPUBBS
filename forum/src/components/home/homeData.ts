export const activities = [
  { date: '2026-08-23', title: '周末轻骑', time: '08:30', place: '东门集合' },
  { date: '2026-08-27', title: '夜骑安全训练', time: '19:00', place: '活动室门口' },
  { date: '2026-09-05', title: '新生骑行说明会', time: '14:00', place: '二教 205' },
];

export type SignupActivity = {
  date: string;
  deadline: string;
  signupCount: number;
  title: string;
};

export const signupActivities: SignupActivity[] = [];
