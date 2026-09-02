import type { UserMedal } from '../data/medals';
import {
  deleteClientDatabaseValue,
  readClientDatabaseValue,
  requestPersistentClientStorage,
  writeClientDatabaseValue,
} from './clientDatabase';

type CachedUserMedals = {
  cachedAt: number;
  medals: UserMedal[];
};

const MEDAL_CACHE_KEY_PREFIX = 'user-medals:v1';
const MEDAL_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
const preloadedImages = new Set<string>();

export async function readCachedUserMedals(username: string) {
  const databaseKey = getMedalCacheKey(username);
  if (!databaseKey) return null;

  try {
    const cachedValue = await readClientDatabaseValue<unknown>(databaseKey);
    if (!isCachedUserMedals(cachedValue) || Date.now() - cachedValue.cachedAt > MEDAL_CACHE_MAX_AGE) {
      await deleteClientDatabaseValue(databaseKey);
      return null;
    }
    return cachedValue.medals;
  } catch {
    return null;
  }
}

export async function writeCachedUserMedals(username: string, medals: UserMedal[]) {
  const databaseKey = getMedalCacheKey(username);
  if (!databaseKey) return;

  void requestPersistentClientStorage();
  try {
    await writeClientDatabaseValue<CachedUserMedals>(databaseKey, {
      cachedAt: Date.now(),
      medals,
    });
  } catch {
    // Medal caching is optional and must not block the gallery.
  }
}

export function preloadMedalImages(medals: UserMedal[]) {
  if (typeof Image === 'undefined') return;

  for (const medal of medals) {
    preloadImage(medal.smallImagePath);
    preloadImage(medal.largeImagePath);
  }
}

function preloadImage(source: string | undefined) {
  const normalizedSource = source?.trim();
  if (!normalizedSource || preloadedImages.has(normalizedSource)) return;
  preloadedImages.add(normalizedSource);
  const image = new Image();
  image.decoding = 'async';
  image.src = normalizedSource;
}

function getMedalCacheKey(username: string) {
  const normalizedUsername = username.trim().toLocaleLowerCase();
  return normalizedUsername
    ? `${MEDAL_CACHE_KEY_PREFIX}:${encodeURIComponent(normalizedUsername)}`
    : null;
}

function isCachedUserMedals(value: unknown): value is CachedUserMedals {
  return (
    typeof value === 'object'
    && value !== null
    && 'cachedAt' in value
    && typeof value.cachedAt === 'number'
    && 'medals' in value
    && Array.isArray(value.medals)
    && value.medals.every(isUserMedal)
  );
}

function isUserMedal(value: unknown): value is UserMedal {
  return (
    typeof value === 'object'
    && value !== null
    && 'awardedAt' in value
    && typeof value.awardedAt === 'number'
    && 'id' in value
    && typeof value.id === 'string'
    && 'name' in value
    && typeof value.name === 'string'
    && 'role' in value
    && typeof value.role === 'string'
    && 'smallImagePath' in value
    && typeof value.smallImagePath === 'string'
  );
}
