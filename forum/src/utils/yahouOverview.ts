import { CactusLayout } from 'cactuz/core';
import { buildYahouIndex, type YahouLineage, type YahouStatus } from '../data/yahouLineage.ts';

export type YahouOverviewNode = {
  id: string | null;
  parentId: string | null;
  label: string;
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

/** Use cactuz's positioning alone; the result is a fixed, locally rendered SVG. */
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
  const cactus = new CactusLayout(1600, 1000, 1, 0.5, 5 * Math.PI / 4, 0.75);
  const positions = cactus.render(input, 800, 500, Math.PI / 2);
  const nodes: YahouOverviewNode[] = positions.map((position) => {
    const isRoot = position.node.id === ROOT_KEY;
    const member = members.get(String(position.node.id));
    if (!isRoot && !member) throw new Error('谱系总览中存在未知 ID。');
    const id = member?.id ?? null;
    return {
      id, parentId: member?.parentId ?? null, label: id ?? data.root,
      status: member?.status ?? null, generation: position.depth,
      radius: position.radius, x: position.x, y: position.y,
    };
  });
  if (nodes.length !== data.nodes.length + 1 || nodes.some((node) =>
    !Number.isFinite(node.x) || !Number.isFinite(node.y) || !Number.isFinite(node.radius) || node.radius <= 0)) {
    throw new Error('谱系总览布局生成失败。');
  }
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
    nodes: [...nodes].sort((a, b) => a.generation - b.generation), links, generations,
    bounds: { x: left - padding, y: top - padding, width: right - left + padding * 2, height: bottom - top + padding * 2 },
  };
}

export function yahouOverviewFontSize(node: YahouOverviewNode) {
  const units = [...node.label].reduce((total, character) => total + (character.codePointAt(0)! <= 0xff ? 0.65 : 1), 0);
  return Math.min(node.id === null ? 36 : 22, node.radius * 0.7, node.radius * 1.65 / Math.max(1, units));
}

export function zoomYahouViewBox(view: YahouViewBox, bounds: YahouViewBox, factor: number, anchor?: { x: number; y: number }): YahouViewBox {
  const width = Math.max(bounds.width / 64, Math.min(bounds.width, view.width * factor));
  const scale = width / view.width;
  const point = anchor ?? { x: view.x + view.width / 2, y: view.y + view.height / 2 };
  return { x: point.x + (view.x - point.x) * scale, y: point.y + (view.y - point.y) * scale, width, height: view.height * scale };
}
