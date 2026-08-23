import assert from 'node:assert/strict';
import { appendFloorQuote } from './src/utils/floorQuote.ts';

const target = {
  author: 'A [B] & C',
  authorHref: '/users/A%20%5BB%5D%20%26%20C',
  floor: 13,
  floorHref: '/?bid=4&p=2&tid=19989#13',
  quote: '<script>alert(1)</script>\n第二段',
};

const markdown = appendFloorQuote({ content: '已有回复', mode: 'markdown' }, target);
assert.match(markdown.content, /^已有回复\n\n> <script>alert\(1\)<\/script>/);
assert.match(markdown.content, /> 引用自 \[A \\\[B\\\] & C\]\(\/users\/A%20%5BB%5D%20%26%20C\) \[>>\]\(\/\?bid=4&p=2&tid=19989#13\)/);

const rich = appendFloorQuote({ content: '', mode: 'rich' }, target);
assert.match(rich.content, /^<blockquote class="capubbs-floor-quote">/);
assert.match(rich.content, /<p class="capubbs-floor-quote-content">&lt;script&gt;alert\(1\)&lt;\/script&gt;<\/p>/);
assert.match(rich.content, /<a href="\/users\/A%20%5BB%5D%20%26%20C">A \[B\] &amp; C<\/a>/);
assert.match(rich.content, /<a class="capubbs-floor-quote-jump" href="\/\?bid=4&amp;p=2&amp;tid=19989#13">&gt;&gt;<\/a>/);

const empty = { content: '<p>原文</p>', mode: 'rich' };
assert.equal(appendFloorQuote(empty, { ...target, quote: '   ' }), empty);

console.log('floor quote verification passed (7 assertions)');
