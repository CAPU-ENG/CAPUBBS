import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { transformWithEsbuild, type Plugin } from 'vite';
import type { OutputBundle, OutputChunk } from 'rollup';

const runtimePath = fileURLToPath(new URL('../bootstrap/startup.js', import.meta.url));
const marker = '<!-- forum-startup-script -->';

// These are the lazy route modules in App.tsx. Eager routes only need the common assets.
const pageRoutes: Record<string, string[]> = {
  ActivityManagementPage: ['activity-management'],
  ArchiveRoomPage: ['archive-room'],
  BoardPage: ['main'],
  BrowsingHistoryPage: ['browsing-history'],
  CalendarAdminPage: ['calendar-admin'],
  DataDisplayPage: ['data'],
  ForgotPasswordPage: ['forgot-password'],
  LoginPage: ['login'],
  ManagementPage: ['manage'],
  PublicProfilePage: ['user', 'users'],
  RegisterPage: ['register'],
  ThreadComposePage: ['post'],
  ThreadEditPage: ['editpid'],
  ThreadPage: ['content', 'thread.php'],
  UserCenterPage: ['home', 'favorite'],
};

export function startupLoading(): Plugin {
  let base: string;
  let runtime: string;

  return {
    name: 'forum-startup-loading',
    configResolved(config) { base = config.base; },
    async buildStart() {
      this.addWatchFile(runtimePath);
      runtime = (await transformWithEsbuild(readFileSync(runtimePath, 'utf8'), runtimePath, {
        minify: true,
        target: 'es2020',
      })).code;
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, context) {
        if (context.server) {
          return html.replace(marker, inlineRuntime(readFileSync(runtimePath, 'utf8'), null));
        }
        return html;
      },
    },
    generateBundle: {
      order: 'post',
      handler(_, bundle) {
        const htmlAsset = bundle['index.html'];
        if (!htmlAsset || htmlAsset.type !== 'asset') this.error('Missing forum index.html');
        let html = String(htmlAsset.source);
        const scripts = [...html.matchAll(/<script\b[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)];
        if (scripts.length !== 1) this.error('Expected one forum entry module');
        const entryUrl = scripts[0][1];
        const entryFile = entryUrl.slice(base.length);
        const assets: { url: string; size: number; css: boolean }[] = [];
        const assetIndexes = new Map<string, number>();

        function addAsset(fileName: string) {
          const existing = assetIndexes.get(fileName);
          if (existing !== undefined) return existing;
          const output = bundle[fileName];
          if (!output) throw new Error(`Missing startup asset: ${fileName}`);
          const content = output.type === 'chunk' ? output.code : output.source;
          const index = assets.length;
          assets.push({ url: base + fileName, size: Buffer.byteLength(content), css: fileName.endsWith('.css') });
          assetIndexes.set(fileName, index);
          return index;
        }

        function collect(fileName: string, seen = new Set<string>()): number[] {
          if (seen.has(fileName)) return [];
          seen.add(fileName);
          const output = bundle[fileName];
          if (!output || output.type !== 'chunk') throw new Error(`Missing startup module: ${fileName}`);
          const dependencies = output.imports.flatMap((file) => collect(file, seen));
          const metadata = (output as OutputChunk & { viteMetadata?: { importedCss: Set<string> } }).viteMetadata;
          return [...dependencies, ...Array.from(metadata?.importedCss ?? [], addAsset), addAsset(fileName)];
        }

        const common = [...new Set(collect(entryFile))];
        const pages: Record<string, number[]> = {};
        for (const [page, routes] of Object.entries(pageRoutes)) {
          const chunk = findPageChunk(bundle, page);
          if (!chunk) this.error(`Missing startup route module: ${page}`);
          const indexes = [...new Set(collect(chunk.fileName))].filter((index) => !common.includes(index));
          for (const route of routes) pages[route] = indexes;
        }
        html = html.replace(scripts[0][0], '')
          .replace(/<link\b[^>]*rel="(?:stylesheet|modulepreload)"[^>]*>/g, '');
        if (!html.includes(marker)) this.error('Missing startup runtime placeholder');
        htmlAsset.source = html.replace(marker, inlineRuntime(runtime, { base, entry: entryUrl, assets, common, pages }));
      },
    },
  };
}

function findPageChunk(bundle: OutputBundle, page: string) {
  return Object.values(bundle).find((output): output is OutputChunk => output.type === 'chunk'
    && Object.keys(output.modules).some((id) => id.endsWith(`/pages/${page}.tsx`)));
}

function inlineRuntime(runtime: string, config: unknown) {
  const code = runtime.replace('__FORUM_STARTUP_CONFIG__', JSON.stringify(config).replace(/</g, '\\u003c'));
  return `<script id="forum-startup-script">${code.replace(/<\/script/gi, '<\\/script')}</script>`;
}
