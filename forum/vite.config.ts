import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { FORUM_BASE_PATH, FORUM_BASE_URL } from './src/utils/forumBasePath';

function forumBasePathFallback(): Plugin {
  function installMiddleware(server: { middlewares: { use: (handler: (
    request: { url?: string },
    response: unknown,
    next: () => void,
  ) => void) => void } }) {
    server.middlewares.use((request, _response, next) => {
      if (request.url === FORUM_BASE_PATH || request.url?.startsWith(`${FORUM_BASE_PATH}?`)) {
        request.url = `${FORUM_BASE_URL}${request.url.slice(FORUM_BASE_PATH.length)}`;
      }
      next();
    });
  }

  return {
    name: 'forum-base-path-fallback',
    configurePreviewServer: installMiddleware,
    configureServer: installMiddleware,
  };
}

export default defineConfig({
  base: FORUM_BASE_URL,
  build: {
    assetsDir: 'new-assets',
  },
  plugins: [forumBasePathFallback(), react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080',
      },
      '/assets': {
        target: process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080',
      },
      '/bbs/assets': {
        target: process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080',
      },
      '/bbs/attach': {
        target: process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080',
      },
      '/bbs/content/test.php': {
        target: process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080',
      },
      '/bbs/download': {
        target: process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080',
      },
      '/bbs/images': {
        target: process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080',
      },
      '/bbs/lib': {
        target: process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080',
      },
      '/bbs/register/action.php': {
        target: process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080',
      },
      '/bbs/utils': {
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
