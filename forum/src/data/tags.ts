export type UserTag = {
  addedAt?: string;
  displayOrder?: number;
  id: string;
  name: string;
  color: string;
};

export type TagDefinition = UserTag & {
  description?: string;
};

export type UserTagAssignments = Record<string, Record<string, string>>;

const TAG_DEFINITIONS_KEY = 'capubbs-tag-definitions';
const USER_TAGS_KEY = 'capubbs-user-tags';

export const defaultTagDefinitions: TagDefinition[] = [
  { id: 'rider', name: '骑行达人', color: '#287a52' },
  { id: 'organizer', name: '活动组织者', color: '#bd6b2d' },
  { id: 'contributor', name: '技术贡献', color: '#3569a8' },
  { id: 'newcomer', name: '新晋会员', color: '#69747c' },
];

const defaultUserTagAssignments: UserTagAssignments = {
  阿北: { rider: '2026-08-18T09:20:00+08:00', organizer: '2026-08-19T14:05:00+08:00' },
  蓝色车架: { rider: '2026-08-10T11:30:00+08:00', contributor: '2026-08-15T16:40:00+08:00' },
  小白杨: { newcomer: '2026-08-20T08:15:00+08:00' },
  南门修车铺: { contributor: '2026-07-28T19:10:00+08:00' },
  小林: { rider: '2026-08-12T10:05:00+08:00', newcomer: '2026-08-12T10:05:00+08:00' },
};

export function readTagDefinitions(): TagDefinition[] {
  if (typeof window === 'undefined') return defaultTagDefinitions;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TAG_DEFINITIONS_KEY) ?? 'null');
    if (!Array.isArray(parsed)) return defaultTagDefinitions;
    const valid = parsed.filter(isTagDefinition);
    return valid.length > 0 ? valid : defaultTagDefinitions;
  } catch {
    return defaultTagDefinitions;
  }
}

export function writeTagDefinitions(definitions: TagDefinition[]) {
  try {
    window.localStorage.setItem(TAG_DEFINITIONS_KEY, JSON.stringify(definitions));
  } catch {
    // Local persistence is optional when storage is unavailable.
  }
}

export function readUserTagAssignments(): UserTagAssignments {
  if (typeof window === 'undefined') return defaultUserTagAssignments;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(USER_TAGS_KEY) ?? 'null');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return defaultUserTagAssignments;
    const assignments: UserTagAssignments = {};
    Object.entries(parsed).forEach(([username, value]) => {
      if (Array.isArray(value)) {
        assignments[username] = Object.fromEntries(
          value.filter((id): id is string => typeof id === 'string').map((id) => [id, new Date().toISOString()]),
        );
        return;
      }
      if (!value || typeof value !== 'object' || Array.isArray(value)) return;
      assignments[username] = Object.fromEntries(
        Object.entries(value)
          .filter((entry): entry is [string, string | number] => typeof entry[1] === 'string' || typeof entry[1] === 'number')
          .map(([id, addedAt]) => [id, String(addedAt)]),
      );
    });
    return Object.keys(assignments).length > 0 ? assignments : defaultUserTagAssignments;
  } catch {
    return defaultUserTagAssignments;
  }
}

export function writeUserTagAssignments(assignments: UserTagAssignments) {
  try {
    window.localStorage.setItem(USER_TAGS_KEY, JSON.stringify(assignments));
  } catch {
    // Local persistence is optional when storage is unavailable.
  }
}

export function getTagsForUser(username: string, definitions = readTagDefinitions()): UserTag[] {
  const assignments = readUserTagAssignments()[username] ?? {};
  return Object.entries(assignments)
    .map(([id, addedAt]) => {
      const definition = definitions.find((tag) => tag.id === id);
      return definition ? { ...definition, addedAt } : null;
    })
    .filter((tag): tag is TagDefinition & { addedAt: string } => Boolean(tag));
}

export function getDisplayedTags(tags: UserTag[]): UserTag[] {
  return tags
    .filter((tag) => tag.displayOrder === 1 || tag.displayOrder === 2)
    .sort((left, right) => left.displayOrder! - right.displayOrder!)
    .slice(0, 2);
}

function isTagDefinition(value: unknown): value is TagDefinition {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<TagDefinition>;
  return typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.color === 'string';
}
