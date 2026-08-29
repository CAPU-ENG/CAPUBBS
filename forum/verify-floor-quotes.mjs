import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  appendFloorQuote,
  buildLegacyFloorQuoteStorage,
} from './src/utils/floorQuote.ts';

const target = {
  author: 'A [B] & C',
  authorHref: '/forum/users/A%20%5BB%5D%20%26%20C',
  floor: 13,
  floorHref: '/forum/?bid=4&p=2&tid=19989#13',
  quote: '<script>alert(1)</script>\n第二段',
};

const markdown = appendFloorQuote({ content: '已有回复', mode: 'markdown' }, target);
assert.match(markdown.content, /^已有回复\n\n> <script>alert\(1\)<\/script>/);
assert.match(markdown.content, /> 引用自 \[A \\\[B\\\] & C\]\(\/forum\/users\/A%20%5BB%5D%20%26%20C\) \[>>\]\(\/forum\/\?bid=4&p=2&tid=19989#13\)/);

const rich = appendFloorQuote({ content: '', mode: 'rich' }, target);
assert.match(rich.content, /^<blockquote class="capubbs-floor-quote">/);
assert.match(rich.content, /<p class="capubbs-floor-quote-content">&lt;script&gt;alert\(1\)&lt;\/script&gt;<\/p>/);
assert.match(rich.content, /<a href="\/forum\/users\/A%20%5BB%5D%20%26%20C">A \[B\] &amp; C<\/a>/);
assert.match(rich.content, /<a class="capubbs-floor-quote-jump" href="\/forum\/\?bid=4&amp;p=2&amp;tid=19989#13">&gt;&gt;<\/a>/);

const empty = { content: '<p>原文</p>', mode: 'rich' };
assert.equal(appendFloorQuote(empty, { ...target, quote: '   ' }), empty);

const legacyStorage = buildLegacyFloorQuoteStorage({
  author: 'A]B',
  floor: 13,
  href: target.floorHref,
  text: '引用正文[/quote]\n第二段',
});
assert.match(legacyStorage, /^\[quote=AB]引用正文\[\/ quote]\n第二段\[\/quote]/);
assert.match(legacyStorage, /<!--capubbs:quote \{"href":"\/forum\/\?bid=4&tid=19989&p=2#13","floor":13}-->$/);

const legacyMainfuncPath = fileURLToPath(new URL('../bbs/lib/mainfunc.php', import.meta.url));
const encodedStorage = Buffer.from(legacyStorage).toString('base64');
const legacyRenderedHtml = execFileSync('php', [
  '-r',
  `require ${JSON.stringify(legacyMainfuncPath)}; echo translate(base64_decode('${encodedStorage}'), true);`,
], { encoding: 'utf8' });
assert.match(legacyRenderedHtml, /<div class='quotel'><div class='quoter'>引用自/);
assert.match(legacyRenderedHtml, /引用正文\[\/ quote]\s*第二段/);

for (const sourcePath of [
  './src/components/thread/ReplyEditor.tsx',
  './src/pages/ThreadComposePage.tsx',
  './src/pages/ThreadEditPage.tsx',
]) {
  const source = readFileSync(new URL(sourcePath, import.meta.url), 'utf8');
  assert.match(
    source,
    /normalizeFloorQuotesForLegacyStorage\(getRichTextEditorHtmlValue\(editorValue\)\)/,
    `${sourcePath} must publish legacy-compatible floor quotes`,
  );
}

for (const stylesheet of [
  './src/styles/thread.css',
  './src/styles/thread-html-frame.css',
]) {
  const css = readFileSync(new URL(stylesheet, import.meta.url), 'utf8');
  assert.match(
    css,
    /\.forum-markup \.capubbs-floor-quote-jump\s*\{[^}]*margin-left:\s*0\.75em;/,
    `${stylesheet} must separate the author ID and floor jump link`,
  );
}

console.log('floor quote verification passed (16 assertions)');
