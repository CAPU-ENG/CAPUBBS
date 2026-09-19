import { buildYahouIndex, type YahouLineage, type YahouStatus } from '../data/yahouLineage.ts';

export type YahouOverviewNode = {
  id: string | null;
  parentId: string | null;
  label: string;
  labelLines: string[];
  fontSize: number;
  status: YahouStatus | null;
  generation: number;
  width: number;
  height: number;
  x: number;
  y: number;
};

export type YahouViewBox = { x: number; y: number; width: number; height: number };
export type YahouOverviewLayout = {
  nodes: YahouOverviewNode[];
  links: Array<{ parent: YahouOverviewNode; child: YahouOverviewNode; path: string }>;
  bounds: YahouViewBox;
  generations: number;
};

export const YAHOU_LABEL_LINE_HEIGHT = 18;
const NODE_WIDTH = 168;
const COLUMN_GAP = 56;
const ROW_GAP = 16;
const FONT_SIZE = 13;
const LABEL_COLUMNS = 10;
const segmenter = new Intl.Segmenter('zh', { granularity: 'grapheme' });

function wrapLabel(label: string) {
  const characters = Array.from(segmenter.segment(label), (part) => part.segment);
  const lines: string[] = [];
  for (let offset = 0; offset < characters.length; offset += LABEL_COLUMNS) {
    lines.push(characters.slice(offset, offset + LABEL_COLUMNS).join(''));
  }
  return lines;
}

/** A tidy left-to-right tree: generations share columns, families keep their order. */
export function layoutYahouOverview(data: YahouLineage): YahouOverviewLayout {
  const index = buildYahouIndex(data);
  const makeNode = (id: string | null): YahouOverviewNode => {
    const member = id === null ? undefined : index.members.get(id)!;
    const generation = id === null ? 0 : index.generations.get(id)!;
    const label = id ?? data.root;
    return {
      id, parentId: member?.parentId ?? null, label, labelLines: wrapLabel(label), fontSize: FONT_SIZE,
      status: member?.status ?? null, generation,
      width: NODE_WIDTH, height: 36, x: generation * (NODE_WIDTH + COLUMN_GAP), y: 0,
    };
  };
  const nodes = [makeNode(null)];
  // Breadth-first order also gives an iterative postorder when reversed. Long
  // chains therefore do not consume the JavaScript call stack.
  for (let cursor = 0; cursor < nodes.length; cursor += 1) {
    for (const child of index.children.get(nodes[cursor].id) ?? []) nodes.push(makeNode(child.id));
  }
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const heights = new Map<number, number>();
  for (const node of nodes) {
    heights.set(node.generation, Math.max(heights.get(node.generation) ?? 36, node.labelLines.length * YAHOU_LABEL_LINE_HEIGHT + 16));
  }
  for (const node of nodes) node.height = heights.get(node.generation)!;

  // Compare subtree contours at each generation instead of reserving an entire
  // rectangular area for every family. Empty rows can be reused without making
  // nodes overlap, while parents remain centered on their direct children.
  type Contour = { top: number[]; bottom: number[] };
  const contours = new Map<string | null, Contour>();
  const offsets = new Map<string, number>();
  for (let cursor = nodes.length - 1; cursor >= 0; cursor -= 1) {
    const node = nodes[cursor];
    const children = index.children.get(node.id) ?? [];
    const top: number[] = [];
    const bottom: number[] = [];
    for (const child of children) {
      const contour = contours.get(child.id)!;
      let offset = 0;
      for (let depth = 0; depth < Math.min(bottom.length, contour.top.length); depth += 1) {
        offset = Math.max(offset, bottom[depth] + ROW_GAP - contour.top[depth]);
      }
      offsets.set(child.id, offset);
      for (let depth = 0; depth < contour.top.length; depth += 1) {
        top[depth] = Math.min(top[depth] ?? Infinity, contour.top[depth] + offset);
        bottom[depth] = Math.max(bottom[depth] ?? -Infinity, contour.bottom[depth] + offset);
      }
      contours.delete(child.id);
    }
    const center = children.length ? (offsets.get(children[0].id)! + offsets.get(children[children.length - 1].id)!) / 2 : 0;
    for (const child of children) offsets.set(child.id, offsets.get(child.id)! - center);
    contours.set(node.id, {
      top: [-node.height / 2, ...top.map((value) => value - center)],
      bottom: [node.height / 2, ...bottom.map((value) => value - center)],
    });
  }
  for (const node of nodes) {
    if (node.id !== null) node.y = byId.get(node.parentId)!.y + offsets.get(node.id)!;
  }
  const links = nodes.filter((node) => node.id !== null).map((child) => {
    const parent = byId.get(child.parentId)!;
    const startX = parent.x + parent.width / 2;
    const endX = child.x - child.width / 2;
    return { parent, child, path: `M ${startX} ${parent.y} H ${(startX + endX) / 2} V ${child.y} H ${endX}` };
  });
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  let generations = 0;
  for (const node of nodes) {
    left = Math.min(left, node.x - node.width / 2);
    top = Math.min(top, node.y - node.height / 2);
    right = Math.max(right, node.x + node.width / 2);
    bottom = Math.max(bottom, node.y + node.height / 2);
    generations = Math.max(generations, node.generation);
  }
  return {
    nodes, links, generations,
    bounds: { x: left - 32, y: top - 32, width: right - left + 64, height: bottom - top + 64 },
  };
}

export function zoomYahouViewBox(view: YahouViewBox, bounds: YahouViewBox, factor: number, anchor?: { x: number; y: number }): YahouViewBox {
  const width = Math.max(bounds.width / 64, Math.min(bounds.width, view.width * factor));
  const scale = width / view.width;
  const point = anchor ?? { x: view.x + view.width / 2, y: view.y + view.height / 2 };
  return { x: point.x + (view.x - point.x) * scale, y: point.y + (view.y - point.y) * scale, width, height: view.height * scale };
}
