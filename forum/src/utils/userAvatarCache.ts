import {
  deleteClientDatabaseValue,
  readClientDatabaseValue,
  requestPersistentClientStorage,
  writeClientDatabaseValue,
} from './clientDatabase';

type CachedUserAvatarBlob = {
  blob: Blob;
  cachedAt: number;
  sourceUrl: string;
};

const USER_AVATAR_DATABASE_KEY_PREFIX = 'user-avatar:v1';

export async function readCachedUserAvatarBlob(username: string, sourceUrl: string) {
  const databaseKey = getUserAvatarDatabaseKey(username);
  if (!databaseKey) return null;

  try {
    const cachedValue = await readClientDatabaseValue<unknown>(databaseKey);
    if (!isCachedUserAvatarBlob(cachedValue)) return null;
    if (cachedValue.sourceUrl !== sourceUrl) {
      await deleteClientDatabaseValue(databaseKey);
      return null;
    }
    return cachedValue.blob;
  } catch {
    return null;
  }
}

export async function writeCachedUserAvatarBlob(username: string, sourceUrl: string, blob: Blob) {
  const databaseKey = getUserAvatarDatabaseKey(username);
  if (!databaseKey || !sourceUrl.trim() || !blob.type.startsWith('image/')) return false;

  void requestPersistentClientStorage();

  try {
    await writeClientDatabaseValue<CachedUserAvatarBlob>(databaseKey, {
      blob,
      cachedAt: Date.now(),
      sourceUrl,
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteCachedUserAvatar(username: string) {
  const databaseKey = getUserAvatarDatabaseKey(username);
  if (!databaseKey) return;

  try {
    await deleteClientDatabaseValue(databaseKey);
  } catch {
    // Avatar caching is optional and must not block profile updates.
  }
}

function getUserAvatarDatabaseKey(username: string) {
  const normalizedUsername = username.trim().toLocaleLowerCase();
  return normalizedUsername
    ? `${USER_AVATAR_DATABASE_KEY_PREFIX}:${encodeURIComponent(normalizedUsername)}`
    : null;
}

function isCachedUserAvatarBlob(value: unknown): value is CachedUserAvatarBlob {
  return (
    typeof value === 'object'
    && value !== null
    && 'blob' in value
    && value.blob instanceof Blob
    && value.blob.type.startsWith('image/')
    && 'cachedAt' in value
    && typeof value.cachedAt === 'number'
    && 'sourceUrl' in value
    && typeof value.sourceUrl === 'string'
  );
}
