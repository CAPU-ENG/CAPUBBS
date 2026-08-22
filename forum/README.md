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

Vite proxies `/api`, `/assets`, `/bbs`, and `/bbsimg` to that server; avatar and post image paths are always normalized to the local `/bbsimg` and `/bbs/images` directories. Set `CAPUBBS_PHP_ORIGIN` to use a different PHP origin, `VITE_API_URL` to override the browser forum API endpoint, `VITE_CALENDAR_API_URL` to override the calendar endpoint, or `VITE_BROWSER_DOWNLOAD_URL` to override the browser recommendation download link. The browser recommendation currently defaults to `https://frostember.lanzoup.com/b00oe4ba4j`.
