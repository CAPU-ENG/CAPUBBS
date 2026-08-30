import { useEffect, useState } from 'react';
import { loadClientConfig, type ClientConfig } from '../api/clientConfig';

export function useClientConfig() {
  const [clientConfig, setClientConfig] = useState<ClientConfig | null>(null);

  useEffect(() => {
    let active = true;
    void loadClientConfig()
      .then((config) => {
        if (active) setClientConfig(config);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return clientConfig;
}
