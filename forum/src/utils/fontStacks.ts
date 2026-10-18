// Cross-platform stacks for the editor's named fonts. Each stack starts with
// the name authors pick, then swaps to the same face under its other platform
// names (Windows, macOS, Linux), then to the nearest-looking common face, and
// ends with a generic family.
export const forumFontStacks = [
  { label: '黑体', families: ['黑体', 'SimHei', 'Heiti SC', 'STHeiti', 'PingFang SC', 'Noto Sans CJK SC', 'Source Han Sans SC'], generic: 'sans-serif' },
  { label: '微软雅黑', families: ['微软雅黑', 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'Source Han Sans SC'], generic: 'sans-serif' },
  { label: '宋体', families: ['宋体', 'SimSun', 'Songti SC', 'STSong', 'Noto Serif CJK SC', 'Source Han Serif SC'], generic: 'serif' },
  { label: '楷体', families: ['楷体', 'Kaiti', 'STKaiti', 'Kaiti SC', 'AR PL UKai CN'], generic: 'serif' },
  { label: '仿宋', families: ['仿宋', 'FangSong', 'STFangsong', 'FangSong_GB2312', '宋体', 'SimSun', 'Songti SC'], generic: 'serif' },
  { label: '幼圆', families: ['幼圆', 'YouYuan', 'Yuanti SC', '微软雅黑', 'Microsoft YaHei', 'PingFang SC'], generic: 'sans-serif' },
  { label: '隶书', families: ['隶书', 'LiSu', '华文隶书', 'STLiti', 'Baoli SC', '楷体', 'Kaiti', 'STKaiti'], generic: 'serif' },
  { label: '华文新魏', families: ['华文新魏', 'STXinwei', '楷体', 'Kaiti', 'STKaiti', 'Kaiti SC'], generic: 'serif' },
  { label: '华文行楷', families: ['华文行楷', 'STXingkai', 'Xingkai SC', '华文新魏', 'STXinwei', '楷体', 'Kaiti', 'STKaiti'], generic: 'serif' },
  { label: '华文中宋', families: ['华文中宋', 'STZhongsong', '宋体', 'SimSun', 'Songti SC', 'STSong'], generic: 'serif' },
  { label: '华文细黑', families: ['华文细黑', 'STXihei', '微软雅黑', 'Microsoft YaHei', 'PingFang SC'], generic: 'sans-serif' },
  { label: 'Arial', families: ['Arial', 'Helvetica', 'Liberation Sans'], generic: 'sans-serif' },
  { label: 'Helvetica', families: ['Helvetica', 'Helvetica Neue', 'Arial', 'Liberation Sans'], generic: 'sans-serif' },
  { label: 'Verdana', families: ['Verdana', 'Tahoma', 'Geneva', 'DejaVu Sans'], generic: 'sans-serif' },
  { label: 'Times New Roman', families: ['Times New Roman', 'Times', 'Liberation Serif'], generic: 'serif' },
  { label: 'Georgia', families: ['Georgia', 'Times New Roman', 'Times'], generic: 'serif' },
  { label: 'Courier New', families: ['Courier New', 'Courier', 'Liberation Mono'], generic: 'monospace' },
];

export function formatFontStack(families: string[], generic?: string) {
  const names = families.map((family) => (/^[A-Za-z0-9_-]+$/.test(family) ? family : `'${family}'`));
  return generic ? [...names, generic].join(', ') : names.join(', ');
}

// Primary name (lowercased) -> its stack, for widening fonts in stored posts.
export const forumFontStackByName = new Map(
  forumFontStacks.map((stack) => [stack.families[0].toLocaleLowerCase(), stack]),
);
