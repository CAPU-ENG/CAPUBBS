import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(
  new URL('./src/components/thread/ThreadHtmlContent.tsx', import.meta.url),
  'utf8',
);

assert.match(
  source,
  /import frameStylesheet from '\.\.\/\.\.\/styles\/thread-html-frame\.css\?inline';/,
  'isolated frame styles must be bundled as inline text',
);
assert.doesNotMatch(
  source,
  /thread-html-frame\.css\?url|HTML_FRAME_STYLESHEET_URL/,
  'isolated frames must not request their stylesheet independently',
);
assert.doesNotMatch(
  source,
  /<script src="\/bbs\/lib\/jquery\.min\.js"><\/script>/,
  'isolated frames must not request jQuery unconditionally',
);
assert.match(
  source,
  /let jquerySourcePromise: Promise<string \| null> \| null = null;/,
  'the parent document must share one jQuery request promise',
);
assert.match(
  source,
  /const needsJquery = deferredHtml\.includes\('type="text\/capubbs-user-script"'\)[\s\S]*?INLINE_EVENT_ATTRIBUTE_PATTERN\.test\(deferredHtml\);/,
  'script tags and inline event handlers must both enable jQuery compatibility',
);
assert.match(
  source,
  /if \(needsJquery\) void loadJquerySource\(\);/,
  'jQuery must only be prefetched for executable user content',
);
assert.match(
  source,
  /type:'jquery-request'/,
  'script-bearing frames must request the shared jQuery source from the parent',
);
assert.match(
  source,
  /data\.type==='jquery-response'/,
  'script-bearing frames must accept the shared jQuery source from the parent',
);
assert.match(
  source,
  /const handleFrameLoad = useCallback\(\(\) => \{[\s\S]*?sendJquerySource\(\);/,
  'the iframe load event must retry delivery if the initial request message races the parent listener',
);
assert.match(
  source,
  /jquery\.src=jquerySourceUrl;/,
  'frames must retain the external jQuery fallback when the shared request fails',
);
assert.match(
  source,
  /var imageElements=gallery[\s\S]*?gallery\.querySelectorAll\('\[data-capubbs-gallery-slide="true"\] img'\)[\s\S]*?filter\(function\(candidate\)[\s\S]*?!candidate\.closest\('\.capubbs-gallery'\)/,
  'isolated frames must keep each gallery separate and group only bare floor images together',
);
assert.match(
  source,
  /function prepareGalleries\(\)[\s\S]*?data-capubbs-gallery-action[\s\S]*?capubbs-gallery-count/,
  'isolated frames must restore missing historical gallery navigation and count controls',
);
assert.match(
  source,
  /elementIndex:allImages\.indexOf\(candidate\)/,
  'isolated frames must report the original element index',
);
assert.match(
  source,
  /frameImages\[image\.elementIndex\]/,
  'isolated frame messages must map back to existing loaded elements',
);

console.log('thread HTML frame resource verification passed (14 assertions)');
