import { request as createHttpRequest } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { request as createHttpsRequest } from 'node:https';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { FORUM_BASE_PATH, FORUM_BASE_URL } from './src/utils/forumBasePath';
import { getForumModeFromCookieHeader } from './src/utils/forumModeCookie.ts';

const PHP_ORIGIN = process.env.CAPUBBS_PHP_ORIGIN || 'http://localhost:8080';

type MiddlewareServer = {
  middlewares: {
    use: (handler: (
      request: IncomingMessage,
      response: ServerResponse,
      next: () => void,
    ) => void) => void;
  };
};

function forumBasePathFallback(): Plugin {
  function installMiddleware(server: MiddlewareServer) {
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

function legacyForumCookieProxy(): Plugin {
  function installMiddleware(server: MiddlewareServer) {
    server.middlewares.use((request, response, next) => {
      if (!isForumRequest(request.url) || getForumModeFromCookieHeader(request.headers.cookie) !== 'legacy') {
        next();
        return;
      }

      proxyToPhp(request, response);
    });
  }

  return {
    name: 'legacy-forum-cookie-proxy',
    configurePreviewServer: installMiddleware,
    configureServer: installMiddleware,
  };
}

function isForumRequest(requestUrl: string | undefined) {
  if (!requestUrl) return false;
  const pathname = new URL(requestUrl, 'http://capubbs.local').pathname;
  return pathname === FORUM_BASE_PATH || pathname.startsWith(FORUM_BASE_URL);
}

function proxyToPhp(request: IncomingMessage, response: ServerResponse) {
  const target = new URL(request.url || FORUM_BASE_URL, PHP_ORIGIN);
  const createRequest = target.protocol === 'https:' ? createHttpsRequest : createHttpRequest;
  const proxyRequest = createRequest(target, {
    headers: {
      ...request.headers,
      host: target.host,
    },
    method: request.method,
  }, (proxyResponse) => {
    response.writeHead(proxyResponse.statusCode ?? 502, proxyResponse.headers);
    proxyResponse.pipe(response);
  });

  proxyRequest.on('error', () => {
    if (response.headersSent) {
      response.destroy();
      return;
    }
    response.statusCode = 502;
    response.end('Bad Gateway');
  });
  request.pipe(proxyRequest);
}

export default defineConfig({
  base: FORUM_BASE_URL,
  build: {
    assetsDir: 'new-assets',
  },
  plugins: [forumBasePathFallback(), legacyForumCookieProxy(), react()],
  server: {
    proxy: {
      '/api': { target: PHP_ORIGIN },
      '/assets': { target: PHP_ORIGIN },
      '/bbs/assets': { target: PHP_ORIGIN },
      '/bbs/attach': { target: PHP_ORIGIN },
      '/bbs/content/test.php': { target: PHP_ORIGIN },
      '/bbs/download': { target: PHP_ORIGIN },
      '/bbs/images': { target: PHP_ORIGIN },
      '/bbs/lib': { target: PHP_ORIGIN },
      '/bbs/register/action.php': { target: PHP_ORIGIN },
      '/bbs/utils': { target: PHP_ORIGIN },
      '/bbsimg': { target: PHP_ORIGIN },
      '/config': { target: PHP_ORIGIN },
    },
  },
});
