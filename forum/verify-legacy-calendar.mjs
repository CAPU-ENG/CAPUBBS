import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../assets/js/jquery.eventCalendar.min.js', import.meta.url), 'utf8');
const helpers = source.slice(source.indexOf('function calendarEventRange('), source.indexOf('function getEventsData('));
const rendering = source.slice(source.indexOf('var events = [];\nvar sortedEvents'), source.indexOf('if(!events.length)'));
const marked = new Set();
const context = vm.createContext({
  eventsOpts: { jsonDateFormat: 'human', showDescription: true, openEventInNewWindow: false },
  document: {
    createElement() {
      let url;
      return {
        set href(value) { url = new URL(value, 'http://localhost/index/'); },
        get href() { return url.href; },
        get protocol() { return url.protocol; },
      };
    },
  },
  flags: { wrap: {
    attr(name) { return name === 'data-current-year' ? '2098' : '0'; },
    find(selector) {
      return {
        removeClass() { marked.clear(); },
        addClass() { marked.add(Number(selector.match(/dayList_(\d+)/)[1])); },
      };
    },
  } },
  $: { each(items, fn) { items.forEach((event, key) => fn(key, event)); } },
  sortJson(a, b) { return a.date.localeCompare(b.date); },
});
vm.runInContext(helpers, context);
const event = { id: '42', date: '2097-12-31 09:00:00', end: '2098-01-02 18:00:00', title: '跨年 <活动>', description: '集合 & 出发', url: '/bbs/?bid=1&tid=2', type: 'meeting' };
function render(day, events = [event], month = 0, limit = 0) {
  Object.assign(context, { data: events, year: 2098, month, day, limit });
  vm.runInContext(rendering, context);
  return Array.from(context.events);
}
assert.equal(render('1').length, 1);
assert.equal(render('2').length, 1);
assert.equal(render('3').length, 0);
assert.equal(render('').length, 1, 'month view must not duplicate a multi-day event');
assert.deepEqual([...marked], [1, 2]);
const html = render('1')[0];
assert.match(html, /href="http:\/\/localhost\/bbs\/\?bid=1&amp;tid=2"/);
assert.match(html, /跨年 &lt;活动&gt;<svg/);
assert.match(html, /<\/a><p class="eventDesc/);
assert.match(html, /集合 &amp; 出发/);
assert.equal(render('1', [{ ...event, url: 'javascript:alert(1)' }])[0].includes('<a '), false);
assert.equal(render('1', [{ ...event, url: '' }])[0].includes('<svg'), false);
assert.equal(render('1', [{ ...event, date: '2098-01-01 09:00:00', end: null }]).length, 1);
assert.equal(render('2', [{ ...event, date: '2098-01-01 09:00:00', end: null }]).length, 0);
assert.equal(render('', [event, { ...event, id: '43' }], 0, 1).length, 1);
const ongoing = { ...event, date: '2000-01-01 09:00:00', end: '2999-01-01 00:00:00' };
assert.equal(render('', [ongoing], false).length, 1, 'ongoing events remain in upcoming list');
assert.equal(marked.size, 31, 'long events only mark visible month days');
console.log('Legacy calendar: cross-day/year coverage, one monthly entry, ongoing events, limit, title links and escaping passed.');
