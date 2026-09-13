const THREAD_ROUTE_PATHS = new Set([
  '/content',
]);

const BOARD_ROUTE_PATHS = new Set([
  '/main',
]);

const HOME_ROUTE_PATHS = new Set([
  '/index',
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
