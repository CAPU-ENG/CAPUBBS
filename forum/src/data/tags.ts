export type UserTag = {
  id: string;
  name: string;
  color: string;
};

export type TagDefinition = UserTag & {
  description?: string;
};

const TAG_DEFINITIONS_KEY = 'capubbs-tag-definitions';
const USER_TAGS_KEY = 'capubbs-user-tags';

export const defaultTagDefinitions: TagDefinition[] = [
  { id: 'rider', name: '骑行达人', color: '#287a52' },
  { id: 'organizer', name: '活动组织者', color: '#bd6b2d' },
  { id: 'contributor', name: '技术贡献', color: '#3569a8' },
  { id: 'newcomer', name: '新晋会员', color: '#69747c' },
];

const defaultUserTagIds: Record<string, string[]> = {
  阿北: ['rider', 'organizer'],
  蓝色车架: ['rider', 'contributor'],
  小白杨: ['newcomer'],
  南门修车铺: ['contributor'],
  小林: ['rider', 'newcomer'],
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

export function readUserTagIds(): Record<string, string[]> {
  if (typeof window === 'undefined') return defaultUserTagIds;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(USER_TAGS_KEY) ?? 'null');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return defaultUserTagIds;
    return Object.fromEntries(
      Object.entries(parsed).map(([username, ids]) => [
        username,
        Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [],
      ]),
    );
  } catch {
    return defaultUserTagIds;
  }
}

export function writeUserTagIds(assignments: Record<string, string[]>) {
  try {
    window.localStorage.setItem(USER_TAGS_KEY, JSON.stringify(assignments));
  } catch {
    // Local persistence is optional when storage is unavailable.
  }
}

export function getTagsForUser(username: string, definitions = readTagDefinitions()): UserTag[] {
  const ids = readUserTagIds()[username] ?? [];
  return ids
    .map((id) => definitions.find((definition) => definition.id === id))
    .filter((tag): tag is TagDefinition => Boolean(tag));
}

function isTagDefinition(value: unknown): value is TagDefinition {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<TagDefinition>;
  return typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.color === 'string';
}
