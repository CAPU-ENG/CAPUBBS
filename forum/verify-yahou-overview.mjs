import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildYahouIndex, parseYahouLineage } from './src/data/yahouLineage.ts';
import { layoutYahouOverview, YAHOU_LABEL_LINE_HEIGHT, zoomYahouViewBox } from './src/utils/yahouOverview.ts';

function verifyLayout(data) {
  const original = structuredClone(data);
  const layout = layoutYahouOverview(data);
  assert.deepEqual(data, original, 'Drawing the overview must not mutate shared lineage data.');
  assert.equal(layout.nodes.length, data.nodes.length + 1);
  assert.equal(new Set(layout.nodes.map((node) => node.id)).size, layout.nodes.length);
  assert.equal(layout.links.length, data.nodes.length);
  const index = buildYahouIndex(data);
  const byId = new Map(layout.nodes.map((node) => [node.id, node]));
  assert.equal(byId.get(null).label, '实践部');
  assert.equal(byId.get(null).generation, 0);
  for (const member of data.nodes) {
    const node = byId.get(member.id);
    assert.equal(node.label, member.id);
    assert.equal(node.parentId, member.parentId);
    assert.equal(node.status, member.status);
    assert.equal(node.generation, index.generations.get(member.id));
  }
  for (const { parent, child, path } of layout.links) {
    assert.equal(parent.id, index.members.get(child.id).parentId);
    assert.equal(parent.generation + 1, child.generation);
    assert.ok(parent.x + parent.width / 2 < child.x - child.width / 2, 'Descendants must appear to the right.');
    const coordinates = path.match(/^M ([-\d.]+) ([-\d.]+) H ([-\d.]+) V ([-\d.]+) H ([-\d.]+)$/);
    assert.ok(coordinates, 'Relationships use orthogonal connectors.');
    const [startX, startY, middleX, endY, endX] = coordinates.slice(1).map(Number);
    assert.equal(startX, parent.x + parent.width / 2);
    assert.equal(startY, parent.y);
    assert.equal(endX, child.x - child.width / 2);
    assert.equal(endY, child.y);
    assert.ok(startX < middleX && middleX < endX);
  }
  for (const [parentId, children] of index.children) {
    const parent = byId.get(parentId);
    const ordered = children.map((child) => byId.get(child.id));
    assert.equal(parent.y, (ordered[0].y + ordered.at(-1).y) / 2, 'Parents should be centered on their direct children.');
    for (let i = 1; i < ordered.length; i += 1) assert.ok(ordered[i].y > ordered[i - 1].y, 'Sibling order must remain stable.');
  }
  const generations = new Map();
  for (const node of layout.nodes) {
    assert.ok([node.x, node.y, node.width, node.height].every(Number.isFinite));
    assert.ok(node.width > 0 && node.height > 0);
    assert.ok(node.x - node.width / 2 >= layout.bounds.x);
    assert.ok(node.y - node.height / 2 >= layout.bounds.y);
    assert.ok(node.x + node.width / 2 <= layout.bounds.x + layout.bounds.width);
    assert.ok(node.y + node.height / 2 <= layout.bounds.y + layout.bounds.height);
    const size = node.fontSize;
    assert.ok(Number.isFinite(size) && size > 0 && size < node.height);
    assert.equal(node.labelLines.join(''), node.label, 'Wrapping must preserve the entire ID.');
    const sameGeneration = generations.get(node.generation);
    if (sameGeneration) {
      assert.equal(node.width, sameGeneration.width, 'A generation must have identical node widths.');
      assert.equal(node.height, sameGeneration.height, 'A generation must have identical node heights.');
      assert.equal(node.x, sameGeneration.x, 'A generation must align in one column.');
      assert.equal(size, sameGeneration.fontSize, 'A generation must have identical font sizes.');
    } else generations.set(node.generation, node);
    const halfWidth = Math.max(...node.labelLines.map((line) => [...new Intl.Segmenter('zh', { granularity: 'grapheme' }).segment(line)].length)) * size * 1.1 / 2;
    const halfHeight = node.labelLines.length * YAHOU_LABEL_LINE_HEIGHT / 2;
    assert.ok(halfWidth + 8 <= node.width / 2 && halfHeight + 8 <= node.height / 2, 'The full ID must fit inside its node with padding.');
  }
  for (let i = 0; i < layout.nodes.length; i += 1) {
    for (const other of layout.nodes.slice(i + 1)) {
      const node = layout.nodes[i];
      assert.ok(Math.abs(node.x - other.x) >= (node.width + other.width) / 2 + 16
        || Math.abs(node.y - other.y) >= (node.height + other.height) / 2 + 16,
      `Nodes and their ID labels must not overlap: ${node.label}, ${other.label}`);
    }
  }
  assert.deepEqual(layoutYahouOverview(data), layout, 'The static overview should be deterministic.');
  return layout;
}

const data = parseYahouLineage(JSON.parse(await readFile(new URL('./data/yahou-lineage.json', import.meta.url), 'utf8')));
const layout = verifyLayout(data);
const fixture = parseYahouLineage({
  schemaVersion: 1, revision: 1, root: '实践部',
  nodes: [
    { id: 'yahou:root', parentId: null, status: 'qualified' },
    { id: '__proto__', parentId: 'yahou:root', status: 'qualified' },
    { id: '0', parentId: '__proto__', status: 'passed' },
    { id: '实践部', parentId: 'yahou:root', status: 'pending' },
    { id: '含有 <>& 字符的很长很长的会员 ID', parentId: 'yahou:root', status: 'pending' },
  ],
});
const before = verifyLayout(fixture);
const corrected = structuredClone(fixture);
corrected.nodes[2].parentId = 'yahou:root';
const after = verifyLayout(corrected);
assert.notDeepEqual(after.nodes, before.nodes, 'Manual relationship corrections must update the layout even at the same member count.');
verifyLayout({ ...fixture, nodes: [] });
verifyLayout({ ...fixture, nodes: Array.from({ length: 100 }, (_, i) => ({ id: `chain-${i}`, parentId: i ? `chain-${i - 1}` : null, status: 'qualified' })) });
verifyLayout({ ...fixture, nodes: Array.from({ length: 100 }, (_, i) => ({ id: `sibling-${i}`, parentId: null, status: 'passed' })) });
verifyLayout({
  ...fixture,
  nodes: [
    { id: '大家庭', parentId: null, status: 'qualified' },
    { id: '小家庭', parentId: null, status: 'passed' },
    ...Array.from({ length: 80 }, (_, i) => ({ id: `孩子-${i}`, parentId: '大家庭', status: 'passed' })),
    { id: '长 ID 与 e\u0301 🚲 均完整保留而且不能丢字', parentId: '大家庭', status: 'pending' },
  ],
});

const bounds = layout.bounds;
const anchor = { x: bounds.x + bounds.width * 0.25, y: bounds.y + bounds.height * 0.7 };
const zoomed = zoomYahouViewBox(bounds, bounds, 0.5, anchor);
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
close((anchor.x - zoomed.x) / zoomed.width, 0.25);
close((anchor.y - zoomed.y) / zoomed.height, 0.7);
close(zoomed.width / zoomed.height, bounds.width / bounds.height);
const restored = zoomYahouViewBox(zoomed, bounds, 2, anchor);
for (const key of ['x', 'y', 'width', 'height']) close(restored[key], bounds[key]);
close(zoomYahouViewBox(bounds, bounds, 0.0001).width, bounds.width / 64);
close(zoomYahouViewBox(bounds, bounds, 100).width, bounds.width);

console.log(`Yahou horizontal overview verification passed: ${data.nodes.length} members, ${layout.generations} generations; aligned columns, centered parents, stable family order, orthogonal links, equal node sizes, no label collisions, and anchored zoom.`);
