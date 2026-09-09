import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { getNetEasePlayerSource, normalizeNetEasePlayerUrl } from './src/components/thread/netEasePlayer.ts';
import { getEmbeddedPlayerSource, getFrameContentOffset, isEmbeddedPlayerLayout, normalizeEmbeddedPlayerUrl } from './src/components/thread/embeddedPlayer.ts';

assert.deepEqual(getFrameContentOffset(null), { left: 0, top: 0 });
globalThis.window = { getComputedStyle: frame => frame.style };
const outerFrame = { offsetLeft: 4, offsetTop: 20, clientLeft: 1, clientTop: 2, style: { paddingLeft: '6px', paddingTop: '18px' } };
assert.deepEqual(getFrameContentOffset(outerFrame), { left: 11, top: 40 }, 'player origin includes the outer border and desktop padding');
outerFrame.style.paddingTop = '14px';
assert.deepEqual(getFrameContentOffset(outerFrame), { left: 11, top: 36 }, 'mobile padding is read from the current stylesheet');
outerFrame.style.paddingTop = '0px';
assert.equal(getFrameContentOffset(outerFrame).top, 22, 'signatures without top padding retain their original offset');

const src = 'https://music.163.com/outchain/player?type=2&id=2096553555&auto=0&height=66';
const mobileSrc = src.replace('/outchain/', '/m/outchain/');
for (const userAgent of ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile', 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile', 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)']) {
  assert.equal(getNetEasePlayerSource(src, userAgent), mobileSrc, 'mobile embeds must bypass the HTTP redirect');
  assert.equal(getNetEasePlayerSource(mobileSrc, userAgent), mobileSrc);
}
for (const userAgent of ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)']) {
  assert.equal(getNetEasePlayerSource(src, userAgent), src);
  assert.equal(getNetEasePlayerSource(mobileSrc, userAgent), src, 'desktop embeds must also bypass the reverse HTTP redirect');
}
assert.equal(normalizeNetEasePlayerUrl(mobileSrc.replace('https:', 'http:'), 'https://localhost'), mobileSrc);
assert.equal(normalizeNetEasePlayerUrl(src.replace('https:', ''), 'http://localhost/bbs/'), src);
for (const value of ['javascript:alert(1)', 'https://music.163.com.evil.test/outchain/player', 'https://music.163.com/other', 'https://user@music.163.com/outchain/player']) {
  assert.equal(normalizeNetEasePlayerUrl(value, 'https://localhost'), null);
}
const layout = { id: '1', src, left: 12, top: 40, width: 330, height: 86 };
assert.ok(isEmbeddedPlayerLayout(layout));
assert.ok(isEmbeddedPlayerLayout({ ...layout, src: mobileSrc }));
assert.equal(isEmbeddedPlayerLayout({ ...layout, width: NaN }), false);
assert.equal(isEmbeddedPlayerLayout({ ...layout, src: 'https://evil.test/' }), false);

const source = readFileSync(new URL('./src/components/thread/ThreadHtmlContent.tsx', import.meta.url), 'utf8');
const start = source.indexOf('    function reportEmbeddedPlayers(){');
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
  normalizeEmbeddedPlayerUrl, frameId: 'floor-1', playerIds: new WeakMap(), nextPlayerId: 0, lastPlayerLayout: '',
  document: { baseURI: 'http://localhost/bbs/content/', querySelectorAll: () => frames },
  window: { getComputedStyle: () => ({ display: visible ? 'block' : 'none', visibility: 'visible' }), parent: { postMessage: message => messages.push(message) } },
};
runInNewContext(script + ';reportEmbeddedPlayers();', context);
assert.equal(attributes.has('src'), false, 'the nested iframe must stop loading the same player');
assert.equal(messages[0].players[0].src, src);
runInNewContext('reportEmbeddedPlayers()', context);
assert.equal(messages.length, 1, 'unchanged layout must not trigger a render loop');
bounds = { ...bounds, top: 140 };
runInNewContext('reportEmbeddedPlayers()', context);
assert.equal(messages[1].players[0].top, 140);
assert.equal(messages[1].players[0].id, '1', 'moving a player must not reload it');
visible = false;
runInNewContext('reportEmbeddedPlayers()', context);
assert.equal(messages[2].players.length, 0);
frames = [];
runInNewContext('reportEmbeddedPlayers()', context);
assert.equal(messages.length, 3);

// Nonzero geometry is possible inside closed details; the overlay must still hide.
const summary = { tagName: 'SUMMARY' };
const body = { tagName: 'DIV' };
let open = false;
const details = { tagName: 'DETAILS', children: [summary, body], hasAttribute: () => open, parentElement: null };
summary.parentElement = details;
body.parentElement = details;
frames = [{
  getAttribute: name => attributes.get(name) ?? null,
  setAttribute: (name, value) => attributes.set(name, value),
  hasAttribute: name => attributes.has(name),
  removeAttribute: name => attributes.delete(name),
  getBoundingClientRect: () => bounds,
  parentElement: body,
}];
visible = true;
runInNewContext('reportEmbeddedPlayers()', context);
assert.equal(messages.length, 3, 'closed details must not expose a player with stale nonzero geometry');
open = true;
runInNewContext('reportEmbeddedPlayers()', context);
assert.equal(messages.at(-1).players.length, 1, 'expanding details restores the player');
open = false;
runInNewContext('reportEmbeddedPlayers()', context);
assert.equal(messages.at(-1).players.length, 0, 'collapsing details removes the overlay');
frames[0].parentElement = summary;
runInNewContext('reportEmbeddedPlayers()', context);
assert.equal(messages.at(-1).players.length, 1, 'the first summary stays visible when closed');
const secondSummary = { tagName: 'SUMMARY', parentElement: details };
details.children.push(secondSummary);
frames[0].parentElement = secondSummary;
runInNewContext('reportEmbeddedPlayers()', context);
assert.equal(messages.at(-1).players.length, 0, 'additional summaries are hidden when closed');
frames[0].parentElement = summary;
details.parentElement = { tagName: 'DETAILS', children: [details], hasAttribute: () => false, parentElement: null };
runInNewContext('reportEmbeddedPlayers()', context);
assert.equal(messages.at(-1).players.length, 0, 'an outer closed details also hides a nested summary player');
const bilibiliSrc = 'https://player.bilibili.com/player.html?isOutside=true&aid=113340563130199&bvid=BV16fyYYmEo4&cid=26384728822&p=1&autoplay=0&poster=true&high_quality=1&danmaku=1';
assert.equal(normalizeEmbeddedPlayerUrl(bilibiliSrc.replace('https:', ''), 'https://localhost'), bilibiliSrc);
assert.equal(getEmbeddedPlayerSource(bilibiliSrc, 'iPhone Mobile'), bilibiliSrc, 'Bilibili parameters must survive device handling');
assert.equal(getEmbeddedPlayerSource(src, 'iPhone Mobile'), mobileSrc);
assert.ok(isEmbeddedPlayerLayout({ ...layout, src: bilibiliSrc }));
for (const value of ['https://player.bilibili.com.evil.test/player.html', 'https://player.bilibili.com/other', 'https://user@player.bilibili.com/player.html', 'https://player.bilibili.com:8443/player.html', 'javascript:alert(1)']) {
  assert.equal(normalizeEmbeddedPlayerUrl(value, 'https://localhost'), null);
  assert.equal(isEmbeddedPlayerLayout({ ...layout, src: value }), false);
}
assert.equal(runInNewContext('(' + normalizeEmbeddedPlayerUrl.toString() + ')(src, src)', { URL, src: bilibiliSrc }), bilibiliSrc, 'normalizer injected into the isolated document must be self-contained');
attributes.set('src', bilibiliSrc);
details.parentElement = null;
frames[0].parentElement = body;
runInNewContext('reportEmbeddedPlayers()', context);
assert.equal(attributes.has('src'), false, 'Bilibili must not load inside the sandbox');
assert.equal(messages.at(-1).players.length, 0);
open = true;
runInNewContext('reportEmbeddedPlayers()', context);
assert.equal(messages.at(-1).players[0].src, bilibiliSrc);
assert.equal(messages.at(-1).players[0].width, bounds.width);
open = false;
runInNewContext('reportEmbeddedPlayers()', context);
assert.equal(messages.at(-1).players.length, 0, 'Bilibili overlay must disappear on collapse');
console.log('Embedded NetEase and Bilibili player URL validation and layout lifecycle checks passed');
