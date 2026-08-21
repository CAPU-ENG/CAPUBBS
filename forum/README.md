# CAPUBBS Forum

Frontend built with React, TypeScript, Tailwind CSS, and Vite.

The homepage loads its latest-reply feed, author avatars, and global pinned threads from `/api/api.php`. Calendar events load from `/assets/api/getCalendar.php`; activity registration remains a local placeholder until a matching list API is available.

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

Vite proxies `/api`, `/assets`, `/bbs`, and `/bbsimg` to that server; avatar paths are always normalized to the local `/bbsimg` directory. Set `CAPUBBS_PHP_ORIGIN` to use a different PHP origin, `VITE_API_URL` to override the browser forum API endpoint, or `VITE_CALENDAR_API_URL` to override the calendar endpoint.
