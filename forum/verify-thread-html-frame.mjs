import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(
  new URL('./src/components/thread/ThreadHtmlContent.tsx', import.meta.url),
  'utf8',
);
const resourceCacheSource = readFileSync(
  new URL('./src/components/thread/threadImageResourceCache.ts', import.meta.url),
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
  /while\(captions\.length<slides\.length\)[\s\S]*?data-capubbs-gallery-caption[\s\S]*?normalizedIndex[\s\S]*?data-capubbs-gallery-total/,
  'isolated frames must normalize captions, active state, and total count',
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
assert.match(
  source,
  /deferFrameImageSources\(deferUserScripts\(html\)\)[\s\S]*?image\.removeAttribute\('src'\)/,
  'isolated frame image sources must be intercepted before their first request',
);
assert.match(
  source,
  /type:'image-resource-request'/,
  'iframe must request image resources from the parent broker',
);
assert.match(
  source,
  /type: 'image-resource-response'/,
  'the parent broker must return cached image resources',
);
assert.match(
  source,
  /data\.blob instanceof Blob/,
  'the iframe must render broker responses as Blob resources',
);
assert.match(
  source,
  /imageResourceRequestIdsBySource\[normalizedSource\][\s\S]*?\.images\.push\(image\)[\s\S]*?request\.images\.forEach/,
  'duplicate iframe image URLs must share one broker response and object URL',
);
assert.match(
  source,
  /getCachedThreadImageObjectUrl\(image\.src\) \?\? image\.src/,
  'isolated lightbox images must reuse the parent resource cache',
);
assert.match(
  resourceCacheSource,
  /const resourcePromises = new Map[\s\S]*?if \(cached\) return cached[\s\S]*?response\.blob\(\)/,
  'the parent resource cache must merge concurrent downloads by URL',
);

console.log('thread HTML frame resource verification passed (22 assertions)');
