import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type SimulationNodeDatum } from 'd3-force';
import { buildYahouIndex, type YahouLineage, type YahouStatus } from '../data/yahouLineage.ts';
import type { YahouOverviewPalette } from './yahouOverviewTheme.ts';

export const YAHOU_GRAPH_ROOT = 'yahou:root';
export const yahouGraphId = (id: string) => `member:${id}`;
export type YahouGraphNode = SimulationNodeDatum & {
  id: string; label: string; parentId: string | null; status: YahouStatus | null;
  generation: number; radius: number; x: number; y: number;
};
export type YahouGraph = {
  nodes: YahouGraphNode[];
  links: Array<{ id: string; source: string; target: string }>;
  generations: number;
};
export const YAHOU_FORCE_CONTROLS = [
  { key: 'center', label: '中心力', min: 0, max: 100, step: 1 },
  { key: 'repulsion', label: '排斥力', min: 0, max: 100, step: 1 },
  { key: 'elasticity', label: '连线力度', min: 0, max: 100, step: 1 },
  { key: 'distance', label: '连线长度', min: 30, max: 240, step: 5 },
] as const;
export type YahouForceSettings = Record<typeof YAHOU_FORCE_CONTROLS[number]['key'], number>;
export const DEFAULT_YAHOU_FORCES: YahouForceSettings = { center: 12, repulsion: 35, elasticity: 65, distance: 90 };

export function buildYahouGraph(data: YahouLineage): YahouGraph {
  const index = buildYahouIndex(data);
  const generations = Math.max(0, ...index.generations.values());
  const nodes: YahouGraphNode[] = [{ id: YAHOU_GRAPH_ROOT, label: data.root, parentId: null, status: null, generation: 0, radius: 22, x: 0, y: 0 }];
  const sectors = new Map<string | null, { start: number; end: number }>([[null, { start: 0, end: Math.PI * 2 }]]);
  // Seed related branches in adjacent sectors before allowing the forces to settle.
  const parents: Array<string | null> = [null];
  for (let cursor = 0; cursor < parents.length; cursor += 1) {
    const parentId = parents[cursor];
    const sector = sectors.get(parentId)!;
    const children = index.children.get(parentId) ?? [];
    const total = children.reduce((sum, child) => sum + 1 + index.descendants.get(child.id)!, 0);
    let start = sector.start;
    for (const child of children) {
      const end = start + (sector.end - sector.start) * (1 + index.descendants.get(child.id)!) / total;
      const generation = index.generations.get(child.id)!;
      const angle = (start + end) / 2;
      nodes.push({ id: yahouGraphId(child.id), label: child.id, parentId, status: child.status, generation,
        radius: 7 + 9 * (1 - generation / Math.max(1, generations)),
        x: Math.cos(angle) * generation * 110, y: Math.sin(angle) * generation * 110 });
      sectors.set(child.id, { start, end });
      parents.push(child.id);
      start = end;
    }
  }
  return { nodes, generations, links: data.nodes.map((node) => ({ id: `link:${node.id}`, source: node.parentId === null ? YAHOU_GRAPH_ROOT : yahouGraphId(node.parentId), target: yahouGraphId(node.id) })) };
}

export function getYahouHighlight(graph: YahouGraph, selected: ReadonlySet<string>) {
  const selectedIds = new Set(graph.nodes.filter((node) => selected.has(node.id)).map((node) => node.id));
  const nodeIds = new Set(selectedIds);
  const linkIds = new Set<string>();
  if (!selectedIds.size) return { nodeIds, linkIds };
  const parents = new Map(graph.links.map((link) => [link.target, link]));
  // Include each selected member's immediate children and complete ancestry.
  for (const link of graph.links) if (selectedIds.has(link.source)) {
    nodeIds.add(link.target);
    linkIds.add(link.id);
  }
  const traced = new Set<string>();
  for (const id of selectedIds) {
    let current = id;
    while (current !== YAHOU_GRAPH_ROOT && !traced.has(current)) {
      traced.add(current);
      const link = parents.get(current);
      if (!link) break;
      linkIds.add(link.id);
      nodeIds.add(link.source);
      current = link.source;
    }
  }
  return { nodeIds, linkIds };
}

/** D3 mutates nodes and links; only disposable presentation copies enter the simulation. */
export function createYahouSimulation(graph: YahouGraph, settings = DEFAULT_YAHOU_FORCES) {
  const nodes = graph.nodes.map((node) => ({ ...node }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const links = forceLink<YahouGraphNode, { source: string | YahouGraphNode; target: string | YahouGraphNode }>(graph.links.map((link) => ({ ...link }))).id((node) => node.id);
  const charge = forceManyBody<YahouGraphNode>().distanceMax(1800);
  const centerX = forceX<YahouGraphNode>(0);
  const centerY = forceY<YahouGraphNode>(0);
  const simulation = forceSimulation(nodes).stop().velocityDecay(0.5).alphaTarget(0.035)
    .force('links', links).force('repulsion', charge).force('centerX', centerX).force('centerY', centerY)
    .force('collision', forceCollide<YahouGraphNode>((node) => node.radius + 12).iterations(2));
  let running = false;
  let disposed = false;
  let rootPinned = true;
  const dragging = new Set<string>();
  function configure(next: YahouForceSettings) {
    const clamped = { ...next };
    for (const control of YAHOU_FORCE_CONTROLS) {
      const value = next[control.key];
      clamped[control.key] = Number.isFinite(value) ? Math.max(control.min, Math.min(control.max, value)) : DEFAULT_YAHOU_FORCES[control.key];
    }
    centerX.strength(clamped.center * 0.0003);
    centerY.strength(clamped.center * 0.0003);
    charge.strength(-clamped.repulsion * 8);
    links.distance(clamped.distance).strength(clamped.elasticity / 100);
    simulation.alpha(0.6);
  }
  function pinRoot(pinned: boolean) {
    rootPinned = pinned;
    const root = byId.get(YAHOU_GRAPH_ROOT)!;
    root.fx = pinned ? root.x : null;
    root.fy = pinned ? root.y : null;
  }
  configure(settings);
  pinRoot(true);
  return {
    nodes, byId, simulation, configure, pinRoot,
    run(value: boolean) {
      if (disposed) return;
      running = value;
      if (value) simulation.alpha(Math.max(0.25, simulation.alpha())).restart();
      else simulation.stop();
    },
    drag(id: string, x: number, y: number) {
      const node = byId.get(id);
      if (!node || !Number.isFinite(x) || !Number.isFinite(y) || disposed) return;
      dragging.add(id);
      node.x = node.fx = x; node.y = node.fy = y;
      node.vx = node.vy = 0;
      if (running) simulation.alpha(0.3);
    },
    release(id: string) {
      const node = byId.get(id);
      dragging.delete(id);
      if (node && !(rootPinned && id === YAHOU_GRAPH_ROOT)) { node.fx = null; node.fy = null; }
    },
    releaseAll() { for (const id of dragging) this.release(id); },
    dispose() { disposed = true; running = false; simulation.stop().on('tick', null); },
  };
}
export type YahouSimulation = ReturnType<typeof createYahouSimulation>;

// Label rectangles are measured conservatively in screen pixels, independent of zoom.
export function visibleYahouLabels(nodes: YahouGraphNode[], zoom: number, focus: ReadonlySet<string> = new Set()): Set<string> {
  const scale = Math.max(0.02, zoom / 100);
  const occupied: Array<{ x: number; y: number; w: number }> = [];
  const result = new Set<string>();
  const ordered = [...nodes].sort((a, b) => Number(focus.has(b.id)) - Number(focus.has(a.id)) || a.generation - b.generation);
  for (const node of ordered) {
    if (zoom < 55 && node.generation > 2 && !focus.has(node.id)) continue;
    const box = { x: node.x * scale, y: (node.y + node.radius) * scale + 7, w: Math.min(156, [...node.label].length * 14) + 12 };
    if (occupied.some((other) => Math.abs(other.x - box.x) < (other.w + box.w) / 2 && Math.abs(other.y - box.y) < 22)) continue;
    occupied.push(box);
    result.add(node.id);
  }
  return result;
}

const escapeXml = (text: string) => text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);
export function exportYahouGraphSvg(graph: YahouGraph, nodes: YahouGraphNode[], palette: YahouOverviewPalette): string {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const minX = Math.min(...nodes.map((node) => node.x - 100)) - 24;
  const minY = Math.min(...nodes.map((node) => node.y - node.radius)) - 24;
  const width = Math.max(...nodes.map((node) => node.x + 100)) - minX + 24;
  const height = Math.max(...nodes.map((node) => node.y + node.radius + 30)) - minY + 24;
  const labels = visibleYahouLabels(nodes, 100);
  const lines = graph.links.map((link) => {
    const from = byId.get(link.source)!; const to = byId.get(link.target)!;
    return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"/>`;
  }).join('');
  const circles = nodes.map((node) => {
    const color = node.status === null ? palette.root.stroke : palette.nodes[node.status].stroke;
    const shortLabel = [...node.label].length > 11 ? [...node.label].slice(0, 10).join('') + '…' : node.label;
    return `<g><title>${escapeXml(node.label)}</title><circle cx="${node.x}" cy="${node.y}" r="${node.radius}" fill="${color}"/>${labels.has(node.id) ? `<text x="${node.x}" y="${node.y + node.radius + 18}">${escapeXml(shortLabel)}</text>` : ''}</g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${Math.ceil(width)}" height="${Math.ceil(height)}"><title>押后谱系总览</title><rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="${palette.background}"/><g stroke="${palette.link}" stroke-width="1" opacity="0.6">${lines}</g><g fill="${palette.text}" font-size="13" font-family="sans-serif" text-anchor="middle">${circles}</g></svg>`;
}
