import assert from 'node:assert/strict';
import { build } from 'esbuild';

// Validate the actual Vite-served module graph, including lazy imports and optimized deps.
// A production build or source rebundle cannot detect stale URLs in a running Vite server.
const origin = process.env.CAPUBBS_VITE_ORIGIN || 'http://127.0.0.1:5173';
const loaded = new Set();
const result = await build({
  entryPoints: [`${origin}/bbs/src/components/toolbox/YahouLineageOverview.tsx`],
  bundle: true, write: false, outfile: 'yahou-dev-check.js', format: 'esm', platform: 'browser', logLevel: 'silent',
  plugins: [{ name: 'verify-vite-module-responses', setup(builder) {
    builder.onResolve({ filter: /.*/ }, (args) => {
      const url = new URL(args.path, args.importer || origin);
      assert.equal(url.origin, new URL(origin).origin, 'The overview should resolve its dependencies on the local Vite server.');
      return { path: url.href, namespace: 'vite-http' };
    });
    builder.onLoad({ filter: /.*/, namespace: 'vite-http' }, async (args) => {
      const response = await fetch(args.path);
      assert.equal(response.status, 200, `${args.path} returned ${response.status}. Restart Vite with --force after reinstalling dependencies.`);
      const type = response.headers.get('content-type') || '';
      assert.match(type, /(?:application|text)\/javascript/, `${args.path} returned ${type} instead of a JavaScript module.`);
      loaded.add(args.path);
      return { contents: await response.text(), loader: 'js' };
    });
  } }],
});
assert.ok(result.outputFiles.length);
assert.ok([...loaded].some((url) => url.includes('YahouLineageNetwork.tsx')), 'Include the lazy graph component.');
assert.ok([...loaded].some((url) => url.includes('@relation-graph_react.js')), 'Check the optimized graph dependency.');
assert.ok([...loaded].some((url) => /\/react\.js\?/.test(url)), 'Check the optimized React dependency.');
console.log(`Yahou Vite verification passed: ${loaded.size} live modules fetched and linked, including the lazy graph and optimized dependencies.`);
