export type ClientConfig = {
  adminEmail: string;
  browserDownloadUrl: string;
};

let clientConfigRequest: Promise<ClientConfig> | undefined;

export function loadClientConfig() {
  clientConfigRequest ??= requestClientConfig();
  return clientConfigRequest;
}

async function requestClientConfig(): Promise<ClientConfig> {
  const response = await fetch('/config/client.php', { credentials: 'same-origin' });
  if (!response.ok) throw new Error('客户端配置加载失败。');

  const payload: unknown = await response.json();
  return {
    adminEmail: readStringProperty(payload, 'adminEmail'),
    browserDownloadUrl: readStringProperty(payload, 'browserDownloadUrl'),
  };
}

function readStringProperty(value: unknown, key: string) {
  if (!value || typeof value !== 'object' || !(key in value)) return '';
  const property = (value as Record<string, unknown>)[key];
  return typeof property === 'string' ? property.trim() : '';
}
