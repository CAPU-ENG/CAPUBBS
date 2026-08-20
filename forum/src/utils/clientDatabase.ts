const CLIENT_DATABASE_NAME = 'capubbs-client-storage';
const CLIENT_DATABASE_VERSION = 1;
const CLIENT_DATABASE_STORE = 'records';

let databasePromise: Promise<IDBDatabase> | null = null;
let persistenceRequest: Promise<boolean> | null = null;

export function readClientDatabaseValue<T>(key: string): Promise<T | undefined> {
  return runRequest<T | undefined>('readonly', (store) => store.get(key));
}

export function writeClientDatabaseValue<T>(key: string, value: T): Promise<void> {
  return runRequest<void>('readwrite', (store) => store.put(value, key));
}

export function deleteClientDatabaseValue(key: string): Promise<void> {
  return runRequest<void>('readwrite', (store) => store.delete(key));
}

export function requestPersistentClientStorage() {
  if (persistenceRequest) return persistenceRequest;

  persistenceRequest = requestPersistence().catch(() => false);
  return persistenceRequest;
}

async function requestPersistence() {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false;
  if (await navigator.storage.persisted?.()) return true;
  return navigator.storage.persist();
}

async function runRequest<T>(
  mode: IDBTransactionMode,
  createRequest: (store: IDBObjectStore) => IDBRequest,
) {
  const database = await openClientDatabase();

  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(CLIENT_DATABASE_STORE, mode);
    const store = transaction.objectStore(CLIENT_DATABASE_STORE);
    let request: IDBRequest;
    let result: T;

    try {
      request = createRequest(store);
    } catch (error) {
      reject(error);
      return;
    }

    request.onsuccess = () => {
      result = request.result as T;
    };
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
    transaction.oncomplete = () => resolve(result);
    transaction.onabort = () => reject(transaction.error ?? request.error ?? new Error('IndexedDB transaction aborted.'));
  });
}

function openClientDatabase() {
  if (databasePromise) return databasePromise;

  const openingPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new DOMException('IndexedDB is unavailable.', 'SecurityError'));
      return;
    }

    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(CLIENT_DATABASE_NAME, CLIENT_DATABASE_VERSION);
    } catch (error) {
      reject(error);
      return;
    }

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(CLIENT_DATABASE_STORE)) {
        database.createObjectStore(CLIENT_DATABASE_STORE);
      }
    };
    request.onsuccess = () => {
      const database = request.result;
      if (databasePromise !== openingPromise) {
        database.close();
        return;
      }
      database.onversionchange = () => {
        database.close();
        databasePromise = null;
      };
      resolve(database);
    };
    request.onerror = () => {
      reject(request.error ?? new Error('Unable to open IndexedDB.'));
    };
    request.onblocked = () => {
      reject(new DOMException('IndexedDB upgrade was blocked.', 'InvalidStateError'));
    };
  });

  databasePromise = openingPromise;
  void openingPromise.catch(() => {
    if (databasePromise === openingPromise) databasePromise = null;
  });
  return openingPromise;
}
