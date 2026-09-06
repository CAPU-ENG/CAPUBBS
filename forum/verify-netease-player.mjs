import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { normalizeNetEasePlayerUrl, isNetEasePlayerLayout } from './src/components/thread/netEasePlayer.ts';

const src = 'https://music.163.com/outchain/player?type=2&id=2096553555&auto=0&height=66';
assert.equal(normalizeNetEasePlayerUrl(src.replace('https:', ''), 'http://localhost/bbs/'), src);
for (const value of ['javascript:alert(1)', 'https://music.163.com.evil.test/outchain/player', 'https://music.163.com/other', 'https://user@music.163.com/outchain/player']) {
  assert.equal(normalizeNetEasePlayerUrl(value, 'https://localhost'), null);
}
const layout = { id: '1', src, left: 12, top: 40, width: 330, height: 86 };
assert.ok(isNetEasePlayerLayout(layout));
assert.equal(isNetEasePlayerLayout({ ...layout, width: NaN }), false);
assert.equal(isNetEasePlayerLayout({ ...layout, src: 'https://evil.test/' }), false);

const source = readFileSync(new URL('./src/components/thread/ThreadHtmlContent.tsx', import.meta.url), 'utf8');
const start = source.indexOf('    function reportNetEasePlayers(){');
const script = source.slice(start, source.indexOf('    function queueHeight(){', start));
const messages = [];
const attributes = new Map([['src', src]]);
let bounds = { left: 12, top: 40, width: 330, height: 86 };
let visible = true;
let frames = [{
  getAttribute: name => attributes.get(name) ?? null,
  setAttribute: (name, value) => attributes.set(name, value),
  hasAttribute: name => attributes.has(name),
  removeAttribute: name => attributes.delete(name),
  getBoundingClientRect: () => bounds,
}];
const context = {
  normalizeNetEasePlayerUrl, frameId: 'floor-1', playerIds: new WeakMap(), nextPlayerId: 0, lastPlayerLayout: '',
  document: { baseURI: 'http://localhost/bbs/content/', querySelectorAll: () => frames },
  window: { getComputedStyle: () => ({ display: visible ? 'block' : 'none', visibility: 'visible' }), parent: { postMessage: message => messages.push(message) } },
};
runInNewContext(script + ';reportNetEasePlayers();', context);
assert.equal(attributes.has('src'), false, 'the nested iframe must stop loading the same player');
assert.equal(messages[0].players[0].src, src);
runInNewContext('reportNetEasePlayers()', context);
assert.equal(messages.length, 1, 'unchanged layout must not trigger a render loop');
bounds = { ...bounds, top: 140 };
runInNewContext('reportNetEasePlayers()', context);
assert.equal(messages[1].players[0].top, 140);
assert.equal(messages[1].players[0].id, '1', 'moving a player must not reload it');
visible = false;
runInNewContext('reportNetEasePlayers()', context);
assert.equal(messages[2].players.length, 0);
frames = [];
runInNewContext('reportNetEasePlayers()', context);
assert.equal(messages.length, 3);
console.log('NetEase player URL validation and layout lifecycle checks passed');
