import assert from 'node:assert/strict';
import { getEmbeddedPlayerSource } from './src/components/thread/embeddedPlayer.ts';

for (const userAgent of ['Desktop', 'iPhone Mobile']) {
  for (const query of ['', '?auto=1', '?auto=1&auto=1&id=123']) {
    const result = new URL(getEmbeddedPlayerSource('https://music.163.com/outchain/player' + query, userAgent));
    assert.deepEqual(result.searchParams.getAll('auto'), ['0']);
  }
  for (const query of ['', '?autoplay=1', '?autoplay=true&autoplay=1&bvid=BV16fyYYmEo4']) {
    const result = new URL(getEmbeddedPlayerSource('https://player.bilibili.com/player.html' + query, userAgent));
    assert.deepEqual(result.searchParams.getAll('autoplay'), ['0']);
  }
}
console.log('Player render URLs default to paused on desktop and mobile');
