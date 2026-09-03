const THREAD_ROUTE_PATHS = new Set([
  '/',
  '/content',
  '/content/index.php',
  '/thread.php',
]);

const BOARD_ROUTE_PATHS = new Set([
  '/',
  '/main',
  '/main/index.php',
]);

const HOME_ROUTE_PATHS = new Set([
  '/',
  '/index',
  '/index/index.php',
]);

export function isThreadRoutePath(pathname: string) {
  return THREAD_ROUTE_PATHS.has(pathname);
}

export function isBoardRoutePath(pathname: string) {
  return BOARD_ROUTE_PATHS.has(pathname);
}

export function isHomeRoutePath(pathname: string) {
  return HOME_ROUTE_PATHS.has(pathname);
}
