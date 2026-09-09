export function normalizeNetEasePlayerUrl(value: string, base: string): string | null {
  try {
    const url = new URL(value, base);
    if (!['http:', 'https:'].includes(url.protocol) || url.hostname !== 'music.163.com'
      || !['/outchain/player', '/m/outchain/player'].includes(url.pathname)
      || url.username || url.password || url.port) return null;
    url.protocol = 'https:';
    return url.href;
  } catch {
    return null;
  }
}

export function getNetEasePlayerSource(src: string, userAgent: string): string {
  const url = new URL(src);
  // NetEase redirects a mismatched device path through HTTP, which HTTPS embeds block.
  url.pathname = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent)
    ? '/m/outchain/player'
    : '/outchain/player';
  return url.href;
}
