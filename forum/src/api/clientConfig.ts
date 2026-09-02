export type ClientConfig = {
  adminEmail: string;
  browserDownloadUrl: string;
};

const CLIENT_CONFIG_CACHE_KEY = 'capubbs-client-config';
const CLIENT_CONFIG_CACHE_TTL_MS = 365 * 24 * 60 * 60 * 1000;
let clientConfigRequest: Promise<ClientConfig> | undefined;

export function loadClientConfig() {
  const cachedConfig = readCachedClientConfig();
  if (cachedConfig) return Promise.resolve(cachedConfig);
  clientConfigRequest ??= requestAndCacheClientConfig().catch((error: unknown) => {
    clientConfigRequest = undefined;
    throw error;
  });
  return clientConfigRequest;
}

export function refreshClientConfig() {
  clientConfigRequest = undefined;
  clearCachedClientConfig();
  return loadClientConfig();
}

async function requestClientConfig(): Promise<ClientConfig> {
  const response = await fetch('/config/client.php', { cache: 'no-store', credentials: 'same-origin' });
  if (!response.ok) throw new Error('客户端配置加载失败。');

  const payload: unknown = await response.json();
  return {
    adminEmail: readStringProperty(payload, 'adminEmail'),
    browserDownloadUrl: readStringProperty(payload, 'browserDownloadUrl'),
  };
}

async function requestAndCacheClientConfig() {
  const config = await requestClientConfig();
  try {
    window.localStorage.setItem(CLIENT_CONFIG_CACHE_KEY, JSON.stringify({
      expiresAt: Date.now() + CLIENT_CONFIG_CACHE_TTL_MS,
      value: config,
    }));
  } catch {
    // Keep the in-memory request cache when persistent storage is unavailable.
  }
  return config;
}

function readCachedClientConfig(): ClientConfig | null {
  try {
    const rawValue = window.localStorage.getItem(CLIENT_CONFIG_CACHE_KEY);
    if (!rawValue) return null;
    const cached = JSON.parse(rawValue) as { expiresAt?: unknown; value?: unknown };
    if (typeof cached.expiresAt !== 'number' || cached.expiresAt <= Date.now()) {
      clearCachedClientConfig();
      return null;
    }
    const adminEmail = readStringProperty(cached.value, 'adminEmail');
    const browserDownloadUrl = readStringProperty(cached.value, 'browserDownloadUrl');
    return { adminEmail, browserDownloadUrl };
  } catch {
    clearCachedClientConfig();
    return null;
  }
}

function clearCachedClientConfig() {
  try {
    window.localStorage.removeItem(CLIENT_CONFIG_CACHE_KEY);
  } catch {
    // A following load falls back to the network when storage is unavailable.
  }
}

function readStringProperty(value: unknown, key: string) {
  if (!value || typeof value !== 'object' || !(key in value)) return '';
  const property = (value as Record<string, unknown>)[key];
  return typeof property === 'string' ? property.trim() : '';
}
