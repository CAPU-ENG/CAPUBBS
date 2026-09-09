import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { disableMediaAutoplay, installMediaPlaybackGuard } from './src/components/thread/mediaPlayback.ts';
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
const videoAttrs = new Map([['autoplay', ''], ['controls', ''], ['muted', '']]);
const frameAttrs = new Map([['allow', 'autoplay *; fullscreen; picture-in-picture']]);
const element = attrs => ({ removeAttribute: key => attrs.delete(key), getAttribute: key => attrs.get(key) ?? null, setAttribute: (key, value) => attrs.set(key, value) });
const root = { querySelectorAll: query => query === 'iframe' ? [element(frameAttrs)] : [element(videoAttrs)] };
// Verify the same standalone function used by the generated frame document.
runInNewContext('(' + disableMediaAutoplay.toString() + ')(root)', { root });
assert.equal(videoAttrs.has('autoplay'), false);
assert.equal(videoAttrs.has('controls'), true);
assert.equal(videoAttrs.has('muted'), true);
assert.equal(frameAttrs.get('allow'), "fullscreen; picture-in-picture; autoplay 'none'");
disableMediaAutoplay(root);
assert.equal(frameAttrs.get('allow'), "fullscreen; picture-in-picture; autoplay 'none'");

const listeners = {};
class Media {
  plays = 0;
  pauses = 0;
  play() { this.plays++; return Promise.resolve(); }
  pause() { this.pauses++; }
}
const navigator = { userActivation: { isActive: false } };
runInNewContext('(' + installMediaPlaybackGuard.toString() + ')()', {
  HTMLMediaElement: Media, navigator, DOMException,
  document: { addEventListener: (type, listener) => { listeners[type] = listener; } },
});
const first = new Media();
const second = new Media();
await assert.rejects(first.play(), { name: 'NotAllowedError' });
assert.equal(first.plays, 0, 'script autoplay must not reach the native play method');
listeners.play({ target: first });
assert.equal(first.pauses, 1, 'native autoplay must also be stopped');
navigator.userActivation.isActive = true;
await first.play();
navigator.userActivation.isActive = false;
await first.play();
assert.equal(first.plays, 2, 'manual playback and later resume stay available');
await assert.rejects(second.play(), { name: 'NotAllowedError' });
listeners.pointerdown({ isTrusted: false, target: second });
await assert.rejects(second.play(), { name: 'NotAllowedError' });
listeners.pointerdown({ isTrusted: true, target: second });
await second.play();
assert.equal(second.plays, 1, 'native controls permit playback');
console.log('Default paused media: player parameters, native autoplay, script playback and manual controls passed');
