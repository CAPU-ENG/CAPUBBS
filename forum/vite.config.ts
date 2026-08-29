import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { FORUM_BASE_URL } from './src/utils/forumBasePath';

export default defineConfig({
  base: FORUM_BASE_URL,
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
