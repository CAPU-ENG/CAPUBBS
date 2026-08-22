import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080',
      },
      '/assets': {
        target: process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080',
      },
      '/bbs': {
        target: process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080',
      },
      '/bbsimg': {
        target: process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080',
      },
      '/config': {
        target: process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080',
      },
    },
  },
});
