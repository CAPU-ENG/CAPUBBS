export const YAHOU_STATUSES = ['pending', 'passed', 'qualified'] as const;
export type YahouStatus = typeof YAHOU_STATUSES[number];

export const YAHOU_STATUS_LABELS: Record<YahouStatus, string> = {
  pending: '未过押后',
  passed: '已过押后',
  qualified: '具备收徒资格',
};

export type YahouMember = { id: string; parentId: string | null; status: YahouStatus };
export type YahouLineage = {
  schemaVersion: 1;
  revision: number;
  root: '实践部';
  nodes: YahouMember[];
};

export type YahouMutation =
  | { action: 'add'; id: string; parentId: string | null; status: YahouStatus }
  | { action: 'status'; id: string; status: YahouStatus };

export type YahouIndex = {
  members: Map<string, YahouMember>;
  children: Map<string | null, YahouMember[]>;
  descendants: Map<string, number>;
  generations: Map<string, number>;
};

/** Validate before rendering: manually maintained files may contain broken links. */
export function parseYahouLineage(value: unknown): YahouLineage {
  if (!value || typeof value !== 'object') throw new Error('押后谱系数据格式错误。');
  const data = value as Record<string, unknown>;
  if (data.schemaVersion !== 1 || data.root !== '实践部'
    || !Number.isSafeInteger(data.revision) || Number(data.revision) < 1
    || !Array.isArray(data.nodes) || data.nodes.length > 20000) {
    throw new Error('押后谱系数据格式错误。');
  }
  const seen = new Set<string>();
  const nodes = data.nodes.map((item: unknown): YahouMember => {
    if (!item || typeof item !== 'object') throw new Error('谱系中存在无效 ID。');
    const node = item as Record<string, unknown>;
    if (typeof node.id !== 'string' || !node.id.trim() || node.id.trim() !== node.id
      || new TextEncoder().encode(node.id).length > 400 || /[\u0000-\u001f\u007f]/.test(node.id)
      || (node.parentId !== null && typeof node.parentId !== 'string')
      || !YAHOU_STATUSES.includes(node.status as YahouStatus) || seen.has(node.id)) {
      throw new Error('谱系中存在无效或重复的 ID。');
    }
    seen.add(node.id);
    return { id: node.id, parentId: node.parentId as string | null, status: node.status as YahouStatus };
  });
  const document: YahouLineage = { schemaVersion: 1, revision: Number(data.revision), root: '实践部', nodes };
  buildYahouIndex(document);
  return document;
}

export function buildYahouIndex(data: YahouLineage): YahouIndex {
  const members = new Map(data.nodes.map((node) => [node.id, node]));
  const children = new Map<string | null, YahouMember[]>();
  const generations = new Map<string, number>();
  const descendants = new Map<string, number>();
  for (const member of data.nodes) {
    if (member.parentId !== null) {
      const parent = members.get(member.parentId);
      if (!parent) throw new Error(`找不到 ${member.id} 的师傅。`);
      if (parent.status !== 'qualified') throw new Error(`${parent.id} 已有后代，必须具备收徒资格。`);
    }
    const siblings = children.get(member.parentId) ?? [];
    siblings.push(member);
    children.set(member.parentId, siblings);
  }
  // Breadth-first traversal also detects cycles and disconnected components.
  const ordered = [...(children.get(null) ?? [])];
  for (const root of ordered) generations.set(root.id, 1);
  for (let cursor = 0; cursor < ordered.length; cursor += 1) {
    const member = ordered[cursor];
    for (const child of children.get(member.id) ?? []) {
      generations.set(child.id, (generations.get(member.id) ?? 0) + 1);
      ordered.push(child);
    }
  }
  if (ordered.length !== members.size) throw new Error('师徒关系存在循环或重复 ID。');
  for (let cursor = ordered.length - 1; cursor >= 0; cursor -= 1) {
    const member = ordered[cursor];
    descendants.set(member.id, (children.get(member.id) ?? [])
      .reduce((count, child) => count + 1 + (descendants.get(child.id) ?? 0), 0));
  }
  return { members, children, descendants, generations };
}

export function yahouAncestors(index: YahouIndex, id: string): YahouMember[] {
  const result: YahouMember[] = [];
  let member = index.members.get(id);
  while (member) {
    result.push(member);
    member = member.parentId === null ? undefined : index.members.get(member.parentId);
  }
  return result.reverse();
}

export function findYahouMembers(index: YahouIndex, query: string): YahouMember[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  return [...index.members.values()]
    .filter((member) => member.id.toLocaleLowerCase().includes(normalized))
    .sort((left, right) => Number(right.id.toLocaleLowerCase() === normalized)
      - Number(left.id.toLocaleLowerCase() === normalized));
}
