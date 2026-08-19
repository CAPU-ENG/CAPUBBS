# CAPUBBS Forum

Frontend built with React, TypeScript, Tailwind CSS, and Vite.

The homepage loads its latest-reply feed and global pinned threads from `/api/api.php`. Activity registration and calendar data remain local placeholders until matching list APIs are available.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run typecheck
```

For local API development, start PHP from the repository root before Vite:

```bash
php -S localhost:8080
```

Vite proxies `/api` to that server. Set `CAPUBBS_PHP_ORIGIN` to use a different PHP origin, or `VITE_API_URL` to override the browser API endpoint directly.
