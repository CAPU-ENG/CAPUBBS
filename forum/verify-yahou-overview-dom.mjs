import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { createRequire } from 'node:module';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

// DOM lifecycle checks only: no browser, screenshots, layout or visual assertions.
const origin = process.env.CAPUBBS_PHP_ORIGIN || 'http://127.0.0.1:8081';
const htmlResponse = await fetch(`${origin}/bbs/toolbox?tab=yahou-lineage`);
assert.equal(htmlResponse.status, 200);
const html = await htmlResponse.text();
const entry = html.match(/new-assets\/(index-[^" ]+\.js)/)?.[1];
assert.ok(entry, 'Build the forum before running this check.');
const assetNames = [entry, ...(await readdir(new URL('./dist/new-assets', import.meta.url)))
  .filter((name) => /^YahouLineageNetwork-.*\.(?:js|css)$/.test(name))];
assert.ok(assetNames.some((name) => name.endsWith('.css')));
for (const name of assetNames) {
  const response = await fetch(`${origin}/bbs/new-assets/${name}`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', name.endsWith('.css') ? /text\/css/ : /(?:application|text)\/javascript/,
    'A PHP server without router.php can return HTML with status 200 for JS/CSS requests.');
  assert.equal(await response.text(), await readFile(new URL(`./dist/new-assets/${name}`, import.meta.url), 'utf8'));
}

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: `${origin}/bbs/toolbox`, pretendToBeVisual: true });
const window = dom.window;
for (const key of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'SVGElement', 'HTMLCanvasElement', 'HTMLDialogElement', 'MutationObserver', 'getComputedStyle', 'Event', 'MouseEvent', 'localStorage', 'navigator']) {
  Object.defineProperty(globalThis, key, { value: key === 'window' ? window : window[key], configurable: true });
}
window.matchMedia = (media) => ({ matches: media.includes('reduced-motion: reduce'), media, addEventListener() {}, removeEventListener() {} });
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
const observed = new Set();
let throwOnMount = false;
globalThis.ResizeObserver = class {
  constructor() { if (throwOnMount) throw new Error('Injected renderer initialization failure'); this.targets = new Set(); }
  observe(target) { this.targets.add(target); observed.add(target); }
  unobserve(target) { this.targets.delete(target); observed.delete(target); }
  disconnect() { for (const target of this.targets) observed.delete(target); this.targets.clear(); }
};
window.ResizeObserver = globalThis.ResizeObserver;
window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
const closedMeasurements = [];
window.HTMLElement.prototype.getBoundingClientRect = function () {
  const closed = this.closest('dialog:not([open])');
  if (closed && this.classList.contains('relation-graph')) closedMeasurements.push(this);
  const node = this.classList.contains('rg-node') || this.classList.contains('rg-node-peel');
  const width = closed ? 0 : node ? 30 : 1000;
  const height = closed ? 0 : node ? 30 : 650;
  return { x: 0, y: 0, left: 0, top: 0, width, height, right: width, bottom: height, toJSON() { return this; } };
};
for (const [key, size] of [['clientWidth', 'width'], ['clientHeight', 'height'], ['offsetWidth', 'width'], ['offsetHeight', 'height']]) {
  Object.defineProperty(window.HTMLElement.prototype, key, { get() { return this.getBoundingClientRect()[size]; }, configurable: true });
}
window.HTMLCanvasElement.prototype.getContext = () => new Proxy({ measureText(text) { return { width: String(text).length * 13 }; } }, { get(target, key) { return target[key] ?? (() => {}); } });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const require = createRequire(import.meta.url);
const output = new URL('../tool/yahou-overview-dom-test/', import.meta.url);
await mkdir(output, { recursive: true });
await build({
  absWorkingDir: new URL('.', import.meta.url).pathname,
  entryPoints: ['src/components/toolbox/YahouLineageOverview.tsx'], outdir: output.pathname,
  outExtension: { '.js': '.mjs' }, bundle: true, splitting: true, format: 'esm', platform: 'browser', jsx: 'automatic', loader: { '.css': 'empty' },
  plugins: [{ name: 'shared-react-runtime', setup(builder) {
    builder.onResolve({ filter: /^react(?:-dom)?(?:\/.*)?$/ }, (args) => ({ path: require.resolve(args.path), external: true }));
  } }],
});
const { createElement: h, act, lazy, Suspense, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { YahouLineageOverview, YahouOverviewErrorBoundary } = await import(new URL('YahouLineageOverview.mjs', output));
const data = JSON.parse(await readFile(new URL('./data/yahou-lineage.json', import.meta.url), 'utf8'));
const errors = [];
const caught = [];
window.addEventListener('error', (event) => errors.push(event.error));
const root = createRoot(document.getElementById('root'), { onUncaughtError: (error) => errors.push(error), onCaughtError: (error) => caught.push(error) });
async function waitFor(predicate, message) {
  for (let i = 0; i < 60 && !predicate(); i += 1) await act(() => delay(30));
  assert.ok(predicate(), message);
}
function Harness() {
  const [open, setOpen] = useState(true);
  return h('main', { id: 'forum-sentinel', style: { color: 'rgb(1, 2, 3)' } },
    h('span', null, 'Forum content'),
    open ? h(YahouLineageOverview, { data, onClose: () => setOpen(false) }) : h('button', { onClick: () => setOpen(true) }, '重新打开总览'));
}
try {
  document.body.style.overflow = 'auto';
  await act(async () => root.render(h(Harness)));
  await waitFor(() => document.querySelectorAll('.rg-node').length === data.nodes.length + 1, 'The real renderer must mount every member and the root.');
  await waitFor(() => ![...document.querySelectorAll('button')].find((button) => button.textContent === '继续漂浮')?.disabled, 'Graph controls should become ready.');
  assert.equal(document.querySelectorAll('.rg-line').length, data.nodes.length);
  assert.equal(document.querySelector('dialog').open, true);
  assert.equal(closedMeasurements.length, 0, 'The graph must not measure a hidden dialog.');
  assert.equal(document.body.style.overflow, 'hidden');
  assert.equal(document.getElementById('forum-sentinel').style.color, 'rgb(1, 2, 3)');
  assert.equal(document.querySelectorAll('.yahou-line-flow').length, 0, 'No flow overlays before a node is selected.');
  const members = new Map(data.nodes.map((node) => [node.id, node]));
  const member = data.nodes.find((node) => node.parentId && members.get(node.parentId)?.parentId && data.nodes.some((child) => child.parentId === node.id));
  assert.ok(member, 'Use a member with multiple ancestors and children.');
  const path = [];
  for (let node = member; node; node = members.get(node.parentId)) path.push(node.id);
  const children = data.nodes.filter((node) => node.parentId === member.id).map((node) => node.id);
  const nodeIds = new Set(['yahou:root', ...[...path, ...children].map((id) => `member:${id}`)]);
  const lineIds = new Set([...path, ...children].map((id) => `link:${id}`));
  const nodeElement = [...document.querySelectorAll('.rg-node-peel')].find((node) => node.dataset.id === `member:${member.id}`).querySelector('.rg-node');
  await act(async () => nodeElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 100, clientY: 100 })));
  await act(async () => nodeElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0, clientX: 100, clientY: 100 })));
  await waitFor(() => document.querySelector('.yahou-graph-selection'), 'Clicking a node must select it.');
  await waitFor(() => document.querySelectorAll('.yahou-line-flow').length === lineIds.size, 'The renderer must apply selection styles and flow overlays.');
  for (const node of document.querySelectorAll('.rg-node-peel')) {
    assert.equal(Number(node.style.getPropertyValue('--rg-node-opacity')), nodeIds.has(node.dataset.id) ? 1 : 0.2, node.dataset.id);
  }
  const flowingLines = [...document.querySelectorAll('.yahou-line-flow')];
  assert.deepEqual(new Set(flowingLines.map((line) => line.closest('[data-id]').dataset.id)), lineIds, 'Flow follows only the ancestry and immediate children.');
  for (const line of flowingLines) {
    assert.equal(line.getAttribute('d'), line.parentElement.querySelector('.rg-line').getAttribute('d'), 'Glow must track the actual connection path.');
    assert.equal(line.style.animationDirection, 'normal', 'Tree connections point from parent to child.');
  }
  assert.equal(document.querySelector('.yahou-graph-selection > span').textContent, `第 ${path.length} 代`);
  assert.equal(document.querySelector('.yahou-overview-canvas').dataset.flowing, 'false', 'Reduced-motion starts with flow paused.');
  await act(async () => document.querySelector('[aria-label="取消选中"]').click());
  await waitFor(() => document.querySelectorAll('.yahou-line-flow').length === 0, 'Clearing selection removes flow overlays.');
  for (const node of document.querySelectorAll('.rg-node-peel')) assert.equal(Number(node.style.getPropertyValue('--rg-node-opacity')), 1);
  await act(async () => document.querySelector('[aria-label="关闭谱系总览"]').click());
  assert.equal(document.querySelector('dialog'), null);
  assert.equal(document.querySelector('.relation-graph'), null);
  assert.equal(document.body.style.overflow, 'auto');
  assert.equal(observed.size, 0, 'Unmount must release renderer observers.');
  assert.ok(document.getElementById('forum-sentinel'));
  assert.equal(errors.length, 0);
  assert.equal(caught.length, 0);

  // Exercise an actual graph mount failure through the modal boundary.
  throwOnMount = true;
  await act(async () => [...document.querySelectorAll('button')].find((button) => button.textContent === '重新打开总览').click());
  await waitFor(() => document.querySelector('[role="alert"]'), 'Renderer failure must remain inside the overview.');
  assert.ok(document.getElementById('forum-sentinel'));
  assert.equal(document.querySelector('dialog').open, true);
  await act(async () => document.querySelector('[aria-label="关闭谱系总览"]').click());
  assert.equal(document.body.style.overflow, 'auto');
  assert.equal(document.querySelector('.relation-graph'), null);
  assert.equal(errors.length, 0, 'Renderer errors must never reach the application root.');
  assert.ok(caught.some((error) => error.message.includes('Injected renderer')));

  // A stale deployment chunk rejects the lazy import before any renderer mounts.
  const MissingChunk = lazy(() => Promise.reject(new Error('Injected missing chunk')));
  await act(async () => root.render(h('main', { id: 'forum-sentinel' }, 'Forum content',
    h(YahouOverviewErrorBoundary, null, h(Suspense, { fallback: 'Loading' }, h(MissingChunk))))));
  await waitFor(() => document.querySelector('[role="alert"]'), 'Import failure must be caught.');
  assert.ok(document.getElementById('forum-sentinel'));
  assert.equal(errors.length, 0);
  assert.ok(caught.some((error) => error.message.includes('Injected missing chunk')));
  console.log(`Yahou DOM verification passed: correct JS/CSS responses, ${data.nodes.length + 1} rendered nodes, ${data.nodes.length} lines, ancestor highlighting, directional flow, selection cleanup, open-before-measure, and isolated render/import failures.`);
} finally {
  await act(async () => root.unmount());
  dom.window.close();
}
