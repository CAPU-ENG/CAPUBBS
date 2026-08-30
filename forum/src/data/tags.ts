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

export function getDisplayedTags(tags: UserTag[]): UserTag[] {
  return tags
    .filter((tag) => tag.displayOrder === 1 || tag.displayOrder === 2)
    .sort((left, right) => left.displayOrder! - right.displayOrder!)
    .slice(0, 2);
}
