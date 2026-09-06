export function normalizeNetEasePlayerUrl(value: string, base: string): string | null {
  try {
    const url = new URL(value, base);
    if (!['http:', 'https:'].includes(url.protocol) || url.hostname !== 'music.163.com'
      || url.pathname !== '/outchain/player' || url.username || url.password || url.port) return null;
    url.protocol = 'https:';
    return url.href;
  } catch {
    return null;
  }
}

export type NetEasePlayerLayout = {
  id: string;
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export function isNetEasePlayerLayout(value: unknown): value is NetEasePlayerLayout {
  if (!value || typeof value !== 'object') return false;
  const player = value as NetEasePlayerLayout;
  return typeof player.id === 'string' && typeof player.src === 'string'
    && normalizeNetEasePlayerUrl(player.src, 'https://music.163.com') === player.src
    && ['left', 'top', 'width', 'height'].every((key) => {
      const number = player[key as 'left' | 'top' | 'width' | 'height'];
      return typeof number === 'number' && Number.isFinite(number) && Math.abs(number) <= 100_000;
    }) && player.width > 0 && player.height > 0;
}
