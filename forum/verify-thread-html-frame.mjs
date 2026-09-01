import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(
  new URL('./src/components/thread/ThreadHtmlContent.tsx', import.meta.url),
  'utf8',
);
const frameStyles = readFileSync(
  new URL('./src/styles/thread-html-frame.css', import.meta.url),
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
  /if \(hasUserScripts\) void loadJquerySource\(\);/,
  'jQuery must only be prefetched when user scripts are present',
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
  /url\.hostname\.toLowerCase\(\)==='music\.163\.com'/,
  'only NetEase outchain players must receive the dedicated treatment',
);
assert.match(
  source,
  /surface\.className='capubbs-netease-player-surface';/,
  'NetEase players must be wrapped in a theme-matched compositing surface',
);
assert.match(
  frameStyles,
  /\.capubbs-netease-player-surface > iframe \{[\s\S]*?mix-blend-mode: multiply;/,
  'light mode must visually remove the white player canvas with multiply blending',
);
assert.match(
  frameStyles,
  /:root\.dark \.capubbs-netease-player-surface > iframe \{[\s\S]*?filter: invert\(1\) hue-rotate\(180deg\);[\s\S]*?mix-blend-mode: screen;/,
  'dark mode must invert and screen-blend the player canvas',
);

console.log('thread HTML frame resource verification passed (13 assertions)');
