import { getNetEasePlayerSource } from './netEasePlayer.ts';

export function normalizeEmbeddedPlayerUrl(value: string, base: string): string | null {
  try {
    const url = new URL(value, base);
    const supported = (url.hostname === 'player.bilibili.com' && url.pathname === '/player.html')
      || (url.hostname === 'music.163.com' && ['/outchain/player', '/m/outchain/player'].includes(url.pathname));
    if (!supported || !['http:', 'https:'].includes(url.protocol)
      || url.username || url.password || url.port) return null;
    url.protocol = 'https:';
    return url.href;
  } catch {
    return null;
  }
}

export function getEmbeddedPlayerSource(src: string, userAgent: string): string {
  return new URL(src).hostname === 'music.163.com' ? getNetEasePlayerSource(src, userAgent) : src;
}

export type EmbeddedPlayerLayout = {
  id: string;
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export function getFrameContentOffset(frame: HTMLElement | null) {
  if (!frame) return { left: 0, top: 0 };
  const style = window.getComputedStyle(frame);
  return {
    left: frame.offsetLeft + frame.clientLeft + (Number.parseFloat(style.paddingLeft) || 0),
    top: frame.offsetTop + frame.clientTop + (Number.parseFloat(style.paddingTop) || 0),
  };
}

export function isEmbeddedPlayerLayout(value: unknown): value is EmbeddedPlayerLayout {
  if (!value || typeof value !== 'object') return false;
  const player = value as EmbeddedPlayerLayout;
  return typeof player.id === 'string' && typeof player.src === 'string'
    && normalizeEmbeddedPlayerUrl(player.src, 'https://music.163.com') === player.src
    && ['left', 'top', 'width', 'height'].every((key) => {
      const number = player[key as 'left' | 'top' | 'width' | 'height'];
      return typeof number === 'number' && Number.isFinite(number) && Math.abs(number) <= 100_000;
    }) && player.width > 0 && player.height > 0;
}
