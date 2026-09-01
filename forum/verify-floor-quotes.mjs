import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  appendFloorQuote,
  buildLegacyFloorQuoteStorage,
  getScopedFloorQuoteSelection,
} from './src/utils/floorQuote.ts';

const selectedStart = {};
const selectedEnd = {};
const selectedRange = { startContainer: selectedStart, endContainer: selectedEnd };
const selectedText = {
  getRangeAt: () => selectedRange,
  rangeCount: 1,
  toString: () => '  精确引用的文字  ',
};
assert.equal(
  getScopedFloorQuoteSelection(selectedText, {
    contains: (node) => node === selectedStart || node === selectedEnd,
  }),
  '精确引用的文字',
);
assert.equal(
  getScopedFloorQuoteSelection(selectedText, { contains: (node) => node === selectedStart }),
  '',
  'a selection crossing outside the clicked floor must not be quoted',
);
assert.equal(
  getScopedFloorQuoteSelection({ ...selectedText, toString: () => '   ' }, { contains: () => true }),
  undefined,
);

const target = {
  author: 'A [B] & C',
  authorHref: '/bbs/users/A%20%5BB%5D%20%26%20C',
  floor: 13,
  floorHref: '/bbs/?bid=4&p=2&tid=19989#13',
  quote: '<script>alert(1)</script>\n第二段',
};

const markdown = appendFloorQuote({ content: '已有回复', mode: 'markdown' }, target);
assert.match(markdown.content, /^已有回复\n\n> <script>alert\(1\)<\/script>/);
assert.match(markdown.content, /> 引用自 \[A \\\[B\\\] & C\]\(\/bbs\/users\/A%20%5BB%5D%20%26%20C\) \[>>\]\(\/bbs\/\?bid=4&p=2&tid=19989#13\)/);

const rich = appendFloorQuote({ content: '', mode: 'rich' }, target);
assert.match(rich.content, /^<blockquote class="capubbs-floor-quote">/);
assert.match(rich.content, /<p class="capubbs-floor-quote-content">&lt;script&gt;alert\(1\)&lt;\/script&gt;<\/p>/);
assert.match(rich.content, /<a href="\/bbs\/users\/A%20%5BB%5D%20%26%20C">A \[B\] &amp; C<\/a>/);
assert.match(rich.content, /<a class="capubbs-floor-quote-jump" href="\/bbs\/\?bid=4&amp;p=2&amp;tid=19989#13">&gt;&gt;<\/a>/);

const empty = { content: '<p>原文</p>', mode: 'rich' };
assert.equal(appendFloorQuote(empty, { ...target, quote: '   ' }), empty);

const legacyStorage = buildLegacyFloorQuoteStorage({
  author: 'A]B',
  content: '引用正文[/quote]\n第二段',
  floor: 13,
  href: target.floorHref,
});
assert.match(legacyStorage, /^\[quote=AB]引用正文\[\/ quote]\n第二段\[\/quote]/);
assert.match(legacyStorage, /<!--capubbs:quote \{"href":"\/bbs\/\?bid=4&tid=19989&p=2#13","floor":13}-->$/);

const imageQuoteStorage = buildLegacyFloorQuoteStorage({
  author: '图片用户',
  content: '<p class="capubbs-floor-quote-content">引用文字<img src="/bbs/images/quote.png" alt="引用图片" width="640" height="480"></p>',
  floor: 23,
  href: '/bbs/?bid=2&tid=9109&p=2#23',
});
assert.match(imageQuoteStorage, /\[quote=图片用户]<p class="capubbs-floor-quote-content">引用文字<img src="\/bbs\/images\/quote\.png" alt="引用图片" width="640" height="480"><\/p>\[\/quote]/);

const imageOnlyQuoteStorage = buildLegacyFloorQuoteStorage({
  author: '图片用户',
  content: '<img src="/bbs/images/image-only.png" alt="">',
  floor: 23,
  href: '/bbs/?bid=2&tid=9109&p=2#23',
});
assert.match(imageOnlyQuoteStorage, /\[quote=图片用户]<img src="\/bbs\/images\/image-only\.png" alt="">\[\/quote]/);

const legacyMainfuncPath = fileURLToPath(new URL('../bbs/lib/mainfunc.php', import.meta.url));
const encodedStorage = Buffer.from(legacyStorage).toString('base64');
const legacyRenderedHtml = execFileSync('php', [
  '-r',
  `require ${JSON.stringify(legacyMainfuncPath)}; echo translate(base64_decode('${encodedStorage}'), true);`,
], { encoding: 'utf8' });
assert.match(legacyRenderedHtml, /<div class='quotel'><div class='quoter'>引用自/);
assert.match(legacyRenderedHtml, /引用正文\[\/ quote]\s*第二段/);

const encodedImageStorage = Buffer.from(imageQuoteStorage).toString('base64');
const legacyRenderedImageHtml = execFileSync('php', [
  '-r',
  `require ${JSON.stringify(legacyMainfuncPath)}; echo translate(base64_decode('${encodedImageStorage}'), true);`,
], { encoding: 'utf8' });
assert.match(legacyRenderedImageHtml, /<div class='quotel'><div class='quoter'>引用自/);
assert.match(legacyRenderedImageHtml, /<img src="\/bbs\/images\/quote\.png" alt="引用图片" width="640" height="480">/);

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

const editorSource = readFileSync(new URL(
  './src/components/editor/RichTextEditor.tsx',
  import.meta.url,
), 'utf8');
assert.match(
  editorSource,
  /<blockquote class="forum-quote" data-capubbs-pending-quote="\$\{pendingQuoteId\}"><br><\/blockquote>/,
  'the quote toolbar action must insert an empty quote block before collecting an optional ID',
);
assert.match(
  editorSource,
  /quote\.setAttribute\('data-user', submittedValue\)/,
  'confirmed manual quotes must retain the referenced ID for publishing',
);
assert.ok(
  editorSource.indexOf('capubbs-manual-quote-author')
    < editorSource.indexOf('capubbs-manual-quote-body'),
  'manual quote authors must be inserted above their quote bodies',
);
assert.match(
  editorSource,
  /focusQuoteTarget\(quoteFocusTarget\)/,
  'typing must resume inside the manual quote body after confirming an ID',
);

const floorQuoteSource = readFileSync(new URL('./src/utils/floorQuote.ts', import.meta.url), 'utf8');
assert.match(
  floorQuoteSource,
  /const manualQuoteAuthor = quote\.getAttribute\('data-user'\)\?\.trim\(\) \?\? '';/,
  'manual quote IDs must be recognized by legacy quote serialization',
);
assert.match(
  floorQuoteSource,
  /author: manualQuoteAuthor \|\| getFloorQuoteAuthor\(quote\)/,
  'manual quote IDs must be published as quote authors',
);
assert.match(
  floorQuoteSource,
  /const manualQuoteBody = quote\.querySelector\('\.capubbs-manual-quote-body'\);[\s\S]*?return manualQuoteBody\.innerHTML\.trim\(\);/,
  'manual quote publishing must serialize only the quote body below the author',
);

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

console.log('floor quote verification passed (27 assertions)');
