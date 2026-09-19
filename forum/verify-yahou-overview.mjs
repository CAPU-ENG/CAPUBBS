import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { parseYahouLineage } from './src/data/yahouLineage.ts';
import { buildYahouGraph, createYahouSimulation, DEFAULT_YAHOU_FORCES, exportYahouGraphSvg, getYahouHighlight, visibleYahouLabels, YAHOU_GRAPH_ROOT, yahouGraphId } from './src/utils/yahouOverview.ts';
import { YAHOU_OVERVIEW_PALETTES } from './src/utils/yahouOverviewTheme.ts';

const data = parseYahouLineage(JSON.parse(await readFile(new URL('./data/yahou-lineage.json', import.meta.url), 'utf8')));
const original = structuredClone(data);
const graph = buildYahouGraph(data);
assert.equal(graph.nodes.length, data.nodes.length + 1);
assert.equal(graph.links.length, data.nodes.length);
assert.equal(new Set(graph.nodes.map((node) => node.id)).size, graph.nodes.length);
const byId = new Map(graph.nodes.map((node) => [node.id, node]));
for (const member of data.nodes) {
  const node = byId.get(yahouGraphId(member.id));
  assert.equal(node.label, member.id);
  assert.equal(node.status, member.status);
  const parentId = member.parentId === null ? YAHOU_GRAPH_ROOT : yahouGraphId(member.parentId);
  assert.equal(graph.links.find((link) => link.target === node.id).source, parentId);
  assert.equal(byId.get(parentId).generation + 1, node.generation);
  assert.ok(byId.get(parentId).radius > node.radius);
}
const radii = new Map();
for (const node of graph.nodes) {
  if (radii.has(node.generation)) assert.equal(radii.get(node.generation), node.radius);
  radii.set(node.generation, node.radius);
}
const graphBefore = structuredClone(graph);
const engine = createYahouSimulation(graph);
engine.simulation.tick(160);
for (const node of engine.nodes) assert.ok([node.x, node.y, node.vx, node.vy].every(Number.isFinite));
assert.deepEqual(graph, graphBefore, 'Simulation must not mutate graph input.');
assert.deepEqual(data, original, 'Drawing must never change shared JSON.');
assert.equal(engine.byId.get(YAHOU_GRAPH_ROOT).x, 0);
assert.equal(engine.byId.get(YAHOU_GRAPH_ROOT).y, 0);

const fixture = parseYahouLineage({ schemaVersion: 1, revision: 1, root: '实践部', nodes: [
  { id: 'yahou:root', parentId: null, status: 'qualified' },
  { id: '__proto__', parentId: 'yahou:root', status: 'qualified' },
  { id: '实践部', parentId: '__proto__', status: 'passed' },
  { id: '<script>&"🚲', parentId: null, status: 'pending' },
] });
const specialGraph = buildYahouGraph(fixture);
assert.equal(new Set(specialGraph.nodes.map((node) => node.id)).size, 5);
const highlighted = getYahouHighlight(specialGraph, new Set([yahouGraphId('__proto__')]));
assert.deepEqual(highlighted.nodeIds, new Set([YAHOU_GRAPH_ROOT, yahouGraphId('yahou:root'), yahouGraphId('__proto__'), yahouGraphId('实践部')]));
assert.deepEqual(highlighted.linkIds, new Set(['link:yahou:root', 'link:__proto__', 'link:实践部']), 'Include every ancestor edge and immediate children, excluding other root branches.');
const firstGeneration = getYahouHighlight(specialGraph, new Set([yahouGraphId('yahou:root')]));
assert.deepEqual(firstGeneration.nodeIds, new Set([YAHOU_GRAPH_ROOT, yahouGraphId('yahou:root'), yahouGraphId('__proto__')]));
assert.deepEqual(firstGeneration.linkIds, new Set(['link:yahou:root', 'link:__proto__']), 'Do not expand beyond immediate children.');
assert.deepEqual(getYahouHighlight(specialGraph, new Set([YAHOU_GRAPH_ROOT])).nodeIds,
  new Set([YAHOU_GRAPH_ROOT, yahouGraphId('yahou:root'), yahouGraphId('<script>&"🚲')]));
for (const selected of [[], ['missing']]) assert.deepEqual(getYahouHighlight(specialGraph, new Set(selected)), { nodeIds: new Set(), linkIds: new Set() });
const comparisonGraph = buildYahouGraph(parseYahouLineage({ ...fixture, nodes: [...fixture.nodes,
  { id: 'peer', parentId: '__proto__', status: 'passed' },
] }));
const comparison = getYahouHighlight(comparisonGraph, new Set([yahouGraphId('实践部'), yahouGraphId('peer')]));
assert.deepEqual(comparison.nodeIds, new Set([...highlighted.nodeIds, yahouGraphId('peer')]));
assert.deepEqual(comparison.linkIds, new Set([...highlighted.linkIds, 'link:peer']), 'Merge shared ancestry without losing either branch.');
const remaining = getYahouHighlight(comparisonGraph, new Set([yahouGraphId('peer')]));
assert.deepEqual(remaining.nodeIds, new Set([YAHOU_GRAPH_ROOT, yahouGraphId('yahou:root'), yahouGraphId('__proto__'), yahouGraphId('peer')]));
assert.deepEqual(remaining.linkIds, new Set(['link:yahou:root', 'link:__proto__', 'link:peer']), 'Removing one ID keeps shared ancestors and removes only its exclusive branch.');
for (const selection of [['yahou:root', '实践部'], ['实践部', 'yahou:root']]) {
  assert.deepEqual(getYahouHighlight(specialGraph, new Set(selection.map(yahouGraphId))), highlighted, 'Selecting an ancestor and descendant works in either order.');
}
const corrected = structuredClone(fixture);
corrected.nodes[2].parentId = 'yahou:root';
assert.notDeepEqual(buildYahouGraph(corrected).links, specialGraph.links);
const empty = createYahouSimulation(buildYahouGraph({ ...fixture, nodes: [] }));
empty.simulation.tick(20); assert.equal(empty.nodes.length, 1); empty.dispose();

const pair = buildYahouGraph({ ...fixture, nodes: [{ id: 'child', parentId: null, status: 'passed' }] });
function simulatedDistance(settings) {
  const model = createYahouSimulation(pair, { ...DEFAULT_YAHOU_FORCES, ...settings });
  model.simulation.tick(400);
  const child = model.nodes[1];
  const distance = Math.hypot(child.x, child.y);
  model.dispose();
  return distance;
}
assert.ok(simulatedDistance({ center: 100 }) < simulatedDistance({ center: 0 }), 'Center force must pull nodes inward.');
assert.ok(simulatedDistance({ repulsion: 100 }) > simulatedDistance({ repulsion: 0 }), 'Repulsion must spread nodes apart.');
assert.ok(simulatedDistance({ elasticity: 100 }) < simulatedDistance({ elasticity: 0 }), 'Stronger links must resist separation.');
assert.ok(simulatedDistance({ distance: 240 }) > simulatedDistance({ distance: 30 }), 'Link length must change equilibrium distance.');
engine.configure({ center: NaN, repulsion: -1000, elasticity: Infinity, distance: 10000 });
engine.simulation.tick(50);
assert.ok(engine.nodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y)), 'Out-of-range settings must remain finite.');
const childId = graph.nodes[1].id;
engine.drag(childId, 200, 100); engine.simulation.tick(10);
assert.equal(engine.byId.get(childId).x, 200); assert.equal(engine.byId.get(childId).y, 100);
engine.release(childId); assert.equal(engine.byId.get(childId).fx, null);
engine.simulation.tick(10); assert.notEqual(engine.byId.get(childId).x, 200);
engine.drag(YAHOU_GRAPH_ROOT, 100, 50); engine.release(YAHOU_GRAPH_ROOT); engine.simulation.tick(10);
assert.equal(engine.nodes[0].x, 100); assert.equal(engine.nodes[0].y, 50);
engine.pinRoot(false); assert.equal(engine.nodes[0].fx, null);
engine.drag(childId, 80, 30); engine.releaseAll(); assert.equal(engine.byId.get(childId).fx, null);
engine.dispose();

const lifecycle = createYahouSimulation(pair);
lifecycle.run(true); await delay(70); lifecycle.run(false);
const paused = structuredClone(lifecycle.nodes);
await delay(70); assert.deepEqual(lifecycle.nodes, paused, 'Pause must stop every simulation tick.');
lifecycle.configure({ ...DEFAULT_YAHOU_FORCES, repulsion: 100 });
await delay(40); assert.deepEqual(lifecycle.nodes, paused, 'Changing settings must respect pause.');
lifecycle.run(true); await delay(70); assert.notDeepEqual(lifecycle.nodes, paused, 'Resume must restart simulation.');
lifecycle.dispose(); const disposed = structuredClone(lifecycle.nodes);
lifecycle.run(true); await delay(70); assert.deepEqual(lifecycle.nodes, disposed, 'Closing must dispose and prevent restarts.');

const crowded = pair.nodes.map((node) => ({ ...node, x: 0, y: 0, generation: 5, radius: 10 }));
assert.equal(visibleYahouLabels(crowded, 100).size, 1, 'Overlapping labels should be culled.');
assert.equal(visibleYahouLabels(crowded, 30).size, 0, 'Distant labels should be hidden when zoomed out.');
assert.ok(visibleYahouLabels(crowded, 30, new Set([crowded[1].id])).has(crowded[1].id), 'Selected ID has label priority.');
const separated = crowded.map((node, i) => ({ ...node, x: i * 1000 }));
assert.equal(visibleYahouLabels(separated, 30, new Set(separated.map((node) => node.id))).size, 2, 'Every selected ID has label priority at low zoom.');
assert.equal(visibleYahouLabels(crowded.map((node, i) => ({ ...node, x: i * 250 })), 100).size, 2);
for (const palette of Object.values(YAHOU_OVERVIEW_PALETTES)) {
  const svg = exportYahouGraphSvg(specialGraph, specialGraph.nodes, palette);
  assert.equal((svg.match(/<circle /g) ?? []).length, specialGraph.nodes.length);
  assert.equal((svg.match(/<line /g) ?? []).length, specialGraph.links.length);
  assert.ok(svg.includes('&lt;script&gt;&amp;&quot;🚲'));
  assert.ok(!svg.includes('<script>'));
  assert.ok(svg.includes(palette.background));
  for (const member of specialGraph.nodes) assert.ok(svg.includes(`<title>${member.label.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char])}</title>`));
}
function luminance(color) {
  const c = color.slice(1).match(/../g).map((value) => parseInt(value, 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}
function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
for (const palette of Object.values(YAHOU_OVERVIEW_PALETTES)) {
  assert.ok(contrast(palette.text, palette.background) >= 4.5);
  assert.ok(contrast(palette.link, palette.background) >= 3);
  for (const color of [palette.root, ...Object.values(palette.nodes)]) assert.ok(contrast(color.stroke, palette.background) >= 3);
}
console.log(`Yahou force overview verification passed: ${data.nodes.length} members, ${graph.generations} generations; ancestor/neighbor highlighting, complete links, isolated data, force effects, drag/pause/disposal, label culling, SVG escaping and light/dark contrast.`);
