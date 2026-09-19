import { CactusLayout } from 'cactuz/core';
import { buildYahouIndex, type YahouLineage, type YahouStatus } from '../data/yahouLineage.ts';

export type YahouOverviewNode = {
  id: string | null;
  parentId: string | null;
  label: string;
  labelLines: string[];
  fontSize: number;
  status: YahouStatus | null;
  generation: number;
  radius: number;
  x: number;
  y: number;
};

export type YahouViewBox = { x: number; y: number; width: number; height: number };
export type YahouOverviewLayout = {
  nodes: YahouOverviewNode[];
  links: Array<{ parent: YahouOverviewNode; child: YahouOverviewNode }>;
  bounds: YahouViewBox;
  generations: number;
};

const ROOT_KEY = 'yahou:root';
const memberKey = (id: string) => `yahou:member:${id}`;
const NODE_GAP = 6;
const LABEL_LINE_HEIGHT = 1.2;

function generationRadius(generation: number) {
  return generation === 0 ? 46 : Math.max(18, 36 * 0.96 ** (generation - 1));
}

function wrapLabel(label: string) {
  const characters = Array.from(new Intl.Segmenter('zh', { granularity: 'grapheme' }).segment(label), (part) => part.segment);
  const lines: string[] = [];
  for (let offset = 0; offset < characters.length; offset += 6) lines.push(characters.slice(offset, offset + 6).join(''));
  return lines;
}

/** A spatial index keeps collision checks local, including for large families. */
class CircleIndex {
  private cells = new Map<string, YahouOverviewNode[]>();
  private cellSize: number;

  constructor(cellSize: number) { this.cellSize = cellSize; }

  add(node: YahouOverviewNode) {
    const key = `${Math.floor(node.x / this.cellSize)},${Math.floor(node.y / this.cellSize)}`;
    const cell = this.cells.get(key) ?? [];
    cell.push(node);
    this.cells.set(key, cell);
  }

  neighbors(node: YahouOverviewNode) {
    const column = Math.floor(node.x / this.cellSize);
    const row = Math.floor(node.y / this.cellSize);
    const result: YahouOverviewNode[] = [];
    for (let x = column - 1; x <= column + 1; x += 1) {
      for (let y = row - 1; y <= row + 1; y += 1) result.push(...(this.cells.get(`${x},${y}`) ?? []));
    }
    return result;
  }
}

function separateNodes(nodes: YahouOverviewNode[]) {
  // A little slack prevents rounding-sized contacts from displacing a label
  // outside a tightly packed family during the final exact pass.
  const relaxationGap = NODE_GAP + 2;
  const cellSize = 2 * Math.max(...nodes.map((node) => node.radius)) + relaxationGap;
  const order = new Map(nodes.map((node, position) => [node, position]));
  // Relax the cactuz positions before drawing; the graph never animates. The
  // institutional root stays fixed and nearby branches retain their direction.
  for (let pass = 0; pass < 600; pass += 1) {
    const grid = new CircleIndex(cellSize);
    for (const node of nodes) grid.add(node);
    let largestOverlap = 0;
    for (const node of nodes) {
      for (const other of grid.neighbors(node)) {
        if (order.get(other)! <= order.get(node)!) continue;
        let dx = other.x - node.x;
        let dy = other.y - node.y;
        const distance = Math.hypot(dx, dy);
        const overlap = node.radius + other.radius + relaxationGap - distance;
        if (overlap <= 0.01) continue;
        largestOverlap = Math.max(largestOverlap, overlap);
        if (distance < 0.0001) {
          const angle = (order.get(other)! + order.get(node)!) * 2.399963229728653;
          dx = Math.cos(angle);
          dy = Math.sin(angle);
        } else {
          dx /= distance;
          dy /= distance;
        }
        const shift = overlap + 0.02;
        const share = node.id === null ? 0 : 0.5;
        node.x -= dx * shift * share;
        node.y -= dy * shift * share;
        other.x += dx * shift * (1 - share);
        other.y += dy * shift * (1 - share);
      }
    }
    if (largestOverlap <= 0.01) break;
  }
  // Clear remaining contacts by searching nearby free positions. A bounded
  // spiral avoids pushing crowded IDs into distant rows across other branches.
  const placed = new CircleIndex(cellSize);
  let right = -Infinity;
  for (const node of nodes) {
    const origin = { x: node.x, y: node.y };
    for (let attempt = 0; ; attempt += 1) {
      const collision = placed.neighbors(node).some((other) =>
        Math.hypot(node.x - other.x, node.y - other.y) < node.radius + other.radius + NODE_GAP);
      if (!collision) break;
      if (attempt === 4096) {
        // Guaranteed free space even for an unusually dense manually edited tree.
        node.x = right + node.radius + NODE_GAP + 0.01;
        node.y = origin.y;
        break;
      }
      const distance = NODE_GAP * Math.sqrt(attempt + 1);
      const angle = attempt * 2.399963229728653;
      node.x = origin.x + distance * Math.cos(angle);
      node.y = origin.y + distance * Math.sin(angle);
    }
    placed.add(node);
    right = Math.max(right, node.x + node.radius);
  }
}

/** Keep cactuz's branch arrangement, with equal generation sizes and clear IDs. */
export function layoutYahouOverview(data: YahouLineage): YahouOverviewLayout {
  buildYahouIndex(data);
  const members = new Map(data.nodes.map((member) => [memberKey(member.id), member]));
  // Cactuz attaches children/parent references to its input. Never give it the
  // shared JSON objects, and namespace IDs so a member cannot collide with root.
  const input = [
    { id: ROOT_KEY, name: data.root, parent: null as string | null },
    ...data.nodes.map((member) => ({
      id: memberKey(member.id), name: member.id,
      parent: member.parentId === null ? ROOT_KEY : memberKey(member.parentId),
    })),
  ];
  // A fresh instance avoids the library's coarse shared-cache key retaining an
  // old hierarchy when manual corrections keep the same number of members.
  const cactus = new CactusLayout(1600, 1000, 1, 0, 5 * Math.PI / 4, 0.5);
  const positions = cactus.render(input, 800, 500, Math.PI / 2);
  const nodes: YahouOverviewNode[] = positions.map((position) => {
    const isRoot = position.node.id === ROOT_KEY;
    const member = members.get(String(position.node.id));
    if (!isRoot && !member) throw new Error('谱系总览中存在未知 ID。');
    const id = member?.id ?? null;
    const label = id ?? data.root;
    return {
      id, parentId: member?.parentId ?? null, label, labelLines: wrapLabel(label), fontSize: 0,
      status: member?.status ?? null, generation: position.depth,
      radius: generationRadius(position.depth), x: position.x * 1.8, y: position.y * 1.8,
    };
  });
  if (nodes.length !== data.nodes.length + 1 || nodes.some((node) =>
    !Number.isFinite(node.x) || !Number.isFinite(node.y) || !Number.isFinite(node.radius) || node.radius <= 0)) {
    throw new Error('谱系总览布局生成失败。');
  }
  nodes.sort((a, b) => a.generation - b.generation);
  // Use the same font size throughout a generation. Text stays inside an
  // inscribed rectangle (including multi-line IDs), so separated circles also
  // separate their labels. A conservative full-em character width leaves room
  // for different local fonts without measuring text in a browser.
  const fonts = new Map<number, number>();
  for (const node of nodes) {
    const fontSize = Math.min(node.radius * 0.23, node.radius * 1.05 / (node.labelLines.length * LABEL_LINE_HEIGHT));
    fonts.set(node.generation, Math.min(fonts.get(node.generation) ?? Infinity, fontSize));
  }
  for (const node of nodes) node.fontSize = fonts.get(node.generation)!;
  separateNodes(nodes);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const links = nodes.filter((node) => node.id !== null).map((child) => ({ parent: byId.get(child.parentId)!, child }));
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  let generations = 0;
  for (const node of nodes) {
    left = Math.min(left, node.x - node.radius);
    top = Math.min(top, node.y - node.radius);
    right = Math.max(right, node.x + node.radius);
    bottom = Math.max(bottom, node.y + node.radius);
    generations = Math.max(generations, node.generation);
  }
  const padding = Math.max(24, Math.max(right - left, bottom - top) * 0.025);
  return {
    nodes, links, generations,
    bounds: { x: left - padding, y: top - padding, width: right - left + padding * 2, height: bottom - top + padding * 2 },
  };
}

export function zoomYahouViewBox(view: YahouViewBox, bounds: YahouViewBox, factor: number, anchor?: { x: number; y: number }): YahouViewBox {
  const width = Math.max(bounds.width / 64, Math.min(bounds.width, view.width * factor));
  const scale = width / view.width;
  const point = anchor ?? { x: view.x + view.width / 2, y: view.y + view.height / 2 };
  return { x: point.x + (view.x - point.x) * scale, y: point.y + (view.y - point.y) * scale, width, height: view.height * scale };
}
