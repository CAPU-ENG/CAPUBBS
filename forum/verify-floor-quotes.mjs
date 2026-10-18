import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildSync } from 'esbuild';
import { JSDOM } from 'jsdom';
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
assert.match(markdown.content, /^已有回复\n\n> 引用自 /);
assert.match(markdown.content, /> 引用自 \[A \\\[B\\\] & C\]\(\/bbs\/users\/A%20%5BB%5D%20%26%20C\) \[>>\]\(\/bbs\/\?bid=4&p=2&tid=19989#13\)/);
assert.ok(
  markdown.content.indexOf('> 引用自') < markdown.content.indexOf('> <script>alert(1)</script>'),
  'markdown floor quote attribution must appear above its content',
);

const rich = appendFloorQuote({ content: '', mode: 'rich' }, target);
assert.match(rich.content, /^<blockquote class="capubbs-floor-quote">/);
assert.match(rich.content, /<p class="capubbs-floor-quote-content">&lt;script&gt;alert\(1\)&lt;\/script&gt;<\/p>/);
assert.match(rich.content, /<a href="\/bbs\/users\/A%20%5BB%5D%20%26%20C">A \[B\] &amp; C<\/a>/);
assert.match(rich.content, /<a class="capubbs-floor-quote-jump" href="\/bbs\/\?bid=4&amp;p=2&amp;tid=19989#13">&gt;&gt;<\/a>/);
assert.ok(
  rich.content.indexOf('capubbs-floor-quote-meta')
    < rich.content.indexOf('capubbs-floor-quote-content'),
  'rich floor quote attribution must appear above its content',
);

const empty = { content: '<p>原文</p>', mode: 'rich' };
assert.equal(appendFloorQuote(empty, { ...target, quote: '   ' }), empty);

const legacyStorage = buildLegacyFloorQuoteStorage({
  author: 'A]B',
  content: '引用正文[/quote]\n第二段',
  floor: 13,
  href: target.floorHref,
});
assert.match(legacyStorage, /^\[quote=AB]引用正文\[\/ quote]\n第二段\[\/quote]/);
assert.match(legacyStorage, /<!--capubbs:quote \{"href":"\/bbs\/content\/\?bid=4&tid=19989&p=2#13","floor":13}-->$/);

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

const linkOnlyStorage = buildLegacyFloorQuoteStorage({
  author: '',
  content: '“规定原文”',
  customHref: 'https://chexie.net/bbs/content/?bid=3&p=1&tid=5126',
});
assert.equal(
  linkOnlyStorage,
  '[quote]“规定原文”[/quote]<!--capubbs:quote {"customHref":"https://chexie.net/bbs/content/?bid=3&p=1&tid=5126"}-->',
  'a link-only manual quote must not be stored with a placeholder author',
);

const dom = new JSDOM('<!doctype html><html><body></body></html>');
globalThis.document = dom.window.document;
globalThis.DOMParser = dom.window.DOMParser;
const bundleDirectory = mkdtempSync(join(tmpdir(), 'capubbs-floor-quotes-'));
const bundlePath = join(bundleDirectory, 'bundle.mjs');
const { outputFiles } = buildSync({
  bundle: true,
  define: { 'import.meta.env': '{}' },
  format: 'esm',
  platform: 'browser',
  stdin: {
    contents: `
      export { translateLegacyBbcode } from './src/utils/legacyBbcode';
      export { normalizeFloorQuotesForLegacyStorage } from './src/utils/floorQuote';
    `,
    loader: 'ts',
    resolveDir: dirname(fileURLToPath(import.meta.url)),
  },
  write: false,
});
writeFileSync(bundlePath, outputFiles[0].text);
const { normalizeFloorQuotesForLegacyStorage, translateLegacyBbcode } = await import(pathToFileURL(bundlePath).href);
rmSync(bundleDirectory, { force: true, recursive: true });

const linkOnlyHtml = translateLegacyBbcode(`<p>前文</p>${linkOnlyStorage}`);
const linkOnlyQuote = dom.window.document.createElement('template');
linkOnlyQuote.innerHTML = linkOnlyHtml;
const renderedLinkOnly = linkOnlyQuote.content.querySelector('blockquote.forum-legacy-quote');
assert.ok(renderedLinkOnly, 'a link-only quote must render as a quote block');
assert.doesNotMatch(renderedLinkOnly.textContent, /引用自|匿名用户/, 'a link-only quote must not show an author line');
assert.equal(
  renderedLinkOnly.querySelector('.capubbs-manual-quote-author > .capubbs-floor-quote-jump')?.getAttribute('href'),
  'https://chexie.net/bbs/content/?bid=3&p=1&tid=5126',
  'a link-only quote must keep its >> link',
);
assert.equal(renderedLinkOnly.querySelector('.capubbs-manual-quote-body')?.textContent, '“规定原文”');
assert.match(
  normalizeFloorQuotesForLegacyStorage(linkOnlyHtml),
  /\[quote]“规定原文”\[\/quote]<!--capubbs:quote \{"customHref":"https:\/\/chexie\.net\/bbs\/content\/\?bid=3&p=1&tid=5126"}-->/,
  're-saving a link-only quote must keep it authorless',
);

const editorLinkOnly = '<blockquote class="forum-legacy-quote" data-user=""><div class="forum-legacy-quote-content">'
  + '<div class="capubbs-manual-quote-author" contenteditable="false"><a class="capubbs-floor-quote-jump" data-custom-quote-link="true" href="https://chexie.net/bbs/content/?bid=3&amp;p=1&amp;tid=5126">&gt;&gt;</a></div>'
  + '<div class="capubbs-manual-quote-body">正文含<a href="/bbs/users/someone">链接</a></div></div></blockquote>';
assert.match(
  normalizeFloorQuotesForLegacyStorage(editorLinkOnly),
  /^\[quote]正文含<a href="\/bbs\/users\/someone">链接<\/a>\[\/quote]<!--capubbs:quote /,
  'a link inside a link-only quote body must not be taken as its author',
);

const authoredHtml = translateLegacyBbcode(legacyStorage);
assert.match(authoredHtml, /引用自 <a class="forum-mention"[^>]*>AB<\/a><a class="capubbs-floor-quote-jump"/);

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
  /author: isManualQuote \? manualQuoteAuthor : getFloorQuoteAuthor\(quote\)/,
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

console.log('floor quote verification passed (36 assertions)');
